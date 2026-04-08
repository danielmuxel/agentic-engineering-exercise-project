# Code Review Report

**Datum:** 2026-04-08
**Scope:** src/
**Dateien:** `src/api/tasks.ts`, `src/server.ts`, `src/utils/validate.ts`, `src/config/index.ts`

## Zusammenfassung

| Severity | Anzahl |
|----------|--------|
| CRITICAL | 2 |
| WARNING  | 5 |
| INFO     | 3 |

## Findings

### CRITICAL

#### [C-001] Route-Shadowing: `/stats` wird von `/:id` verdeckt
- **Datei:** `src/api/tasks.ts:30`
- **Kategorie:** Robustheit
- **Beschreibung:** Die Route `GET /stats` ist *nach* `GET /` aber *vor* `GET /:id` definiert. In der aktuellen Reihenfolge funktioniert es zufällig korrekt, weil Express Routen sequentiell matcht. Allerdings ist dies fragil: Wird die Reihenfolge je geändert oder eine neue Route wie `/:id/subtasks` eingefügt, fängt `/:id` den Request mit `id = "stats"` ab.
- **Impact:** Bei Refactoring oder Neuordnung der Routen liefert `/tasks/stats` plötzlich `404 Task not found` statt der Statistik.
- **Fix:** Statische Routen immer *vor* parametrisierten Routen definieren und dies mit einem Kommentar dokumentieren:
```typescript
// Statische Routen VOR parametrisierten Routen
router.get("/stats", (_req, res) => { ... });
router.get("/:id", (req, res) => { ... });
```

#### [C-002] PUT erlaubt das Überschreiben von System-Feldern (completed, id, createdAt)
- **Datei:** `src/api/tasks.ts:67`
- **Kategorie:** Security / Robustheit
- **Beschreibung:** `TaskUpdateSchema` ist `TaskSchema.partial()`, welches nur `title`, `description` und `priority` enthält. Das ist korrekt. **Aber** `validateTaskUpdate` gibt nur die validierten Felder zurück, während `{ ...task, ...result.data }` den Spread macht. Da Zod unbekannte Felder per Default strippt, sind `completed`, `id` und `createdAt` aktuell geschützt. **Problem:** Falls `TaskSchema` in Zukunft erweitert wird (z.B. um `completed`), wird `partial()` automatisch auch `completed` optional machen, und ein Client könnte über PUT den Status ändern, ohne dass dies beabsichtigt ist.
- **Impact:** Unbeabsichtigte Mutation von Feldern bei Schema-Erweiterung.
- **Fix:** Ein explizites Update-Schema definieren, das nur die erlaubten Felder enthält:
```typescript
export const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  completed: z.boolean().optional(),
});
```

### WARNING

#### [W-001] Keine Begrenzung der JSON-Body-Grösse
- **Datei:** `src/server.ts:7`
- **Kategorie:** Security
- **Beschreibung:** `express.json()` wird ohne `limit`-Option verwendet. Der Default ist `100kb`, was für eine Task-API ausreichend ist, aber explizit gesetzt werden sollte.
- **Impact:** Ein Angreifer könnte grosse Payloads senden (bis 100kb pro Request). Bei einem In-Memory-Store ohne Limits summiert sich das.
- **Fix:**
```typescript
app.use(express.json({ limit: "10kb" }));
```

#### [W-002] Kein PATCH-Endpoint, PUT für partielle Updates missbraucht
- **Datei:** `src/api/tasks.ts:54`
- **Kategorie:** Best Practices
- **Beschreibung:** `PUT /:id` verwendet `TaskUpdateSchema` (partial), verhält sich aber semantisch wie ein PATCH. Laut HTTP-Semantik sollte PUT die gesamte Ressource ersetzen, PATCH für partielle Updates verwendet werden.
- **Impact:** API-Konsumenten erwarten bei PUT eine vollständige Ressource und könnten unbeabsichtigt Felder löschen, wenn sie nur Teilfelder senden.
- **Fix:** Den Endpoint entweder zu `PATCH` ändern oder bei PUT die vollständige Validierung (`TaskSchema` statt `TaskUpdateSchema`) verwenden.

#### [W-003] `completed`-Feld kann nicht über die API geändert werden
- **Datei:** `src/utils/validate.ts:9` / `src/api/tasks.ts:67`
- **Kategorie:** Robustheit
- **Beschreibung:** Das `completed`-Feld wird beim Erstellen auf `false` gesetzt, aber `TaskUpdateSchema` enthält kein `completed`-Feld. Es gibt keinen Weg, eine Task als erledigt zu markieren.
- **Impact:** Core-Funktionalität einer Task-API fehlt. Der `/stats`-Endpoint zeigt `completed: 0` für immer.
- **Fix:** `completed` zum Update-Schema hinzufügen:
```typescript
export const TaskUpdateSchema = TaskSchema.partial().extend({
  completed: z.boolean().optional(),
});
```

#### [W-004] `PORT`-Parsing ohne Validierung
- **Datei:** `src/config/index.ts:2`
- **Kategorie:** Robustheit
- **Beschreibung:** `parseInt(process.env.PORT)` gibt `NaN` zurück, wenn der Wert keine gültige Zahl ist (z.B. `PORT=abc`). Dies wird nicht geprüft.
- **Impact:** Server startet mit `NaN` als Port, was zu einem kryptischen Fehler führt.
- **Fix:**
```typescript
const parsedPort = parseInt(process.env.PORT ?? "");
port: Number.isNaN(parsedPort) ? 3000 : parsedPort,
```

#### [W-005] Kein Error-Handling-Middleware
- **Datei:** `src/server.ts`
- **Kategorie:** Best Practices
- **Beschreibung:** Es gibt keine globale Error-Handling-Middleware. Wenn ein Handler eine unbehandelte Exception wirft, antwortet Express mit einem Default-500-HTML-Response.
- **Impact:** Clients erhalten bei unerwarteten Fehlern HTML statt JSON, was die API-Konsistenz bricht.
- **Fix:**
```typescript
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: "Internal server error" });
});
```

### INFO

#### [I-001] Response-Format inkonsistent zwischen Einzel- und Listenansicht
- **Datei:** `src/api/tasks.ts:9` vs `src/api/tasks.ts:27`
- **Kategorie:** Best Practices
- **Beschreibung:** `GET /` gibt ein nacktes Array zurück `[...tasks.values()]`, während andere Endpoints einzelne Objekte zurückgeben. Ein Wrapper-Objekt `{ data: [...] }` wäre konsistenter und erweiterbar (z.B. für Pagination).
- **Impact:** Späteres Hinzufügen von Pagination oder Metadaten erfordert einen Breaking Change.
- **Fix:**
```typescript
res.json({ data: [...tasks.values()] });
```

#### [I-002] `createdAt` wird als Date-Objekt serialisiert
- **Datei:** `src/api/tasks.ts:22`
- **Kategorie:** Einfachheit & Wartbarkeit
- **Beschreibung:** `new Date()` wird als `createdAt` gespeichert. Express/JSON.stringify serialisiert dies als ISO-String, was korrekt ist. Allerdings ist der Typ `Date` im `Task`-Interface, während der Client immer einen String erhält. Dies kann zu Verwirrung führen.
- **Impact:** Gering, aber ein `string`-Typ oder explizites `.toISOString()` wäre klarer.
- **Fix:**
```typescript
createdAt: new Date().toISOString(),
// und im Type: createdAt: string;
```

#### [I-003] Unused Import: `Request` in manchen Handlern redundant typisiert
- **Datei:** `src/api/tasks.ts:1`
- **Kategorie:** Einfachheit & Wartbarkeit
- **Beschreibung:** `Request` und `Response` werden explizit importiert und bei jedem Handler als Typ-Annotation verwendet. Express inferiert diese Typen automatisch bei `Router`-Handlern, die explizite Annotation ist redundant.
- **Impact:** Kein funktionaler Impact, nur etwas Rauschen im Code.
- **Fix:** Typ-Annotationen entfernen und TypeScript inferieren lassen, oder beibehalten für Explizitheit (Geschmackssache).

## Empfehlungen

1. **[C-002] Update-Schema explizit definieren** und `completed`-Feld hinzufügen (behebt auch W-003)
2. **[C-001] Route-Reihenfolge absichern** — statische Routen vor parametrisierten
3. **[W-005] Error-Handling-Middleware** einbauen für konsistente JSON-Fehler
4. **[W-004] Port-Validierung** hinzufügen
5. **[W-002] PUT vs. PATCH** klären — HTTP-Semantik einhalten
6. **[W-001] Body-Limit** explizit setzen
