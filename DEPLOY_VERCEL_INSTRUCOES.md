# 🚀 Instruções para Deploy no Vercel

## ✅ Projeto está pronto para deploy!

O repositório GitHub já está configurado e atualizado:
- ✅ Repositório: https://github.com/csorodrigo/alertas-clientes
- ✅ Branch: main
- ✅ Commit mais recente: `feat: configurar projeto para deploy no Vercel` (3ab2d60)

## 📋 Passo a passo para deploy via Vercel Web

### 1. Acessar Vercel
Acesse: https://vercel.com/new

### 2. Importar o repositório GitHub
- Clique em "Add New Project"
- Selecione "Import Git Repository"
- Procure por: **alertas-clientes**
- Clique em "Import"

### 3. Configurar o projeto

**Project Name:**
```
alertas-clientes
```

**Framework Preset:**
```
Other (ou "None")
```

**Root Directory:**
```
./ (raiz do projeto - deixar vazio)
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
public
```

**Install Command:**
```
npm install
```

### 4. Configurar variáveis de ambiente

Antes de fazer o deploy, configure estas variáveis de ambiente:

#### Variáveis obrigatórias:

**SUPABASE_URL**
```
https://yxwokryybudwygtemfmu.supabase.co
```

**SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d29rcnl5YnVkd3lndGVtZm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDE2ODEsImV4cCI6MjA3NDMxNzY4MX0.ALgRRp1FivPIQ7TltZF7HPDS2d12RNAxTnc_BfRmJUg
```

#### Variáveis opcionais:

**PLOOME_API_KEY** (se usar integração Ploomes)
```
[sua chave da API Ploomes]
```

**OPENAI_API_KEY** (se usar sugestões IA)
```
[sua chave da API OpenAI]
```

### 5. Deploy inicial

Clique em **"Deploy"** e aguarde o build completar.

### 6. Monitorar o build

O Vercel vai:
1. ✅ Clonar o repositório
2. ✅ Executar `npm install`
3. ✅ Executar `npm run build` (que roda `bash build.sh`)
4. ✅ Gerar `public/config.js` com as env vars
5. ✅ Fazer deploy da pasta `public/`

### 7. Validar deploy

Após o deploy completar, você terá uma URL como:
```
https://alertas-clientes.vercel.app
```

Acesse e verifique:
- ✅ Dashboard carrega sem erros
- ✅ Console sem erros críticos
- ✅ Conexão com Supabase funciona
- ✅ Dados aparecem na tabela

## 🔧 Configuração do Supabase

### Liberar CORS no Supabase

1. Acesse: https://supabase.com/dashboard/project/yxwokryybudwygtemfmu/settings/api
2. Role até "Allowed Origins"
3. Adicione:
```
https://alertas-clientes.vercel.app
https://*.vercel.app
```

## 🐛 Troubleshooting

### Erro: "SUPABASE_URL is not defined"
- Verifique se as env vars foram configuradas no Vercel
- Vá em: Project Settings → Environment Variables
- Adicione `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### Erro: CORS blocked
- Configure Allowed Origins no Supabase (ver seção acima)

### Build falha em "npm run build"
- Verifique logs no Vercel
- O script `build.sh` deve rodar sem erros
- Se der erro de permissão, verifique se `build.sh` está executável

### Página em branco
- Verifique console do browser (F12)
- Veja se `config.js` foi gerado corretamente
- Verifique se as env vars estão configuradas

## 📊 Status atual do projeto

- ✅ Repositório GitHub: https://github.com/csorodrigo/alertas-clientes
- ✅ Branch: main
- ✅ Commit: 3ab2d60
- ✅ Arquivos necessários:
  - `vercel.json` ✅
  - `package.json` com script de build ✅
  - `build.sh` com substituição de env vars ✅
  - `public/config.template.js` ✅
  - `public/index.html` ✅
  - `public/dashboard-geral.html` ✅
  - `public/cliente-detalhes.html` ✅

## 🎯 Próximos passos

1. Criar projeto no Vercel seguindo instruções acima
2. Aguardar build completar
3. Validar funcionamento
4. Configurar domínio customizado (opcional)

---

**Importante:** O Vercel CLI não está autenticado neste momento, por isso use a interface web (https://vercel.com/new)
