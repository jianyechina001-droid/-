function Get-LocalInfo {
 $request=[Net.WebRequest]::Create('http://127.0.0.1:4175/api/portable-info')
 $request.Proxy=$null
 $request.Timeout=1500
 $response=$request.GetResponse()
 try {
  $reader=New-Object IO.StreamReader($response.GetResponseStream())
  try { $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
 } finally { $response.Dispose() }
}
$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$nodeExe=Join-Path $root '.ai-runtime\node\node.exe'
try {
 if(-not(Test-Path -LiteralPath $nodeExe)){throw 'Missing runtime. Copy the entire folder before starting.'}
 $ready=$false
 try {$info=Get-LocalInfo; if($info.app -ne 'kuanyan-portable-v1'){throw 'Port conflict'};$ready=$true}catch{}
 if(-not $ready){
  New-Item -ItemType Directory -Path (Join-Path $root '.local-data') -Force | Out-Null
  $process=Start-Process -FilePath $nodeExe -ArgumentList ([char]34+(Join-Path $root 'tool\local.mjs')+[char]34) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root '.local-data\server.stdout.log') -RedirectStandardError (Join-Path $root '.local-data\server.stderr.log') -PassThru
  $process.Id | Set-Content (Join-Path $root '.local-data\server.pid')
  for($attempt=0;$attempt -lt 40;$attempt++){Start-Sleep -Milliseconds 500;try{$info=Get-LocalInfo;if($info.app -eq 'kuanyan-portable-v1'){$ready=$true;break}}catch{}}
 }
 if(-not $ready){throw 'Cannot start. See .local-data/server.stderr.log. Check that port 4175 is free.'}
 if (-not $env:KUANYAN_NO_BROWSER) { Start-Process 'http://127.0.0.1:4175/' }
}catch{Write-Host $_.Exception.Message;Read-Host 'Press Enter to close'}
