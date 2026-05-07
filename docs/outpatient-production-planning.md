# Produktionsplanering öppenvård

Första versionen fokuserar på en tydlig MVP-vy för Vårdhändelser Öppenvård.

## Ingår i vyn

- Antal vårdtillfällen
- Snitt-tid per besök
- DRG-snitt
- Jämförelsevärden
- Knappar för nästa steg:
  - Fördela till OO-mottagningar
  - Gå till Dimensionering

## Datakategorier

- Användarens planering: antal vårdtillfällen per yrkeskategori, vecka, SLL/UULP och akut/elektivt
- Stödvärden: snitt-tid per besök och DRG-snitt
- Jämförelsedata: plan föregående år, utfall R12 och utfall föregående år
- Nästa steg: fördelning till OO-mottagningar och dimensionering

## Ingår inte i denna MVP-vy

- Stor Excel-liknande tabell
- Extra summeringssektioner
- Redigering av befintliga celler
- Full periodisering vecka 1-52
- Slutenvård
- Dimensioneringsvy
- Ingrepp
- Radiologi
- Flerårsprognos

## Kod

- Sid-specifik UI ligger i `src/app/production/_components`.
- Data hämtas från `src/app/api/outpatient-production-rows/route.ts`.
- Beräkningar och konverteringar ligger i `src/lib/calculations/outpatientProductionCalculations.ts`.
