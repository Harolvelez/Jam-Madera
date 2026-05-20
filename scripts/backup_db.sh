#!/bin/bash

# Script de backup automático para Jam Maderas
# Mantiene los últimos 5 backups y elimina los más antiguos

# Configuración
BACKUP_DIR="/root/projects/jam-maderas/scripts/backups"
CONTAINER_NAME="jam_mysql"
DB_NAME="jam_madera"
DB_USER="root"
DB_PASS="root"
MAX_BACKUPS=5

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "=== Iniciando backup de Jam Maderas ==="
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"

# Generar nombre del archivo con fecha y hora
BACKUP_FILE="$BACKUP_DIR/jam_madera_backup_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "Creando backup en: $BACKUP_FILE"

# Crear el backup comprimido
docker exec "$CONTAINER_NAME" mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verificar si el backup se creó correctamente
if [ $? -eq 0 ]; then
    echo "✓ Backup creado exitosamente"

    # Obtener tamaño del archivo
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "  Tamaño: $SIZE"
else
    echo "✗ Error al crear el backup"
    exit 1
fi

# Contar backups actuales
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/jam_madera_backup_*.sql.gz 2>/dev/null | wc -l)

echo ""
echo "Backups almacenados: $BACKUP_COUNT"

# Eliminar backups más antiguos si exceden el máximo
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    DELETE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    echo "Eliminando $DELETE_COUNT backup(s) más antiguo(s)..."

    # Listar y eliminar los archivos más antiguos
    ls -1t "$BACKUP_DIR"/jam_madera_backup_*.sql.gz | tail -n "$DELETE_COUNT" | while read file; do
        echo "  Eliminando: $(basename "$file")"
        rm "$file"
    done
fi

echo ""
echo "Backups disponibles actualmente:"
ls -lh "$BACKUP_DIR"/jam_madera_backup_*.sql.gz 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'

echo ""
echo "=== Backup completado ==="