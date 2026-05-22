# PowerShell script for creating branches and pushing with custom messages
# Usage: .\push-with-branch.ps1

param(
    [string]$CommitMessage = ""
)

# If no message provided, prompt user
if (-not $CommitMessage) {
    $CommitMessage = Read-Host "Enter custom commit message"
    
    if (-not $CommitMessage) {
        Write-Host "❌ No message provided. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Clean up branch name: remove special chars, replace spaces with hyphens, convert to lowercase
$BranchName = $CommitMessage `
    -replace '[^a-zA-Z0-9\s\-]', '' `
    -replace '\s+', '-' `
    -replace '-+', '-' `
    -replace '^-|-$', '' `
    | ForEach-Object { $_.ToLower() }

# Ensure branch name is not too long
if ($BranchName.Length -gt 50) {
    $BranchName = $BranchName.Substring(0, 50)
}

# Add timestamp to make it unique
$TimeStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$FinalBranchName = "$BranchName-$TimeStamp"

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📦 PUSH WITH BRANCH WORKFLOW" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commit Message: $CommitMessage" -ForegroundColor Yellow
Write-Host "Branch Name:    $FinalBranchName" -ForegroundColor Yellow
Write-Host ""

# Get current branch to switch back later
$CurrentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current Branch: $CurrentBranch" -ForegroundColor Gray

# Create and checkout new branch
Write-Host ""
Write-Host "🌿 Creating new branch..." -ForegroundColor Cyan
git checkout -b $FinalBranchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create branch" -ForegroundColor Red
    exit 1
}

# Stage all changes
Write-Host "📝 Staging changes..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to stage changes" -ForegroundColor Red
    exit 1
}

# Commit with custom message
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit" -ForegroundColor Red
    exit 1
}

# Push to new branch
Write-Host "🚀 Pushing to new branch..." -ForegroundColor Cyan
git push -u origin $FinalBranchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push" -ForegroundColor Red
    exit 1
}

# Switch back to main and merge
Write-Host "🔄 Merging back to main..." -ForegroundColor Cyan
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Failed to checkout main" -ForegroundColor Yellow
    exit 1
}

git merge $FinalBranchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Merge conflict detected. Manual resolution required." -ForegroundColor Yellow
    Write-Host "   Branch: $FinalBranchName is ready on GitHub" -ForegroundColor Gray
    exit 1
}

# Push main
Write-Host "🚀 Pushing main branch..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Failed to push main" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ SUCCESS!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:"
Write-Host "  • Branch Created:  $FinalBranchName" -ForegroundColor Green
Write-Host "  • Commit Message:  $CommitMessage" -ForegroundColor Green
Write-Host "  • Pushed to:       origin/$FinalBranchName" -ForegroundColor Green
Write-Host "  • Merged to:       main" -ForegroundColor Green
Write-Host ""
Write-Host "View on GitHub: https://github.com/itsmywall05-bit/projectx-vercel/tree/$FinalBranchName" -ForegroundColor Cyan
Write-Host ""
