/**
 * NPU Combat System - Phase 3
 * Kampflogik mit Stamina, Reaktionen, Genjutsu
 */

const CombatSystem = {
    // ============================================
    // STAMINA SYSTEM
    // ============================================
    
    STAMINA: {
        // Kosten
        COSTS: {
            AUSWEICHEN: 1,
            PARADE: 1,
            KONTER: 2,
            SPRINT: 2,
            KLETTERN: 1,
            SCHLEICHEN_RASCH: 1
        },
        
        // Regeneration
        REGEN: {
            STANDARD: 1,      // pro Runde
            RUHE: 3,          // pro Runde in Ruhe
            KAMPF: 0          // im Kampf
        },
        
        // Auswirkungen bei 0 Stamina
        ZERO_EFFECTS: {
            modAll: -2,
            noActiveAusweichen: true,
            noSprint: true
        }
    },
    
    /**
     * Verbraucht Stamina
     */
    spendStamina: function(character, action) {
        const cost = this.STAMINA.COSTS[action];
        if (!cost) return { success: false, error: 'Unbekannte Aktion!' };
        
        if (character.stats.stamina < cost) {
            return { 
                success: false, 
                error: 'Nicht genug Stamina!',
                current: character.stats.stamina,
                needed: cost
            };
        }
        
        character.stats.stamina -= cost;
        
        return {
            success: true,
            remaining: character.stats.stamina,
            message: `${action}: ${cost} Stamina verbraucht`
        };
    },
    
    /**
     * Regeneriert Stamina
     */
    regenerateStamina: function(character, situation = 'standard') {
        const regen = this.STAMINA.REGEN[situation.toUpperCase()] || 1;
        const maxStamina = this.calculateMaxStamina(character);
        
        character.stats.stamina = Math.min(
            maxStamina,
            character.stats.stamina + regen
        );
        
        return {
            regenerated: regen,
            current: character.stats.stamina,
            max: maxStamina
        };
    },
    
    /**
     * Berechnet maximale Stamina
     */
    calculateMaxStamina: function(character) {
        const base = 3;
        const konMod = Math.floor((character.baseAttributes.kon - 10) / 2);
        const levelBonus = Math.floor(character.level / 5);
        
        return Math.max(1, base + konMod + levelBonus);
    },
    
    /**
     * Prüft Auswirkungen bei niedriger Stamina
     */
    checkStaminaEffects: function(character) {
        if (character.stats.stamina > 0) {
            return { active: false };
        }
        
        return {
            active: true,
            effects: this.STAMINA.ZERO_EFFECTS,
            message: 'Keine Stamina! Alle Würfe -2, kein aktives Ausweichen!'
        };
    },
    
    // ============================================
    // REAKTIONSSYSTEM
    // ============================================
    
    REACTIONS: {
        AUSWEICHEN: 'ausweichen',
        PARADE: 'parade',
        KONTER: 'konter'
    },
    
    /**
     * Führt Ausweichen durch
     */
    doAusweichen: function(character, attackerRoll) {
        // Stamina prüfen
        const staminaCheck = this.spendStamina(character, 'AUSWEICHEN');
        if (!staminaCheck.success) {
            return { success: false, error: staminaCheck.error };
        }
        
        // Ausweichwurf
        const ausweichWert = character.combat.ausweichen;
        const w20 = Math.floor(Math.random() * 20) + 1;
        const ausweichWurf = w20 + ausweichWert;
        
        const success = ausweichWurf > attackerRoll;
        
        return {
            success: success,
            roll: w20,
            total: ausweichWurf,
            target: attackerRoll,
            staminaLeft: character.stats.stamina,
            message: success ? 'Ausweichen erfolgreich!' : 'Ausweichen fehlgeschlagen!'
        };
    },
    
    /**
     * Führt Parade durch
     */
    doParade: function(character, attackerRoll) {
        // Stamina prüfen
        const staminaCheck = this.spendStamina(character, 'PARADE');
        if (!staminaCheck.success) {
            return { success: false, error: staminaCheck.error };
        }
        
        // Parade = Waffentalent vs Angriff
        const paradeWert = character.skills?.koerperlich?.waffentalent || 8;
        const w20 = Math.floor(Math.random() * 20) + 1;
        const paradeWurf = w20 + paradeWert;
        
        const success = paradeWurf >= attackerRoll;
        
        return {
            success: success,
            roll: w20,
            total: paradeWurf,
            target: attackerRoll,
            staminaLeft: character.stats.stamina,
            message: success ? 'Parade erfolgreich!' : 'Parade durchbrochen!'
        };
    },
    
    /**
     * Führt Konter durch
     */
    doKonter: function(character, attackerRoll) {
        // Stamina prüfen
        const staminaCheck = this.spendStamina(character, 'KONTER');
        if (!staminaCheck.success) {
            return { success: false, error: staminaCheck.error };
        }
        
        // Konter-Zielwert = Angriffswurf - 2
        const konterZiel = attackerRoll - 2;
        const angriffWert = character.combat.angriff;
        const w20 = Math.floor(Math.random() * 20) + 1;
        const konterWurf = w20 + angriffWert;
        
        const success = konterWurf >= konterZiel;
        
        return {
            success: success,
            roll: w20,
            total: konterWurf,
            target: konterZiel,
            damageMultiplier: success ? 1.5 : 0, // +50% Schaden bei Erfolg
            staminaLeft: character.stats.stamina,
            message: success ? 'Konter erfolgreich! +50% Schaden!' : 'Konter fehlgeschlagen!'
        };
    },
    
    /**
     * Prüft ob Reaktion möglich ist
     */
    canReact: function(character) {
        // Maximal 1 Reaktion pro Runde
        if (character.combat.hasReacted) {
            return { can: false, error: 'Bereits reagiert diese Runde!' };
        }
        
        // Bei 0 Stamina kein aktives Ausweichen
        if (character.stats.stamina <= 0) {
            return { can: false, error: 'Keine Stamina für Reaktion!' };
        }
        
        return { can: true };
    },
    
    /**
     * Setzt Reaktions-Flag zurück (Rundenende)
     */
    resetReaction: function(character) {
        character.combat.hasReacted = false;
    },
    
    // ============================================
    // GENJUTSU SYSTEM
    // ============================================
    
    /**
     * Wendet Genjutsu an
     */
    applyGenjutsu: function(caster, target, genjutsuData) {
        // Chakra-Kosten
        if (caster.stats.chakra < genjutsuData.chakraCost) {
            return { success: false, error: 'Nicht genug Chakra!' };
        }
        caster.stats.chakra -= genjutsuData.chakraCost;
        
        // Rettungswurf des Ziels
        const saveResult = this.doGenjutsuSave(target);
        
        if (saveResult.success) {
            return {
                success: true,
                resisted: true,
                message: `${target.name} hat das Genjutsu widerstanden!`,
                saveRoll: saveResult.roll,
                saveTotal: saveResult.total
            };
        }
        
        // Genjutsu erfolgreich
        // Effekt wird vom Spieler definiert (keine feste Wirkung)
        target.statusEffects = target.statusEffects || [];
        target.statusEffects.push({
            type: 'genjutsu',
            caster: caster.name,
            description: genjutsuData.effect || 'Unter Genjutsu',
            round: 1,
            escapeDC: target.resistances.geist // Schwierigkeit für Rettungswurf
        });
        
        return {
            success: true,
            resisted: false,
            message: `${target.name} ist unter Genjutsu!`,
            effect: genjutsuData.effect
        };
    },
    
    /**
     * Rettungswurf gegen Genjutsu
     */
    doGenjutsuSave: function(target) {
        // W20 + INT Mod + KON Mod
        const intMod = Math.floor((target.baseAttributes.int - 10) / 2);
        const konMod = Math.floor((target.baseAttributes.kon - 10) / 2);
        const w20 = Math.floor(Math.random() * 20) + 1;
        
        const saveRoll = w20 + intMod + konMod;
        const difficulty = target.resistances.geist;
        
        return {
            roll: w20,
            intMod: intMod,
            konMod: konMod,
            total: saveRoll,
            difficulty: difficulty,
            success: saveRoll >= difficulty
        };
    },
    
    /**
     * Versucht Genjutsu zu brechen (pro Runde)
     */
    tryBreakGenjutsu: function(target, genjutsuEffect) {
        // Jede Runde +1 erleichtert
        const roundBonus = genjutsuEffect.round - 1;
        
        const intMod = Math.floor((target.baseAttributes.int - 10) / 2);
        const konMod = Math.floor((target.baseAttributes.kon - 10) / 2);
        const w20 = Math.floor(Math.random() * 20) + 1;
        
        const saveRoll = w20 + intMod + konMod + roundBonus;
        const difficulty = genjutsuEffect.escapeDC;
        
        const success = saveRoll >= difficulty;
        
        if (success) {
            // Entferne Genjutsu
            const index = target.statusEffects.indexOf(genjutsuEffect);
            if (index > -1) {
                target.statusEffects.splice(index, 1);
            }
        } else {
            // Runde erhöhen
            genjutsuEffect.round++;
        }
        
        return {
            success: success,
            roll: w20,
            total: saveRoll,
            difficulty: difficulty,
            roundBonus: roundBonus,
            rounds: genjutsuEffect.round
        };
    },
    
    // ============================================
    // KAMPFRUNDE
    // ============================================
    
    /**
     * Startet eine neue Kampfrunde
     */
    startRound: function(characters) {
        // Initiative bestimmen
        const initiatives = characters.map(char => {
            const w6 = Math.floor(Math.random() * 6) + 1;
            return {
                character: char,
                initiative: w6 + char.combat.initiative,
                roll: w6
            };
        });
        
        // Sortieren (höchste Initiative zuerst)
        initiatives.sort((a, b) => b.initiative - a.initiative);
        
        // Reaktions-Flags zurücksetzen
        characters.forEach(char => {
            this.resetReaction(char);
        });
        
        return {
            turnOrder: initiatives,
            round: 1
        };
    },
    
    /**
     * Beendet eine Runde
     */
    endRound: function(characters) {
        // Stamina regenerieren (im Kampf nur 0)
        characters.forEach(char => {
            this.regenerateStamina(char, 'kampf');
            
            // Genjutsu-Runden erhöhen
            if (char.statusEffects) {
                char.statusEffects.forEach(effect => {
                    if (effect.type === 'genjutsu') {
                        // Automatischer Rettungswurf
                        this.tryBreakGenjutsu(char, effect);
                    }
                });
            }
        });
    },
    
    // ============================================
    // WÜRFEL VALIDIERUNG
    // ============================================
    
    DICE: {
        W6: { min: 1, max: 6 },
        W8: { min: 1, max: 8 },
        W10: { min: 1, max: 10 },
        W12: { min: 1, max: 12 },
        W20: { min: 1, max: 20 },
        W100: { min: 1, max: 100 }
    },
    
    /**
     * Validiert einen Würfelwurf
     */
    validateRoll: function(diceType, value) {
        const dice = this.DICE[diceType.toUpperCase()];
        if (!dice) {
            return { valid: false, error: `Unbekannter Würfel: ${diceType}` };
        }
        
        if (value < dice.min || value > dice.max) {
            return {
                valid: false,
                error: `${diceType} muss zwischen ${dice.min} und ${dice.max} sein!`,
                min: dice.min,
                max: dice.max
            };
        }
        
        return { valid: true };
    }
};

// Export
if (typeof window !== 'undefined') {
    window.CombatSystem = CombatSystem;
}
