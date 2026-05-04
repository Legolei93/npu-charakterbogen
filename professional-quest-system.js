/**
 * Professional RPG Quest System - Frostfels
 * 
 * Echtes RPG Quest-System mit:
 * - Quest State Machine
 * - Condition Engine
 * - Progress Tracking
 * - Dialog System
 * - Objective Validation
 * - DM Integration
 */

const ProfessionalQuestSystem = {
    
    // ============================================
    // QUEST STATES
    // ============================================
    
    QUEST_STATES: {
        AVAILABLE: 'available',       // Quest verfügbar
        ACCEPTED: 'accepted',         // Angenommen, Dialog läuft
        ACTIVE: 'active',             // Aktiv, in Bearbeitung
        IN_PROGRESS: 'in_progress',   // Fortschritt läuft
        OBJECTIVES_MET: 'objectives_met', // Ziele erfüllt
        READY_FOR_TURN_IN: 'ready_for_turn_in', // Abgabebereit
        COMPLETED: 'completed',       // Abgeschlossen
        FAILED: 'failed',             // Fehlgeschlagen
        ABANDONED: 'abandoned'        // Aufgegeben
    },
    
    // ============================================
    // QUEST TEMPLATES
    // ============================================
    
    QUEST_TEMPLATES: {
        // STORY QUESTS
        banditen_grenzwald: {
            id: 'banditen_grenzwald',
            title: 'Banditen am Grenzwald',
            questGiver: { name: 'Taro', location: 'Marktplatz', mood: 'worried' },
            
            // Dialog-System
            dialog: {
                start: {
                    speaker: 'Taro',
                    text: 'Wenn ihr jetzt geht, sterben Menschen. Seit Tagen verschwinden Lieferungen am Grenzwald. Die Dorfbewohner trauen sich nicht mehr aus dem Haus.',
                    emotion: 'worried',
                    options: [
                        { 
                            text: 'Ich werde helfen.', 
                            next: 'accept',
                            karma: 5,
                            trust: 10
                        },
                        { 
                            text: 'Was ist der Preis?', 
                            next: 'negotiate',
                            karma: 0,
                            trust: -5
                        },
                        { 
                            text: 'Das ist nicht mein Problem.', 
                            next: 'reject',
                            karma: -5,
                            trust: -15,
                            consequence: 'taro_remembers_rejection'
                        }
                    ]
                },
                negotiate: {
                    speaker: 'Taro',
                    text: '150 Gold. Mehr kann ich nicht bieten. Aber ich werde euch empfehlen. Das ist mehr wert als Gold.',
                    options: [
                        { text: 'Einverstanden.', next: 'accept', karma: 0, trust: 0 },
                        { text: 'Zu wenig. Ich passe.', next: 'reject', karma: -3, trust: -10 }
                    ]
                },
                accept: {
                    speaker: 'Taro',
                    text: 'Danke. Die Banditen haben ihr Lager irgendwo im Grenzwald. Seid vorsichtig - sie sind bewaffnet und gefährlich.',
                    action: 'accept_quest',
                    next: null
                },
                reject: {
                    speaker: 'Taro',
                    text: 'Dann verschwendet meine Zeit nicht. Es gibt andere, die helfen werden.',
                    action: 'reject_quest',
                    next: null
                }
            },
            
            // Objectives mit Bedingungen
            objectives: [
                {
                    id: 'find_camp',
                    text: 'Finde das Banditenlager im Grenzwald',
                    type: 'location',
                    target: 'grenzwald_bandit_camp',
                    condition: { type: 'visit_location', location: 'grenzwald_bandit_camp' },
                    required: true
                },
                {
                    id: 'defeat_bandits',
                    text: 'Besiege 3 Banditen',
                    type: 'combat',
                    target: { enemy: 'bandit', count: 3 },
                    condition: { type: 'defeat_enemy', enemy: 'bandit', count: 3 },
                    required: true,
                    progress: 0
                },
                {
                    id: 'report_back',
                    text: 'Berichte Taro vom Erfolg',
                    type: 'talk',
                    target: { npc: 'Taro', location: 'Marktplatz' },
                    condition: { type: 'talk_to_npc', npc: 'Taro' },
                    required: true,
                    dependsOn: ['defeat_bandits'] // Nur nach Besiegen der Banditen
                }
            ],
            
            // Belohnungen
            rewards: {
                gold: 150,
                xp: 80,
                reputation: { village: 2, taro: 3 },
                items: [],
                unlocks: []
            },
            
            difficulty: 'medium',
            karma: 5,
            timeLimit: null, // Kein Zeitlimit
            
            // Konsequenzen
            consequences: {
                onAccept: ['taro_trust_increase', 'village_hope'],
                onComplete: ['bandits_defeated', 'taro_grateful', 'village_safe'],
                onReject: ['taro_disappointed', 'bandits_continue'],
                onFail: ['taro_concerned', 'village_fear']
            }
        },
        
        verschwundene_lieferung: {
            id: 'verschwundene_lieferung',
            title: 'Die verschwundene Lieferung',
            questGiver: { name: 'Yuki', location: 'Schmiede', mood: 'stressed' },
            
            dialog: {
                start: {
                    speaker: 'Yuki',
                    text: 'Ich frage euch nicht aus Freundschaft. Mein Kurier ist verschwunden. Eine ganze Lieferung Rüstungsteile. Wenn ich die nicht finde, bin ich ruiniert.',
                    emotion: 'stressed',
                    options: [
                        { text: 'Ich finde euren Kurier.', next: 'accept', karma: 3, trust: 10 },
                        { text: 'Was ist die Belohnung?', next: 'negotiate', karma: 0, trust: -5 },
                        { text: 'Sucht ihn selbst.', next: 'reject', karma: -5, trust: -20 }
                    ]
                },
                negotiate: {
                    speaker: 'Yuki',
                    text: '200 Gold. Und eine Rüstung zu Einkaufspreis. Mehr habe ich nicht.',
                    options: [
                        { text: 'Abgemacht.', next: 'accept', karma: 0, trust: 0 },
                        { text: 'Nicht genug.', next: 'reject', karma: -3, trust: -10 }
                    ]
                },
                accept: {
                    speaker: 'Yuki',
                    text: 'Der Kurier sollte über die Nordroute kommen. Sucht nach Spuren. Und beeilt euch - je länger wir warten, desto kälter werden die Spuren.',
                    action: 'accept_quest',
                    next: null
                },
                reject: {
                    speaker: 'Yuki',
                    text: 'Dann geht. Ich werde jemanden finden, der meine Arbeit zu schätzen weiß.',
                    action: 'reject_quest',
                    next: null
                }
            },
            
            objectives: [
                {
                    id: 'investigate_route',
                    text: 'Untersuche die Nordroute',
                    type: 'investigation',
                    condition: { type: 'visit_location', location: 'nordroute' },
                    required: true
                },
                {
                    id: 'find_clues',
                    text: 'Finde Hinweise auf den Verbleib des Kuriers',
                    type: 'investigation',
                    condition: { type: 'find_clues', clueType: 'courier_traces', count: 3 },
                    required: true,
                    progress: 0
                },
                {
                    id: 'find_courier',
                    text: 'Finde den Kurier oder seine Überreste',
                    type: 'discovery',
                    condition: { type: 'discover', target: 'courier' },
                    required: true,
                    dependsOn: ['find_clues']
                },
                {
                    id: 'recover_goods',
                    text: 'Berge die Rüstungsteile',
                    type: 'collect',
                    condition: { type: 'collect_item', item: 'rustungsteile', count: 1 },
                    required: true,
                    dependsOn: ['find_courier']
                },
                {
                    id: 'return_goods',
                    text: 'Bringe die Lieferung zu Yuki zurück',
                    type: 'deliver',
                    condition: { type: 'deliver_to_npc', npc: 'Yuki', item: 'rustungsteile' },
                    required: true,
                    dependsOn: ['recover_goods']
                }
            ],
            
            rewards: {
                gold: 200,
                xp: 100,
                reputation: { merchants: 3, yuki: 5 },
                items: [{ name: 'Rabattmarke', type: 'voucher', discount: 0.2 }],
                chainUnlock: 'lieferung_chain_step2'
            },
            
            difficulty: 'medium',
            karma: 3,
            chain: 'lieferung_chain'
        },
        
        // TRAINING QUESTS
        sparring_training: {
            id: 'sparring_training',
            title: 'Tägliches Sparring',
            questGiver: { name: 'Trainingsmeister', location: 'Trainingsplatz' },
            
            dialog: {
                start: {
                    speaker: 'Trainingsmeister',
                    text: 'Theorie bringt nichts ohne Praxis. Ein Sparring-Match täglich hält euch scharf.',
                    options: [
                        { text: 'Ich bin bereit.', next: 'accept', karma: 0 }
                    ]
                },
                accept: {
                    speaker: 'Trainingsmeister',
                    text: 'Gut. Findet einen Partner und kämpft. Kommt zurück, wenn ihr fertig seid.',
                    action: 'accept_quest',
                    next: null
                }
            },
            
            objectives: [
                {
                    id: 'complete_sparring',
                    text: 'Schließe ein Sparring-Match ab',
                    type: 'training',
                    condition: { type: 'complete_training', trainingType: 'sparring' },
                    required: true
                }
            ],
            
            rewards: {
                xp: 15,
                ap: 0.5
            },
            
            difficulty: 'easy',
            karma: 0,
            isTraining: true
        }
    },
    
    // ============================================
    // SYSTEM STATE
    // ============================================
    
    state: {
        availableQuests: [],
        activeQuests: [],
        completedQuests: [],
        failedQuests: [],
        currentDialog: null,
        lastReset: null
    },
    
    // ============================================
    // INITIALISIERUNG
    // ============================================
    
    init() {
        console.log('Professional Quest System initialisiert');
        this.loadState();
        this.checkDailyReset();
        this.generateDailyQuests();
    },
    
    // ============================================
    // QUEST GENERATION
    // ============================================
    
    generateDailyQuests() {
        // 2 Story Quests
        const storyTemplates = ['banditen_grenzwald', 'verschwundene_lieferung'];
        
        storyTemplates.forEach(templateId => {
            if (!this.isQuestActiveOrCompleted(templateId)) {
                const quest = this.createQuestFromTemplate(templateId);
                if (quest) {
                    this.state.availableQuests.push(quest);
                }
            }
        });
        
        // 1 Training Quest
        const trainingQuest = this.createQuestFromTemplate('sparring_training');
        if (trainingQuest) {
            this.state.availableQuests.push(trainingQuest);
        }
        
        this.StateManager.saveState();
    },
    
    createQuestFromTemplate(templateId) {
        const template = this.QUEST_TEMPLATES[templateId];
        if (!template) return null;
        
        return {
            instanceId: 'quest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            templateId: template.id,
            state: this.QUEST_STATES.AVAILABLE,
            
            // Kopie der Template-Daten
            title: template.title,
            questGiver: { ...template.questGiver },
            dialog: JSON.parse(JSON.stringify(template.dialog)),
            objectives: JSON.parse(JSON.stringify(template.objectives)),
            rewards: { ...template.rewards },
            difficulty: template.difficulty,
            karma: template.karma,
            isTraining: template.isTraining || false,
            
            // Laufzeit-Daten
            acceptedAt: null,
            startedAt: null,
            completedAt: null,
            currentDialogNode: 'start',
            dialogHistory: [],
            
            // Fortschritt
            progress: {
                currentObjective: 0,
                objectivesCompleted: [],
                conditionsMet: []
            }
        };
    },
    
    isQuestActiveOrCompleted(templateId) {
        return this.state.activeQuests.some(q => q.templateId === templateId) ||
               this.state.completedQuests.some(q => q.templateId === templateId);
    },
    
    // ============================================
    // DIALOG SYSTEM
    // ============================================
    
    startDialog(instanceId) {
        const quest = this.state.availableQuests.find(q => q.instanceId === instanceId);
        if (!quest) return;
        
        quest.currentDialogNode = 'start';
        quest.state = this.QUEST_STATES.ACCEPTED;
        
        this.renderDialog(quest);
    },
    
    renderDialog(quest) {
        const container = document.getElementById('questPage');
        if (!container) return;
        
        const dialogNode = quest.dialog[quest.currentDialogNode];
        if (!dialogNode) {
            // Dialog zu Ende, zeige normale Quest-Seite
            this.renderQuestPage();
            return;
        }
        
        container.innerHTML = `
            <div class="quest-dialog-overlay">
                <div class="quest-dialog-box">
                    <div class="dialog-speaker">
                        <span class="speaker-name">${dialogNode.speaker}</span>
                        <span class="speaker-location">${quest.questGiver.location}</span>
                    </div>
                    
                    <div class="dialog-text">
                        <p>"${dialogNode.text}"</p>
                    </div>
                    
                    <div class="dialog-options">
                        ${dialogNode.options ? dialogNode.options.map((opt, idx) => `
                            <button class="dialog-option ${opt.karma > 0 ? 'good' : opt.karma < 0 ? 'bad' : 'neutral'}" 
                                    onclick="ProfessionalQuestSystem.selectDialogOption('${quest.instanceId}', ${idx})">
                                ${opt.text}
                                ${opt.karma !== 0 ? `<span class="karma-hint">${opt.karma > 0 ? '+' : ''}${opt.karma} Karma</span>` : ''}
                            </button>
                        `).join('') : `
                            <button class="dialog-option" onclick="ProfessionalQuestSystem.closeDialog('${quest.instanceId}')">
                                Weiter
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },
    
    selectDialogOption(instanceId, optionIndex) {
        const quest = this.state.availableQuests.find(q => q.instanceId === instanceId);
        if (!quest) return;
        
        const dialogNode = quest.dialog[quest.currentDialogNode];
        const option = dialogNode.options[optionIndex];
        
        // Speichere Dialog-Verlauf
        quest.dialogHistory.push({
            node: quest.currentDialogNode,
            selectedOption: option.text,
            karma: option.karma,
            timestamp: Date.now()
        });
        
        // Wende Karma an
        if (option.karma !== 0 && typeof QuestSystem !== 'undefined') {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + option.karma));
        }
        
        // Prüfe Aktion
        if (option.action === 'accept_quest') {
            this.acceptQuest(instanceId);
            return;
        } else if (option.action === 'reject_quest') {
            this.rejectQuest(instanceId);
            return;
        }
        
        // Nächster Dialog-Node
        if (option.next) {
            quest.currentDialogNode = option.next;
            this.renderDialog(quest);
        } else {
            this.renderQuestPage();
        }
    },
    
    closeDialog(instanceId) {
        this.renderQuestPage();
    },
    
    // ============================================
    // QUEST MANAGEMENT
    // ============================================
    
    acceptQuest(instanceId) {
        const questIndex = this.state.availableQuests.findIndex(q => q.instanceId === instanceId);
        if (questIndex === -1) return false;
        
        const quest = this.state.availableQuests[questIndex];
        
        // Status ändern
        quest.state = this.QUEST_STATES.ACTIVE;
        quest.acceptedAt = Date.now();
        quest.startedAt = Date.now();
        
        // Zu active verschieben
        this.state.activeQuests.push(quest);
        this.state.availableQuests.splice(questIndex, 1);
        
        this.StateManager.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    rejectQuest(instanceId) {
        const questIndex = this.state.availableQuests.findIndex(q => q.instanceId === instanceId);
        if (questIndex === -1) return false;
        
        this.state.availableQuests.splice(questIndex, 1);
        this.StateManager.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    /**
     * Prüft, ob Quest-Ziele erfüllt sind
     */
    checkObjectives(instanceId) {
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        let allRequiredMet = true;
        
        quest.objectives.forEach(objective => {
            if (!objective.required) return;
            
            // Prüfe Abhängigkeiten
            if (objective.dependsOn) {
                const dependenciesMet = objective.dependsOn.every(depId => 
                    quest.progress.objectivesCompleted.includes(depId)
                );
                if (!dependenciesMet) {
                    allRequiredMet = false;
                    return;
                }
            }
            
            // Prüfe Bedingung
            const conditionMet = this.checkCondition(objective.condition, quest);
            
            if (conditionMet && !quest.progress.objectivesCompleted.includes(objective.id)) {
                quest.progress.objectivesCompleted.push(objective.id);
                objective.completed = true;
            }
            
            if (!conditionMet && objective.required) {
                allRequiredMet = false;
            }
        });
        
        // Wenn alle Ziele erfüllt, Status ändern
        if (allRequiredMet) {
            quest.state = this.QUEST_STATES.OBJECTIVES_MET;
            this.StateManager.saveState();
        }
        
        return allRequiredMet;
    },
    
    /**
     * Prüft eine einzelne Bedingung
     */
    checkCondition(condition, quest) {
        // Hier würde die echte Spiel-Logik prüfen
        // Für Demo-Zwecke: Simuliere Fortschritt
        
        switch (condition.type) {
            case 'visit_location':
                // Prüfe, ob Spieler am Ort ist
                return false; // Muss durch Spiel-Logik gesetzt werden
                
            case 'defeat_enemy':
                // Prüfe besiegte Gegner
                return false;
                
            case 'collect_item':
                // Prüfe gesammelte Items
                return false;
                
            case 'talk_to_npc':
                // Prüfe NPC-Gespräch
                return false;
                
            case 'complete_training':
                // Prüfe abgeschlossenes Training
                return false;
                
            default:
                return false;
        }
    },
    
    /**
     * Spieler meldet Quest ab (bei Questgeber)
     */
    turnInQuest(instanceId) {
        const questIndex = this.state.activeQuests.findIndex(q => q.instanceId === instanceId);
        if (questIndex === -1) return false;
        
        const quest = this.state.activeQuests[questIndex];
        
        // Prüfe, ob Ziele wirklich erfüllt
        if (!this.checkObjectives(instanceId)) {
            alert('Ihr habt noch nicht alle Ziele erreicht!');
            return false;
        }
        
        if (quest.state !== this.QUEST_STATES.OBJECTIVES_MET) {
            alert('Die Quest ist noch nicht abgeschlossen!');
            return false;
        }
        
        // Quest abschließen
        quest.state = this.QUEST_STATES.COMPLETED;
        quest.completedAt = Date.now();
        
        // Belohnungen
        this.grantRewards(quest.rewards);
        
        // Karma
        if (quest.karma && typeof QuestSystem !== 'undefined') {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + quest.karma));
        }
        
        // Verschieben
        this.state.completedQuests.push(quest);
        this.state.activeQuests.splice(questIndex, 1);
        
        this.StateManager.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    /**
     * DM kann Quest manuell als erfüllt markieren
     */
    dmCompleteQuest(instanceId) {
        // Nur für DM verfügbar
        if (!window.isDM) return false;
        
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        // Alle Ziele als erfüllt markieren
        quest.objectives.forEach(obj => {
            obj.completed = true;
            if (!quest.progress.objectivesCompleted.includes(obj.id)) {
                quest.progress.objectivesCompleted.push(obj.id);
            }
        });
        
        quest.state = this.QUEST_STATES.OBJECTIVES_MET;
        
        this.StateManager.saveState();
        this.renderQuestPage();
        
        return true;
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
        
        if (rewards.ap) {
            window.currentCharacter.ap = (window.currentCharacter.ap || 0) + rewards.ap;
        }
    },
    
    // ============================================
    // RENDERING
    // ============================================
    
    renderQuestPage() {
        const container = document.getElementById('questPage');
        if (!container) return;
        
        container.innerHTML = `
            <div class="professional-quest-page">
                <div class="quest-header">
                    <h2>📜 Quests in Frostfels</h2>
                </div>
                
                <!-- Verfügbare Quests -->
                <section class="quest-section">
                    <h3>📅 Verfügbare Aufträge</h3>
                    ${this.state.availableQuests.length === 0 ? 
                        '<p class="no-quests">Keine verfügbaren Quests.</p>' :
                        this.state.availableQuests.map(q => this.renderAvailableQuest(q)).join('')}
                </section>
                
                <!-- Aktive Quests -->
                <section class="quest-section">
                    <h3>⚔️ Aktive Quests</h3>
                    ${this.state.activeQuests.length === 0 ? 
                        '<p class="no-quests">Keine aktiven Quests.</p>' :
                        this.state.activeQuests.map(q => this.renderActiveQuest(q)).join('')}
                </section>
                
                <!-- Abgeschlossene Quests -->
                <section class="quest-section">
                    <h3>✅ Abgeschlossen</h3>
                    ${this.state.completedQuests.length === 0 ? 
                        '<p class="no-quests">Noch keine abgeschlossenen Quests.</p>' :
                        this.state.completedQuests.slice(-5).reverse().map(q => this.renderCompletedQuest(q)).join('')}
                </section>
            </div>
        `;
    },
    
    renderAvailableQuest(quest) {
        const isTraining = quest.isTraining;
        
        return `
            <div class="quest-card available ${quest.difficulty} ${isTraining ? 'training' : ''}">
                <div class="quest-header-row">
                    <span class="quest-type-badge">${isTraining ? '💪 Training' : '📖 Story'}</span>
                    <span class="quest-difficulty">${this.getDifficultyLabel(quest.difficulty)}</span>
                </div>
                
                <h4>${quest.title}</h4>
                
                <div class="quest-giver">
                    Auftraggeber: <strong>${quest.questGiver.name}</strong> (${quest.questGiver.location})
                </div>
                
                <div class="quest-preview">
                    ${quest.dialog.start.text.substring(0, 100)}...
                </div>
                
                <div class="quest-actions">
                    <button class="btn-primary" onclick="ProfessionalQuestSystem.startDialog('${quest.instanceId}')">
                        💬 Mit ${quest.questGiver.name} sprechen
                    </button>
                </div>
            </div>
        `;
    },
    
    renderActiveQuest(quest) {
        const objectivesMet = quest.state === this.QUEST_STATES.OBJECTIVES_MET;
        
        return `
            <div class="quest-card active ${quest.difficulty} ${objectivesMet ? 'ready' : ''}">
                <div class="quest-status-bar">
                    <span class="quest-status">${this.getStateLabel(quest.state)}</span>
                    ${objectivesMet ? '<span class="ready-badge">✓ Abgabebereit</span>' : ''}
                </div>
                
                <h4>${quest.title}</h4>
                
                <div class="quest-objectives">
                    <strong>Ziele:</strong>
                    <ul>
                        ${quest.objectives.map(obj => `
                            <li class="${obj.completed ? 'completed' : 'pending'} ${obj.dependsOn ? 'locked' : ''}">
                                ${obj.completed ? '✅' : obj.dependsOn ? '🔒' : '⏳'} ${obj.text}
                                ${obj.dependsOn ? `<small>(Benötigt: ${obj.dependsOn.join(', ')})</small>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="quest-progress">
                    Fortschritt: ${quest.progress.objectivesCompleted.length}/${quest.objectives.filter(o => o.required).length}
                </div>
                
                <div class="quest-actions">
                    ${objectivesMet ? `
                        <button class="btn-primary btn-large" onclick="ProfessionalQuestSystem.turnInQuest('${quest.instanceId}')">
                            🏆 Bei ${quest.questGiver.name} abgeben
                        </button>
                    ` : `
                        <button class="btn-secondary" onclick="ProfessionalQuestSystem.checkObjectives('${quest.instanceId}')">
                            🔄 Fortschritt prüfen
                        </button>
                        <span class="hint">Erledige die Ziele, um abzugeben</span>
                    `}
                    
                    ${window.isDM ? `
                        <button class="btn-dm" onclick="ProfessionalQuestSystem.dmCompleteQuest('${quest.instanceId}')">
                            [DM] Als erfüllt markieren
                        </button>
                    ` : ''}
                </div>
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
    
    getDifficultyLabel(difficulty) {
        const labels = {
            'easy': '⭐ Leicht',
            'medium': '⭐⭐ Mittel',
            'hard': '⭐⭐⭐ Schwer'
        };
        return labels[difficulty] || difficulty;
    },
    
    getStateLabel(state) {
        const labels = {
            [this.QUEST_STATES.AVAILABLE]: 'Verfügbar',
            [this.QUEST_STATES.ACCEPTED]: 'Angenommen',
            [this.QUEST_STATES.ACTIVE]: 'Aktiv',
            [this.QUEST_STATES.IN_PROGRESS]: 'In Bearbeitung',
            [this.QUEST_STATES.OBJECTIVES_MET]: 'Ziele erfüllt',
            [this.QUEST_STATES.READY_FOR_TURN_IN]: 'Abgabebereit',
            [this.QUEST_STATES.COMPLETED]: 'Abgeschlossen',
            [this.QUEST_STATES.FAILED]: 'Fehlgeschlagen'
        };
        return labels[state] || state;
    },
    
    // ============================================
    // SAVE / LOAD
    // ============================================
    
    StateManager.saveState() {
        localStateManager.setItem('professional_quest_system', JSON.stringify(this.state));
    },
    
    loadState() {
        const saved = localStateManager.getItem('professional_quest_system');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    },
    
    checkDailyReset() {
        const now = new Date();
        const lastReset = this.state.lastReset ? new Date(this.state.lastReset) : null;
        
        if (!lastReset || 
            now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            
            this.state.lastReset = now.toISOString();
        }
    }
};

// Global verfügbar machen
window.ProfessionalQuestSystem = ProfessionalQuestSystem;
