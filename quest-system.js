/**
 * QuestSystem Proxy - Backward Compatibility Layer
 * 
 * Diese Datei stellt sicher, dass bestehender Code, der QuestSystem verwendet,
 * weiterhin funktioniert, während intern die neue QuestEngine genutzt wird.
 * 
 * @deprecated Verwende stattdessen direkt QuestEngine
 */

const QuestSystem = {
    
    // === PROXY ZU QUEST ENGINE ===
    
    /**
     * Initialisiert das Quest System
     * (Proxy zu QuestEngine.init)
     */
    init() {
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.init();
        } else {
            console.warn('QuestSystem: QuestEngine nicht verfügbar');
        }
    },
    
    /**
     * Speichert den Quest-Status
     * (Proxy zu QuestEngine.saveState)
     */
    save() {
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.saveState();
        }
    },
    
    /**
     * Lädt den Quest-Status
     * (Proxy zu QuestEngine.loadState)
     */
    load() {
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.loadState();
        }
    },
    
    // === GETTER FÜR STATE ===
    
    /**
     * Gibt aktive Quests zurück
     */
    get activeQuests() {
        return QuestEngine?.state?.activeQuests || [];
    },
    
    /**
     * Gibt abgeschlossene Quests zurück
     */
    get completedQuests() {
        return QuestEngine?.state?.completedQuests || [];
    },
    
    /**
     * Gibt Daily Quests zurück
     */
    get dailyQuests() {
        return QuestEngine?.state?.dailyQuests || [];
    },
    
    /**
     * Gibt das Training Quest zurück
     */
    get trainingQuest() {
        return QuestEngine?.state?.trainingQuest || null;
    },
    
    /**
     * Gibt das Karma zurück
     */
    get karma() {
        return QuestEngine?.state?.karma?.value || 0;
    },
    
    /**
     * Gibt die Reputation zurück
     */
    get reputation() {
        return QuestEngine?.state?.reputation || {};
    },
    
    // === QUEST AKTIONEN ===
    
    /**
     * Nimmt ein Quest an
     * @param {string} questId - Die Quest-ID
     * @returns {boolean}
     */
    acceptQuest(questId) {
        return QuestEngine?.acceptQuest(questId) || false;
    },
    
    /**
     * Schließt ein Quest ab
     * @param {string} questId - Die Quest-ID
     * @returns {boolean}
     */
    completeQuest(questId) {
        return QuestEngine?.completeQuest(questId) || false;
    },
    
    /**
     * Lehnt ein Quest ab
     * @param {string} questId - Die Quest-ID
     */
    rejectQuest(questId) {
        // Entferne aus Daily Quests
        if (QuestEngine?.state?.dailyQuests) {
            QuestEngine.state.dailyQuests = QuestEngine.state.dailyQuests.filter(
                q => q.id !== questId
            );
            QuestEngine.saveState();
        }
    },
    
    /**
     * Aktualisiert Quest-Fortschritt
     * @param {string} questId - Die Quest-ID
     * @param {number} progress - Der Fortschritt (0-100)
     */
    updateQuestProgress(questId, progress) {
    console.log("[QUEST PROGRESS] Quest:", questId, "Objective:", objectiveId);
        const quest = QuestEngine?.state?.activeQuests?.find(q => q.id === questId);
        if (quest) {
            quest.progress = progress;
            QuestEngine.saveState();
        }
    },
    
    /**
     * Prüft ob ein Quest aktiv ist
     * @param {string} questId - Die Quest-ID
     * @returns {boolean}
     */
    isQuestActive(questId) {
        return QuestEngine?.state?.activeQuests?.some(q => q.id === questId) || false;
    },
    
    /**
     * Prüft ob ein Quest abgeschlossen ist
     * @param {string} questId - Die Quest-ID
     * @returns {boolean}
     */
    isQuestCompleted(questId) {
        return QuestEngine?.state?.completedQuests?.some(q => q.id === questId) || false;
    },
    
    // === KARMA & REPUTATION ===
    
    /**
     * Setzt das Karma
     * @param {number} value - Der neue Wert
     */
    setKarma(value) {
        QuestEngine?.setKarma(value);
    },
    
    /**
     * Ändert das Karma
     * @param {number} amount - Die Änderung
     * @param {string} reason - Der Grund
     */
    changeKarma(amount, reason = '') {
        const current = QuestEngine?.state?.karma?.value || 0;
        QuestEngine?.setKarma(current + amount);
    },
    
    /**
     * Gibt die Reputation für einen NPC zurück
     * @param {string} npc - Der NPC-Name
     * @returns {number}
     */
    getReputation(npc) {
        return QuestEngine?.getReputation(npc) || 0;
    },
    
    /**
     * Ändert die Reputation
     * @param {string} npc - Der NPC-Name
     * @param {number} amount - Die Änderung
     */
    changeReputation(npc, amount) {
        if (QuestEngine?.state?.reputation) {
            QuestEngine.state.reputation[npc] = (QuestEngine.state.reputation[npc] || 0) + amount;
            QuestEngine.saveState();
        }
    },
    
    // === WORLD STATES ===
    
    /**
     * Aktiviert einen World State
     * @param {string} state - Der State-Name
     */
    activateWorldState(state) {
        if (QuestEngine?.state?.worldStates) {
            if (!QuestEngine.state.worldStates.active.includes(state)) {
                QuestEngine.state.worldStates.active.push(state);
                QuestEngine.state.worldStates.history.push({
                    state,
                    activated: new Date().toISOString()
                });
                QuestEngine.saveState();
            }
        }
    },
    
    /**
     * Prüft ob ein World State aktiv ist
     * @param {string} state - Der State-Name
     * @returns {boolean}
     */
    isWorldStateActive(state) {
        return QuestEngine?.state?.worldStates?.active?.includes(state) || false;
    },
    
    // === DAILY RESET ===
    
    /**
     * Prüft und führt Daily Reset durch
     */
    checkDailyReset() {
        QuestEngine?.checkDailyReset();
    },
    
    /**
     * Erzwingt einen Daily Reset
     */
    forceDailyReset() {
        if (QuestEngine) {
            QuestEngine.state.lastReset = null;
            QuestEngine.checkDailyReset();
        }
    },
    
    // === DEBUG ===
    
    /**
     * Debug-Informationen
     */
    debug() {
        console.group('QuestSystem (Proxy) Debug');
        console.log('QuestEngine verfügbar:', typeof QuestEngine !== 'undefined');
        console.log('Active Quests:', this.activeQuests.length);
        console.log('Daily Quests:', this.dailyQuests.length);
        console.log('Completed Quests:', this.completedQuests.length);
        console.log('Karma:', this.karma);
        console.groupEnd();
    }
};

// Global verfügbar machen
window.QuestSystem = QuestSystem;
