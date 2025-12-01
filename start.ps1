# Script de Inicio Rápido - Sistema de Asistencia SENA
# Este script inicia todos los servicios usando Docker

Write-Host "🚀 Iniciando Sistema de Asistencia SENA..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker está ejecutándose
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker no está ejecutándose" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker está instalado y ejecutándose" -ForegroundColor Green
Write-Host ""

# Detener contenedores existentes si los hay
Write-Host "🔄 Deteniendo contenedores existentes (si los hay)..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host ""
Write-Host "📦 Construyendo e iniciando servicios..." -ForegroundColor Cyan
Write-Host "Esto puede tomar varios minutos la primera vez..." -ForegroundColor Yellow
Write-Host ""

# Iniciar servicios
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Servicios iniciados correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📱 Accede a la aplicación en:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Frontend:  http://localhost:8080" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:3000" -ForegroundColor White
    Write-Host "   MySQL:     localhost:3307" -ForegroundColor White
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Ver estado de los contenedores:" -ForegroundColor Yellow
    Write-Host "   docker-compose ps" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Ver logs:" -ForegroundColor Yellow
    Write-Host "   docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Detener servicios:" -ForegroundColor Yellow
    Write-Host "   docker-compose down" -ForegroundColor White
    Write-Host ""
    
    # Esperar un momento para que los servicios se inicien
    Write-Host "⏳ Esperando que los servicios se inicien completamente..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "🔍 Estado de los contenedores:" -ForegroundColor Cyan
    docker-compose ps
    
} else {
    Write-Host ""
    Write-Host "❌ Error al iniciar los servicios" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
