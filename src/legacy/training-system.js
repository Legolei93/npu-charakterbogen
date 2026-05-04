/**
 * Training System v4.0 - Trainingsquest mit Entscheidungen
 * 
 * Features:
 * - 5 Trainings-Typen zur Auswahl
 * - Jutsu Training (5x → Gelernt)
 * - Chakra Training (5x → +3 Chakra)
 * - HP Training (5x → +1 HP)
 * - Stamina Training (30x → +1 Stamina)
 * - XP Training (gibt XP für Talentpunkte)
 * - Echte Auswirkungen basierend auf Wahl
 */

const TrainingSystem = {
    
    // === KONFIGURATION ===
    CONFIG: {
        // Trainings-Typen
        TRAINING_TYPES: {
            jutsu: {
                id: 'jutsu',
                name: 'Jutsu Training',
                description: 'Trainiere ein spezifisches Jutsu, um es zu beherrschen.',
                icon: '📜',
                color: '#e74c3c',
                duration: 60, // Minuten
                requiredForProgress: 5,
                effect: 'Jutsu wird von "In Training" zu "Gelernt"'
            },
            meditation: {
                id: 'meditation',
                name: 'Chakra Meditation',
                description: 'Meditiere, um deine Chakra-Kontrolle zu verbessern.',
                icon: '🧘',
                color: '#9b59b6',
                duration: 60,
                requiredForProgress: 5,
                effect: '+3 Chakra (permanent)'
            },
            sparring: {
                id: 'sparring',
                name: 'Sparring',
                description: 'Kämpfe gegen Trainingspartner, um Kampferfahrung zu sammeln.',
                icon: '⚔️',
                color: '#e67e22',
                duration: 60,
                requiredForProgress: 5,
                effect: '+1 HP (permanent)'
            },
            stamina: {
                id: 'stamina',
                name: 'Ausdauertraining',
                description: 'Intensives Ausdauertraining für mehr Durchhaltevermögen.',
                icon: '🏃',
                color: '#27ae60',
                duration: 60,
                requiredForProgress: 30,
                effect: '+1 Stamina (permanent)'
            },
            xp: {
                id: 'xp',
                name: 'Erfahrungstraining',
                description: 'Allgemeines Training zur Verbesserung deiner Fähigkeiten.',
                icon: '⭐',
                color: '#f1c40f',
                duration: 60,
                reward: { xp: 10 }
            }
        },
        
        // Maximal 1 Training pro Tag
        MAX_DAILY_TRAINING: 1
    },
    
    // === STATE ===
    state: {
        available: true,
        completedToday: false,
        activeTraining: null,
        trainingHistory: []
    },
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert das Training-System
     */
    init() {
        this._loadState();
        console.log('[TrainingSystem] Initialisiert');
    },
    
    /**
     * Prüft ob Training verfügbar ist
     * @returns {boolean}
     */
    isAvailable() {
        this._checkDailyReset();
        return !this.state.completedToday;
    },
    
    /**
     * Gibt verfügbare Trainings-Typen zurück
     * @returns {Array}
     */
    getAvailableTrainings() {
        const character = this._getCharacter();
        const trainings = [];
        
        // Jutsu Training (nur wenn Jutsus in Training)
        const jutsusInTraining = this._getJutsusInTraining();
        if (jutsusInTraining.length > 0) {
            trainings.push({
                ...this.CONFIG.TRAINING_TYPES.jutsu,
                selectableJutsus: jutsusInTraining
            });
        }
        
        // Meditation immer verfügbar
        trainings.push(this.CONFIG.TRAINING_TYPES.meditation);
        
        // Sparring immer verfügbar
        trainings.push(this.CONFIG.TRAINING_TYPES.sparring);
        
        // Stamina immer verfügbar
        trainings.push(this.CONFIG.TRAINING_TYPES.stamina);
        
        // XP Training immer verfügbar
        trainings.push(this.CONFIG.TRAINING_TYPES.xp);
        
        return trainings;
    },
    
    /**
     * Startet ein Training
     * @param {string} trainingType - Typ des Trainings
     * @param {Object} options - Zusätzliche Optionen (z.B. jutsuId)
     * @returns {Object} - Trainings-Ergebnis
     */
    startTraining(trainingType, options = {}) {
        if (!this.isAvailable()) {
            return {
                success: false,
                message: 'Du hast heute bereits trainiert. Kehre morgen zurück.'
            };
        }
        
        const training = this.CONFIG.TRAINING_TYPES[trainingType];
        if (!training) {
            return {
                success: false,
                message: 'Unbekannter Trainingstyp.'
            };
        }
        
        // Jutsu-spezifische Validierung
        if (trainingType === 'jutsu') {
            if (!options.jutsuId) {
                return {
                    success: false,
                    message: 'Wähle ein Jutsu zum Trainieren.'
                };
            }
            
            const jutsu = this._getJutsuById(options.jutsuId);
            if (!jutsu || jutsu.status !== 'in_training') {
                return {
                    success: false,
                    message: 'Dieses Jutsu kann nicht trainiert werden.'
                };
            }
        }
        
        console.log(`[TrainingSystem] Starte ${training.name}...`);
        
        // Training durchführen
        const result = this._executeTraining(trainingType, options);
        
        // State aktualisieren
        this.state.completedToday = true;
        this.state.trainingHistory.push({
            type: trainingType,
            jutsuId: options.jutsuId,
            result: result,
            timestamp: new Date().toISOString()
        });
        
        this._StateManager.saveState();
        
        return {
            success: true,
            ...result
        };
    },
    
    /**
     * Führt das Training aus
     * @private
     */
    _executeTraining(trainingType, options) {
        const character = this._getCharacter();
        const training = this.CONFIG.TRAINING_TYPES[trainingType];
        
        let result = {
            type: trainingType,
            trainingName: training.name,
            message: '',
            effects: [],
            completed: true
        };
        
        switch (trainingType) {
            case 'jutsu':
                result = this._executeJutsuTraining(options.jutsuId, result);
                break;
                
            case 'meditation':
                result = this._executeMeditationTraining(result);
                break;
                
            case 'sparring':
                result = this._executeSparringTraining(result);
                break;
                
            case 'stamina':
                result = this._executeStaminaTraining(result);
                break;
                
            case 'xp':
                result = this._executeXPTraining(result);
                break;
        }
        
        // Character speichern
        if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter(character);
        }
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('training:completed', result);
        }
        
        return result;
    },
    
    /**
     * Führt Jutsu-Training durch
     * @private
     */
    _executeJutsuTraining(jutsuId, result) {
        const character = this._getCharacter();
        const jutsu = this._getJutsuById(jutsuId);
        
        // Trainings-Fortschritt erhöhen
        jutsu.trainingProgress = (jutsu.trainingProgress || 0) + 1;
        
        const required = this.CONFIG.TRAINING_TYPES.jutsu.requiredForProgress;
        const remaining = required - jutsu.trainingProgress;
        
        if (jutsu.trainingProgress >= required) {
            // Jutsu gelernt!
            jutsu.status = 'learned';
            jutsu.trainingProgress = 0;
            
            result.message = `Du hast ${jutsu.name} gemeistert! Das Jutsu ist nun verfügbar.`;
            result.effects.push({
                type: 'jutsu_learned',
                jutsu: jutsu.name
            });
        } else {
            result.message = `Du trainierst ${jutsu.name}. Fortschritt: ${jutsu.trainingProgress}/${required}`;
            result.effects.push({
                type: 'jutsu_progress',
                jutsu: jutsu.name,
                progress: jutsu.trainingProgress,
                required: required,
                remaining: remaining
            });
        }
        
        return result;
    },
    
    /**
     * Führt Meditation-Training durch
     * @private
     */
    _executeMeditationTraining(result) {
        const character = this._getCharacter();
        
        // Trainings-Zähler
        character.training = character.training || {};
        character.training.meditation = (character.training.meditation || 0) + 1;
        
        const required = this.CONFIG.TRAINING_TYPES.meditation.requiredForProgress;
        const remaining = required - character.training.meditation;
        
        if (character.training.meditation >= required) {
            // Bonus anwenden
            character.stats.chakra = character.stats.chakra || {};
            character.stats.chakra.max = (character.stats.chakra.max || 100) + 3;
            character.stats.chakra.current = character.stats.chakra.max;
            character.training.meditation = 0;
            
            result.message = 'Deine Meditation hat sich vertieft. +3 permanenter Chakra!';
            result.effects.push({
                type: 'chakra_bonus',
                amount: 3
            });
        } else {
            result.message = `Du meditierst tief. Fortschritt: ${character.training.meditation}/${required}`;
            result.effects.push({
                type: 'meditation_progress',
                progress: character.training.meditation,
                required: required,
                remaining: remaining
            });
        }
        
        // Karma-Einfluss
        const karmaChange = Math.random() > 0.7 ? 1 : 0;
        if (karmaChange > 0) {
            character.karma = (character.karma || 0) + karmaChange;
            result.effects.push({
                type: 'karma',
                amount: karmaChange
            });
        }
        
        return result;
    },
    
    /**
     * Führt Sparring-Training durch
     * @private
     */
    _executeSparringTraining(result) {
        const character = this._getCharacter();
        
        // Trainings-Zähler
        character.training = character.training || {};
        character.training.sparring = (character.training.sparring || 0) + 1;
        
        const required = this.CONFIG.TRAINING_TYPES.sparring.requiredForProgress;
        const remaining = required - character.training.sparring;
        
        if (character.training.sparring >= required) {
            // Bonus anwenden
            character.stats.hp = character.stats.hp || {};
            character.stats.hp.max = (character.stats.hp.max || 30) + 1;
            character.stats.hp.current = character.stats.hp.max;
            character.training.sparring = 0;
            
            result.message = 'Deine Kampferfahrung wächst. +1 permanenter HP!';
            result.effects.push({
                type: 'hp_bonus',
                amount: 1
            });
        } else {
            result.message = `Du kämpfst gegen Trainingspartner. Fortschritt: ${character.training.sparring}/${required}`;
            result.effects.push({
                type: 'sparring_progress',
                progress: character.training.sparring,
                required: required,
                remaining: remaining
            });
        }
        
        // Kampf-XP
        const xpGain = 5;
        character.xp = (character.xp || 0) + xpGain;
        result.effects.push({
            type: 'xp',
            amount: xpGain
        });
        
        return result;
    },
    
    /**
     * Führt Stamina-Training durch
     * @private
     */
    _executeStaminaTraining(result) {
        const character = this._getCharacter();
        
        // Trainings-Zähler
        character.training = character.training || {};
        character.training.stamina = (character.training.stamina || 0) + 1;
        
        const required = this.CONFIG.TRAINING_TYPES.stamina.requiredForProgress;
        const remaining = required - character.training.stamina;
        
        if (character.training.stamina >= required) {
            // Bonus anwenden
            character.stats.stamina = (character.stats.stamina || 0) + 1;
            character.training.stamina = 0;
            
            result.message = 'Deine Ausdauer hat sich verbessert. +1 permanenter Stamina!';
            result.effects.push({
                type: 'stamina_bonus',
                amount: 1
            });
        } else {
            result.message = `Du trainierst hart. Fortschritt: ${character.training.stamina}/${required}`;
            result.effects.push({
                type: 'stamina_progress',
                progress: character.training.stamina,
                required: required,
                remaining: remaining
            });
        }
        
        return result;
    },
    
    /**
     * Führt XP-Training durch
     * @private
     */
    _executeXPTraining(result) {
        const character = this._getCharacter();
        
        const xpGain = this.CONFIG.TRAINING_TYPES.xp.reward.xp;
        character.xp = (character.xp || 0) + xpGain;
        
        result.message = `Du trainierst intensiv. +${xpGain} XP!`;
        result.effects.push({
            type: 'xp',
            amount: xpGain
        });
        
        return result;
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Gibt Jutsus in Training zurück
     * @private
     */
    _getJutsusInTraining() {
        const character = this._getCharacter();
        if (!character?.jutsus) return [];
        
        return character.jutsus.filter(j => j.status === 'in_training');
    },
    
    /**
     * Findet ein Jutsu anhand der ID
     * @private
     */
    _getJutsuById(jutsuId) {
        const character = this._getCharacter();
        if (!character?.jutsus) return null;
        
        return character.jutsus.find(j => j.id === jutsuId || j.name === jutsuId);
    },
    
    /**
     * Prüft und führt Daily Reset durch
     * @private
     */
    _checkDailyReset() {
        const lastTraining = this.state.trainingHistory[this.state.trainingHistory.length - 1];
        if (!lastTraining) return;
        
        const lastDate = new Date(lastTraining.timestamp);
        const now = new Date();
        
        if (lastDate.getDate() !== now.getDate() ||
            lastDate.getMonth() !== now.getMonth() ||
            lastDate.getFullYear() !== now.getFullYear()) {
            this.state.completedToday = false;
        }
    },
    
    /**
     * Lädt den State
     * @private
     */
    _loadState() {
        const character = this._getCharacter();
        if (character?.trainingState) {
            this.state = { ...this.state, ...character.trainingState };
        }
    },
    
    /**
     * Speichert den State
     * @private
     */
    _StateManager.saveState() {
        const character = this._getCharacter();
        if (character) {
            character.trainingState = this.state;
            if (typeof StateManager !== 'undefined') {
                StateManager.updateCharacter(character);
            }
        }
    },
    
    /**
     * Gibt den aktuellen Character zurück
     * @private
     */
    _getCharacter() {
        if (typeof StateManager !== 'undefined') {
            return StateManager.getCharacter();
        }
        return window.currentCharacter || null;
    },
    
    // === UI ===
    
    /**
     * Rendert Trainings-Auswahl
     */
    renderTrainingSelection() {
        if (!this.isAvailable()) {
            this._renderTrainingUnavailable();
            return;
        }
        
        const trainings = this.getAvailableTrainings();
        
        let container = document.getElementById('training-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'training-container';
            container.className = 'training-container';
            document.body.appendChild(container);
        }
        
        container.innerHTML = `
            <div class="training-overlay">
                <div class="training-box">
                    <div class="training-header">
                        <h2>🏋️ Tägliches Training</h2>
                        <p>Wähle eine Trainingsart. Du kannst heute nur eine durchführen.</p>
                    </div>
                    
                    <div class="training-options">
                        ${trainings.map(training => `
                            <div class="training-card" data-type="${training.id}" style="--training-color: ${training.color}">
                                <div class="training-icon">${training.icon}</div>
                                <h3>${training.name}</h3>
                                <p class="training-description">${training.description}</p>
                                
                                ${training.selectableJutsus ? `
                                    <div class="jutsu-selection">
                                        <select class="jutsu-select" data-training="${training.id}">
                                            ${training.selectableJutsus.map(j => `
                                                <option value="${j.id || j.name}">${j.name}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                ` : ''}
                                
                                <div class="training-effect">
                                    <strong>Effekt:</strong> ${training.effect || `+${training.reward?.xp} XP`}
                                </div>
                                
                                <button class="training-start-btn" data-type="${training.id}"
                                    ${training.selectableJutsus && training.selectableJutsus.length === 0 ? 'disabled' : ''}>
                                    Training starten
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="training-close-btn" onclick="this.closest('.training-container').remove()">
                        Abbrechen
                    </button>
                </div>
            </div>
        `;
        
        // Event Listener
        container.querySelectorAll('.training-start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trainingType = e.target.dataset.type;
                let options = {};
                
                // Jutsu-Auswahl
                if (trainingType === 'jutsu') {
                    const select = container.querySelector(`.jutsu-select[data-training="${trainingType}"]`);
                    if (select) {
                        options.jutsuId = select.value;
                    }
                }
                
                const result = this.startTraining(trainingType, options);
                
                if (result.success) {
                    this.renderTrainingResult(result);
                    container.remove();
                } else {
                    alert(result.message);
                }
            });
        });
        
        container.style.display = 'block';
    },
    
    /**
     * Rendert Trainings-Ergebnis
     * @param {Object} result - Das Trainings-Ergebnis
     */
    renderTrainingResult(result) {
        let container = document.getElementById('training-result-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'training-result-container';
            container.className = 'training-result-container';
            document.body.appendChild(container);
        }
        
        const training = this.CONFIG.TRAINING_TYPES[result.type];
        
        container.innerHTML = `
            <div class="training-result-overlay">
                <div class="training-result-box">
                    <div class="training-result-header">
                        <span class="training-icon-large" style="color: ${training.color}">${training.icon}</span>
                        <h2>${result.trainingName} abgeschlossen!</h2>
                    </div>
                    
                    <p class="training-message">${result.message}</p>
                    
                    ${result.effects.length > 0 ? `
                        <div class="training-effects">
                            <h4>Erhaltene Effekte:</h4>
                            ${result.effects.map(effect => `
                                <div class="effect-item ${effect.type}">
                                    ${this._formatEffect(effect)}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <button class="training-close-btn" onclick="this.closest('.training-result-container').remove()">
                        Verstanden
                    </button>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    },
    
    /**
     * Rendert "Training nicht verfügbar"
     * @private
     */
    _renderTrainingUnavailable() {
        let container = document.getElementById('training-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'training-container';
            container.className = 'training-container';
            document.body.appendChild(container);
        }
        
        container.innerHTML = `
            <div class="training-overlay">
                <div class="training-box">
                    <div class="training-unavailable">
                        <span class="icon">😴</span>
                        <h2>Training nicht verfügbar</h2>
                        <p>Du hast heute bereits trainiert.</p>
                        <p>Kehre morgen zurück, um weiterzumachen.</p>
                        
                        <button class="training-close-btn" onclick="this.closest('.training-container').remove()">
                            Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    },
    
    /**
     * Formatiert einen Effekt für die Anzeige
     * @private
     */
    _formatEffect(effect) {
        const formatters = {
            jutsu_learned: () => `📜 Jutsu gemeistert: ${effect.jutsu}`,
            jutsu_progress: () => `📜 Fortschritt: ${effect.progress}/${effect.required} (noch ${effect.remaining})`,
            chakra_bonus: () => `💜 +${effect.amount} permanentes Chakra`,
            meditation_progress: () => `🧘 Fortschritt: ${effect.progress}/${effect.required} (noch ${effect.remaining})`,
            hp_bonus: () => `❤️ +${effect.amount} permanentes HP`,
            sparring_progress: () => `⚔️ Fortschritt: ${effect.progress}/${effect.required} (noch ${effect.remaining})`,
            stamina_bonus: () => `🏃 +${effect.amount} Stamina`,
            stamina_progress: () => `🏃 Fortschritt: ${effect.progress}/${effect.required} (noch ${effect.remaining})`,
            xp: () => `⭐ +${effect.amount} XP`,
            karma: () => `☀️ +${effect.amount} Karma`
        };
        
        return formatters[effect.type]?.() || `${effect.type}: ${JSON.stringify(effect)}`;
    }
};

// Global verfügbar machen
window.TrainingSystem = TrainingSystem;
