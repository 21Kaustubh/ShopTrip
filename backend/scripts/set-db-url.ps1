# Prompt securely for Neon PostgreSQL connection string without echoing to console or history
param()

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
    Write-Error "backend/.env file not found at $envFile"
    exit 1
}

# Check if a valid DATABASE_URL is already configured
$currentLines = Get-Content $envFile
$existingLine = $currentLines | Where-Object { $_ -match '^DATABASE_URL=' }
if ($existingLine -and $existingLine -notmatch 'PASTE_YOUR_NEON' -and $existingLine -match '^DATABASE_URL=["'']?postgres(ql)?://') {
    $confirm = Read-Host "A valid DATABASE_URL is already configured in backend/.env. Overwrite? (y/N)"
    if ($confirm -notmatch '^[yY]') {
        Write-Host "Operation cancelled. Existing DATABASE_URL was preserved."
        exit 0
    }
}

$prompt = "Enter Neon PostgreSQL connection string (input will not be displayed):"
$sec = Read-Host -Prompt $prompt -AsSecureString
if ($null -eq $sec -or $sec.Length -eq 0) {
    Write-Warning "No connection string entered. Operation cancelled."
    exit 1
}

$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
$plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

# 1. Clean whitespace
$plain = $plain.Trim()

# 2. Strip variable prefix if present
$plain = $plain -replace '^(?:export\s+)?DATABASE_URL\s*=\s*', ''
$plain = $plain.Trim()

# 3. Strip surrounding quotes if present
if (($plain.StartsWith('"') -and $plain.EndsWith('"')) -or ($plain.StartsWith("'") -and $plain.EndsWith("'"))) {
    $plain = $plain.Substring(1, $plain.Length - 2).Trim()
}

# 4. Validate protocol
if ($plain -notmatch '^postgres(ql)?://') {
    Write-Error "Invalid format: connection string must start with 'postgresql://' or 'postgres://'."
    exit 1
}

# 5. Update backend/.env safely preserving all other lines and variables
$lines = Get-Content $envFile
$found = $false
$newLines = foreach ($line in $lines) {
    if ($line -match '^DATABASE_URL=') {
        $found = $true
        'DATABASE_URL="' + $plain + '"'
    } else {
        $line
    }
}

if (-not $found) {
    $newLines += 'DATABASE_URL="' + $plain + '"'
}

Set-Content -Path $envFile -Value $newLines -Encoding UTF8
Write-Host "Success: DATABASE_URL saved securely to backend/.env."
