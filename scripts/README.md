# Scripts de Backup - Jam Maderas

Esta carpeta contiene scripts automatizados para la gestión de backups de la base de datos.

## 📁 Estructura

```
scripts/
├── backup_db.sh      # Script de backup automático
├── restore_db.sh     # Script de restauración de backups
├── backups/          # Carpeta donde se almacenan los backups
│   └── backup.log    # Log de ejecuciones de backup
└── README.md         # Este archivo
```

## 🔄 Configuración Actual

- **Frecuencia de backup:** Diario a las 3:30 AM
- **Retención:** Máximo 5 backups (se eliminan automáticamente los más antiguos)
- **Base de datos:** jam_madera
- **Contenedor:** jam_mysql

## 📋 Scripts Disponibles

### 1. backup_db.sh
Script de backup automático con rotación de archivos.

**Características:**
- Crea backups comprimidos (.sql.gz)
- Mantiene solo los últimos 5 backups
- Elimina automáticamente los más antiguos
- Genera logs de ejecución

**Uso manual:**
```bash
./scripts/backup_db.sh
```

**Ejecución automática:** Configurado en crontab para ejecutarse diariamente a las 3:30 AM.

### 2. restore_db.sh
Script interactivo para restaurar backups.

**Características:**
- Lista todos los backups disponibles
- Muestra tamaño y fecha de cada backup
- Interfaz interactiva para seleccionar
- Confirmación antes de restaurar

**Uso:**
```bash
./scripts/restore_db.sh
```

## 🔧 Gestión de Backups

### Ver backups disponibles
```bash
ls -lh scripts/backups/
```

### Ver log de backups
```bash
cat scripts/backups/backup.log
```

### Backup manual
```bash
./scripts/backup_db.sh
```

### Restaurar backup
```bash
./scripts/restore_db.sh
```

### Modificar frecuencia de backup
```bash
crontab -e
# Buscar la línea del backup y modificar el horario
```

## 📅 Formato de nombres

Los backups se nombran con el formato:
```
jam_madera_backup_AAAA_MMDD_HHMMSS.sql.gz
```

Ejemplo: `jam_madera_backup_20260520_033000.sql.gz`

## 🛠️ Troubleshooting

### Verificar que el contenedor está corriendo
```bash
docker ps | grep jam_mysql
```

### Verificar conexión a la base de datos
```bash
docker exec -it jam_mysql mysql -uroot -proot jam_madera
```

### Verificar espacio disponible
```bash
df -h
```

### Verificar configuración de crontab
```bash
crontab -l
```

## 📊 Información de conexión

- **Host:** localhost
- **Puerto:** 3307 (desde el host) / 3306 (desde el contenedor)
- **Usuario:** root
- **Contraseña:** root
- **Base de datos:** jam_madera

## 🔐 Notas de seguridad

- Los backups contienen datos sensibles de la empresa
- La carpeta `backups/` debería estar protegida con permisos adecuados
- Considera implementar backups en ubicaciones externas para disaster recovery
- Las contraseñas están en texto plano en los scripts - considera mover a variables de entorno

## 🚀 Próximas mejoras sugeridas

- [ ] Implementar backups en ubicación externa (S3, Google Drive, etc.)
- [ ] Enviar notificaciones por email cuando falla un backup
- [ ] Comprimir backups con mejor ratio de compresión
- [ ] Implementar encriptación de backups
- [ ] Agregar verificación de integridad de backups