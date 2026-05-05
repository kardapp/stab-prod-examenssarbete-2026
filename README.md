# Planeringsverktyg för produktionsplanering och dimensionering

Detta är ett examensarbete där målet är att bygga en prototyp för ett digitalt planeringsverktyg inom vården.

Prototypen fokuserar på produktionsplanering och dimensionering. Användaren ska kunna planera vårdproduktion och få stöd i att beräkna vilket resursbehov som krävs för att genomföra planen.

## Syfte

Syftet är att minska manuellt administrativt arbete, förenkla inmatning och tydliggöra kopplingen mellan planerad vårdproduktion och behov av personalresurser.

## Teknik

- Next.js
- TypeScript
- Material UI
- PostgreSQL
- node-postgres/pg

## Lokal utveckling

Installera dependencies:

```bash
npm install
```

Skapa `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:PORT/examensarbete_karolinska_db"
```

Starta utvecklingsservern:

```bash
npm run dev
```

## Databas

SQL-filer finns i `database`-mappen:

- `database/schema.sql`
- `database/seed.sql`

## Första MVP

Första versionen fokuserar på:

- Startsida
- Produktionsplanering
- Dimensionering
- Öppenvård
- Enkel beräkning av närvarobehov
- PostgreSQL med mockdata