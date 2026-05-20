#!/bin/bash

# Script de restauración de backups para Jam Maderas

BACKUP_DIR="/root/projects/jam-maderas/scripts/backups"
CONTAINER_NAME="jam_mysql"
DB_NAME="jam_madera"
DB_USER="root"
DB_PASS="root"

echo "=== Restauración de Backup Jam Maderas ==="
echo ""

# Listar backups disponibles
echo "Backups disponibles:"
echo ""

BACKUPS=($(ls -1t "$BACKUP_DIR"/jam_madera_backup_*.sql.gz 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "No hay backups disponibles en: $BACKUP_DIR"
    exit 1
fi

for i in "${!BACKUPS[@]}"; do
    BACKUP_FILE="${BACKUPS[$i]}"
    BACKUP_NAME=$(basename "$BACKUP_FILE")
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" | cut -d' ' -f1,2 | cut -d'.' -f1)

    echo "$((i+1)). $BACKUP_NAME"
    echo "   Tamaño: $BACKUP_SIZE | Fecha: $BACKUP_DATE"
    echo ""
done

# Solicitar selección
read -p "Selecciona el número del backup a restaurar (o 'q' para cancelar): " selection

if [[ "$selection" == "q" || "$selection" == "Q" ]]; then
    echo "Operación cancelada"
    exit 0
fi

if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#BACKUPS[@]} ]; then
    echo "Selección inválida"
    exit 1
fi

# Obtener el archivo seleccionado
SELECTED_BACKUP="${BACKUPS[$((selection-1))]}"

echo ""
echo "Has seleccionado: $(basename "$SELECTED_BACKUP")"
echo ""
echo "⚠️  ADVERTENCIA: Esto sobrescribirá todos los datos actuales de la base de datos '$DB_NAME'"
read -p "¿Estás seguro de que deseas continuar? (s/n): " confirm

if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo "Restaurando backup..."

# Restaurar el backup
gunzip < "$SELECTED_BACKUP" | docker exec -i "$CONTAINER_NAME" mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✓ Backup restaurado exitosamente"
    echo ""
    echo "Base de datos '$DB_NAME' ha sido restaurada"
else
    echo "✗ Error al restaurar el backup"
    exit 1
fi

echo ""
echo "=== Restauración completada ==="