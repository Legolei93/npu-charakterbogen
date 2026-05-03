# Legacy Code

Dieser Ordner enthält veraltete Code-Versionen, die nicht mehr aktiv verwendet werden.

## Dateien

### training-system.js
- **Status:** Veraltet
- **Ersetzt durch:** training-system-v4.js
- **Grund:** Keine Production-Features (Locks, Tamper-Protection, etc.)

### training-system-v3.js
- **Status:** Veraltet
- **Ersetzt durch:** training-system-v4.js
- **Grund:** Unvollständige Implementierung

### quest-engine.js
- **Status:** Veraltet
- **Ersetzt durch:** quest-engine-v4.js
- **Grund:** Einfache Version ohne V4 Features

### quest-system-tests.js
- **Status:** Veraltet
- **Grund:** Manuelle Tests, nicht für CI geeignet

## Wichtig

Diese Dateien werden NICHT in index.html geladen.
Sie dienen nur als Referenz/Backup.

Bei Produktions-Builds sollten diese Dateien EXCLUDIERT werden.
