/**
 * Karma System v4.0 - Karma und NPC-Vertrauen
 * 
 * Features:
 * - Karma-Skala: -100 (verdorben) bis +100 (legendär)
 * - NPC-Vertrauen basierend auf Karma
 * - Karma-Verlauf
 * - Reputation bei Fraktionen
 * - Karma-basierte Quest-Verfügbarkeit
 */

const KarmaSystem = {
    
    // === KONFIGURATION ===
    CONFIG: {
        // Karma-Grenzen
        MIN_KARMA: -100,
        MAX_KARMA: 100,
        
        // Karma-Stufen
        TIERS: [
            { threshold: -100, name: 'gefürchtet', label: 'Gefürchtet', color: '#8B0000', icon: '💀' },
            { threshold: -75, name: 'skrupellos', label: 'Skrupellos', color: '#A52A2A', icon: '🗡️' },
            { threshold: -50, name: 'fragwürdig', label: 'Moralisch fragwürdig', color: '#CD853F', icon: '🌑' },
            { threshold: -25, name: 'zwielichtig', label: 'Zwielichtig', color: '#DAA520', icon: '🌘' },
            { threshold: 0, name: 'neutral', label: 'Neutral', color: '#808080', icon: '⚪' },
            { threshold: 25, name: 'zuverlässig', label: 'Zuverlässig', color: '#9ACD32', icon: '🌔' },
            { threshold: 50, name: 'respektiert', label: 'Respektiert', color: '#32CD32', icon: '🌖' },
            { threshold: 75, name: 'ehrenhaft', label: 'Ehrenhaft', color: '#228B22', icon: '⭐' },
            { threshold: 100, name: 'legendär', label: 'Legendär rechtschaffen', color: '#FFD700', icon: '👑' }
        ],
        
        // NPC Karma-Präferenzen
        NPC_PREFERENCES: {
            // Gutes Karma
            pastor: { type: 'good', multiplier: 1.5 },
            yuki: { type: 'good', multiplier: 1.2 },
            
            // Schlechtes Karma
            kira: { type: 'bad', multiplier: 1.5 },
            
            // Neutral/Pragmatisch
            karl: { type: 'pragmatic', multiplier: 0.5 },
            shin: { type: 'pragmatic', multiplier: 0.8 },
            taro: { type: 'pragmatic', multiplier: 0.3 }
        },
        
        // Fraktionen
        FACTIONS: {
            village: { name: 'Dorf', icon: '🏘️' },
            church: { name: 'Kirche', icon: '⛪' },
            merchants: { name: 'Händler', icon: '⚖️' },
            blackmarket: { name: 'Schwarzmarkt', icon: '🌑' },
            authority: { name: 'Autorität', icon: '👑' }
        }
    },
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert das Karma-System
     */
    init() {
        console.log('[KarmaSystem] Initialisiert');
    },
    
    /**
     * Gibt den aktuellen Karma-Wert zurück
     * @returns {number}
     */
    getKarma() {
        const character = this._getCharacter();
        return character?.karma || 0;
    },
    
    /**
     * Gibt die aktuelle Karma-Stufe zurück
     * @returns {Object}
     */
    getKarmaTier() {
        const karma = this.getKarma();
        
        // Finde passende Stufe
        for (let i = this.CONFIG.TIERS.length - 1; i >= 0; i--) {
            if (karma >= this.CONFIG.TIERS[i].threshold) {
                return this.CONFIG.TIERS[i];
            }
        }
        
        return this.CONFIG.TIERS[0];
    },
    
    /**
     * Ändert das Karma
     * @param {number} amount - Die Änderung (positiv oder negativ)
     * @param {string} reason - Grund für die Änderung
     * @returns {Object} - Ergebnis
     */
    modifyKarma(amount, reason) {
        const character = this._getCharacter();
        if (!character) {
            return { success: false, message: 'Kein Character gefunden' };
        }
        
        // Aktuelles Karma
        const oldKarma = character.karma || 0;
        
        // Neue Karma berechnen
        let newKarma = oldKarma + amount;
        newKarma = Math.max(this.CONFIG.MIN_KARMA, Math.min(this.CONFIG.MAX_KARMA, newKarma));
        
        // Karma setzen
        character.karma = newKarma;
        
        // Verlauf speichern
        character.karmaHistory = character.karmaHistory || [];
        character.karmaHistory.push({
            change: amount,
            oldValue: oldKarma,
            newValue: newKarma,
            reason: reason,
            timestamp: new Date().toISOString()
        });
        
        // Speichern
        if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter(character);
        }
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('karma:changed', {
                oldValue: oldKarma,
                newValue: newKarma,
                change: amount,
                reason: reason
            });
        }
        
        // Prüfe auf Stufen-Änderung
        const oldTier = this._getTierByValue(oldKarma);
        const newTier = this._getTierByValue(newKarma);
        
        const result = {
            success: true,
            oldValue: oldKarma,
            newValue: newKarma,
            change: amount,
            tierChanged: oldTier.name !== newTier.name,
            newTier: newTier
        };
        
        if (result.tierChanged) {
            console.log(`[KarmaSystem] Stufenwechsel: ${oldTier.label} → ${newTier.label}`);
        }
        
        return result;
    },
    
    /**
     * Berechnet NPC-Vertrauen basierend auf Karma
     * @param {string} npcId - Die NPC-ID
     * @returns {number} - Vertrauenswert (-100 bis +100)
     */
    calculateTrust(npcId) {
        const karma = this.getKarma();
        const preference = this.CONFIG.NPC_PREFERENCES[npcId];
        
        if (!preference) {
            // Standard: Neutrales Verhältnis
            return Math.max(-50, Math.min(50, karma * 0.3));
        }
        
        let trust = 0;
        
        switch (preference.type) {
            case 'good':
                // Mögen gutes Karma
                trust = karma * preference.multiplier;
                break;
                
            case 'bad':
                // Mögen schlechtes Karma
                trust = -karma * preference.multiplier;
                break;
                
            case 'pragmatic':
                // Mögen extreme nicht, bevorzugen Mitte
                trust = (50 - Math.abs(karma)) * preference.multiplier;
                break;
        }
        
        return Math.max(-100, Math.min(100, trust));
    },
    
    /**
     * Gibt den Trust-Level für einen NPC zurück
     * @param {string} npcId - Die NPC-ID
     * @returns {Object}
     */
    getTrustLevel(npcId) {
        const trust = this.calculateTrust(npcId);
        
        let level = 'neutral';
        let label = 'Neutral';
        
        if (trust >= 80) { level = 'exalted'; label = 'Ehrfurcht'; }
        else if (trust >= 50) { level = 'revered'; label = 'Verehrt'; }
        else if (trust >= 25) { level = 'honored'; label = 'Geehrt'; }
        else if (trust >= 10) { level = 'friendly'; label = 'Freundlich'; }
        else if (trust >= -10) { level = 'neutral'; label = 'Neutral'; }
        else if (trust >= -25) { level = 'unfriendly'; label = 'Unfreundlich'; }
        else if (trust >= -50) { level = 'hostile'; label = 'Feindlich'; }
        else { level = 'hated'; label = 'Gehasst'; }
        
        return {
            value: trust,
            level: level,
            label: label,
            npc: npcId
        };
    },
    
    /**
     * Modifiziert Reputation bei einer Fraktion
     * @param {string} faction - Fraktions-ID
     * @param {number} amount - Änderung
     * @param {string} reason - Grund
     */
    modifyReputation(faction, amount, reason) {
        const character = this._getCharacter();
        if (!character) return;
        
        character.reputation = character.reputation || {};
        character.reputation[faction] = (character.reputation[faction] || 0) + amount;
        
        // Clamping
        character.reputation[faction] = Math.max(-100, Math.min(100, character.reputation[faction]));
        
        // Speichern
        if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter(character);
        }
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('reputation:changed', {
                faction: faction,
                change: amount,
                newValue: character.reputation[faction],
                reason: reason
            });
        }
    },
    
    /**
     * Prüft ob eine Quest basierend auf Karma verfügbar ist
     * @param {Object} quest - Die Quest
     * @returns {boolean}
     */
    isQuestAvailable(quest) {
        if (!quest.requirements?.karma) return true;
        
        const karma = this.getKarma();
        const req = quest.requirements.karma;
        
        if (req.min !== undefined && karma < req.min) return false;
        if (req.max !== undefined && karma > req.max) return false;
        
        return true;
    },
    
    /**
     * Gibt Karma-basierte Quests zurück
     * @param {Array} quests - Alle Quests
     * @returns {Object} - Gute und böse Quests
     */
    getKarmaQuests(quests) {
        const karma = this.getKarma();
        
        return {
            light: quests.filter(q => {
                if (!q.requirements?.karma) return false;
                return q.requirements.karma.min >= 25;
            }),
            dark: quests.filter(q => {
                if (!q.requirements?.karma) return false;
                return q.requirements.karma.max <= -25;
            }),
            neutral: quests.filter(q => {
                if (!q.requirements?.karma) return true;
                const min = q.requirements.karma.min || -100;
                const max = q.requirements.karma.max || 100;
                return min <= 0 && max >= 0;
            })
        };
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Gibt Tier anhand eines Wertes zurück
     * @private
     */
    _getTierByValue(value) {
        for (let i = this.CONFIG.TIERS.length - 1; i >= 0; i--) {
            if (value >= this.CONFIG.TIERS[i].threshold) {
                return this.CONFIG.TIERS[i];
            }
        }
        return this.CONFIG.TIERS[0];
    },
    
    /**
     * Gibt den aktuellen Character zurück
     * @private
     */
    _getCharacter() {
        if (typeof StateManager !== 'undefined') {
            return StateManager.getCharacter();
        }
        return window.currentCharacter || null;
    },
    
    // === UI ===
    
    /**
     * Rendert Karma-Anzeige
     */
    renderKarmaDisplay() {
        const karma = this.getKarma();
        const tier = this.getKarmaTier();
        
        return `
            <div class="karma-display">
                <div class="karma-header">
                    <span class="karma-icon" style="color: ${tier.color}">${tier.icon}</span>
                    <span class="karma-label">KARMA</span>
                </div>
                
                <div class="karma-bar-container">
                    <div class="karma-scale">
                        <span>-100</span>
                        <span>0</span>
                        <span>+100</span>
                    </div>
                    <div class="karma-bar">
                        <div class="karma-fill" 
                             style="width: ${((karma + 100) / 200) * 100}%; background: ${tier.color}"></div>
                        <div class="karma-marker" 
                             style="left: ${((karma + 100) / 200) * 100}%"></div>
                    </div>
                </div>
                
                <div class="karma-tier" style="color: ${tier.color}">
                    ${tier.label}
                </div>
                
                <div class="karma-value">
                    ${karma > 0 ? '+' : ''}${karma}
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert Trust-Anzeige für NPCs
     */
    renderTrustDisplay() {
        const npcs = Object.keys(this.CONFIG.NPC_PREFERENCES);
        
        return `
            <div class="trust-display">
                <h3>🤝 NPC-Vertrauen</h3>
                
                <div class="trust-list">
                    ${npcs.map(npcId => {
                        const trust = this.getTrustLevel(npcId);
                        const npcName = npcId.charAt(0).toUpperCase() + npcId.slice(1);
                        
                        return `
                            <div class="trust-item ${trust.level}">
                                <span class="trust-npc">${npcName}</span>
                                <div class="trust-bar">
                                    <div class="trust-fill" style="width: ${Math.abs(trust.value)}%"></div>
                                </div>
                                <span class="trust-label">${trust.label}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert Reputation-Anzeige
     */
    renderReputationDisplay() {
        const character = this._getCharacter();
        const reputation = character?.reputation || {};
        
        return `
            <div class="reputation-display">
                <h3>🏛️ Fraktions-Ruf</h3>
                
                <div class="reputation-list">
                    ${Object.entries(this.CONFIG.FACTIONS).map(([id, faction]) => {
                        const value = reputation[id] || 0;
                        const absValue = Math.abs(value);
                        const isPositive = value >= 0;
                        
                        return `
                            <div class="reputation-item">
                                <span class="reputation-icon">${faction.icon}</span>
                                <span class="reputation-name">${faction.name}</span>
                                <div class="reputation-bar">
                                    <div class="reputation-fill ${isPositive ? 'positive' : 'negative'}" 
                                         style="width: ${absValue}%"></div>
                                </div>
                                <span class="reputation-value ${isPositive ? 'positive' : 'negative'}">
                                    ${value > 0 ? '+' : ''}${value}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
};

// Global verfügbar machen
window.KarmaSystem = KarmaSystem;
