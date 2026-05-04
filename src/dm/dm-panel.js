import { simulateEvent, processGameEvent, dispatchEvent } from "../core/event-system.js";

/**
 * DM Panel System - Verwaltungs-Dashboard
 * 
 * Layout:
 * - Links: Spielerliste (fix)
 * - Oben: Top-Bar mit Tabs (dominant)
 * - Mitte: Charakter-Grid (Dashboard)
 * - Rechts: Kein leerer Bereich
 */

const DMPanel = {
    currentTab: 'characters',
    selectedPlayer: null,
    selectedCharacter: null,
    activityLog: [],
    blackMarketVisible: false,
    kiraRandomTimer: null,
    kiraNextAppearance: null,
    refreshTimer: null,
    
    init() {
        console.log('=== DM Dashboard initialisiert ===');
        this.loadActivityLog();
        this.initKiraRandomSystem();
        this.initAutoRefresh();
        this.render();
    },
    
    // ============================================
    // HAUPTRENDER - Dashboard Layout
    // ============================================
    
    render() {
        const container = document.getElementById('dmPanelContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="dm-dashboard">
                ${this.renderTopBar()}
                <div class="dm-dashboard-body">
                    ${this.renderLeftSidebar()}
                    ${this.renderMainArea()}
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    },
    
    // ============================================
    // TOP BAR - Dominante Verwaltungsleiste
    // ============================================
    
    renderTopBar() {
        return `
            <div class="dm-top-bar">
                <div class="dm-top-bar-left">
                    <div class="dm-logo">🎲 DM PANEL</div>
                </div>
                <div class="dm-top-bar-tabs">
                    <button class="dm-top-tab ${this.currentTab === 'characters' ? 'active' : ''}" data-tab="characters">
                        👥 Charaktere
                    </button>
                    <button class="dm-top-tab ${this.currentTab === 'quests' ? 'active' : ''}" data-tab="quests">
                        📜 Quest
                    </button>
                    <button class="dm-top-tab ${this.currentTab === 'shop' ? 'active' : ''}" data-tab="shop">
                        🏪 Shop
                    </button>
                    <button class="dm-top-tab ${this.currentTab === 'game' ? 'active' : ''}" data-tab="game">
                        🎮 Spiel
                    </button>
                    <button class="dm-top-tab ${this.currentTab === 'map' ? 'active' : ''}" data-tab="map">
                        🗺️ DND Map
                    </button>
                </div>
                <div class="dm-top-bar-right">
                    <button class="dm-btn-kira ${this.blackMarketVisible ? 'active' : ''}" onclick="DMPanel.toggleBlackMarket()">
                        ${this.blackMarketVisible ? '🌑 Kira SICHTBAR' : '🌕 Kira VERBORGEN'}
                    </button>
                    <button class="dm-btn-logout" onclick="logout()">🚪 Logout</button>
                </div>
            </div>
        `;
    },
    
    // ============================================
    // LINKE SIDEBAR - Spielerliste
    // ============================================
    
    renderLeftSidebar() {
        const players = this.getAllPlayers();
        
        return `
            <div class="dm-left-sidebar">
                <div class="dm-sidebar-header">
                    <h3>Spieler</h3>
                </div>
                <div class="dm-player-list">
                    ${players.map(player => `
                        <div class="dm-player-item ${this.selectedPlayer === player.id ? 'selected' : ''}" 
                             data-player-id="${player.id}">
                            <span class="player-status ${player.online ? 'online' : 'offline'}"></span>
                            <span class="player-name">${player.username}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${this.selectedPlayer ? this.renderPlayerActivityPanel() : ''}
            </div>
        `;
    },
    
    renderPlayerActivityPanel() {
        const player = this.getAllPlayers().find(p => p.id === this.selectedPlayer);
        const activities = this.getActivitiesForPlayer(this.selectedPlayer).slice(0, 10);
        
        return `
            <div class="dm-player-activity-panel">
                <div class="activity-panel-header">
                    <h4>${player?.username || 'Unbekannt'}</h4>
                    <button class="btn-close-activity" onclick="DMPanel.closeActivityPanel()">✕</button>
                </div>
                <div class="activity-list">
                    ${activities.length === 0 ? 
                        '<div class="no-activity">Keine Aktivitäten</div>' :
                        activities.map(a => `
                            <div class="activity-item ${a.type}">
                                <div class="activity-time">${this.formatDateTime(a.timestamp)}</div>
                                <div class="activity-icon">${this.getActivityIcon(a.type)}</div>
                                <div class="activity-text">${a.text}</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    },
    
    // ============================================
    // HAUPTBEREICH - Dashboard Grid
    // ============================================
    
    renderMainArea() {
        switch(this.currentTab) {
            case 'characters':
                return this.renderCharactersDashboard();
            case 'quests':
                return this.renderQuestDashboard();
            case 'shop':
                return this.renderShopDashboard();
            case 'game':
                return this.renderGameDashboard();
            case 'map':
                return this.renderMapDashboard();
            default:
                return this.renderCharactersDashboard();
        }
    },
    
    // ============================================
    // CHARAKTERE DASHBOARD
    // ============================================
    
    renderCharactersDashboard() {
        const characters = this.getAllCharacters();
        
        return `
            <div class="dm-main-area">
                <div class="dm-dashboard-header">
                    <h2>Charakterübersicht</h2>
                    <div class="dm-dashboard-stats">
                        <span>👥 ${characters.length} Charaktere</span>
                        <span>🟢 ${this.getAllPlayers().filter(p => p.online).length} Online</span>
                    </div>
                </div>
                <div class="dm-character-dashboard-grid">
                    ${characters.map(char => this.renderCharacterDashboardCard(char)).join('')}
                </div>
            </div>
        `;
    },
    
    renderCharacterDashboardCard(char) {
        const player = this.getPlayerByCharacterId(char.id);
        const mods = this.calculateMods(char.baseAttributes || {});
        
        // Mini-Charakterbogen Vorschau (wie verkleinerte Charakterseite)
        return `
            <div class="dm-character-sheet-preview" data-character-id="${char.id}" onclick="DMPanel.openCharacterEditor('${char.id}')">
                <div class="sheet-preview-header">
                    <div class="sheet-portrait">${char.portrait || '👤'}</div>
                    <div class="sheet-title">
                        <h4>${char.name || 'Unbenannt'}</h4>
                        <span class="sheet-player">${player ? player.username : 'NPC'}</span>
                    </div>
                </div>
                
                <div class="sheet-preview-main">
                    <div class="sheet-stats-row">
                        <div class="sheet-stat-box">
                            <span class="stat-label">Level</span>
                            <span class="stat-value">${char.level || 1}</span>
                        </div>
                        <div class="sheet-stat-box">
                            <span class="stat-label">Rang</span>
                            <span class="stat-value">${char.rank || 'Genin'}</span>
                        </div>
                        <div class="sheet-stat-box">
                            <span class="stat-label">Clan</span>
                            <span class="stat-value">${char.clan ? char.clan.charAt(0).toUpperCase() + char.clan.slice(1) : '-'}</span>
                        </div>
                    </div>
                    
                    <div class="sheet-resources">
                        <div class="resource-row">
                            <span class="resource-label">❤️ HP</span>
                            <span class="resource-value">${char.stats?.hp?.current || 0}/${char.stats?.hp?.max || 0}</span>
                        </div>
                        <div class="resource-row">
                            <span class="resource-label">⚡ Chakra</span>
                            <span class="resource-value">${char.stats?.chakra?.current || 0}/${char.stats?.chakra?.max || 0}</span>
                        </div>
                        <div class="resource-row">
                            <span class="resource-label">💪 Stamina</span>
                            <span class="resource-value">${char.stats?.stamina || 0}</span>
                        </div>
                    </div>
                    
                    <div class="sheet-attributes-preview">
                        <div class="attr-preview">
                            <span class="attr-name">KK</span>
                            <span class="attr-value">${char.baseAttributes?.kk || 8}</span>
                            <span class="attr-mod ${mods.kk >= 0 ? 'positive' : 'negative'}">${mods.kk >= 0 ? '+' : ''}${mods.kk}</span>
                        </div>
                        <div class="attr-preview">
                            <span class="attr-name">KON</span>
                            <span class="attr-value">${char.baseAttributes?.kon || 8}</span>
                            <span class="attr-mod ${mods.kon >= 0 ? 'positive' : 'negative'}">${mods.kon >= 0 ? '+' : ''}${mods.kon}</span>
                        </div>
                        <div class="attr-preview">
                            <span class="attr-name">GES</span>
                            <span class="attr-value">${char.baseAttributes?.ges || 8}</span>
                            <span class="attr-mod ${mods.ges >= 0 ? 'positive' : 'negative'}">${mods.ges >= 0 ? '+' : ''}${mods.ges}</span>
                        </div>
                        <div class="attr-preview">
                            <span class="attr-name">GSW</span>
                            <span class="attr-value">${char.baseAttributes?.gsw || 8}</span>
                            <span class="attr-mod ${mods.gsw >= 0 ? 'positive' : 'negative'}">${mods.gsw >= 0 ? '+' : ''}${mods.gsw}</span>
                        </div>
                        <div class="attr-preview">
                            <span class="attr-name">INT</span>
                            <span class="attr-value">${char.baseAttributes?.int || 8}</span>
                            <span class="attr-mod ${mods.int >= 0 ? 'positive' : 'negative'}">${mods.int >= 0 ? '+' : ''}${mods.int}</span>
                        </div>
                        <div class="attr-preview">
                            <span class="attr-name">ITU</span>
                            <span class="attr-value">${char.baseAttributes?.itu || 8}</span>
                            <span class="attr-mod ${mods.itu >= 0 ? 'positive' : 'negative'}">${mods.itu >= 0 ? '+' : ''}${mods.itu}</span>
                        </div>
                        <div class="attr-preview">
                            <span class="attr-name">CHA</span>
                            <span class="attr-value">${char.baseAttributes?.cha || 8}</span>
                            <span class="attr-mod ${mods.cha >= 0 ? 'positive' : 'negative'}">${mods.cha >= 0 ? '+' : ''}${mods.cha}</span>
                        </div>
                    </div>
                    
                    <div class="sheet-footer-preview">
                        <span>💰 ${char.ryo || 0} Ryo</span>
                        <span>⭐ ${(char.ap?.total || 0) - (char.ap?.spent || 0)} AP</span>
                        <span>⚡ ${(char.jutsus || []).length} Jutsu</span>
                    </div>
                </div>
                
                <div class="sheet-edit-hint">
                    <span>🖱️ Klicken zum Bearbeiten</span>
                </div>
            </div>
        `;
    },
    
    calculateMods(attrs) {
        const mods = {};
        for (const [attr, value] of Object.entries(attrs)) {
            mods[attr] = this.getModifier(value);
        }
        return mods;
    },
    
    getModifier(value) {
        if (value <= 7) return -2;
        if (value <= 9) return -1;
        if (value <= 11) return 0;
        if (value <= 13) return 1;
        if (value <= 15) return 2;
        if (value <= 17) return 3;
        if (value <= 19) return 4;
        return 5;
    },
    
    // ============================================
    // QUEST DASHBOARD - V4 INTEGRATION
    // ============================================
    
    renderQuestDashboard() {
        // Verwende neue Quest Engine V4
        let questBoard = [];
        let activeQuests = [];
        let completedQuests = [];
        
        if (typeof QuestEngine !== 'undefined' && QuestEngine.state) {
            questBoard = QuestEngine.state.questBoard || [];
            activeQuests = QuestEngine.state.activeQuests || [];
            completedQuests = QuestEngine.state.completedQuests || [];
        }
        
        // Seasonal/Rare Events
        const seasonalEvent = QuestEngine?.state?.seasonalEvent;
        const rareEvent = QuestEngine?.state?.rareEvent;
        
        return `
            <div class="dm-main-area">
                <div class="dm-dashboard-header">
                    <h2>📜 Quest-Verwaltung (v4.0)</h2>
                    <div class="dm-quest-actions">
                        <button class="dm-btn-primary" onclick="DMPanel.generateNewQuestBoard()">🔄 Neue Quests</button>
                        <button class="dm-btn-secondary" onclick="DMPanel.resetDailyQuests()">⏰ Daily Reset</button>
                    </div>
                </div>
                
                ${seasonalEvent ? `
                <div class="dm-event-banner seasonal">
                    🎉 Seasonal Event aktiv: <strong>${seasonalEvent.name}</strong>
                </div>
                ` : ''}
                
                ${rareEvent ? `
                <div class="dm-event-banner rare">
                    ⚡ Rare Event aktiv: <strong>${rareEvent.name}</strong>
                </div>
                ` : ''}
                
                <div class="dm-quest-sections">
                    <div class="dm-quest-section">
                        <h3>📋 Quest Board (${questBoard.length})</h3>
                        <div class="dm-quest-grid">
                            ${questBoard.map(q => this.renderQuestCardV4(q, 'board')).join('')}
                        </div>
                    </div>
                    
                    <div class="dm-quest-section">
                        <h3>🎯 Aktive Quests (${activeQuests.length})</h3>
                        <div class="dm-quest-grid">
                            ${activeQuests.map(q => this.renderQuestCardV4(q, 'active')).join('')}
                        </div>
                    </div>
                    
                    <div class="dm-quest-section">
                        <h3>✅ Abgeschlossen (${completedQuests.length})</h3>
                        <div class="dm-quest-grid">
                            ${completedQuests.slice(-3).map(q => this.renderQuestCardV4(q, 'completed')).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="dm-quest-chains">
                    <h3>⛓️ Quest Chains</h3>
                    <div class="dm-chain-grid">
                        ${this.renderQuestChains()}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderQuestCardV4(quest, type) {
        const difficultyColors = {
            easy: '#4ecca3',
            medium: '#f1c40f',
            hard: '#e67e22',
            very_hard: '#e74c3c'
        };
        
        const statusLabels = {
            board: 'Verfügbar',
            active: 'Aktiv',
            completed: 'Abgeschlossen'
        };
        
        return `
            <div class="dm-quest-card-v4 ${type}" style="--difficulty-color: ${difficultyColors[quest.difficulty] || '#888'}">
                <div class="quest-card-header">
                    <span class="quest-category">${quest.category}</span>
                    <span class="quest-difficulty" style="color: ${difficultyColors[quest.difficulty]}">
                        ${quest.difficulty}
                    </span>
                </div>
                <h4>${quest.title}</h4>
                <p class="quest-desc">${quest.description}</p>
                <div class="quest-meta">
                    <span>👤 ${quest.giver?.name || 'Unbekannt'}</span>
                    <span>⏱️ ${quest.duration} Min</span>
                </div>
                <div class="quest-rewards">
                    <span>⭐ ${quest.rewards?.xp || 0} XP</span>
                    ${quest.rewards?.gold ? `<span>🥇 ${quest.rewards.gold} Gold</span>` : ''}
                    ${quest.rewards?.silver ? `<span>🥈 ${quest.rewards.silver} Silber</span>` : ''}
                </div>
                <div class="quest-status">${statusLabels[type]}</div>
                ${type === 'board' ? `
                <div class="quest-actions">
                    <button onclick="DMPanel.triggerQuest('${quest.id}')">🎯 Trigger</button>
                </div>
                ` : ''}
            </div>
        `;
    },
    
    renderQuestChains() {
        if (typeof QuestEngine === 'undefined' || !QuestEngine.QUEST_CHAINS) {
            return '<p>Quest Chains nicht verfügbar</p>';
        }
        
        const chains = QuestEngine.getAvailableQuestChains();
        
        return chains.map(chain => `
            <div class="dm-chain-card ${chain.isActive ? 'active' : ''} ${chain.isCompleted ? 'completed' : ''}">
                <h4>${chain.name}</h4>
                <p>${chain.description}</p>
                <div class="chain-progress">
                    ${chain.quests.map((q, i) => `
                        <span class="chain-step ${i < (chain.currentQuestIndex || 0) ? 'completed' : ''} ${i === (chain.currentQuestIndex || 0) ? 'current' : ''}">
                            ${i + 1}
                        </span>
                    `).join('')}
                </div>
                ${!chain.isActive && !chain.isCompleted ? `
                <button onclick="DMPanel.startQuestChain('${chain.id}')">⛓️ Starten</button>
                ` : ''}
            </div>
        `).join('');
    },
    
    // Quest Control Methods
    generateNewQuestBoard() {
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.generateQuestBoard();
            
            // Live Sync an alle Spieler (BUG 10 Fix)
            if (typeof LiveSync !== 'undefined') {
                LiveSync.broadcastChange('dm_action', {
                    action: 'quest_board_reset',
                    timestamp: Date.now()
                });
            }
            
            this.render();
        }
    },
    
    resetDailyQuests() {
        if (typeof DMQuestControl !== 'undefined') {
            DMQuestControl.resetDailyQuests();
            
            // Live Sync
            if (typeof LiveSync !== 'undefined') {
                LiveSync.broadcastChange('dm_action', {
                    action: 'daily_reset',
                    timestamp: Date.now()
                });
            }
            
            this.render();
        }
    },
    
    triggerQuest(questId) {
        if (typeof DMQuestControl !== 'undefined') {
            DMQuestControl.triggerStoryQuest();
            
            // Live Sync
            if (typeof LiveSync !== 'undefined') {
                LiveSync.broadcastChange('dm_action', {
                    action: 'quest_added',
                    questId: questId,
                    timestamp: Date.now()
                });
            }
            
            this.render();
        }
    },
    
    startQuestChain(chainId) {
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.startQuestChain(chainId);
            
            // Live Sync
            if (typeof LiveSync !== 'undefined') {
                LiveSync.broadcastChange('dm_action', {
                    action: 'chain_started',
                    chainId: chainId,
                    timestamp: Date.now()
                });
            }
            
            this.render();
        }
    },
    
    // Legacy Support
    renderQuestCard(quest) {
        return this.renderQuestCardV4(quest, 'board');
    },
    
    // ============================================
    // SHOP DASHBOARD
    // ============================================
    
    renderShopDashboard() {
        const merchants = [
            { id: 'taro', name: 'Taro', type: 'Waffenhändler', icon: '⚔️' },
            { id: 'yuki', name: 'Yuki', type: 'Rüstungsschmiedin', icon: '🛡️' },
            { id: 'shin', name: 'Shin', type: 'Allzweckhändler', icon: '📦' },
            { id: 'kira', name: 'Kira', type: 'Schwarzmarkt', icon: '🌑', special: true }
        ];
        
        return `
            <div class="dm-main-area">
                <div class="dm-dashboard-header">
                    <h2>Shop-Verwaltung</h2>
                </div>
                <div class="dm-shop-grid">
                    ${merchants.map(m => this.renderMerchantCard(m)).join('')}
                </div>
                <div class="dm-trust-section">
                    <h3>Spieler-Vertrauen</h3>
                    ${this.renderTrustTable()}
                </div>
            </div>
        `;
    },
    
    renderMerchantCard(merchant) {
        const mood = localStateManager.getItem(`merchant_${merchant.id}_mood`) || 'neutral';
        
        return `
            <div class="dm-merchant-card ${merchant.special ? 'special' : ''}">
                <div class="merchant-icon">${merchant.icon}</div>
                <h4>${merchant.name}</h4>
                <span class="merchant-type">${merchant.type}</span>
                <select class="mood-select" onchange="DMPanel.setMerchantMood('${merchant.id}', this.value)">
                    <option value="friendly" ${mood === 'friendly' ? 'selected' : ''}>😊 Freundlich</option>
                    <option value="neutral" ${mood === 'neutral' ? 'selected' : ''}>😐 Neutral</option>
                    <option value="suspicious" ${mood === 'suspicious' ? 'selected' : ''}>🤨 Misstrauisch</option>
                    <option value="annoyed" ${mood === 'annoyed' ? 'selected' : ''}>😤 Genervt</option>
                    <option value="angry" ${mood === 'angry' ? 'selected' : ''}>😠 Wütend</option>
                </select>
                <button onclick="DMPanel.editMerchantInventory('${merchant.id}')">📦 Sortiment</button>
                ${merchant.id === 'kira' ? `
                    <div class="kira-timer">Nächstes Random: ${this.formatKiraTimer()}</div>
                    <button class="btn-force-kira" onclick="DMPanel.forceKiraAppearance()">🌑 Jetzt erscheinen</button>
                ` : ''}
            </div>
        `;
    },
    
    renderTrustTable() {
        const players = this.getAllPlayers();
        const merchants = ['taro', 'yuki', 'shin', 'kira'];
        
        return `
            <table class="dm-trust-table">
                <thead>
                    <tr>
                        <th>Spieler</th>
                        ${merchants.map(m => `<th>${m.charAt(0).toUpperCase() + m.slice(1)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${players.map(p => `
                        <tr>
                            <td>${p.username}</td>
                            ${merchants.map(m => `
                                <td>
                                    <input type="number" value="${this.getPlayerMerchantTrust(p.id, m)}" 
                                           min="0" max="100"
                                           onchange="DMPanel.setPlayerMerchantTrust('${p.id}', '${m}', this.value)">
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    // ============================================
    // GAME DASHBOARD
    // ============================================
    
    renderGameDashboard() {
        const players = this.getAllPlayersWithCharacters();
        
        return `
            <div class="dm-main-area">
                <div class="dm-dashboard-header">
                    <h2>🎮 Live-Spielübersicht</h2>
                    <button class="dm-btn-primary" onclick="DMPanel.openDNDMap()">🗺️ Zur DND Map</button>
                </div>
                <div class="dm-game-session-grid">
                    ${players.map(p => p.character ? this.renderGameSessionCard(p) : '').join('')}
                </div>
            </div>
        `;
    },
    
    renderGameSessionCard(player) {
        const char = player.character;
        const hpPercent = char.stats?.hp?.max > 0 
            ? Math.round((char.stats.hp.current / char.stats.hp.max) * 100) 
            : 0;
        const chakraPercent = char.stats?.chakra?.max > 0 
            ? Math.round((char.stats.chakra.current / char.stats.chakra.max) * 100) 
            : 0;
        
        // Kleine blaue Live-Karte wie im Screenshot
        return `
            <div class="dm-game-card ${player.online ? 'online' : 'offline'}">
                <div class="game-card-header">
                    <div class="game-card-portrait">
                        ${char.portrait || '👤'}
                        <span class="online-indicator ${player.online ? 'online' : 'offline'}"></span>
                    </div>
                    <div class="game-card-title">
                        <h4>${char.name || 'Unbenannt'}</h4>
                        <span class="game-player-name">${player.username}</span>
                    </div>
                </div>
                
                <div class="game-card-info">
                    <span class="game-level">Lv.${char.level || 1}</span>
                    <span class="game-rank">${char.rank || 'Genin'}</span>
                    <span class="game-clan">${char.clan ? char.clan.charAt(0).toUpperCase() + char.clan.slice(1) : '-'}</span>
                </div>
                
                <div class="game-card-bars">
                    <div class="game-bar">
                        <span class="bar-icon">❤️</span>
                        <div class="game-bar-track">
                            <div class="game-bar-fill hp" style="width: ${hpPercent}%"></div>
                        </div>
                        <span class="bar-value">${char.stats?.hp?.current || 0}</span>
                    </div>
                    <div class="game-bar">
                        <span class="bar-icon">⚡</span>
                        <div class="game-bar-track">
                            <div class="game-bar-fill chakra" style="width: ${chakraPercent}%"></div>
                        </div>
                        <span class="bar-value">${char.stats?.chakra?.current || 0}</span>
                    </div>
                    <div class="game-bar stamina">
                        <span class="bar-icon">💪</span>
                        <span class="bar-value">${char.stats?.stamina || 0} Stamina</span>
                    </div>
                </div>
                
                <div class="game-card-footer">
                    <span class="game-stat" title="Ryo">💰 ${char.ryo || 0}</span>
                    <span class="game-stat" title="Jutsus">⚡ ${(char.jutsus || []).length}</span>
                    <span class="game-stat" title="AP">⭐ ${(char.ap?.total || 0) - (char.ap?.spent || 0)}</span>
                </div>
                
                <div class="game-card-status">
                    <span class="status-badge ${player.online ? 'online' : 'offline'}">
                        ${player.online ? '🟢 Online' : '⚫ Offline'}
                    </span>
                </div>
            </div>
        `;
    },
    
    // ============================================
    // MAP DASHBOARD
    // ============================================
    
    renderMapDashboard() {
        return `
            <div class="dm-main-area">
                <div class="dm-dashboard-header">
                    <h2>DND Map</h2>
                </div>
                <div class="dm-map-placeholder">
                    <div class="map-icon">🗺️</div>
                    <h3>Karte wird implementiert</h3>
                    <p>DM Ansicht: Alle Figuren sichtbar + volle Kontrolle</p>
                    <p>Spieler Ansicht: Nur eigene Figur sichtbar</p>
                </div>
            </div>
        `;
    },
    
    // ============================================
    // EVENT LISTENER
    // ============================================
    
    attachEventListeners() {
        // Top Tabs
        document.querySelectorAll('.dm-top-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.render();
            });
        });
        
        // Spielerliste
        document.querySelectorAll('.dm-player-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const playerId = e.currentTarget.dataset.playerId;
                this.selectedPlayer = this.selectedPlayer === playerId ? null : playerId;
                this.render();
            });
        });
    },
    
    closeActivityPanel() {
        this.selectedPlayer = null;
        this.render();
    },
    
    // ============================================
    // CHARAKTER MANAGER
    // ============================================
    
    openCharacterManager(charId) {
        const char = this.getCharacterById(charId);
        if (!char) return;
        
        this.selectedCharacter = charId;
        
        const modal = document.createElement('div');
        modal.className = 'dm-modal-overlay';
        modal.innerHTML = `
            <div class="dm-character-manager">
                <div class="manager-header">
                    <h2>Charakterverwaltung: ${char.name}</h2>
                    <button class="btn-close" onclick="this.closest('.dm-modal-overlay').remove()">✕</button>
                </div>
                <div class="manager-tabs">
                    <button class="manager-tab active" data-tab="basic">Grunddaten</button>
                    <button class="manager-tab" data-tab="attributes">Attribute</button>
                    <button class="manager-tab" data-tab="stats">Werte</button>
                    <button class="manager-tab" data-tab="equipment">Ausrüstung</button>
                    <button class="manager-tab" data-tab="jutsu">Jutsu</button>
                </div>
                <div class="manager-content">
                    ${this.renderCharacterManagerContent(char, 'basic')}
                </div>
                <div class="manager-actions">
                    <button class="btn-save" onclick="DMPanel.saveCharacterManager('${charId}')">💾 Speichern</button>
                    <button class="btn-cancel" onclick="this.closest('.dm-modal-overlay').remove()">❌ Abbrechen</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.attachManagerListeners(modal, charId);
    },
    
    renderCharacterManagerContent(char, tab) {
        switch(tab) {
            case 'basic':
                return `
                    <div class="manager-section">
                        <div class="form-row">
                            <label>Name:</label>
                            <input type="text" id="mgr-name" value="${char.name || ''}">
                        </div>
                        <div class="form-row">
                            <label>Level:</label>
                            <input type="number" id="mgr-level" value="${char.level || 1}" min="1" max="20">
                        </div>
                        <div class="form-row">
                            <label>Rang:</label>
                            <select id="mgr-rank">
                                <option value="Academy" ${char.rank === 'Academy' ? 'selected' : ''}>Academy</option>
                                <option value="Genin" ${char.rank === 'Genin' || !char.rank ? 'selected' : ''}>Genin</option>
                                <option value="Chunin" ${char.rank === 'Chunin' ? 'selected' : ''}>Chunin</option>
                                <option value="Jonin" ${char.rank === 'Jonin' ? 'selected' : ''}>Jonin</option>
                                <option value="ANBU" ${char.rank === 'ANBU' ? 'selected' : ''}>ANBU</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Clan:</label>
                            <select id="mgr-clan">
                                <option value="" ${!char.clan ? 'selected' : ''}>Keiner</option>
                                <option value="aburame" ${char.clan === 'aburame' ? 'selected' : ''}>Aburame</option>
                                <option value="akimichi" ${char.clan === 'akimichi' ? 'selected' : ''}>Akimichi</option>
                                <option value="hyuga" ${char.clan === 'hyuga' ? 'selected' : ''}>Hyuga</option>
                                <option value="inuzuka" ${char.clan === 'inuzuka' ? 'selected' : ''}>Inuzuka</option>
                                <option value="nara" ${char.clan === 'nara' ? 'selected' : ''}>Nara</option>
                                <option value="uchiha" ${char.clan === 'uchiha' ? 'selected' : ''}>Uchiha</option>
                                <option value="yamanaka" ${char.clan === 'yamanaka' ? 'selected' : ''}>Yamanaka</option>
                            </select>
                        </div>
                    </div>
                `;
            case 'attributes':
                const attrs = char.baseAttributes || {};
                return `
                    <div class="manager-section">
                        ${['kk', 'kon', 'ges', 'gsw', 'int', 'itu', 'cha'].map(attr => `
                            <div class="form-row">
                                <label>${this.getAttrName(attr)}:</label>
                                <input type="number" id="mgr-attr-${attr}" value="${attrs[attr] || 8}" min="1" max="30">
                            </div>
                        `).join('')}
                    </div>
                `;
            case 'stats':
                return `
                    <div class="manager-section">
                        <div class="form-row">
                            <label>HP Current:</label>
                            <input type="number" id="mgr-hp-current" value="${char.stats?.hp?.current || 0}">
                        </div>
                        <div class="form-row">
                            <label>HP Max:</label>
                            <input type="number" id="mgr-hp-max" value="${char.stats?.hp?.max || 0}">
                        </div>
                        <div class="form-row">
                            <label>Chakra Current:</label>
                            <input type="number" id="mgr-chakra-current" value="${char.stats?.chakra?.current || 0}">
                        </div>
                        <div class="form-row">
                            <label>Chakra Max:</label>
                            <input type="number" id="mgr-chakra-max" value="${char.stats?.chakra?.max || 0}">
                        </div>
                        <div class="form-row">
                            <label>Stamina:</label>
                            <input type="number" id="mgr-stamina" value="${char.stats?.stamina || 0}">
                        </div>
                        <div class="form-row">
                            <label>Ryo:</label>
                            <input type="number" id="mgr-ryo" value="${char.ryo || 0}">
                        </div>
                        <div class="form-row">
                            <label>AP Total:</label>
                            <input type="number" id="mgr-ap-total" value="${char.ap?.total || 0}">
                        </div>
                        <div class="form-row">
                            <label>AP Spent:</label>
                            <input type="number" id="mgr-ap-spent" value="${char.ap?.spent || 0}">
                        </div>
                    </div>
                `;
            case 'equipment':
                return `
                    <div class="manager-section">
                        <p class="placeholder-text">Ausrüstungsverwaltung wird geladen...</p>
                    </div>
                `;
            case 'jutsu':
                return `
                    <div class="manager-section">
                        <p class="placeholder-text">Jutsu-Verwaltung wird geladen...</p>
                    </div>
                `;
            default:
                return '';
        }
    },
    
    attachManagerListeners(modal, charId) {
        modal.querySelectorAll('.manager-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                modal.querySelectorAll('.manager-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const char = this.getCharacterById(charId);
                modal.querySelector('.manager-content').innerHTML = 
                    this.renderCharacterManagerContent(char, e.target.dataset.tab);
            });
        });
    },
    
    saveCharacterManager(charId) {
        const char = this.getCharacterById(charId);
        if (!char) return;
        
        // Grunddaten
        char.name = document.getElementById('mgr-name')?.value || char.name;
        char.level = parseInt(document.getElementById('mgr-level')?.value) || char.level;
        char.rank = document.getElementById('mgr-rank')?.value || char.rank;
        char.clan = document.getElementById('mgr-clan')?.value || char.clan;
        
        // Attribute
        char.baseAttributes = char.baseAttributes || {};
        ['kk', 'kon', 'ges', 'gsw', 'int', 'itu', 'cha'].forEach(attr => {
            const val = document.getElementById(`mgr-attr-${attr}`)?.value;
            if (val) char.baseAttributes[attr] = parseInt(val);
        });
        
        // Werte
        char.stats = char.stats || {};
        char.stats.hp = {
            current: parseInt(document.getElementById('mgr-hp-current')?.value) || char.stats.hp?.current,
            max: parseInt(document.getElementById('mgr-hp-max')?.value) || char.stats.hp?.max
        };
        char.stats.chakra = {
            current: parseInt(document.getElementById('mgr-chakra-current')?.value) || char.stats.chakra?.current,
            max: parseInt(document.getElementById('mgr-chakra-max')?.value) || char.stats.chakra?.max
        };
        char.stats.stamina = parseInt(document.getElementById('mgr-stamina')?.value) || char.stats.stamina;
        
        char.ryo = parseInt(document.getElementById('mgr-ryo')?.value) || char.ryo;
        char.ap = {
            total: parseInt(document.getElementById('mgr-ap-total')?.value) || char.ap?.total,
            spent: parseInt(document.getElementById('mgr-ap-spent')?.value) || char.ap?.spent
        };
        
        this.StateManager.saveState(char);
        
        this.logActivity({
            type: 'edit',
            playerId: this.getPlayerByCharacterId(charId)?.id,
            text: `Charakter "${char.name}" vom DM bearbeitet`,
            timestamp: Date.now()
        });
        
        document.querySelector('.dm-modal-overlay').remove();
        this.render();
    },
    
    getAttrName(attr) {
        const names = {
            kk: 'Körperkraft',
            kon: 'Konstitution',
            ges: 'Geschicklichkeit',
            gsw: 'Geschwindigkeit',
            int: 'Intelligenz',
            itu: 'Intuition',
            cha: 'Charisma'
        };
        return names[attr] || attr;
    },
    
    // ============================================
    // HILFSFUNKTIONEN
    // ============================================
    
    getAllPlayers() {
        if (typeof AuthAPI !== 'undefined' && AuthAPI.PLAYERS_DB) {
            return AuthAPI.PLAYERS_DB.map(p => ({
                id: p.id,
                username: p.username,
                online: this.isPlayerOnline(p.id)
            }));
        }
        const saved = localStateManager.getItem('npu_players');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'p1', username: 'Niklas', online: true },
            { id: 'p2', username: 'Sascha', online: false },
            { id: 'p3', username: 'Richard', online: false },
            { id: 'p4', username: 'Michael', online: false },
            { id: 'p5', username: 'Kevin', online: false }
        ];
    },
    
    isPlayerOnline(playerId) {
        const lastActive = localStateManager.getItem(`player_last_active_${playerId}`);
        if (!lastActive) return false;
        return (Date.now() - parseInt(lastActive)) < (5 * 60 * 1000);
    },
    
    getAllCharacters() {
        const characters = [];
        
        const savedAll = localStateManager.getItem('npu_all_characters');
        if (savedAll) {
            const allChars = JSON.parse(savedAll);
            characters.push(...allChars);
        }
        
        const savedChars = localStateManager.getItem('npu_characters');
        if (savedChars) {
            const chars = JSON.parse(savedChars);
            chars.forEach(char => {
                if (!characters.find(c => c.id === char.id)) {
                    characters.push(char);
                }
            });
        }
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('npu_character_')) {
                try {
                    const char = JSON.parse(localStateManager.getItem(key));
                    if (char && char.id && !characters.find(c => c.id === char.id)) {
                        characters.push(char);
                    }
                } catch (e) {
                    console.warn('Fehler beim Laden von', key);
                }
            }
        }
        
        if (typeof window !== 'undefined' && window.currentCharacter && window.currentCharacter.id) {
            if (!characters.find(c => c.id === window.currentCharacter.id)) {
                characters.push(window.currentCharacter);
            }
        }
        
        return characters;
    },
    
    getCharacterById(id) {
        return this.getAllCharacters().find(c => c.id === id);
    },
    
    StateManager.saveState(char) {
        if (!char || !char.id) return;
        
        const allChars = JSON.parse(localStateManager.getItem('npu_all_characters') || '[]');
        const allIndex = allChars.findIndex(c => c.id === char.id);
        if (allIndex >= 0) allChars[allIndex] = char;
        else allChars.push(char);
        localStateManager.setItem('npu_all_characters', JSON.stringify(allChars));
        
        const chars = JSON.parse(localStateManager.getItem('npu_characters') || '[]');
        const charIndex = chars.findIndex(c => c.id === char.id);
        if (charIndex >= 0) chars[charIndex] = char;
        else chars.push(char);
        localStateManager.setItem('npu_characters', JSON.stringify(chars));
        
        localStateManager.setItem(`npu_character_${char.id}`, JSON.stringify(char));
        
        if (typeof window !== 'undefined' && window.currentCharacter && window.currentCharacter.id === char.id) {
            window.currentCharacter = char;
        }
    },
    
    getPlayerByCharacterId(charId) {
        let assignments = {};
        if (typeof AuthAPI !== 'undefined' && AuthAPI.characterAssignments) {
            assignments = AuthAPI.characterAssignments;
        } else {
            assignments = JSON.parse(localStateManager.getItem('npu_character_assignments') || '{}');
        }
        const playerId = Object.entries(assignments).find(([pid, cid]) => cid === charId)?.[0];
        return playerId ? this.getAllPlayers().find(p => p.id === playerId) : null;
    },
    
    getAllPlayersWithCharacters() {
        const players = this.getAllPlayers();
        const chars = this.getAllCharacters();
        let assignments = {};
        if (typeof AuthAPI !== 'undefined' && AuthAPI.characterAssignments) {
            assignments = AuthAPI.characterAssignments;
        } else {
            assignments = JSON.parse(localStateManager.getItem('npu_character_assignments') || '{}');
        }
        
        return players.map(p => {
            const charId = assignments[p.id];
            const char = charId ? chars.find(c => c.id === charId) : null;
            if (!char) {
                const playerChar = chars.find(c => 
                    c.name && c.name.toLowerCase().includes(p.username.toLowerCase())
                );
                if (playerChar) return { ...p, character: playerChar };
            }
            return { ...p, character: char };
        });
    },
    
    getAllQuests() {
        const saved = localStateManager.getItem('npu_quests');
        return saved ? JSON.parse(saved) : [
            { id: 'q1', title: 'Erste Mission', rank: 'D', active: true, description: 'Test Quest', reward: { xp: 100, ryo: 50 } },
            { id: 'q2', title: 'Banditen jagen', rank: 'C', active: false, description: 'Test Quest 2', reward: { xp: 200, ryo: 100 } }
        ];
    },
    
    getPlayerMerchantTrust(playerId, merchantId) {
        const key = `trust_${playerId}_${merchantId}`;
        return parseInt(localStateManager.getItem(key) || '20');
    },
    
    setPlayerMerchantTrust(playerId, merchantId, value) {
        const key = `trust_${playerId}_${merchantId}`;
        localStateManager.setItem(key, value);
        this.logActivity({
            type: 'shop',
            playerId: playerId,
            text: `Vertrauen bei ${merchantId} auf ${value} gesetzt`,
            timestamp: Date.now()
        });
    },
    
    // ============================================
    // AKTIVITÄTSLOG
    // ============================================
    
    loadActivityLog() {
        const saved = localStateManager.getItem('dm_activity_log');
        this.activityLog = saved ? JSON.parse(saved) : [];
    },
    
    saveActivityLog() {
        localStateManager.setItem('dm_activity_log', JSON.stringify(this.activityLog));
    },
    
    logActivity(activity) {
        this.activityLog.unshift(activity);
        if (this.activityLog.length > 500) {
            this.activityLog = this.activityLog.slice(0, 500);
        }
        this.saveActivityLog();
    },
    
    getActivitiesForPlayer(playerId) {
        if (!playerId) return this.activityLog;
        return this.activityLog.filter(a => a.playerId === playerId);
    },
    
    getActivityIcon(type) {
        const icons = {
            shop: '🛒', quest: '📜', combat: '⚔️', levelup: '⬆️',
            edit: '✏️', inventory: '🎒', money: '💰', jutsu: '⚡'
        };
        return icons[type] || '📝';
    },
    
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('de-DE', { 
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        });
    },
    
    // ============================================
    // AUTO REFRESH
    // ============================================
    
    initAutoRefresh() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.refreshTimer = setInterval(() => {
            if (this.currentTab === 'characters' || this.currentTab === 'game') {
                const currentHash = this.getCharactersHash();
                if (currentHash !== this.lastCharactersHash) {
                    this.lastCharactersHash = currentHash;
                    this.render();
                }
            }
        }, 5000);
    },
    
    getCharactersHash() {
        const chars = this.getAllCharacters();
        return chars.map(c => `${c.id}:${c.stats?.hp?.current}:${c.stats?.chakra?.current}`).join('|');
    },
    
    // ============================================
    // SCHWARZMARKT
    // ============================================
    
    toggleBlackMarket() {
        this.blackMarketVisible = !this.blackMarketVisible;
        localStateManager.setItem('dm_blackmarket_visible', this.blackMarketVisible);
        window.dispatchEvent(new CustomEvent('blackmarketVisibilityChanged', {
            detail: { visible: this.blackMarketVisible }
        }));
        this.render();
    },
    
    initKiraRandomSystem() {
        const saved = localStateManager.getItem('kira_next_appearance');
        if (saved) {
            this.kiraNextAppearance = parseInt(saved);
        } else {
            this.scheduleNextKiraAppearance();
        }
        this.kiraRandomTimer = setInterval(() => this.checkKiraAppearance(), 5 * 60 * 1000);
    },
    
    scheduleNextKiraAppearance() {
        const days = 3 + Math.random() * 4;
        this.kiraNextAppearance = Date.now() + (days * 24 * 60 * 60 * 1000);
        localStateManager.setItem('kira_next_appearance', this.kiraNextAppearance);
    },
    
    checkKiraAppearance() {
        if (this.kiraNextAppearance && Date.now() >= this.kiraNextAppearance) {
            this.blackMarketVisible = true;
            localStateManager.setItem('dm_blackmarket_visible', true);
            this.logActivity({
                type: 'shop',
                text: 'Kira ist zufällig erschienen',
                timestamp: Date.now()
            });
            this.scheduleNextKiraAppearance();
            this.render();
        }
    },
    
    forceKiraAppearance() {
        this.blackMarketVisible = true;
        localStateManager.setItem('dm_blackmarket_visible', true);
        this.logActivity({
            type: 'shop',
            text: 'Kira vom DM manuell erscheinen lassen',
            timestamp: Date.now()
        });
        this.render();
    },
    
    formatKiraTimer() {
        if (!this.kiraNextAppearance) return 'Unbekannt';
        const diff = this.kiraNextAppearance - Date.now();
        if (diff <= 0) return 'Jetzt!';
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return `${days}d ${hours}h`;
    },
    
    setMerchantMood(merchantId, mood) {
        localStateManager.setItem(`merchant_${merchantId}_mood`, mood);
        this.logActivity({
            type: 'shop',
            text: `Händler ${merchantId} Stimmung auf "${mood}" gesetzt`,
            timestamp: Date.now()
        });
    },
    
    // ============================================
    // PLATZHALTER AKTIONEN
    // ============================================
    
    createNewQuest() { alert('Neue Quest erstellen...'); },
    toggleQuest(questId, active) {
        this.logActivity({ type: 'quest', text: `Quest ${questId} ${active ? 'aktiviert' : 'deaktiviert'}`, timestamp: Date.now() });
    },
    editQuest(questId) { alert('Quest bearbeiten: ' + questId); },
    setQuestTrigger(questId) { alert('Trigger für Quest ' + questId); },
    editMerchantInventory(merchantId) {
        const inventory = this.getMerchantInventory(merchantId);
        const merchantNames = {
            taro: 'Taro (Waffenhändler)',
            yuki: 'Yuki (Rüstungsschmiedin)',
            shin: 'Shin (Allzweckhändler)',
            kira: 'Kira (Schwarzmarkt)'
        };
        
        const modal = document.createElement('div');
        modal.className = 'dm-modal-overlay';
        modal.innerHTML = `
            <div class="dm-inventory-manager">
                <div class="inventory-header">
                    <h2>📦 Sortiment: ${merchantNames[merchantId]}</h2>
                    <button class="btn-close" onclick="this.closest('.dm-modal-overlay').remove()">✕</button>
                </div>
                <div class="inventory-content">
                    <div class="inventory-categories">
                        ${Object.entries(inventory).map(([category, items]) => `
                            <div class="inventory-category">
                                <h4>${this.getCategoryName(category)}</h4>
                                <div class="inventory-items">
                                    ${items.map(item => `
                                        <div class="inventory-item ${item.available ? 'available' : 'unavailable'}">
                                            <div class="item-info">
                                                <span class="item-name">${item.name}</span>
                                                <span class="item-price">${item.price} Ryo</span>
                                                ${item.description ? `<span class="item-desc">${item.description}</span>` : ''}
                                            </div>
                                            <div class="item-controls">
                                                <input type="number" value="${item.price}" 
                                                       onchange="DMPanel.updateItemPrice('${merchantId}', '${item.id}', this.value)"
                                                       class="price-input">
                                                <label class="toggle-availability">
                                                    <input type="checkbox" ${item.available ? 'checked' : ''}
                                                           onchange="DMPanel.toggleItemAvailability('${merchantId}', '${item.id}', this.checked)">
                                                    <span>Verfügbar</span>
                                                </label>
                                                <button class="btn-delete-item" onclick="DMPanel.deleteItem('${merchantId}', '${item.id}')" title="Löschen">🗑️</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="inventory-actions">
                    <button class="btn-add-item" onclick="DMPanel.showAddItemForm('${merchantId}')">➕ Neuer Gegenstand</button>
                    <button class="btn-save" onclick="DMPanel.saveMerchantInventory('${merchantId}')">💾 Speichern</button>
                    <button class="btn-cancel" onclick="this.closest('.dm-modal-overlay').remove()">❌ Schließen</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    getMerchantInventory(merchantId) {
        // Lade gespeichertes Inventar oder erstelle Standard
        const saved = localStateManager.getItem(`merchant_inventory_${merchantId}`);
        if (saved) return JSON.parse(saved);
        
        // Standard-Inventare basierend auf Händlertyp
        const defaultInventories = {
            taro: {
                weapons: [
                    { id: 'kunai', name: 'Kunai', price: 15, available: true },
                    { id: 'shuriken', name: 'Shuriken (3x)', price: 20, available: true },
                    { id: 'katana', name: 'Katana', price: 150, available: true },
                    { id: 'tanto', name: 'Tanto', price: 80, available: true },
                    { id: 'bokken', name: 'Bokken', price: 25, available: true },
                    { id: 'chakra_kunai', name: 'Chakra-Kunai', price: 45, available: true },
                    { id: 'explosive_kunai', name: 'Explosives Kunai', price: 75, available: true }
                ],
                tools: [
                    { id: 'smoke_bomb', name: 'Rauchbombe', price: 30, available: true },
                    { id: 'flash_bomb', name: 'Blitzkugel', price: 35, available: true },
                    { id: 'explosive_tag', name: 'Explosionskugel', price: 50, available: true },
                    { id: 'rope', name: 'Ninja-Seil (20m)', price: 10, available: true }
                ]
            },
            yuki: {
                armor: [
                    { id: 'leather_armor', name: 'Leder-Rüstung', price: 100, available: true },
                    { id: 'chain_shirt', name: 'Kettenhemd', price: 250, available: true },
                    { id: 'scale_armor', name: 'Schuppenpanzer', price: 200, available: true },
                    { id: 'chunin_vest', name: 'Chunin-Weste', price: 150, available: true },
                    { id: 'jonin_vest', name: 'Jonin-Weste', price: 300, available: true },
                    { id: 'anbu_armor', name: 'Anbu-Panzer', price: 400, available: true }
                ],
                accessories: [
                    { id: 'arm_guards_leather', name: 'Arm-Schienen (Leder)', price: 30, available: true },
                    { id: 'arm_guards_metal', name: 'Arm-Schienen (Metall)', price: 60, available: true },
                    { id: 'leg_guards_leather', name: 'Bein-Schienen (Leder)', price: 30, available: true },
                    { id: 'leg_guards_metal', name: 'Bein-Schienen (Metall)', price: 60, available: true },
                    { id: 'headband', name: 'Stirnband (Konoha)', price: 15, available: true },
                    { id: 'anbu_mask', name: 'Anbu-Maske', price: 50, available: true }
                ]
            },
            shin: {
                consumables: [
                    { id: 'heal_small', name: 'Heiltrank (klein)', price: 25, available: true },
                    { id: 'heal_medium', name: 'Heiltrank (mittel)', price: 50, available: true },
                    { id: 'chakra_pill', name: 'Chakra-Tablette', price: 40, available: true },
                    { id: 'antidote', name: 'Antidot', price: 30, available: true },
                    { id: 'bandages', name: 'Bandagen', price: 5, available: true }
                ],
                supplies: [
                    { id: 'scroll_empty', name: 'Schriftrolle (leer)', price: 20, available: true },
                    { id: 'water_flask', name: 'Feldflasche', price: 8, available: true },
                    { id: 'rations', name: 'Proviant (3 Tage)', price: 15, available: true },
                    { id: 'bedroll', name: 'Bettrolle', price: 10, available: true },
                    { id: 'map', name: 'Karte (Region)', price: 25, available: true },
                    { id: 'compass', name: 'Kompass', price: 12, available: true }
                ],
                tools: [
                    { id: 'sharpening_stone', name: 'Schleifstein', price: 15, available: true },
                    { id: 'binoculars', name: 'Fernglas', price: 35, available: true },
                    { id: 'rope', name: 'Seil (20m)', price: 10, available: true }
                ]
            },
            kira: {
                illegal: [
                    { id: 'poison_weak', name: 'Gift (schwach)', price: 100, available: true },
                    { id: 'poison_strong', name: 'Gift (stark)', price: 250, available: true },
                    { id: 'lockpick', name: 'Dietriche', price: 50, available: true },
                    { id: 'forbidden_scroll', name: 'Verbotene Schriftrolle', price: 500, available: true }
                ],
                black_market: [
                    { id: 'stolen_katana', name: 'Gestohlenes Katana', price: 80, available: true },
                    { id: 'illegal_armor', name: 'Schwarzmarkt Rüstung', price: 120, available: true },
                    { id: 'chakra_drug', name: 'Chakra-Droge', price: 200, available: true },
                    { id: 'info_scroll', name: 'Geheime Informationen', price: 150, available: true }
                ]
            }
        };
        
        return defaultInventories[merchantId] || {};
    },
    
    getCategoryName(category) {
        const names = {
            weapons: '⚔️ Waffen',
            tools: '🛠️ Werkzeuge',
            armor: '🛡️ Rüstungen',
            accessories: '💍 Zubehör',
            consumables: '🧪 Verbrauchsgegenstände',
            supplies: '📦 Vorräte',
            illegal: '☠️ Illegale Waren',
            black_market: '🌑 Schwarzmarkt'
        };
        return names[category] || category;
    },
    
    updateItemPrice(merchantId, itemId, newPrice) {
        const inventory = this.getMerchantInventory(merchantId);
        for (const category in inventory) {
            const item = inventory[category].find(i => i.id === itemId);
            if (item) {
                item.price = parseInt(newPrice);
                break;
            }
        }
        localStateManager.setItem(`merchant_inventory_${merchantId}`, JSON.stringify(inventory));
    },
    
    toggleItemAvailability(merchantId, itemId, available) {
        const inventory = this.getMerchantInventory(merchantId);
        for (const category in inventory) {
            const item = inventory[category].find(i => i.id === itemId);
            if (item) {
                item.available = available;
                break;
            }
        }
        localStateManager.setItem(`merchant_inventory_${merchantId}`, JSON.stringify(inventory));
    },
    
    saveMerchantInventory(merchantId) {
        this.logActivity({
            type: 'shop',
            text: `Sortiment für ${merchantId} aktualisiert`,
            timestamp: Date.now()
        });
        document.querySelector('.dm-modal-overlay').remove();
    },
    
    showAddItemForm(merchantId) {
        const categories = this.getAvailableCategories(merchantId);
        
        const form = document.createElement('div');
        form.className = 'dm-modal-overlay';
        form.innerHTML = `
            <div class="dm-add-item-form">
                <div class="form-header">
                    <h3>➕ Neuer Gegenstand hinzufügen</h3>
                    <button class="btn-close" onclick="this.closest('.dm-modal-overlay').remove()">✕</button>
                </div>
                <div class="form-body">
                    <div class="form-row">
                        <label>Name:</label>
                        <input type="text" id="new-item-name" placeholder="z.B. Legendäres Schwert">
                    </div>
                    <div class="form-row">
                        <label>Kategorie:</label>
                        <select id="new-item-category">
                            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Preis (Ryo):</label>
                        <input type="number" id="new-item-price" placeholder="100" min="1">
                    </div>
                    <div class="form-row">
                        <label>Beschreibung:</label>
                        <textarea id="new-item-desc" placeholder="Optionale Beschreibung..."></textarea>
                    </div>
                    <div class="form-row">
                        <label>
                            <input type="checkbox" id="new-item-available" checked>
                            Sofort verfügbar
                        </label>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn-save" onclick="DMPanel.addNewItem('${merchantId}')">➕ Hinzufügen</button>
                    <button class="btn-cancel" onclick="this.closest('.dm-modal-overlay').remove()">❌ Abbrechen</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(form);
    },
    
    getAvailableCategories(merchantId) {
        const categories = {
            taro: [
                { id: 'weapons', name: '⚔️ Waffen' },
                { id: 'tools', name: '🛠️ Werkzeuge' }
            ],
            yuki: [
                { id: 'armor', name: '🛡️ Rüstungen' },
                { id: 'accessories', name: '💍 Zubehör' }
            ],
            shin: [
                { id: 'consumables', name: '🧪 Verbrauchsgegenstände' },
                { id: 'supplies', name: '📦 Vorräte' },
                { id: 'tools', name: '🛠️ Werkzeuge' }
            ],
            kira: [
                { id: 'illegal', name: '☠️ Illegale Waren' },
                { id: 'black_market', name: '🌑 Schwarzmarkt' }
            ]
        };
        return categories[merchantId] || [];
    },
    
    addNewItem(merchantId) {
        const name = document.getElementById('new-item-name').value.trim();
        const category = document.getElementById('new-item-category').value;
        const price = parseInt(document.getElementById('new-item-price').value);
        const description = document.getElementById('new-item-desc').value.trim();
        const available = document.getElementById('new-item-available').checked;
        
        if (!name || !price || price < 1) {
            alert('Bitte Name und gültigen Preis eingeben!');
            return;
        }
        
        const inventory = this.getMerchantInventory(merchantId);
        
        // Erstelle eindeutige ID
        const itemId = 'custom_' + Date.now();
        
        // Neues Item erstellen
        const newItem = {
            id: itemId,
            name: name,
            price: price,
            available: available,
            description: description,
            isCustom: true
        };
        
        // Zur Kategorie hinzufügen
        if (!inventory[category]) {
            inventory[category] = [];
        }
        inventory[category].push(newItem);
        
        // Speichern
        localStateManager.setItem(`merchant_inventory_${merchantId}`, JSON.stringify(inventory));
        
        // Log
        this.logActivity({
            type: 'shop',
            text: `Neuer Gegenstand "${name}" zu ${merchantId} hinzugefügt`,
            timestamp: Date.now()
        });
        
        // Formular schließen und Inventar neu laden
        document.querySelector('.dm-modal-overlay').remove();
        this.editMerchantInventory(merchantId);
    },
    
    deleteItem(merchantId, itemId) {
        if (!confirm('Diesen Gegenstand wirklich löschen?')) return;
        
        const inventory = this.getMerchantInventory(merchantId);
        
        for (const category in inventory) {
            const index = inventory[category].findIndex(i => i.id === itemId);
            if (index >= 0) {
                const itemName = inventory[category][index].name;
                inventory[category].splice(index, 1);
                
                localStateManager.setItem(`merchant_inventory_${merchantId}`, JSON.stringify(inventory));
                
                this.logActivity({
                    type: 'shop',
                    text: `Gegenstand "${itemName}" aus ${merchantId} entfernt`,
                    timestamp: Date.now()
                });
                
                // Neu laden
                this.editMerchantInventory(merchantId);
                return;
            }
        }
    },
    quickEditHP(playerId) { 
        const val = prompt('Neuer HP-Wert:');
        if (val) this.logActivity({ type: 'combat', playerId, text: `HP auf ${val} gesetzt`, timestamp: Date.now() });
    },
    quickEditChakra(playerId) { 
        const val = prompt('Neuer Chakra-Wert:');
        if (val) this.logActivity({ type: 'combat', playerId, text: `Chakra auf ${val} gesetzt`, timestamp: Date.now() });
    },
    teleportPlayer(playerId) { alert('Spieler ' + playerId + ' teleportieren'); },
    openDNDMap() { this.currentTab = 'map'; this.render(); }
};

window.DMPanel = DMPanel;
