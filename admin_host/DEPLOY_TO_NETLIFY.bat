@echo off
title SanTyper Pro - Netlify Production Deployer (santyper.netlify.app)
color 0b
cls

echo ===============================================================================
echo   SANTYPER PRO - NETLIFY CLOUD HOSTING DEPLOYER
echo   Target: https://santyper.netlify.app
echo ===============================================================================
echo.

cd /d "%~dp0\.."

if not exist dist (
    echo Building production web bundle first...
    call npm run build
)

echo.
echo Deploying to Netlify (Live Production CDN)...
call npx --yes netlify-cli deploy --prod --dir=dist --site=santyper
if %errorlevel% neq 0 (
    echo.
    echo Netlify CLI returned an error or authentication needed.
    echo Running Netlify login:
    call npx --yes netlify-cli login
    call npx --yes netlify-cli deploy --prod --dir=dist --site=santyper
)

echo.
echo Opening santyper.netlify.app in default browser...
start https://santyper.netlify.app

echo.
pause
