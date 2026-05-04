/**
 * Spiel-Seite - Interaktiver Charakterbogen für Sessions
 * Ermöglicht Echtzeit-Kampf, Jutsu-Nutzung und Ressourcen-Management
 * VOLLSTÄNDIGE CHARAKTERÜBERSICHT
 */

const GamePage = {
    deathSaves: {
        successes: 0,
        failures: 0
    },
    
    /**
     * Gibt den aktuellen Charakter zurück (immer synchron mit globaler Variable)
     */
    get currentCharacter() {
        return window.currentCharacter;
    },
    
    /**
     * Initialisiert die Spiel-Seite
     */
    init() {
        console.log('GamePage.init() wird ausgeführt...');
        
        if (!this.currentCharacter) {
            console.error('Kein Charakter geladen!');
            return;
        }
        
        this.render();
        this.setupEventListeners();
        console.log('GamePage initialisiert');
    },
    
    /**
     * Rendert die komplette Spiel-Seite mit allen Charakterdaten
     */
    render() {
        const container = document.getElementById('gamePage');
        if (!container) {
            console.error('gamePage Container nicht gefunden!');
            return;
        }
        
        const char = this.currentCharacter;
        
        container.innerHTML = `
            <div class="game-container">
                <!-- DND Map Button (oben rechts) -->
                <button class="dnd-map-btn" onclick="GamePage.openDNDMap()" title="Zur DND Map">
                    🗺️ DND Map
                </button>
                
                <!-- Header mit Charakter-Info -->
                <div class="game-header">
                    <div class="game-char-info">
                        <h2>${char.name || 'Unbenannt'}</h2>
                        <div class="game-meta">
                            <span class="game-level">Level ${char.level || 1}</span>
                            <span class="game-clan">${char.clan || 'Kein Clan'}</span>
                            ${char.elements?.length ? `<span class="game-elements">${char.elements.join(', ')}</span>` : ''}
                            <span class="game-gold">💰 ${this.formatMoney(this.currentCharacter?.money)}</span>
                        </div>
                    </div>
                    <div class="game-karma">
                        <span class="karma-label">Karma:</span>
                        <span class="karma-value ${char.stats?.karma >= 0 ? 'positive' : 'negative'}">${char.stats?.karma || 0}</span>
                    </div>
                </div>
                
                <!-- Ressourcen-Bars (interaktiv) -->
                <div class="resource-bars">
                    ${this.renderResourceBar('HP', char.stats?.hp, 'hp', '#dc3545')}
                    ${this.renderResourceBar('Chakra', char.stats?.chakra, 'chakra', '#007bff')}
                    ${this.renderResourceBar('Stamina', { current: char.stats?.stamina || 0, max: char.stats?.stamina || 3 }, 'stamina', '#ffc107')}
                </div>
                
                <!-- Status-Effekte -->
                <div class="status-effects-section">
                    <h3>Status-Effekte</h3>
                    <div class="status-effects-list">
                        ${this.renderStatusEffects()}
                    </div>
                </div>
                
                <!-- Attribute -->
                <div class="game-attributes-section">
                    <h3>Attribute</h3>
                    <div class="game-attributes-grid">
                        ${this.renderAttributes()}
                    </div>
                </div>
                
                <!-- Schnell-Infos (Kampfwerte) -->
                <div class="quick-stats">
                    <div class="quick-stat-card">
                        <span class="stat-label">Initiative</span>
                        <span class="stat-value">${char.combat?.initiative || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Ausweichen</span>
                        <span class="stat-value">${char.combat?.ausweichen || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Angriff</span>
                        <span class="stat-value">${char.combat?.angriff || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Ninjutsu</span>
                        <span class="stat-value">${char.combat?.ninjutsu || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Taijutsu</span>
                        <span class="stat-value">${char.combat?.taijutsu || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Genjutsu</span>
                        <span class="stat-value">${char.combat?.genjutsu || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">RK</span>
                        <span class="stat-value">${char.combat?.rk || 8}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Chakra-Widerstand</span>
                        <span class="stat-value">${char.combat?.chakraWiderstand || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Bewegungsradius</span>
                        <span class="stat-value">${char.combat?.bewegungsradius || 6}m</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Geistiger Widerstand</span>
                        <span class="stat-value">${char.combat?.geistigerWiderstand || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Wahrnehmung</span>
                        <span class="stat-value">${char.combat?.wahrnehmung || 0}</span>
                    </div>
                    <div class="quick-stat-card">
                        <span class="stat-label">Inspiration</span>
                        <span class="stat-value">${char.combat?.inspiration || 0}</span>
                    </div>
                </div>
                
                <!-- Jutsu-Karten (klickbar) -->
                <div class="game-jutsu-section">
                    <h3>Jutsus (${(char.jutsus || []).length})</h3>
                    <div class="game-jutsu-grid">
                        ${this.renderJutsuCards()}
                    </div>
                </div>
                
                <!-- Fertigkeiten - Vollständig -->
                <div class="game-skills-section">
                    <h3>Fertigkeiten</h3>
                    <div class="game-skills-container">
                        ${this.renderAllSkills()}
                    </div>
                </div>
                
                <!-- Talente -->
                <div class="game-talents-section">
                    <h3>Talente (${(char.talents || []).length})</h3>
                    <div class="game-talents-list">
                        ${this.renderTalents()}
                    </div>
                </div>
                
                <!-- Inventar-Quickview -->
                <div class="game-inventory-section">
                    <h3>Inventar (${(char.inventory || []).length} Items)</h3>
                    <div class="game-inventory-list">
                        ${this.renderQuickInventory()}
                    </div>
                </div>
            </div>
            
            <!-- Todeskampf Modal (versteckt) -->
            <div id="deathSaveModal" class="modal hidden">
                <div class="modal-content death-save-content">
                    <h2>☠️ Todeskampf</h2>
                    <p>Du bist bei 0 HP! Würfle eine Rettungsprobe (W20 + KON-Mod)</p>
                    <div class="death-save-tracker">
                        <div class="successes">Erfolge: <span id="dsSuccesses">0</span>/3</div>
                        <div class="failures">Fehlschläge: <span id="dsFailures">0</span>/3</div>
                    </div>
                    <div class="death-save-buttons">
                        <button class="btn-success" onclick="GamePage.resolveDeathSave(true)">✓ Probe geschafft</button>
                        <button class="btn-danger" onclick="GamePage.resolveDeathSave(false)">✗ Probe fehlgeschlagen</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert eine Ressourcen-Bar (HP, Chakra, Stamina)
     */
    renderResourceBar(name, value, type, color) {
        const current = value?.current || 0;
        const max = value?.max || 1;
        const percent = Math.min(100, Math.max(0, (current / max) * 100));
        
        return `
            <div class="resource-bar ${type}" style="--bar-color: ${color}">
                <div class="resource-header">
                    <span class="resource-name">${name}</span>
                    <div class="resource-values">
                        <input type="number" 
                               class="resource-input" 
                               value="${current}" 
                               min="0" 
                               max="${max}"
                               data-resource="${type}"
                        >
                        <span class="resource-max">/ ${max}</span>
                    </div>
                </div>
                <div class="resource-progress">
                    <div class="resource-fill" style="width: ${percent}%; background: ${color}"></div>
                </div>
                <div class="resource-controls">
                    <button class="btn-minus" onclick="GamePage.modifyResource('${type}', -5)">-5</button>
                    <button class="btn-minus" onclick="GamePage.modifyResource('${type}', -1)">-1</button>
                    <button class="btn-plus" onclick="GamePage.modifyResource('${type}', 1)">+1</button>
                    <button class="btn-plus" onclick="GamePage.modifyResource('${type}', 5)">+5</button>
                </div>
            </div>
        `;
    },

    /**
     * Formatiert Geld für Anzeige
     */
    formatMoney(money) {
        if (!money) return '0 Gold';
        
        let totalCopper = 0;
        
        // Wenn Geld als Objekt mit gold/silver/copper
        if (typeof money === 'object') {
            totalCopper = (money.gold || 0) * 100 + (money.silver || 0) * 10 + (money.copper || 0);
        } else {
            // Wenn Geld als Zahl (Kupfer)
            totalCopper = money;
        }
        
        const gold = Math.floor(totalCopper / 100);
        const silver = Math.floor((totalCopper % 100) / 10);
        const copper = totalCopper % 10;
        
        // Baue den String zusammen - zeige nur relevante Werte
        const parts = [];
        if (gold > 0) parts.push(`${gold} Gold`);
        if (silver > 0) parts.push(`${silver} Silber`);
        if (copper > 0) parts.push(`${copper} Kupfer`);
        
        return parts.join(' ') || '0 Kupfer';
    },
    
    /**
     * Rendert alle Attribute
     */
    renderAttributes() {
        const attrs = this.currentCharacter?.baseAttributes || this.currentCharacter?.attributes || {};
        const attrNames = {
            kk: 'Körperkraft (KK)',
            ges: 'Geschicklichkeit (GES)',
            kon: 'Konstitution (KON)',
            gsw: 'Geschwindigkeit (GSW)',
            int: 'Intelligenz (INT)',
            itu: 'Intuition (ITU)',
            cha: 'Charisma (CHA)'
        };
        
        return Object.entries(attrNames).map(([key, label]) => {
            const value = attrs[key] || 8;
            const mod = this.getModifier(value);
            const modClass = mod >= 0 ? 'positive' : 'negative';
            return `
                <div class="game-attribute-item">
                    <span class="attr-name">${label}</span>
                    <span class="attr-value">${value}</span>
                    <span class="attr-mod ${modClass}">(${mod >= 0 ? '+' : ''}${mod})</span>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Berechnet den Modifikator für einen Attributwert
     * Verwendet Rules.getModifier() für Konsistenz
     */
    getModifier(value) {
        // Verwende Rules.getModifier() wenn verfügbar
        if (typeof Rules !== 'undefined' && Rules.ATTRIBUTES && Rules.ATTRIBUTES.getModifier) {
            return Rules.ATTRIBUTES.getModifier(value);
        }
        
        // Fallback wenn Rules nicht verfügbar
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
     * Rendert Status-Effekte
     */
    renderStatusEffects() {
        const effects = this.currentCharacter?.statusEffects || [];
        
        // Verfuegbare Status-Effekte
        const availableEffects = [
            { id: 'poisoned', name: 'Vergiftet', icon: '☠️', color: '#2e7d32' },
            { id: 'burning', name: 'Brennend', icon: '🔥', color: '#c62828' },
            { id: 'bleeding', name: 'Blutend', icon: '🩸', color: '#8e0000' },
            { id: 'prone', name: 'Liegend', icon: '🛌', color: '#5d4037' },
            { id: 'restrained', name: 'Gefangen', icon: '⛓️', color: '#424242' }
        ];
        
        let html = '<div class="status-effects-available">';
        html += '<h4>Zum Aktivieren klicken:</h4>';
        html += '<div class="status-effects-buttons">';
        
        availableEffects.forEach(effect => {
            const isActive = effects.some(e => e.id === effect.id);
            const activeClass = isActive ? 'active' : '';
            html += `
                <button class="status-effect-btn ${activeClass}" 
                        onclick="GamePage.toggleStatusEffect('${effect.id}', '${effect.name}')"
                        style="--effect-color: ${effect.color}"
                        title="${isActive ? 'Deaktivieren' : 'Aktivieren'}"
                >
                    <span class="effect-icon">${effect.icon}</span>
                    <span class="effect-name">${effect.name}</span>
                </button>
            `;
        });
        
        html += '</div></div>';
        
        // Aktive Effekte anzeigen
        if (effects.length > 0) {
            html += '<div class="status-effects-active">';
            html += '<h4>Aktive Effekte:</h4>';
            html += effects.map(effect => `
                <div class="status-effect-badge ${effect.id}">
                    <span class="effect-icon">${effect.icon || '⚡'}</span>
                    <span class="effect-name">${effect.name}</span>
                    ${effect.duration ? `<span class="effect-duration">${effect.duration} Runden</span>` : ''}
                    <button class="btn-remove-effect" onclick="GamePage.removeEffect('${effect.id}')">×</button>
                </div>
            `).join('');
            html += '</div>';
        }
        
        return html;
    },
    
    /**
     * Schaltet einen Status-Effekt ein/aus
     */
    toggleStatusEffect(effectId, effectName) {
        if (!this.currentCharacter) return;
        
        if (!this.currentCharacter.statusEffects) {
            this.currentCharacter.statusEffects = [];
        }
        
        const existingIndex = this.currentCharacter.statusEffects.findIndex(e => e.id === effectId);
        
        if (existingIndex > -1) {
            // Effekt entfernen
            this.currentCharacter.statusEffects.splice(existingIndex, 1);
            console.log(`Status-Effekt ${effectName} entfernt`);
        } else {
            // Effekt hinzufuegen
            const effectIcons = {
                'poisoned': '☠️',
                'burning': '🔥', 
                'bleeding': '🩸',
                'prone': '🛌',
                'restrained': '⛓️'
            };
            
            this.currentCharacter.statusEffects.push({
                id: effectId,
                name: effectName,
                icon: effectIcons[effectId] || '⚡',
                duration: 3,
                source: 'manual'
            });
            console.log(`Status-Effekt ${effectName} hinzugefuegt`);
        }
        
        // Speichern und neu rendern
        StateManager.saveState();
        this.render();
    },
    
    /**
     * Rendert Jutsu-Karten - verwendet dieselbe Datenquelle wie der Jutsu-Reiter
     */
    renderJutsuCards() {
        const jutsus = this.currentCharacter?.jutsus || [];
        
        console.log('GamePage.renderJutsuCards - Jutsus:', jutsus);
        
        if (jutsus.length === 0) {
            return '<p class="no-jutsus">Keine Jutsus gelernt. Gehe zum Jutsu-Reiter, um Jutsus auszuwählen.</p>';
        }
        
        return jutsus.map(jutsu => {
            // Verwende calculateJutsuValues wenn verfügbar (wie in app.js)
            let displayJutsu = jutsu;
            if (typeof calculateJutsuValues === 'function') {
                displayJutsu = calculateJutsuValues(jutsu);
            }
            
            const chakraCost = displayJutsu.chakraCost || displayJutsu.chakra || displayJutsu.calculatedChakra || '?';
            const damage = displayJutsu.damage || displayJutsu.calculatedDamage || '';
            const rank = displayJutsu.rank || 'E';
            const type = displayJutsu.type || 'Ninjutsu';
            const name = displayJutsu.name || 'Unbekanntes Jutsu';
            const jutsuId = displayJutsu.id || displayJutsu.jutsuId || '';
            
            // STATUS-PRÜFUNG für Spielkarte
            const status = displayJutsu.status || 'gelernt';
            const isLocked = status === 'gesperrt';
            const isTraining = status === 'training';
            
            // CSS-Klassen basierend auf Status
            let statusClass = '';
            let statusBadge = '';
            let clickHandler = `onclick="GamePage.useJutsu('${jutsuId}')"`;
            
            if (isLocked) {
                statusClass = 'jutsu-locked';
                statusBadge = '<span class="jutsu-status-badge locked">🔒 Gesperrt</span>';
                clickHandler = ''; // Kein Klick möglich
            } else if (isTraining) {
                statusClass = 'jutsu-training';
                statusBadge = '<span class="jutsu-status-badge training">📖 Training (50%)</span>';
            }
            
            return `
                <div class="game-jutsu-card ${rank} ${statusClass}" ${clickHandler}>
                    <div class="jutsu-rank-badge">${rank}</div>
                    <div class="jutsu-name">${name}</div>
                    <div class="jutsu-type">${type}</div>
                    <div class="jutsu-cost">${chakraCost} Chakra</div>
                    ${damage ? `<div class="jutsu-damage">${damage} Schaden</div>` : ''}
                    ${displayJutsu.element && displayJutsu.element !== 'neutral' ? `<div class="jutsu-element">${displayJutsu.element}</div>` : ''}
                    ${statusBadge}
                </div>
            `;
        }).join('');
    },
    
    /**
     * Rendert ALLE Fertigkeiten korrekt als Modifikator
     */
    renderAllSkills() {
        const attrs = this.currentCharacter?.baseAttributes || {};
        
        // Skill-Definitionen mit Berechnungsformeln - identisch zu app.js
        const categories = {
            koerperlich: {
                label: 'Körperlich',
                icon: '💪',
                skills: [
                    { key: 'athletik', name: 'Athletik', formula: '(KK + KON + GES) / 3' },
                    { key: 'akrobatik', name: 'Akrobatik', formula: '(KK + KK + KON) / 3' },
                    { key: 'klettern', name: 'Klettern', formula: '(KON + KON + KK) / 3' },
                    { key: 'koerperbeherrschung', name: 'Körperbeherrschung', formula: '(KON + KK + GSW) / 3' },
                    { key: 'schleichen', name: 'Schleichen', formula: '(GES + GES + ITU) / 3' },
                    { key: 'verstecken_tarnen', name: 'Verstecken / Tarnen', formula: '(ITU + GES + GSW) / 3' },
                    { key: 'fingerfertigkeit', name: 'Fingerfertigkeit', formula: '(ITU + INT + GES) / 3' },
                    { key: 'waffentalent', name: 'Waffentalent', formula: '(KK + GES + GSW) / 3' }
                ]
            },
            sozial: {
                label: 'Sozial',
                icon: '🗣️',
                skills: [
                    { key: 'menschenkenntnis', name: 'Menschenkenntnis', formula: '(CHA + ITU) / 2' },
                    { key: 'redekunst_verhandeln', name: 'Redekunst / Verhandeln', formula: '(CHA + INT) / 2' },
                    { key: 'beruhigen', name: 'Beruhigen', formula: '(CHA + GES) / 2' },
                    { key: 'einschuechtern', name: 'Einschüchtern', formula: '(CHA + KK) / 2' },
                    { key: 'manipulieren', name: 'Manipulieren', formula: '(CHA + ITU) / 2' },
                    { key: 'alleinunterhalter', name: 'Alleinunterhalter', formula: '(CHA + CHA) / 2' },
                    { key: 'flirten_verfuehren', name: 'Flirten / Verführen', formula: '(CHA + INT) / 2' }
                ]
            },
            wissen: {
                label: 'Wissen',
                icon: '📚',
                skills: [
                    { key: 'naturwissenschaften', name: 'Naturwissenschaften', formula: '(ITU + INT) / 2' },
                    { key: 'ueberlebenstechniken', name: 'Überlebenstechniken', formula: '(KK + KON) / 2' },
                    { key: 'pflanzenkunde_alchemie', name: 'Pflanzenkunde / Alchemie', formula: '(ITU + INT) / 2' },
                    { key: 'tierkunde', name: 'Tierkunde', formula: '(INT + INT) / 2' },
                    { key: 'geschichte', name: 'Geschichte', formula: '(INT + INT) / 2' },
                    { key: 'kriegskunst', name: 'Kriegskunst', formula: '(ITU + INT) / 2' },
                    { key: 'handwerk_technologie', name: 'Handwerk / Technologie', formula: '(KON + KK) / 2' },
                    { key: 'jutsu_wissen', name: 'Jutsu-Wissen', formula: '(KON + INT) / 2' },
                    { key: 'medizin_heilkunst', name: 'Medizin / Heilkunst', formula: '(GES + INT) / 2' },
                    { key: 'chakrakontrolle', name: 'Chakrakontrolle', formula: '(INT + INT + KON) / 3' }
                ]
            }
        };
        
        // Berechne Skills dynamisch - identisch zu app.js
        const calculateSkill = (skill) => {
            switch(skill.key) {
                case 'athletik': return Math.floor((attrs.kk + attrs.kon + attrs.ges) / 3);
                case 'akrobatik': return Math.floor((attrs.kk + attrs.kk + attrs.kon) / 3);
                case 'klettern': return Math.floor((attrs.kon + attrs.kon + attrs.kk) / 3);
                case 'koerperbeherrschung': return Math.floor((attrs.kon + attrs.kk + attrs.gsw) / 3);
                case 'schleichen': return Math.floor((attrs.ges + attrs.ges + attrs.itu) / 3);
                case 'verstecken_tarnen': return Math.floor((attrs.itu + attrs.ges + attrs.gsw) / 3);
                case 'fingerfertigkeit': return Math.floor((attrs.itu + attrs.int + attrs.ges) / 3);
                case 'waffentalent': return Math.floor((attrs.kk + attrs.ges + attrs.gsw) / 3);
                case 'menschenkenntnis': return Math.floor((attrs.cha + attrs.itu) / 2);
                case 'redekunst_verhandeln': return Math.floor((attrs.cha + attrs.int) / 2);
                case 'beruhigen': return Math.floor((attrs.cha + attrs.ges) / 2);
                case 'einschuechtern': return Math.floor((attrs.cha + attrs.kk) / 2);
                case 'manipulieren': return Math.floor((attrs.cha + attrs.itu) / 2);
                case 'alleinunterhalter': return Math.floor((attrs.cha + attrs.cha) / 2);
                case 'flirten_verfuehren': return Math.floor((attrs.cha + attrs.int) / 2);
                case 'naturwissenschaften': return Math.floor((attrs.itu + attrs.int) / 2);
                case 'ueberlebenstechniken': return Math.floor((attrs.kk + attrs.kon) / 2);
                case 'pflanzenkunde_alchemie': return Math.floor((attrs.itu + attrs.int) / 2);
                case 'tierkunde': return Math.floor((attrs.int + attrs.int) / 2);
                case 'geschichte': return Math.floor((attrs.int + attrs.int) / 2);
                case 'kriegskunst': return Math.floor((attrs.itu + attrs.int) / 2);
                case 'handwerk_technologie': return Math.floor((attrs.kon + attrs.kk) / 2);
                case 'jutsu_wissen': return Math.floor((attrs.kon + attrs.int) / 2);
                case 'medizin_heilkunst': return Math.floor((attrs.ges + attrs.int) / 2);
                case 'chakrakontrolle': return Math.floor((attrs.int + attrs.int + attrs.kon) / 3);
                default: return 8;
            }
        };
        
        return Object.entries(categories).map(([catKey, catData]) => {
            return `
                <div class="skill-category">
                    <h4>${catData.icon} ${catData.label}</h4>
                    <div class="skill-list">
                        ${catData.skills.map(skill => {
                            const baseValue = calculateSkill(skill);
                            const mod = this.getModifier(baseValue);
                            return `
                                <div class="skill-item">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-formula">${skill.formula}</span>
                                    <span class="skill-mod ${mod >= 0 ? 'positive' : 'negative'}">${mod >= 0 ? '+' : ''}${mod}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Rendert Talente
     */
    renderTalents() {
        let talents = this.currentCharacter?.talents || [];

        // Sicherstellen, dass talents ein Array ist
        if (!Array.isArray(talents)) {
            console.warn('Talente ist kein Array:', talents);
            talents = [];
        }

        if (talents.length === 0) {
            return '<p class="no-talents">Keine Talente gewählt</p>';
        }

        return talents.map(talent => {
            // Talent kann String oder Objekt sein
            const name = typeof talent === 'string' ? talent : (talent.name || 'Unbekannt');
            const cost = typeof talent === 'object' ? talent.cost : null;
            const description = typeof talent === 'object' ? talent.description : null;
            const effect = typeof talent === 'object' ? talent.effect : null;

            return `
                <div class="game-talent-badge" title="${description || effect || ''}">
                    <span class="talent-name">${name}</span>
                    ${cost ? `<span class="talent-cost">${cost} TP</span>` : ''}
                    ${effect ? `<span class="talent-effect">${effect}</span>` : ''}
                </div>
            `;
        }).join('');
    },
    
    /**
     * Rendert Quick-Inventar als Tabelle
     */
    renderQuickInventory() {
        const equipment = this.currentCharacter?.equipment || {};
        const inventory = this.currentCharacter?.inventory || [];
        
        // Kombiniere Ausrüstung und Inventar für die Tabelle
        const allItems = [];
        
        // Ausrüstung hinzufügen
        Object.entries(equipment).forEach(([slot, item]) => {
            if (item) {
                allItems.push({
                    name: item.name,
                    type: item.type || 'Ausrüstung',
                    slot: slot,
                    rarity: item.rarity || 'Gewöhnlich',
                    bonus: item.bonus || '-',
                    value: item.value || '0',
                    source: 'Ausgerüstet'
                });
            }
        });
        
        // Inventar hinzufügen
        inventory.forEach(item => {
            allItems.push({
                name: item.name,
                type: item.type || 'Item',
                slot: '-',
                rarity: item.rarity || 'Gewöhnlich',
                bonus: item.bonus || '-',
                value: item.value || '0',
                source: 'Rucksack'
            });
        });
        
        if (allItems.length === 0) {
            return '<p class="no-items">Keine Items vorhanden</p>';
        }
        
        return `
            <div class="inventory-table-wrapper">
                <table class="inventory-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Typ</th>
                            <th>Slot</th>
                            <th>Seltenheit</th>
                            <th>Bonus</th>
                            <th>Wert</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allItems.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.type}</td>
                                <td>${item.slot}</td>
                                <td>${item.rarity}</td>
                                <td>${item.bonus}</td>
                                <td>${item.value} Gold</td>
                                <td>${item.source}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    /**
     * Item-Icon helper
     */
    getItemIcon(type) {
        const icons = {
            weapon: '⚔️',
            armor: '🛡️',
            consumable: '🧪',
            material: '📦',
            misc: '📿'
        };
        return icons[type] || '📦';
    },
    
    /**
     * Modifiziert eine Ressource (HP, Chakra, Stamina)
     */
    modifyResource(type, amount) {
        if (!this.currentCharacter) return;
        
        let resource;
        if (type === 'stamina') {
            resource = { current: this.currentCharacter.stats.stamina || 0, max: this.currentCharacter.stats.stamina || 3 };
        } else {
            resource = this.currentCharacter.stats[type];
        }
        
        if (!resource) return;
        
        const newValue = Math.max(0, Math.min(resource.max, (resource.current || 0) + amount));
        
        // Todeskampf-Check bei HP
        if (type === 'hp' && newValue === 0 && resource.current > 0) {
            resource.current = 0;
            this.startDeathSave();
        } else {
            resource.current = newValue;
        }
        
        // Stamina ist ein einzelner Wert, kein Objekt
        if (type === 'stamina') {
            this.currentCharacter.stats.stamina = newValue;
        }
        
        this.render();
        this.setupEventListeners();
        autoSave();
    },
    
    /**
     * Verwendet ein Jutsu
     */
    useJutsu(jutsuId) {
        const jutsus = this.currentCharacter?.jutsus || [];
        const jutsu = jutsus.find(j => j.id === jutsuId || j.jutsuId === jutsuId);
        if (!jutsu) {
            alert('Jutsu nicht gefunden!');
            return;
        }
        
        // STATUS-PRÜFUNG
        const status = jutsu.status || 'gelernt';
        
        // Gesperrte Jutsus können nicht verwendet werden
        if (status === 'gesperrt') {
            alert('🔒 Dieses Jutsu ist gesperrt und kann nicht eingesetzt werden!');
            return;
        }
        
        // Verwende calculateJutsuValues wenn verfügbar
        let displayJutsu = jutsu;
        if (typeof calculateJutsuValues === 'function') {
            displayJutsu = calculateJutsuValues(jutsu);
        }
        
        let chakraCost = parseInt(displayJutsu.chakraCost || displayJutsu.chakra || displayJutsu.calculatedChakra || 0);
        const currentChakra = this.currentCharacter.stats?.chakra?.current || 0;
        
        // TRAINING-LOGIK
        let isTraining = status === 'training';
        let trainingMultiplier = 1;
        
        if (isTraining) {
            // 30% höhere Chakra-Kosten im Training
            trainingMultiplier = 1.3;
            chakraCost = Math.ceil(chakraCost * trainingMultiplier);
            
            // 50:50 Chance-Check
            const trainingRoll = Math.random();
            const trainingSuccess = trainingRoll >= 0.5; // 50% Chance
            
            if (!trainingSuccess) {
                // Training fehlgeschlagen - VOLLES CHAKRA abziehen!
                const fullChakraCost = chakraCost;
                
                if (currentChakra < fullChakraCost) {
                    alert('❌ Nicht genug Chakra für den Trainingsversuch!');
                    return;
                }
                
                this.currentCharacter.stats.chakra.current -= fullChakraCost;
                alert(`📖 Training fehlgeschlagen! (Wurf: ${Math.floor(trainingRoll * 100)}%)

Du hast das Jutsu noch nicht gemeistert.
Chakra verloren: ${fullChakraCost}

Tipp: Weiter trainieren oder zum Sensei gehen!`);
                
                this.render();
                this.setupEventListeners();
                autoSave();
                return;
            }
            
            // Training erfolgreich - Jutsu kann normal eingesetzt werden
            alert(`📖 Training erfolgreich! (Wurf: ${Math.floor(trainingRoll * 100)}%)

Du hast das Jutsu erfolgreich trainiert!`);
            
            // BUGFIX 7: Status NICHT automatisch auf "gelernt" ändern
            // Das passiert später durch Quest/XP-System
            // jutsu.status = 'gelernt';
        }
        
        // Prüfe Chakra
        if (currentChakra < chakraCost) {
            alert('❌ Nicht genug Chakra!');
            return;
        }
        
        const damage = displayJutsu.damage || displayJutsu.calculatedDamage || 'Keiner';
        
        // Treffer-Abfrage
        const hit = confirm(`🎯 Jutsu: ${displayJutsu.name}${isTraining ? ' (Training)' : ''}

Kosten: ${chakraCost} Chakra${isTraining ? ' (+30% Training)' : ''}
Schaden: ${damage}

Getroffen? (OK = Ja, Abbrechen = Nein)`);
        
        if (hit) {
            // Voller Chakra-Verbrauch
            this.currentCharacter.stats.chakra.current -= chakraCost;
            alert(`✅ Jutsu erfolgreich!
${damage !== 'Keiner' ? `Schaden: ${damage}` : 'Effekt angewendet'}`);
        } else {
            // Reduzierter Verbrauch (50%)
            const reducedCost = Math.floor(chakraCost / 2);
            this.currentCharacter.stats.chakra.current -= reducedCost;
            alert(`❌ Jutsu verfehlt!
Chakra-Verbrauch: ${reducedCost} (statt ${chakraCost})`);
        }
        
        this.render();
        this.setupEventListeners();
        autoSave();
    },
    
    /**
     * Startet den Todeskampf
     */
    startDeathSave() {
        this.deathSaves = { successes: 0, failures: 0 };
        const modal = document.getElementById('deathSaveModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    /**
     * Löst eine Todeskampf-Rettungsprobe auf
     */
    resolveDeathSave(success) {
        if (success) {
            this.deathSaves.successes++;
            const el = document.getElementById('dsSuccesses');
            if (el) el.textContent = this.deathSaves.successes;
            
            if (this.deathSaves.successes >= 3) {
                alert('✅ Todeskampf überstanden! Du bist stabil.');
                this.closeDeathSaveModal();
                this.currentCharacter.stats.hp.current = 1;
                this.render();
                this.setupEventListeners();
            }
        } else {
            this.deathSaves.failures++;
            const el = document.getElementById('dsFailures');
            if (el) el.textContent = this.deathSaves.failures;
            
            if (this.deathSaves.failures >= 3) {
                alert('☠️ Todeskampf verloren...');
                this.closeDeathSaveModal();
            }
        }
        
        autoSave();
    },
    
    /**
     * Schließt das Todeskampf-Modal
     */
    closeDeathSaveModal() {
        const modal = document.getElementById('deathSaveModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    /**
     * Entfernt einen Status-Effekt
     */
    removeEffect(effectId) {
        if (!this.currentCharacter?.statusEffects) return;
        
        this.currentCharacter.statusEffects = this.currentCharacter.statusEffects.filter(
            e => e.id !== effectId
        );
        
        this.render();
        this.setupEventListeners();
        autoSave();
    },
    
    /**
     * Öffnet die DND Map
     */
    openDNDMap() {
        // Platzhalter - wird später durch echte Map ersetzt
        alert('🗺️ DND Map wird geladen...\n\n(Das Programm wird später geliefert)');
        
        // Hier später: window.open('dnd-map.html', '_blank');
        // oder: iframe Integration
    },
    
    /**
     * Toggle für Überlebenskampf-Felder
     */
    toggleDeathSaveField(index) {
        const field = document.getElementById(`deathField${index}`);
        const statusEl = document.getElementById('deathSaveStatus');
        
        if (!field) return;
        
        // Zyklus: leer -> grün (lebend) -> rot (tot) -> leer
        if (field.classList.contains('alive')) {
            field.classList.remove('alive');
            field.classList.add('dead');
            field.innerHTML = '💀';
            
            // Prüfe ob 3x tot
            const deadCount = document.querySelectorAll('.field-box.dead').length;
            if (deadCount >= 3) {
                statusEl.innerHTML = '<span class="status-dead">☠️ CHARAKTER IST TOT ☠️</span>';
                statusEl.className = 'death-save-status dead';
            } else {
                statusEl.textContent = `${deadCount}/3 Rettungswürfe fehlgeschlagen`;
            }
        } else if (field.classList.contains('dead')) {
            field.classList.remove('dead');
            field.innerHTML = '';
            statusEl.textContent = 'Klicke auf ein Feld: Grün = Lebend, Rot = Tot';
            statusEl.className = 'death-save-status';
        } else {
            field.classList.add('alive');
            field.innerHTML = '💚';
            
            // Prüfe ob 3x lebend
            const aliveCount = document.querySelectorAll('.field-box.alive').length;
            if (aliveCount >= 3) {
                statusEl.innerHTML = '<span class="status-alive">✅ CHARAKTER STABILISIERT</span>';
                statusEl.className = 'death-save-status alive';
                
                // Heile auf 1 HP
                if (this.currentCharacter?.stats?.hp) {
                    this.currentCharacter.stats.hp.current = 1;
                    autoSave();
                }
            } else {
                statusEl.textContent = `${aliveCount}/3 Rettungswürfe erfolgreich`;
            }
        }
    },
    
    /**
     * Richtet Event-Listener ein
     */
    setupEventListeners() {
        // Resource-Inputs
        document.querySelectorAll('.resource-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const type = e.target.dataset.resource;
                const value = parseInt(e.target.value) || 0;
                
                if (type === 'stamina') {
                    this.currentCharacter.stats.stamina = value;
                } else if (this.currentCharacter.stats[type]) {
                    this.currentCharacter.stats[type].current = value;
                }
                
                autoSave();
            });
        });
    }
};

// Global verfügbar machen
window.GamePage = GamePage;

console.log('game-page.js geladen (vollständige Version)');
