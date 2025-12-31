#!/bin/bash

# Script de teste automatizado para Connecto
# Execute: bash test-all.sh

echo "🧪 Iniciando testes do Connecto..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função para testar
test_step() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

echo "📦 Verificando dependências..."

# Verificar Node.js
command -v node >/dev/null 2>&1
test_step "Node.js instalado ($(node -v))"

# Verificar npm
command -v npm >/dev/null 2>&1
test_step "npm instalado ($(npm -v))"

echo ""
echo "🔧 Verificando estrutura do projeto..."

# Verificar estrutura
[ -d "server" ]
test_step "Pasta server/ existe"

[ -d "client" ]
test_step "Pasta client/ existe"

[ -f "server/package.json" ]
test_step "server/package.json existe"

[ -f "client/package.json" ]
test_step "client/package.json existe"

[ -f "server/.env" ]
test_step "server/.env existe"

echo ""
echo "📥 Testando instalação de dependências..."

# Testar instalação server
cd server
if npm list >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dependências do server instaladas"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Instalando dependências do server..."
    npm install >/dev/null 2>&1
    test_step "Dependências do server instaladas"
fi
cd ..

# Testar instalação client
cd client
if npm list >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dependências do client instaladas"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Instalando dependências do client..."
    npm install >/dev/null 2>&1
    test_step "Dependências do client instaladas"
fi
cd ..

echo ""
echo "🔨 Testando build..."

# Build server
cd server
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build do server bem-sucedido"
    ((PASSED++))
    [ -d "dist" ] && test_step "Pasta dist/ criada"
else
    echo -e "${RED}✗${NC} Build do server falhou"
    ((FAILED++))
fi
cd ..

# Build client
cd client
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build do client bem-sucedido"
    ((PASSED++))
    [ -d "dist" ] && test_step "Pasta dist/ criada"
else
    echo -e "${RED}✗${NC} Build do client falhou"
    ((FAILED++))
fi
cd ..

echo ""
echo "🌐 Verificando arquivos de configuração..."

[ -f "server/.env" ]
test_step "server/.env configurado"

[ -f "client/.env" ] || [ -f "client/.env.local" ]
test_step "client/.env configurado"

[ -f "vercel.json" ]
test_step "vercel.json existe (deploy frontend)"

[ -f "render.yaml" ]
test_step "render.yaml existe (deploy backend)"

echo ""
echo "📋 Resumo dos testes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    echo ""
    echo "✅ Seu projeto está pronto para deploy!"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Execute 'npm run dev' no server (Terminal 1)"
    echo "   2. Execute 'npm run dev' no client (Terminal 2)"
    echo "   3. Teste manualmente em http://localhost:5173"
    echo "   4. Siga o QUICK_DEPLOY.md para colocar no ar"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Alguns testes falharam.${NC}"
    echo ""
    echo "🔧 Correções sugeridas:"
    echo "   1. Execute 'npm install' em server/ e client/"
    echo "   2. Verifique se os arquivos .env existem"
    echo "   3. Execute os testes novamente"
    exit 1
fi
