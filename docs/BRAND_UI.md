# Heia Design System

## Brand

Heia hjelper foreldre, familie og bekjente med å følge, heie på og støtte barne- og ungdomslagene sine. Alt vi bygger skal føles **sporty, glad, clean og tillitsvekkende**.

### Primærfarge

`#02ffab` (Heia-grønn) — vår signaturaksent. Brukes **sparsomt** for å skape energi og fokus:

- Primær CTA-knapp (én per skjerm)
- Aktiv tab-indikator
- Toggle on-state
- Progressbar / RSVP "kommer"-andel

**Regel: Maks 1–2 aksenter av #02ffab per skjerm.** Resten av UI-et er varme nøytraler.

---

## Fargetokens

| Token | Hex | Bruk |
|---|---|---|
| `heia` | `#02ffab` | Primær aksent — CTA, aktiv state |
| `heiaPressed` | `#00D492` | Pressed-state for heia-knapper |
| `heiaSoft` | `rgba(2,255,171,0.10)` | Subtil bakgrunn for valgte elementer |
| `background` | `#F7F7F8` | Skjerm-bakgrunn |
| `surface` | `#FFFFFF` | Kort, cards, modals |
| `textPrimary` | `#1A1D26` | Hovedtekst |
| `textSecondary` | `#6B7280` | Sekundær tekst, undertekster |
| `textTertiary` | `#9CA3AF` | Timestamps, hints, deaktivert |
| `border` | `#E5E7EB` | Skillelinjer, card-border |
| `error` | `#EF4444` | Feil, "kan ikke", avvisning |
| `success` | `#22C55E` | Suksess (bevisst ulik heia-grønn) |
| `warning` | `#F59E0B` | Advarsler |

### Event-type farger

| Type | Bakgrunn | Tekst |
|---|---|---|
| Trening | `#EEF2FF` | `#4F46E5` (indigo) |
| Kamp | `#FFF7ED` | `#EA580C` (oransje) |
| Sosialt | `#FAF5FF` | `#9333EA` (lilla) |

---

## Typografi

System fonts (San Francisco på iOS, Roboto på Android). Støtter norske tegn nativt.

| Token | Størrelse | Vekt | Andre |
|---|---|---|---|
| `heading1` | 28px | Bold (700) | letterSpacing: -0.5 |
| `heading2` | 22px | Bold (700) | |
| `heading3` | 18px | SemiBold (600) | |
| `body` | 16px | Regular (400) | lineHeight: 24 |
| `bodySmall` | 14px | Regular (400) | lineHeight: 20 |
| `caption` | 12px | Medium (500) | |
| `label` | 13px | Medium (500) | uppercase, letterSpacing: 0.8 |

---

## Spacing

4px base grid. Bruk kun disse verdiene:

| Token | Verdi |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| `2xl` | 24px |
| `3xl` | 32px |
| `4xl` | 40px |
| `5xl` | 48px |

---

## Border Radius

| Token | Verdi | Bruk |
|---|---|---|
| `sm` | 8px | Chips, små elementer |
| `md` | 12px | Cards, inputs |
| `lg` | 16px | Større cards, modals |
| `xl` | 24px | Knapper |
| `full` | 9999px | Avatarer, runde elementer |

---

## Shadows

```
card:     0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
elevated: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)
```

---

## Komponenter

### Regler

1. **Ingen hardkodede verdier** — kun tokens for farger, spacing, radius, skygger
2. **Én primærhandling per skjerm** — resten er secondary/ghost
3. **Konsistent kortmønster** — alle cards bruker `Card`-komponenten med samme radius/skygge
4. **Én ikonstil** — vi velger ett ikon-bibliotek og holder oss til det (foreløpig Unicode-symboler)

### Komponentliste

| Komponent | Beskrivelse |
|---|---|
| `Button` | Primær (heia bg), sekundær (outline), ghost. Én størrelse (48px min touch) |
| `Card` | Hvit flate med radius.md og shadow.card. Konsistent padding |
| `ListRow` | Listerad med ikon, tittel, undertekst, høyre-aksessoar |
| `Chip` | Event-type tag: TRENING (blå), KAMP (oransje), SOSIALT (lilla) |
| `Header` | Skjerm-overskrift med safe area |
| `Avatar` | Sirkulær med fallback-initialer. sm/md/lg |
| `SectionHeader` | Seksjonstittel med valgfri "Se alle"-lenke |
| `EventCard` | Kombinerer Chip + dato + info + RSVPBar |
| `RSVPBar` | Visuell stolpe: grønn/rød/grå |
| `FeedCard` | Feed-element med avatar, innhold, tidsstempel |

---

## Referansemønstre

Basert på analyse av **Spond**, **Heja**, **TeamSnap** og **Band**.

### Navigasjon
5-tab bottom bar — bransjestandardmønster:
1. **Hjem** — lagets feed + neste event
2. **Kalender** — hendelsesliste/kalendervisning
3. **+** — opprett hendelse/post (opphøyd knapp)
4. **Meldinger** — lagchat
5. **Mer** — profil, innstillinger, støtt laget

### Team Home
Rekkefølge: Lag-header → Neste event (prominent) → "Siste oppdateringer" feed.
Neste event-kortet skal alltid være synlig uten scrolling.

### Event-detalj
Rekkefølge: Event-info → RSVP-knapper (stor, tydelig) → Oppmøteliste (3 seksjoner).
Én klar handling: "Kommer" / "Kan ikke".

### Støtt/Abonnement
Rekkefølge: Emosjonell overskrift → Lagets navn synlig → Visuell fordeling (80% laget) → Fordeler → Prisvalg → CTA → "Ingen binding".
**Ikke** vis paywall ved første åpning. Vis etter at bruker har opplevd verdi.

### Onboarding (for fremtidig implementasjon)
1. Én verdi-skjerm (ikke karusell)
2. Rollevalg: Trener / Forelder / Spiller
3. Lagkode-input (primær vei inn)
4. Rask profilbygging

---

## Copy-retningslinjer

### Tone
Norsk, varm, litt leken — men ikke barnslig. Vi snakker som en engasjert lagforelder, ikke som en bedrift.

### Eksempler

| Generisk (unngå) | Heia-tone (bruk) |
|---|---|
| "No events" | "Ingen kamper denne uka — nyt fridagen!" |
| "Error" | "Oi, noe gikk galt. Prøv igjen?" |
| "Subscription" | "Støtt laget" |
| "Settings" | "Din profil" |
| "Create event" | "Opprett trening, kamp eller noe gøy" |
| "0 responses" | "Ingen har svart ennå — send en påminnelse?" |
| "Get started" | "Kom i gang" |
| "Continue" | "Gå videre" |
| "Cancel" | "Avbryt" / "Ikke nå" |
| "Submit" | "Send" / "Bekreft" |

### Tomme tilstander
Hver tom tilstand skal ha personlighet og en tydelig CTA:
- Tom feed: "Stille her ennå... Vær den første til å poste!"
- Ingen events: "Kalenderen er tom. Tid for å planlegge neste trening?"
- Ingen lag: "Bli med i laget ditt — skriv inn lagkoden du fikk"

---

## Anti-mønstre

Ting vi **IKKE** gjør:

1. **Grønn overalt** — #02ffab kun som aksent, aldri som bakgrunn eller store flater
2. **Flere primærknapper per skjerm** — én CTA, resten er sekundær/ghost
3. **Engelske fraser** — all copy er norsk, alltid
4. **Identisk spacing overalt** — bevisst variasjon mellom seksjoner for rytme
5. **Default spinners** — custom tomme tilstander med personlighet
6. **Sport-spesifikk logikk i UI** — holdes generisk, sport er bare en label

---

## Skalerbarhet

### Mange sporter
`SportType` er en enkel enum: `'fotball' | 'handball' | 'basket' | 'ishockey' | 'annet'`.
Nye sporter legges til ved å utvide enum. Ingen sport-spesifikk UI-logikk.

### Event-typer
`EventType` er generisk: `'trening' | 'kamp' | 'sosialt' | 'annet'`.
Fungerer på tvers av alle sporter. Fargekodet via Chip-komponenten.

### Lag-farge
Hvert lag kan ha sin egen farge som vises i lag-avatar og header-aksent.
App-skallet forblir nøytralt — teamfarge er personalisering, ikke branding.
