/**
 * Debug Configuration
 * Zentrale Steuerung für Debug-Output
 */

const DebugConfig = {
    // Master-Schalter für Debug-Modus
    ENABLED: false,  // In Produktion auf false setzen!
    
    // Fein-granulare Kontrolle
    MODULES: {
        TRAINING: false,
        QUEST: false,
        COMBAT: false,
        SAVE: false,
        UI: false,
        DM: false,
        JUTSU: false
    },
    
    /**
     * Loggt Nachricht wenn Debug aktiviert
     */
    log(module, ...args) {
        if (this.ENABLED && this.MODULES[module]) {
            console.log(`[${module}]`, ...args);
        }
    },
    
    /**
     * Loggt Fehler immer (auch ohne Debug)
     */
    error(module, ...args) {
        console.error(`[${module}]`, ...args);
    },
    
    /**
     * Aktiviert/Deaktiviert Debug-Modus
     */
    setEnabled(enabled) {
        this.ENABLED = enabled;
        console.log(`[DebugConfig] Debug mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
    },
    
    /**
     * Aktiviert bestimmtes Modul
     */
    enableModule(module) {
        this.MODULES[module] = true;
    }
};

// Global verfügbar machen
window.DebugConfig = DebugConfig;

// Automatisch aus URL-Parameter aktivieren
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('debug') === 'true') {
    DebugConfig.setEnabled(true);
    DebugConfig.MODULES.TRAINING = true;
    DebugConfig.MODULES.QUEST = true;
}
