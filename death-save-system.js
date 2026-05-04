/**
 * Death Save System - Todeskampf mit Sensenmann
 * 3 Erfolge = stabil, 3 Misserfolge = Tod
 */

const DeathSaveSystem = {
    // Aktueller Todeskampf-Status
    currentSave: null,
    
    // Initialisiert das System
    init() {
        this.loadFromStorage();
        console.log('DeathSaveSystem initialisiert');
    },
    
    /**
     * Laedt den aktuellen Todeskampf aus dem Speicher
     */
    loadFromStorage() {
        const saved = localStateManager.getItem('npu_death_save');
        if (saved) {
            this.currentSave = JSON.parse(saved);
        }
    },
    
    /**
     * Speichert den aktuellen Todeskampf
     */
    saveToStorage() {
        if (this.currentSave) {
            localStateManager.setItem('npu_death_save', JSON.stringify(this.currentSave));
        } else {
            localStorage.removeItem('npu_death_save');
        }
    },
    
    /**
     * Startet einen neuen Todeskampf
     */
    startDeathSave(characterId, characterName) {
        this.currentSave = {
            characterId,
            characterName,
            successes: 0,
            failures: 0,
            startedAt: new Date().toISOString(),
            rolls: []
        };
        
        this.saveToStorage();
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('death_save_started', { characterName });
        }
        
        this.showDeathSaveModal();
    },
    
    /**
     * Zeigt das Todeskampf-Modal
     */
    showDeathSaveModal() {
        const modal = document.createElement('div');
        modal.id = 'deathSaveModal';
        modal.className = 'death-save-modal';
        
        modal.innerHTML = `
            <div class="death-save-content">
                <div class="death-save-header">
                    <span class="grim-reaper">[Totenkopf]</span>
                    <h2>TODESKAMPF</h2>
                    <span class="grim-reaper">[Totenkopf]</span>
                </div>
                
                <div class="death-save-character">
                    <span>${this.currentSave?.characterName || 'Unbekannt'}</span>
                </div>
                
                <div class="death-save-status">
                    <div class="status-boxes">
                        <div class="status-label">Erfolge (Stabil)</div>
                        <div class="status-boxes-row" id="successBoxes">
                            ${this.renderStatusBoxes(this.currentSave?.successes || 0, 'success')}
                        </div>
                    </div>
                    
                    <div class="status-boxes">
                        <div class="status-label">Misserfolge (Tod)</div>
                        <div class="status-boxes-row" id="failureBoxes">
                            ${this.renderStatusBoxes(this.currentSave?.failures || 0, 'failure')}
                        </div>
                    </div>
                </div>
                
                <div class="death-save-instruction">
                    <p>Wuerfle eine Rettungsprobe (W20)</p>
                    <p class="save-rule">&ge; 10 = Erfolg | &lt; 10 = Misserfolg</p>
                </div>
                
                <div class="death-save-actions">
                    <button class="btn-success" onclick="DeathSaveSystem.rollDeathSave(true)">
                        [OK] Probe geschafft (&ge;10)
                    </button>
                    <button class="btn-failure" onclick="DeathSaveSystem.rollDeathSave(false)">
                        [X] Probe fehlgeschlagen (&lt;10)
                    </button>
                </div>
                
                <div class="death-save-history" id="deathSaveHistory">
                    ${this.renderRollHistory()}
                </div>
                
                <button class="btn-close" onclick="DeathSaveSystem.closeModal()">
                    Schliessen (nur wenn stabil oder tot)
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Pruefe ob bereits entschieden
        this.checkDeathSaveStatus();
    },
    
    /**
     * Rendert die Status-Boxen
     */
    renderStatusBoxes(count, type) {
        let html = '';
        for (let i = 0; i < 3; i++) {
            const filled = i < count;
            html += `<div class="status-box ${type} ${filled ? 'filled' : ''}"></div>`;
        }
        return html;
    },
    
    /**
     * Rendert den Wuerfel-Verlauf
     */
    renderRollHistory() {
        if (!this.currentSave?.rolls?.length) {
            return '<p class="no-rolls">Noch keine Wuerfe</p>';
        }
        
        return this.currentSave.rolls.map((roll, index) => `
            <div class="roll-entry ${roll.success ? 'success' : 'failure'}">
                <span>Runde ${index + 1}: Wurf ${roll.roll}</span>
                <span>${roll.success ? '[OK] Erfolg' : '[X] Misserfolg'}</span>
            </div>
        `).join('');
    },
    
    /**
     * Fuehrt einen Todeskampf-Wurf durch
     */
    rollDeathSave(success) {
        if (!this.currentSave) return;
        
        // Simuliere W20 Wurf (10-20 = Erfolg, 1-9 = Misserfolg)
        const roll = success ? Math.floor(Math.random() * 11) + 10 : Math.floor(Math.random() * 9) + 1;
        
        this.currentSave.rolls.push({
            roll,
            success,
            timestamp: new Date().toISOString()
        });
        
        if (success) {
            this.currentSave.successes++;
        } else {
            this.currentSave.failures++;
        }
        
        this.saveToStorage();
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('death_save_roll', {
                characterName: this.currentSave.characterName,
                roll,
                success,
                successes: this.currentSave.successes,
                failures: this.currentSave.failures
            });
        }
        
        // UI aktualisieren
        this.updateModal();
        
        // Status pruefen
        this.checkDeathSaveStatus();
    },
    
    /**
     * Aktualisiert das Modal
     */
    updateModal() {
        const successBoxes = document.getElementById('successBoxes');
        const failureBoxes = document.getElementById('failureBoxes');
        const history = document.getElementById('deathSaveHistory');
        
        if (successBoxes) {
            successBoxes.innerHTML = this.renderStatusBoxes(this.currentSave.successes, 'success');
        }
        if (failureBoxes) {
            failureBoxes.innerHTML = this.renderStatusBoxes(this.currentSave.failures, 'failure');
        }
        if (history) {
            history.innerHTML = this.renderRollHistory();
        }
    },
    
    /**
     * Prueft den Todeskampf-Status
     */
    checkDeathSaveStatus() {
        if (!this.currentSave) return;
        
        // 3 Erfolge = stabil
        if (this.currentSave.successes >= 3) {
            this.showResult('stabil');
            return;
        }
        
        // 3 Misserfolge = tot
        if (this.currentSave.failures >= 3) {
            this.showResult('dead');
            return;
        }
    },
    
    /**
     * Zeigt das Ergebnis an
     */
    showResult(result) {
        const content = document.querySelector('.death-save-content');
        if (!content) return;
        
        const actions = content.querySelector('.death-save-actions');
        if (actions) actions.style.display = 'none';
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `death-save-result ${result}`;
        
        if (result === 'stabil') {
            resultDiv.innerHTML = `
                <div class="result-icon">[Herz]</div>
                <h3>STABILISIERT!</h3>
                <p>Der Charakter hat den Todeskampf ueberlebt.</p>
                <p>HP wird auf 1 gesetzt.</p>
            `;
            
            // Heile Charakter auf 1 HP
            if (currentCharacter) {
                currentCharacter.hp = 1;
                if (typeof autoSave === 'function') autoSave();
                if (typeof updateStats === 'function') updateStats();
            }
        } else {
            resultDiv.innerHTML = `
                <div class="result-icon">[Totenkopf]</div>
                <h3>TOD</h3>
                <p>Der Charakter ist gestorben.</p>
            `;
            
            // Markiere Charakter als tot
            if (currentCharacter) {
                currentCharacter.isDead = true;
                if (typeof autoSave === 'function') autoSave();
            }
        }
        
        content.appendChild(resultDiv);
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('death_save_result', {
                characterName: this.currentSave.characterName,
                result
            });
        }
    },
    
    /**
     * Schliesst das Modal
     */
    closeModal() {
        // Nur schliessen wenn entschieden
        if (this.currentSave && (this.currentSave.successes >= 3 || this.currentSave.failures >= 3)) {
            const modal = document.getElementById('deathSaveModal');
            if (modal) modal.remove();
            
            // Reset wenn stabil
            if (this.currentSave.successes >= 3) {
                this.currentSave = null;
                this.saveToStorage();
            }
        } else {
            alert('Der Todeskampf ist noch nicht entschieden! (3 Erfolge = stabil, 3 Misserfolge = Tod)');
        }
    },
    
    /**
     * Prueft ob ein Charakter im Todeskampf ist
     */
    isInDeathSave(characterId) {
        return this.currentSave?.characterId === characterId;
    },
    
    /**
     * Manuelles Setzen des Todeskampf-Status (fuer DM)
     */
    adminSetDeathSaveStatus(characterId, successes, failures) {
        if (!this.currentSave || this.currentSave.characterId !== characterId) {
            // Suche Charakter
            const char = JSON.parse(localStateManager.getItem(`npu_character_${characterId}`));
            if (!char) return { success: false, message: 'Charakter nicht gefunden' };
            
            this.currentSave = {
                characterId,
                characterName: char.name,
                successes: 0,
                failures: 0,
                startedAt: new Date().toISOString(),
                rolls: []
            };
        }
        
        this.currentSave.successes = successes;
        this.currentSave.failures = failures;
        this.saveToStorage();
        
        return { success: true, message: 'Todeskampf-Status aktualisiert' };
    }
};

// Global verfuegbar machen
window.DeathSaveSystem = DeathSaveSystem;
