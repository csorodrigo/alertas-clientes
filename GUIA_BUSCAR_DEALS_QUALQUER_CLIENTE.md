# 📚 GUIA DEFINITIVO: Buscar Deals de QUALQUER Cliente no Ploomes

## 🎯 Objetivo

Este guia explica **exatamente** como buscar deals de **QUALQUER CLIENTE** da API Ploomes de forma CORRETA, incluindo filtro de "VD -" na linha de negócio.

---

## ✅ PASSO A PASSO COMPLETO

### PASSO 1: Validar com Deal ID Real (OBRIGATÓRIO)

**Por que?** Para descobrir o ContactId e PipelineId CORRETOS. NUNCA assuma!

```javascript
// 1.1 Pegar ID de um deal do screenshot/interface
const DEAL_ID_SCREENSHOT = 1200877624; // Exemplo

// 1.2 Buscar este deal
const res = await fetch(
  `https://public-api2.ploomes.com/Deals?$filter=Id eq ${DEAL_ID_SCREENSHOT}&$expand=Contact,Pipeline`,
  { headers: { 'User-Key': API_KEY } }
);

const dealValidacao = (await res.json()).value[0];

// 1.3 Extrair IDs CORRETOS
const CONTACT_ID = dealValidacao.ContactId;
const PIPELINE_ID = dealValidacao.PipelineId;

console.log('✅ ContactId:', CONTACT_ID);
console.log('✅ PipelineId:', PIPELINE_ID);
console.log('✅ Cliente:', dealValidacao.Contact?.Name);
console.log('✅ Funil:', dealValidacao.Pipeline?.Name);
```

**⚠️ CRÍTICO:** Se pular este passo, você vai buscar do cliente/funil ERRADO!

---

### PASSO 2: Buscar Todos os Deals (Com Paginação)

```javascript
const allDeals = [];
let skip = 0;
const PAGE_SIZE = 300; // Máximo permitido

while (true) {
  const res = await fetch(
    `https://public-api2.ploomes.com/Deals?` +
    `$filter=ContactId eq ${CONTACT_ID} and PipelineId eq ${PIPELINE_ID}` +
    `&$expand=Stage,OtherProperties` + // IMPORTANTE: expandir OtherProperties
    `&$orderby=StartDate desc` +
    `&$skip=${skip}&$top=${PAGE_SIZE}`,
    { headers: { 'User-Key': API_KEY } }
  );

  const data = await res.json();

  if (!data.value || data.value.length === 0) break;

  allDeals.push(...data.value);
  console.log(`Página ${Math.floor(skip/PAGE_SIZE) + 1}: ${allDeals.length} deals...`);

  if (data.value.length < PAGE_SIZE) break; // Última página

  skip += PAGE_SIZE;

  // Respeitar rate limit (120 req/min = ~500ms)
  await new Promise(r => setTimeout(r, 600));
}

console.log(`\n✅ Total buscado: ${allDeals.length} deals`);
```

---

### PASSO 3: Filtrar Deals com "VD -" (EXCLUIR)

**Campo:** Linha de negócio
**FieldKey:** `deal_A32188D0-B97B-4419-BD50-174F31824574`
**Tipo:** Options (valor em `IntegerValue`, NÃO em StringValue!)

```javascript
// IDs das 10 opções "VD -"
const LINHA_NEGOCIOS_VD_IDS = [
  400353630, // VD - Gardner Denver
  400353631, // VD - Refrisat
  400353632, // VD - Anest Iwata
  400353633, // VD - Pneumatech
  400353634, // VD - Edwards
  400353635, // VD - Ingersoll Rand
  410486206, // VD - Pressure
  422444143, // VD - Hess
  422996994, // VD - Refrigenew
  1200093693  // VD - Parker
];

const CAMPO_LINHA_NEGOCIOS = 'deal_A32188D0-B97B-4419-BD50-174F31824574';

function temLinhaVD(deal) {
  const campoLinha = deal.OtherProperties?.find(
    prop => prop.FieldKey === CAMPO_LINHA_NEGOCIOS
  );

  // Verificar IntegerValue (não StringValue!)
  return LINHA_NEGOCIOS_VD_IDS.includes(campoLinha?.IntegerValue);
}

// Filtrar: EXCLUIR deals com VD
const dealsSemVD = allDeals.filter(deal => !temLinhaVD(deal));

console.log(`\n🔧 FILTRO VD:`);
console.log(`   Total: ${allDeals.length}`);
console.log(`   Com VD (excluídos): ${allDeals.length - dealsSemVD.length}`);
console.log(`   Sem VD (análise): ${dealsSemVD.length}`);
```

---

### PASSO 4: Validar Primeira Linha (OBRIGATÓRIO)

```javascript
const primeiro = dealsSemVD[0];

console.log('\n🔍 VALIDAÇÃO:');
console.log('Esperado (screenshot):');
console.log('  Título: [copiar título da 1ª linha do screenshot]');
console.log('  Data: [copiar data do screenshot]');

console.log('\nRecebido (API):');
console.log(`  Título: ${primeiro.Title}`);
console.log(`  Data: ${new Date(primeiro.StartDate).toLocaleDateString('pt-BR')}`);
console.log(`  Status: ${primeiro.StatusId === 2 ? 'Ganho' : 'Perdido'}`);

// ⚠️ SE NÃO BATER: PARAR! Investigar o que está errado.
```

---

### PASSO 5: Análise Estatística

```javascript
// Filtrar só Ganho (2) e Perdido (3)
const ganhas = dealsSemVD.filter(d => d.StatusId === 2);
const perdidas = dealsSemVD.filter(d => d.StatusId === 3);
const total = ganhas.length + perdidas.length;

const winRate = total > 0 ? (ganhas.length / total) * 100 : 0;

console.log('\n📊 ESTATÍSTICAS (SEM VD):');
console.log(`   Total analisado: ${total}`);
console.log(`   ✅ Ganhas: ${ganhas.length} (${winRate.toFixed(1)}%)`);
console.log(`   ❌ Perdidas: ${perdidas.length} (${(100-winRate).toFixed(1)}%)`);
console.log(`   🎯 Win Rate: ${winRate.toFixed(1)}%`);

// Salvar
require('fs').writeFileSync(
  `${clienteNome}-sem-vd.json`,
  JSON.stringify(dealsSemVD, null, 2)
);
```

---

## 🚨 ERROS CRÍTICOS QUE COMETI (NÃO REPETIR!)

### Erro 1: Cliente Errado (ContactId Incorreto)

**❌ ERRADO:**
```javascript
// Buscar por nome e usar primeiro resultado
const clientes = await buscar('/Contacts?$filter=startswith(Name,"TBM")');
const contactId = clientes[0].Id; // ERRADO!
```

**✅ CERTO:**
```javascript
// Buscar deal específico primeiro
const deal = await buscar('$filter=Id eq 1200877624');
const contactId = deal.ContactId; // CORRETO!
```

**Causa:** Havia 2 clientes TBM. Eu estava usando o errado!

---

### Erro 2: Busca Direta por ID Não Funciona

**❌ ERRADO:**
```javascript
GET /Deals/1200877624  // Retorna 404 ou HTML
```

**✅ CERTO:**
```javascript
GET /Deals?$filter=Id eq 1200877624  // OData query funciona
```

---

### Erro 3: Filtrar VD pelo Título

**❌ ERRADO:**
```javascript
const semVD = deals.filter(d => !d.Title.includes('VD'));
```

**✅ CERTO:**
```javascript
const semVD = deals.filter(d => {
  const linha = d.OtherProperties?.find(
    p => p.FieldKey === 'deal_A32188D0-B97B-4419-BD50-174F31824574'
  );
  return !VD_IDS.includes(linha?.IntegerValue);
});
```

**Causa:** Campo "Linha de negócio" usa IntegerValue, não título!

---

### Erro 4: Buscar Deals de Todos Clientes

**❌ ERRADO:**
```javascript
// Buscar todos deals VD do sistema
$filter=PipelineId eq 40003581 and StatusId eq 3
```

**✅ CERTO:**
```javascript
// Buscar SÓ do cliente específico
$filter=ContactId eq 404681032 and PipelineId eq 40003581 and StatusId eq 3
```

**Causa:** Estava analisando deals de outros clientes!

---

### Erro 5: Não Expandir OtherProperties

**❌ ERRADO:**
```javascript
$expand=Stage  // Só Stage
```

**✅ CERTO:**
```javascript
$expand=Stage,OtherProperties  // Precisa de OtherProperties!
```

**Causa:** Sem expand, OtherProperties vem vazio!

---

## 📋 Checklist Final - SEMPRE Validar

- [ ] Deal ID do screenshot obtido
- [ ] ContactId descoberto via PASSO 1 (não assumido)
- [ ] PipelineId descoberto via PASSO 1
- [ ] `$expand=Stage,OtherProperties` incluído
- [ ] Paginação implementada ($skip/$top)
- [ ] Rate limit respeitado (600ms)
- [ ] Filtro VD usando IntegerValue
- [ ] Primeira linha validada com screenshot
- [ ] StatusId usado (2=Ganho, 3=Perdido)
- [ ] Dados salvos em JSON

---

## 💻 Script Template Completo

```javascript
const API_KEY = 'SUA_CHAVE_AQUI';
const DEAL_ID_VALIDACAO = 1234567890; // Do screenshot

// === DESCOBRIR IDS ===
const val = await fetch(
  `https://public-api2.ploomes.com/Deals?$filter=Id eq ${DEAL_ID_VALIDACAO}&$expand=Contact,Pipeline`,
  { headers: { 'User-Key': API_KEY } }
).then(r => r.json());

const CONTACT_ID = val.value[0].ContactId;
const PIPELINE_ID = val.value[0].PipelineId;

// === BUSCAR TODOS ===
const all = [];
let skip = 0;

while (true) {
  const res = await fetch(
    `https://public-api2.ploomes.com/Deals?` +
    `$filter=ContactId eq ${CONTACT_ID} and PipelineId eq ${PIPELINE_ID}` +
    `&$expand=Stage,OtherProperties` +
    `&$orderby=StartDate desc` +
    `&$skip=${skip}&$top=300`,
    { headers: { 'User-Key': API_KEY } }
  );

  const data = await res.json();
  if (!data.value || data.value.length === 0) break;

  all.push(...data.value);
  if (data.value.length < 300) break;

  skip += 300;
  await new Promise(r => setTimeout(r, 600));
}

// === FILTRAR VD ===
const VD_IDS = [400353630,400353631,400353632,400353633,400353634,400353635,410486206,422444143,422996994,1200093693];
const CAMPO_LINHA = 'deal_A32188D0-B97B-4419-BD50-174F31824574';

const semVD = all.filter(d => {
  const linha = d.OtherProperties?.find(p => p.FieldKey === CAMPO_LINHA);
  return !VD_IDS.includes(linha?.IntegerValue);
});

// === VALIDAR ===
console.log('Primeira linha:', semVD[0].Title);
// DEVE BATER COM SCREENSHOT!

// === ANÁLISE ===
const ganhas = semVD.filter(d => d.StatusId === 2).length;
const perdidas = semVD.filter(d => d.StatusId === 3).length;
console.log(`Win Rate: ${((ganhas/(ganhas+perdidas))*100).toFixed(1)}%`);
```

---

## 📊 Exemplo Real - TBM

### Dados de Entrada
- Deal ID validação: 1200877624
- Cliente: TBM S A INDUSTRIA TEXTIL
- CNPJ: 07.603.376/0001-30

### IDs Descobertos
- ContactId: 404681032
- PipelineId: 40003581

### Resultados
- Total: 40 deals
- Com VD: 2 (excluídos)
- Sem VD: 38 (análise)
- Win Rate: 68.4%

---

## 🔑 Informações Técnicas

### Campo "Linha de negócio"
- **FieldKey:** `deal_A32188D0-B97B-4419-BD50-174F31824574`
- **TypeId:** 7 (Options)
- **Armazenamento:** `IntegerValue` (ID da opção)
- **OptionsTableId:** 4015875
- **Total opções:** 26 (10 VD + 16 CIA)

### StatusId (Situação do Deal)
- **1:** Em aberto / Negociação
- **2:** Ganho (won)
- **3:** Perdido (lost)

### API Ploomes - Limites
- **Rate limit:** 120 requisições/minuto
- **Page size máximo:** 300 itens
- **Timeout recomendado:** 600ms entre requests

---

## ⚠️ 10 Erros Fatais - NUNCA FAZER

| # | Erro | Consequência |
|---|------|--------------|
| 1 | Buscar por nome sem validar | Cliente errado |
| 2 | Assumir primeiro resultado | Dados incorretos |
| 3 | Usar `GET /Deals/{id}` | 404 ou HTML |
| 4 | Filtrar VD por título | VD não excluído |
| 5 | Não expandir OtherProperties | Campo vazio |
| 6 | Não validar primeira linha | Análise errada |
| 7 | Buscar todos clientes | Dados misturados |
| 8 | Ignorar paginação | Dados incompletos |
| 9 | Não respeitar rate limit | Bloqueio temporário |
| 10 | Confiar sem validar | Decisões erradas |

---

## 📚 Lições Aprendidas (Caso TBM)

### O Que Deu Errado
1. **Assumi** que ContactId 401245409 era TBM correto
2. **Não validei** com deal real do screenshot
3. **Ignorei** que havia 2 clientes TBM
4. **Tentei** filtrar VD pelo título
5. **Busquei** deals de todos clientes (19k) em vez de só TBM (40)

### Como Corrigi
1. **Busquei** deal 1200877624 do screenshot
2. **Descobri** ContactId real: 404681032
3. **Validei** primeira linha bateu 100%
4. **Identifiquei** campo Linha de negócio
5. **Filtrei** VD usando IntegerValue

### Tempo Gasto
- **Tentativas erradas:** ~3 horas
- **Solução correta:** 15 minutos (depois de encontrar método)

---

## 🎯 Resumo - Regra de Ouro

> **"SEMPRE valide com deal ID real ANTES de buscar todos"**

Se seguir este guia:
- ✅ 100% chance de dados corretos
- ✅ Cliente correto
- ✅ Funil correto
- ✅ Filtro VD correto
- ✅ Análise confiável

Se pular passos:
- ❌ Alta chance de dados errados
- ❌ Análise inútil
- ❌ Decisões incorretas

---

**Criado:** 22/10/2025
**Testado com:** Cliente TBM
**Status:** Validado e pronto para produção
**Uso:** Dashboard análise propostas perdidas para QUALQUER cliente
