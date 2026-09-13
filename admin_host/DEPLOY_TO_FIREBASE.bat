@echo off
title SanTyper Pro - Firebase Hosting Deployer
color 0e
cls

echo ===============================================================================
echo   SANTYPER PRO - FIREBASE HOSTING DEPLOYER
echo   Author: Sanchitha Charunya
echo ===============================================================================
echo.

cd /d "%~dp0\.."

if not exist dist (
    echo Building production web bundle first...
    call npm run build
)

echo.
echo Checking Firebase authentication & deploying...
call npx --yes firebase-tools deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo Firebase login required. Launching login:
    call npx --yes firebase-tools login
    call npx --yes firebase-tools deploy --only hosting
)

echo.
pause
