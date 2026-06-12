# Planeringsverktyg för produktionsplanering och dimensionering

Detta är ett examensarbete där målet är att bygga en prototyp för ett digitalt planeringsverktyg inom vården.

Prototypen fokuserar på produktionsplanering och dimensionering. Användaren ska kunna planera vårdproduktion och få stöd i att beräkna vilket resursbehov som krävs.

## Syfte

Syftet är att minska manuellt administrativt arbete, förenkla inmatning och tydliggöra kopplingen mellan planerad vårdproduktion och behov av personalresurser.

## Teknik

- Next.js
- TypeScript
- Material UI
- PostgreSQL
- node-postgres/pg

## Lokal utveckling

### Förutsättningar
Du behöver ha installerat:
- **Node.js** (version 18 eller senare) - [Ladda ner här](https://nodejs.org/)
- **PostgreSQL** - [Ladda ner här](https://www.postgresql.org/download/)

### Steg-för-steg setup

#### 1. Klona och installera
```bash
git clone https://github.com/Asplund1/Examensarbete.git
cd examensarbete-karolinska
npm install
```

#### 2. Skapa databasen
Öppna en terminal och kör:
```bash
createdb examensarbete_karolinska_db
```

Eller om du behöver ange en användare:
```bash
createdb -U postgres examensarbete_karolinska_db
```

#### 3. Initiera databasen med schema och data
Kör dessa kommandon i samma terminal:
```bash
psql -d examensarbete_karolinska_db -f database/schema.sql
psql -d examensarbete_karolinska_db -f database/seed.sql
```

Om du använder en annan PostgreSQL-användare:
```bash
psql -U postgres -d examensarbete_karolinska_db -f database/schema.sql
psql -U postgres -d examensarbete_karolinska_db -f database/seed.sql
```

#### 4. Konfigurera miljövariabler
Kopiera `.env.example` till `.env.local`:
```bash
cp .env.example .env.local
```

Öppna `.env.local` och uppdatera med dina PostgreSQL-uppgifter:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/examensarbete_karolinska_db"
```

Byt `PASSWORD` till ditt PostgreSQL-lösenord.

#### 5. Starta utvecklingsservern
```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Databas

SQL-filerna för databaskonfiguration finns här:
- `database/schema.sql` - Skapar tabeller och struktur
- `database/seed.sql` - Fyller databasen med testdata