#!/usr/bin/env node

/**
 * GERAR SUGESTÕES COM IA
 * Usa Claude API para criar sugestões específicas por cliente
 */

require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function gerarSugestoesParaCliente(cliente, deals) {
  const baselineInfo = cliente.baseline_stats
    ? `\n- Padrão Individual: ${cliente.baseline_stats.win_rate_media.toFixed(1)}% ± ${cliente.baseline_stats.win_rate_desvio.toFixed(1)}%
- Z-score Atual: ${cliente.baseline_stats.z_score_atual.toFixed(2)}σ
- Meses de Histórico: ${cliente.baseline_stats.meses_historico}`
    : '';

  const prompt = `Você é um especialista em vendas B2B analisando o comportamento de um cliente.

## Dados do Cliente:
- Nome: ${cliente.nome}
- Win Rate Histórico: ${cliente.win_rate_historico.toFixed(1)}%
- Win Rate Recente: ${cliente.win_rate_recente.toFixed(1)}%
- Desvio: ${cliente.desvio_win_rate.toFixed(1)}%${baselineInfo}
- Ticket Médio: R$ ${cliente.ticket_medio_historico.toLocaleString('pt-BR')}
- Dias sem venda: ${cliente.dias_sem_venda}
- Total de propostas perdidas recentes: ${cliente.perdidas_recentes}
- Motivo do Alerta: ${cliente.motivo_alerta || 'N/A'}

## Últimas 5 Propostas Perdidas:
${deals.slice(0, 5).map((d, i) =>
  `${i+1}. ${d.Title} - R$ ${(d.Amount || 0).toLocaleString('pt-BR')} - ${new Date(d.StartDate).toLocaleDateString('pt-BR')}`
).join('\n')}

## Tarefa:
Gere EXATAMENTE 5 sugestões PRÁTICAS e ESPECÍFICAS para recuperar este cliente.

Cada sugestão deve:
- Usar os números reais fornecidos
- Ter um título com emoji e prazo (ex: "🎯 AÇÃO URGENTE (48h)")
- Ser executável pela equipe de vendas
- Focar em reverter o desvio do padrão individual do cliente

Responda APENAS com JSON válido no formato:
[
  {
    "titulo": "🎯 TÍTULO COM EMOJI E PRAZO",
    "descricao": "Descrição detalhada com números reais"
  }
]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: 'Você é um especialista em vendas B2B. Responda sempre em JSON válido.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const texto = data.choices[0].message.content;

      // Extrair JSON da resposta
      const match = texto.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }

    throw new Error('Resposta da IA inválida');

  } catch (err) {
    console.error('Erro ao gerar sugestões:', err.message);
    
    // Fallback: sugestões genéricas
    return [
      {
        titulo: "🎯 AÇÃO URGENTE (48h)",
        descricao: `Win rate caiu ${Math.abs(cliente.desvio_win_rate).toFixed(1)}%. Agendar reunião imediata.`
      },
      {
        titulo: "💰 PROPOSTA COMPETITIVA (1 semana)",
        descricao: `Preparar proposta especial considerando ticket médio de R$ ${cliente.ticket_medio_historico.toLocaleString('pt-BR')}.`
      },
      {
        titulo: "📞 FOLLOW-UP (2 semanas)",
        descricao: `Cliente há ${cliente.dias_sem_venda} dias sem fechar. Estabelecer contato regular.`
      },
      {
        titulo: "🔍 ANÁLISE COMPETITIVA (1 semana)",
        descricao: `Investigar ${cliente.perdidas_recentes} propostas perdidas recentemente.`
      },
      {
        titulo: "🎁 OFERTA ESPECIAL (imediato)",
        descricao: `Criar oferta personalizada para reativar relacionamento.`
      }
    ];
  }
}

async function processarTodosClientes() {
  console.log('═════════════════════════════════════════');
  console.log('  GERAR SUGESTÕES COM IA');
  console.log('═════════════════════════════════════════\n');

  // Ler baseline
  const clientes = JSON.parse(fs.readFileSync('clientes-baseline.json', 'utf8'));
  
  // Filtrar apenas clientes com alerta
  const comAlerta = clientes.filter(c => c.tem_alerta);
  
  console.log(`📊 Encontrados ${comAlerta.length} clientes com alerta\n`);

  for (let i = 0; i < comAlerta.length; i++) {
    const cliente = comAlerta[i];
    console.log(`[${i+1}/${comAlerta.length}] Gerando para ${cliente.nome}...`);
    
    // Aqui você precisaria buscar os deals do cliente
    // Para simplificar, usamos dados mockados
    const dealsMock = [];
    
    const sugestoes = await gerarSugestoesParaCliente(cliente, dealsMock);
    cliente.sugestoes_ia = sugestoes;
    
    console.log(`  ✅ ${sugestoes.length} sugestões geradas`);
  }

  // Salvar com sugestões
  fs.writeFileSync('clientes-com-sugestoes.json', JSON.stringify(comAlerta, null, 2));
  
  console.log('\n═════════════════════════════════════════');
  console.log('✅ SUGESTÕES GERADAS');
  console.log(`Arquivo: clientes-com-sugestoes.json`);
  console.log('═════════════════════════════════════════\n');
}

// Se executado diretamente
if (require.main === module) {
  processarTodosClientes().catch(console.error);
}

module.exports = { gerarSugestoesParaCliente };
