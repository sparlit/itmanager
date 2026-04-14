$env:PORT = "3003"
$ErrorActionPreference = "SilentlyContinue"
# Kill any existing process on port 3003
$existing = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue
if ($existing) {
    Stop-Process -Id $existing.OwningProcess.Id -Force -ErrorAction SilentlyContinue
}
# Start the dev server
node "E:\myproject\itmanager\.next\standalone\server.js"