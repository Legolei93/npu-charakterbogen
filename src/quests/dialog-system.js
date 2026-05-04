/**
 * Dialog System v4.0 - Mehrstufige Dialogbäume mit Skill Checks
 * 
 * Features:
 * - Mehrstufige Dialogbäume
 * - Skill Checks (d20 + Modifier vs DC)
 * - Karma-basierte Optionen
 * - Trust-basierte Optionen
 * - Dynamische Optionen basierend auf Character
 * - Hidden Options (entdeckbar durch Skills)
 */

const DialogSystem = {
    
    // === STATE ===
    currentDialog: null,
    currentNode: null,
    questContext: null,
    
    // === INITIALISIERUNG ===
    
    /**
     * Startet einen Dialog
     * @param {Object} dialogTree - Der Dialog-Baum
     * @param {Object} quest - Die zugehörige Quest
     * @param {Object} context - Zusätzlicher Kontext
     */
    start(dialogTree, quest, context = {}) {
        if (!dialogTree) {
            console.error('[DialogSystem] Kein Dialog-Tree angegeben');
            return false;
        }
        
        this.currentDialog = dialogTree;
        this.currentNode = 'start';
        this.questContext = quest;
        this.context = context;
        
        console.log('[DialogSystem] Dialog gestartet:', quest?.title || 'Unbekannt');
        
        this.render();
        return true;
    },
    
    /**
     * Beendet den aktuellen Dialog
     */
    end() {
        this.currentDialog = null;
        this.currentNode = null;
        this.questContext = null;
        this.context = {};
        
        // UI schließen
        const container = document.getElementById('dialog-container');
        if (container) {
            container.style.display = 'none';
        }
    },
    
    // === RENDERING ===
    
    /**
     * Rendert den aktuellen Dialog-Node
     */
    render() {
        if (!this.currentDialog || !this.currentNode) return;
        
        const node = this.currentDialog[this.currentNode];
        if (!node) {
            console.error('[DialogSystem] Node nicht gefunden:', this.currentNode);
            this.end();
            return;
        }
        
        // Container erstellen/aktualisieren
        let container = document.getElementById('dialog-container');
        if (!container) {
            container = this._createContainer();
        }
        
        container.style.display = 'block';
        
        // NPC Info
        const npcInfo = this._getNPCInfo();
        
        // HTML aufbauen
        container.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-box">
                    <div class="dialog-header">
                        <div class="npc-avatar" style="background: ${npcInfo.color || '#333'}">
                            ${npcInfo.symbol || '👤'}
                        </div>
                        <div class="npc-info">
                            <h3>${npcInfo.name || 'Unbekannt'}</h3>
                            <span class="npc-location">${npcInfo.location || ''}</span>
                        </div>
                        <button class="dialog-close" onclick="DialogSystem.end()">✕</button>
                    </div>
                    
                    <div class="dialog-content">
                        <p class="dialog-text">${this._formatText(node.text)}</p>
                        
                        ${node.skillCheck ? this._renderSkillCheck(node.skillCheck) : ''}
                    </div>
                    
                    <div class="dialog-options">
                        ${this._renderOptions(node.options)}
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Erstellt den Dialog-Container
     * @private
     */
    _createContainer() {
        const container = document.createElement('div');
        container.id = 'dialog-container';
        container.className = 'dialog-container';
        document.body.appendChild(container);
        return container;
    },
    
    /**
     * Rendert die Dialog-Optionen
     * @private
     */
    _renderOptions(options) {
        if (!options || !Array.isArray(options)) return '';
        
        const character = this._getCharacter();
        const questEngine = window.QuestEngine;
        
        return options.map((option, index) => {
            // Prüfe Requirements für diese Option
            if (!this._checkOptionRequirements(option)) {
                return '';
            }
            
            // Skill Check Info
            let skillInfo = '';
            if (option.skillCheck) {
                const stat = option.skillCheck.stat;
                const mod = character?.modifiers?.[stat] || 0;
                const dc = option.skillCheck.dc;
                const successChance = this._calculateSuccessChance(mod, dc);
                skillInfo = `<span class="skill-info" title="Erfolgschance: ${successChance}%">
                    [${stat.toUpperCase()} DC ${dc}]
                </span>`;
            }
            
            // Karma Indicator
            let karmaInfo = '';
            if (option.karma !== undefined) {
                const karmaClass = option.karma > 0 ? 'karma-good' : option.karma < 0 ? 'karma-bad' : '';
                const karmaSymbol = option.karma > 0 ? '☀' : option.karma < 0 ? '🌑' : '⚪';
                karmaInfo = `<span class="karma-indicator ${karmaClass}">${karmaSymbol}</span>`;
            }
            
            // Hidden Option Indicator
            const hiddenClass = option.hidden ? 'hidden-option revealed' : '';
            
            return `
                <button class="dialog-option ${hiddenClass}" 
                        onclick="DialogSystem.selectOption(${index})"
                        ${option.disabled ? 'disabled' : ''}>
                    <span class="option-text">${option.text}</span>
                    ${skillInfo}
                    ${karmaInfo}
                </button>
            `;
        }).join('');
    },
    
    /**
     * Rendert Skill Check Information
     * @private
     */
    _renderSkillCheck(skillCheck) {
        const character = this._getCharacter();
        const stat = skillCheck.stat;
        const mod = character?.modifiers?.[stat] || 0;
        const dc = skillCheck.dc;
        
        return `
            <div class="skill-check-info">
                <span class="stat-name">${this._getStatName(stat)}</span>
                <span class="modifier">${mod >= 0 ? '+' : ''}${mod}</span>
                <span class="vs">vs</span>
                <span class="dc">DC ${dc}</span>
            </div>
        `;
    },
    
    // === OPTION HANDLING ===
    
    /**
     * Wählt eine Option aus
     * @param {number} index - Der Index der Option
     */
    selectOption(index) {
        if (!this.currentDialog || !this.currentNode) return;
        
        const node = this.currentDialog[this.currentNode];
        const option = node.options[index];
        
        if (!option) {
            console.error('[DialogSystem] Option nicht gefunden:', index);
            return;
        }
        
        // Skill Check durchführen
        if (option.skillCheck) {
            const result = this._performSkillCheck(option.skillCheck);
            
            if (result.success) {
                console.log('[DialogSystem] Skill Check bestanden!');
                this._applyRewards(option, result);
                this._transition(option.next);
            } else {
                console.log('[DialogSystem] Skill Check fehlgeschlagen!');
                // Bei Fehlschlag: Alternative Route oder Retry
                const failNode = option.failNext || option.next;
                this._transition(failNode);
            }
        } else {
            // Kein Skill Check - direkte Transition
            this._applyRewards(option);
            this._transition(option.next);
        }
    },
    
    /**
     * Führt einen Skill Check durch
     * @private
     */
    _performSkillCheck(skillCheck) {
        const character = this._getCharacter();
        const stat = skillCheck.stat;
        const mod = character?.modifiers?.[stat] || 0;
        const dc = skillCheck.dc;
        
        // d20 Wurf
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + mod;
        const success = total >= dc;
        
        // Kritischer Erfolg/Misserfolg
        const critical = roll === 20;
        const criticalFail = roll === 1;
        
        const result = {
            roll,
            modifier: mod,
            total,
            dc,
            success: critical || (success && !criticalFail),
            critical,
            criticalFail
        };
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('dialog:skillcheck', result);
        }
        
        return result;
    },
    
    /**
     * Transition zu einem neuen Node
     * @private
     */
    _transition(nextNode) {
        if (!nextNode || nextNode === 'end') {
            // Quest abschließen wenn result vorhanden
            if (this.questContext && this.currentDialog?.[this.currentNode]?.result === 'quest_completed') {
                this._completeQuest();
            }
            this.end();
            return;
        }
        
        this.currentNode = nextNode;
        this.render();
    },
    
    /**
     * Wendet Belohnungen an
     * @private
     */
    _applyRewards(option, skillResult = null) {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        // Karma
        if (option.karma !== undefined) {
            questEngine.state.karma.value += option.karma;
            questEngine.state.karma.history.push({
                change: option.karma,
                reason: `Dialog: ${this.questContext?.title || 'Unbekannt'}`,
                timestamp: new Date().toISOString()
            });
        }
        
        // Reputation/Trust
        if (option.reputation) {
            Object.entries(option.reputation).forEach(([npc, value]) => {
                if (questEngine.state.trust[npc]) {
                    questEngine.state.trust[npc].value = Math.min(
                        questEngine.state.trust[npc].max,
                        questEngine.state.trust[npc].value + value
                    );
                }
            });
        }
        
        // Skill Check Bonus
        if (skillResult?.critical) {
            // Kritischer Erfolg - zusätzliche Belohnung
            console.log('[DialogSystem] Kritischer Erfolg! Bonus-Belohnung!');
        }
        
        // Speichern
        questEngine.StateManager.saveState();
    },
    
    /**
     * Schließt die Quest ab
     * @private
     */
    _completeQuest() {
        if (!this.questContext) return;
        
        const questEngine = window.QuestEngine;
        if (questEngine) {
            questEngine.completeQuest(this.questContext.id);
        }
    },
    
    // === REQUIREMENTS CHECK ===
    
    /**
     * Prüft ob eine Option verfügbar ist
     * @private
     */
    _checkOptionRequirements(option) {
        const character = this._getCharacter();
        const questEngine = window.QuestEngine;
        
        // Hidden Option - nur sichtbar wenn Bedingungen erfüllt
        if (option.hidden) {
            if (option.requires) {
                // Skill Check für versteckte Option
                if (option.requires.skill) {
                    const skill = option.requires.skill;
                    const mod = character?.modifiers?.[skill.stat] || 0;
                    // Passive Wahrnehmung - kein Wurf nötig
                    if (mod + 10 < skill.dc) return false;
                }
                
                // Trust Requirement
                if (option.requires.trust) {
                    const npc = option.requires.trust.npc;
                    const minTrust = option.requires.trust.value;
                    const currentTrust = questEngine?.state?.trust?.[npc]?.value || 0;
                    if (currentTrust < minTrust) return false;
                }
                
                // Karma Requirement
                if (option.requires.karma) {
                    const karma = questEngine?.state?.karma?.value || 0;
                    if (option.requires.karma.min !== undefined && karma < option.requires.karma.min) return false;
                    if (option.requires.karma.max !== undefined && karma > option.requires.karma.max) return false;
                }
            }
        }
        
        // Stat Requirement
        if (option.requires?.stat) {
            const stat = option.requires.stat;
            const value = character?.baseAttributes?.[stat] || 0;
            if (value < (option.requires.min || 0)) return false;
        }
        
        return true;
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Berechnet die Erfolgschance für einen Skill Check
     * @private
     */
    _calculateSuccessChance(modifier, dc) {
        // d20: 1-20, Erfolg bei >= DC
        // Mit Modifier: needRoll = DC - modifier
        const needRoll = Math.max(1, Math.min(20, dc - modifier));
        const successRolls = 21 - needRoll; // 20 - needRoll + 1 (für den Wurf selbst)
        return Math.round((successRolls / 20) * 100);
    },
    
    /**
     * Formatiert Text (ersetzt Platzhalter)
     * @private
     */
    _formatText(text) {
        const character = this._getCharacter();
        
        return text
            .replace(/\[Name\]/g, character?.name || 'Shinobi')
            .replace(/\[Clan\]/g, character?.clan || 'Clanlos');
    },
    
    /**
     * Gibt NPC-Info zurück
     * @private
     */
    _getNPCInfo() {
        const giver = this.questContext?.giver;
        if (!giver) return { name: 'Unbekannt', color: '#333', symbol: '👤' };
        
        const npcData = {
            'Taro': { color: '#8B4513', symbol: '⚔️' },
            'Yuki': { color: '#4682B4', symbol: '🛡️' },
            'Shin': { color: '#2F4F4F', symbol: '📦' },
            'Kira': { color: '#800080', symbol: '🗡️' },
            'Karl': { color: '#8B0000', symbol: '👑' },
            'Pastor': { color: '#FFD700', symbol: '⛪' },
            'Jimmy': { color: '#FF6347', symbol: '🃏' }
        };
        
        const data = npcData[giver.name] || { color: '#333', symbol: '👤' };
        
        return {
            name: giver.name,
            location: giver.location,
            color: data.color,
            symbol: data.symbol
        };
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
    
    /**
     * Gibt den Stat-Namen zurück
     * @private
     */
    _getStatName(stat) {
        const names = {
            kk: 'Körperkraft',
            ges: 'Geschicklichkeit',
            kon: 'Konstitution',
            gsw: 'Geschwindigkeit',
            itu: 'Intuition',
            int: 'Intelligenz',
            cha: 'Charisma'
        };
        return names[stat] || stat;
    },
    
    // === CSS ===
    
    /**
     * Fügt Dialog-CSS hinzu
     */
    injectStyles() {
        if (document.getElementById('dialog-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'dialog-styles';
        styles.textContent = `
            .dialog-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: none;
            }
            
            .dialog-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .dialog-box {
                background: #1a1a2e;
                border: 2px solid #16213e;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            }
            
            .dialog-header {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: #16213e;
                border-bottom: 1px solid #0f3460;
            }
            
            .npc-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .npc-info h3 {
                margin: 0;
                color: #e94560;
            }
            
            .npc-location {
                color: #888;
                font-size: 12px;
            }
            
            .dialog-close {
                margin-left: auto;
                background: none;
                border: none;
                color: #888;
                font-size: 20px;
                cursor: pointer;
            }
            
            .dialog-content {
                padding: 20px;
            }
            
            .dialog-text {
                color: #fff;
                line-height: 1.6;
                font-size: 16px;
            }
            
            .skill-check-info {
                margin-top: 15px;
                padding: 10px;
                background: #0f3460;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                gap: 10px;
                align-items: center;
            }
            
            .skill-check-info .stat-name {
                color: #e94560;
                font-weight: bold;
            }
            
            .skill-check-info .modifier {
                color: #4ecca3;
            }
            
            .skill-check-info .dc {
                color: #ffd700;
                font-weight: bold;
            }
            
            .dialog-options {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .dialog-option {
                padding: 15px;
                background: #16213e;
                border: 1px solid #0f3460;
                border-radius: 8px;
                color: #fff;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .dialog-option:hover {
                background: #0f3460;
                border-color: #e94560;
            }
            
            .dialog-option:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .dialog-option .skill-info {
                color: #888;
                font-size: 12px;
            }
            
            .dialog-option .karma-indicator {
                font-size: 14px;
            }
            
            .karma-good { color: #4ecca3; }
            .karma-bad { color: #e94560; }
            
            .hidden-option {
                border-style: dashed;
                opacity: 0.8;
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// Styles beim Laden injizieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DialogSystem.injectStyles());
} else {
    DialogSystem.injectStyles();
}

// Global verfügbar machen
window.DialogSystem = DialogSystem;
