/**
 * StateManager v4.0 - Zentrale State-Verwaltung
 * 
 * Features:
 * - Single Source of Truth für Character-Daten
 * - Event-basierte Updates
 * - Persistenz-Management
 * - Account-Isolation
 */

const StateManager = {
    
    // === STATE ===
    _character: null,
    _userId: null,
    _listeners: [],
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert den StateManager
     */
    init() {
        console.log('[StateManager] Initialisiert');
        
        // User ID ermitteln
        this._updateUserId();
        
        // Nur laden wenn User vorhanden
        if (this._userId) {
            this.onUserLogin(this._userId);
        } else {
            console.warn('[StateManager] Init ohne User - warte auf Login');
        }
        
        // Auf Login/Logout reagieren
        this._setupAuthListeners();
    },
    
    /**
     * Wird aufgerufen wenn ein User einloggt
     * @param {string} userId - Die User ID
     */
    onUserLogin(userId) {
        // FIX 4: STATE MANAGER DEBUG
        console.log('[CHAR LOAD] Login User:', userId);
        
        if (!userId) {
            console.warn('[StateManager] onUserLogin ohne userId');
            return;
        }
        
        this._userId = userId;
        
        // Charaktere laden
        var characters = [];
        if (typeof CharacterService !== 'undefined') {
            characters = CharacterService.loadAll(userId);
        } else if (typeof StorageManager !== 'undefined') {
            characters = StorageManager.loadAllCharacters(userId);
        } else if (typeof AccountSystem !== 'undefined') {
            // Fallback auf AccountSystem
            characters = AccountSystem.getCharactersForUser(userId);
        }
        
        // FIX 4: Debug Log
        console.log('[CHAR LOAD]', userId, characters);
        
        if (!characters || characters.length === 0) {
            console.warn('[CHAR LOAD] Keine Characters gefunden!');
            this._character = null;
            window.currentCharacter = null;
        } else {
            this.setCharacter(characters[0]);
            console.log('[CHAR LOAD] Character geladen:', characters[0].name);
        }
        
        // === QUEST ENGINE RE-INIT NACH LOGIN ===
        if (typeof QuestEngine !== 'undefined' && QuestEngine.init) {
            console.log('[StateManager] QuestEngine init nach Login');
            QuestEngine.init();
        }
        
        // Event auslösen
        this._emit('user:login', { userId: userId, character: this._character });
    },
    
    /**
     * Setup Auth Listener
     * @private
     */
    _setupAuthListeners() {
        // Auf Storage-Changes reagieren (für Multi-Tab-Sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'npu_current_user') {
                this._updateUserId();
                if (this._userId) {
                    this.onUserLogin(this._userId);
                }
            }
        });
    },
    
    /**
     * Aktualisiert die User ID
     * @private
     */
    _updateUserId() {
        // Versuche User ID aus verschiedenen Quellen zu ermitteln
        let userId = null;
        
        // Aus AuthSystem
        if (typeof AuthSystem !== 'undefined' && AuthSystem.getCurrentUser) {
            const user = AuthSystem.getCurrentUser();
            userId = user?.username || user?.id;
        }
        
        // Aus localStorage
        if (!userId) {
            try {
                const stored = localStorage.getItem('npu_current_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    userId = user.username || user.id;
                }
            } catch (e) {
                console.warn('[StateManager] Konnte User nicht aus localStorage laden');
            }
        }
        
        // Aus SessionStorage
        if (!userId) {
            try {
                const stored = sessionStorage.getItem('npu_current_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    userId = user.username || user.id;
                }
            } catch (e) {
                console.warn('[StateManager] Konnte User nicht aus SessionStorage laden');
            }
        }
        
        this._userId = userId;
        console.log('[StateManager] User ID:', userId);
    },
    
    // === CHARACTER MANAGEMENT ===
    
    /**
     * Lädt den Character
     * @private
     */
    _loadCharacter() {
        if (!this._userId) {
            console.warn('[StateManager] Kein User, kann Character nicht laden');
            return;
        }
        
        const storageKey = `npu_character_${this._userId}`;
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                this._character = JSON.parse(stored);
                console.log('[StateManager] Character geladen für', this._userId);
            } else {
                console.log('[StateManager] Kein Character gefunden für', this._userId);
                this._character = null;
            }
        } catch (e) {
            console.error('[StateManager] Fehler beim Laden des Characters:', e);
            this._character = null;
        }
        
        // Globale Variable aktualisieren
        window.currentCharacter = this._character;
        
        // Event auslösen
        this._emit('character:loaded', this._character);
    },
    
    /**
     * Speichert den Character
     * @private
     */
    _saveCharacter() {
        if (!this._userId || !this._character) {
            console.warn('[StateManager] Kein User oder Character zum Speichern');
            return false;
        }
        
        const storageKey = `npu_character_${this._userId}`;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(this._character));
            console.log('[StateManager] Character gespeichert für', this._userId);
            return true;
        } catch (e) {
            console.error('[StateManager] Fehler beim Speichern des Characters:', e);
            return false;
        }
    },
    
    /**
     * Gibt den aktuellen Character zurück
     * @returns {Object|null}
     */
    getCharacter() {
        return this._character;
    },
    
    /**
     * Setzt den Character
     * @param {Object} character
     */
    setCharacter(character) {
        if (!character) {
            console.warn('[StateManager] setCharacter mit null aufgerufen');
            return;
        }
        
        this._character = character;
        window.currentCharacter = character;
        
        // Speichern für Persistenz
        this._saveCharacter();
        
        this._emit('character:changed', character);
        console.log('[StateManager] Aktiver Character:', character.name);
    },
    
    /**
     * Aktualisiert den Character
     * @param {Object} updates
     */
    updateCharacter(updates) {
        if (!this._character) {
            console.warn('[StateManager] updateCharacter blockiert - kein Character geladen');
            return { success: false, error: 'NO_CHARACTER' };
        }
        
        this._character = {
            ...this._character,
            ...updates,
            lastUpdated: new Date().toISOString()
        };
        
        window.currentCharacter = this._character;
        this._saveCharacter();
        this._emit('character:updated', this._character);
        return { success: true };
    },
    
    /**
     * Aktualisiert einen spezifischen Pfad im Character
     * @param {string} path - Punkt-getrennter Pfad (z.B. 'stats.hp.current')
     * @param {*} value
     */
    setCharacterPath(path, value) {
        if (!this._character) {
            console.warn('[StateManager] Kein Character zum Aktualisieren');
            return;
        }
        
        const keys = path.split('.');
        let current = this._character;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        
        this._saveCharacter();
        this._emit('character:updated', this._character);
    },
    
    // === EVENT SYSTEM ===
    
    /**
     * Registriert einen Listener
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        this._listeners.push({ event, callback });
    },
    
    /**
     * Entfernt einen Listener
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
        this._listeners = this._listeners.filter(
            l => !(l.event === event && l.callback === callback)
        );
    },
    
    /**
     * Löst ein Event aus
     * @private
     */
    _emit(event, data) {
        this._listeners
            .filter(l => l.event === event)
            .forEach(l => {
                try {
                    l.callback(data);
                } catch (e) {
                    console.error('[StateManager] Fehler im Listener:', e);
                }
            });
        
        // Auch auf window.EventBus emittern wenn verfügbar
        if (typeof EventBus !== 'undefined' && EventBus.emit) {
            EventBus.emit(event, data);
        }
    },
    
    // === USER MANAGEMENT ===
    
    /**
     * Gibt die aktuelle User ID zurück
     * @returns {string|null}
     */
    getUserId() {
        return this._userId;
    },
    
    /**
     * Wechselt den User
     * @param {string} userId
     */
    switchUser(userId) {
        console.log('[StateManager] Wechsle zu User:', userId);
        this._userId = userId;
        this._loadCharacter();
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Setzt den StateManager zurück (Logout)
     */
    clear() {
        console.log('[StateManager] Reset');
        
        this._userId = null;
        this._character = null;
        window.currentCharacter = null;
        
        // Internes Event
        this._emit('state:cleared', null);
        
        // Global EventBus für andere Komponenten
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('state:cleared');
            EventBus.emit('character:cleared');
        }
    },
    
    /**
     * Löscht alle Daten für den aktuellen User
     */
    clearUserData() {
        if (!this._userId) return;
        
        const storageKey = `npu_character_${this._userId}`;
        localStorage.removeItem(storageKey);
        
        // Auch Quest-State löschen
        const questKey = `npu_quests_${this._userId}`;
        localStorage.removeItem(questKey);
        
        this._character = null;
        window.currentCharacter = null;
        
        this._emit('character:cleared', null);
    },
    
    /**
     * Exportiert alle User-Daten
     * @returns {Object}
     */
    exportData() {
        const data = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('npu_')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        
        return data;
    },
    
    /**
     * Importiert User-Daten
     * @param {Object} data
     */
    importData(data) {
        Object.entries(data).forEach(([key, value]) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                localStorage.setItem(key, value);
            }
        });
        
        this._loadCharacter();
    }
};

// Global verfügbar machen
window.StateManager = StateManager;

// Automatisch initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StateManager.init());
} else {
    StateManager.init();
}
