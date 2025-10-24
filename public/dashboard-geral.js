// Configurações - carregadas de config.js (não versionado)
const CONFIG = window.CONFIG || {};

const SUPABASE_URL = CONFIG.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY || '';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let todosClientes = [];

async function carregarDados() {
  try {
    const { data, error } = await supabase
      .from('clientes_propostas_baseline')
      .select('*')
      .order('severidade', { ascending: false });
    
    if (error) throw error;
    todosClientes = data || [];
    atualizarStats(todosClientes);
    filtrarEExibir();
  } catch (err) {
    console.error('Erro:', err);
  }
}

function atualizarStats(clientes) {
  const comAlerta = clientes.filter(c => c.tem_alerta);
  const winRate = clientes.length > 0 
    ? (clientes.reduce((s, c) => s + c.win_rate_historico, 0) / clientes.length).toFixed(1)
    : 0;
  
  document.getElementById('stat-total').textContent = clientes.length;
  document.getElementById('stat-alertas').textContent = comAlerta.length;
  document.getElementById('stat-winrate').textContent = winRate + '%';
  
  if (clientes.length > 0) {
    const data = new Date(clientes[0].ultima_atualizacao);
    document.getElementById('stat-update').textContent = data.toLocaleDateString('pt-BR');
  }
}

function filtrarEExibir() {
  const busca = document.getElementById('search').value.toLowerCase();
  const filtro = document.getElementById('filter-severidade').value;
  
  let filtrados = todosClientes;
  if (busca) filtrados = filtrados.filter(c => c.nome.toLowerCase().includes(busca));
  if (filtro) filtrados = filtrados.filter(c => c.severidade === filtro);
  
  renderizarTabela(filtrados);
}

function renderizarTabela(clientes) {
  const tbody = document.getElementById('tabela-clientes');

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Nenhum cliente encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = clientes.map(c => {
    const cores = {
      'CRÍTICO': 'bg-red-100 text-red-800',
      'ALTO': 'bg-orange-100 text-orange-800',
      'MÉDIO': 'bg-yellow-100 text-yellow-800',
      'BAIXO': 'bg-green-100 text-green-800',
      'NOVO': 'bg-blue-100 text-blue-800'
    };

    // Extrair baseline stats do JSONB
    const baseline = c.baseline_stats || {};
    const padraoWinRate = baseline.win_rate_media || 0;
    const desvioWinRate = baseline.win_rate_desvio || 0;
    const zScore = baseline.z_score_atual || 0;

    // Formatar padrão
    const padraoTexto = baseline.win_rate_media
      ? `${padraoWinRate.toFixed(1)}% ± ${desvioWinRate.toFixed(1)}%`
      : 'N/A';

    // Formatar Z-score com cor
    let zScoreTexto = 'N/A';
    let zScoreClasse = 'text-gray-600';

    if (baseline.z_score_atual !== undefined) {
      const zAbs = Math.abs(zScore);
      zScoreTexto = `${c.win_rate_recente.toFixed(1)}% (${zScore.toFixed(2)}σ)`;

      if (zScore <= -2.0) zScoreClasse = 'text-red-600 font-bold';
      else if (zScore <= -1.5) zScoreClasse = 'text-orange-600 font-semibold';
      else if (zScore <= -1.0) zScoreClasse = 'text-yellow-700';
      else if (zScore >= 0) zScoreClasse = 'text-green-600';
      else zScoreClasse = 'text-gray-600';
    }

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <div class="font-medium text-gray-900">${c.nome}</div>
          <div class="text-sm text-gray-500">${c.cnpj || 'Sem CNPJ'}</div>
        </td>
        <td class="px-6 py-4 text-sm">
          <span class="font-mono text-gray-700">${padraoTexto}</span>
        </td>
        <td class="px-6 py-4 text-sm">
          <span class="${zScoreClasse}">${zScoreTexto}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-3 py-1 text-xs font-semibold rounded-full ${cores[c.severidade]}">${c.severidade}</span>
        </td>
        <td class="px-6 py-4 text-xs text-gray-600">
          ${c.motivo_alerta || 'Sem desvio significativo'}
        </td>
        <td class="px-6 py-4">
          <a href="cliente-detalhes.html?id=${c.contact_id}" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
            Ver Detalhes →
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('search').addEventListener('input', filtrarEExibir);
document.getElementById('filter-severidade').addEventListener('change', filtrarEExibir);

// Inicializar com filtro CRÍTICO como padrão
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filter-severidade').value = 'CRÍTICO';
});

carregarDados();
