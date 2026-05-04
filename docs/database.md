# Databas

Projektet använder PostgreSQL.

## Lokal databas

Databasnamn:

examensarbete_karolinska_db

## Anslutning

Anslutningen sker via miljövariabeln DATABASE_URL i .env.local.

Exempel:

DATABASE_URL="postgresql://USER:PASSWORD@localhost:PORT/examensarbete_karolinska_db"

## SQL-filer

- database/schema.sql skapar tabellerna
- database/seed.sql fyller databasen med testdata

## Första testade API-route

/api/production-plans

Den hämtar produktionsplaner från PostgreSQL och returnerar JSON.
