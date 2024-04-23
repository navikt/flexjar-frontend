# flexjar-frontend

App for å se på feedback gitt fra bruker til team flex.

Her kan medlemmer av team flex logge inn og se på feedbacken som er gitt fra brukere av ulike applikasjoner som er eid av team flex. F.eks. spinnsyn, sykepengesøknad og ditt sykefravær.
Dersom feedbacken har personopplysninger så kan man også slette den.

Innlogging er begrenset til AD gruppen team flex.

Adressen til appen er https://flexjar.intern.nav.no/ i prod og https://flexjar.intern.dev.nav.no/ i dev. Man må ha naisdevice for å nå appen.
## Utvikling

### Utvikling mot backend mocket i flexjar-frontend koden
Start appen med `npm run dev` for å kjøre appen med mocket backend. Dette er nyttig for å kunne utvikle frontend uten å være avhengig av en ekte backend.

### Utvikling mot lokalt kjørende flexjar-backend uten auth
For å kjøre appen mot en lokalt kjørende backend start appen med `npm run local`. Backend startes med å kjøre main metoden i filen DevApplication.kt i flexjar-backend prosjektet. Denne kan startes enkelt i intellij, testdata genereres opp automatisk.
Merk at koden som håndterer autentisering da disablet i flexjar-backend med spring profiler.
En postgres database startes med testcontainers.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles til `flex@nav.no`

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen `#flex`.
