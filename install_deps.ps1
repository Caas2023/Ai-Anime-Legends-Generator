Write-Host "Starting npm install..."
npm install > install.log 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed with code $LASTEXITCODE"
    exit $LASTEXITCODE
}
Write-Host "npm install completed successfully."
