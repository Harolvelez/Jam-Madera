#!/bin/bash
# Script de renovación automática de certificados SSL con Certbot
# Jam Maderas - vision.jammaderas.com

# Rutas y configuración
PROJECT_DIR="/root/projects/jam-maderas"
LOG_FILE="/var/log/ssl-renewal.log"
EMAIL="admin@jammaderas.com"  # Cambiar por tu email real

echo "=== $(date) === Iniciando renovación de certificados SSL" >> $LOG_FILE

# Intentar renovar los certificados (solo se renovan si faltan menos de 30 días)
certbot renew --quiet --no-self-upgrade 2>&1 >> $LOG_FILE

# Verificar si la renovación fue exitosa
if [ $? -eq 0 ]; then
    echo "✓ Certificados renovados exitosamente" >> $LOG_FILE

    # Recargar nginx para aplicar los nuevos certificados
    docker exec jam_nginx nginx -s reload 2>&1 >> $LOG_FILE

    if [ $? -eq 0 ]; then
        echo "✓ Nginx recargado exitosamente" >> $LOG_FILE
    else
        echo "✗ Error al recargar nginx" >> $LOG_FILE
    fi
else
    echo "✗ Error al renovar certificados o no necesitan renovación" >> $LOG_FILE
fi

echo "=== $(date) === Renovación finalizada" >> $LOG_FILE
echo "" >> $LOG_FILE

exit 0