# 🚀 Deploy Manual Completo - alertas-clientes no Vercel

## ⚠️ SITUAÇÃO ATUAL

**Problema**: O deploy automático via Playwright requer autenticação interativa no GitHub, que não pode ser automatizada.

**Solução**: Deploy manual através do dashboard do Vercel (5-10 minutos)

---

## 📋 PASSO A PASSO COMPLETO

### FASE 1: Acessar Vercel e Fazer Login

1. **Abra o navegador** e acesse: https://vercel.com/new

2. **Faça login**:
   - Se já tem conta: Clique em "Login"
   - Se não tem conta: Clique em "Sign Up"
   - **Recomendado**: Use "Continue with GitHub" para integração automática

### FASE 2: Importar Repositório

3. **Na página "Import Git Repository"**:
   - Clique em "Continue with GitHub"
   - Se aparecer lista de repositórios, procure por "alertas-clientes"
   - Se não aparecer, clique em "Adjust GitHub App Permissions" e dê acesso ao repositório

4. **Se o repositório não aparecer automaticamente**:
   - Clique em "Import Third-Party Git Repository"
   - Cole a URL: `https://github.com/csorodrigo/alertas-clientes`
   - Clique em "Continue"

### FASE 3: Configurar Projeto

5. **Configure o projeto**:
   ```
   Project Name: alertas-clientes
   Framework Preset: Other
   Root Directory: (deixe vazio - usar raiz do repositório)
   Build Command: npm run build
   Output Directory: public
   Install Command: npm install
   ```

### FASE 4: Adicionar Variáveis de Ambiente (CRÍTICO!)

6. **Clique em "Environment Variables"** e adicione:

   **SUPABASE_URL**:
   ```
   https://yxwokryybudwygtemfmu.supabase.co
   ```

   **SUPABASE_ANON_KEY**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d29rcnl5YnVkd3lndGVtZm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDE2ODEsImV4cCI6MjA3NDMxNzY4MX0.ALgRRp1FivPIQ7TltZF7HPDS2d12RNAxTnc_BfRmJUg
   ```

   **⚠️ IMPORTANTE**:
   - Marque "Production", "Preview" e "Development" para cada variável
   - Sem essas variáveis, o build vai falhar!

### FASE 5: Deploy

7. **Clique em "Deploy"**
   - O Vercel vai:
     1. Instalar dependências (npm install)
     2. Executar build (npm run build)
     3. Gerar config.js com as variáveis de ambiente
     4. Fazer deploy do diretório public/

8. **Aguarde o build completar** (2-3 minutos)
   - Você verá logs em tempo real
   - O status mudará para "READY" quando finalizar

### FASE 6: Validar Deployment

9. **Após deploy bem-sucedido**:
   - Copie a URL do deployment (ex: https://alertas-clientes.vercel.app)
   - Clique no link para abrir o site

10. **Validar funcionalidades**:
    - ✅ Dashboard geral carrega (`/dashboard-geral.html`)
    - ✅ Tabela mostra dados do Supabase
    - ✅ Filtros funcionam
    - ✅ Busca funciona
    - ✅ Navegação para detalhes de cliente funciona
    - ✅ Console do browser sem erros críticos (F12 → Console)

---

## 🔄 SE O BUILD FALHAR

### Erro 1: "vercel.json not found" ou similar
**Causa**: Vercel não encontrou o arquivo vercel.json
**Solução**: Verifique se o Root Directory está vazio (usar raiz do repositório)

### Erro 2: "Build failed" ou "npm ERR!"
**Causa**: Falta de variáveis de ambiente
**Solução**:
1. Vá em Settings → Environment Variables
2. Adicione SUPABASE_URL e SUPABASE_ANON_KEY
3. Clique em "Redeploy" no dashboard

### Erro 3: "config.js not found" no browser
**Causa**: Build não gerou config.js corretamente
**Solução**:
1. Verifique os logs do build
2. Confirme que build.sh foi executado
3. Verifique se as variáveis de ambiente estão configuradas

### Erro 4: Dashboard carrega mas sem dados
**Causa**: Problemas de CORS ou conexão com Supabase
**Solução**:
1. Abra F12 → Console
2. Verifique erros de CORS
3. Vá em Supabase → Settings → API → Allowed Origins
4. Adicione a URL do Vercel (ex: https://alertas-clientes.vercel.app)

---

## 📸 SCREENSHOTS ESPERADOS

### 1. Configuração inicial:
- Nome do projeto: "alertas-clientes"
- Framework: "Other"
- Build Command: "npm run build"
- Output Directory: "public"

### 2. Environment Variables:
- SUPABASE_URL configurado
- SUPABASE_ANON_KEY configurado
- Ambos marcados para Production/Preview/Development

### 3. Build logs (sucesso):
```
> npm install
> npm run build
✅ config.js gerado com sucesso!
✓ Build Completed
```

### 4. Dashboard funcionando:
- Tabela com clientes
- Filtros funcionando
- Sem erros no console

---

## ✅ RESULTADO ESPERADO

Após seguir todos os passos:

- ✅ URL final do deployment: https://alertas-clientes.vercel.app (ou similar)
- ✅ Dashboard carregando corretamente
- ✅ Dados do Supabase sendo exibidos
- ✅ Todas as funcionalidades operacionais
- ✅ Console sem erros críticos

---

## 🆘 SUPORTE

Se encontrar problemas:

1. **Verifique os logs do build** no Vercel dashboard
2. **Abra o console do browser** (F12) para ver erros de frontend
3. **Confirme as variáveis de ambiente** estão configuradas
4. **Teste a conexão com Supabase** diretamente no SQL Editor

---

## 📝 CHECKLIST FINAL

Antes de considerar o deploy completo:

- [ ] Projeto criado no Vercel
- [ ] Variáveis de ambiente configuradas (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Build completou com sucesso (status READY)
- [ ] Dashboard abre sem erros
- [ ] Dados do Supabase carregam
- [ ] Filtros e busca funcionam
- [ ] Navegação para detalhes funciona
- [ ] Console do browser sem erros críticos

---

**Tempo estimado**: 5-10 minutos
**Dificuldade**: Baixa (interface visual do Vercel é intuitiva)
