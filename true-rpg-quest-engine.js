/**
 * True RPG Quest Engine - Frostfels
 * 
 * Echte Quest-Engine mit:
 * - Multi-Phase Quests
 * - Echte Objectives mit Gameplay-Integration
 * - Quest Steps mit Location/Combat/Collection
 * - Return-to-NPC System
 * - Training Decision System
 * - DM Live Tracking
 */

const TrueRPGQuestEngine = {
    
    // ============================================
    // QUEST STATES
    // ============================================
    
    STATES: {
        AVAILABLE: 'available',
        DIALOG_OPEN: 'dialog_open',
        ACCEPTED: 'accepted',
        PHASE_1_ACTIVE: 'phase_1_active',
        PHASE_1_COMPLETE: 'phase_1_complete',
        PHASE_2_ACTIVE: 'phase_2_active',
        PHASE_2_COMPLETE: 'phase_2_complete',
        PHASE_3_ACTIVE: 'phase_3_active',
        PHASE_3_COMPLETE: 'phase_3_complete',
        RETURN_REQUIRED: 'return_required',
        READY_FOR_TURN_IN: 'ready_for_turn_in',
        COMPLETED: 'completed',
        CHAIN_UNLOCKED: 'chain_unlocked'
    },
    
    // ============================================
    // ACTIVE QUESTS REGISTRY
    // ============================================
    
    activeQuests: [],
    completedQuests: [],
    dailyQuests: [],
    trainingQuest: null,
    lastReset: null,
    
    // ============================================
    // QUEST DEFINITIONS
    // ============================================
    
    QUESTS: {
        // STORY QUEST: Banditen am Grenzwald
        banditen_grenzwald: {
            id: 'banditen_grenzwald',
            title: 'Banditen am Grenzwald',
            type: 'story',
            questGiver: { name: 'Taro', location: 'Marktplatz' },
            
            phases: [
                {
                    id: 'phase_1',
                    name: 'Untersuchung',
                    description: 'Gehe zum Grenzwald und untersuche die Lage.',
                    objectives: [
                        { 
                            id: 'travel_grenzwald', 
                            text: 'Reise zum Grenzwald',
                            type: 'travel',
                            target: 'grenzwald',
                            completed: false
                        },
                        {
                            id: 'investigate',
                            text: 'Untersuche die Überfallstelle',
                            type: 'investigate',
                            target: 'bandit_attack_site',
                            completed: false
                        }
                    ],
                    onComplete: 'phase_2_active'
                },
                {
                    id: 'phase_2',
                    name: 'Das Lager',
                    description: 'Finde das Banditenlager und besiege die Banditen.',
                    objectives: [
                        {
                            id: 'find_camp',
                            text: 'Finde das Banditenlager',
                            type: 'discover',
                            target: 'bandit_camp',
                            completed: false
                        },
                        {
                            id: 'defeat_bandits',
                            text: 'Besiege 3 Banditen',
                            type: 'combat',
                            target: { enemy: 'bandit', count: 3 },
                            progress: 0,
                            completed: false
                        }
                    ],
                    onComplete: 'phase_3_active'
                },
                {
                    id: 'phase_3',
                    name: 'Die Lieferung',
                    description: 'Sichere die gestohlene Lieferung.',
                    objectives: [
                        {
                            id: 'recover_goods',
                            text: 'Berge die gestohlenen Waren',
                            type: 'collect',
                            target: { item: 'stolen_goods', count: 1 },
                            completed: false
                        }
                    ],
                    onComplete: 'return_required'
                }
            ],
            
            returnNPC: { name: 'Taro', location: 'Marktplatz' },
            
            rewards: {
                gold: 150,
                xp: 80,
                reputation: { village: 2, taro: 3 },
                items: []
            },
            
            chainUnlock: null,
            karma: 5,
            difficulty: 'medium'
        },
        
        // STORY QUEST: Verschwundene Lieferung
        verschwundene_lieferung: {
            id: 'verschwundene_lieferung',
            title: 'Die verschwundene Lieferung',
            type: 'story',
            questGiver: { name: 'Yuki', location: 'Schmiede' },
            
            phases: [
                {
                    id: 'phase_1',
                    name: 'Die Spur',
                    description: 'Untersuche die Nordroute nach Hinweisen.',
                    objectives: [
                        {
                            id: 'travel_nordroute',
                            text: 'Begib dich zur Nordroute',
                            type: 'travel',
                            target: 'nordroute',
                            completed: false
                        },
                        {
                            id: 'find_clues',
                            text: 'Finde 3 Hinweise',
                            type: 'collect_clues',
                            target: { clue: 'courier_trace', count: 3 },
                            progress: 0,
                            completed: false
                        }
                    ],
                    onComplete: 'phase_2_active'
                },
                {
                    id: 'phase_2',
                    name: 'Der Kurier',
                    description: 'Finde den Kurier oder seine Spuren.',
                    objectives: [
                        {
                            id: 'find_courier',
                            text: 'Finde den vermissten Kurier',
                            type: 'discover',
                            target: 'missing_courier',
                            completed: false
                        }
                    ],
                    onComplete: 'phase_3_active'
                },
                {
                    id: 'phase_3',
                    name: 'Rückkehr',
                    description: 'Kehre zu Yuki zurück und berichte.',
                    objectives: [
                        {
                            id: 'report_yuki',
                            text: 'Sprich mit Yuki',
                            type: 'talk',
                            target: { npc: 'Yuki', location: 'Schmiede' },
                            completed: false
                        }
                    ],
                    onComplete: 'ready_for_turn_in'
                }
            ],
            
            returnNPC: { name: 'Yuki', location: 'Schmiede' },
            
            rewards: {
                gold: 200,
                xp: 100,
                reputation: { merchants: 3, yuki: 5 },
                items: [{ name: 'Rabattmarke Yuki', effect: '20% Rabatt' }]
            },
            
            chainUnlock: 'lieferung_chain_step2',
            karma: 3,
            difficulty: 'medium'
        },
        
        // SIDE QUEST: Wolfshöhle
        wolfshoehle: {
            id: 'wolfshoehle',
            title: 'Die Wolfshöhle',
            type: 'side',
            questGiver: { name: 'Jäger', location: 'Jagdgebiet' },
            
            phases: [
                {
                    id: 'phase_1',
                    name: 'Die Höhle',
                    description: 'Finde die Wolfshöhle und erlege die Wölfe.',
                    objectives: [
                        {
                            id: 'find_cave',
                            text: 'Finde die Wolfshöhle',
                            type: 'discover',
                            target: 'wolf_cave',
                            completed: false
                        },
                        {
                            id: 'kill_wolves',
                            text: 'Erlege 5 Wölfe',
                            type: 'combat',
                            target: { enemy: 'wolf', count: 5 },
                            progress: 0,
                            completed: false
                        }
                    ],
                    onComplete: 'return_required'
                }
            ],
            
            returnNPC: { name: 'Jäger', location: 'Jagdgebiet' },
            
            rewards: {
                gold: 100,
                xp: 60,
                items: [{ name: 'Wolfsfell', quantity: 5 }]
            },
            
            karma: 2,
            difficulty: 'easy'
        }
    },
    
    // ============================================
    // TRAINING OPTIONS
    // ============================================
    
    TRAINING_OPTIONS: {
        jutsu_training: {
            id: 'jutsu_training',
            name: 'Jutsu Training',
            description: 'Trainiere ein spezifisches Jutsu. Fortschritt für Jutsu-Lernsystem.',
            effects: {
                jutsuProgress: 10,
                xp: 15
            },
            requirements: { hasJutsu: true }
        },
        meditation: {
            id: 'meditation',
            name: 'Meditation',
            description: 'Meditiere zur Chakra-Kontrolle und innerer Balance.',
            effects: {
                chakraBonus: 10,
                karma: 2,
                xp: 10
            }
        },
        sparring: {
            id: 'sparring',
            name: 'Sparring',
            description: 'Trainiere Kampftechniken mit einem Partner.',
            effects: {
                combatXP: 20,
                xp: 20,
                staminaBonus: 5
            }
        },
        chakra_control: {
            id: 'chakra_control',
            name: 'Chakra Kontrolle',
            description: 'Übe präzise Chakra-Manipulation für spätere Freischaltungen.',
            effects: {
                chakraControl: 5,
                unlockPoints: 1,
                xp: 15
            }
        },
        weapon_training: {
            id: 'weapon_training',
            name: 'Waffentraining',
            description: 'Pflege und Übung mit deiner Waffe.',
            effects: {
                weaponSkill: 3,
                xp: 15
            }
        },
        stealth_training: {
            id: 'stealth_training',
            name: 'Tarnung',
            description: 'Übe Verstecken und Schleichen.',
            effects: {
                stealth: 5,
                xp: 15
            }
        }
    },
    
    // ============================================
    // INITIALISIERUNG
    // ============================================
    
    init() {
        console.log('True RPG Quest Engine initialisiert');
        this.loadState();
        this.checkDailyReset();
    },
    
    // ============================================
    // DAILY QUEST GENERATION
    // ============================================
    
    checkDailyReset() {
        const now = new Date();
        const lastReset = this.lastReset ? new Date(this.lastReset) : null;
        
        if (!lastReset || 
            now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            
            this.generateDailyQuests();
            this.lastReset = now.toISOString();
            this.saveState();
        }
    },
    
    generateDailyQuests() {
        // Maximal 3 Daily Quests
        this.dailyQuests = [];
        
        // 2 Story Quests
        const storyQuests = ['banditen_grenzwald', 'verschwundene_lieferung'];
        storyQuests.forEach(questId => {
            if (!this.isQuestCompleted(questId)) {
                const quest = this.createQuestInstance(questId);
                if (quest) this.dailyQuests.push(quest);
            }
        });
        
        // 1 Side Quest
        if (this.dailyQuests.length < 3) {
            const sideQuest = this.createQuestInstance('wolfshoehle');
            if (sideQuest) this.dailyQuests.push(sideQuest);
        }
        
        // 1 Training Quest (Entscheidungsbasiert)
        this.generateTrainingQuest();
        
        console.log('Daily Quests generiert:', this.dailyQuests.length);
    },
    
    generateTrainingQuest() {
        this.trainingQuest = {
            id: 'daily_training',
            type: 'training',
            title: 'Tägliches Training',
            description: 'Wähle dein Training für heute.',
            state: this.STATES.AVAILABLE,
            selected: false,
            completed: false,
            choice: null,
            timestamp: Date.now()
        };
    },
    
    createQuestInstance(questId) {
        const template = this.QUESTS[questId];
        if (!template) return null;
        
        return {
            instanceId: questId + '_' + Date.now(),
            templateId: questId,
            title: template.title,
            type: template.type,
            questGiver: { ...template.questGiver },
            phases: JSON.parse(JSON.stringify(template.phases)),
            currentPhase: 0,
            state: this.STATES.AVAILABLE,
            returnNPC: { ...template.returnNPC },
            rewards: { ...template.rewards },
            karma: template.karma,
            difficulty: template.difficulty,
            acceptedAt: null,
            completedAt: null
        };
    },
    
    isQuestCompleted(questId) {
        return this.completedQuests.some(q => q.templateId === questId);
    },
    
    // ============================================
    // QUEST MANAGEMENT
    // ============================================
    
    acceptQuest(instanceId) {
        const quest = this.dailyQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        quest.state = this.STATES.ACCEPTED;
        quest.acceptedAt = Date.now();
        
        // Starte erste Phase
        this.startPhase(quest, 0);
        
        // Verschiebe zu active
        this.activeQuests.push(quest);
        this.dailyQuests = this.dailyQuests.filter(q => q.instanceId !== instanceId);
        
        this.saveState();
        
        // WICHTIG: Seite neu rendern
        this.renderQuestPage();
        
        return true;
    },
    
    startPhase(quest, phaseIndex) {
        if (phaseIndex >= quest.phases.length) {
            // Alle Phasen abgeschlossen
            quest.state = this.STATES.RETURN_REQUIRED;
            return;
        }
        
        quest.currentPhase = phaseIndex;
        const phase = quest.phases[phaseIndex];
        
        // Setze Phase auf aktiv
        quest.state = this.STATES['PHASE_' + (phaseIndex + 1) + '_ACTIVE'];
        
        console.log(`Quest "${quest.title}" - Phase ${phaseIndex + 1} gestartet: ${phase.name}`);
    },
    
    /**
     * Prüft Fortschritt einer Quest
     */
    checkQuestProgress(instanceId) {
        const quest = this.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return;
        
        const phase = quest.phases[quest.currentPhase];
        if (!phase) return;
        
        // Prüfe alle Objectives der aktuellen Phase
        let allCompleted = true;
        
        phase.objectives.forEach(obj => {
            if (!obj.completed) {
                // Prüfe Bedingung
                const isComplete = this.checkObjectiveCondition(obj);
                if (isComplete) {
                    obj.completed = true;
                    console.log(`Objective erfüllt: ${obj.text}`);
                } else {
                    allCompleted = false;
                }
            }
        });
        
        // Wenn alle Objectives erfüllt
        if (allCompleted) {
            quest.state = this.STATES['PHASE_' + (quest.currentPhase + 1) + '_COMPLETE'];
            
            // Starte nächste Phase oder setze auf Return
            if (quest.currentPhase < quest.phases.length - 1) {
                this.startPhase(quest, quest.currentPhase + 1);
            } else {
                quest.state = this.STATES.RETURN_REQUIRED;
            }
            
            this.saveState();
            this.renderQuestPage();
        }
    },
    
    checkObjectiveCondition(objective) {
        // HIER WÜRDE DIE ECHTE SPIEL-LOGIK PRÜFEN
        // Für Demo: Simuliere Fortschritt durch Spieleraktionen
        
        switch (objective.type) {
            case 'travel':
                // Prüfe, ob Spieler am Zielort ist
                return false; // Muss durch Spiel gesetzt werden
                
            case 'combat':
                // Prüfe besiegte Gegner
                return false;
                
            case 'collect':
                // Prüfe gesammelte Items
                return false;
                
            case 'discover':
                // Prüfe entdeckte Orte
                return false;
                
            case 'investigate':
                // Prüfe untersuchte Orte
                return false;
                
            case 'talk':
                // Prüfe NPC-Gespräch
                return false;
                
            case 'collect_clues':
                // Prüfe gesammelte Hinweise
                return false;
                
            default:
                return false;
        }
    },
    
    /**
     * Spieler meldet Quest beim NPC ab
     */
    returnToNPC(instanceId) {
        const quest = this.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        if (quest.state !== this.STATES.RETURN_REQUIRED) {
            alert('Ihr müsst erst alle Questphasen abschließen!');
            return false;
        }
        
        quest.state = this.STATES.READY_FOR_TURN_IN;
        this.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    /**
     * Quest abschließen und Belohnungen erhalten
     */
    completeQuest(instanceId) {
        const questIndex = this.activeQuests.findIndex(q => q.instanceId === instanceId);
        if (questIndex === -1) return false;
        
        const quest = this.activeQuests[questIndex];
        
        if (quest.state !== this.STATES.READY_FOR_TURN_IN) {
            alert('Die Quest ist noch nicht bereit zur Abgabe!');
            return false;
        }
        
        // Belohnungen
        this.grantRewards(quest.rewards);
        
        // Karma
        if (quest.karma && typeof QuestSystem !== 'undefined') {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + quest.karma));
        }
        
        quest.state = this.STATES.COMPLETED;
        quest.completedAt = Date.now();
        
        this.completedQuests.push(quest);
        this.activeQuests.splice(questIndex, 1);
        
        this.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    /**
     * Training wählen
     */
    selectTraining(trainingId) {
        if (!this.trainingQuest || this.trainingQuest.completed) return false;
        
        const training = this.TRAINING_OPTIONS[trainingId];
        if (!training) return false;
        
        this.trainingQuest.choice = trainingId;
        this.trainingQuest.selected = true;
        this.trainingQuest.state = this.STATES.ACTIVE;
        
        this.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    /**
     * Training abschließen
     */
    completeTraining() {
        if (!this.trainingQuest || !this.trainingQuest.selected || this.trainingQuest.completed) {
            return false;
        }
        
        const training = this.TRAINING_OPTIONS[this.trainingQuest.choice];
        if (!training) return false;
        
        // Effekte anwenden
        this.applyTrainingEffects(training.effects);
        
        this.trainingQuest.completed = true;
        this.trainingQuest.state = this.STATES.COMPLETED;
        
        this.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    applyTrainingEffects(effects) {
        if (!window.currentCharacter) return;
        
        if (effects.xp) {
            window.currentCharacter.xp = (window.currentCharacter.xp || 0) + effects.xp;
        }
        
        if (effects.chakraBonus) {
            window.currentCharacter.stats = window.currentCharacter.stats || {};
            window.currentCharacter.stats.chakraBonus = (window.currentCharacter.stats.chakraBonus || 0) + effects.chakraBonus;
        }
        
        if (effects.karma && typeof QuestSystem !== 'undefined') {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + effects.karma));
        }
        
        // Weitere Effekte...
        console.log('Trainingseffekte angewendet:', effects);
    },
    
    grantRewards(rewards) {
        if (!window.currentCharacter) return;
        
        if (rewards.gold) {
            window.currentCharacter.money = window.currentCharacter.money || { gold: 0 };
            window.currentCharacter.money.gold += rewards.gold;
        }
        
        if (rewards.xp) {
            window.currentCharacter.xp = (window.currentCharacter.xp || 0) + rewards.xp;
        }
    },
    
    // ============================================
    // RENDERING
    // ============================================
    
    renderQuestPage() {
        const container = document.getElementById('questPage');
        if (!container) return;
        
        container.innerHTML = `
            <div class="true-rpg-quest-page">
                <div class="quest-header">
                    <h2>📜 Frostfels Quests</h2>
                    <div class="quest-count">
                        Verfügbar: ${this.dailyQuests.length} | 
                        Aktiv: ${this.activeQuests.length} | 
                        Abgeschlossen: ${this.completedQuests.length}
                    </div>
                </div>
                
                <!-- Training Section -->
                ${this.renderTrainingSection()}
                
                <!-- Available Quests -->
                <section class="quest-section">
                    <h3>📅 Verfügbare Quests (${this.dailyQuests.length}/3)</h3>
                    ${this.dailyQuests.length === 0 ? 
                        '<p class="no-quests">Keine verfügbaren Quests mehr heute.</p>' :
                        this.dailyQuests.map(q => this.renderAvailableQuest(q)).join('')}
                </section>
                
                <!-- Active Quests -->
                <section class="quest-section">
                    <h3>⚔️ Aktive Quests</h3>
                    ${this.activeQuests.length === 0 ? 
                        '<p class="no-quests">Keine aktiven Quests.</p>' :
                        this.activeQuests.map(q => this.renderActiveQuest(q)).join('')}
                </section>
                
                <!-- Completed Quests -->
                <section class="quest-section">
                    <h3>✅ Abgeschlossen</h3>
                    ${this.completedQuests.length === 0 ? 
                        '<p class="no-quests">Noch keine abgeschlossenen Quests.</p>' :
                        this.completedQuests.slice(-3).reverse().map(q => this.renderCompletedQuest(q)).join('')}
                </section>
            </div>
        `;
    },
    
    renderTrainingSection() {
        if (!this.trainingQuest) return '';
        
        const t = this.trainingQuest;
        
        if (t.completed) {
            return `
                <section class="training-section completed">
                    <h3>💪 Training Abgeschlossen</h3>
                    <div class="training-complete">
                        <p>Du hast heute ${this.TRAINING_OPTIONS[t.choice]?.name || 'Training'} absolviert.</p>
                        <p>Komm morgen wieder für neues Training!</p>
                    </div>
                </section>
            `;
        }
        
        if (t.selected) {
            const training = this.TRAINING_OPTIONS[t.choice];
            return `
                <section class="training-section active">
                    <h3>💪 Training in Progress</h3>
                    <div class="training-active">
                        <h4>${training.name}</h4>
                        <p>${training.description}</p>
                        <div class="training-effects">
                            <strong>Effekte:</strong>
                            ${this.renderTrainingEffects(training.effects)}
                        </div>
                        <button class="btn-primary btn-large" onclick="TrueRPGQuestEngine.completeTraining()">
                            ✅ Training abschließen
                        </button>
                    </div>
                </section>
            `;
        }
        
        // Training Auswahl
        return `
            <section class="training-section">
                <h3>💪 Wähle dein tägliches Training</h3>
                <div class="training-options">
                    ${Object.values(this.TRAINING_OPTIONS).map(training => `
                        <div class="training-card" onclick="TrueRPGQuestEngine.selectTraining('${training.id}')">
                            <h4>${training.name}</h4>
                            <p>${training.description}</p>
                            <div class="training-effects-preview">
                                ${this.renderTrainingEffects(training.effects)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    },
    
    renderTrainingEffects(effects) {
        const parts = [];
        if (effects.xp) parts.push(`+${effects.xp} XP`);
        if (effects.jutsuProgress) parts.push(`+${effects.jutsuProgress} Jutsu-Fortschritt`);
        if (effects.chakraBonus) parts.push(`+${effects.chakraBonus} Chakra`);
        if (effects.chakraControl) parts.push(`+${effects.chakraControl} Kontrolle`);
        if (effects.combatXP) parts.push(`+${effects.combatXP} Kampf-XP`);
        if (effects.karma) parts.push(`${effects.karma > 0 ? '+' : ''}${effects.karma} Karma`);
        if (effects.unlockPoints) parts.push(`+${effects.unlockPoints} Freischaltung`);
        if (effects.weaponSkill) parts.push(`+${effects.weaponSkill} Waffenfertigkeit`);
        if (effects.stealth) parts.push(`+${effects.stealth} Tarnung`);
        if (effects.staminaBonus) parts.push(`+${effects.staminaBonus} Ausdauer`);
        
        return parts.join(' | ');
    },
    
    renderAvailableQuest(quest) {
        const currentPhase = quest.phases[quest.currentPhase];
        
        return `
            <div class="quest-card available ${quest.difficulty}">
                <div class="quest-type-badge">${quest.type === 'story' ? '📖 Story' : '🎯 Side'}</div>
                <h4>${quest.title}</h4>
                
                <div class="quest-giver">
                    Auftraggeber: <strong>${quest.questGiver.name}</strong> @ ${quest.questGiver.location}
                </div>
                
                <div class="quest-phases-preview">
                    <strong>${quest.phases.length} Phasen:</strong>
                    <ol>
                        ${quest.phases.map(p => `<li>${p.name}: ${p.description.substring(0, 50)}...</li>`).join('')}
                    </ol>
                </div>
                
                <div class="quest-rewards">
                    💰 ${quest.rewards.gold} Gold | ⭐ ${quest.rewards.xp} XP | 🌟 ${quest.karma > 0 ? '+' : ''}${quest.karma} Karma
                </div>
                
                <button class="btn-primary" onclick="TrueRPGQuestEngine.acceptQuest('${quest.instanceId}')">
                    ✅ Quest annehmen
                </button>
            </div>
        `;
    },
    
    renderActiveQuest(quest) {
        const currentPhase = quest.phases[quest.currentPhase];
        const isReturn = quest.state === this.STATES.RETURN_REQUIRED;
        const isReady = quest.state === this.STATES.READY_FOR_TURN_IN;
        
        return `
            <div class="quest-card active ${quest.difficulty} ${isReady ? 'ready' : ''}">
                <div class="quest-status-bar">
                    <span class="status-badge">${this.getStateLabel(quest.state)}</span>
                    <span class="phase-indicator">Phase ${quest.currentPhase + 1}/${quest.phases.length}</span>
                </div>
                
                <h4>${quest.title}</h4>
                
                ${isReturn ? `
                    <div class="return-notice">
                        🏃 Kehre zurück zu <strong>${quest.returnNPC.name}</strong> @ ${quest.returnNPC.location}
                    </div>
                    <button class="btn-primary btn-large" onclick="TrueRPGQuestEngine.returnToNPC('${quest.instanceId}')">
                        🏆 Bei ${quest.returnNPC.name} abgeben
                    </button>
                ` : isReady ? `
                    <div class="ready-notice">
                        ✓ Bereit zur Abgabe bei ${quest.returnNPC.name}
                    </div>
                    <button class="btn-primary btn-large" onclick="TrueRPGQuestEngine.completeQuest('${quest.instanceId}')">
                        🎉 Quest abschließen
                    </button>
                ` : `
                    <div class="current-phase">
                        <strong>Aktuelle Phase: ${currentPhase.name}</strong>
                        <p>${currentPhase.description}</p>
                        
                        <div class="objectives">
                            ${currentPhase.objectives.map(obj => `
                                <div class="objective ${obj.completed ? 'completed' : 'pending'}">
                                    ${obj.completed ? '✅' : '⏳'} ${obj.text}
                                    ${obj.progress !== undefined ? `(${obj.progress}/${obj.target})` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <button class="btn-secondary" onclick="TrueRPGQuestEngine.checkQuestProgress('${quest.instanceId}')">
                        🔄 Fortschritt prüfen
                    </button>
                `}
            </div>
        `;
    },
    
    renderCompletedQuest(quest) {
        return `
            <div class="quest-card completed">
                <span class="completed-badge">✅ Abgeschlossen</span>
                <h4>${quest.title}</h4>
                <div class="completion-info">
                    Abgeschlossen: ${new Date(quest.completedAt).toLocaleDateString()}
                    <br>
                    Belohnung: ${quest.rewards.gold} Gold, ${quest.rewards.xp} XP
                </div>
            </div>
        `;
    },
    
    getStateLabel(state) {
        const labels = {
            [this.STATES.AVAILABLE]: 'Verfügbar',
            [this.STATES.ACCEPTED]: 'Angenommen',
            [this.STATES.PHASE_1_ACTIVE]: 'Phase 1 aktiv',
            [this.STATES.PHASE_1_COMPLETE]: 'Phase 1 erfüllt',
            [this.STATES.PHASE_2_ACTIVE]: 'Phase 2 aktiv',
            [this.STATES.PHASE_2_COMPLETE]: 'Phase 2 erfüllt',
            [this.STATES.PHASE_3_ACTIVE]: 'Phase 3 aktiv',
            [this.STATES.PHASE_3_COMPLETE]: 'Phase 3 erfüllt',
            [this.STATES.RETURN_REQUIRED]: 'Rückkehr nötig',
            [this.STATES.READY_FOR_TURN_IN]: 'Abgabebereit',
            [this.STATES.COMPLETED]: 'Abgeschlossen'
        };
        return labels[state] || state;
    },
    
    // ============================================
    // SAVE / LOAD
    // ============================================
    
    saveState() {
        const data = {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            dailyQuests: this.dailyQuests,
            trainingQuest: this.trainingQuest,
            lastReset: this.lastReset
        };
        localStorage.setItem('true_rpg_quest_engine', JSON.stringify(data));
    },
    
    loadState() {
        const saved = localStorage.getItem('true_rpg_quest_engine');
        if (saved) {
            const data = JSON.parse(saved);
            this.activeQuests = data.activeQuests || [];
            this.completedQuests = data.completedQuests || [];
            this.dailyQuests = data.dailyQuests || [];
            this.trainingQuest = data.trainingQuest || null;
            this.lastReset = data.lastReset || null;
        }
    }
};

// Global verfügbar machen
window.TrueRPGQuestEngine = TrueRPGQuestEngine;
