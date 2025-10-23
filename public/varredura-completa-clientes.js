#!/usr/bin/env node

/**
 * VARREDURA COMPLETA DE CLIENTES
 * Busca todos clientes ativos e calcula baseline individual
 * Baseado em: GUIA_BUSCAR_DEALS_QUALQUER_CLIENTE.md
 */

require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');

// Configuração
const API_KEY = process.env.PLOOME_API_KEY;
const BASE_URL = 'https://public-api2.ploomes.com';
const PIPELINE_ID = 40003581; // Funil de vendas
const CAMPO_LINHA_NEGOCIOS = 'deal_A32188D0-B97B-4419-BD50-174F31824574';

// IDs das linhas "VD -" para excluir
const LINHA_NEGOCIOS_VD_IDS = [
  400353630, 400353631, 400353632, 400353633, 400353634,
  400353635, 410486206, 422444143, 422996994, 1200093693
];

// Helpers
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPloomes(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'User-Key': API_KEY }
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function temLinhaVD(deal) {
  const campo = deal.OtherProperties?.find(p => p.FieldKey === CAMPO_LINHA_NEGOCIOS);
  return LINHA_NEGOCIOS_VD_IDS.includes(campo?.IntegerValue);
}

function calcularMetricas(deals) {
  const ganhas = deals.filter(d => d.StatusId === 2);
  const perdidas = deals.filter(d => d.StatusId === 3);
  const total = ganhas.length + perdidas.length;

  const winRate = total > 0 ? (ganhas.length / total) * 100 : 0;

  // Calcular ticket médio das ganhas
  const valoresGanhas = ganhas.map(d => d.Amount || 0).filter(v => v > 0);
  const ticketMedio = valoresGanhas.length > 0
    ? valoresGanhas.reduce((a, b) => a + b, 0) / valoresGanhas.length
    : 0;

  return {
    total,
    ganhas: ganhas.length,
    perdidas: perdidas.length,
    winRate,
    ticketMedio
  };
}

// Calcular baseline estatístico individual por cliente
function calcularBaselineEstatistico(deals) {
  // Agrupar deals por mês
  const dealsPorMes = {};

  deals.forEach(deal => {
    const data = new Date(deal.StartDate);
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

    if (!dealsPorMes[mesAno]) {
      dealsPorMes[mesAno] = [];
    }
    dealsPorMes[mesAno].push(deal);
  });

  // Calcular win rate mensal
  const winRatesMensais = [];
  const ticketsMensais = [];

  Object.entries(dealsPorMes).forEach(([mes, dealsDoMes]) => {
    const metrics = calcularMetricas(dealsDoMes);
    if (metrics.total > 0) {
      winRatesMensais.push(metrics.winRate);
      if (metrics.ticketMedio > 0) {
        ticketsMensais.push(metrics.ticketMedio);
      }
    }
  });

  // Calcular média e desvio padrão
  const calcularStats = (valores) => {
    if (valores.length === 0) return { media: 0, desvioP: 0 };

    const media = valores.reduce((a, b) => a + b, 0) / valores.length;

    const variancia = valores.reduce((sum, val) => {
      return sum + Math.pow(val - media, 2);
    }, 0) / valores.length;

    const desvioP = Math.sqrt(variancia);

    return { media, desvioP };
  };

  const statsWinRate = calcularStats(winRatesMensais);
  const statsTicket = calcularStats(ticketsMensais);

  return {
    win_rate_media: statsWinRate.media,
    win_rate_desvio: statsWinRate.desvioP,
    ticket_media: statsTicket.media,
    ticket_desvio: statsTicket.desvioP,
    meses_historico: winRatesMensais.length,
    historico_mensal: Object.keys(dealsPorMes).sort().slice(-12) // Últimos 12 meses
  };
}

// Calcular Z-score (quantos desvios padrão da média)
function calcularZScore(valorAtual, media, desvioP) {
  if (desvioP === 0) return 0;
  return (valorAtual - media) / desvioP;
}

function calcularDesvio(historico, recente) {
  return {
    desvioWinRate: recente.winRate - historico.winRate,
    desvioTicket: historico.ticketMedio > 0
      ? ((recente.ticketMedio - historico.ticketMedio) / historico.ticketMedio) * 100
      : 0
  };
}

function detectarAlerta(desvio, baseline, totalPropostas, recente) {
  // Clientes novos ou com pouco histórico
  if (totalPropostas < 10) {
    return {
      temAlerta: true,
      severidade: 'NOVO',
      motivo: '📊 Cliente novo - dados insuficientes para baseline'
    };
  }

  if (baseline.meses_historico < 3) {
    return {
      temAlerta: true,
      severidade: 'NOVO',
      motivo: '⏳ Histórico insuficiente (<3 meses)'
    };
  }

  // Calcular Z-score do win rate atual
  const zScore = calcularZScore(
    recente.winRate,
    baseline.win_rate_media,
    baseline.win_rate_desvio
  );

  // Calcular queda relativa (% de queda em relação ao padrão)
  const quedaRelativa = baseline.win_rate_media > 0
    ? ((recente.winRate - baseline.win_rate_media) / baseline.win_rate_media) * 100
    : 0;

  // Classificação por Z-score + Queda Relativa
  // CRÍTICO: Muito abaixo do padrão (>2σ) OU queda >40%
  if (zScore <= -2.0 || quedaRelativa <= -40) {
    return {
      temAlerta: true,
      severidade: 'CRÍTICO',
      motivo: zScore <= -2.0
        ? `${Math.abs(zScore).toFixed(1)}σ abaixo do padrão (${baseline.win_rate_media.toFixed(1)}% ± ${baseline.win_rate_desvio.toFixed(1)}%)`
        : `Queda de ${Math.abs(quedaRelativa).toFixed(1)}% do padrão`
    };
  }

  // ALTO: Abaixo do padrão (1.5-2σ) OU queda 25-40%
  if (zScore <= -1.5 || quedaRelativa <= -25) {
    return {
      temAlerta: true,
      severidade: 'ALTO',
      motivo: zScore <= -1.5
        ? `${Math.abs(zScore).toFixed(1)}σ abaixo do padrão`
        : `Queda de ${Math.abs(quedaRelativa).toFixed(1)}% do padrão`
    };
  }

  // MÉDIO: Levemente abaixo (1-1.5σ) OU queda 15-25%
  if (zScore <= -1.0 || quedaRelativa <= -15) {
    return {
      temAlerta: true,
      severidade: 'MÉDIO',
      motivo: zScore <= -1.0
        ? `${Math.abs(zScore).toFixed(1)}σ abaixo do padrão`
        : `Queda de ${Math.abs(quedaRelativa).toFixed(1)}% do padrão`
    };
  }

  return {
    temAlerta: false,
    severidade: 'BAIXO',
    motivo: 'Dentro do padrão esperado'
  };
}

async function buscarDealsCliente(contactId) {
  console.log(`  Buscando deals do cliente ${contactId}...`);

  const allDeals = [];
  let skip = 0;
  const PAGE_SIZE = 300;

  while (true) {
    const endpoint = `/Deals?` +
      `$filter=ContactId eq ${contactId} and PipelineId eq ${PIPELINE_ID}` +
      `&$expand=Stage,OtherProperties` +
      `&$orderby=StartDate desc` +
      `&$skip=${skip}&$top=${PAGE_SIZE}`;

    const data = await fetchPloomes(endpoint);

    if (!data.value || data.value.length === 0) break;

    allDeals.push(...data.value);

    if (data.value.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;

    await sleep(600); // Rate limit
  }

  // Filtrar VD
  const dealsSemVD = allDeals.filter(d => !temLinhaVD(d));

  console.log(`    Total: ${allDeals.length}, Sem VD: ${dealsSemVD.length}`);

  return dealsSemVD;
}

function calcularDiasSemVenda(deals) {
  const ganhas = deals
    .filter(d => d.StatusId === 2)
    .sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

  if (ganhas.length === 0) return 999;

  const ultimaVenda = new Date(ganhas[0].StartDate);
  const hoje = new Date();
  return Math.floor((hoje - ultimaVenda) / (1000 * 60 * 60 * 24));
}

function filtrarUltimos3Meses(deals) {
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

  return deals.filter(d => new Date(d.StartDate) >= tresMesesAtras);
}

async function analisarCliente(contactId, nome, cnpj) {
  console.log(`\n📊 Analisando: ${nome}`);

  try {
    const deals = await buscarDealsCliente(contactId);

    if (deals.length < 5) {
      console.log(`  ⚠️ Apenas ${deals.length} deals, pulando...`);
      return null;
    }

    // Calcular baseline estatístico individual
    const baseline = calcularBaselineEstatistico(deals);

    // Métricas históricas
    const metricsHistorico = calcularMetricas(deals);

    // Métricas últimos 3 meses
    const dealsRecentes = filtrarUltimos3Meses(deals);
    const metricsRecente = calcularMetricas(dealsRecentes);

    // Desvios e alerta com baseline individual
    const desvio = calcularDesvio(metricsHistorico, metricsRecente);
    const alerta = detectarAlerta(desvio, baseline, metricsHistorico.total, metricsRecente);

    const diasSemVenda = calcularDiasSemVenda(deals);

    // Calcular Z-score para incluir no baseline_stats
    const zScore = calcularZScore(
      metricsRecente.winRate,
      baseline.win_rate_media,
      baseline.win_rate_desvio
    );

    const resultado = {
      contact_id: contactId,
      nome,
      cnpj,
      total_propostas: metricsHistorico.total,
      total_ganhas: metricsHistorico.ganhas,
      total_perdidas: metricsHistorico.perdidas,
      win_rate_historico: metricsHistorico.winRate,
      ticket_medio_historico: metricsHistorico.ticketMedio,
      propostas_recentes: metricsRecente.total,
      ganhas_recentes: metricsRecente.ganhas,
      perdidas_recentes: metricsRecente.perdidas,
      win_rate_recente: metricsRecente.winRate,
      ticket_medio_recente: metricsRecente.ticketMedio,
      tem_alerta: alerta.temAlerta,
      severidade: alerta.severidade,
      desvio_win_rate: desvio.desvioWinRate,
      desvio_ticket: desvio.desvioTicket,
      motivo_alerta: alerta.motivo,
      dias_sem_venda: diasSemVenda,
      pipeline_id: PIPELINE_ID,
      baseline_stats: {
        win_rate_media: baseline.win_rate_media,
        win_rate_desvio: baseline.win_rate_desvio,
        ticket_media: baseline.ticket_media,
        ticket_desvio: baseline.ticket_desvio,
        z_score_atual: zScore,
        meses_historico: baseline.meses_historico,
        historico_mensal: baseline.historico_mensal
      },
      ultima_atualizacao: new Date().toISOString()
    };

    console.log(`  ✅ Padrão: ${baseline.win_rate_media.toFixed(1)}% ± ${baseline.win_rate_desvio.toFixed(1)}%`);
    console.log(`  📊 Atual: ${metricsRecente.winRate.toFixed(1)}% (Z-score: ${zScore.toFixed(2)}σ)`);

    if (alerta.temAlerta) {
      console.log(`  🚨 ALERTA: ${alerta.severidade}`);
      console.log(`     ${alerta.motivo}`);
    }

    return resultado;

  } catch (err) {
    console.error(`  ❌ Erro: ${err.message}`);
    return null;
  }
}

async function buscarClientesAtivos() {
  console.log('🔍 Buscando clientes ativos...');

  // Buscar deals únicos dos últimos 12 meses
  const umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
  const dataFiltro = umAnoAtras.toISOString();

  const allDeals = [];
  let skip = 0;
  const PAGE_SIZE = 300;

  while (true) {
    const endpoint = `/Deals?` +
      `$filter=PipelineId eq ${PIPELINE_ID} and StartDate ge ${dataFiltro}` +
      `&$expand=Contact` +
      `&$select=ContactId,Contact` +
      `&$skip=${skip}&$top=${PAGE_SIZE}`;

    const data = await fetchPloomes(endpoint);

    if (!data.value || data.value.length === 0) break;

    allDeals.push(...data.value);
    console.log(`  Página ${Math.floor(skip/PAGE_SIZE) + 1}: ${allDeals.length} deals...`);

    if (data.value.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;

    await sleep(600);
  }

  // Extrair clientes únicos
  const clientesMap = new Map();
  allDeals.forEach(deal => {
    if (deal.ContactId && deal.Contact) {
      clientesMap.set(deal.ContactId, {
        id: deal.ContactId,
        nome: deal.Contact.Name,
        cnpj: deal.Contact.CNPJ || null
      });
    }
  });

  const clientes = Array.from(clientesMap.values());
  console.log(`\n✅ Encontrados ${clientes.length} clientes únicos`);

  return clientes;
}

async function main() {
  console.log('═════════════════════════════════════════');
  console.log('  VARREDURA COMPLETA DE CLIENTES');
  console.log('═════════════════════════════════════════\n');

  const inicio = Date.now();

  // 1. Buscar clientes ativos
  const clientes = await buscarClientesAtivos();

  // 2. Analisar cada cliente
  const resultados = [];

  for (let i = 0; i < clientes.length; i++) {
    const cliente = clientes[i];
    console.log(`\n[${i + 1}/${clientes.length}]`);

    const resultado = await analisarCliente(
      cliente.id,
      cliente.nome,
      cliente.cnpj
    );

    if (resultado) {
      resultados.push(resultado);
    }

    // Rate limit entre clientes
    await sleep(1000);
  }

  // 3. Salvar resultados
  const outputFile = 'clientes-baseline.json';
  fs.writeFileSync(outputFile, JSON.stringify(resultados, null, 2));

  // 4. Estatísticas finais
  const comAlerta = resultados.filter(r => r.tem_alerta);
  const criticos = comAlerta.filter(r => r.severidade === 'CRÍTICO');
  const altos = comAlerta.filter(r => r.severidade === 'ALTO');
  const medios = comAlerta.filter(r => r.severidade === 'MÉDIO');
  const novos = comAlerta.filter(r => r.severidade === 'NOVO');
  const baixos = resultados.filter(r => r.severidade === 'BAIXO');

  const tempoTotal = Math.round((Date.now() - inicio) / 1000);

  console.log('\n═════════════════════════════════════════');
  console.log('  RESUMO FINAL - BASELINE INDIVIDUAL');
  console.log('═════════════════════════════════════════');
  console.log(`Total clientes analisados: ${resultados.length}`);
  console.log(`\n🚨 Alertas: ${comAlerta.length}`);
  console.log(`  - 🔴 CRÍTICO: ${criticos.length} (>2σ ou >40% queda)`);
  console.log(`  - 🟠 ALTO: ${altos.length} (1.5-2σ ou 25-40% queda)`);
  console.log(`  - 🟡 MÉDIO: ${medios.length} (1-1.5σ ou 15-25% queda)`);
  console.log(`  - 📊 NOVOS: ${novos.length} (histórico insuficiente)`);
  console.log(`\n🟢 Dentro do padrão: ${baixos.length}`);
  console.log(`\nTempo total: ${tempoTotal}s`);
  console.log(`Arquivo gerado: ${outputFile}`);
  console.log('═════════════════════════════════════════\n');
}

main().catch(console.error);
