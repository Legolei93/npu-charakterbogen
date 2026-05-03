/**
 * DM Quest Control v4.0 - DM Panel Integration für Quests
 * 
 * Features:
 * - Daily Quests resetten
 * - Neue Quests generieren
 * - Spezialquests triggern
 * - Bossquests freigeben
 * - Loot Pools anpassen
 * - Training resetten
 * - Queststatus korrigieren
 * - Vertrauen/Karma korrigieren
 * - Live Synchronisation
 */

const DMQuestControl = {
    
    // === INITIALISIERUNG ===
    
    /**
     * Initialisiert die DM Quest Control
     */
    init() {
        console.log('[DMQuestControl] Initialisiert');
    },
    
    /**
     * Rendert das DM Quest Panel
     */
    renderPanel() {
        const container = document.getElementById('dm-quest-panel');
        if (!container) return;
        
        const questEngine = window.QuestEngine;
        const trainingSystem = window.TrainingSystemV4;
        
        if (!questEngine) {
            container.innerHTML = '<p>Quest-Engine nicht verfügbar</p>';
            return;
        }
        
        const state = questEngine.state;
        
        container.innerHTML = `
            <div class="dm-quest-panel-v4">
                <h3>🎮 Quest System Control</h3>
                
                ${this._renderDailyResetSection(state)}
                ${this._renderQuestStatusSection(state)}
                ${this._renderSpecialQuestsSection()}
                ${this._renderTrainingSection()}
                ${this._renderKarmaSection()}
                ${this._renderLootPoolSection()}
            </div>
        `;
        
        this._attachEventListeners(container);
    },
    
    /**
     * Rendert den Daily Reset Bereich
     * @private
     */
    _renderDailyResetSection(state) {
        const lastReset = state.lastDailyReset 
            ? new Date(state.lastDailyReset).toLocaleString('de-DE')
            : 'Nie';
        
        return `
            <div class="dm-section">
                <h4>📅 Daily Reset</h4>
                
                <div class="dm-info">
                    <span>Letzter Reset: ${lastReset}</span>
                </div>
                
                <div class="dm-actions">
                    <button class="dm-btn primary" onclick="DMQuestControl.resetDailyQuests()">
                        🔄 Daily Quests Reset
                    </button>
                    
                    <button class="dm-btn" onclick="DMQuestControl.generateNewQuests()">
                        ✨ Neue Quests Generieren
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert den Quest Status Bereich
     * @private
     */
    _renderQuestStatusSection(state) {
        const activeQuests = state.activeQuests || [];
        const completedQuests = state.completedQuests || [];
        const selectedQuests = state.selectedQuests || [];
        
        return `
            <div class="dm-section">
                <h4>📊 Quest Status</h4>
                
                <div class="dm-stats">
                    <div class="dm-stat">
                        <span class="label">Aktiv:</span>
                        <span class="value">${activeQuests.length}</span>
                    </div>
                    <div class="dm-stat">
                        <span class="label">Abgeschlossen:</span>
                        <span class="value">${completedQuests.length}/3</span>
                    </div>
                    <div class="dm-stat">
                        <span class="label">Ausgewählt:</span>
                        <span class="value">${selectedQuests.length}/3</span>
                    </div>
                </div>
                
                ${activeQuests.length > 0 ? `
                <div class="dm-active-quests">
                    <h5>Aktive Quests:</h5>
                    ${activeQuests.map(q => `
                        <div class="dm-quest-item">
                            <span>${q.title}</span>
                            <div class="dm-quest-actions">
                                <button class="dm-btn small" onclick="DMQuestControl.completeQuest('${q.id}')">
                                    ✅ Abschließen
                                </button>
                                <button class="dm-btn small danger" onclick="DMQuestControl.failQuest('${q.id}')">
                                    ❌ Fehlschlagen
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    },
    
    /**
     * Rendert den Spezialquests Bereich
     * @private
     */
    _renderSpecialQuestsSection() {
        return `
            <div class="dm-section">
                <h4>⭐ Spezialquests</h4>
                
                <div class="dm-actions">
                    <button class="dm-btn elite" onclick="DMQuestControl.triggerEliteQuest()">
                        👑 Elite Quest
                    </button>
                    
                    <button class="dm-btn story" onclick="DMQuestControl.triggerStoryQuest()">
                        📖 Story Quest
                    </button>
                    
                    <button class="dm-btn blackmarket" onclick="DMQuestControl.triggerBlackmarketQuest()">
                        🌑 Schwarzmarkt
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert den Training Bereich
     * @private
     */
    _renderTrainingSection() {
        const character = this._getCurrentCharacter();
        const inTrainingJutsus = character?.jutsus?.filter(j => j.inTraining) || [];
        
        let jutsuControls = '';
        if (inTrainingJutsus.length > 0) {
            jutsuControls = `
                <div class="dm-subsection">
                    <h5>📜 Jutsu Training Override</h5>
                    ${inTrainingJutsus.map(j => `
                        <div class="dm-jutsu-control">
                            <span>${j.name}: ${j.trainingProgress || 0}/5</span>
                            <div class="dm-actions">
                                <button class="dm-btn small" onclick="DMQuestControl.setJutsuProgress('${j.id}', ${(j.trainingProgress || 0) + 1})">
                                    +1
                                </button>
                                <button class="dm-btn small" onclick="DMQuestControl.setJutsuProgress('${j.id}', 5)">
                                    MAX
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="dm-section">
                <h4>🏋️ Training Control</h4>
                
                <div class="dm-actions">
                    <button class="dm-btn" onclick="DMQuestControl.resetTraining()">
                        🔄 Training Reset
                    </button>
                    
                    <button class="dm-btn" onclick="DMQuestControl.completeTrainingInstantly()">
                        ⚡ Training Sofort Abschließen
                    </button>
                    
                    <button class="dm-btn" onclick="DMQuestControl.cancelTraining()">
                        ❌ Training Abbrechen
                    </button>
                </div>
                
                ${jutsuControls}
            </div>
        `;
    },
    
    /**
     * Rendert den Karma Bereich
     * @private
     */
    _renderKarmaSection() {
        const karmaSystem = window.KarmaSystem;
        const karma = karmaSystem?.getKarma() || 0;
        
        return `
            <div class="dm-section">
                <h4>☯️ Karma & Vertrauen</h4>
                
                <div class="dm-info">
                    <span>Aktuelles Karma: ${karma}</span>
                </div>
                
                <div class="dm-actions">
                    <button class="dm-btn" onclick="DMQuestControl.modifyKarma(10)">
                        ☀️ +10 Karma
                    </button>
                    
                    <button class="dm-btn" onclick="DMQuestControl.modifyKarma(-10)">
                        🌑 -10 Karma
                    </button>
                </div>
                
                <div class="dm-actions">
                    <input type="text" id="dm-trust-npc" placeholder="NPC Name" class="dm-input" />
                    <input type="number" id="dm-trust-value" placeholder="Wert" class="dm-input small" />
                    <button class="dm-btn" onclick="DMQuestControl.setTrust()">
                        🤝 Vertrauen Setzen
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert den Loot Pool Bereich
     * @private
     */
    _renderLootPoolSection() {
        return `
            <div class="dm-section">
                <h4>🎁 Loot Pools</h4>
                
                <div class="dm-actions">
                    <button class="dm-btn" onclick="DMQuestControl.modifyLegendaryChance(0.5)">
                        💎 Legendary +0.5%
                    </button>
                    
                    <button class="dm-btn" onclick="DMQuestControl.modifyLegendaryChance(-0.5)">
                        📉 Legendary -0.5%
                    </button>
                </div>
                
                <div class="dm-actions">
                    <button class="dm-btn" onclick="DMQuestControl.giveChestReward()">
                        🎁 Sofortige Kistenbelohnung
                    </button>
                </div>
            </div>
        `;
    },
    
    // === AKTIONEN ===
    
    /**
     * Resettet die Daily Quests
     */
    resetDailyQuests() {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        questEngine.state.completedQuests = [];
        questEngine.state.selectedQuests = [];
        questEngine.state.activeQuests = [];
        questEngine.state.lastDailyReset = new Date().toISOString();
        
        questEngine.generateDailyQuests();
        questEngine.saveState();
        
        console.log('[DMQuestControl] Daily Quests resettet');
        this.renderPanel();
        
        // UI aktualisieren
        if (window.QuestBoardUI) {
            window.QuestBoardUI.render();
        }
    },
    
    /**
     * Generiert neue Quests
     */
    generateNewQuests() {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        questEngine.generateDailyQuests();
        questEngine.saveState();
        
        console.log('[DMQuestControl] Neue Quests generiert');
        this.renderPanel();
        
        if (window.QuestBoardUI) {
            window.QuestBoardUI.render();
        }
    },
    
    /**
     * Schließt eine Quest ab
     * @param {string} questId
     */
    completeQuest(questId) {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        questEngine.completeQuest(questId);
        this.renderPanel();
        
        if (window.QuestBoardUI) {
            window.QuestBoardUI.render();
        }
    },
    
    /**
     * Lässt eine Quest fehlschlagen
     * @param {string} questId
     */
    failQuest(questId) {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        questEngine.failQuest(questId);
        this.renderPanel();
        
        if (window.QuestBoardUI) {
            window.QuestBoardUI.render();
        }
    },
    
    /**
     * Triggert eine Elite Quest
     */
    triggerEliteQuest() {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        // Füge Elite Quest zu verfügbaren Quests hinzu
        const eliteQuest = window.QuestRegistryV4?.elite?.[0];
        if (eliteQuest) {
            questEngine.state.availableQuests.unshift(eliteQuest);
            questEngine.saveState();
            
            console.log('[DMQuestControl] Elite Quest getriggert');
            
            if (window.QuestBoardUI) {
                window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Triggert eine Story Quest
     */
    triggerStoryQuest() {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        const storyQuests = window.QuestRegistryV4?.story || [];
        if (storyQuests.length > 0) {
            const randomQuest = storyQuests[Math.floor(Math.random() * storyQuests.length)];
            questEngine.state.availableQuests.unshift(randomQuest);
            questEngine.saveState();
            
            console.log('[DMQuestControl] Story Quest getriggert:', randomQuest.title);
            
            if (window.QuestBoardUI) {
                window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Triggert eine Schwarzmarkt Quest
     */
    triggerBlackmarketQuest() {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        const blackmarketQuests = window.QuestRegistryV4?.merchant?.filter(q => q.category === 'blackmarket') || [];
        if (blackmarketQuests.length > 0) {
            const randomQuest = blackmarketQuests[Math.floor(Math.random() * blackmarketQuests.length)];
            questEngine.state.availableQuests.unshift(randomQuest);
            questEngine.saveState();
            
            console.log('[DMQuestControl] Schwarzmarkt Quest getriggert');
            
            if (window.QuestBoardUI) {
                window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Resettet das Training
     */
    resetTraining() {
        if (typeof TrainingSystemV4 !== 'undefined') {
            const result = TrainingSystemV4.dmResetTraining();
            if (result.success) {
                console.log('[DMQuestControl] Training resettet');
                if (window.QuestBoardUI) window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Schließt Training sofort ab
     */
    completeTrainingInstantly() {
        if (typeof TrainingSystemV4 !== 'undefined') {
            const result = TrainingSystemV4.dmForceComplete();
            if (result.success) {
                console.log('[DMQuestControl] Training sofort abgeschlossen');
                if (window.QuestBoardUI) window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Bricht Training ab
     */
    cancelTraining() {
        if (typeof TrainingSystemV4 !== 'undefined') {
            const result = TrainingSystemV4.dmCancelTraining();
            if (result.success) {
                console.log('[DMQuestControl] Training abgebrochen');
                if (window.QuestBoardUI) window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Setzt Jutsu Progress (DM Override)
     * @param {string} jutsuId
     * @param {number} progress
     */
    setJutsuProgress(jutsuId, progress) {
        if (typeof TrainingSystemV4 !== 'undefined') {
            const result = TrainingSystemV4.dmSetJutsuProgress(jutsuId, progress);
            if (result.success) {
                console.log(`[DMQuestControl] Jutsu ${result.jutsu} Progress auf ${progress} gesetzt`);
                if (result.unlocked) {
                    alert(`✅ ${result.jutsu} wurde freigeschaltet!`);
                }
                this.renderPanel();
                if (window.QuestBoardUI) window.QuestBoardUI.render();
            }
        }
    },
    
    /**
     * Modifiziert Karma
     * @param {number} amount
     */
    modifyKarma(amount) {
        const karmaSystem = window.KarmaSystem;
        if (!karmaSystem) return;
        
        karmaSystem.modifyKarma(amount, 'DM Eingriff');
        this.renderPanel();
    },
    
    /**
     * Setzt Vertrauen für einen NPC
     */
    setTrust() {
        const npcInput = document.getElementById('dm-trust-npc');
        const valueInput = document.getElementById('dm-trust-value');
        
        const npc = npcInput?.value?.toLowerCase();
        const value = parseInt(valueInput?.value);
        
        if (!npc || isNaN(value)) {
            alert('Bitte NPC und Wert eingeben');
            return;
        }
        
        const character = this._getCharacter();
        if (!character) return;
        
        character.trust = character.trust || {};
        character.trust[npc] = value;
        
        if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter(character);
        }
        
        console.log(`[DMQuestControl] Vertrauen für ${npc} auf ${value} gesetzt`);
        
        npcInput.value = '';
        valueInput.value = '';
    },
    
    /**
     * Modifiziert Legendary Chance
     * @param {number} amount
     */
    modifyLegendaryChance(amount) {
        const rewardSystem = window.RewardSystem;
        if (!rewardSystem) return;
        
        rewardSystem.CONFIG.LEGENDARY_CHANCE += amount;
        rewardSystem.CONFIG.LEGENDARY_CHANCE = Math.max(0.01, 
            Math.min(5, rewardSystem.CONFIG.LEGENDARY_CHANCE));
        
        console.log(`[DMQuestControl] Legendary Chance: ${rewardSystem.CONFIG.LEGENDARY_CHANCE}%`);
    },
    
    /**
     * Gibt sofortige Kistenbelohnung
     */
    giveChestReward() {
        const rewardSystem = window.RewardSystem;
        if (!rewardSystem) return;
        
        rewardSystem.renderChestSelection();
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Fügt Event Listener hinzu
     * @private
     */
    _attachEventListeners(container) {
        // Event Listener werden inline über onclick hinzugefügt
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
    }
};

// Global verfügbar machen
window.DMQuestControl = DMQuestControl;
