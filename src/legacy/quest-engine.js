/**
 * Quest Engine v3.0 - Unified Quest System
 * 
 * Konsolidiert aus 6 parallelen Systemen:
 * - quest-system.js
 * - frostfels-quest-engine.js
 * - rpg-quest-system.js
 * - professional-quest-system.js
 * - true-rpg-quest-engine.js
 * - frostfels-quest-engine-v2.js
 * 
 * Features:
 * - Single Source of Truth für Quest-Status
 * - Automatische Migration von Legacy-Systemen
 * - User-isolierte Speicherung
 * - Event-gesteuerte Architektur
 */

const QuestEngine = {
    // === VERSION ===
    VERSION: '3.0.0',
    
    // === QUEST STATES ===
    STATES: {
        HIDDEN: 'hidden',
        AVAILABLE: 'available',
        DIALOG_OPEN: 'dialog_open',
        ACCEPTED: 'accepted',
        ACTIVE: 'active',
        PHASE_ACTIVE: 'phase_active',
        PHASE_COMPLETE: 'phase_complete',
        RETURN_REQUIRED: 'return_required',
        READY_FOR_TURN_IN: 'ready_for_turn_in',
        COMPLETED: 'completed',
        FAILED: 'failed',
        ABANDONED: 'abandoned',
        CHAIN_UNLOCKED: 'chain_unlocked'
    },
    
    // === STATE ===
    state: {
        dailyQuests: [],
        activeQuests: [],
        completedQuests: [],
        trainingQuest: null,
        lastReset: null,
        questCooldowns: {},
        karma: { value: 0, history: [] },
        worldStates: { active: [], history: [] },
        reputation: {
            taro: 0,
            yuki: 0,
            shin: 0,
            kira: 0,
            karl: 0,
            village: 0,
            church: 0,
            blackmarket: 0
        }
    },
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert die Quest Engine
     */
    init() {
        console.log(`QuestEngine v${this.VERSION} initialisiert`);
        
        // State zurücksetzen
        this.resetState();
        
        // Migration von Legacy-Systemen
        this.migrateFromLegacySystems();
        
        // State laden
        this.loadState();
        
        // Daily Reset prüfen
        this.checkDailyReset();
        
        // Event-Listener registrieren
        this.setupEventListeners();
    },
    
    /**
     * Resetet den State
     */
    resetState() {
        this.state = {
            dailyQuests: [],
            activeQuests: [],
            completedQuests: [],
            trainingQuest: null,
            lastReset: null,
            questCooldowns: {},
            karma: { value: 0, history: [] },
            worldStates: { active: [], history: [] },
            reputation: {
                taro: 0,
                yuki: 0,
                shin: 0,
                kira: 0,
                karl: 0,
                village: 0,
                church: 0,
                blackmarket: 0
            }
        };
    },
    
    /**
     * Migriert Daten von allen 6 Legacy-Quest-Systemen
     */
    migrateFromLegacySystems() {
        const currentUser = this._getCurrentUser();
        if (!currentUser) return;
        
        const userId = currentUser.id;
        let migrated = false;
        
        // Legacy Keys in Prioritätsreihenfolge
        const legacyKeys = [
            { key: `frostfels_quest_engine_v2_${userId}`, system: 'frostfels-v2' },
            { key: `frostfels_quest_engine_${userId}`, system: 'frostfels-v1' },
            { key: `npu_quest_system_${userId}`, system: 'quest-system' },
            { key: 'frostfels_quest_engine_v2', system: 'frostfels-v2-global' },
            { key: 'frostfels_quest_engine', system: 'frostfels-v1-global' },
            { key: 'npu_quest_system', system: 'quest-system-global' },
            { key: 'true_rpg_quest_engine', system: 'true-rpg' },
            { key: 'professional_quest_system', system: 'professional' },
            { key: 'rpg_quest_system', system: 'rpg' }
        ];
        
        for (const { key, system } of legacyKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`QuestEngine: Migriere Daten von ${system} (${key})`);
                    
                    // Migriere Quests
                    if (parsed.activeQuests) {
                        this.state.activeQuests.push(...parsed.activeQuests);
                    }
                    if (parsed.completedQuests) {
                        this.state.completedQuests.push(...parsed.completedQuests);
                    }
                    if (parsed.dailyQuests) {
                        this.state.dailyQuests.push(...parsed.dailyQuests);
                    }
                    if (parsed.trainingQuest) {
                        this.state.trainingQuest = parsed.trainingQuest;
                    }
                    
                    // Migriere Karma
                    if (parsed.karma) {
                        this.state.karma = parsed.karma;
                    }
                    
                    // Migriere Reputation
                    if (parsed.reputation) {
                        Object.assign(this.state.reputation, parsed.reputation);
                    }
                    
                    // Migriere World States
                    if (parsed.worldStates) {
                        this.state.worldStates = parsed.worldStates;
                    }
                    
                    // Migriere Cooldowns
                    if (parsed.questCooldowns) {
                        Object.assign(this.state.questCooldowns, parsed.questCooldowns);
                    }
                    
                    // Lösche alten Key nach erfolgreicher Migration
                    localStorage.removeItem(key);
                    migrated = true;
                    
                } catch (e) {
                    console.error(`QuestEngine: Fehler bei Migration von ${key}:`, e);
                }
            }
        }
        
        // Duplikate entfernen (basierend auf Quest-ID)
        this.state.activeQuests = this._removeDuplicates(this.state.activeQuests, 'id');
        this.state.completedQuests = this._removeDuplicates(this.state.completedQuests, 'id');
        this.state.dailyQuests = this._removeDuplicates(this.state.dailyQuests, 'id');
        
        if (migrated) {
            console.log('QuestEngine: Migration abgeschlossen, speichere im neuen Format');
            this.saveState();
        }
    },
    
    /**
     * Entfernt Duplikate aus einem Array
     * @private
     */
    _removeDuplicates(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const val = item[key];
            if (seen.has(val)) return false;
            seen.add(val);
            return true;
        });
    },
    
    // === SPEICHERUNG ===
    
    /**
     * Speichert den State
     */
    saveState() {
        const currentUser = this._getCurrentUser();
        if (!currentUser) {
            console.warn('QuestEngine: Kein User eingeloggt');
            return;
        }
        
        const storageKey = `npu_quest_engine_v3_${currentUser.id}`;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error('QuestEngine: Fehler beim Speichern:', e);
        }
    },
    
    /**
     * Lädt den State
     */
    loadState() {
        const currentUser = this._getCurrentUser();
        if (!currentUser) {
            console.log('QuestEngine: Kein User eingeloggt');
            return;
        }
        
        const storageKey = `npu_quest_engine_v3_${currentUser.id}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                console.log('QuestEngine: State geladen');
            } catch (e) {
                console.error('QuestEngine: Fehler beim Laden:', e);
            }
        }
    },
    
    // === DAILY QUESTS ===
    
    /**
     * Prüft ob Daily Quests zurückgesetzt werden müssen
     */
    checkDailyReset() {
        const now = new Date();
        const lastReset = this.state.lastReset ? new Date(this.state.lastReset) : null;
        
        if (!lastReset || 
            now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            
            console.log('QuestEngine: Generiere neue Daily Quests');
            this.generateDailyQuests();
            this.state.lastReset = now.toISOString();
            this.saveState();
            
            // Event auslösen
            if (typeof EventBus !== 'undefined') {
                EventBus.emit(EventBus.DAILY_QUESTS_RESET, {
                    dailyQuests: this.state.dailyQuests,
                    trainingQuest: this.state.trainingQuest
                });
            }
        }
    },
    
    /**
     * Generiert neue Daily Quests
     */
    generateDailyQuests() {
        // Importiere aus QuestRegistry
        if (typeof QuestRegistry === 'undefined') {
            console.error('QuestEngine: QuestRegistry nicht verfügbar');
            return;
        }
        
        // 3 Daily Quests generieren
        this.state.dailyQuests = [];
        
        // 1-2 Story Quests
        const storyPool = QuestRegistry.story.filter(q => !this._isQuestOnCooldown(q.id));
        const numStory = Math.min(2, storyPool.length);
        for (let i = 0; i < numStory; i++) {
            const quest = this._createQuestInstance(storyPool[i]);
            if (quest) this.state.dailyQuests.push(quest);
        }
        
        // 1 Training Quest
        const trainingPool = QuestRegistry.training || [];
        if (trainingPool.length > 0) {
            const randomTraining = trainingPool[Math.floor(Math.random() * trainingPool.length)];
            this.state.trainingQuest = this._createQuestInstance(randomTraining);
        }
        
        console.log(`QuestEngine: ${this.state.dailyQuests.length} Daily Quests generiert`);
    },
    
    /**
     * Erstellt eine Quest-Instanz
     * @private
     */
    _createQuestInstance(questTemplate) {
        if (!questTemplate) return null;
        
        return {
            id: questTemplate.id,
            title: questTemplate.title,
            description: questTemplate.description,
            status: this.STATES.AVAILABLE,
            progress: 0,
            objectives: questTemplate.objectives || [],
            rewards: questTemplate.rewards || {},
            giver: questTemplate.giver || null,
            acceptedAt: null,
            completedAt: null,
            currentPhase: 0,
            phases: questTemplate.phases || []
        };
    },
    
    /**
     * Prüft ob ein Quest auf Cooldown ist
     * @private
     */
    _isQuestOnCooldown(questId) {
        const cooldown = this.state.questCooldowns[questId];
        if (!cooldown) return false;
        
        return new Date() < new Date(cooldown);
    },
    
    // === QUEST AKTIONEN ===
    
    /**
     * Nimmt ein Quest an
     * @param {string} questId - Die Quest-ID
     * @returns {boolean}
     */
    acceptQuest(questId) {
        // Suche in Daily Quests
        let quest = this.state.dailyQuests.find(q => q.id === questId);
        
        // Suche in verfügbaren Quests
        if (!quest) {
            quest = this._createQuestInstance(QuestRegistry.getById(questId));
        }
        
        if (!quest) {
            console.error(`QuestEngine: Quest ${questId} nicht gefunden`);
            return false;
        }
        
        if (quest.status !== this.STATES.AVAILABLE) {
            console.warn(`QuestEngine: Quest ${questId} ist nicht verfügbar`);
            return false;
        }
        
        // Status ändern
        quest.status = this.STATES.ACTIVE;
        quest.acceptedAt = new Date().toISOString();
        
        // Zu aktiven Quests hinzufügen
        if (!this.state.activeQuests.find(q => q.id === questId)) {
            this.state.activeQuests.push(quest);
        }
        
        // Aus Daily Quests entfernen
        this.state.dailyQuests = this.state.dailyQuests.filter(q => q.id !== questId);
        
        // Speichern
        this.saveState();
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit(EventBus.QUEST_ACCEPTED, quest);
        }
        
        console.log(`QuestEngine: Quest "${quest.title}" angenommen`);
        return true;
    },
    
    /**
     * Schließt ein Quest ab
     * @param {string} questId - Die Quest-ID
     * @returns {boolean}
     */
    completeQuest(questId) {
        const questIndex = this.state.activeQuests.findIndex(q => q.id === questId);
        
        if (questIndex === -1) {
            console.error(`QuestEngine: Aktives Quest ${questId} nicht gefunden`);
            return false;
        }
        
        const quest = this.state.activeQuests[questIndex];
        quest.status = this.STATES.COMPLETED;
        quest.completedAt = new Date().toISOString();
        
        // Belohnungen verteilen
        this._grantRewards(quest.rewards);
        
        // Zu completed verschieben
        this.state.activeQuests.splice(questIndex, 1);
        this.state.completedQuests.push(quest);
        
        // Cooldown setzen
        this.state.questCooldowns[questId] = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Speichern
        this.saveState();
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit(EventBus.QUEST_COMPLETED, quest);
        }
        
        console.log(`QuestEngine: Quest "${quest.title}" abgeschlossen`);
        return true;
    },
    
    /**
     * Aktualisiert den Fortschritt eines Quests
     * @param {string} questId - Die Quest-ID
     * @param {string} objectiveType - Der Objective-Typ
     * @param {string} target - Das Ziel
     * @param {number} amount - Die Menge
     */
    updateQuestProgress(questId, objectiveType, target, amount = 1) {
    console.log("[QUEST PROGRESS] Quest:", questId, "Objective:", objectiveId);
        const quest = this.state.activeQuests.find(q => q.id === questId);
        
        if (!quest) return;
        
        // Finde das passende Objective
        const objective = quest.objectives?.find(o => 
            o.type === objectiveType && o.target === target
        );
        
        if (objective) {
            objective.current = (objective.current || 0) + amount;
            
            // Prüfe ob Objective erfüllt
            if (objective.current >= objective.count) {
                objective.completed = true;
                
                // Prüfe ob alle Objectives erfüllt
                const allCompleted = quest.objectives.every(o => o.completed);
                if (allCompleted) {
                    quest.status = this.STATES.READY_FOR_TURN_IN;
                }
            }
            
            // Fortschritt berechnen
            const totalObjectives = quest.objectives.length;
            const completedObjectives = quest.objectives.filter(o => o.completed).length;
            quest.progress = Math.floor((completedObjectives / totalObjectives) * 100);
            
            // Speichern
            this.saveState();
            
            // Event auslösen
            if (typeof EventBus !== 'undefined') {
                EventBus.emit(EventBus.QUEST_PROGRESS_UPDATED, {
                    quest,
                    objective,
                    progress: quest.progress
                });
            }
        }
    },
    
    /**
     * Verteilt Belohnungen
     * @private
     */
    _grantRewards(rewards) {
        if (!rewards) return;
        
        const character = typeof StateManager !== 'undefined' 
            ? StateManager.getCharacter() 
            : window.currentCharacter;
        
        if (!character) return;
        
        // Gold
        if (rewards.gold) {
            character.stats.gold = (character.stats.gold || 0) + rewards.gold;
        }
        
        // XP
        if (rewards.xp) {
            character.xp = (character.xp || 0) + rewards.xp;
        }
        
        // Karma
        if (rewards.karma) {
            this.state.karma.value += rewards.karma;
            this.state.karma.history.push({
                change: rewards.karma,
                reason: 'Quest Belohnung',
                timestamp: new Date().toISOString()
            });
        }
        
        // Reputation
        if (rewards.reputation) {
            Object.entries(rewards.reputation).forEach(([npc, amount]) => {
                if (this.state.reputation[npc] !== undefined) {
                    this.state.reputation[npc] += amount;
                }
            });
        }
    },
    
    // === EVENTS ===
    
    /**
     * Richtet Event-Listener ein
     */
    setupEventListeners() {
        // Höre auf Character-Änderungen
        if (typeof EventBus !== 'undefined') {
            EventBus.on(EventBus.CHARACTER_LOADED, () => {
                this.loadState();
            });
        }
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Gibt den aktuellen User zurück
     * @private
     */
    _getCurrentUser() {
        if (typeof AuthSystem !== 'undefined' && AuthSystem.getCurrentUser) {
            return AuthSystem.getCurrentUser();
        }
        
        try {
            const userData = localStorage.getItem('npu_current_user');
            if (userData) {
                return JSON.parse(userData);
            }
        } catch (e) {
            console.error('QuestEngine: Fehler beim Lesen des Users:', e);
        }
        
        return null;
    },
    
    /**
     * Gibt alle aktiven Quests zurück
     * @returns {Array}
     */
    getActiveQuests() {
        return this.state.activeQuests;
    },
    
    /**
     * Gibt alle Daily Quests zurück
     * @returns {Array}
     */
    getDailyQuests() {
        return this.state.dailyQuests;
    },
    
    /**
     * Gibt das Training Quest zurück
     * @returns {Object|null}
     */
    getTrainingQuest() {
        return this.state.trainingQuest;
    },
    
    /**
     * Gibt das Karma zurück
     * @returns {number}
     */
    getKarma() {
        return this.state.karma.value;
    },
    
    /**
     * Setzt das Karma
     * @param {number} value - Der neue Wert
     */
    setKarma(value) {
        const oldValue = this.state.karma.value;
        this.state.karma.value = value;
        this.state.karma.history.push({
            change: value - oldValue,
            reason: 'Manuelle Änderung',
            timestamp: new Date().toISOString()
        });
        this.saveState();
    },
    
    /**
     * Gibt die Reputation für einen NPC zurück
     * @param {string} npc - Der NPC-Name
     * @returns {number}
     */
    getReputation(npc) {
        return this.state.reputation[npc] || 0;
    },
    
    /**
     * Debug-Informationen
     */
    debug() {
        console.group('QuestEngine Debug');
        console.log('Version:', this.VERSION);
        console.log('Active Quests:', this.state.activeQuests.length);
        console.log('Daily Quests:', this.state.dailyQuests.length);
        console.log('Completed Quests:', this.state.completedQuests.length);
        console.log('Karma:', this.state.karma.value);
        console.log('Last Reset:', this.state.lastReset);
        console.groupEnd();
    }
};

// Global verfügbar machen
window.QuestEngine = QuestEngine;
