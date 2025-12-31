@echo off
REM Script de teste automatizado para Connecto (Windows)
REM Execute: test-all.bat

echo.
echo 🧪 Iniciando testes do Connecto...
echo.

set PASSED=0
set FAILED=0

echo 📦 Verificando dependencias...

REM Verificar Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js instalado
    set /a PASSED+=1
) else (
    echo ✗ Node.js NAO instalado
    set /a FAILED+=1
)

REM Verificar npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm instalado
    set /a PASSED+=1
) else (
    echo ✗ npm NAO instalado
    set /a FAILED+=1
)

echo.
echo 🔧 Verificando estrutura do projeto...

if exist "server\" (
    echo ✓ Pasta server/ existe
    set /a PASSED+=1
) else (
    echo ✗ Pasta server/ NAO encontrada
    set /a FAILED+=1
)

if exist "client\" (
    echo ✓ Pasta client/ existe
    set /a PASSED+=1
) else (
    echo ✗ Pasta client/ NAO encontrada
    set /a FAILED+=1
)

if exist "server\package.json" (
    echo ✓ server\package.json existe
    set /a PASSED+=1
) else (
    echo ✗ server\package.json NAO encontrado
    set /a FAILED+=1
)

if exist "client\package.json" (
    echo ✓ client\package.json existe
    set /a PASSED+=1
) else (
    echo ✗ client\package.json NAO encontrado
    set /a FAILED+=1
)

if exist "server\.env" (
    echo ✓ server\.env existe
    set /a PASSED+=1
) else (
    echo ⚠ server\.env NAO encontrado - crie um baseado no .env.example
    set /a FAILED+=1
)

echo.
echo 📥 Verificando dependencias instaladas...

cd server
if exist "node_modules\" (
    echo ✓ Dependencias do server instaladas
    set /a PASSED+=1
) else (
    echo ⚠ Instalando dependencias do server...
    call npm install
    if %errorlevel% equ 0 (
        echo ✓ Dependencias do server instaladas
        set /a PASSED+=1
    ) else (
        echo ✗ Falha ao instalar dependencias do server
        set /a FAILED+=1
    )
)
cd ..

cd client
if exist "node_modules\" (
    echo ✓ Dependencias do client instaladas
    set /a PASSED+=1
) else (
    echo ⚠ Instalando dependencias do client...
    call npm install
    if %errorlevel% equ 0 (
        echo ✓ Dependencias do client instaladas
        set /a PASSED+=1
    ) else (
        echo ✗ Falha ao instalar dependencias do client
        set /a FAILED+=1
    )
)
cd ..

echo.
echo 🔨 Testando builds...

cd server
echo Testando build do server...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Build do server bem-sucedido
    set /a PASSED+=1
) else (
    echo ✗ Build do server falhou
    set /a FAILED+=1
)
cd ..

cd client
echo Testando build do client...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Build do client bem-sucedido
    set /a PASSED+=1
) else (
    echo ✗ Build do client falhou
    set /a FAILED+=1
)
cd ..

echo.
echo 🌐 Verificando arquivos de configuracao...

if exist "vercel.json" (
    echo ✓ vercel.json existe
    set /a PASSED+=1
) else (
    echo ✗ vercel.json NAO encontrado
    set /a FAILED+=1
)

if exist "render.yaml" (
    echo ✓ render.yaml existe
    set /a PASSED+=1
) else (
    echo ✗ render.yaml NAO encontrado
    set /a FAILED+=1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 Resumo dos testes
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Passou: %PASSED%
echo Falhou: %FAILED%
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if %FAILED% equ 0 (
    echo.
    echo 🎉 Todos os testes passaram!
    echo.
    echo ✅ Seu projeto esta pronto para deploy!
    echo.
    echo 📝 Proximos passos:
    echo    1. Abra dois terminais
    echo    2. Terminal 1: cd server ^&^& npm run dev
    echo    3. Terminal 2: cd client ^&^& npm run dev
    echo    4. Teste em http://localhost:5173
    echo    5. Siga o QUICK_DEPLOY.md para colocar no ar
) else (
    echo.
    echo ❌ Alguns testes falharam.
    echo.
    echo 🔧 Correções sugeridas:
    echo    1. Execute npm install em server\ e client\
    echo    2. Verifique se os arquivos .env existem
    echo    3. Execute os testes novamente
)

pause
