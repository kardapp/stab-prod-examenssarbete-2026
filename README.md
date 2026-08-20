> [!IMPORTANT]
> ## ⚠️ ARKIVERAT REPOSITORY — INGEN AKTIV UTVECKLING ⚠️
>
> **Det här repot är arkiverat och underhålls inte längre.**
>
> Utvecklingen har flyttats till ett internt repository. Ändringar, issues och pull requests
> hanteras inte här. Koden ligger kvar enbart som referens och historik för examensarbetet.
>
> Kontakta projektägaren för åtkomst till det interna repot.

# Planeringsverktyg för produktionsplanering och dimensionering

Det här projektet är ett examensarbete och en prototyp

Målet är att göra det enklare att planera vårdproduktion, bryta ner planerad volym i relevanta fördelningar och se vilket resursbehov som behövs för bemanning och dimensionering.

## Innehåll

- [Syfte](#syfte)
- [Teknik](#teknik)
- [Snabbstart](#snabbstart)
- [Databas](#databas)
- [Projektstruktur](#projektstruktur)
- [Viktiga routes](#viktiga-routes)
- [Produktionsplanering öppenvård](#produktionsplanering-öppenvård)
- [Vanliga kommandon](#vanliga-kommandon)

## Syfte

Syftet är att minska manuellt administrativt arbete, förenkla inmatning och tydliggöra kopplingen mellan planerad vårdproduktion och behov av personalresurser.

Prototypen fokuserar på två huvudområden i både öppenvård och slutenvård:

- Produktionsplanering: användaren planerar vårdvolymer och fördelningar.
- Dimensionering: systemet använder produktionsunderlaget för att beräkna resurs- och närvarobehov.

## Teknik

- Next.js
- React
- TypeScript
- Material UI
- PostgreSQL
- node-postgres/pg

## Snabbstart

### Förutsättningar

Installera:

- Node.js, version 18 eller senare
- PostgreSQL

### 1. Installera beroenden

```bash
npm install
```

### 2. Skapa lokal databas

```bash
createdb examensarbete_karolinska_db
```

Om du behöver ange PostgreSQL-användare:

```bash
createdb -U postgres examensarbete_karolinska_db
```

### 3. Initiera databasen

```bash
psql -d examensarbete_karolinska_db -f database/schema.sql
psql -d examensarbete_karolinska_db -f database/seed.sql
```

Om du behöver ange PostgreSQL-användare:

```bash
psql -U postgres -d examensarbete_karolinska_db -f database/schema.sql
psql -U postgres -d examensarbete_karolinska_db -f database/seed.sql
```

### 4. Konfigurera miljövariabler

Kopiera `.env.example` till `.env.local` och uppdatera anslutningen:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/examensarbete_karolinska_db"
```

Byt `PASSWORD` till ditt lokala PostgreSQL-lösenord.

### 5. Starta appen

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Databas

Projektet använder PostgreSQL.

Lokal databas:

```text
examensarbete_karolinska_db
```

Databasanslutningen läses från `DATABASE_URL` i `.env.local`.

SQL-filerna finns i `database`:

- `database/schema.sql` skapar tabeller och struktur.
- `database/seed.sql` fyller databasen med testdata.

Första API-routen som användes för databastest är:

```text
/api/production-plans
```

Den hämtar produktionsplaner från PostgreSQL och returnerar JSON.

## Projektstruktur

Den övergripande modellen är:

```text
src/app       Next.js-routes och API-routes
src/features  Domänlogik och vyer för olika delar av appen
src/shared    Återanvändbara komponenter, typer, tema, routes och helpers
src/lib       Teknisk infrastruktur, till exempel databasklient
database      SQL-schema och seed-data
public        Statiska filer
```

### `src/app`

`src/app` innehåller routes. Filerna här ska helst vara tunna och bara koppla en URL till rätt feature-vy.

Exempel:

- `src/app/outpatient/production-planning/page.tsx`
- `src/app/outpatient/dimensioning/page.tsx`
- `src/app/api/production-plans/route.ts`

I Next.js ska route-filer heta `page.tsx` och API-filer heta `route.ts`. Därför är de filnamnen generiska.

### `src/features`

`src/features` innehåller själva funktionaliteten. Varje större område har en egen feature-mapp.

Exempel:

- `src/features/outpatient-production`
- `src/features/outpatient-dimensioning`
- `src/features/inpatient`

Vanliga undermappar:

- `views`: hela sidor eller containers som används av routes i `src/app`.
- `sections`: större delar inne på en vy, till exempel formulärsektioner eller resultattabeller.
- `components`: mindre återanvändbara komponenter inom samma feature.
- `hooks`: React-hooks och state-logik.
- `utils`: beräkningar, formattering och annan ren logik.
- `types`: TypeScript-typer för featuren.
- `constants`: val, mockdata och grundvärden.

När ny kod läggs till: börja i rätt feature under `src/features`. Flytta bara kod till `src/shared` när samma kod faktiskt används av flera features.

### `src/shared`

`src/shared` innehåller sådant som används på flera ställen:

- gemensamma komponenter
- gemensamma typer
- routes
- tema
- generella hjälpfunktioner

### `src/lib`

`src/lib` innehåller teknisk infrastruktur. Databasklienten ligger här:

```text
src/lib/db/client.ts
```

API-routes importerar den som:

```ts
import { db } from "@/lib/db/client";
```

## Viktiga routes

Startsida:

```text
/
```

Öppenvård:

```text
/outpatient/production-planning
/outpatient/production-planning/oo-distribution
/outpatient/production-planning/results
/outpatient/dimensioning
/outpatient/dimensioning/oo
/outpatient/dimensioning/results
```

Slutenvård:

```text
/inpatient/production-planning
/inpatient/production-planning/oo-distribution
/inpatient/production-planning/results
/inpatient/dimensioning
/inpatient/dimensioning/oo
/inpatient/dimensioning/results
```

API:

```text
/api/production-plans
/api/outpatient-production-rows
/api/outpatient-oo-distributions
/api/outpatient-dimensioning-me-rows
```

Gamla URL:er finns kvar som redirects i `next.config.ts`, så äldre länkar ska fortfarande fungera.

## Produktionsplanering öppenvård

Produktionsplanering för öppenvård utgår från en vald ekonomisk kombika.

Användaren skapar en produktionsplan för kombikan och systemet bryter ner en huvudvolym med procentuella fördelningar.

### Flöde

1. Välj ekonomisk kombika.
2. Ange antal vårdhändelser.
3. Fördela vårdhändelser procentuellt på SLL/UULP.
4. Fördela vårdhändelser procentuellt på akut/elektivt.
5. Fördela vårdhändelser procentuellt på yrkeskategorier.
6. Ange snittid per besök.
7. Ange DRG-snitt.
8. Visa beräknade värden och jämförelsevärden.
9. Spara produktionsplanen.
10. Gå vidare till OO-fördelning eller dimensionering.

### Huvudregel

Antal vårdhändelser är huvudvolymen.

SLL/UULP, akut/elektivt och yrkeskategorier är procentuella nedbrytningar av samma volym. Snittid per besök och DRG-snitt är egna planeringsvärden.

### Beräkningar

```text
antalSll = careEvents * sllPercentage / 100
antalUulp = careEvents * uulpPercentage / 100
antalAkut = careEvents * acutePercentage / 100
antalElektiv = careEvents * electivePercentage / 100
antalPerYrkeskategori = careEvents * rolePercentage / 100
besokstid = careEvents * averageMinutesPerVisit
drgSll = antalSll * drgAverageSll
drgUulp = antalUulp * drgAverageUulp
totalDrg = drgSll + drgUulp
```

### Kodstruktur för öppenvårdsplanering

Vyn renderas av:

```text
src/features/outpatient-production/views/outpatient-production-view.tsx
```

Formulärstate ligger i:

```text
src/features/outpatient-production/hooks/use-outpatient-production-form.ts
```

Resultatlogik ligger i:

```text
src/features/outpatient-production/hooks/use-outpatient-production-results.ts
src/features/outpatient-production/utils/outpatient-production-results-calculations.ts
```

Rena beräkningar ligger i:

```text
src/features/outpatient-production/utils/outpatient-production-calculations.ts
```

Validering ligger i:

```text
src/features/outpatient-production/utils/outpatient-production-validation.ts
```

Dropdown-val och grunddata ligger i:

```text
src/features/outpatient-production/constants/outpatient-production-options.ts
```

## Vanliga kommandon

Starta utvecklingsserver:

```bash
npm run dev
```

Kör lint:

```bash
npm run lint
```

Bygg appen:

```bash
npm run build
```

Starta byggd app:

```bash
npm run start
```
