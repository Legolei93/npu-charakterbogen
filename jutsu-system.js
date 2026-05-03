/**
 * Jutsu System - Erweitertes Jutsu-Management
 * Filter, Leveling, Tooltips, Admin Override
 */

const JutsuSystem = {
    // Aktuell ausgewähltes Jutsu für Admin Override
    selectedJutsuId: null,
    
    // Tooltip Element
    tooltipEl: null,
    
    /**
     * Initialisiert das Jutsu-System
     */
    init() {
        this.tooltipEl = document.getElementById('jutsuTooltip');
        console.log('JutsuSystem initialisiert');
    },
    
    /**
     * Filter anwenden auf Jutsu-Dropdown
     */
    applyFilters() {
        if (typeof updateJutsuDropdown === 'function') {
            updateJutsuDropdown();
        }
    },
    
    /**
     * Filter zurücksetzen
     */
    resetFilters() {
        const elementFilter = document.getElementById('jutsuFilterElement');
        const typeFilter = document.getElementById('jutsuFilterType');
        const rankFilter = document.getElementById('jutsuFilterRank');
        
        if (elementFilter) elementFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        if (rankFilter) rankFilter.value = '';
        
        this.applyFilters();
    },
    
    /**
     * Berechnet die Level-Up Kosten basierend auf Rang und aktuellem Level
     */
    getLevelUpCost(rank, currentLevel) {
        const costs = {
            'E': [1, 2, 3, 4],      // Level 1->2, 2->3, 3->4, 4->5
            'D': [2, 3, 4, 5],
            'C': [3, 4, 5, 6],
            'B': [4, 5, 6, 7],
            'A': [5, 6, 7, 8],
            'S': [6, 7, 8, 10]
        };
        
        const rankCosts = costs[rank] || costs['E'];
        return rankCosts[currentLevel - 1] || 10;
    },
    
    /**
     * Levelt ein Jutsu auf das nächste Level
     */
    levelUpJutsu(jutsuId) {
        if (!currentCharacter || !currentCharacter.jutsus) {
            alert('Kein Charakter geladen!');
            return;
        }
        
        const jutsu = currentCharacter.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) {
            alert('Jutsu nicht gefunden!');
            return;
        }
        
        const currentLevel = jutsu.level || 1;
        const maxLevel = 5;
        
        if (currentLevel >= maxLevel) {
            alert('Dieses Jutsu hat bereits das maximale Level erreicht!');
            return;
        }
        
        const cost = this.getLevelUpCost(jutsu.rank, currentLevel);
        
        if ((currentCharacter.ap || 0) < cost) {
            alert(`Nicht genug AP! Benötigt: ${cost} AP, Vorhanden: ${currentCharacter.ap || 0} AP`);
            return;
        }
        
        // Bestätigung
        if (!confirm(`Jutsu "${jutsu.name}" auf Level ${currentLevel + 1} erhöhen?\n\nKosten: ${cost} AP`)) {
            return;
        }
        
        // AP abziehen und Level erhöhen
        currentCharacter.ap -= cost;
        jutsu.level = currentLevel + 1;
        
        // Log-Eintrag
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('jutsu_levelup', {
                jutsuName: jutsu.name,
                oldLevel: currentLevel,
                newLevel: jutsu.level,
                cost: cost
            });
        }
        
        // Speichern und neu rendern
        if (typeof autoSave === 'function') autoSave();
        if (typeof renderJutsuCards === 'function') renderJutsuCards();
        if (typeof updateStats === 'function') updateStats();
        
        alert(`"${jutsu.name}" ist jetzt Level ${jutsu.level}!`);
    },
    
    /**
     * Zeigt den Tooltip für ein Jutsu an
     */
    showTooltip(event, jutsuId) {
        if (!this.tooltipEl || !currentCharacter) return;
        
        const jutsu = currentCharacter.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) return;
        
        const elementData = ELEMENT_DATA[jutsu.element] || { name: jutsu.element, icon: '📜' };
        const level = jutsu.level || 1;
        
        // Rang-Farben
        const rankColors = {
            'E': '#90EE90', 'D': '#87CEEB', 'C': '#FFD700',
            'B': '#FF8C00', 'A': '#DC143C', 'S': '#8B008B'
        };
        
        // Berechne modifizierte Werte basierend auf Level
        let chakraCost = jutsu.chakraCost || jutsu.chakra || 0;
        let damage = jutsu.damage || '-';
        
        if (level > 1 && typeof Rules !== 'undefined' && Rules.JUTSU_LEVEL) {
            chakraCost = Math.round(chakraCost * Rules.JUTSU_LEVEL.chakraModifier[level]);
            
            // Schaden modifizieren wenn vorhanden
            if (damage && damage.includes('W')) {
                // Würfelschaden - zeige Bonus an
                const bonus = Math.round((Rules.JUTSU_LEVEL.damageModifier[level] - 1) * 100);
                damage = `${damage} (+${bonus}%)`;
            }
        }
        
        this.tooltipEl.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-name">${jutsu.name}</span>
                <span class="tooltip-rank" style="background: ${rankColors[jutsu.rank] || '#ccc'}; color: ${jutsu.rank === 'C' ? '#000' : '#fff'};">${jutsu.rank}-Rang</span>
            </div>
            
            <div class="tooltip-section">
                <div class="tooltip-label">Element</div>
                <div class="tooltip-value">${elementData.icon} ${elementData.name}</div>
            </div>
            
            <div class="tooltip-section">
                <div class="tooltip-label">Typ</div>
                <div class="tooltip-value">${jutsu.type || 'Ninjutsu'}</div>
            </div>
            
            <div class="tooltip-section">
                <div class="tooltip-label">Level</div>
                <div class="tooltip-value">${level} / 5 ${level >= 5 ? '⭐' : ''}</div>
            </div>
            
            <div class="tooltip-section">
                <div class="tooltip-label">Chakra-Kosten</div>
                <div class="tooltip-value">⚡ ${chakraCost} ${level > 1 ? `(effizient)` : ''}</div>
            </div>
            
            ${jutsu.damage ? `
                <div class="tooltip-section">
                    <div class="tooltip-label">Schaden</div>
                    <div class="tooltip-value">⚔️ ${damage}</div>
                </div>
            ` : ''}
            
            ${jutsu.rangeM ? `
                <div class="tooltip-section">
                    <div class="tooltip-label">Reichweite</div>
                    <div class="tooltip-value">📏 ${jutsu.rangeM}m</div>
                </div>
            ` : ''}
            
            ${jutsu.effect ? `
                <div class="tooltip-section">
                    <div class="tooltip-label">Effekt</div>
                    <div class="tooltip-value">✨ ${jutsu.effect}</div>
                </div>
            ` : ''}
            
            ${jutsu.description ? `
                <div class="tooltip-description">${jutsu.description}</div>
            ` : ''}
            
            <div class="tooltip-section" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">
                <div class="tooltip-label">Status</div>
                <div class="tooltip-value">
                    ${jutsu.status === 'learned' ? '✅ Erlernt' : 
                      jutsu.status === 'training' ? '📖 Im Training' : '🔒 Gesperrt'}
                </div>
            </div>
        `;
        
        // Position berechnen
        const rect = event.currentTarget.getBoundingClientRect();
        let left = rect.right + 10;
        let top = rect.top;
        
        // Verhindere, dass Tooltip außerhalb des Bildschirms geht
        if (left + 350 > window.innerWidth) {
            left = rect.left - 360;
        }
        if (top + 300 > window.innerHeight) {
            top = window.innerHeight - 320;
        }
        
        this.tooltipEl.style.left = `${left}px`;
        this.tooltipEl.style.top = `${top}px`;
        this.tooltipEl.classList.add('visible');
    },
    
    /**
     * Versteckt den Tooltip
     */
    hideTooltip() {
        if (this.tooltipEl) {
            this.tooltipEl.classList.remove('visible');
        }
    },
    
    /**
     * Admin: Lädt ein Jutsu für Override
     */
    adminSelectJutsu(jutsuId) {
        this.selectedJutsuId = jutsuId;
        
        if (!currentCharacter || !jutsuId) return;
        
        const jutsu = currentCharacter.jutsus.find(j => j.id === jutsuId);
        if (!jutsu) return;
        
        // Fülle Admin-Formular
        const chakraInput = document.getElementById('adminJutsuChakra');
        const damageInput = document.getElementById('adminJutsuDamage');
        const rangeInput = document.getElementById('adminJutsuRange');
        const descInput = document.getElementById('adminJutsuDesc');
        
        if (chakraInput) chakraInput.value = jutsu.chakraCost || jutsu.chakra || '';
        if (damageInput) damageInput.value = jutsu.damage || '';
        if (rangeInput) rangeInput.value = jutsu.rangeM || '';
        if (descInput) descInput.value = jutsu.description || '';
    },
    
    /**
     * Admin: Speichert Override-Werte
     */
    adminOverrideCurrentJutsu() {
        if (!this.selectedJutsuId || !currentCharacter) {
            alert('Kein Jutsu ausgewählt!');
            return;
        }
        
        const jutsu = currentCharacter.jutsus.find(j => j.id === this.selectedJutsuId);
        if (!jutsu) {
            alert('Jutsu nicht gefunden!');
            return;
        }
        
        const chakraInput = document.getElementById('adminJutsuChakra');
        const damageInput = document.getElementById('adminJutsuDamage');
        const rangeInput = document.getElementById('adminJutsuRange');
        const descInput = document.getElementById('adminJutsuDesc');
        
        // Speichere Override-Werte
        jutsu.adminOverride = {
            chakraCost: chakraInput?.value ? parseInt(chakraInput.value) : undefined,
            damage: damageInput?.value || undefined,
            rangeM: rangeInput?.value ? parseInt(rangeInput.value) : undefined,
            description: descInput?.value || undefined,
            timestamp: new Date().toISOString()
        };
        
        // Wende Override an
        if (jutsu.adminOverride.chakraCost !== undefined) {
            jutsu.chakraCost = jutsu.adminOverride.chakraCost;
        }
        if (jutsu.adminOverride.damage !== undefined) {
            jutsu.damage = jutsu.adminOverride.damage;
        }
        if (jutsu.adminOverride.rangeM !== undefined) {
            jutsu.rangeM = jutsu.adminOverride.rangeM;
        }
        if (jutsu.adminOverride.description !== undefined) {
            jutsu.description = jutsu.adminOverride.description;
        }
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('admin_jutsu_override', {
                jutsuName: jutsu.name,
                overrides: jutsu.adminOverride
            });
        }
        
        if (typeof autoSave === 'function') autoSave();
        if (typeof renderJutsuCards === 'function') renderJutsuCards();
        
        alert(`Jutsu "${jutsu.name}" wurde aktualisiert!`);
    },
    
    /**
     * Admin: Setzt Jutsu auf Standardwerte zurück
     */
    adminResetJutsu() {
        if (!this.selectedJutsuId || !currentCharacter) {
            alert('Kein Jutsu ausgewählt!');
            return;
        }
        
        const jutsu = currentCharacter.jutsus.find(j => j.id === this.selectedJutsuId);
        if (!jutsu) {
            alert('Jutsu nicht gefunden!');
            return;
        }
        
        if (!confirm(`Jutsu "${jutsu.name}" auf Standardwerte zurücksetzen?`)) {
            return;
        }
        
        // Lösche Override
        delete jutsu.adminOverride;
        
        // Lade Originalwerte aus JUTSU_DATA
        const originalJutsu = JUTSU_DATA.find(j => j.id === jutsu.jutsuId);
        if (originalJutsu) {
            jutsu.chakraCost = originalJutsu.chakra;
            jutsu.damage = originalJutsu.damage;
            jutsu.rangeM = originalJutsu.rangeM;
            jutsu.description = originalJutsu.description;
        }
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('admin_jutsu_reset', {
                jutsuName: jutsu.name
            });
        }
        
        if (typeof autoSave === 'function') autoSave();
        if (typeof renderJutsuCards === 'function') renderJutsuCards();
        
        // Formular zurücksetzen
        this.adminSelectJutsu(this.selectedJutsuId);
        
        alert(`Jutsu "${jutsu.name}" wurde zurückgesetzt!`);
    },
    
    /**
     * Prüft ob ein Jutsu gelernt werden kann (Voraussetzungen)
     */
    canLearnJutsu(jutsuData) {
        if (!currentCharacter) return { canLearn: false, reason: 'Kein Charakter' };
        
        // Prüfe bereits gelernt
        const alreadyLearned = currentCharacter.jutsus.some(j => j.jutsuId === jutsuData.id);
        if (alreadyLearned) {
            return { canLearn: false, reason: 'Bereits erlernt' };
        }
        
        // Prüfe Level-Beschränkungen
        if (currentCharacter.level === 1) {
            const rankOrder = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };
            if (rankOrder[jutsuData.rank] > rankOrder['B']) {
                return { canLearn: false, reason: 'Auf Level 1 nur bis B-Rang möglich' };
            }
            
            // Max 1 B-Rang auf Level 1
            if (jutsuData.rank === 'B') {
                const bRankCount = currentCharacter.jutsus.filter(j => j.rank === 'B').length;
                if (bRankCount >= 1) {
                    return { canLearn: false, reason: 'Maximal 1 B-Rang auf Level 1' };
                }
            }
        }
        
        // Prüfe Clan-Voraussetzung
        if (jutsuData.clan && jutsuData.clan !== currentCharacter.clan) {
            return { canLearn: false, reason: `Erfordert Clan: ${jutsuData.clan}` };
        }
        
        // Prüfe Element
        if (jutsuData.element && jutsuData.element !== 'neutral') {
            const hasElement = currentCharacter.elements?.includes(jutsuData.element);
            if (!hasElement && !jutsuData.clan) {
                return { canLearn: false, reason: `Erfordert Element: ${jutsuData.element}` };
            }
        }
        
        return { canLearn: true, reason: null };
    }
};

// Global verfügbar machen
window.JutsuSystem = JutsuSystem;