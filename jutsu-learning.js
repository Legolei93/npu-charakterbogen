/**
 * NPU Jutsu Learning System - Phase 3
 * Vollständiges Jutsu-Lernsystem mit Training, Freischaltungen und Rang-Limiten
 */

const JutsuLearningSystem = {
    // ============================================
    // JUTSU STATUS
    // ============================================
    
    STATUS: {
        GESPERRT: 'gesperrt',
        FREIGESCHALTET: 'freigeschaltet',
        IN_TRAINING: 'in_training',
        ERLERNT: 'erlernt'
    },
    
    // ============================================
    // TRAININGSEINHEITEN PRO RANG
    // ============================================
    
    TRAINING_UNITS: {
        'E': 1,
        'D': 2,
        'C': 3,
        'B': 5,
        'A': 8,
        'S': 12
    },
    
    // ============================================
    // RANG-LIMITS BASIEREND AUF LEVEL
    // ============================================
    
    RANG_LIMITS: {
        1: { max: 'C', restricted: false },
        2: { max: 'C', restricted: false },
        3: { max: 'C', restricted: false },
        4: { max: 'C', restricted: false },
        5: { max: 'C', restricted: false },
        6: { max: 'B', restricted: true },
        7: { max: 'B', restricted: true },
        8: { max: 'B', restricted: false },
        9: { max: 'B', restricted: false },
        10: { max: 'A', restricted: true },
        11: { max: 'A', restricted: true },
        12: { max: 'A', restricted: false },
        13: { max: 'A', restricted: false },
        14: { max: 'A', restricted: false },
        15: { max: 'S', restricted: true },
        16: { max: 'S', restricted: false },
        17: { max: 'S', restricted: false },
        18: { max: 'S', restricted: false },
        19: { max: 'S', restricted: false },
        20: { max: 'S', restricted: false }
    },
    
    RANG_ORDER: { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 },
    
    // ============================================
    // LERNQUELLEN
    // ============================================
    
    SOURCES: {
        SENSEI: { name: 'Sensei', valid: true },
        SCHRIFTROLLE: { name: 'Schriftrolle', valid: true },
        ANALYSE: { name: 'Analyse', validRanks: ['E', 'D', 'C'] },
        FORSCHUNG: { name: 'Eigene Forschung', valid: true }
    },
    
    // ============================================
    // LEVEL-UP FREISCHALTUNGEN
    // ============================================
    
    /**
     * Gibt Freischaltungen beim Level-Up
     */
    getLevelUpRewards: function(level) {
        return {
            jutsuUnlocks: 2,
            alternative: {
                description: 'Auf beides verzichten',
                reward: 10 // AP
            }
        };
    },
    
    /**
     * Wendet Level-Up Belohnungen an
     */
    applyLevelUpRewards: function(character, choice) {
        switch (choice) {
            case 'unlocks':
                character.jutsuProgress.unlocks += 2;
                return { success: true, message: '+2 Jutsu-Freischaltungen erhalten!' };
                
            case 'complete':
                // Ein Jutsu abschließen (muss ausgewählt werden)
                return { success: true, message: 'Wähle ein Jutsu zum Abschließen', requiresSelection: true };
                
            case 'ap':
                if (typeof NPUCore !== 'undefined') {
                    NPUCore.awardAP(character, 10, 'Statt Jutsu-Freischaltungen');
                }
                return { success: true, message: '+10 AP erhalten!' };
                
            default:
                return { success: false, error: 'Ungültige Auswahl!' };
        }
    },
    
    // ============================================
    // RANG-PRÜFUNG
    // ============================================
    
    /**
     * Prüft ob ein Jutsu-Rang erlaubt ist
     */
    canLearnRank: function(character, rank) {
        const level = character.level || 1;
        const limit = this.RANG_LIMITS[level];
        
        if (!limit) {
            return { allowed: false, error: 'Ungültiges Level!' };
        }
        
        const requestedRank = this.RANG_ORDER[rank];
        const maxRank = this.RANG_ORDER[limit.max];
        
        if (requestedRank > maxRank) {
            return { 
                allowed: false, 
                error: `Mit Level ${level} kannst du maximal ${limit.max}-Rang Jutsus lernen!` 
            };
        }
        
        // Prüfe ob eingeschränkt
        if (limit.restricted && requestedRank === maxRank) {
            return { 
                allowed: true, 
                restricted: true,
                modifiers: {
                    chakraCost: 1.2, // +20%
                    trainingTime: 1.5, // +50%
                    riskFlag: true
                },
                warning: 'Eingeschränkter Rang: Höhere Kosten und längere Trainingszeit!'
            };
        }
        
        return { allowed: true, restricted: false };
    },
    
    // ============================================
    // FREISCHALTUNG
    // ============================================
    
    /**
     * Schaltet ein Jutsu frei
     */
    unlockJutsu: function(character, jutsuId, source) {
        // Prüfe ob Freischaltungen verfügbar
        if (character.jutsuProgress.unlocks <= 0) {
            return { success: false, error: 'Keine Freischaltungen verfügbar!' };
        }
        
        // Prüfe Quelle
        const sourceValid = this.validateSource(source);
        if (!sourceValid.valid) {
            return { success: false, error: sourceValid.error };
        }
        
        // Finde Jutsu in Datenbank
        const jutsuData = JUTSU_DATA.find(j => j.id === jutsuId);
        if (!jutsuData) {
            return { success: false, error: 'Jutsu nicht gefunden!' };
        }
        
        // Prüfe Rang-Limit
        const rankCheck = this.canLearnRank(character, jutsuData.rank);
        if (!rankCheck.allowed) {
            return { success: false, error: rankCheck.error };
        }
        
        // Prüfe ob bereits vorhanden
        const existing = character.jutsus.find(j => j.jutsuId === jutsuId);
        if (existing) {
            return { success: false, error: 'Dieses Jutsu hast du bereits!' };
        }
        
        // Freischaltung erstellen
        const newJutsu = {
            id: 'jutsu_' + Date.now(),
            jutsuId: jutsuData.id,
            name: jutsuData.name,
            rank: jutsuData.rank,
            element: jutsuData.element,
            type: jutsuData.type,
            status: this.STATUS.FREIGESCHALTET,
            source: source,
            level: 1,
            trainingProgress: 0,
            trainingUnits: this.TRAINING_UNITS[jutsuData.rank],
            chakraCost: jutsuData.chakra,
            baseChakra: jutsuData.chakra,
            damage: jutsuData.damage,
            baseDamage: jutsuData.damage,
            rangeM: jutsuData.rangeM,
            effect: jutsuData.effect,
            description: jutsuData.description,
            restricted: rankCheck.restricted || false,
            modifiers: rankCheck.modifiers || {}
        };
        
        // Modifikatoren anwenden wenn eingeschränkt
        if (rankCheck.restricted && rankCheck.modifiers) {
            if (rankCheck.modifiers.chakraCost) {
                newJutsu.chakraCost = Math.floor(newJutsu.chakraCost * rankCheck.modifiers.chakraCost);
            }
            if (rankCheck.modifiers.trainingTime) {
                newJutsu.trainingUnits = Math.ceil(newJutsu.trainingUnits * rankCheck.modifiers.trainingTime);
            }
        }
        
        // Freischaltung verbrauchen
        character.jutsuProgress.unlocks--;
        
        // Zum Charakter hinzufügen
        character.jutsus.push(newJutsu);
        
        return { 
            success: true, 
            message: `${jutsuData.name} freigeschaltet!`,
            jutsu: newJutsu,
            warning: rankCheck.warning
        };
    },
    
    /**
     * Validiert die Lernquelle
     */
    validateSource: function(source) {
        if (!source) {
            return { valid: false, error: 'Keine Lernquelle angegeben!' };
        }
        
        const sourceData = this.SOURCES[source.type];
        if (!sourceData) {
            return { valid: false, error: 'Ungültige Lernquelle!' };
        }
        
        if (sourceData.validRanks && !sourceData.validRanks.includes(source.rank)) {
            return { 
                valid: false, 
                error: `Analyse nur für Rang ${sourceData.validRanks.join(', ')} möglich!` 
            };
        }
        
        return { valid: true };
    },
    
    // ============================================
    // TRAINING
    // ============================================
    
    /**
     * Startet das Training eines Jutsus
     */
    startTraining: function(character, jutsuId) {
        // Prüfe maximale Trainingsanzahl
        const inTraining = character.jutsus.filter(j => j.status === this.STATUS.IN_TRAINING).length;
        if (inTraining >= 2) {
            return { success: false, error: 'Maximal 2 Jutsus gleichzeitig im Training!' };
        }
        
        const jutsu = character.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) {
            return { success: false, error: 'Jutsu nicht gefunden!' };
        }
        
        if (jutsu.status !== this.STATUS.FREIGESCHALTET) {
            return { success: false, error: 'Jutsu muss zuerst freigeschaltet werden!' };
        }
        
        jutsu.status = this.STATUS.IN_TRAINING;
        
        return { success: true, message: `Training von ${jutsu.name} gestartet!` };
    },
    
    /**
     * Fügt eine Trainingseinheit hinzu
     */
    addTrainingUnit: function(character, jutsuId) {
        const jutsu = character.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) {
            return { success: false, error: 'Jutsu nicht gefunden!' };
        }
        
        if (jutsu.status !== this.STATUS.IN_TRAINING) {
            return { success: false, error: 'Jutsu ist nicht im Training!' };
        }
        
        jutsu.trainingProgress++;
        
        // Prüfe ob Training abgeschlossen
        if (jutsu.trainingProgress >= jutsu.trainingUnits) {
            return { 
                success: true, 
                complete: true,
                message: 'Training abgeschlossen! Abschlussprüfung erforderlich.' 
            };
        }
        
        return { 
            success: true, 
            complete: false,
            progress: jutsu.trainingProgress,
            total: jutsu.trainingUnits,
            message: `Fortschritt: ${jutsu.trainingProgress}/${jutsu.trainingUnits}` 
        };
    },
    
    /**
     * Führt die Abschlussprüfung durch
     */
    doFinalTest: function(character, jutsuId, diceRoll) {
        // Validierung
        if (diceRoll < 1 || diceRoll > 20) {
            return { success: false, error: 'W20 Wurf muss zwischen 1 und 20 sein!' };
        }
        
        const jutsu = character.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) {
            return { success: false, error: 'Jutsu nicht gefunden!' };
        }
        
        if (jutsu.trainingProgress < jutsu.trainingUnits) {
            return { success: false, error: 'Training noch nicht abgeschlossen!' };
        }
        
        // Prüfung
        if (diceRoll > 10) {
            // Erfolg
            jutsu.status = this.STATUS.ERLERNT;
            return { 
                success: true, 
                passed: true,
                roll: diceRoll,
                message: `Prüfung bestanden! ${jutsu.name} ist jetzt erlernt.` 
            };
        } else {
            // Fehlschlag
            jutsu.trainingUnits++; // +1 Trainingseinheit nötig
            jutsu.hasMalus = true; // Flag für optionalen Malus
            
            return { 
                success: true, 
                passed: false,
                roll: diceRoll,
                message: 'Prüfung nicht bestanden! +1 Trainingseinheit nötig.',
                malus: true
            };
        }
    },
    
    // ============================================
    // AP-BASIERTES LERNEN (NACH ERSTELLUNG)
    // ============================================
    
    /**
     * Lernt ein Jutsu mit AP (nach Charaktererstellung)
     */
    learnJutsuWithAP: function(character, jutsuId, source) {
        const apCosts = { 'E': 1, 'D': 2, 'C': 4, 'B': 8, 'A': 15, 'S': 30 };
        
        const jutsuData = JUTSU_DATA.find(j => j.id === jutsuId);
        if (!jutsuData) {
            return { success: false, error: 'Jutsu nicht gefunden!' };
        }
        
        const apCost = apCosts[jutsuData.rank];
        const availableAP = character.ap.total - character.ap.spent;
        
        if (availableAP < apCost) {
            return { success: false, error: `Nicht genug AP! Benötigt: ${apCost}` };
        }
        
        // Prüfe ob DM Override aktiv
        if (typeof checkDMOverride === 'function' && checkDMOverride('jutsus')) {
            // Kostenlos
        } else {
            character.ap.spent += apCost;
        }
        
        // Direkt als erlernt hinzufügen (bei AP-Kauf)
        const newJutsu = {
            id: 'jutsu_' + Date.now(),
            jutsuId: jutsuData.id,
            name: jutsuData.name,
            rank: jutsuData.rank,
            element: jutsuData.element,
            type: jutsuData.type,
            status: this.STATUS.ERLERNT,
            source: source,
            level: 1,
            trainingProgress: 0,
            trainingUnits: 0,
            chakraCost: jutsuData.chakra,
            baseChakra: jutsuData.chakra,
            damage: jutsuData.damage,
            baseDamage: jutsuData.damage,
            rangeM: jutsuData.rangeM,
            effect: jutsuData.effect,
            description: jutsuData.description
        };
        
        character.jutsus.push(newJutsu);
        
        return { 
            success: true, 
            message: `${jutsuData.name} erlernt!`,
            apCost: apCost
        };
    }
};

// Export
if (typeof window !== 'undefined') {
    window.JutsuLearningSystem = JutsuLearningSystem;
}
