# Check for BOM in staged files
Write-Host "Checking for BOM in staged files..."

$stagedFiles = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match "\.(js|ts|json|md|mjs)$" }

foreach ($file in $stagedFiles) {
    if (Test-Path $file) {
        $bytes = Get-Content -Path $file -Encoding Byte -TotalCount 3
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {
            Write-Host "ERROR: BOM detected in $file" -ForegroundColor Red
            Write-Host "Please remove BOM from the file before committing." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "No BOM detected in staged files." -ForegroundColor Green
npx lint-staged
