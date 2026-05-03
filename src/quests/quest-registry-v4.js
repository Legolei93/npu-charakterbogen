/**
 * Quest Registry v4.0 - Zentrale Quest-Definitionen
 * 
 * Enthält alle Quest-Templates für das Studio-Level Quest System:
 * - Story Quests (Hauptgeschichten)
 * - Merchant Quests (Händler-Aufträge)
 * - Investigation Quests (Ermittlungen)
 * - Moral Quests (Entscheidungen)
 * - Combat Quests (Kämpfe)
 * - Daily Quests (Wiederholbare)
 * - Elite/Boss Quests (Seltene Herausforderungen)
 */

const QuestRegistryV4 = {
    
    // === STORYLINE: DIE WAHRHEIT VON GRENZWALD ===
    // Eine vollständige Questreihe mit Entscheidungen und Konsequenzen
    
    grenzwald_saga: [
        {
            id: 'grenzwald_missing_caravan',
            title: 'Die verschwundene Karawane',
            description: 'Eine Handelskarawane ist auf dem Weg durch den Grenzwald spurlos verschwunden. Taro fürchtet das Schlimmste.',
            category: 'investigation',
            chainPart: { chainId: 'wahrheit_von_grenzwald', index: 0, total: 4 },
            giver: { name: 'Taro', location: 'Marktplatz', faction: 'village' },
            difficulty: 'easy',
            duration: 15,
            narrative: {
                hook: 'Eine Karawane ist verschwunden. Keine Leichen, keine Spuren.',
                conflict: 'Banditen oder etwas anderes?',
                stakes: 'Das Vertrauen in die Sicherheit des Dorfes'
            },
            objectives: [
                { type: 'travel', target: 'grenzwald', count: 1, text: 'Reise zum Grenzwald' },
                { type: 'investigate', target: 'caravan_trail', count: 1, text: 'Untersuche die Karawanenspur' },
                { type: 'collect', target: 'clues', count: 3, text: 'Sammle 3 Beweisstücke' }
            ],
            decisions: [
                { 
                    id: 'follow_trail', 
                    text: 'Den Spuren folgen', 
                    effects: { addObjectives: [{ id: 'scout_bandit_camp', text: 'Spähe das Verdachtslager aus', trigger: 'exploration', target: 1 }] }
                },
                { 
                    id: 'return_report', 
                    text: 'Zurück zu Taro berichten', 
                    effects: { rewardModifier: { xp: 5, reputation: { taro: 3 } } }
                }
            ],
            rewards: {
                xp: 12,
                silver: 50,
                reputation: { taro: 5, village: 3 }
            }
        },
        {
            id: 'grenzwald_bandit_camp',
            title: 'Das Lager im Wald',
            description: 'Die Spuren führen zu einem alten Lager. Doch etwas stimmt nicht - die Banditen scheinen vorbereitet zu sein.',
            category: 'exploration',
            chainPart: { chainId: 'wahrheit_von_grenzwald', index: 1, total: 4 },
            giver: { name: 'Wachenhauptmann', location: 'Grenzwald', faction: 'village' },
            difficulty: 'medium',
            duration: 20,
            narrative: {
                hook: 'Ein Lager, aber keine gewöhnlichen Banditen.',
                conflict: 'Wer hat sie gewarnt?',
                stakes: 'Die Wahrheit über die Verräter'
            },
            objectives: [
                { type: 'discover', target: 'bandit_camp', count: 1, text: 'Finde das Banditenlager' },
                { type: 'investigate', target: 'camp_clues', count: 2, text: 'Untersuche 2 verdächtige Hinweise' }
            ],
            decisions: [
                { 
                    id: 'confront_bandits', 
                    text: 'Die Banditen konfrontieren',
                    effects: { addObjectives: [{ id: 'combat_bandits', text: 'Besiege die Banditenführer', trigger: 'combat_won', target: 1 }] }
                },
                { 
                    id: 'sneak_around', 
                    text: 'Unbemerkt erkunden',
                    effects: { rewardModifier: { xp: 8 }, addObjectives: [{ id: 'find_documents', text: 'Finde geheime Dokumente', trigger: 'investigate', target: 1 }] }
                }
            ],
            outcomes: [
                {
                    decisionId: 'confront_bandits',
                    text: 'Die Banditen werden besiegt. Unter den Papieren findest du einen Brief mit dem Siegel des Dorfes.',
                    effects: { flags: { found_dorf_seal: true } }
                },
                {
                    decisionId: 'sneak_around',
                    text: 'Du findest Dokumente, die eine Verbindung zum Dorfältesten beweisen.',
                    effects: { flags: { found_documents: true } }
                }
            ],
            rewards: {
                xp: 18,
                silver: 80,
                reputation: { village: 2 }
            }
        },
        {
            id: 'grenzwald_the_truth',
            title: 'Die Wahrheit',
            description: 'Die Beweise sind erdrückend. Der Dorfälteste hat die Banditen mit Informationen versorgt. Doch warum?',
            category: 'moral',
            chainPart: { chainId: 'wahrheit_von_grenzwald', index: 2, total: 4 },
            giver: { name: 'Ermittler', location: 'Grenzwald', faction: 'village' },
            difficulty: 'hard',
            duration: 25,
            narrative: {
                hook: 'Der Dorfälteste - ein Verräter?',
                conflict: 'Loyalität vs. Wahrheit',
                stakes: 'Die Zukunft des Dorfes'
            },
            objectives: [
                { type: 'talk', target: 'dorf_elder', count: 1, text: 'Stelle den Dorfältesten zur Rede' },
                { type: 'investigate', target: 'elder_motivation', count: 1, text: 'Erfahre seine Motivation' }
            ],
            decisions: [
                { 
                    id: 'protect_village', 
                    text: 'Das Dorf schützen - verschweige die Wahrheit',
                    effects: { rewardModifier: { karma: 5, reputation: { village: 15 } } }
                },
                { 
                    id: 'expose_truth', 
                    text: 'Die Wahrheit aufdecken',
                    effects: { rewardModifier: { karma: -10, reputation: { village: -20 } } }
                }
            ],
            outcomes: [
                {
                    decisionId: 'protect_village',
                    text: 'Du schweigst. Der Dorfälteste bleibt ungeschoren, das Dorf bleibt stabil. Doch die Schuld lastet auf dir.',
                    effects: { 
                        karma: -5, 
                        reputation: { village: 10 }, 
                        flags: { truth_hidden: true, grenzwald_peace: true }
                    }
                },
                {
                    decisionId: 'expose_truth',
                    text: 'Die Wahrheit kommt ans Licht. Der Dorfälteste wird verhaftet, das Dorf bricht in Aufruhr aus.',
                    effects: { 
                        karma: 10, 
                        reputation: { village: -15 }, 
                        flags: { village_corrupt: true, elder_exposed: true }
                    }
                }
            ],
            rewards: {
                xp: 25,
                gold: 1,
                silver: 100
            }
        },
        // BRANCH A: Wahrheit verschwiegen
        {
            id: 'grenzwald_peace_maintained',
            title: 'Der Preis des Friedens',
            description: 'Das Dorf ist in Sicherheit, aber der Dorfälteste weiß, dass du sein Geheimnis kennst.',
            category: 'story',
            chainPart: { chainId: 'wahrheit_von_grenzwald', index: 3, total: 4, branch: 'peace' },
            giver: { name: 'Dorfältester', location: 'Dorfzentrum', faction: 'village' },
            difficulty: 'medium',
            duration: 20,
            requirements: {
                flags: { truth_hidden: true }
            },
            narrative: {
                hook: 'Der Dorfälteste schuldet dir etwas.',
                conflict: 'Nutze das Wissen oder schweige weiter?',
                stakes: 'Macht oder Moral'
            },
            objectives: [
                { type: 'talk', target: 'dorf_elder', count: 1, text: 'Sprich mit dem Dorfältesten' },
                { type: 'decide', target: 'blackmail_or_silence', count: 1, text: 'Entscheide über sein Schicksal' }
            ],
            decisions: [
                { 
                    id: 'blackmail', 
                    text: 'Ihn erpressen',
                    effects: { rewardModifier: { gold: 2, karma: -15 } }
                },
                { 
                    id: 'keep_silence', 
                    text: 'Weiter schweigen',
                    effects: { rewardModifier: { karma: 10, reputation: { village: 5 } } }
                }
            ],
            rewards: {
                xp: 20,
                silver: 150
            }
        },
        // BRANCH B: Wahrheit aufgedeckt
        {
            id: 'grenzwald_village_in_chaos',
            title: 'Das Dorf zerbricht',
            description: 'Ohne den Dorfältesten bricht Chaos aus. Banditen nutzen die Gelegenheit, Unschuldige leiden.',
            category: 'story',
            chainPart: { chainId: 'wahrheit_von_grenzwald', index: 3, total: 4, branch: 'chaos' },
            giver: { name: 'Wachenhauptmann', location: 'Dorfzentrum', faction: 'village' },
            difficulty: 'hard',
            duration: 30,
            requirements: {
                flags: { village_corrupt: true }
            },
            narrative: {
                hook: 'Deine Wahrheit hat das Dorf destabilisiert.',
                conflict: 'Kannst du es retten?',
                stakes: 'Das Schicksal von Grenzwald'
            },
            objectives: [
                { type: 'combat', target: 'bandit_raiders', count: 3, text: 'Vertreibe 3 Banditengruppen' },
                { type: 'protect', target: 'village_civilians', count: 5, text: 'Beschütze 5 Zivilisten' }
            ],
            combat: {
                enemies: [
                    { type: 'bandit_raider', count: 3, level: 3 }
                ],
                difficulty: 'hard'
            },
            rewards: {
                xp: 35,
                gold: 2,
                silver: 200,
                reputation: { village: 20 },
                karma: 15
            }
        }
    ],
    
    // === STORYLINE: KIRAS NETZ ===
    // Eine Storyline über Intrigen und Geheimnisse
    
    kira_network_saga: [
        {
            id: 'kira_whispers',
            title: 'Flüstern im Dunkeln',
            description: 'Gerüchte über ein geheimes Netzwerk kursieren im Dorf. Wer zieht im Hintergrund die Fäden?',
            category: 'investigation',
            chainPart: { chainId: 'kiras_netz', index: 0, total: 4 },
            giver: { name: 'Informant', location: 'Taverne', faction: 'kira' },
            difficulty: 'easy',
            duration: 12,
            narrative: {
                hook: 'Gerüchte über ein geheimes Netzwerk kursieren.',
                conflict: 'Wer zieht im Hintergrund die Fäden?',
                stakes: 'Wissen ist Macht'
            },
            objectives: [
                { type: 'investigate', target: 'tavern_rumors', count: 3, text: 'Lausche 3 Gesprächen in der Taverne' },
                { type: 'collect', target: 'informant_clues', count: 2, text: 'Sammle 2 Hinweise von Informanten' }
            ],
            decisions: [
                { 
                    id: 'dig_deeper', 
                    text: 'Tiefer graben',
                    effects: { addObjectives: [{ id: 'shadow_contact', text: 'Finde den Kontaktmann', trigger: 'investigate', target: 1 }] }
                },
                { 
                    id: 'ignore_rumors', 
                    text: 'Gerüchte ignorieren',
                    effects: { rewardModifier: { xp: 3, karma: 5 } }
                }
            ],
            rewards: {
                xp: 10,
                silver: 40,
                reputation: { kira: 3 }
            }
        },
        {
            id: 'kira_network',
            title: 'Das Netzwerk',
            description: 'Du findest Hinweise auf ein weitverzweigtes Spionagenetz. Die Wahl steht bevor: Teil davon werden oder es zerstören?',
            category: 'moral',
            chainPart: { chainId: 'kiras_netz', index: 1, total: 4 },
            giver: { name: 'Kira', location: 'Schwarzmarkt', faction: 'kira' },
            difficulty: 'medium',
            duration: 20,
            narrative: {
                hook: 'Ein Spionagenetz. Kontrolle über Informationen.',
                conflict: 'Teil davon werden oder zerstören?',
                stakes: 'Deine Loyalität'
            },
            objectives: [
                { type: 'talk', target: 'kira', count: 1, text: 'Triff Kira persönlich' },
                { type: 'investigate', target: 'network_scope', count: 1, text: 'Erfahre das Ausmaß des Netzwerks' }
            ],
            decisions: [
                { 
                    id: 'join_kira', 
                    text: 'Kira beitreten',
                    effects: { rewardModifier: { karma: -5, reputation: { kira: 10 } } }
                },
                { 
                    id: 'expose_kira', 
                    text: 'Netzwerk aufdecken',
                    effects: { rewardModifier: { karma: 5, reputation: { kira: -15 } } }
                }
            ],
            outcomes: [
                {
                    decisionId: 'join_kira',
                    text: 'Du schwörst Kira die Treue. Das Netzwerk öffnet sich dir.',
                    effects: { 
                        karma: -3, 
                        reputation: { kira: 15 }, 
                        flags: { kira_network_member: true, kira_trusted: true }
                    }
                },
                {
                    decisionId: 'expose_kira',
                    text: 'Du informierst die Wachen. Das Netzwerk wird zerschlagen - aber Kira entkommt.',
                    effects: { 
                        karma: 8, 
                        reputation: { kira: -20, village: 5 }, 
                        flags: { kira_network_exposed: true, kira_enemy: true }
                    }
                }
            ],
            rewards: {
                xp: 20,
                gold: 1,
                silver: 80
            }
        },
        // BRANCH A: Kira beigetreten
        {
            id: 'kira_inner_circle',
            title: 'Der Innere Kreis',
            description: 'Als vertrautes Mitglied wirst du in Kiras geheime Pläne eingeweiht. Doch der Preis ist hoch.',
            category: 'story',
            chainPart: { chainId: 'kiras_netz', index: 2, total: 4, branch: 'member' },
            giver: { name: 'Kira', location: 'Hauptquartier', faction: 'kira' },
            difficulty: 'hard',
            duration: 25,
            requirements: {
                flags: { kira_network_member: true }
            },
            narrative: {
                hook: 'Kira vertraut dir. Aber Vertrauen hat einen Preis.',
                conflict: 'Wie weit gehst du für Macht?',
                stakes: 'Deine Seele'
            },
            objectives: [
                { type: 'deliver', target: 'secret_package', count: 1, text: 'Überbringe ein geheimes Paket' },
                { type: 'talk', target: 'corrupt_official', count: 1, text: 'Besteche einen Beamten' }
            ],
            decisions: [
                { 
                    id: 'do_dirty_work', 
                    text: 'Die Drecksarbeit erledigen',
                    effects: { rewardModifier: { karma: -10, gold: 2 } }
                },
                { 
                    id: 'refuse_order', 
                    text: 'Den Befehl verweigern',
                    effects: { rewardModifier: { karma: 5, reputation: { kira: -10 } } }
                }
            ],
            rewards: {
                xp: 25,
                gold: 3,
                reputation: { kira: 10 }
            }
        },
        // BRANCH B: Kira verraten
        {
            id: 'kira_hunt',
            title: 'Die Jagd auf Kira',
            description: 'Kira ist auf der Flucht. Die Wachen brauchen deine Hilfe, um sie zu fassen.',
            category: 'story',
            chainPart: { chainId: 'kiras_netz', index: 2, total: 4, branch: 'enemy' },
            giver: { name: 'Wachenhauptmann', location: 'Dorfzentrum', faction: 'village' },
            difficulty: 'hard',
            duration: 25,
            requirements: {
                flags: { kira_network_exposed: true }
            },
            narrative: {
                hook: 'Kira ist auf der Flucht.',
                conflict: 'Gerechtigkeit oder Gnade?',
                stakes: 'Das Gesetz'
            },
            objectives: [
                { type: 'investigate', target: 'kira_hideout', count: 1, text: 'Finde Kiras Versteck' },
                { type: 'combat', target: 'kira_guard', count: 2, text: 'Besiege 2 Wachen' }
            ],
            decisions: [
                { 
                    id: 'capture_kira', 
                    text: 'Kira gefangen nehmen',
                    effects: { rewardModifier: { karma: 3, reputation: { village: 10 } } }
                },
                { 
                    id: 'let_escape', 
                    text: 'Entkommen lassen',
                    effects: { rewardModifier: { karma: -5, reputation: { kira: 5 } } }
                }
            ],
            rewards: {
                xp: 25,
                gold: 2,
                reputation: { village: 15 }
            }
        },
        // QUEST 4: Cross-Story Impact
        {
            id: 'kira_grenzwald_connection',
            title: 'Verbindungen',
            description: 'Die Ereignisse in Grenzwald und Kiras Netz verknüpfen sich. Nichts ist mehr wie es scheint.',
            category: 'story',
            chainPart: { chainId: 'kiras_netz', index: 3, total: 4 },
            giver: { name: 'Geheimnisvoller Bote', location: 'Grenzwald', faction: 'kira' },
            difficulty: 'hard',
            duration: 30,
            requirements: {
                // Entweder Kira-Mitglied ODER Chaos in Grenzwald
                flags: { 
                    $or: [
                        { kira_network_member: true },
                        { village_corrupt: true }
                    ]
                }
            },
            narrative: {
                hook: 'Die Welten kollidieren.',
                conflict: 'Nutze das Chaos oder beende es?',
                stakes: 'Die Zukunft beider Fraktionen'
            },
            objectives: [
                { type: 'investigate', target: 'connection_clues', count: 3, text: 'Finde 3 Verbindungen zwischen den Ereignissen' }
            ],
            rewards: {
                xp: 40,
                gold: 3,
                silver: 150
            }
        }
    ],
    
    // === STORY QUESTS ===
    // Hauptgeschichten mit mehreren Phasen
    
    story: [
        {
            id: 'story_banditen_grenzwald',
            title: 'Banditen am Grenzwald',
            description: 'Ein Händler berichtet von Überfällen nahe des Grenzwaldes. Mehrere Lieferungen sind verschwunden. Die Dorfbewohner bitten um Hilfe.',
            category: 'story',
            giver: { name: 'Taro', location: 'Marktplatz', type: 'merchant' },
            difficulty: 'medium',
            duration: 15,
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
                    ],
                    combat: {
                        enemies: [
                            { type: 'bandit', count: 3, level: 2 }
                        ],
                        difficulty: 'medium'
                    }
                },
                {
                    id: 'recovery',
                    name: 'Bergung',
                    description: 'Sichere die gestohlenen Waren und bringe sie zurück.',
                    objectives: [
                        { type: 'collect', target: 'stolen_goods', count: 1, text: 'Berge die gestohlenen Waren' },
                        { type: 'deliver', target: 'taro', count: 1, text: 'Liefere bei Taro ab' }
                    ]
                }
            ],
            dialogTree: {
                start: {
                    text: 'Taro sieht dich mit besorgter Miene an. "Ihr seht aus wie jemand, der mit Banditen umgehen kann. Ich habe ein Problem..."',
                    options: [
                        { text: 'Erzählt mir mehr.', next: 'details', karma: 0 },
                        { text: 'Wie viel zahlt ihr?', next: 'payment', karma: -1 },
                        { text: 'Das ist nicht mein Problem.', next: 'decline', karma: 0 }
                    ]
                },
                details: {
                    text: '"Meine Karawanen werden am Grenzwald überfallen. Drei Ladungen bereits verloren. Die Wachen sind zu feige."',
                    options: [
                        { text: 'Ich kümmere mich darum.', next: 'accept', karma: 2 },
                        { text: 'Ich brache mehr Informationen.', next: 'info', karma: 0 }
                    ]
                },
                payment: {
                    text: '"150 Gold, wie üblich. Aber wenn ihr die Waren zurückbringt... könnte ich 200 überlegen."',
                    options: [
                        { text: '200 klingt fair.', next: 'negotiate', skillCheck: { stat: 'cha', dc: 12 } },
                        { text: '150 reichen.', next: 'accept', karma: 1 }
                    ]
                },
                accept: {
                    text: '"Ausgezeichnet! Findet diese Banditen. Und Taro... erwartet Ergebnisse."',
                    result: 'quest_accepted'
                }
            },
            rewards: {
                xp: 10,
                gold: 2,
                silver: 50,
                karma: 3,
                reputation: { taro: 5, village: 3 }
            }
        },
        {
            id: 'story_verschwundene_lieferung',
            title: 'Die verschwundene Lieferung',
            description: 'Ein wichtiger Kurier ist auf der Nordroute verschwunden. Yuki braucht dringend diese Lieferung für ihre Schmiede.',
            category: 'story',
            giver: { name: 'Yuki', location: 'Schmiede', type: 'merchant' },
            difficulty: 'medium',
            duration: 12,
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
                    ],
                    combat: {
                        enemies: [
                            { type: 'bandit', count: 2, level: 2 }
                        ],
                        difficulty: 'medium'
                    }
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
            rewards: {
                xp: 10,
                gold: 1,
                silver: 70,
                karma: 2,
                reputation: { yuki: 5, village: 2 }
            }
        },
        {
            id: 'story_schatten_im_nebelwald',
            title: 'Schatten im Nebelwald',
            description: 'Seltsame Lichter wurden im Nebelwald gesichtet. Die Dorfbewohner fürchten sich vor einem Geist. Karl möchte, dass ihr nachschaut.',
            category: 'story',
            giver: { name: 'Karl', location: 'Dorfzentrum', type: 'authority' },
            difficulty: 'hard',
            duration: 20,
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
                    ],
                    combat: {
                        enemies: [
                            { type: 'shadow_beast', count: 1, level: 4, elite: true }
                        ],
                        difficulty: 'hard'
                    }
                },
                {
                    id: 'report',
                    name: 'Bericht',
                    description: 'Berichte Karl über das Ergebnis.',
                    objectives: [
                        { type: 'talk', target: 'karl', count: 1, text: 'Sprich mit Karl' }
                    ]
                }
            ],
            rewards: {
                xp: 15,
                gold: 3,
                silver: 0,
                karma: 4,
                reputation: { karl: 8, village: 5 }
            }
        }
    ],
    
    // === MERCHANT QUESTS ===
    // Händler-Aufträge von Taro, Yuki, Shin, Kira
    
    merchant: [
        {
            id: 'merchant_taro_waren',
            title: '[Händlerauftrag] Waren beschaffen',
            description: 'Taro braucht jemanden, der spezielle Waren aus der Stadt besorgt. Eine diskrete Angelegenheit.',
            category: 'merchant',
            giver: { name: 'Taro', location: 'Marktplatz', type: 'merchant' },
            difficulty: 'easy',
            duration: 8,
            objectives: [
                { type: 'travel', target: 'stadt', count: 1, text: 'Reise zur Stadt' },
                { type: 'collect', target: 'special_goods', count: 1, text: 'Besorge die Waren' },
                { type: 'deliver', target: 'taro', count: 1, text: 'Liefere bei Taro ab' }
            ],
            rewards: {
                xp: 5,
                gold: 1,
                silver: 20,
                reputation: { taro: 3 }
            }
        },
        {
            id: 'merchant_yuki_materialien',
            title: '[Händlerauftrag] Seltene Materialien',
            description: 'Yuki benötigt seltene Erze für ihre Schmiede. Die Minen im Osten sollen welche haben.',
            category: 'merchant',
            giver: { name: 'Yuki', location: 'Schmiede', type: 'merchant' },
            difficulty: 'medium',
            duration: 12,
            objectives: [
                { type: 'travel', target: 'osten_minen', count: 1, text: 'Reise zu den Minen' },
                { type: 'collect', target: 'rare_ore', count: 5, text: 'Sammle 5 seltene Erze' },
                { type: 'deliver', target: 'yuki', count: 1, text: 'Liefere bei Yuki ab' }
            ],
            rewards: {
                xp: 8,
                gold: 1,
                silver: 50,
                reputation: { yuki: 4 }
            }
        },
        {
            id: 'merchant_shin_informationen',
            title: '[Händlerauftrag] Informationen sammeln',
            description: 'Shin möchte wissen, was auf dem Schwarzmarkt vor sich geht. Hört euch um.',
            category: 'merchant',
            giver: { name: 'Shin', location: 'Händlerviertel', type: 'merchant' },
            difficulty: 'medium',
            duration: 10,
            objectives: [
                { type: 'investigate', target: 'blackmarket_rumors', count: 3, text: 'Sammle 3 Informationen' },
                { type: 'talk', target: 'shin', count: 1, text: 'Berichte Shin' }
            ],
            rewards: {
                xp: 7,
                gold: 1,
                silver: 30,
                reputation: { shin: 4 }
            }
        },
        {
            id: 'merchant_kira_besorgung',
            title: '[Verdächtige Anfrage] Diskrete Besorgung',
            description: 'Kira möchte diskret mit euch sprechen. Sie braucht jemanden für eine... besondere Besorgung.',
            category: 'blackmarket',
            giver: { name: 'Kira', location: 'Schwarzmarkt', type: 'blackmarket' },
            difficulty: 'medium',
            duration: 10,
            requirements: {
                karma: { max: 20 } // Nur für zwielichtige Charaktere
            },
            objectives: [
                { type: 'collect', target: 'black_market_goods', count: 1, text: 'Besorge die Ware' },
                { type: 'deliver', target: 'kira', count: 1, text: 'Liefere bei Kira ab' }
            ],
            rewards: {
                xp: 6,
                gold: 2,
                silver: 0,
                karma: -3,
                reputation: { kira: 5, blackmarket: 3 }
            }
        }
    ],
    
    // === INVESTIGATION QUESTS ===
    // Ermittlungen und Hinweissuchen
    
    investigation: [
        {
            id: 'investigation_vermisster_bürger',
            title: '[Ermittlung] Vermisster Bürger',
            description: 'Ein Bürger ist seit drei Tagen verschwunden. Seine Familie bittet um Hilfe bei der Suche.',
            category: 'investigation',
            giver: { name: 'Dorfbewohner', location: 'Dorf', type: 'villager' },
            difficulty: 'medium',
            duration: 15,
            objectives: [
                { type: 'investigate', target: 'missing_person_clues', count: 4, text: 'Finde 4 Hinweise' },
                { type: 'discover', target: 'missing_person_location', count: 1, text: 'Finde den Vermissten' }
            ],
            rewards: {
                xp: 9,
                gold: 1,
                silver: 0,
                karma: 3,
                reputation: { village: 4 }
            }
        },
        {
            id: 'investigation_diebstahl',
            title: '[Ermittlung] Diebstahl im Tempel',
            description: 'Aus dem Dorftempel wurden wertvolle Gegenstände gestohlen. Der Pastor bittet um diskrete Hilfe.',
            category: 'investigation',
            giver: { name: 'Pastor', location: 'Tempel', type: 'church' },
            difficulty: 'medium',
            duration: 12,
            objectives: [
                { type: 'investigate', target: 'temple_clues', count: 3, text: 'Untersuche den Tatort' },
                { type: 'find', target: 'stolen_items', count: 1, text: 'Finde die gestohlenen Gegenstände' }
            ],
            rewards: {
                xp: 8,
                gold: 0,
                silver: 80,
                karma: 4,
                reputation: { pastor: 5, church: 4 }
            }
        },
        {
            id: 'investigation_schmuggel',
            title: '[Ermittlung] Schmuggelverdacht',
            description: 'Karl verdächtigt Schmuggel im Hafen. Untersucht die Lage, aber diskret.',
            category: 'investigation',
            giver: { name: 'Karl', location: 'Dorfzentrum', type: 'authority' },
            difficulty: 'hard',
            duration: 18,
            objectives: [
                { type: 'investigate', target: 'harbor_suspicious', count: 5, text: 'Untersuche 5 verdächtige Aktivitäten' },
                { type: 'collect_evidence', target: 'smuggling_proof', count: 1, text: 'Sammle Beweise' }
            ],
            rewards: {
                xp: 12,
                gold: 2,
                silver: 50,
                karma: 3,
                reputation: { karl: 6 }
            }
        }
    ],
    
    // === MORAL QUESTS ===
    // Moralische Entscheidungen mit Karma-Auswirkungen
    
    moral: [
        {
            id: 'moral_bettler',
            title: '[Moralische Entscheidung] Der Bettler',
            description: 'Ein Bettler bittet um Hilfe. Ihr könnt ihm helfen, ihn ignorieren, oder... etwas anderes tun.',
            category: 'moral',
            giver: { name: 'Bettler', location: 'Marktplatz', type: 'villager' },
            difficulty: 'easy',
            duration: 5,
            dialogTree: {
                start: {
                    text: 'Ein alter Bettler sieht euch flehend an. "Bitte, edler Shinobi. Ein paar Münzen für einen Hungrigen?"',
                    options: [
                        { text: 'Hier, nimm dies. [5 Silber geben]', next: 'help', karma: 2 },
                        { text: 'Geh arbeiten.', next: 'reject', karma: -1 },
                        { text: 'Zeig mir erst, dass du es verdienst.', next: 'test', karma: 0 }
                    ]
                },
                help: {
                    text: '"Oh, danke! Mögen die Götter euch segnen!" Der Bettler verschwindet mit den Münzen.',
                    result: 'quest_completed',
                    rewards: { karma: 2, reputation: { village: 1 } }
                },
                reject: {
                    text: 'Der Bettler sieht euch vorwurfsvoll an. "Wie alle anderen auch..."',
                    result: 'quest_completed',
                    rewards: { karma: -1 }
                },
                test: {
                    text: '"Verdienen? Ich... ich könnte euch eine Information geben. Über den Schwarzmarkt."',
                    options: [
                        { text: 'Das ist ein Anfang. [Silber geben]', next: 'info', karma: 1 },
                        { text: 'Ich habe meine Meinung geändert.', next: 'reject', karma: 0 }
                    ]
                },
                info: {
                    text: '"Kira hat neue Ware bekommen. Gefährliches Zeug. Passt auf euch auf."',
                    result: 'quest_completed',
                    rewards: { karma: 1, reputation: { village: 1 }, info: 'kira_new_goods' }
                }
            },
            rewards: {
                xp: 3,
                gold: 0,
                silver: 0
            }
        },
        {
            id: 'moral_zeuge',
            title: '[Moralische Entscheidung] Der Zeuge',
            description: 'Ihr habt einen Verbrechen beobachtet. Meldet ihr es bei Karl oder schweigt ihr?',
            category: 'moral',
            giver: { name: 'Euch selbst', location: 'variabel', type: 'self' },
            difficulty: 'medium',
            duration: 8,
            dialogTree: {
                start: {
                    text: 'Ihr habt gesehen, wie ein Wache Bestechungsgeld annahm. Was tut ihr?',
                    options: [
                        { text: 'Bei Karl melden.', next: 'report', karma: 3 },
                        { text: 'Die Wache konfrontieren.', next: 'confront', karma: 1 },
                        { text: 'Schweigen und vergessen.', next: 'silent', karma: -2 },
                        { text: 'Die Wache erpressen.', next: 'blackmail', karma: -4 }
                    ]
                },
                report: {
                    text: 'Karl nimmt euren Bericht ernst. "Das wird Konsequenzen haben. Gut gemacht."',
                    result: 'quest_completed',
                    rewards: { karma: 3, reputation: { karl: 3 } }
                },
                confront: {
                    text: 'Die Wache wird rot. "Ich... es war nur dieses eine Mal! Hier, nehmt das und vergesst es."',
                    result: 'quest_completed',
                    rewards: { karma: 1, gold: 0, silver: 30 }
                },
                silent: {
                    text: 'Ihr geht weiter. Die Korruption bleibt ungestraft.',
                    result: 'quest_completed',
                    rewards: { karma: -2 }
                },
                blackmail: {
                    text: '"Ihr... ihr wollt Geld? Hier. Aber das ist das letzte Mal!"',
                    result: 'quest_completed',
                    rewards: { karma: -4, gold: 1, silver: 0, reputation: { village: -2 } }
                }
            },
            rewards: {
                xp: 5,
                gold: 0,
                silver: 0
            }
        }
    ],
    
    // === COMBAT QUESTS ===
    // Schnelle Kampf-Quests
    
    combat: [
        {
            id: 'combat_wölfe',
            title: '[Kampf] Wölfe am Stadtrand',
            description: 'Wölfe haben sich dem Stadtrand genähert und greifen Reisende an.',
            category: 'combat',
            giver: { name: 'Wachenhauptmann', location: 'Stadttor', type: 'guard' },
            difficulty: 'easy',
            duration: 8,
            combat: {
                enemies: [
                    { type: 'wolf', count: 3, level: 1 }
                ],
                difficulty: 'easy'
            },
            objectives: [
                { type: 'combat', target: 'wolf', count: 3, text: 'Besiege 3 Wölfe' }
            ],
            rewards: {
                xp: 6,
                gold: 0,
                silver: 40,
                reputation: { village: 2 }
            }
        },
        {
            id: 'combat_banditen',
            title: '[Kampf] Banditen überfallen Reisende',
            description: 'Banditen haben einen Hinterhalt auf der Straße eingerichtet.',
            category: 'combat',
            giver: { name: 'Wachenhauptmann', location: 'Stadttor', type: 'guard' },
            difficulty: 'medium',
            duration: 10,
            combat: {
                enemies: [
                    { type: 'bandit', count: 2, level: 2 },
                    { type: 'bandit_leader', count: 1, level: 3 }
                ],
                difficulty: 'medium'
            },
            objectives: [
                { type: 'combat', target: 'bandit', count: 3, text: 'Besiege die Banditen' }
            ],
            rewards: {
                xp: 8,
                gold: 1,
                silver: 20,
                reputation: { village: 3 }
            }
        }
    ],
    
    // === DAILY QUESTS ===
    // Wiederholbare tägliche Quests
    
    daily: [
        {
            id: 'daily_patrouille',
            title: '[Täglich] Dorfpatrouille',
            description: 'Patrouilliere durch das Dorf und halte nach verdächtigen Aktivitäten Ausschau.',
            category: 'daily',
            giver: { name: 'Wachenhauptmann', location: 'Stadttor', type: 'guard' },
            difficulty: 'easy',
            duration: 6,
            objectives: [
                { type: 'patrol', target: 'village', count: 3, text: 'Patrouilliere 3 Bereiche' }
            ],
            rewards: {
                xp: 5,
                gold: 0,
                silver: 30,
                reputation: { village: 1 }
            }
        },
        {
            id: 'daily_vorräte',
            title: '[Täglich] Vorräte sammeln',
            description: 'Sammle Heilkräuter und Vorräte für den Dorfspeicher.',
            category: 'daily',
            giver: { name: 'Dorfbewohner', location: 'Dorf', type: 'villager' },
            difficulty: 'easy',
            duration: 5,
            objectives: [
                { type: 'collect', target: 'herbs', count: 5, text: 'Sammle 5 Heilkräuter' },
                { type: 'collect', target: 'food', count: 3, text: 'Sammle 3 Nahrungsmittel' }
            ],
            rewards: {
                xp: 4,
                gold: 0,
                silver: 25,
                reputation: { village: 1 }
            }
        },
        {
            id: 'daily_sparring',
            title: '[Täglich] Übungspartner',
            description: 'Trainiere mit den Dorfwachen und verbessere deine Kampffähigkeiten.',
            category: 'daily',
            giver: { name: 'Wachenhauptmann', location: 'Stadttor', type: 'guard' },
            difficulty: 'easy',
            duration: 7,
            combat: {
                enemies: [
                    { type: 'training_dummy', count: 1, level: 1 }
                ],
                difficulty: 'easy',
                type: 'sparring'
            },
            objectives: [
                { type: 'spar', target: 'guard', count: 3, text: 'Sparring mit 3 Wachen' }
            ],
            rewards: {
                xp: 5,
                gold: 0,
                silver: 20
            }
        }
    ],
    
    // === ELITE QUESTS ===
    // Seltene, schwere Herausforderungen
    
    elite: [
        {
            id: 'elite_schattenbestie',
            title: '[Elite] Die Schattenbestie',
            description: 'Eine mächtige Kreatur terrorisiert die Region. Nur erfahrene Shinobi sollten sich diesem Kampf stellen.',
            category: 'elite',
            giver: { name: 'Karl', location: 'Dorfzentrum', type: 'authority' },
            difficulty: 'very_hard',
            duration: 25,
            requirements: {
                level: 3
            },
            combat: {
                enemies: [
                    { type: 'shadow_beast_alpha', count: 1, level: 5, elite: true, boss: true }
                ],
                difficulty: 'very_hard'
            },
            objectives: [
                { type: 'combat', target: 'shadow_beast_alpha', count: 1, text: 'Besiege die Schattenbestie' }
            ],
            rewards: {
                xp: 20,
                gold: 5,
                silver: 0,
                karma: 5,
                reputation: { karl: 10, village: 8 },
                items: ['elite_reward_chest']
            }
        }
    ],
    
    // === CHAIN QUESTS ===
    // Quests die Teil einer Quest Chain / Storyline sind
    // Werden nicht zufällig generiert, sondern durch Chain-Fortschritt freigeschaltet
    
    chain: [
        // --- BANDITEN-SAGA ---
        {
            id: 'chain_banditen_zeichen',
            title: '[Saga] Die ersten Anzeichen',
            description: 'Taro berichtet von gestohlenen Waren am Grenzwald. Die Spuren deuten auf eine organisierte Bande hin.',
            category: 'story',
            chainPart: { chainId: 'banditen_saga', index: 0, total: 4 },
            giver: { name: 'Taro', location: 'Marktplatz', type: 'merchant' },
            difficulty: 'easy',
            duration: 10,
            objectives: [
                { type: 'travel', target: 'grenzwald', count: 1, text: 'Reise zum Grenzwald' },
                { type: 'investigate', target: 'cart_tracks', count: 1, text: 'Untersuche die Wagenspuren' },
                { type: 'collect', target: 'bandit_clue', count: 2, text: 'Sammle 2 Beweisstücke' }
            ],
            decisions: [
                { id: 'follow_tracks', text: 'Den Spuren folgen', effects: { addObjectives: [{ id: 'scout_camp', text: 'Spähe das Lager aus', trigger: 'exploration', target: 1 }] } },
                { id: 'report_back', text: 'Zuerst Taro berichten', effects: { rewardModifier: { xp: 3, reputation: { taro: 2 } } } }
            ],
            rewards: {
                xp: 8,
                silver: 40,
                karma: 1,
                reputation: { taro: 3 }
            }
        },
        {
            id: 'chain_banditen_versteck',
            title: '[Saga] Das Versteck',
            description: 'Die Spuren führen zu einem alten Versteck im Grenzwald. Die Banditen scheinen vorbereitet zu sein.',
            category: 'story',
            chainPart: { chainId: 'banditen_saga', index: 1, total: 4 },
            giver: { name: 'Späher', location: 'Grenzwald', type: 'guard' },
            difficulty: 'medium',
            duration: 15,
            objectives: [
                { type: 'discover', target: 'bandit_hideout', count: 1, text: 'Finde das Versteck' },
                { type: 'combat', target: 'bandit_scout', count: 2, text: 'Besiege 2 Banditen-Späher' }
            ],
            combat: {
                enemies: [
                    { type: 'bandit_scout', count: 2, level: 2 }
                ],
                difficulty: 'medium'
            },
            decisions: [
                { id: 'stealth_approach', text: 'Sich anschleichen', effects: { rewardModifier: { xp: 5 }, replaceObjectives: [{ id: 'sneak_past', text: 'Schleiche dich an den Wachen vorbei', trigger: 'exploration', target: 1 }] } },
                { id: 'direct_assault', text: 'Direkter Angriff', effects: { rewardModifier: { xp: 3, silver: 20 }, addObjectives: [{ id: 'defeat_guards', text: 'Besiege die Wachen', trigger: 'combat_won', target: 3 }] } }
            ],
            rewards: {
                xp: 10,
                silver: 60,
                reputation: { village: 2 }
            }
        },
        {
            id: 'chain_banditen_anfuehrer',
            title: '[Saga] Der Anführer',
            description: 'Du hast das Hauptlager gefunden. Der Banditen-Anführer wartet. Die Entscheidung über sein Schicksal wird die Saga prägen.',
            category: 'story',
            chainPart: { chainId: 'banditen_saga', index: 2, total: 4 },
            giver: { name: 'Wachenhauptmann', location: 'Grenzwald', type: 'guard' },
            difficulty: 'hard',
            duration: 20,
            objectives: [
                { type: 'combat', target: 'bandit_leader', count: 1, text: 'Stelle dich dem Anführer' }
            ],
            combat: {
                enemies: [
                    { type: 'bandit_leader', count: 1, level: 4, elite: true },
                    { type: 'bandit', count: 2, level: 2 }
                ],
                difficulty: 'hard'
            },
            decisions: [
                { id: 'spare_leader', text: 'Den Anführer verschonen', effects: { rewardModifier: { karma: 5, xp: 5 } } },
                { id: 'defeat_leader', text: 'Den Anführer besiegen', effects: { rewardModifier: { karma: -2, xp: 10, silver: 50 } } }
            ],
            outcomes: [
                { decisionId: 'spare_leader', text: 'Du verschonst den Anführer. Er schwört, das Dorf nie wieder anzugreifen. Die Banditen zerstreuen sich.', rewards: { karma: 3, reputation: { village: 5 } }, effects: { karma: 3, reputation: { village: 5 } } },
                { decisionId: 'defeat_leader', text: 'Der Anführer fällt. Seine Bande flieht in alle Richtungen. Frieden kehrt ein.', rewards: { karma: -1, reputation: { karl: 5 } }, effects: { karma: -1, reputation: { karl: 5 } } }
            ],
            rewards: {
                xp: 15,
                gold: 1,
                silver: 50,
                reputation: { village: 4 }
            }
        },
        {
            id: 'chain_banditen_spitzel_mercy',
            title: '[Saga] Der Spitzel',
            description: 'Der verschonte Anführer schickt einen Boten. Er hat Informationen über einen Verräter im Dorf.',
            category: 'story',
            chainPart: { chainId: 'banditen_saga', index: 3, total: 4, branch: 'mercy' },
            giver: { name: 'Banditen-Bote', location: 'Grenzwald', type: 'bandit' },
            difficulty: 'medium',
            duration: 12,
            objectives: [
                { type: 'investigate', target: 'village_spy', count: 1, text: 'Finde den Spitzel' },
                { type: 'talk', target: 'spy', count: 1, text: 'Stelle den Spitzel zur Rede' }
            ],
            decisions: [
                { id: 'expose_spy', text: 'Den Spitzel bei Karl anzeigen', effects: { rewardModifier: { karma: 3, reputation: { karl: 5 } } } },
                { id: 'blackmail_spy', text: 'Den Spitzel erpressen', effects: { rewardModifier: { karma: -4, gold: 1 } } }
            ],
            rewards: {
                xp: 12,
                silver: 40,
                karma: 2
            }
        },
        {
            id: 'chain_banditen_spitzel_ruthless',
            title: '[Saga] Der Spitzel',
            description: 'Obwohl der Anführer besiegt wurde, gibt es Gerüchte über einen Spitzel im Dorf.',
            category: 'story',
            chainPart: { chainId: 'banditen_saga', index: 3, total: 4, branch: 'ruthless' },
            giver: { name: 'Wachenhauptmann', location: 'Dorfzentrum', type: 'guard' },
            difficulty: 'medium',
            duration: 12,
            objectives: [
                { type: 'investigate', target: 'village_spy', count: 1, text: 'Finde den Spitzel' },
                { type: 'combat', target: 'spy', count: 1, text: 'Feste den Spitzel' }
            ],
            decisions: [
                { id: 'interrogate', text: 'Den Spitzel verhören', effects: { rewardModifier: { karma: 1, xp: 5 } } },
                { id: 'turn_spy', text: 'Den Spitzel umdrehen', effects: { rewardModifier: { karma: -2, reputation: { kira: 5 } } } }
            ],
            rewards: {
                xp: 12,
                silver: 30,
                reputation: { karl: 3 }
            }
        },
        
        // --- KIRAS TEST ---
        {
            id: 'chain_kira_lieferung',
            title: '[Test] Die erste Lieferung',
            description: 'Kira braucht jemanden Vertrauenswürdiges für eine Lieferung. Beweise, dass du diskret bist.',
            category: 'blackmarket',
            chainPart: { chainId: 'kira_vertrauen', index: 0, total: 3 },
            giver: { name: 'Kira', location: 'Schwarzmarkt', type: 'blackmarket' },
            difficulty: 'easy',
            duration: 10,
            requirements: {
                karma: { max: 15 }
            },
            objectives: [
                { type: 'collect', target: 'black_market_goods', count: 1, text: 'Nimm die Ware entgegen' },
                { type: 'deliver', target: 'drop_point', count: 1, text: 'Bringe die Ware zum Abgabepunkt' }
            ],
            decisions: [
                { id: 'silent_delivery', text: 'Lautlos und schnell', effects: { rewardModifier: { reputation: { kira: 3 } } } },
                { id: 'ask_questions', text: 'Nachfragen stellen', effects: { rewardModifier: { xp: 3, karma: -1 } } }
            ],
            rewards: {
                xp: 6,
                gold: 1,
                silver: 20,
                karma: -2,
                reputation: { kira: 4 }
            }
        },
        {
            id: 'chain_kira_informant',
            title: '[Test] Der Informant',
            description: 'Kira verdächtigt jemanden im Dorf, gegen sie zu arbeiten. Finde heraus, wer es ist.',
            category: 'blackmarket',
            chainPart: { chainId: 'kira_vertrauen', index: 1, total: 3 },
            giver: { name: 'Kira', location: 'Schwarzmarkt', type: 'blackmarket' },
            difficulty: 'medium',
            duration: 15,
            objectives: [
                { type: 'investigate', target: 'informant_clues', count: 3, text: 'Sammle 3 Hinweise' },
                { type: 'discover', target: 'informant_identity', count: 1, text: 'Enthülle den Informanten' }
            ],
            decisions: [
                { id: 'report_to_kira', text: 'Kira berichten', effects: { rewardModifier: { reputation: { kira: 5 } } } },
                { id: 'warn_informant', text: 'Den Informanten warnen', effects: { rewardModifier: { karma: 2, reputation: { kira: -3 } } } }
            ],
            rewards: {
                xp: 10,
                gold: 1,
                silver: 50,
                karma: -1,
                reputation: { kira: 5 }
            }
        },
        {
            id: 'chain_kira_entscheidung_loyal',
            title: '[Test] Die Entscheidung',
            description: 'Kira bietet dir einen Platz in ihrem Netzwerk an. Deine Loyalität wird auf die Probe gestellt.',
            category: 'blackmarket',
            chainPart: { chainId: 'kira_vertrauen', index: 2, total: 3, branch: 'loyal' },
            giver: { name: 'Kira', location: 'Schwarzmarkt', type: 'blackmarket' },
            difficulty: 'hard',
            duration: 18,
            objectives: [
                { type: 'collect', target: 'smuggled_goods', count: 1, text: 'Besorge die Schmuggelware' },
                { type: 'deliver', target: 'client', count: 1, text: 'Liefere beim Kunden ab' }
            ],
            decisions: [
                { id: 'accept_alliance', text: 'Das Angebot annehmen', effects: { rewardModifier: { karma: -5, gold: 3 }, completeQuestImmediately: false } },
                { id: 'refuse_alliance', text: 'Ablehnen, aber diskret', effects: { rewardModifier: { karma: 2, xp: 5 } } }
            ],
            outcomes: [
                { decisionId: 'accept_alliance', text: 'Du schließt dich Kira an. Der Schwarzmarkt öffnet sich dir.', rewards: { karma: -3, reputation: { kira: 10 } }, effects: { karma: -3, reputation: { kira: 10 } } },
                { decisionId: 'refuse_alliance', text: 'Du lehnst ab. Kira respektiert deine Entscheidung, vertraut dir aber nicht mehr.', rewards: { karma: 2 }, effects: { karma: 2 } }
            ],
            rewards: {
                xp: 15,
                gold: 2,
                silver: 0,
                karma: -3
            }
        },
        {
            id: 'chain_kira_entscheidung_betray',
            title: '[Test] Die Entscheidung',
            description: 'Kira hat Wind davon bekommen, dass du den Informanten gewarnt hast. Sie konfrontiert dich.',
            category: 'blackmarket',
            chainPart: { chainId: 'kira_vertrauen', index: 2, total: 3, branch: 'betray' },
            giver: { name: 'Kira', location: 'Schwarzmarkt', type: 'blackmarket' },
            difficulty: 'hard',
            duration: 18,
            objectives: [
                { type: 'talk', target: 'kira', count: 1, text: 'Stelle dich der Konfrontation' },
                { type: 'combat', target: 'kira_goon', count: 2, text: 'Besiege Kiras Handlanger' }
            ],
            combat: {
                enemies: [
                    { type: 'thug', count: 2, level: 3 }
                ],
                difficulty: 'hard'
            },
            decisions: [
                { id: 'apologize', text: 'Um Vergebung bitten', effects: { rewardModifier: { karma: 1, silver: -50 } } },
                { id: 'fight_escape', text: 'Durchbrechen und fliehen', effects: { rewardModifier: { karma: -2, xp: 10 } } }
            ],
            rewards: {
                xp: 12,
                silver: 30,
                karma: -4
            }
        },
        
        // --- KIRCHEN-MYSTERIUM ---
        {
            id: 'chain_kirche_spur',
            title: '[Mysterium] Die Spur',
            description: 'Der Pastor ist besorgt. Wertvolle Tempel-Reliquien sind verschwunden und seltsame Fußspuren führen in den Keller.',
            category: 'investigation',
            chainPart: { chainId: 'kirche_mysterium', index: 0, total: 3 },
            giver: { name: 'Pastor', location: 'Tempel', type: 'church' },
            difficulty: 'easy',
            duration: 10,
            objectives: [
                { type: 'investigate', target: 'temple_keller', count: 1, text: 'Untersuche den Keller' },
                { type: 'collect', target: 'reliquary_shard', count: 1, text: 'Finde ein Reliquien-Scherbe' }
            ],
            decisions: [
                { id: 'tell_pastor', text: 'Den Pastor informieren', effects: { rewardModifier: { karma: 2, reputation: { pastor: 3 } } } },
                { id: 'investigate_alone', text: 'Allein weiterermitteln', effects: { rewardModifier: { xp: 3 } } }
            ],
            rewards: {
                xp: 7,
                silver: 30,
                karma: 2,
                reputation: { pastor: 3 }
            }
        },
        {
            id: 'chain_kirche_versteck',
            title: '[Mysterium] Das Versteck',
            description: 'Die Spuren führen zu einem alten Gewölbe unter dem Friedhof. Hier hat jemand das Versteck der Diebe entdeckt.',
            category: 'exploration',
            chainPart: { chainId: 'kirche_mysterium', index: 1, total: 3 },
            giver: { name: 'Novize', location: 'Tempel', type: 'church' },
            difficulty: 'medium',
            duration: 15,
            objectives: [
                { type: 'travel', target: 'friedhof_gewoelbe', count: 1, text: 'Finde das Gewölbe' },
                { type: 'combat', target: 'grave_robber', count: 2, text: 'Besiege 2 Grabräuber' },
                { type: 'collect', target: 'stolen_reliquary', count: 1, text: 'Berge die gestohlene Reliquie' }
            ],
            combat: {
                enemies: [
                    { type: 'grave_robber', count: 2, level: 2 }
                ],
                difficulty: 'medium'
            },
            decisions: [
                { id: 'return_immediately', text: 'Sofort zurückbringen', effects: { rewardModifier: { karma: 3, reputation: { pastor: 5 } } } },
                { id: 'examine_reliquary', text: 'Die Reliquie untersuchen', effects: { rewardModifier: { xp: 5 }, addObjectives: [{ id: 'study_runes', text: 'Entziffere die Runen', trigger: 'investigate', target: 1 }] } }
            ],
            rewards: {
                xp: 11,
                silver: 50,
                karma: 3,
                reputation: { pastor: 4 }
            }
        },
        {
            id: 'chain_kirche_wahrheit',
            title: '[Mysterium] Die Wahrheit',
            description: 'Die gestohlene Reliquie birgt ein Geheimnis. Jemand im Dorf hat den Diebstahl inszeniert. Die Wahrheit wird Konsequenzen haben.',
            category: 'moral',
            chainPart: { chainId: 'kirche_mysterium', index: 2, total: 3 },
            giver: { name: 'Pastor', location: 'Tempel', type: 'church' },
            difficulty: 'medium',
            duration: 12,
            objectives: [
                { type: 'investigate', target: 'conspirator', count: 1, text: 'Enthülle den Drahtzieher' },
                { type: 'talk', target: 'pastor', count: 1, text: 'Sprich mit dem Pastor' }
            ],
            decisions: [
                { id: 'truth_full', text: 'Die volle Wahrheit enthüllen', effects: { rewardModifier: { karma: 4, reputation: { pastor: 5, karl: 3 } } } },
                { id: 'truth_partial', text: 'Eine halbe Wahrheit sagen', effects: { rewardModifier: { karma: 0, xp: 3, reputation: { pastor: 2 } } } },
                { id: 'silence', text: 'Schweigen und das Geheimnis bewahren', effects: { rewardModifier: { karma: -3, gold: 1 } } }
            ],
            outcomes: [
                { decisionId: 'truth_full', text: 'Die Wahrheit kommt ans Licht. Der Pastor ist dankbar, das Dorf geschockt.', rewards: { karma: 2, reputation: { pastor: 5 } }, effects: { karma: 2, reputation: { pastor: 5 } } },
                { decisionId: 'truth_partial', text: 'Nur ein Teil der Wahrheit wird bekannt. Frieden bleibt gewahrt.', rewards: { karma: 0 }, effects: { karma: 0 } },
                { decisionId: 'silence', text: 'Das Geheimnis bleibt bewahrt. Doch die Schuld lastet auf dir.', rewards: { karma: -3, gold: 1 }, effects: { karma: -3, reputation: { pastor: -2 } } }
            ],
            rewards: {
                xp: 14,
                gold: 1,
                silver: 20,
                karma: 3
            }
        }
    ],
    
    // === HILFSMETHODEN ===
    
    /**
     * Findet ein Quest-Template anhand der ID
     * @param {string} id - Die Template-ID
     * @returns {Object|null}
     */
    getById(id) {
        const all = [
            ...this.story,
            ...this.merchant,
            ...this.investigation,
            ...this.moral,
            ...this.combat,
            ...this.daily,
            ...this.elite,
            ...this.chain,
            ...this.grenzwald_saga,
            ...this.kira_network_saga
        ];
        return all.find(q => q.id === id) || null;
    },
    
    /**
     * Gibt alle Templates eines Typs zurück
     * @param {string} type - Der Typ (story, merchant, etc.)
     * @returns {Array}
     */
    getByType(type) {
        return this[type] || [];
    },
    
    /**
     * Gibt alle verfügbaren Quests für einen Character zurück
     * @param {Object} character - Der Character
     * @returns {Array}
     */
    getAvailableForCharacter(character) {
        const all = [
            ...this.story,
            ...this.merchant,
            ...this.investigation,
            ...this.moral,
            ...this.combat,
            ...this.daily
        ];
        
        return all.filter(q => {
            if (!q.requirements) return true;
            
            // Level check
            if (q.requirements.level && character.level < q.requirements.level) return false;
            
            // Clan check
            if (q.requirements.clan && character.clan !== q.requirements.clan) return false;
            
            return true;
        });
    }
};

// Global verfügbar machen
window.QuestRegistryV4 = QuestRegistryV4;

// === QUEST POOL REGISTRATION ===
(function() {
    if (typeof window.QuestPool === 'undefined') {
        console.warn('[QuestRegistryV4] QuestPool nicht verfügbar - Registration übersprungen');
        return;
    }
    
    window.QuestPool.registerAll({
        story: QuestRegistryV4.story || [],
        merchant: QuestRegistryV4.merchant || [],
        investigation: QuestRegistryV4.investigation || [],
        moral: QuestRegistryV4.moral || [],
        combat: QuestRegistryV4.combat || [],
        daily: QuestRegistryV4.daily || [],
        chain: QuestRegistryV4.chain || [],
        grenzwald_saga: QuestRegistryV4.grenzwald_saga || [],
        kira_network_saga: QuestRegistryV4.kira_network_saga || []
    });
    
    console.log('[QuestRegistryV4] Templates im Pool registriert:', window.QuestPool.getStats());
})();
