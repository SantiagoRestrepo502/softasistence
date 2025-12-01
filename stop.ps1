# Script para Detener - Sistema de Asistencia SENA
# Este script detiene todos los servicios Docker

Write-Host "🛑 Deteniendo Sistema de Asistencia SENA..." -ForegroundColor Yellow
Write-Host ""

# Detener y eliminar contenedores
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Servicios detenidos correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Nota: Los datos de la base de datos se mantienen" -ForegroundColor Cyan
    Write-Host "   Para eliminar también los datos, usa:" -ForegroundColor Cyan
    Write-Host "   docker-compose down -v" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error al detener los servicios" -ForegroundColor Red
    exit 1
}
