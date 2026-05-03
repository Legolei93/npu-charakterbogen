/**
 * Talent-Datenbank für NPU
 * Enthält alle verfügbaren Talente mit Kosten und Effekten
 */

const TALENTS_DB = {
    // Chakra-Manipulation
    chakra_manipulation: {
        id: 'chakra_manipulation',
        name: 'Chakra-Manipulation',
        cost: 5,
        category: 'Chakra',
        description: 'Der Besitzer kann Chakra fließen lassen',
        effects: {
            chakraRegen: 5
        }
    },
    
    passive_chakra_regen: {
        id: 'passive_chakra_regen',
        name: 'Passive Chakra-Regeneration',
        cost: 5,
        category: 'Chakra',
        description: 'Regeneriere 5 Chakra pro Runde passiv',
        effects: {
            chakraRegen: 5
        }
    },
    
    improved_chakra_regen: {
        id: 'improved_chakra_regen',
        name: 'Verbesserte Chakra-Regeneration',
        cost: 15,
        category: 'Chakra',
        description: 'Regeneriere 10 Chakra pro Runde passiv',
        effects: {
            chakraRegen: 10
        },
        requires: ['passive_chakra_regen']
    },
    
    increased_chakra_1: {
        id: 'increased_chakra_1',
        name: 'Erhöhtes Chakra I',
        cost: 8,
        category: 'Chakra',
        description: '+20 maximales Chakra',
        effects: {
            chakraBonus: 20
        }
    },
    
    increased_chakra_2: {
        id: 'increased_chakra_2',
        name: 'Erhöhtes Chakra II',
        cost: 8,
        category: 'Chakra',
        description: '+20 maximales Chakra',
        effects: {
            chakraBonus: 20
        }
    },
    
    increased_chakra_3: {
        id: 'increased_chakra_3',
        name: 'Erhöhtes Chakra III',
        cost: 8,
        category: 'Chakra',
        description: '+20 maximales Chakra',
        effects: {
            chakraBonus: 20
        }
    },
    
    increased_chakra_4: {
        id: 'increased_chakra_4',
        name: 'Erhöhtes Chakra IV',
        cost: 15,
        category: 'Chakra',
        description: '+30 maximales Chakra',
        effects: {
            chakraBonus: 30
        }
    },
    
    increased_chakra_5: {
        id: 'increased_chakra_5',
        name: 'Erhöhtes Chakra V',
        cost: 15,
        category: 'Chakra',
        description: '+30 maximales Chakra',
        effects: {
            chakraBonus: 30
        }
    },
    
    chakra_control: {
        id: 'chakra_control',
        name: 'Chakra-Kontrolle',
        cost: 5,
        category: 'Chakra',
        description: 'Reduziere Chakra-Kosten um 10%',
        effects: {
            chakraCostReduction: 0.1
        }
    },
    
    combat_regen: {
        id: 'combat_regen',
        name: 'Kampf-Regeneration',
        cost: 5,
        category: 'Chakra',
        description: 'Regeneriere 3 Chakra pro Runde im Kampf',
        effects: {
            combatChakraRegen: 3
        }
    },
    
    improved_combat_regen: {
        id: 'improved_combat_regen',
        name: 'Verbesserte Kampf-Regeneration',
        cost: 10,
        category: 'Chakra',
        description: 'Regeneriere 6 Chakra pro Runde im Kampf',
        effects: {
            combatChakraRegen: 6
        },
        requires: ['combat_regen']
    },
    
    // Kampf-Talente
    high_speed_combat: {
        id: 'high_speed_combat',
        name: 'Hochgeschwindigkeitskampf',
        cost: 3,
        category: 'Kampf',
        description: '+2 Initiative',
        effects: {
            initiativeBonus: 2
        }
    },
    
    high_awareness: {
        id: 'high_awareness',
        name: 'Hohe Wachsamkeit',
        cost: 5,
        category: 'Kampf',
        description: '+3 auf Wahrnehmungswürfe',
        effects: {
            perceptionBonus: 3
        }
    },
    
    multi_counter: {
        id: 'multi_counter',
        name: 'Multi-Konter',
        cost: 5,
        category: 'Kampf',
        description: 'Kann mehrere Angriffe kontern',
        effects: {}
    },
    
    combo_attack: {
        id: 'combo_attack',
        name: 'Kombo-Angriff',
        cost: 3,
        category: 'Kampf',
        description: '+1 Schaden bei aufeinanderfolgenden Treffern',
        effects: {
            comboDamage: 1
        }
    },
    
    flinkheit: {
        id: 'flinkheit',
        name: 'Flinkheit',
        cost: 10,
        category: 'Kampf',
        description: '+2 Ausweichen',
        effects: {
            ausweichenBonus: 2
        }
    },
    
    parademeister: {
        id: 'parademeister',
        name: 'Parademeister',
        cost: 5,
        category: 'Kampf',
        description: '+1 RK bei Parade',
        effects: {
            paradeBonus: 1
        }
    },
    
    fighter: {
        id: 'fighter',
        name: 'Kämpfer',
        cost: 8,
        category: 'Kampf',
        description: '+2 Angriff',
        effects: {
            angriffBonus: 2
        }
    },
    
    improved_crit: {
        id: 'improved_crit',
        name: 'Verbesserter Kritischer Treffer',
        cost: 15,
        category: 'Kampf',
        description: 'Kritische Treffer bei 19-20',
        effects: {
            critRange: 19
        }
    },
    
    // Spezialisierungen
    specialization_ninjutsu: {
        id: 'specialization_ninjutsu',
        name: 'Spezialisierung: Ninjutsu',
        cost: 15,
        category: 'Spezialisierung',
        description: '+2 auf alle Ninjutsu-Angriffe',
        effects: {
            ninjutsuBonus: 2
        }
    },
    
    specialization_genjutsu: {
        id: 'specialization_genjutsu',
        name: 'Spezialisierung: Genjutsu',
        cost: 15,
        category: 'Spezialisierung',
        description: '+2 auf alle Genjutsu-Angriffe',
        effects: {
            genjutsuBonus: 2
        }
    },
    
    specialization_taijutsu: {
        id: 'specialization_taijutsu',
        name: 'Spezialisierung: Taijutsu',
        cost: 15,
        category: 'Spezialisierung',
        description: '+2 auf alle Taijutsu-Angriffe',
        effects: {
            taijutsuBonus: 2
        }
    },
    
    specialization_thrown: {
        id: 'specialization_thrown',
        name: 'Spezialisierung: Wurfwaffen',
        cost: 3,
        category: 'Spezialisierung',
        description: '+2 auf Wurfwaffen-Angriffe',
        effects: {
            thrownBonus: 2
        }
    },
    
    // Element-Talente
    element_fusion: {
        id: 'element_fusion',
        name: 'Element-Fusion',
        cost: 10,
        category: 'Element',
        description: 'Kann zwei Elemente kombinieren',
        effects: {}
    },
    
    element_affinity: {
        id: 'element_affinity',
        name: 'Element-Affinität',
        cost: 5,
        category: 'Element',
        description: '+1 Schaden mit dem Hauptelement',
        effects: {
            elementDamageBonus: 1
        }
    },
    
    // Verteidigung
    increased_chakra_resist: {
        id: 'increased_chakra_resist',
        name: 'Erhöhte Chakra-Resistenz',
        cost: 5,
        category: 'Verteidigung',
        description: '+2 auf Rettungswürfe gegen Genjutsu',
        effects: {
            genjutsuResist: 2
        }
    },
    
    improved_stamina: {
        id: 'improved_stamina',
        name: 'Verbesserte Ausdauer',
        cost: 5,
        category: 'Verteidigung',
        description: '+1 Ausdauer',
        effects: {
            staminaBonus: 1
        }
    }
};

// Talent-Kategorien für die Anzeige
const TALENT_CATEGORIES = {
    'Chakra': { icon: '⚡', name: 'Chakra-Talente' },
    'Kampf': { icon: '⚔️', name: 'Kampf-Talente' },
    'Spezialisierung': { icon: '🎯', name: 'Spezialisierungen' },
    'Element': { icon: '🔥', name: 'Element-Talente' },
    'Verteidigung': { icon: '🛡️', name: 'Verteidigungs-Talente' }
};

// Talent-Regeln
const TALENT_RULES = {
    startPoints: 5,
    maxTalents: 5,
    maxHighCostTalents: 2,
    highCostThreshold: 7,
    apPerTalentPoint: 5
};
