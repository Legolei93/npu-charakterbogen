/**
 * Frostfels Dynamic Quest Engine
 * 
 * Integriert in das bestehende QuestSystem
 * Erweitert um:
 * - Dynamic Quest Generation
 * - Karma System
 * - World State System
 * - Dialog System
 * - Reward Chest System
 * - Hidden Quests
 * - Quest Chains
 * - Relationship Memory
 * - Seasonal Events
 * - Rare World Events
 */

const FrostfelsQuestEngine = {
    
    // ============================================
    // WORLD STATES
    // ============================================
    
    WORLD_STATES: [
        'Markt floriert',
        'Marktkrise',
        'Nahrung knapp',
        'Winter besonders hart',
        'Froststurm-Woche',
        'Kirche unter Verdacht',
        'Kirche stärkt Einfluss',
        'Schwarzmarkt sehr aktiv',
        'Schwarzmarkt unter Jagd',
        'Nordpass gesperrt',
        'Südroute sicher',
        'Banditen nehmen zu',
        'Wachen verstärken Kontrollen',
        'Steuerdruck steigt',
        'Adlige reisen an',
        'Pilgerzeit beginnt',
        'Flüchtlinge erreichen Frostfels',
        'Seuche breitet sich aus',
        'Heilkräuter knapp',
        'Waffenpreise steigen',
        'Eisenmangel',
        'Dorf feiert Winterfest',
        'Händlerkrieg',
        'politische Spannungen',
        'Grenzkonflikte',
        'falsche Gerüchte verbreiten sich',
        'Angst vor Monsterangriffen',
        'Jagdgebiet gesperrt',
        'Ratsaal unter Druck',
        'geheime Ermittlungen laufen'
    ],
    
    // ============================================
    // SEASONAL EVENTS
    // ============================================
    
    SEASONAL_EVENTS: [
        { id: 'wintermarkt', name: 'Wintermarkt', duration: 7, season: 'winter' },
        { id: 'frostmesse', name: 'Frostmesse', duration: 5, season: 'winter' },
        { id: 'steuerwoche', name: 'Steuerwoche', duration: 3, season: 'any' },
        { id: 'pilgerwoche', name: 'Pilgerwoche', duration: 7, season: 'spring' },
        { id: 'jagdfest', name: 'Jagdfest', duration: 3, season: 'autumn' },
        { id: 'schmiedefest', name: 'Schmiedefest', duration: 4, season: 'any' },
        { id: 'haendlerkonvoi', name: 'Händlerkonvoi Ankunft', duration: 2, season: 'any' },
        { id: 'ernteabgabe', name: 'Ernteabgabe', duration: 3, season: 'autumn' },
        { id: 'soldauszahlung', name: 'Soldauszahlung', duration: 1, season: 'any' },
        { id: 'kirchenprozession', name: 'Kirchenprozession', duration: 2, season: 'spring' },
        { id: 'totenwoche', name: 'Totenwoche', duration: 7, season: 'winter' },
        { id: 'gedenknacht', name: 'Gedenknacht', duration: 1, season: 'winter' },
        { id: 'schneeopfer', name: 'Schneeopfer Ritual', duration: 1, season: 'winter' },
        { id: 'waffenpruefung', name: 'Waffenprüfung', duration: 2, season: 'any' },
        { id: 'wachdienst', name: 'Wachdienst Rotation', duration: 1, season: 'any' },
        { id: 'adelsempfang', name: 'Adelsempfang', duration: 3, season: 'any' },
        { id: 'haendlerauktion', name: 'Händlerauktion', duration: 2, season: 'any' },
        { id: 'winterturnier', name: 'Winterturnier', duration: 5, season: 'winter' },
        { id: 'dorfversammlung', name: 'Dorfversammlung', duration: 1, season: 'any' },
        { id: 'schwarzhaendler_nacht', name: 'Schwarzhändler Nacht', duration: 1, season: 'any' }
    ],
    
    // ============================================
    // RARE WORLD EVENTS
    // ============================================
    
    RARE_EVENTS: [
        { id: 'stadtbrand', name: 'Großer Stadtbrand', probability: 0.001, duration: 3 },
        { id: 'attentat', name: 'Attentat auf wichtigen NPC', probability: 0.0005, duration: 5 },
        { id: 'priester_verschwunden', name: 'Verschwundener Priester', probability: 0.002, duration: 7 },
        { id: 'pestverdacht', name: 'Pestverdacht', probability: 0.001, duration: 10 },
        { id: 'haendlerkrieg_eskaliert', name: 'Händlerkrieg eskaliert', probability: 0.003, duration: 5 },
        { id: 'lawine', name: 'Große Lawine', probability: 0.002, duration: 3 },
        { id: 'brueckeneinsturz', name: 'Brückeneinsturz', probability: 0.0015, duration: 7 },
        { id: 'ratsmitglied_verschwunden', name: 'Ratsmitglied verschwindet', probability: 0.001, duration: 10 },
        { id: 'banditenchef', name: 'Banditenchef wird gesichtet', probability: 0.002, duration: 5 },
        { id: 'kira_verschwindet', name: 'Kira verschwindet', probability: 0.0005, duration: 14 },
        { id: 'taro_ueberfallen', name: 'Taro wird überfallen', probability: 0.003, duration: 3 },
        { id: 'reliquie_verloren', name: 'Kirche verliert Reliquie', probability: 0.001, duration: 7 },
        { id: 'yuki_erpresst', name: 'Yuki wird erpresst', probability: 0.002, duration: 5 },
        { id: 'ausnahmezustand', name: 'Karl ruft Ausnahmezustand aus', probability: 0.0005, duration: 7 },
        { id: 'geheime_hinrichtung', name: 'Geheime Hinrichtung', probability: 0.0003, duration: 3 },
        { id: 'tunnel_einsturz', name: 'Alter Tunnel bricht auf', probability: 0.002, duration: 5 },
        { id: 'verbotene_schriftrolle', name: 'Verbotene Schriftrolle taucht auf', probability: 0.0005, duration: 14 },
        { id: 'soeldner_ausgeloescht', name: 'Söldnertrupp wird ausgelöscht', probability: 0.001, duration: 5 },
        { id: 'schwarzmarkt_verraten', name: 'Schwarzmarkt wird verraten', probability: 0.0005, duration: 10 },
        { id: 'mysterioese_leichen', name: 'Mysteriöse Leichenfunde', probability: 0.002, duration: 7 }
    ],
    
    // ============================================
    // QUEST GENERATOR POOLS
    // ============================================
    
    QUEST_POOLS: {
        // Probleme die Quests auslösen können
        problems: [
            { id: 'verlorene_lieferung', name: 'Verlorene Lieferung', karma: 0, risk: 'medium' },
            { id: 'gestohlene_ware', name: 'Gestohlene Ware', karma: 0, risk: 'medium' },
            { id: 'verschwundene_person', name: 'Verschwundene Person', karma: 0, risk: 'high' },
            { id: 'banditen_ueberfall', name: 'Banditenüberfall', karma: 5, risk: 'high' },
            { id: 'schmuggel_route', name: 'Schmuggelroute entdeckt', karma: -5, risk: 'high' },
            { id: 'bestechungsangebot', name: 'Bestechungsangebot', karma: -10, risk: 'medium' },
            { id: 'zeugen_bedroht', name: 'Zeuge bedroht', karma: 5, risk: 'medium' },
            { id: 'beweise_vernichten', name: 'Beweise vernichten', karma: -15, risk: 'high' },
            { id: 'relikte_stehlen', name: 'Relikte stehlen', karma: -20, risk: 'high' },
            { id: 'kirche_sabotieren', name: 'Kirche sabotieren', karma: -25, risk: 'high' },
            { id: 'schuldige_melden', name: 'Schuldige melden', karma: 10, risk: 'medium' },
            { id: 'schutz_annehmen', name: 'Schutzmission annehmen', karma: 5, risk: 'medium' },
            { id: 'rettungsauftrag', name: 'Rettungsauftrag', karma: 10, risk: 'high' },
            { id: 'dorfbewohner_helfen', name: 'Dorfbewohner helfen', karma: 5, risk: 'low' },
            { id: 'wachen_unterstuetzen', name: 'Wachen unterstützen', karma: 5, risk: 'medium' },
            { id: 'pilger_schuetzen', name: 'Pilger schützen', karma: 10, risk: 'medium' },
            { id: 'opfer_verhindern', name: 'Opfer verhindern', karma: 15, risk: 'high' },
            { id: 'armen_helfen', name: 'Armen helfen', karma: 5, risk: 'low' },
            { id: 'winterhilfe', name: 'Winterhilfe organisieren', karma: 10, risk: 'low' },
            { id: 'banditenopfer_retten', name: 'Banditenopfer retten', karma: 10, risk: 'high' }
        ],
        
        // Orte für Quests
        locations: [
            'Marktplatz', 'Taverne', 'Kirche', 'Schwarzmarkt', 'Nordpass', 
            'Südroute', 'Wald', 'Berge', 'Fluss', 'Höhlen',
            'Ruinen', 'Lager', 'Turm', 'Brücke', 'Grenze',
            'Hafen', 'Mine', 'Farm', 'Jagdgebiet', 'Friedhof'
        ],
        
        // Ursachen für Probleme
        causes: [
            'Banditen', 'Wölfe', 'Verräter', 'Unwetter', 'Diebe',
            'Schmuggler', 'Kultisten', 'Spione', 'Deserteure', 'Monster',
            'Korruption', 'Intrigen', 'Rivalen', 'Schulden', 'Rache'
        ],
        
        // NPCs die Quests geben können
        npcs: {
            taro: { name: 'Taro', type: 'weapon_merchant', mood: 'neutral', trust: 0 },
            yuki: { name: 'Yuki', type: 'armor_merchant', mood: 'neutral', trust: 0 },
            shin: { name: 'Shin', type: 'item_merchant', mood: 'neutral', trust: 0 },
            kira: { name: 'Kira', type: 'black_market', mood: 'suspicious', trust: 0 },
            karl: { name: 'Karl', type: 'authority', mood: 'neutral', trust: 0 },
            priester: { name: 'Bruder Aldric', type: 'church', mood: 'neutral', trust: 0 },
            wirt: { name: 'Greta', type: 'tavern', mood: 'friendly', trust: 0 },
            bauer: { name: 'Bauer Heinrich', type: 'villager', mood: 'neutral', trust: 0 }
        },
        
        // Konsequenzen für Quest-Entscheidungen
        consequences: {
            positive: [
                'Dorf dankbar', 'Kirche unterstützt', 'Händler vertrauen', 
                'Wachen respektieren', 'Karma steigt', 'Reputation steigt'
            ],
            negative: [
                'Dorf misstraut', 'Kirche beobachtet', 'Händler zögern',
                'Wachen kontrollieren', 'Karma sinkt', 'Reputation sinkt',
                'Kira interessiert sich', 'Verrat wird erinnert'
            ]
        }
    },
    
    // ============================================
    // TRAINING QUEST POOL
    // ============================================
    
    TRAINING_QUESTS: [
        { id: 'sparring', name: 'Sparring', description: 'Trainiere mit einem Partner', reward: { xp: 10, ap: 0.5 } },
        { id: 'meditation', name: 'Meditation', description: 'Meditiere zur Chakra-Kontrolle', reward: { xp: 10, chakraBonus: 5 } },
        { id: 'chakra_kontrolle', name: 'Chakra Kontrolle', description: 'Übe Chakra-Fluss', reward: { xp: 15, chakraBonus: 10 } },
        { id: 'waffenpflege', name: 'Waffenpflege', description: 'Pflege deine Waffen', reward: { xp: 5, gold: 5 } },
        { id: 'sprinttraining', name: 'Sprinttraining', description: 'Trainiere deine Geschwindigkeit', reward: { xp: 10, staminaBonus: 5 } },
        { id: 'zielwurf', name: 'Zielwurf', description: 'Übe Kunai-Wurf', reward: { xp: 10, accuracyBonus: 1 } },
        { id: 'tarnung', name: 'Tarnung', description: 'Übe Verstecken und Tarnen', reward: { xp: 10, stealthBonus: 1 } },
        { id: 'wahrnehmung', name: 'Wahrnehmung', description: 'Trainiere deine Sinne', reward: { xp: 10, perceptionBonus: 1 } },
        { id: 'ueberlebenstraining', name: 'Überlebenstraining', description: 'Übe Überleben in der Wildnis', reward: { xp: 15, survivalBonus: 1 } },
        { id: 'fokus_training', name: 'Fokus Training', description: 'Trainiere deine Konzentration', reward: { xp: 10, focusBonus: 1 } },
        { id: 'klettertraining', name: 'Klettertraining', description: 'Übe Klettern', reward: { xp: 10, climbBonus: 1 } },
        { id: 'ausdauertraining', name: 'Ausdauertraining', description: 'Trainiere deine Ausdauer', reward: { xp: 10, staminaBonus: 10 } }
    ],
    
    // ============================================
    // HIDDEN QUESTS
    // ============================================
    
    HIDDEN_QUESTS: {
        dark: [
            { id: 'namenloser_auftrag', name: 'Der namenlose Auftrag', karmaReq: -50, trigger: 'kira_trust_high' },
            { id: 'blut_im_schnee', name: 'Blut im Schnee', karmaReq: -40, trigger: 'winter_kill' },
            { id: 'schwarze_liste', name: 'Die schwarze Liste', karmaReq: -60, trigger: 'betrayal_count' },
            { id: 'schweigende_zeuge', name: 'Der schweigende Zeuge', karmaReq: -30, trigger: 'witness_silenced' },
            { id: 'kiras_letzte_bitte', name: 'Kiras letzte Bitte', karmaReq: -75, trigger: 'kira_favor' }
        ],
        light: [
            { id: 'schweigendes_gebet', name: 'Das schweigende Gebet', karmaReq: 50, trigger: 'church_devotion' },
            { id: 'letzte_reliquie', name: 'Die letzte Reliquie', karmaReq: 60, trigger: 'relic_saved' },
            { id: 'kind_im_frost', name: 'Das Kind im Frost', karmaReq: 40, trigger: 'child_saved' },
            { id: 'waechter_nordpass', name: 'Wächter des Nordpasses', karmaReq: 75, trigger: 'pass_defended' },
            { id: 'karls_stilles_vertrauen', name: 'Karls stilles Vertrauen', karmaReq: 50, trigger: 'karl_efficiency' }
        ]
    },
    
    // ============================================
    // REWARD CHEST ITEMS
    // ============================================
    
    CHEST_REWARDS: {
        common: [
            { name: 'Heilkräuter', type: 'consumable', effect: 'heal_10', chance: 0.2 },
            { name: 'Bandagen', type: 'consumable', effect: 'heal_5', chance: 0.2 },
            { name: 'Kunai', type: 'weapon', quantity: 3, chance: 0.15 },
            { name: 'Shuriken', type: 'weapon', quantity: 3, chance: 0.15 },
            { name: 'Silber', type: 'currency', amount: 10, chance: 0.15 },
            { name: 'Reisebrot', type: 'consumable', effect: 'stamina_5', chance: 0.1 },
            { name: 'Wetzstein', type: 'material', chance: 0.03 },
            { name: 'Verbandspaket', type: 'consumable', effect: 'heal_20', chance: 0.01 },
            { name: 'Kleine Chakra Pille', type: 'consumable', effect: 'chakra_10', chance: 0.005 },
            { name: 'Lederflicken', type: 'material', chance: 0.005 }
        ],
        uncommon: [
            { name: 'Händlergutschein', type: 'voucher', discount: 0.1, chance: 0.3 },
            { name: 'Besondere Pfeilspitzen', type: 'ammo', quantity: 10, chance: 0.2 },
            { name: 'Chakra Tinte', type: 'material', chance: 0.15 },
            { name: 'Trainingsrolle', type: 'scroll', xpBonus: 0.1, chance: 0.15 },
            { name: 'Alchemie Material', type: 'material', chance: 0.1 },
            { name: 'Seltenes Kraut', type: 'material', chance: 0.05 },
            { name: 'Reparaturset', type: 'tool', chance: 0.03 },
            { name: 'Dietrich Set', type: 'tool', chance: 0.015 },
            { name: 'Schutzamulett', type: 'accessory', defense: 1, chance: 0.005 }
        ],
        rare: [
            { name: 'Schwaches Jutsu', type: 'jutsu_scroll', rank: 'E', chance: 0.4 },
            { name: 'Kleine Schriftrolle', type: 'scroll', apBonus: 1, chance: 0.3 },
            { name: 'Sonderrabatt', type: 'voucher', discount: 0.25, chance: 0.15 },
            { name: 'Vergessene Notiz', type: 'lore', chance: 0.08 },
            { name: 'Besondere Rezeptur', type: 'recipe', chance: 0.05 },
            { name: 'Kleiner Reliktfund', type: 'relic', karmaBonus: 5, chance: 0.015 },
            { name: 'Versteckter Kontakt', type: 'contact', npc: 'random', chance: 0.005 }
        ],
        legendary: [
            { name: 'Legendäres Fragment', type: 'fragment', chance: 0.5 },
            { name: 'Geheimer Händlerzugang', type: 'unlock', npc: 'secret_merchant', chance: 0.3 },
            { name: 'Verbotene Schriftrolle', type: 'jutsu_scroll', rank: 'A', chance: 0.15 },
            { name: 'Seltene Klinge', type: 'weapon', damage: '2W6', chance: 0.04 },
            { name: 'Einzigartige Questfreischaltung', type: 'unlock_quest', chance: 0.0099 }
        ],
        mythic: [
            { name: 'S-Rang Jutsu Schriftrolle', type: 'jutsu_scroll', rank: 'S', chance: 0.0001 }
        ]
    },
    
    // ============================================
    // INITIALISIERUNG
    // ============================================
    
    init() {
        console.log('Frostfels Quest Engine initialisiert');
        this.checkAndUpdateWorldState();
        this.checkSeasonalEvent();
        this.checkRareEvent();
    },
    
    // ============================================
    // WORLD STATE MANAGEMENT
    // ============================================
    
    checkAndUpdateWorldState() {
        // Prüfe ob World State aktualisiert werden muss
        const currentState = QuestSystem.worldStates.active;
        
        // 20% Chance, dass sich der World State ändert
        if (Math.random() < 0.2 || currentState.length === 0) {
            this.generateNewWorldState();
        }
    },
    
    generateNewWorldState() {
        // Wähle 1-3 zufällige World States
        const numStates = Math.floor(Math.random() * 3) + 1;
        const newStates = [];
        
        for (let i = 0; i < numStates; i++) {
            const randomState = this.WORLD_STATES[Math.floor(Math.random() * this.WORLD_STATES.length)];
            if (!newStates.includes(randomState)) {
                newStates.push(randomState);
            }
        }
        
        QuestSystem.worldStates.active = newStates;
        QuestSystem.worldStates.history.push({
            states: [...newStates],
            timestamp: Date.now()
        });
        
        console.log('Neue World States:', newStates);
    },
    
    // ============================================
    // SEASONAL EVENTS
    // ============================================
    
    checkSeasonalEvent() {
        const now = new Date();
        const month = now.getMonth(); // 0-11
        
        // Bestimme aktuelle Jahreszeit
        let season = 'any';
        if (month >= 2 && month <= 4) season = 'spring';
        else if (month >= 5 && month <= 7) season = 'summer';
        else if (month >= 8 && month <= 10) season = 'autumn';
        else season = 'winter';
        
        // Filtere Events nach Jahreszeit
        const possibleEvents = this.SEASONAL_EVENTS.filter(e => 
            e.season === season || e.season === 'any'
        );
        
        // 30% Chance für ein Seasonal Event
        if (Math.random() < 0.3) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            QuestSystem.seasonalEvent = {
                ...event,
                startDate: Date.now(),
                endDate: Date.now() + (event.duration * 24 * 60 * 60 * 1000)
            };
            console.log('Seasonal Event gestartet:', event.name);
        }
    },
    
    // ============================================
    // RARE EVENTS
    // ============================================
    
    checkRareEvent() {
        // Prüfe Cooldown (mindestens 7 Tage zwischen Rare Events)
        if (QuestSystem.rareEventCooldown > 0) {
            QuestSystem.rareEventCooldown--;
            return;
        }
        
        // Prüfe jedes Rare Event auf Auslösung
        for (const event of this.RARE_EVENTS) {
            if (Math.random() < event.probability) {
                QuestSystem.rareEvent = {
                    ...event,
                    startDate: Date.now(),
                    endDate: Date.now() + (event.duration * 24 * 60 * 60 * 1000)
                };
                QuestSystem.rareEventCooldown = 7; // 7 Tage Cooldown
                console.log('RARE EVENT:', event.name);
                break;
            }
        }
    },
    
    // ============================================
    // QUEST GENERATION
    // ============================================
    
    generateDynamicQuest() {
        const karma = QuestSystem.karma.value;
        const worldStates = QuestSystem.worldStates.active;
        const reputation = QuestSystem.reputation;
        
        // Filtere Probleme basierend auf Karma
        let possibleProblems = this.QUEST_POOLS.problems.filter(p => {
            // Bei positivem Karma: mehr gute Probleme
            if (karma > 25) return p.karma >= 0;
            // Bei negativem Karma: mehr dunkle Probleme
            if (karma < -25) return p.karma <= 0;
            // Neutral: alle Probleme
            return true;
        });
        
        // Wähle zufälliges Problem
        const problem = possibleProblems[Math.floor(Math.random() * possibleProblems.length)];
        
        // Wähle NPC basierend auf Problem und Reputation
        const npc = this.selectNPCForProblem(problem);
        
        // Wähle Ort
        const location = this.QUEST_POOLS.locations[Math.floor(Math.random() * this.QUEST_POOLS.locations.length)];
        
        // Wähle Ursache
        const cause = this.QUEST_POOLS.causes[Math.floor(Math.random() * this.QUEST_POOLS.causes.length)];
        
        // Generiere Quest
        return {
            id: 'quest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: this.generateQuestTitle(problem, npc),
            description: this.generateQuestDescription(problem, npc, location, cause),
            problem: problem,
            npc: npc,
            location: location,
            cause: cause,
            karma: problem.karma,
            risk: problem.risk,
            worldState: worldStates[0] || null,
            dialog: this.generateDialog(npc, problem),
            rewards: this.calculateRewards(problem, npc),
            consequences: this.generateConsequences(problem),
            timestamp: Date.now()
        };
    },
    
    selectNPCForProblem(problem) {
        // Wähle passenden NPC basierend auf Problem-Typ
        const npcs = Object.values(this.QUEST_POOLS.npcs);
        
        if (problem.karma < 0) {
            // Dunkle Probleme: Kira oder misstrauische NPCs
            return npcs.find(n => n.type === 'black_market') || npcs[0];
        } else if (problem.karma > 0) {
            // Gute Probleme: Kirche oder freundliche NPCs
            return npcs.find(n => n.type === 'church') || npcs[0];
        }
        
        // Neutral: zufälliger NPC
        return npcs[Math.floor(Math.random() * npcs.length)];
    },
    
    generateQuestTitle(problem, npc) {
        const templates = [
            `${problem.name}: ${npc.name} braucht Hilfe`,
            `${npc.name} und das Problem am ${this.QUEST_POOLS.locations[Math.floor(Math.random() * this.QUEST_POOLS.locations.length)]}`,
            `Hilf ${npc.name}: ${problem.name}`,
            `Auftrag von ${npc.name}`,
            `${problem.name} in Frostfels`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    },
    
    generateQuestDescription(problem, npc, location, cause) {
        return `${npc.name} hat ein Problem: ${problem.name}. ` +
               `Der Vorfall ereignete sich am ${location}. ` +
               `Die Ursache scheint ${cause} zu sein.`;
    },
    
    generateDialog(npc, problem) {
        const starts = [
            `Wenn ihr jetzt geht, sterben Menschen.`,
            `Ich frage euch nicht aus Freundschaft.`,
            `Manche Dinge sollte man nicht laut sagen.`,
            `Heute brauche ich keine Helden, nur Resultate.`,
            `Es gibt keine saubere Lösung dafür.`,
            `Ihr könnt reich werden oder ruhig schlafen. Beides nicht.`,
            `Entweder helft ihr mir oder ich rede mit Karl.`
        ];
        
        return {
            start: starts[Math.floor(Math.random() * starts.length)],
            npc: npc.name,
            options: [
                { text: 'Ich helfe euch.', karma: 5, trust: 10 },
                { text: 'Was ist der Preis?', karma: 0, trust: 0 },
                { text: 'Das ist nicht mein Problem.', karma: -5, trust: -10 },
                { text: 'Ich brauche mehr Informationen.', karma: 0, trust: 5 }
            ]
        };
    },
    
    calculateRewards(problem, npc) {
        const baseGold = problem.risk === 'low' ? 50 : problem.risk === 'medium' ? 100 : 200;
        const baseXP = problem.risk === 'low' ? 25 : problem.risk === 'medium' ? 50 : 100;
        
        return {
            gold: baseGold + Math.floor(Math.random() * 50),
            xp: baseXP + Math.floor(Math.random() * 25),
            reputation: {
                [npc.type]: 5
            },
            karma: problem.karma
        };
    },
    
    generateConsequences(problem) {
        if (problem.karma > 0) {
            return {
                accept: this.QUEST_POOLS.consequences.positive[Math.floor(Math.random() * this.QUEST_POOLS.consequences.positive.length)],
                reject: this.QUEST_POOLS.consequences.negative[Math.floor(Math.random() * this.QUEST_POOLS.consequences.negative.length)]
            };
        } else {
            return {
                accept: 'Kira nimmt Notiz',
                reject: 'NPC erinnert sich an die Ablehnung'
            };
        }
    },
    
    // ============================================
    // TRAINING QUEST GENERATION
    // ============================================
    
    generateTrainingQuest() {
        const training = this.TRAINING_QUESTS[Math.floor(Math.random() * this.TRAINING_QUESTS.length)];
        
        return {
            id: 'training_' + Date.now(),
            title: training.name,
            description: training.description,
            type: 'training',
            difficulty: 'easy',
            requirements: {
                custom: { type: training.id, count: 1 }
            },
            rewards: training.reward,
            timestamp: Date.now()
        };
    },
    
    // ============================================
    // REWARD CHEST
    // ============================================
    
    generateChestContents() {
        const contents = [];
        
        // 3 Items auswählen
        for (let i = 0; i < 3; i++) {
            const roll = Math.random();
            let rarity;
            
            if (roll < 0.6) rarity = 'common';
            else if (roll < 0.85) rarity = 'uncommon';
            else if (roll < 0.97) rarity = 'rare';
            else if (roll < 0.9999) rarity = 'legendary';
            else rarity = 'mythic';
            
            const items = this.CHEST_REWARDS[rarity];
            const item = items[Math.floor(Math.random() * items.length)];
            
            contents.push({
                ...item,
                rarity: rarity
            });
        }
        
        return contents;
    },
    
    // ============================================
    // KARMA MANAGEMENT
    // ============================================
    
    modifyKarma(amount, reason) {
        const oldKarma = QuestSystem.karma.value;
        QuestSystem.karma.value = Math.max(-100, Math.min(100, oldKarma + amount));
        
        QuestSystem.karma.history.push({
            change: amount,
            reason: reason,
            oldValue: oldKarma,
            newValue: QuestSystem.karma.value,
            timestamp: Date.now()
        });
        
        console.log(`Karma geändert: ${oldKarma} -> ${QuestSystem.karma.value} (${reason})`);
        
        // Prüfe auf Hidden Quests
        this.checkHiddenQuestTriggers();
    },
    
    checkHiddenQuestTriggers() {
        const karma = QuestSystem.karma.value;
        
        // Prüfe dunkle Hidden Quests
        if (karma < 0) {
            for (const quest of this.HIDDEN_QUESTS.dark) {
                if (karma <= quest.karmaReq && !QuestSystem.hiddenQuestsUnlocked.includes(quest.id)) {
                    if (Math.random() < 0.3) { // 30% Chance beim Erreichen des Karma-Werts
                        QuestSystem.hiddenQuestsUnlocked.push(quest.id);
                        console.log('Hidden Quest freigeschaltet:', quest.name);
                    }
                }
            }
        }
        
        // Prüfe helle Hidden Quests
        if (karma > 0) {
            for (const quest of this.HIDDEN_QUESTS.light) {
                if (karma >= quest.karmaReq && !QuestSystem.hiddenQuestsUnlocked.includes(quest.id)) {
                    if (Math.random() < 0.3) {
                        QuestSystem.hiddenQuestsUnlocked.push(quest.id);
                        console.log('Hidden Quest freigeschaltet:', quest.name);
                    }
                }
            }
        }
    },
    
    // ============================================
    // RELATIONSHIP MEMORY
    // ============================================
    
    addRelationshipMemory(npcKey, memory) {
        if (!QuestSystem.relationshipMemory[npcKey]) {
            QuestSystem.relationshipMemory[npcKey] = { trust: 0, interactions: [], lastMood: 'neutral' };
        }
        
        QuestSystem.relationshipMemory[npcKey].interactions.push({
            memory: memory,
            timestamp: Date.now()
        });
        
        // Begrenze auf letzte 20 Interaktionen
        if (QuestSystem.relationshipMemory[npcKey].interactions.length > 20) {
            QuestSystem.relationshipMemory[npcKey].interactions.shift();
        }
    },
    
    modifyTrust(npcKey, amount) {
        if (QuestSystem.relationshipMemory[npcKey]) {
            QuestSystem.relationshipMemory[npcKey].trust += amount;
            QuestSystem.relationshipMemory[npcKey].trust = Math.max(-100, Math.min(100, QuestSystem.relationshipMemory[npcKey].trust));
        }
    },
    
    // ============================================
    // QUEST CHAINS
    // ============================================
    
    startQuestChain(chainId) {
        const chains = {
            'verlorene_lieferung': [
                { id: 'chain_1_1', title: 'Verlorene Lieferung', description: 'Finde die verlorene Lieferung.' },
                { id: 'chain_1_2', title: 'Die Schmuggelroute', description: 'Entdecke die Schmuggelroute.' },
                { id: 'chain_1_3', title: 'Der Schwarzmarktboss', description: 'Konfrontiere den Schwarzmarktboss.' }
            ],
            'verschwundene_person': [
                { id: 'chain_2_1', title: 'Verschwundene Person', description: 'Suche die verschwundene Person.' },
                { id: 'chain_2_2', title: 'Falsche Identität', description: 'Entdecke die falsche Identität.' },
                { id: 'chain_2_3', title: 'Politische Intrige', description: 'Enthülle die politische Intrige.' }
            ]
        };
        
        if (chains[chainId]) {
            QuestSystem.activeChains.push({
                id: chainId,
                quests: chains[chainId],
                currentQuest: 0,
                startDate: Date.now()
            });
        }
    },
    
    // ============================================
    // SAVE / LOAD
    // ============================================
    
    save() {
        const data = {
            karma: QuestSystem.karma,
            worldStates: QuestSystem.worldStates,
            reputation: QuestSystem.reputation,
            relationshipMemory: QuestSystem.relationshipMemory,
            hiddenQuestsUnlocked: QuestSystem.hiddenQuestsUnlocked,
            hiddenQuestsCompleted: QuestSystem.hiddenQuestsCompleted,
            activeChains: QuestSystem.activeChains,
            completedChains: QuestSystem.completedChains,
            seasonalEvent: QuestSystem.seasonalEvent,
            rareEvent: QuestSystem.rareEvent,
            rareEventCooldown: QuestSystem.rareEventCooldown
        };
        
        localStorage.setItem('frostfels_quest_engine', JSON.stringify(data));
    },
    
    load() {
        const saved = localStorage.getItem('frostfels_quest_engine');
        if (saved) {
            const data = JSON.parse(saved);
            QuestSystem.karma = data.karma || { value: 0, history: [] };
            QuestSystem.worldStates = data.worldStates || { active: [], history: [] };
            QuestSystem.reputation = data.reputation || { village: 'unbekannt', church: 'geduldet', merchants: 'Kunde', blackmarket: 'unbekannt', karl: 'irrelevant' };
            QuestSystem.relationshipMemory = data.relationshipMemory || {};
            QuestSystem.hiddenQuestsUnlocked = data.hiddenQuestsUnlocked || [];
            QuestSystem.hiddenQuestsCompleted = data.hiddenQuestsCompleted || [];
            QuestSystem.activeChains = data.activeChains || [];
            QuestSystem.completedChains = data.completedChains || [];
            QuestSystem.seasonalEvent = data.seasonalEvent || null;
            QuestSystem.rareEvent = data.rareEvent || null;
            QuestSystem.rareEventCooldown = data.rareEventCooldown || 0;
        }
    }
};

// Global verfügbar machen
window.FrostfelsQuestEngine = FrostfelsQuestEngine;
