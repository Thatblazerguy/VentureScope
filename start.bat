@echo off
echo Starting VentureScope Ecosystem...

start "VentureScope - Backend API" cmd /k "cd backend && npm run dev"
start "VentureScope - OpenClaw Agent" cmd /k "cd openclaw && node server.js"

echo Waiting for APIs to boot...
timeout /t 3 /nobreak > nul

start "VentureScope - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services launched in separate windows!
echo ------------------------------------------
echo - Frontend running at: http://localhost:5173
echo - Backend running at:  http://localhost:3000
echo - OpenClaw Copilot at: http://localhost:4000
echo ------------------------------------------
echo.
echo Press any key to also run the Gap Radar (HEARTBEAT) Pipeline...
pause > nul
cd openclaw && node run.js
