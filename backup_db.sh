#!/bin/bash
# Configuración
FECHA=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/opt/backups/db"
CONTAINER_NAME="gestion_postgres"
DB_NAME="gestioncompra"  # Sacado de tu .env [cite: 1]
DB_USER="postgres"

# Crear carpeta si no existe
mkdir -p $BACKUP_DIR

# Ejecutar el dump dentro del contenedor
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$FECHA.sql

# Borrar backups de más de 30 días para no llenar el disco
find $BACKUP_DIR -type f -mtime +30 -delete
