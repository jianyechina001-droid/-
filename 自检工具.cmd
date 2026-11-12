@echo off
cd /d "%~dp0"
".ai-runtime\node\node.exe" tool\portable-check.mjs
pause
