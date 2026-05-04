/**
 * Live Sync System v1.0
 * 
 * Ermöglicht Echtzeit-Synchronisation zwischen:
 * - Spieler UI und State
 * - DM Panel und Spieler-Daten
 * - Verschiedenen Browser-Tabs
 * 
 * Löst BUG 6 (Live Aktualisierung) und BUG 10 (DM/Spieler Sync)
 */

const LiveSync = {
    
    // === KONFIGURATION ===
    CONFIG: {
        SYNC_INTERVAL: 1000,      // 1 Sekunde
        STORAGE_KEY: 'npu_live_sync',
        BROADCAST_CHANNEL: 'npu_sync_channel'
    },
    
    // === STATE ===
    lastSync: 0,
    syncTimer: null,
    broadcastChannel: null,
    
    // === INITIALISIERUNG ===
    
    init() {
        console.log('[LiveSync] Initialisiere...');
        
        // BroadcastChannel für Cross-Tab Kommunikation
        this.initBroadcastChannel();
        
        // Storage Event Listener
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
        
        // Automatischer Sync-Loop
        this.startSyncLoop();
        
        console.log('[LiveSync] Initialisiert');
    },
    
    /**
     * Initialisiert BroadcastChannel
     */
    initBroadcastChannel() {
        try {
            this.broadcastChannel = new BroadcastChannel(this.CONFIG.BROADCAST_CHANNEL);
            this.broadcastChannel.onmessage = (event) => {
                this.handleBroadcastMessage(event.data);
            };
        } catch (e) {
            console.warn('[LiveSync] BroadcastChannel nicht unterstützt, verwende Fallback');
        }
    },
    
    // === SYNC LOOP ===
    
    startSyncLoop() {
        this.syncTimer = setInterval(() => {
            this.performSync();
        }, this.CONFIG.SYNC_INTERVAL);
    },
    
    stopSyncLoop() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    },
    
    /**
     * Führt Synchronisation durch
     */
    performSync() {
        // Prüfe auf externe Änderungen
        this.checkExternalChanges();
        
        // Aktualisiere UI
        this.updateUI();
    },
    
    // === EXTERNE ÄNDERUNGEN ===
    
    checkExternalChanges() {
        // Prüfe Character-Änderungen
        const character = this.getCurrentCharacter();
        if (character) {
            const storedHash = localStateManager.getItem(`char_hash_${character.id}`);
            const currentHash = this.hashObject(character);
            
            if (storedHash && storedHash !== currentHash) {
                console.log('[LiveSync] Externe Character-Änderung erkannt');
                this.reloadCharacter();
            }
        }
    },
    
    /**
     * Lädt Character neu
     */
    reloadCharacter() {
        if (typeof AccountSystem !== 'undefined') {
            const char = AccountSystem.getCurrentCharacter();
            if (char) {
                window.currentCharacter = char;
                this.refreshAllUI();
                
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('sync:character_reloaded', char);
                }
            }
        }
    },
    
    // === UI AKTUALISIERUNG ===
    
    updateUI() {
        // Aktualisiere sichtbare Seiten
        const activePage = this.getActivePage();
        
        switch (activePage) {
            case 'character':
                this.updateCharacterPage();
                break;
            case 'inventory':
                this.updateInventoryPage();
                break;
            case 'jutsu':
                this.updateJutsuPage();
                break;
            case 'quest':
                this.updateQuestPage();
                break;
            case 'combat':
                this.updateCombatPage();
                break;
        }
    },
    
    refreshAllUI() {
        this.updateCharacterPage();
        this.updateInventoryPage();
        this.updateJutsuPage();
        this.updateQuestPage();
    },
    
    updateCharacterPage() {
        if (typeof renderCharacter === 'function') {
            renderCharacter();
        }
    },
    
    updateInventoryPage() {
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
    },
    
    updateJutsuPage() {
        if (typeof renderJutsuTable === 'function') {
            renderJutsuTable();
        }
        if (typeof renderJutsuCards === 'function') {
            renderJutsuCards();
        }
    },
    
    updateQuestPage() {
        if (typeof QuestBoardUI !== 'undefined' && QuestBoardUI.render) {
            QuestBoardUI.render();
        }
    },
    
    updateCombatPage() {
        // Combat-Seite aktualisieren
        if (typeof updateCombatUI === 'function') {
            updateCombatUI();
        }
    },
    
    getActivePage() {
        const pages = ['character', 'inventory', 'jutsu', 'combat', 'quest', 'merchant', 'equipment'];
        for (const page of pages) {
            const el = document.getElementById(page + '-page') || document.getElementById('page' + (pages.indexOf(page) + 1));
            if (el && !el.classList.contains('hidden') && el.classList.contains('active')) {
                return page;
            }
        }
        return null;
    },
    
    // === BROADCAST / STORAGE ===
    
    /**
     * Broadcastet Änderung an alle Tabs
     */
    broadcastChange(type, data) {
        const message = {
            type,
            data,
            timestamp: Date.now(),
            source: this.getTabId()
        };
        
        // BroadcastChannel
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }
        
        // Storage Fallback
        localStateManager.setItem(this.CONFIG.STORAGE_KEY, JSON.stringify(message));
    },
    
    handleBroadcastMessage(message) {
        // Ignoriere eigene Nachrichten
        if (message.source === this.getTabId()) return;
        
        console.log('[LiveSync] Broadcast empfangen:', message.type);
        
        switch (message.type) {
            case 'character_updated':
                this.reloadCharacter();
                break;
            case 'quest_completed':
                this.updateQuestPage();
                break;
            case 'combat_update':
                this.updateCombatPage();
                break;
            case 'dm_action':
                this.handleDMAction(message.data);
                break;
        }
    },
    
    handleStorageChange(e) {
        if (e.key === this.CONFIG.STORAGE_KEY) {
            try {
                const message = JSON.parse(e.newValue);
                this.handleBroadcastMessage(message);
            } catch (err) {
                console.error('[LiveSync] Fehler beim Parsen:', err);
            }
        }
    },
    
    // === DM / SPIELER SYNC ===
    
    /**
     * DM sendet Aktion an Spieler
     */
    sendDMAction(action, targetPlayerId, data) {
        if (!this.isDM()) return;
        
        this.broadcastChange('dm_action', {
            action,
            targetPlayerId,
            data,
            dmId: this.getCurrentUserId()
        });
    },
    
    /**
     * Spieler empfängt DM-Aktion
     */
    handleDMAction(data) {
        // Prüfe ob Aktion für diesen Spieler
        if (data.targetPlayerId && data.targetPlayerId !== this.getCurrentUserId()) {
            return;
        }
        
        console.log('[LiveSync] DM Aktion empfangen:', data.action);
        
        switch (data.action) {
            case 'quest_added':
                this.handleQuestAdded(data.data);
                break;
            case 'quest_completed':
                this.handleQuestCompleted(data.data);
                break;
            case 'reward_given':
                this.handleRewardGiven(data.data);
                break;
            case 'character_updated':
                this.reloadCharacter();
                break;
        }
    },
    
    handleQuestAdded(quest) {
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.state.questBoard.unshift(quest);
            QuestEngine.StateManager.saveState();
            this.updateQuestPage();
            
            // Benachrichtigung
            this.showNotification('📜 Neue Quest verfügbar!', quest.title);
        }
    },
    
    handleQuestCompleted(data) {
        this.updateQuestPage();
        this.showNotification('✅ Quest abgeschlossen', data.questTitle);
    },
    
    handleRewardGiven(data) {
        this.reloadCharacter();
        this.showNotification('🎁 Belohnung erhalten!', `${data.xp} XP, ${data.gold} Gold`);
    },
    
    // === NOTIFICATIONS ===
    
    showNotification(title, message) {
        // Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
        
        // In-App Notification
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <div class="sync-notification-content">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    },
    
    // === HILFSMETHODEN ===
    
    getCurrentCharacter() {
        return window.currentCharacter || 
               (typeof AccountSystem !== 'undefined' ? AccountSystem.getCurrentCharacter() : null);
    },
    
    getCurrentUserId() {
        if (typeof AccountSystem !== 'undefined') {
            const user = AccountSystem.getCurrentUser();
            return user?.id;
        }
        return null;
    },
    
    isDM() {
        if (typeof AccountSystem !== 'undefined') {
            return AccountSystem.isDM();
        }
        return false;
    },
    
    getTabId() {
        if (!this._tabId) {
            this._tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this._tabId;
    },
    
    hashObject(obj) {
        return JSON.stringify(obj).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0).toString();
    }
};

// Global verfügbar machen
window.LiveSync = LiveSync;

// Automatisch initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveSync.init());
} else {
    LiveSync.init();
}

console.log('[LiveSync] Geladen');
