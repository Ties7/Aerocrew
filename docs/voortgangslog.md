# Voortgangslog, Aerocrew

Logboek van gebouwde functionaliteit, gebaseerd op de echte issue en PR geschiedenis in GitHub.

## Week van 15 augustus, projectstart
- Briefing/debriefing met opdrachtgever Justin doorlopen en akkoord gekregen (issue #1). Vastgelegd: communicatie verloopt via mail met Matthijs als vast aanspreekpunt, tussentijdse review gepland op donderdag 20 augustus 11:00, eindreview op woensdag 26 augustus 11:00.
- Astro project setup (issue #2)
- Shopify Storefront API-koppeling opgezet: env-variabelen voor domein/token, centrale `shopifyFetch()` functie (issue #3 / PR #4). Onderbouwde keuze om error handling voorlopig generiek te houden, bewust besproken met Matthijs, tot inloggen wordt toegevoegd.
- Design afgerond en akkoord van opdrachtgever (issue #5, door Matthijs): clean/aviation stijl, JOST als vervangend font, styleguide, sitemap, wireflow en components uitgewerkt.

## Rond 17 augustus
- Homepage en productoverzicht gebouwd met echte Shopify data in plaats van ruwe JSON (issue #6 / PR #13). Placeholder afbeelding toegevoegd voor producten zonder foto. Bug (ontbrekende .env bij Matthijs) samen opgelost; discussie over scheiding van styling scope tussen PR's.
- Productdetailpagina gestart (issue #14): zelfde placeholder principe toegepast.

## Rond 19 augustus
- Productdetailpagina afgerond (PR #15). Matthijs geeft gerichte code review op drie punten (placeholder styling, alt tekst zonder titel, dubbele data fetch via `getStaticPaths`/`getProductByHandle`); alle drie verwerkt in vervolgcommits (`fix: alt fallback`, `refactor: pass product data via getStaticPaths props`).
- Cart: variant selectie en toevoegen aan winkelwagen (issue #16 / PR #18). Technische discussie met Matthijs over een Shopify API blocker (`userErrors` niet beschikbaar op het gebruikte mutation type) en hoe dat op te lossen.

## Rond 20-21 augustus
- Cart winkelwagenpagina met aanpassen/verwijderen en checkout gebouwd (issue #19 / PR #20). End to end getest met een echte testbetaling via Shopify's Bogus Gateway, bevestigd zowel op de eigen bevestigingspagina als in Shopify's eigen bestellingenoverzicht.
- PR #20 gereviewd en gemerged door Matthijs, met inline toelichting op eigen keuzes (removeCartLine vs updateCartLine, bewuste volledige cart refetch).

## 22 augustus — vandaag
- Projectboard opgeschoond.
- Matthijs stelt een vaste issue conventie voor (user story / acceptatiecriteria / definition of done) als GitHub issue templates: gecontroleerd, goedgekeurd en gemerged (PR #21).
- Los overleg opgestart met opdrachtgever Justin (zie overleg-log.md) om ook zelf direct contact te documenteren, naast de eerder geplande tussentijdse/eindreview met Matthijs als aanspreekpunt.