@echo off
chcp 65001 > nul
color 0B
cls

echo ===============================
echo    تثبيت نظام المسابقات
echo ===============================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"