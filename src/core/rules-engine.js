/**
 * Rules Engine - Single Source of Truth für alle Berechnungen
 * 
 * Konsolidiert alle Berechnungslogik aus:
 * - app.js (calculateAll, calculateBaseStats, calculateTotalStats, calculateAllSkills)
 * - npu-core.js (calculateCharacter, calculateModifiers, calculateCombatValues)
 * - src/core/rules.js (bestehende Regeln)
 * - src/core/calculations.js (reine Funktionen)
 * 
 * WICHTIG: Diese Engine enthält KEINE DOM-Manipulation!
 * Nur reine Berechnungen: Input → Output
 */

const RulesEngine = {
    // === VERSION ===
    VERSION: '2.0.0',
    
    // === MODIFIKATOREN (Single Source of Truth!) ===
    // Konsolidiert aus 5 Duplikaten in der Codebasis
    
    /**
     * Berechnet den Modifikator für einen Attributwert
     * @param {number} value - Der Attributwert (8-20)
     * @returns {number} - Der Modifikator (-2 bis +5)
     * 
     * BUGFIX: Wert 7 gibt jetzt korrekt -2 (nicht -1)
     */
    getModifier(value) {
        if (value <= 7) return -2;
        if (value <= 9) return -1;
        if (value <= 11) return 0;
        if (value <= 13) return 1;
        if (value <= 15) return 2;
        if (value <= 17) return 3;
        if (value <= 19) return 4;
        return 5;
    },
    
    /**
     * Berechnet alle Modifikatoren für Attribute
     * @param {Object} attributes - Die Attribute (kk, ges, kon, gsw, itu, int, cha)
     * @returns {Object} - Die Modifikatoren
     */
    calculateModifiers(attributes) {
        if (!attributes) return {};
        
        return {
            kk: this.getModifier(attributes.kk || 8),
            ges: this.getModifier(attributes.ges || 8),
            kon: this.getModifier(attributes.kon || 8),
            gsw: this.getModifier(attributes.gsw || 8),
            itu: this.getModifier(attributes.itu || 8),
            int: this.getModifier(attributes.int || 8),
            cha: this.getModifier(attributes.cha || 8)
        };
    },
    
    // === HAUPTBERECHNUNG ===
    
    /**
     * Berechnet einen vollständigen Character
     * @param {Object} character - Der Character-Rohdaten
     * @returns {Object} - Die berechneten Werte (skills, combat, stats, modifiers)
     */
    calculateCharacter(character) {
        if (!character) return null;
        
        const attrs = character.baseAttributes || character.attributes || {};
        const mods = this.calculateModifiers(attrs);
        const level = character.level || 1;
        
        return {
            modifiers: mods,
            skills: this.calculateSkills(attrs, mods),
            combat: this.calculateCombatValues(mods, level),
            stats: this.calculateStats(mods, level, character.stats),
            resistances: this.calculateResistances(mods)
        };
    },
    
    // === SKILLS ===
    
    /**
     * Berechnet alle Fertigkeiten
     * Extrahiert aus app.js:1384-1416
     * @param {Object} attrs - Die Attribute
     * @param {Object} mods - Die Modifikatoren
     * @returns {Object} - Die Fertigkeiten
     */
    calculateSkills(attrs, mods) {
        attrs = attrs || {};
        mods = mods || this.calculateModifiers(attrs);
        
        return {
            koerperlich: {
                athletik: { 
                    base: Math.floor((attrs.kk + attrs.kon + attrs.ges) / 3), 
                    mod: this.getModifier(Math.floor((attrs.kk + attrs.kon + attrs.ges) / 3)) 
                },
                akrobatik: { 
                    base: Math.floor((attrs.kk + attrs.kk + attrs.kon) / 3), 
                    mod: this.getModifier(Math.floor((attrs.kk + attrs.kk + attrs.kon) / 3)) 
                },
                klettern: { 
                    base: Math.floor((attrs.kon + attrs.kon + attrs.kk) / 3), 
                    mod: this.getModifier(Math.floor((attrs.kon + attrs.kon + attrs.kk) / 3)) 
                },
                koerperbeherrschung: { 
                    base: Math.floor((attrs.kon + attrs.kk + attrs.gsw) / 3), 
                    mod: this.getModifier(Math.floor((attrs.kon + attrs.kk + attrs.gsw) / 3)) 
                },
                schleichen: { 
                    base: Math.floor((attrs.ges + attrs.ges + attrs.itu) / 3), 
                    mod: this.getModifier(Math.floor((attrs.ges + attrs.ges + attrs.itu) / 3)) 
                },
                verstecken_tarnen: { 
                    base: Math.floor((attrs.itu + attrs.ges + attrs.gsw) / 3), 
                    mod: this.getModifier(Math.floor((attrs.itu + attrs.ges + attrs.gsw) / 3)) 
                },
                fingerfertigkeit: { 
                    base: Math.floor((attrs.itu + attrs.int + attrs.ges) / 3), 
                    mod: this.getModifier(Math.floor((attrs.itu + attrs.int + attrs.ges) / 3)) 
                },
                waffentalent: { 
                    base: Math.floor((attrs.kk + attrs.ges + attrs.gsw) / 3), 
                    mod: this.getModifier(Math.floor((attrs.kk + attrs.ges + attrs.gsw) / 3)) 
                }
            },
            sozial: {
                menschenkenntnis: { 
                    base: Math.floor((attrs.cha + attrs.itu) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.itu) / 2)) 
                },
                redekunst_verhandeln: { 
                    base: Math.floor((attrs.cha + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.int) / 2)) 
                },
                beruhigen: { 
                    base: Math.floor((attrs.cha + attrs.ges) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.ges) / 2)) 
                },
                einschuechtern: { 
                    base: Math.floor((attrs.cha + attrs.kk) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.kk) / 2)) 
                },
                manipulieren: { 
                    base: Math.floor((attrs.cha + attrs.itu) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.itu) / 2)) 
                },
                alleinunterhalter: { 
                    base: Math.floor((attrs.cha + attrs.cha) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.cha) / 2)) 
                },
                flirten_verfuehren: { 
                    base: Math.floor((attrs.cha + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.cha + attrs.int) / 2)) 
                }
            },
            wissen: {
                naturwissenschaften: { 
                    base: Math.floor((attrs.itu + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.itu + attrs.int) / 2)) 
                },
                ueberlebenstechniken: { 
                    base: Math.floor((attrs.kk + attrs.kon) / 2), 
                    mod: this.getModifier(Math.floor((attrs.kk + attrs.kon) / 2)) 
                },
                pflanzenkunde_alchemie: { 
                    base: Math.floor((attrs.itu + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.itu + attrs.int) / 2)) 
                },
                tierkunde: { 
                    base: Math.floor((attrs.int + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.int + attrs.int) / 2)) 
                },
                geschichte: { 
                    base: Math.floor((attrs.int + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.int + attrs.int) / 2)) 
                },
                kriegskunst: { 
                    base: Math.floor((attrs.itu + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.itu + attrs.int) / 2)) 
                },
                handwerk_technologie: { 
                    base: Math.floor((attrs.kon + attrs.kk) / 2), 
                    mod: this.getModifier(Math.floor((attrs.kon + attrs.kk) / 2)) 
                },
                jutsu_wissen: { 
                    base: Math.floor((attrs.kon + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.kon + attrs.int) / 2)) 
                },
                medizin_heilkunst: { 
                    base: Math.floor((attrs.ges + attrs.int) / 2), 
                    mod: this.getModifier(Math.floor((attrs.ges + attrs.int) / 2)) 
                },
                chakrakontrolle: { 
                    base: Math.floor((attrs.int + attrs.int + attrs.kon) / 3), 
                    mod: this.getModifier(Math.floor((attrs.int + attrs.int + attrs.kon) / 3)) 
                }
            }
        };
    },
    
    // === COMBAT WERTE ===
    
    /**
     * Berechnet alle Kampfwerte
     * Extrahiert aus app.js:1420-1454
     * @param {Object} mods - Die Modifikatoren
     * @param {number} level - Das Level
     * @returns {Object} - Die Kampfwerte
     */
    calculateCombatValues(mods, level = 1) {
        mods = mods || {};
        
        return {
            initiative: 5 + (mods.ges || 0) + (mods.gsw || 0) + (mods.itu || 0),
            ausweichen: 5 + (mods.ges || 0) + Math.floor((mods.gsw || 0) / 2),
            angriff: 2 + Math.max((mods.kk || 0), (mods.ges || 0)),
            rk: 8, // Basis-RK (ohne Ausrüstung)
            ninjutsu: 2 + Math.floor(((mods.int || 0) + (mods.ges || 0)) / 2),
            taijutsu: (mods.kk || 0) + (mods.ges || 0),
            genjutsu: (mods.int || 0) + (mods.itu || 0),
            wahrnehmung: (mods.itu || 0) + (mods.int || 0),
            bewegungsradius: 10 + Math.max(0, (mods.gsw || 0) * 5),
            chakraWiderstand: (mods.kon || 0) + Math.floor((mods.int || 0) / 2),
            geistigerWiderstand: (mods.int || 0) + Math.floor((mods.itu || 0) / 2),
            inspiration: Math.floor(level / 5)
        };
    },
    
    // === STATS (HP, CHAKRA, STAMINA) ===
    
    /**
     * Berechnet alle Stats (HP, Chakra, Stamina)
     * EXAKT dieselbe Formel überall verwenden!
     * @param {Object} mods - Die Modifikatoren
     * @param {number} level - Das Level
     * @param {Object} currentStats - Aktuelle Werte (für current HP/Chakra)
     * @returns {Object} - Die Stats
     */
    calculateStats(mods, level = 1, currentStats = null) {
        mods = mods || {};
        
        // EXAKT dieselbe Formel wie in app.js:1470-1471!
        const baseHP = 30 + (mods.kon || 0) + 6 + ((level - 1) * 5);
        const baseChakra = 100 + (mods.kon || 0) + (mods.int || 0) + 22 + ((level - 1) * 7);
        
        return {
            hp: {
                current: currentStats?.hp?.current || baseHP,
                max: baseHP
            },
            chakra: {
                current: currentStats?.chakra?.current || baseChakra,
                max: baseChakra
            },
            stamina: Math.max(0, 3 + Math.max((mods.kon || 0), (mods.gsw || 0))),
            aufladungen: currentStats?.aufladungen || 0,
            karma: currentStats?.karma || 0
        };
    },
    
    /**
     * Berechnet Basis-Stats ohne Ausrüstung
     * Extrahiert aus app.js:2057-2080
     * @param {Object} character - Der Character
     * @returns {Object} - Die Basis-Stats
     */
    calculateBaseStats(character) {
        if (!character) return {};
        
        const attrs = character.baseAttributes || {};
        const mods = this.calculateModifiers(attrs);
        const level = character.level || 1;
        
        return {
            hp: 30 + (mods.kon || 0) + 6 + ((level - 1) * 5),
            chakra: 100 + (mods.kon || 0) + (mods.int || 0) + 22 + ((level - 1) * 7),
            rk: 8 + (mods.ges || 0),
            angriff: 2 + (mods.kk || 0),
            ausweichen: 5 + (mods.ges || 0) + Math.floor((mods.gsw || 0) / 2),
            initiative: 5 + (mods.ges || 0) + (mods.gsw || 0) + (mods.itu || 0)
        };
    },
    
    /**
     * Berechnet Gesamt-Stats inklusive Ausrüstung
     * Extrahiert aus app.js:2013-2051
     * @param {Object} character - Der Character
     * @returns {Object} - Die Gesamt-Stats
     */
    calculateTotalStats(character) {
        if (!character) return null;
        
        const base = this.calculateBaseStats(character);
        const equipment = this.calculateEquipmentBonuses(character.equipment);
        
        return {
            hp: {
                base: base.hp,
                bonus: equipment.hp || 0,
                total: base.hp + (equipment.hp || 0)
            },
            chakra: {
                base: base.chakra,
                bonus: equipment.chakra || 0,
                total: base.chakra + (equipment.chakra || 0)
            },
            rk: {
                base: base.rk,
                bonus: equipment.rk || 0,
                total: base.rk + (equipment.rk || 0)
            },
            angriff: {
                base: base.angriff,
                bonus: equipment.angriff || 0,
                total: base.angriff + (equipment.angriff || 0)
            },
            ausweichen: {
                base: base.ausweichen,
                bonus: equipment.ausweichen || 0,
                total: base.ausweichen + (equipment.ausweichen || 0)
            },
            initiative: {
                base: base.initiative,
                bonus: equipment.initiative || 0,
                total: base.initiative + (equipment.initiative || 0)
            }
        };
    },
    
    // === WIDERSTÄNDE ===
    
    /**
     * Berechnet alle Widerstände
     * @param {Object} mods - Die Modifikatoren
     * @returns {Object} - Die Widerstände
     */
    calculateResistances(mods) {
        mods = mods || {};
        
        return {
            chakra: (mods.kon || 0) + Math.floor((mods.int || 0) / 2),
            koerper: (mods.kon || 0),
            geist: (mods.int || 0) + Math.floor((mods.itu || 0) / 2)
        };
    },
    
    // === AUSRÜSTUNG ===
    
    /**
     * Berechnet Ausrüstungs-Boni
     * Extrahiert aus app.js:2085-2109
     * @param {Object} equipment - Die Ausrüstung
     * @returns {Object} - Die Boni
     */
    calculateEquipmentBonuses(equipment) {
        if (!equipment) {
            return { hp: 0, chakra: 0, rk: 0, angriff: 0, ausweichen: 0, initiative: 0 };
        }
        
        const bonuses = { hp: 0, chakra: 0, rk: 0, angriff: 0, ausweichen: 0, initiative: 0 };
        
        // Waffe
        if (equipment.weapon) {
            const weapon = this._getItemData(equipment.weapon);
            if (weapon) {
                bonuses.angriff += weapon.attackBonus || 0;
            }
        }
        
        // Rüstung
        if (equipment.armor) {
            const armor = this._getItemData(equipment.armor);
            if (armor) {
                bonuses.rk += armor.rkBonus || 0;
                bonuses.hp += armor.hpBonus || 0;
            }
        }
        
        // Accessoire
        if (equipment.accessory) {
            const accessory = this._getItemData(equipment.accessory);
            if (accessory) {
                Object.entries(accessory.bonuses || {}).forEach(([stat, value]) => {
                    if (bonuses[stat] !== undefined) {
                        bonuses[stat] += value;
                    }
                });
            }
        }
        
        return bonuses;
    },
    
    /**
     * Holt Item-Daten (Hilfsmethode)
     * @private
     */
    _getItemData(itemId) {
        // Versuche aus ITEMS_DB zu laden
        if (typeof ITEMS_DB !== 'undefined') {
            return ITEMS_DB.find(item => item.id === itemId);
        }
        // Fallback: Annahme dass itemId schon das Objekt ist
        return typeof itemId === 'object' ? itemId : null;
    },
    
    // === JUTSU ===
    
    /**
     * Berechnet modifizierte Jutsu-Werte basierend auf Level
     * @param {Object} jutsu - Das Jutsu
     * @param {Object} jutsuData - Die Jutsu-Daten aus JUTSU_DATA
     * @returns {Object} - Die berechneten Werte
     */
    calculateJutsuValues(jutsu, jutsuData) {
        if (!jutsu || !jutsuData) return null;
        
        const level = jutsu.level || 1;
        
        return {
            chakraCost: this.calculateJutsuChakra(jutsuData.chakra, level, jutsu.rank),
            damage: this.calculateJutsuDamage(jutsuData.damage, level),
            rangeM: this.calculateJutsuRange(jutsuData.rangeM, level),
            baseChakra: jutsuData.chakra,
            baseDamage: jutsuData.damage,
            baseRange: jutsuData.rangeM
        };
    },
    
    /**
     * Berechnet Chakra-Kosten für Jutsu
     * @param {number} baseChakra - Basis-Chakra
     * @param {number} level - Das Level
     * @param {string} rank - Der Rang (E, D, C, B, A, S)
     * @returns {number}
     */
    calculateJutsuChakra(baseChakra, level, rank) {
        if (!baseChakra) return 0;
        
        const rankMod = { 'E': 0.9, 'D': 1.0, 'C': 1.1, 'B': 1.2, 'A': 1.3, 'S': 1.5 };
        const modifier = rankMod[rank] || 1.0;
        const levelMultiplier = 1 - ((level - 1) * 0.05); // 5% weniger pro Level
        
        return Math.floor(baseChakra * levelMultiplier * modifier);
    },
    
    /**
     * Berechnet Schaden für Jutsu
     * Unterstützt Würfel-Strings (z.B. "3W8")
     * @param {string|number} baseDamage - Basis-Schaden
     * @param {number} level - Das Level
     * @returns {string|number}
     */
    calculateJutsuDamage(baseDamage, level) {
        if (!baseDamage) return null;
        
        const multiplier = 1 + ((level - 1) * 0.1); // 10% mehr pro Level
        
        // Prüfe ob es ein Würfel-String ist (z.B. "3W8", "2W6")
        if (typeof baseDamage === 'string' && baseDamage.toLowerCase().includes('w')) {
            const match = baseDamage.match(/(\d+)\s*[wW]\s*(\d+)/);
            if (match) {
                const numDice = parseInt(match[1]);
                const diceSides = parseInt(match[2]);
                
                // Durchschnittschaden berechnen
                const avgDamage = numDice * (diceSides + 1) / 2;
                const calculated = Math.floor(avgDamage * multiplier);
                
                return `${baseDamage} (~${calculated})`;
            }
        }
        
        // Für numerische Werte
        if (typeof baseDamage === 'number') {
            return Math.floor(baseDamage * multiplier);
        }
        
        return baseDamage;
    },
    
    /**
     * Berechnet Reichweite für Jutsu
     * @param {number} baseRange - Basis-Reichweite
     * @param {number} level - Das Level
     * @returns {number}
     */
    calculateJutsuRange(baseRange, level) {
        if (!baseRange) return null;
        
        const multiplier = 1 + ((level - 1) * 0.05); // 5% mehr pro Level
        return Math.floor(baseRange * multiplier);
    },
    
    /**
     * Berechnet AP-Kosten für Jutsu-Level-Up
     * @param {string} rank - Der Rang
     * @param {number} currentLevel - Aktuelles Level
     * @returns {number}
     */
    getJutsuLevelUpCost(rank, currentLevel) {
        const baseCosts = { 'E': 3, 'D': 5, 'C': 8, 'B': 12, 'A': 18, 'S': 25 };
        const baseCost = baseCosts[rank] || 5;
        const levelMultiplier = 1 + ((currentLevel - 1) * 0.5); // 50% mehr pro Level
        
        return Math.floor(baseCost * levelMultiplier);
    },
    
    // === LEVEL / XP ===
    
    /**
     * Berechnet XP für das nächste Level
     * @param {number} currentLevel - Aktuelles Level
     * @returns {number}
     */
    getXPForNextLevel(currentLevel) {
        return currentLevel * 100; // Einfache Formel: Level * 100 XP
    },
    
    /**
     * Berechnet AP für ein Level-Up
     * @param {number} newLevel - Neues Level
     * @returns {number}
     */
    getAPForLevelUp(newLevel) {
        return 2; // Pro Level 2 AP
    },
    
    // === VALIDIERUNG ===
    
    /**
     * Validiert Attribute (für Charaktererstellung)
     * @param {Object} attributes - Die Attribute
     * @param {number} availablePoints - Verfügbare Punkte
     * @returns {Object} - Validierungsergebnis
     */
    validateAttributes(attributes, availablePoints) {
        const errors = [];
        
        // Prüfe auf negative Punkte
        if (availablePoints < 0) {
            errors.push('Negative Attributpunkte');
        }
        
        // Prüfe auf zu viele 16er
        const attributesAt16 = Object.values(attributes).filter(v => v === 16).length;
        if (attributesAt16 > 2) {
            errors.push('Maximal 2 Attribute dürfen auf 16 sein');
        }
        
        // Prüfe auf Mindestwerte
        Object.entries(attributes).forEach(([attr, value]) => {
            if (value < 8) {
                errors.push(`${attr} ist unter dem Minimum von 8`);
            }
            if (value > 20) {
                errors.push(`${attr} ist über dem Maximum von 20`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    /**
     * Validiert Talente
     * @param {Array} talents - Die gewählten Talente
     * @param {number} maxPoints - Maximale Punkte
     * @returns {Object} - Validierungsergebnis
     */
    validateTalents(talents, maxPoints = 5) {
        const errors = [];
        
        const totalCost = talents.reduce((sum, t) => sum + (t.cost || 0), 0);
        
        if (totalCost > maxPoints) {
            errors.push(`Talentpunkte überschritten (${totalCost}/${maxPoints})`);
        }
        
        // Prüfe auf zu viele teure Talente
        const expensiveTalents = talents.filter(t => (t.cost || 0) >= 7).length;
        if (expensiveTalents > 2) {
            errors.push('Maximal 2 Talente mit Kosten >= 7');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            pointsSpent: totalCost,
            pointsRemaining: maxPoints - totalCost
        };
    },
    
    // === DEBUG ===
    
    /**
     * Debug-Informationen
     */
    debug() {
        console.group('RulesEngine Debug');
        console.log('Version:', this.VERSION);
        
        // Test-Modifier
        console.log('Modifier Tests:');
        [7, 8, 10, 12, 14, 16, 18, 20].forEach(val => {
            console.log(`  Wert ${val}: ${this.getModifier(val) >= 0 ? '+' : ''}${this.getModifier(val)}`);
        });
        
        console.groupEnd();
    }
};

// Global verfügbar machen
window.RulesEngine = RulesEngine;
