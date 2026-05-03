/**
 * Merchant UI - Frontend für das Händler-System
 * Interaktive Händler-Interaktion mit Dialogen, Kauf/Verkauf und Feilschen
 * OFFLINE-VERSION (funktioniert ohne Server)
 */

const MerchantUI = {
    currentMerchant: null,
    currentCharacter: null,
    haggleResult: null,
    selectedItem: null,
    mode: 'buy',
    
    // Händler-Stimmung und Beziehung
    merchantState: {
        mood: 'neutral', // 'happy', 'neutral', 'annoyed', 'angry'
        relationship: 0, // -10 bis +10
        trust: 0, // 0 bis 100
        lastInteraction: null,
        dailySmallTalkUsed: false,
        bargainAttempts: 0,
        playerMemory: {
            totalPurchases: 0,
            totalSales: 0,
            bargainSuccess: 0,
            bargainFail: 0,
            annoyingBehavior: 0
        }
    },
    
    /**
     * Initialisiert die Händler-UI
     */
    async init(merchantId, characterId) {
        console.log('MerchantUI.init()', merchantId, characterId);
        
        this.currentCharacter = characterId;
        this.currentMerchant = this.getDemoMerchantData(merchantId);
        
        // Lade gespeicherten Zustand oder initialisiere neu
        this.loadMerchantState();
        
        // Bestimme Stimmung basierend auf verschiedenen Faktoren
        this.determineMood();
        
        this.render();
        this.showDialog('greeting');
    },
    
    /**
     * Lädt den gespeicherten Händler-Zustand
     */
    loadMerchantState() {
        const saved = localStorage.getItem(`merchant_state_${this.currentMerchant?.merchant?.id}`);
        if (saved) {
            this.merchantState = JSON.parse(saved);
        } else {
            // Initialisiere neuen Zustand basierend auf Persönlichkeit
            this.initializeMerchantState();
        }
    },
    
    /**
     * Speichert den Händler-Zustand
     */
    saveMerchantState() {
        if (this.currentMerchant?.merchant?.id) {
            localStorage.setItem(
                `merchant_state_${this.currentMerchant.merchant.id}`,
                JSON.stringify(this.merchantState)
            );
        }
    },
    
    /**
     * Initialisiert den Händler-Zustand basierend auf Persönlichkeit
     */
    initializeMerchantState() {
        const personality = this.currentMerchant?.merchant?.personality || 'neutral';
        
        // Startwerte basierend auf Persönlichkeit
        const startValues = {
            friendly: { mood: 'happy', relationship: 2, trust: 30 },
            neutral: { mood: 'neutral', relationship: 0, trust: 20 },
            greedy: { mood: 'neutral', relationship: -1, trust: 10 },
            grumpy: { mood: 'annoyed', relationship: -2, trust: 5 },
            suspicious: { mood: 'neutral', relationship: -1, trust: 5 }
        };
        
        const start = startValues[personality] || startValues.neutral;
        
        this.merchantState = {
            mood: start.mood,
            relationship: start.relationship,
            trust: start.trust,
            lastInteraction: new Date().toISOString(),
            dailySmallTalkUsed: false,
            bargainAttempts: 0,
            playerMemory: {
                totalPurchases: 0,
                totalSales: 0,
                bargainSuccess: 0,
                bargainFail: 0,
                annoyingBehavior: 0
            }
        };
        
        this.saveMerchantState();
    },
    
    /**
     * Bestimmt die aktuelle Stimmung des Händlers
     */
    determineMood() {
        const memory = this.merchantState.playerMemory;
        const personality = this.currentMerchant?.merchant?.personality || 'neutral';
        
        // Basis-Stimmung aus Beziehung
        let moodScore = this.merchantState.relationship;
        
        // Modifikatoren basierend auf Verhalten
        if (memory.bargainFail > memory.bargainSuccess) moodScore -= 2;
        if (memory.annoyingBehavior > 2) moodScore -= 3;
        if (memory.totalPurchases > 5) moodScore += 1;
        
        // Persönlichkeits-Modifikatoren
        const personalityModifiers = {
            friendly: 1,
            neutral: 0,
            greedy: -1,
            grumpy: -2,
            suspicious: -1
        };
        
        moodScore += personalityModifiers[personality] || 0;
        
        // Stimmung bestimmen
        if (moodScore >= 3) this.merchantState.mood = 'happy';
        else if (moodScore >= 0) this.merchantState.mood = 'neutral';
        else if (moodScore >= -3) this.merchantState.mood = 'annoyed';
        else this.merchantState.mood = 'angry';
    },
    
    /**
     * Führt einen Charisma-Wurf durch
     */
    rollCharisma() {
        // W20 + CHA Modifikator (vereinfacht für Offline)
        const roll = Math.floor(Math.random() * 20) + 1;
        const chaMod = 0; // Sollte aus Charakter kommen
        return { roll, total: roll + chaMod, success: roll + chaMod >= 10 };
    },
    
    /**
     * Small Talk - Verbessert Beziehung
     */
    smallTalk() {
        if (this.merchantState.dailySmallTalkUsed) {
            this.showDialog('smallTalkUsed');
            return;
        }
        
        const charismaRoll = this.rollCharisma();
        const personality = this.currentMerchant?.merchant?.personality;
        
        let success = false;
        let relationshipChange = 0;
        
        // Erfolg basierend auf Wurf und Persönlichkeit
        if (charismaRoll.success) {
            success = true;
            relationshipChange = 1;
            
            // Einige Persönlichkeiten sind schwerer zu beeindrucken
            if (personality === 'grumpy' || personality === 'suspicious') {
                if (charismaRoll.roll < 15) {
                    success = false;
                    relationshipChange = 0;
                }
            }
        } else {
            // Misserfolg kann Beziehung verschlechtern
            if (personality === 'grumpy' || personality === 'greedy') {
                relationshipChange = -1;
            }
        }
        
        // Anwenden
        this.merchantState.relationship += relationshipChange;
        this.merchantState.dailySmallTalkUsed = true;
        
        if (success) {
            this.merchantState.trust = Math.min(100, this.merchantState.trust + 5);
        }
        
        this.determineMood();
        this.saveMerchantState();
        
        // LOGGING: Small Talk
        if (typeof GameLog !== 'undefined') {
            GameLog.merchant('smallTalk', {
                merchantId: this.currentMerchant?.merchant?.id,
                merchantName: this.currentMerchant?.merchant?.name,
                success: success,
                charismaRoll: charismaRoll?.roll,
                relationshipChange: relationshipChange,
                newRelationship: this.merchantState?.relationship,
                newTrust: this.merchantState?.trust,
                mood: this.merchantState?.mood
            });
        }
        
        // Dialog anzeigen
        this.showDialog(success ? 'smallTalkSuccess' : 'smallTalkFail');
        this.updateMoodDisplay();
    },
    
    /**
     * Aktualisiert die Stimmungs-Anzeige
     */
    updateMoodDisplay() {
        const moodEl = document.getElementById('merchantMood');
        if (moodEl) {
            const moodLabels = {
                happy: '😊 Gut gelaunt',
                neutral: '😐 Neutral',
                annoyed: '😠 Genervt',
                angry: '😡 Wütend'
            };
            moodEl.textContent = moodLabels[this.merchantState.mood] || 'Neutral';
            moodEl.className = `merchant-mood ${this.merchantState.mood}`;
        }
        
        // Beziehungsbalken aktualisieren
        const trustEl = document.getElementById('merchantTrust');
        if (trustEl) {
            trustEl.style.width = `${this.merchantState.trust}%`;
        }
    },
    
    /**
     * Demo-Händler-Daten für Offline-Modus - ERWEITERTES SORTIMENT
     */
    getDemoMerchantData(merchantId) {
        const demoMerchants = {
            'demo-1': {
                merchant: {
                    id: 'demo-1',
                    name: 'Taro der Waffenhändler',
                    location: 'Konoha Marktplatz',
                    type: 'weapon',
                    personality: 'neutral',
                    allows_haggle: true,
                    haggle_difficulty: 12,
                    current_image: 'images/merchants/taro_neutral.png',
                    shop_image: 'images/merchants/taro_shop.png',
                    emotion_images: {
                        angry: 'images/merchants/taro_angry.png',
                        happy: 'images/merchants/taro_happy.png',
                        thinking: 'images/merchants/taro_thinking.png',
                        neutral: 'images/merchants/taro_neutral.png'
                    }
                },
                greeting: 'Willkommen in meiner Schmiede! Suchst du etwas Scharfes?',
                inventory: [
                    // Waffen - Grundausstattung
                    { item_id: 'w1', name: 'Kunai', type: 'weapon', buy_price: 50, final_price: 50, stats: { damage: '1W4', range: '10m' } },
                    { item_id: 'w2', name: 'Shuriken (5x)', type: 'weapon', buy_price: 30, final_price: 30, stats: { damage: '1W3', range: '15m' } },
                    { item_id: 'w3', name: 'Katana', type: 'weapon', buy_price: 500, final_price: 500, stats: { damage: '1W8', bonus: '+1 ATK' } },
                    { item_id: 'w4', name: 'Wakizashi', type: 'weapon', buy_price: 350, final_price: 350, stats: { damage: '1W6', bonus: '+1 Initiative' } },
                    { item_id: 'w5', name: 'Tanto', type: 'weapon', buy_price: 200, final_price: 200, stats: { damage: '1W4', bonus: 'Versteckt' } },
                    { item_id: 'w6', name: 'Kusarigama', type: 'weapon', buy_price: 400, final_price: 400, stats: { damage: '1W6', range: '3m', bonus: 'Umklammern' } },
                    { item_id: 'w7', name: 'Bo-Stab', type: 'weapon', buy_price: 150, final_price: 150, stats: { damage: '1W6', range: '2m', bonus: 'Reichweite' } },
                    { item_id: 'w8', name: 'Sai (Paar)', type: 'weapon', buy_price: 250, final_price: 250, stats: { damage: '1W4', bonus: 'Parade +1' } },
                    { item_id: 'w9', name: 'Chakra-Klinge', type: 'weapon', buy_price: 800, final_price: 800, stats: { damage: '1W8', bonus: 'Chakra-Durchdringung' } },
                    { item_id: 'w10', name: 'Explosions-Tag', type: 'weapon', buy_price: 100, final_price: 100, stats: { damage: '2W6', range: 'Wurf', bonus: 'Explosiv' } },
                    // Fernwaffen
                    { item_id: 'w11', name: 'Langbogen', type: 'weapon', buy_price: 300, final_price: 300, stats: { damage: '1W8', range: '60m' } },
                    { item_id: 'w12', name: 'Senbon (10x)', type: 'weapon', buy_price: 40, final_price: 40, stats: { damage: '1W2', range: '20m', bonus: 'Präzise' } }
                ]
            },
            'demo-2': {
                merchant: {
                    id: 'demo-2',
                    name: 'Yuki die Rüstungsschmiedin',
                    location: 'Konoha Handelsviertel',
                    type: 'armor',
                    personality: 'friendly',
                    allows_haggle: true,
                    haggle_difficulty: 10,
                    current_image: 'images/merchants/default.svg'
                },
                greeting: 'Hallo! Ich habe die beste Rüstung weit und breit!',
                inventory: [
                    // Rüstungen
                    { item_id: 'a1', name: 'Chuunin-Weste', type: 'armor', buy_price: 200, final_price: 200, stats: { rk: 1, bonus: 'Standard' } },
                    { item_id: 'a2', name: 'Jounin-Rüstung', type: 'armor', buy_price: 600, final_price: 600, stats: { rk: 2, bonus: 'Chakra-Resistenz' } },
                    { item_id: 'a3', name: 'Arm-Schienen (Leder)', type: 'armor', buy_price: 150, final_price: 150, stats: { rk: 1, slot: 'Arme' } },
                    { item_id: 'a4', name: 'Arm-Schienen (Metall)', type: 'armor', buy_price: 300, final_price: 300, stats: { rk: 2, slot: 'Arme' } },
                    { item_id: 'a5', name: 'Beinschienen (Leder)', type: 'armor', buy_price: 150, final_price: 150, stats: { rk: 1, slot: 'Beine' } },
                    { item_id: 'a6', name: 'Beinschienen (Metall)', type: 'armor', buy_price: 300, final_price: 300, stats: { rk: 2, slot: 'Beine' } },
                    { item_id: 'a7', name: 'Helm (Standard)', type: 'armor', buy_price: 100, final_price: 100, stats: { rk: 1, slot: 'Kopf' } },
                    { item_id: 'a8', name: 'Helm (Verstärkt)', type: 'armor', buy_price: 250, final_price: 250, stats: { rk: 2, slot: 'Kopf', bonus: 'Genjutsu-Resistenz' } },
                    { item_id: 'a9', name: 'Brustpanzer (Leicht)', type: 'armor', buy_price: 400, final_price: 400, stats: { rk: 2, slot: 'Brust' } },
                    { item_id: 'a10', name: 'Brustpanzer (Schwer)', type: 'armor', buy_price: 800, final_price: 800, stats: { rk: 3, slot: 'Brust', malus: '-1 GSW' } },
                    { item_id: 'a11', name: 'ANBU-Maske', type: 'armor', buy_price: 500, final_price: 500, stats: { rk: 1, slot: 'Kopf', bonus: 'Versteckt +2' } },
                    { item_id: 'a12', name: 'Chakra-Rüstung', type: 'armor', buy_price: 1200, final_price: 1200, stats: { rk: 2, bonus: 'Chakra-Regeneration +5' } }
                ]
            },
            'demo-3': {
                merchant: {
                    id: 'demo-3',
                    name: 'Shin der Geizige',
                    location: 'Hintergasse',
                    type: 'general',
                    personality: 'greedy',
                    allows_haggle: true,
                    haggle_difficulty: 18,
                    current_image: 'images/merchants/default.svg'
                },
                greeting: 'Was willst du? Beeil dich, ich habe keine Zeit!',
                inventory: [
                    // Heilung
                    { item_id: 'c1', name: 'Heiltrank (klein)', type: 'consumable', buy_price: 100, final_price: 100, stats: { heal: '1W8 HP' } },
                    { item_id: 'c2', name: 'Heiltrank (mittel)', type: 'consumable', buy_price: 250, final_price: 250, stats: { heal: '2W8 HP' } },
                    { item_id: 'c3', name: 'Heiltrank (groß)', type: 'consumable', buy_price: 500, final_price: 500, stats: { heal: '4W8 HP' } },
                    { item_id: 'c4', name: 'Antidot', type: 'consumable', buy_price: 150, final_price: 150, stats: { effect: 'Heilt Gift' } },
                    // Chakra
                    { item_id: 'c5', name: 'Chakra-Tablette', type: 'consumable', buy_price: 150, final_price: 150, stats: { chakra: 20 } },
                    { item_id: 'c6', name: 'Chakra-Elixier', type: 'consumable', buy_price: 350, final_price: 350, stats: { chakra: 50 } },
                    { item_id: 'c7', name: 'Stamina-Trank', type: 'consumable', buy_price: 200, final_price: 200, stats: { stamina: 2 } },
                    // Werkzeuge
                    { item_id: 'c8', name: 'Rauchbombe', type: 'consumable', buy_price: 75, final_price: 75, stats: { effect: 'Nebel 10m Radius' } },
                    { item_id: 'c9', name: 'Blitzkugel', type: 'consumable', buy_price: 100, final_price: 100, stats: { effect: 'Blenden, W20+GSW>15' } },
                    { item_id: 'c10', name: 'Seil (20m)', type: 'misc', buy_price: 30, final_price: 30, stats: { use: 'Klettern/Binden' } },
                    { item_id: 'c11', name: 'Wetzstein', type: 'misc', buy_price: 50, final_price: 50, stats: { use: 'Waffenpflege' } },
                    { item_id: 'c12', name: 'Feldverpflegung (3 Tage)', type: 'consumable', buy_price: 45, final_price: 45, stats: { use: 'Überleben' } }
                ]
            },
            'demo-4': {
                merchant: {
                    id: 'demo-4',
                    name: 'Meister Chen',
                    location: 'Tempel des Wissens',
                    type: 'magic',
                    personality: 'generous',
                    allows_haggle: true,
                    haggle_difficulty: 8,
                    current_image: 'images/merchants/default.svg'
                },
                greeting: 'Willkommen, junger Ninja. Möge dein Weg erleuchtet sein.',
                inventory: [
                    // Schriftrollen
                    { item_id: 'm1', name: 'Schriftrolle (Feuer)', type: 'misc', buy_price: 300, final_price: 300, stats: { element: 'Katon', use: 'Jutsu lernen' } },
                    { item_id: 'm2', name: 'Schriftrolle (Wasser)', type: 'misc', buy_price: 300, final_price: 300, stats: { element: 'Suiton', use: 'Jutsu lernen' } },
                    { item_id: 'm3', name: 'Schriftrolle (Erde)', type: 'misc', buy_price: 300, final_price: 300, stats: { element: 'Doton', use: 'Jutsu lernen' } },
                    { item_id: 'm4', name: 'Schriftrolle (Wind)', type: 'misc', buy_price: 300, final_price: 300, stats: { element: 'Futon', use: 'Jutsu lernen' } },
                    { item_id: 'm5', name: 'Schriftrolle (Blitz)', type: 'misc', buy_price: 400, final_price: 400, stats: { element: 'Raiton', use: 'Jutsu lernen' } },
                    // Kristalle
                    { item_id: 'm6', name: 'Chakra-Kristall (klein)', type: 'misc', buy_price: 500, final_price: 500, stats: { chakra_boost: 50 } },
                    { item_id: 'm7', name: 'Chakra-Kristall (groß)', type: 'misc', buy_price: 1000, final_price: 1000, stats: { chakra_boost: 100 } },
                    { item_id: 'm8', name: 'Heiliger Kristall', type: 'misc', buy_price: 2000, final_price: 2000, stats: { effect: 'Regeneration +10/Runde' } },
                    // Spezial
                    { item_id: 'm9', name: 'Lehrbuch: Ninjutsu', type: 'misc', buy_price: 800, final_price: 800, stats: { skill: 'Ninjutsu +1' } },
                    { item_id: 'm10', name: 'Lehrbuch: Genjutsu', type: 'misc', buy_price: 800, final_price: 800, stats: { skill: 'Genjutsu +1' } },
                    { item_id: 'm11', name: 'Lehrbuch: Taijutsu', type: 'misc', buy_price: 800, final_price: 800, stats: { skill: 'Taijutsu +1' } },
                    { item_id: 'm12', name: 'Verbotenes Wissen', type: 'misc', buy_price: 5000, final_price: 5000, stats: { rank: 'S', warning: 'Gefährlich' } }
                ]
            },
            'demo-5': {
                merchant: {
                    id: 'demo-5',
                    name: 'Kira die Schwarzhändlerin',
                    location: 'Geheime Gasse',
                    type: 'black_market',
                    personality: 'grumpy',
                    allows_haggle: true,
                    haggle_difficulty: 15,
                    current_image: 'images/merchants/default.svg'
                },
                greeting: 'Psst! Nicht so laut! Was willst du?',
                inventory: [
                    { item_id: 'b1', name: 'Verbotenes Jutsu', type: 'misc', buy_price: 1000, final_price: 1000, stats: { rank: 'S', warning: 'Illegal' } },
                    { item_id: 'b2', name: 'Schwarzmarkt-Ware', type: 'misc', buy_price: 250, final_price: 250, stats: { illegal: true, origin: 'Unbekannt' } },
                    { item_id: 'b3', name: 'Gestohlene Waffe', type: 'weapon', buy_price: 600, final_price: 600, stats: { damage: '1W8', bonus: 'ANBU-Qualität', illegal: true } },
                    { item_id: 'b4', name: 'Verfluchtes Item', type: 'misc', buy_price: 800, final_price: 800, stats: { effect: 'Unbekannt', curse: 'Möglich' } },
                    { item_id: 'b5', name: 'Fälschung (Kunai)', type: 'weapon', buy_price: 25, final_price: 25, stats: { damage: '1W4-1', quality: 'Schlecht' } },
                    { item_id: 'b6', name: 'Informations-Disk', type: 'misc', buy_price: 500, final_price: 500, stats: { use: 'Geheimnisse', illegal: true } },
                    { item_id: 'b7', name: 'Vergiftete Klinge', type: 'weapon', buy_price: 450, final_price: 450, stats: { damage: '1W6', bonus: 'Gift 1W4/Runde' } },
                    { item_id: 'b8', name: 'ANBU-Ausrüstung', type: 'armor', buy_price: 1500, final_price: 1500, stats: { rk: 3, bonus: 'Versteckt', illegal: true } },
                    { item_id: 'b9', name: 'Dunkles Chakra-Kristall', type: 'misc', buy_price: 1200, final_price: 1200, stats: { chakra: 80, malus: '-1 Karma' } },
                    { item_id: 'b10', name: 'Missions-Unterlagen', type: 'misc', buy_price: 300, final_price: 300, stats: { use: 'Geheim-Info', illegal: true } }
                ]
            }
        };
        
        return demoMerchants[merchantId] || demoMerchants['demo-1'];
    },
    
    /**
     * Rendert die Händler-UI - ERWEITERT mit Stimmung und Interaktion
     */
    render() {
        const container = document.getElementById('merchantModal');
        if (!container) {
            this.createModal();
            return this.render();
        }
        
        const merchant = this.currentMerchant.merchant;
        const moodLabel = {
            happy: '😊 Gut gelaunt',
            neutral: '😐 Neutral',
            annoyed: '😠 Genervt',
            angry: '😡 Wütend'
        }[this.merchantState.mood] || 'Neutral';
        
        container.innerHTML = `
            <div class="merchant-modal-content">
                <!-- Header -->
                <div class="merchant-header">
                    <div class="merchant-info">
                        <h2>${merchant.name}</h2>
                        <span class="merchant-location">📍 ${merchant.location}</span>
                        <span class="merchant-type">${this.getMerchantTypeLabel(merchant.type)}</span>
                    </div>
                    <div class="merchant-status">
                        <div class="merchant-mood ${this.merchantState.mood}" id="merchantMood">${moodLabel}</div>
                        <div class="trust-bar">
                            <div class="trust-fill" id="merchantTrust" style="width: ${this.merchantState.trust}%"></div>
                        </div>
                        <small>Vertrauen: ${this.merchantState.trust}%</small>
                    </div>
                    <button class="btn-close" onclick="MerchantUI.close()">×</button>
                </div>
                
                <!-- Dialog-Bereich mit Bild -->
                <div class="merchant-dialog" style="background-image: url('${merchant.shop_image || merchant.current_image}'); background-size: cover; background-position: center;">
                    <div class="merchant-dialog-overlay">
                        <div class="merchant-portrait">
                            <img id="merchantPortrait" 
                                 src="${merchant.current_image || 'images/merchants/default.svg'}" 
                                 alt="${merchant.name}"
                                 onerror="this.src='images/merchants/default.svg'">
                        </div>
                        <div class="merchant-speech-bubble">
                            <p id="merchantDialogText">${this.currentMerchant.greeting}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Interaktions-Buttons -->
                <div class="merchant-interactions">
                    <button class="btn-smalltalk" 
                            onclick="MerchantUI.smallTalk()"
                            ${this.merchantState.dailySmallTalkUsed ? 'disabled' : ''}>
                        💬 Small Talk ${this.merchantState.dailySmallTalkUsed ? '(Heute bereits genutzt)' : ''}
                    </button>
                    <button class="btn-relationship" onclick="MerchantUI.showRelationshipInfo()">
                        ℹ️ Beziehung: ${this.merchantState.relationship > 0 ? '+' : ''}${this.merchantState.relationship}
                    </button>
                </div>
                
                <!-- Tabs -->
                <div class="merchant-tabs">
                    <button class="tab-btn ${this.mode === 'buy' ? 'active' : ''}" 
                            onclick="MerchantUI.setMode('buy')">🛒 Kaufen</button>
                    <button class="tab-btn ${this.mode === 'sell' ? 'active' : ''}" 
                            onclick="MerchantUI.setMode('sell')">💰 Verkaufen</button>
                </div>
                
                <!-- Gold-Anzeige -->
                <div class="merchant-gold">
                    💰 Dein Gold: <span id="playerGold">${this.getCharacterGold()}</span>
                </div>
                
                <!-- Item-Liste -->
                <div class="merchant-items" id="merchantItems">
                    ${this.mode === 'buy' 
                        ? this.renderBuyItems() 
                        : this.renderSellItems()
                    }
                </div>
                
                <!-- Detail-Ansicht -->
                <div id="itemDetail" class="item-detail hidden">
                    ${this.renderItemDetail()}
                </div>
            </div>
        `;
        
        container.classList.remove('hidden');
    },
    
    /**
     * Erstellt das Modal
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'merchantModal';
        modal.className = 'modal hidden merchant-modal';
        document.body.appendChild(modal);
    },
    
    /**
     * Rendert Kaufbare Items
     */
    renderBuyItems() {
        const items = this.currentMerchant.inventory;
        
        if (items.length === 0) {
            return '<p class="no-items">Der Händler hat momentan nichts im Angebot.</p>';
        }
        
        return `
            <div class="items-grid">
                ${items.map(item => `
                    <div class="merchant-item ${item.type}" 
                         onclick="MerchantUI.selectItem('${item.item_id}', 'buy')"
                         data-item-id="${item.item_id}">
                        <div class="item-icon">${this.getItemIcon(item.type)}</div>
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-type">${item.type}</span>
                        </div>
                        <div class="item-price">
                            <span class="price-tag">${item.final_price} 💰</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Rendert Verkaufbare Items
     */
    renderSellItems() {
        const inventory = this.getCharacterInventory();
        
        if (inventory.length === 0) {
            return '<p class="no-items">Du hast nichts zu verkaufen.</p>';
        }
        
        return `
            <div class="items-grid">
                ${inventory.map(item => `
                    <div class="merchant-item ${item.type}" 
                         onclick="MerchantUI.selectItem('${item.item_id}', 'sell')"
                         data-item-id="${item.item_id}">
                        <div class="item-icon">${this.getItemIcon(item.type)}</div>
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">${item.quantity || 1}×</span>
                        </div>
                        <div class="item-price">
                            <span class="price-tag">${Math.floor((item.buy_price || 50) * 0.5)} 💰</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Rendert Item-Details - ERWEITERT mit Händler-Kommentar
     */
    renderItemDetail() {
        if (!this.selectedItem) return '';
        
        const isBuy = this.mode === 'buy';
        const price = isBuy 
            ? (this.haggleResult?.finalPrice || this.selectedItem.final_price)
            : Math.floor((this.selectedItem.buy_price || 50) * 0.5);
        
        // Generiere Händler-Kommentar für das Item
        const itemComment = this.generateItemComment();
        
        return `
            <div class="detail-content">
                <h3>${this.selectedItem.name}</h3>
                
                ${itemComment ? `
                    <div class="merchant-item-comment">
                        <span class="comment-label">${this.currentMerchant?.merchant?.name}:</span>
                        <p class="comment-text">"${itemComment}"</p>
                    </div>
                ` : ''}
                
                ${this.selectedItem.stats ? this.renderItemStats(this.selectedItem.stats) : ''}
                
                <div class="detail-price">
                    <span class="label">${isBuy ? 'Preis:' : 'Verkaufspreis:'}</span>
                    <span class="price ${this.haggleResult?.success ? 'discounted' : ''}">${price} 💰</span>
                    ${this.haggleResult?.success ? `
                        <span class="original-price">${this.selectedItem.final_price} 💰</span>
                    ` : ''}
                </div>
                
                <div class="detail-actions">
                    ${isBuy ? `
                        ${this.currentMerchant.merchant.allows_haggle ? `
                            <button class="btn-haggle" onclick="MerchantUI.attemptHaggle()">🎲 Feilschen</button>
                        ` : ''}
                        <button class="btn-buy" onclick="MerchantUI.buyItem()">💰 Kaufen</button>
                    ` : `
                        <button class="btn-sell" onclick="MerchantUI.sellItem()">💰 Verkaufen</button>
                    `}
                </div>
                
                ${this.haggleResult ? `
                    <div class="haggle-result ${this.haggleResult.result}">
                        <p>${this.haggleResult.message}</p>
                        ${this.haggleResult.result !== 'normal' ? `
                            <span class="roll-info">Wurf: ${this.haggleResult.roll} (DC: ${this.haggleResult.dc})</span>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    /**
     * Generiert einen dynamischen Händler-Kommentar für das ausgewählte Item
     */
    generateItemComment() {
        if (!this.selectedItem) return '';
        
        const personality = this.currentMerchant?.merchant?.personality || 'neutral';
        const item = this.selectedItem;
        const mood = this.merchantState?.mood || 'neutral';
        
        // Item-Typ-spezifische Kommentare
        const typeComments = {
            weapon: {
                neutral: [
                    'Solide Waffe. Damit wirst du keine Probleme haben.',
                    'Gute Wahl. Scharf und zuverlässig.',
                    'Standard-Ausrüstung. Nichts Besonderes, aber funktional.'
                ],
                happy: [
                    'Ah, ein Kenner! Diese Waffe hat schon viele Schlachten gewonnen!',
                    'Ausgezeichnete Wahl! Damit wirst du unbesiegbar!',
                    'Eine wahre Schönheit, nicht wahr?'
                ],
                annoyed: [
                    'Nimm es und stell keine Fragen.',
                    'Es tötet. Was willst du mehr?',
                    'Pah. Wie alle anderen auch.'
                ]
            },
            armor: {
                neutral: [
                    'Guter Schutz. Wird seinen Zweck erfüllen.',
                    'Solide Verarbeitung.',
                    'Standard-Rüstung. Zuverlässig.'
                ],
                happy: [
                    'Damit bist du bestens geschützt!',
                    'Exzellente Wahl! Sicherheit geht vor!',
                    'Diese Rüstung hat schon viele Leben gerettet!'
                ],
                annoyed: [
                    'Es schützt. Mehr nicht.',
                    'Schwer, unbequem, aber funktioniert.',
                    'Nimm es oder lass es.'
                ]
            },
            consumable: {
                neutral: [
                    'Nützlich in kritischen Situationen.',
                    'Standard-Qualität. Tut was es soll.',
                    'Immer gut, welche dabei zu haben.'
                ],
                happy: [
                    'Ah, vorbereitet! Das gefällt mir!',
                    'Kluge Wahl! Man kann nie zu vorsichtig sein!',
                    'Diese Tränke sind erstklassig!'
                ],
                annoyed: [
                    'Hoffentlich brauchst du sie nicht.',
                    'Teuer für etwas, das du vielleicht nie brauchst.',
                    'Pah. Verlass dich lieber auf deine Fähigkeiten.'
                ]
            },
            misc: {
                neutral: [
                    'Nützliches Werkzeug.',
                    'Kann in manchen Situationen helfen.',
                    'Standard-Ausrüstung.'
                ],
                happy: [
                    'Ah, jemand der vorbereitet ist!',
                    'Damit bist du für alles gerüstet!',
                    'Gute Wahl!'
                ],
                annoyed: [
                    'Nimm es und geh.',
                    'Wenn du meinst, dass du das brauchst...',
                    'Verschwendung von Gold, wenn du mich fragst.'
                ]
            }
        };
        
        // Spezielle Kommentare für bestimmte Items
        const specialComments = {
            'Kunai': {
                neutral: ['Der Klassiker. Jeder Ninja braucht welche.'],
                happy: ['Ah, die Basics! Damit hast du schon als Anfänger angefangen, oder?'],
                annoyed: ['Kunai. Wie jeder andere auch.']
            },
            'Katana': {
                neutral: ['Ehre würdige Waffe. Respektiere sie.'],
                happy: ['Eine wahre Meisterwerk! Damit wirst du Legenden schreiben!'],
                annoyed: ['Teuer. Aber Qualität hat ihren Preis.']
            },
            'Chuunin-Weste': {
                neutral: ['Offizielle Ausrüstung. Pflicht für jeden Chuunin.'],
                happy: ['Stolz tragen! Du hast dir den Rang verdient!'],
                annoyed: ['Nimm sie. Nächster.']
            },
            'Heiltrank': {
                neutral: ['Immer nützlich. Man weiß ja nie.'],
                happy: ['Klug! Gesundheit ist das Wichtigste!'],
                annoyed: ['Hoffentlich brauchst du sie nicht wegen eigener Dummheit.']
            }
        };
        
        // Prüfe auf speziellen Kommentar
        if (specialComments[item.name] && specialComments[item.name][mood]) {
            const pool = specialComments[item.name][mood];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        // Fallback auf Typ-Kommentar
        const itemType = item.type || 'misc';
        const typePool = typeComments[itemType];
        
        if (typePool && typePool[mood]) {
            const pool = typePool[mood];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        // Generischer Fallback
        const genericComments = {
            happy: ['Gute Wahl!', 'Damit wirst du zufrieden sein!', 'Ausgezeichnet!'],
            neutral: ['Solide Wahl.', 'Wird seinen Zweck erfüllen.', 'Funktional.'],
            annoyed: ['Nimm es und geh.', 'Es ist was es ist.', 'Pah.']
        };
        
        const fallbackPool = genericComments[mood] || genericComments.neutral;
        return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    },
    
    /**
     * Rendert Item-Stats
     */
    renderItemStats(stats) {
        const statsHtml = Object.entries(stats)
            .map(([key, value]) => `
                <div class="stat-row">
                    <span class="stat-name">${this.translateStat(key)}:</span>
                    <span class="stat-value">${value}</span>
                </div>
            `).join('');
        
        return `<div class="item-stats">${statsHtml}</div>`;
    },
    
    /**
     * Item auswählen
     */
    selectItem(itemId, mode) {
        this.mode = mode;
        this.haggleResult = null;
        
        if (mode === 'buy') {
            this.selectedItem = this.currentMerchant.inventory.find(i => i.item_id === itemId);
        } else {
            this.selectedItem = currentCharacter?.inventory?.find(i => i.item_id === itemId);
        }
        
        document.querySelectorAll('.merchant-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.itemId === itemId);
        });
        
        document.getElementById('itemDetail').classList.remove('hidden');
        document.getElementById('itemDetail').innerHTML = this.renderItemDetail();
        
        this.showDialog(mode === 'buy' ? 'buy' : 'sell');
    },
    
    /**
     * Feilschen - ERWEITERT mit Stimmung und Beziehung
     */
    attemptHaggle() {
        if (!this.selectedItem) return;
        
        // Erhöhe Feilsch-Zähler
        this.merchantState.bargainAttempts++;
        
        const roll = Math.floor(Math.random() * 20) + 1;
        let dc = this.currentMerchant.merchant.haggle_difficulty || 12;
        
        // Modifikatoren basierend auf Stimmung
        const moodModifiers = {
            happy: -2,      // Einfacher feilschen wenn gut gelaunt
            neutral: 0,
            annoyed: +3,    // Schwerer wenn genervt
            angry: +5       // Sehr schwer wenn wütend
        };
        dc += moodModifiers[this.merchantState.mood] || 0;
        
        // Modifikator basierend auf Beziehung
        const relationshipMod = Math.floor(this.merchantState.relationship / 2);
        dc -= relationshipMod;
        
        // Modifikator basierend auf Vertrauen
        const trustMod = Math.floor((this.merchantState.trust - 50) / 20);
        dc -= trustMod;
        
        // Zu oft feilschen macht den Händler sauer
        if (this.merchantState.bargainAttempts > 3) {
            dc += (this.merchantState.bargainAttempts - 3) * 2;
            this.merchantState.playerMemory.annoyingBehavior++;
        }
        
        // Minimaler DC
        dc = Math.max(5, dc);
        
        let result, priceModifier, message;
        
        // Persönlichkeits-basierte Nachrichten
        const personality = this.currentMerchant?.merchant?.personality || 'neutral';
        
        if (roll === 20) {
            result = 'critical_success';
            priceModifier = 0.70;
            message = this.getHaggleMessage(personality, 'critical_success');
            this.merchantState.playerMemory.bargainSuccess++;
            this.merchantState.relationship += 1;
        } else if (roll === 1) {
            result = 'critical_fail';
            priceModifier = 1.25;
            message = this.getHaggleMessage(personality, 'critical_fail');
            this.merchantState.playerMemory.bargainFail++;
            this.merchantState.relationship -= 2;
        } else if (roll >= dc) {
            result = 'success';
            priceModifier = 0.85;
            message = this.getHaggleMessage(personality, 'success');
            this.merchantState.playerMemory.bargainSuccess++;
            this.merchantState.relationship += 0.5;
        } else {
            result = 'fail';
            priceModifier = 1.10;
            message = this.getHaggleMessage(personality, 'fail');
            this.merchantState.playerMemory.bargainFail++;
            this.merchantState.relationship -= 1;
        }
        
        // Stimmung neu berechnen
        this.determineMood();
        this.saveMerchantState();
        
        this.haggleResult = {
            roll,
            dc,
            success: roll >= dc,
            result,
            priceModifier,
            message,
            finalPrice: Math.floor(this.selectedItem.final_price * priceModifier)
        };
        
        document.getElementById('itemDetail').innerHTML = this.renderItemDetail();
        this.showDialog('haggle');
        this.updateMoodDisplay();
        
        // LOGGING: Feilsch
        if (typeof GameLog !== 'undefined') {
            GameLog.merchant('haggle', {
                merchantId: this.currentMerchant?.merchant?.id,
                merchantName: this.currentMerchant?.merchant?.name,
                itemId: this.selectedItem?.item_id,
                itemName: this.selectedItem?.name,
                roll: roll,
                dc: dc,
                result: result,
                priceModifier: priceModifier,
                finalPrice: this.haggleResult?.finalPrice,
                originalPrice: this.selectedItem?.final_price,
                relationshipChange: result === 'critical_success' ? 1 : result === 'success' ? 0.5 : result === 'critical_fail' ? -2 : -1,
                mood: this.merchantState?.mood
            });
        }
    },
    
    /**
     * Gibt eine persönlichkeits-basierte Feilsch-Nachricht zurück
     */
    getHaggleMessage(personality, result) {
        const messages = {
            neutral: {
                critical_success: 'Ausgezeichnet! Du kennst den Wert von Qualität!',
                success: 'Na gut, für dich mache ich eine Ausnahme.',
                fail: 'Der Preis steht fest. Nimm es oder lass es.',
                critical_fail: 'Das ist eine Beleidigung! Verschwinde!'
            },
            friendly: {
                critical_success: 'Wunderbar! Du bist ein wahrer Verhandlungsprofi!',
                success: 'Gerne! Für gute Kunden habe ich immer ein offenes Ohr.',
                fail: 'Oh, das ist etwas zu wenig. Kannst du mehr bieten?',
                critical_fail: 'Oh... das ist wirklich nicht angemessen.'
            },
            greedy: {
                critical_success: 'Du bist hart... aber fair. Einverstanden.',
                success: 'Na gut, aber nur weil ich Geld brauche!',
                fail: 'Mehr geht nicht! Willst du mich ruinieren?',
                critical_fail: 'Weg mit dir! Mit dir handle ich nicht mehr!'
            },
            grumpy: {
                critical_success: 'Hmpf... du kennst dich aus. Einverstanden.',
                success: 'Nimm es und frag nicht weiter.',
                fail: 'Nein. Und jetzt hör auf zu nerven.',
                critical_fail: 'RAUS! Sofort!'
            },
            suspicious: {
                critical_success: 'Interessant... du scheinst ehrlich zu sein.',
                success: 'Einverstanden. Aber ich behalte dich im Auge.',
                fail: 'Misstrauisch... der Preis passt nicht.',
                critical_fail: 'Versuchst du mich zu betrügen? Wachen!'
            }
        };
        
        return (messages[personality] || messages.neutral)[result];
    },
    
    /**
     * Item kaufen
     */
    buyItem() {
        if (!this.selectedItem) return;
        
        const price = this.haggleResult?.finalPrice || this.selectedItem.final_price;
        const currentGold = this.getCharacterGold();
        
        if (currentGold < price) {
            alert('❌ Nicht genug Gold!');
            return;
        }
        
        // Gold abziehen
        this.setCharacterGold(currentGold - price);
        
        // Zum Inventar hinzufügen
        const inventory = this.getCharacterInventory();
        
        const existingItem = inventory.find(
            i => i.item_id === this.selectedItem.item_id
        );
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            inventory.push({
                item_id: this.selectedItem.item_id,
                name: this.selectedItem.name,
                type: this.selectedItem.type,
                buy_price: this.selectedItem.final_price,
                quantity: 1,
                stats: this.selectedItem.stats
            });
        }
        
        alert(`✅ ${this.selectedItem.name} gekauft für ${price} Gold!`);
        
        // LOGGING: Kauf
        if (typeof GameLog !== 'undefined') {
            GameLog.merchant('buy', {
                merchantId: this.currentMerchant?.merchant?.id,
                merchantName: this.currentMerchant?.merchant?.name,
                itemId: this.selectedItem.item_id,
                itemName: this.selectedItem.name,
                price: price,
                originalPrice: this.selectedItem.final_price,
                haggleResult: this.haggleResult?.result || 'normal',
                mood: this.merchantState?.mood,
                relationship: this.merchantState?.relationship
            });
        }
        
        // Update Händler-Beziehung
        this.merchantState.playerMemory.totalPurchases++;
        this.merchantState.relationship += 0.5;
        this.merchantState.trust = Math.min(100, this.merchantState.trust + 2);
        this.determineMood();
        this.saveMerchantState();
        
        document.getElementById('playerGold').textContent = this.getCharacterGold();
        
        this.haggleResult = null;
        this.selectedItem = null;
        document.getElementById('itemDetail').classList.add('hidden');
        
        autoSave();
    },
    
    /**
     * Item verkaufen
     */
    sellItem() {
        if (!this.selectedItem) return;
        
        const sellPrice = Math.floor((this.selectedItem.buy_price || 50) * 0.5);
        
        // Gold hinzufügen
        const currentGold = this.getCharacterGold();
        this.setCharacterGold(currentGold + sellPrice);
        
        // Aus Inventar entfernen
        const inventory = this.getCharacterInventory();
        const itemIndex = inventory.findIndex(
            i => i.item_id === this.selectedItem.item_id
        );
        
        if (itemIndex > -1) {
            const item = inventory[itemIndex];
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                inventory.splice(itemIndex, 1);
            }
        }
        
        alert(`✅ ${this.selectedItem.name} verkauft für ${sellPrice} Gold!`);
        
        // LOGGING: Verkauf
        if (typeof GameLog !== 'undefined') {
            GameLog.merchant('sell', {
                merchantId: this.currentMerchant?.merchant?.id,
                merchantName: this.currentMerchant?.merchant?.name,
                itemId: this.selectedItem.item_id,
                itemName: this.selectedItem.name,
                sellPrice: sellPrice,
                originalPrice: this.selectedItem.buy_price,
                mood: this.merchantState?.mood,
                relationship: this.merchantState?.relationship
            });
        }
        
        // Update Händler-Beziehung
        this.merchantState.playerMemory.totalSales++;
        this.merchantState.relationship += 0.3;
        this.saveMerchantState();
        
        document.getElementById('playerGold').textContent = this.getCharacterGold();
        
        this.selectedItem = null;
        document.getElementById('itemDetail').classList.add('hidden');
        
        // Verkaufs-Liste neu rendern
        document.getElementById('merchantItems').innerHTML = this.renderSellItems();
        
        autoSave();
    },
    
    /**
     * Modus wechseln
     */
    setMode(mode) {
        this.mode = mode;
        this.selectedItem = null;
        this.haggleResult = null;
        
        document.getElementById('merchantItems').innerHTML = 
            mode === 'buy' ? this.renderBuyItems() : this.renderSellItems();
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', 
                (mode === 'buy' && btn.textContent.includes('Kaufen')) ||
                (mode === 'sell' && btn.textContent.includes('Verkaufen'))
            );
        });
        
        document.getElementById('itemDetail').classList.add('hidden');
    },
    
    /**
     * Dialog anzeigen - ERWEITERT mit Persönlichkeit und Stimmung
     */
    showDialog(type, context = {}) {
        const personality = this.currentMerchant?.merchant?.personality || 'neutral';
        const mood = this.merchantState?.mood || 'neutral';
        const merchantName = this.currentMerchant?.merchant?.name || 'Händler';
        
        // Persönlichkeits-basierte Dialog-Pools
        const personalityDialogs = {
            // Taro - direkt, rau, pragmatisch
            neutral: {
                greeting: {
                    happy: [
                        'Willkommen in meiner Schmiede! Suchst du etwas Scharfes?',
                        'Ah, ein Krieger! Ich habe genau das Richtige für dich.',
                        'Komm näher! Die besten Klingen der Stadt!'
                    ],
                    neutral: [
                        'Was willst du? Ich habe nicht den ganzen Tag Zeit.',
                        'Sag schon, was brauchst du?',
                        'Waffen kosten Geld. Zeit auch.'
                    ],
                    annoyed: [
                        'Wenn du nur feilschen willst, verschwinde.',
                        'Ich habe heute keine Geduld für Unsinn.',
                        'Mach es kurz. Meine Laune ist teuer.'
                    ],
                    angry: [
                        'Verschwinde! Ich verkaufe dir nichts.',
                        'Komm wieder, wenn du Manieren gelernt hast.',
                        'Mit dir mache ich keine Geschäfte mehr!'
                    ]
                },
                buy: {
                    happy: [
                        'Ausgezeichnete Wahl! Damit wirst du keine Probleme haben.',
                        'Ein wahrer Schatz! Pass gut darauf auf.',
                        'Damit bist du bestens gerüstet!'
                    ],
                    neutral: [
                        'Geschäft ist Geschäft.',
                        'Nimm es und beeil dich.',
                        'Zahl und verschwinde.'
                    ],
                    annoyed: [
                        'Nimm es und stell keine Fragen.',
                        'Pah! Zu diesem Preis mache ich Verluste.',
                        'Das ist mein letztes Angebot!'
                    ],
                    angry: [
                        'Nimm es und komm nie wieder!',
                        'Für dich nur zum Normalpreis.',
                        'Zuerst zahlen, dann reden.'
                    ]
                },
                sell: {
                    happy: [
                        'Hmm, gebraucht aber gut erhalten. Ich nehme es.',
                        'Das könnte ich gebrauchen. Zeig her!',
                        'Interessant... sehr interessant. Einverstanden!'
                    ],
                    neutral: [
                        'Ich biete dir einen fairen Preis.',
                        'Nicht schlecht, nicht schlecht.',
                        'Das ist mein letztes Angebot.'
                    ],
                    annoyed: [
                        'Das ist doch Schrott!',
                        'Dafür zahle ich kaum etwas.',
                        'Nimm das Geld und verschwinde.'
                    ],
                    angry: [
                        'Das kaufe ich nicht. Zu viel Ärger.',
                        'Mit deinem Ramsch kannst du woanders hingehen.',
                        'Verschwinde mit diesem Dreck!'
                    ]
                },
                haggle: {
                    happy: [
                        'Für dich mache ich eine Ausnahme, aber nur dieses eine Mal!',
                        'Du treibst einen harten Handel, Freund.',
                        'Na gut, aber verrate es niemandem!'
                    ],
                    neutral: [
                        'Das ist mein letztes Angebot!',
                        'Puh, du lässt mich arm werden!',
                        'Mehr geht nicht. Nimm es oder lass es.'
                    ],
                    annoyed: [
                        'Mit dem Feilschen hör auf!',
                        'Der Preis steht fest.',
                        'Willst du kaufen oder nur plaudern?'
                    ],
                    angry: [
                        'Für dich gibt es keinen Rabatt!',
                        'Zahl den vollen Preis oder geh!',
                        'Mit dir feilsche ich nicht mehr!'
                    ]
                },
                smallTalkSuccess: [
                    'Besser als letzte Woche. Schlechter als morgen.',
                    'Das Geschäft läuft. Was soll ich mehr sagen?',
                    'Wenn du nichts kaufst, läuft es mies.'
                ],
                smallTalkFail: [
                    'Wenn du nichts kaufst, nicht gut genug.',
                    'Warum interessiert dich das?',
                    'Rede weniger, kauf mehr.'
                ],
                smallTalkUsed: [
                    'Ich habe keine Zeit für Geplauder.',
                    'Komm zur Sache oder geh.',
                    'Rede mit jemand anderem.'
                ]
            },
            // Yuki - stolz, kritisch, respektiert Stärke
            friendly: {
                greeting: {
                    happy: [
                        'Hallo, hallo! Suchst du Schutz für deine Abenteuer?',
                        'Willkommen! Ich habe die beste Rüstung weit und breit!',
                        'Ah, ein Kunde! Komm herein, lass mich dich beraten.'
                    ],
                    neutral: [
                        'Hallo! Was darf es sein?',
                        'Willkommen in meiner Schmiede.',
                        'Suchst du etwas Bestimmtes?'
                    ],
                    annoyed: [
                        'Ich bin beschäftigt. Was willst du?',
                        'Bitte sei kurz.',
                        'Wenn du nur schaust...'
                    ],
                    angry: [
                        'Komm wieder, wenn du ernsthaft kaufen willst.',
                        'Ich habe heute keine Zeit für dich.',
                        'Vielleicht ein anderer Tag.'
                    ]
                },
                buy: {
                    happy: [
                        'Perfekt! Damit bist du bestens geschützt.',
                        'Gute Wahl! Sicherheit geht vor!',
                        'Damit kannst du jeden Angriff überstehen!'
                    ],
                    neutral: [
                        'Eine gute Wahl.',
                        'Das wird dich schützen.',
                        'Pass gut darauf auf.'
                    ],
                    annoyed: [
                        'Nimm es einfach.',
                        'Der Preis steht fest.',
                        'Entscheide dich.'
                    ],
                    angry: [
                        'Nimm es oder lass es.',
                        'Ich habe keine Zeit für das.',
                        'Zahl und geh.'
                    ]
                },
                sell: {
                    happy: [
                        'Oh, das ist aber schön! Ich nehme es gerne.',
                        'Sehr gut erhalten! Ich biete dir einen guten Preis.',
                        'Das kann ich bestimmt wieder verkaufen.'
                    ],
                    neutral: [
                        'Das könnte ich gebrauchen.',
                        'Ein fairer Preis für beide.',
                        'Einverstanden!'
                    ],
                    annoyed: [
                        'Es hat einige Macken...',
                        'Dafür kann ich nicht viel bieten.',
                        'Nimm es oder behalte es.'
                    ],
                    angry: [
                        'Damit kann ich nichts anfangen.',
                        'Das ist mir zu wenig wert.',
                        'Nein, danke.'
                    ]
                },
                haggle: {
                    happy: [
                        'Oh, du bist aber ein Verhandlungsprofi!',
                        'Für dich mache ich gerne einen Sonderpreis!',
                        'Na gut, aber nur weil ich dich mag!'
                    ],
                    neutral: [
                        'Ein bisschen kann ich runtergehen.',
                        'Für Stammkunden gibt es Rabatt.',
                        'Lass mich nachdenken...'
                    ],
                    annoyed: [
                        'Das ist schon sehr günstig...',
                        'Mehr kann ich nicht machen.',
                        'Der Preis ist fair.'
                    ],
                    angry: [
                        'Für diesen Preis verkaufe ich nicht!',
                        'Das ist eine Beleidigung!',
                        'Geh zu einem anderen Händler!'
                    ]
                },
                smallTalkSuccess: [
                    'Es läuft gut, danke! Und bei dir?',
                    'Viele Abenteurer kommen vorbei.',
                    'Die Nachfrage nach guter Rüstung steigt!'
                ],
                smallTalkFail: [
                    'Es geht.',
                    'Muss es sein?',
                    'Ich bin etwas beschäftigt...'
                ],
                smallTalkUsed: [
                    'Vielleicht später?',
                    'Ich habe viel zu tun.',
                    'Lass uns über Geschäfte reden.'
                ]
            },
            // Shin - freundlich, aufmerksam, vorsichtig
            greedy: {
                greeting: {
                    happy: [
                        'Willkommen, willkommen! Meine besten Waren für dich!',
                        'Ah, ein Kunde mit Geschmack!',
                        'Schau dir um, aber pass auf die Preise auf!'
                    ],
                    neutral: [
                        'Ja? Was willst du?',
                        'Zeig mir dein Gold zuerst.',
                        'Wenn du nicht kaufst, verschwinde.'
                    ],
                    annoyed: [
                        'Wenn du nur feilschen willst, geh!',
                        'Meine Zeit ist Geld.',
                        'Kauf oder geh!'
                    ],
                    angry: [
                        'Mit dir mache ich keine Geschäfte!',
                        'Verschwinde!',
                        'Komm nie wieder!'
                    ]
                },
                buy: {
                    happy: [
                        'Ein ausgezeichnetes Geschäft! Für uns beide!',
                        'Damit wirst du sehr zufrieden sein!',
                        'Ein wahrer Schatz zu diesem Preis!'
                    ],
                    neutral: [
                        'Das kostet. Aber es ist es wert.',
                        'Gutes Geschäft. Für mich.',
                        'Zahlst du bar?'
                    ],
                    annoyed: [
                        'Nimm es und zahl!',
                        'Der Preis steht fest!',
                        'Kein Rabatt!'
                    ],
                    angry: [
                        'Zahl den vollen Preis!',
                        'Für dich gibt es nichts!',
                        'Verschwinde!'
                    ]
                },
                sell: {
                    happy: [
                        'Oh, das könnte ich für viel Gold weiterverkaufen!',
                        'Ein wertvolles Stück! Ich nehme es!',
                        'Ausgezeichnet! Einverstanden!'
                    ],
                    neutral: [
                        'Ich biete dir einen... fairen Preis.',
                        'Es ist etwas abgenutzt...',
                        'Nimm das Geld.'
                    ],
                    annoyed: [
                        'Das ist kaum etwas wert!',
                        'Dafür zahle ich fast nichts!',
                        'Nimm es oder geh!'
                    ],
                    angry: [
                        'Damit kann ich nichts anfangen!',
                        'Verschwinde mit diesem Schrott!',
                        'Niemals!'
                    ]
                },
                haggle: {
                    happy: [
                        'Du bist hart, aber fair. Einverstanden!',
                        'Für dich mache ich eine kleine Ausnahme!',
                        'Na gut, aber nur weil ich dich mag!'
                    ],
                    neutral: [
                        'Der Preis ist schon günstig...',
                        'Ein bisschen kann ich gehen...',
                        'Mehr geht wirklich nicht!'
                    ],
                    annoyed: [
                        'Kein Rabatt!',
                        'Der Preis steht fest!',
                        'Willst du kaufen oder nicht?'
                    ],
                    angry: [
                        'Für dich gibt es keinen Rabatt!',
                        'Zahl oder geh!',
                        'Nie wieder!'
                    ]
                },
                smallTalkSuccess: [
                    'Gold fließt, Geschäfte blühen!',
                    'Die besten Kunden kommen zu mir!',
                    'Wer zahlt, ist willkommen!'
                ],
                smallTalkFail: [
                    'Rede weniger, kauf mehr.',
                    'Zeig mir dein Gold.',
                    'Geschäfte sind wichtiger.'
                ],
                smallTalkUsed: [
                    'Genug geredet! Kauf!',
                    'Zeig mir dein Geld!',
                    'Rede ist Silber, Kauf ist Gold!'
                ]
            },
            // Kira - misstrauisch, manipulativ, gefährlich
            grumpy: {
                greeting: {
                    happy: [
                        'Ah... du wieder. Was willst du?',
                        'Komm näher. Aber nicht zu nah.',
                        'Ich habe Dinge... für den richtigen Preis.'
                    ],
                    neutral: [
                        'Wer bist du?',
                        'Was willst du hier?',
                        'Ich vertraue dir nicht...'
                    ],
                    annoyed: [
                        'Verschwinde!',
                        'Ich habe nichts für dich!',
                        'Geh bevor ich böse werde!'
                    ],
                    angry: [
                        'RAUS!',
                        'Wag es nicht zurückzukommen!',
                        'Ich rufe die Wachen!'
                    ]
                },
                buy: {
                    happy: [
                        'Gute Wahl... sehr gut...',
                        'Damit kannst du... Dinge tun.',
                        'Pass auf, wen du damit besuchst...'
                    ],
                    neutral: [
                        'Nimm es.',
                        'Zuerst zahlen.',
                        'Keine Fragen stellen.'
                    ],
                    annoyed: [
                        'Nimm es und geh!',
                        'Schnell!',
                        'Keine Zeit!'
                    ],
                    angry: [
                        'Weg mit dir!',
                        'Nichts für dich!',
                        'Verschwinde!'
                    ]
                },
                sell: {
                    happy: [
                        'Interessant... woher hast du das?',
                        'Das könnte nützlich sein...',
                        'Einverstanden. Aber schweigen darüber...'
                    ],
                    neutral: [
                        'Das nehme ich.',
                        'Nicht viel wert... aber okay.',
                        'Schweigen ist Gold.'
                    ],
                    annoyed: [
                        'Das ist Müll!',
                        'Verschwinde damit!',
                        'Worthlos!'
                    ],
                    angry: [
                        'RAUS!',
                        'Wag es nicht!',
                        'Wachen!'
                    ]
                },
                haggle: {
                    happy: [
                        'Du kennst den Wert... einverstanden.',
                        'Für Freunde... spezielle Preise.',
                        'Du und ich... wir verstehen uns.'
                    ],
                    neutral: [
                        'Der Preis ist... fair.',
                        'Nicht weniger.',
                        'Zahl oder geh.'
                    ],
                    annoyed: [
                        'Kein Wort mehr!',
                        'Der Preis steht!',
                        'Letzte Warnung!'
                    ],
                    angry: [
                        'WEG!',
                        'NIE WIEDER!',
                        'TOT!'
                    ]
                },
                smallTalkSuccess: [
                    'Die Nacht hat Augen...',
                    'Gerüchte... interessante Gerüchte...',
                    'Manche Dinge sollten im Dunkeln bleiben...'
                ],
                smallTalkFail: [
                    'Schweigen ist Gold.',
                    'Zu viele Fragen...',
                    'Misstrauisch...'
                ],
                smallTalkUsed: [
                    'Genug!',
                    'Schweig!',
                    'Weg!'
                ]
            }
        };
        
        // Fallback zu neutral wenn Persönlichkeit nicht gefunden
        const dialogs = personalityDialogs[personality] || personalityDialogs.neutral;
        
        // Wähle den richtigen Pool basierend auf Typ und Stimmung
        let pool;
        if (type === 'greeting' || type === 'buy' || type === 'sell' || type === 'haggle') {
            pool = dialogs[type]?.[mood] || dialogs[type]?.neutral || ['...'];
        } else {
            pool = dialogs[type] || ['...'];
        }
        
        // Zufälligen Dialog auswählen
        const randomDialog = pool[Math.floor(Math.random() * pool.length)];
        
        // Anzeigen
        const dialogEl = document.getElementById('merchantDialogText');
        if (dialogEl) {
            dialogEl.textContent = randomDialog;
            
            // Animation für neuen Text
            dialogEl.style.opacity = '0';
            setTimeout(() => {
                dialogEl.style.opacity = '1';
            }, 50);
        }
        
        // Emotions-Bild aktualisieren
        this.updateEmotionImage(type, mood);
    },
    
    /**
     * Aktualisiert das Emotions-Bild des Händlers
     */
    updateEmotionImage(dialogType, mood) {
        const imgEl = document.getElementById('merchantPortrait');
        if (!imgEl || !this.currentMerchant?.merchant) return;
        
        const emotionImages = this.currentMerchant.merchant.emotion_images || {};
        
        // Bestimme Emotion basierend auf Dialog und Stimmung
        let emotion = 'neutral';
        if (mood === 'happy' || mood === 'friendly') emotion = 'happy';
        else if (mood === 'annoyed' || mood === 'angry' || mood === 'grumpy') emotion = 'angry';
        else if (mood === 'neutral' || mood === 'thinking') emotion = 'thinking';
        
        // Setze Bild
        const imagePath = emotionImages[emotion] || emotionImages.neutral || this.currentMerchant.merchant.current_image;
        imgEl.src = imagePath;
    },
    
    /**
     * Zeigt Beziehungs-Informationen an
     */
    showRelationshipInfo() {
        const personality = this.currentMerchant?.merchant?.personality || 'neutral';
        const personalityLabels = {
            friendly: 'Freundlich - Offen für Gespräche',
            neutral: 'Neutral - Geschäftsmäßig',
            greedy: 'Geizig - Liebt Gold über alles',
            grumpy: 'Mürrisch - Schwer zu beeindrucken',
            suspicious: 'Misstrauisch - Vorsichtig'
        };
        
        const relationshipText = this.merchantState.relationship > 5 ? 'Sehr positiv' :
                                 this.merchantState.relationship > 0 ? 'Positiv' :
                                 this.merchantState.relationship === 0 ? 'Neutral' :
                                 this.merchantState.relationship > -5 ? 'Negativ' : 'Sehr negativ';
        
        const info = `
Persönlichkeit: ${personalityLabels[personality] || 'Unbekannt'}

Beziehung: ${relationshipText} (${this.merchantState.relationship > 0 ? '+' : ''}${this.merchantState.relationship})
Vertrauen: ${this.merchantState.trust}%

Kauf: ${this.merchantState.playerMemory.totalPurchases}x
Verkauf: ${this.merchantState.playerMemory.totalSales}x
Erfolgreich gefeiilscht: ${this.merchantState.playerMemory.bargainSuccess}x
        `.trim();
        
        alert(info);
    },
    
    /**
     * Modal schließen
     */
    close() {
        const modal = document.getElementById('merchantModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentMerchant = null;
        this.selectedItem = null;
        this.haggleResult = null;
    },
    
    // Hilfsfunktionen
    getCharacterGold() {
        // Versuche verschiedene Speicherorte für Gold
        if (currentCharacter?.stats?.gold !== undefined) {
            return currentCharacter.stats.gold;
        }
        if (currentCharacter?.gold !== undefined) {
            return currentCharacter.gold;
        }
        if (currentCharacter?.money !== undefined) {
            return currentCharacter.money;
        }
        return 0;
    },
    
    setCharacterGold(amount) {
        // Stelle sicher, dass das stats-Objekt existiert
        if (!currentCharacter) return;
        
        if (!currentCharacter.stats) {
            currentCharacter.stats = {};
        }
        
        currentCharacter.stats.gold = Math.max(0, amount);
    },
    
    getCharacterInventory() {
        if (!currentCharacter) return [];
        
        if (!currentCharacter.inventory) {
            currentCharacter.inventory = [];
        }
        
        // Sicherstellen, dass inventory ein Array ist
        if (!Array.isArray(currentCharacter.inventory)) {
            console.warn('Inventar ist kein Array, setze zurück:', currentCharacter.inventory);
            currentCharacter.inventory = [];
        }
        
        return currentCharacter.inventory;
    },
    
    getMerchantTypeLabel(type) {
        const labels = {
            general: '🏪 Gemischtwaren',
            weapon: '⚔️ Waffen',
            armor: '🛡️ Rüstungen',
            magic: '✨ Magie',
            black_market: '🌑 Schwarzmarkt',
            consumable: '🧪 Tränke'
        };
        return labels[type] || type;
    },
    
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
    
    translateStat(key) {
        const translations = {
            damage: 'Schaden',
            range: 'Reichweite',
            rk: 'Rüstungsklasse',
            heal: 'Heilung',
            chakra: 'Chakra',
            bonus: 'Bonus'
        };
        return translations[key] || key;
    }
};

// Global verfügbar machen
window.MerchantUI = MerchantUI;

console.log('merchant-ui.js geladen (Offline-Version)');
