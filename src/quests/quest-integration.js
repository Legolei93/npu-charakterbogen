/**
 * Quest System v4.0 Integration
 * Verbindet das neue Quest System mit der bestehenden App
 */

const QuestSystemIntegration = {
    
    /**
     * Initialisiert die Quest System Integration
     */
    init() {
        console.log('[QuestSystemIntegration] Initialisiere Quest System v4.0...');
        
        // Quest Engine initialisieren
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.init();
        }
        
        // Training System initialisieren
        if (typeof TrainingSystem !== 'undefined') {
            TrainingSystem.init();
        }
        
        // Karma System initialisieren
        if (typeof KarmaSystem !== 'undefined') {
            KarmaSystem.init();
        }
        
        // DM Quest Control initialisieren (nur für DM)
        if (typeof DMQuestControl !== 'undefined' && this._isDM()) {
            DMQuestControl.init();
        }
        
        // Event Listener für Character-Wechsel
        this._setupEventListeners();
        
        console.log('[QuestSystemIntegration] Initialisierung abgeschlossen');
    },
    
    /**
     * Rendert die Quest-Seite
     */
    renderQuestPage() {
        const container = document.getElementById('quest-page');
        if (!container) {
            console.error('[QuestSystemIntegration] Quest-Page Container nicht gefunden');
            return;
        }
        
        // Quest Board UI rendern
        if (typeof QuestBoardUI !== 'undefined') {
            // Container für Quest Board erstellen
            let questBoardContainer = document.getElementById('quest-board-container');
            if (!questBoardContainer) {
                questBoardContainer = document.createElement('div');
                questBoardContainer.id = 'quest-board-container';
                container.appendChild(questBoardContainer);
            }
            
            QuestBoardUI.render();
        }
    },
    
    /**
     * Rendert das DM Quest Panel
     */
    renderDMQuestPanel() {
        if (!this._isDM()) return;
        
        const container = document.getElementById('dm-quest-panel');
        if (!container) return;
        
        if (typeof DMQuestControl !== 'undefined') {
            DMQuestControl.renderPanel();
        }
    },
    
    /**
     * Zeigt das Quest Board als Modal an
     */
    showQuestBoardModal() {
        let modal = document.getElementById('quest-board-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quest-board-modal';
            modal.className = 'modal quest-board-modal';
            modal.innerHTML = `
                <div class="modal-content quest-board-content">
                    <span class="close-btn" onclick="QuestSystemIntegration.closeQuestBoardModal()">&times;</span>
                    <div id="quest-board-container"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'block';
        
        // Quest Board rendern
        if (typeof QuestBoardUI !== 'undefined') {
            QuestBoardUI.init();
        }
    },
    
    /**
     * Schließt das Quest Board Modal
     */
    closeQuestBoardModal() {
        const modal = document.getElementById('quest-board-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Setup Event Listener
     * @private
     */
    _setupEventListeners() {
        // Auf Character-Wechsel reagieren
        if (typeof EventBus !== 'undefined') {
            EventBus.on('character:changed', () => {
                console.log('[QuestSystemIntegration] Character gewechselt, lade Quest-State...');
                if (typeof QuestEngine !== 'undefined') {
                    QuestEngine.loadState();
                }
            });
            
            EventBus.on('character:updated', () => {
                // Quest Board neu rendern wenn sichtbar
                const container = document.getElementById('quest-board-container');
                if (container && typeof QuestBoardUI !== 'undefined') {
                    QuestBoardUI.render();
                }
            });
        }
        
        // Täglicher Reset-Check
        setInterval(() => {
            this._checkDailyReset();
        }, 60000); // Jede Minute prüfen
    },
    
    /**
     * Prüft auf täglichen Reset
     * @private
     */
    _checkDailyReset() {
        const questEngine = window.QuestEngine;
        if (!questEngine) return;
        
        const lastReset = questEngine.state.lastDailyReset;
        if (!lastReset) return;
        
        const lastResetDate = new Date(lastReset);
        const now = new Date();
        
        // Prüfe ob neuer Tag
        if (lastResetDate.getDate() !== now.getDate() ||
            lastResetDate.getMonth() !== now.getMonth() ||
            lastResetDate.getFullYear() !== now.getFullYear()) {
            
            console.log('[QuestSystemIntegration] Täglicher Reset erkannt');
            
            // Reset durchführen
            questEngine.generateDailyQuests();
            questEngine.saveState();
            
            // UI aktualisieren
            if (typeof QuestBoardUI !== 'undefined') {
                QuestBoardUI.render();
            }
            
            // Benachrichtigung
            this._showResetNotification();
        }
    },
    
    /**
     * Zeigt Reset-Benachrichtigung
     * @private
     */
    _showResetNotification() {
        const notification = document.createElement('div');
        notification.className = 'quest-reset-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="icon">🌅</span>
                <span class="message">Neuer Tag! Neue Quests sind verfügbar.</span>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-entfernen nach 10 Sekunden
        setTimeout(() => {
            notification.remove();
        }, 10000);
    },
    
    /**
     * Prüft ob aktueller User DM ist
     * @private
     */
    _isDM() {
        if (typeof AuthSystem !== 'undefined' && AuthSystem.isDM) {
            return AuthSystem.isDM();
        }
        
        // Fallback
        const user = typeof AuthSystem !== 'undefined' ? AuthSystem.getCurrentUser() : null;
        return user?.role === 'dm' || user?.isDM === true;
    },
    
    /**
     * Gibt aktuellen Character zurück
     * @private
     */
    _getCharacter() {
        return window.currentCharacter || 
               (typeof StateManager !== 'undefined' ? StateManager.getCharacter() : null);
    }
};

// Global verfügbar machen
window.QuestSystemIntegration = QuestSystemIntegration;

// Automatisch initialisieren wenn DOM bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        QuestSystemIntegration.init();
    });
} else {
    QuestSystemIntegration.init();
}
