$root=(Get-Location).Path
$expectedNode=Join-Path $root '.ai-runtime\node\node.exe'
$targets=Get-CimInstance Win32_Process | Where-Object {($_.Name -eq 'node.exe' -and $_.ExecutablePath -eq $expectedNode -and $_.CommandLine -match 'tool[\\/]local.mjs') -or ($_.Name -eq 'python.exe' -and $_.ExecutablePath -eq (Join-Path $root '.ai-runtime\python\python.exe') -and $_.CommandLine.Contains('fashion_ranker.py')) -or ($_.ExecutablePath -and $_.ExecutablePath.StartsWith((Join-Path $root '.ai-runtime\ollama\'),[StringComparison]::OrdinalIgnoreCase))}
foreach($item in $targets){Stop-Process -Id $item.ProcessId -ErrorAction SilentlyContinue}
