/**
 * NPU Status Effect System - Phase 4
 * Vollständiges Status-Effekt-System mit Tick-Verhalten
 */

const StatusEffectSystem = {
    // ============================================
    // INITIALISIERUNG
    // ============================================
    
    init: function() {
        console.log('StatusEffectSystem initialized');
        return true;
    },
    
    // ============================================
    // STATUS-EFFEKT DEFINITIONEN
    // ============================================
    
    STATUS: {
        BENOMMEN: {
            id: 'benommen',
            name: 'Benommen',
            icon: '💫',
            duration: 1,
            description: 'Keine Aktionen oder Bonusaktionen möglich',
            effects: {
                noActions: true,
                noBonusActions: true,
                movement: 0,
                advantageAgainst: true  // Angriffe gegen Ziel haben Vorteil
            }
        },
        
        VERLANGSAMT: {
            id: 'verlangsamt',
            name: 'Verlangsamt',
            icon: '🐌',
            duration: 3,
            description: 'Bewegung halbiert, -2 auf Angriff',
            effects: {
                movementMultiplier: 0.5,
                attackMod: -2,
                reactionCheck: true  // Reaktionen nur mit erfolgreichem Wurf
            }
        },
        
        FESTGEHALTEN: {
            id: 'festgehalten',
            name: 'Festgehalten',
            icon: '⛓️',
            duration: -1, // Bis befreit
            description: 'Bewegung = 0, Entkommen mit Athletik/Akrobatik',
            effects: {
                movement: 0,
                escapeAction: true,
                escapeSkills: ['athletik', 'akrobatik']
            }
        },
        
        VERWIRRT: {
            id: 'verwirrt',
            name: 'Verwirrt',
            icon: '😵',
            duration: 3,
            description: 'Zufälliges Verhalten zu Beginn jeder Runde',
            effects: {
                confusionRoll: true,
                confusionTable: {
                    1: { max: 5, effect: 'no_action', description: 'Keine Aktion' },
                    2: { max: 10, effect: 'random_move', description: 'Zufällige Bewegung' },
                    3: { max: 15, effect: 'normal_action', description: 'Normale Aktion' },
                    4: { max: 20, effect: 'free_choice', description: 'Freie Wahl' }
                }
            }
        },
        
        BRENNEND: {
            id: 'brennend',
            name: 'Brennend',
            icon: '🔥',
            duration: 3,
            description: '1W6 Schaden pro Runde',
            tickDamage: { dice: '1w6', type: 'fire' },
            effects: {
                damagePerRound: '1w6',
                canExtinguish: true,
                extinguishMethods: ['action', 'water', 'fuuton']
            }
        },
        
        VERGIFTET: {
            id: 'vergiftet',
            name: 'Vergiftet',
            icon: '☠️',
            duration: 5,
            description: '1W4 Schaden pro Runde',
            tickDamage: { dice: '1w4', type: 'poison' },
            effects: {
                damagePerRound: '1w4'
            }
        },
        
        GENJUTSU: {
            id: 'genjutsu',
            name: 'Unter Genjutsu',
            icon: '👁️',
            duration: -1, // Bis gebrochen
            description: 'Unter dem Einfluss eines Genjutsu',
            effects: {
                escapeCheck: true,
                escapeDC: 0, // Wird dynamisch gesetzt
                roundBonus: 1 // Jede Runde +1 erleichtert
            }
        },
        
        INSPIRATION: {
            id: 'inspiration',
            name: 'Inspiration',
            icon: '✨',
            duration: -1, // Bis genutzt
            description: 'W20 Wurf kann wiederholt werden',
            effects: {
                reroll20: true,
                maxStack: 2
            }
        }
    },
    
    // ============================================
    // STATUS ANWENDEN
    // ============================================
    
    /**
     * Wendet einen Status-Effekt an
     */
    applyStatus: function(character, statusId, duration = null, customData = {}) {
        const statusDef = this.STATUS[statusId.toUpperCase()];
        if (!statusDef) {
            return { success: false, error: 'Unbekannter Status!' };
        }
        
        // Prüfe ob bereits vorhanden
        const existing = character.statusEffects?.find(s => s.id === statusDef.id);
        if (existing) {
            // Verlängere Dauer
            existing.duration = duration || statusDef.duration;
            existing.rounds = 0;
            return { success: true, message: `${statusDef.name} verlängert!`, status: existing };
        }
        
        // Erstelle neuen Status
        const newStatus = {
            id: statusDef.id,
            name: statusDef.name,
            icon: statusDef.icon,
            duration: duration || statusDef.duration,
            rounds: 0,
            description: statusDef.description,
            effects: { ...statusDef.effects },
            ...customData
        };
        
        // Initialisiere Status-Array falls nicht vorhanden
        if (!character.statusEffects) {
            character.statusEffects = [];
        }
        
        character.statusEffects.push(newStatus);
        
        return { success: true, message: `${statusDef.name} angewendet!`, status: newStatus };
    },
    
    /**
     * Entfernt einen Status-Effekt
     */
    removeStatus: function(character, statusId) {
        if (!character.statusEffects) return { success: false };
        
        const index = character.statusEffects.findIndex(s => s.id === statusId);
        if (index === -1) {
            return { success: false, error: 'Status nicht gefunden!' };
        }
        
        const removed = character.statusEffects.splice(index, 1)[0];
        return { success: true, message: `${removed.name} entfernt!`, status: removed };
    },
    
    // ============================================
    // TICK-SYSTEM (Pro Runde)
    // ============================================
    
    /**
     * Führt alle Status-Effekte pro Runde aus
     */
    tickAll: function(character) {
        if (!character.statusEffects || character.statusEffects.length === 0) {
            return { ticked: [], removed: [] };
        }
        
        const results = {
            ticked: [],
            removed: [],
            damage: 0
        };
        
        character.statusEffects = character.statusEffects.filter(status => {
            const tickResult = this.tickStatus(character, status);
            
            if (tickResult.expired) {
                results.removed.push(status);
                return false;
            }
            
            if (tickResult.damage) {
                results.damage += tickResult.damage;
            }
            
            results.ticked.push({ status: status, result: tickResult });
            return true;
        });
        
        // Schaden anwenden
        if (results.damage > 0) {
            character.stats.hp -= results.damage;
        }
        
        return results;
    },
    
    /**
     * Führt einen einzelnen Status-Tick aus
     */
    tickStatus: function(character, status) {
        const result = {
            expired: false,
            damage: 0,
            effects: []
        };
        
        status.rounds++;
        
        // Tick-Damage (Brennend, Vergiftet)
        if (status.effects.damagePerRound) {
            const damage = this.rollDamage(status.effects.damagePerRound);
            result.damage = damage;
            result.effects.push({ type: 'damage', amount: damage });
        }
        
        // Verwirrung-Wurf
        if (status.effects.confusionRoll) {
            const confusionResult = this.rollConfusion();
            result.effects.push({ type: 'confusion', result: confusionResult });
        }
        
        // Genjutsu Escape-Check
        if (status.effects.escapeCheck) {
            status.effects.escapeDC -= status.effects.roundBonus || 1;
        }
        
        // Prüfe Ablauf
        if (status.duration > 0 && status.rounds >= status.duration) {
            result.expired = true;
        }
        
        return result;
    },
    
    /**
     * Würfelt Schaden für Tick-Effekte
     */
    rollDamage: function(diceNotation) {
        if (diceNotation === '1w6') {
            return Math.floor(Math.random() * 6) + 1;
        } else if (diceNotation === '1w4') {
            return Math.floor(Math.random() * 4) + 1;
        }
        return 0;
    },
    
    /**
     * Würfelt Verwirrungstabelle
     */
    rollConfusion: function() {
        const roll = Math.floor(Math.random() * 20) + 1;
        
        if (roll <= 5) return { roll, effect: 'no_action', description: 'Keine Aktion' };
        if (roll <= 10) return { roll, effect: 'random_move', description: 'Zufällige Bewegung' };
        if (roll <= 15) return { roll, effect: 'normal_action', description: 'Normale Aktion' };
        return { roll, effect: 'free_choice', description: 'Freie Wahl' };
    },
    
    // ============================================
    // STATUS-EFFEKT ANWENDUNG
    // ============================================
    
    /**
     * Prüft ob Aktion möglich ist
     */
    canAct: function(character) {
        if (!character.statusEffects) return { can: true };
        
        // Benommen check
        const benommen = character.statusEffects.find(s => s.id === 'benommen');
        if (benommen) {
            return { can: false, reason: 'Benommen - keine Aktionen möglich!' };
        }
        
        // Verwirrung check
        const verwirrt = character.statusEffects.find(s => s.id === 'verwirrt');
        if (verwirrt) {
            const confusionRoll = this.rollConfusion();
            if (confusionRoll.effect === 'no_action') {
                return { can: false, reason: 'Verwirrt - keine Aktion diese Runde!', confusion: confusionRoll };
            }
            return { can: true, confusion: confusionRoll };
        }
        
        return { can: true };
    },
    
    /**
     * Prüft ob Bewegung möglich ist
     */
    canMove: function(character) {
        if (!character.statusEffects) return { can: true, speed: character.combat?.movement || 10 };
        
        let speed = character.combat?.movement || 10;
        let canMove = true;
        let reason = null;
        
        // Benommen
        if (character.statusEffects.find(s => s.id === 'benommen')) {
            canMove = false;
            speed = 0;
            reason = 'Benommen - keine Bewegung möglich!';
        }
        
        // Festgehalten
        if (character.statusEffects.find(s => s.id === 'festgehalten')) {
            canMove = false;
            speed = 0;
            reason = reason || 'Festgehalten - Bewegung = 0!';
        }
        
        // Verlangsamt
        const verlangsamt = character.statusEffects.find(s => s.id === 'verlangsamt');
        if (verlangsamt) {
            speed = Math.floor(speed * 0.5);
        }
        
        return { can: canMove, speed, reason };
    },
    
    /**
     * Prüft ob Reaktion möglich ist
     */
    canReact: function(character) {
        if (!character.statusEffects) return { can: true };
        
        // Benommen
        if (character.statusEffects.find(s => s.id === 'benommen')) {
            return { can: false, reason: 'Benommen - keine Reaktionen!' };
        }
        
        // Verlangsamt - Wurf erforderlich
        const verlangsamt = character.statusEffects.find(s => s.id === 'verlangsamt');
        if (verlangsamt && verlangsamt.effects.reactionCheck) {
            const roll = Math.floor(Math.random() * 20) + 1;
            const success = roll >= 10;
            return {
                can: success,
                reason: success ? null : 'Verlangsamt - Reaktionswurf fehlgeschlagen!',
                roll: roll
            };
        }
        
        return { can: true };
    },
    
    /**
     * Versucht zu entkommen (Festgehalten)
     */
    tryEscape: function(character) {
        const festgehalten = character.statusEffects?.find(s => s.id === 'festgehalten');
        if (!festgehalten) {
            return { success: false, error: 'Nicht festgehalten!' };
        }
        
        // Würfle Athletik oder Akrobatik
        const skill = character.skills?.koerperlich?.athletik >= character.skills?.koerperlich?.akrobatik 
            ? 'athletik' 
            : 'akrobatik';
        
        const skillValue = character.skills?.koerperlich?.[skill] || 8;
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + Math.floor((skillValue - 10) / 2);
        
        const success = total >= 15; // DC 15
        
        if (success) {
            this.removeStatus(character, 'festgehalten');
        }
        
        return {
            success: success,
            skill: skill,
            roll: roll,
            total: total,
            message: success ? 'Entkommen!' : 'Entkommen fehlgeschlagen!'
        };
    },
    
    /**
     * Löscht Feuer (Brennend)
     */
    extinguishFire: function(character, method = 'action') {
        const brennend = character.statusEffects?.find(s => s.id === 'brennend');
        if (!brennend) {
            return { success: false, error: 'Nicht brennend!' };
        }
        
        // Aktion immer erfolgreich
        if (method === 'action') {
            this.removeStatus(character, 'brennend');
            return { success: true, message: 'Feuer gelöscht!' };
        }
        
        // Wasser/Fuuton
        if (method === 'water' || method === 'fuuton') {
            this.removeStatus(character, 'brennend');
            return { success: true, message: 'Feuer durch ' + method + ' gelöscht!' };
        }
        
        return { success: false, error: 'Ungültige Löschmethode!' };
    },
    
    // ============================================
    // INSPIRATION
    // ============================================
    
    /**
     * Gibt Inspiration
     */
    awardInspiration: function(character) {
        // Prüfe maximale Stack-Größe
        const currentInspiration = character.statusEffects?.filter(s => s.id === 'inspiration').length || 0;
        const maxStack = this.STATUS.INSPIRATION.effects.maxStack;
        
        if (currentInspiration >= maxStack) {
            return { success: false, error: `Maximal ${maxStack} Inspiration!` };
        }
        
        return this.applyStatus(character, 'INSPIRATION');
    },
    
    /**
     * Nutzt Inspiration für Wurf-Wiederholung
     */
    useInspiration: function(character) {
        const inspiration = character.statusEffects?.find(s => s.id === 'inspiration');
        if (!inspiration) {
            return { success: false, error: 'Keine Inspiration vorhanden!' };
        }
        
        this.removeStatus(character, 'inspiration');
        
        return {
            success: true,
            message: 'Inspiration genutzt - Wurf kann wiederholt werden!'
        };
    },
    
    // ============================================
    // UI HILFSFUNKTIONEN
    // ============================================
    
    /**
     * Formatiert Status für Anzeige
     */
    formatStatus: function(status) {
        let durationText = '';
        if (status.duration > 0) {
            const remaining = status.duration - status.rounds;
            durationText = remaining > 0 ? `(${remaining} Runden)` : '(endet)';
        } else if (status.duration === -1) {
            durationText = '(bis befreit)';
        }
        
        return {
            icon: status.icon,
            name: status.name,
            duration: durationText,
            description: status.description
        };
    },
    
    /**
     * Gibt alle aktiven Status-Effekte zurück
     */
    getActiveStatuses: function(character) {
        if (!character.statusEffects) return [];
        return character.statusEffects.map(s => this.formatStatus(s));
    }
};

// Export
if (typeof window !== 'undefined') {
    window.StatusEffectSystem = StatusEffectSystem;
}
