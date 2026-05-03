/**
 * Character Creation Wizard - Automatische Charaktererstellung
 * Wird bei erstem Login gestartet, wenn kein Charakter existiert
 */

const CharacterCreationWizard = {
    // Aktueller Schritt
    currentStep: 0,
    
    // Charakter-Daten waehrend der Erstellung
    newCharacter: {
        id: null,
        name: '',
        level: 1,
        xp: 0,
        ap: 0,
        clan: '',
        elements: [],
        attributes: {
            kk: 8,
            kon: 8,
            ges: 8,
            gsw: 8,
            itu: 8,
            int: 8,
            cha: 8
        },
        stats: {
            hp: { current: 10, max: 10 },
            chakra: { current: 10, max: 10 },
            stamina: 10,
            gold: 0
        },
        jutsus: [],
        // BUGFIX 3: Talente als Objekt mit Punktesystem initialisieren
        talents: {
            selected: [],
            pointsTotal: 5,
            pointsSpent: 0
        },
        inventory: [],
        equipment: {
            weapon: null,
            armor: 'leather_armor',
            accessories: []
        },
        personal: {
            age: '',
            gender: '',
            height: '',
            weight: '',
            rank: 'Genin',
            origin: '',
            village: '',
            familyStatus: '',
            religion: ''
        }
    },
    
    // Verfuegbare Attribute fuer Verteilung
    availablePoints: 26,
    
    // Min/Max fuer Attribute
    minAttribute: 8,
    maxAttribute: 16,
    
    // BUGFIX 2: Maximal 2 Attribute duerfen auf 16 sein
    maxAttributesAt16: 2,
    
    /**
     * Startet den Charaktererstellungs-Wizard
     */
    start() {
        this.currentStep = 0;
        this.newCharacter.id = 'char_' + Date.now();
        this.newCharacter.userId = currentUser?.id;
        this.showStep(0);
    },
    
    /**
     * Zeigt einen Schritt an
     */
    showStep(step) {
        const container = document.getElementById('app');
        if (!container) return;
        
        // Verstecke alle Seiten
        document.getElementById('loginPage')?.classList.add('hidden');
        
        switch(step) {
            case 0:
                container.innerHTML = this.renderWelcomeStep();
                break;
            case 1:
                container.innerHTML = this.renderPersonalDataStep();
                break;
            case 2:
                container.innerHTML = this.renderClanSelectionStep();
                break;
            case 3:
                container.innerHTML = this.renderElementSelectionStep();
                break;
            case 4:
                container.innerHTML = this.renderAttributeStep();
                break;
            case 5:
                container.innerHTML = this.renderGoldRollStep();
                break;
            case 6:
                container.innerHTML = this.renderJutsuSelectionStep();
                break;
            case 7:
                this.finishCreation();
                return;
        }
        
        this.currentStep = step;
    },
    
    /**
     * Schritt 0: Willkommen
     */
    renderWelcomeStep() {
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <div class="wizard-icon">[Ninja]</div>
                    <h1>Willkommen, ${currentUser?.username || 'Shinobi'}!</h1>
                    <p>Du hast noch keinen Charakter. Lass uns einen erstellen!</p>
                </div>
                
                <div class="wizard-content">
                    <div class="creation-preview">
                        <h3>Was erwartet dich:</h3>
                        <ul>
                            <li>Persoenliche Daten eingeben</li>
                            <li>Clan auswaehlen</li>
                            <li>Element waehlen</li>
                            <li>Attribute verteilen</li>
                            <li>Startgeld auswuerfeln</li>
                            <li>Jutsus auswaehlen</li>
                        </ul>
                    </div>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-primary" onclick="CharacterCreationWizard.nextStep()">
                        Los geht's!
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Schritt 1: Persoenliche Daten
     */
    renderPersonalDataStep() {
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <span class="step-indicator">Schritt 1/7</span>
                    <h2>Persoenliche Daten</h2>
                </div>
                
                <div class="wizard-content">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Name *</label>
                            <input type="text" id="charName" placeholder="Charaktername" 
                                value="${this.newCharacter.name}">
                        </div>
                        
                        <div class="form-group">
                            <label>Alter</label>
                            <input type="number" id="charAge" placeholder="z.B. 16" min="10" max="100">
                        </div>
                        
                        <div class="form-group">
                            <label>Geschlecht</label>
                            <select id="charGender">
                                <option value="">-- Waehlen --</option>
                                <option value="maennlich">Maennlich</option>
                                <option value="weiblich">Weiblich</option>
                                <option value="divers">Divers</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Groesse (cm)</label>
                            <input type="number" id="charHeight" placeholder="z.B. 170">
                        </div>
                        
                        <div class="form-group">
                            <label>Gewicht (kg)</label>
                            <input type="number" id="charWeight" placeholder="z.B. 60">
                        </div>
                        
                        <div class="form-group">
                            <label>Herkunft</label>
                            <select id="charOrigin">
                                <option value="">-- Waehlen --</option>
                                <option value="konoha">Konohagakure</option>
                                <option value="suna">Sunagakure</option>
                                <option value="kiri">Kirigakure</option>
                                <option value="iwa">Iwagakure</option>
                                <option value="kumo">Kumogakure</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Familienstand</label>
                            <select id="charFamily">
                                <option value="">-- Waehlen --</option>
                                <option value="ledig">Ledig</option>
                                <option value="verheiratet">Verheiratet</option>
                                <option value="verwitwet">Verwitwet</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Glaube</label>
                            <input type="text" id="charReligion" placeholder="z.B. Shinto">
                        </div>
                    </div>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-secondary" onclick="CharacterCreationWizard.prevStep()">&larr; Zurueck</button>
                    <button class="btn-primary" onclick="CharacterCreationWizard.savePersonalData()">Weiter &rarr;</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Speichert persoenliche Daten
     */
    savePersonalData() {
        const name = document.getElementById('charName')?.value?.trim();
        if (!name) {
            alert('Bitte einen Namen eingeben!');
            return;
        }
        
        this.newCharacter.name = name;
        this.newCharacter.personal.age = document.getElementById('charAge')?.value || '';
        this.newCharacter.personal.gender = document.getElementById('charGender')?.value || '';
        this.newCharacter.personal.height = document.getElementById('charHeight')?.value || '';
        this.newCharacter.personal.weight = document.getElementById('charWeight')?.value || '';
        this.newCharacter.personal.origin = document.getElementById('charOrigin')?.value || '';
        this.newCharacter.personal.familyStatus = document.getElementById('charFamily')?.value || '';
        this.newCharacter.personal.religion = document.getElementById('charReligion')?.value || '';
        
        this.nextStep();
    },
    
    /**
     * Schritt 2: Clan-Auswahl
     */
    renderClanSelectionStep() {
        const clans = [
            { id: 'uchiha', name: 'Uchiha', icon: '[Feuer]', desc: 'Feuer-Meister, Sharingan' },
            { id: 'hyuga', name: 'Hyuga', icon: '[Auge]', desc: 'Byakugan, Gentle Fist' },
            { id: 'aburame', name: 'Aburame', icon: '[Kaefer]', desc: 'Kaefer-Techniken' },
            { id: 'akimichi', name: 'Akimichi', icon: '[Gross]', desc: 'Koerper-Expansion' },
            { id: 'nara', name: 'Nara', icon: '[Schatten]', desc: 'Schatten-Manipulation' },
            { id: 'yamanaka', name: 'Yamanaka', icon: '[Blume]', desc: 'Geist-Techniken' },
            { id: 'inuzuka', name: 'Inuzuka', icon: '[Hund]', desc: 'Hunde-Partner' },
            { id: 'hozuki', name: 'Hozuki', icon: '[Wasser]', desc: 'Wasser-Koerper' },
            { id: 'hoshigaki', name: 'Hoshigaki', icon: '[Hai]', desc: 'Haifisch-Techniken' },
            { id: 'yuki', name: 'Yuki', icon: '[Eis]', desc: 'Eis-Release' },
            { id: 'guren', name: 'Guren', icon: '[Kristall]', desc: 'Kristallversteck, Shouton' },
            { id: 'none', name: 'Kein Clan', icon: '[Neutral]', desc: 'Freier Shinobi' }
        ];
        
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <span class="step-indicator">Schritt 2/7</span>
                    <h2>Clan waehlen</h2>
                </div>
                
                <div class="wizard-content">
                    <div class="clan-grid">
                        ${clans.map(clan => `
                            <div class="clan-card ${this.newCharacter.clan === clan.id ? 'selected' : ''}"
                                 onclick="CharacterCreationWizard.selectClan('${clan.id}')">
                                <span class="clan-icon">${clan.icon}</span>
                                <h4>${clan.name}</h4>
                                <p>${clan.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-secondary" onclick="CharacterCreationWizard.prevStep()">&larr; Zurueck</button>
                    <button class="btn-primary" onclick="CharacterCreationWizard.nextStep()" 
                        ${!this.newCharacter.clan ? 'disabled' : ''}>Weiter &rarr;</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Waehlt einen Clan
     */
    selectClan(clanId) {
        this.newCharacter.clan = clanId;
        this.showStep(2);
    },
    
    /**
     * Schritt 3: Element-Auswahl
     */
    renderElementSelectionStep() {
        const elements = [
            { id: 'feuer', name: 'Feuer', icon: '[Feuer]', color: '#e74c3c' },
            { id: 'wasser', name: 'Wasser', icon: '[Wasser]', color: '#3498db' },
            { id: 'wind', name: 'Wind', icon: '[Wind]', color: '#95a5a6' },
            { id: 'erde', name: 'Erde', icon: '[Erde]', color: '#795548' },
            { id: 'blitz', name: 'Blitz', icon: '[Blitz]', color: '#f39c12' },
            { id: 'neutral', name: 'Neutral', icon: '[Neutral]', color: '#bdc3c7' }
        ];
        
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <span class="step-indicator">Schritt 3/7</span>
                    <h2>Element waehlen</h2>
                </div>
                
                <div class="wizard-content">
                    <div class="element-grid">
                        ${elements.map(elem => `
                            <div class="element-card ${this.newCharacter.elements.includes(elem.id) ? 'selected' : ''}"
                                 onclick="CharacterCreationWizard.toggleElement('${elem.id}')"
                                 style="border-color: ${elem.color}">
                                <span class="element-icon">${elem.icon}</span>
                                <h4>${elem.name}</h4>
                            </div>
                        `).join('')}
                    </div>
                    <p class="hint">Waehle 1-2 Elemente</p>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-secondary" onclick="CharacterCreationWizard.prevStep()">&larr; Zurueck</button>
                    <button class="btn-primary" onclick="CharacterCreationWizard.nextStep()"
                        ${this.newCharacter.elements.length === 0 ? 'disabled' : ''}>Weiter &rarr;</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Toggle Element-Auswahl
     */
    toggleElement(elementId) {
        const index = this.newCharacter.elements.indexOf(elementId);
        if (index > -1) {
            this.newCharacter.elements.splice(index, 1);
        } else if (this.newCharacter.elements.length < 2) {
            this.newCharacter.elements.push(elementId);
        }
        this.showStep(3);
    },
    
    /**
     * Schritt 4: Attribute verteilen
     */
    renderAttributeStep() {
        const attrs = [
            { id: 'kk', name: 'Koerperkraft', short: 'KK' },
            { id: 'kon', name: 'Konstitution', short: 'KON' },
            { id: 'ges', name: 'Geschicklichkeit', short: 'GES' },
            { id: 'gsw', name: 'Geschwindigkeit', short: 'GSW' },
            { id: 'itu', name: 'Intuition', short: 'ITU' },
            { id: 'int', name: 'Intelligenz', short: 'INT' },
            { id: 'cha', name: 'Charisma', short: 'CHA' }
        ];
        
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <span class="step-indicator">Schritt 4/7</span>
                    <h2>Attribute verteilen</h2>
                    <div class="points-display">Verbleibende Punkte: <span id="remainingPoints">${this.availablePoints}</span></div>
                </div>
                
                <div class="wizard-content">
                    <div class="attributes-grid">
                        ${attrs.map(attr => {
                            const value = this.newCharacter.attributes[attr.id];
                            const cost = this.getAttributeCost(value);
                            return `
                                <div class="attribute-row">
                                    <div class="attribute-info">
                                        <span class="attr-name">${attr.name}</span>
                                        <span class="attr-short">${attr.short}</span>
                                    </div>
                                    <div class="attribute-control">
                                        <button class="btn-minus" onclick="CharacterCreationWizard.changeAttribute('${attr.id}', -1)"
                                            ${value <= this.minAttribute ? 'disabled' : ''}>-</button>
                                        <span class="attr-value">${value}</span>
                                        <button class="btn-plus" onclick="CharacterCreationWizard.changeAttribute('${attr.id}', 1)"
                                            ${value >= this.maxAttribute || this.availablePoints < cost ? 'disabled' : ''}>+</button>
                                    </div>
                                    <span class="attr-modifier">${this.getModifier(value)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-secondary" onclick="CharacterCreationWizard.prevStep()">&larr; Zurueck</button>
                    <button class="btn-primary" onclick="CharacterCreationWizard.nextStep()"
                        ${this.availablePoints !== 0 || this.getAttributesAt16Count() > this.maxAttributesAt16 ? 'disabled' : ''}>Weiter &rarr;</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Berechnet Kosten fuer Attribut-Erhoehung
     */
    getAttributeCost(currentValue) {
        if (currentValue < 13) return 1;
        if (currentValue < 15) return 2;
        return 3;
    },
    
    /**
     * BUGFIX 16: Zaehlt Attribute auf 16
     */
    getAttributesAt16Count() {
        return Object.values(this.newCharacter.attributes).filter(v => v === 16).length;
    },
    
    /**
     * Berechnet Modifikator
     */
    getModifier(value) {
        const mod = Math.floor((value - 10) / 2);
        return mod >= 0 ? `+${mod}` : mod.toString();
    },
    
    /**
     * Aendert Attribut-Wert
     */
    changeAttribute(attrId, change) {
        const currentValue = this.newCharacter.attributes[attrId];
        const newValue = currentValue + change;
        
        if (newValue < this.minAttribute || newValue > this.maxAttribute) return;
        
        const cost = change > 0 ? this.getAttributeCost(currentValue) : -this.getAttributeCost(currentValue - 1);
        
        if (this.availablePoints - cost < 0) return;
        
        // BUGFIX 2: Pruefe ob bereits 2 Attribute auf 16 sind
        if (change > 0 && newValue === 16) {
            const attributesAt16 = Object.values(this.newCharacter.attributes).filter(v => v === 16).length;
            // Wenn dieses Attribut noch nicht auf 16 ist, zaehle es mit
            const currentAt16 = currentValue === 16 ? 1 : 0;
            if (attributesAt16 - currentAt16 >= this.maxAttributesAt16) {
                console.log('BUGFIX 2: Bereits 2 Attribute auf 16 - Erhoehung blockiert');
                return;
            }
        }
        
        this.newCharacter.attributes[attrId] = newValue;
        this.availablePoints -= cost;
        
        // Aktualisiere Anzeige
        document.getElementById('remainingPoints').textContent = this.availablePoints;
        this.showStep(4);
    },
    
    /**
     * Schritt 5: Geld auswuerfeln
     */
    renderGoldRollStep() {
        const hasRolled = this.newCharacter.stats.gold > 0;
        
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <span class="step-indicator">Schritt 5/7</span>
                    <h2>Startgeld auswuerfeln</h2>
                </div>
                
                <div class="wizard-content">
                    <div class="gold-roll-section">
                        ${hasRolled ? `
                            <div class="gold-result">
                                <div class="gold-amount">[Gold] ${this.newCharacter.stats.gold} Gold</div>
                                <p>Dein Startkapital!</p>
                            </div>
                        ` : `
                            <div class="gold-roll-info">
                                <p>Wuerfle dein Startgeld:</p>
                                <div class="gold-formula">2W6 x 10 Gold</div>
                                <p class="gold-range">Moeglich: 20 - 120 Gold</p>
                            </div>
                            <button class="btn-roll" onclick="CharacterCreationWizard.rollGold()">
                                Wuerfeln!
                            </button>
                        `}
                    </div>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-secondary" onclick="CharacterCreationWizard.prevStep()">&larr; Zurueck</button>
                    <button class="btn-primary" onclick="CharacterCreationWizard.nextStep()"
                        ${!hasRolled ? 'disabled' : ''}>Weiter &rarr;</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Wuerfelt Startgeld
     */
    rollGold() {
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        const total = (roll1 + roll2) * 10;
        
        this.newCharacter.stats.gold = total;
        
        // Animation
        let displayGold = 0;
        const interval = setInterval(() => {
            displayGold += 5;
            if (displayGold >= total) {
                clearInterval(interval);
                this.showStep(5);
            }
        }, 50);
    },
    
    /**
     * Schritt 6: Jutsus auswaehlen
     */
    renderJutsuSelectionStep() {
        // Filtere verfuegbare Jutsus basierend auf Element und Clan
        let availableJutsus = [];
        
        if (typeof JUTSU_DATA !== 'undefined') {
            availableJutsus = JUTSU_DATA.filter(j => {
                // Nur E-Rang und D-Rang fuer Level 1
                if (!['E', 'D'].includes(j.rank)) return false;
                
                // Element-Filter
                if (j.element !== 'neutral' && !this.newCharacter.elements.includes(j.element)) {
                    return false;
                }
                
                // Clan-Filter
                if (j.clan && j.clan !== this.newCharacter.clan) {
                    return false;
                }
                
                return true;
            });
        }
        
        const selectedCount = this.newCharacter.jutsus.length;
        const maxJutsus = 3;
        
        return `
            <div class="creation-wizard">
                <div class="wizard-header">
                    <span class="step-indicator">Schritt 6/7</span>
                    <h2>Jutsus waehlen</h2>
                    <div class="jutsu-counter">${selectedCount}/${maxJutsus} gewaehlt</div>
                </div>
                
                <div class="wizard-content">
                    <div class="jutsu-selection-grid">
                        ${availableJutsus.map(jutsu => {
                            const isSelected = this.newCharacter.jutsus.some(j => j.jutsuId === jutsu.id);
                            return `
                                <div class="jutsu-select-card ${isSelected ? 'selected' : ''} rank-${jutsu.rank}"
                                     onclick="CharacterCreationWizard.toggleJutsu('${jutsu.id}', '${jutsu.name}', '${jutsu.rank}')">
                                    <div class="jutsu-rank-badge">${jutsu.rank}</div>
                                    <h4>${jutsu.name}</h4>
                                    <div class="jutsu-info">
                                        <span>${jutsu.type}</span>
                                        <span>[Chakra] ${jutsu.chakra}</span>
                                    </div>
                                    <p class="jutsu-desc">${jutsu.description?.substring(0, 60) || ''}...</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="wizard-actions">
                    <button class="btn-secondary" onclick="CharacterCreationWizard.prevStep()">&larr; Zurueck</button>
                    <button class="btn-primary" onclick="CharacterCreationWizard.nextStep()"
                        ${selectedCount === 0 ? 'disabled' : ''}>Weiter &rarr;</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Toggle Jutsu-Auswahl
     */
    toggleJutsu(jutsuId, name, rank) {
        const index = this.newCharacter.jutsus.findIndex(j => j.jutsuId === jutsuId);
        const maxJutsus = 3;
        
        if (index > -1) {
            this.newCharacter.jutsus.splice(index, 1);
        } else if (this.newCharacter.jutsus.length < maxJutsus) {
            this.newCharacter.jutsus.push({
                id: 'jutsu_' + Date.now(),
                jutsuId: jutsuId,
                name: name,
                rank: rank,
                level: 1,
                status: 'learned'
            });
        }
        
        this.showStep(6);
    },
    
    /**
     * Beendet die Charaktererstellung
     */
    finishCreation() {
        console.log('[FLOW] CharacterCreation.finishCreation START');
        
        // ==================== HARDE VALIDIERUNG ====================
        
        // 1. Prüfe Attribute - keine negativen Punkte
        if (this.availablePoints < 0) {
            console.error('[FLOW] finishCreation FAILED: Zu viele Punkte verteilt');
            alert('FEHLER: Du hast mehr Punkte verteilt als verfügbar!\n\nVerfügbare Punkte: 26\nVerbleibende Punkte: ' + this.availablePoints);
            return false;
        }
        
        // 2. Prüfe Attribute - maximal 2 Attribute auf 16
        const attributesAt16 = Object.values(this.newCharacter.attributes).filter(v => v === 16).length;
        if (attributesAt16 > this.maxAttributesAt16) {
            console.error('[FLOW] finishCreation FAILED: Zu viele Attribute auf 16');
            alert(`FEHLER: Maximal ${this.maxAttributesAt16} Attribute dürfen auf 16 sein!\n\nAktuell: ${attributesAt16} Attribute auf 16`);
            return false;
        }
        
        // 3. Prüfe Talente - keine negativen Punkte
        const talentPoints = this.newCharacter.talents;
        const remainingTalentPoints = talentPoints.pointsTotal - talentPoints.pointsSpent;
        if (remainingTalentPoints < 0) {
            console.error('[FLOW] finishCreation FAILED: Zu viele Talentpunkte');
            alert('FEHLER: Du hast mehr Talentpunkte ausgegeben als verfügbar!\n\nVerfügbare Punkte: 5\nAusgegeben: ' + talentPoints.pointsSpent);
            return false;
        }
        
        // 4. Prüfe Talente - maximal 2 Talente mit Kosten >= 7
        const highCostTalents = talentPoints.selected.filter(t => {
            const talentData = TALENTS_DB?.[t.id];
            return talentData && talentData.cost >= 7;
        }).length;
        if (highCostTalents > 2) {
            console.error('[FLOW] finishCreation FAILED: Zu viele teure Talente');
            alert(`FEHLER: Maximal 2 Talente mit Kosten >= 7 erlaubt!\n\nAktuell: ${highCostTalents} teure Talente`);
            return false;
        }
        
        // 5. Prüfe Jutsus - maximal 3
        if (this.newCharacter.jutsus.length > 3) {
            console.error('[FLOW] finishCreation FAILED: Zu viele Jutsus');
            alert('FEHLER: Maximal 3 Jutsus erlaubt!\n\nAktuell: ' + this.newCharacter.jutsus.length);
            return false;
        }
        
        // 6. Prüfe ob Name gesetzt ist
        if (!this.newCharacter.name || this.newCharacter.name.trim() === '') {
            console.error('[FLOW] finishCreation FAILED: Kein Name');
            alert('FEHLER: Bitte gib einen Namen ein!');
            return false;
        }
        
        // 7. Prüfe ob Clan gewählt wurde
        if (!this.newCharacter.clan || this.newCharacter.clan === '') {
            console.error('[FLOW] finishCreation FAILED: Kein Clan');
            alert('FEHLER: Bitte wähle einen Clan!');
            return false;
        }
        
        console.log('[FLOW] finishCreation VALIDATION PASSED');
        
        // ==================== CHARAKTER ERSTELLEN ====================
        
        // Berechne abgeleitete Werte
        this.calculateDerivedStats();
        
        // Clan-Start-Jutsus automatisch hinzufügen
        this.addClanStartingJutsus();
        
        // Startausrüstung hinzufügen
        this.addStartingEquipment();
        
        // Account-gebundenes Speichern
        let saved = false;
        
        // Versuche mit AccountSystem
        if (typeof AccountSystem !== 'undefined' && AccountSystem.isLoggedIn()) {
            saved = AccountSystem.saveCharacter(this.newCharacter);
        }
        
        // Fallback zu altem System
        if (!saved) {
            const currentUser = (typeof AuthSystem !== 'undefined') ? AuthSystem.getCurrentUser() : null;
            if (currentUser) {
                this.newCharacter.userId = currentUser.id;
                this.newCharacter.userName = currentUser.username;
                
                const storageKey = `npu_characters_${currentUser.id}`;
                const savedChars = localStorage.getItem(storageKey);
                let characters = savedChars ? JSON.parse(savedChars) : [];
                characters.push(this.newCharacter);
                localStorage.setItem(storageKey, JSON.stringify(characters));
                saved = true;
                
                console.log('Charakter erstellt für User:', currentUser.username);
            }
        }
        
        if (!saved) {
            console.error('FEHLER: Charakter konnte nicht gespeichert werden!');
            alert('FEHLER: Charakter konnte nicht gespeichert werden! Bitte melde dich erneut an.');
            return false;
        }
        
        // Aktualisiere currentCharacter
        currentCharacter = this.newCharacter;
        window.currentCharacter = this.newCharacter;
        
        // FIX 5: StateManager Sync
        if (typeof StateManager !== 'undefined' && StateManager.setCharacter) {
            StateManager.setCharacter(this.newCharacter);
            console.log('[CHAR SAVE] Character via StateManager gesetzt');
        }
        
        // Initialisiere Quest System für neuen Charakter
        if (typeof QuestEngine !== 'undefined') {
            QuestEngine.init();
        }
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('character_created', {
                name: this.newCharacter.name,
                clan: this.newCharacter.clan
            });
        }
        
        // Zeige Erfolgs-Nachricht
        alert(`✅ Charakter "${this.newCharacter.name}" wurde erfolgreich erstellt!

📊 Attribute: 26 Punkte verteilt
🎯 Talente: ${this.newCharacter.talents.selected.length} gewählt
📜 Jutsus: ${this.newCharacter.jutsus.length} gelernt
⚔️ Ausrüstung: Startausrüstung erhalten`);
        
        // Zeige App
        showApp();
        renderCharacter();
        
        return true;
    },
    
    /**
     * Berechnet abgeleitete Werte (KORREKT MIT MODIFIKATOREN)
     */
    calculateDerivedStats() {
        const attrs = this.newCharacter.attributes;
        
        // Hilfsfunktion: Wert zu Modifikator
        const getMod = (val) => {
            if (val <= 7) return -2;
            if (val <= 9) return -1;
            if (val <= 11) return 0;
            if (val <= 13) return 1;
            if (val <= 15) return 2;
            if (val <= 17) return 3;
            if (val <= 19) return 4;
            return 5;
        };
        
        const mods = {
            kon: getMod(attrs.kon),
            int: getMod(attrs.int),
            gsw: getMod(attrs.gsw),
            ges: getMod(attrs.ges),
            kk: getMod(attrs.kk),
            itu: getMod(attrs.itu),
            cha: getMod(attrs.cha)
        };
        
        // HP: 30 + KON-Mod + 6 (Festwert statt 1W12)
        this.newCharacter.stats.hp.max = 30 + mods.kon + 6;
        this.newCharacter.stats.hp.current = this.newCharacter.stats.hp.max;
        
        // Chakra: 100 + KON-Mod + INT-Mod + 22 (Festwert statt 2W20)
        this.newCharacter.stats.chakra.max = 100 + mods.kon + mods.int + 22;
        this.newCharacter.stats.chakra.current = this.newCharacter.stats.chakra.max;
        
        // Stamina: 3 + höherer Wert aus (KON-Mod ODER GSW-Mod)
        this.newCharacter.stats.stamina = Math.max(0, 3 + Math.max(mods.kon, mods.gsw));
    },
    
    /**
     * BUGFIX 19: Fuegt Clan-Start-Jutsus automatisch hinzu
     * Diese Jutsus werden ZUSÄTZLICH zu den gewählten Jutsus gegeben
     */
    addClanStartingJutsus() {
        if (!this.newCharacter.clan || this.newCharacter.clan === 'none') {
            return; // Kein Clan = keine Clan-Jutsus
        }
        
        // Prüfe ob Clan-Boni definiert sind
        if (typeof CLAN_BONUSES === 'undefined') {
            console.warn('CLAN_BONUSES nicht verfügbar');
            return;
        }
        
        const clanData = CLAN_BONUSES[this.newCharacter.clan];
        if (!clanData || !clanData.startingJutsu || clanData.startingJutsu.length === 0) {
            return; // Keine Start-Jutsus für diesen Clan
        }
        
        // JUTSU_DATA muss verfügbar sein
        if (typeof JUTSU_DATA === 'undefined') {
            console.warn('JUTSU_DATA nicht verfügbar');
            return;
        }
        
        // Füge jedes Clan-Start-Jutsu hinzu (wenn nicht bereits vorhanden)
        clanData.startingJutsu.forEach(jutsuId => {
            // Prüfe ob Jutsu bereits im Charakter vorhanden ist
            const alreadyHas = this.newCharacter.jutsus.some(j => j.jutsuId === jutsuId);
            if (alreadyHas) {
                return; // Überspringen - bereits vorhanden
            }
            
            // Finde Jutsu in JUTSU_DATA
            const jutsuData = JUTSU_DATA.find(j => j.id === jutsuId);
            if (!jutsuData) {
                console.warn(`Clan-Start-Jutsu nicht gefunden: ${jutsuId}`);
                return;
            }
            
            // Füge Jutsu zum Charakter hinzu
            this.newCharacter.jutsus.push({
                id: 'jutsu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                jutsuId: jutsuId,
                name: jutsuData.name,
                rank: jutsuData.rank,
                level: 1,
                status: 'learned'
            });
            
            console.log(`Clan-Start-Jutsu hinzugefügt: ${jutsuData.name}`);
        });
    },
    
    /**
     * Fuegt Startauesruestung hinzu
     */
    addStartingEquipment() {
        // Standard: Leder-Ruestung, Kunai, Shuriken
        this.newCharacter.inventory = [
            { id: 'leather_armor', name: 'Leder-Ruestung', type: 'armor', equipped: true },
            { id: 'kunai', name: 'Kunai', type: 'weapon', quantity: 3, equipped: true },
            { id: 'shuriken', name: 'Shuriken', type: 'weapon', quantity: 5, equipped: false }
        ];
    },
    
    /**
     * Naechster Schritt
     */
    nextStep() {
        this.showStep(this.currentStep + 1);
    },
    
    /**
     * Vorheriger Schritt
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
};

// Global verfuegbar machen
window.CharacterCreationWizard = CharacterCreationWizard;
