# Code Review Skill

Führe ein umfassendes Code Review für dieses Projekt durch. Analysiere alle Source-Dateien in `src/` und bewerte sie systematisch.

## Vorgehen

1. **Lies alle Source-Dateien** in `src/` vollständig ein
2. **Analysiere jede Datei** nach den unten definierten Kategorien
3. **Erstelle den Report** im vorgegebenen Format

## Analyse-Kategorien

### Security
- Injection-Schwachstellen (SQL, NoSQL, Command Injection, XSS)
- Input-Validierung und Sanitization
- Unsichere Abhängigkeiten oder Patterns
- Fehlende Authentifizierung/Autorisierung wo nötig
- Sensitive Daten in Responses oder Logs
- Prototype Pollution, ReDoS, Path Traversal
- HTTP Header Security (CORS, Content-Type, etc.)

### Best Practices
- TypeScript strict mode Nutzung (any, unknown, Type Assertions)
- Error Handling (fehlende try/catch, unbehandelte Promise Rejections)
- Zod-Schema-Validierung vollständig und korrekt
- Express Middleware korrekt eingesetzt
- HTTP Status Codes korrekt verwendet
- Konsistente API-Response-Formate
- Separation of Concerns
- DRY-Prinzip, Code-Duplikation

### Einfachheit & Wartbarkeit
- Unnötige Komplexität, Over-Engineering
- Lesbarkeit (Naming, Funktionslänge, Verschachtelungstiefe)
- Fehlende oder irreführende Typen
- Dead Code, ungenutzte Imports/Variablen
- Konsistenz im Code-Stil

### Robustheit
- Edge Cases nicht abgedeckt
- Fehlende Boundary Checks
- Race Conditions bei gleichzeitigen Requests
- Fehlerhafte Datenstrukturen oder Typ-Annahmen
- Fehlende Default-Werte oder Fallbacks

### Performance
- Ineffiziente Algorithmen oder Datenstrukturen
- Unnötige Kopien, Iterationen, Allokationen
- Memory Leaks
- Blocking Operations im Request-Handler

## Severity-Levels

- **CRITICAL** — Muss sofort behoben werden. Security-Lücken, Datenverlust, Crashes, fehlerhafte Business-Logik.
- **WARNING** — Sollte behoben werden. Best-Practice-Verstösse, potenzielle Bugs, Wartbarkeitsprobleme.
- **INFO** — Verbesserungsvorschlag. Code-Stil, Optimierungen, kleinere Inkonsistenzen.

## Output-Format

Schreibe den Review-Report in eine Datei `review.md` im Projekt-Root. Verwende dieses Format:

```markdown
# Code Review Report

**Datum:** YYYY-MM-DD
**Scope:** src/
**Dateien:** [Liste der analysierten Dateien]

## Zusammenfassung

| Severity | Anzahl |
|----------|--------|
| CRITICAL | X |
| WARNING  | X |
| INFO     | X |

## Findings

### CRITICAL

#### [C-001] Titel des Findings
- **Datei:** `src/path/to/file.ts:42`
- **Kategorie:** Security | Best Practices | Robustheit | Performance | Einfachheit
- **Beschreibung:** Was ist das Problem?
- **Impact:** Was kann passieren?
- **Fix:** Konkreter Lösungsvorschlag mit Code-Beispiel

### WARNING

#### [W-001] Titel des Findings
...

### INFO

#### [I-001] Titel des Findings
...

## Empfehlungen

Priorisierte Liste der wichtigsten nächsten Schritte.
```

## Regeln

- Sei gründlich — lieber ein Finding zu viel als eines übersehen
- Jedes Finding braucht einen konkreten Fix-Vorschlag
- Nutze `datei:zeile` Referenzen für alle Findings
- Bewerte im Kontext des Projekts (Lernprojekt, In-Memory, kein Auth)
- Keine generischen Hinweise — nur was tatsächlich im Code gefunden wurde
- Schreibe den Report auf Deutsch
- Schreibe die review.md Datei ins Projekt-Root
