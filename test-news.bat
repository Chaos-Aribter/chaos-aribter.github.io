@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0" || exit /b 1
node scripts\test-news.mjs %*
exit /b %errorlevel%
