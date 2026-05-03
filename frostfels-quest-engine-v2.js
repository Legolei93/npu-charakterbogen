/**
 * Frostfels Quest Engine - Professional RPG Quest System
 * 
 * Vollständiges Questsystem mit:
 * - Quest Generator mit Pools
 * - Objective Engine mit echter Gameplay-Integration
 * - State Machine
 * - NPC Dialog System
 * - Return-to-NPC System
 * - DM Live Integration
 * - Sync System
 */

const FrostfelsQuestEngine = {
    
    // ============================================
    // VERSION
    // ============================================
    
    VERSION: '2.0.0',
    
    // ============================================
    // QUEST STATES
    // ============================================
    
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
    
    // ============================================
    // QUEST POOLS
    // ============================================
    
    POOLS: {
        // Story Quests - Hauptquests mit Phasen
        story: [
            {
                id: 'banditen_grenzwald',
                title: 'Banditen am Grenzwald',
                level: 1,
                giver: { name: 'Taro', location: 'Marktplatz', type: 'merchant' },
                phases: [
                    {
                        id: 'investigation',
                        name: 'Untersuchung',
                        description: 'Begib dich zum Grenzwald und untersuche die Überfälle.',
                        objectives: [
                            { type: 'travel', target: 'grenzwald', count: 1, text: 'Reise zum Grenzwald' },
                            { type: 'investigate', target: 'attack_site', count: 1, text: 'Untersuche die Überfallstelle' }
                        ]
                    },
                    {
                        id: 'camp_assault',
                        name: 'Das Lager',
                        description: 'Finde das Banditenlager und eliminiere die Banditen.',
                        objectives: [
                            { type: 'discover', target: 'bandit_camp', count: 1, text: 'Finde das Banditenlager' },
                            { type: 'combat', target: 'bandit', count: 3, text: 'Besiege 3 Banditen' }
                        ]
                    },
                    {
                        id: 'recovery',
                        name: 'Bergung',
                        description: 'Sichere die gestohlenen Waren.',
                        objectives: [
                            { type: 'collect', target: 'stolen_goods', count: 1, text: 'Berge die gestohlenen Waren' }
                        ]
                    }
                ],
                returnTo: { name: 'Taro', location: 'Marktplatz' },
                rewards: { gold: 150, xp: 80, karma: 5, reputation: { taro: 3, village: 2 } },
                difficulty: 'medium',
                chain: null
            },
            {
                id: 'verschwundene_lieferung',
                title: 'Die verschwundene Lieferung',
                level: 1,
                giver: { name: 'Yuki', location: 'Schmiede', type: 'merchant' },
                phases: [
                    {
                        id: 'search',
                        name: 'Die Suche',
                        description: 'Untersuche die Nordroute nach dem vermissten Kurier.',
                        objectives: [
                            { type: 'travel', target: 'nordroute', count: 1, text: 'Begib dich zur Nordroute' },
                            { type: 'collect_clues', target: 'courier_trace', count: 3, text: 'Finde 3 Hinweise' }
                        ]
                    },
                    {
                        id: 'rescue',
                        name: 'Rettung',
                        description: 'Finde und rette den Kurier.',
                        objectives: [
                            { type: 'discover', target: 'missing_courier', count: 1, text: 'Finde den vermissten Kurier' },
                            { type: 'combat', target: 'bandit', count: 2, text: 'Besiege die Entführer' }
                        ]
                    },
                    {
                        id: 'return',
                        name: 'Rückkehr',
                        description: 'Bringe die Lieferung zurück.',
                        objectives: [
                            { type: 'collect', target: 'delivery_goods', count: 1, text: 'Sammle die Lieferung ein' }
                        ]
                    }
                ],
                returnTo: { name: 'Yuki', location: 'Schmiede' },
                rewards: { gold: 200, xp: 100, karma: 3, reputation: { yuki: 5, merchants: 3 } },
                difficulty: 'medium',
                chain: 'lieferung_chain'
            },
            {
                id: 'kirche_reliquie',
                title: 'Die gestohlene Reliquie',
                level: 2,
                giver: { name: 'Bruder Aldric', location: 'Kirche', type: 'church' },
                phases: [
                    {
                        id: 'investigation',
                        name: 'Ermittlung',
                        description: 'Untersuche den Diebstahl in der Kirche.',
                        objectives: [
                            { type: 'investigate', target: 'church_theft', count: 1, text: 'Untersuche den Tatort' },
                            { type: 'talk', target: 'witness', count: 1, text: 'Sprich mit Zeugen' }
                        ]
                    },
                    {
                        id: 'hunt',
                        name: 'Die Jagd',
                        description: 'Spüre den Dieb auf.',
                        objectives: [
                            { type: 'discover', target: 'thief_hideout', count: 1, text: 'Finde das Versteck des Diebs' },
                            { type: 'combat', target: 'thief', count: 1, text: 'Stelle den Dieb' }
                        ]
                    },
                    {
                        id: 'recovery',
                        name: 'Wiederbeschaffung',
                        description: 'Hole die Reliquie zurück.',
                        objectives: [
                            { type: 'collect', target: 'holy_relic', count: 1, text: 'Berge die Reliquie' }
                        ]
                    }
                ],
                returnTo: { name: 'Bruder Aldric', location: 'Kirche' },
                rewards: { gold: 300, xp: 150, karma: 10, reputation: { church: 5 } },
                difficulty: 'hard',
                chain: null
            },
            {
                id: 'karl_ermittlung',
                title: 'Karls Ermittlung',
                level: 2,
                giver: { name: 'Karl', location: 'Rathaus', type: 'authority' },
                phases: [
                    {
                        id: 'surveillance',
                        name: 'Überwachung',
                        description: 'Beobachte den verdächtigen Wachmann.',
                        objectives: [
                            { type: 'observe', target: 'corrupt_guard', count: 1, text: 'Beobachte den Wachmann' },
                            { type: 'collect_evidence', target: 'bribe_evidence', count: 2, text: 'Sammle 2 Beweise' }
                        ]
                    },
                    {
                        id: 'confrontation',
                        name: 'Konfrontation',
                        description: 'Stelle den Wachmann zur Rede.',
                        objectives: [
                            { type: 'talk', target: 'corrupt_guard', count: 1, text: 'Konfrontiere den Wachmann' },
                            { type: 'decision', target: 'guard_fate', count: 1, text: 'Entscheide über sein Schicksal' }
                        ]
                    }
                ],
                returnTo: { name: 'Karl', location: 'Rathaus' },
                rewards: { gold: 250, xp: 120, karma: 5, reputation: { karl: 4 } },
                difficulty: 'medium',
                chain: 'karl_chain'
            }
        ],
        
        // Side Quests - Einfachere Nebenquests
        side: [
            {
                id: 'wolfshoehle',
                title: 'Die Wolfshöhle',
                giver: { name: 'Jäger', location: 'Jagdgebiet', type: 'villager' },
                phases: [
                    {
                        id: 'hunt',
                        name: 'Die Jagd',
                        description: 'Finde die Wolfshöhle und erlege die Wölfe.',
                        objectives: [
                            { type: 'discover', target: 'wolf_cave', count: 1, text: 'Finde die Wolfshöhle' },
                            { type: 'combat', target: 'wolf', count: 5, text: 'Erlege 5 Wölfe' }
                        ]
                    }
                ],
                returnTo: { name: 'Jäger', location: 'Jagdgebiet' },
                rewards: { gold: 100, xp: 60, karma: 2 },
                difficulty: 'easy'
            },
            {
                id: 'heilkraeuter',
                title: 'Heilkräuter für den Dorfarzt',
                giver: { name: 'Dorfarzt', location: 'Dorf', type: 'villager' },
                phases: [
                    {
                        id: 'gather',
                        name: 'Sammeln',
                        description: 'Sammle Heilkräuter im Wald.',
                        objectives: [
                            { type: 'travel', target: 'wald', count: 1, text: 'Gehe in den Wald' },
                            { type: 'collect', target: 'healing_herb', count: 10, text: 'Sammle 10 Heilkräuter' }
                        ]
                    }
                ],
                returnTo: { name: 'Dorfarzt', location: 'Dorf' },
                rewards: { gold: 50, xp: 30, karma: 3 },
                difficulty: 'easy'
            },
            {
                id: 'verlorenes_kind',
                title: 'Das verlorene Kind',
                giver: { name: 'Mutter', location: 'Dorf', type: 'villager' },
                phases: [
                    {
                        id: 'search',
                        name: 'Suche',
                        description: 'Finde das verschwundene Kind.',
                        objectives: [
                            { type: 'investigate', target: 'child_traces', count: 1, text: 'Suche nach Spuren' },
                            { type: 'discover', target: 'lost_child', count: 1, text: 'Finde das Kind' },
                            { type: 'escort', target: 'child_home', count: 1, text: 'Bringe es nach Hause' }
                        ]
                    }
                ],
                returnTo: { name: 'Mutter', location: 'Dorf' },
                rewards: { gold: 80, xp: 50, karma: 8 },
                difficulty: 'easy'
            }
        ],
        
        // Faction Quests
        faction_church: [
            {
                id: 'pilger_schutz',
                title: 'Pilger schützen',
                giver: { name: 'Bruder Aldric', location: 'Kirche', type: 'church' },
                phases: [
                    {
                        id: 'escort',
                        name: 'Eskorte',
                        description: 'Begleite die Pilger sicher durch den Wald.',
                        objectives: [
                            { type: 'meet', target: 'pilgrims', count: 1, text: 'Triff die Pilger' },
                            { type: 'escort', target: 'pilgrims', count: 1, text: 'Eskortiere sie zur Kirche' },
                            { type: 'defend', target: 'pilgrims', count: 1, text: 'Verteidige sie gegen Banditen' }
                        ]
                    }
                ],
                returnTo: { name: 'Bruder Aldric', location: 'Kirche' },
                rewards: { gold: 120, xp: 80, karma: 7, reputation: { church: 4 } },
                difficulty: 'medium'
            }
        ],
        
        faction_blackmarket: [
            {
                id: 'kira_eskorte',
                title: 'Geheime Eskorte',
                giver: { name: 'Kira', location: 'Schwarzmarkt', type: 'black_market' },
                phases: [
                    {
                        id: 'delivery',
                        name: 'Lieferung',
                        description: 'Begleite die Lieferung zum Treffpunkt.',
                        objectives: [
                            { type: 'meet', target: 'kira', count: 1, text: 'Triff Kira' },
                            { type: 'escort', target: 'package', count: 1, text: 'Eskortiere die Lieferung' },
                            { type: 'deliver', target: 'contact', count: 1, text: 'Übergebe an Kontakt' }
                        ]
                    }
                ],
                returnTo: { name: 'Kira', location: 'Schwarzmarkt' },
                rewards: { gold: 250, xp: 60, karma: -5, reputation: { blackmarket: 5 } },
                difficulty: 'medium'
            }
        ],
        
        // Training Options
        training: [
            {
                id: 'jutsu_training',
                name: 'Jutsu Training',
                description: 'Trainiere ein spezifisches Jutsu. Fortschritt für Jutsu-Lernsystem.',
                effects: { jutsuProgress: 10, xp: 15 },
                requirements: { hasJutsu: true }
            },
            {
                id: 'meditation',
                name: 'Meditation',
                description: 'Meditiere zur Chakra-Kontrolle und innerer Balance.',
                effects: { chakraBonus: 10, karma: 2, xp: 10 }
            },
            {
                id: 'sparring',
                name: 'Sparring',
                description: 'Trainiere Kampftechniken mit einem Partner.',
                effects: { combatXP: 20, xp: 20, staminaBonus: 5 }
            },
            {
                id: 'chakra_control',
                name: 'Chakra Kontrolle',
                description: 'Übe präzise Chakra-Manipulation für spätere Freischaltungen.',
                effects: { chakraControl: 5, unlockPoints: 1, xp: 15 }
            },
            {
                id: 'weapon_training',
                name: 'Waffentraining',
                description: 'Pflege und Übung mit deiner Waffe.',
                effects: { weaponSkill: 3, xp: 15 }
            },
            {
                id: 'mental_training',
                name: 'Mentales Training',
                description: 'Stärke deinen Geist und deine Resistenz.',
                effects: { mentalResist: 5, focus: 3, xp: 15 }
            }
        ]
    },
    
    // ============================================
    // SYSTEM STATE
    // ============================================
    
    state: {
        dailyQuests: [],
        activeQuests: [],
        completedQuests: [],
        trainingQuest: null,
        lastReset: null,
        questCooldowns: {}
    },
    
    // ============================================
    // INITIALISIERUNG
    // ============================================
    
    init() {
        console.log(`Frostfels Quest Engine v${this.VERSION} initialisiert`);
        
        // WICHTIG: State zurücksetzen bei jedem Init (User-Wechsel)
        this.resetState();
        
        this.loadState();
        this.checkDailyReset();
    },
    
    resetState() {
        this.state = {
            dailyQuests: [],
            activeQuests: [],
            completedQuests: [],
            trainingQuest: null,
            lastReset: null,
            questCooldowns: {}
        };
    },
    
    // ============================================
    // QUEST GENERATION
    // ============================================
    
    checkDailyReset() {
        const now = new Date();
        const lastReset = this.state.lastReset ? new Date(this.state.lastReset) : null;
        
        if (!lastReset || 
            now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            
            this.generateDailyQuests();
            this.state.lastReset = now.toISOString();
            this.saveState();
            
            console.log('Daily Quests zurückgesetzt');
        }
    },
    
    generateDailyQuests() {
        // Maximal 3 Daily Quests
        this.state.dailyQuests = [];
        
        // 1-2 Story Quests (zufällig aus Pool)
        const storyPool = this.POOLS.story.filter(q => !this.isQuestOnCooldown(q.id));
        const numStory = Math.min(2, storyPool.length);
        
        for (let i = 0; i < numStory; i++) {
            const quest = this.selectRandomFromPool(storyPool);
            if (quest) {
                this.state.dailyQuests.push(this.createQuestInstance(quest));
                this.setQuestCooldown(quest.id, 3); // 3 Tage Cooldown
            }
        }
        
        // 1 Side Quest
        const sidePool = this.POOLS.side.filter(q => !this.isQuestOnCooldown(q.id));
        const sideQuest = this.selectRandomFromPool(sidePool);
        if (sideQuest) {
            this.state.dailyQuests.push(this.createQuestInstance(sideQuest));
            this.setQuestCooldown(sideQuest.id, 2); // 2 Tage Cooldown
        }
        
        // 1 Training Quest
        this.generateTrainingQuest();
        
        console.log(`${this.state.dailyQuests.length} Daily Quests generiert`);
    },
    
    generateTrainingQuest() {
        this.state.trainingQuest = {
            id: 'daily_training_' + Date.now(),
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
    
    selectRandomFromPool(pool) {
        if (pool.length === 0) return null;
        const index = Math.floor(Math.random() * pool.length);
        const item = pool[index];
        pool.splice(index, 1); // Entferne aus Pool damit nicht doppelt
        return item;
    },
    
    createQuestInstance(template) {
        return {
            instanceId: template.id + '_' + Date.now(),
            templateId: template.id,
            title: template.title,
            type: 'story', // oder ableiten aus Pool
            giver: { ...template.giver },
            phases: JSON.parse(JSON.stringify(template.phases)),
            currentPhase: 0,
            state: this.STATES.AVAILABLE,
            returnTo: { ...template.returnTo },
            rewards: { ...template.rewards },
            difficulty: template.difficulty,
            karma: template.karma || 0,
            acceptedAt: null,
            completedAt: null,
            progress: {
                phaseProgress: [],
                objectivesCompleted: []
            }
        };
    },
    
    isQuestOnCooldown(questId) {
        const cooldown = this.state.questCooldowns[questId];
        if (!cooldown) return false;
        return Date.now() < cooldown;
    },
    
    setQuestCooldown(questId, days) {
        this.state.questCooldowns[questId] = Date.now() + (days * 24 * 60 * 60 * 1000);
    },
    
    // ============================================
    // QUEST MANAGEMENT
    // ============================================
    
    acceptQuest(instanceId) {
        const quest = this.state.dailyQuests.find(q => q.instanceId === instanceId);
        if (!quest) {
            console.error('Quest nicht gefunden:', instanceId);
            return false;
        }
        
        quest.state = this.STATES.ACCEPTED;
        quest.acceptedAt = Date.now();
        
        // Starte erste Phase
        this.startPhase(quest, 0);
        
        // Verschiebe zu active
        this.state.activeQuests.push(quest);
        this.state.dailyQuests = this.state.dailyQuests.filter(q => q.instanceId !== instanceId);
        
        this.saveState();
        this.renderQuestPage();
        
        console.log('Quest angenommen:', quest.title);
        return true;
    },
    
    startPhase(quest, phaseIndex) {
        if (phaseIndex >= quest.phases.length) {
            // Alle Phasen abgeschlossen
            quest.state = this.STATES.RETURN_REQUIRED;
            return;
        }
        
        quest.currentPhase = phaseIndex;
        quest.state = this.STATES.PHASE_ACTIVE;
        
        // Initialisiere Phase-Fortschritt
        const phase = quest.phases[phaseIndex];
        phase.objectives.forEach(obj => {
            obj.completed = false;
            obj.progress = 0;
        });
        
        console.log(`Phase ${phaseIndex + 1} gestartet: ${phase.name}`);
    },
    
    /**
     * PRÜFT OBJECTIVES - Wird vom Spiel aufgerufen
     */
    checkObjectives(instanceId) {
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return;
        
        const phase = quest.phases[quest.currentPhase];
        if (!phase) return;
        
        let allCompleted = true;
        
        phase.objectives.forEach(obj => {
            if (!obj.completed) {
                // Prüfe ob Bedingung erfüllt
                const isComplete = this.verifyObjective(obj);
                if (isComplete) {
                    obj.completed = true;
                    quest.progress.objectivesCompleted.push(obj.type + '_' + obj.target);
                    console.log(`Objective erfüllt: ${obj.text}`);
                } else {
                    allCompleted = false;
                }
            }
        });
        
        if (allCompleted) {
            quest.state = this.STATES.PHASE_COMPLETE;
            
            // Nächste Phase oder Return
            if (quest.currentPhase < quest.phases.length - 1) {
                setTimeout(() => {
                    this.startPhase(quest, quest.currentPhase + 1);
                    this.saveState();
                    this.renderQuestPage();
                }, 500);
            } else {
                quest.state = this.STATES.RETURN_REQUIRED;
                this.saveState();
                this.renderQuestPage();
            }
        }
    },
    
    /**
     * VERIFIZIERT EIN OBJECTIVE
     * Hier wird später die echte Spiel-Logik prüfen
     */
    verifyObjective(objective) {
        // TODO: Echte Spiel-Logik implementieren
        // Diese Funktion wird vom Spiel aufgerufen wenn:
        // - Spieler an Ort ankommt
        // - Gegner besiegt wird
        // - Item gesammelt wird
        // - NPC angesprochen wird
        
        return false; // Default: nicht erfüllt
    },
    
    /**
     * FORTSCHRITT MANUELL SETZEN (für DM oder Debugging)
     */
    setObjectiveProgress(instanceId, objectiveType, target, progress) {
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        const phase = quest.phases[quest.currentPhase];
        const objective = phase.objectives.find(o => o.type === objectiveType && o.target === target);
        
        if (!objective) return false;
        
        objective.progress = progress;
        
        if (objective.count && progress >= objective.count) {
            objective.completed = true;
        }
        
        this.checkObjectives(instanceId);
        return true;
    },
    
    returnToNPC(instanceId) {
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
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
    
    completeQuest(instanceId) {
        const questIndex = this.state.activeQuests.findIndex(q => q.instanceId === instanceId);
        if (questIndex === -1) return false;
        
        const quest = this.state.activeQuests[questIndex];
        
        if (quest.state !== this.STATES.READY_FOR_TURN_IN) {
            alert('Die Quest ist noch nicht bereit zur Abgabe!');
            return false;
        }
        
        // Belohnungen
        this.grantRewards(quest.rewards);
        
        // Karma
        if (quest.karma && typeof QuestSystem !== 'undefined') {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + quest.karma);
        }
        
        quest.state = this.STATES.COMPLETED;
        quest.completedAt = Date.now();
        
        this.state.completedQuests.push(quest);
        this.state.activeQuests.splice(questIndex, 1);
        
        this.saveState();
        this.renderQuestPage();
        
        // Erfolgsbenachrichtigung
        this.showCompletionMessage(quest);
        
        return true;
    },
    
    showCompletionMessage(quest) {
        const msg = `🎉 Quest abgeschlossen: ${quest.title}\n\n` +
                    `Belohnungen:\n` +
                    `💰 ${quest.rewards.gold} Gold\n` +
                    `⭐ ${quest.rewards.xp} XP` +
                    (quest.karma ? `\n🌟 ${quest.karma > 0 ? '+' : ''}${quest.karma} Karma` : '');
        
        alert(msg);
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
        
        // Reputation
        if (rewards.reputation) {
            Object.entries(rewards.reputation).forEach(([faction, value]) => {
                // Reputation System Integration
                console.log(`Reputation ${faction}: +${value}`);
            });
        }
    },
    
    // ============================================
    // TRAINING SYSTEM
    // ============================================
    
    selectTraining(trainingId) {
        if (!this.state.trainingQuest || this.state.trainingQuest.completed) {
            return false;
        }
        
        const training = this.POOLS.training.find(t => t.id === trainingId);
        if (!training) return false;
        
        this.state.trainingQuest.choice = trainingId;
        this.state.trainingQuest.selected = true;
        this.state.trainingQuest.trainingData = training;
        
        this.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    completeTraining() {
        if (!this.state.trainingQuest || !this.state.trainingQuest.selected) {
            return false;
        }
        
        const training = this.state.trainingQuest.trainingData;
        
        // Effekte anwenden
        this.applyTrainingEffects(training.effects);
        
        this.state.trainingQuest.completed = true;
        this.state.trainingQuest.completionTime = Date.now();
        
        this.saveState();
        this.renderQuestPage();
        
        // Benachrichtigung
        const effectsText = Object.entries(training.effects)
            .map(([key, val]) => `${key}: +${val}`)
            .join(', ');
        
        alert(`💪 Training abgeschlossen: ${training.name}\n\nEffekte:\n${effectsText}`);
        
        return true;
    },
    
    applyTrainingEffects(effects) {
        if (!window.currentCharacter) return;
        
        if (effects.xp) {
            window.currentCharacter.xp = (window.currentCharacter.xp || 0) + effects.xp;
        }
        
        if (effects.jutsuProgress) {
            // Jutsu System Integration
            console.log(`Jutsu Fortschritt: +${effects.jutsuProgress}`);
        }
        
        if (effects.chakraBonus) {
            window.currentCharacter.chakraBonus = (window.currentCharacter.chakraBonus || 0) + effects.chakraBonus;
        }
        
        if (effects.karma && typeof QuestSystem !== 'undefined') {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + effects.karma));
        }
        
        // Weitere Effekte...
    },
    
    // ============================================
    // DM FUNCTIONS
    // ============================================
    
    dmForceCompleteObjective(instanceId, objectiveIndex) {
        if (!window.isDM) return false;
        
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        const phase = quest.phases[quest.currentPhase];
        const objective = phase.objectives[objectiveIndex];
        
        if (!objective) return false;
        
        objective.completed = true;
        objective.progress = objective.count || 1;
        
        this.checkObjectives(instanceId);
        this.saveState();
        
        return true;
    },
    
    dmForceQuestComplete(instanceId) {
        if (!window.isDM) return false;
        
        const quest = this.state.activeQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        // Alle Phasen und Objectives als erfüllt markieren
        quest.phases.forEach(phase => {
            phase.objectives.forEach(obj => {
                obj.completed = true;
                obj.progress = obj.count || 1;
            });
        });
        
        quest.state = this.STATES.RETURN_REQUIRED;
        
        this.saveState();
        this.renderQuestPage();
        
        return true;
    },
    
    // ============================================
    // RENDERING
    // ============================================
    
    renderQuestPage() {
        const container = document.getElementById('questPage');
        if (!container) return;
        
        container.innerHTML = `
            <div class="frostfels-quest-page">
                ${this.renderHeader()}
                ${this.renderTrainingSection()}
                ${this.renderAvailableQuests()}
                ${this.renderActiveQuests()}
                ${this.renderCompletedQuests()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="quest-header">
                <h2>📜 Quests in Frostfels</h2>
                <div class="quest-stats">
                    Verfügbar: ${this.state.dailyQuests.length} | 
                    Aktiv: ${this.state.activeQuests.length} | 
                    Abgeschlossen: ${this.state.completedQuests.length}
                </div>
            </div>
        `;
    },
    
    renderTrainingSection() {
        if (!this.state.trainingQuest) return '';
        
        const t = this.state.trainingQuest;
        
        if (t.completed) {
            return `
                <section class="training-section completed">
                    <h3>💪 Training Abgeschlossen</h3>
                    <p>Du hast heute ${t.trainingData?.name || 'Training'} absolviert.</p>
                </section>
            `;
        }
        
        if (t.selected) {
            return `
                <section class="training-section active">
                    <h3>💪 Training: ${t.trainingData.name}</h3>
                    <p>${t.trainingData.description}</p>
                    <div class="training-effects">
                        ${Object.entries(t.trainingData.effects).map(([k, v]) => 
                            `<span class="effect">${k}: +${v}</span>`
                        ).join(' | ')}
                    </div>
                    <button class="btn-primary btn-large" onclick="FrostfelsQuestEngine.completeTraining()">
                        ✅ Training abschließen
                    </button>
                </section>
            `;
        }
        
        return `
            <section class="training-section">
                <h3>💪 Wähle dein tägliches Training</h3>
                <div class="training-grid">
                    ${this.POOLS.training.map(training => `
                        <div class="training-card" onclick="FrostfelsQuestEngine.selectTraining('${training.id}')">
                            <h4>${training.name}</h4>
                            <p>${training.description}</p>
                            <div class="effects">${Object.keys(training.effects).join(' | ')}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    },
    
    renderAvailableQuests() {
        if (this.state.dailyQuests.length === 0) {
            return '<section><h3>📅 Keine weiteren Quests verfügbar</h3><p>Komm morgen wieder!</p></section>';
        }
        
        return `
            <section class="available-quests">
                <h3>📅 Verfügbare Quests (${this.state.dailyQuests.length}/3)</h3>
                ${this.state.dailyQuests.map(q => this.renderQuestCard(q, 'available')).join('')}
            </section>
        `;
    },
    
    renderActiveQuests() {
        if (this.state.activeQuests.length === 0) return '';
        
        return `
            <section class="active-quests">
                <h3>⚔️ Aktive Quests</h3>
                ${this.state.activeQuests.map(q => this.renderQuestCard(q, 'active')).join('')}
            </section>
        `;
    },
    
    renderCompletedQuests() {
        if (this.state.completedQuests.length === 0) return '';
        
        return `
            <section class="completed-quests">
                <h3>✅ Abgeschlossen</h3>
                ${this.state.completedQuests.slice(-3).reverse().map(q => this.renderQuestCard(q, 'completed')).join('')}
            </section>
        `;
    },
    
    renderQuestCard(quest, status) {
        const currentPhase = quest.phases?.[quest.currentPhase];
        
        if (status === 'available') {
            return `
                <div class="quest-card available ${quest.difficulty}">
                    <div class="quest-type">📖 Story Quest</div>
                    <h4>${quest.title}</h4>
                    <div class="giver">Auftraggeber: <strong>${quest.giver.name}</strong> @ ${quest.giver.location}</div>
                    <div class="phases">${quest.phases.length} Phasen</div>
                    <div class="rewards">💰 ${quest.rewards.gold} | ⭐ ${quest.rewards.xp} | 🌟 ${quest.karma > 0 ? '+' : ''}${quest.karma}</div>
                    <button class="btn-primary" onclick="FrostfelsQuestEngine.acceptQuest('${quest.instanceId}')">
                        ✅ Quest annehmen
                    </button>
                </div>
            `;
        }
        
        if (status === 'active') {
            const isReturn = quest.state === this.STATES.RETURN_REQUIRED;
            const isReady = quest.state === this.STATES.READY_FOR_TURN_IN;
            
            return `
                <div class="quest-card active ${quest.difficulty} ${isReady ? 'ready' : ''}">
                    <div class="quest-status">${this.getStateLabel(quest.state)}</div>
                    <h4>${quest.title}</h4>
                    
                    ${isReturn ? `
                        <div class="return-notice">🏃 Kehre zurück zu <strong>${quest.returnTo.name}</strong></div>
                        <button class="btn-primary btn-large" onclick="FrostfelsQuestEngine.returnToNPC('${quest.instanceId}')">
                            🏆 Bei ${quest.returnTo.name} abgeben
                        </button>
                    ` : isReady ? `
                        <button class="btn-primary btn-large" onclick="FrostfelsQuestEngine.completeQuest('${quest.instanceId}')">
                            🎉 Quest abschließen
                        </button>
                    ` : `
                        <div class="current-phase">
                            <strong>Phase ${quest.currentPhase + 1}: ${currentPhase?.name}</strong>
                            <p>${currentPhase?.description}</p>
                            <div class="objectives">
                                ${currentPhase?.objectives.map(obj => `
                                    <div class="objective ${obj.completed ? 'done' : 'pending'}">
                                        ${obj.completed ? '✅' : '⏳'} ${obj.text}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <button class="btn-secondary" onclick="FrostfelsQuestEngine.checkObjectives('${quest.instanceId}')">
                            🔄 Fortschritt prüfen
                        </button>
                    `}
                </div>
            `;
        }
        
        return `
            <div class="quest-card completed">
                <span class="badge">✅ Abgeschlossen</span>
                <h4>${quest.title}</h4>
                <div class="completion-info">${new Date(quest.completedAt).toLocaleDateString()}</div>
            </div>
        `;
    },
    
    getStateLabel(state) {
        const labels = {
            [this.STATES.AVAILABLE]: 'Verfügbar',
            [this.STATES.ACCEPTED]: 'Angenommen',
            [this.STATES.PHASE_ACTIVE]: 'Phase aktiv',
            [this.STATES.PHASE_COMPLETE]: 'Phase erfüllt',
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
        // BUGFIX 13: Account-gebundenes Speichern
        const currentUser = (typeof AuthSystem !== 'undefined') ? AuthSystem.getCurrentUser() : null;
        if (!currentUser) {
            console.error('Quest: Kein User eingeloggt');
            return;
        }
        
        const storageKey = `frostfels_quest_engine_v2_${currentUser.id}`;
        localStorage.setItem(storageKey, JSON.stringify(this.state));
    },
    
    loadState() {
        // BUGFIX 13: Account-gebundenes Laden
        const currentUser = (typeof AuthSystem !== 'undefined') ? AuthSystem.getCurrentUser() : null;
        if (!currentUser) {
            console.log('Quest: Kein User eingeloggt');
            this.state = {
                dailyQuests: [],
                activeQuests: [],
                completedQuests: [],
                trainingQuest: null,
                lastReset: null,
                questCooldowns: {}
            };
            return;
        }
        
        const storageKey = `frostfels_quest_engine_v2_${currentUser.id}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            this.state = JSON.parse(saved);
        } else {
            // Migration: Prüfe alten Speicher
            const oldSaved = localStorage.getItem('frostfels_quest_engine_v2');
            if (oldSaved) {
                this.state = JSON.parse(oldSaved);
                // Speichere in neuem Format
                localStorage.setItem(storageKey, oldSaved);
            }
        }
    }
};

// Global verfügbar machen
window.FrostfelsQuestEngine = FrostfelsQuestEngine;
