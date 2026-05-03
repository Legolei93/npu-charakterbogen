/**
 * Liquid Orbs Visualizer - HP/Chakra als Fluessigkeitskugeln
 */

const LiquidOrbs = {
    // Konfiguration
    config: {
        hp: {
            color: '#e74c3c',
            secondaryColor: '#c0392b',
            icon: '[Herz]',
            name: 'Lebenspunkte'
        },
        chakra: {
            color: '#3498db',
            secondaryColor: '#2980b9',
            icon: '[Blitz]',
            name: 'Chakra'
        },
        stamina: {
            color: '#f39c12',
            secondaryColor: '#e67e22',
            icon: '[Feuer]',
            name: 'Stamina'
        }
    },
    
    /**
     * Rendert eine Fluessigkeitskugel
     */
    renderOrb(type, current, max, size = 'medium') {
        const config = this.config[type];
        if (!config) return '';
        
        const percentage = Math.max(0, Math.min(100, (current / max) * 100));
        
        const sizeClass = size === 'large' ? 'orb-large' : size === 'small' ? 'orb-small' : 'orb-medium';
        
        return `
            <div class="liquid-orb ${sizeClass} orb-${type}" data-type="${type}">
                <div class="orb-container">
                    <div class="orb-background"></div>
                    <div class="orb-liquid" style="height: ${percentage}%; background: linear-gradient(180deg, ${config.color} 0%, ${config.secondaryColor} 100%);">
                        <div class="liquid-wave"></div>
                        <div class="liquid-bubbles">
                            <span class="bubble"></span>
                            <span class="bubble"></span>
                            <span class="bubble"></span>
                        </div>
                    </div>
                    <div class="orb-shine"></div>
                </div>
                <div class="orb-content">
                    <span class="orb-icon">${config.icon}</span>
                    <span class="orb-value">${Math.floor(current)}</span>
                    <span class="orb-max">/${Math.floor(max)}</span>
                </div>
                <div class="orb-controls">
                    <button class="orb-btn minus" onclick="LiquidOrbs.adjustValue('${type}', -1)">-</button>
                    <button class="orb-btn plus" onclick="LiquidOrbs.adjustValue('${type}', 1)">+</button>
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert alle drei Kugeln (HP, Chakra, Stamina)
     */
    renderAllOrbs(character, size = 'medium') {
        if (!character || !character.stats) return '';
        
        const stats = character.stats;
        
        return `
            <div class="liquid-orbs-container">
                ${this.renderOrb('hp', stats.hp?.current || 0, stats.hp?.max || 10, size)}
                ${this.renderOrb('chakra', stats.chakra?.current || 0, stats.chakra?.max || 10, size)}
                ${this.renderOrb('stamina', stats.stamina || 0, 10, size)}
            </div>
        `;
    },
    
    /**
     * Aktualisiert eine Kugel
     */
    updateOrb(type, current, max) {
        const orb = document.querySelector(`.liquid-orb[data-type="${type}"]`)
        if (!orb) return;
        
        const percentage = Math.max(0, Math.min(100, (current / max) * 100));
        const liquid = orb.querySelector('.orb-liquid');
        const value = orb.querySelector('.orb-value');
        const maxEl = orb.querySelector('.orb-max');
        
        if (liquid) {
            liquid.style.height = `${percentage}%`;
        }
        if (value) {
            value.textContent = Math.floor(current);
        }
        if (maxEl) {
            maxEl.textContent = `/${Math.floor(max)}`;
        }
        
        // Fuege Animation hinzu bei grossen Aenderungen
        if (Math.abs(percentage - (current / max * 100)) > 10) {
            orb.classList.add('updating');
            setTimeout(() => orb.classList.remove('updating'), 500);
        }
    },
    
    /**
     * Passt Wert an (+/-)
     */
    adjustValue(type, change) {
        if (!currentCharacter || !currentCharacter.stats) return;
        
        let current, max;
        
        switch(type) {
            case 'hp':
                current = currentCharacter.stats.hp.current + change;
                max = currentCharacter.stats.hp.max;
                current = Math.max(0, Math.min(current, max));
                currentCharacter.stats.hp.current = current;
                
                // Pruefe auf Todeskampf
                if (current === 0 && typeof DeathSaveSystem !== 'undefined') {
                    DeathSaveSystem.startDeathSave(currentCharacter.id, currentCharacter.name);
                }
                break;
                
            case 'chakra':
                current = currentCharacter.stats.chakra.current + change;
                max = currentCharacter.stats.chakra.max;
                current = Math.max(0, Math.min(current, max));
                currentCharacter.stats.chakra.current = current;
                break;
                
            case 'stamina':
                current = (currentCharacter.stats.stamina || 0) + change;
                max = 10;
                current = Math.max(0, Math.min(current, max));
                currentCharacter.stats.stamina = current;
                break;
        }
        
        this.updateOrb(type, current, max);
        
        // Speichern
        if (typeof autoSave === 'function') {
            autoSave();
        }
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('resource_changed', {
                type: type,
                change: change,
                newValue: current
            });
        }
    },
    
    /**
     * Setzt Wert direkt
     */
    setValue(type, value) {
        if (!currentCharacter || !currentCharacter.stats) return;
        
        let max;
        switch(type) {
            case 'hp':
                max = currentCharacter.stats.hp.max;
                value = Math.max(0, Math.min(value, max));
                currentCharacter.stats.hp.current = value;
                break;
            case 'chakra':
                max = currentCharacter.stats.chakra.max;
                value = Math.max(0, Math.min(value, max));
                currentCharacter.stats.chakra.current = value;
                break;
            case 'stamina':
                max = 10;
                value = Math.max(0, Math.min(value, max));
                currentCharacter.stats.stamina = value;
                break;
        }
        
        this.updateOrb(type, value, max);
    },
    
    /**
     * Fuegt CSS-Animationen hinzu
     */
    injectStyles() {
        if (document.getElementById('liquid-orb-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'liquid-orb-styles';
        styles.textContent = `
            @keyframes wave {
                0%, 100% { transform: translateX(0) translateY(0); }
                50% { transform: translateX(-25%) translateY(2px); }
            }
            
            @keyframes bubble {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-20px) scale(1); opacity: 0; }
            }
            
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.2); }
                50% { box-shadow: 0 0 30px rgba(0,0,0,0.3); }
            }
            
            .liquid-orb.updating .orb-liquid {
                transition: height 0.5s ease-out;
            }
        `;
        document.head.appendChild(styles);
    },
    
    /**
     * Initialisiert das System
     */
    init() {
        this.injectStyles();
        console.log('LiquidOrbs initialisiert');
    }
};

// Global verfuegbar machen
window.LiquidOrbs = LiquidOrbs;
