# Produktionsplanering öppenvård

Första produktionsplaneringssidan utgår från en vald ekonomisk kombika.
Användaren skapar en produktionsplan för kombikan och systemet bryter ner en
huvudvolym med procentuella fördelningar.

## Flöde

1. Välj ekonomisk kombika.
2. Ange dag/datum och antal vårdhändelser.
3. Fördela vårdhändelser procentuellt på SLL/UULP, akut/elektivt och yrkeskategorier.
4. Ange snitt-tid per besök.
5. Ange DRG-snitt för SLL och UULP.
6. Visa jämförelsevärden som stöddata.
7. Visa beräknade värden och spara planen.
8. Gå vidare till OO-fördelning eller dimensionering.

## Huvudregel

Antal vårdhändelser är huvudvolymen. SLL/UULP, akut/elektivt och
yrkeskategorier är procentuella nedbrytningar av samma volym. Snitt-tid per
besök och DRG-snitt är egna planeringsvärden.

## Beräkningar

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

## Kodstruktur

Sidan renderas av `OutpatientProductionView`. Formulärstate ligger i
`use-outpatient-production-form.ts`, rena beräkningar i
`outpatient-production-calculations.ts`, validering i
`outpatient-production-validation.ts` och dropdown-/mockdata i
`outpatient-production-options.ts`.
