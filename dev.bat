@echo off
echo.
echo ========================================
echo   Iggle Development Environment
echo ========================================
echo.

echo Starting Server...
start cmd /k "cd server && npm start"

timeout /t 3 /nobreak >nul

echo Starting Client...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo   Server: http://localhost:8000
echo   Client: http://localhost:5173
echo ========================================
echo.
echo Close the terminal windows to stop the servers.
pause
