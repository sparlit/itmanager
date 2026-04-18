#!/bin/bash
# POSTGRESQL PITR (POINT-IN-TIME RECOVERY) BACKUP SCRIPT (FOSS: WAL-G)
# Destination: MinIO / S3 Compatible Storage

# 1. Environment Configuration
export WALE_S3_PREFIX="s3://laundry-backups/postgresql"
export AWS_ACCESS_KEY_ID="minio_admin"
export AWS_SECRET_ACCESS_KEY="minio_secret_key"
export AWS_ENDPOINT="http://localhost:9000"
export PGHOST="localhost"

# 2. Daily Base Backup (Full Snapshot)
echo "[$(date)] Starting Daily Base Backup..."
wal-g backup-push /var/lib/postgresql/data

# 3. Cleanup Old Backups (Keep last 7 days)
echo "[$(date)] Cleaning up old backups..."
wal-g delete retain FULL 7 --confirm

# 4. Continuous Archiving (Handled by Postgres postgresql.conf)
# archive_command = 'wal-g wal-push %p'
# archive_mode = on

echo "[$(date)] Backup Cycle Completed Successfully."
