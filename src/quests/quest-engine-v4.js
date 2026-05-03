/**
 * Quest Engine v4.0 - Studio-Level RPG Quest System
 * 
 * Vollständige Neuausrichtung basierend auf Master Spec:
 * - 6 Daily Quests generiert, max 3 wählbar
 * - 1 Training Quest pro Tag
 * - 00:00 Uhr Reset
 * - Quest Board System
 * - Fast Combat Integration
 * - Karma & Trust System
 * - Reward Chest System
 * 
 * @version 4.0.0
 * @author NPU Studio
 */

const QuestEngine = {
    
    // === VERSION ===
    VERSION: '4.2.0',
    
    // === WORLD STATE RULE ENGINE (Phase 9.7) ===
    // Datengetriebene Konfliktauflösung statt Hardcoding
    WORLD_STATE_RULES: [
        {
            id: 'village_state',
            flags: ['village_corrupt', 'grenzwald_peace'],
            priority: {
                village_corrupt: 2,
                grenzwald_peace: 1
            }
        },
        {
            id: 'truth_state',
            flags: ['truth_hidden', 'elder_exposed'],
            priority: {
                elder_exposed: 2,
                truth_hidden: 1
            }
        },
        {
            id: 'kira_alliance',
            flags: ['kira_network_member', 'kira_network_exposed'],
            priority: {
                kira_network_exposed: 2,
                kira_network_member: 1
            }
        },
        {
            id: 'kira_trust',
            flags: ['kira_trusted', 'kira_enemy'],
            priority: {
                kira_enemy: 2,
                kira_trusted: 1
            }
        },
        {
            id: 'player_status',
            flags: ['player_hunted', 'player_protected'],
            priority: {
                player_hunted: 2,
                player_protected: 1
            }
        }
    ],
    
    // === WORLD EVENTS SYSTEM (Phase 10.5) ===
    // Dynamische Ereignisse basierend auf World State
    MAX_EVENTS_PER_TICK: 1,
    
    // === DYNAMIC QUEST PATTERNS (Phase NEXT) ===
    // Quests entstehen aus World State, nicht aus Templates
    QUEST_PATTERNS: [
        {
            id: 'hunt_escape',
            priority: 3,
            condition: function(ctx) {
                return ctx.flags.player_hunted && ctx.flags.kira_network_member;
            },
            build: function() {
                return {
                    title: 'Gejagt im Schatten',
                    description: 'Attentäter sind dir dicht auf den Fersen. Kiras Netzwerk kann dich nur noch begrenzt schützen.',
                    category: 'dynamic',
                    difficulty: 'hard',
                    objectives: [
                        { id: 'find_escape', type: 'exploration', target: 2, text: 'Finde einen sicheren Fluchtweg' },
                        { id: 'fight_back', type: 'combat', target: 2, text: 'Wehre die Angreifer ab' }
                    ],
                    rewards: { xp: 150, silver: 50 }
                };
            }
        },
        {
            id: 'corruption_investigation',
            priority: 2,
            condition: function(ctx) {
                return ctx.flags.village_corrupt && !ctx.flags.investigation_started;
            },
            build: function() {
                return {
                    title: 'Die Fäulnis im Dorf',
                    description: 'Etwas stimmt hier ganz und gar nicht. Die Menschen flüstern, und niemand traut sich zu sprechen.',
                    category: 'dynamic',
                    difficulty: 'medium',
                    objectives: [
                        { id: 'investigate', type: 'investigate', target: 2, text: 'Untersuche verdächtige Hinweise' },
                        { id: 'interrogate', type: 'talk', target: 1, text: 'Befrage verängstigte Dorfbewohner' }
                    ],
                    rewards: { xp: 100, silver: 30 }
                };
            }
        },
        {
            id: 'hero_help',
            priority: 1,
            condition: function(ctx) {
                return ctx.karma > 20 && ctx.factions.village > 10;
            },
            build: function() {
                return {
                    title: 'Ein Ruf nach Hilfe',
                    description: 'Die Menschen vertrauen dir. Ein Bote erreicht dich mit einer dringenden Bitte.',
                    category: 'dynamic',
                    difficulty: 'easy',
                    objectives: [
                        { id: 'respond', type: 'exploration', target: 1, text: 'Eile zum Ort des Geschehens' },
                        { id: 'help', type: 'deliver', target: 1, text: 'Hilfe leisten' }
                    ],
                    rewards: { xp: 80, silver: 25, karma: 5 }
                };
            }
        },
        {
            id: 'bandit_opportunity',
            priority: 2,
            condition: function(ctx) {
                return ctx.flags.village_corrupt && ctx.factions.bandits > 5;
            },
            build: function() {
                return {
                    title: 'Die Gelegenheit',
                    description: 'Das Chaos im Dorf hat eine Lücke geschaffen. Die Banditen beobachten aufmerksam.',
                    category: 'dynamic',
                    difficulty: 'medium',
                    objectives: [
                        { id: 'scout', type: 'exploration', target: 1, text: 'Erkunde die Schwachstelle' },
                        { id: 'choose_side', type: 'decision', target: 1, text: 'Entscheide dich für eine Seite' }
                    ],
                    rewards: { xp: 120, silver: 40 }
                };
            }
        },
        {
            id: 'kira_test',
            priority: 2,
            condition: function(ctx) {
                return ctx.flags.kira_network_member && ctx.factions.kira < 10;
            },
            build: function() {
                return {
                    title: 'Die Prüfung des Netzwerks',
                    description: 'Kira will deine Loyalität testen. Eine Aufgabe wartet.',
                    category: 'dynamic',
                    difficulty: 'medium',
                    objectives: [
                        { id: 'prove', type: 'investigate', target: 1, text: 'Beweise deinen Wert' },
                        { id: 'deliver', type: 'deliver', target: 1, text: 'Überbringe die Nachricht' }
                    ],
                    rewards: { xp: 100, silver: 35, reputation: { kira: 10 } }
                };
            }
        }
    ],
    
    // === COMPOSITE PATTERNS (Phase NEXT+) ===
    // Mehrere Zustände kombinieren → komplexe Quests
    COMPOSITE_PATTERNS: [
        {
            id: 'betrayal_in_chaos',
            priority: 5,
            condition: function(c) {
                return c.danger === 'high' && c.corruption && c.faction === 'kira';
            },
            build: function() {
                return {
                    title: 'Verrat im Chaos',
                    description: 'Während du gejagt wirst, nutzt jemand das Chaos im Dorf gegen dich. Selbst Kiras Leute scheinen nicht mehr vertrauenswürdig.',
                    category: 'composite',
                    difficulty: 'very_hard',
                    objectives: [
                        { id: 'survive', type: 'combat', target: 2, text: 'Überlebe die Hinterhalte' },
                        { id: 'find_truth', type: 'investigate', target: 2, text: 'Finde heraus, wer dich verrät' },
                        { id: 'escape', type: 'exploration', target: 1, text: 'Fliehe aus der Falle' }
                    ],
                    rewards: { xp: 250, silver: 100, karma: -5 }
                };
            }
        },
        {
            id: 'corrupt_hero',
            priority: 4,
            condition: function(c) {
                return c.corruption && c.karma > 10;
            },
            build: function() {
                return {
                    title: 'Der gefallene Held',
                    description: 'Das Dorf ist korrupt, doch die Menschen sehen in dir noch Hoffnung. Kannst du sie retten, ohne selbst zu fallen?',
                    category: 'composite',
                    difficulty: 'hard',
                    objectives: [
                        { id: 'resist', type: 'exploration', target: 1, text: 'Widerstehe der Versuchung' },
                        { id: 'help', type: 'deliver', target: 2, text: 'Hilfe den Unschuldigen' },
                        { id: 'confront', type: 'combat', target: 1, text: 'Stelle die Anführer zur Rede' }
                    ],
                    rewards: { xp: 200, silver: 75, karma: 10 }
                };
            }
        },
        {
            id: 'hunted_traitor',
            priority: 4,
            condition: function(c) {
                return c.danger === 'high' && c.faction === 'neutral' && c.karma < -10;
            },
            build: function() {
                return {
                    title: 'Gejagt und Verachtet',
                    description: 'Die Jäger sind dir auf den Fersen, und niemand wird dir helfen. Deine Vergangenheit holt dich ein.',
                    category: 'composite',
                    difficulty: 'very_hard',
                    objectives: [
                        { id: 'hide', type: 'exploration', target: 2, text: 'Versteck dich vor den Jägern' },
                        { id: 'survive', type: 'combat', target: 2, text: 'Kämpfe ums Überleben' },
                        { id: 'redeem', type: 'decision', target: 1, text: 'Suche Erlösung oder akzeptiere dein Schicksal' }
                    ],
                    rewards: { xp: 220, silver: 80 }
                };
            }
        }
    ],
    
    // === FOLLOW-UP PATTERNS (Phase NEXT++) ===
    // Quests bauen auf vorherigen Ereignissen auf
    FOLLOWUP_PATTERNS: [
        {
            id: 'hunt_continues',
            priority: 6,
            condition: function(last, ctx) {
                return last && last.templateId === 'betrayal_in_chaos' && ctx.flags.player_hunted;
            },
            build: function() {
                return {
                    title: 'Die Jagd geht weiter',
                    description: 'Nach dem Verrat bist du noch immer auf der Flucht. Die Jäger geben nicht auf.',
                    category: 'followup',
                    difficulty: 'very_hard',
                    objectives: [
                        { id: 'keep_moving', type: 'exploration', target: 3, text: 'Bewege dich ständig, um nicht eingekreist zu werden' },
                        { id: 'fight_back', type: 'combat', target: 2, text: 'Wehre die Verfolger ab' }
                    ],
                    rewards: { xp: 280, silver: 120 },
                    isFollowUp: true
                };
            }
        },
        {
            id: 'aftermath_corruption',
            priority: 5,
            condition: function(last, ctx) {
                return last && last.templateId === 'corrupt_hero' && ctx.flags.village_corrupt;
            },
            build: function() {
                return {
                    title: 'Die Spuren des Helden',
                    description: 'Deine Taten im korrupten Dorf werden noch immer erzählt. Aber die Geschichte ist noch nicht zu Ende.',
                    category: 'followup',
                    difficulty: 'hard',
                    objectives: [
                        { id: 'return', type: 'exploration', target: 1, text: 'Kehre zurück zum Dorf' },
                        { id: 'decide', type: 'decision', target: 1, text: 'Entscheide über die Zukunft' }
                    ],
                    rewards: { xp: 220, silver: 90, karma: 5 },
                    isFollowUp: true
                };
            }
        },
        {
            id: 'kira_aftermath',
            priority: 5,
            condition: function(last, ctx) {
                return last && last.templateId === 'kira_test' && ctx.flags.kira_network_member;
            },
            build: function() {
                return {
                    title: 'Im Netzwerk',
                    description: 'Du hast Kiras Prüfung bestanden. Jetzt beginnt die wahre Arbeit.',
                    category: 'followup',
                    difficulty: 'medium',
                    objectives: [
                        { id: 'mission', type: 'deliver', target: 2, text: 'Erfülle deine erste offizielle Mission' },
                        { id: 'prove', type: 'investigate', target: 1, text: 'Beweise deine Loyalität' }
                    ],
                    rewards: { xp: 180, silver: 70, reputation: { kira: 15 } },
                    isFollowUp: true
                };
            }
        },
        {
            id: 'hunted_redemption',
            priority: 5,
            condition: function(last, ctx) {
                return last && last.templateId === 'hunted_traitor' && ctx.karma > 0;
            },
            build: function() {
                return {
                    title: 'Der lange Weg zurück',
                    description: 'Du hast versucht, dich zu erlösen. Die Jäger haben deine Veränderung bemerkt.',
                    category: 'followup',
                    difficulty: 'hard',
                    objectives: [
                        { id: 'negotiate', type: 'talk', target: 1, text: 'Verhandle mit den Jägern' },
                        { id: 'prove', type: 'combat', target: 1, text: 'Beweise deine Aufrichtigkeit' }
                    ],
                    rewards: { xp: 250, silver: 100, karma: 15 },
                    isFollowUp: true
                };
            }
        }
    ],
    
    // === WORLD EVOLUTION PATTERNS (Phase NEXT+++) ===
    // Langfristige Veränderungen der Welt
    WORLD_EVOLUTION: {
        // Dorf-Entwicklung
        village: {
            stages: ['normal', 'corrupt', 'fallen', 'recovering', 'reborn'],
            transitions: {
                'normal->corrupt': { flag: 'village_corrupt', duration: 0 },
                'corrupt->fallen': { flag: 'village_fallen', duration: 86400000 }, // 24h
                'fallen->recovering': { flag: 'village_recovery_started', duration: 172800000 }, // 48h
                'recovering->reborn': { flag: 'village_reborn', duration: 259200000 } // 72h
            }
        },
        // Spieler-Ruf
        reputation: {
            stages: ['unknown', 'talked_about', 'legendary', 'infamous'],
            transitions: {
                'unknown->talked_about': { karmaThreshold: 30, questCount: 5 },
                'talked_about->legendary': { karmaThreshold: 60, questCount: 15 },
                'unknown->infamous': { karmaThreshold: -50 }
            }
        }
    },
    
    // === EVOLUTION QUESTS ===
    // Quests basieren auf langfristigem Weltzustand
    EVOLUTION_PATTERNS: [
        {
            id: 'fallen_village',
            priority: 4,
            narrative: 'collapse',
            condition: function(ctx) {
                return ctx.worldEvolution?.village === 'fallen';
            },
            build: function() {
                return {
                    title: 'Die Ruinen von Gestern',
                    description: 'Das Dorf ist gefallen. Was einst Heimat war, ist nun nur noch Asche und Erinnerungen.',
                    category: 'evolution',
                    difficulty: 'very_hard',
                    objectives: [
                        { id: 'search', type: 'investigate', target: 2, text: 'Durchsuche die Ruinen nach Überlebenden' },
                        { id: 'decide', type: 'decision', target: 1, text: 'Entscheide: Wiederaufbau oder Vergessen?' }
                    ],
                    rewards: { xp: 300, silver: 150, karma: -10 },
                    isEvolution: true
                };
            }
        },
        {
            id: 'recovering_hope',
            priority: 3,
            narrative: 'redemption',
            condition: function(ctx) {
                return ctx.worldEvolution?.village === 'recovering';
            },
            build: function() {
                return {
                    title: 'Hoffnung kehrt zurück',
                    description: 'Langsam erhebt sich das Dorf aus den Trümmern. Die Menschen brauchen einen Helden.',
                    category: 'evolution',
                    difficulty: 'medium',
                    objectives: [
                        { id: 'help', type: 'deliver', target: 3, text: 'Bringe Vorräte und Hilfe' },
                        { id: 'inspire', type: 'talk', target: 2, text: 'Inspiriere die Dorfbewohner' }
                    ],
                    rewards: { xp: 200, silver: 80, karma: 20 },
                    isEvolution: true
                };
            }
        },
        {
            id: 'legendary_status',
            priority: 2,
            narrative: 'hero',
            condition: function(ctx) {
                return ctx.worldEvolution?.reputation === 'legendary';
            },
            build: function() {
                return {
                    title: 'Die Legende lebt',
                    description: 'Man erzählt sich Geschichten von dir in jeder Taverne. Die Leute kommen aus weit her, um dich zu treffen.',
                    category: 'evolution',
                    difficulty: 'easy',
                    objectives: [
                        { id: 'meet', type: 'talk', target: 3, text: 'Triff dich mit Bewunderern' },
                        { id: 'inspire', type: 'exploration', target: 1, text: 'Zeige dich in der Öffentlichkeit' }
                    ],
                    rewards: { xp: 150, silver: 100, karma: 10 },
                    isEvolution: true
                };
            }
        },
        {
            id: 'infamous_notoriety',
            priority: 2,
            narrative: 'villain',
            condition: function(ctx) {
                return ctx.worldEvolution?.reputation === 'infamous';
            },
            build: function() {
                return {
                    title: 'Der gefürchtete Name',
                    description: 'Die Menschen flüstern deinen Namen mit Angst. Du bist zu etwas geworden, das man meidet.',
                    category: 'evolution',
                    difficulty: 'hard',
                    objectives: [
                        { id: 'confront', type: 'combat', target: 2, text: 'Stelle dich denen, die dich jagen' },
                        { id: 'decide', type: 'decision', target: 1, text: 'Akzeptiere oder ändere deinen Ruf' }
                    ],
                    rewards: { xp: 250, silver: 120, karma: -15 },
                    isEvolution: true
                };
            }
        }
    ],
    
    WORLD_EVENTS: [
        {
            id: 'bandit_raid',
            priority: 3,
            cooldown: 300000, // 5 Minuten
            cause: 'Das Chaos im Dorf hat Banditen angelockt',
            condition: function(state) {
                return state.flags.village_corrupt && !state.flags.bandit_raid_recent;
            },
            effect: function(engine) {
                engine._emitQuestFeedback('story_event', {
                    text: '⚔️ Banditen greifen an — das Chaos im Dorf hat sie angelockt.',
                    cause: 'village_corrupt',
                    impact: 'factions.bandits +5'
                });
                
                // Faction-Änderung
                if (engine.state.worldState.factions.bandits !== undefined) {
                    engine.state.worldState.factions.bandits = Math.min(100, 
                        engine.state.worldState.factions.bandits + 5);
                }
                
                // Temporärer Flag für Cooldown
                engine.state.worldState.flags.bandit_raid_recent = true;
                
                console.log('[WorldEvent] Bandit Raid ausgelöst');
            }
        },
        {
            id: 'kira_influence_grow',
            priority: 2,
            cooldown: 600000, // 10 Minuten
            cause: 'Deine Mitgliedschaft in Kiras Netzwerk zieht neue Kontakte an',
            condition: function(state) {
                return state.flags.kira_network_member && !state.flags.kira_influence_recent;
            },
            effect: function(engine) {
                engine._emitQuestFeedback('story_event', {
                    text: '🕸️ Kiras Netzwerk breitet sich weiter aus — deine Kontakte wachsen.',
                    cause: 'kira_network_member',
                    impact: 'factions.kira +3'
                });
                
                if (engine.state.worldState.factions.kira !== undefined) {
                    engine.state.worldState.factions.kira = Math.min(100,
                        engine.state.worldState.factions.kira + 3);
                }
                
                engine.state.worldState.flags.kira_influence_recent = true;
                console.log('[WorldEvent] Kira Influence ausgelöst');
            }
        },
        {
            id: 'village_recovery',
            priority: 1,
            cooldown: 900000, // 15 Minuten
            cause: 'Der Frieden im Dorf lässt Vertrauen zurückkehren',
            condition: function(state) {
                return state.flags.grenzwald_peace && state.factions.village < 0;
            },
            effect: function(engine) {
                engine._emitQuestFeedback('story_event', {
                    text: '🏘️ Das Dorf erholt sich — der Frieden wirkt Wunder.',
                    cause: 'grenzwald_peace',
                    impact: 'factions.village +2'
                });
                
                if (engine.state.worldState.factions.village !== undefined) {
                    engine.state.worldState.factions.village = Math.min(100,
                        engine.state.worldState.factions.village + 2);
                }
                
                console.log('[WorldEvent] Village Recovery ausgelöst');
            }
        },
        {
            id: 'hunter_ambush',
            priority: 3,
            cooldown: 120000, // 2 Minuten
            cause: 'Deine Vergangenheit holt dich ein',
            condition: function(state) {
                return state.flags.player_hunted && Math.random() < 0.3;
            },
            effect: function(engine) {
                engine._emitQuestFeedback('story_event', {
                    text: '⚠️ Du spürst, dass du beobachtet wirst — die Jäger sind nah...',
                    cause: 'player_hunted',
                    impact: 'immediate danger'
                });
                
                console.log('[WorldEvent] Hunter Ambush ausgelöst');
            }
        }
    ],
    
    // === PRODUCTION FLAGS ===
    DEBUG: false,
    _initialized: false,
    _lastProcessedEventId: null,
    
    /** @private Debug-Logging (nur wenn DEBUG=true) */
    _log: function() {
        if (this.DEBUG) console.log.apply(console, arguments);
    },
    
    /** @private Zentrales UI-Update Event */
    _emitQuestUpdate: function() {
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest:updated', { ts: Date.now() });
        }
    },
    
    /** @private Feedback-Event für UX (Toasts, Sounds, Animationen) */
    _emitQuestFeedback: function(type, payload) {
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest:feedback', {
                type: type,
                timestamp: Date.now(),
                ...(payload || {})
            });
        }
    },
    
    // Zentrales Event-Normalisierungs-Mapping (Single Source of Truth)
    EVENT_MAP: {
        travel: 'exploration',
        discover: 'exploration',
        investigate: 'exploration',
        combat: 'combat_won',
        collect: 'item_collected',
        trade: 'merchant_trade'
    },
    
    /** @private Normalisiert Event-Typen über das zentrale Mapping */
    _normalizeEventType: function(eventType) {
        return this.EVENT_MAP[eventType] || eventType;
    },
    
    // === KONFIGURATION ===
    CONFIG: {
        DAILY_QUEST_COUNT: 6,           // Generierte Quests pro Tag
        MAX_SELECTABLE_QUESTS: 3,       // Max wählbare Quests
        TRAINING_QUEST_COUNT: 1,        // Training Quests pro Tag
        RESET_HOUR: 0,                  // 00:00 Uhr Reset
        MIN_QUEST_DURATION: 5,          // Minuten
        MAX_QUEST_DURATION: 25,         // Minuten für seltene Quests
        BASE_XP_REWARD: 5,              // XP pro Daily Quest
        CHEST_CHOICE_COUNT: 3,          // 1 von 3 Kisten wählen
        LEGENDARY_CHANCE: 0.001,        // 0.1% für Legendary
        S_RANK_JUTSU_CHANCE: 0.0001     // 0.01% für S-Rang
    },
    
    // === QUEST STATES ===
    STATES: {
        HIDDEN: 'hidden',
        AVAILABLE: 'available',         // Auf dem Board sichtbar
        SELECTED: 'selected',           // Vom Spieler gewählt
        DIALOG_OPEN: 'dialog_open',
        ACCEPTED: 'accepted',
        ACTIVE: 'active',
        IN_PROGRESS: 'in_progress',
        READY_FOR_TURN_IN: 'ready_for_turn_in',
        COMPLETED: 'completed',
        FAILED: 'failed',
        ABANDONED: 'abandoned',
        EXPIRED: 'expired'              // Nach Daily Reset
    },
    
    // === QUEST TYPES ===
    TYPES: {
        COMBAT: 'combat',
        MERCHANT: 'merchant',
        ESCORT: 'escort',
        DIPLOMACY: 'diplomacy',
        INVESTIGATION: 'investigation',
        MORAL: 'moral',
        BLACKMARKET: 'blackmarket',
        SPECIAL: 'special',
        SUSPICIOUS: 'suspicious',
        UNUSUAL: 'unusual',
        ELITE: 'elite',
        BOSS: 'boss'
    },
    
    // === SEASONAL EVENTS ===
    SEASONAL_EVENTS: {
        winter_market: {
            id: 'winter_market',
            name: 'Wintermarkt',
            description: 'Der jährliche Wintermarkt in Frostfels',
            month: 12, // Dezember
            day: 15,   // 15. Dezember
            duration: 7, // 7 Tage
            questModifier: 'merchant',
            rewards: { gold: 2, reputation: { merchants: 10 } }
        },
        tax_week: {
            id: 'tax_week',
            name: 'Steuerwoche',
            description: 'Karl erhebt die jährlichen Steuern',
            month: 3, // März
            day: 1,
            duration: 7,
            questModifier: 'authority',
            rewards: { karma: -2, reputation: { karl: 5 } }
        },
        pilgrimage: {
            id: 'pilgrimage',
            name: 'Pilgerwoche',
            description: 'Die Pilger strömen zum Tempel',
            month: 6, // Juni
            day: 21,
            duration: 7,
            questModifier: 'church',
            rewards: { karma: 3, reputation: { pastor: 10 } }
        },
        blackmarket_night: {
            id: 'blackmarket_night',
            name: 'Schwarzhändler Nacht',
            description: 'Die Schwarzmarkthändler sind besonders aktiv',
            month: 10, // Oktober
            day: 31,
            duration: 3,
            questModifier: 'blackmarket',
            rewards: { karma: -3, reputation: { kira: 10 } }
        }
    },
    
    // === RARE WORLD EVENTS ===
    RARE_EVENTS: {
        city_fire: {
            id: 'city_fire',
            name: 'Stadtbrand',
            description: 'Ein großer Brand bedroht Frostfels!',
            probability: 0.001, // 0.1% pro Tag
            duration: 1,
            questModifier: 'emergency',
            rewards: { karma: 5, reputation: { village: 15 } }
        },
        missing_priest: {
            id: 'missing_priest',
            name: 'Verschwundener Priester',
            description: 'Der Pastor ist verschwunden...',
            probability: 0.0005,
            duration: 3,
            questModifier: 'investigation',
            rewards: { karma: 3, reputation: { pastor: 10, church: 10 } }
        },
        avalanche: {
            id: 'avalanche',
            name: 'Lawine',
            description: 'Der Nordpass ist durch eine Lawine blockiert',
            probability: 0.002,
            duration: 2,
            questModifier: 'rescue',
            rewards: { karma: 3, reputation: { village: 10 } }
        },
        forbidden_scroll: {
            id: 'forbidden_scroll',
            name: 'Verbotene Schriftrolle',
            description: 'Eine verbotene Schriftrolle wurde entdeckt',
            probability: 0.0001,
            duration: 5,
            questModifier: 'special',
            rewards: { items: ['forbidden_scroll'], karma: -5 }
        }
    },
    
    // === STATE ===
    state: {
        // Quest Board (6 generierte Quests)
        questBoard: [],
        
        // Vom Spieler gewählte Quests (max 3)
        selectedDailyQuests: [],
        
        // Aktive Quests (in Bearbeitung)
        activeQuests: [],
        
        // Abgeschlossene Quests
        completedQuests: [],
        
        // Training Quest
        trainingQuest: null,
        trainingInProgress: false,
        trainingEndTime: null,
        
        // Daily Reset
        lastReset: null,
        nextReset: null,
        
        // Cooldowns
        questCooldowns: {},
        
        // Karma System
        karma: {
            value: 0,
            history: []
        },
        
        // NPC Trust System
        trust: {
            taro: { value: 0, max: 100 },
            yuki: { value: 0, max: 100 },
            shin: { value: 0, max: 100 },
            kira: { value: 0, max: 100 },
            karl: { value: 0, max: 100 },
            pastor: { value: 0, max: 100 },
            jimmy: { value: 0, max: 100 }
        },
        
        // World States
        worldStates: {
            active: [],
            history: []
        },
        
        // Seasonal Events
        seasonalEvent: null,
        
        // Rare World Events
        rareEvent: null,
        
        // Quest Chains
        activeQuestChains: [],
        completedQuestChains: [],
        chainDecisionImpacts: {}, // chainId -> { decisionId, branch, questIndex }
        
        // World State (Phase 6)
        worldState: {
            karma: 0,
            factions: {
                village: 0,
                bandits: 0,
                kira: 0,
                church: 0,
                karl: 0,
                taro: 0,
                yuki: 0,
                shin: 0,
                blackmarket: 0
            },
            flags: {} // z.B. { bandit_leader_alive: false, decision_quest_123: 'spare' }
        },
        
        // Chest Reward Pool
        chestPool: {
            common: [],
            uncommon: [],
            rare: [],
            epic: [],
            legendary: []
        }
    },
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert die Quest Engine
     */
    init() {
        // FIX: Character laden (kein Fallback!)
        let character = this._getCurrentCharacter();
        
        if (!character) {
            console.warn('[QuestEngine] Kein Character geladen — warte auf Login');
            // Nicht abbrechen, nur warnen
            // Character wird später via Event gesetzt
        }
        
        // Verhindere doppelte Initialisierung
        if (this._initialized) {
            console.log('[QuestEngine] Bereits initialisiert, lade State neu');
            this.loadState();
            return;
        }

        console.log(`[QuestEngine v${this.VERSION}] Initialisiere...`);
        if (character) {
            console.log('[QuestEngine] Character geladen:', character.name || character.id);
        }

        // State zurücksetzen
        this.resetState();

        // Migration von v3
        this.migrateFromV3();

        // State laden
        this.loadState();

        // Daily Reset prüfen
        this.checkDailyReset();

        // Seasonal Events prüfen
        this.checkSeasonalEvents();

        // Rare Events prüfen
        this.checkRareEvents();
        
        // Event-Listener registrieren
        this.setupEventListeners();
        
        console.log('[QuestEngine] Initialisierung abgeschlossen');
        this._initialized = true;
        
        // Debug Info
        if (this.state.seasonalEvent) {
            console.log(`[QuestEngine] Aktives Seasonal Event: ${this.state.seasonalEvent.name}`);
        }
        if (this.state.rareEvent) {
            console.log(`[QuestEngine] Aktives Rare Event: ${this.state.rareEvent.name}`);
        }
    },
    
    /**
     * Resetet den State
     */
    resetState() {
        this.state = {
            questBoard: [],
            selectedDailyQuests: [],
            activeQuests: [],
            completedQuests: [],
            trainingQuest: null,
            trainingInProgress: false,
            trainingEndTime: null,
            lastReset: null,
            nextReset: null,
            lastGeneratedDate: null,
            questCooldowns: {},
            karma: { value: 0, history: [] },
            trust: {
                taro: { value: 0, max: 100 },
                yuki: { value: 0, max: 100 },
                shin: { value: 0, max: 100 },
                kira: { value: 0, max: 100 },
                karl: { value: 0, max: 100 },
                pastor: { value: 0, max: 100 },
                jimmy: { value: 0, max: 100 }
            },
            worldStates: { active: [], history: [] },
            chestPool: { common: [], uncommon: [], rare: [], epic: [], legendary: [] },
            chainDecisionImpacts: {},
            worldState: {
                karma: 0,
                factions: {
                    village: 0,
                    bandits: 0,
                    kira: 0,
                    church: 0,
                    karl: 0,
                    taro: 0,
                    yuki: 0,
                    shin: 0,
                    blackmarket: 0
                },
                flags: {}
            }
        };
    },
    
    /**
     * Migriert Daten von QuestEngine v3
     */
    migrateFromV3() {
        const currentUser = this._getCurrentUser();
        if (!currentUser) return;
        
        const v3Key = `npu_quest_engine_v3_${currentUser.id}`;
        const v3Data = localStorage.getItem(v3Key);
        
        if (!v3Data) return;
        
        try {
            const v3 = JSON.parse(v3Data);
            console.log('[QuestEngine] Migriere Daten von v3...');
            
            // Migriere Quests
            if (v3.activeQuests) {
                this.state.activeQuests = v3.activeQuests.map(q => ({
                    ...q,
                    version: '4.0'
                }));
            }
            
            if (v3.completedQuests) {
                this.state.completedQuests = v3.completedQuests;
            }
            
            // Migriere Karma
            if (v3.karma) {
                this.state.karma = v3.karma;
            }
            
            // Migriere Reputation zu Trust
            if (v3.reputation) {
                Object.entries(v3.reputation).forEach(([npc, value]) => {
                    if (this.state.trust[npc]) {
                        this.state.trust[npc].value = Math.min(100, Math.max(0, value * 10));
                    }
                });
            }
            
            // Alte Daten löschen
            localStorage.removeItem(v3Key);
            
            console.log('[QuestEngine] Migration abgeschlossen');
            
        } catch (e) {
            console.error('[QuestEngine] Fehler bei Migration:', e);
        }
    },
    
    // === DAILY RESET ===
    
    /**
     * Prüft und führt Daily Reset durch
     */
    checkDailyReset() {
        const now = new Date();
        const lastReset = this.state.lastReset ? new Date(this.state.lastReset) : null;
        
        // Prüfe ob neuer Tag (nach 00:00)
        const needsReset = !lastReset || 
            now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear();
        
        if (needsReset) {
            console.log('[QuestEngine] Daily Reset wird durchgeführt...');
            this.performDailyReset();
        }
        
        // Nächsten Reset berechnen
        const nextReset = new Date(now);
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
        this.state.nextReset = nextReset.toISOString();
    },
    
    /**
     * Führt den Daily Reset durch
     */
    performDailyReset() {
        const now = new Date();
        
        // Nicht abgeschlossene Daily Quests verfallen
        this.state.selectedDailyQuests.forEach(quest => {
            if (quest.status !== this.STATES.COMPLETED) {
                quest.status = this.STATES.EXPIRED;
                this.state.completedQuests.push(quest);
            }
        });
        
        // Board zurücksetzen — ABER Chain-Quests merken
        var activeChainQuestsToRestore = [];
        if (Array.isArray(this.state.activeQuestChains)) {
            for (var i = 0; i < this.state.questBoard.length; i++) {
                var q = this.state.questBoard[i];
                if (q.chainId && this.state.activeQuestChains.some(function(c) { return c.id === q.chainId; })) {
                    activeChainQuestsToRestore.push({ chainId: q.chainId, chainIndex: q.chainIndex });
                }
            }
        }
        
        this.state.questBoard = [];
        this.state.selectedDailyQuests = [];
        
        // Training zurücksetzen
        this.state.trainingQuest = null;
        this.state.trainingInProgress = false;
        this.state.trainingEndTime = null;
        
        // Neues Board generieren
        this.generateQuestBoard();
        
        // Training Quest generieren
        this.generateTrainingQuest();
        
        // Chain-Quests wiederherstellen (überschreiben normale Board-Quests im story-Slot)
        for (var j = 0; j < activeChainQuestsToRestore.length; j++) {
            var restoreInfo = activeChainQuestsToRestore[j];
            this._injectChainQuestIntoBoard(restoreInfo.chainId, restoreInfo.chainIndex);
        }
        
        // Prüfe ob aktive Chains keine Quest auf dem Board haben = nachinjizieren
        if (Array.isArray(this.state.activeQuestChains)) {
            for (var k = 0; k < this.state.activeQuestChains.length; k++) {
                var chain = this.state.activeQuestChains[k];
                var hasQuestOnBoard = this.state.questBoard.some(function(q) { return q.chainId === chain.id; }) ||
                                      this.state.activeQuests.some(function(q) { return q.chainId === chain.id; });
                if (!hasQuestOnBoard) {
                    var chainDef = this.QUEST_CHAINS[chain.id];
                    if (chainDef) {
                        var nextQuestDef = chainDef.quests.find(function(q) { return q.index === chain.currentQuestIndex; });
                        if (nextQuestDef) {
                            this._injectChainQuestIntoBoard(chain.id, nextQuestDef.index);
                        }
                    }
                }
            }
        }
        
        // Reset-Zeit speichern
        this.state.lastReset = now.toISOString();
        
        // === DAILY RESET FÜR NEGATIVE STATES (Phase 8.5 Audit Fix) ===
        // Hunted-Status nach 1 Tag verfallen lassen
        if (this.state.worldState.flags['player_hunted']) {
            delete this.state.worldState.flags['player_hunted'];
            console.log('[QuestEngine] Hunted-Status durch Daily Reset entfernt');
        }
        
        // Karma leicht erhöhen (Richtung Neutral)
        if (this.state.worldState.karma < 0) {
            this.state.worldState.karma = Math.min(0, this.state.worldState.karma + 5);
            console.log('[QuestEngine] Karma durch Daily Reset erhöht:', this.state.worldState.karma);
        }
        
        // Speichern
        this.saveState();
        
        // === WORLD EVENTS (Phase 10.5) ===
        this._processWorldEvents();
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quests:daily-reset', {
                board: this.state.questBoard,
                training: this.state.trainingQuest
            });
        }
        
        console.log('[QuestEngine] Daily Reset abgeschlossen');
    },
    
    // === QUEST BOARD GENERATION ===
    
    /**
     * Generiert das Quest Board (6 Quests)
     */
    generateQuestBoard() {
        this._log('[QuestEngine] Generiere Quest Board...');
        
        // Daily Rotation Guard
        var today = new Date().toDateString();
        if (this.state.lastGeneratedDate === today && this.state.questBoard.length > 0) {
            this._log('[QuestEngine] Board bereits heute generiert, übersprungen');
            return;
        }
        
        var board = [];
        var usedTemplateIds = new Set();
        var self = this;
        
        // === DYNAMIC QUEST GENERATION (Phase NEXT) ===
        // Generiere Quests aus World State vor dem Pool
        var dynamicQuests = this._generateDynamicQuests();
        for (var d = 0; d < dynamicQuests.length && board.length < 2; d++) {
            var dq = dynamicQuests[d];
            board.push(dq);
            console.log('[DynamicQuest] Generiert:', dq.title);
        }
        
        // Pool-basierte Generierung (wenn QuestPool verfügbar)
        var usePool = (typeof window.QuestPool !== 'undefined');
        
        // Kategorie-Reihenfolge mit Gewichtung der Slot-Anzahl
        var slots = [
            { category: 'story', count: 1 },
            { category: 'merchant', count: 1 },
            { category: 'exploration', count: 1 },
            { category: 'investigation', count: 1 },
            { category: 'moral', count: 1 },
            { category: 'combat', count: 1 }
        ];
        
        if (usePool) {
            // Pool-basierte Generierung
            for (var s = 0; s < slots.length && board.length < this.CONFIG.DAILY_QUEST_COUNT; s++) {
                var slot = slots[s];
                var basePool = window.QuestPool.getPool(slot.category);
                
                if (!basePool || basePool.length === 0) continue;
                
                var filtered = this._filterAvailablePool(basePool);
                
                // FIX 2: Gewichtung stabil halten — mindestens 2 Optionen für echte Gewichtung
                var selectionPool = filtered.length >= 2 ? filtered : basePool;
                
                var template = this._getWeightedRandomQuest(selectionPool);
                
                // FIX 3: Debug Transparenz
                if (this.DEBUG) {
                    this._log('[QuestPool]', slot.category, '| total:', basePool.length, '| filtered:', filtered.length, '| selected:', template ? template.id : 'null');
                }
                
                if (template) {
                    var quest = this._createQuestInstance(template, slot.category);
                    board.push(quest);
                    usedTemplateIds.add(template.id);
                }
            }
            
            // Füllen bis 6 mit daily/combat Pool
            if (board.length < this.CONFIG.DAILY_QUEST_COUNT) {
                var fillerPool = [].concat(
                    window.QuestPool.getPool('daily'),
                    window.QuestPool.getPool('combat')
                );
                var filteredFiller = fillerPool.filter(function(q) {
                    return !usedTemplateIds.has(q.id) && !self._isQuestOnCooldown(q.id);
                });
                
                while (board.length < this.CONFIG.DAILY_QUEST_COUNT && filteredFiller.length > 0) {
                    var fillerTemplate = this._getWeightedRandomQuest(filteredFiller);
                    if (fillerTemplate) {
                        board.push(this._createQuestInstance(fillerTemplate, fillerTemplate.category || 'daily'));
                        usedTemplateIds.add(fillerTemplate.id);
                        filteredFiller = filteredFiller.filter(function(q) { return q.id !== fillerTemplate.id; });
                    } else {
                        break;
                    }
                }
            }
        } else {
            // Legacy-Fallback (alte Logik ohne Pool)
            var storyQuest = this._generateStoryQuest();
            if (storyQuest) { board.push(storyQuest); usedTemplateIds.add(storyQuest.templateId); }
            
            var merchantQuests = this._generateMerchantQuests(2);
            merchantQuests.forEach(function(q) { if (!usedTemplateIds.has(q.templateId)) { board.push(q); usedTemplateIds.add(q.templateId); } });
            
            if (Math.random() < 0.7) {
                var invQuest = this._generateInvestigationQuest();
                if (invQuest && !usedTemplateIds.has(invQuest.templateId)) { board.push(invQuest); }
            }
            if (Math.random() < 0.5) {
                var moralQuest = this._generateMoralQuest();
                if (moralQuest && !usedTemplateIds.has(moralQuest.templateId)) { board.push(moralQuest); }
            }
            if (Math.random() < 0.6) {
                var explQuest = this.generateExplorationQuest();
                if (explQuest && !usedTemplateIds.has(explQuest.templateId)) { board.push(explQuest); }
            }
            
            while (board.length < this.CONFIG.DAILY_QUEST_COUNT) {
                var fillerQuest = this._generateFillerQuest();
                if (fillerQuest && !usedTemplateIds.has(fillerQuest.templateId)) {
                    board.push(fillerQuest);
                    usedTemplateIds.add(fillerQuest.templateId);
                } else {
                    break;
                }
            }
        }
        
        // Shuffle für Variation
        this.state.questBoard = this._shuffleArray(board);
        this.state.lastGeneratedDate = today;
        
        // Chain-Quests nachinjizieren falls aktive Chains existieren
        // und deren aktuelle Quest noch nicht auf dem Board ist
        if (Array.isArray(this.state.activeQuestChains)) {
            for (var c = 0; c < this.state.activeQuestChains.length; c++) {
                var chain = this.state.activeQuestChains[c];
                var hasQuest = this.state.questBoard.some(function(q) { return q.chainId === chain.id; }) ||
                               this.state.activeQuests.some(function(q) { return q.chainId === chain.id; });
                if (!hasQuest) {
                    var cDef = this.QUEST_CHAINS[chain.id];
                    if (cDef) {
                        var nextQ = cDef.quests.find(function(q) { return q.index === chain.currentQuestIndex; });
                        if (nextQ) {
                            this._injectChainQuestIntoBoard(chain.id, nextQ.index);
                        }
                    }
                }
            }
        }
        
        this._log('[QuestEngine]', board.length, 'Quests generiert (Pool:', usePool, ')');
        this.saveState();
        this._emitQuestUpdate();
    },
    
    /**
     * Generiert eine tägliche Training Quest
     */
    generateTrainingQuest() {
        const trainings = [
            { id: 'sparring', name: 'Sparring-Training', description: 'Trainiere im Sparring mit einem Partner', reward: { xp: 10 } },
            { id: 'meditation', name: 'Chakra-Meditation', description: 'Meditiere zur Verbesserung deiner Chakra-Kontrolle', reward: { xp: 10 } },
            { id: 'zielwurf', name: 'Zielwurf-Übung', description: 'Übe präzise Kunai- und Shuriken-Würfe', reward: { xp: 10 } },
            { id: 'ausdauer', name: 'Ausdauertraining', description: 'Absolviere ein intensives Ausdauertraining', reward: { xp: 10 } },
            { id: 'taijutsu', name: 'Taijutsu-Drill', description: 'Trainiere grundlegende Taijutsu-Kombinationen', reward: { xp: 15 } },
            { id: 'chakra_control', name: 'Chakra-Formung', description: 'Übe die Formung und Kontrolle deines Chakras', reward: { xp: 15 } }
        ];
        
        const training = trainings[Math.floor(Math.random() * trainings.length)];
        
        this.state.trainingQuest = {
            instanceId: 'training_' + Date.now(),
            templateId: training.id,
            type: 'training',
            title: training.name,
            description: training.description,
            objectives: [{ id: 'complete_training', text: 'Schließe das Training ab', completed: false }],
            rewards: training.reward,
            difficulty: 'easy',
            status: 'available',
            generatedAt: new Date().toISOString()
        };
        
        console.log('[QuestEngine] Training Quest generiert:', this.state.trainingQuest.title);
    },
    
    /**
     * Generiert eine Story Quest
     * @private
     */
    _generateStoryQuest() {
        const templates = QuestRegistryV4.story;
        const available = templates.filter(q => !this._isQuestOnCooldown(q.id));
        
        if (available.length === 0) return null;
        
        const template = available[Math.floor(Math.random() * available.length)];
        return this._createQuestInstance(template, this.TYPES.SPECIAL);
    },
    
    /**
     * Generiert Händler Quests
     * @private
     */
    _generateMerchantQuests(count) {
        const quests = [];
        const templates = QuestRegistryV4.merchant;
        
        for (let i = 0; i < count && i < templates.length; i++) {
            const available = templates.filter(q => 
                !this._isQuestOnCooldown(q.id) && 
                !quests.find(existing => existing.templateId === q.id)
            );
            
            if (available.length > 0) {
                const template = available[Math.floor(Math.random() * available.length)];
                quests.push(this._createQuestInstance(template, this.TYPES.MERCHANT));
            }
        }
        
        return quests;
    },
    
    /**
     * Bestimmt die dominante Narrative der Welt (Phase NEXT+++)
     * @private
     * @returns {string} - 'collapse', 'hero', 'villain', 'redemption', 'neutral'
     */
    _getDominantNarrative: function() {
        const evo = this.state.worldEvolution;
        if (!evo) return 'neutral';
        
        // Höchste Priorität: Kollaps
        if (evo.village === 'fallen') return 'collapse';
        
        // Zweithöchste: Erlösung
        if (evo.village === 'recovering' || evo.village === 'reborn') return 'redemption';
        
        // Spieler-Ruf
        if (evo.reputation === 'legendary') return 'hero';
        if (evo.reputation === 'infamous') return 'villain';
        
        // Fallback
        return 'neutral';
    },
    
    /**
     * Generiert dynamische Quests basierend auf World State (Phase NEXT)
     * Prüft zuerst EVOLUTION (gewichtet nach Narrative), dann FOLLOW-UP, dann COMPOSITE, dann normale PATTERNS
     * @private
     * @returns {Array} - Array von Quest-Instanzen
     */
    _generateDynamicQuests: function() {
        const ctx = this._getWorldContext();
        const generated = [];
        const dominantNarrative = this._getDominantNarrative();
        
        console.log('[DominantNarrative] Aktuelle Hauptrichtung:', dominantNarrative);
        
        // === EVOLUTION PATTERNS (höchste Priorität - langfristig) ===
        // Gewichte nach dominanter Narrative (Soft Weighting)
        const weightedEvolutionPatterns = this.EVOLUTION_PATTERNS.map(function(p) {
            let weight = 1; // Basis-Gewicht
            
            if (p.narrative) {
                // Passende Narrative = höheres Gewicht (3x)
                // Unpassende = niedrigeres Gewicht (0.5x)
                weight = p.narrative === dominantNarrative ? 3 : 0.5;
            }
            
            return { pattern: p, weight: weight };
        });
        
        // Filtere nach Condition
        const validEvolutionPatterns = weightedEvolutionPatterns.filter(function(wp) {
            return wp.pattern.condition(ctx);
        });
        
        if (validEvolutionPatterns.length > 0) {
            // Wähle gewichtet zufällig
            const selected = this._weightedRandomSelect(validEvolutionPatterns);
            
            if (selected) {
                const questData = selected.build();
                if (questData) {
                    const quest = this._createDynamicQuestInstance(questData, selected.id);
                    if (quest) {
                        generated.push(quest);
                        console.log('[EvolutionQuest] Generiert:', selected.id, quest.title, 
                            '(Narrative:', selected.narrative || 'none', ')');
                    }
                }
            }
        }
        
        // === FOLLOW-UP PATTERNS (hohe Priorität) ===
        if (generated.length === 0) {
            const lastQuest = this.state.lastCompletedQuest;
            if (lastQuest) {
                const followupMatches = this.FOLLOWUP_PATTERNS.filter(function(p) {
                    return p.condition(lastQuest, ctx);
                });
                
                if (followupMatches.length > 0) {
                    followupMatches.sort(function(a, b) {
                        return (b.priority || 0) - (a.priority || 0);
                    });
                    
                    const topFollowup = followupMatches[0];
                    const questData = topFollowup.build();
                    if (questData) {
                        const quest = this._createDynamicQuestInstance(questData, topFollowup.id);
                        if (quest) {
                            generated.push(quest);
                            console.log('[FollowUpQuest] Generiert:', topFollowup.id, quest.title);
                        }
                    }
                }
            }
        }
        
        // === COMPOSITE PATTERNS (mittlere Priorität) ===
        if (generated.length === 0) {
            const compositeCtx = this._buildCompositeContext(ctx);
            const compositeMatches = this.COMPOSITE_PATTERNS.filter(function(p) {
                return p.condition(compositeCtx);
            });
            
            if (compositeMatches.length > 0) {
                compositeMatches.sort(function(a, b) {
                    return (b.priority || 0) - (a.priority || 0);
                });
                
                const topComposite = compositeMatches[0];
                const questData = topComposite.build();
                if (questData) {
                    const quest = this._createDynamicQuestInstance(questData, topComposite.id);
                    if (quest) {
                        generated.push(quest);
                        console.log('[CompositeQuest] Generiert:', topComposite.id, quest.title);
                    }
                }
            }
        }
        
        // === NORMALE PATTERNS (Fallback/Addition) ===
        const validPatterns = this.QUEST_PATTERNS.filter(function(p) {
            return p.condition(ctx);
        });
        
        validPatterns.sort(function(a, b) {
            return (b.priority || 0) - (a.priority || 0);
        });
        
        // Max 2 Quests insgesamt
        const maxDynamic = 2;
        for (var i = 0; i < validPatterns.length && generated.length < maxDynamic; i++) {
            var pattern = validPatterns[i];
            var questData = pattern.build();
            
            if (questData) {
                var quest = this._createDynamicQuestInstance(questData, pattern.id);
                if (quest) {
                    generated.push(quest);
                    console.log('[DynamicQuest] Generiert:', pattern.id, quest.title);
                }
            }
        }
        
        if (generated.length > 0) {
            console.log('[DynamicQuest] Kontext:', ctx.flags, 'Karma:', ctx.karma);
            console.log('[WorldEvolution]:', ctx.worldEvolution);
        }
        
        return generated;
    },
    
    /**
     * Wählt ein Element aus einer gewichteten Liste aus
     * @private
     * @param {Array} weightedList - [{ item, weight }, ...]
     * @returns {Object|null} - Ausgewähltes Item oder null
     */
    _weightedRandomSelect: function(weightedList) {
        if (!weightedList || weightedList.length === 0) return null;
        
        // Berechne Gesamtgewicht
        const totalWeight = weightedList.reduce(function(sum, wp) {
            return sum + (wp.weight || 1);
        }, 0);
        
        // Zufälliger Wert zwischen 0 und totalWeight
        let random = Math.random() * totalWeight;
        
        // Wähle basierend auf Gewicht
        for (let i = 0; i < weightedList.length; i++) {
            random -= weightedList[i].weight;
            if (random <= 0) {
                return weightedList[i].pattern;
            }
        }
        
        // Fallback: letztes Element
        return weightedList[weightedList.length - 1].pattern;
    },
    
    /**
     * Baut den Composite Context aus World State (Phase NEXT+)
     * @private
     * @param {Object} ctx - World Context
     * @returns {Object} - Composite Context
     */
    _buildCompositeContext: function(ctx) {
        return {
            danger: ctx.flags.player_hunted ? 'high' : 'low',
            corruption: ctx.flags.village_corrupt || false,
            faction: ctx.flags.kira_network_member ? 'kira' : 
                     ctx.flags.kira_network_exposed ? 'enemy' : 'neutral',
            karma: ctx.karma || 0,
            hunted: ctx.flags.player_hunted || false,
            villageState: ctx.flags.grenzwald_peace ? 'peace' : 
                          ctx.flags.village_corrupt ? 'corrupt' : 'normal'
        };
    },
    
    /**
     * Aktualisiert die Welt-Evolution basierend auf aktuellem Zustand (Phase NEXT+++)
     * @private
     */
    _updateWorldEvolution: function() {
        if (!this.state.worldEvolution) {
            this.state.worldEvolution = {
                village: 'normal',
                reputation: 'unknown',
                lastUpdate: Date.now()
            };
        }
        
        const evo = this.state.worldEvolution;
        const flags = this.state.worldState.flags;
        const karma = this.state.worldState.karma;
        const completedCount = this.state.completedQuests?.length || 0;
        
        // === DORF-ENTWICKLUNG ===
        if (flags.village_reborn) {
            evo.village = 'reborn';
        } else if (flags.village_recovery_started) {
            evo.village = 'recovering';
        } else if (flags.village_fallen) {
            evo.village = 'fallen';
        } else if (flags.village_corrupt) {
            evo.village = 'corrupt';
        } else {
            evo.village = 'normal';
        }
        
        // === REPUTATION-ENTWICKLUNG ===
        if (karma <= -50) {
            evo.reputation = 'infamous';
        } else if (karma >= 60 && completedCount >= 15) {
            evo.reputation = 'legendary';
        } else if (karma >= 30 && completedCount >= 5) {
            evo.reputation = 'talked_about';
        } else {
            evo.reputation = 'unknown';
        }
        
        evo.lastUpdate = Date.now();
        
        // Debug
        if (this.DEBUG) {
            console.log('[WorldEvolution] Updated:', evo);
        }
    },
    
    /**
     * Holt den aktuellen World Context für Dynamic Quests
     * @private
     * @returns {Object} - { flags, karma, factions }
     */
    _getWorldContext: function() {
        // Aktualisiere Evolution vor dem Abruf
        this._updateWorldEvolution();
        
        return {
            flags: this.state.worldState?.flags || {},
            karma: this.state.worldState?.karma || 0,
            factions: this.state.worldState?.factions || {},
            worldEvolution: this.state.worldEvolution || {}
        };
    },
    
    /**
     * Erstellt eine Quest-Instanz aus Dynamic Pattern
     * @private
     */
    _createDynamicQuestInstance: function(questData, patternId) {
        if (!questData) return null;
        
        return {
            id: 'dynamic_' + patternId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            templateId: patternId,
            title: questData.title,
            description: questData.description,
            type: 'dynamic',
            category: questData.category || 'dynamic',
            status: this.STATES.AVAILABLE,
            difficulty: questData.difficulty || 'medium',
            isDynamic: true,
            
            // Objectives
            objectives: questData.objectives ? questData.objectives.map(function(o) {
                return {
                    id: o.id || 'obj_' + Math.random().toString(36).substr(2, 5),
                    text: o.text || o.id,
                    trigger: o.type || o.trigger || null,
                    type: o.type || null,
                    target: o.target || 1,
                    current: 0,
                    completed: false,
                    context: {
                        location: null,
                        description: null,
                        flavor: null,
                        enemyType: null,
                        itemId: null
                    }
                };
            }) : [],
            
            // Rewards
            rewards: questData.rewards || { xp: 50, silver: 10 },
            
            // Meta
            createdAt: new Date().toISOString(),
            expiresAt: null
        };
    },

    /**
     * Generiert eine Investigation Quest
     * @private
     */
    _generateInvestigationQuest() {
        const templates = QuestRegistryV4.investigation;
        const available = templates.filter(q => !this._isQuestOnCooldown(q.id));
        
        if (available.length === 0) return null;
        
        const template = available[Math.floor(Math.random() * available.length)];
        return this._createQuestInstance(template, this.TYPES.INVESTIGATION);
    },
    
    /**
     * Generiert eine Moral Quest
     * @private
     */
    _generateMoralQuest() {
        const templates = QuestRegistryV4.moral;
        const available = templates.filter(q => !this._isQuestOnCooldown(q.id));
        
        if (available.length === 0) return null;
        
        const template = available[Math.floor(Math.random() * available.length)];
        return this._createQuestInstance(template, this.TYPES.MORAL);
    },
    
    /**
     * Generiert eine Filler Quest
     * @private
     */
    _generateFillerQuest() {
        const templates = [
            ...QuestRegistryV4.daily,
            ...QuestRegistryV4.combat
        ];
        
        const available = templates.filter(q => !this._isQuestOnCooldown(q.id));
        
        if (available.length === 0) return null;
        
        const template = available[Math.floor(Math.random() * available.length)];
        return this._createQuestInstance(template, template.type || this.TYPES.COMBAT);
    },
    
    /**
     * Erstellt eine Quest-Instanz aus Template
     * @private
     */
    _createQuestInstance(template, type) {
        if (!template) return null;
        
        return {
            id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            templateId: template.id,
            title: template.title,
            description: template.description,
            type: type,
            category: template.category || 'standard',
            status: this.STATES.AVAILABLE,
            giver: template.giver || null,
            difficulty: template.difficulty || 'medium',
            estimatedDuration: template.duration || this.CONFIG.MIN_QUEST_DURATION,
            
            // Story & Dialog
            story: template.story || null,
            dialogTree: template.dialogTree || null,
            
            // Objectives
            objectives: template.objectives ? template.objectives.map(o => {
                var ctx = {
                    location: (o.context && o.context.location) || null,
                    description: (o.context && o.context.description) || null,
                    flavor: (o.context && o.context.flavor) || null,
                    enemyType: (o.context && o.context.enemyType) || null,
                    itemId: (o.context && o.context.itemId) || null
                };
                // Auto-Flavor generieren wenn keins vorhanden
                if (!ctx.flavor) {
                    ctx.flavor = this._generateObjectiveFlavor(o);
                }
                return {
                    ...o,
                    completed: false,
                    current: 0,
                    context: ctx
                };
            }) : [],
            
            // Rewards
            rewards: {
                xp: template.rewards?.xp || this.CONFIG.BASE_XP_REWARD,
                gold: template.rewards?.gold || 0,
                silver: template.rewards?.silver || 0,
                copper: template.rewards?.copper || 0,
                karma: template.rewards?.karma || 0,
                reputation: template.rewards?.reputation || {},
                items: template.rewards?.items || [],
                hiddenRewards: template.rewards?.hidden || [],
                unlocks: template.rewards?.unlocks || []
            },
            
            // Requirements
            requirements: {
                level: template.requirements?.level || 1,
                karma: template.requirements?.karma || null,
                trust: template.requirements?.trust || {},
                clan: template.requirements?.clan || null,
                element: template.requirements?.element || null
            },
            
            // Combat
            combat: template.combat || null,
            
            // Decisions (Phase 4)
            decisions: template.decisions || null,
            decisionMade: null,
            
            // Outcomes (Phase 4.2)
            outcomes: template.outcomes || null,
            outcomeResult: null,
            outcomeApplied: false,
            
            // Chain Metadata (Phase 5)
            chainId: template.chainPart ? template.chainPart.chainId : null,
            chainIndex: template.chainPart ? template.chainPart.index : null,
            chainBranch: template.chainPart ? template.chainPart.branch : null,
            chainTotal: template.chainPart ? template.chainPart.total : null,
            
            // Runtime (wird bei Start befüllt)
            runtime: null,
            
            // Alert Level (Phase 8 - Consequence System)
            alertLevel: 0,
            difficultyModifier: 0,
            
            // Timestamps
            generatedAt: new Date().toISOString(),
            acceptedAt: null,
            completedAt: null,
            expiresAt: this._getNextResetTime()
        };
    },
    
    // === QUEST LIFECYCLE (PUBLIC API) ===
    // Offizielle öffentliche Methoden: startQuest, completeQuest, abandonQuest
    // selectQuest/acceptQuest sind Legacy-Delegates auf startQuest
    
    /**
     * @deprecated Verwende startQuest() stattdessen
     * Legacy-Delegate für Backward Compatibility
     */
    selectQuest(questId) {
        return this.startQuest(questId).success;
    },
    
    /**
     * @deprecated Verwende startQuest() stattdessen
     * Legacy-Delegate für Backward Compatibility
     */
    acceptQuest(questId) {
        return this.startQuest(questId).success;
    },
    
    /**
     * Lehnt eine Quest ab (entfernt sie vom Board)
     * @param {string} questId - Die Quest-ID
     */
    declineQuest(questId) {
        // Entferne aus Board oder Selected
        const boardIndex = this.state.questBoard.findIndex(q => q.id === questId);
        if (boardIndex !== -1) {
            this.state.questBoard.splice(boardIndex, 1);
        }
        
        const selectedIndex = this.state.selectedDailyQuests.findIndex(q => q.id === questId);
        if (selectedIndex !== -1) {
            this.state.selectedDailyQuests.splice(selectedIndex, 1);
        }
        
        this.saveState();
        
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest:declined', { questId });
        }
    },
    
    /**
     * Schließt eine Quest ab und gibt Belohnungen
     * @param {string} questId - Die Quest-ID
     * @returns {Object} - Ergebnis mit Belohnungen
     */
    completeQuest(questId) {
        this._log('[QuestEngine] Schließe Quest ab:', questId);
        
        // Finde Quest in activeQuests
        const questIndex = this.state.activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) {
            console.warn('[QuestEngine] Quest nicht in activeQuests gefunden');
            return { success: false, error: 'Quest nicht aktiv' };
        }
        
        const quest = this.state.activeQuests[questIndex];
        
        // Status-Guard: nur ready_for_turn_in ODER alle Objectives erledigt
        const allObjectivesDone = quest.objectives.length === 0 || quest.objectives.every(o => o.completed);
        if (quest.status !== this.STATES.READY_FOR_TURN_IN && !allObjectivesDone) {
            return { success: false, error: 'Quest noch nicht abschlussbereit (offene Objectives)' };
        }
        
        // Status ändern
        quest.status = this.STATES.COMPLETED;
        quest.completedAt = new Date().toISOString();
        
        // Outcome bestimmen (Phase 4.2)
        if (quest.outcomes && quest.decisionMade && !quest.outcomeApplied) {
            var outcome = quest.outcomes.find(function(o) { return o.decisionId === quest.decisionMade; });
            if (outcome) {
                quest.outcomeResult = outcome;
                // Outcome-Rewards überschreiben Quest-Rewards
                if (outcome.rewards) {
                    quest.rewards = Object.assign({}, quest.rewards, outcome.rewards);
                }
                // Outcome-Effekte anwenden
                if (outcome.effects) {
                    if (outcome.effects.karma) {
                        this.state.karma.value += outcome.effects.karma;
                        this.state.karma.history.push({
                            change: outcome.effects.karma,
                            reason: 'Outcome: ' + (outcome.text || quest.title),
                            timestamp: new Date().toISOString()
                        });
                        var character = this._getCurrentCharacter();
                        
                        // FIX 2: Character NULL Guard
                        if (!character) {
                            console.warn('[QuestEngine] Kein Character vorhanden - Karma-Effect übersprungen');
                        } else {
                            character.karma = (character.karma || 0) + outcome.effects.karma;
                        }
                    }
                    if (outcome.effects.reputation) {
                        for (var npc in outcome.effects.reputation) {
                            if (this.state.trust[npc]) {
                                this.state.trust[npc].value = Math.min(
                                    this.state.trust[npc].max,
                                    this.state.trust[npc].value + outcome.effects.reputation[npc]
                                );
                            }
                        }
                    }
                }
                quest.outcomeApplied = true;
            }
        }
        
        // Belohnungen berechnen
        const rewards = this._calculateRewards(quest);
        
        // Belohnungen anwenden
        this._applyRewards(rewards);
        
        // Quest zu completed verschieben
        this.state.completedQuests.push(quest);
        this.state.activeQuests.splice(questIndex, 1);
        
        // Prüfe auf Quest Chain Fortschritt
        this._checkQuestChainProgress(quest);
        
        // Speichern
        this.saveState();
        this._emitQuestUpdate();
        this._emitQuestFeedback('quest_completed', {
            questId: quest.id,
            title: quest.title,
            outcome: quest.outcomeResult ? quest.outcomeResult.text : null,
            rewards: rewards
        });
        
        // Live Sync (BUG 6 & 10 Fix)
        if (typeof LiveSync !== 'undefined') {
            LiveSync.broadcastChange('quest_completed', {
                questId: quest.id,
                questTitle: quest.title,
                rewards: rewards
            });
        }
        
        // === STORY CONTINUATION (Phase NEXT++) ===
        // Speichere letzte Quest für Follow-up Patterns
        this.state.lastCompletedQuest = {
            id: quest.id,
            templateId: quest.templateId,
            title: quest.title,
            category: quest.category,
            isDynamic: quest.isDynamic || false,
            completedAt: quest.completedAt,
            flags: { ...this.state.worldState.flags }
        };
        
        // === ALERT LEVEL FEEDBACK (Phase 8) ===
        if (quest.alertLevel >= 2) {
            this._emitQuestFeedback('story_event', {
                text: 'Du hast Aufmerksamkeit erregt. Das wird Folgen haben...'
            });
        }
        
        // === ALERT LEVEL REWARDS PENALTY (Phase 8.5) ===
        if (quest.alertLevel >= 2) {
            rewards.xp = Math.floor(rewards.xp * 0.7); // 30% weniger XP
            rewards.silver = Math.floor(rewards.silver * 0.7);
            
            this._emitQuestFeedback('story_event', {
                text: '⚠️ Wegen deiner Vorsichtslosigkeit sinken die Belohnungen.'
            });
        }
        
        // === RESET NEGATIVE STATES (Phase 8.5 Audit Fix) ===
        // Hunted-Status entfernen bei erfolgreicher Quest
        if (this.state.worldState.flags['player_hunted']) {
            delete this.state.worldState.flags['player_hunted'];
            this._emitQuestFeedback('story_event', {
                text: '✅ Du hast die Verfolger abgeschüttelt.'
            });
        }
        
        // Karma leicht erhöhen bei gutem Abschluss (ohne hohes Alert)
        if (quest.alertLevel < 2 && this.state.worldState.karma < 0) {
            this.state.worldState.karma = Math.min(100, this.state.worldState.karma + 2);
        }
        
        this._log('[QuestEngine] Quest abgeschlossen:', quest.title, rewards);
        
        // === WORLD STATE PRIORITY RESOLUTION (Phase 9.6) ===
        this._resolveWorldState();
        
        // === WORLD EVENTS (Phase 10.5) ===
        this._processWorldEvents();
        
        return {
            success: true,
            quest,
            rewards
        };
    },
    
    /**
     * Berechnet die Belohnungen für eine Quest
     * @private
     */
    _calculateRewards(quest) {
        const baseRewards = { ...quest.rewards };
        
        // Seasonal Event Bonus
        if (this.state.seasonalEvent) {
            baseRewards.xp = Math.floor(baseRewards.xp * 1.5);
            baseRewards.silver = Math.floor((baseRewards.silver || 0) * 1.3);
        }
        
        // Rare Event Bonus
        if (this.state.rareEvent) {
            baseRewards.xp = Math.floor(baseRewards.xp * 2);
            baseRewards.gold = (baseRewards.gold || 0) + 1;
        }
        
        // === NPC REACTION MODIFIER (Phase 9.5) ===
        if (quest.giver) {
            const mod = this._getReactionModifier(quest.giver);
            baseRewards.xp = Math.floor(baseRewards.xp * mod.reward);
            baseRewards.silver = Math.floor((baseRewards.silver || 0) * mod.reward);
            baseRewards.gold = Math.floor((baseRewards.gold || 0) * mod.reward);
            
            // === SAFETY CLAMP (Phase 9.6) ===
            // Minimum Rewards garantieren
            baseRewards.xp = Math.max(1, baseRewards.xp);
            baseRewards.silver = Math.max(0, baseRewards.silver);
            baseRewards.gold = Math.max(0, baseRewards.gold);
            
            // Feedback für extreme Reaktionen
            const reaction = this.getNpcReaction(quest.giver);
            if (reaction === 'friendly') {
                this._emitQuestFeedback('story_event', {
                    text: `${quest.giver.name} gibt dir extra Belohnungen!`
                });
            } else if (reaction === 'hostile') {
                this._emitQuestFeedback('story_event', {
                    text: `${quest.giver.name} zahlt dir nur das Minimum...`
                });
            }
        }
        
        return baseRewards;
    },
    
    /**
     * Wendet World-State-Effects an (Karma, Factions, Flags)
     * @private
     */
    _applyWorldEffects(effects) {
        if (!effects) return;
        
        // KARMA
        if (typeof effects.karma === 'number') {
            this.state.worldState.karma += effects.karma;
            // Clamp auf [-100, 100]
            this.state.worldState.karma = Math.max(-100, Math.min(100, this.state.worldState.karma));
        }
        
        // FACTIONS
        if (effects.reputation || effects.factions) {
            const factionChanges = effects.reputation || effects.factions;
            Object.entries(factionChanges).forEach(([faction, value]) => {
                if (!this.state.worldState.factions[faction]) {
                    this.state.worldState.factions[faction] = 0;
                }
                this.state.worldState.factions[faction] += value;
                // Clamp auf [-100, 100]
                this.state.worldState.factions[faction] = Math.max(-100, Math.min(100, this.state.worldState.factions[faction]));
            });
        }
        
        // FLAGS (Weltzustände)
        if (effects.flags) {
            Object.entries(effects.flags).forEach(([key, value]) => {
                this.state.worldState.flags[key] = value;
            });
        }
        
        // Legacy: NPC Trust (für Kompatibilität)
        if (effects.reputation) {
            Object.entries(effects.reputation).forEach(([npc, value]) => {
                if (this.state.trust[npc]) {
                    this.state.trust[npc].value = Math.min(
                        this.state.trust[npc].max,
                        this.state.trust[npc].value + value
                    );
                }
            });
        }
    },
    
    /**
     * Wendet Belohnungen auf den Charakter an
     * @private
     */
    _applyRewards(rewards) {
        const character = this._getCurrentCharacter();
        if (!character) return;
        
        // XP
        if (rewards.xp) {
            character.xp = (character.xp || 0) + rewards.xp;
        }
        
        // Währung
        if (!character.money) {
            character.money = { gold: 0, silver: 0, copper: 0 };
        }
        if (rewards.gold) character.money.gold += rewards.gold;
        if (rewards.silver) character.money.silver += rewards.silver;
        if (rewards.copper) character.money.copper += rewards.copper;
        
        // Karma (Legacy - auch in worldState)
        if (rewards.karma) {
            this.state.karma.value += rewards.karma;
            this.state.karma.history.push({
                change: rewards.karma,
                reason: 'Quest Belohnung',
                timestamp: new Date().toISOString()
            });
            // Auch in worldState
            this.state.worldState.karma += rewards.karma;
            this.state.worldState.karma = Math.max(-100, Math.min(100, this.state.worldState.karma));
        }
        
        // Reputation (Legacy + World State)
        if (rewards.reputation) {
            for (const [npc, value] of Object.entries(rewards.reputation)) {
                // Legacy Trust System
                if (this.state.trust[npc]) {
                    this.state.trust[npc].value = Math.min(
                        this.state.trust[npc].max,
                        this.state.trust[npc].value + value
                    );
                }
                // World State Factions
                if (this.state.worldState.factions[npc] !== undefined) {
                    this.state.worldState.factions[npc] += value;
                    this.state.worldState.factions[npc] = Math.max(-100, Math.min(100, this.state.worldState.factions[npc]));
                }
            }
        }
        
        // Items
        if (rewards.items && rewards.items.length > 0) {
            if (!character.inventory) character.inventory = [];
            rewards.items.forEach(item => {
                character.inventory.push({
                    ...item,
                    acquiredAt: new Date().toISOString()
                });
            });
        }
        
        // Charakter speichern
        if (typeof AccountSystem !== 'undefined') {
            AccountSystem.saveCharacter(character);
        } else if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter(character);
        }
    },
    
    /**
     * Prüft ob eine abgeschlossene Quest eine Quest Chain voranbringt
     * @private
     */
    _checkQuestChainProgress(quest) {
        if (!quest.chainId) return;
        if (!Array.isArray(this.state.activeQuestChains)) return;
        
        const chainInstance = this.state.activeQuestChains.find(c => c.id === quest.chainId);
        if (!chainInstance) return;
        
        const chainDef = this.QUEST_CHAINS[quest.chainId];
        if (!chainDef) return;
        
        // Prüfe ob diese Quest die aktuelle in der Chain ist
        const currentQuestDef = chainDef.quests.find(q => q.index === quest.chainIndex);
        if (!currentQuestDef || currentQuestDef.templateId !== quest.templateId) return;
        
        // Chain fortsetzen
        this.advanceQuestChain(quest.chainId);
    },
    
    // === REQUIREMENTS CHECK ===
    
    /**
     * Prüft ob Requirements erfüllt sind
     * @private
     */
    _checkRequirements(quest) {
        const character = this._getCurrentCharacter();
        
        // Kein Character = DM-Bypass oder kein Requirement-Check nötig
        if (!character) {
            console.warn('[QuestEngine] _checkRequirements: Kein Character geladen');
            return false;
        }
        
        const req = quest.requirements;
        
        // Keine Requirements definiert = immer erfüllt
        if (!req) return true;
        
        // DM Bypass
        if (this._isDM && this._isDM()) return true;
        
        // Level (nur prüfen wenn explizit > 1 gefordert)
        if (req.level && req.level > 1) {
            if ((character.level || 1) < req.level) {
                this._log('[QuestEngine] Level Requirement failed:', req.level, 'benötigt, haben:', character.level || 1);
                return false;
            }
        }
        
        // Karma (nur wenn min/max Object)
        if (req.karma !== null && req.karma !== undefined && typeof req.karma === 'object') {
            if (req.karma.min !== undefined && this.state.karma.value < req.karma.min) {
                this._log('[QuestEngine] Karma min Requirement failed');
                return false;
            }
            if (req.karma.max !== undefined && this.state.karma.value > req.karma.max) {
                this._log('[QuestEngine] Karma max Requirement failed');
                return false;
            }
        }
        
        // Trust (nur wenn nicht-leeres Object)
        if (req.trust && Object.keys(req.trust).length > 0) {
            for (const [npc, minTrust] of Object.entries(req.trust)) {
                if ((this.state.trust[npc]?.value || 0) < minTrust) {
                    this._log('[QuestEngine] Trust Requirement failed:', npc, minTrust);
                    return false;
                }
            }
        }
        
        // Clan (nur wenn explizit gesetzt)
        if (req.clan && character.clan !== req.clan) {
            this._log('[QuestEngine] Clan Requirement failed:', req.clan);
            return false;
        }
        
        // Element (nur wenn explizit gesetzt)
        if (req.element && !(character.elements || []).includes(req.element)) {
            this._log('[QuestEngine] Element Requirement failed:', req.element);
            return false;
        }
        
        // === WORLD STATE REQUIREMENTS (Phase 6) ===
        
        // FACTION Reputation
        if (req.faction) {
            const factionName = typeof req.faction === 'string' ? req.faction : req.faction.name;
            const factionReq = typeof req.faction === 'object' ? req.faction : { min: 0 };
            const rep = this.state.worldState.factions[factionName] || 0;
            
            if (factionReq.min !== undefined && rep < factionReq.min) {
                this._log('[QuestEngine] Faction Requirement failed:', factionName, 'min:', factionReq.min, 'have:', rep);
                return false;
            }
            if (factionReq.max !== undefined && rep > factionReq.max) {
                this._log('[QuestEngine] Faction Requirement failed:', factionName, 'max:', factionReq.max, 'have:', rep);
                return false;
            }
        }
        
        // WORLD STATE KARMA
        if (req.worldKarma !== undefined) {
            if (this.state.worldState.karma < req.worldKarma) {
                this._log('[QuestEngine] World Karma Requirement failed:', req.worldKarma);
                return false;
            }
        }
        
        // FLAGS (Weltzustände)
        if (req.flags) {
            for (let key in req.flags) {
                if (this.state.worldState.flags[key] !== req.flags[key]) {
                    this._log('[QuestEngine] Flag Requirement failed:', key, 'expected:', req.flags[key], 'have:', this.state.worldState.flags[key]);
                    return false;
                }
            }
        }
        
        // === WORLD STATE LOCKS (Phase 8.5) ===
        
        // Karma-Lock für "gute" Quests
        if (req.goodOnly && this.state.worldState.karma < -20) {
            this._log('[QuestEngine] GoodOnly Requirement failed: Karma too low');
            return false;
        }
        
        // Evil-Lock für "böse" Quests
        if (req.evilOnly && this.state.worldState.karma > 20) {
            this._log('[QuestEngine] EvilOnly Requirement failed: Karma too high');
            return false;
        }
        
        // Hunted-Lock: Quests die verfolgte Spieler ablehnen
        if (req.notHunted && this.state.worldState.flags['player_hunted']) {
            this._log('[QuestEngine] NotHunted Requirement failed: Player is hunted');
            return false;
        }
        
        return true;
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Prüft ob ein Quest auf Cooldown ist
     * @private
     */
    _isQuestOnCooldown(templateId) {
        const cooldown = this.state.questCooldowns[templateId];
        if (!cooldown) return false;
        
        return new Date() < new Date(cooldown);
    },
    
    /**
     * Gibt die Zeit des nächsten Resets zurück
     * @private
     */
    _getNextResetTime() {
        const now = new Date();
        const nextReset = new Date(now);
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
        return nextReset.toISOString();
    },
    
    /**
     * Weighted Random Auswahl aus einem Pool
     * @param {Array} pool - Pool mit optionalem weight-Feld
     * @returns {Object|null}
     */
    _getWeightedRandomQuest(pool) {
        // === DEFENSIVE CODE ===
        if (!Array.isArray(pool) || pool.length === 0) return null;
        
        var totalWeight = 0;
        for (var i = 0; i < pool.length; i++) {
            totalWeight += (pool[i].weight || 1);
        }
        
        var rand = Math.random() * totalWeight;
        
        for (var j = 0; j < pool.length; j++) {
            rand -= (pool[j].weight || 1);
            if (rand <= 0) return pool[j];
        }
        
        return pool[0];
    },
    
    /**
     * Gibt IDs aller aktuell verwendeten Quest-Templates zurück
     * @returns {Set}
     */
    _getUsedQuestIds() {
        var used = new Set();
        
        var arrays = [this.state.questBoard, this.state.activeQuests, this.state.completedQuests];
        for (var i = 0; i < arrays.length; i++) {
            if (!arrays[i]) continue;
            for (var j = 0; j < arrays[i].length; j++) {
                if (arrays[i][j].templateId) used.add(arrays[i][j].templateId);
            }
        }
        
        return used;
    },
    
    /**
     * Filtert Pool um bereits verwendete Quests und Cooldowns
     * @param {Array} pool
     * @returns {Array}
     */
    _filterAvailablePool(pool) {
        // === DEFENSIVE CODE ===
        if (!Array.isArray(pool)) return [];
        
        var used = this._getUsedQuestIds();
        var filtered = pool.filter(function(q) { return !used.has(q.id); });
        
        // FIX 1: Pool erschöpft → completedQuests reset
        if (filtered.length === 0 && pool.length > 0) {
            this._log('[QuestEngine] Pool erschöpft — reset completedQuests');
            this.state.completedQuests = [];
            return pool;
        }
        
        return filtered;
    },
    
    /**
     * Generiert Flavor-Text für ein Objective
     * @private
     */
    _generateObjectiveFlavor(obj) {
        var type = obj.trigger || obj.type || '';
        var location = (obj.context && obj.context.location) || obj.target || '';
        
        var flavors = {
            exploration: [
                'Du erkundest vorsichtig das Gebiet...',
                'Die Umgebung ist unbekannt. Bleib wachsam.',
                'Deine Schritte führen dich ins Unbekannte.'
            ],
            travel: [
                'Du machst dich auf den Weg...',
                'Der Pfad liegt vor dir. Zeit aufzubrechen.',
                'Die Reise beginnt.'
            ],
            discover: [
                'Du hältst Ausschau nach Hinweisen...',
                'Irgendwo hier muss es sein.',
                'Deine Sinne sind geschärft.'
            ],
            investigate: [
                'Du untersuchst die Umgebung genau...',
                'Hier stimmt etwas nicht. Du schaust genauer hin.',
                'Spuren. Du folgst ihnen.'
            ],
            combat: [
                'Ein Kampf steht bevor. Bereite dich vor!',
                'Feinde in der Nähe. Waffen bereit.',
                'Die Luft ist angespannt...'
            ],
            combat_won: [
                'Ein Kampf beginnt! Zeig was du kannst.',
                'Du stellst dich dem Gegner.',
                'Stahl trifft auf Stahl.'
            ],
            item_collected: [
                'Du suchst aufmerksam nach dem Gegenstand...',
                'Es muss hier irgendwo sein.',
                'Deine Augen scannen die Umgebung.'
            ],
            collect: [
                'Du sammelst was du finden kannst...',
                'Halte die Augen offen.',
                'Jeder Winkel könnte etwas verbergen.'
            ],
            merchant_trade: [
                'Du verhandelst geschickt...',
                'Der Händler mustert dich.',
                'Gold wechselt den Besitzer.'
            ],
            trade: [
                'Ein Geschäft bahnt sich an...',
                'Du prüfst die Ware sorgfältig.',
                'Verhandlungsgeschick ist gefragt.'
            ],
            training_completed: [
                'Du trainierst hart...',
                'Schweiß tropft. Du wirst stärker.',
                'Wiederholung bringt Meisterschaft.'
            ]
        };
        
        var pool = flavors[type] || ['Du gehst deinem Ziel nach...'];
        var text = pool[Math.floor(Math.random() * pool.length)];
        
        // Location einfügen wenn vorhanden
        if (location && type !== 'training_completed') {
            text = '📍 ' + location + ' — ' + text;
        }
        
        return text;
    },
    
    /**
     * Mischt ein Array
     * @private
     */
    _shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
            const userData = localStorage.getItem('npu_current_user');
            if (userData) return JSON.parse(userData);
        } catch (e) {
            console.error('[QuestEngine] Fehler beim Lesen des Users:', e);
        }
        
        return null;
    },
    
    /**
     * Gibt den aktuellen Character zurück
     * @private
     */
    _getCurrentCharacter() {
        // Primär: StateManager
        if (typeof StateManager !== 'undefined' && StateManager.getCharacter) {
            const char = StateManager.getCharacter();
            if (char) return char;
        }
        // Fallback 1: window.currentCharacter (gesetzt von app.js)
        if (window.currentCharacter) {
            // Optional: In StateManager setzen für Konsistenz
            if (typeof StateManager !== 'undefined' && StateManager.setCharacter) {
                StateManager.setCharacter(window.currentCharacter);
            }
            return window.currentCharacter;
        }
        // Fallback 2: localStorage
        try {
            const saved = localStorage.getItem('npu_current_character');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('[QuestEngine] Fehler beim Laden aus localStorage:', e);
        }
        return null;
    },
    
    /**
     * Löst Konflikte im World State basierend auf Rule Engine (Phase 9.7)
     * Datengetrieben statt hardcoded
     * @private
     */
    _resolveWorldState() {
        const flags = this.state.worldState?.flags;
        if (!flags) return;
        
        let resolved = false;
        
        // Iteriere über alle Regeln
        this.WORLD_STATE_RULES.forEach(rule => {
            // Finde alle aktiven Flags dieser Regel
            const activeFlags = rule.flags.filter(flag => flags[flag]);
            
            // Wenn mehr als eines aktiv ist → Konflikt!
            if (activeFlags.length > 1) {
                // Sortiere nach Priorität (höchste zuerst)
                activeFlags.sort((a, b) => {
                    const priorityA = rule.priority[a] || 0;
                    const priorityB = rule.priority[b] || 0;
                    return priorityB - priorityA;
                });
                
                // Behalte nur das stärkste, lösche den Rest
                for (let i = 1; i < activeFlags.length; i++) {
                    const removedFlag = activeFlags[i];
                    delete flags[removedFlag];
                    
                    console.log(`[WorldState] Rule "${rule.id}": ${activeFlags[0]} > ${removedFlag}`);
                    resolved = true;
                }
            }
        });
        
        if (resolved) {
            this.saveState();
            console.log('[WorldState] Final Flags:', Object.keys(flags));
        }
    },
    
    /**
     * Verarbeitet World Events basierend auf aktuellem State (Phase 10.5)
     * Mit Priorisierung und Begrenzung pro Tick
     * @private
     */
    _processWorldEvents() {
        if (!this.state.worldState) return;
        
        const now = Date.now();
        
        // Initialisiere Event-Timestamps und History wenn nötig
        if (!this._worldEventTimestamps) {
            this._worldEventTimestamps = {};
        }
        if (!this.state.worldState.lastEvents) {
            this.state.worldState.lastEvents = [];
        }
        
        // Sammle alle validen Events
        const validEvents = this.WORLD_EVENTS.filter(event => {
            const lastTrigger = this._worldEventTimestamps[event.id] || 0;
            const timeSince = now - lastTrigger;
            
            // Prüfe Cooldown UND Condition
            return timeSince >= event.cooldown && event.condition(this.state.worldState);
        });
        
        if (validEvents.length === 0) return;
        
        // Nach Priorität sortieren (höchste zuerst)
        validEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        // Begrenze auf MAX_EVENTS_PER_TICK
        const eventsToTrigger = validEvents.slice(0, this.MAX_EVENTS_PER_TICK);
        
        // Führe Events aus
        eventsToTrigger.forEach(event => {
            event.effect(this);
            
            // Speichere Timestamp
            this._worldEventTimestamps[event.id] = now;
            
            // Zur History hinzufügen
            this.state.worldState.lastEvents.unshift({
                id: event.id,
                cause: event.cause,
                timestamp: now
            });
            
            // History auf max 10 Einträge begrenzen
            if (this.state.worldState.lastEvents.length > 10) {
                this.state.worldState.lastEvents = this.state.worldState.lastEvents.slice(0, 10);
            }
            
            console.log(`[WorldEvent] "${event.id}" ausgelöst (Prio: ${event.priority || 0})`);
        });
        
        // Globales Event Feedback wenn etwas passiert ist
        if (eventsToTrigger.length > 0) {
            // Nur bei hoher Priorität (>=3) das dramatische Feedback zeigen
            const hasHighPriorityEvent = eventsToTrigger.some(e => (e.priority || 0) >= 3);
            
            if (hasHighPriorityEvent) {
                this._emitQuestFeedback('world_reacts', {
                    text: '🌍 Die Welt reagiert auf deine Taten...',
                    subtext: 'Etwas Bedeutsames hat sich verändert'
                });
            } else {
                this._emitQuestFeedback('story_event', {
                    text: '🌍 Die Welt verändert sich...'
                });
            }
        }
        
        this.saveState();
    },
    
    /**
     * Prüft ob aktueller User DM ist
     * @private
     */
    _isDM() {
        if (typeof AccountSystem !== 'undefined' && AccountSystem.isDM) {
            return AccountSystem.isDM();
        }
        try {
            const user = JSON.parse(localStorage.getItem('npu_current_user') || '{}');
            return user.role === 'dm';
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Ermittelt die Reaktion eines NPCs auf den Spieler (Phase 9)
     * @param {Object} npc - NPC Objekt mit faction, name etc.
     * @returns {string} - 'hostile', 'neutral', 'friendly'
     */
    getNpcReaction(npc) {
        if (!npc) return 'neutral';
        
        const karma = this.state.worldState?.karma || 0;
        const factionName = npc.faction || npc.id;
        const faction = this.state.worldState?.factions?.[factionName] || 0;
        
        // Hostile: Karma sehr niedrig ODER Faction sehr niedrig
        if (karma < -20 || faction < -15) {
            return 'hostile';
        }
        
        // Friendly: Karma sehr hoch ODER Faction sehr hoch
        if (karma > 20 || faction > 15) {
            return 'friendly';
        }
        
        // Neutral: Alles dazwischen
        return 'neutral';
    },
    
    /**
     * Generiert NPC-Dialog basierend auf letzter wichtiger Entscheidung (Phase 13)
     * @param {Object} npc - NPC Objekt
     * @returns {string|null} - Dialog-String oder null
     */
    getNpcMemoryDialog(npc) {
        const lastDecision = this.state.worldState?.lastImportantDecision;
        if (!lastDecision) return null;
        
        const timeSince = Date.now() - lastDecision.timestamp;
        const minutesSince = Math.floor(timeSince / 60000);
        
        // Nur wenn die Entscheidung noch "frisch" ist (letzte 30 Min)
        if (minutesSince > 30) return null;
        
        // Spezifische Dialoge für bekannte Entscheidungen
        const memoryDialogs = {
            'expose_truth': {
                village: `Seit dem Vorfall in ${lastDecision.questTitle} hat sich alles verändert...`,
                default: 'Die Wahrheit tut manchmal mehr weh als sie nützt...'
            },
            'protect_village': {
                village: 'Danke, dass du das Dorf geschützt hast. Wir vergessen das nicht.',
                default: 'Man erzählt sich, dass du ein gutes Herz hast.'
            },
            'join_kira': {
                kira: 'Willkommen im Netzwerk. Du hast die richtige Wahl getroffen.',
                default: 'Man sieht dir an, dass du... andere Verbindungen hast.'
            },
            'expose_kira': {
                kira: 'Verräter. Wir vergessen nicht.',
                default: 'Du hast mächtige Feinde gemacht...'
            }
        };
        
        const dialogs = memoryDialogs[lastDecision.id];
        if (!dialogs) return null;
        
        // NPC-Faction prüfen
        const npcFaction = npc.faction || npc.id;
        return dialogs[npcFaction] || dialogs.default;
    },
    
    /**
     * Ermittelt die Reaktions-Modifikatoren für Preise, Difficulty, Rewards (Phase 9.5)
     * @param {Object} npc - NPC Objekt
     * @returns {Object} - { price, difficulty, reward }
     */
    _getReactionModifier(npc) {
        const reaction = this.getNpcReaction(npc);
        
        // === SAFETY CLAMP SYSTEM (Phase 9.6) ===
        // Multiplier werden begrenzt, um unendliche Eskalation zu verhindern
        
        let price = 1.0;
        let difficulty = 1.0;
        let reward = 1.0;
        
        if (reaction === 'friendly') {
            price = 0.8;
            difficulty = 0.9;
            reward = 1.2;
        } else if (reaction === 'hostile') {
            price = 1.5;
            difficulty = 1.3;
            reward = 0.8;
        }
        
        // Clamp auf sichere Grenzen
        return {
            price: Math.max(0.5, Math.min(2.0, price)),      // 0.5x - 2.0x
            difficulty: Math.max(0.7, Math.min(1.5, difficulty)), // 0.7x - 1.5x
            reward: Math.max(0.5, Math.min(1.5, reward))      // 0.5x - 1.5x
        };
    },
    
    /**
     * Generiert Dialog-Text basierend auf NPC Reaktion (Phase 9)
     * @param {Object} npc - NPC Objekt
     * @param {string} context - 'greeting', 'quest', 'shop', 'farewell'
     * @returns {string}
     */
    getNpcDialog(npc, context = 'greeting') {
        const reaction = this.getNpcReaction(npc);
        const name = npc.name || 'Unbekannter';
        
        const dialogs = {
            hostile: {
                greeting: [
                    `${name} mustert dich misstrauisch. "Was willst du hier?"`,
                    `"Du bist hier nicht willkommen."`,
                    `${name} wendet sich ab und ignoriert dich.`
                ],
                quest: [
                    `"Ich habe nichts für dich. Verschwinde."`,
                    `${name} schnaubt verächtlich. "Eine Quest? Für dich?"`,
                    `"Mit deinem Ruf? Vergiss es."`
                ],
                shop: [
                    `"Die Preise sind heute besonders hoch... für dich."`,
                    `${name} grinst böse. "150% des üblichen Preises."`,
                    `"Kauf oder geh. Aber zahl gut."`
                ],
                farewell: [
                    `"Und komm nicht wieder."`,
                    `${name} macht eine abweisende Geste.`,
                    `"Verschwinde."`
                ]
            },
            neutral: {
                greeting: [
                    `"Guten Tag. Was führt dich her?"`,
                    `${name} nickt dir zu.`,
                    `"Hallo. Brauchst du etwas?"`
                ],
                quest: [
                    `"Ich habe eine Aufgabe, wenn du interessiert bist."`,
                    `${name} überlegt kurz. "Etwas Arbeit gibt es schon."`,
                    `"Kannst du mir helfen?"`
                ],
                shop: [
                    `"Willkommen. Sieh dich um."`,
                    `"Faire Preise für faire Kunden."`,
                    `${name} zeigt auf die Ware.`
                ],
                farewell: [
                    `"Bis bald."`,
                    `"Auf Wiedersehen."`,
                    `${name} winkt dir zu.`
                ]
            },
            friendly: {
                greeting: [
                    `"${name} strahlt dich an. "Mein Freund! Schön dich zu sehen!"`,
                    `"Willkommen! Ich habe auf dich gewartet."`,
                    `${name} umarmt dich herzlich.`
                ],
                quest: [
                    `"Für dich habe ich etwas Besonderes!"`,
                    `${name} vertraut dir ein wichtiges Anliegen an.`,
                    `"Nur du kannst mir helfen, mein Freund."`
                ],
                shop: [
                    `"Für dich: Sonderpreis! Nur 80% des üblichen Preises."`,
                    `"Nimm, was du brauchst. Freunde zahlen weniger."`,
                    `${name} packt dir Extra-Ware ein.`
                ],
                farewell: [
                    `"Komm bald wieder, Freund!"`,
                    `${name} drückt dir die Hand. "Pass auf dich auf."`,
                    `"Bis zum nächsten Mal, Kamerad!"`
                ]
            }
        };
        
        const options = dialogs[reaction]?.[context] || ["..."];
        return options[Math.floor(Math.random() * options.length)];
    },
    
    // === SPEICHERUNG ===
    
    /**
     * Speichert den State
     */
    saveState() {
        // State-Konsistenz sicherstellen
        this._validateStateConsistency();
        
        const currentUser = this._getCurrentUser();
        if (!currentUser) {
            if (this.DEBUG) console.warn('[QuestEngine] Kein User eingeloggt');
            return;
        }
        
        const storageKey = `npu_quest_engine_v4_${currentUser.id}`;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error('[QuestEngine] Fehler beim Speichern:', e);
        }
    },
    
    /**
     * Validiert State-Konsistenz (keine Quest in mehreren Arrays)
     * @private
     */
    _validateStateConsistency() {
        const seen = new Set();
        const arrays = ['questBoard', 'activeQuests', 'completedQuests'];
        
        for (const arrayName of arrays) {
            const arr = this.state[arrayName];
            if (!Array.isArray(arr)) continue;
            
            for (let i = arr.length - 1; i >= 0; i--) {
                const quest = arr[i];
                if (!quest || !quest.id) {
                    arr.splice(i, 1);
                    continue;
                }
                
                if (seen.has(quest.id)) {
                    // Duplikat entfernen
                    if (this.DEBUG) console.warn('[QuestEngine] Duplikat entfernt:', quest.id, 'aus', arrayName);
                    arr.splice(i, 1);
                } else {
                    seen.add(quest.id);
                }
                
                // Status-Konsistenz erzwingen
                if (!quest.status) {
                    if (arrayName === 'questBoard') quest.status = this.STATES.AVAILABLE;
                    else if (arrayName === 'activeQuests') quest.status = this.STATES.ACTIVE;
                    else if (arrayName === 'completedQuests') quest.status = this.STATES.COMPLETED;
                }
            }
        }
        
        // selectedDailyQuests bereinigen (Legacy-Array, sollte leer sein)
        if (this.state.selectedDailyQuests && this.state.selectedDailyQuests.length > 0) {
            // Verschiebe verwaiste selected Quests zurück aufs Board
            for (const quest of this.state.selectedDailyQuests) {
                if (!seen.has(quest.id)) {
                    quest.status = this.STATES.AVAILABLE;
                    this.state.questBoard.push(quest);
                }
            }
            this.state.selectedDailyQuests = [];
        }
    },
    
    /**
     * Lädt den State
     */
    loadState() {
        const currentUser = this._getCurrentUser();
        if (!currentUser) return;
        
        const storageKey = `npu_quest_engine_v4_${currentUser.id}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                
                // === LOADSTATE HARDEN ===
                // === HARTE STATE VALIDIERUNG ===
                if (!this.state) this.state = {};
                
                // Arrays sicherstellen (mit Array.isArray Check)
                this.state.questBoard = Array.isArray(this.state.questBoard) ? this.state.questBoard : [];
                this.state.selectedDailyQuests = Array.isArray(this.state.selectedDailyQuests) ? this.state.selectedDailyQuests : [];
                this.state.activeQuests = Array.isArray(this.state.activeQuests) ? this.state.activeQuests : [];
                this.state.completedQuests = Array.isArray(this.state.completedQuests) ? this.state.completedQuests : [];
                this.state.activeQuestChains = Array.isArray(this.state.activeQuestChains) ? this.state.activeQuestChains : [];
                this.state.completedQuestChains = Array.isArray(this.state.completedQuestChains) ? this.state.completedQuestChains : [];
                
                // Objects sicherstellen
                this.state.chainDecisionImpacts = this.state.chainDecisionImpacts || {};
                this.state.questCooldowns = this.state.questCooldowns || {};
                this.state.karma = this.state.karma || { value: 0, history: [] };
                
                // World State sicherstellen
                this.state.worldState = this.state.worldState || {
                    karma: 0,
                    factions: {},
                    flags: {}
                };
                this.state.worldState.factions = this.state.worldState.factions || {};
                this.state.worldState.flags = this.state.worldState.flags || {};
                
            } catch (e) {
                console.error('[QuestEngine] Fehler beim Laden:', e);
            }
        }
    },
    
    // === EVENTS ===
    
    /**
     * Prüft auf aktive Seasonal Events
     */
    checkSeasonalEvents() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentDay = now.getDate();
        
        for (const [key, event] of Object.entries(this.SEASONAL_EVENTS)) {
            // Prüfe ob Event aktiv sein sollte
            if (event.month === currentMonth) {
                const startDay = event.day;
                const endDay = event.day + event.duration;
                
                if (currentDay >= startDay && currentDay <= endDay) {
                    // Event ist aktiv
                    if (!this.state.seasonalEvent || this.state.seasonalEvent.id !== event.id) {
                        this.state.seasonalEvent = {
                            ...event,
                            active: true,
                            startedAt: new Date().toISOString()
                        };
                        
                        console.log(`[QuestEngine] Seasonal Event gestartet: ${event.name}`);
                        
                        // Event auslösen
                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('quest:seasonal_started', this.state.seasonalEvent);
                        }
                    }
                    return;
                }
            }
        }
        
        // Kein Event aktiv
        if (this.state.seasonalEvent) {
            console.log(`[QuestEngine] Seasonal Event beendet: ${this.state.seasonalEvent.name}`);
            this.state.seasonalEvent = null;
        }
    },
    
    /**
     * Prüft auf Rare World Events
     */
    checkRareEvents() {
        // Prüfe ob bereits ein Rare Event aktiv ist
        if (this.state.rareEvent) {
            const event = this.RARE_EVENTS[this.state.rareEvent.id];
            const startedAt = new Date(this.state.rareEvent.startedAt);
            const now = new Date();
            const daysActive = (now - startedAt) / (1000 * 60 * 60 * 24);
            
            // Event beenden wenn Dauer abgelaufen
            if (daysActive >= event.duration) {
                console.log(`[QuestEngine] Rare Event beendet: ${event.name}`);
                this.state.rareEvent = null;
            } else {
                return; // Event noch aktiv
            }
        }
        
        // Versuche neues Rare Event zu starten
        for (const [key, event] of Object.entries(this.RARE_EVENTS)) {
            if (Math.random() < event.probability) {
                this.state.rareEvent = {
                    id: key,
                    ...event,
                    active: true,
                    startedAt: new Date().toISOString()
                };
                
                console.log(`[QuestEngine] RARE EVENT gestartet: ${event.name}`);
                
                // Event auslösen
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('quest:rare_event', this.state.rareEvent);
                }
                
                return;
            }
        }
    },
    
    // === PUBLIC READ API (UI Contract) ===
    // UI darf NUR über diese Methoden lesen, NIE direkt auf state zugreifen
    
    /**
     * Gibt alle verfügbaren Quests zurück (Kopie)
     * @returns {Array}
     */
    getAvailableQuests() {
        return [...this.state.questBoard];
    },
    
    /**
     * Gibt alle aktiven Quests zurück (Kopie)
     * @returns {Array}
     */
    getActiveQuests() {
        return [...this.state.activeQuests];
    },
    
    /**
     * Gibt heute abgeschlossene Quests zurück (Kopie)
     * @returns {Array}
     */
    getCompletedQuests() {
        return [...this.state.completedQuests];
    },
    
    /**
     * Gibt die Training Quest zurück (Kopie oder null)
     * @returns {Object|null}
     */
    getTrainingQuest() {
        return this.state.trainingQuest ? { ...this.state.trainingQuest } : null;
    },
    
    /**
     * Gibt eine Quest anhand der ID zurück (sucht überall)
     * @param {string} questId
     * @returns {Object|null}
     */
    getQuest(questId) {
        return this.state.questBoard.find(q => q.id === questId) ||
               this.state.selectedDailyQuests.find(q => q.id === questId) ||
               this.state.activeQuests.find(q => q.id === questId) ||
               this.state.completedQuests.find(q => q.id === questId) ||
               null;
    },
    
    /**
     * Gibt zusammenfassende Statistiken zurück
     * @returns {Object}
     */
    getStats() {
        return {
            boardCount: this.state.questBoard.length,
            activeCount: this.state.activeQuests.length,
            completedCount: this.state.completedQuests.length,
            maxActive: this.CONFIG.MAX_SELECTABLE_QUESTS,
            karma: this.state.karma.value,
            nextReset: this.state.nextReset
        };
    },
    
    /**
     * Simuliert ein Game-Event (für UI-Aktionen / textbasiertes Gameplay)
     * @param {string} eventType - z.B. 'training_completed', 'exploration', 'combat_won'
     * @param {Object} data - Optionale Event-Daten
     * @returns {Array} - Ergebnisse der Progress-Updates
     */
    simulateEvent(eventType, data) {
        // FLOW TRACE
        console.log('[FLOW] simulateEvent', eventType, data);
        
        if (!data) data = {};
        
        // Guard: Keine aktiven Quests → abbrechen
        if (!this.state.activeQuests || this.state.activeQuests.length === 0) {
            console.warn('[FLOW] simulateEvent BLOCKED: Keine aktiven Quests');
            return [];
        }
        
        console.log('[FLOW] simulateEvent', this.state.activeQuests.length, 'aktive Quests');
        
        // === SPAM CLICK PROTECTION (Phase 8.5 Audit Fix) ===
        var now = Date.now();
        if (!this._lastEventTime) this._lastEventTime = {};
        if (!this._lastEventTime[eventType]) this._lastEventTime[eventType] = 0;
        
        var timeSinceLast = now - this._lastEventTime[eventType];
        if (timeSinceLast < 500) { // 500ms Cooldown
            console.warn('[QuestEngine] Spam Click blockiert:', eventType);
            this._emitQuestFeedback('story_event', {
                text: '⏳ Atme kurz durch, bevor du weiter machst...'
            });
            return [];
        }
        this._lastEventTime[eventType] = now;
        
        // === ACTION RESOLUTION ===
        var resolvedEvent = eventType;
        var progressBonus = data.progressBonus || 1;
        var riskLevel = data.risk || 'normal';
        
        // Exploration Actions
        if (eventType === 'exploration_fast') {
            resolvedEvent = 'exploration';
            riskLevel = 'high';
            progressBonus = 2; // Mehr Fortschritt, aber riskant
        } else if (eventType === 'exploration_safe') {
            resolvedEvent = 'exploration';
            riskLevel = 'low';
            progressBonus = 1;
        }
        
        // Investigation Actions
        else if (eventType === 'investigate_thorough') {
            resolvedEvent = 'investigate';
            riskLevel = 'high';
            progressBonus = 2;
        } else if (eventType === 'investigate_quick') {
            resolvedEvent = 'investigate';
            riskLevel = 'low';
            progressBonus = 1;
        }
        
        // Combat Actions
        else if (eventType === 'combat_aggressive') {
            resolvedEvent = 'combat_won';
            riskLevel = 'high';
            progressBonus = 2;
        } else if (eventType === 'combat_tactical') {
            resolvedEvent = 'combat_won';
            riskLevel = 'low';
            progressBonus = 1;
        }
        
        // Collection Actions
        else if (eventType === 'collect_search') {
            resolvedEvent = 'item_collected';
            riskLevel = 'high';
            progressBonus = 2;
        } else if (eventType === 'collect_focus') {
            resolvedEvent = 'item_collected';
            riskLevel = 'low';
            progressBonus = 1;
        }
        
        // Talk Actions
        else if (eventType === 'talk_charm') {
            resolvedEvent = 'talk';
            riskLevel = 'low';
            progressBonus = 1;
        } else if (eventType === 'talk_intimidate') {
            resolvedEvent = 'talk';
            riskLevel = 'high';
            progressBonus = 2;
        }
        
        // Delivery Actions
        else if (eventType === 'deliver_safe') {
            resolvedEvent = 'deliver';
            riskLevel = 'low';
            progressBonus = 1;
        } else if (eventType === 'deliver_fast') {
            resolvedEvent = 'deliver';
            riskLevel = 'high';
            progressBonus = 2;
        }
        
        // Trade Actions
        else if (eventType === 'trade_fair') {
            resolvedEvent = 'merchant_trade';
            riskLevel = 'low';
            progressBonus = 1;
        } else if (eventType === 'trade_haggle') {
            resolvedEvent = 'merchant_trade';
            riskLevel = 'high';
            progressBonus = 2;
        }
        
        // Training Actions
        else if (eventType === 'training_intense') {
            resolvedEvent = 'training_completed';
            riskLevel = 'high';
            progressBonus = 2;
        } else if (eventType === 'training_balanced') {
            resolvedEvent = 'training_completed';
            riskLevel = 'low';
            progressBonus = 1;
        }
        
        // === RISK SYSTEM ===
        if (riskLevel === 'high' && Math.random() < 0.3) {
            this._emitQuestFeedback('story_event', {
                text: '⚠️ Das war knapp! Du wirst fast entdeckt...'
            });
            
            // === ALERT LEVEL INCREASE (Phase 8) ===
            // Finde aktive Quest die zu diesem Event passt
            var activeQuests = this.state.activeQuests || [];
            for (var i = 0; i < activeQuests.length; i++) {
                var quest = activeQuests[i];
                if (quest.status === this.STATES.ACTIVE) {
                    // Prüfe ob Quest Objectives hat die auf diesen Event reagieren
                    var hasMatchingObjective = false;
                    if (quest.objectives) {
                        for (var j = 0; j < quest.objectives.length; j++) {
                            var obj = quest.objectives[j];
                            var objTrigger = this._normalizeEventType(obj.trigger || obj.type || '');
                            if (objTrigger === resolvedEvent && !obj.completed) {
                                hasMatchingObjective = true;
                                break;
                            }
                        }
                    }
                    
                    if (hasMatchingObjective) {
                        quest.alertLevel = (quest.alertLevel || 0) + 1;
                        
                        // === SAFETY CLAMP (Phase 9.6) ===
                        quest.alertLevel = Math.min(3, quest.alertLevel);
                        
                        console.log('[QuestEngine] Alert Level erhöht:', quest.title, '→', quest.alertLevel);
                        
                        // Feedback bei hohem Alert Level
                        if (quest.alertLevel >= 2) {
                            this._emitQuestFeedback('story_event', {
                                text: '⚠️ Die Gegend ist alarmiert. Vorsicht ist geboten!'
                            });
                        }
                    }
                }
            }
            
            // === WORLD STATE KARMA (Phase 8) ===
            if (this.state.worldState) {
                this.state.worldState.karma = Math.max(-100, this.state.worldState.karma - 1);
                
                // === SAFETY CLAMP (Phase 9.6) ===
                this.state.worldState.karma = Math.max(-100, Math.min(100, this.state.worldState.karma));
                
                // Faction Reputation
                if (this.state.worldState.factions) {
                    if (this.state.worldState.factions.village !== undefined) {
                        this.state.worldState.factions.village = Math.max(-100, this.state.worldState.factions.village - 1);
                        
                        // === SAFETY CLAMP (Phase 9.6) ===
                        this.state.worldState.factions.village = Math.max(-100, Math.min(100, this.state.worldState.factions.village));
                    }
                }
                
                this._emitQuestFeedback('story_event', {
                    text: 'Dein Verhalten bleibt nicht unbemerkt...'
                });
                
                // === NEGATIVE FEEDBACK MIT FOLGEN (Phase 8.5) ===
                if (Math.random() < 0.2) {
                    this._emitQuestFeedback('story_event', {
                        text: '⚠️ Du hast Spuren hinterlassen. Feinde werden dich suchen.'
                    });
                    
                    this.state.worldState.flags['player_hunted'] = true;
                }
                
                this.saveState();
            }
        }
        
        // === STORY MOMENT ===
        var storyText = this._generateStoryMoment(eventType, { risk: riskLevel });
        if (storyText) {
            this._emitQuestFeedback('story_moment', { text: storyText });
        }
        
        // Pass progress bonus to processGameEvent
        data.progressBonus = progressBonus;
        data.risk = riskLevel;
        
        this._log('[QuestEngine] Simuliertes Event:', eventType, '→', resolvedEvent, data);
        return this.processGameEvent(resolvedEvent, data);
    },
    
    /**
     * Generiert einen narrativen Story Moment basierend auf Event-Typ
     * @param {string} eventType
     * @returns {string|null}
     */
    _generateStoryMoment(eventType, data) {
        if (!data) data = {};
        
        // === DIFFERENTIATED STORY MOMENTS ===
        
        // Exploration
        if (eventType === 'exploration_fast') {
            return "Du stürmst vorwärts — schnell, aber laut. Die Gefahr wächst mit jedem Schritt.";
        }
        if (eventType === 'exploration_safe') {
            return "Du schleichst dich lautlos voran. Sicher, aber Zeit kostet.";
        }
        
        // Investigation
        if (eventType === 'investigate_thorough') {
            return "Du untersuchst jedes Detail akribisch. Die Wahrheit liegt im Detail.";
        }
        if (eventType === 'investigate_quick') {
            return "Ein flüchtiger Blick genügt. Schnell, aber oberflächlich.";
        }
        
        // Combat
        if (eventType === 'combat_aggressive') {
            return "Mit wildem Kampfgeist stürmst du auf den Gegner zu!";
        }
        if (eventType === 'combat_tactical') {
            return "Kalt und berechnend suchst du die Schwachstelle.";
        }
        
        // Collection
        if (eventType === 'collect_search') {
            return "Du wühlst durch alles, was du findest. Chaos birgt Chancen.";
        }
        if (eventType === 'collect_focus') {
            return "Zielgerichtet suchst du nur nach dem Nötigsten.";
        }
        
        // Talk
        if (eventType === 'talk_charm') {
            return "Dein Lächeln öffnet Türen, die sonst verschlossen bleiben.";
        }
        if (eventType === 'talk_intimidate') {
            return "Deine Drohung hallt nach. Einschüchterung wirkt Wunder.";
        }
        
        // Delivery
        if (eventType === 'deliver_safe') {
            return "Der sichere Weg ist lang, aber ungefährlich.";
        }
        if (eventType === 'deliver_fast') {
            return "Du nimmst Abkürzungen — schnell, aber riskant.";
        }
        
        // Trade
        if (eventType === 'trade_fair') {
            return "Ein fairer Handel schafft Vertrauen für die Zukunft.";
        }
        if (eventType === 'trade_haggle') {
            return "Hartes Feilschen — du gewinnst, aber zu welchem Preis?";
        }
        
        // Training
        if (eventType === 'training_intense') {
            return "Deine Muskeln brennen, aber der Fortschritt ist sichtbar.";
        }
        if (eventType === 'training_balanced') {
            return "Ausgewogenes Training — langsam, aber nachhaltig.";
        }
        
        // === FALLBACK MAP ===
        var map = {
            exploration: [
                "Du betrittst vorsichtig das Gebiet. Jeder Schritt könnte dich verraten.",
                "Der Wind rauscht durch die Bäume. Etwas fühlt sich nicht richtig an.",
                "Du bewegst dich lautlos durch das Terrain und hältst Ausschau."
            ],
            investigate: [
                "Du gehst in die Hocke und untersuchst die Spuren genauer.",
                "Die Hinweise ergeben langsam ein klares Bild."
            ],
            combat_won: [
                "Mit einem gezielten Schlag besiegst du deinen Gegner.",
                "Der Kampf ist hart, aber du behältst die Oberhand."
            ],
            item_collected: [
                "Du findest das gesuchte Objekt und steckst es ein.",
                "Ein scharfes Auge entdeckt das Versteck."
            ],
            talk: [
                "Das Gespräch verläuft interessant.",
                "Du erfährst neue Informationen."
            ],
            deliver: [
                "Die Lieferung wird erfolgreich abgeschlossen.",
                "Der Empfänger nimmt die Ware dankbar entgegen."
            ],
            merchant_trade: [
                "Das Geschäft ist fair für beide Seiten.",
                "Nach etwas Feilschen einigt man sich auf einen Preis."
            ],
            training_completed: [
                "Das Training war anstrengend, aber lohnend.",
                "Du fühlst dich stärker als zuvor."
            ]
        };
        
        // Normalize event type for fallback
        var normalizedType = this._normalizeEventType ? this._normalizeEventType(eventType) : eventType;
        var list = map[normalizedType] || ["Du handelst entschlossen."];
        return list[Math.floor(Math.random() * list.length)];
    },
    
    /**
     * Trifft eine Entscheidung in einer aktiven Quest
     * @param {string} questId
     * @param {string} decisionId
     * @returns {Object} - { success, decision }
     */
    makeDecision(questId, decisionId) {
        var quest = this.state.activeQuests.find(function(q) { return q.id === questId; });
        if (!quest) {
            return { success: false, message: 'Quest nicht aktiv' };
        }
        
        if (!quest.decisions || quest.decisions.length === 0) {
            return { success: false, message: 'Quest hat keine Entscheidungen' };
        }
        
        if (quest.decisionMade) {
            return { success: false, message: 'Entscheidung bereits getroffen' };
        }
        
        var decision = quest.decisions.find(function(d) { return d.id === decisionId; });
        if (!decision) {
            return { success: false, message: 'Entscheidung nicht gefunden' };
        }
        
        // Entscheidung speichern
        quest.decisionMade = decisionId;
        
        // === CHAIN IMPACT ===
        // Wenn Quest Teil einer Chain ist und die Decision einen Branch definiert,
        // speichere den Branch in der Chain-Instanz
        if (quest.chainId) {
            var chainInstance = this.state.activeQuestChains.find(function(c) { return c.id === quest.chainId; });
            var chainDef = this.QUEST_CHAINS[quest.chainId];
            if (chainInstance && chainDef) {
                var currentQuestDef = chainDef.quests.find(function(q) { return q.index === quest.chainIndex; });
                if (currentQuestDef && currentQuestDef.branches && currentQuestDef.branches[decisionId]) {
                    var branch = currentQuestDef.branches[decisionId];
                    chainInstance.decisionImpacts[quest.chainIndex] = { decisionId: decisionId, branch: branch };
                    chainInstance.branchTaken = branch;
                    console.log('[QuestEngine] Chain-Branch gesetzt:', quest.chainId, '->', branch);
                }
            }
        }
        
        // === WORLD STATE FLAGS ===
        // Speichere Decision als Flag für spätere Quest-Requirements
        this.state.worldState.flags['decision_' + quest.id] = decisionId;
        if (quest.chainId) {
            this.state.worldState.flags['chain_' + quest.chainId + '_decision_' + quest.chainIndex] = decisionId;
        }
        console.log('[QuestEngine] Decision-Flag gesetzt:', 'decision_' + quest.id, '=', decisionId);
        
        // === EFFECT ENGINE ===
        // REGEL: Decision verändert nur Quest-Daten (Objectives, Rewards, Flow)
        //        Character-Effekte (Karma, Rep, XP) werden NUR bei Outcome angewendet
        if (decision.effects) {
            
            // 1. Rewards modifizieren
            if (decision.effects.rewardModifier) {
                quest.rewards = Object.assign({}, quest.rewards, decision.effects.rewardModifier);
            }
            
            // 2. Objectives ersetzen
            if (decision.effects.replaceObjectives) {
                quest.objectives = decision.effects.replaceObjectives.map(function(o) {
                    var ctx = o.context || {};
                    return {
                        id: o.id,
                        text: o.text,
                        trigger: o.trigger || o.type || null,
                        type: o.type || null,
                        target: o.target || 1,
                        current: 0,
                        completed: false,
                        context: {
                            location: ctx.location || null,
                            description: ctx.description || null,
                            flavor: ctx.flavor || null,
                            enemyType: ctx.enemyType || null,
                            itemId: ctx.itemId || null
                        }
                    };
                });
            }
            
            // 3. Objectives hinzufügen
            if (decision.effects.addObjectives) {
                for (var i = 0; i < decision.effects.addObjectives.length; i++) {
                    var o = decision.effects.addObjectives[i];
                    var ctx = o.context || {};
                    quest.objectives.push({
                        id: o.id,
                        text: o.text,
                        trigger: o.trigger || o.type || null,
                        type: o.type || null,
                        target: o.target || 1,
                        current: 0,
                        completed: false,
                        context: {
                            location: ctx.location || null,
                            description: ctx.description || null,
                            flavor: ctx.flavor || null,
                            enemyType: ctx.enemyType || null,
                            itemId: ctx.itemId || null
                        }
                    });
                }
            }
            
            // 7. Quest sofort abschließen (optional)
            if (decision.effects.completeQuestImmediately) {
                this.saveState();
                this._emitQuestFeedback('decision_made', {
                    questId: quest.id,
                    title: quest.title,
                    decision: decision.text,
                    effects: decision.effects
                });
                return this.completeQuest(questId);
            }
        }
        
        this.saveState();
        this._emitQuestUpdate();
        this._emitQuestFeedback('decision_made', {
            questId: quest.id,
            title: quest.title,
            decision: decision.text,
            effects: decision.effects || null
        });
        
        this._log('[QuestEngine] Entscheidung getroffen:', decision.text, 'in Quest:', quest.title);
        
        // === DECISION CONSEQUENCE HINT (Phase 11) ===
        if (quest.chainId || quest.id.includes('grenzwald') || quest.id.includes('kira')) {
            this._emitQuestFeedback('story_event', {
                text: '⚖️ Deine Entscheidung wird Auswirkungen haben...',
                hint: 'Die Welt verändert sich durch deine Wahl'
            });
        }
        
        // === DECISION WEIGHT & EMOTION (Phase 12) ===
        if (decision.intensity === 'high') {
            // Sofortiges schweres Feedback
            this._emitQuestFeedback('story_event', {
                text: '💔 Diese Entscheidung wird nicht ohne Folgen bleiben...',
                intensity: 'high'
            });
            
            // === DECISION AFTERMATH (Phase 12.5) ===
            // Mini-Konsequenz sofort spürbar
            setTimeout(() => {
                this._emitQuestFeedback('story_event', {
                    text: '🌑 Die Luft fühlt sich plötzlich schwer an...',
                    intensity: 'high'
                });
            }, 500);
            
            // Welt reagiert
            setTimeout(() => {
                this._emitQuestFeedback('story_event', {
                    text: '🌍 Deine Entscheidung zieht Kreise...'
                });
            }, 1500);
            
            // Nachwirkung
            setTimeout(() => {
                this._emitQuestFeedback('story_event', {
                    text: '⚡ Du spürst, dass sich etwas Grundlegendes verändert hat...'
                });
            }, 3000);
            
            // === MEMORY ANCHOR (Phase 13) ===
            // Wichtige Entscheidung als „Moment" speichern
            this.state.worldState.lastImportantDecision = {
                id: decisionId,
                questId: quest.id,
                questTitle: quest.title,
                decisionText: decision.text,
                intensity: decision.intensity,
                timestamp: Date.now()
            };
            
            // Rückblick nach 10 Sekunden
            setTimeout(() => {
                this._emitQuestFeedback('story_event', {
                    text: `💭 Du denkst noch immer an deine Entscheidung in "${quest.title}"...`
                });
            }, 10000);
            
        } else if (decision.intensity === 'medium') {
            this._emitQuestFeedback('story_event', {
                text: '⚡ Die Situation verändert sich...',
                intensity: 'medium'
            });
            
            // Medium aftermath
            setTimeout(() => {
                this._emitQuestFeedback('story_event', {
                    text: '...etwas ist anders als vorher.'
                });
            }, 1200);
        } else {
            // Leichte Entscheidung - minimales Feedback
            this._emitQuestFeedback('story_event', {
                text: 'Du hast dich entschieden.'
            });
        }
        
        // === WORLD STATE PRIORITY RESOLUTION (Phase 9.6) ===
        this._resolveWorldState();
        
        // === WORLD EVENTS (Phase 10.5) ===
        this._processWorldEvents();
        
        return { success: true, decision: decision };
    },
    
    /**
     * Startet eine Quest (Select + Accept in einem Schritt)
     * @param {string} questId
     * @returns {Object} - { success, quest, message }
     */
    startQuest(questId) {
        // FLOW TRACE
        console.log('[FLOW] startQuest', questId);
        
        // Suche Quest auf Board oder in Selected
        let quest = this.state.questBoard.find(q => q.id === questId);
        let fromBoard = true;
        
        if (!quest) {
            quest = this.state.selectedDailyQuests.find(q => q.id === questId);
            fromBoard = false;
        }
        
        if (!quest) {
            console.error('[FLOW] startQuest FAILED: Quest nicht gefunden', questId);
            return { success: false, message: 'Quest nicht gefunden' };
        }
        
        console.log('[FLOW] startQuest gefunden:', quest.id, 'category:', quest.category);
        console.log('[STORY QUEST]', {
            id: quest.id,
            category: quest.category,
            hasObjectives: !!(quest.objectives && quest.objectives.length > 0),
            objectiveCount: quest.objectives?.length || 0,
            status: quest.status
        });
        
        // === VALIDATION: Objectives müssen vorhanden sein ===
        if (!quest.objectives || quest.objectives.length === 0) {
            console.error('[QuestEngine] Quest ohne Objectives:', quest.id);
            return { success: false, message: 'Quest hat keine Ziele (Objectives fehlen)' };
        }
        
        // Status-Transition Guard: nur 'available' darf gestartet werden
        if (quest.status !== this.STATES.AVAILABLE) {
            return { success: false, message: 'Quest ist nicht verfügbar (Status: ' + quest.status + ')' };
        }
        
        // Prüfe Requirements
        if (!this._checkRequirements(quest)) {
            return { success: false, message: 'Voraussetzungen nicht erfüllt', details: quest.requirements };
        }
        
        // Prüfe ob max aktive Quests erreicht
        if (this.state.activeQuests.length >= this.CONFIG.MAX_SELECTABLE_QUESTS) {
            return { success: false, message: 'Maximale Anzahl aktiver Quests erreicht (3)' };
        }
        
        // Status ändern
        quest.status = this.STATES.ACTIVE;
        quest.acceptedAt = new Date().toISOString();
        quest.runtime = { phase: 'active', flags: {} };
        
        // === NPC REACTION DIFFICULTY MODIFIER (Phase 9.5) ===
        if (quest.giver) {
            const mod = this._getReactionModifier(quest.giver);
            
            // === SAFETY CLAMP (Phase 9.6) ===
            quest.difficultyModifier = Math.min(1.5, Math.max(0.7, mod.difficulty));
            
            const reaction = this.getNpcReaction(quest.giver);
            if (reaction === 'hostile') {
                this._emitQuestFeedback('story_event', {
                    text: `${quest.giver.name} macht es dir nicht leicht...`
                });
            } else if (reaction === 'friendly') {
                this._emitQuestFeedback('story_event', {
                    text: `${quest.giver.name} unterstützt dich wo er kann.`
                });
            }
        }
        
        // Zu activeQuests verschieben
        this.state.activeQuests.push(quest);
        
        // Aus Quelle entfernen
        if (fromBoard) {
            this.state.questBoard = this.state.questBoard.filter(q => q.id !== questId);
        } else {
            this.state.selectedDailyQuests = this.state.selectedDailyQuests.filter(q => q.id !== questId);
        }
        
        // Speichern
        this.saveState();
        this._emitQuestUpdate();
        this._emitQuestFeedback('quest_started', { questId: quest.id, title: quest.title });
        
        // === DECISION CHECK ===
        if (quest.decisions && quest.decisions.length > 0 && !quest.decisionMade) {
            this._emitQuestFeedback('decision_required', {
                questId: quest.id,
                title: quest.title,
                text: '⚖️ Diese Quest erfordert eine Entscheidung. Treffe sie zuerst, bevor du fortfährst.'
            });
        }
        
        this._log('[QuestEngine] Quest gestartet:', quest.title);
        
        return { success: true, quest, message: 'Quest gestartet!' };
    },
    
    /**
     * Bricht eine aktive Quest ab
     * @param {string} questId
     * @returns {boolean}
     */
    abandonQuest(questId) {
        const questIndex = this.state.activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) {
            console.warn('[QuestEngine] Quest zum Abbrechen nicht gefunden:', questId);
            return false;
        }
        
        const quest = this.state.activeQuests[questIndex];
        
        // Status-Guard: nur active Quests können abgebrochen werden
        if (quest.status !== this.STATES.ACTIVE && quest.status !== this.STATES.READY_FOR_TURN_IN) {
            console.warn('[QuestEngine] Quest kann nicht abgebrochen werden (Status:', quest.status, ')');
            return false;
        }
        
        quest.status = this.STATES.ABANDONED;
        quest.abandonedAt = new Date().toISOString();
        
        // Aus activeQuests entfernen
        this.state.activeQuests.splice(questIndex, 1);
        
        // Cooldown setzen
        const cooldownEnd = new Date();
        cooldownEnd.setHours(cooldownEnd.getHours() + 2);
        this.state.questCooldowns[quest.templateId] = cooldownEnd.toISOString();
        
        this.saveState();
        this._emitQuestUpdate();
        
        this._log('[QuestEngine] Quest abgebrochen:', quest.title);
        return true;
    },
    
    // === FORTSCHRITTSSYSTEM ===
    
    /**
     * Aktualisiert den Fortschritt eines Quest-Objectives
     * @param {string} questId - Die Quest-ID
     * @param {string} objectiveId - Die Objective-ID
     * @param {number} progress - Fortschrittswert (default: 1)
     * @returns {Object} - { success, quest, objectiveCompleted, questCompleted }
     */
    updateQuestProgress(questId, objectiveId, progress) {
        // FLOW TRACE
        console.log('[FLOW] updateQuestProgress', questId, objectiveId, progress);
        
        if (progress === undefined) progress = 1;
        
        const quest = this.state.activeQuests.find(q => q.id === questId);
        if (!quest) {
            console.error('[FLOW] updateQuestProgress FAILED: Quest nicht aktiv', questId);
            return { success: false, message: 'Quest nicht aktiv' };
        }
        
        // Status-Guard: nur active Quests können Progress erhalten
        if (quest.status !== this.STATES.ACTIVE) {
            console.warn('[FLOW] updateQuestProgress BLOCKED: Quest nicht aktiv', quest.status);
            return { success: false, message: 'Quest ist nicht aktiv (Status: ' + quest.status + ')' };
        }
        
        // Decision-Guard: Quest mit offener Entscheidung blockiert Progress
        if (quest.decisions && quest.decisions.length > 0 && !quest.decisionMade) {
            console.warn('[FLOW] updateQuestProgress BLOCKED: Decision required');
            return { 
                success: false, 
                error: 'decision_required',
                message: 'Du musst zuerst eine Entscheidung treffen',
                questId: quest.id,
                questTitle: quest.title
            };
        }
        
        const objective = quest.objectives.find(o => o.id === objectiveId);
        if (!objective) {
            console.error('[FLOW] updateQuestProgress FAILED: Objective nicht gefunden', objectiveId);
            return { success: false, message: 'Objective nicht gefunden' };
        }
        
        if (objective.completed) {
            console.log('[FLOW] updateQuestProgress SKIPPED: Objective bereits abgeschlossen');
            return { success: false, message: 'Objective bereits abgeschlossen' };
        }
        
        // Progress Cap: niemals über target
        var target = objective.target || 1;
        var oldProgress = objective.current || 0;
        objective.current = Math.min(oldProgress + progress, target);
        
        console.log('[FLOW] progress updated:', {
            questId: questId,
            objectiveId: objectiveId,
            old: oldProgress,
            new: objective.current,
            target: target
        });
        
        // Prüfe ob Objective abgeschlossen
        var objectiveCompleted = false;
        if (objective.current >= target) {
            objective.completed = true;
            objective.current = target;
            objectiveCompleted = true;
        }
        
        // Auto-Completion: Prüfe ob ALLE Objectives abgeschlossen
        var allCompleted = quest.objectives.every(function(o) { return o.completed; });
        var questCompleted = false;
        
        if (allCompleted) {
            quest.status = this.STATES.READY_FOR_TURN_IN;
            questCompleted = true;
        }
        
        this.saveState();
        this._emitQuestUpdate();
        this._emitQuestFeedback('progress', {
            questId: quest.id,
            objectiveId: objective.id,
            current: objective.current,
            target: target,
            text: objective.text || objective.id,
            flavor: objective.context && objective.context.flavor || null,
            location: objective.context && objective.context.location || null,
            objectiveCompleted: objectiveCompleted,
            questCompleted: questCompleted
        });
        
        return { success: true, quest: quest, objectiveCompleted: objectiveCompleted, questCompleted: questCompleted };
    },
    
    /**
     * Verarbeitet ein Game-Event und aktualisiert passende Quest-Objectives
     * @param {string} eventType - z.B. 'training_completed', 'combat_won', 'item_collected'
     * @param {Object} eventData - Event-Details
     */
    processGameEvent(eventType, eventData) {
        // FLOW TRACE
        console.log('[FLOW] processGameEvent', eventType, eventData);
        
        if (!eventData) eventData = {};
        
        // Normalisiere eingehendes Event über zentrales Mapping
        var normalizedEvent = this._normalizeEventType(eventType);
        console.log('[FLOW] normalizedEvent:', normalizedEvent);
        
        // Event-Deduplizierung: gleicher Event-Typ + Timestamp-Guard (100ms)
        var eventId = normalizedEvent + '_' + (eventData.id || '') + '_' + Math.floor(Date.now() / 100);
        if (this._lastProcessedEventId === eventId) {
            console.log('[FLOW] processGameEvent DEDUPLICATED:', eventId);
            return [];
        }
        this._lastProcessedEventId = eventId;
        
        if (!this.state.activeQuests || this.state.activeQuests.length === 0) {
            console.warn('[FLOW] processGameEvent BLOCKED: Keine aktiven Quests');
            return [];
        }
        
        console.log('[FLOW] processGameEvent checking', this.state.activeQuests.length, 'quests');
        
        var results = [];
        
        for (var i = 0; i < this.state.activeQuests.length; i++) {
            var quest = this.state.activeQuests[i];
            
            // Nur active Quests verarbeiten
            if (quest.status !== this.STATES.ACTIVE) continue;
            
            for (var j = 0; j < quest.objectives.length; j++) {
                var obj = quest.objectives[j];
                if (obj.completed) continue;
                
                // Normalisiere Objective-Trigger über dasselbe Mapping
                var objTrigger = this._normalizeEventType(obj.trigger || obj.type || '');
                
                // FLOW TRACE: Match Check
                console.log('[MATCH CHECK]', {
                    questId: quest.id,
                    objType: obj.type,
                    objTrigger: objTrigger,
                    normalizedEvent: normalizedEvent,
                    matches: objTrigger === normalizedEvent
                });
                
                // Match: normalisiertes Event === normalisierter Trigger
                if (objTrigger !== normalizedEvent) continue;
                
                // Context-Match (erweiterte Bedingungsprüfung)
                var matches = true;
                
                if (obj.condition) {
                    if (obj.condition.type && eventData.type !== obj.condition.type) matches = false;
                    if (obj.condition.target && eventData.target !== obj.condition.target) matches = false;
                    if (obj.condition.minDamage && (eventData.damage || 0) < obj.condition.minDamage) matches = false;
                }
                
                if (obj.context) {
                    if (obj.context.location && eventData.location !== obj.context.location) matches = false;
                    if (obj.context.enemyType && eventData.enemyType !== obj.context.enemyType) matches = false;
                    if (obj.context.itemId && eventData.itemId !== obj.context.itemId) matches = false;
                }
                
                if (matches) {
                    // === ALERT LEVEL AUSWIRKUNG (Phase 8) ===
                    if (quest.alertLevel >= 2) {
                        this._emitQuestFeedback('story_event', {
                            text: 'Die Gegend ist alarmiert. Deine Aktionen sind riskanter.'
                        });
                        
                        // === ALERT LEVEL 2: PROGRESS REDUZIERT (Phase 8.5) ===
                        increment = Math.max(1, increment - 1);
                        
                        // Bei hohem Alert Level: 30% Chance auf keinen Fortschritt
                        if (Math.random() < 0.3) {
                            this._emitQuestFeedback('story_event', {
                                text: '⚠️ Die Wachen sind wachsam! Du machst keinen Fortschritt.'
                            });
                            continue; // Überspringe dieses Objective
                        }
                    }
                    
                    // === ALERT LEVEL 3: QUEST FAILURE (Phase 8.5) ===
                    if (quest.alertLevel >= 3) {
                        this._emitQuestFeedback('story_event', {
                            text: '❌ Du wurdest entdeckt. Die Quest ist gescheitert.'
                        });
                        
                        quest.status = 'failed';
                        quest.failedAt = new Date().toISOString();
                        
                        // Verschiebe zu completedQuests als failed
                        this.state.completedQuests.push(quest);
                        this.state.activeQuests = this.state.activeQuests.filter(function(q) {
                            return q.id !== quest.id;
                        });
                        
                        this.saveState();
                        this._emitQuestUpdate();
                        return results;
                    }
                    
                    // === PROGRESS BONUS FROM ACTION CHOICE ===
                    // FIX 1: increment definieren vor Verwendung
                    var increment = (eventData && (eventData.increment || eventData.amount)) || 1;
                    
                    // === DEBUG: Progress Log ===
                    console.log('[QuestProgress]', {
                        questId: quest.id,
                        objectiveId: obj.id,
                        increment: increment,
                        currentProgress: obj.progress || 0,
                        target: obj.target
                    });
                    
                    var result = this.updateQuestProgress(quest.id, obj.id, increment);
                    results.push(result);
                }
            }
        }
        
        return results;
    },
    
    // === EXPLORATION QUEST GENERATION ===
    
    /**
     * Generiert eine Exploration Quest
     * @returns {Object|null}
     */
    generateExplorationQuest() {
        var explorationTemplates = [
            {
                id: 'explore_nordpass',
                title: 'Den Nordpass erkunden',
                description: 'Erkunde den gefährlichen Nordpass und kartiere die Gegend.',
                category: 'exploration',
                difficulty: 'medium',
                duration: 15,
                giver: { name: 'Kartograph Hideo', location: 'Rathaus' },
                objectives: [
                    { id: 'reach_pass', text: 'Nordpass erreichen', trigger: 'exploration', target: 1 },
                    { id: 'map_area', text: 'Gebiet kartieren', trigger: 'exploration', target: 1 }
                ],
                rewards: { xp: 12, silver: 3, karma: 1 }
            },
            {
                id: 'explore_ruins',
                title: 'Alte Ruinen untersuchen',
                description: 'Am Stadtrand wurden alte Ruinen entdeckt. Untersuche sie.',
                category: 'exploration',
                difficulty: 'hard',
                duration: 20,
                giver: { name: 'Historiker Tanaka', location: 'Bibliothek' },
                objectives: [
                    { id: 'enter_ruins', text: 'Ruinen betreten', trigger: 'exploration', target: 1 },
                    { id: 'find_artifact', text: 'Artefakt finden', trigger: 'item_collected', target: 1 }
                ],
                rewards: { xp: 18, silver: 5, karma: 2 }
            },
            {
                id: 'explore_forest',
                title: 'Grenzwald durchqueren',
                description: 'Durchquere den dichten Grenzwald und finde den versteckten Pfad.',
                category: 'exploration',
                difficulty: 'easy',
                duration: 10,
                giver: { name: 'Jäger Mako', location: 'Waldrand' },
                objectives: [
                    { id: 'cross_forest', text: 'Wald durchqueren', trigger: 'exploration', target: 1 }
                ],
                rewards: { xp: 8, silver: 2 }
            },
            {
                id: 'explore_caves',
                title: 'Die Eishöhlen',
                description: 'Erforsche die mysteriösen Eishöhlen unter dem Gletscher.',
                category: 'exploration',
                difficulty: 'very_hard',
                duration: 25,
                giver: { name: 'Bergführer Sato', location: 'Nordtor' },
                objectives: [
                    { id: 'find_entrance', text: 'Eingang finden', trigger: 'exploration', target: 1 },
                    { id: 'explore_deep', text: 'Tiefe erkunden', trigger: 'exploration', target: 1 },
                    { id: 'survive', text: 'Lebend zurückkehren', trigger: 'exploration', target: 1 }
                ],
                rewards: { xp: 25, gold: 1, silver: 5, karma: 3 }
            }
        ];
        
        var available = explorationTemplates.filter(q => !this._isQuestOnCooldown(q.id));
        if (available.length === 0) return null;
        
        var template = available[Math.floor(Math.random() * available.length)];
        return this._createQuestInstance(template, 'exploration');
    },

    // === QUEST CHAINS ===
    
    /**
     * Startet eine Quest Chain und injiziert die erste Quest ins Board
     * @param {string} chainId - Die Chain-ID
     * @returns {Object} - { success, chain, message }
     */
    startQuestChain(chainId) {
        const chainDef = this.QUEST_CHAINS[chainId];
        if (!chainDef) {
            console.error(`[QuestEngine] Quest Chain nicht gefunden: ${chainId}`);
            return { success: false, message: 'Quest Chain nicht gefunden' };
        }
        
        // Sicherstellen dass activeQuestChains ein Array ist
        if (!Array.isArray(this.state.activeQuestChains)) {
            this.state.activeQuestChains = [];
        }
        
        // Prüfe ob Chain bereits aktiv oder abgeschlossen
        const existingActive = this.state.activeQuestChains.find(c => c.id === chainId);
        if (existingActive) {
            return { success: false, message: 'Quest Chain bereits aktiv' };
        }
        const existingCompleted = this.state.completedQuestChains.find(c => c.id === chainId);
        if (existingCompleted) {
            return { success: false, message: 'Quest Chain bereits abgeschlossen' };
        }
        
        // Erstelle Chain-Instanz
        const chainInstance = {
            id: chainId,
            name: chainDef.name,
            description: chainDef.description,
            icon: chainDef.icon || null,
            currentQuestIndex: 0,
            decisionImpacts: {}, // questIndex -> { decisionId, branch }
            branchTaken: null,    // globaler Branch für die Chain
            startedAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.state.activeQuestChains.push(chainInstance);
        
        console.log(`[QuestEngine] Quest Chain gestartet: ${chainDef.name}`);
        
        // Erste Quest ins Board injizieren
        const firstQuestDef = chainDef.quests.find(q => q.index === 0);
        if (firstQuestDef) {
            this._injectChainQuestIntoBoard(chainId, 0);
        }
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest:chain_started', chainInstance);
        }
        
        this.saveState();
        this._emitQuestUpdate();
        
        return { success: true, chain: chainInstance, message: `Storyline "${chainDef.name}" gestartet!` };
    },
    
    /**
     * Löst den nächsten Chain-Quest basierend auf Branches und Fortschritt auf
     * @private
     */
    _resolveNextChainQuest(chainId, currentIndex) {
        const chainDef = this.QUEST_CHAINS[chainId];
        const chainInstance = this.state.activeQuestChains.find(c => c.id === chainId);
        if (!chainDef || !chainInstance) return null;
        
        const nextIndex = currentIndex + 1;
        
        // Suche alle Quest-Definitionen für den nächsten Index
        const candidates = chainDef.quests.filter(q => q.index === nextIndex);
        if (candidates.length === 0) return null;
        
        // Wenn nur eine Option, nehme diese
        if (candidates.length === 1) return candidates[0];
        
        // Mehrere Optionen = Branching. Prüfe requiresBranch
        const branchTaken = chainInstance.branchTaken;
        for (const candidate of candidates) {
            if (!candidate.requiresBranch) return candidate; // Fallback
            if (candidate.requiresBranch === branchTaken) return candidate;
        }
        
        // Kein Match gefunden - nimm ersten ohne requiresBranch oder ersten überhaupt
        return candidates.find(c => !c.requiresBranch) || candidates[0];
    },
    
    /**
     * Injiziert eine Chain-Quest ins Quest Board
     * @private
     */
    _injectChainQuestIntoBoard(chainId, questIndex) {
        const chainDef = this.QUEST_CHAINS[chainId];
        if (!chainDef) return false;
        
        const questDef = chainDef.quests.find(q => q.index === questIndex);
        if (!questDef) return false;
        
        // Template laden für Duplikat-Check
        const template = typeof QuestRegistryV4 !== 'undefined' ? QuestRegistryV4.getById(questDef.templateId) : null;
        if (!template) {
            console.error(`[QuestEngine] Chain-Template nicht gefunden: ${questDef.templateId}`);
            return false;
        }
        
        // === DUPLIKAT-GUARD (Multi-Layer) ===
        // Layer 1: Prüfe ob diese Chain/Index Kombination bereits existiert
        const existsByChainMeta = this.state.questBoard.some(q => q.chainId === chainId && q.chainIndex === questIndex) ||
                                  this.state.activeQuests.some(q => q.chainId === chainId && q.chainIndex === questIndex);
        if (existsByChainMeta) {
            this._log('[QuestEngine] Chain-Quest bereits vorhanden (chainId+index):', chainId, questIndex);
            return false;
        }
        
        // Layer 2: Prüfe ob Template-ID bereits als Chain-Quest auf dem Board ist
        const existsByTemplateId = this.state.questBoard.some(q => q.templateId === template.id && q.chainId === chainId) ||
                                   this.state.activeQuests.some(q => q.templateId === template.id && q.chainId === chainId);
        if (existsByTemplateId) {
            console.warn('[QuestEngine] Chain-Quest bereits vorhanden (templateId):', template.id);
            return false;
        }
        
        // Quest-Instanz erstellen
        const quest = this._createQuestInstance(template, template.category || 'story');
        if (!quest) return false;
        
        // Sicherstellen, dass Chain-Metadaten gesetzt sind
        quest.chainId = chainId;
        quest.chainIndex = questIndex;
        quest.chainTotal = chainDef.quests.filter(q => !q.requiresBranch || q.requiresBranch === (this.state.activeQuestChains.find(c => c.id === chainId)?.branchTaken)).length;
        
        // Wenn Board voll (6+ Quests), ersetze eine Story-Quest oder entferne die letzte
        if (this.state.questBoard.length >= this.CONFIG.DAILY_QUEST_COUNT) {
            var storyIndex = this.state.questBoard.findIndex(function(q) { return q.category === 'story' && !q.chainId; });
            if (storyIndex !== -1) {
                this.state.questBoard.splice(storyIndex, 1);
            } else {
                this.state.questBoard.pop(); // Entferne letzte Quest
            }
        }
        
        // Ins Board einfügen (an erster Stelle für Sichtbarkeit)
        this.state.questBoard.unshift(quest);
        
        console.log(`[QuestEngine] Chain-Quest injiziert: ${quest.title} (${chainId} #${questIndex})`);
        
        this.saveState();
        this._emitQuestUpdate();
        
        return true;
    },
    
    /**
     * Schaltet die nächste Quest in einer Chain frei
     * @param {string} chainId - Die Chain-ID
     * @returns {boolean}
     */
    advanceQuestChain(chainId) {
        // Sicherstellen dass activeQuestChains ein Array ist
        if (!Array.isArray(this.state.activeQuestChains)) {
            this.state.activeQuestChains = [];
        }
        
        const chain = this.state.activeQuestChains.find(c => c.id === chainId);
        const chainDef = this.QUEST_CHAINS[chainId];
        if (!chain || !chainDef) {
            console.error(`[QuestEngine] Quest Chain nicht aktiv: ${chainId}`);
            return false;
        }
        
        // === DOUBLE COMPLETION GUARD ===
        // Prüfe ob Chain bereits abgeschlossen wurde
        const alreadyCompleted = this.state.completedQuestChains.some(c => c.id === chainId);
        if (alreadyCompleted) {
            console.warn('[QuestEngine] Chain bereits abgeschlossen:', chainId);
            return false;
        }
        
        // Aktuellen Index inkrementieren
        chain.currentQuestIndex++;
        
        // === DEADLOCK-GUARD ===
        // Suche den nächsten validen Step (überspringe Branches die nicht passen)
        let nextQuest = this._resolveNextChainQuest(chainId, chain.currentQuestIndex - 1);
        
        // Wenn kein nächster Quest gefunden wurde, prüfe ob wir am Ende sind
        // oder ob alle verbleibenden Steps nicht zum Branch passen
        if (!nextQuest) {
            const maxIndex = Math.max(...chainDef.quests.map(q => q.index));
            
            // Prüfe ob es überhaupt noch Quests gibt die passen könnten
            const remainingQuests = chainDef.quests.filter(q => q.index >= chain.currentQuestIndex);
            const hasValidRemaining = remainingQuests.some(q => 
                !q.requiresBranch || q.requiresBranch === chain.branchTaken
            );
            
            if (!hasValidRemaining || chain.currentQuestIndex > maxIndex) {
                // KEIN VALIDER STEP → CHAIN ENDE
                console.warn('[QuestEngine] Chain beendet (kein gültiger Branch mehr):', chainId);
                
                // === IDEMPOTENZ: Timestamp setzen ===
                chain.completedAt = new Date().toISOString();
                
                // Chain-Belohnungen verteilen
                if (chainDef.rewards) {
                    this._applyRewards(chainDef.rewards);
                }
                
                // Verschiebe zu completedQuestChains
                this.state.activeQuestChains = this.state.activeQuestChains.filter(c => c.id !== chainId);
                this.state.completedQuestChains.push(chain);
                
                console.log(`[QuestEngine] Quest Chain abgeschlossen: ${chain.name}`);
                
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('quest:chain_completed', chain);
                }
                
                this._emitQuestFeedback('chain_completed', {
                    chainId: chain.id,
                    name: chain.name,
                    rewards: chainDef.rewards
                });
                
                this.saveState();
                return true;
            }
        }
        
        // Normale Fortsetzung mit nächster Quest
        if (nextQuest) {
            this._injectChainQuestIntoBoard(chainId, nextQuest.index);
            console.log(`[QuestEngine] Quest Chain fortgeschritten: ${chain.name} - Quest ${chain.currentQuestIndex + 1}`);
        } else {
            // Sollte nicht passieren, aber sicherheitshalber
            console.warn('[QuestEngine] Keine nächste Quest gefunden, aber Chain nicht beendet:', chainId);
        }
        
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('quest:chain_advanced', chain);
        }
        
        this.saveState();
        return true;
    },
    
    /**
     * Gibt alle verfügbaren Quest Chains zurück
     * @returns {Array}
     */
    getAvailableQuestChains() {
        // Sicherstellen dass Arrays existieren
        const activeChains = Array.isArray(this.state.activeQuestChains) ? this.state.activeQuestChains : [];
        const completedChains = Array.isArray(this.state.completedQuestChains) ? this.state.completedQuestChains : [];
        
        return Object.entries(this.QUEST_CHAINS).map(([id, chain]) => ({
            id,
            ...chain,
            isActive: activeChains.some(c => c.id === id),
            isCompleted: completedChains.some(c => c.id === id)
        }));
    },
    
    // === QUEST CHAIN DEFINITIONS ===
    QUEST_CHAINS: {
        wahrheit_von_grenzwald: {
            id: 'wahrheit_von_grenzwald',
            name: 'Die Wahrheit von Grenzwald',
            description: 'Eine Karawane verschwindet, und mit ihr das Vertrauen in das Dorf. Deine Entscheidung wird Grenzwald für immer verändern.',
            icon: '&#127794;',
            quests: [
                { templateId: 'grenzwald_missing_caravan', index: 0 },
                { templateId: 'grenzwald_bandit_camp', index: 1 },
                { 
                    templateId: 'grenzwald_the_truth', 
                    index: 2,
                    branches: {
                        protect_village: 'peace',
                        expose_truth: 'chaos'
                    }
                },
                { templateId: 'grenzwald_peace_maintained', index: 3, requiresBranch: 'peace' },
                { templateId: 'grenzwald_village_in_chaos', index: 3, requiresBranch: 'chaos' }
            ],
            rewards: {
                xp: 100,
                gold: 5,
                reputation: { village: 30 }
            }
        },
        kira_network_saga: {
            id: 'kira_network_saga',
            name: 'Kiras Netz',
            description: 'Gerüchte über ein geheimes Netzwerk kursieren im Dorf. Wer zieht die Fäden? Und wirst du Teil davon oder es zerstören?',
            icon: '&#127761;',
            quests: [
                { templateId: 'kira_whispers', index: 0 },
                { 
                    templateId: 'kira_network', 
                    index: 1,
                    branches: {
                        join_kira: 'member',
                        expose_kira: 'enemy'
                    }
                },
                { templateId: 'kira_inner_circle', index: 2, requiresBranch: 'member' },
                { templateId: 'kira_hunt', index: 2, requiresBranch: 'enemy' },
                { templateId: 'kira_grenzwald_connection', index: 3 }
            ],
            rewards: {
                xp: 100,
                gold: 5,
                reputation: { kira: 30 }
            }
        },
        banditen_saga: {
            id: 'banditen_saga',
            name: 'Die Banditen-Saga',
            description: 'Eine epische Geschichte über Banditen im Grenzwald. Deine Entscheidungen prägen das Schicksal des Dorfes.',
            icon: '&#9876;',
            quests: [
                { templateId: 'chain_banditen_zeichen', index: 0 },
                { templateId: 'chain_banditen_versteck', index: 1 },
                { 
                    templateId: 'chain_banditen_anfuehrer', 
                    index: 2,
                    branches: {
                        spare_leader: 'mercy',
                        defeat_leader: 'ruthless'
                    }
                },
                { templateId: 'chain_banditen_spitzel_mercy', index: 3, requiresBranch: 'mercy' },
                { templateId: 'chain_banditen_spitzel_ruthless', index: 3, requiresBranch: 'ruthless' }
            ],
            rewards: {
                xp: 50,
                gold: 5,
                reputation: { village: 20, karl: 10 }
            }
        },
        kira_vertrauen: {
            id: 'kira_vertrauen',
            name: 'Kiras Test',
            description: 'Verdiene Kiras Vertrauen auf dem Schwarzmarkt. Aber Vorsicht: Loyalität hat ihren Preis.',
            icon: '&#127761;',
            quests: [
                { templateId: 'chain_kira_lieferung', index: 0 },
                { 
                    templateId: 'chain_kira_informant', 
                    index: 1,
                    branches: {
                        report_to_kira: 'loyal',
                        warn_informant: 'betray'
                    }
                },
                { templateId: 'chain_kira_entscheidung_loyal', index: 2, requiresBranch: 'loyal' },
                { templateId: 'chain_kira_entscheidung_betray', index: 2, requiresBranch: 'betray' }
            ],
            rewards: {
                xp: 40,
                karma: -10,
                reputation: { kira: 30 }
            }
        },
        kirche_mysterium: {
            id: 'kirche_mysterium',
            name: 'Das Kirchen-Mysterium',
            description: 'Löse das Rätsel um den verschwundenen Priester und die gestohlenen Reliquien.',
            icon: '&#9960;',
            quests: [
                { templateId: 'chain_kirche_spur', index: 0 },
                { templateId: 'chain_kirche_versteck', index: 1 },
                { templateId: 'chain_kirche_wahrheit', index: 2 }
            ],
            rewards: {
                xp: 45,
                karma: 15,
                reputation: { pastor: 25, church: 20 }
            }
        }
    },
    
    // === EVENTS ===
    
    /**
     * Richtet Event-Listener ein
     */
    setupEventListeners() {
        if (typeof EventBus !== 'undefined') {
            // === LOGOUT HANDLER (KRITISCH) ===
            if (!this._logoutListenerAttached) {
                EventBus.on('state:cleared', () => {
                    console.log('[QuestEngine] Reset durch Logout');
                    
                    // State zurücksetzen
                    this.resetState();
                    this._initialized = false;
                    
                    // World State zurücksetzen
                    this.state.worldState = {
                        karma: 0,
                        factions: {
                            village: 0,
                            bandits: 0,
                            kira: 0,
                            church: 0,
                            karl: 0,
                            taro: 0,
                            yuki: 0,
                            shin: 0,
                            blackmarket: 0
                        },
                        flags: {}
                    };
                    
                    console.log('[QuestEngine] State vollständig zurückgesetzt');
                });
                this._logoutListenerAttached = true;
            }
            
            EventBus.on('auth:login', () => {
                // Neuer User = frische Initialisierung
                this._initialized = false;
                this.init();
            });
            
            // Game Events die Quest-Progress triggern
            EventBus.on('training:completed', (data) => {
                if (!this._getCurrentCharacter()) return;
                this.processGameEvent('training_completed', data);
            });
            
            EventBus.on('combat:won', (data) => {
                if (!this._getCurrentCharacter()) return;
                this.processGameEvent('combat_won', data);
            });
            
            EventBus.on('combat:lost', (data) => {
                if (!this._getCurrentCharacter()) return;
                this.processGameEvent('combat_lost', data);
            });
            
            EventBus.on('item:collected', (data) => {
                if (!this._getCurrentCharacter()) return;
                this.processGameEvent('item_collected', data);
            });
            
            EventBus.on('exploration:completed', (data) => {
                if (!this._getCurrentCharacter()) return;
                this.processGameEvent('exploration', data);
            });
            
            EventBus.on('merchant:trade', (data) => {
                if (!this._getCurrentCharacter()) return;
                this.processGameEvent('merchant_trade', data);
            });
        }
    },
    
    // === DEBUG ===
    
    /**
     * Debug-Informationen
     */
    debug() {
        console.group('[QuestEngine v4.0 Debug]');
        console.log('Board:', this.state.questBoard.length, 'Quests');
        console.log('Selected:', this.state.selectedDailyQuests.length, '/', this.CONFIG.MAX_SELECTABLE_QUESTS);
        console.log('Active:', this.state.activeQuests.length);
        console.log('Completed:', this.state.completedQuests.length);
        console.log('Karma:', this.state.karma.value);
        console.log('Next Reset:', this.state.nextReset);
        
        // Seasonal Event
        if (this.state.seasonalEvent) {
            console.log('Seasonal Event:', this.state.seasonalEvent.name);
        }
        
        // Rare Event
        if (this.state.rareEvent) {
            console.log('Rare Event:', this.state.rareEvent.name);
        }
        
        // Quest Chains
        const activeChainCount = Array.isArray(this.state.activeQuestChains) ? this.state.activeQuestChains.length : 0;
        const completedChainCount = Array.isArray(this.state.completedQuestChains) ? this.state.completedQuestChains.length : 0;
        console.log('Active Chains:', activeChainCount);
        console.log('Completed Chains:', completedChainCount);
        
        console.groupEnd();
    }
};

// Global verfügbar machen
window.QuestEngine = QuestEngine;
