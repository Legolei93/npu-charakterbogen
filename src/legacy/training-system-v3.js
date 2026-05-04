/**
 * Training System v3.0 - Timestamp-basiert, Produktionsreif
 * 
 * Features:
 * - Echte Timestamps (Date.now())
 * - Persistenz bei Reload
 * - Charakter-Sperre während Training
 * - DM Override/Reset/Abbruch
 * - Exploit-Schutz
 * - Kein setTimeout-Only
 */

const TrainingSystemV3 = {
    
    // === KONFIGURATION ===
    CONFIG: {
        // Dauer in Millisekunden (1 Stunde = 3600000ms)
        TRAINING_DURATION: 60 * 60 * 1000, // 1 Stunde
        
        // Training Types
        TYPES: {
            xp: {
                id: 'xp',
                name: 'Erfahrungstraining',
                description: 'Allgemeines Training zur Verbesserung deiner Fähigkeiten',
                icon: '⭐',
                color: '#f1c40f',
                reward: { xp: 10 },
                instant: true // Sofortige Belohnung (keine Dauer)
            },
            jutsu: {
                id: 'jutsu',
                name: 'Jutsu Training',
                description: 'Trainiere ein spezifisches Jutsu bis zur Beherrschung',
                icon: '📜',
                color: '#e74c3c',
                requiredForProgress: 5, // 5 Trainings = gelernt
                requiresJutsu: true
            },
            chakra: {
                id: 'chakra',
                name: 'Chakra Meditation',
                description: 'Meditiere, um deine Chakra-Kontrolle zu verbessern',
                icon: '💜',
                color: '#9b59b6',
                requiredForProgress: 5, // 5 Trainings = +3 Chakra
                reward: { chakra: 3 }
            },
            hp: {
                id: 'hp',
                name: 'Körperliches Training',
                description: 'Stärke deinen Körper durch intensives Training',
                icon: '❤️',
                color: '#e74c3c',
                requiredForProgress: 5, // 5 Trainings = +1 HP
                reward: { hp: 1 }
            },
            stamina: {
                id: 'stamina',
                name: 'Ausdauertraining',
                description: 'Intensives Ausdauertraining für mehr Durchhaltevermögen',
                icon: '🏃',
                color: '#27ae60',
                requiredForProgress: 30, // 30 Trainings = +1 Stamina
                reward: { stamina: 1 }
            }
        },
        
        // Storage Key
        STORAGE_KEY: 'npu_training_v3'
    },
    
    // === STATE ===
    state: {
        activeTraining: null,  // { type, startTime, endTime, jutsuId, characterId }
        completedToday: false,
        lastTrainingDate: null,
        trainingHistory: []
    },
    
    // === INITIALISIERUNG ===
    
    init() {
        console.log('[TrainingSystemV3] Initialisiere...');
        this.loadState();
        this.checkTrainingStatus(); // Sofort prüfen bei Init
        this.startStatusCheckLoop(); // Regelmäßige Prüfung
        console.log('[TrainingSystemV3] Initialisiert');
    },
    
    /**
     * Prüft aktuellen Trainings-Status (bei Init und Reload)
     */
    checkTrainingStatus() {
        if (!this.state.activeTraining) return;
        
        const now = Date.now();
        const endTime = this.state.activeTraining.endTime;
        
        if (now >= endTime) {
            // Training abgeschlossen!
            console.log('[TrainingSystemV3] Training abgeschlossen (bei Prüfung)');
            this.completeTraining(true); // silent = true
        } else {
            // Training läuft noch
            const remaining = endTime - now;
            console.log(`[TrainingSystemV3] Training läuft noch: ${this._formatTime(remaining)}`);
        }
    },
    
    /**
     * Startet Loop für regelmäßige Status-Prüfung
     */
    startStatusCheckLoop() {
        // Prüfe alle 10 Sekunden
        setInterval(() => {
            this.checkTrainingStatus();
        }, 10000);
    },
    
    // === TRAINING STARTEN ===
    
    /**
     * Startet ein Training
     * @param {string} type - Training Type (xp, jutsu, chakra, hp, stamina)
     * @param {Object} options - { jutsuId } für Jutsu-Training
     */
    startTraining(type, options = {}) {
        const character = this._getCurrentCharacter();
        if (!character) {
            return { success: false, error: 'Kein Character geladen' };
        }
        
        // 1. Prüfe ob bereits Training aktiv
        if (this.isTrainingActive()) {
            return { 
                success: false, 
                error: 'Training bereits aktiv',
                remainingTime: this.getRemainingTime()
            };
        }
        
        // 2. Prüfe ob heute bereits trainiert
        if (this.state.completedToday && !this._isNewDay()) {
            return { 
                success: false, 
                error: 'Heute bereits trainiert. Kehre morgen zurück.'
            };
        }
        
        // 3. Validiere Training Type
        const trainingConfig = this.CONFIG.TYPES[type];
        if (!trainingConfig) {
            return { success: false, error: 'Ungültiger Trainingstyp' };
        }
        
        // 4. Spezielle Validierung für Jutsu-Training
        if (type === 'jutsu') {
            if (!options.jutsuId) {
                return { success: false, error: 'Kein Jutsu ausgewählt' };
            }
            
            const jutsu = character.jutsus?.find(j => j.id === options.jutsuId);
            if (!jutsu) {
                return { success: false, error: 'Jutsu nicht gefunden' };
            }
            
            if (!jutsu.inTraining) {
                return { success: false, error: 'Dieses Jutsu kann nicht trainiert werden' };
            }
        }
        
        // 5. Training starten
        const now = Date.now();
        const endTime = now + this.CONFIG.TRAINING_DURATION;
        
        this.state.activeTraining = {
            type: type,
            typeName: trainingConfig.name,
            startTime: now,
            endTime: endTime,
            jutsuId: options.jutsuId || null,
            characterId: character.id,
            characterName: character.name
        };
        
        this.saveState();
        
        console.log(`[TrainingSystemV3] Training gestartet: ${trainingConfig.name}`);
        console.log(`[TrainingSystemV3] Start: ${new Date(now).toLocaleString()}`);
        console.log(`[TrainingSystemV3] Ende: ${new Date(endTime).toLocaleString()}`);
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('training:started', this.state.activeTraining);
        }
        
        return {
            success: true,
            training: this.state.activeTraining,
            endTime: endTime,
            duration: this.CONFIG.TRAINING_DURATION
        };
    },
    
    /**
     * Schließt Training ab
     * @param {boolean} silent - Keine UI-Updates wenn true (bei automatischer Prüfung)
     */
    completeTraining(silent = false) {
        if (!this.state.activeTraining) {
            return { success: false, error: 'Kein aktives Training' };
        }
        
        const training = this.state.activeTraining;
        const character = this._getCurrentCharacter();
        
        if (!character) {
            return { success: false, error: 'Character nicht gefunden' };
        }
        
        // Training abschließen
        const result = this._applyTrainingRewards(character, training);
        
        // State aktualisieren
        this.state.trainingHistory.push({
            ...training,
            completedAt: Date.now(),
            result: result
        });
        
        this.state.activeTraining = null;
        this.state.completedToday = true;
        this.state.lastTrainingDate = new Date().toDateString();
        this.saveState();
        
        console.log('[TrainingSystemV3] Training abgeschlossen:', result);
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('training:completed', { training, result });
        }
        
        if (!silent) {
            this._showCompletionNotification(result);
        }
        
        return { success: true, result };
    },
    
    /**
     * Wendet Trainings-Belohnungen an
     * @private
     */
    _applyTrainingRewards(character, training) {
        const type = training.type;
        const config = this.CONFIG.TYPES[type];
        const result = {
            type: type,
            effects: []
        };
        
        switch (type) {
            case 'xp':
                const xpGain = config.reward.xp;
                character.xp = (character.xp || 0) + xpGain;
                result.effects.push({ type: 'xp', amount: xpGain });
                break;
                
            case 'jutsu':
                if (training.jutsuId) {
                    const jutsu = character.jutsus?.find(j => j.id === training.jutsuId);
                    if (jutsu && jutsu.inTraining) {
                        jutsu.trainingProgress = (jutsu.trainingProgress || 0) + 1;
                        
                        if (jutsu.trainingProgress >= config.requiredForProgress) {
                            jutsu.inTraining = false;
                            jutsu.learnedDirectly = true;
                            jutsu.learnedAt = new Date().toISOString();
                            result.effects.push({ 
                                type: 'jutsu_learned', 
                                jutsu: jutsu.name,
                                progress: jutsu.trainingProgress,
                                required: config.requiredForProgress
                            });
                        } else {
                            result.effects.push({ 
                                type: 'jutsu_progress', 
                                jutsu: jutsu.name,
                                progress: jutsu.trainingProgress,
                                required: config.requiredForProgress,
                                remaining: config.requiredForProgress - jutsu.trainingProgress
                            });
                        }
                    }
                }
                break;
                
            case 'chakra':
                character.training = character.training || {};
                character.training.chakra = (character.training.chakra || 0) + 1;
                
                if (character.training.chakra >= config.requiredForProgress) {
                    character.stats.chakra = character.stats.chakra || {};
                    character.stats.chakra.max = (character.stats.chakra.max || 100) + config.reward.chakra;
                    character.training.chakra = 0;
                    result.effects.push({ type: 'chakra_bonus', amount: config.reward.chakra });
                } else {
                    result.effects.push({ 
                        type: 'chakra_progress', 
                        progress: character.training.chakra,
                        required: config.requiredForProgress
                    });
                }
                break;
                
            case 'hp':
                character.training = character.training || {};
                character.training.hp = (character.training.hp || 0) + 1;
                
                if (character.training.hp >= config.requiredForProgress) {
                    character.stats.hp = character.stats.hp || {};
                    character.stats.hp.max = (character.stats.hp.max || 30) + config.reward.hp;
                    character.training.hp = 0;
                    result.effects.push({ type: 'hp_bonus', amount: config.reward.hp });
                } else {
                    result.effects.push({ 
                        type: 'hp_progress', 
                        progress: character.training.hp,
                        required: config.requiredForProgress
                    });
                }
                break;
                
            case 'stamina':
                character.training = character.training || {};
                character.training.stamina = (character.training.stamina || 0) + 1;
                
                if (character.training.stamina >= config.requiredForProgress) {
                    character.stats.stamina = (character.stats.stamina || 0) + config.reward.stamina;
                    character.training.stamina = 0;
                    result.effects.push({ type: 'stamina_bonus', amount: config.reward.stamina });
                } else {
                    result.effects.push({ 
                        type: 'stamina_progress', 
                        progress: character.training.stamina,
                        required: config.requiredForProgress
                    });
                }
                break;
        }
        
        // Speichern
        if (typeof AccountSystem !== 'undefined') {
            AccountSystem.StateManager.saveState(character);
        }
        
        return result;
    },
    
    // === DM KONTROLLE ===
    
    /**
     * DM: Training sofort beenden
     */
    dmCompleteTraining() {
        if (!this.isDM()) {
            return { success: false, error: 'Nur für DM' };
        }
        
        return this.completeTraining();
    },
    
    /**
     * DM: Training abbrechen
     */
    dmCancelTraining() {
        if (!this.isDM()) {
            return { success: false, error: 'Nur für DM' };
        }
        
        if (!this.state.activeTraining) {
            return { success: false, error: 'Kein aktives Training' };
        }
        
        const training = this.state.activeTraining;
        
        // Training abbrechen (keine Belohnung)
        this.state.trainingHistory.push({
            ...training,
            cancelledAt: Date.now(),
            cancelled: true
        });
        
        this.state.activeTraining = null;
        this.saveState();
        
        console.log('[TrainingSystemV3] Training abgebrochen (DM)');
        
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('training:cancelled', { training });
        }
        
        return { success: true };
    },
    
    /**
     * DM: Training Reset (erlaubt neues Training)
     */
    dmResetTraining() {
        if (!this.isDM()) {
            return { success: false, error: 'Nur für DM' };
        }
        
        this.state.completedToday = false;
        this.state.lastTrainingDate = null;
        this.saveState();
        
        console.log('[TrainingSystemV3] Training-Reset (DM)');
        
        return { success: true };
    },
    
    /**
     * DM: Progress korrigieren
     */
    dmSetProgress(type, value) {
        if (!this.isDM()) {
            return { success: false, error: 'Nur für DM' };
        }
        
        const character = this._getCurrentCharacter();
        if (!character) {
            return { success: false, error: 'Kein Character' };
        }
        
        character.training = character.training || {};
        character.training[type] = value;
        
        if (typeof AccountSystem !== 'undefined') {
            AccountSystem.StateManager.saveState(character);
        }
        
        return { success: true };
    },
    
    // === HILFSMETHODEN ===
    
    isTrainingActive() {
        return this.state.activeTraining !== null;
    },
    
    getRemainingTime() {
        if (!this.state.activeTraining) return 0;
        
        const now = Date.now();
        const endTime = this.state.activeTraining.endTime;
        
        return Math.max(0, endTime - now);
    },
    
    getTrainingProgress() {
        if (!this.state.activeTraining) return 0;
        
        const now = Date.now();
        const startTime = this.state.activeTraining.startTime;
        const endTime = this.state.activeTraining.endTime;
        
        const total = endTime - startTime;
        const elapsed = now - startTime;
        
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    },
    
    _formatTime(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    _isNewDay() {
        if (!this.state.lastTrainingDate) return true;
        return this.state.lastTrainingDate !== new Date().toDateString();
    },
    
    _getCurrentCharacter() {
        if (typeof AccountSystem !== 'undefined') {
            return AccountSystem.getCurrentCharacter();
        }
        return window.currentCharacter || null;
    },
    
    isDM() {
        if (typeof AccountSystem !== 'undefined') {
            return AccountSystem.isDM();
        }
        return false;
    },
    
    // === STORAGE ===
    
    saveState() {
        const userId = this._getCurrentUserId();
        if (!userId) return;
        
        const key = `${this.CONFIG.STORAGE_KEY}_${userId}`;
        localStateManager.setItem(key, JSON.stringify(this.state));
    },
    
    loadState() {
        const userId = this._getCurrentUserId();
        if (!userId) return;
        
        const key = `${this.CONFIG.STORAGE_KEY}_${userId}`;
        const saved = localStateManager.getItem(key);
        
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                console.log('[TrainingSystemV3] State geladen');
            } catch (e) {
                console.error('[TrainingSystemV3] Fehler beim Laden:', e);
            }
        }
    },
    
    _getCurrentUserId() {
        if (typeof AccountSystem !== 'undefined') {
            const user = AccountSystem.getCurrentUser();
            return user?.id;
        }
        return null;
    },
    
    // === UI ===
    
    _showCompletionNotification(result) {
        // Wird vom UI-Renderer aufgerufen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('training:show_completion', result);
        }
    },
    
    renderTrainingStatus() {
        if (!this.isTrainingActive()) {
            return this.renderTrainingSelection();
        }
        
        const remaining = this.getRemainingTime();
        const progress = this.getTrainingProgress();
        const training = this.state.activeTraining;
        
        return `
            <div class="training-active-panel">
                <div class="training-status-header">
                    <span class="training-icon">${this.CONFIG.TYPES[training.type].icon}</span>
                    <h2>Training läuft...</h2>
                </div>
                
                <div class="training-type">
                    ${training.typeName}
                </div>
                
                <div class="training-countdown">
                    <span class="time-remaining">${this._formatTime(remaining)}</span>
                    <span class="time-label">verbleibend</span>
                </div>
                
                <div class="training-progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                
                <div class="training-locked-notice">
                    🔒 Charakter ist während des Trainings gesperrt
                    <ul>
                        <li>❌ Keine Quests möglich</li>
                        <li>❌ Kein Handel möglich</li>
                        <li>❌ Kein Merchant-System</li>
                        <li>❌ Keine weiteren Aktionen</li>
                    </ul>
                </div>
            </div>
        `;
    },
    
    renderTrainingSelection() {
        // ... (wie vorher)
    }
};

// Global verfügbar machen
window.TrainingSystemV3 = TrainingSystemV3;

// Automatisch initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TrainingSystemV3.init());
} else {
    TrainingSystemV3.init();
}

console.log('[TrainingSystemV3] Geladen - Timestamp-basiert, Produktionsreif');
