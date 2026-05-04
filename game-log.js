import { simulateEvent, processGameEvent, dispatchEvent } from "../core/event-system.js";

/**
 * Kampflog und Verlaufssystem
 * Protokolliert alle wichtigen Aktionen im Spiel
 */

const GameLog = {
    logs: [],
    maxLogs: 1000,
    
    /**
     * Initialisiert das Log-System
     */
    init() {
        this.loadLogs();
        console.log('GameLog initialisiert');
    },
    
    /**
     * Lädt gespeicherte Logs
     */
    loadLogs() {
        const saved = localStateManager.getItem('game_logs');
        if (saved) {
            this.logs = JSON.parse(saved);
        }
    },
    
    /**
     * Speichert Logs
     */
    saveLogs() {
        // Begrenze auf maxLogs Einträge
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        localStateManager.setItem('game_logs', JSON.stringify(this.logs));
    },
    
    /**
     * Fügt einen neuen Log-Eintrag hinzu
     */
    add(category, action, details = {}) {
        const entry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            category, // 'combat', 'merchant', 'character', 'dm', 'quest'
            action,
            details,
            characterId: currentCharacter?.id || null,
            characterName: currentCharacter?.name || 'Unbekannt'
        };
        
        this.logs.push(entry);
        this.saveLogs();
        
        // Event auslösen für Live-Updates
        window.dispatchEvent(new CustomEvent('gameLogUpdated', { detail: entry }));
        
        return entry;
    },
    
    /**
     * Kampf-Log
     */
    combat(action, details) {
        return this.add('combat', action, details);
    },
    
    /**
     * Händler-Log
     */
    merchant(action, details) {
        return this.add('merchant', action, details);
    },
    
    /**
     * Charakter-Log
     */
    character(action, details) {
        return this.add('character', action, details);
    },
    
    /**
     * DM-Log
     */
    dm(action, details) {
        return this.add('dm', action, details);
    },
    
    /**
     * Quest-Log
     */
    quest(action, details) {
        return this.add('quest', action, details);
    },
    
    /**
     * Holt Logs mit Filter
     */
    getLogs(filter = {}) {
        let result = [...this.logs];
        
        if (filter.category) {
            result = result.filter(l => l.category === filter.category);
        }
        
        if (filter.characterId) {
            result = result.filter(l => l.characterId === filter.characterId);
        }
        
        if (filter.startDate) {
            result = result.filter(l => new Date(l.timestamp) >= new Date(filter.startDate));
        }
        
        if (filter.endDate) {
            result = result.filter(l => new Date(l.timestamp) <= new Date(filter.endDate));
        }
        
        if (filter.limit) {
            result = result.slice(-filter.limit);
        }
        
        return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    /**
     * Formatiert einen Log-Eintrag für Anzeige
     */
    formatEntry(entry) {
        const date = new Date(entry.timestamp);
        const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        
        const categoryIcons = {
            combat: '⚔️',
            merchant: '🏪',
            character: '👤',
            dm: '👑',
            quest: '📜'
        };
        
        return {
            ...entry,
            formattedTime: time,
            icon: categoryIcons[entry.category] || '📝'
        };
    },
    
    /**
     * Löscht alle Logs
     */
    clear() {
        this.logs = [];
        localStorage.removeItem('game_logs');
    },
    
    /**
     * Exportiert Logs als JSON
     */
    export() {
        return JSON.stringify(this.logs, null, 2);
    },
    
    /**
     * Importiert Logs
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.logs = imported;
            this.saveLogs();
            return true;
        } catch (e) {
            console.error('Fehler beim Importieren:', e);
            return false;
        }
    }
};

// Initialisieren
GameLog.init();

// Automatisches Logging wichtiger Events

// Kampf-Events
window.addEventListener('combatAction', (e) => {
    GameLog.combat(e.detail.action, e.detail);
});

// Händler-Events
window.addEventListener('merchantInteraction', (e) => {
    GameLog.merchant(e.detail.action, e.detail);
});

// Charakter-Events
window.addEventListener('characterUpdate', (e) => {
    GameLog.character(e.detail.action, e.detail);
});

// DM-Events
window.addEventListener('dmAction', (e) => {
    GameLog.dm(e.detail.action, e.detail);
});

// Quest-Events
window.addEventListener('questUpdate', (e) => {
    GameLog.quest(e.detail.action, e.detail);
});
