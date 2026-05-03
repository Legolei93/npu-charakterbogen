/**
 * RPG Quest System - Frostfels
 * 
 * Echtes RPG Quest-System mit:
 * - Story-Quests
 * - Nebenquests
 * - Fraktionsquests
 * - Questketten
 * - DM-Steuerung
 * - Live-Synchronisation
 */

const RPGQuestSystem = {
    
    // ============================================
    // QUEST TEMPLATES - ECHTE RPG QUESTS
    // ============================================
    
    QUEST_TEMPLATES: {
        // STORY QUESTS - Hauptquests
        story: [
            {
                id: 'banditen_grenzwald',
                title: 'Banditen am Grenzwald',
                storyText: 'Ein Händler berichtet von Überfällen nahe des Grenzwaldes. Mehrere Lieferungen sind verschwunden. Die Dorfbewohner bitten um Hilfe.',
                description: 'Finde und besiege die Banditen, die den Grenzwald unsicher machen.',
                questGiver: { name: 'Taro', type: 'merchant', location: 'Marktplatz' },
                objectives: [
                    { id: 'find_bandits', text: 'Finde das Banditenlager', completed: false },
                    { id: 'defeat_bandits', text: 'Besiege 3 Banditen', completed: false, count: 0, target: 3 }
                ],
                rewards: { gold: 150, xp: 80, reputation: { village: 2 } },
                difficulty: 'medium',
                karma: 5,
                chain: null,
                worldState: 'Banditen nehmen zu'
            },
            {
                id: 'verschwundene_lieferung',
                title: 'Die verschwundene Lieferung',
                storyText: 'Yuki wartet auf eine wichtige Lieferung Rüstungsteile, die nicht angekommen ist. Der Kurier ist spurlos verschwunden.',
                description: 'Spüre den verschwundenen Kurier auf und bringe die Lieferung zurück.',
                questGiver: { name: 'Yuki', type: 'merchant', location: 'Schmiede' },
                objectives: [
                    { id: 'find_clues', text: 'Suche nach Spuren des Kuriers', completed: false },
                    { id: 'find_courier', text: 'Finde den Kurier', completed: false },
                    { id: 'return_delivery', text: 'Bringe die Lieferung zu Yuki', completed: false }
                ],
                rewards: { gold: 200, xp: 100, reputation: { merchants: 3 } },
                difficulty: 'medium',
                karma: 3,
                chain: 'lieferung_chain',
                worldState: null
            },
            {
                id: 'kirche_reliquie',
                title: 'Die gestohlene Reliquie',
                storyText: 'Aus der Kirche wurde eine heilige Reliquie gestohlen. Bruder Aldric vermutet, dass der Dieb noch in Frostfels ist.',
                description: 'Finde den Dieb und bringe die Reliquie zurück zur Kirche.',
                questGiver: { name: 'Bruder Aldric', type: 'church', location: 'Kirche' },
                objectives: [
                    { id: 'investigate', text: 'Untersuche den Tatort', completed: false },
                    { id: 'find_thief', text: 'Finde den Dieb', completed: false },
                    { id: 'recover_relic', text: 'Berg die Reliquie', completed: false },
                    { id: 'return_relic', text: 'Bringe die Reliquie zurück', completed: false }
                ],
                rewards: { gold: 300, xp: 150, reputation: { church: 5 }, item: { name: 'Segen des Lichts', type: 'blessing' } },
                difficulty: 'hard',
                karma: 10,
                chain: null,
                worldState: 'Kirche unter Verdacht'
            },
            {
                id: 'schwarzmarkt_eskorte',
                title: 'Geheime Eskorte',
                storyText: 'Kira benötigt jemanden, der eine "Lieferung" sicher zum Treffpunkt bringt. Frag nicht nach dem Inhalt.',
                description: 'Eskortiere Kiras Lieferung zum geheimen Treffpunkt.',
                questGiver: { name: 'Kira', type: 'black_market', location: 'Schwarzmarkt' },
                objectives: [
                    { id: 'meet_kira', text: 'Triff Kira am Schwarzmarkt', completed: false },
                    { id: 'escort_delivery', text: 'Begleite die Lieferung', completed: false },
                    { id: 'handover', text: 'Übergebe die Lieferung', completed: false }
                ],
                rewards: { gold: 250, xp: 60, reputation: { blackmarket: 5 } },
                difficulty: 'medium',
                karma: -5,
                chain: null,
                worldState: 'Schwarzmarkt sehr aktiv'
            },
            {
                id: 'karl_ermittlung',
                title: 'Karls Ermittlung',
                storyText: 'Karl verdächtigt einen korrupten Wachmann. Er braucht Beweise, bevor er handeln kann.',
                description: 'Sammle Beweise gegen den korrupten Wachmann.',
                questGiver: { name: 'Karl', type: 'authority', location: 'Rathaus' },
                objectives: [
                    { id: 'observe_guard', text: 'Beobachte den Wachmann', completed: false },
                    { id: 'find_evidence', text: 'Finde belastende Beweise', completed: false },
                    { id: 'report_karl', text: 'Berichte Karl', completed: false }
                ],
                rewards: { gold: 180, xp: 90, reputation: { karl: 4 } },
                difficulty: 'medium',
                karma: 8,
                chain: 'karl_chain',
                worldState: 'geheime Ermittlungen laufen'
            }
        ],
        
        // SIDE QUESTS - Nebenquests
        side: [
            {
                id: 'heilkraeuter_sammeln',
                title: 'Heilkräuter für den Dorfarzt',
                storyText: 'Der Dorfarzt benötigt dringend Heilkräuter für die Behandlung verletzter Bauern.',
                description: 'Sammle 10 Heilkräuter im Wald.',
                questGiver: { name: 'Dorfarzt', type: 'villager', location: 'Dorf' },
                objectives: [
                    { id: 'gather_herbs', text: 'Sammle 10 Heilkräuter', completed: false, count: 0, target: 10 }
                ],
                rewards: { gold: 50, xp: 30, reputation: { village: 1 } },
                difficulty: 'easy',
                karma: 3,
                chain: null,
                worldState: null
            },
            {
                id: 'wolfsplage',
                title: 'Wölfe im Jagdgebiet',
                storyText: 'Wölfe haben sich im Jagdgebiet eingenistet und gefährden die Jäger.',
                description: 'Erlege 5 Wölfe im Jagdgebiet.',
                questGiver: { name: 'Jäger', type: 'villager', location: 'Jagdgebiet' },
                objectives: [
                    { id: 'hunt_wolves', text: 'Erlege 5 Wölfe', completed: false, count: 0, target: 5 }
                ],
                rewards: { gold: 100, xp: 60, items: [{ name: 'Wolfsfell', quantity: 5 }] },
                difficulty: 'medium',
                karma: 2,
                chain: null,
                worldState: 'Jagdgebiet gesperrt'
            },
            {
                id: 'verlorenes_kind',
                title: 'Das verlorene Kind',
                storyText: 'Ein kleines Mädchen ist beim Spielen im Wald verschwunden. Die Mutter ist verzweifelt.',
                description: 'Finde das verlorene Kind im Wald.',
                questGiver: { name: 'Mutter', type: 'villager', location: 'Dorf' },
                objectives: [
                    { id: 'search_forest', text: 'Durchsuche den Wald', completed: false },
                    { id: 'find_child', text: 'Finde das Kind', completed: false },
                    { id: 'return_child', text: 'Bringe das Kind zurück', completed: false }
                ],
                rewards: { gold: 80, xp: 50, reputation: { village: 3 } },
                difficulty: 'easy',
                karma: 8,
                chain: null,
                worldState: null
            },
            {
                id: 'banditenopfer_retten',
                title: 'Banditenopfer retten',
                storyText: 'Ein Reisender wurde von Banditen überfallen und schwer verletzt. Er braucht Hilfe.',
                description: 'Rette den verletzten Reisenden und bringe ihn zum Dorfarzt.',
                questGiver: { name: 'Vorbeireisender', type: 'villager', location: 'Straße' },
                objectives: [
                    { id: 'help_traveler', text: 'Hilf dem Verletzten', completed: false },
                    { id: 'escort_healer', text: 'Bringe ihn zum Dorfarzt', completed: false }
                ],
                rewards: { gold: 60, xp: 40, reputation: { village: 2 } },
                difficulty: 'easy',
                karma: 5,
                chain: null,
                worldState: null
            },
            {
                id: 'schmuggelware_finden',
                title: 'Schmuggelware',
                storyText: 'Kira sucht nach einer verlorenen Schmuggellieferung. Sie bietet eine Belohnung für Informationen.',
                description: 'Finde die verlorene Schmuggelware.',
                questGiver: { name: 'Kira', type: 'black_market', location: 'Schwarzmarkt' },
                objectives: [
                    { id: 'investigate', text: 'Ermittle den Verbleib', completed: false },
                    { id: 'recover_goods', text: 'Berg die Ware', completed: false },
                    { id: 'return_goods', text: 'Bringe sie zu Kira', completed: false }
                ],
                rewards: { gold: 200, xp: 70, reputation: { blackmarket: 3 } },
                difficulty: 'medium',
                karma: -3,
                chain: null,
                worldState: null
            }
        ],
        
        // FACTION QUESTS - Fraktionsquests
        faction: {
            church: [
                {
                    id: 'kirche_pilger_schuetzen',
                    title: 'Pilger schützen',
                    storyText: 'Eine Gruppe Pilger ist auf dem Weg zur Kirche. Bruder Aldric fürchtet, dass sie angegriffen werden könnten.',
                    description: 'Eskortiere die Pilger sicher zur Kirche.',
                    questGiver: { name: 'Bruder Aldric', type: 'church', location: 'Kirche' },
                    objectives: [
                        { id: 'meet_pilgrims', text: 'Triff die Pilger', completed: false },
                        { id: 'escort_pilgrims', text: 'Eskortiere sie zur Kirche', completed: false }
                    ],
                    rewards: { gold: 120, xp: 80, reputation: { church: 4 } },
                    difficulty: 'medium',
                    karma: 7,
                    chain: null,
                    worldState: 'Pilgerzeit beginnt'
                }
            ],
            merchants: [
                {
                    id: 'haendler_konvoi',
                    title: 'Händlerkonvoi',
                    storyText: 'Taro organisiert einen Konvoi zu einem Nachbardorf. Er sucht nach bewaffneten Begleitern.',
                    description: 'Begleite den Händlerkonvoi sicher zum Ziel.',
                    questGiver: { name: 'Taro', type: 'merchant', location: 'Marktplatz' },
                    objectives: [
                        { id: 'meet_convoy', text: 'Triff den Konvoi', completed: false },
                        { id: 'escort_convoy', text: 'Begleite ihn zum Ziel', completed: false },
                        { id: 'return_payment', text: 'Kehre zurück für Bezahlung', completed: false }
                    ],
                    rewards: { gold: 180, xp: 90, reputation: { merchants: 3 } },
                    difficulty: 'medium',
                    karma: 3,
                    chain: null,
                    worldState: 'Händlerkonvoi Ankunft'
                }
            ],
            blackmarket: [
                {
                    id: 'kira_diskrete_beseitigung',
                    title: 'Diskrete Beseitigung',
                    storyText: 'Kira hat ein Problem mit einem Informanten. Sie braucht jemanden, der das Problem "löst".',
                    description: 'Finde und eliminiere den Informanten.',
                    questGiver: { name: 'Kira', type: 'black_market', location: 'Schwarzmarkt' },
                    objectives: [
                        { id: 'find_informant', text: 'Finde den Informanten', completed: false },
                        { id: 'eliminate', text: 'Eliminiere das Ziel', completed: false }
                    ],
                    rewards: { gold: 300, xp: 50, reputation: { blackmarket: 5 } },
                    difficulty: 'hard',
                    karma: -15,
                    chain: null,
                    worldState: null
                }
            ]
        },
        
        // QUEST CHAINS - Verkettete Quests
        chains: {
            lieferung_chain: [
                {
                    id: 'lieferung_1',
                    title: 'Die verschwundene Lieferung',
                    storyText: 'Yuki wartet auf eine wichtige Lieferung Rüstungsteile...',
                    description: 'Spüre den verschwundenen Kurier auf.',
                    nextQuest: 'lieferung_2'
                },
                {
                    id: 'lieferung_2',
                    title: 'Die Schmuggelroute',
                    storyText: 'Der Kurier wurde von Schmugglern überfallen. Sie haben ein Lager im Wald.',
                    description: 'Finde das Schmugglerlager und berg die Ware.',
                    nextQuest: 'lieferung_3'
                },
                {
                    id: 'lieferung_3',
                    title: 'Der Schwarzmarktboss',
                    storyText: 'Die Schmuggler arbeiten für einen Schwarzmarktboss. Er muss gestoppt werden.',
                    description: 'Konfrontiere den Schwarzmarktboss.',
                    nextQuest: null
                }
            ],
            karl_chain: [
                {
                    id: 'karl_1',
                    title: 'Karls Ermittlung',
                    storyText: 'Karl verdächtigt einen korrupten Wachmann...',
                    description: 'Sammle Beweise gegen den Wachmann.',
                    nextQuest: 'karl_2'
                },
                {
                    id: 'karl_2',
                    title: 'Die Verhaftung',
                    storyText: 'Die Beweise sind erdrückend. Karl will den Wachmann verhaften lassen.',
                    description: 'Hilf bei der Verhaftung des korrupten Wachmanns.',
                    nextQuest: null
                }
            ]
        }
    },
    
    // ============================================
    // SYSTEM STATE
    // ============================================
    
    state: {
        availableQuests: [],      // Verfügbare Quests
        activeQuests: [],         // Angenommene Quests
        completedQuests: [],      // Abgeschlossene Quests
        dailyQuests: [],          // Tägliche Quests (3 Stück)
        trainingQuest: null,      // Trainings-Quest
        questChains: {},          // Aktive Quest-Ketten
        lastReset: null           // Letzter Daily Reset
    },
    
    // ============================================
    // INITIALISIERUNG
    // ============================================
    
    init() {
        console.log('RPG Quest System initialisiert');
        this.loadState();
        this.checkDailyReset();
    },
    
    // ============================================
    // QUEST GENERATION
    // ============================================
    
    generateDailyQuests() {
        const quests = [];
        
        // 1 Story Quest
        const storyQuest = this.selectRandomQuest('story');
        if (storyQuest) {
            quests.push(this.createQuestInstance(storyQuest, 'story'));
        }
        
        // 2 Side Quests
        for (let i = 0; i < 2; i++) {
            const sideQuest = this.selectRandomQuest('side');
            if (sideQuest) {
                quests.push(this.createQuestInstance(sideQuest, 'side'));
            }
        }
        
        // 1 Training Quest (optional, als 4. Quest)
        this.state.trainingQuest = this.generateTrainingQuest();
        
        this.state.dailyQuests = quests;
        this.state.lastReset = Date.now();
        this.saveState();
        
        return quests;
    },
    
    selectRandomQuest(type, faction = null) {
        let pool = [];
        
        if (type === 'story') {
            pool = this.QUEST_TEMPLATES.story;
        } else if (type === 'side') {
            pool = this.QUEST_TEMPLATES.side;
        } else if (type === 'faction' && faction) {
            pool = this.QUEST_TEMPLATES.faction[faction] || [];
        }
        
        if (pool.length === 0) return null;
        
        // Filtere bereits aktive/abgeschlossene Quests
        const available = pool.filter(q => {
            const isActive = this.state.activeQuests.some(aq => aq.templateId === q.id);
            const isCompleted = this.state.completedQuests.some(cq => cq.templateId === q.id);
            return !isActive && !isCompleted;
        });
        
        if (available.length === 0) {
            // Wenn keine verfügbar, wähle aus allen
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        return available[Math.floor(Math.random() * available.length)];
    },
    
    createQuestInstance(template, type) {
        return {
            instanceId: 'quest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            templateId: template.id,
            type: type,
            title: template.title,
            storyText: template.storyText,
            description: template.description,
            questGiver: template.questGiver,
            objectives: JSON.parse(JSON.stringify(template.objectives)), // Deep copy
            rewards: template.rewards,
            difficulty: template.difficulty,
            karma: template.karma,
            status: 'available', // available, active, completed, failed
            acceptedAt: null,
            completedAt: null,
            progress: 0
        };
    },
    
    generateTrainingQuest() {
        const trainings = [
            { id: 'sparring', name: 'Sparring', description: 'Trainiere mit einem Partner', reward: { xp: 10 } },
            { id: 'meditation', name: 'Meditation', description: 'Meditiere zur Chakra-Kontrolle', reward: { xp: 10 } },
            { id: 'zielwurf', name: 'Zielwurf', description: 'Übe Kunai-Wurf', reward: { xp: 10 } },
            { id: 'ausdauer', name: 'Ausdauertraining', description: 'Trainiere deine Ausdauer', reward: { xp: 10 } }
        ];
        
        const training = trainings[Math.floor(Math.random() * trainings.length)];
        
        return {
            instanceId: 'training_' + Date.now(),
            templateId: training.id,
            type: 'training',
            title: training.name,
            description: training.description,
            objectives: [{ id: 'complete_training', text: 'Schließe das Training ab', completed: false }],
            rewards: training.reward,
            difficulty: 'easy',
            status: 'available'
        };
    },
    
    // ============================================
    // QUEST MANAGEMENT
    // ============================================
    
    acceptQuest(instanceId) {
        const quest = this.state.dailyQuests.find(q => q.instanceId === instanceId);
        if (!quest) return false;
        
        quest.status = 'active';
        quest.acceptedAt = Date.now();
        this.state.activeQuests.push(quest);
        
        // Entferne aus Daily Quests
        this.state.dailyQuests = this.state.dailyQuests.filter(q => q.instanceId !== instanceId);
        
        this.saveState();
        
        // WICHTIG: Seite neu rendern
        this.renderQuestPage();
        
        return true;
    },
    
    completeQuest(instanceId) {
        const questIndex = this.state.activeQuests.findIndex(q => q.instanceId === instanceId);
        if (questIndex === -1) return false;
        
        const quest = this.state.activeQuests[questIndex];
        quest.status = 'completed';
        quest.completedAt = Date.now();
        
        // Belohnungen vergeben
        this.grantRewards(quest.rewards);
        
        // Karma anpassen
        if (quest.karma && typeof QuestSystem !== 'undefined' && QuestSystem.karma) {
            QuestSystem.karma.value = Math.max(-100, Math.min(100, QuestSystem.karma.value + quest.karma));
        }
        
        // Zur Completed-Liste hinzufügen
        this.state.completedQuests.push(quest);
        this.state.activeQuests.splice(questIndex, 1);
        
        this.saveState();
        
        // WICHTIG: Seite neu rendern
        this.renderQuestPage();
        
        return true;
    },
    
    grantRewards(rewards) {
        if (!window.currentCharacter) return;
        
        if (rewards.gold) {
            window.currentCharacter.money = window.currentCharacter.money || { gold: 0, silver: 0, copper: 0 };
            window.currentCharacter.money.gold += rewards.gold;
        }
        
        if (rewards.xp) {
            window.currentCharacter.xp = (window.currentCharacter.xp || 0) + rewards.xp;
        }
        
        // Reputation
        if (rewards.reputation && typeof QuestSystem !== 'undefined') {
            Object.entries(rewards.reputation).forEach(([faction, value]) => {
                if (QuestSystem.reputation[faction] !== undefined) {
                    // Einfache Reputation-Logik
                    const currentRep = QuestSystem.reputation[faction];
                    // Hier könnte komplexere Logik stehen
                }
            });
        }
    },
    
    // ============================================
    // RENDERING
    // ============================================
    
    renderQuestPage() {
        const container = document.getElementById('questPage');
        if (!container) return;
        
        // Stelle sicher, dass Daily Quests existieren
        if (!this.state.dailyQuests || this.state.dailyQuests.length === 0) {
            this.generateDailyQuests();
        }
        
        const availableQuests = this.state.dailyQuests;
        const activeQuests = this.state.activeQuests;
        const trainingQuest = this.state.trainingQuest;
        
        container.innerHTML = `
            <div class="rpg-quest-page">
                <div class="quest-header">
                    <h2>📜 Quests in Frostfels</h2>
                    <div class="quest-tabs">
                        <button class="tab-btn active" onclick="RPGQuestSystem.switchTab('available', this)">Verfügbar (${availableQuests.length})</button>
                        <button class="tab-btn" onclick="RPGQuestSystem.switchTab('active', this)">Aktiv (${activeQuests.length})</button>
                        <button class="tab-btn" onclick="RPGQuestSystem.switchTab('completed', this)">Abgeschlossen (${this.state.completedQuests.length})</button>
                    </div>
                </div>
                
                <!-- Verfügbare Quests -->
                <div id="tab-available" class="quest-tab-content active">
                    <div class="quest-section">
                        <h3>📅 Tägliche Aufträge</h3>
                        ${availableQuests.length === 0 ? '<p class="no-quests">Keine verfügbaren Quests. Komm morgen wieder!</p>' : 
                            availableQuests.map(q => this.renderQuestCard(q)).join('')}
                    </div>
                    
                    ${trainingQuest ? `
                        <div class="quest-section training-section">
                            <h3>💪 Training</h3>
                            ${this.renderQuestCard(trainingQuest)}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Aktive Quests -->
                <div id="tab-active" class="quest-tab-content" style="display:none;">
                    <div class="quest-section">
                        <h3>⚔️ Aktive Quests</h3>
                        ${activeQuests.length === 0 ? '<p class="no-quests">Keine aktiven Quests.</p>' : 
                            activeQuests.map(q => this.renderActiveQuestCard(q)).join('')}
                    </div>
                </div>
                
                <!-- Abgeschlossene Quests -->
                <div id="tab-completed" class="quest-tab-content" style="display:none;">
                    <div class="quest-section">
                        <h3>✅ Abgeschlossene Quests</h3>
                        ${this.state.completedQuests.length === 0 ? '<p class="no-quests">Noch keine abgeschlossenen Quests.</p>' : 
                            this.state.completedQuests.slice(-10).reverse().map(q => this.renderCompletedQuestCard(q)).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderQuestCard(quest) {
        const isTraining = quest.type === 'training';
        const difficultyClass = quest.difficulty || 'medium';
        
        return `
            <div class="rpg-quest-card ${difficultyClass} ${isTraining ? 'training' : ''}">
                <div class="quest-card-header">
                    <div class="quest-type-badge ${quest.type}">${this.getQuestTypeLabel(quest.type)}</div>
                    <div class="quest-difficulty-badge ${difficultyClass}">${this.getDifficultyStars(difficultyClass)}</div>
                </div>
                
                <h4 class="quest-title">${quest.title}</h4>
                
                <div class="quest-story">
                    <p>${quest.storyText}</p>
                </div>
                
                <div class="quest-details">
                    <div class="quest-giver">
                        <strong>Auftraggeber:</strong> ${quest.questGiver ? quest.questGiver.name : 'Unbekannt'}
                    </div>
                    
                    ${!isTraining ? `
                        <div class="quest-objectives">
                            <strong>Ziele:</strong>
                            <ul>
                                ${quest.objectives.map(obj => `
                                    <li class="${obj.completed ? 'completed' : ''}">${obj.text}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : `
                        <div class="quest-description">${quest.description}</div>
                    `}
                </div>
                
                <div class="quest-rewards">
                    <strong>Belohnung:</strong>
                    ${this.renderRewards(quest.rewards)}
                </div>
                
                <div class="quest-actions">
                    ${quest.status === 'available' ? `
                        <button class="btn-primary" onclick="RPGQuestSystem.acceptQuest('${quest.instanceId}')">
                            ✅ Quest annehmen
                        </button>
                    ` : quest.status === 'active' ? `
                        <button class="btn-primary" onclick="RPGQuestSystem.completeQuest('${quest.instanceId}')">
                            ✓ Quest abschließen
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    renderActiveQuestCard(quest) {
        return `
            <div class="rpg-quest-card active ${quest.difficulty}">
                <div class="quest-status-badge">⚔️ Aktiv</div>
                <h4 class="quest-title">${quest.title}</h4>
                
                <div class="quest-progress">
                    <strong>Fortschritt:</strong>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculateProgress(quest)}%"></div>
                    </div>
                    <ul class="objective-list">
                        ${quest.objectives.map(obj => `
                            <li class="${obj.completed ? 'completed' : 'pending'}">
                                ${obj.completed ? '✅' : '⏳'} ${obj.text}
                                ${obj.count !== undefined ? `(${obj.count}/${obj.target})` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <button class="btn-primary" onclick="RPGQuestSystem.completeQuest('${quest.instanceId}')">
                    ✓ Quest abschließen
                </button>
            </div>
        `;
    },
    
    renderCompletedQuestCard(quest) {
        return `
            <div class="rpg-quest-card completed">
                <div class="quest-status-badge">✅ Abgeschlossen</div>
                <h4 class="quest-title">${quest.title}</h4>
                <div class="quest-completion-info">
                    Abgeschlossen: ${new Date(quest.completedAt).toLocaleDateString()}
                </div>
                
                <div class="quest-rewards-received">
                    Erhalten: ${this.renderRewards(quest.rewards)}
                </div>
            </div>
        `;
    },
    
    getQuestTypeLabel(type) {
        const labels = {
            'story': '📖 Story',
            'side': '🎯 Nebenquest',
            'faction': '⚜️ Fraktion',
            'training': '💪 Training',
            'chain': '⛓️ Kette'
        };
        return labels[type] || type;
    },
    
    getDifficultyStars(difficulty) {
        const stars = {
            'easy': '⭐',
            'medium': '⭐⭐',
            'hard': '⭐⭐⭐'
        };
        return stars[difficulty] || '⭐';
    },
    
    renderRewards(rewards) {
        const parts = [];
        if (rewards.gold) parts.push(`💰 ${rewards.gold} Gold`);
        if (rewards.xp) parts.push(`⭐ ${rewards.xp} XP`);
        if (rewards.reputation) {
            Object.entries(rewards.reputation).forEach(([faction, value]) => {
                parts.push(`🌟 Ruf +${value}`);
            });
        }
        if (rewards.items) {
            rewards.items.forEach(item => {
                parts.push(`📦 ${item.name}`);
            });
        }
        return parts.join(' | ');
    },
    
    calculateProgress(quest) {
        if (!quest.objectives || quest.objectives.length === 0) return 0;
        const completed = quest.objectives.filter(obj => obj.completed).length;
        return Math.round((completed / quest.objectives.length) * 100);
    },
    
    switchTab(tabName, clickedBtn) {
        // Verstecke alle Tabs
        document.querySelectorAll('.quest-tab-content').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        
        // Zeige ausgewählten Tab
        const selectedTab = document.getElementById('tab-' + tabName);
        if (selectedTab) {
            selectedTab.style.display = 'block';
            selectedTab.classList.add('active');
        }
        
        // Aktualisiere Tab-Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (clickedBtn) {
            clickedBtn.classList.add('active');
        }
    },
    
    // ============================================
    // DAILY RESET
    // ============================================
    
    checkDailyReset() {
        const now = new Date();
        const lastReset = this.state.lastReset ? new Date(this.state.lastReset) : null;
        
        if (!lastReset || 
            now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            
            // Verschiebe aktive Quests zu abgeschlossen/failed
            this.state.activeQuests = [];
            
            // Generiere neue Daily Quests
            this.generateDailyQuests();
            
            console.log('Daily Quests zurückgesetzt');
        }
    },
    
    // ============================================
    // SAVE / LOAD
    // ============================================
    
    saveState() {
        localStorage.setItem('rpg_quest_system', JSON.stringify(this.state));
    },
    
    loadState() {
        const saved = localStorage.getItem('rpg_quest_system');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
};

// Global verfügbar machen
window.RPGQuestSystem = RPGQuestSystem;
