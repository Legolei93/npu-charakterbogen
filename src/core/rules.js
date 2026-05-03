/**
 * NPU Rule Engine - VOLLSTÄNDIG
 * Zentrale Regellogik für das Naruto Parallel Universe RPG
 * 
 * Alle Berechnungen strikt nach offiziellem NPU-Regelwerk.
 * Version: 2.0 - Vollständige System-Integration
 */

const Rules = {
    // ============================================
    // KONSTANTEN
    // ============================================
    
    BASE_VALUES: {
        // Startwerte
        hp: 30,
        chakra: 100,
        stamina: 3,
        aufladungen: 0,
        karma: 0,
        
        // Attribut-Regeln
        attributeStart: 8,
        attributeMax: 20,
        attributeMin: 8,
        maxAttributePoints: 26,
        
        // Level-Regeln
        hpPerLevel: 5,
        chakraPerLevel: 7,
        
        // Kampfwerte
        initiativeBase: 5,
        rkBase: 8,
        angriffBase: 2,
        ausweichenBase: 5,
        
        // Talente
        maxTalents: 5,
        maxHighCostTalents: 2,
        highCostThreshold: 7,
        apPerTalentPoint: 5
    },

    // ============================================
    // ATTRIBUTE & MODIFIKATOREN
    // ============================================
    
    ATTRIBUTES: {
        primary: ['kk', 'kon', 'ges', 'gsw', 'int', 'itu', 'cha'],
        
        // Modifikator-Berechnung (vereinheitlicht)
        getModifier: function(value) {
            if (value <= 7) return -2;
            if (value <= 9) return -1;
            if (value <= 11) return 0;
            if (value <= 13) return 1;
            if (value <= 15) return 2;
            if (value <= 17) return 3;
            if (value <= 19) return 4;
            return 5;
        }
    },

    // ============================================
    // FERTIGKEITEN (SKILLS)
    // ============================================
    
    SKILLS: {
        // Körperliche Fertigkeiten
        koerperlich: {
            athletik: { 
                name: 'Athletik', 
                formula: ['kk', 'kon', 'ges'],
                description: '(KK + KON + GES) / 3'
            },
            akrobatik: { 
                name: 'Akrobatik', 
                formula: ['kk', 'kk', 'kon'],
                description: '(KK + KK + KON) / 3'
            },
            klettern: { 
                name: 'Klettern', 
                formula: ['kon', 'kon', 'kk'],
                description: '(KON + KON + KK) / 3'
            },
            koerperbeherrschung: { 
                name: 'Körperbeherrschung', 
                formula: ['kon', 'kk', 'gsw'],
                description: '(KON + KK + GSW) / 3'
            },
            schleichen: { 
                name: 'Schleichen', 
                formula: ['ges', 'ges', 'itu'],
                description: '(GES + GES + ITU) / 3'
            },
            verstecken_tarnen: { 
                name: 'Verstecken / Tarnen', 
                formula: ['itu', 'ges', 'gsw'],
                description: '(ITU + GES + GSW) / 3'
            },
            fingerfertigkeit: { 
                name: 'Fingerfertigkeit', 
                formula: ['itu', 'int', 'ges'],
                description: '(ITU + INT + GES) / 3'
            },
            waffentalent: { 
                name: 'Waffentalent', 
                formula: ['kk', 'ges', 'gsw'],
                description: '(KK + GES + GSW) / 3'
            }
        },
        
        // Soziale Fertigkeiten
        sozial: {
            menschenkenntnis: { 
                name: 'Menschenkenntnis', 
                formula: ['cha', 'itu'],
                description: '(CHA + ITU) / 2'
            },
            redekunst_verhandeln: { 
                name: 'Redekunst / Verhandeln', 
                formula: ['cha', 'int'],
                description: '(CHA + INT) / 2'
            },
            beruhigen: { 
                name: 'Beruhigen', 
                formula: ['cha', 'ges'],
                description: '(CHA + GES) / 2'
            },
            einschuechtern: { 
                name: 'Einschüchtern', 
                formula: ['cha', 'kk'],
                description: '(CHA + KK) / 2'
            },
            manipulieren: { 
                name: 'Manipulieren', 
                formula: ['cha', 'itu'],
                description: '(CHA + ITU) / 2'
            },
            alleinunterhalter: { 
                name: 'Alleinunterhalter', 
                formula: ['cha', 'cha'],
                description: '(CHA + CHA) / 2'
            },
            flirten_verfuehren: { 
                name: 'Flirten / Verführen', 
                formula: ['cha', 'int'],
                description: '(CHA + INT) / 2'
            }
        },
        
        // Wissen Fertigkeiten
        wissen: {
            naturwissenschaften: { 
                name: 'Naturwissenschaften', 
                formula: ['itu', 'int'],
                description: '(ITU + INT) / 2'
            },
            ueberlebenstechniken: { 
                name: 'Überlebenstechniken', 
                formula: ['kk', 'kon'],
                description: '(KK + KON) / 2'
            },
            pflanzenkunde_alchemie: { 
                name: 'Pflanzenkunde / Alchemie', 
                formula: ['itu', 'int'],
                description: '(ITU + INT) / 2'
            },
            tierkunde: { 
                name: 'Tierkunde', 
                formula: ['int', 'int'],
                description: '(INT + INT) / 2'
            },
            geschichte: { 
                name: 'Geschichte', 
                formula: ['int', 'int'],
                description: '(INT + INT) / 2'
            },
            kriegskunst: { 
                name: 'Kriegskunst', 
                formula: ['itu', 'int'],
                description: '(ITU + INT) / 2'
            },
            handwerk_technologie: { 
                name: 'Handwerk / Technologie', 
                formula: ['kon', 'kk'],
                description: '(KON + KK) / 2'
            },
            jutsu_wissen: { 
                name: 'Jutsu', 
                formula: ['kon', 'int'],
                description: '(KON + INT) / 2'
            },
            medizin_heilkunst: { 
                name: 'Medizin / Heilkunst', 
                formula: ['ges', 'int'],
                description: '(GES + INT) / 2'
            },
            chakrakontrolle: { 
                name: 'Chakrakontrolle', 
                formula: ['int', 'int', 'kon'],
                description: '(INT + INT + KON) / 3'
            }
        }
    },

    // ============================================
    // LEVEL-SYSTEM
    // ============================================
    
    LEVEL: {
        // Level-Up Belohnungen
        getLevelUpRewards: function(currentLevel) {
            return {
                attributePoints: 2,  // Standard: 2 Attributspunkte pro Level
                hp: this.BASE_VALUES.hpPerLevel,
                chakra: this.BASE_VALUES.chakraPerLevel
            };
        },
        
        // Spezial-Levels mit Bonus
        isSpecialLevel: function(level) {
            return [4, 8, 12, 16, 20].includes(level);
        },
        
        getSpecialLevelBonus: function(level) {
            if (this.isSpecialLevel(level)) {
                return {
                    attributePoints: 1,  // +1 zusätzlicher Attributspunkt
                    description: 'Bonus-Attributspunkt bei Level ' + level
                };
            }
            return null;
        }
    },

    // ============================================
    // KAMPFWERTE BERECHNUNGEN
    // ============================================
    
    COMBAT: {
        /**
         * Initiative = 5 + GES-Mod + GSW-Mod + ITU-Mod + 1W6 (im Kampf)
         * Standardanzeige: 5 + GES-MOD + GSW-MOD + ITU-MOD
         * Kampfbeginn: +1W6 temporär
         */
        calculateInitiative: function(mods, bonuses = {}, diceRoll = null) {
            const base = 5;
            const fromMods = (mods.ges || 0) + (mods.gsw || 0) + (mods.itu || 0);
            const diceValue = diceRoll !== null ? diceRoll : 0; // 1W6 im Kampf
            const fromBonuses = bonuses.initiative || 0;
            return base + fromMods + diceValue + fromBonuses;
        },
        
        /**
         * Ausweichen = 5 + GES-Mod + (GSW-Mod / 2)
         */
        calculateAusweichen: function(mods, bonuses = {}) {
            const base = 5;
            const fromMods = (mods.ges || 0) + Math.floor((mods.gsw || 0) / 2);
            const fromBonuses = bonuses.ausweichen || 0;
            return base + fromMods + fromBonuses;
        },
        
        /**
         * Angriff = 2 + höherer Wert aus (KK-Mod ODER GES-Mod)
         * Automatisch der höhere Modifikator wird gewählt
         */
        calculateAngriff: function(mods, bonuses = {}) {
            const base = 2;
            const kkMod = mods.kk || 0;
            const gesMod = mods.ges || 0;
            const higherMod = Math.max(kkMod, gesMod);
            const fromBonuses = bonuses.angriff || 0;
            return base + higherMod + fromBonuses;
        },
        
        /**
         * Rüstungsklasse = 8 + Ausrüstungsboni + sonstige aktive Boni
         * KEINE Attribute verwenden!
         */
        calculateRK: function(equipmentBonus = 0, bonuses = {}) {
            const base = 8;
            const fromBonuses = bonuses.rk || 0;
            return base + equipmentBonus + fromBonuses;
        },
        
        /**
         * Ninjutsu = 2 + ((INT-Mod + GES-Mod) / 2)
         */
        calculateNinjutsu: function(mods, bonuses = {}) {
            const base = 2;
            const fromMods = Math.floor(((mods.int || 0) + (mods.ges || 0)) / 2);
            const fromBonuses = bonuses.ninjutsu || 0;
            return base + fromMods + fromBonuses;
        },
        
        /**
         * Taijutsu = KK-Mod + GES-Mod
         */
        calculateTaijutsu: function(mods, bonuses = {}) {
            const fromMods = (mods.kk || 0) + (mods.ges || 0);
            const fromBonuses = bonuses.taijutsu || 0;
            return fromMods + fromBonuses;
        },
        
        /**
         * Genjutsu = INT-Mod + ITU-Mod
         */
        calculateGenjutsu: function(mods, bonuses = {}) {
            const fromMods = (mods.int || 0) + (mods.itu || 0);
            const fromBonuses = bonuses.genjutsu || 0;
            return fromMods + fromBonuses;
        },
        
        /**
         * Wahrnehmung = ITU-Mod + INT-Mod
         */
        calculateWahrnehmung: function(mods, bonuses = {}) {
            const fromMods = (mods.itu || 0) + (mods.int || 0);
            const fromBonuses = bonuses.perception || 0;
            return fromMods + fromBonuses;
        },
        
        /**
         * Bewegungsradius = 10 Meter + (GSW-Mod * 5 Meter)
         * 1 GSW-Wert = 5 Meter
         * Minimum = 0 Zusatzmeter (niemals negativ)
         */
        calculateBewegungsradius: function(mods, bonuses = {}) {
            const base = 10;
            const gswMod = mods.gsw || 0;
            // Negative Modifikatoren drücken nicht unter 0
            const bonusMeters = Math.max(0, gswMod * 5);
            const fromBonuses = bonuses.bewegungsradius || 0;
            return base + bonusMeters + fromBonuses;
        }
    },

    // ============================================
    // HAUPTWERTE BERECHNUNGEN (KORREKT MIT MODIFIKATOREN)
    // ============================================
    
    STATS: {
        // WICHTIG: Alle Berechnungen verwenden ATTRIBUTE-MODIFIKATOREN, nicht Rohwerte!
        
        /**
         * Lebenspunkte = 30 + KON-Modifikator + (1W12 ODER fest 6)
         * Standardanzeige: 30 + KON-MOD + 6
         * Mit Würfelsystem: 30 + KON-MOD + W12
         */
        calculateHP: function(mods, level, bonuses = {}, diceRoll = null) {
            const base = 30;
            const fromKonMod = mods.kon || 0;
            // Festwert 6 oder Würfelwert (1W12 = 1-12)
            const diceValue = diceRoll !== null ? diceRoll : 6;
            const fromLevel = (level - 1) * 5;
            const fromBonuses = bonuses.hp || 0;
            return base + fromKonMod + diceValue + fromLevel + fromBonuses;
        },
        
        /**
         * Chakra = 100 + KON-Modifikator + INT-Modifikator + (2W20 ODER fest 22)
         * Standardanzeige: 100 + KON-MOD + INT-MOD + 22
         * Mit Würfelsystem: 100 + KON-MOD + INT-MOD + 2W20
         */
        calculateChakra: function(mods, level, bonuses = {}, diceRoll = null) {
            const base = 100;
            const fromMods = (mods.kon || 0) + (mods.int || 0);
            // Festwert 22 oder Würfelwert (2W20 = 2-40)
            const diceValue = diceRoll !== null ? diceRoll : 22;
            const fromLevel = (level - 1) * 7;
            const fromBonuses = bonuses.chakra || 0;
            return base + fromMods + diceValue + fromLevel + fromBonuses;
        },
        
        /**
         * Stamina = 3 + höherer Wert aus (KON-Mod ODER GSW-Mod)
         * Automatisch der höhere Modifikator wird gewählt
         */
        calculateStamina: function(mods, bonuses = {}) {
            const base = 3;
            // Höheren Wert aus KON-Mod oder GSW-Mod wählen
            const konMod = mods.kon || 0;
            const gswMod = mods.gsw || 0;
            const higherMod = Math.max(konMod, gswMod);
            const fromBonuses = bonuses.stamina || 0;
            return Math.max(0, base + higherMod + fromBonuses);
        },
        
        // Aufladungen (basierend auf Clans/Talente)
        calculateAufladungen: function(bonuses = {}) {
            return bonuses.aufladungen || 0;
        }
    },

    // ============================================
    // WIDERSTÄNDE (KORREKT MIT MODIFIKATOREN)
    // ============================================
    
    RESISTANCES: {
        /**
         * Chakra-Widerstand = KON-Modifikator + (INT-Modifikator / 2)
         * Keine Rohattribute verwenden!
         */
        calculateChakraResist: function(mods, bonuses = {}) {
            const fromKon = mods.kon || 0;
            const fromInt = Math.floor((mods.int || 0) / 2);
            const fromBonuses = bonuses.chakraResist || 0;
            return fromKon + fromInt + fromBonuses;
        },
        
        /**
         * Körperlicher Widerstand = Konstitution-Modifikator
         * Keine Basiswerte mehr - nur Modifikator
         */
        calculateKoerperResist: function(mods, bonuses = {}) {
            const fromKon = mods.kon || 0;
            const fromBonuses = bonuses.koerperResist || 0;
            return fromKon + fromBonuses;
        },
        
        /**
         * Geistiger Widerstand = INT-Modifikator + (INTU-Modifikator / 2)
         * Keine Rohattribute verwenden!
         */
        calculateGeistResist: function(mods, bonuses = {}) {
            const fromInt = mods.int || 0;
            const fromItu = Math.floor((mods.itu || 0) / 2);
            const fromBonuses = bonuses.geistResist || 0;
            return fromInt + fromItu + fromBonuses;
        }
    },

    // ============================================
    // WÜRFEL-SYSTEM
    // ============================================
    
    DICE: {
        // Würfeltypen
        types: {
            '1w6': { name: '1W6', min: 1, max: 6, avg: 3.5 },
            '2w6': { name: '2W6', min: 2, max: 12, avg: 7 },
            '1w8': { name: '1W8', min: 1, max: 8, avg: 4.5 },
            '2w8': { name: '2W8', min: 2, max: 16, avg: 9 },
            '1w10': { name: '1W10', min: 1, max: 10, avg: 5.5 },
            '1w12': { name: '1W12', min: 1, max: 12, avg: 6.5 },
            '1w20': { name: '1W20', min: 1, max: 20, avg: 10.5 },
            '2w20': { name: '2W20', min: 2, max: 40, avg: 21 }
        },
        
        // Würfel für Startwerte
        startValues: {
            hp: { dice: '1w12', bonus: 'kon', fixed: 6 },           // 1W12 oder fest 6
            chakra: { dice: '2w20', bonus: 'kon_int', fixed: 22 },  // 2W20 oder fest 22
            stamina: { dice: '1w6', bonus: 'kon_gsw', fixed: 3 }    // 1W6 oder höherer Mod
        },
        
        /**
         * Zeigt einen Dialog für manuelle Würfeleingabe
         * @param {string} diceType - z.B. '1w12', '2w20'
         * @param {string} title - Dialog-Titel
         * @param {string} message - Dialog-Nachricht
         * @returns {Promise<number|null>} - Der eingegebene Würfelwert oder null bei Abbruch
         */
        showRollDialog: function(diceType, title, message) {
            return new Promise((resolve) => {
                const dice = this.types[diceType];
                if (!dice) {
                    resolve(null);
                    return;
                }
                
                // Erstelle Modal-HTML
                const modal = document.createElement('div');
                modal.className = 'dice-roll-modal';
                modal.innerHTML = `
                    <div class="dice-roll-content">
                        <h3>${title || 'Würfeln'}</h3>
                        <p>${message || `Gib deinen ${dice.name}-Wurf ein:`}</p>
                        <div class="dice-input-container">
                            <input type="number" id="diceRollInput" 
                                   min="${dice.min}" max="${dice.max}" 
                                   placeholder="${dice.min}-${dice.max}"
                                   autofocus>
                        </div>
                        <div class="dice-roll-buttons">
                            <button class="btn-confirm" onclick="this.closest('.dice-roll-modal').resolveValue()">✓ Bestätigen</button>
                            <button class="btn-cancel" onclick="this.closest('.dice-roll-modal').resolveCancel()">✗ Abbrechen</button>
                        </div>
                        <p class="dice-range-hint">Bereich: ${dice.min} - ${dice.max}</p>
                    </div>
                `;
                
                // Füge CSS hinzu falls nicht vorhanden
                if (!document.getElementById('diceRollStyles')) {
                    const style = document.createElement('style');
                    style.id = 'diceRollStyles';
                    style.textContent = `
                        .dice-roll-modal {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0,0,0,0.7);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            z-index: 10000;
                        }
                        .dice-roll-content {
                            background: #2a2a3e;
                            border: 2px solid #4a9eff;
                            border-radius: 12px;
                            padding: 24px;
                            min-width: 300px;
                            text-align: center;
                            color: #fff;
                        }
                        .dice-roll-content h3 {
                            margin: 0 0 16px 0;
                            color: #4a9eff;
                        }
                        .dice-roll-content p {
                            margin: 0 0 16px 0;
                            color: #ccc;
                        }
                        .dice-input-container input {
                            width: 100px;
                            padding: 12px;
                            font-size: 24px;
                            text-align: center;
                            border: 2px solid #4a9eff;
                            border-radius: 8px;
                            background: #1a1a2e;
                            color: #fff;
                            margin-bottom: 16px;
                        }
                        .dice-input-container input:focus {
                            outline: none;
                            border-color: #6ab2ff;
                            box-shadow: 0 0 10px rgba(74,158,255,0.5);
                        }
                        .dice-roll-buttons {
                            display: flex;
                            gap: 12px;
                            justify-content: center;
                        }
                        .dice-roll-buttons button {
                            padding: 10px 20px;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            transition: all 0.2s;
                        }
                        .btn-confirm {
                            background: #28a745;
                            color: white;
                        }
                        .btn-confirm:hover {
                            background: #34ce57;
                        }
                        .btn-cancel {
                            background: #dc3545;
                            color: white;
                        }
                        .btn-cancel:hover {
                            background: #e04b59;
                        }
                        .dice-range-hint {
                            margin-top: 12px;
                            font-size: 12px;
                            color: #888;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Event-Handler
                modal.resolveValue = () => {
                    const input = modal.querySelector('#diceRollInput');
                    const value = parseInt(input.value);
                    if (value >= dice.min && value <= dice.max) {
                        document.body.removeChild(modal);
                        resolve(value);
                    } else {
                        input.style.borderColor = '#dc3545';
                        input.placeholder = `Ungültig! ${dice.min}-${dice.max}`;
                        input.value = '';
                        input.focus();
                    }
                };
                
                modal.resolveCancel = () => {
                    document.body.removeChild(modal);
                    resolve(null);
                };
                
                // Enter-Taste bestätigt
                modal.querySelector('#diceRollInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') modal.resolveValue();
                    if (e.key === 'Escape') modal.resolveCancel();
                });
                
                document.body.appendChild(modal);
                modal.querySelector('#diceRollInput').focus();
            });
        },
        
        /**
         * Berechnet HP mit optionalem Würfelwurf
         */
        async calculateHPWithRoll(mods, level, bonuses = {}, useDice = false) {
            if (!useDice) {
                // Festwert 6
                return Rules.STATS.calculateHP(mods, level, bonuses, 6);
            }
            
            const roll = await this.showRollDialog('1w12', 'Lebenspunkte würfeln', 
                'Wirf 1W12 für zusätzliche Lebenspunkte:');
            
            if (roll === null) {
                // Abbruch - verwende Festwert
                return Rules.STATS.calculateHP(mods, level, bonuses, 6);
            }
            
            return Rules.STATS.calculateHP(mods, level, bonuses, roll);
        },
        
        /**
         * Berechnet Chakra mit optionalem Würfelwurf
         */
        async calculateChakraWithRoll(mods, level, bonuses = {}, useDice = false) {
            if (!useDice) {
                // Festwert 22
                return Rules.STATS.calculateChakra(mods, level, bonuses, 22);
            }
            
            const roll = await this.showRollDialog('2w20', 'Chakra würfeln', 
                'Wirf 2W20 für zusätzliches Chakra:');
            
            if (roll === null) {
                // Abbruch - verwende Festwert
                return Rules.STATS.calculateChakra(mods, level, bonuses, 22);
            }
            
            return Rules.STATS.calculateChakra(mods, level, bonuses, roll);
        },
        
        // Würfel-Funktion (zufällig)
        roll: function(diceType) {
            const dice = this.types[diceType];
            if (!dice) return 0;
            
            let result = 0;
            if (diceType.startsWith('2')) {
                // 2 Würfel
                result = Math.floor(Math.random() * (dice.max - dice.min + 1)) + dice.min;
            } else {
                // 1 Würfel
                result = Math.floor(Math.random() * (dice.max - dice.min + 1)) + dice.min;
            }
            return result;
        },
        
        // Berechne Startwert mit Würfel
        calculateStartValue: function(type, attributes, mods) {
            const config = this.startValues[type];
            if (!config) return 0;
            
            let baseValue = this.roll(config.dice);
            
            // Füge Attribut-Bonus hinzu
            if (config.bonus && attributes[config.bonus]) {
                baseValue += attributes[config.bonus];
            }
            if (config.bonus && mods[config.bonus]) {
                baseValue += mods[config.bonus];
            }
            
            return baseValue;
        }
    },
    
    JUTSU_LEVEL: {
        maxLevel: 5,
        
        // Chakra-Kosten-Modifikator pro Level
        chakraModifier: {
            1: 1.0,   // Basis
            2: 0.95,  // -5%
            3: 0.90,  // -10%
            4: 0.85,  // -15%
            5: 0.75   // -25%
        },
        
        // Schadens-Modifikator pro Level
        damageModifier: {
            1: 1.0,
            2: 1.15,  // +15%
            3: 1.30,  // +30%
            4: 1.50,  // +50%
            5: 1.75   // +75%
        },
        
        // AP-Kosten für Jutsu-Level-Up
        apCost: {
            'E': { base: 2, perLevel: 1 },
            'D': { base: 3, perLevel: 2 },
            'C': { base: 5, perLevel: 3 },
            'B': { base: 8, perLevel: 4 },
            'A': { base: 12, perLevel: 6 },
            'S': { base: 20, perLevel: 10 }
        }
    },

    // ============================================
    // AP-SYSTEM
    // ============================================
    
    AP_SYSTEM: {
        // AP-Kosten für Attribute
        attributeCost: {
            8: 0,   // Basis
            9: 1,
            10: 2,
            11: 3,
            12: 4,
            13: 6,
            14: 8,
            15: 10,
            16: 13,
            17: 16,
            18: 20,
            19: 25,
            20: 30
        },
        
        // AP-Kosten für Jutsus (neu lernen)
        jutsuLearnCost: {
            'E': 1,
            'D': 2,
            'C': 4,
            'B': 8,
            'A': 15,
            'S': 30
        },
        
        // AP-Kosten für Talente
        talentCost: {
            chakra_manipulation: 5,
            passive_chakra_regen: 5,
            improved_chakra_regen: 15,
            increased_chakra_1: 8,
            increased_chakra_2: 8,
            increased_chakra_3: 8,
            increased_chakra_4: 15,
            increased_chakra_5: 15,
            chakra_control: 5,
            combat_regen: 5,
            improved_combat_regen: 10,
            high_speed_combat: 3,
            high_awareness: 5,
            multi_counter: 5,
            combo_attack: 3,
            specialization_ninjutsu: 15,
            specialization_genjutsu: 15,
            specialization_taijutsu: 15,
            specialization_thrown: 3,
            flinkheit: 10,
            parademeister: 5,
            fighter: 8,
            increased_chakra_resist: 5,
            improved_stamina: 5,
            improved_crit: 15,
            element_fusion: 10,
            element_affinity: 5
        }
    },

    // ============================================
    // HILFSFUNKTIONEN
    // ============================================
    
    /**
     * Berechnet eine Fertigkeit basierend auf ihrer Formel
     */
    calculateSkill: function(skillKey, skillCategory, attributes) {
        const skill = this.SKILLS[skillCategory][skillKey];
        if (!skill || !skill.formula) return 0;
        
        let sum = 0;
        skill.formula.forEach(attr => {
            sum += attributes[attr] || 8;
        });
        
        return Math.floor(sum / skill.formula.length);
    },
    
    /**
     * Berechnet alle Fertigkeiten
     */
    calculateAllSkills: function(attributes) {
        const result = {
            koerperlich: {},
            sozial: {},
            wissen: {}
        };
        
        for (const category in this.SKILLS) {
            for (const skillKey in this.SKILLS[category]) {
                result[category][skillKey] = this.calculateSkill(skillKey, category, attributes);
            }
        }
        
        return result;
    },
    
    /**
     * Berechnet AP-Kosten für Attribut-Steigerung
     */
    calculateAttributeCost: function(fromValue, toValue) {
        let totalCost = 0;
        for (let i = fromValue + 1; i <= toValue; i++) {
            totalCost += this.AP_SYSTEM.attributeCost[i] || 0;
        }
        return totalCost;
    },

    /**
     * Berechnet Chakra-Kosten für Jutsu basierend auf Level
     */
    calculateJutsuChakra: function(baseChakra, level, rank) {
        if (!baseChakra) return 0;
        
        // Pro Level steigt Chakra leicht an
        const levelMultiplier = 1 + ((level - 1) * 0.05);
        
        // Rang-Modifikator
        const rankModifiers = { 'E': 0.8, 'D': 0.9, 'C': 1.0, 'B': 1.1, 'A': 1.2, 'S': 1.3 };
        const rankMod = rankModifiers[rank] || 1.0;
        
        return Math.floor(baseChakra * levelMultiplier * rankMod);
    },

    /**
     * Berechnet Schaden für Jutsu basierend auf Level
     */
    calculateJutsuDamage: function(baseDamage, level) {
        if (!baseDamage) return null;
        
        // Pro Level steigt Schaden um 10%
        const multiplier = 1 + ((level - 1) * 0.1);
        
        return Math.floor(baseDamage * multiplier);
    },

    /**
     * Berechnet Reichweite für Jutsu basierend auf Level
     */
    calculateJutsuRange: function(baseRange, level) {
        if (!baseRange) return null;
        
        // Pro Level steigt Reichweite um 5%
        const multiplier = 1 + ((level - 1) * 0.05);
        
        return Math.floor(baseRange * multiplier);
    },

    /**
     * Berechnet AP-Kosten für Jutsu-Level-Up
     */
    getJutsuLevelUpCost: function(rank, currentLevel) {
        const baseCosts = { 'E': 3, 'D': 5, 'C': 8, 'B': 12, 'A': 18, 'S': 25 };
        const baseCost = baseCosts[rank] || 5;
        
        // Kosten steigen mit jedem Level
        const levelMultiplier = 1 + ((currentLevel - 1) * 0.2);
        
        return Math.floor(baseCost * levelMultiplier);
    }
};

// Export für Browser und Node.js
if (typeof window !== 'undefined') {
    window.Rules = Rules;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Rules;
}
