# 📊 Sistema Completo de Análise de Propostas Perdidas

Sistema de monitoramento e análise de propostas perdidas para TODOS os clientes, com baseline individual, alertas automáticos e sugestões geradas por IA.

## 🎯 Funcionalidades

✅ **Varredura Automática** - Busca todos clientes ativos e seus deals
✅ **Baseline Individual** - Cada cliente tem seu próprio histórico de referência
✅ **Sistema de Alertas** - Detecta desvios automáticos (Crítico, Alto, Médio)
✅ **Dashboard Interativo** - Visualização em tempo real dos alertas
✅ **Análise Detalhada** - Página individual por cliente com métricas
✅ **Sugestões com IA** - 5 ações práticas geradas por Claude API
✅ **Job Semanal** - Recálculo automático toda segunda-feira 6h

---

## 📁 Estrutura de Arquivos

```
propostas-perdidas/
├── criar-tabela-supabase.sql          # SQL para criar tabela no Supabase
├── varredura-completa-clientes.js     # Busca todos clientes e calcula baseline
├── sincronizar-supabase.js            # Salva dados no Supabase
├── job-semanal.js                     # Job automatizado (cron)
├── gerar-sugestoes-ia.js              # Gera sugestões com Claude API
├── dashboard-geral.html               # Dashboard principal
├── dashboard-geral.js                 # Lógica do dashboard
├── cliente-detalhes.html              # Página individual do cliente
├── cliente-detalhes.js                # Lógica da página de detalhes
├── package.json                       # Dependências do projeto
└── README_SISTEMA_COMPLETO.md         # Esta documentação
```

---

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd propostas-perdidas
npm install
```

### 2. Configurar Supabase

Execute o SQL no Supabase SQL Editor:

```bash
# Copiar conteúdo de criar-tabela-supabase.sql
# Colar no Supabase SQL Editor
# Executar
```

Isso criará:
- Tabela `clientes_propostas_baseline`
- Views `clientes_com_alerta` e `estatisticas_gerais`
- Triggers automáticos para detectar alertas
- Funções para calcular sincronização

### 3. Verificar Variáveis de Ambiente

Arquivo: `../env.local`

```bash
# Supabase
SUPABASE_URL=https://yxwokryybudwygtemfmu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Ploomes
PLOOME_API_KEY=A7EEF49A...
PLOOME_BASE_URL=https://public-api2.ploomes.com

# Claude API (opcional para sugestões IA)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 📊 Uso

### Varredura Manual (primeira vez)

```bash
# 1. Buscar todos clientes e calcular baseline
npm run varredura

# 2. Sincronizar com Supabase
npm run sync

# 3. Abrir dashboard
npm run dashboard
```

### Varredura Automática (Job Semanal)

```bash
# Executar job completo (varredura + sincronização)
npm run job
```

Para agendar automaticamente (cron):

```bash
# Editar crontab
crontab -e

# Adicionar linha (toda segunda-feira 6h)
0 6 * * 1 cd /path/to/propostas-perdidas && npm run job >> job.log 2>&1
```

### Gerar Sugestões com IA

```bash
node gerar-sugestoes-ia.js
```

Isso gerará arquivo `clientes-com-sugestoes.json` com 5 sugestões específicas por cliente.

---

## 🎯 Lógica de Alertas

### Critérios

```javascript
// Comparar últimos 3 meses vs histórico total

const desvioWinRate = winRateRecente - winRateHistorico;
const desvioTicket = ((ticketRecente - ticketHistorico) / ticketHistorico) * 100;

// CRÍTICO
if (desvioWinRate <= -20 || desvioTicket <= -25) {
  return { alerta: true, severidade: 'CRÍTICO' };
}

// ALTO
if (desvioWinRate <= -15 || desvioTicket <= -20) {
  return { alerta: true, severidade: 'ALTO' };
}

// MÉDIO
if (desvioWinRate <= -10 || desvioTicket <= -15) {
  return { alerta: true, severidade: 'MÉDIO' };
}
```

### Exemplo Real (TBM)

```
Histórico:   68.4% win rate, R$ 25.000 ticket médio
Recente:     45.2% win rate, R$ 22.000 ticket médio
Desvio:      -23.2% (CRÍTICO!)
Dias sem venda: 92 dias
```

---

## 🤖 Sugestões com IA

### Input para Claude API

```json
{
  "cliente": "TBM S A INDUSTRIA TEXTIL",
  "winRateHistorico": 68.4,
  "winRateRecente": 45.2,
  "desvio": -23.2,
  "ticketMedio": 25000,
  "diasSemVenda": 92,
  "ultimasPerdas": [
    { "titulo": "Cotação 17787", "valor": 1110, "data": "2025-07-29" }
  ]
}
```

### Output (5 Sugestões)

```json
[
  {
    "titulo": "🎯 AÇÃO URGENTE (48h)",
    "descricao": "Win rate caiu 23.2%. Agendar reunião com Sr. Wesley..."
  },
  {
    "titulo": "💰 PROPOSTA COMPETITIVA (1 semana)",
    "descricao": "Últimas 3 perdas em faixa R$ 20k-25k. Preparar proposta..."
  }
]
```

---

## 📈 Dashboard

### Página Principal (`dashboard-geral.html`)

**Cards de Estatísticas:**
- Total de clientes monitorados
- Clientes com alerta
- Win rate médio geral
- Última atualização

**Tabela de Alertas:**
- Ordenada por severidade (Crítico → Alto → Médio)
- Filtros: busca por nome/CNPJ, severidade
- Link para página detalhada

### Página do Cliente (`cliente-detalhes.html?id={contactId}`)

**Seções:**
1. Header com nome, CNPJ e badge de alerta
2. Cards com win rates (histórico, recente, desvio)
3. Tabela comparativa de métricas
4. 5 Sugestões específicas geradas por IA
5. Histórico últimos 20 deals

---

## 🔧 Manutenção

### Atualizar Manualmente

```bash
# Re-executar varredura
npm run varredura

# Sincronizar
npm run sync
```

### Verificar Logs do Job

```bash
tail -f job.log
```

### Limpar Cache

```bash
rm clientes-baseline.json
rm clientes-com-sugestoes.json
```

---

## 📊 Estrutura do Banco (Supabase)

### Tabela: `clientes_propostas_baseline`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| contact_id | BIGINT | ID do cliente no Ploomes |
| nome | TEXT | Nome do cliente |
| cnpj | TEXT | CNPJ do cliente |
| total_propostas | INT | Total de propostas históricas |
| total_ganhas | INT | Total ganhas (histórico) |
| total_perdidas | INT | Total perdidas (histórico) |
| win_rate_historico | DECIMAL | Win rate total do cliente |
| ticket_medio_historico | DECIMAL | Ticket médio histórico |
| propostas_recentes | INT | Propostas últimos 3 meses |
| ganhas_recentes | INT | Ganhas últimos 3 meses |
| perdidas_recentes | INT | Perdidas últimos 3 meses |
| win_rate_recente | DECIMAL | Win rate últimos 3 meses |
| ticket_medio_recente | DECIMAL | Ticket médio recente |
| tem_alerta | BOOLEAN | Se cliente tem alerta ativo |
| severidade | TEXT | CRÍTICO / ALTO / MÉDIO / BAIXO |
| desvio_win_rate | DECIMAL | Diferença recente - histórico |
| desvio_ticket | DECIMAL | % de variação do ticket |
| dias_sem_venda | INT | Dias desde última venda |
| ultima_atualizacao | TIMESTAMP | Data da última sincronização |
| proxima_sincronizacao | TIMESTAMP | Próxima segunda 6h |

---

## 🚨 Troubleshooting

### Erro: Tabela não existe

```bash
# Re-executar SQL no Supabase
cat criar-tabela-supabase.sql
# Copiar e colar no SQL Editor
```

### Erro: API Key inválida

```bash
# Verificar .env.local
echo $PLOOME_API_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Erro: Rate Limit

```bash
# Script já tem delay de 600ms entre requests
# Se persistir, aumentar delay em varredura-completa-clientes.js
```

---

## 📝 Próximos Passos

- [ ] Integrar email de alertas semanais
- [ ] Adicionar gráficos de tendência
- [ ] Exportar relatórios em PDF
- [ ] Webhook para alertas em tempo real
- [ ] Integração com CRM

---

## 📄 Licença

Uso interno - Ciara Máquinas

---

**Criado em:** 22/10/2025
**Autor:** Sistema SuperClaude
**Status:** ✅ Produção
