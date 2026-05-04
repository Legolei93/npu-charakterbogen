/**
 * Character Service - Zentrale Character-Verwaltung
 * 
 * Extrahiert aus app.js:
 * - createNewCharacter() (Zeilen 874-983)
 * - saveCharacter() (Zeilen 3620-3653)
 * - loadCharacters() (Zeilen 3659-3679)
 * - loadCharacterById() (Zeilen 3685-3696)
 * 
 * Verantwortlich für:
 * - Character CRUD Operationen
 * - Character-Erstellung aus Wizard-Daten
 * - Clan-Boni Anwendung
 * - Startausrüstung
 */

const CharacterService = {
    
    // === CHARACTER ERSTELLUNG ===
    
    /**
     * Erstellt einen neuen leeren Character
     * @param {Object} template - Optionale Vorlage
     * @returns {Object} - Der neue Character
     */
    create(template = {}) {
        const character = {
            // Basis-Informationen
            id: 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: '',
            clan: 'none',
            level: 1,
            xp: 0,
            
            // Attribute Points
            ap: { total: 0, spent: 0 },
            
            // Attribute (alle starten bei 8)
            baseAttributes: {
                kk: 8,   // Körperkraft
                ges: 8,  // Geschicklichkeit
                kon: 8,  // Konstitution
                gsw: 8,  // Geschwindigkeit
                itu: 8,  // Intuition
                int: 8,  // Intelligenz
                cha: 8   // Charisma
            },
            
            // Berechnete Werte (werden von RulesEngine gesetzt)
            skills: {},
            combat: {},
            stats: {
                hp: { current: 0, max: 0 },
                chakra: { current: 0, max: 0 },
                stamina: 0,
                karma: 0,
                gold: 0
            },
            resistances: {
                chakra: 0,
                koerper: 0,
                geist: 0
            },
            modifiers: {},
            
            // Listen
            jutsus: [],
            talents: { selected: [], pointsSpent: 0 },
            inventory: [],
            elements: [],
            statusEffects: [],
            
            // Ausrüstung
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            
            // Meta
            userId: null,
            createdAt: new Date().toISOString(),
            _schemaVersion: 2
        };
        
        // Template anwenden
        Object.assign(character, template);
        
        return character;
    },
    
    /**
     * Erstellt einen Character aus Wizard-Daten
     * @param {Object} wizardData - Daten aus dem Character Creation Wizard
     * @returns {Object} - Der fertige Character
     */
    createFromWizard(wizardData) {
        // Basis-Character erstellen
        const character = this.create({
            name: wizardData.name,
            clan: wizardData.clan,
            baseAttributes: wizardData.attributes || wizardData.baseAttributes,
            elements: wizardData.elements || [],
            jutsus: wizardData.jutsus || [],
            talents: { 
                selected: wizardData.talents || [], 
                pointsSpent: (wizardData.talents || []).reduce((sum, t) => sum + (t.cost || 0), 0)
            }
        });
        
        // User-ID setzen
        const currentUser = this._getCurrentUser();
        if (currentUser) {
            character.userId = currentUser.id;
        }
        
        // Clan-Boni anwenden
        this.applyClanBonuses(character);
        
        // Berechne abgeleitete Werte mit RulesEngine
        if (typeof RulesEngine !== 'undefined') {
            const calculated = RulesEngine.calculateCharacter(character);
            character.skills = calculated.skills;
            character.combat = calculated.combat;
            character.stats = calculated.stats;
            character.resistances = calculated.resistances;
            character.modifiers = calculated.modifiers;
        }
        
        // Startausrüstung hinzufügen
        this.addStartingEquipment(character);
        
        // Start-Gold
        character.stats.gold = 100; // 100 Gold Startkapital
        
        return character;
    },
    
    /**
     * Wendet Clan-Boni auf einen Character an
     * @param {Object} character - Der Character
     */
    applyClanBonuses(character) {
        if (!character.clan || character.clan === 'none') return;
        
        // Versuche aus ClanData zu laden (neues System)
        if (typeof ClanData !== 'undefined') {
            const clanData = ClanData[character.clan];
            if (clanData) {
                this._applyClanData(character, clanData);
                return;
            }
        }
        
        // Fallback: Versuche aus CLAN_BONUSES zu laden (altes System)
        if (typeof CLAN_BONUSES !== 'undefined') {
            const clanData = CLAN_BONUSES[character.clan];
            if (clanData) {
                this._applyClanData(character, clanData);
            }
        }
    },
    
    /**
     * Wendet Clan-Daten an (Hilfsmethode)
     * @private
     */
    _applyClanData(character, clanData) {
        // Attribute-Boni
        if (clanData.bonuses) {
            Object.entries(clanData.bonuses).forEach(([stat, bonus]) => {
                if (character.baseAttributes[stat] !== undefined) {
                    character.baseAttributes[stat] += bonus;
                    // Sicherstellen dass wir nicht über 20 kommen
                    character.baseAttributes[stat] = Math.min(20, character.baseAttributes[stat]);
                }
            });
        }
        
        // Start-Jutsus
        if (clanData.startingJutsu && Array.isArray(clanData.startingJutsu)) {
            clanData.startingJutsu.forEach(jutsuId => {
                // Prüfe ob Jutsu bereits vorhanden
                const alreadyHas = character.jutsus.some(j => j.jutsuId === jutsuId);
                if (alreadyHas) return;
                
                // Jutsu-Daten finden
                let jutsuData = null;
                if (typeof JUTSU_DATA !== 'undefined') {
                    jutsuData = JUTSU_DATA.find(j => j.id === jutsuId);
                }
                
                // Fallback: Suche in CLAN_JUTSUS
                if (!jutsuData && typeof CLAN_JUTSUS !== 'undefined') {
                    const clanJutsus = CLAN_JUTSUS[character.clan] || [];
                    jutsuData = clanJutsus.find(j => j.id === jutsuId);
                }
                
                if (jutsuData) {
                    character.jutsus.push({
                        id: 'jutsu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        jutsuId: jutsuId,
                        name: jutsuData.name,
                        rank: jutsuData.rank,
                        level: 1,
                        status: 'learned',
                        element: jutsuData.element || 'neutral'
                    });
                }
            });
        }
        
        // Spezialfähigkeiten (nur speichern, nicht anwenden)
        if (clanData.specialAbilities) {
            character.clanAbilities = clanData.specialAbilities;
        }
    },
    
    /**
     * Fügt Startausrüstung hinzu
     * @param {Object} character - Der Character
     */
    addStartingEquipment(character) {
        character.inventory = [
            { 
                id: 'leather_armor', 
                name: 'Leder-Rüstung', 
                type: 'armor', 
                equipped: true,
                rkBonus: 2,
                description: 'Einfache Leder-Rüstung'
            },
            { 
                id: 'kunai', 
                name: 'Kunai', 
                type: 'weapon', 
                quantity: 3, 
                equipped: true,
                attackBonus: 1,
                damage: '1W4',
                description: 'Standard-Wurfwaffe'
            },
            { 
                id: 'shuriken', 
                name: 'Shuriken', 
                type: 'weapon', 
                quantity: 5, 
                equipped: false,
                attackBonus: 0,
                damage: '1W3',
                description: 'Sternförmige Wurfwaffe'
            },
            {
                id: 'ration',
                name: 'Nahrungsration',
                type: 'consumable',
                quantity: 3,
                description: 'Stellt 1W6 HP wieder her'
            }
        ];
        
        // Ausrüstung setzen
        character.equipment = {
            weapon: 'kunai',
            armor: 'leather_armor',
            accessory: null
        };
    },
    
    // === CRUD OPERATIONEN ===
    
    /**
     * Speichert einen Character
     * @param {Object} character - Der zu speichernde Character
     * @returns {boolean}
     */
    save(character) {
        if (!character || !character.id) {
            console.error('CharacterService: Ungültiger Character');
            return false;
        }
        
        // Verwende StorageManager wenn verfügbar
        if (typeof StorageManager !== 'undefined') {
            return StateManager.saveCharacter(character);
        }
        
        // Fallback: Direkte localStorage Nutzung
        return this._saveToLocalStorage(character);
    },
    
    /**
     * Speichert direkt in localStorage (Fallback)
     * @private
     */
    _saveToLocalStorage(character) {
        try {
            const currentUser = this._getCurrentUser();
            if (!currentUser) {
                console.error('CharacterService: Kein User eingeloggt');
                return false;
            }
            
            character.userId = currentUser.id;
            character._savedAt = new Date().toISOString();
            
            const storageKey = `npu_characters_${currentUser.id}`;
            const saved = localStateManager.getItem(storageKey);
            let characters = saved ? JSON.parse(saved) : [];
            
            const index = characters.findIndex(c => c.id === character.id);
            if (index >= 0) {
                characters[index] = character;
            } else {
                characters.push(character);
            }
            
            localStateManager.setItem(storageKey, JSON.stringify(characters));
            
            // Event auslösen
            if (typeof EventBus !== 'undefined') {
                EventBus.emit(EventBus.CHARACTER_SAVED, character);
            }
            
            return true;
        } catch (error) {
            console.error('CharacterService: Fehler beim Speichern:', error);
            return false;
        }
    },
    
    /**
     * Lädt alle Charaktere eines Users
     * @param {string} userId - Optional: User-ID (sonst aktueller User)
     * @returns {Array}
     */
    loadAll(userId) {
        // Verwende StorageManager wenn verfügbar
        if (typeof StorageManager !== 'undefined') {
            return StateManager.loadAllCharacters(userId || this._getCurrentUserId());
        }
        
        // Fallback
        return this._loadFromLocalStorage(userId);
    },
    
    /**
     * Lädt aus localStorage (Fallback)
     * @private
     */
    _loadFromLocalStorage(userId) {
        try {
            if (!userId) {
                userId = this._getCurrentUserId();
            }
            
            if (!userId) {
                console.warn('CharacterService: Keine User-ID');
                return [];
            }
            
            const storageKey = `npu_characters_${userId}`;
            const saved = localStateManager.getItem(storageKey);
            
            if (!saved) return [];
            
            return JSON.parse(saved);
        } catch (error) {
            console.error('CharacterService: Fehler beim Laden:', error);
            return [];
        }
    },
    
    /**
     * Lädt einen einzelnen Character
     * @param {string} characterId - Die Character-ID
     * @param {string} userId - Optional: User-ID
     * @returns {Object|null}
     */
    loadById(characterId, userId) {
        const characters = this.loadAll(userId);
        return characters.find(c => c.id === characterId) || null;
    },
    
    /**
     * Löscht einen Character
     * @param {string} characterId - Die Character-ID
     * @param {string} userId - Optional: User-ID
     * @returns {boolean}
     */
    delete(characterId, userId) {
        // Verwende StorageManager wenn verfügbar
        if (typeof StorageManager !== 'undefined') {
            return StateManager.deleteCharacter(characterId, userId || this._getCurrentUserId());
        }
        
        // Fallback
        try {
            const characters = this.loadAll(userId);
            const filtered = characters.filter(c => c.id !== characterId);
            
            const storageKey = `npu_characters_${userId || this._getCurrentUserId()}`;
            localStateManager.setItem(storageKey, JSON.stringify(filtered));
            
            return true;
        } catch (error) {
            console.error('CharacterService: Fehler beim Löschen:', error);
            return false;
        }
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Berechnet verfügbare Attributpunkte
     * @param {Object} character - Der Character
     * @returns {number}
     */
    getAvailableAttributePoints(character) {
        if (!character || !character.baseAttributes) return 0;
        
        const spent = Object.values(character.baseAttributes)
            .reduce((sum, val) => sum + (val - 8), 0);
        
        return 26 - spent; // 26 Punkte insgesamt verfügbar
    },
    
    /**
     * Prüft ob ein Attribut erhöht werden kann
     * @param {Object} character - Der Character
     * @param {string} attr - Das Attribut
     * @returns {boolean}
     */
    canIncreaseAttribute(character, attr) {
        if (!character || !character.baseAttributes) return false;
        
        const currentValue = character.baseAttributes[attr];
        if (currentValue >= 20) return false; // Maximum
        
        const available = this.getAvailableAttributePoints(character);
        if (available <= 0) return false;
        
        // Prüfe auf 16er-Limit (max 2 Attribute auf 16)
        if (currentValue >= 15) {
            const attributesAt16 = Object.values(character.baseAttributes)
                .filter(v => v >= 16).length;
            if (attributesAt16 >= 2) return false;
        }
        
        return true;
    },
    
    /**
     * Erhöht ein Attribut
     * @param {Object} character - Der Character
     * @param {string} attr - Das Attribut
     * @returns {boolean}
     */
    increaseAttribute(character, attr) {
        if (!this.canIncreaseAttribute(character, attr)) return false;
        
        character.baseAttributes[attr]++;
        
        // Neu berechnen
        if (typeof RulesEngine !== 'undefined') {
            const calculated = RulesEngine.calculateCharacter(character);
            character.skills = calculated.skills;
            character.combat = calculated.combat;
            character.stats = calculated.stats;
            character.resistances = calculated.resistances;
            character.modifiers = calculated.modifiers;
        }
        
        return true;
    },
    
    /**
     * Vermindert ein Attribut
     * @param {Object} character - Der Character
     * @param {string} attr - Das Attribut
     * @returns {boolean}
     */
    decreaseAttribute(character, attr) {
        if (!character || !character.baseAttributes) return false;
        
        const currentValue = character.baseAttributes[attr];
        if (currentValue <= 8) return false; // Minimum
        
        character.baseAttributes[attr]--;
        
        // Neu berechnen
        if (typeof RulesEngine !== 'undefined') {
            const calculated = RulesEngine.calculateCharacter(character);
            character.skills = calculated.skills;
            character.combat = calculated.combat;
            character.stats = calculated.stats;
            character.resistances = calculated.resistances;
            character.modifiers = calculated.modifiers;
        }
        
        return true;
    },
    
    /**
     * Gibt den aktuellen User zurück
     * @private
     */
    _getCurrentUser() {
        if (typeof AuthSystem !== 'undefined' && AuthSystem.getCurrentUser) {
            return AuthSystem.getCurrentUser();
        }
        
        try {
            const userData = localStateManager.getItem('npu_current_user');
            if (userData) return JSON.parse(userData);
        } catch (e) {
            console.error('CharacterService: Fehler beim Lesen des Users:', e);
        }
        
        return null;
    },
    
    /**
     * Gibt die aktuelle User-ID zurück
     * @private
     */
    _getCurrentUserId() {
        const user = this._getCurrentUser();
        return user?.id;
    },
    
    // === DEBUG ===
    
    /**
     * Debug-Informationen
     */
    debug() {
        console.group('CharacterService Debug');
        console.log('Current User:', this._getCurrentUser()?.username);
        console.log('Characters:', this.loadAll().length);
        console.log('RulesEngine verfügbar:', typeof RulesEngine !== 'undefined');
        console.log('StorageManager verfügbar:', typeof StorageManager !== 'undefined');
        console.groupEnd();
    }
};

// Global verfügbar machen
window.CharacterService = CharacterService;
