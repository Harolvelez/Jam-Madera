# Certificados SSL - Jam Maderas

Esta carpeta contiene los scripts para la gestión automática de certificados SSL del proyecto.

## 📁 Archivos

- `renew-ssl.sh` - Script de renovación automática de certificados SSL

## 🔧 Configuración

### Certificado Actual
- **Dominio**: vision.jammaderas.com
- **Ubicación certificados**: /etc/letsencrypt/live/vision.jammaderas.com/
- **Válido hasta**: 20 de julio de 2026

### Renovación Automática
El script se ejecuta automáticamente todos los días a las 3:00 AM mediante cron.

**Cron job:**
```bash
0 3 * * * /root/projects/jam-maderas/scripts/certificados_ssl/renew-ssl.sh
```

## 📋 Comandos Útiles

### Verificar estado de certificados
```bash
certbot certificates
```

### Ejecutar renovación manualmente
```bash
./scripts/certificados_ssl/renew-ssl.sh
```

### Ver logs de renovación
```bash
cat /var/log/ssl-renewal.log
```

### Ver cron job configurado
```bash
crontab -l
```

### Recargar nginx manualmente
```bash
docker exec jam_nginx nginx -s reload
```

## 🔍 Funcionamiento del Script

1. **Verifica**: Certbot verifica si los certificados necesitan renovación (faltan menos de 30 días)
2. **Renueva**: Si es necesario, renueva los certificados automáticamente
3. **Recarga**: Reinicia nginx para aplicar los nuevos certificados
4. **Registra**: Guarda un log en `/var/log/ssl-renewal.log`

## 📝 Notas

- Los certificados Let's Encrypt son válidos por 90 días
- Se recomienda renovarlos automáticamente antes de los 30 días de vencimiento
- El script maneja automáticamente todo el proceso de renovación
- No requiere intervención manual una vez configurado