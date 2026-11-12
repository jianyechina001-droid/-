@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -Command "& ([scriptblock]::Create([IO.File]::ReadAllText((Join-Path (Get-Location) 'start.ps1'))))"
