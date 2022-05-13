FROM postgres:alpine
ADD TABLES.sql /docker-entrypoint-initdb.d/s1.sql
ADD PROC.sql /docker-entrypoint-initdb.d/s2.sql
ADD TABLES_UPDATE.sql /docker-entrypoint-initdb.d/s3.sql
