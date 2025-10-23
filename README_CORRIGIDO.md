# Análise Corrigida - TBM S A INDUSTRIA TEXTIL

## Problema Anterior
A análise anterior estava usando o cliente **ERRADO**:
- Cliente analisado: "BEZERRA DE MENEZES" (parcial)
- Problema: Não especificava o funil correto

## Análise Corrigida
Agora com dados **REAIS** e **CLIENTE CORRETO**:

- **Cliente**: TBM - TEXTIL BEZERRA DE MENEZES S/A
- **CNPJ**: 07.603.376/0001-30  
- **Funil**: FUNIL DE VENDAS
- **Fonte**: API Ploomes (dados reais capturados)

## Descobertas Principais

### 1. Padrão CRÍTICO Detectado
**26 PERDAS CONSECUTIVAS** de 2018 a 2023

### 2. Estatísticas
- Total de Deals: 200
- Deals Ganhos: 174 (87%)
- Deals Perdidos: 26 (13%)

### 3. Maior Perda Identificada
- Proposta: "TBM - CENTRÍFUGO"
- Valor: R$ 1.500.000
- Data: 18/12/2019

## Arquivos

```
propostas-perdidas/
├── RELATORIO_TBM_CORRETO_FINAL.json     ← Dados estruturados (PRINCIPAL)
├── tbm-deals-REAL.json                  ← 200 deals brutos
├── ANALISE_CORRIGIDA_TBM.md             ← Análise visual
├── README_CORRIGIDO.md                  ← Este arquivo
└── (outros arquivos antigos)
```

## Script Corrigido

Script utilizado para análise:
- `/tmp/analyze-tbm-correto.js`
- Busca cliente correto por nome
- Filtra funil "FUNIL DE VENDAS"
- Detecta sequências de perdas (5+)
- Gera relatório JSON

## Como Acessar

### Local
```
/Users/rodrigooliveira/Documents/workspace\ 2/Claude-code/PLOMES-ROTA-CEP/frontend-v0/propostas-perdidas/
```

### Dados JSON
Abrir `RELATORIO_TBM_CORRETO_FINAL.json` em editor de código

### Análise Completa
Ler `ANALISE_CORRIGIDA_TBM.md`

## Próximos Passos

1. Verificar motivos das perdas (campo `LossReasonId`)
2. Analisar competição no período 2018-2023
3. Reativar cliente com proposta competitiva
4. Implementar monitoramento contínuo

---
**Status**: ✓ Análise Completa
**Data**: 21 de Outubro de 2025
