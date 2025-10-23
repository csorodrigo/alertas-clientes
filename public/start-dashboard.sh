#!/bin/bash

echo "🚀 Iniciando Dashboard TBM..."
echo ""
echo "📍 Pasta: $(pwd)"
echo ""

# Iniciar servidor HTTP simples
echo "🌐 Servidor rodando em: http://localhost:8080"
echo ""
echo "✨ Abra no navegador: http://localhost:8080/dashboard.html"
echo ""
echo "⏹️  Pressione Ctrl+C para parar"
echo ""

# Usar Python ou PHP para servidor HTTP
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8080
elif command -v php &> /dev/null; then
    php -S localhost:8080
else
    echo "❌ Erro: Nenhum servidor HTTP disponível"
    echo "   Instale Python ou PHP"
    exit 1
fi
