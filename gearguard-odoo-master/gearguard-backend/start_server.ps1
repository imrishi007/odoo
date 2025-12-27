# Start FastAPI Backend Server
Set-Location -Path $PSScriptRoot
Write-Host "Starting server from: $(Get-Location)" -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
