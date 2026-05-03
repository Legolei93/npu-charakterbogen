/**
 * Reward System v4.0 - Belohnungen und Chest System
 * 
 * Features:
 * - Weighted RNG für Chest-Inhalte
 * - 3 Kisten Auswahl
 * - XP, Gold, Items, Jutsus
 * - Seltenheitsstufen
 * - Daily Completion Rewards
 */

const RewardSystem = {
    
    // === KONFIGURATION ===
    CONFIG: {
        // Chest Typen
        CHEST_TYPES: {
            wood: {
                name: 'Alte Holztruhe',
                description: 'Eine einfache Holztruhe mit unbestimmtem Inhalt.',
                color: '#8B4513',
                icon: '📦',
                weights: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 }
            },
            iron: {
                name: 'Eisenkiste',
                description: 'Eine robuste Kiste aus Eisen. Besserer Inhalt wahrscheinlich.',
                color: '#4a4a4a',
                icon: '⚙️',
                weights: { common: 40, uncommon: 45, rare: 12, epic: 3, legendary: 0 }
            },
            shadow: {
                name: 'Schattenkiste',
                description: 'Eine mysteriöse Kiste mit dunkler Aura. Hochriskant, hochbelohnend.',
                color: '#4B0082',
                icon: '🌑',
                weights: { common: 20, uncommon: 35, rare: 30, epic: 12, legendary: 3 }
            }
        },
        
        // Seltenheits-Chancen für Jutsus
        JUTSU_DROP_RATES: {
            D: 5.0,      // 5%
            C: 0.5,      // 0.5%
            B: 0.3,      // 0.3%
            A: 0.1,      // 0.1%
            S: 0.01      // 0.01%
        },
        
        // Legendary Chance
        LEGENDARY_CHANCE: 0.1 // 0.1%
    },
    
    // === REWARD POOLS ===
    REWARD_POOLS: {
        // Häufige Belohnungen
        common: {
            xp: { min: 1, max: 5, chance: 100 },
            copper: { min: 5, max: 50, chance: 80 },
            silver: { min: 1, max: 3, chance: 30 },
            items: [
                { id: 'bandage', name: 'Bandage', type: 'consumable', chance: 40 },
                { id: 'herb', name: 'Heilkraut', type: 'consumable', chance: 40 },
                { id: 'rope', name: 'Seil', type: 'tool', chance: 30 },
                { id: 'rations', name: 'Rationen', type: 'consumable', chance: 35 }
            ]
        },
        
        // Ungewöhnliche Belohnungen
        uncommon: {
            xp: { min: 3, max: 8, chance: 100 },
            copper: { min: 20, max: 100, chance: 70 },
            silver: { min: 2, max: 5, chance: 50 },
            items: [
                { id: 'potion_small', name: 'Kleiner Heiltrank', type: 'consumable', chance: 35 },
                { id: 'kunai_set', name: 'Kunai-Set', type: 'weapon', chance: 25 },
                { id: 'smoke_bomb', name: 'Rauchbombe', type: 'tool', chance: 30 },
                { id: 'antidote', name: 'Gegengift', type: 'consumable', chance: 25 }
            ]
        },
        
        // Seltene Belohnungen
        rare: {
            xp: { min: 5, max: 12, chance: 100 },
            silver: { min: 3, max: 8, chance: 60 },
            gold: { min: 0, max: 1, chance: 20 },
            items: [
                { id: 'potion_medium', name: 'Heiltrank', type: 'consumable', chance: 30 },
                { id: 'weapon_common', name: 'Einfache Waffe', type: 'weapon', chance: 20 },
                { id: 'armor_common', name: 'Einfache Rüstung', type: 'armor', chance: 20 },
                { id: 'scroll_lesser', name: 'Kleine Schriftrolle', type: 'scroll', chance: 25 }
            ]
        },
        
        // Epische Belohnungen
        epic: {
            xp: { min: 8, max: 15, chance: 100 },
            silver: { min: 5, max: 15, chance: 70 },
            gold: { min: 1, max: 2, chance: 40 },
            items: [
                { id: 'potion_large', name: 'Großer Heiltrank', type: 'consumable', chance: 25 },
                { id: 'weapon_rare', name: 'Seltene Waffe', type: 'weapon', chance: 15 },
                { id: 'armor_rare', name: 'Seltene Rüstung', type: 'armor', chance: 15 },
                { id: 'ring_common', name: 'Magischer Ring', type: 'accessory', chance: 10 }
            ]
        },
        
        // Legendäre Belohnungen
        legendary: {
            xp: { min: 15, max: 25, chance: 100 },
            gold: { min: 2, max: 5, chance: 60 },
            items: [
                { id: 'weapon_legendary', name: 'Legendäre Waffe', type: 'weapon', chance: 5 },
                { id: 'armor_legendary', name: 'Legendäre Rüstung', type: 'armor', chance: 5 },
                { id: 'artifact', name: 'Artefakt', type: 'artifact', chance: 3 },
                { id: 'scroll_forbidden', name: 'Verbotene Schriftrolle', type: 'scroll', chance: 2 }
            ]
        }
    },
    
    // === HAUPTMETHODEN ===
    
    /**
     * Generiert Daily Quest Belohnung
     * @param {Object} quest - Die abgeschlossene Quest
     * @returns {Object} - Belohnung
     */
    generateQuestReward(quest) {
        const character = this._getCharacter();
        const difficulty = quest.difficulty || 'medium';
        
        // Basis-Belohnung
        const baseReward = {
            xp: 5, // Garantierte 5 XP
            copper: 0,
            silver: 0,
            gold: 0,
            items: [],
            karma: quest.rewards?.karma || 0,
            reputation: quest.rewards?.reputation || {}
        };
        
        // Schwierigkeits-Multiplikatoren
        const multipliers = {
            easy: { xp: 1, silver: 0.5 },
            medium: { xp: 1, silver: 1 },
            hard: { xp: 1.5, silver: 1.5 },
            very_hard: { xp: 2, silver: 2 }
        };
        
        const mult = multipliers[difficulty] || multipliers.medium;
        
        // Zusätzliche Belohnungen
        baseReward.xp = Math.floor(baseReward.xp * mult.xp);
        baseReward.silver = Math.floor((Math.random() * 5 + 2) * mult.silver);
        
        // Quest-spezifische Belohnungen
        if (quest.rewards) {
            if (quest.rewards.silver) baseReward.silver += quest.rewards.silver;
            if (quest.rewards.gold) baseReward.gold += quest.rewards.gold;
            if (quest.rewards.copper) baseReward.copper += quest.rewards.copper;
        }
        
        return baseReward;
    },
    
    /**
     * Generiert 3 Chest Optionen für Daily Completion
     * @returns {Array} - 3 Chest Objekte
     */
    generateChestSelection() {
        const types = ['wood', 'iron', 'shadow'];
        
        return types.map(type => {
            const config = this.CONFIG.CHEST_TYPES[type];
            return {
                type: type,
                name: config.name,
                description: config.description,
                color: config.color,
                icon: config.icon,
                // Vorschau auf möglichen Inhalt (nicht garantiert)
                preview: this._generateChestPreview(type)
            };
        });
    },
    
    /**
     * Öffnet eine Chest und gibt den Inhalt zurück
     * @param {string} chestType - 'wood', 'iron', oder 'shadow'
     * @returns {Object} - Chest Inhalt
     */
    openChest(chestType) {
        const config = this.CONFIG.CHEST_TYPES[chestType];
        if (!config) {
            console.error('[RewardSystem] Unbekannter Chest-Typ:', chestType);
            return null;
        }
        
        console.log(`[RewardSystem] Öffne ${config.name}...`);
        
        // Seltenheit bestimmen
        const rarity = this._determineRarity(config.weights);
        
        // Inhalt generieren
        const contents = this._generateContents(rarity);
        
        // Jutsu-Check (sehr selten)
        const jutsu = this._tryGenerateJutsu();
        if (jutsu) {
            contents.jutsu = jutsu;
        }
        
        return {
            chestType: chestType,
            chestName: config.name,
            rarity: rarity,
            contents: contents,
            openedAt: new Date().toISOString()
        };
    },
    
    /**
     * Wendet Belohnung auf Character an
     * @param {Object} reward - Die Belohnung
     * @returns {boolean} - Erfolg
     */
    applyReward(reward) {
        const character = this._getCharacter();
        if (!character) {
            console.error('[RewardSystem] Kein Character gefunden');
            return false;
        }
        
        console.log('[RewardSystem] Wende Belohnung an:', reward);
        
        // XP
        if (reward.xp) {
            character.xp = (character.xp || 0) + reward.xp;
        }
        
        // Währung
        if (reward.copper) {
            character.stats = character.stats || {};
            character.stats.copper = (character.stats.copper || 0) + reward.copper;
        }
        
        if (reward.silver) {
            character.stats = character.stats || {};
            character.stats.silver = (character.stats.silver || 0) + reward.silver;
        }
        
        if (reward.gold) {
            character.stats = character.stats || {};
            character.stats.gold = (character.stats.gold || 0) + reward.gold;
        }
        
        // Items
        if (reward.items && reward.items.length > 0) {
            character.inventory = character.inventory || [];
            reward.items.forEach(item => {
                character.inventory.push({
                    ...item,
                    acquiredAt: new Date().toISOString()
                });
            });
        }
        
        // Jutsu
        if (reward.jutsu) {
            character.jutsus = character.jutsus || [];
            character.jutsus.push({
                ...reward.jutsu,
                status: 'in_training',
                acquiredAt: new Date().toISOString()
            });
        }
        
        // Karma
        if (reward.karma) {
            character.karma = (character.karma || 0) + reward.karma;
        }
        
        // Reputation
        if (reward.reputation) {
            character.reputation = character.reputation || {};
            Object.entries(reward.reputation).forEach(([npc, value]) => {
                character.reputation[npc] = (character.reputation[npc] || 0) + value;
            });
        }
        
        // Speichern
        if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter(character);
        }
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('reward:received', reward);
        }
        
        return true;
    },
    
    // === PRIVATE METHODEN ===
    
    /**
     * Bestimmt die Seltenheit basierend auf Gewichten
     * @private
     */
    _determineRarity(weights) {
        const roll = Math.random() * 100;
        let cumulative = 0;
        
        const rarities = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
        
        for (const rarity of rarities) {
            cumulative += weights[rarity] || 0;
            if (roll <= cumulative) {
                return rarity;
            }
        }
        
        return 'common';
    },
    
    /**
     * Generiert Inhalt basierend auf Seltenheit
     * @private
     */
    _generateContents(rarity) {
        const pool = this.REWARD_POOLS[rarity];
        const contents = {
            xp: 0,
            copper: 0,
            silver: 0,
            gold: 0,
            items: []
        };
        
        // XP
        if (pool.xp && Math.random() * 100 <= pool.xp.chance) {
            contents.xp = Math.floor(
                Math.random() * (pool.xp.max - pool.xp.min + 1) + pool.xp.min
            );
        }
        
        // Währung
        if (pool.copper && Math.random() * 100 <= pool.copper.chance) {
            contents.copper = Math.floor(
                Math.random() * (pool.copper.max - pool.copper.min + 1) + pool.copper.min
            );
        }
        
        if (pool.silver && Math.random() * 100 <= pool.silver.chance) {
            contents.silver = Math.floor(
                Math.random() * (pool.silver.max - pool.silver.min + 1) + pool.silver.min
            );
        }
        
        if (pool.gold && Math.random() * 100 <= pool.gold.chance) {
            contents.gold = Math.floor(
                Math.random() * (pool.gold.max - pool.gold.min + 1) + pool.gold.min
            );
        }
        
        // Items
        if (pool.items) {
            pool.items.forEach(item => {
                if (Math.random() * 100 <= item.chance) {
                    contents.items.push({
                        id: item.id,
                        name: item.name,
                        type: item.type
                    });
                }
            });
        }
        
        return contents;
    },
    
    /**
     * Versucht ein Jutsu zu generieren
     * @private
     */
    _tryGenerateJutsu() {
        const character = this._getCharacter();
        if (!character) return null;
        
        // Verwende neue JutsuRewardEngine (Priorität 1 Fix)
        if (typeof JutsuRewardEngine !== 'undefined') {
            const result = JutsuRewardEngine.tryDropJutsu(character, 'chest');
            if (result) {
                // Grant Jutsu
                const success = JutsuRewardEngine.grantJutsu(character, result, 'chest');
                if (success) {
                    return {
                        id: result.id,
                        name: result.name,
                        rank: result.rank,
                        element: result.element,
                        type: result.type,
                        description: result.description
                    };
                }
            }
            return null;
        }
        
        // Fallback zu alter Logik (sollte nicht mehr verwendet werden)
        console.warn('[RewardSystem] JutsuRewardEngine nicht verfügbar, verwende Fallback');
        return this._legacyFindJutsu(character);
    },
    
    /**
     * Legacy Jutsu Findung (Fallback)
     * @private
     */
    _legacyFindJutsu(character) {
        const ranks = ['S', 'A', 'B', 'C', 'D'];
        
        for (const rank of ranks) {
            const chance = this.CONFIG.JUTSU_DROP_RATES[rank];
            if (Math.random() * 100 <= chance) {
                return this._findAppropriateJutsu(rank, character);
            }
        }
        
        return null;
    },
    
    /**
     * Findet ein passendes Jutsu für den Character
     * @private
     */
    _findAppropriateJutsu(rank, character) {
        // Dies würde normalerweise auf jutsu-data.js zugreifen
        // Für jetzt: Platzhalter-Logik
        const clan = character.clan || 'Kein Clan';
        const element = character.element || 'Neutral';
        
        return {
            name: `${rank}-Rang Jutsu`,
            rank: rank,
            type: 'unknown',
            description: `Ein ${rank}-Rang Jutsu, das zu deinem Charakter passt.`,
            requirements: {
                clan: clan,
                element: element
            }
        };
    },
    
    /**
     * Generiert eine Chest-Vorschau
     * @private
     */
    _generateChestPreview(chestType) {
        const config = this.CONFIG.CHEST_TYPES[chestType];
        const weights = config.weights;
        
        // Zeige wahrscheinlichste Inhalte
        const previews = [];
        
        if (weights.legendary > 0) previews.push('💎 Legendär möglich');
        if (weights.epic > 0) previews.push('🔥 Episch möglich');
        if (weights.rare > 10) previews.push('✨ Selten wahrscheinlich');
        
        return previews.length > 0 ? previews.join(', ') : 'Standard-Inhalt';
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
     * Rendert Chest-Auswahl
     * @param {Function} onSelect - Callback bei Auswahl
     */
    renderChestSelection(onSelect) {
        const chests = this.generateChestSelection();
        
        let container = document.getElementById('chest-selection-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'chest-selection-container';
            container.className = 'chest-selection-container';
            document.body.appendChild(container);
        }
        
        container.innerHTML = `
            <div class="chest-selection-overlay">
                <div class="chest-selection-box">
                    <h2>🎁 Wähle deine Belohnung</h2>
                    <p class="chest-subtitle">Du hast alle 3 Daily Quests abgeschlossen!</p>
                    
                    <div class="chest-options">
                        ${chests.map((chest, index) => `
                            <div class="chest-card" data-type="${chest.type}" style="--chest-color: ${chest.color}">
                                <div class="chest-icon">${chest.icon}</div>
                                <h3>${chest.name}</h3>
                                <p class="chest-description">${chest.description}</p>
                                <div class="chest-preview">${chest.preview}</div>
                                <button class="chest-select-btn" data-index="${index}">
                                    Wählen
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Event Listener
        container.querySelectorAll('.chest-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const selectedChest = chests[index];
                const reward = this.openChest(selectedChest.type);
                
                if (reward) {
                    this.applyReward({
                        xp: reward.contents.xp,
                        copper: reward.contents.copper,
                        silver: reward.contents.silver,
                        gold: reward.contents.gold,
                        items: reward.contents.items,
                        jutsu: reward.contents.jutsu
                    });
                    
                    this.renderChestResult(reward);
                }
                
                container.remove();
                
                if (onSelect) onSelect(reward);
            });
        });
        
        container.style.display = 'block';
    },
    
    /**
     * Rendert Chest-Öffnungs-Ergebnis
     * @param {Object} reward - Das Chest-Ergebnis
     */
    renderChestResult(reward) {
        let container = document.getElementById('chest-result-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'chest-result-container';
            container.className = 'chest-result-container';
            document.body.appendChild(container);
        }
        
        const rarityColors = {
            common: '#888',
            uncommon: '#4ecca3',
            rare: '#4a90e2',
            epic: '#9b59b6',
            legendary: '#ffd700'
        };
        
        const contents = reward.contents;
        
        container.innerHTML = `
            <div class="chest-result-overlay">
                <div class="chest-result-box" style="--rarity-color: ${rarityColors[reward.rarity]}">
                    <div class="chest-result-header">
                        <span class="chest-icon-large">${this.CONFIG.CHEST_TYPES[reward.chestType].icon}</span>
                        <h2>${reward.chestName}</h2>
                        <span class="rarity-badge" style="color: ${rarityColors[reward.rarity]}">
                            ${reward.rarity.toUpperCase()}
                        </span>
                    </div>
                    
                    <div class="chest-contents">
                        ${contents.xp > 0 ? `
                            <div class="reward-item">
                                <span class="reward-icon">⭐</span>
                                <span class="reward-value">+${contents.xp} XP</span>
                            </div>
                        ` : ''}
                        
                        ${contents.gold > 0 ? `
                            <div class="reward-item">
                                <span class="reward-icon">🥇</span>
                                <span class="reward-value">${contents.gold} Gold</span>
                            </div>
                        ` : ''}
                        
                        ${contents.silver > 0 ? `
                            <div class="reward-item">
                                <span class="reward-icon">🥈</span>
                                <span class="reward-value">${contents.silver} Silber</span>
                            </div>
                        ` : ''}
                        
                        ${contents.copper > 0 ? `
                            <div class="reward-item">
                                <span class="reward-icon">🥉</span>
                                <span class="reward-value">${contents.copper} Kupfer</span>
                            </div>
                        ` : ''}
                        
                        ${contents.items.map(item => `
                            <div class="reward-item item">
                                <span class="reward-icon">📦</span>
                                <span class="reward-value">${item.name}</span>
                            </div>
                        `).join('')}
                        
                        ${contents.jutsu ? `
                            <div class="reward-item jutsu">
                                <span class="reward-icon">📜</span>
                                <span class="reward-value">${contents.jutsu.name} (${contents.jutsu.rank}-Rang)</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <button class="chest-close-btn" onclick="this.closest('.chest-result-container').remove()">
                        Hervorragend!
                    </button>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }
};

// Global verfügbar machen
window.RewardSystem = RewardSystem;
