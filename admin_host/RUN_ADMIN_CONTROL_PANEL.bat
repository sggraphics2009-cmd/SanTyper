@echo off
title SanTyper Pro - Admin Hosting Control Panel
cls
cd /d "%~dp0"
python deploy_control_panel.py
if %errorlevel% neq 0 (
    python3 deploy_control_panel.py
)
pause
