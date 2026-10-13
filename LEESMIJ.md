# Nieuwe Kijk op Werk: website

Statische site (HTML/CSS/JS), zonder framework. Je kunt hem op elke host zetten: Netlify, Vercel, GitHub Pages of je eigen hosting.

- `index.html`: home met diensten, abonnement, losse inzet, Quickscan, visie, team, ervaringen en contact
- `over-ons.html`: Over Nieuwe Kijk op Werk, met Maaike, Pam en Amber
- `css/style.css`, `js/main.js`: opmaak en animaties
- `fonts/`: League Spartan en Instrument Serif. Die staan lokaal, dus er is geen verbinding met Google nodig (prettig voor de AVG)
- `images/`: foto's

## Live zetten
- **Voorbeeld:** GitHub Pages (Settings → Pages → Deploy from a branch → main / root).
- **Definitief:** Netlify → Add new site → Import from GitHub → kies deze repo. Build command leeg laten, publish directory `.` (staat ook in `netlify.toml`). Daarna het domein nieuwekijkopwerk.nl koppelen in Netlify en de DNS bij de domeinregistrar omzetten.

## Nog te doen
1. Zet `maaike.jpg` en `pam.jpg` in `images/`. Tot die er staan, haalt de site de foto's op van de huidige Lovable-site. Zodra Lovable offline gaat, verdwijnen ze daar.
2. De tekst van Pam is voorlopig. Die komt in `over-ons.html` bij `id="pam"`.
3. Lokaal bekijken: open de map in een terminal en draai `python3 -m http.server`. Ga daarna naar http://localhost:8000. Als je `index.html` dubbelklikt, laden de lettertypes niet in elke browser.
