# QuestSystem V4.1 — API Contract

## Öffentliche Methoden (Public API)

### Quest Lifecycle

| Methode | Beschreibung | Rückgabe |
|---------|-------------|----------|
| `startQuest(questId)` | Startet eine Quest (Board → Active) | `{ success, quest, message }` |
| `completeQuest(questId)` | Schließt Quest ab + gibt Rewards | `{ success, quest, rewards }` |
| `abandonQuest(questId)` | Bricht Quest ab (2h Cooldown) | `boolean` |
| `declineQuest(questId)` | Entfernt Quest vom Board | `void` |

### Read API (UI Contract)

| Methode | Beschreibung | Rückgabe |
|---------|-------------|----------|
| `getAvailableQuests()` | Board-Quests (Kopie) | `Array` |
| `getActiveQuests()` | Aktive Quests (Kopie) | `Array` |
| `getCompletedQuests()` | Heute abgeschlossen (Kopie) | `Array` |
| `getTrainingQuest()` | Training Quest (Kopie) | `Object|null` |
| `getQuest(id)` | Einzelne Quest suchen | `Object|null` |
| `getStats()` | Zusammenfassung | `Object` |

### Fortschritt

| Methode | Beschreibung | Rückgabe |
|---------|-------------|----------|
| `updateQuestProgress(questId, objectiveId, progress)` | Manueller Progress | `{ success, objectiveCompleted, questCompleted }` |
| `processGameEvent(eventType, eventData)` | Automatischer Progress via Events | `Array` |

### System

| Methode | Beschreibung |
|---------|-------------|
| `init()` | Initialisierung (einmalig, Guard) |
| `generateQuestBoard()` | Board neu generieren |
| `generateTrainingQuest()` | Training Quest generieren |
| `saveState()` | State persistieren (+ Validierung) |
| `debug()` | Debug-Info ausgeben |

### Deprecated

| Methode | Ersatz |
|---------|--------|
| `selectQuest(id)` | `startQuest(id)` |
| `acceptQuest(id)` | `startQuest(id)` |

---

## State-Struktur

```
state: {
    questBoard: Quest[]          // Verfügbare Quests (max 6)
    activeQuests: Quest[]        // Gestartete Quests (max 3)
    completedQuests: Quest[]     // Heute abgeschlossen
    selectedDailyQuests: []      // LEGACY (wird automatisch bereinigt)
    
    trainingQuest: Quest|null    // Tägliches Training
    trainingInProgress: boolean
    trainingEndTime: string|null
    
    lastReset: string|null       // ISO Timestamp
    nextReset: string|null       // ISO Timestamp
    questCooldowns: { [templateId]: isoTimestamp }
    
    karma: { value: number, history: [] }
    trust: { [npc]: { value, max } }
    
    worldStates: { active: [], history: [] }
    seasonalEvent: Object|null
    rareEvent: Object|null
    
    activeQuestChains: []
    completedQuestChains: []
}
```

---

## Quest-Objekt

```
{
    id: string               // Einzigartige Instanz-ID
    templateId: string       // Template-Referenz
    title: string
    description: string
    type: string             // story|daily|training|exploration|combat|...
    category: string
    status: string           // LIFECYCLE STATUS (siehe unten)
    
    giver: { name, location } | null
    difficulty: string       // easy|medium|hard|very_hard
    estimatedDuration: number // Minuten
    
    objectives: [{
        id: string
        text: string
        trigger: string      // Event-Typ der Progress auslöst
        target: number       // Benötigter Fortschritt
        current: number      // Aktueller Fortschritt
        completed: boolean
        condition: Object    // Optionale Zusatzbedingung
    }]
    
    rewards: { xp, gold, silver, copper, karma, reputation, items }
    requirements: { level, karma, trust, clan, element }
    combat: Object|null
    
    generatedAt: string      // ISO
    acceptedAt: string|null  // ISO
    completedAt: string|null // ISO
    expiresAt: string        // ISO (nächster Daily Reset)
}
```

---

## Quest Lifecycle (Zustandsübergänge)

```
available ──startQuest()──→ active
active    ──objectives──→ ready_for_turn_in
ready     ──completeQuest()──→ completed
active    ──abandonQuest()──→ abandoned (+ Cooldown)
```

Erlaubte Status:
- `available` — auf dem Board, startbar
- `active` — gestartet, Objectives in Bearbeitung
- `ready_for_turn_in` — alle Objectives erledigt, Reward abholbar
- `completed` — abgeschlossen, Rewards vergeben
- `abandoned` — abgebrochen

**Invarianten:**
- Eine Quest existiert in GENAU EINEM Array
- Jede Quest hat GENAU EINEN Status
- `_validateStateConsistency()` wird bei jedem `saveState()` ausgeführt

---

## Event-Typen (EventBus)

### Emittiert von QuestEngine:
| Event | Daten | Wann |
|-------|-------|------|
| `quest:started` | Quest | Quest gestartet |
| `quest:progress` | { quest, objective, objectiveCompleted, questCompleted } | Fortschritt |
| `quest:ready_for_turn_in` | Quest | Alle Objectives erledigt |
| `quest:completed` | { quest, rewards } | Quest abgeschlossen |
| `quest:abandoned` | Quest | Quest abgebrochen |
| `quest:daily-reset` | { board, training } | Täglicher Reset |

### Empfangen von QuestEngine:
| Event | Löst aus |
|-------|---------|
| `training:completed` | processGameEvent('training_completed') |
| `combat:won` | processGameEvent('combat_won') |
| `combat:lost` | processGameEvent('combat_lost') |
| `item:collected` | processGameEvent('item_collected') |
| `exploration:completed` | processGameEvent('exploration') |
| `merchant:trade` | processGameEvent('merchant_trade') |

---

## Sicherheitsgarantien

1. **Double Progress**: Objective mit `completed=true` ignoriert weitere Updates
2. **Double Reward**: Quest wird aus `activeQuests` entfernt nach `completeQuest`
3. **Event Deduplizierung**: 100ms Timestamp-Guard in `processGameEvent`
4. **State Konsistenz**: `_validateStateConsistency()` bei jedem Save
5. **Init Guard**: `_initialized` Flag verhindert doppelte Listener
6. **Cooldown Persist**: Überlebt Page Reload via localStorage
