/**
 * Training Lock System
 * Sperrt alle Systeme während aktivem Training
 * Exploit-Schutz
 */

const TrainingLockSystem = {
    
    /**
     * Prüft ob Training aktiv und blockiert Aktion
     * @returns {boolean} - true = blockiert, false = erlaubt
     */
    checkLock(actionName) {
        if (typeof TrainingSystemV3 === 'undefined') return false;
        
        if (TrainingSystemV3.isTrainingActive()) {
            const remaining = TrainingSystemV3.getRemainingTime();
            const formatted = TrainingSystemV3._formatTime(remaining);
            
            alert(`🔒 Training läuft noch: ${formatted}\n\n"${actionName}" ist während des Trainings nicht möglich.`);
            return true;
        }
        
        return false;
    },
    
    /**
     * Wrapper für Funktionen die während Training blockiert sein sollen
     */
    wrapWithLock(originalFunction, actionName) {
        return function(...args) {
            if (TrainingLockSystem.checkLock(actionName)) {
                return { success: false, error: 'Training aktiv' };
            }
            return originalFunction.apply(this, args);
        };
    },
    
    /**
     * Initialisiert Locks für alle Systeme
     */
    initLocks() {
        console.log('[TrainingLockSystem] Initialisiere Locks...');
        
        // 1. Quest System Lock
        this._lockQuestSystem();
        
        // 2. Merchant System Lock
        this._lockMerchantSystem();
        
        // 3. Combat System Lock
        this._lockCombatSystem();
        
        // 4. Character Actions Lock
        this._lockCharacterActions();
        
        console.log('[TrainingLockSystem] Locks initialisiert');
    },
    
    _lockQuestSystem() {
        // Sperre Quest-Auswahl
        if (typeof QuestEngine !== 'undefined') {
            const originalSelectQuest = QuestEngine.selectQuest.bind(QuestEngine);
            QuestEngine.selectQuest = function(questId) {
                if (TrainingLockSystem.checkLock('Quest auswählen')) {
                    return { success: false, error: 'Training aktiv' };
                }
                return originalSelectQuest(questId);
            };
            
            const originalAcceptQuest = QuestEngine.acceptQuest.bind(QuestEngine);
            QuestEngine.acceptQuest = function(questId) {
                if (TrainingLockSystem.checkLock('Quest annehmen')) {
                    return { success: false, error: 'Training aktiv' };
                }
                return originalAcceptQuest(questId);
            };
        }
        
        // Sperre Quest-Board
        if (typeof QuestBoardUI !== 'undefined') {
            const originalRender = QuestBoardUI.render.bind(QuestBoardUI);
            QuestBoardUI.render = function() {
                if (TrainingSystemV3?.isTrainingActive()) {
                    // Zeige Training-Status statt Quest-Board
                    return TrainingSystemV3.renderTrainingStatus();
                }
                return originalRender();
            };
        }
    },
    
    _lockMerchantSystem() {
        // Sperre Merchant
        if (typeof MerchantSystem !== 'undefined') {
            const originalOpen = MerchantSystem.open.bind(MerchantSystem);
            MerchantSystem.open = function() {
                if (TrainingLockSystem.checkLock('Händler')) {
                    return;
                }
                return originalOpen();
            };
        }
        
        // Sperre Shop
        const shopButtons = document.querySelectorAll('.shop-btn, .merchant-btn');
        shopButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (TrainingSystemV3?.isTrainingActive()) {
                    e.preventDefault();
                    e.stopPropagation();
                    TrainingLockSystem.checkLock('Shop');
                }
            }, true);
        });
    },
    
    _lockCombatSystem() {
        // Sperre Kampf-Start
        if (typeof FastCombatSystem !== 'undefined') {
            const originalStart = FastCombatSystem.start.bind(FastCombatSystem);
            FastCombatSystem.start = function(quest) {
                if (TrainingLockSystem.checkLock('Kampf')) {
                    return { success: false, error: 'Training aktiv' };
                }
                return originalStart(quest);
            };
        }
    },
    
    _lockCharacterActions() {
        // Sperre Seiten-Navigation während Training
        const originalShowPage = window.showPage;
        if (originalShowPage) {
            window.showPage = function(pageNum) {
                // Erlaube nur Quest-Seite (für Training-Status)
                if (pageNum !== 7 && TrainingSystemV3?.isTrainingActive()) {
                    TrainingLockSystem.checkLock('Seitenwechsel');
                    // Zeige trotzdem Quest-Seite (mit Training-Status)
                    pageNum = 7;
                }
                return originalShowPage(pageNum);
            };
        }
    },
    
    /**
     * Prüft ob Aktion erlaubt ist (für UI-Disable)
     */
    isActionAllowed() {
        if (typeof TrainingSystemV3 === 'undefined') return true;
        return !TrainingSystemV3.isTrainingActive();
    },
    
    /**
     * Gibt verbleibende Zeit zurück für UI-Anzeige
     */
    getLockStatus() {
        if (typeof TrainingSystemV3 === 'undefined') {
            return { locked: false };
        }
        
        if (!TrainingSystemV3.isTrainingActive()) {
            return { locked: false };
        }
        
        return {
            locked: true,
            remaining: TrainingSystemV3.getRemainingTime(),
            formatted: TrainingSystemV3._formatTime(TrainingSystemV3.getRemainingTime()),
            progress: TrainingSystemV3.getTrainingProgress()
        };
    }
};

// Global verfügbar machen
window.TrainingLockSystem = TrainingLockSystem;

// Initialisieren wenn Training System bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => TrainingLockSystem.initLocks(), 2000);
    });
} else {
    setTimeout(() => TrainingLockSystem.initLocks(), 2000);
}

console.log('[TrainingLockSystem] Geladen');
