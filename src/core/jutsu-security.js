/**
 * Jutsu Security System
 * Verhindert Manipulation von Jutsu-Status durch Spieler
 * 
 * Regeln:
 * - Jutsus können nur durch das Level-Up-System gelernt werden
 * - Training → Gelernt nur durch Training-System
 * - Keine direkte Status-Manipulation durch Spieler
 */

const JutsuSecurity = {
    
    /**
     * Validiert Jutsu-Status-Änderungen
     * @param {Object} jutsu - Das Jutsu
     * @param {string} newStatus - Der gewünschte neue Status
     * @param {string} source - Quelle der Änderung ('levelup', 'training', 'dm', 'system')
     * @returns {boolean} - Ob die Änderung erlaubt ist
     */
    validateStatusChange(jutsu, newStatus, source) {
        const currentStatus = jutsu.inTraining ? 'training' : jutsu.learnedDirectly ? 'learned' : 'blocked';
        
        console.log(`[JutsuSecurity] Status-Änderung: ${currentStatus} → ${newStatus} (Quelle: ${source})`);
        
        // Erlaubte Übergänge
        const allowedTransitions = {
            'blocked': {
                'training': ['levelup', 'dm'],      // Nur durch Level-Up oder DM
                'learned': ['levelup', 'dm']        // Direkt lernen nur durch Level-Up oder DM
            },
            'training': {
                'learned': ['training', 'dm'],      // Training → Gelernt nur durch Training-System
                'blocked': ['dm']                   // Zurücksetzen nur durch DM
            },
            'learned': {
                'blocked': ['dm']                   // Zurücksetzen nur durch DM
            }
        };
        
        // Prüfe ob Übergang erlaubt
        const allowedSources = allowedTransitions[currentStatus]?.[newStatus];
        if (!allowedSources || !allowedSources.includes(source)) {
            console.error(`[JutsuSecurity] Übergang ${currentStatus} → ${newStatus} nicht erlaubt für Quelle: ${source}`);
            return false;
        }
        
        return true;
    },
    
    /**
     * Setzt Jutsu-Status (mit Validierung)
     * @param {Object} character - Der Charakter
     * @param {string} jutsuId - Die Jutsu-ID
     * @param {string} newStatus - Der neue Status
     * @param {string} source - Quelle der Änderung
     * @returns {boolean} - Erfolg
     */
    setJutsuStatus(character, jutsuId, newStatus, source) {
        if (!character || !character.jutsus) {
            console.error('[JutsuSecurity] Kein Charakter oder keine Jutsus');
            return false;
        }
        
        const jutsu = character.jutsus.find(j => j.jutsuId === jutsuId);
        if (!jutsu) {
            console.error('[JutsuSecurity] Jutsu nicht gefunden:', jutsuId);
            return false;
        }
        
        // Validiere Änderung
        if (!this.validateStatusChange(jutsu, newStatus, source)) {
            return false;
        }
        
        // Status setzen
        switch (newStatus) {
            case 'learned':
                jutsu.learnedDirectly = true;
                jutsu.inTraining = false;
                jutsu.learnedAt = new Date().toISOString();
                break;
            case 'training':
                jutsu.learnedDirectly = false;
                jutsu.inTraining = true;
                jutsu.trainingStartedAt = new Date().toISOString();
                break;
            case 'blocked':
                jutsu.learnedDirectly = false;
                jutsu.inTraining = false;
                break;
        }
        
        console.log(`[JutsuSecurity] Status geändert: ${jutsu.name} → ${newStatus}`);
        
        // Speichern
        if (typeof AccountSystem !== 'undefined') {
            AccountSystem.saveCharacter(character);
        }
        
        // Event auslösen
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('jutsu:status_changed', { jutsu, newStatus, source });
        }
        
        return true;
    },
    
    /**
     * Vollendet ein Training-Jutsu (durch Training-System)
     * @param {Object} character - Der Charakter
     * @param {string} jutsuId - Die Jutsu-ID
     * @returns {boolean} - Erfolg
     */
    completeTraining(character, jutsuId) {
        return this.setJutsuStatus(character, jutsuId, 'learned', 'training');
    },
    
    /**
     * Prüft ob ein Jutsu verwendet werden kann
     * @param {Object} jutsu - Das Jutsu
     * @returns {boolean}
     */
    canUseJutsu(jutsu) {
        return jutsu.learnedDirectly === true;
    },
    
    /**
     * Schützt vor direkter Manipulation
     * Überschreibt gefährliche Funktionen
     */
    protectAgainstManipulation() {
        // Schütze window.currentCharacter.jutsus
        if (window.currentCharacter) {
            const originalJutsus = window.currentCharacter.jutsus;
            
            Object.defineProperty(window.currentCharacter, 'jutsus', {
                get: () => originalJutsus,
                set: (value) => {
                    console.warn('[JutsuSecurity] Direkte Manipulation von jutsus blockiert!');
                    // Erlaube nur wenn von autorisiertem System
                    const stack = new Error().stack;
                    if (stack && (stack.includes('saveCharacter') || stack.includes('AccountSystem'))) {
                        originalJutsus = value;
                    }
                }
            });
        }
        
        console.log('[JutsuSecurity] Manipulationsschutz aktiviert');
    }
};

// Global verfügbar machen
window.JutsuSecurity = JutsuSecurity;

// Automatisch schützen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => JutsuSecurity.protectAgainstManipulation(), 1000);
    });
} else {
    setTimeout(() => JutsuSecurity.protectAgainstManipulation(), 1000);
}

console.log('[JutsuSecurity] Geladen');
