/**
 * Stats Renderer - UI-Rendering für Character-Stats
 * 
 * Extrahiert aus app.js:
 * - updateStatsDisplay() (Zeilen 1580-1687)
 * - updateCombatDisplay() (Zeilen 1689-1710)
 * - updateResistancesDisplay() (Zeilen 1712-1730)
 * - updateAttributeModifiers() (Zeilen 1275+)
 */

const StatsRenderer = {
    
    /**
     * Aktualisiert alle Stats-Anzeigen
     * @param {Object} character - Der Character
     */
    updateAll(character) {
        if (!character) return;
        
        this.updateHP(character.stats?.hp);
        this.updateChakra(character.stats?.chakra);
        this.updateStamina(character.stats?.stamina);
        this.updateCombat(character.combat);
        this.updateResistances(character.resistances);
        this.updateModifiers(character.baseAttributes, character.modifiers);
        this.updateAttributePoints(character);
    },
    
    /**
     * Aktualisiert die HP-Anzeige
     * @param {Object} hp - HP-Objekt {current, max}
     */
    updateHP(hp) {
        if (!hp) return;
        
        const currentEl = document.getElementById('hp_current');
        const maxEl = document.getElementById('hp_max');
        const barEl = document.getElementById('hp_bar');
        
        if (currentEl) currentEl.textContent = hp.current;
        if (maxEl) maxEl.textContent = hp.max;
        
        if (barEl) {
            const percent = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
            barEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
            
            // Farbe basierend auf HP-Prozentsatz
            barEl.className = 'hp-bar';
            if (percent <= 25) barEl.classList.add('critical');
            else if (percent <= 50) barEl.classList.add('warning');
        }
    },
    
    /**
     * Aktualisiert die Chakra-Anzeige
     * @param {Object} chakra - Chakra-Objekt {current, max}
     */
    updateChakra(chakra) {
        if (!chakra) return;
        
        const currentEl = document.getElementById('chakra_current');
        const maxEl = document.getElementById('chakra_max');
        const barEl = document.getElementById('chakra_bar');
        
        if (currentEl) currentEl.textContent = chakra.current;
        if (maxEl) maxEl.textContent = chakra.max;
        
        if (barEl) {
            const percent = chakra.max > 0 ? (chakra.current / chakra.max) * 100 : 0;
            barEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        }
    },
    
    /**
     * Aktualisiert die Stamina-Anzeige
     * @param {number} stamina - Der Stamina-Wert
     */
    updateStamina(stamina) {
        const el = document.getElementById('stamina');
        if (el) el.textContent = stamina || 0;
    },
    
    /**
     * Aktualisiert alle Kampfwerte
     * @param {Object} combat - Das Combat-Objekt
     */
    updateCombat(combat) {
        if (!combat) return;
        
        const mappings = {
            'initiative': combat.initiative,
            'ausweichen': combat.ausweichen,
            'angriff': combat.angriff,
            'rk': combat.rk,
            'ninjutsu': combat.ninjutsu,
            'taijutsu': combat.taijutsu,
            'genjutsu': combat.genjutsu,
            'wahrnehmung': combat.wahrnehmung,
            'bewegungsradius': combat.bewegungsradius,
            'chakraWiderstand': combat.chakraWiderstand,
            'geistigerWiderstand': combat.geistigerWiderstand,
            'inspiration': combat.inspiration
        };
        
        Object.entries(mappings).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value !== undefined ? value : '-';
        });
    },
    
    /**
     * Aktualisiert alle Widerstände
     * @param {Object} resistances - Das Resistances-Objekt
     */
    updateResistances(resistances) {
        if (!resistances) return;
        
        const mappings = {
            'res_chakra': resistances.chakra,
            'res_koerper': resistances.koerper,
            'res_geist': resistances.geist
        };
        
        Object.entries(mappings).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                const display = value >= 0 ? `+${value}` : value;
                el.textContent = display;
            }
        });
    },
    
    /**
     * Aktualisiert alle Attribut-Modifikatoren
     * @param {Object} attributes - Die Attribute
     * @param {Object} modifiers - Die Modifikatoren
     */
    updateModifiers(attributes, modifiers) {
        if (!attributes) return;
        
        const attrNames = ['kk', 'ges', 'kon', 'gsw', 'itu', 'int', 'cha'];
        
        attrNames.forEach(attr => {
            const modEl = document.getElementById(`mod_${attr}`);
            if (modEl) {
                // Verwende übergebene Modifikatoren oder berechne neu
                let mod = modifiers?.[attr];
                if (mod === undefined && typeof RulesEngine !== 'undefined') {
                    mod = RulesEngine.getModifier(attributes[attr]);
                }
                
                if (mod !== undefined) {
                    modEl.textContent = mod >= 0 ? `+${mod}` : mod;
                    modEl.className = mod > 0 ? 'modifier positive' : mod < 0 ? 'modifier negative' : 'modifier';
                }
            }
        });
    },
    
    /**
     * Aktualisiert die Attributpunkte-Anzeige
     * @param {Object} character - Der Character
     */
    updateAttributePoints(character) {
        if (!character?.baseAttributes) return;
        
        const spent = Object.values(character.baseAttributes)
            .reduce((sum, val) => sum + (val - 8), 0);
        const total = 26; // Standard-Attributpunkte
        const remaining = total - spent;
        
        const el = document.getElementById('attrPoints');
        if (el) {
            el.textContent = remaining;
            el.className = remaining < 0 ? 'negative' : remaining === 0 ? 'complete' : '';
        }
        
        // Auch im Character-Objekt aktualisieren
        if (character.attributePoints) {
            character.attributePoints.spent = spent;
        }
    },
    
    /**
     * Aktualisiert ein einzelnes Attribut-Input-Feld
     * @param {string} attr - Das Attribut
     * @param {number} value - Der Wert
     */
    updateAttributeInput(attr, value) {
        const input = document.getElementById(`attr_${attr}`);
        if (input) input.value = value;
    },
    
    /**
     * Aktualisiert alle Attribute-Inputs
     * @param {Object} attributes - Die Attribute
     */
    updateAllAttributeInputs(attributes) {
        if (!attributes) return;
        
        Object.entries(attributes).forEach(([attr, value]) => {
            this.updateAttributeInput(attr, value);
        });
    },
    
    /**
     * Aktualisiert das Level und XP
     * @param {Object} character - Der Character
     */
    updateLevel(character) {
        if (!character) return;
        
        const levelEl = document.getElementById('level');
        if (levelEl) levelEl.value = character.level || 1;
        
        const xpEl = document.getElementById('xp');
        if (xpEl) xpEl.textContent = character.xp || 0;
        
        // XP für nächstes Level
        if (typeof RulesEngine !== 'undefined') {
            const nextLevelXP = RulesEngine.getXPForNextLevel(character.level);
            const nextXpEl = document.getElementById('xp_next');
            if (nextXpEl) nextXpEl.textContent = nextLevelXP;
        }
    },
    
    /**
     * Aktualisiert die Gold-Anzeige
     * @param {number} gold - Der Gold-Betrag
     */
    updateGold(gold) {
        const el = document.getElementById('gold');
        if (el) el.textContent = gold || 0;
    },
    
    /**
     * Aktualisiert die Karma-Anzeige
     * @param {number} karma - Der Karma-Wert
     */
    updateKarma(karma) {
        const el = document.getElementById('karma');
        if (el) {
            el.textContent = karma || 0;
            // Farbe basierend auf Karma
            el.className = 'karma-value';
            if (karma > 0) el.classList.add('positive');
            else if (karma < 0) el.classList.add('negative');
        }
    }
};

// Global verfügbar machen
window.StatsRenderer = StatsRenderer;
