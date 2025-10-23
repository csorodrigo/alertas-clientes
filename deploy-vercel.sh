#!/bin/bash

# Deploy automatizado para Vercel
# Este script cria o projeto e faz deploy

echo "═══════════════════════════════════════"
echo "  DEPLOY ALERTAS-CLIENTES → VERCEL"
echo "═══════════════════════════════════════"
echo ""

# Verificar se está no diretório correto
if [ ! -f "vercel.json" ]; then
  echo "❌ vercel.json não encontrado!"
  echo "Execute este script da raiz do projeto."
  exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔨 Testando build local..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build falhou localmente!"
  exit 1
fi

echo ""
echo "✅ Build local OK!"
echo ""
echo "🚀 Fazendo deploy para Vercel..."
echo ""

# Deploy usando Vercel CLI
# Primeiro deploy: criar projeto
# Próximos: atualizar
vercel --prod --yes

if [ $? -eq 0 ]; then
  echo ""
  echo "═══════════════════════════════════════"
  echo "✅ DEPLOY COMPLETO!"
  echo "═══════════════════════════════════════"
else
  echo ""
  echo "❌ Deploy falhou! Veja erros acima."
  exit 1
fi
