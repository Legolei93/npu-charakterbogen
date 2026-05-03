/**
 * EventBus v4.0 - Zentrales Event-System
 * 
 * Features:
 * - Publish/Subscribe Pattern
 * - Event-Prioritäten
 * - Einmalige Listener
 * - Asynchrone Events
 */

const EventBus = {
    
    // === STATE ===
    _listeners: new Map(),
    _onceListeners: new Map(),
    _history: [],
    _maxHistory: 100,
    
    // === KONFIGURATION ===
    CONFIG: {
        DEBUG: false,
        ASYNC_TIMEOUT: 5000
    },
    
    // === PUBLIC API ===
    
    /**
     * Registriert einen Event-Listener
     * @param {string} event - Event-Name
     * @param {Function} callback - Callback-Funktion
     * @param {Object} options - Optionen (priority, once, async)
     * @returns {Function} - Unsubscribe-Funktion
     */
    on(event, callback, options = {}) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        
        const listener = {
            callback,
            priority: options.priority || 0,
            once: options.once || false,
            async: options.async || false,
            id: this._generateId()
        };
        
        const listeners = this._listeners.get(event);
        listeners.push(listener);
        
        // Nach Priorität sortieren (höhere zuerst)
        listeners.sort((a, b) => b.priority - a.priority);
        
        if (this.CONFIG.DEBUG) {
            console.log(`[EventBus] Listener registriert für "${event}"`, listener);
        }
        
        // Unsubscribe-Funktion zurückgeben
        return () => this.off(event, callback);
    },
    
    /**
     * Registriert einen einmaligen Event-Listener
     * @param {string} event - Event-Name
     * @param {Function} callback - Callback-Funktion
     * @param {Object} options - Optionen
     * @returns {Function} - Unsubscribe-Funktion
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    },
    
    /**
     * Entfernt einen Event-Listener
     * @param {string} event - Event-Name
     * @param {Function} callback - Callback-Funktion
     */
    off(event, callback) {
        if (!this._listeners.has(event)) return;
        
        const listeners = this._listeners.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        
        if (index > -1) {
            listeners.splice(index, 1);
            
            if (this.CONFIG.DEBUG) {
                console.log(`[EventBus] Listener entfernt für "${event}"`);
            }
        }
        
        // Leere Listener-Liste aufräumen
        if (listeners.length === 0) {
            this._listeners.delete(event);
        }
    },
    
    /**
     * Löst ein Event aus
     * @param {string} event - Event-Name
     * @param {*} data - Event-Daten
     * @returns {Promise} - Promise für async Events
     */
    emit(event, data) {
        // In History speichern
        this._addToHistory(event, data);
        
        if (this.CONFIG.DEBUG) {
            console.log(`[EventBus] Event "${event}"`, data);
        }
        
        const listeners = this._listeners.get(event);
        if (!listeners || listeners.length === 0) {
            return Promise.resolve([]);
        }
        
        // Einmalige Listener sammeln
        const onceListeners = [];
        
        // Alle Listener aufrufen
        const results = listeners.map(listener => {
            try {
                if (listener.once) {
                    onceListeners.push(listener);
                }
                
                if (listener.async) {
                    return Promise.resolve(listener.callback(data));
                } else {
                    return listener.callback(data);
                }
            } catch (error) {
                console.error(`[EventBus] Fehler in Listener für "${event}":`, error);
                return Promise.reject(error);
            }
        });
        
        // Einmalige Listener entfernen
        onceListeners.forEach(listener => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        });
        
        return Promise.all(results);
    },
    
    /**
     * Löst ein Event asynchron aus
     * @param {string} event - Event-Name
     * @param {*} data - Event-Daten
     * @returns {Promise}
     */
    async emitAsync(event, data) {
        return this.emit(event, data);
    },
    
    /**
     * Wartet auf ein Event
     * @param {string} event - Event-Name
     * @param {number} timeout - Timeout in ms
     * @returns {Promise}
     */
    waitFor(event, timeout = this.CONFIG.ASYNC_TIMEOUT) {
        return new Promise((resolve, reject) => {
            const unsubscribe = this.once(event, (data) => {
                clearTimeout(timer);
                resolve(data);
            });
            
            const timer = setTimeout(() => {
                unsubscribe();
                reject(new Error(`Timeout waiting for event "${event}"`));
            }, timeout);
        });
    },
    
    // === DEBUGGING ===
    
    /**
     * Gibt alle registrierten Events zurück
     * @returns {Array}
     */
    getRegisteredEvents() {
        return Array.from(this._listeners.keys());
    },
    
    /**
     * Gibt die Anzahl der Listener für ein Event zurück
     * @param {string} event - Event-Name
     * @returns {number}
     */
    getListenerCount(event) {
        const listeners = this._listeners.get(event);
        return listeners ? listeners.length : 0;
    },
    
    /**
     * Gibt die Event-History zurück
     * @returns {Array}
     */
    getHistory() {
        return [...this._history];
    },
    
    /**
     * Aktiviert/Deaktiviert Debug-Modus
     * @param {boolean} enabled
     */
    setDebug(enabled) {
        this.CONFIG.DEBUG = enabled;
    },
    
    /**
     * Löscht alle Listener
     */
    clear() {
        this._listeners.clear();
        this._history = [];
        console.log('[EventBus] Alle Listener gelöscht');
    },
    
    // === PRIVATE METHODEN ===
    
    /**
     * Fügt ein Event zur History hinzu
     * @private
     */
    _addToHistory(event, data) {
        this._history.push({
            event,
            data,
            timestamp: new Date().toISOString()
        });
        
        // History begrenzen
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    },
    
    /**
     * Generiert eine eindeutige ID
     * @private
     */
    _generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Global verfügbar machen
window.EventBus = EventBus;

// Standard-Events dokumentieren
EventBus.EVENTS = {
    // Character Events
    CHARACTER_LOADED: 'character:loaded',
    CHARACTER_CHANGED: 'character:changed',
    CHARACTER_UPDATED: 'character:updated',
    CHARACTER_CLEARED: 'character:cleared',
    
    // Quest Events
    QUEST_ACCEPTED: 'quest:accepted',
    QUEST_STARTED: 'quest:started',
    QUEST_COMPLETED: 'quest:completed',
    QUEST_FAILED: 'quest:failed',
    QUEST_RESET: 'quest:reset',
    
    // Combat Events
    COMBAT_STARTED: 'combat:started',
    COMBAT_ENDED: 'combat:ended',
    COMBAT_VICTORY: 'combat:victory',
    COMBAT_DEFEAT: 'combat:defeat',
    
    // Reward Events
    REWARD_RECEIVED: 'reward:received',
    CHEST_OPENED: 'chest:opened',
    ITEM_RECEIVED: 'item:received',
    JUTSU_RECEIVED: 'jutsu:received',
    
    // Training Events
    TRAINING_STARTED: 'training:started',
    TRAINING_COMPLETED: 'training:completed',
    JUTSU_LEARNED: 'jutsu:learned',
    
    // Karma Events
    KARMA_CHANGED: 'karma:changed',
    REPUTATION_CHANGED: 'reputation:changed',
    TRUST_CHANGED: 'trust:changed',
    
    // UI Events
    UI_REFRESH: 'ui:refresh',
    MODAL_OPENED: 'modal:opened',
    MODAL_CLOSED: 'modal:closed',
    
    // System Events
    ERROR: 'system:error',
    WARNING: 'system:warning',
    INFO: 'system:info'
};

console.log('[EventBus] Initialisiert');
