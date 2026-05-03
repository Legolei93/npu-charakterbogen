/**
 * Quest Page Integration
 * Integriert das Quest System v4.0 in die Haupt-App
 */

const QuestPageIntegration = {
    
    /**
     * Initialisiert die Quest-Seite
     */
    init() {
        console.log('[QuestPageIntegration] Initialisiere...');
        
        // Quest-Page Container erstellen wenn nicht vorhanden
        this._ensureQuestPageExists();
        
        // Event Listener
        this._setupEventListeners();
    },
    
    /**
     * Stellt sicher, dass die Quest-Page existiert
     * @private
     */
    _ensureQuestPageExists() {
        let questPage = document.getElementById('quest-page');
        
        if (!questPage) {
            questPage = document.createElement('div');
            questPage.id = 'quest-page';
            questPage.className = 'page hidden';
            questPage.innerHTML = `
                <div class="page-header">
                    <h1>📜 Quest-Board</h1>
                    <p class="subtitle">Wähle deine täglichen Aufgaben</p>
                </div>
                <div id="quest-board-container"></div>
            `;
            
            // Füge zur App hinzu
            const appContainer = document.getElementById('appContainer');
            if (appContainer) {
                appContainer.appendChild(questPage);
            }
        }
    },
    
    /**
     * Setup Event Listener
     * @private
     */
    _setupEventListeners() {
        // Auf Character-Wechsel reagieren
        if (typeof EventBus !== 'undefined') {
            EventBus.on('character:loaded', () => {
                if (this._isQuestPageVisible()) {
                    this.render();
                }
            });
        }
    },
    
    /**
     * Zeigt die Quest-Seite an
     */
    show() {
        // Verstecke alle anderen Seiten
        this._hideAllPages();
        
        // Zeige Quest-Page
        const questPage = document.getElementById('quest-page');
        if (questPage) {
            questPage.classList.remove('hidden');
        }
        
        // Rendere Quest Board
        this.render();
    },
    
    /**
     * Rendert das Quest Board
     */
    render() {
        // Initialisiere Quest Engine wenn nötig
        if (typeof QuestEngine !== 'undefined' && !QuestEngine.state) {
            QuestEngine.init();
        }
        
        // Rendere Quest Board UI
        if (typeof QuestBoardUI !== 'undefined') {
            QuestBoardUI.init();
        }
    },
    
    /**
     * Versteckt alle Seiten
     * @private
     */
    _hideAllPages() {
        const pages = [
            'character-page',
            'inventory-page',
            'jutsu-page',
            'combat-page',
            'quest-page',
            'merchant-page',
            'equipment-page'
        ];
        
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.add('hidden');
            }
        });
    },
    
    /**
     * Prüft ob Quest-Page sichtbar ist
     * @private
     */
    _isQuestPageVisible() {
        const questPage = document.getElementById('quest-page');
        return questPage && !questPage.classList.contains('hidden');
    },
    
    /**
     * Fügt Quest-Button zur Navigation hinzu
     */
    addNavButton() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // Prüfe ob Button bereits existiert
        let questBtn = document.getElementById('quest-nav-btn');
        if (questBtn) return;
        
        // Erstelle Button
        questBtn = document.createElement('button');
        questBtn.id = 'quest-nav-btn';
        questBtn.className = 'nav-btn';
        questBtn.innerHTML = '📜 Quests';
        questBtn.onclick = () => this.show();
        
        // Füge zur Sidebar hinzu
        const characterList = document.getElementById('characterList');
        if (characterList && characterList.parentNode) {
            characterList.parentNode.insertBefore(questBtn, characterList.nextSibling);
        } else {
            sidebar.appendChild(questBtn);
        }
    }
};

// Global verfügbar machen
window.QuestPageIntegration = QuestPageIntegration;

// Automatisch initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuestPageIntegration.init());
} else {
    QuestPageIntegration.init();
}
