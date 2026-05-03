/**
 * CORE SYSTEMS - Bereinigte und optimierte Version
 * Kombiniert gemeinsame Funktionalität
 */

// ============================================
// GLOBALE KONFIGURATION
// ============================================

const CONFIG = {
    // Attribute
    ATTRIBUTES: {
        kk: { name: 'Körperkraft', short: 'KK' },
        kon: { name: 'Konstitution', short: 'KON' },
        ges: { name: 'Geschicklichkeit', short: 'GES' },
        gsw: { name: 'Geschwindigkeit', short: 'GSW' },
        itu: { name: 'Intuition', short: 'ITU' },
        int: { name: 'Intelligenz', short: 'INT' },
        cha: { name: 'Charisma', short: 'CHA' }
    },
    
    // Skills mit Attribut-Zuordnung
    SKILLS: {
        athletics: { name: 'Athletik', attrs: ['kk', 'kon', 'ges'] },
        acrobatics: { name: 'Akrobatik', attrs: ['ges', 'ges', 'gsw'] },
        stealth: { name: 'Heimlichkeit', attrs: ['ges', 'ges', 'itu'] },
        sleightOfHand: { name: 'Fingerfertigkeit', attrs: ['ges', 'ges', 'ges'] },
        investigation: { name: 'Untersuchung', attrs: ['itu', 'int', 'int'] },
        perception: { name: 'Wahrnehmung', attrs: ['itu', 'itu', 'itu'] },
        insight: { name: 'Empathie', attrs: ['itu', 'int', 'cha'] },
        survival: { name: 'Überleben', attrs: ['kon', 'itu', 'itu'] },
        medicine: { name: 'Medizin', attrs: ['int', 'int', 'ges'] },
        nature: { name: 'Naturkunde', attrs: ['int', 'int', 'itu'] },
        arcana: { name: 'Arkana', attrs: ['int', 'int', 'int'] },
        deception: { name: 'Täuschung', attrs: ['cha', 'cha', 'itu'] },
        intimidation: { name: 'Einschüchtern', attrs: ['cha', 'kk', 'kon'] },
        performance: { name: 'Darbietung', attrs: ['cha', 'cha', 'ges'] },
        persuasion: { name: 'Überzeugen', attrs: ['cha', 'cha', 'int'] }
    },
    
    // Elemente
    ELEMENTS: {
        neutral: { name: 'Neutral', icon: '⚪' },
        feuer: { name: 'Feuer', icon: '🔥' },
        wasser: { name: 'Wasser', icon: '💧' },
        wind: { name: 'Wind', icon: '🌪️' },
        erde: { name: 'Erde', icon: '🪨' },
        blitz: { name: 'Blitz', icon: '⚡' }
    },
    
    // Ränge
    RANKS: {
        E: { name: 'E-Rang', color: '#90EE90' },
        D: { name: 'D-Rang', color: '#87CEEB' },
        C: { name: 'C-Rang', color: '#FFD700' },
        B: { name: 'B-Rang', color: '#FF8C00' },
        A: { name: 'A-Rang', color: '#DC143C' },
        S: { name: 'S-Rang', color: '#8B008B' }
    },
    
    // Speicher-Keys
    STORAGE_KEYS: {
        USER: 'npu_current_user',
        CHARACTERS: 'npu_character_',
        AUTH: 'npu_auth_system',
        QUEST: 'npu_quest_system',
        DICE: 'npu_dice_history',
        SESSION: 'npu_session_system',
        DEATH_SAVE: 'npu_death_save',
        STATUS_EFFECTS: 'npu_status_effects',
        GAME_LOG: 'npu_game_log'
    }
};

// ============================================
// UTILITIES
// ============================================

const Utils = {
    /** Generiert eine UUID */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /** Formatiert eine Zahl mit Vorzeichen */
    formatMod(value) {
        return value >= 0 ? `+${value}` : value.toString();
    },
    
    /** Berechnet Attribut-Modifikator */
    getModifier(value) {
        return Math.floor((value - 10) / 2);
    },
    
    /** Formatiert Dauer in Minuten */
    formatDuration(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    },
    
    /** Debounce-Funktion */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /** Tiefes Kopieren eines Objekts */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /** Prüft ob ein Objekt leer ist */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },
    
    /** Sicheres Parsen von JSON */
    safeJsonParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch {
            return defaultValue;
        }
    }
};

// ============================================
// STORAGE MANAGER — bereits von src/core/storage.js definiert
// ============================================
// (Übersprungen um const-Redeclaration zu vermeiden)

// ============================================
// EVENT BUS — bereits von src/core/event-bus.js definiert
// ============================================
// (Übersprungen um const-Redeclaration zu vermeiden)

// ============================================
// LOGGER
// ============================================

const Logger = {
    LEVELS: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
    currentLevel: 1,
    
    log(level, message, data = null) {
        if (level < this.currentLevel) return;
        
        const timestamp = new Date().toISOString();
        const levelName = Object.keys(this.LEVELS)[level];
        
        console.log(`[${timestamp}] [${levelName}] ${message}`, data || '');
    },
    
    debug(msg, data) { this.log(0, msg, data); },
    info(msg, data) { this.log(1, msg, data); },
    warn(msg, data) { this.log(2, msg, data); },
    error(msg, data) { this.log(3, msg, data); }
};

// Global verfügbar machen
window.CONFIG = CONFIG;
window.Utils = Utils;
// window.Storage wird von src/core/storage.js gesetzt
window.Logger = Logger;