/**
 * Storage Manager - Zentrale Persistenz-Verwaltung
 * 
 * Verantwortlich für:
 * - Speichern/Laden von Charakteren
 * - Schema-Migration für alte Saves
 * - User-isolierte Speicherung
 * - Backup/Restore Funktionalität
 */

const StorageManager = {
    // === KONFIGURATION ===
    
    CURRENT_SCHEMA_VERSION: 2,
    
    STORAGE_KEYS: {
        CHARACTERS: 'npu_characters',
        CURRENT_USER: 'npu_current_user',
        SETTINGS: 'npu_settings'
    },
    
    // === CHARAKTER-SPEICHERUNG ===
    
    /**
     * Speichert einen Character
     * @param {Object} character - Der zu speichernde Character
     * @returns {boolean} - Erfolg
     */
    StateManager.saveState(character) {
        try {
            if (!character || !character.id) {
                console.error('StorageManager: Ungültiger Character');
                return false;
            }
            
            // Schema-Version hinzufügen
            character._schemaVersion = this.CURRENT_SCHEMA_VERSION;
            character._savedAt = new Date().toISOString();
            
            // User-ID ermitteln
            const userId = this._getCurrentUserId();
            if (!userId) {
                console.error('StorageManager: Kein User eingeloggt');
                return false;
            }
            
            // Character mit User verknüpfen
            character.userId = userId;
            
            // Bestehende Charaktere laden
            const characters = this.loadAllCharacters(userId);
            
            // Character aktualisieren oder hinzufügen
            const index = characters.findIndex(c => c.id === character.id);
            if (index >= 0) {
                characters[index] = character;
            } else {
                characters.push(character);
            }
            
            // Speichern
            const storageKey = `${this.STORAGE_KEYS.CHARACTERS}_${userId}`;
            localStateManager.setItem(storageKey, JSON.stringify(characters));
            
            // Event auslösen
            if (typeof EventBus !== 'undefined') {
                EventBus.emit(EventBus.CHARACTER_SAVED, character);
            }
            
            return true;
        } catch (error) {
            console.error('StorageManager: Fehler beim Speichern:', error);
            return false;
        }
    },
    
    /**
     * Lädt alle Charaktere eines Users
     * @param {string} userId - Die User-ID
     * @returns {Array} - Array von Charakteren
     */
    loadAllCharacters(userId) {
        try {
            if (!userId) {
                console.warn('StorageManager: Keine User-ID angegeben');
                return [];
            }
            
            const storageKey = `${this.STORAGE_KEYS.CHARACTERS}_${userId}`;
            const saved = localStateManager.getItem(storageKey);
            
            if (!saved) {
                // Migration: Prüfe alten globalen Speicher
                return this._migrateFromOldStorage(userId);
            }
            
            const characters = JSON.parse(saved);
            
            // Migration für jeden Character
            return characters.map(char => this._migrateIfNeeded(char));
            
        } catch (error) {
            console.error('StorageManager: Fehler beim Laden:', error);
            return [];
        }
    },
    
    /**
     * Lädt einen einzelnen Character
     * @param {string} characterId - Die Character-ID
     * @param {string} userId - Die User-ID
     * @returns {Object|null}
     */
    loadCharacter(characterId, userId) {
        const characters = this.loadAllCharacters(userId);
        return characters.find(c => c.id === characterId) || null;
    },
    
    /**
     * Löscht einen Character
     * @param {string} characterId - Die Character-ID
     * @param {string} userId - Die User-ID
     * @returns {boolean}
     */
    deleteCharacter(characterId, userId) {
        try {
            const characters = this.loadAllCharacters(userId);
            const filtered = characters.filter(c => c.id !== characterId);
            
            const storageKey = `${this.STORAGE_KEYS.CHARACTERS}_${userId}`;
            localStateManager.setItem(storageKey, JSON.stringify(filtered));
            
            return true;
        } catch (error) {
            console.error('StorageManager: Fehler beim Löschen:', error);
            return false;
        }
    },
    
    // === SCHEMA-MIGRATION ===
    
    /**
     * Migriert einen Character falls nötig
     * @private
     */
    _migrateIfNeeded(character) {
        if (!character) return character;
        
        const version = character._schemaVersion || 0;
        
        // v0 → v1: Grundlegende Struktur-Updates
        if (version < 1) {
            character = this._migrateV0ToV1(character);
        }
        
        // v1 → v2: Erweiterte Felder
        if (version < 2) {
            character = this._migrateV1ToV2(character);
        }
        
        return character;
    },
    
    /**
     * Migration von v0 zu v1
     * @private
     */
    _migrateV0ToV1(character) {
        console.log(`StorageManager: Migriere Character ${character.id} von v0 zu v1`);
        
        // Resistances hinzufügen falls fehlend
        if (!character.resistances) {
            character.resistances = {
                chakra: 0,
                koerper: 0,
                geist: 0
            };
        }
        
        // Talents umstrukturieren
        if (Array.isArray(character.talents)) {
            character.talents = {
                selected: character.talents,
                pointsSpent: character.talents.reduce((sum, t) => sum + (t.cost || 0), 0)
            };
        }
        
        // Stats-Struktur sicherstellen
        if (!character.stats) {
            character.stats = {
                hp: { current: 30, max: 30 },
                chakra: { current: 100, max: 100 },
                stamina: 3,
                karma: 0
            };
        }
        
        character._schemaVersion = 1;
        return character;
    },
    
    /**
     * Migration von v1 zu v2
     * @private
     */
    _migrateV1ToV2(character) {
        console.log(`StorageManager: Migriere Character ${character.id} von v1 zu v2`);
        
        // Status Effects hinzufügen
        if (!character.statusEffects) {
            character.statusEffects = [];
        }
        
        // Kekkei Genkai hinzufügen
        if (!character.kekkeiGenkai) {
            character.kekkeiGenkai = null;
        }
        
        // AP-Struktur sicherstellen
        if (!character.ap || typeof character.ap !== 'object') {
            character.ap = {
                total: character.level > 1 ? (character.level - 1) * 2 : 0,
                spent: 0
            };
        }
        
        // Equipment-Struktur sicherstellen
        if (!character.equipment) {
            character.equipment = {
                weapon: null,
                armor: null,
                accessory: null
            };
        }
        
        character._schemaVersion = 2;
        return character;
    },
    
    /**
     * Migration vom alten globalen Speicher
     * @private
     */
    _migrateFromOldStorage(userId) {
        try {
            // Prüfe alten globalen Key
            const oldKey = 'npu_characters';
            const oldData = localStateManager.getItem(oldKey);
            
            if (!oldData) return [];
            
            console.log('StorageManager: Migriere von altem globalen Speicher...');
            
            const allCharacters = JSON.parse(oldData);
            
            // Filtere Charaktere für diesen User
            const userCharacters = allCharacters.filter(c => 
                c.userId === userId || !c.userId // Charaktere ohne userId auch migrieren
            );
            
            // Weise Charaktere ohne userId diesem User zu
            userCharacters.forEach(c => {
                if (!c.userId) c.userId = userId;
            });
            
            // Speichere im neuen Format
            const storageKey = `${this.STORAGE_KEYS.CHARACTERS}_${userId}`;
            localStateManager.setItem(storageKey, JSON.stringify(userCharacters));
            
            console.log(`StorageManager: ${userCharacters.length} Charaktere migriert`);
            
            return userCharacters.map(c => this._migrateIfNeeded(c));
            
        } catch (error) {
            console.error('StorageManager: Fehler bei Migration:', error);
            return [];
        }
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Gibt die aktuelle User-ID zurück
     * @private
     */
    _getCurrentUserId() {
        // Versuche aus AuthSystem zu laden
        if (typeof AuthSystem !== 'undefined' && AuthSystem.getCurrentUser) {
            const user = AuthSystem.getCurrentUser();
            return user?.id;
        }
        
        // Fallback: Aus localStorage
        try {
            const userData = localStateManager.getItem(this.STORAGE_KEYS.CURRENT_USER);
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }
        } catch (e) {
            console.error('StorageManager: Fehler beim Lesen des Users:', e);
        }
        
        return null;
    },
    
    /**
     * Exportiert einen Character als JSON
     * @param {string} characterId - Die Character-ID
     * @param {string} userId - Die User-ID
     * @returns {string|null} - JSON-String
     */
    exportCharacter(characterId, userId) {
        const character = this.loadCharacter(characterId, userId);
        if (!character) return null;
        
        return JSON.stringify(character, null, 2);
    },
    
    /**
     * Importiert einen Character aus JSON
     * @param {string} json - Der JSON-String
     * @param {string} userId - Die User-ID
     * @returns {Object|null} - Der importierte Character
     */
    importCharacter(json, userId) {
        try {
            const character = JSON.parse(json);
            
            // Neue ID vergeben (um Konflikte zu vermeiden)
            character.id = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            character.userId = userId;
            
            // Migration anwenden
            const migrated = this._migrateIfNeeded(character);
            
            // Speichern
            this.StateManager.saveState(migrated);
            
            return migrated;
        } catch (error) {
            console.error('StorageManager: Fehler beim Import:', error);
            return null;
        }
    },
    
    /**
     * Erstellt ein Backup aller Charaktere
     * @param {string} userId - Die User-ID
     * @returns {string} - Backup als JSON-String
     */
    createBackup(userId) {
        const characters = this.loadAllCharacters(userId);
        const backup = {
            version: this.CURRENT_SCHEMA_VERSION,
            createdAt: new Date().toISOString(),
            userId: userId,
            characters: characters
        };
        return JSON.stringify(backup, null, 2);
    },
    
    /**
     * Stellt ein Backup wieder her
     * @param {string} backupJson - Das Backup
     * @returns {boolean}
     */
    restoreBackup(backupJson) {
        try {
            const backup = JSON.parse(backupJson);
            
            if (!backup.characters || !Array.isArray(backup.characters)) {
                throw new Error('Ungültiges Backup-Format');
            }
            
            const userId = backup.userId || this._getCurrentUserId();
            if (!userId) {
                throw new Error('Keine User-ID im Backup oder aktuell eingeloggt');
            }
            
            // Charaktere migrieren und speichern
            const storageKey = `${this.STORAGE_KEYS.CHARACTERS}_${userId}`;
            const migrated = backup.characters.map(c => this._migrateIfNeeded(c));
            localStateManager.setItem(storageKey, JSON.stringify(migrated));
            
            return true;
        } catch (error) {
            console.error('StorageManager: Fehler bei Restore:', error);
            return false;
        }
    },
    
    /**
     * Debug-Informationen
     */
    debug() {
        console.group('StorageManager Debug');
        console.log('Schema Version:', this.CURRENT_SCHEMA_VERSION);
        console.log('Current User ID:', this._getCurrentUserId());
        
        const userId = this._getCurrentUserId();
        if (userId) {
            const characters = this.loadAllCharacters(userId);
            console.log('Characters:', characters.length);
            characters.forEach(c => {
                console.log(`  - ${c.name} (v${c._schemaVersion || 0})`);
            });
        }
        console.groupEnd();
    }
};

// Global verfügbar machen
window.StorageManager = StorageManager;
