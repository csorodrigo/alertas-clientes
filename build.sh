#!/bin/bash

# Script de build para Vercel
# Substitui variáveis de ambiente no template

echo "🔧 Gerando config.js com variáveis de ambiente..."

# Verificar se as variáveis existem
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "⚠️ AVISO: Variáveis de ambiente não configuradas no Vercel!"
  echo "Configure SUPABASE_URL e SUPABASE_ANON_KEY no dashboard do Vercel"
fi

# Copiar template para config.js
cp public/config.template.js public/config.js

# Substituir variáveis de ambiente
sed -i.bak "s|__SUPABASE_URL__|${SUPABASE_URL:-https://placeholder.supabase.co}|g" public/config.js
sed -i.bak "s|__SUPABASE_ANON_KEY__|${SUPABASE_ANON_KEY:-placeholder-key}|g" public/config.js
sed -i.bak "s|__PLOOME_API_KEY__|${PLOOME_API_KEY:-}|g" public/config.js
sed -i.bak "s|__OPENAI_API_KEY__|${OPENAI_API_KEY:-}|g" public/config.js

# Remover arquivo de backup
rm -f public/config.js.bak

echo "✅ config.js gerado com sucesso!"
cat public/config.js
