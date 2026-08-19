#!/bin/bash
FECHA=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/opt/backups/pdfs"
# Docker guarda los volúmenes nombrados en esta ruta por defecto en Debian
SOURCE_DIR="/var/lib/docker/volumes/vn-gestion-de-compra_pdf_data/_data"

mkdir -p $BACKUP_DIR

# Comprimir los archivos para ahorrar espacio
tar -czf $BACKUP_DIR/pdfs_$FECHA.tar.gz -C $SOURCE_DIR .

# Borrar backups viejos
find $BACKUP_DIR -type f -mtime +30 -delete

