/**
 * NPU Kekkei Genkai System - Phase 3
 * Spezielle Fähigkeiten für Bluterben (Sharingan, Byakugan, etc.)
 */

const KekkeiGenkaiSystem = {
    // ============================================
    // KEKKEI GENKAI DEFINITIONEN
    // ============================================
    
    KEKKEI: {
        sharingan: {
            id: 'sharingan',
            name: 'Sharingan',
            clan: 'uchiha',
            levels: 5,
            resource: 'aufladungen',
            maxResource: 400,
            dailyLimit: 50,
            
            // Tomoe-System
            tomoeStages: {
                1: { tomoe: 1, name: '1 Tomoe', unlockLevel: 1 },
                2: { tomoe: 1, name: '1 Tomoe', unlockLevel: 2 },
                3: { tomoe: 2, name: '2 Tomoe', unlockLevel: 3 },
                4: { tomoe: 2, name: '2 Tomoe', unlockLevel: 4 },
                5: { tomoe: 3, name: '3 Tomoe', unlockLevel: 5 }
            },
            
            // Fähigkeiten
            abilities: {
                genjutsu_blick: {
                    name: 'Genjutsu bei Blickkontakt',
                    unlockLevel: 1,
                    chakraCost: 10,
                    description: 'Setzt Ziel unter Genjutsu bei direktem Blickkontakt'
                },
                bewegung_lesen: {
                    name: 'Bewegung lesen',
                    unlockLevel: 1,
                    passive: true,
                    effects: { initiative: 2, ausweichen: 2 }
                },
                jutsu_kopieren: {
                    name: 'Jutsu kopieren',
                    unlockLevel: 2,
                    chakraCost: 20,
                    description: 'Kopiert ein gesehenes Jutsu (max C-Rang)'
                },
                vorahnung: {
                    name: 'Vorahnung',
                    unlockLevel: 3,
                    passive: true,
                    effects: { initiative: 3, perception: 5 }
                },
                mangekyou: {
                    name: 'Mangekyō Sharingan',
                    unlockLevel: 5,
                    special: true,
                    description: 'Ermöglicht mächtige Techniken (Kosten: Verlust von Sehkraft)'
                }
            }
        },
        
        byakugan: {
            id: 'byakugan',
            name: 'Byakugan',
            clan: 'hyuga',
            levels: 5,
            resource: 'chakra',
            
            abilities: {
                drecksicht: {
                    name: '360° Rundsicht',
                    unlockLevel: 1,
                    passive: true,
                    effects: { perception: 10, ausweichen: 3 }
                },
                chakra_sehen: {
                    name: 'Chakra-Sehen',
                    unlockLevel: 1,
                    passive: true,
                    description: 'Sieht Chakra-Pfade und -Punkte'
                },
                juuken: {
                    name: 'Jūken (Gentle Fist)',
                    unlockLevel: 2,
                    chakraCost: 15,
                    description: 'Angriff auf Chakra-Punkte'
                },
                kaiten: {
                    name: 'Kaiten (Rotation)',
                    unlockLevel: 3,
                    chakraCost: 25,
                    description: 'Absolute Verteidigung durch Rotation'
                }
            }
        },
        
        aburame: {
            id: 'aburame',
            name: 'Kikaichū',
            clan: 'aburame',
            levels: 5,
            resource: 'insekten',
            maxResource: 100,
            
            abilities: {
                insekten_kontrolle: {
                    name: 'Insekten-Kontrolle',
                    unlockLevel: 1,
                    passive: true,
                    description: 'Kontrolliert Kikaichū-Insekten'
                },
                chakra_absorb: {
                    name: 'Chakra-Absorption',
                    unlockLevel: 2,
                    chakraCost: 10,
                    description: 'Insekten absorbieren Gegner-Chakra'
                },
                insekten_klon: {
                    name: 'Insekten-Klon',
                    unlockLevel: 3,
                    chakraCost: 20,
                    description: 'Erstellt Klone aus Insekten'
                }
            }
        },
        
        nara: {
            id: 'nara',
            name: 'Schatten-Manipulation',
            clan: 'nara',
            levels: 5,
            resource: 'chakra',
            
            abilities: {
                schatten_binden: {
                    name: 'Schatten-Bindung',
                    unlockLevel: 1,
                    chakraCost: 15,
                    description: 'Bindet Ziel über Schatten'
                },
                schatten_verlaengern: {
                    name: 'Schatten-Verlängerung',
                    unlockLevel: 2,
                    chakraCost: 20,
                    description: 'Verlängert eigene Schatten'
                },
                schatten_würgen: {
                    name: 'Schatten-Würgen',
                    unlockLevel: 3,
                    chakraCost: 30,
                    description: 'Würgt Gegner über Schatten'
                }
            }
        },
        
        akimichi: {
            id: 'akimichi',
            name: 'Kalorien-Kontrolle',
            clan: 'akimichi',
            levels: 5,
            resource: 'kalorien',
            maxResource: 1000,
            
            abilities: {
                baika_no_jutsu: {
                    name: 'Baika no Jutsu',
                    unlockLevel: 1,
                    chakraCost: 20,
                    description: 'Vergrößert Körperteile'
                },
                super_groessenwuchs: {
                    name: 'Super-Größenwuchs',
                    unlockLevel: 3,
                    chakraCost: 40,
                    description: 'Wird zum Riesen'
                }
            }
        }
    },
    
    // ============================================
    // KEKKEI GENKAI VERWALTUNG
    // ============================================
    
    /**
     * Initialisiert Kekkei Genkai für Charakter
     */
    initKekkeiGenkai: function(character) {
        if (!character.clan) return;
        
        const kekkeiData = Object.values(this.KEKKEI).find(k => k.clan === character.clan);
        if (!kekkeiData) return;
        
        character.kekkeiGenkai = {
            id: kekkeiData.id,
            level: 1,
            resource: kekkeiData.resource,
            resourceCurrent: 0,
            resourceMax: kekkeiData.maxResource || 100,
            dailyUsed: 0,
            dailyLimit: kekkeiData.dailyLimit || 50,
            abilities: []
        };
        
        // Start-Fähigkeiten freischalten
        this.updateAbilities(character);
    },
    
    /**
     * Levelt Kekkei Genkai auf
     */
    levelUp: function(character) {
        if (!character.kekkeiGenkai) {
            return { success: false, error: 'Kein Kekkei Genkai vorhanden!' };
        }
        
        if (character.kekkeiGenkai.level >= 5) {
            return { success: false, error: 'Maximales Level erreicht!' };
        }
        
        character.kekkeiGenkai.level++;
        this.updateAbilities(character);
        
        const kekkeiData = this.KEKKEI[character.kekkeiGenkai.id];
        const tomoeInfo = kekkeiData.tomoeStages ? kekkeiData.tomoeStages[character.kekkeiGenkai.level] : null;
        
        return {
            success: true,
            message: `${kekkeiData.name} Level ${character.kekkeiGenkai.level}!`,
            tomoe: tomoeInfo
        };
    },
    
    /**
     * Aktualisiert verfügbare Fähigkeiten
     */
    updateAbilities: function(character) {
        if (!character.kekkeiGenkai) return;
        
        const kekkeiData = this.KEKKEI[character.kekkeiGenkai.id];
        if (!kekkeiData || !kekkeiData.abilities) return;
        
        character.kekkeiGenkai.abilities = [];
        
        for (const [key, ability] of Object.entries(kekkeiData.abilities)) {
            if (ability.unlockLevel <= character.kekkeiGenkai.level) {
                character.kekkeiGenkai.abilities.push({
                    key: key,
                    ...ability
                });
            }
        }
    },
    
    /**
     * Nutzt eine Fähigkeit
     */
    useAbility: function(character, abilityKey) {
        if (!character.kekkeiGenkai) {
            return { success: false, error: 'Kein Kekkei Genkai!' };
        }
        
        const ability = character.kekkeiGenkai.abilities.find(a => a.key === abilityKey);
        if (!ability) {
            return { success: false, error: 'Fähigkeit nicht verfügbar!' };
        }
        
        // Prüfe tägliches Limit
        if (character.kekkeiGenkai.dailyUsed >= character.kekkeiGenkai.dailyLimit) {
            return { success: false, error: 'Tägliches Limit erreicht!' };
        }
        
        // Prüfe Chakra
        if (ability.chakraCost && character.stats.chakra < ability.chakraCost) {
            return { success: false, error: 'Nicht genug Chakra!' };
        }
        
        // Verbrauch anwenden
        if (ability.chakraCost) {
            character.stats.chakra -= ability.chakraCost;
        }
        
        character.kekkeiGenkai.dailyUsed++;
        
        return {
            success: true,
            message: `${ability.name} aktiviert!`,
            effects: ability.effects
        };
    },
    
    /**
     * Setzt tägliche Limits zurück
     */
    resetDailyLimits: function(character) {
        if (character.kekkeiGenkai) {
            character.kekkeiGenkai.dailyUsed = 0;
        }
    },
    
    /**
     * Berechnet Effekte des Kekkei Genkai auf Charakterwerte
     */
    calculateEffects: function(character) {
        const effects = {
            initiative: 0,
            ausweichen: 0,
            perception: 0,
            combat: {}
        };
        
        if (!character.kekkeiGenkai) return effects;
        
        // Passive Fähigkeiten anwenden
        const kekkeiData = this.KEKKEI[character.kekkeiGenkai.id];
        if (!kekkeiData || !kekkeiData.abilities) return effects;
        
        for (const ability of character.kekkeiGenkai.abilities) {
            if (ability.passive && ability.effects) {
                if (ability.effects.initiative) effects.initiative += ability.effects.initiative;
                if (ability.effects.ausweichen) effects.ausweichen += ability.effects.ausweichen;
                if (ability.effects.perception) effects.perception += ability.effects.perception;
            }
        }
        
        return effects;
    },
    
    /**
     * Gibt Informationen über aktuelles Tomoe-Stadium (nur Sharingan)
     */
    getTomoeInfo: function(character) {
        if (!character.kekkeiGenkai || character.kekkeiGenkai.id !== 'sharingan') {
            return null;
        }
        
        const kekkeiData = this.KEKKEI.sharingan;
        return kekkeiData.tomoeStages[character.kekkeiGenkai.level];
    }
};

// Export
if (typeof window !== 'undefined') {
    window.KekkeiGenkaiSystem = KekkeiGenkaiSystem;
}
