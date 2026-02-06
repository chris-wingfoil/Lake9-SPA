# Quick Fix Script for signInWithRedirect Error

Write-Host "?? Fixing signInWithRedirect error..." -ForegroundColor Cyan
Write-Host ""

# Stop any running dev server
Write-Host "1?? Stopping any running dev server..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "? Stopped" -ForegroundColor Green
} catch {
    Write-Host "?? No running dev server found" -ForegroundColor Gray
}
Write-Host ""

# Clear Vite cache
Write-Host "2?? Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "? Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "?? No Vite cache found" -ForegroundColor Gray
}
Write-Host ""

# Clear dist folder
Write-Host "3?? Clearing dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "? Dist cleared" -ForegroundColor Green
} else {
    Write-Host "?? No dist folder found" -ForegroundColor Gray
}
Write-Host ""

# Rebuild
Write-Host "4?? Building fresh..." -ForegroundColor Yellow
npm run build
Write-Host ""

Write-Host "? All done!" -ForegroundColor Green
Write-Host ""
Write-Host "?? Next steps:" -ForegroundColor Cyan
Write-Host "   1. Clear browser cache (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor White
Write-Host "   3. Try sign-in - popup should open!" -ForegroundColor White
Write-Host ""
Write-Host "?? If still broken:" -ForegroundColor Yellow
Write-Host "   - Try incognito/private browser window" -ForegroundColor White
Write-Host "   - See: docs/FIXED_SIGNIN_ERROR.md" -ForegroundColor White
