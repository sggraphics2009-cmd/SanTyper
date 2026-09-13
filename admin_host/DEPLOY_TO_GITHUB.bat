@echo off
title SanTyper Pro - GitHub Sync & Push Tool
color 0a
cls

echo ===============================================================================
echo   SANTYPER PRO - GITHUB REPOSITORY SYNC TOOL
echo   Author: Sanchitha Charunya
echo ===============================================================================
echo.

cd /d "%~dp0\.."

git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing Git repository...
    git init
    git branch -M main
)

git remote -v
echo.
set /p REPO_CHOICE="Do you want to set or update your GitHub Remote URL? (y/N): "
if /i "%REPO_CHOICE%"=="y" (
    set /p NEW_URL="Enter GitHub Repo URL (e.g. https://github.com/anurailangasingha/santyper.git): "
    git remote remove origin >nul 2>&1
    git remote add origin %NEW_URL%
)

echo.
echo Staging all changes...
git add -A

set /p MSG="Enter commit message (Leave empty for auto timestamp): "
if "%MSG%"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    set MSG=Update SanTyper Suite - %mydate% %mytime%
)

git commit -m "%MSG%"

echo.
echo Pushing to GitHub (main branch)...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo Trying force push with lease...
    git push origin main --force-with-lease
)

echo.
echo ===============================================================================
echo   GitHub sync complete!
echo ===============================================================================
echo.
pause
