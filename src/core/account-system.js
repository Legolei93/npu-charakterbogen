/**
 * Account Isolation System v4.0
 * 
 * Stellt sicher, dass:
 * - Jeder User nur seine eigenen Daten sieht
 * - Charaktere sind user-spezifisch gespeichert
 * - Keine Daten-Lecks zwischen Sessions
 * - Sauberer Logout/Login
 */

const AccountSystem = {
    
    // === KONFIGURATION ===
    CONFIG: {
        STORAGE_PREFIX: 'npu_v4_',
        MAX_CHARACTERS_PER_USER: 10
    },
    
    // === STATE ===
    currentUser: null,
    currentCharacter: null,
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert das Account System
     */
    init() {
        console.log('[AccountSystem] Initialisiere...');
        
        // Gespeicherte Session wiederherstellen
        this._restoreSession();
        
        // Auf Storage-Changes reagieren
        window.addEventListener('storage', (e) => {
            if (e.key === this._getKey('session')) {
                this._handleStorageChange(e);
            }
        });
        
        console.log('[AccountSystem] Initialisiert');
    },
    
    /**
     * Login durchführen
     * @param {string} username
     * @param {string} password
     * @returns {Object} - Login-Ergebnis
     */
    login(username, password) {
        console.log('[AccountSystem] Login versuch:', username);
        
        // Validierung
        if (!username || !password) {
            return { success: false, error: 'Benutzername und Passwort erforderlich' };
        }
        
        // Test-Accounts
        const testAccounts = {
            'Alex': { 
                password: 'Alex-Osterhase-1993', 
                role: 'dm',
                id: 'dm_alex'
            },
            'Niklas': { 
                password: 'Naruto', 
                role: 'player',
                id: 'player_niklas'
            },
            'Sascha': { 
                password: 'Naruto', 
                role: 'player',
                id: 'player_sascha'
            },
            'Richard': { 
                password: 'Naruto', 
                role: 'player',
                id: 'player_richard'
            },
            'Michael': { 
                password: 'Naruto', 
                role: 'player',
                id: 'player_michael'
            },
            'Kevin': { 
                password: 'Naruto', 
                role: 'player',
                id: 'player_kevin'
            }
        };
        
        const account = testAccounts[username];
        if (!account || account.password !== password) {
            return { success: false, error: 'Falsche Anmeldedaten' };
        }
        
        // Alte Session aufräumen
        this._clearOldSession();
        
        // Neue Session erstellen
        this.currentUser = {
            id: account.id,
            username: username,
            role: account.role,
            loginTime: new Date().toISOString()
        };
        
        // Session speichern
        this._saveSession();
        
        // AuthSystem aktualisieren
        if (typeof AuthSystem !== 'undefined') {
            AuthSystem.currentUser = this.currentUser;
        }
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('account:login', this.currentUser);
        }
        
        console.log('[AccountSystem] Login erfolgreich:', username);
        
        return {
            success: true,
            user: this.currentUser,
            isDM: account.role === 'dm'
        };
    },
    
    /**
     * Logout durchführen
     */
    logout() {
        console.log('[AccountSystem] Logout');
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('account:logout', this.currentUser);
        }
        
        // Session löschen
        this._clearSession();
        
        // State zurücksetzen
        this.currentUser = null;
        this.currentCharacter = null;
        window.currentCharacter = null;
        
        // AuthSystem zurücksetzen
        if (typeof AuthSystem !== 'undefined') {
            AuthSystem.currentUser = null;
        }
        
        console.log('[AccountSystem] Logout abgeschlossen');
    },
    
    // === CHARACTER MANAGEMENT ===
    
    /**
     * Speichert einen Charakter
     * @param {Object} character
     * @returns {boolean}
     */
    saveCharacter(character) {
        if (!this.currentUser) {
            console.error('[AccountSystem] Kein User eingeloggt');
            return false;
        }
        
        if (!character || !character.id) {
            console.error('[AccountSystem] Ungültiger Charakter');
            return false;
        }
        
        // Charakter mit User-ID verknüpfen
        character._userId = this.currentUser.id;
        character._lastSaved = new Date().toISOString();
        
        // Speichern
        const key = this._getCharacterKey(character.id);
        try {
            localStorage.setItem(key, JSON.stringify(character));
            
            // Zur Charakter-Liste hinzufügen
            this._addToCharacterList(character.id, character.name);
            
            this.currentCharacter = character;
            window.currentCharacter = character;
            
            console.log('[AccountSystem] Charakter gespeichert:', character.name);
            return true;
        } catch (e) {
            console.error('[AccountSystem] Fehler beim Speichern:', e);
            return false;
        }
    },
    
    /**
     * Lädt einen Charakter
     * @param {string} characterId
     * @returns {Object|null}
     */
    loadCharacter(characterId) {
        if (!this.currentUser) {
            console.error('[AccountSystem] Kein User eingeloggt');
            return null;
        }
        
        const key = this._getCharacterKey(characterId);
        
        try {
            const stored = localStorage.getItem(key);
            if (!stored) {
                console.warn('[AccountSystem] Charakter nicht gefunden:', characterId);
                return null;
            }
            
            const character = JSON.parse(stored);
            
            // Prüfe ob Charakter zum User gehört
            if (character._userId !== this.currentUser.id) {
                console.error('[AccountSystem] Charakter gehört nicht zum aktuellen User!');
                return null;
            }
            
            this.currentCharacter = character;
            window.currentCharacter = character;
            
            console.log('[AccountSystem] Charakter geladen:', character.name);
            
            // Event auslösen
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('character:loaded', character);
            }
            
            return character;
        } catch (e) {
            console.error('[AccountSystem] Fehler beim Laden:', e);
            return null;
        }
    },
    
    /**
     * Gibt alle Charaktere des aktuellen Users zurück
     * @returns {Array}
     */
    getUserCharacters() {
        if (!this.currentUser) return [];
        
        const characters = [];
        const prefix = this._getCharacterPrefix();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                try {
                    const char = JSON.parse(localStorage.getItem(key));
                    if (char._userId === this.currentUser.id) {
                        characters.push({
                            id: char.id,
                            name: char.name,
                            level: char.level || 1,
                            clan: char.clan || 'Kein Clan'
                        });
                    }
                } catch (e) {
                    console.warn('[AccountSystem] Fehler beim Parsen:', key);
                }
            }
        }
        
        return characters;
    },
    
    /**
     * Löscht einen Charakter
     * @param {string} characterId
     * @returns {boolean}
     */
    deleteCharacter(characterId) {
        if (!this.currentUser) return false;
        
        const key = this._getCharacterKey(characterId);
        
        try {
            // Prüfe vorher ob Charakter existiert und zum User gehört
            const stored = localStorage.getItem(key);
            if (stored) {
                const char = JSON.parse(stored);
                if (char._userId !== this.currentUser.id) {
                    console.error('[AccountSystem] Charakter gehört nicht zum User');
                    return false;
                }
            }
            
            localStorage.removeItem(key);
            this._removeFromCharacterList(characterId);
            
            if (this.currentCharacter?.id === characterId) {
                this.currentCharacter = null;
                window.currentCharacter = null;
            }
            
            console.log('[AccountSystem] Charakter gelöscht:', characterId);
            return true;
        } catch (e) {
            console.error('[AccountSystem] Fehler beim Löschen:', e);
            return false;
        }
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Speichert die Session
     * @private
     */
    _saveSession() {
        if (!this.currentUser) return;
        
        const sessionData = {
            user: this.currentUser,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(this._getKey('session'), JSON.stringify(sessionData));
        sessionStorage.setItem(this._getKey('session'), JSON.stringify(sessionData));
    },
    
    /**
     * Stellt eine Session wieder her
     * @private
     */
    _restoreSession() {
        // Versuche aus sessionStorage
        let sessionData = null;
        
        try {
            const sessionStr = sessionStorage.getItem(this._getKey('session'));
            if (sessionStr) {
                sessionData = JSON.parse(sessionStr);
            }
        } catch (e) {
            console.warn('[AccountSystem] Session konnte nicht aus sessionStorage geladen werden');
        }
        
        // Fallback zu localStorage
        if (!sessionData) {
            try {
                const localStr = localStorage.getItem(this._getKey('session'));
                if (localStr) {
                    sessionData = JSON.parse(localStr);
                }
            } catch (e) {
                console.warn('[AccountSystem] Session konnte nicht aus localStorage geladen werden');
            }
        }
        
        if (sessionData?.user) {
            this.currentUser = sessionData.user;
            
            if (typeof AuthSystem !== 'undefined') {
                AuthSystem.currentUser = this.currentUser;
            }
            
            console.log('[AccountSystem] Session wiederhergestellt:', this.currentUser.username);
        }
    },
    
    /**
     * Löscht die Session
     * @private
     */
    _clearSession() {
        localStorage.removeItem(this._getKey('session'));
        sessionStorage.removeItem(this._getKey('session'));
    },
    
    /**
     * Räumt alte Sessions auf
     * @private
     */
    _clearOldSession() {
        // Lösche nur Session-Daten, NICHT Charakter-Daten
        const keysToDelete = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('_session') || key === 'npu_current_user')) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => localStorage.removeItem(key));
    },
    
    /**
     * Handhabt Storage-Changes
     * @private
     */
    _handleStorageChange(e) {
        if (e.newValue === null) {
            // Session wurde gelöscht - möglicherweise Logout in anderem Tab
            console.log('[AccountSystem] Session extern gelöscht');
        }
    },
    
    /**
     * Generiert einen Storage-Key
     * @private
     */
    _getKey(type) {
        return `${this.CONFIG.STORAGE_PREFIX}${type}`;
    },
    
    /**
     * Generiert einen Charakter-Key
     * @private
     */
    _getCharacterKey(characterId) {
        if (!this.currentUser) return null;
        return `${this.CONFIG.STORAGE_PREFIX}char_${this.currentUser.id}_${characterId}`;
    },
    
    /**
     * Generiert den Charakter-Prefix
     * @private
     */
    _getCharacterPrefix() {
        if (!this.currentUser) return null;
        return `${this.CONFIG.STORAGE_PREFIX}char_${this.currentUser.id}_`;
    },
    
    /**
     * Fügt einen Charakter zur Liste hinzu
     * @private
     */
    _addToCharacterList(characterId, characterName) {
        const listKey = this._getKey('character_list');
        let list = [];
        
        try {
            const stored = localStorage.getItem(listKey);
            if (stored) {
                list = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[AccountSystem] Fehler beim Laden der Charakter-Liste');
        }
        
        // Entferne existierenden Eintrag
        list = list.filter(c => c.id !== characterId);
        
        // Füge neuen Eintrag hinzu
        list.push({
            id: characterId,
            name: characterName,
            userId: this.currentUser.id
        });
        
        localStorage.setItem(listKey, JSON.stringify(list));
    },
    
    /**
     * Entfernt einen Charakter aus der Liste
     * @private
     */
    _removeFromCharacterList(characterId) {
        const listKey = this._getKey('character_list');
        
        try {
            const stored = localStorage.getItem(listKey);
            if (stored) {
                const list = JSON.parse(stored);
                const filtered = list.filter(c => c.id !== characterId);
                localStorage.setItem(listKey, JSON.stringify(filtered));
            }
        } catch (e) {
            console.warn('[AccountSystem] Fehler beim Aktualisieren der Charakter-Liste');
        }
    },
    
    // === GETTER ===
    
    /**
     * Gibt den aktuellen User zurück
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    },
    
    /**
     * Gibt den aktuellen Charakter zurück
     * @returns {Object|null}
     */
    getCurrentCharacter() {
        return this.currentCharacter;
    },
    
    /**
     * Prüft ob ein User eingeloggt ist
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    /**
     * Prüft ob der aktuelle User DM ist
     * @returns {boolean}
     */
    isDM() {
        return this.currentUser?.role === 'dm';
    }
};

// Global verfügbar machen
window.AccountSystem = AccountSystem;

// Automatisch initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccountSystem.init());
} else {
    AccountSystem.init();
}

console.log('[AccountSystem] Geladen');
