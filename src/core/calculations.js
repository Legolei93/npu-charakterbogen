/**
 * CALCULATIONS - Zentrale Berechnungslogik
 * 
 * Alle mathematischen Berechnungen für das Spiel.
 * Reine Funktionen - keine Seiteneffekte.
 */

const Calculations = {
    // ============================================
    // ATTRIBUT-MODIFIKATOREN
    // ============================================
    
    /**
     * Berechnet den Modifikator für einen Attributwert
     * @param {number} value - Der Attributwert (1-30)
     * @returns {number} - Der Modifikator (-2 bis +5)
     */
    getModifier(value) {
        if (value <= 7) return -2;
        if (value <= 9) return -1;
        if (value <= 11) return 0;
        if (value <= 13) return 1;
        if (value <= 15) return 2;
        if (value <= 17) return 3;
        if (value <= 19) return 4;
        return 5;
    },
    
    /**
     * Berechnet alle Modifikatoren für Attribute
     * @param {Object} attrs - Attribute {kk: 12, kon: 10, ...}
     * @returns {Object} - Modifikatoren {kk: 1, kon: 0, ...}
     */
    calculateModifiers(attrs) {
        const mods = {};
        for (const [attr, value] of Object.entries(attrs)) {
            mods[attr] = this.getModifier(value);
        }
        return mods;
    },
    
    // ============================================
    // KAMPFWERTE
    // ============================================
    
    /**
     * Berechnet Initiative
     * @param {Object} mods - Modifikatoren
     * @param {number} [diceRoll=0] - Optionaler Würfelwurf
     * @returns {number} - Initiative-Wert
     */
    calculateInitiative(mods, diceRoll = 0) {
        return 5 + (mods.ges || 0) + (mods.gsw || 0) + (mods.itu || 0) + diceRoll;
    },
    
    /**
     * Berechnet Ausweichen
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Ausweichen-Wert
     */
    calculateAusweichen(mods) {
        return 5 + (mods.ges || 0) + Math.floor((mods.gsw || 0) / 2);
    },
    
    /**
     * Berechnet Angriff
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Angriff-Wert
     */
    calculateAngriff(mods) {
        const kkMod = mods.kk || 0;
        const gesMod = mods.ges || 0;
        return 2 + Math.max(kkMod, gesMod);
    },
    
    /**
     * Berechnet Ninjutsu
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Ninjutsu-Wert
     */
    calculateNinjutsu(mods) {
        return 2 + Math.floor(((mods.int || 0) + (mods.ges || 0)) / 2);
    },
    
    /**
     * Berechnet Taijutsu
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Taijutsu-Wert
     */
    calculateTaijutsu(mods) {
        return (mods.kk || 0) + (mods.ges || 0);
    },
    
    /**
     * Berechnet Genjutsu
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Genjutsu-Wert
     */
    calculateGenjutsu(mods) {
        return (mods.int || 0) + (mods.itu || 0);
    },
    
    // ============================================
    // WIDERSTÄNDE
    // ============================================
    
    /**
     * Berechnet Chakra-Widerstand
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Chakra-Widerstand
     */
    calculateChakraResist(mods) {
        return (mods.kon || 0) + Math.floor((mods.int || 0) / 2);
    },
    
    /**
     * Berechnet Geistigen Widerstand
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Geistiger Widerstand
     */
    calculateGeistResist(mods) {
        return (mods.int || 0) + Math.floor((mods.itu || 0) / 2);
    },
    
    // ============================================
    // HAUPTWERTE
    // ============================================
    
    /**
     * Berechnet HP
     * @param {Object} mods - Modifikatoren
     * @param {number} level - Level
     * @param {number} [diceValue=6] - Würfelwert (1W12 oder fest 6)
     * @returns {number} - HP Maximum
     */
    calculateHP(mods, level, diceValue = 6) {
        return 30 + (mods.kon || 0) + diceValue + ((level - 1) * 5);
    },
    
    /**
     * Berechnet Chakra
     * @param {Object} mods - Modifikatoren
     * @param {number} level - Level
     * @param {number} [diceValue=22] - Würfelwert (2W20 oder fest 22)
     * @returns {number} - Chakra Maximum
     */
    calculateChakra(mods, level, diceValue = 22) {
        return 100 + (mods.kon || 0) + (mods.int || 0) + diceValue + ((level - 1) * 7);
    },
    
    /**
     * Berechnet Stamina
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Stamina-Wert
     */
    calculateStamina(mods) {
        return Math.max(0, 3 + Math.max((mods.kon || 0), (mods.gsw || 0)));
    },
    
    /**
     * Berechnet Wahrnehmung
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Wahrnehmung
     */
    calculateWahrnehmung(mods) {
        return (mods.itu || 0) + (mods.int || 0);
    },
    
    /**
     * Berechnet Bewegungsradius
     * @param {Object} mods - Modifikatoren
     * @returns {number} - Bewegungsradius in Metern
     */
    calculateBewegungsradius(mods) {
        return 10 + Math.max(0, (mods.gsw || 0) * 5);
    },
    
    // ============================================
    // RÜSTUNGSKLASSE
    // ============================================
    
    /**
     * Berechnet Rüstungsklasse
     * @param {number} equipmentBonus - Ausrüstungsbonus
     * @returns {number} - RK-Wert
     */
    calculateRK(equipmentBonus = 0) {
        return 8 + equipmentBonus;
    },
    
    // ============================================
    // LEVEL & ERFahrung
    // ============================================
    
    /**
     * Berechnet benötigte XP für nächstes Level
     * @param {number} level - Aktuelles Level
     * @returns {number} - Benötigte XP
     */
    getXPForLevel(level) {
        return level * 100;
    },
    
    /**
     * Berechnet AP basierend auf Level
     * @param {number} level - Level
     * @returns {number} - AP-Gesamt
     */
    calculateTotalAP(level) {
        return 20 + (level * 5);
    },
    
    // ============================================
    // KAMPF
    // ============================================
    
    /**
     * Berechnet Schaden
     * @param {number} baseDamage - Grundschaden
     * @param {number} strengthMod - Körperkraft-Modifikator
     * @returns {number} - Gesamtschaden
     */
    calculateDamage(baseDamage, strengthMod) {
        return Math.max(1, baseDamage + strengthMod);
    },
    
    /**
     * Berechnet Trefferchance
     * @param {number} attackerValue - Angriffswert
     * @param {number} defenderValue - Verteidigungswert
     * @returns {number} - Trefferchance (0-100)
     */
    calculateHitChance(attackerValue, defenderValue) {
        const diff = attackerValue - defenderValue;
        const baseChance = 50;
        return Math.max(5, Math.min(95, baseChance + (diff * 5)));
    },
    
    // ============================================
    // HILFSFUNKTIONEN
    // ============================================
    
    /**
     * Rundet auf die angegebene Dezimalstelle
     * @param {number} value - Wert
     * @param {number} decimals - Dezimalstellen
     * @returns {number} - Gerundeter Wert
     */
    round(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    },
    
    /**
     * Begrenzt einen Wert zwischen min und max
     * @param {number} value - Wert
     * @param {number} min - Minimum
     * @param {number} max - Maximum
     * @returns {number} - Begrenzter Wert
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

// Global exportieren
window.Calculations = Calculations;

console.log('✅ Calculations System geladen');
