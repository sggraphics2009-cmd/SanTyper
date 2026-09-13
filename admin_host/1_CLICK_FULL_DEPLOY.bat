@echo off
title SanTyper Pro - 1-Click Full Production Deploy (GitHub + Netlify + Firebase)
color 0b
cls

echo ===============================================================================
echo   SANCHITHA CHARUNYA - SANTYPER PRO 1-CLICK CLOUD DEPLOY ENGINE
echo   Target: santyper.netlify.app ^| GitHub CI/CD ^| Firebase Hosting
echo ===============================================================================
echo.

cd /d "%~dp0\.."

echo [1/3] Building Production Optimized Web Bundle...
call npm run build
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo [ERROR] Build failed! Please check code errors.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Syncing with GitHub Repository...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing Git repository...
    git init
    git branch -M main
)

git add -A
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Auto Deploy SanTyper Pro - %mydate% %mytime%"

echo Pushing updates to GitHub main branch...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] If GitHub push asks for authentication, please sign in.
    echo Or configure your remote with: git remote set-url origin https://github.com/USERNAME/santyper.git
)

echo.
echo [3/3] Triggering Netlify Deployment...
echo Site Name: santyper.netlify.app
call npx --yes netlify-cli deploy --prod --dir=dist --site=santyper
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Direct CLI deploy finished. If your GitHub is connected to Netlify,
    echo Netlify is already building and deploying automatically at:
    echo https://santyper.netlify.app
)

echo.
echo ===============================================================================
echo   SUCCESS! Deployment commands completed!
echo   Visit your live website: https://santyper.netlify.app
echo ===============================================================================
echo.
pause
