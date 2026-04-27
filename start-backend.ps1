#!/usr/bin/env pwsh

# Always resolve backend path from this script location.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptDir "backend"

if (-not (Test-Path $backendPath)) {
	Write-Error "Backend folder not found at: $backendPath"
	exit 1
}

# Kill any existing Node processes.
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Navigate to backend and start.
Set-Location -Path $backendPath
Write-Output "Starting backend server from: $backendPath"
& npm start
