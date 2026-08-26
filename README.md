# Aerocrew

Headless webshop voor Aerocrew, gebouwd met Astro en de Shopify Storefront API. Van productoverzicht tot afgeronde betaling.

**Live:** [https://aerocrew.vercel.app/]

---

## Inhoudsopgave

1. [Over het project](#over-het-project)
2. [Team](#team)
3. [Tech stack & keuzes](#tech-stack--keuzes)
4. [Architectuur](#architectuur)
5. [Project structuur](#project-structuur)
6. [Features](#features)
7. [Shopify Storefront API](#shopify-storefront-api)
8. [Toegankelijkheid](#toegankelijkheid)
9. [Aan de slag](#aan-de-slag)
10. [Omgevingsvariabelen](#omgevingsvariabelen)
11. [Commando's](#commandos)
12. [Development workflow](#development-workflow)
13. [Ontwerp & documentatie](#ontwerp--documentatie)
14. [Testen & validatie](#testen--validatie)

---

## Over het project

Dit is de webshop van Aerocrew. Het project is een volledig zelfgebouwde storefront bovenop Shopify: bezoekers bekijken de collectie, openen een productdetailpagina, kiezen een variant, voegen die toe aan de winkelwagen en rekenen af via Shopify Checkout.

De opdrachtgever wilde de voorkant volledig zelf kunnen vormgeven, maar productbeheer, voorraad en betalingen in Shopify houden. Een standaard Shopify-thema legt de HTML-structuur grotendeels vast, wat botst met de toegankelijkheids- en performance-eisen. Door de Storefront API te gebruiken schrijven we de HTML zelf en houdt de opdrachtgever de admin-omgeving die hij al kent.

---

## Team

Het team werkte samen via een feature branch workflow op GitHub. Per feature werd een issue aangemaakt met een MoSCoW-prioriteit, uitgewerkt op een aparte branch, en via een Pull Request met review gemerged naar `main`.

---

## Tech stack & keuzes

| Technologie | Gebruik | Onderbouwing |
| :--- | :--- | :--- |
| **[Astro 7](https://astro.build)** | Static site framework | Stuurt standaard nul JavaScript naar de browser. Productpagina's worden op build-time statisch gegenereerd, alleen de winkelwagen heeft client-side JavaScript nodig. |
| **[Shopify Storefront API](https://shopify.dev/docs/api/storefront)** (2025-01) | Producten, varianten, winkelwagen en checkout | Geeft volledige vrijheid over de HTML terwijl productbeheer, voorraad en betalingen in Shopify blijven. De opdrachtgever hoeft zijn workflow niet te veranderen. |
| **GraphQL** | Datacommunicatie met Shopify | We vragen per pagina precies de velden op die we nodig hebben, in plaats van complete productobjecten binnen te halen. |
| **JavaScript** | Winkelwagen-interactie | De winkelwagen is de enige interactieve laag. Een framework zou meer JavaScript kosten dan de functionaliteit rechtvaardigt. |
| **CSS** | Styling | Globale reset en basisstijl in `stylesheet.css`, de rest in component-scoped `<style>` blokken zodat stijl niet onbedoeld uitlekt. |
| **`localStorage`** | Onthouden van het cart-ID | De winkelwagen blijft bestaan tussen paginabezoeken zonder dat we sessies server-side hoeven bij te houden. |

---

## Architectuur

Het productoverzicht en de detailpagina's worden op build-time opgehaald via `getAllProducts()` en met `getStaticPaths()` omgezet naar statische routes. De winkelwagen werkt client-side: bij de eerste toevoeging maakt Shopify een cart aan, het cart-ID gaat in `localStorage` en alle vervolgacties gebruiken dat ID. Afrekenen gebeurt op Shopify's eigen checkout, zodat wij geen betaalgegevens verwerken.

Alle API-aanroepen lopen door één `shopifyFetch()`-functie, zodat headers en foutafhandeling op één plek staan en niet per functie herhaald worden.

---

## Project structuur

```
/
├── .github/
│   └── ISSUE_TEMPLATE/           # Templates voor feature- en bugissues
├── public/                       # Statische assets (favicon, afbeeldingen)
├── src/
│   ├── layouts/
│   │   └── layout.astro          # Root layout: <head>, navigatie, stylesheet.css
│   ├── lib/
│   │   └── shopify.js            # Storefront API client + alle queries
│   ├── pages/
│   │   ├── index.astro           # Homepage
│   │   ├── cart.astro            # Winkelwagen
│   │   └── products/
│   │       ├── index.astro       # Productoverzicht
│   │       └── [handle].astro    # Productdetailpagina
│   └── styles/
│       └── stylesheet.css            # Reset & basisstijl
├── .env.example
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

---

## Features

### Productoverzicht (`/products`)

- Alle producten uit Shopify in een responsive grid
- Prijs en titel per product, doorklikken naar de detailpagina op `handle`
- Fallback voor producten zonder afbeelding: een placeholder met `role="img"` en `aria-label`, zodat een screenreader-gebruiker weet dat er een afbeelding ontbreekt in plaats van niets te horen

### Productdetailpagina (`/products/[handle]`)

- Statisch gegenereerd per product via `getStaticPaths()`
- Titel, prijs, beschrijving en afbeelding uit Shopify
- Variantselectie waarbij uitverkochte varianten niet selecteerbaar zijn (`availableForSale`)
- Toevoegen aan winkelwagen, waarbij de knop tijdens de aanvraag uitgeschakeld wordt zodat een dubbelklik niet twee keer hetzelfde product toevoegt

### Winkelwagen (`/cart`)

- Regels met producttitel, variant, aantal, regelprijs en totaalbedrag
- Aantal aanpassen en regels verwijderen
- Aantal op 0 zetten roept `removeCartLine()` aan, omdat Shopify's Cart API geen `quantity: 0` accepteert
- Na elke wijziging wordt de volledige cart opnieuw opgehaald in plaats van lokaal bijgewerkt, bewust simpel gehouden om de weergave gegarandeerd gelijk te houden aan Shopify
- Afrekenen stuurt door naar Shopify Checkout

### Foutafhandeling

`shopifyFetch()` gooit een leesbare fout bij zowel HTTP-fouten als GraphQL-fouten. De cart-mutaties vragen daarnaast `userErrors` op, zodat Shopify's eigen foutmelding (bijvoorbeeld "variant bestaat niet") direct zichtbaar wordt in plaats van pas later als TypeError op te duiken.

---

## Shopify Storefront API


| Functie | Doel | Waar gebruikt |
| :--- | :--- | :--- |
| `getAllProducts()` | Producten met varianten en prijzen ophalen | Overzicht en `getStaticPaths()` |
| `createCart()` | Nieuwe winkelwagen aanmaken bij de eerste toevoeging | Productdetailpagina |
| `addCartLine()` | Variant toevoegen aan een bestaande winkelwagen | Productdetailpagina |
| `getCart()` | Volledige winkelwagen ophalen | Winkelwagenpagina |
| `updateCartLine()` | Aantal van een regel aanpassen | Winkelwagenpagina |
| `removeCartLine()` | Regel verwijderen | Winkelwagenpagina |

Queries gebruiken GraphQL-variabelen in plaats van waarden direct in de querystring, zodat producttitels met aanhalingstekens de query niet breken.

```js
// src/lib/shopify.js
const endpoint = `https://${domain}/api/2025-01/graphql.json`;

async function shopifyFetch(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  // ...
}
```

---

## Toegankelijkheid

- Semantische HTML: `<nav>`, `<main>`, `<h1>`, lijsten voor productgrids
- `lang="nl"` op het `<html>` element
- Afbeeldingen krijgen `altText` uit Shopify, met de producttitel als fallback
- Ontbrekende afbeeldingen worden een placeholder met `role="img"` en `aria-label` in plaats van een leeg blok
- Formuliervelden in de winkelwagen zijn gekoppeld aan een `<label>`
- Uitverkochte varianten zijn zichtbaar uitgeschakeld, niet alleen visueel grijs

---

## Aan de slag

### Vereisten

- Node.js 22.12 of hoger
- Een Shopify-winkel met een Storefront API access token

### Installeren

```sh
git clone https://github.com/Ties7/Aerocrew.git
cd Aerocrew
npm install
cp .env.example .env
```

Vul daarna `.env` in en start de dev-server met `npm run dev`. De site draait op `localhost:4321`.

---

## Omgevingsvariabelen

Maak een `.env` bestand aan in de root:

```env
PUBLIC_SHOPIFY_DOMAIN=jouw-winkel.myshopify.com
PUBLIC_SHOPIFY_STOREFRONT_TOKEN=jouw_storefront_token
```

> De `PUBLIC_` prefix maakt de variabele beschikbaar in client-side code, wat nodig is omdat de winkelwagen vanuit de browser met Shopify praat. Een Storefront-token is publiek bedoeld en heeft alleen leesrechten op producten en schrijfrechten op carts, geen toegang tot de admin.

---

## Commando's

| Commando | Actie |
| :--- | :--- |
| `npm install` | Installeert dependencies |
| `npm run dev` | Start lokale dev server op `localhost:4321` |
| `npm run build` | Bouwt de productiesite naar `./dist/` |
| `npm run preview` | Preview de build lokaal vóór deployment |

---

## Development workflow

Dit project volgt een **feature branch workflow** met issues als startpunt:

1. Elke feature begint als issue met een MoSCoW-label (`Must Have`, `Should Have`, `Could Have`, `Won't Have`) en een type (`Feature`, `documentation`), aangemaakt via de templates in `.github/ISSUE_TEMPLATE/`
2. Branch aanmaken vanuit `main`:
3. Commits verwijzen naar het issue-nummer:
   ```
   feat: add getCart, updateCartLine and removeCartLine functions #19
   fix: userErrors uitlezen bij cart mutaties #18
   ```
4. Pull Request openen met een vaste opbouw: **Wat**, **Waarom**, **Hoe getest**, **Zelf-review** en een checklist. Bij de zelf-review zet de auteur inline comments bij de belangrijkste keuzes, zodat de reviewer ziet waarom iets zo gebouwd is en niet alleen dat het werkt
5. Review door een teamgenoot, daarna merge naar `main`

- [Issues](https://github.com/Ties7/Aerocrew/issues)
- [Pull requests](https://github.com/Ties7/Aerocrew/pulls)

---

## Ontwerp & documentatie

Alle ontwerpdocumenten staan per issue als foto + de link naar de Figma.

| Document | Bestand | Wat het laat zien |
| :--- | :--- | :--- |
| Sitemap | Sitemap | De paginastructuur van de webshop |
| Wireflow | Wireflow | Product Kiezen |

Bronbestand in Figma: https://www.figma.com/design/bEFMKkmGD0dOry3eAKTBNk/Aerocrew?node-id=95-3074&t=JWfUn4B74KcYp20A-1

De briefing en debriefing met de opdrachtgever zijn vastgelegd in [issue #1](https://github.com/Ties7/Aerocrew/issues/1).

---

## Testen & validatie

De volledige aankoopflow is end-to-end getest met Shopify's Bogus Gateway: product toegevoegd via de detailpagina, aantal aangepast en een regel verwijderd op `/cart`, en de checkout afgerond met een testbetaling. De bevestigde bestelling verschijnt zowel op de bevestigingspagina als in Bestellingen in de Shopify-admin.

Alle frontend testen zijn te vinden per issue.
