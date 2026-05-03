# Quest System v4.0 - Dokumentation

## Übersicht

Das Quest System v4.0 ist ein Studio-Level RPG Quest-System für das NPU Charakterbogen-Projekt. Es bietet ein vollständiges Quest-Erlebnis mit Dialogen, Kämpfen, Belohnungen und Trainings.

## Architektur

```
src/
├── core/
│   ├── event-bus.js          # Zentrales Event-System
│   ├── state-manager.js      # State-Verwaltung
│   └── karma-system.js       # Karma & Reputation
├── quests/
│   ├── quest-engine-v4.js    # Kern-Quest-Engine
│   ├── quest-registry-v4.js  # Quest-Definitionen
│   ├── dialog-system.js      # Dialog-System
│   ├── fast-combat-system.js # Schnellkampf-System
│   ├── reward-system.js      # Belohnungs-System
│   ├── training-system.js    # Trainings-System
│   ├── quest-integration.js  # App-Integration
│   └── quest-system-tests.js # Tests
├── ui/
│   └── quest-board-ui.js     # Quest-Board UI
└── dm/
    └── dm-quest-control.js   # DM Panel Integration
```

## Features

### 1. Daily Quest System
- **6 Quests pro Tag** werden generiert
- **Maximal 3 auswählbar**
- **Täglicher Reset** um 00:00 Uhr
- Verschiedene Quest-Typen:
  - Story Quests (Hauptgeschichten)
  - Merchant Quests (Händler-Aufträge)
  - Investigation Quests (Ermittlungen)
  - Moral Quests (Entscheidungen)
  - Combat Quests (Kämpfe)
  - Daily Quests (Wiederholbare)
  - Elite Quests (Seltene Herausforderungen)

### 2. Dialog System
- **Mehrstufige Dialogbäume**
- **Skill Checks** (d20 + Modifier vs DC)
- **Karma-basierte Optionen**
- **Versteckte Optionen** (durch Skills entdeckbar)
- **Vertrauens-basierte Optionen**

### 3. Fast Combat System
- **Schnelle Kampf-Resolution** (5-15 Sekunden)
- **Echte Charakterwerte** (AC, Initiative, Skills)
- **Automatische Würfelwürfe**
- **Status-Effekte**
- **Belohnungen basierend auf Ergebnis**

### 4. Reward System
- **3 Kistenwahl** nach Abschluss aller Quests:
  - Alte Holztruhe (Common)
  - Eisenkiste (Uncommon/Rare)
  - Schattenkiste (Rare/Epic/Legendary)
- **Weighted RNG** für Inhalte
- **Jutsu-Drops** (D: 5%, C: 0.5%, B: 0.3%, A: 0.1%, S: 0.01%)
- **XP, Gold, Items**

### 5. Training System
- **5 Trainings-Typen**:
  - Jutsu Training (5x → Gelernt)
  - Chakra Meditation (5x → +3 Chakra)
  - Sparring (5x → +1 HP)
  - Ausdauertraining (30x → +1 Stamina)
  - XP Training (+10 XP)
- **Maximal 1 Training pro Tag**
- **Permanente Boni**

### 6. Karma System
- **Karma-Skala**: -100 (verdorben) bis +100 (legendär)
- **NPC-Vertrauen** basierend auf Karma
- **Fraktions-Ruf**
- **Karma-basierte Quest-Verfügbarkeit**

## Verwendung

### Quest Board anzeigen

```javascript
// Als Modal
QuestSystemIntegration.showQuestBoardModal();

// Oder direkt im Container
QuestBoardUI.init();
```

### Quest auswählen

```javascript
const result = QuestEngine.selectQuest('quest_id');
if (result.success) {
    console.log('Quest ausgewählt:', result.quest);
}
```

### Quest starten

```javascript
const result = QuestEngine.startQuest('quest_id');
if (result.success) {
    // Dialog starten wenn vorhanden
    if (result.quest.dialogTree) {
        DialogSystem.start(result.quest.dialogTree, result.quest);
    }
}
```

### Training starten

```javascript
const result = TrainingSystem.startTraining('jutsu', { jutsuId: 'jutsu_name' });
if (result.success) {
    console.log('Training abgeschlossen:', result.message);
}
```

### Karma ändern

```javascript
KarmaSystem.modifyKarma(5, 'Quest abgeschlossen');
```

### Belohnung öffnen

```javascript
const reward = RewardSystem.openChest('wood');
RewardSystem.applyReward({
    xp: reward.contents.xp,
    silver: reward.contents.silver,
    items: reward.contents.items
});
```

## DM Panel

### Daily Quests resetten

```javascript
DMQuestControl.resetDailyQuests();
```

### Elite Quest triggern

```javascript
DMQuestControl.triggerEliteQuest();
```

### Karma modifizieren

```javascript
DMQuestControl.modifyKarma(10);  // +10 Karma
DMQuestControl.modifyKarma(-10); // -10 Karma
```

## Events

### Wichtige Events

```javascript
// Character Events
EventBus.on('character:loaded', (character) => { ... });
EventBus.on('character:updated', (character) => { ... });

// Quest Events
EventBus.on('quest:accepted', (quest) => { ... });
EventBus.on('quest:completed', (quest) => { ... });

// Combat Events
EventBus.on('combat:victory', (result) => { ... });
EventBus.on('combat:defeat', (result) => { ... });

// Reward Events
EventBus.on('reward:received', (reward) => { ... });

// Training Events
EventBus.on('training:completed', (result) => { ... });
EventBus.on('jutsu:learned', (jutsu) => { ... });

// Karma Events
EventBus.on('karma:changed', ({ oldValue, newValue, change }) => { ... });
```

## Tests

### Alle Tests ausführen

```javascript
QuestSystemTests.runAll();
```

### Einzelne Tests

```javascript
QuestSystemTests.testQuestEngine();
QuestSystemTests.testKarmaSystem();
QuestSystemTests.testRewardSystem();
```

### Mit URL Parameter

Füge `?test=true` zur URL hinzu, um Tests automatisch beim Laden auszuführen.

## Konfiguration

### Quest Engine

```javascript
QuestEngine.CONFIG = {
    MAX_DAILY_QUESTS: 3,
    AVAILABLE_QUESTS_COUNT: 6,
    RESET_HOUR: 0,  // 00:00 Uhr
    QUEST_TYPES: ['story', 'merchant', 'investigation', 'moral', 'combat', 'daily']
};
```

### Reward System

```javascript
RewardSystem.CONFIG = {
    JUTSU_DROP_RATES: {
        D: 5.0,    // 5%
        C: 0.5,    // 0.5%
        B: 0.3,    // 0.3%
        A: 0.1,    // 0.1%
        S: 0.01    // 0.01%
    },
    LEGENDARY_CHANCE: 0.1  // 0.1%
};
```

### Training System

```javascript
TrainingSystem.CONFIG = {
    TRAINING_TYPES: {
        jutsu: { requiredForProgress: 5 },
        meditation: { requiredForProgress: 5 },
        sparring: { requiredForProgress: 5 },
        stamina: { requiredForProgress: 30 },
        xp: { reward: { xp: 10 } }
    },
    MAX_DAILY_TRAINING: 1
};
```

## Integration

### In app.js

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // ... bestehende Initialisierungen ...
    
    // Quest System v4.0 initialisieren
    if (typeof QuestSystemIntegration !== 'undefined') {
        QuestSystemIntegration.init();
    }
});
```

### Quest-Seite in der Navigation

```html
<button onclick="showQuestPage()">📜 Quests</button>
```

```javascript
function showQuestPage() {
    hideAllPages();
    document.getElementById('quest-page').classList.remove('hidden');
    QuestSystemIntegration.renderQuestPage();
}
```

## Troubleshooting

### Quests werden nicht geladen

1. Prüfe ob `QuestEngine.init()` aufgerufen wurde
2. Prüfe ob ein Character geladen ist
3. Prüfe die Browser-Konsole auf Fehler

### Dialoge funktionieren nicht

1. Stelle sicher dass `DialogSystem.injectStyles()` aufgerufen wurde
2. Prüfe ob der Dialog-Tree korrekt definiert ist

### Belohnungen werden nicht gespeichert

1. Prüfe ob `StateManager` initialisiert ist
2. Prüfe ob der Character korrekt gesetzt ist
3. Prüfe die localStorage-Quota

## Changelog

### v4.0
- Initiale Version
- Vollständiges Quest-System mit 6 Quests/Tag
- Dialog-System mit Skill Checks
- Fast Combat System
- Reward System mit 3 Kisten
- Training System mit 5 Trainingsarten
- Karma System
- DM Panel Integration
