# 🚀 DEPLOY COMPLETO NO VERCEL - PASSO A PASSO

## ✅ PREPARAÇÃO (JÁ FEITO)

- ✅ Código commitado e enviado para: https://github.com/csorodrigo/alertas-clientes
- ✅ Estrutura correta: `public/` com arquivos HTML/JS
- ✅ `vercel.json` configurado
- ✅ `package.json` com build script
- ✅ `.gitignore` apropriado

## 📝 PASSO 1: FAZER LOGIN NO VERCEL

1. Abra o navegador em: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcsorodrigo%2Falertas-clientes

2. Clique em **"Continue with GitHub"**

3. **FAÇA LOGIN NO GITHUB** com suas credenciais:
   - Username/Email: `seu-usuario-github`
   - Password: `sua-senha-github`
   - Clique em **"Sign in"**

4. Se pedido, **autorize o Vercel** a acessar seus repositórios

## 📦 PASSO 2: CONFIGURAR O PROJETO

Após login, você verá a tela de configuração:

### 2.1 Configurações Básicas
- **Project Name**: `alertas-clientes` (ou deixe o sugerido)
- **Framework Preset**: `Other` (já detectado)
- **Root Directory**: `./` (deixar padrão)
- **Build Command**: `npm run build` (já configurado em package.json)
- **Output Directory**: `public` (já configurado em vercel.json)

### 2.2 Variáveis de Ambiente ⚠️ CRÍTICO!

**CLIQUE EM "Environment Variables"** e adicione:

```bash
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://qgwclhucfktbxhzotpno.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnd2NsaHVjZmt0Ynhoem90cG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwODY4MTIsImV4cCI6MjA0NDY2MjgxMn0.YwuKe8vSdQh3Ou_RWZSXUwXqGpK8K5dLKxWqKS7vM6A

# Ploomes (OPCIONAL - para buscas futuras)
PLOOME_API_KEY=sua-key-aqui
OPENAI_API_KEY=sua-key-aqui
```

**⚠️ IMPORTANTE**: Sem as variáveis do Supabase, o dashboard NÃO funcionará!

## 🚀 PASSO 3: FAZER DEPLOY

1. Clique no botão **"Deploy"**

2. **AGUARDE** o processo de build (1-3 minutos):
   - Vercel irá clonar o repo
   - Executar `npm install`
   - Executar `npm run build` (que roda `build.sh`)
   - O script substituirá variáveis de ambiente em `config.js`
   - Deploy dos arquivos de `public/`

3. **MONITORE OS LOGS** na tela

## ⚠️ PASSO 4: CORRIGIR ERROS (SE HOUVER)

### Se o build FALHAR:

#### Erro 1: `sed: command not found` ou problema no build.sh
**Solução**: O Vercel usa Linux. Se houver erro, simplifique o build:

```bash
# No seu terminal local:
cd /Users/rodrigooliveira/Documents/workspace\ 2/Claude-code/PLOMES-ROTA-CEP/alertas-clientes

# Editar build.sh para usar sintaxe Linux:
cat > build.sh << 'EOF'
#!/bin/bash
echo "🔧 Gerando config.js..."
cp public/config.template.js public/config.js
sed -i "s|__SUPABASE_URL__|${SUPABASE_URL:-https://placeholder.supabase.co}|g" public/config.js
sed -i "s|__SUPABASE_ANON_KEY__|${SUPABASE_ANON_KEY:-placeholder-key}|g" public/config.js
sed -i "s|__PLOOME_API_KEY__|${PLOOME_API_KEY:-}|g" public/config.js
sed -i "s|__OPENAI_API_KEY__|${OPENAI_API_KEY:-}|g" public/config.js
echo "✅ config.js gerado!"
EOF

chmod +x build.sh
git add build.sh
git commit -m "fix: corrigir build.sh para Linux"
git push origin main
```

**Depois volte ao Vercel e clique em "Redeploy"**

#### Erro 2: `404` ao acessar
**Solução**: Verificar `vercel.json`:

```json
{
  "version": 2,
  "framework": null,
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "public",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## ✅ PASSO 5: VALIDAR DEPLOYMENT

Após deployment bem-sucedido:

1. **Copie a URL** do deployment (ex: `https://alertas-clientes.vercel.app`)

2. **Abra a URL** no navegador

3. **VALIDE**:
   - ✅ Dashboard carrega
   - ✅ Tabela mostra dados (buscados do Supabase)
   - ✅ Filtros funcionam
   - ✅ Página de detalhes abre ao clicar em cliente
   - ✅ Botão "Gerar Sugestões IA" aparece

4. **Se a tabela estiver VAZIA**:
   - Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas
   - Abra o console do navegador (F12) e veja erros
   - Vá em Vercel → Projeto → Settings → Environment Variables
   - Corrija as variáveis
   - Vá em Deployments → Clique nos 3 pontos → "Redeploy"

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problema: "net::ERR_NAME_NOT_RESOLVED"
- Aguarde propagação DNS (pode levar alguns minutos)
- Tente em navegador anônimo

### Problema: Tabela vazia mas sem erro
- Abra F12 → Console
- Verifique se há erro de CORS do Supabase
- Vá ao Supabase Dashboard → Authentication → URL Configuration
- Adicione sua URL do Vercel em "Site URL" e "Redirect URLs"

### Problema: Build passa mas site não carrega
- Verifique se `index.html` existe em `public/`
- Verifique se `outputDirectory` está como `"public"` em `vercel.json`

## 📊 MONITORAMENTO

Após deploy bem-sucedido:

1. **Vercel Dashboard** → Seu projeto → "Analytics"
   - Veja requisições, erros, performance

2. **Vercel Dashboard** → "Logs"
   - Monitore chamadas de API
   - Veja erros em tempo real

## 🎉 DEPLOY COMPLETO!

Se tudo estiver funcionando:

```
✅ Dashboard online em: https://alertas-clientes.vercel.app
✅ Dados carregando do Supabase
✅ Zero erros críticos
✅ Pronto para produção!
```

## 🔄 ATUALIZAÇÕES FUTURAS

Para fazer updates:

```bash
# 1. Faça mudanças no código
git add .
git commit -m "feat: sua mudança"
git push origin main

# 2. Vercel detecta automaticamente e faz redeploy!
```

## 📝 COMANDOS ÚTEIS

```bash
# Ver status do projeto Vercel
vercel ls

# Deploy manual (se tiver CLI)
vercel --prod

# Ver logs em tempo real
vercel logs

# Abrir projeto no browser
vercel open
```

---

**⚡ DICA PRO**: Após o primeiro deploy, você pode fazer pequenas correções diretamente no Vercel:
1. Vá em Settings → Environment Variables
2. Edite valores
3. Vá em Deployments → Redeploy

Isso é mais rápido que commit/push para pequenos ajustes de config!
