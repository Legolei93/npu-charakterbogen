/**
 * Skills Renderer - UI-Rendering für Fertigkeiten
 * 
 * Extrahiert aus app.js:
 * - updateSkillsDisplay() (Zeilen 1317+)
 * - renderSkills() (Zeilen 1316+)
 */

const SkillsRenderer = {
    
    /**
     * Aktualisiert alle Fertigkeits-Anzeigen
     * @param {Object} skills - Das Skills-Objekt
     */
    updateAll(skills) {
        if (!skills) return;
        
        this.updatePhysicalSkills(skills.koerperlich);
        this.updateSocialSkills(skills.sozial);
        this.updateKnowledgeSkills(skills.wissen);
    },
    
    /**
     * Aktualisiert körperliche Fertigkeiten
     * @param {Object} skills - Körperliche Fertigkeiten
     */
    updatePhysicalSkills(skills) {
        if (!skills) return;
        
        const mappings = {
            'skill_athletik': skills.athletik,
            'skill_akrobatik': skills.akrobatik,
            'skill_klettern': skills.klettern,
            'skill_koerperbeherrschung': skills.koerperbeherrschung,
            'skill_schleichen': skills.schleichen,
            'skill_verstecken_tarnen': skills.verstecken_tarnen,
            'skill_fingerfertigkeit': skills.fingerfertigkeit,
            'skill_waffentalent': skills.waffentalent
        };
        
        Object.entries(mappings).forEach(([id, skill]) => {
            this._updateSkillDisplay(id, skill);
        });
    },
    
    /**
     * Aktualisiert soziale Fertigkeiten
     * @param {Object} skills - Soziale Fertigkeiten
     */
    updateSocialSkills(skills) {
        if (!skills) return;
        
        const mappings = {
            'skill_menschenkenntnis': skills.menschenkenntnis,
            'skill_redekunst_verhandeln': skills.redekunst_verhandeln,
            'skill_beruhigen': skills.beruhigen,
            'skill_einschuechtern': skills.einschuechtern,
            'skill_manipulieren': skills.manipulieren,
            'skill_alleinunterhalter': skills.alleinunterhalter,
            'skill_flirten_verfuehren': skills.flirten_verfuehren
        };
        
        Object.entries(mappings).forEach(([id, skill]) => {
            this._updateSkillDisplay(id, skill);
        });
    },
    
    /**
     * Aktualisiert Wissens-Fertigkeiten
     * @param {Object} skills - Wissens-Fertigkeiten
     */
    updateKnowledgeSkills(skills) {
        if (!skills) return;
        
        const mappings = {
            'skill_naturwissenschaften': skills.naturwissenschaften,
            'skill_ueberlebenstechniken': skills.ueberlebenstechniken,
            'skill_pflanzenkunde_alchemie': skills.pflanzenkunde_alchemie,
            'skill_tierkunde': skills.tierkunde,
            'skill_geschichte': skills.geschichte,
            'skill_kriegskunst': skills.kriegskunst,
            'skill_handwerk_technologie': skills.handwerk_technologie,
            'skill_jutsu_wissen': skills.jutsu_wissen,
            'skill_medizin_heilkunst': skills.medizin_heilkunst,
            'skill_chakrakontrolle': skills.chakrakontrolle
        };
        
        Object.entries(mappings).forEach(([id, skill]) => {
            this._updateSkillDisplay(id, skill);
        });
    },
    
    /**
     * Hilfsmethode: Aktualisiert eine einzelne Fertigkeits-Anzeige
     * @private
     */
    _updateSkillDisplay(elementId, skill) {
        const el = document.getElementById(elementId);
        if (!el || !skill) return;
        
        const display = this._formatSkill(skill);
        el.textContent = display;
        
        // Tooltip mit Details
        el.title = `Basis: ${skill.base}, Mod: ${skill.mod >= 0 ? '+' : ''}${skill.mod}`;
    },
    
    /**
     * Formatiert eine Fertigkeit für die Anzeige
     * @private
     */
    _formatSkill(skill) {
        if (!skill) return '-';
        
        const total = (skill.base || 0) + (skill.mod || 0);
        const modStr = skill.mod >= 0 ? `+${skill.mod}` : skill.mod;
        
        return `${total} (${skill.base}${modStr})`;
    },
    
    /**
     * Rendert eine komplette Fertigkeits-Tabelle
     * @param {Object} skills - Alle Fertigkeiten
     * @returns {string} - HTML-String
     */
    renderSkillsTable(skills) {
        if (!skills) return '<p>Keine Fertigkeiten verfügbar</p>';
        
        return `
            <div class="skills-section">
                <h4>Körperlich</h4>
                ${this._renderSkillCategory(skills.koerperlich)}
            </div>
            <div class="skills-section">
                <h4>Sozial</h4>
                ${this._renderSkillCategory(skills.sozial)}
            </div>
            <div class="skills-section">
                <h4>Wissen</h4>
                ${this._renderSkillCategory(skills.wissen)}
            </div>
        `;
    },
    
    /**
     * Rendert eine Fertigkeits-Kategorie
     * @private
     */
    _renderSkillCategory(category) {
        if (!category) return '';
        
        const skillNames = {
            athletik: 'Athletik',
            akrobatik: 'Akrobatik',
            klettern: 'Klettern',
            koerperbeherrschung: 'Körperbeherrschung',
            schleichen: 'Schleichen',
            verstecken_tarnen: 'Verstecken/Tarnen',
            fingerfertigkeit: 'Fingerfertigkeit',
            waffentalent: 'Waffentalent',
            menschenkenntnis: 'Menschenkenntnis',
            redekunst_verhandeln: 'Redekunst/Verhandeln',
            beruhigen: 'Beruhigen',
            einschuechtern: 'Einschüchtern',
            manipulieren: 'Manipulieren',
            alleinunterhalter: 'Alleinunterhalter',
            flirten_verfuehren: 'Flirten/Verführen',
            naturwissenschaften: 'Naturwissenschaften',
            ueberlebenstechniken: 'Überlebenstechniken',
            pflanzenkunde_alchemie: 'Pflanzenkunde/Alchemie',
            tierkunde: 'Tierkunde',
            geschichte: 'Geschichte',
            kriegskunst: 'Kriegskunst',
            handwerk_technologie: 'Handwerk/Technologie',
            jutsu_wissen: 'Jutsu-Wissen',
            medizin_heilkunst: 'Medizin/Heilkunst',
            chakrakontrolle: 'Chakrakontrolle'
        };
        
        return `
            <table class="skills-table">
                <tbody>
                    ${Object.entries(category).map(([key, skill]) => `
                        <tr>
                            <td>${skillNames[key] || key}</td>
                            <td class="skill-value">${this._formatSkill(skill)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

// Global verfügbar machen
window.SkillsRenderer = SkillsRenderer;
