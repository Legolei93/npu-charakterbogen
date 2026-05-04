/**
 * Dice System - Globales Würfelsystem für alle Aktionen
 * W20 mit Verlauf, Crit/Fail Erkennung, Modifikatoren
 */

const DiceSystem = {
    // Würfel-Verlauf
    rollHistory: [],
    
    // Maximale Einträge im Verlauf
    maxHistory: 50,
    
    // Würfel-Typen
    diceTypes: {
        d4: { sides: 4, icon: '🔷', name: 'W4' },
        d6: { sides: 6, icon: '⚀', name: 'W6' },
        d8: { sides: 8, icon: '🔶', name: 'W8' },
        d10: { sides: 10, icon: '🔟', name: 'W10' },
        d12: { sides: 12, icon: '🔵', name: 'W12' },
        d20: { sides: 20, icon: '⭕', name: 'W20' },
        d100: { sides: 100, icon: '💯', name: 'W100' }
    },
    
    /**
     * Initialisiert das Würfelsystem
     */
    init() {
        this.loadFromStorage();
        console.log('DiceSystem initialisiert');
    },
    
    /**
     * Lädt Verlauf aus dem Speicher
     */
    loadFromStorage() {
        const saved = localStateManager.getItem('npu_dice_history');
        if (saved) {
            this.rollHistory = JSON.parse(saved);
        }
    },
    
    /**
     * Speichert Verlauf
     */
    saveToStorage() {
        localStateManager.setItem('npu_dice_history', JSON.stringify(this.rollHistory));
    },
    
    /**
     * Würfelt einen W20 mit Modifikator
     */
    rollD20(modifier = 0, reason = '', characterName = '') {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + modifier;
        
        // Crit/Fail Erkennung
        const isCrit = roll === 20;
        const isFail = roll === 1;
        
        const result = {
            id: Date.now(),
            dice: 'd20',
            roll,
            modifier,
            total,
            isCrit,
            isFail,
            reason: reason || 'W20 Wurf',
            characterName: characterName || (currentCharacter?.name || 'Unbekannt'),
            timestamp: new Date().toISOString()
        };
        
        // Zum Verlauf hinzufügen
        this.addToHistory(result);
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('dice_roll', result);
        }
        
        return result;
    },
    
    /**
     * Würfelt beliebigen Würfel
     */
    roll(diceType, count = 1, modifier = 0, reason = '') {
        const dice = this.diceTypes[diceType];
        if (!dice) {
            console.error('Unbekannter Würfeltyp:', diceType);
            return null;
        }
        
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * dice.sides) + 1;
            rolls.push(roll);
            total += roll;
        }
        
        total += modifier;
        
        // Crit/Fail nur bei W20
        const isCrit = diceType === 'd20' && rolls[0] === 20;
        const isFail = diceType === 'd20' && rolls[0] === 1;
        
        const result = {
            id: Date.now(),
            dice: diceType,
            diceName: dice.name,
            rolls,
            count,
            modifier,
            total,
            isCrit,
            isFail,
            reason: reason || `${dice.name} Wurf`,
            characterName: currentCharacter?.name || 'Unbekannt',
            timestamp: new Date().toISOString()
        };
        
        this.addToHistory(result);
        
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('dice_roll', result);
        }
        
        return result;
    },
    
    /**
     * Fügt zum Verlauf hinzu
     */
    addToHistory(result) {
        this.rollHistory.unshift(result);
        
        // Begrenze Verlauf
        if (this.rollHistory.length > this.maxHistory) {
            this.rollHistory = this.rollHistory.slice(0, this.maxHistory);
        }
        
        this.saveToStorage();
    },
    
    /**
     * Gibt Würfel-Verlauf zurück
     */
    getHistory(limit = 20) {
        return this.rollHistory.slice(0, limit);
    },
    
    /**
     * Löscht Verlauf
     */
    clearHistory() {
        this.rollHistory = [];
        this.saveToStorage();
    },
    
    /**
     * Berechnet Statistiken
     */
    getStats() {
        if (this.rollHistory.length === 0) {
            return { total: 0, average: 0, crits: 0, fails: 0 };
        }
        
        const d20Rolls = this.rollHistory.filter(r => r.dice === 'd20');
        const total = d20Rolls.length;
        const crits = d20Rolls.filter(r => r.isCrit).length;
        const fails = d20Rolls.filter(r => r.isFail).length;
        const average = d20Rolls.reduce((sum, r) => sum + r.roll, 0) / total;
        
        return { total, average: average.toFixed(2), crits, fails };
    },
    
    /**
     * Rendert Würfel-Widget
     */
    renderWidget() {
        return `
            <div class=\"dice-widget\">
                <div class=\"dice-header\">
                    <h3>🎲 Würfel</h3>
                    <button class=\"btn-small\" onclick=\"DiceSystem.toggleHistory()\">📜 Verlauf</button>
                </div>
                
                <div class=\"dice-controls\">
                    <div class=\"dice-row\">
                        <button class=\"dice-btn\" onclick=\"DiceSystem.rollWithModifier('d20', 0)\">
                            <span class=\"dice-icon\">⭕</span>
                            <span>W20</span>
                        </button>
                        <button class=\"dice-btn\" onclick=\"DiceSystem.rollWithModifier('d20', this.getAttribute('data-mod'))\" data-mod=\"${currentCharacter?.attributes?.cha ? Math.floor((currentCharacter.attributes.cha - 10) / 2) : 0}\">
                            <span class=\"dice-icon\">💬</span>
                            <span>CHA</span>
                        </button>
                        <button class=\"dice-btn\" onclick=\"DiceSystem.rollWithModifier('d20', this.getAttribute('data-mod'))\" data-mod=\"${currentCharacter?.attributes?.itu ? Math.floor((currentCharacter.attributes.itu - 10) / 2) : 0}\">
                            <span class=\"dice-icon\">👁️</span>
                            <span>Wahrnehmung</span>
                        </button>
                    </div>
                    
                    <div class=\"dice-row\">
                        <button class=\"dice-btn small\" onclick=\"DiceSystem.roll('d4')\">W4</button>
                        <button class=\"dice-btn small\" onclick=\"DiceSystem.roll('d6')\">W6</button>
                        <button class=\"dice-btn small\" onclick=\"DiceSystem.roll('d8')\">W8</button>
                        <button class=\"dice-btn small\" onclick=\"DiceSystem.roll('d10')\">W10</button>
                        <button class=\"dice-btn small\" onclick=\"DiceSystem.roll('d12')\">W12</button>
                        <button class=\"dice-btn small\" onclick=\"DiceSystem.roll('d100')\">W100</button>
                    </div>
                    
                    <div class=\"dice-custom\">
                        <input type=\"text\" id=\"diceReason\" placeholder=\"Grund (optional)\">
                        <input type=\"number\" id=\"diceModifier\" placeholder=\"Mod\" value=\"0\">
                    </div>
                </div>
                
                <div class=\"dice-result\" id=\"diceResult\" style=\"display: none;\">
                    <!-- Wird dynamisch gefüllt -->
                </div>
                
                <div class=\"dice-history\" id=\"diceHistory\" style=\"display: none;\">
                    ${this.renderHistory()}
                </div>
                
                <div class=\"dice-stats\">
                    ${this.renderStats()}
                </div>
            </div>
        `;
    },
    
    /**
     * Würfelt mit Modifikator aus Input
     */
    rollWithModifier(diceType, modifier) {
        const modInput = document.getElementById('diceModifier');
        const reasonInput = document.getElementById('diceReason');
        
        const mod = parseInt(modifier) || parseInt(modInput?.value) || 0;
        const reason = reasonInput?.value || '';
        
        const result = this.roll(diceType, 1, mod, reason);
        this.showResult(result);
    },
    
    /**
     * Zeigt Würfelergebnis
     */
    showResult(result) {
        const container = document.getElementById('diceResult');
        if (!container) return;
        
        let resultClass = '';
        let resultIcon = '';
        
        if (result.isCrit) {
            resultClass = 'crit';
            resultIcon = '✨';
        } else if (result.isFail) {
            resultClass = 'fail';
            resultIcon = '💥';
        }
        
        container.innerHTML = `
            <div class=\"dice-result-display ${resultClass}\">
                <div class=\"result-header\">
                    <span class=\"result-dice\">${result.diceName}</span>
                    ${result.reason ? `<span class=\"result-reason\">${result.reason}</span>` : ''}
                </div>
                <div class=\"result-roll\">
                    ${resultIcon} ${result.total}
                </div>
                <div class=\"result-details\">
                    Wurf: ${result.rolls?.[0] || result.roll}
                    ${result.modifier !== 0 ? `+ Mod: ${result.modifier > 0 ? '+' : ''}${result.modifier}` : ''}
                </div>
                ${result.isCrit ? '<div class=\"crit-message\">🎉 KRITISCHER ERFOLG!</div>' : ''}
                ${result.isFail ? '<div class=\"fail-message\">😱 KRITISCHER FEHLER!</div>' : ''}
            </div>
        `;
        
        container.style.display = 'block';
        
        // Verlauf aktualisieren
        const historyContainer = document.getElementById('diceHistory');
        if (historyContainer && historyContainer.style.display !== 'none') {
            historyContainer.innerHTML = this.renderHistory();
        }
        
        // Stats aktualisieren
        const statsContainer = document.querySelector('.dice-stats');
        if (statsContainer) {
            statsContainer.innerHTML = this.renderStats();
        }
    },
    
    /**
     * Rendert Verlauf
     */
    renderHistory() {
        const history = this.getHistory(10);
        
        if (history.length === 0) {
            return '<p class=\"no-history\">Noch keine Würfe</p>';
        }
        
        return history.map(roll => {
            let rollClass = '';
            if (roll.isCrit) rollClass = 'crit';
            else if (roll.isFail) rollClass = 'fail';
            
            return `
                <div class=\"history-entry ${rollClass}\">
                    <span class=\"history-dice\">${roll.diceName}</span>
                    <span class=\"history-result\">${roll.total}</span>
                    <span class=\"history-reason\">${roll.reason}</span>
                    <span class=\"history-time\">${new Date(roll.timestamp).toLocaleTimeString()}</span>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Rendert Statistiken
     */
    renderStats() {
        const stats = this.getStats();
        
        if (stats.total === 0) {
            return '';
        }
        
        return `
            <div class=\"stats-row\">
                <span>W20: ${stats.total}</span>
                <span>Ø: ${stats.average}</span>
                <span class=\"stat-crit\">✨ ${stats.crits}</span>
                <span class=\"stat-fail\">💥 ${stats.fails}</span>
            </div>
        `;
    },
    
    /**
     * Toggle Verlauf-Anzeige
     */
    toggleHistory() {
        const historyContainer = document.getElementById('diceHistory');
        if (historyContainer) {
            const isVisible = historyContainer.style.display !== 'none';
            historyContainer.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                historyContainer.innerHTML = this.renderHistory();
            }
        }
    },
    
    /**
     * Schnell-Wurf für Initiative
     */
    rollInitiative() {
        const mod = currentCharacter?.combat?.initiative || 0;
        return this.rollD20(mod, 'Initiative');
    },
    
    /**
     * Schnell-Wurf für Angriff
     */
    rollAttack() {
        const mod = currentCharacter?.combat?.angriff || 0;
        return this.rollD20(mod, 'Angriff');
    },
    
    /**
     * Schnell-Wurf für Ausweichen
     */
    rollDodge() {
        const mod = currentCharacter?.combat?.ausweichen || 0;
        return this.rollD20(mod, 'Ausweichen');
    },
    
    /**
     * Schnell-Wurf für Wahrnehmung
     */
    rollPerception() {
        const mod = currentCharacter?.skills?.wissen?.wahrnehmung || 0;
        return this.rollD20(mod, 'Wahrnehmung');
    },
    
    /**
     * Schnell-Wurf für Charisma
     */
    rollCharisma() {
        const mod = currentCharacter?.skills?.sozial?.redekunst_verhandeln || 0;
        return this.rollD20(mod, 'Charisma');
    }
};

// Global verfügbar machen
window.DiceSystem = DiceSystem;