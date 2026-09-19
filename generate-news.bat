@echo off
chcp 65001 >nul
cd /d "%~dp0"
node scripts\generate-news.mjs %*
if errorlevel 1 (
  echo 新闻生成失败，请查看上方错误。
  pause
  exit /b 1
)
pause
