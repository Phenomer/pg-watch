#!/bin/sh

set -e
set -x

echo 'setup permissions'
chown postgres:postgres /etc/postgresql.conf

chown -R postgres:postgres /var/lib/postgresql/logs
chmod 755 /var/lib/postgresql/logs
echo 'done.'
