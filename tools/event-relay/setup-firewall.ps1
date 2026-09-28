# One-time setup: let the two tablets reach the relay through Windows Firewall.
#
# Why: Windows only allows inbound connections on networks it labels
# "Public"/"Private" according to existing rules. On a new travel router or
# hotspot it may label the network differently than at home, and the tablets'
# first connection is then silently blocked.
#
# This opens ONE port (TCP 8787), on every network profile, and only to
# devices on the same local subnet — nothing from the internet can reach it.
#
# Run it once, as Administrator:
#   right-click the Start button -> "Terminal (Admin)" or "PowerShell (Admin)"
#   then:  powershell -ExecutionPolicy Bypass -File .\setup-firewall.ps1
#
# To undo:  Remove-NetFirewallRule -DisplayName "WiggleWoo Word-Tac-Toe relay (TCP 8787)"

$name = "WiggleWoo Word-Tac-Toe relay (TCP 8787)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "This needs Administrator rights. Open PowerShell as Administrator and run it again." -ForegroundColor Yellow
  exit 1
}

if (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue) {
  Write-Host "The firewall rule already exists - nothing to do." -ForegroundColor Green
  exit 0
}

New-NetFirewallRule -DisplayName $name -Direction Inbound -Protocol TCP -LocalPort 8787 `
  -Action Allow -Profile Any -RemoteAddress LocalSubnet | Out-Null
Write-Host "Done. The tablets can now reach the relay on port 8787 (local network only)." -ForegroundColor Green
