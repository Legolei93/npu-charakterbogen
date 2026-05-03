/**
 * NPU Core System - Phase 2
 * Zentrale Berechnungs- und Game-Logik
 */

const NPUCore = {
    // Aktueller Benutzer
    currentUser: {
        role: 'player', // 'player' oder 'dm'
        name: '',
        id: null
    },

    // ============================================
    // ZENTRALE BERECHNUNGSFUNKTION
    // ============================================
    
    /**
     * Berechnet den kompletten Charakter neu
     * Wird bei JEDER Änderung aufgerufen
     */
    calculateCharacter: function(character) {
        if (!character) return null;
        
        // 1. Attribute Modifikatoren berechnen
        const mods = this.calculateModifiers(character.baseAttributes);
        
        // 2. Clan-Boni/Mali anwenden
        const clanModifiers = this.applyClanModifiers(character);
        
        // 3. Talent-Boni berechnen
        const talentBonuses = this.calculateTalentBonuses(character);
        
        // 4. Ausrüstungs-Boni
        const equipBonuses = this.calculateEquipmentBonuses(character);
        
        // 5. Fertigkeiten berechnen
        character.skills = this.calculateAllSkills(character.baseAttributes);
        
        // 6. Kampfwerte berechnen
        character.combat = this.calculateCombatValues(
            character, 
            mods, 
            clanModifiers, 
            talentBonuses, 
            equipBonuses
        );
        
        // 7. Hauptwerte berechnen
        character.stats = this.calculateStats(
            character,
            mods,
            clanModifiers,
            talentBonuses,
            equipBonuses
        );
        
        // 8. Widerstände berechnen
        character.resistances = this.calculateResistances(
            character,
            mods,
            talentBonuses
        );
        
        // 9. Jutsu-Werte aktualisieren
        this.updateJutsuValues(character);
        
        return character;
    },

    /**
     * Berechnet Attribut-Modifikatoren
     * Verwendet Rules.ATTRIBUTES.getModifier() für Konsistenz
     */
    calculateModifiers: function(attributes) {
        const mods = {};
        for (const attr in attributes) {
            const value = attributes[attr];
            // Verwende Rules.getModifier() wenn verfügbar
            if (typeof Rules !== 'undefined' && Rules.ATTRIBUTES && Rules.ATTRIBUTES.getModifier) {
                mods[attr] = Rules.ATTRIBUTES.getModifier(value);
            } else {
                // Fallback
                if (value <= 7) mods[attr] = -2;
                else if (value <= 9) mods[attr] = -1;
                else if (value <= 11) mods[attr] = 0;
                else if (value <= 13) mods[attr] = 1;
                else if (value <= 15) mods[attr] = 2;
                else if (value <= 17) mods[attr] = 3;
                else if (value <= 19) mods[attr] = 4;
                else mods[attr] = 5;
            }
        }
        return mods;
    },

    /**
     * Wendet Clan-Boni/Mali an
     */
    applyClanModifiers: function(character) {
        const clan = character.clan;
        const modifiers = {
            attributes: {},
            skills: {},
            combat: {},
            special: []
        };
        
        if (!clan) return modifiers;
        
        // Clan-Definitionen
        const clanData = {
            'aburame': {
                attributes: { int: 1 },
                special: ['Insekten-Kontrolle']
            },
            'akimichi': {
                attributes: { kon: 1 },
                special: ['Kalorien-Kontrolle']
            },
            'hyuga': {
                attributes: { itu: 1, ges: 1 },
                combat: { ausweichen: 2 },
                special: ['Byakugan']
            },
            'inuzuka': {
                attributes: { itu: 1 },
                skills: { tierkunde: 3 },
                special: ['Ninken']
            },
            'nara': {
                attributes: { int: 2 },
                special: ['Schatten-Manipulation']
            },
            'uchiha': {
                attributes: { itu: 1, gsw: 1 },
                combat: { initiative: 2 },
                special: ['Sharingan']
            },
            'yamanaka': {
                attributes: { cha: 1, int: 1 },
                special: ['Geist-Manipulation']
            },
            'hozuki': {
                attributes: { kon: 1 },
                special: ['Hydrifizierung']
            },
            'kaguya': {
                attributes: { kk: 2 },
                combat: { angriff: 2 },
                special: ['Shikotsumyaku']
            },
            'hoshigaki': {
                attributes: { kon: 1, kk: 1 },
                special: ['Hai-Stil']
            }
        };
        
        const clanMod = clanData[clan];
        if (clanMod) {
            if (clanMod.attributes) modifiers.attributes = clanMod.attributes;
            if (clanMod.skills) modifiers.skills = clanMod.skills;
            if (clanMod.combat) modifiers.combat = clanMod.combat;
            if (clanMod.special) modifiers.special = clanMod.special;
        }
        
        return modifiers;
    },

    /**
     * Berechnet Talent-Boni
     */
    calculateTalentBonuses: function(character) {
        const bonuses = {
            hp: 0,
            chakra: 0,
            stamina: 0,
            initiative: 0,
            ausweichen: 0,
            angriff: 0,
            rk: 0,
            ninjutsu: 0,
            taijutsu: 0,
            genjutsu: 0,
            chakraResist: 0,
            koerperResist: 0,
            geistResist: 0,
            perception: 0,
            chakraRegen: 0,
            chakraCostReduction: 0
        };
        
        if (!character.talents || !character.talents.selected) {
            return bonuses;
        }
        
        const talentEffects = {
            'chakra_manipulation': { chakraRegen: 5 },
            'passive_chakra_regen': { chakraRegen: 5 },
            'improved_chakra_regen': { chakraRegen: 10 },
            'increased_chakra_1': { chakra: 20 },
            'increased_chakra_2': { chakra: 20 },
            'increased_chakra_3': { chakra: 20 },
            'increased_chakra_4': { chakra: 30 },
            'increased_chakra_5': { chakra: 30 },
            'chakra_control': { chakraCostReduction: 0.1 },
            'combat_regen': { chakraRegen: 3 },
            'improved_combat_regen': { chakraRegen: 6 },
            'high_speed_combat': { initiative: 2 },
            'high_awareness': { perception: 3 },
            'multi_counter': {},
            'combo_attack': {},
            'specialization_ninjutsu': { ninjutsu: 2 },
            'specialization_genjutsu': { genjutsu: 2 },
            'specialization_taijutsu': { taijutsu: 2 },
            'specialization_thrown': {},
            'flinkheit': { ausweichen: 2 },
            'parademeister': { rk: 1 },
            'fighter': { angriff: 2 },
            'increased_chakra_resist': { chakraResist: 2 },
            'improved_stamina': { stamina: 1 },
            'improved_crit': {},
            'element_fusion': {},
            'element_affinity': {}
        };
        
        character.talents.selected.forEach(talentId => {
            const effects = talentEffects[talentId];
            if (!effects) return;
            
            for (const [key, value] of Object.entries(effects)) {
                if (bonuses[key] !== undefined) {
                    bonuses[key] += value;
                }
            }
        });
        
        return bonuses;
    },

    /**
     * Berechnet Ausrüstungs-Boni
     */
    calculateEquipmentBonuses: function(character) {
        const bonuses = {
            hp: 0,
            chakra: 0,
            stamina: 0,
            initiative: 0,
            ausweichen: 0,
            angriff: 0,
            rk: 0,
            ninjutsu: 0,
            taijutsu: 0,
            genjutsu: 0
        };
        
        if (!character.equipment) return bonuses;
        
        for (const slot in character.equipment) {
            const item = character.equipment[slot];
            if (!item || !item.mod) continue;
            
            // Parse Modifikator-String
            const mod = item.mod.toLowerCase();
            
            // RK-Bonus
            if (mod.includes('rk')) {
                const match = mod.match(/rk\s*([+-]\d+)/);
                if (match) bonuses.rk += parseInt(match[1]);
            }
            
            // Angriffs-Bonus
            if (mod.includes('angriff')) {
                const match = mod.match(/angriff\s*([+-]\d+)/);
                if (match) bonuses.angriff += parseInt(match[1]);
            }
            
            // Initiative-Bonus
            if (mod.includes('initiative')) {
                const match = mod.match(/initiative\s*([+-]\d+)/);
                if (match) bonuses.initiative += parseInt(match[1]);
            }
            
            // Ausweichen-Bonus
            if (mod.includes('ausweichen')) {
                const match = mod.match(/ausweichen\s*([+-]\d+)/);
                if (match) bonuses.ausweichen += parseInt(match[1]);
            }
        }
        
        return bonuses;
    },

    /**
     * Berechnet alle Fertigkeiten
     */
    calculateAllSkills: function(attributes) {
        const skills = {
            koerperlich: {},
            sozial: {},
            wissen: {}
        };
        
        // Körperliche Fertigkeiten
        skills.koerperlich.athletik = Math.floor((attributes.kk + attributes.kon + attributes.ges) / 3);
        skills.koerperlich.akrobatik = Math.floor((attributes.kk + attributes.kk + attributes.kon) / 3);
        skills.koerperlich.klettern = Math.floor((attributes.kon + attributes.kon + attributes.kk) / 3);
        skills.koerperlich.koerperbeherrschung = Math.floor((attributes.kon + attributes.kk + attributes.gsw) / 3);
        skills.koerperlich.schleichen = Math.floor((attributes.ges + attributes.ges + attributes.itu) / 3);
        skills.koerperlich.verstecken_tarnen = Math.floor((attributes.itu + attributes.ges + attributes.gsw) / 3);
        skills.koerperlich.fingerfertigkeit = Math.floor((attributes.itu + attributes.int + attributes.ges) / 3);
        skills.koerperlich.waffentalent = Math.floor((attributes.kk + attributes.ges + attributes.gsw) / 3);
        
        // Soziale Fertigkeiten
        skills.sozial.menschenkenntnis = Math.floor((attributes.cha + attributes.itu) / 2);
        skills.sozial.redekunst_verhandeln = Math.floor((attributes.cha + attributes.int) / 2);
        skills.sozial.beruhigen = Math.floor((attributes.cha + attributes.ges) / 2);
        skills.sozial.einschuechtern = Math.floor((attributes.cha + attributes.kk) / 2);
        skills.sozial.manipulieren = Math.floor((attributes.cha + attributes.itu) / 2);
        skills.sozial.alleinunterhalter = Math.floor((attributes.cha + attributes.cha) / 2);
        skills.sozial.flirten_verfuehren = Math.floor((attributes.cha + attributes.int) / 2);
        
        // Wissen Fertigkeiten
        skills.wissen.naturwissenschaften = Math.floor((attributes.itu + attributes.int) / 2);
        skills.wissen.ueberlebenstechniken = Math.floor((attributes.kk + attributes.kon) / 2);
        skills.wissen.pflanzenkunde_alchemie = Math.floor((attributes.itu + attributes.int) / 2);
        skills.wissen.tierkunde = Math.floor((attributes.int + attributes.int) / 2);
        skills.wissen.geschichte = Math.floor((attributes.int + attributes.int) / 2);
        skills.wissen.kriegskunst = Math.floor((attributes.itu + attributes.int) / 2);
        skills.wissen.handwerk_technologie = Math.floor((attributes.kon + attributes.kk) / 2);
        skills.wissen.jutsu_wissen = Math.floor((attributes.kon + attributes.int) / 2);
        skills.wissen.medizin_heilkunst = Math.floor((attributes.ges + attributes.int) / 2);
        skills.wissen.chakrakontrolle = Math.floor((attributes.int + attributes.int + attributes.kon) / 3);
        
        return skills;
    },

    /**
     * Berechnet Kampfwerte (KORREKT MIT MODIFIKATOREN)
     */
    calculateCombatValues: function(character, mods, clanModifiers, talentBonuses, equipBonuses) {
        const level = character.level || 1;
        
        // Clan-Boni auf Modifikatoren anwenden
        const effectiveMods = { ...mods };
        if (clanModifiers.attributes) {
            for (const [attr, bonus] of Object.entries(clanModifiers.attributes)) {
                if (effectiveMods[attr] !== undefined) {
                    // Modifikator basierend auf effektivem Attribut neu berechnen
                    const effectiveValue = character.baseAttributes[attr] + bonus;
                    effectiveMods[attr] = this.calculateModifiers({ [attr]: effectiveValue })[attr];
                }
            }
        }
        
        // Verwende Rules-Funktionen wenn verfügbar, sonst Fallback
        if (typeof Rules !== 'undefined' && Rules.COMBAT) {
            return {
                initiative: Rules.COMBAT.calculateInitiative(effectiveMods, talentBonuses),
                ausweichen: Rules.COMBAT.calculateAusweichen(effectiveMods, talentBonuses),
                angriff: Rules.COMBAT.calculateAngriff(effectiveMods, talentBonuses),
                rk: Rules.COMBAT.calculateRK(equipBonuses.rk || 0, talentBonuses),
                ninjutsu: Rules.COMBAT.calculateNinjutsu(effectiveMods, talentBonuses),
                taijutsu: Rules.COMBAT.calculateTaijutsu(effectiveMods, talentBonuses),
                genjutsu: Rules.COMBAT.calculateGenjutsu(effectiveMods, talentBonuses),
                wahrnehmung: Rules.COMBAT.calculateWahrnehmung(effectiveMods, talentBonuses),
                bewegungsradius: Rules.COMBAT.calculateBewegungsradius(effectiveMods, talentBonuses),
                chakraWiderstand: Rules.RESISTANCES.calculateChakraResist(effectiveMods, talentBonuses),
                geistigerWiderstand: Rules.RESISTANCES.calculateGeistResist(effectiveMods, talentBonuses),
                inspiration: Math.floor(level / 5)
            };
        }
        
        // Fallback-Berechnungen (nur wenn Rules nicht verfügbar)
        return {
            initiative: 5 + (effectiveMods.ges || 0) + (effectiveMods.gsw || 0) + (effectiveMods.itu || 0) + (talentBonuses.initiative || 0),
            ausweichen: 5 + (effectiveMods.ges || 0) + Math.floor((effectiveMods.gsw || 0) / 2) + (talentBonuses.ausweichen || 0),
            angriff: 2 + Math.max((effectiveMods.kk || 0), (effectiveMods.ges || 0)) + (talentBonuses.angriff || 0),
            rk: 8 + (equipBonuses.rk || 0) + (talentBonuses.rk || 0),
            ninjutsu: 2 + Math.floor(((effectiveMods.int || 0) + (effectiveMods.ges || 0)) / 2) + (talentBonuses.ninjutsu || 0),
            taijutsu: (effectiveMods.kk || 0) + (effectiveMods.ges || 0) + (talentBonuses.taijutsu || 0),
            genjutsu: (effectiveMods.int || 0) + (effectiveMods.itu || 0) + (talentBonuses.genjutsu || 0),
            wahrnehmung: (effectiveMods.itu || 0) + (effectiveMods.int || 0) + (talentBonuses.perception || 0),
            bewegungsradius: 10 + Math.max(0, (effectiveMods.gsw || 0) * 5) + (talentBonuses.bewegungsradius || 0),
            chakraWiderstand: (effectiveMods.kon || 0) + Math.floor((effectiveMods.int || 0) / 2) + (talentBonuses.chakraResist || 0),
            geistigerWiderstand: (effectiveMods.int || 0) + Math.floor((effectiveMods.itu || 0) / 2) + (talentBonuses.geistResist || 0),
            inspiration: Math.floor(level / 5)
        };
    },

    /**
     * Berechnet Hauptwerte (KORREKT MIT MODIFIKATOREN)
     */
    calculateStats: function(character, mods, clanModifiers, talentBonuses, equipBonuses) {
        const level = character.level || 1;
        
        // Verwende Rules-Funktionen wenn verfügbar
        if (typeof Rules !== 'undefined' && Rules.STATS) {
            return {
                hp: Rules.STATS.calculateHP(mods, level, talentBonuses),
                chakra: Rules.STATS.calculateChakra(mods, level, talentBonuses),
                stamina: Rules.STATS.calculateStamina(mods, talentBonuses),
                aufladungen: character.stats?.aufladungen || 0,
                karma: character.stats?.karma || 0
            };
        }
        
        // Fallback-Berechnungen (nur wenn Rules nicht verfügbar)
        return {
            hp: 30 + (mods.kon || 0) + 6 + ((level - 1) * 5) + (talentBonuses.hp || 0),
            chakra: 100 + (mods.kon || 0) + (mods.int || 0) + 22 + ((level - 1) * 7) + (talentBonuses.chakra || 0),
            stamina: Math.max(0, 3 + Math.max((mods.kon || 0), (mods.gsw || 0)) + (talentBonuses.stamina || 0)),
            aufladungen: character.stats?.aufladungen || 0,
            karma: character.stats?.karma || 0
        };
    },

    /**
     * Berechnet Widerstände (KORREKT MIT MODIFIKATOREN)
     */
    calculateResistances: function(character, mods, talentBonuses) {
        // Verwende Rules-Funktionen wenn verfügbar
        if (typeof Rules !== 'undefined' && Rules.RESISTANCES) {
            return {
                chakra: Rules.RESISTANCES.calculateChakraResist(mods, talentBonuses),
                koerper: Rules.RESISTANCES.calculateKoerperResist(mods, talentBonuses),
                geist: Rules.RESISTANCES.calculateGeistResist(mods, talentBonuses)
            };
        }
        
        // Fallback-Berechnungen
        return {
            chakra: (mods.kon || 0) + Math.floor((mods.int || 0) / 2) + (talentBonuses.chakraResist || 0),
            koerper: (mods.kon || 0) + (talentBonuses.koerperResist || 0),
            geist: (mods.int || 0) + Math.floor((mods.itu || 0) / 2) + (talentBonuses.geistResist || 0)
        };
    },

    /**
     * Aktualisiert Jutsu-Werte basierend auf Level
     */
    updateJutsuValues: function(character) {
        if (!character.jutsus) return;
        
        character.jutsus.forEach(jutsu => {
            const level = jutsu.level || 1;
            
            // Chakra-Kosten anpassen
            const chakraModifier = [1.0, 0.95, 0.90, 0.85, 0.75][level - 1] || 1.0;
            if (jutsu.baseChakra) {
                jutsu.chakraCost = Math.floor(jutsu.baseChakra * chakraModifier);
            }
            
            // Schaden anpassen
            const damageModifier = [1.0, 1.15, 1.30, 1.50, 1.75][level - 1] || 1.0;
            if (jutsu.baseDamage && jutsu.baseDamage.includes('W')) {
                // Parse Würfel-Schaden
                const match = jutsu.baseDamage.match(/(\d+)W(\d+)(?:\+(\d+))?/);
                if (match) {
                    const numDice = Math.max(1, Math.round(parseInt(match[1]) * damageModifier));
                    const diceType = match[2];
                    const bonus = match[3] ? Math.round(parseInt(match[3]) * damageModifier) : 0;
                    jutsu.damage = bonus > 0 ? `${numDice}W${diceType}+${bonus}` : `${numDice}W${diceType}`;
                }
            }
        });
    },

    // ============================================
    // AP-SYSTEM
    // ============================================
    
    /**
     * Vergibt AP (nur DM)
     */
    awardAP: function(character, amount, reason) {
        if (this.currentUser.role !== 'dm') {
            return { success: false, error: 'Nur der DM kann AP vergeben!' };
        }
        
        if (!amount || amount <= 0) {
            return { success: false, error: 'Ungültige AP-Anzahl!' };
        }
        
        character.ap.total += amount;
        character.ap.history.push({
            type: 'awarded',
            amount: amount,
            reason: reason || 'Kein Grund angegeben',
            date: Date.now(),
            awardedBy: this.currentUser.name
        });
        
        return { success: true, message: `${amount} AP vergeben!` };
    },
    
    /**
     * Kauft Talentpunkt mit AP
     */
    buyTalentPoint: function(character) {
        const apCost = 5;
        const availableAP = character.ap.total - character.ap.spent;
        
        if (availableAP < apCost) {
            return { 
                success: false, 
                error: `Nicht genug AP! Benötigt: ${apCost}, Verfügbar: ${availableAP}` 
            };
        }
        
        character.ap.spent += apCost;
        character.talents.pointsTotal += 1;
        
        return { success: true, message: 'Talentpunkt erworben!' };
    },

    // ============================================
    // LEVEL-SYSTEM
    // ============================================
    
    /**
     * Level-Up (nur DM)
     */
    levelUp: function(character) {
        if (this.currentUser.role !== 'dm') {
            return { success: false, error: 'Nur der DM kann das Level ändern!' };
        }
        
        const oldLevel = character.level;
        character.level += 1;
        const newLevel = character.level;
        
        // Belohnungen
        const rewards = {
            attributePoints: 2,
            hp: 5,
            chakra: 7,
            jutsuUnlocks: 2  // Phase 4: Jutsu-Freischaltungen
        };
        
        // Spezial-Levels
        if ([4, 8, 12, 16, 20].includes(newLevel)) {
            rewards.attributePoints += 1;
            rewards.special = 'Bonus-Attributspunkt!';
        }
        
        // Talentpunkte bei bestimmten Leveln (Phase 4)
        if ([3, 5, 7, 9, 13, 17].includes(newLevel)) {
            rewards.talentPoints = 3;
            rewards.special = rewards.special 
                ? rewards.special + ' +3 Talentpunkte!' 
                : '+3 Talentpunkte!';
        }
        
        // Anwenden
        character.attributePoints.total += rewards.attributePoints;
        if (rewards.talentPoints) {
            character.talents.pointsTotal += rewards.talentPoints;
        }
        
        // Jutsu-Freischaltungen (Phase 4)
        if (!character.jutsuProgress) {
            character.jutsuProgress = { unlocks: 0 };
        }
        character.jutsuProgress.unlocks += rewards.jutsuUnlocks;
        
        // Chakra-Widerstand +1 alle 2 Level (Phase 4)
        if (newLevel % 2 === 0) {
            character.resistances.geist += 1;
            rewards.chakraResistBonus = 1;
        }
        
        // Neuberechnen
        this.calculateCharacter(character);
        
        // Kekkei Genkai Level-Up (falls vorhanden)
        if (typeof KekkeiGenkaiSystem !== 'undefined' && character.kekkeiGenkai) {
            KekkeiGenkaiSystem.levelUp(character);
        }
        
        return {
            success: true,
            message: `Level ${newLevel} erreicht!`,
            rewards: rewards
        };
    },

    // ============================================
    // JUTSU-SYSTEM
    // ============================================
    
    /**
     * Prüft ob Jutsu gelernt werden kann
     */
    canLearnJutsu: function(character, jutsu) {
        // Start-Limit: 1W6 Jutsus
        const maxStartJutsus = 6;
        const currentJutsus = character.jutsus.length;
        
        // Rang-Limit
        const rankLimits = { 'E': 999, 'D': 999, 'C': 999, 'B': 1, 'A': 0, 'S': 0 };
        const currentByRank = character.jutsus.filter(j => j.rank === jutsu.rank).length;
        
        if (currentByRank >= rankLimits[jutsu.rank]) {
            return { 
                success: false, 
                error: `Maximale Anzahl an ${jutsu.rank}-Rang Jutsus erreicht!` 
            };
        }
        
        // AP-Kosten nach Erstellung
        if (currentJutsus >= maxStartJutsus) {
            const apCost = { 'E': 1, 'D': 2, 'C': 4, 'B': 8, 'A': 15, 'S': 30 }[jutsu.rank] || 0;
            const availableAP = character.ap.total - character.ap.spent;
            
            if (availableAP < apCost) {
                return { 
                    success: false, 
                    error: `Nicht genug AP! Benötigt: ${apCost}` 
                };
            }
            
            return { success: true, apCost: apCost };
        }
        
        return { success: true, apCost: 0 };
    },
    
    /**
     * Levelt ein Jutsu auf
     */
    levelUpJutsu: function(character, jutsuId) {
        const jutsu = character.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) {
            return { success: false, error: 'Jutsu nicht gefunden!' };
        }
        
        if (jutsu.level >= 5) {
            return { success: false, error: 'Maximales Level erreicht!' };
        }
        
        // AP-Kosten
        const apCosts = {
            'E': { base: 2, perLevel: 1 },
            'D': { base: 3, perLevel: 2 },
            'C': { base: 5, perLevel: 3 },
            'B': { base: 8, perLevel: 4 },
            'A': { base: 12, perLevel: 6 },
            'S': { base: 20, perLevel: 10 }
        };
        
        const cost = apCosts[jutsu.rank];
        const apCost = cost.base + (cost.perLevel * jutsu.level);
        const availableAP = character.ap.total - character.ap.spent;
        
        if (availableAP < apCost) {
            return { 
                success: false, 
                error: `Nicht genug AP! Benötigt: ${apCost}` 
            };
        }
        
        // AP abziehen
        character.ap.spent += apCost;
        jutsu.level += 1;
        
        // Werte aktualisieren
        this.updateJutsuValues(character);
        
        return { 
            success: true, 
            message: `${jutsu.name} ist jetzt Level ${jutsu.level}!`,
            apCost: apCost
        };
    },

    // ============================================
    // INVENTAR & GELD GENEHMIGUNG
    // ============================================
    
    pendingChanges: [],
    
    /**
     * Erstellt eine Änderungsanfrage
     */
    requestChange: function(character, type, data) {
        const request = {
            id: Date.now(),
            characterId: character.id,
            type: type, // 'inventory', 'money', 'equipment'
            data: data,
            status: 'pending',
            timestamp: Date.now()
        };
        
        this.pendingChanges.push(request);
        return { success: true, requestId: request.id };
    },
    
    /**
     * Genehmigt eine Änderung (nur DM)
     */
    approveChange: function(requestId) {
        if (this.currentUser.role !== 'dm') {
            return { success: false, error: 'Nur der DM kann Änderungen genehmigen!' };
        }
        
        const request = this.pendingChanges.find(r => r.id === requestId);
        if (!request) {
            return { success: false, error: 'Anfrage nicht gefunden!' };
        }
        
        request.status = 'approved';
        
        // Änderung anwenden
        return { success: true, request: request };
    },

    // ============================================
    // HILFSFUNKTIONEN
    // ============================================
    
    /**
     * Prüft ob Benutzer DM ist
     */
    isDM: function() {
        return this.currentUser.role === 'dm';
    },
    
    /**
     * Setzt die Benutzerrolle
     */
    setUserRole: function(role, name) {
        this.currentUser.role = role;
        this.currentUser.name = name;
        this.currentUser.id = Date.now();
    }
};

// Export für Browser
if (typeof window !== 'undefined') {
    window.NPUCore = NPUCore;
}
