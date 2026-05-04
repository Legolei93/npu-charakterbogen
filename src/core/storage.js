/**
 * STORAGE SYSTEM - Zentrale Datenspeicherung
 * 
 * Alle localStorage-Zugriffe werden hier zentralisiert.
 * Dies ermöglicht:
 * - Einheitliche Fehlerbehandlung
 * - Einfache Migration zu anderer Speichermethode
 * - Bessere Testbarkeit
 * 
 * WICHTIG: Diese Datei ersetzt schrittweise die Funktionen in app.js
 */

const Storage = {
    // ============================================
    // KONSTANTEN
    // ============================================
    
    KEYS: {
        CHARACTERS: 'npu_characters',
        CURRENT_CHARACTER: 'npu_current_character',
        ACTIVITY_LOG: 'dm_activity_log',
        MERCHANT_INVENTORY: 'merchant_inventory_',
        PLAYER_TRUST: 'trust_',
        SETTINGS: 'npu_settings'
    },
    
    // ============================================
    // CHARAKTER-SPEICHERUNG
    // ============================================
    
    /**
     * Speichert einen Charakter
     * @param {Object} character - Der zu speichernde Charakter
     * @returns {boolean} - true bei Erfolg, false bei Fehler
     */
    StateManager.saveState(character) {
        try {
            if (!character || !character.id) {
                console.error('Storage: Ungültiger Charakter');
                return false;
            }
            
            // Aktualisiere Zeitstempel
            character.lastModified = new Date().toISOString();
            
            // Lade bestehende Charaktere
            const characters = this.getAllCharacters();
            
            // Prüfe ob Charakter bereits existiert
            const existingIndex = characters.findIndex(c => c.id === character.id);
            
            if (existingIndex >= 0) {
                // Aktualisiere bestehenden Charakter
                characters[existingIndex] = character;
            } else {
                // Füge neuen Charakter hinzu
                characters.push(character);
            }
            
            // Speichere im localStorage
            localStateManager.setItem(this.KEYS.CHARACTERS, JSON.stringify(characters));
            
            // Speichere auch als Einzeldatei (für schnelleren Zugriff)
            localStateManager.setItem(`npu_character_${character.id}`, JSON.stringify(character));
            
            console.log('Storage: Charakter gespeichert:', character.name);
            return true;
            
        } catch (error) {
            console.error('Storage: Fehler beim Speichern:', error);
            return false;
        }
    },
    
    /**
     * Lädt einen Charakter anhand der ID
     * @param {string} id - Die Charakter-ID
     * @returns {Object|null} - Der Charakter oder null
     */
    getCharacterById(id) {
        try {
            // Versuche zuerst Einzeldatei (schneller)
            const single = localStateManager.getItem(`npu_character_${id}`);
            if (single) {
                return JSON.parse(single);
            }
            
            // Fallback: Suche in der Liste
            const characters = this.getAllCharacters();
            return characters.find(c => c.id === id) || null;
            
        } catch (error) {
            console.error('Storage: Fehler beim Laden:', error);
            return null;
        }
    },
    
    /**
     * Lädt alle Charaktere
     * @returns {Array} - Array aller Charaktere
     */
    getAllCharacters() {
        try {
            // Versuche zuerst die neue Struktur
            const saved = localStateManager.getItem(this.KEYS.CHARACTERS);
            if (saved) {
                return JSON.parse(saved);
            }
            
            // Fallback: Alte Struktur
            const oldSaved = localStateManager.getItem('npu_characters');
            if (oldSaved) {
                return JSON.parse(oldSaved);
            }
            
            return [];
            
        } catch (error) {
            console.error('Storage: Fehler beim Laden aller Charaktere:', error);
            return [];
        }
    },
    
    /**
     * Löscht einen Charakter
     * @param {string} id - Die Charakter-ID
     * @returns {boolean} - true bei Erfolg
     */
    deleteCharacter(id) {
        try {
            // Entferne aus der Liste
            const characters = this.getAllCharacters().filter(c => c.id !== id);
            localStateManager.setItem(this.KEYS.CHARACTERS, JSON.stringify(characters));
            
            // Entferne Einzeldatei
            localStorage.removeItem(`npu_character_${id}`);
            
            console.log('Storage: Charakter gelöscht:', id);
            return true;
            
        } catch (error) {
            console.error('Storage: Fehler beim Löschen:', error);
            return false;
        }
    },
    
    // ============================================
    // AKTUELLER CHARAKTER (SESSION)
    // ============================================
    
    /**
     * Speichert den aktuell bearbeiteten Charakter
     * @param {Object} character - Der aktuelle Charakter
     */
    setCurrentCharacter(character) {
        try {
            if (character) {
                localStateManager.setItem(this.KEYS.CURRENT_CHARACTER, JSON.stringify(character));
            } else {
                localStorage.removeItem(this.KEYS.CURRENT_CHARACTER);
            }
        } catch (error) {
            console.error('Storage: Fehler beim Setzen des aktuellen Charakters:', error);
        }
    },
    
    /**
     * Lädt den aktuell bearbeiteten Charakter
     * @returns {Object|null} - Der aktuelle Charakter oder null
     */
    getCurrentCharacter() {
        try {
            const saved = localStateManager.getItem(this.KEYS.CURRENT_CHARACTER);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Storage: Fehler beim Laden des aktuellen Charakters:', error);
            return null;
        }
    },
    
    // ============================================
    // DM PANEL DATEN
    // ============================================
    
    /**
     * Speichert das Aktivitätslog
     * @param {Array} log - Das Aktivitätslog
     */
    saveActivityLog(log) {
        try {
            localStateManager.setItem(this.KEYS.ACTIVITY_LOG, JSON.stringify(log));
        } catch (error) {
            console.error('Storage: Fehler beim Speichern des Logs:', error);
        }
    },
    
    /**
     * Lädt das Aktivitätslog
     * @returns {Array} - Das Aktivitätslog
     */
    getActivityLog() {
        try {
            const saved = localStateManager.getItem(this.KEYS.ACTIVITY_LOG);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Storage: Fehler beim Laden des Logs:', error);
            return [];
        }
    },
    
    /**
     * Speichert Händler-Inventar
     * @param {string} merchantId - Händler-ID
     * @param {Object} inventory - Das Inventar
     */
    saveMerchantInventory(merchantId, inventory) {
        try {
            localStateManager.setItem(
                this.KEYS.MERCHANT_INVENTORY + merchantId,
                JSON.stringify(inventory)
            );
        } catch (error) {
            console.error('Storage: Fehler beim Speichern des Inventars:', error);
        }
    },
    
    /**
     * Lädt Händler-Inventar
     * @param {string} merchantId - Händler-ID
     * @returns {Object|null} - Das Inventar
     */
    getMerchantInventory(merchantId) {
        try {
            const saved = localStateManager.getItem(this.KEYS.MERCHANT_INVENTORY + merchantId);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Storage: Fehler beim Laden des Inventars:', error);
            return null;
        }
    },
    
    /**
     * Speichert Spieler-Vertrauen für einen Händler
     * @param {string} playerId - Spieler-ID
     * @param {string} merchantId - Händler-ID
     * @param {number} value - Vertrauenswert
     */
    setPlayerMerchantTrust(playerId, merchantId, value) {
        try {
            const key = `${this.KEYS.PLAYER_TRUST}${playerId}_${merchantId}`;
            localStateManager.setItem(key, value.toString());
        } catch (error) {
            console.error('Storage: Fehler beim Speichern des Vertrauens:', error);
        }
    },
    
    /**
     * Lädt Spieler-Vertrauen für einen Händler
     * @param {string} playerId - Spieler-ID
     * @param {string} merchantId - Händler-ID
     * @param {number} defaultValue - Standardwert
     * @returns {number} - Vertrauenswert
     */
    getPlayerMerchantTrust(playerId, merchantId, defaultValue = 20) {
        try {
            const key = `${this.KEYS.PLAYER_TRUST}${playerId}_${merchantId}`;
            const saved = localStateManager.getItem(key);
            return saved ? parseInt(saved) : defaultValue;
        } catch (error) {
            console.error('Storage: Fehler beim Laden des Vertrauens:', error);
            return defaultValue;
        }
    },
    
    // ============================================
    // EINSTELLUNGEN
    // ============================================
    
    /**
     * Speichert Einstellungen
     * @param {Object} settings - Die Einstellungen
     */
    saveSettings(settings) {
        try {
            localStateManager.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Storage: Fehler beim Speichern der Einstellungen:', error);
        }
    },
    
    /**
     * Lädt Einstellungen
     * @returns {Object} - Die Einstellungen
     */
    getSettings() {
        try {
            const saved = localStateManager.getItem(this.KEYS.SETTINGS);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Storage: Fehler beim Laden der Einstellungen:', error);
            return {};
        }
    },
    
    // ============================================
    // BACKUP & WARTUNG
    // ============================================
    
    /**
     * Erstellt ein Backup aller Daten
     * @returns {Object} - Backup-Objekt
     */
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            characters: this.getAllCharacters(),
            activityLog: this.getActivityLog(),
            settings: this.getSettings()
        };
        return backup;
    },
    
    /**
     * Stellt Daten aus einem Backup wieder her
     * @param {Object} backup - Das Backup-Objekt
     * @returns {boolean} - true bei Erfolg
     */
    restoreBackup(backup) {
        try {
            if (backup.characters) {
                localStateManager.setItem(this.KEYS.CHARACTERS, JSON.stringify(backup.characters));
            }
            if (backup.activityLog) {
                this.saveActivityLog(backup.activityLog);
            }
            if (backup.settings) {
                this.saveSettings(backup.settings);
            }
            console.log('Storage: Backup wiederhergestellt');
            return true;
        } catch (error) {
            console.error('Storage: Fehler bei Backup-Wiederherstellung:', error);
            return false;
        }
    },
    
    /**
     * Löscht alle Daten (VORSICHT!)
     */
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                if (typeof key === 'string') {
                    localStorage.removeItem(key);
                }
            });
            console.log('Storage: Alle Daten gelöscht');
        } catch (error) {
            console.error('Storage: Fehler beim Löschen:', error);
        }
    }
};

// Global exportieren
window.Storage = Storage;

console.log('✅ Storage System geladen');
