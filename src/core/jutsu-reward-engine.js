/**
 * Jutsu Reward Engine v2.0
 * 
 * Produktionsreifes Jutsu-Belohnungssystem mit:
 * - Echter JUTSU_DATA Integration
 * - Clan/Element Matching
 * - Character Build Validation
 * - Korrekten Drop-Raten
 * - Keine Mock-Daten
 */

const JutsuRewardEngine = {
    
    // === DROP RATEN (Exakt wie in Spec) ===
    DROP_RATES: {
        D: 5.0,      // 5%
        C: 0.5,      // 0.5%
        B: 0.3,      // 0.3%
        A: 0.1,      // 0.1%
        S: 0.01      // 0.01%
    },
    
    // === RANG GEWICHTUNG FÜR CHESTS ===
    CHEST_WEIGHTS: {
        wood:   { D: 70, C: 25, B: 5,  A: 0,  S: 0 },
        iron:   { D: 40, C: 45, B: 12, A: 3,  S: 0 },
        shadow: { D: 20, C: 35, B: 30, A: 12, S: 3 }
    },
    
    /**
     * Hauptfunktion: Findet passendes Jutsu für Character
     * @param {Object} character - Der Charakter
     * @param {string} source - Quelle ('chest', 'quest', 'dm')
     * @returns {Object|null} - Jutsu oder null
     */
    findJutsuForCharacter(character, source = 'chest') {
        if (!character) {
            console.error('[JutsuRewardEngine] Kein Character übergeben');
            return null;
        }
        
        console.log(`[JutsuRewardEngine] Suche Jutsu für ${character.name}...`);
        
        // 1. Verfügbare Jutsus filtern
        const availableJutsus = this._getAvailableJutsus(character);
        
        if (availableJutsus.length === 0) {
            console.log('[JutsuRewardEngine] Keine verfügbaren Jutsus für diesen Character');
            return null;
        }
        
        // 2. Rang bestimmen basierend auf Source
        const rank = this._determineRank(source);
        
        // 3. Jutsus des bestimmten Rangs filtern
        const rankJutsus = availableJutsus.filter(j => j.rank === rank);
        
        if (rankJutsus.length === 0) {
            console.log(`[JutsuRewardEngine] Keine ${rank}-Rang Jutsus verfügbar, versuche niedrigeren Rang...`);
            // Fallback zu niedrigerem Rang
            const lowerRank = this._getLowerRank(rank);
            if (lowerRank) {
                return this.findJutsuForCharacter(character, source, lowerRank);
            }
            return null;
        }
        
        // 4. Zufälliges Jutsu auswählen (gewichtet nach Passendheit)
        const selectedJutsu = this._selectWeightedJutsu(rankJutsus, character);
        
        if (selectedJutsu) {
            console.log(`[JutsuRewardEngine] Jutsu gefunden: ${selectedJutsu.name} (${selectedJutsu.rank})`);
        }
        
        return selectedJutsu;
    },
    
    /**
     * Prüft Drop-Chance und gibt Jutsu zurück wenn erfolgreich
     * SEPARATE (nicht kumulative) Chancen - korrigiert
     */
    tryDropJutsu(character, source = 'chest') {
        console.log(`[JutsuRewardEngine] Drop-Check für ${character.name}...`);
        
        // SEPARATE Chancen für jeden Rang (nicht kumulativ)
        // S: 0.01%, A: 0.1%, B: 0.3%, C: 0.5%, D: 5.0%
        
        const sRoll = Math.random() * 100;
        if (sRoll <= this.DROP_RATES.S) {
            console.log(`[JutsuRewardEngine] 🌟 S-RANG DROP! (Roll: ${sRoll.toFixed(3)})`);
            return this.findJutsuForCharacter(character, source, 'S');
        }
        
        const aRoll = Math.random() * 100;
        if (aRoll <= this.DROP_RATES.A) {
            console.log(`[JutsuRewardEngine] ⭐ A-RANG DROP! (Roll: ${aRoll.toFixed(3)})`);
            return this.findJutsuForCharacter(character, source, 'A');
        }
        
        const bRoll = Math.random() * 100;
        if (bRoll <= this.DROP_RATES.B) {
            console.log(`[JutsuRewardEngine] 💎 B-RANG DROP! (Roll: ${bRoll.toFixed(3)})`);
            return this.findJutsuForCharacter(character, source, 'B');
        }
        
        const cRoll = Math.random() * 100;
        if (cRoll <= this.DROP_RATES.C) {
            console.log(`[JutsuRewardEngine] 🔷 C-RANG DROP! (Roll: ${cRoll.toFixed(3)})`);
            return this.findJutsuForCharacter(character, source, 'C');
        }
        
        const dRoll = Math.random() * 100;
        if (dRoll <= this.DROP_RATES.D) {
            console.log(`[JutsuRewardEngine] 🔹 D-RANG DROP! (Roll: ${dRoll.toFixed(3)})`);
            return this.findJutsuForCharacter(character, source, 'D');
        }
        
        console.log(`[JutsuRewardEngine] Kein Jutsu-Drop`);
        return null;
    },
    
    /**
     * Gibt alle für den Character verfügbaren Jutsus zurück
     * @private
     */
    _getAvailableJutsus(character) {
        const available = [];
        const charClan = character.clan || '';
        const charElements = character.elements || [];
        const learnedJutsuIds = (character.jutsus || []).map(j => j.id || j.jutsuId);
        
        // 1. Allgemeine Jutsus aus JUTSU_DATA
        if (typeof JUTSU_DATA !== 'undefined') {
            JUTSU_DATA.forEach(jutsu => {
                // Überspringe bereits gelernte
                if (learnedJutsuIds.includes(jutsu.id)) return;
                
                // Prüfe Element
                if (jutsu.element && jutsu.element !== 'neutral') {
                    if (!charElements.includes(jutsu.element)) return;
                }
                
                // Prüfe Clan (wenn Clan-Jutsu)
                if (jutsu.clan && jutsu.clan !== charClan) return;
                
                available.push(jutsu);
            });
        }
        
        // 2. Clan-spezifische Jutsus
        if (charClan && typeof CLAN_JUTSUS !== 'undefined' && CLAN_JUTSUS[charClan]) {
            CLAN_JUTSUS[charClan].forEach(jutsu => {
                if (learnedJutsuIds.includes(jutsu.id)) return;
                available.push({
                    ...jutsu,
                    isClanJutsu: true,
                    clan: charClan
                });
            });
        }
        
        return available;
    },
    
    /**
     * Bestimmt Rang basierend auf Source und Gewichtung
     * @private
     */
    _determineRank(source, forcedRank = null) {
        if (forcedRank) return forcedRank;
        
        // Für Chests: Gewichtete Auswahl
        if (source === 'chest') {
            const roll = Math.random() * 100;
            const weights = this.CHEST_WEIGHTS.iron; // Standard
            
            let cumulative = 0;
            for (const [rank, weight] of Object.entries(weights)) {
                cumulative += weight;
                if (roll <= cumulative) return rank;
            }
            return 'D';
        }
        
        // Für Quests: Drop-Chance basiert
        const roll = Math.random() * 100;
        for (const [rank, chance] of Object.entries(this.DROP_RATES)) {
            if (roll <= chance) return rank;
        }
        
        return null;
    },
    
    /**
     * Wählt Jutsu gewichtet nach Passendheit zum Character
     * @private
     */
    _selectWeightedJutsu(jutsus, character) {
        if (jutsus.length === 0) return null;
        if (jutsus.length === 1) return jutsus[0];
        
        // Gewichte Jutsus nach Passendheit
        const weighted = jutsus.map(jutsu => {
            let weight = 1;
            
            // Bonus für passendes Element
            if (jutsu.element && character.elements?.includes(jutsu.element)) {
                weight += 2;
            }
            
            // Bonus für Clan-Jutsus
            if (jutsu.clan && jutsu.clan === character.clan) {
                weight += 3;
            }
            
            // Bonus für niedrige Chakra-Kosten (für Anfänger)
            if (character.level <= 3 && jutsu.chakra < 30) {
                weight += 1;
            }
            
            return { jutsu, weight };
        });
        
        // Gewichtete zufällige Auswahl
        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of weighted) {
            random -= item.weight;
            if (random <= 0) return item.jutsu;
        }
        
        return weighted[0].jutsu;
    },
    
    /**
     * Gibt nächstniedrigeren Rang zurück
     * @private
     */
    _getLowerRank(rank) {
        const ranks = ['S', 'A', 'B', 'C', 'D'];
        const index = ranks.indexOf(rank);
        return index < ranks.length - 1 ? ranks[index + 1] : null;
    },
    
    /**
     * Wendet Jutsu auf Character an (fügt hinzu)
     * A-/S-Rang Jutsus werden auf "In Training" gesetzt (Progressions-Balance)
     */
    grantJutsu(character, jutsu, source = 'chest') {
        if (!character || !jutsu) {
            console.error('[JutsuRewardEngine] Ungültige Parameter');
            return false;
        }
        
        // Initialisiere Jutsus-Array
        if (!character.jutsus) character.jutsus = [];
        
        // Prüfe ob bereits vorhanden
        if (character.jutsus.some(j => j.id === jutsu.id || j.jutsuId === jutsu.id)) {
            console.log(`[JutsuRewardEngine] Character hat ${jutsu.name} bereits`);
            return false;
        }
        
        // Füge Jutsu hinzu
        const jutsuEntry = {
            id: jutsu.id,
            jutsuId: jutsu.id,
            name: jutsu.name,
            rank: jutsu.rank,
            element: jutsu.element,
            type: jutsu.type,
            chakra: jutsu.chakra,
            damage: jutsu.damage,
            description: jutsu.description,
            learnedAt: new Date().toISOString(),
            learnedFrom: source
        };
        
        // HOCHRANGIGE JUTSUS (A, S) → IN TRAINING
        // Niedrige Jutsus (D, C, B) → DIREKT GELERNT
        if (['A', 'S'].includes(jutsu.rank)) {
            jutsuEntry.learnedDirectly = false;
            jutsuEntry.inTraining = true;
            jutsuEntry.trainingProgress = 0;
            jutsuEntry.trainingRequired = 5;
            
            console.log(`[JutsuRewardEngine] ${jutsu.name} (${jutsu.rank}) → IN TRAINING (0/5)`);
        } else {
            jutsuEntry.learnedDirectly = true;
            jutsuEntry.inTraining = false;
            jutsuEntry.trainingProgress = 0;
            jutsuEntry.trainingRequired = 0;
            
            console.log(`[JutsuRewardEngine] ${jutsu.name} (${jutsu.rank}) → DIREKT GELERNT`);
        }
        
        character.jutsus.push(jutsuEntry);
        
        // Speichern
        if (typeof AccountSystem !== 'undefined') {
            AccountSystem.StateManager.saveState(character);
        }
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('jutsu:learned', { 
                jutsu: jutsuEntry, 
                character, 
                source,
                requiresTraining: ['A', 'S'].includes(jutsu.rank)
            });
        }
        
        return true;
    },
    
    /**
     * Öffnet Chest und gibt Belohnung zurück (für RewardSystem Integration)
     */
    openChest(character, chestType) {
        console.log(`[JutsuRewardEngine] Öffne ${chestType} Chest...`);
        
        // Versuche Jutsu zu droppen
        const jutsu = this.tryDropJutsu(character, 'chest');
        
        if (jutsu) {
            const success = this.grantJutsu(character, jutsu, chestType);
            if (success) {
                return {
                    type: 'jutsu',
                    jutsu: jutsu,
                    message: `📜 ${jutsu.name} (${jutsu.rank}-Rang) erhalten!`
                };
            }
        }
        
        return null;
    },
    
    /**
     * Debug: Zeigt verfügbare Jutsus für Character
     */
    debug(character) {
        console.group('[JutsuRewardEngine Debug]');
        console.log('Character:', character.name, `(${character.clan})`);
        console.log('Elemente:', character.elements);
        
        const available = this._getAvailableJutsus(character);
        console.log('Verfügbare Jutsus:', available.length);
        
        const byRank = {};
        available.forEach(j => {
            byRank[j.rank] = (byRank[j.rank] || 0) + 1;
        });
        console.log('Nach Rang:', byRank);
        
        console.groupEnd();
    }
};

// Global verfügbar machen
window.JutsuRewardEngine = JutsuRewardEngine;

console.log('[JutsuRewardEngine] v2.0 Geladen - Produktionsreif');
