# Produktionsplanering öppenvård

Första versionen fokuserar på inmatning av produktion per ekonomisk kombika i öppenvård.

## Innehåll i vyn

- Inmatningsformulär för produktionsrader
- Redigerbar lista över inmatade produktionsrader
- Antal vårdtillfällen
- Snitt-tid per besök
- DRG-snitt
- Jämförelsevärden
- Knappar för att gå vidare:
  - Fördela till OO
  - Gå till Dimensionering

## Innehållslogik

- Sektionschef/controller kan lägga till och redigera produktionsrader.
- Varje produktionsrad kopplas till ekonomisk kombika, dag/datum, yrkeskategori, sekundär yrkeskategori, SLL/UULP, akut/elektivt, typ av besök, snitt-tid och DRG-snitt.
- Antal vårdtillfällen visas per yrkeskategori, inklusive sekundär yrkeskategori, per dag, per SLL/UULP och per akut/elektivt.
- Snitt-tid per besök visas kopplat till typ av besök, exempelvis nybesök och återbesök.
- DRG-snitt visas per SLL/UULP.
- Jämförelsevärden visas som stöddata: föregående års plan, utfall R12 och utfall föregående år.
- Sammanfattningskorten är inte manuella inputfält utan räknas från produktionsraderna.

## Underlag till dimensionering

Första sidan är inte en dimensioneringssida, men fälten är strukturerade så att dimensionering senare kan använda dem.

Viktiga fält är:

- antal vårdtillfällen
- yrkeskategori
- snitt-tid per besök
- typ av besök
- period/dag
- kombika

Vyn kan visa ett beräknat stödvärde för senare dimensionering:

```text
totalVisitMinutes = visits * averageMinutesPerVisit
drgPoints = visits * drgAverage
presenceNeed = totalVisitMinutes / weeklyWorkingMinutes
weeklyWorkingMinutes = 40 * 60
```

Närvarobehov är alltså beräknat stöddata och ska inte fyllas i manuellt i första öppenvårdsvyn.

Slutenvårdens nyckeltal, till exempel `12 vårdplatser / 4 sjuksköterskor = 3 VPL/SSK`, hör till slutenvård/dimensionering och ska inte blandas in i denna sida.

## Nästa val

Användaren kan antingen fördela vårdtillfällen till OO eller gå direkt vidare till dimensionering.

## Ingår inte i denna vy

- Full OO-fördelning
- Resultatberäkningar för hela produktionsplanen
- Slutenvård
- Ingrepp
- Radiologi
- Flerårsprognos
