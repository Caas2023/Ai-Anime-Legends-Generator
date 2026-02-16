@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   Iniciando Servidor Anime Transformer
echo ==========================================

REM Tentar encontrar o node no PATH
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js encontrado no PATH.
    goto :INSTALL
)

REM Tentar encontrar em locais padrao
set "NODE_DIRS=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%AppData%\npm;%LocalAppData%\Programs\node"
for %%D in ("%NODE_DIRS:;=" "%") do (
    if exist "%%~D\node.exe" (
        echo [OK] Node.js encontrado em: %%~D
        set "PATH=%PATH%;%%~D"
        goto :INSTALL
    )
)

echo [ERRO] Node.js nao encontrado!
echo Por favor, instale o Node.js em https://nodejs.org/
pause
exit /b 1

:INSTALL
echo.
echo [1/2] Instalando dependencias...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Iniciando servidor de desenvolvimento...
echo Acesse http://localhost:5000 no seu navegador apos o inicio.
call npm run dev
pause
