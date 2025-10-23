# 🚀 Início Rápido - Sistema de Propostas Perdidas

## ⚡ Setup em 5 Minutos

### 1. Instalar Dependências (30 segundos)

```bash
cd propostas-perdidas
npm install
```

### 2. Criar Tabela no Supabase (1 minuto)

1. Abrir [Supabase SQL Editor](https://supabase.com/dashboard/project/yxwokryybudwygtemfmu/sql/new)
2. Copiar TODO conteúdo de `criar-tabela-supabase.sql`
3. Colar no editor
4. Clicar em "Run"

✅ Se aparecer "Success. No rows returned", está correto!

### 3. Primeira Varredura (2-5 minutos)

```bash
npm run varredura
```

Aguarde... Vai buscar todos os clientes e calcular baseline.

### 4. Sincronizar com Supabase (30 segundos)

```bash
npm run sync
```

### 5. Abrir Dashboard (imediato)

```bash
npm run dashboard
```

Ou abrir manualmente: `dashboard-geral.html` no navegador

---

## 📊 O Que Você Verá

### Dashboard Principal

- **Total de Clientes**: Todos os clientes monitorados
- **Com Alerta**: Clientes com desvio significativo
- **Win Rate Médio**: Média geral de conversão
- **Tabela**: Lista de clientes ordenada por severidade

### Página do Cliente

Ao clicar em "Ver Detalhes":

- Comparação Histórico vs Recente
- 5 Sugestões específicas para recuperar
- Histórico dos últimos 20 deals
- Métricas detalhadas

---

## 🤖 Automatizar (Opcional)

### Cron Job - Atualização Semanal

```bash
# Editar crontab
crontab -e

# Adicionar (toda segunda-feira 6h)
0 6 * * 1 cd /Users/rodrigooliveira/Documents/workspace\ 2/Claude-code/PLOMES-ROTA-CEP/frontend-v0/propostas-perdidas && npm run job >> job.log 2>&1
```

### Executar Job Manualmente

```bash
npm run job
```

Faz tudo: varredura + sincronização

---

## 🔧 Comandos Úteis

```bash
# Varredura completa
npm run varredura

# Sincronizar Supabase
npm run sync

# Job completo
npm run job

# Abrir dashboard
npm run dashboard

# Testar sistema
./testar-sistema.sh
```

---

## 🚨 Alertas Explicados

### Severidades

| Cor | Severidade | Critério |
|-----|-----------|----------|
| 🔴 Vermelho | CRÍTICO | Desvio ≤ -20% win rate ou ≤ -25% ticket |
| 🟠 Laranja | ALTO | Desvio ≤ -15% win rate ou ≤ -20% ticket |
| 🟡 Amarelo | MÉDIO | Desvio ≤ -10% win rate ou ≤ -15% ticket |
| 🟢 Verde | BAIXO | Dentro do normal |

### Exemplo Real (TBM)

```
Histórico: 68.4% → Recente: 45.2%
Desvio: -23.2% 🔴 CRÍTICO
Ação: Agendar reunião urgente!
```

---

## 📈 Interpretação dos Dados

### Win Rate

- **Histórico**: Performance total do cliente
- **Recente**: Últimos 3 meses
- **Desvio**: Diferença (negativo = piora)

### Ticket Médio

- Valor médio das propostas ganhas
- Desvio negativo = vendendo menos valor
- Pode indicar competição por preço

### Dias Sem Venda

- Dias desde última proposta ganha
- Alto = cliente pode estar inativo
- Ação: reativar relacionamento

---

## 💡 Casos de Uso

### Caso 1: Cliente CRÍTICO

```
Cliente: TBM
Desvio: -23.2%
Dias sem venda: 92

Ação Imediata:
1. Ligar hoje
2. Agendar reunião presencial
3. Investigar concorrência
4. Proposta especial
```

### Caso 2: Cliente ALTO

```
Cliente: ABC Industries
Desvio: -17.5%
Dias sem venda: 45

Ação:
1. Email personalizado
2. Follow-up semanal
3. Oferta limitada
```

### Caso 3: Monitoramento Preventivo

```
Cliente: XYZ Corp
Desvio: -8%
Dias sem venda: 15

Ação:
1. Manter contato regular
2. Acompanhar próximas propostas
3. Garantir qualidade
```

---

## 🔍 Troubleshooting Rápido

### Dashboard não carrega

```bash
# Verificar se Supabase está acessível
curl https://yxwokryybudwygtemfmu.supabase.co
```

### Varredura falha

```bash
# Testar API Ploomes
curl -H "User-Key: $PLOOME_API_KEY" https://public-api2.ploomes.com/Deals?$top=1
```

### Sincronização falha

```bash
# Verificar se tabela existe
# No Supabase SQL Editor:
SELECT COUNT(*) FROM clientes_propostas_baseline;
```

---

## 📞 Suporte

- **Documentação Completa**: `README_SISTEMA_COMPLETO.md`
- **Guia de Busca**: `GUIA_BUSCAR_DEALS_QUALQUER_CLIENTE.md`
- **Plano**: `PLANO_DASHBOARD_GERAL.md`

---

**Última atualização:** 22/10/2025
**Status:** ✅ Pronto para uso
