/**
 * Skill Modifier Service
 * Zentrale Berechnung von Fertigkeits-Modifikatoren
 */

class SkillModifierService {
  
  /**
   * Wandelt einen Fertigkeitswert in einen Modifikator um
   * @param {number} value - Der berechnete Fertigkeitswert (Durchschnitt)
   * @returns {number} Der Modifikator
   */
  static valueToModifier(value) {
    if (value <= 9) return -1;
    if (value <= 11) return 0;
    if (value <= 13) return 1;
    if (value <= 15) return 2;
    if (value <= 17) return 3;
    if (value <= 19) return 4;
    return 5; // 20+
  }
  
  /**
   * Berechnet den Modifikator für eine Fertigkeit
   * @param {string} skillKey - Schlüssel der Fertigkeit
   * {object} attributes - Attribute des Charakters
   * @returns {object} Basiswert und Modifikator
   */
  static calculateSkillModifier(skillKey, attributes) {
    // Formeln für alle Fertigkeiten
    const formulas = {
      // Körperlich
      athletik: ['kk', 'kon', 'ges'],
      akrobatik: ['kk', 'kk', 'kon'],
      klettern: ['kon', 'kon', 'kk'],
      koerperbeherrschung: ['kon', 'kk', 'gsw'],
      schleichen: ['ges', 'ges', 'itu'],
      verstecken_tarnen: ['itu', 'ges', 'gsw'],
      fingerfertigkeit: ['itu', 'int', 'ges'],
      waffentalent: ['kk', 'ges', 'gsw'],
      
      // Sozial
      menschenkenntnis: ['cha', 'itu'],
      redekunst_verhandeln: ['cha', 'int'],
      beruhigen: ['cha', 'ges'],
      einschuechtern: ['cha', 'kk'],
      manipulieren: ['cha', 'itu'],
      alleinunterhalter: ['cha', 'cha'],
      flirten_verfuehren: ['cha', 'int'],
      
      // Wissen
      naturwissenschaften: ['itu', 'int'],
      ueberlebenstechniken: ['kk', 'kon'],
      pflanzenkunde_alchemie: ['itu', 'int'],
      tierkunde: ['int', 'int'],
      geschichte: ['int', 'int'],
      kriegskunst: ['itu', 'int'],
      handwerk_technologie: ['kon', 'kk'],
      jutsu_wissen: ['kon', 'int'],
      medizin_heilkunst: ['ges', 'int'],
      chakrakontrolle: ['int', 'int', 'kon']
    };
    
    const formula = formulas[skillKey];
    if (!formula) return { baseValue: 8, modifier: -1 };
    
    // Durchschnitt berechnen
    const sum = formula.reduce((acc, attr) => acc + (attributes[attr] || 8), 0);
    const baseValue = Math.floor(sum / formula.length);
    
    // Modifikator berechnen
    const modifier = this.valueToModifier(baseValue);
    
    return {
      baseValue,
      modifier,
      formula: formula.join(' + '),
      display: `${modifier >= 0 ? '+' : ''}${modifier}`
    };
  }
  
  /**
   * Berechnet alle Fertigkeiten eines Charakters
   * @param {object} attributes - Attribute
   * @returns {object} Alle Fertigkeiten mit Modifikatoren
   */
  static calculateAllSkills(attributes) {
    const categories = {
      koerperlich: ['athletik', 'akrobatik', 'klettern', 'koerperbeherrschung', 
                     'schleichen', 'verstecken_tarnen', 'fingerfertigkeit', 'waffentalent'],
      sozial: ['menschenkenntnis', 'redekunst_verhandeln', 'beruhigen', 
               'einschuechtern', 'manipulieren', 'alleinunterhalter', 'flirten_verfuehren'],
      wissen: ['naturwissenschaften', 'ueberlebenstechniken', 'pflanzenkunde_alchemie',
               'tierkunde', 'geschichte', 'kriegskunst', 'handwerk_technologie',
               'jutsu_wissen', 'medizin_heilkunst', 'chakrakontrolle']
    };
    
    const result = {};
    
    for (const [category, skills] of Object.entries(categories)) {
      result[category] = {};
      for (const skill of skills) {
        result[category][skill] = this.calculateSkillModifier(skill, attributes);
      }
    }
    
    return result;
  }
  
  /**
   * Gibt die Modifikator-Tabelle zurück
   */
  static getModifierTable() {
    return [
      { range: '8–9', modifier: -1 },
      { range: '10–11', modifier: 0 },
      { range: '12–13', modifier: +1 },
      { range: '14–15', modifier: +2 },
      { range: '16–17', modifier: +3 },
      { range: '18–19', modifier: +4 },
      { range: '20+', modifier: +5 }
    ];
  }
}

// Für Node.js (Backend)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillModifierService;
}

// Für Browser (Frontend)
if (typeof window !== 'undefined') {
  window.SkillModifierService = SkillModifierService;
}
