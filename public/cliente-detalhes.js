// Configurações - carregadas de config.js (não versionado)
// Para configurar: copie config.example.js para config.js e preencha
const CONFIG = window.CONFIG || {};

const SUPABASE_URL = CONFIG.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY || '';
const PLOOME_API_KEY = CONFIG.PLOOME_API_KEY || '';
const OPENAI_API_KEY = CONFIG.OPENAI_API_KEY || '';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let clienteAtual = null;
let dealsRecentes = [];

async function carregarCliente() {
  const urlParams = new URLSearchParams(window.location.search);
  const contactId = urlParams.get('id');
  
  if (!contactId) {
    alert('ID do cliente não fornecido');
    window.location.href = 'dashboard-geral.html';
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('clientes_propostas_baseline')
      .select('*')
      .eq('contact_id', contactId)
      .single();
    
    if (error) throw error;

    clienteAtual = data;
    exibirCliente(data);
    await buscarDealsRecentes(data.contact_id, data.pipeline_id);
    
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao carregar cliente: ' + err.message);
  }
}

function exibirCliente(cliente) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('conteudo').classList.remove('hidden');
  
  document.getElementById('nome-cliente').textContent = cliente.nome;
  document.getElementById('cnpj-cliente').textContent = cliente.cnpj || 'Sem CNPJ';
  
  const cores = {
    'CRÍTICO': 'bg-red-100 text-red-800',
    'ALTO': 'bg-orange-100 text-orange-800',
    'MÉDIO': 'bg-yellow-100 text-yellow-800',
    'BAIXO': 'bg-green-100 text-green-800',
    'NOVO': 'bg-blue-100 text-blue-800'
  };

  // Badge com motivo do alerta
  let badgeHtml = `<span class="px-6 py-3 text-lg font-bold rounded-full ${cores[cliente.severidade]}">${cliente.severidade}</span>`;

  if (cliente.baseline_stats && cliente.baseline_stats.z_score_atual !== undefined) {
    badgeHtml += `<div class="mt-2 text-sm text-gray-600">Padrão: ${cliente.baseline_stats.win_rate_media.toFixed(1)}% ± ${cliente.baseline_stats.win_rate_desvio.toFixed(1)}%</div>`;
    badgeHtml += `<div class="text-sm text-gray-600">Z-score: ${cliente.baseline_stats.z_score_atual.toFixed(2)}σ</div>`;
  }

  document.getElementById('badge-alerta').innerHTML = badgeHtml;
  
  document.getElementById('win-historico').textContent = cliente.win_rate_historico.toFixed(1) + '%';
  
  const corRecente = cliente.win_rate_recente < cliente.win_rate_historico ? 'text-red-600' : 'text-green-600';
  document.getElementById('win-recente').innerHTML = `<span class="${corRecente}">${cliente.win_rate_recente.toFixed(1)}%</span>`;
  
  const corDesvio = cliente.desvio_win_rate < -15 ? 'text-red-600' : 'text-orange-600';
  document.getElementById('desvio').innerHTML = `<span class="${corDesvio}">${cliente.desvio_win_rate.toFixed(1)}%</span>`;
  
  const tabelaMetricas = `
    <tr class="border-b">
      <td class="py-2">Win Rate</td>
      <td class="text-center">${cliente.win_rate_historico.toFixed(1)}%</td>
      <td class="text-center ${corRecente}">${cliente.win_rate_recente.toFixed(1)}%</td>
      <td class="text-center ${corDesvio}">${cliente.desvio_win_rate.toFixed(1)}%</td>
    </tr>
    <tr class="border-b">
      <td class="py-2">Propostas</td>
      <td class="text-center">${cliente.total_propostas}</td>
      <td class="text-center">${cliente.propostas_recentes}</td>
      <td class="text-center">${cliente.propostas_recentes - cliente.total_propostas}</td>
    </tr>
    <tr class="border-b">
      <td class="py-2">Ticket Médio</td>
      <td class="text-center">R$ ${cliente.ticket_medio_historico.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
      <td class="text-center">R$ ${cliente.ticket_medio_recente.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
      <td class="text-center">${cliente.desvio_ticket.toFixed(1)}%</td>
    </tr>
  `;
  
  document.getElementById('tabela-metricas').innerHTML = tabelaMetricas;
  document.getElementById('motivo-alerta').textContent = cliente.motivo_alerta || 'N/A';
  document.getElementById('dias-sem-venda').textContent = cliente.dias_sem_venda + ' dias';
  document.getElementById('total-propostas').textContent = cliente.total_propostas;
  document.getElementById('ticket-historico').textContent = 'R$ ' + cliente.ticket_medio_historico.toLocaleString('pt-BR', {minimumFractionDigits: 2});
  document.getElementById('ultima-atualizacao').textContent = new Date(cliente.ultima_atualizacao).toLocaleDateString('pt-BR');
}

async function buscarDealsRecentes(contactId, pipelineId) {
  try {
    const url = `https://public-api2.ploomes.com/Deals?$filter=ContactId eq ${contactId} and PipelineId eq ${pipelineId}&$expand=Stage&$orderby=StartDate desc&$top=20`;

    const res = await fetch(url, {
      headers: { 'User-Key': PLOOME_API_KEY }
    });

    const data = await res.json();

    if (data.value && data.value.length > 0) {
      dealsRecentes = data.value;
      exibirHistoricoDeals(data.value);
    }
  } catch (err) {
    console.error('Erro ao buscar deals:', err);
    document.getElementById('historico-deals').innerHTML = '<div class="text-center py-4 text-red-600">Erro ao carregar histórico</div>';
  }
}

function exibirHistoricoDeals(deals) {
  const html = `
    <table class="w-full">
      <thead>
        <tr class="border-b bg-gray-50">
          <th class="text-left p-3">Título</th>
          <th class="text-center p-3">Valor</th>
          <th class="text-center p-3">Status</th>
          <th class="text-center p-3">Data</th>
        </tr>
      </thead>
      <tbody>
        ${deals.map(d => {
          const statusCor = d.StatusId === 2 ? 'text-green-600' : d.StatusId === 3 ? 'text-red-600' : 'text-gray-600';
          const statusTexto = d.StatusId === 2 ? 'Ganho' : d.StatusId === 3 ? 'Perdido' : 'Em aberto';
          
          return `
            <tr class="border-b hover:bg-gray-50">
              <td class="p-3">${d.Title || 'Sem título'}</td>
              <td class="text-center p-3">R$ ${(d.Amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
              <td class="text-center p-3 ${statusCor} font-medium">${statusTexto}</td>
              <td class="text-center p-3">${new Date(d.StartDate).toLocaleDateString('pt-BR')}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  document.getElementById('historico-deals').innerHTML = html;
}

async function gerarSugestoesIA() {
  const btn = document.getElementById('btn-gerar-sugestoes');
  const divSugestoes = document.getElementById('sugestoes');

  if (!clienteAtual) {
    alert('Dados do cliente não carregados');
    return;
  }

  // Desabilitar botão e mostrar loading
  btn.disabled = true;
  btn.innerHTML = '⏳ Gerando...';
  divSugestoes.innerHTML = '<div class="bg-white/10 rounded-lg p-6 text-center"><div class="text-lg">🤖 Gerando sugestões com GPT-4o...</div></div>';

  try {
    const baselineInfo = clienteAtual.baseline_stats
      ? `\n- Padrão Individual: ${clienteAtual.baseline_stats.win_rate_media.toFixed(1)}% ± ${clienteAtual.baseline_stats.win_rate_desvio.toFixed(1)}%
- Z-score Atual: ${clienteAtual.baseline_stats.z_score_atual.toFixed(2)}σ`
      : '';

    const dealsPerdidos = dealsRecentes.filter(d => d.StatusId === 3).slice(0, 5);

    const prompt = `Você é um especialista em vendas B2B analisando o comportamento de um cliente.

## Dados do Cliente:
- Nome: ${clienteAtual.nome}
- Win Rate Histórico: ${clienteAtual.win_rate_historico.toFixed(1)}%
- Win Rate Recente: ${clienteAtual.win_rate_recente.toFixed(1)}%
- Desvio: ${clienteAtual.desvio_win_rate.toFixed(1)}%${baselineInfo}
- Ticket Médio: R$ ${clienteAtual.ticket_medio_historico.toLocaleString('pt-BR')}
- Dias sem venda: ${clienteAtual.dias_sem_venda}
- Motivo do Alerta: ${clienteAtual.motivo_alerta || 'N/A'}

## Últimas Propostas Perdidas:
${dealsPerdidos.map((d, i) =>
  `${i+1}. ${d.Title} - R$ ${(d.Amount || 0).toLocaleString('pt-BR')} - ${new Date(d.StartDate).toLocaleDateString('pt-BR')}`
).join('\n')}

Gere EXATAMENTE 5 sugestões PRÁTICAS e ESPECÍFICAS para recuperar este cliente.
Foque no desvio do padrão individual (Z-score).

Responda APENAS com JSON válido:
[
  {"titulo": "🎯 TÍTULO COM EMOJI E PRAZO", "descricao": "Descrição com números reais"}
]`;

    // Chamar API proxy do Vercel (usa env vars server-side de forma segura)
    const response = await fetch('/api/generate-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cliente: clienteAtual,
        deals: dealsRecentes
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const sugestoes = data.sugestoes;

    if (!sugestoes || sugestoes.length === 0) {
      throw new Error('Nenhuma sugestão retornada pela IA');
    }

    // Exibir sugestões
    const html = sugestoes.map((s, i) => `
      <div class="bg-white bg-opacity-10 rounded-lg p-4">
        <div class="font-bold text-lg mb-2">${i + 1}. ${s.titulo}</div>
        <div class="text-white text-opacity-90">${s.descricao}</div>
      </div>
    `).join('');

    divSugestoes.innerHTML = html;
    btn.disabled = false;
    btn.innerHTML = '✅ Gerar Novamente';

  } catch (err) {
    console.error('Erro ao gerar sugestões:', err);

    // Fallback: sugestões genéricas
    const sugestoesGenericas = [
      {
        titulo: "🎯 AÇÃO URGENTE (48h)",
        descricao: `Win rate caiu ${Math.abs(clienteAtual.desvio_win_rate).toFixed(1)}%. Agendar reunião com responsável comercial para entender mudanças no comportamento de compra.`
      },
      {
        titulo: "💰 PROPOSTA COMPETITIVA",
        descricao: `Preparar proposta competitiva considerando padrão individual do cliente.`
      },
      {
        titulo: "📞 FOLLOW-UP ESTRUTURADO",
        descricao: `Cliente sem fechar deal há ${clienteAtual.dias_sem_venda} dias. Estabelecer cadência semanal de follow-up.`
      },
      {
        titulo: "🔍 ANÁLISE DE CONCORRÊNCIA",
        descricao: `Investigar competidores que podem estar ganhando as últimas ${clienteAtual.perdidas_recentes} propostas.`
      },
      {
        titulo: "🎁 OFERTA ESPECIAL",
        descricao: `Criar oferta personalizada para reativar relacionamento (${clienteAtual.motivo_alerta}).`
      }
    ];

    const html = sugestoesGenericas.map((s, i) => `
      <div class="bg-white bg-opacity-10 rounded-lg p-4">
        <div class="font-bold text-lg mb-2">${i + 1}. ${s.titulo}</div>
        <div class="text-white text-opacity-90">${s.descricao}</div>
        ${i === 0 ? '<div class="text-xs mt-2 opacity-70">(Sugestões genéricas - API OpenAI falhou)</div>' : ''}
      </div>
    `).join('');

    divSugestoes.innerHTML = html;
    btn.disabled = false;
    btn.innerHTML = '🔄 Tentar Novamente';
    alert('Erro ao gerar sugestões com IA. Mostrando sugestões genéricas.\n\n' + err.message);
  }
}

carregarCliente();
