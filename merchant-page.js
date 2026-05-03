/**
 * Merchant Page - Haendler-Uebersicht und Navigation
 * Zeigt alle verfuegbaren Haendler mit Filter- und Suchfunktion
 */

const MerchantPage = {
    merchants: [],
    currentCharacter: null,
    
    /**
     * Initialisiert die Haendler-Seite
     */
    async init() {
        console.log('MerchantPage.init()');
        
        this.currentCharacter = currentCharacter?.id;
        
        if (!this.currentCharacter) {
            console.error('Kein Charakter geladen');
            return;
        }
        
        await this.loadMerchants();
        this.render();
    },
    
    /**
     * Laedt alle Haendler (Offline-Version mit Demo-Daten)
     */
    async loadMerchants() {
        // Offline-Modus: Direkt Demo-Haendler verwenden
        console.log('Offline-Modus: Lade Demo-Haendler...');
        this.merchants = this.getDemoMerchants();
    },
    
    /**
     * Demo-Haendler fuer Testzwecke
     * Nur 4 Haendler: Taro, Yuki, Shin + Kira (Schwarzhaendlerin, erscheint zufaellig)
     */
    getDemoMerchants() {
        const merchants = [
            {
                id: 'taro',
                name: 'Taro',
                title: 'der Waffenhaendler',
                location: 'Konoha Marktplatz',
                type: 'weapon',
                personality: 'neutral',
                description: 'Direkt, rau, pragmatisch',
                default_image: 'images/merchants/taro_shop.png',
                alwaysAvailable: true
            },
            {
                id: 'yuki',
                name: 'Yuki',
                title: 'die Ruestungsschmiedin',
                location: 'Konoha Handelsviertel',
                type: 'armor',
                personality: 'friendly',
                description: 'Stolz, kritisch, respektiert Staerke',
                default_image: 'images/merchants/yuki_shop.png',
                alwaysAvailable: true
            },
            {
                id: 'shin',
                name: 'Shin',
                title: 'der Allzweckhaendler',
                location: 'Hintergasse',
                type: 'general',
                personality: 'greedy',
                description: 'Freundlich, aufmerksam, vorsichtig',
                default_image: 'images/merchants/shin_shop.png',
                alwaysAvailable: true
            }
        ];
        
        // Kira erscheint nur zufaellig (ca. 1x pro Woche)
        if (this.isKiraAvailable()) {
            merchants.push({
                id: 'kira',
                name: 'Kira',
                title: 'die Schwarzhaendlerin',
                location: 'Geheime Gasse',
                type: 'black_market',
                personality: 'grumpy',
                description: 'Misstrauisch, manipulativ, gefaehrlich',
                default_image: 'images/merchants/kira_shop.png',
                alwaysAvailable: false,
                appearanceChance: 15 // 15% Chance pro Tag
            });
        }
        
        return merchants;
    },
    
    /**
     * Prueft ob Kira heute verfuegbar ist
     */
    isKiraAvailable() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('kira_last_appearance');
        const savedAvailable = localStorage.getItem('kira_available');
        
        // Wenn neuer Tag, wuerfeln
        if (savedDate !== today) {
            const roll = Math.floor(Math.random() * 100) + 1;
            const isAvailable = roll <= 15; // 15% Chance
            localStorage.setItem('kira_last_appearance', today);
            localStorage.setItem('kira_available', isAvailable ? 'true' : 'false');
            return isAvailable;
        }
        
        return savedAvailable === 'true';
    },
    
    /**
     * Rendert die Haendler-Seite
     */
    render() {
        const container = document.getElementById('merchantPage');
        if (!container) {
            console.error('merchantPage nicht gefunden');
            return;
        }
        
        container.innerHTML = `
            <div class="merchant-page-container">
                <div class="merchant-grid" id="merchantGrid">
                    ${this.renderMerchantCards()}
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert die Haendler-Karten
     */
    renderMerchantCards() {
        if (this.merchants.length === 0) {
            return '<p>Keine Haendler verfuegbar.</p>';
        }
        
        return this.merchants.map(merchant => {
            const isKira = merchant.id === 'kira';
            const specialClass = isKira ? 'kira-card' : '';
            const kiraBadge = isKira ? '<span class="kira-badge">🔮 Heute verfügbar!</span>' : '';
            
            return `
                <div class="merchant-card ${specialClass}" data-merchant-id="${merchant.id}">
                    <div class="merchant-image">
                        <img src="${merchant.default_image}" alt="${merchant.name}">
                        ${kiraBadge}
                    </div>
                    <div class="merchant-info">
                        <h3>${merchant.name} <small>${merchant.title}</small></h3>
                        <p class="merchant-description">${merchant.description}</p>
                        <div class="merchant-mood" id="mood-${merchant.id}">
                            ${this.renderMoodIndicator(merchant)}
                        </div>
                    </div>
                    <button class="btn-visit" onclick="MerchantPage.openMerchant('${merchant.id}')">
                        Besuchen
                    </button>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Rendert die Stimmungsanzeige
     */
    renderMoodIndicator(merchant) {
        const moodIcons = {
            happy: '😊',
            neutral: '😐',
            annoyed: '😤',
            angry: '😠'
        };
        
        return `<span class="mood-icon">${moodIcons[merchant.personality] || moodIcons.neutral}</span>
                <span class="mood-text">Laune: ${merchant.personality}</span>`;
    },
    
    /**
     * Oeffnet den Haendler-Dialog mit RPG Dialog System
     */
    openMerchant(merchantId) {
        console.log('Oeffne Haendler mit RPG Dialog:', merchantId);
        
        // Verwende das neue RPG Dialog System
        if (typeof MerchantDialogSystem !== 'undefined') {
            MerchantDialogSystem.init(merchantId);
        } else if (typeof MerchantUI !== 'undefined') {
            // Fallback auf altes System
            MerchantUI.init(merchantId, this.currentCharacter);
        } else {
            console.error('Kein Haendler-System gefunden');
            alert('Haendler-System wird geladen...');
        }
    }
};

// Global verfuegbar machen
window.MerchantPage = MerchantPage;