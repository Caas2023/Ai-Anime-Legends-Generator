@echo off
echo Starting Anime Transformer setup...
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies!
    pause
    exit /b %ERRORLEVEL%
)
echo Dependencies installed.
echo Starting development server on port 5000...
call npm run dev
pause
