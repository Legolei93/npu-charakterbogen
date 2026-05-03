/**
 * Quest Registry - Zentrale Quest-Definitionen
 * 
 * Extrahiert aus frostfels-quest-engine-v2.js
 * Alle Quests an einem Ort für bessere Wartbarkeit
 */

const QuestRegistry = {
    
    // === STORY QUESTS ===
    story: [
        {
            id: 'banditen_grenzwald',
            title: 'Banditen am Grenzwald',
            description: 'Ein Händler berichtet von Überfällen nahe des Grenzwaldes. Mehrere Lieferungen sind verschwunden. Die Dorfbewohner bitten um Hilfe.',
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
            difficulty: 'medium'
        },
        {
            id: 'verschwundene_lieferung',
            title: 'Die verschwundene Lieferung',
            description: 'Ein wichtiger Kurier ist auf der Nordroute verschwunden. Finde ihn und bringe die Lieferung zurück.',
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
                    description: 'Rette den Kurier aus den Händen der Banditen.',
                    objectives: [
                        { type: 'combat', target: 'bandit', count: 2, text: 'Besiege die Banditen' },
                        { type: 'escort', target: 'courier', count: 1, text: 'Eskortiere den Kurier' }
                    ]
                },
                {
                    id: 'delivery',
                    name: 'Lieferung',
                    description: 'Bringe die Lieferung sicher zur Schmiede.',
                    objectives: [
                        { type: 'deliver', target: 'yuki', count: 1, text: 'Liefere bei Yuki ab' }
                    ]
                }
            ],
            returnTo: { name: 'Yuki', location: 'Schmiede' },
            rewards: { gold: 120, xp: 70, karma: 3, reputation: { yuki: 3, village: 1 } },
            difficulty: 'medium'
        },
        {
            id: 'schatten_im_nebelwald',
            title: 'Schatten im Nebelwald',
            description: 'Seltsame Lichter wurden im Nebelwald gesichtet. Die Dorfbewohner fürchten sich vor einem Geist.',
            level: 2,
            giver: { name: 'Karl', location: 'Dorfzentrum', type: 'authority' },
            phases: [
                {
                    id: 'investigation',
                    name: 'Untersuchung',
                    description: 'Erkunde den Nebelwald und finde die Quelle der Lichter.',
                    objectives: [
                        { type: 'travel', target: 'nebelwald', count: 1, text: 'Reise zum Nebelwald' },
                        { type: 'investigate', target: 'strange_lights', count: 1, text: 'Untersuche die Lichter' }
                    ]
                },
                {
                    id: 'confrontation',
                    name: 'Konfrontation',
                    description: 'Stelle dich der Bedrohung im Wald.',
                    objectives: [
                        { type: 'combat', target: 'mysterious_creature', count: 1, text: 'Besiege die Kreatur' }
                    ]
                }
            ],
            returnTo: { name: 'Karl', location: 'Dorfzentrum' },
            rewards: { gold: 200, xp: 100, karma: 5, reputation: { karl: 4, village: 3 } },
            difficulty: 'hard'
        }
    ],
    
    // === DAILY QUESTS ===
    daily: [
        {
            id: 'daily_patrol',
            title: 'Dorfpatrouille',
            description: 'Patrouilliere durch das Dorf und halte nach verdächtigen Aktivitäten Ausschau.',
            objectives: [
                { type: 'patrol', target: 'village', count: 3, text: 'Patrouilliere 3 Bereiche' }
            ],
            rewards: { gold: 50, xp: 30, karma: 1 },
            difficulty: 'easy'
        },
        {
            id: 'daily_supplies',
            title: 'Vorräte sammeln',
            description: 'Sammle Heilkräuter und Vorräte für den Dorfspeicher.',
            objectives: [
                { type: 'collect', target: 'herbs', count: 5, text: 'Sammle 5 Heilkräuter' },
                { type: 'collect', target: 'food', count: 3, text: 'Sammle 3 Nahrungsmittel' }
            ],
            rewards: { gold: 40, xp: 25, karma: 1 },
            difficulty: 'easy'
        },
        {
            id: 'daily_training',
            title: 'Übungspartner',
            description: 'Trainiere mit den Dorfwachen und verbessere deine Kampffähigkeiten.',
            objectives: [
                { type: 'spar', target: 'guard', count: 3, text: 'Sparring mit 3 Wachen' }
            ],
            rewards: { gold: 30, xp: 40, karma: 0 },
            difficulty: 'easy'
        }
    ],
    
    // === TRAINING QUESTS ===
    training: [
        {
            id: 'training_meditation',
            title: 'Chakra-Meditation',
            description: 'Meditiere und konzentriere dein Chakra für bessere Kontrolle.',
            type: 'meditation',
            objectives: [
                { type: 'meditate', target: 'chakra', count: 1, text: 'Meditiere 10 Minuten' }
            ],
            rewards: { xp: 20, chakraBonus: 5 },
            choices: [
                { id: 'jutsu_training', name: 'Jutsu Training', description: 'Verbessere ein spezifisches Jutsu', effect: 'jutsu_progress' },
                { id: 'meditation', name: 'Meditation', description: 'Erhöhe Chakra-Kontrolle', effect: 'chakra_bonus' },
                { id: 'sparring', name: 'Sparring', description: 'Kampferfahrung sammeln', effect: 'combat_xp' },
                { id: 'chakra_control', name: 'Chakra Kontrolle', description: 'Effizienz verbessern', effect: 'efficiency_bonus' }
            ]
        },
        {
            id: 'training_sparring',
            title: 'Tägliches Sparring',
            description: 'Trainiere deine Kampftechniken mit einem Übungspartner.',
            type: 'sparring',
            objectives: [
                { type: 'spar', target: 'partner', count: 5, text: '5 Sparrunden absolvieren' }
            ],
            rewards: { xp: 30, combatBonus: 2 }
        },
        {
            id: 'training_weapons',
            title: 'Waffenpflege',
            description: 'Pflege deine Waffen und übe deine Treffsicherheit.',
            type: 'weapons',
            objectives: [
                { type: 'practice', target: 'target', count: 10, text: '10 Treffer landen' }
            ],
            rewards: { xp: 25, accuracyBonus: 1 }
        }
    ],
    
    // === CLAN QUESTS ===
    clan: [
        {
            id: 'clan_uchiha_sharingan',
            title: 'Sharingan-Training',
            description: 'Trainiere dein Sharingan unter Anleitung eines erfahrenen Uchiha.',
            requiredClan: 'uchiha',
            objectives: [
                { type: 'train', target: 'sharingan', count: 1, text: 'Sharingan-Training absolvieren' }
            ],
            rewards: { xp: 50, special: 'sharingan_awakening' }
        },
        {
            id: 'clan_hyuga_byakugan',
            title: 'Byakugan-Erweckung',
            description: 'Erweck dein Byakugan durch intensive Meditation und Training.',
            requiredClan: 'hyuga',
            objectives: [
                { type: 'meditate', target: 'byakugan', count: 1, text: 'Byakugan-Meditation' }
            ],
            rewards: { xp: 50, special: 'byakugan_awakening' }
        }
    ],
    
    // === HÄNDLER QUESTS ===
    merchant: [
        {
            id: 'merchant_taro_delivery',
            title: 'Lieferung für Taro',
            description: 'Taro braucht jemanden, der eine wichtige Lieferung abholt.',
            giver: 'taro',
            objectives: [
                { type: 'collect', target: 'taro_goods', count: 1, text: 'Hole die Ware ab' },
                { type: 'deliver', target: 'taro', count: 1, text: 'Liefere bei Taro ab' }
            ],
            rewards: { gold: 80, xp: 40, reputation: { taro: 2 } }
        },
        {
            id: 'merchant_kira_smuggle',
            title: 'Diskrete Besorgung',
            description: 'Kira braucht jemanden für eine... besondere Besorgung.',
            giver: 'kira',
            objectives: [
                { type: 'collect', target: 'black_market_goods', count: 1, text: 'Besorge die Ware' }
            ],
            rewards: { gold: 150, xp: 30, karma: -3, reputation: { kira: 3, blackmarket: 2 } }
        }
    ],
    
    // === HILFSMETHODEN ===
    
    /**
     * Findet ein Quest anhand seiner ID
     * @param {string} id - Die Quest-ID
     * @returns {Object|null}
     */
    getById(id) {
        const allQuests = [
            ...this.story,
            ...this.daily,
            ...this.training,
            ...this.clan,
            ...this.merchant
        ];
        
        return allQuests.find(q => q.id === id) || null;
    },
    
    /**
     * Gibt alle Quests für einen bestimmten Clan zurück
     * @param {string} clan - Der Clan-Name
     * @returns {Array}
     */
    getByClan(clan) {
        return this.clan.filter(q => q.requiredClan === clan);
    },
    
    /**
     * Gibt alle Quests eines Händlers zurück
     * @param {string} merchant - Der Händler-Name
     * @returns {Array}
     */
    getByMerchant(merchant) {
        return this.merchant.filter(q => q.giver === merchant);
    },
    
    /**
     * Filtert Quests nach Schwierigkeit
     * @param {string} difficulty - Die Schwierigkeit (easy, medium, hard)
     * @returns {Array}
     */
    getByDifficulty(difficulty) {
        const allQuests = [...this.story, ...this.daily];
        return allQuests.filter(q => q.difficulty === difficulty);
    }
};

// Global verfügbar machen
window.QuestRegistry = QuestRegistry;
