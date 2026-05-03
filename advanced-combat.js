/**
 * NPU Advanced Combat System - Phase 4
 * Erweiterte Kampfmechaniken: Kombo, Überlegenheit, Inspiration, Chakra-Reserven
 */

const AdvancedCombatSystem = {
    // ============================================
    // KOMBO-ANGRIFFE
    // ============================================
    
    /**
     * Führt einen Kombo-Angriff durch
     */
    executeCombo: function(mainAttacker, supporters, target, mainJutsu, supportJutsus) {
        // Prüfe Talent
        const hasComboTalent = mainAttacker.talents?.selected?.includes('combo_attack');
        if (!hasComboTalent) {
            return { success: false, error: 'Talent "Kombo Angriff" erforderlich!' };
        }
        
        // Maximale Unterstützer
        if (supporters.length > 2) {
            return { success: false, error: 'Maximal 2 Unterstützer!' };
        }
        
        // Chakra-Kosten aller Jutsus
        let totalChakraCost = mainJutsu.chakraCost;
        supportJutsus.forEach(jutsu => {
            totalChakraCost += jutsu.chakraCost;
        });
        
        if (mainAttacker.stats.chakra < totalChakraCost) {
            return { success: false, error: 'Nicht genug Chakra für Kombo!' };
        }
        
        // Chakra abziehen
        mainAttacker.stats.chakra -= mainJutsu.chakraCost;
        supporters.forEach((supporter, index) => {
            supporter.stats.chakra -= supportJutsus[index].chakraCost;
        });
        
        // Schaden berechnen
        let mainDamage = this.parseDamage(mainJutsu.damage);
        let bonusDamage = 0;
        
        supportJutsus.forEach(jutsu => {
            const supportDamage = this.parseDamage(jutsu.damage);
            bonusDamage += Math.floor(supportDamage * 0.5); // +50% vom unterstützenden Schaden
        });
        
        const totalDamage = mainDamage + bonusDamage;
        
        // Optional: Debuff auf Ziel
        const debuff = {
            type: 'combo_debuff',
            duration: 1,
            effects: {
                defenseMod: -2
            }
        };
        
        return {
            success: true,
            mainDamage: mainDamage,
            bonusDamage: bonusDamage,
            totalDamage: totalDamage,
            debuff: debuff,
            message: `Kombo-Angriff! ${totalDamage} Schaden (${mainDamage} + ${bonusDamage})`
        };
    },
    
    /**
     * Parst Schadens-String (z.B. "3W6")
     */
    parseDamage: function(damageString) {
        if (!damageString || damageString === '-') return 0;
        
        const match = damageString.match(/(\d+)W(\d+)(?:\+(\d+))?/);
        if (!match) return 0;
        
        const numDice = parseInt(match[1]);
        const diceType = parseInt(match[2]);
        const bonus = parseInt(match[3]) || 0;
        
        let damage = bonus;
        for (let i = 0; i < numDice; i++) {
            damage += Math.floor(Math.random() * diceType) + 1;
        }
        
        return damage;
    },
    
    // ============================================
    // ÜBERLEGENHEITS-SYSTEM
    // ============================================
    
    SUPERIORITY: {
        GROSS: {
            name: 'Groß',
            levels: [3, 5, 7],
            description: '+3 / +5 / +7 auf alle Würfe'
        },
        GEWALTIG: {
            name: 'Gewaltig',
            levels: [4, 8, 12],
            description: '+4 / +8 / +12 auf alle Würfe'
        },
        TOTAL: {
            name: 'Total',
            levels: [5, 10, 15],
            description: '+5 / +10 / +15 auf alle Würfe',
            requiresTalent: true
        }
    },
    
    /**
     * Wendet Überlegenheit an
     */
    applySuperiority: function(character, type, level) {
        // Nur DM kann Überlegenheit setzen
        if (typeof NPUCore !== 'undefined' && !NPUCore.isDM()) {
            return { success: false, error: 'Nur der DM kann Überlegenheit setzen!' };
        }
        
        const supData = this.SUPERIORITY[type.toUpperCase()];
        if (!supData) {
            return { success: false, error: 'Ungültige Überlegenheits-Stufe!' };
        }
        
        // Prüfe Talent für hohe Stufen
        if (supData.requiresTalent && level >= 2) {
            const hasTalent = character.talents?.selected?.includes('ueberlegener_shinobi');
            if (!hasTalent) {
                return { success: false, error: 'Talent "Überlegener Shinobi" erforderlich!' };
            }
        }
        
        const bonus = supData.levels[level - 1] || supData.levels[0];
        
        // Speichere Überlegenheit
        character.superiority = {
            type: type,
            level: level,
            bonus: bonus
        };
        
        return {
            success: true,
            message: `${supData.name} Überlegenheit (Stufe ${level}): +${bonus}`,
            bonus: bonus
        };
    },
    
    /**
     * Berechnet Überlegenheits-Bonus
     */
    getSuperiorityBonus: function(character) {
        return character.superiority?.bonus || 0;
    },
    
    // ============================================
    // CHAKRA-RESERVEN
    // ============================================
    
    CHAKRA_RESERVE: {
        maxNegative: -50,  // -50% vom Maximum
        unconsciousThreshold: -33,
        dailyUse: 1
    },
    
    /**
     * Nutzt Chakra-Reserve
     */
    useChakraReserve: function(character, amount) {
        // Prüfe ob bereits genutzt
        if (character.chakraReserveUsed) {
            return { success: false, error: 'Chakra-Reserve bereits heute genutzt!' };
        }
        
        const maxChakra = character.stats.chakra;
        const minChakra = Math.floor(maxChakra * (this.CHAKRA_RESERVE.maxNegative / 100));
        
        const newChakra = character.stats.chakra - amount;
        
        if (newChakra < minChakra) {
            return {
                success: false,
                error: `Chakra-Reserve würde unter ${this.CHAKRA_RESERVE.maxNegative}% fallen!`
            };
        }
        
        character.stats.chakra = newChakra;
        character.chakraReserveUsed = true;
        
        // Prüfe Bewusstlosigkeit
        const unconscious = newChakra <= Math.floor(maxChakra * (this.CHAKRA_RESERVE.unconsciousThreshold / 100));
        
        return {
            success: true,
            chakraUsed: amount,
            remaining: newChakra,
            unconscious: unconscious,
            message: unconscious 
                ? 'WARNUNG: Bewusstlosigkeit droht nach Aktion!' 
                : 'Chakra-Reserve genutzt!'
        };
    },
    
    /**
     * Setzt Chakra-Reserve zurück (täglich)
     */
    resetChakraReserve: function(character) {
        character.chakraReserveUsed = false;
    },
    
    /**
     * Prüft ob Chakra-Regeneration aktiv ist
     */
    canRegenerateChakra: function(character) {
        // Keine Regeneration wenn Reserve genutzt
        if (character.chakraReserveUsed) {
            return false;
        }
        
        // Keine Regeneration bei negativem Chakra
        if (character.stats.chakra < 0) {
            return false;
        }
        
        return true;
    },
    
    // ============================================
    // GENJUTSU ERWEITERUNG
    // ============================================
    
    /**
     * Erweiterte Genjutsu-Anwendung mit doppelter Prüfung
     */
    applyGenjutsuAdvanced: function(caster, target, genjutsuData) {
        // 1. Wahrnehmungs-Check (erkennt Genjutsu)
        const perceptionCheck = this.doPerceptionCheck(target);
        
        if (!perceptionCheck.success) {
            // Ziel bemerkt Genjutsu nicht - automatischer Erfolg
            return this.executeGenjutsu(caster, target, genjutsuData, true);
        }
        
        // 2. Geistiger Widerstand
        const resistanceCheck = this.doSpiritResistanceCheck(target, caster);
        
        if (resistanceCheck.success) {
            return {
                success: true,
                resisted: true,
                message: `${target.name} hat das Genjutsu erkannt und widerstanden!`,
                perception: perceptionCheck,
                resistance: resistanceCheck
            };
        }
        
        // Genjutsu erfolgreich
        return this.executeGenjutsu(caster, target, genjutsuData, false);
    },
    
    /**
     * Wahrnehmungs-Check
     */
    doPerceptionCheck: function(target) {
        const perception = target.skills?.wissen?.wahrnehmung || 8;
        const mod = Math.floor((perception - 10) / 2);
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + mod;
        
        // DC 15 für Genjutsu-Erkennung
        const success = total >= 15;
        
        return {
            roll: roll,
            mod: mod,
            total: total,
            success: success
        };
    },
    
    /**
     * Geistiger Widerstands-Check
     */
    doSpiritResistanceCheck: function(target, caster) {
        const intMod = Math.floor((target.baseAttributes.int - 10) / 2);
        const konMod = Math.floor((target.baseAttributes.kon - 10) / 2);
        const roll = Math.floor(Math.random() * 20) + 1;
        
        const total = roll + intMod + konMod;
        const difficulty = target.resistances.geist;
        
        return {
            roll: roll,
            intMod: intMod,
            konMod: konMod,
            total: total,
            difficulty: difficulty,
            success: total >= difficulty
        };
    },
    
    /**
     * Führt Genjutsu aus
     */
    executeGenjutsu: function(caster, target, genjutsuData, undetected) {
        // Chakra-Kosten
        if (caster.stats.chakra < genjutsuData.chakraCost) {
            return { success: false, error: 'Nicht genug Chakra!' };
        }
        caster.stats.chakra -= genjutsuData.chakraCost;
        
        // Status anwenden
        if (typeof StatusEffectSystem !== 'undefined') {
            StatusEffectSystem.applyStatus(target, 'GENJUTSU', -1, {
                caster: caster.name,
                effect: genjutsuData.effect,
                escapeDC: target.resistances.geist
            });
        }
        
        return {
            success: true,
            resisted: false,
            undetected: undetected,
            message: undetected 
                ? `${target.name} hat das Genjutsu nicht bemerkt!` 
                : `${target.name} ist unter Genjutsu!`,
            effect: genjutsuData.effect
        };
    },
    
    /**
     * Prüft Genjutsu-Limit (nur 1 Gruppen-Genjutsu)
     */
    checkGenjutsuLimit: function(caster, targets) {
        // Prüfe ob bereits Gruppen-Genjutsu aktiv
        const hasGroupGenjutsu = targets.some(t => 
            t.statusEffects?.some(s => s.id === 'genjutsu' && s.caster !== caster.name)
        );
        
        if (hasGroupGenjutsu && targets.length > 1) {
            return {
                allowed: false,
                error: 'Nur 1 Gruppen-Genjutsu gleichzeitig aktiv!'
            };
        }
        
        return { allowed: true };
    },
    
    // ============================================
    // BEWEGUNG & REICHWEITEN
    // ============================================
    
    MOVEMENT: {
        base: 10,
        attribute: 'gsw'
    },
    
    RANGE: {
        NAHKAMPF: { name: 'Nahkampf', min: 0, max: 5 },
        NAH: { name: 'Nah', min: 10, max: 30 },
        MITTEL: { name: 'Mittel', min: 30, max: 50 },
        FERN: { name: 'Fern', min: 50, max: 999 }
    },
    
    /**
     * Berechnet Bewegungsrate
     */
    calculateMovement: function(character) {
        const base = this.MOVEMENT.base;
        const gswMod = Math.floor((character.baseAttributes.gsw - 10) / 2);
        
        let movement = base + gswMod;
        
        // Status-Effekte anwenden
        if (typeof StatusEffectSystem !== 'undefined') {
            const moveCheck = StatusEffectSystem.canMove(character);
            if (!moveCheck.can) return 0;
            movement = moveCheck.speed;
        }
        
        return Math.max(0, movement);
    },
    
    /**
     * Bestimmt Reichweiten-Kategorie
     */
    getRangeCategory: function(distance) {
        for (const [key, range] of Object.entries(this.RANGE)) {
            if (distance >= range.min && distance <= range.max) {
                return { key, ...range };
            }
        }
        return this.RANGE.FERN;
    },
    
    // ============================================
    // AUSWEICHEN ERWEITERT
    // ============================================
    
    /**
     * Führt Ausweichen mit Ansage-System durch
     */
    doAusweichenAdvanced: function(character, attackerRoll, declared = false) {
        // Prüfe ob Ausweichen angesagt wurde
        if (!declared) {
            return {
                success: false,
                error: 'Ausweichen muss VOR dem Angriff angesagt werden!',
                canDeclare: true
            };
        }
        
        // Stamina-Check
        if (typeof CombatSystem !== 'undefined') {
            const staminaCheck = CombatSystem.spendStamina(character, 'AUSWEICHEN');
            if (!staminaCheck.success) {
                return { success: false, error: staminaCheck.error };
            }
        }
        
        // Ausweichwurf
        const ausweichWert = character.combat.ausweichen;
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + ausweichWert;
        
        const success = total > attackerRoll;
        
        return {
            success: success,
            roll: roll,
            total: total,
            target: attackerRoll,
            damage: success ? 0 : 'full', // Bei Fehlschlag: voller Schaden, KEINE Rüstung
            armorAllowed: false, // Bei Ausweich-Versuch keine Rüstung
            message: success 
                ? 'Ausweichen erfolgreich - kein Schaden!' 
                : 'Ausweichen fehlgeschlagen - voller Schaden (keine Rüstung)!'
        };
    },
    
    // ============================================
    // JUTSU-KAMPFREGELN
    // ============================================
    
    /**
     * Unterbricht ein Jutsu
     */
    interruptJutsu: function(caster, interrupter, method = 'attack') {
        const jutsu = caster.currentJutsu;
        if (!jutsu) {
            return { success: false, error: 'Kein aktives Jutsu!' };
        }
        
        let chakraCost;
        
        if (method === 'attack') {
            // Durch Gegner: 50% Chakra-Verbrauch
            chakraCost = Math.floor(jutsu.chakraCost * 0.5);
        } else if (method === 'self') {
            // Selbst abgebrochen: 10% Chakra-Verbrauch
            chakraCost = Math.floor(jutsu.chakraCost * 0.1);
        }
        
        caster.stats.chakra -= chakraCost;
        caster.currentJutsu = null;
        
        return {
            success: true,
            chakraCost: chakraCost,
            message: `Jutsu unterbrochen! ${chakraCost} Chakra verbraucht.`
        };
    },
    
    /**
     * Prüft auf kritischen Treffer
     */
    checkCritical: function(roll, critRange = 20) {
        return roll >= critRange;
    },
    
    /**
     * Wendet kritischen Treffer an
     */
    applyCritical: function(baseDamage, jutsu) {
        return {
            damage: baseDamage * 2,
            chakraCost: Math.floor(jutsu.chakraCost * 0.5), // Halbierte Chakra-Kosten
            message: 'Kritischer Treffer! Schaden x2, Chakra halbiert!'
        };
    },
    
    /**
     * Prüft auf Patzer
     */
    checkFumble: function(roll) {
        return roll === 1;
    },
    
    /**
     * Wendet Patzer an
     */
    applyFumble: function(jutsu) {
        const extraCost = Math.floor(jutsu.chakraCost * 0.1) + 5;
        
        return {
            success: false,
            extraChakraCost: extraCost,
            message: `Patzer! Jutsu schlägt fehl. +${extraCost} Chakra Kosten.`
        };
    },
    
    // ============================================
    // RUNDEN- & PHASENSYSTEM
    // ============================================
    
    COMBAT_PHASES: [
        'initiative',
        'analyse',
        'aktion',
        'bonusaktion',
        'reaktion',
        'status'
    ],
    
    /**
     * Startet eine Kampfrunde mit Phasen
     */
    startRoundPhased: function(characters) {
        // 1. Initiative
        const initiatives = characters.map(char => {
            const w6 = Math.floor(Math.random() * 6) + 1;
            return {
                character: char,
                initiative: w6 + char.combat.initiative,
                roll: w6
            };
        }).sort((a, b) => b.initiative - a.initiative);
        
        // 2. Analyse-Phase (Spieler können sich beraten)
        
        // 3. Aktion-Phase (wird einzeln abgehandelt)
        
        // 4. Bonusaktion-Phase
        
        // 5. Reaktion-Phase (während gegnerischer Züge)
        
        // 6. Status-Phase
        
        return {
            turnOrder: initiatives,
            phase: 0,
            round: 1,
            currentPhase: this.COMBAT_PHASES[0]
        };
    },
    
    /**
     * Führt Status-Phase aus
     */
    executeStatusPhase: function(characters) {
        const results = [];
        
        characters.forEach(char => {
            // Status-Effekte ticken
            if (typeof StatusEffectSystem !== 'undefined') {
                const tickResult = StatusEffectSystem.tickAll(char);
                results.push({ character: char.name, ...tickResult });
            }
            
            // Stamina regenerieren
            if (typeof CombatSystem !== 'undefined') {
                CombatSystem.regenerateStamina(char, 'kampf');
            }
            
            // Reaktion zurücksetzen
            if (char.combat) {
                char.combat.hasReacted = false;
            }
        });
        
        return results;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.AdvancedCombatSystem = AdvancedCombatSystem;
}
