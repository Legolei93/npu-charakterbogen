/**
 * APP ADAPTER - Kompatibilitätsschicht für Refactoring
 * 
 * Diese Datei stellt sicher, dass alle bestehenden Aufrufe
 * weiterhin funktionieren während des Refactorings.
 * 
 * WICHTIG: Keine Logik hier! Nur Weiterleitungen.
 */

// ============================================
// GLOBALE STATE-ADAPTER
// ============================================

/**
 * Aktueller Charakter - Adapter
 * Liest/Schreibt window.currentCharacter
 */
const AppStateAdapter = {
    get currentCharacter() {
        return window.currentCharacter;
    },
    set currentCharacter(value) {
        window.currentCharacter = value;
    },
    
    get currentUser() {
        return {
            name: document.getElementById('currentUser')?.textContent,
            role: document.getElementById('currentRole')?.textContent
        };
    }
};

// ============================================
// STORAGE-ADAPTER (verwendet neues Storage System)
// ============================================

const StorageAdapter = {
    saveCharacter(char) {
        // Wenn neues Storage-System verfügbar, verwende es
        if (typeof Storage !== 'undefined' && Storage.saveCharacter) {
            return Storage.saveCharacter(char);
        }
        // Fallback: alte globale Funktion
        if (typeof saveCharacter === 'function') {
            return saveCharacter();
        }
        console.warn('Storage: Keine Speichermethode verfügbar');
        return false;
    },
    
    loadCharacters() {
        if (typeof Storage !== 'undefined' && Storage.getAllCharacters) {
            return Storage.getAllCharacters();
        }
        if (typeof loadCharacters === 'function') {
            return loadCharacters();
        }
        return [];
    },
    
    getCharacterById(id) {
        if (typeof Storage !== 'undefined' && Storage.getCharacterById) {
            return Storage.getCharacterById(id);
        }
        const chars = this.getAllCharacters();
        return chars.find(c => c.id === id);
    },
    
    getAllCharacters() {
        if (typeof Storage !== 'undefined' && Storage.getAllCharacters) {
            return Storage.getAllCharacters();
        }
        const saved = localStorage.getItem('npu_characters');
        return saved ? JSON.parse(saved) : [];
    }
};

// ============================================
// BERECHNUNGS-ADAPTER (verwendet neues Calculations System)
// ============================================

const CalculationAdapter = {
    getModifier(value) {
        // Verwende neues Calculations System wenn verfügbar
        if (typeof Calculations !== 'undefined' && Calculations.getModifier) {
            return Calculations.getModifier(value);
        }
        // Fallback
        if (value <= 7) return -2;
        if (value <= 9) return -1;
        if (value <= 11) return 0;
        if (value <= 13) return 1;
        if (value <= 15) return 2;
        if (value <= 17) return 3;
        if (value <= 19) return 4;
        return 5;
    },
    
    calculateModifiers(attrs) {
        if (typeof Calculations !== 'undefined' && Calculations.calculateModifiers) {
            return Calculations.calculateModifiers(attrs);
        }
        const mods = {};
        for (const [attr, value] of Object.entries(attrs)) {
            mods[attr] = this.getModifier(value);
        }
        return mods;
    }
};

// ============================================
// UTILITIES-ADAPTER
// ============================================

const UtilsAdapter = {
    generateId() {
        return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('de-DE');
    },
    
    formatTime(date) {
        return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
};

// ============================================
// EVENT-BUS — wird von src/core/event-bus.js bereitgestellt
// ============================================
// (Keine eigene Definition hier, um const-Redeclaration zu vermeiden)

// ============================================
// GLOBAL EXPORT
// ============================================

window.AppStateAdapter = AppStateAdapter;
window.StorageAdapter = StorageAdapter;
window.CalculationAdapter = CalculationAdapter;
window.UtilsAdapter = UtilsAdapter;

console.log('✅ App Adapter geladen - Refactoring-Kompatibilität aktiv');
