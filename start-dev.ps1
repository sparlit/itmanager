$ErrorActionPreference = "Stop"
$ErrorActionPreference = "SilentlyContinue"

# Check if port 3003 is in use
$portInUse = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "Port 3003 is in use by process ID: $($portInUse.OwningProcess)"
    # Kill any process using port 3003
    Get-NetTCPConnection -LocalPort 3003 | ForEach-Object { 
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
    }
    Start-Sleep -Seconds 2
}

# Start the dev server
Set-Location "E:\myproject\itmanager"
npm run dev
