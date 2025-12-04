Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "Execution policy updated! Now starting dev server..." -ForegroundColor Green
cd "C:\Time table"
npm run dev
