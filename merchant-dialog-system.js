/**
 * Merchant RPG Dialog System
 * Erweitert das bestehende Händlersystem mit RPG-Dialogen
 */

const MerchantDialogSystem = {
    currentMerchant: null,
    currentEmotion: 'neutral',
    dialogHistory: [],
    currentDialogNode: 'greeting',
    
    /**
     * Initialisiert den Dialog mit einem Händler
     */
    init(merchantId) {
        this.currentMerchant = this.getMerchantData(merchantId);
        this.currentEmotion = this.currentMerchant.mood || 'neutral';
        this.dialogHistory = [];
        this.currentDialogNode = 'greeting';
        
        this.renderDialogScreen();
        this.showDialogNode('greeting');
    },
    
    /**
     * Holt Händler-Daten mit allen RPG-Eigenschaften
     */
    getMerchantData(merchantId) {
        const merchants = {
            'taro': {
                id: 'taro',
                name: 'Taro',
                title: 'der Waffenhändler',
                mood: 'neutral',
                relationship: this.getSavedRelationship('taro'),
                trust: this.getSavedTrust('taro'),
                dailyMood: this.calculateDailyMood(),
                images: {
                    neutral: 'images/merchants/taro_neutral.png',
                    happy: 'images/merchants/taro_happy.png',
                    angry: 'images/merchants/taro_angry.png',
                    thinking: 'images/merchants/taro_thinking.png',
                    friendly: 'images/merchants/taro_happy.png',
                    annoyed: 'images/merchants/taro_angry.png'
                },
                shopImage: 'images/merchants/taro_shop.png',
                personality: 'pragmatic',
                dialogs: this.getTaroDialogs(),
                inventory: this.getTaroInventory()
            },
            'yuki': {
                id: 'yuki',
                name: 'Yuki',
                title: 'die Rüstungsschmiedin',
                mood: 'neutral',
                relationship: this.getSavedRelationship('yuki'),
                trust: this.getSavedTrust('yuki'),
                dailyMood: this.calculateDailyMood(),
                images: {
                    neutral: 'images/merchants/yuki_neutral.png',
                    happy: 'images/merchants/yuki_happy.png',
                    angry: 'images/merchants/yuki_angry.png',
                    thinking: 'images/merchants/yuki_thinking.png',
                    friendly: 'images/merchants/yuki_happy.png'
                },
                shopImage: 'images/merchants/yuki_shop.png',
                personality: 'proud',
                dialogs: this.getYukiDialogs(),
                inventory: this.getYukiInventory()
            },
            'shin': {
                id: 'shin',
                name: 'Shin',
                title: 'der Allzweckhändler',
                mood: 'friendly',
                relationship: this.getSavedRelationship('shin'),
                trust: this.getSavedTrust('shin'),
                dailyMood: this.calculateDailyMood(),
                images: {
                    neutral: 'images/merchants/shin_neutral.png',
                    happy: 'images/merchants/shin_happy.png',
                    angry: 'images/merchants/shin_angry.png',
                    thinking: 'images/merchants/shin_thinking.png',
                    friendly: 'images/merchants/shin_happy.png'
                },
                shopImage: 'images/merchants/shin_shop.png',
                personality: 'friendly',
                dialogs: this.getShinDialogs(),
                inventory: this.getShinInventory()
            },
            'kira': {
                id: 'kira',
                name: 'Kira',
                title: 'die Schwarzhändlerin',
                mood: 'suspicious',
                relationship: this.getSavedRelationship('kira'),
                trust: this.getSavedTrust('kira'),
                dailyMood: this.calculateDailyMood(),
                images: {
                    neutral: 'images/merchants/kira_neutral.png',
                    happy: 'images/merchants/kira_happy.png',
                    angry: 'images/merchants/kira_angry.png',
                    suspicious: 'images/merchants/kira_suspicious.png',
                    thinking: 'images/merchants/kira_thinking.png',
                    friendly: 'images/merchants/kira_happy.png'
                },
                shopImage: 'images/merchants/kira_shop.png',
                personality: 'suspicious',
                dialogs: this.getKiraDialogs(),
                inventory: this.getKiraInventory(),
                isBlackMarket: true
            }
        };
        
        return merchants[merchantId] || merchants['taro'];
    },
    
    /**
     * Holt gespeicherte Beziehung aus localStorage
     */
    getSavedRelationship(merchantId) {
        const saved = localStateManager.getItem(`merchant_${merchantId}_relationship`);
        return saved ? parseInt(saved) : 0;
    },
    
    /**
     * Holt gespeichertes Vertrauen aus localStorage
     */
    getSavedTrust(merchantId) {
        const saved = localStateManager.getItem(`merchant_${merchantId}_trust`);
        return saved ? parseInt(saved) : 50;
    },
    
    /**
     * Speichert Händler-Beziehung
     */
    saveRelationship(merchantId, value) {
        localStateManager.setItem(`merchant_${merchantId}_relationship`, value);
    },
    
    /**
     * Speichert Händler-Vertrauen
     */
    saveTrust(merchantId, value) {
        localStateManager.setItem(`merchant_${merchantId}_trust`, value);
    },
    
    /**
     * Berechnet die Tageslaune basierend auf verschiedenen Faktoren
     */
    calculateDailyMood() {
        const roll = Math.floor(Math.random() * 100) + 1;
        if (roll <= 20) return 'happy';
        if (roll <= 40) return 'friendly';
        if (roll <= 60) return 'neutral';
        if (roll <= 80) return 'annoyed';
        return 'grumpy';
    },
    
    /**
     * Rendert den RPG-Dialog-Screen
     */
    renderDialogScreen() {
        const container = document.getElementById('merchantDialogContainer');
        if (!container) {
            this.createDialogContainer();
            return;
        }
        
        container.innerHTML = `
            <div class="merchant-rpg-dialog">
                <!-- Hintergrund: Laden -->
                <div class="merchant-shop-background" 
                     style="background-image: url('${this.currentMerchant.shopImage}')"></div>
                
                <!-- Hauptbereich: Händler + Dialog -->
                <div class="merchant-dialog-main">
                    <!-- Links: Händler Bild -->
                    <div class="merchant-character-area">
                        <img id="merchantEmotionImage" 
                             src="${this.currentMerchant.images[this.currentEmotion]}"
                             alt="${this.currentMerchant.name}"
                             class="merchant-emotion-image"
                             onerror="this.style.display='none'">
                    </div>
                    
                    <!-- Mitte: Dialog -->
                    <div class="merchant-dialog-area">
                        <!-- Sprechblase -->
                        <div class="merchant-speech-bubble">
                            <p id="merchantDialogText">...</p>
                        </div>
                        
                        <!-- Antwortoptionen -->
                        <div id="merchantResponseOptions" class="merchant-response-options">
                            <!-- Dynamisch gefüllt -->
                        </div>
                    </div>
                    
                    <!-- Rechts: Shop (initial versteckt) -->
                    <div id="merchantShopPanel" class="merchant-shop-panel hidden">
                        <div class="shop-header">
                            <h3>🛒 Sortiment</h3>
                            <button onclick="MerchantDialogSystem.closeShop()">✕</button>
                        </div>
                        <div id="merchantShopItems" class="shop-items">
                            <!-- Dynamisch gefüllt -->
                        </div>
                    </div>
                </div>
                
                <!-- Info-Bar: Stimmung, Beziehung, etc. -->
                <div class="merchant-info-bar">
                    <span class="merchant-mood">Stimmung: ${this.getMoodText(this.currentEmotion)}</span>
                    <span class="merchant-relationship">Beziehung: ${this.getRelationshipText(this.currentMerchant.relationship)}</span>
                    <span class="merchant-trust">Vertrauen: ${this.currentMerchant.trust}%</span>
                </div>
                
                <!-- Schließen Button -->
                <button class="btn-close-dialog" onclick="MerchantDialogSystem.closeDialog()">
                    Verlassen
                </button>
            </div>
        `;
        
        container.classList.remove('hidden');
    },
    
    /**
     * Erstellt den Dialog-Container falls nicht vorhanden
     */
    createDialogContainer() {
        const container = document.createElement('div');
        container.id = 'merchantDialogContainer';
        container.className = 'merchant-dialog-overlay hidden';
        document.body.appendChild(container);
        this.renderDialogScreen();
    },
    
    /**
     * Zeigt einen Dialog-Knoten mit Antwortoptionen
     */
    showDialogNode(nodeId) {
        const node = this.currentMerchant.dialogs[nodeId];
        if (!node) return;
        
        this.currentDialogNode = nodeId;
        
        // Text aktualisieren
        const textEl = document.getElementById('merchantDialogText');
        if (textEl) {
            textEl.textContent = this.processDialogText(node.text);
        }
        
        // Emotion aktualisieren
        if (node.emotion) {
            this.setEmotion(node.emotion);
        }
        
        // Antwortoptionen rendern
        this.renderResponseOptions(node.options);
        
        // Speichere in Historie
        this.dialogHistory.push({ node: nodeId, emotion: this.currentEmotion });
    },
    
    /**
     * Verarbeitet Dialog-Text (Platzhalter ersetzen)
     */
    processDialogText(text) {
        const charName = window.currentCharacter?.name || 'Reisender';
        return text
            .replace(/{playerName}/g, charName)
            .replace(/{merchantName}/g, this.currentMerchant.name);
    },
    
    /**
     * Rendert die Antwortoptionen
     */
    renderResponseOptions(options) {
        const container = document.getElementById('merchantResponseOptions');
        if (!container) return;
        
        // Filtere Optionen basierend auf Bedingungen
        const availableOptions = options.filter(opt => this.checkOptionCondition(opt.condition));
        
        container.innerHTML = availableOptions.map((opt, index) => `
            <button class="dialog-option" onclick="MerchantDialogSystem.selectOption(${index})"
                    data-target="${opt.target}">
                ${opt.text}
            </button>
        `).join('');
    },
    
    /**
     * Prüft ob eine Option verfügbar ist
     */
    checkOptionCondition(condition) {
        if (!condition) return true;
        
        switch(condition.type) {
            case 'relationship':
                return this.currentMerchant.relationship >= condition.min;
            case 'trust':
                return this.currentMerchant.trust >= condition.min;
            case 'mood':
                return condition.moods.includes(this.currentEmotion);
            case 'hasItem':
                return true;
            case 'canHaggle':
                return this.currentMerchant.allowsHaggle !== false;
            default:
                return true;
        }
    },
    
    /**
     * Wählt eine Antwortoption
     */
    selectOption(index) {
        const node = this.currentMerchant.dialogs[this.currentDialogNode];
        const option = node.options[index];
        
        if (!option) return;
        
        // Effekte anwenden
        if (option.effects) {
            this.applyEffects(option.effects);
        }
        
        // Ziel-Node anzeigen oder Aktion ausführen
        if (option.action) {
            this.executeAction(option.action, option.actionParams);
        } else if (option.target) {
            this.showDialogNode(option.target);
        }
    },
    
    /**
     * Wendet Effekte an
     */
    applyEffects(effects) {
        if (effects.relationship) {
            this.currentMerchant.relationship = Math.max(-100, Math.min(100, 
                this.currentMerchant.relationship + effects.relationship));
            this.saveRelationship(this.currentMerchant.id, this.currentMerchant.relationship);
        }
        if (effects.trust) {
            this.currentMerchant.trust = Math.max(0, Math.min(100, 
                this.currentMerchant.trust + effects.trust));
            this.saveTrust(this.currentMerchant.id, this.currentMerchant.trust);
        }
        if (effects.mood) {
            this.setEmotion(effects.mood);
        }
        
        // Info-Bar aktualisieren
        this.updateInfoBar();
    },
    
    /**
     * Führt eine Aktion aus
     */
    executeAction(action, params) {
        switch(action) {
            case 'openShop':
                this.openShop();
                break;
            case 'haggle':
                this.startHaggle(params);
                break;
            case 'smallTalk':
                this.doSmallTalk();
                break;
            case 'sell':
                this.openSellDialog();
                break;
            case 'close':
                this.closeDialog();
                break;
        }
    },
    
    /**
     * Setzt die Emotion des Händlers
     */
    setEmotion(emotion) {
        this.currentEmotion = emotion;
        const imgEl = document.getElementById('merchantEmotionImage');
        if (imgEl) {
            const imagePath = this.currentMerchant.images[emotion] || this.currentMerchant.images.neutral;
            imgEl.src = imagePath;
            imgEl.style.display = 'block';
        }
    },
    
    /**
     * Öffnet den Shop-Bereich
     */
    openShop() {
        const shopPanel = document.getElementById('merchantShopPanel');
        if (shopPanel) {
            shopPanel.classList.remove('hidden');
            this.renderShopItems();
        }
    },
    
    /**
     * Schließt den Shop-Bereich
     */
    closeShop() {
        const shopPanel = document.getElementById('merchantShopPanel');
        if (shopPanel) {
            shopPanel.classList.add('hidden');
        }
    },
    
    /**
     * Rendert die Shop-Items
     */
    renderShopItems() {
        const container = document.getElementById('merchantShopItems');
        if (!container) return;
        
        container.innerHTML = this.currentMerchant.inventory.map(item => `
            <div class="shop-item" onclick="MerchantDialogSystem.onItemClick('${item.id}')">
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price} Gold</span>
                </div>
            </div>
        `).join('');
    },
    
    /**
     * Item wurde angeklickt
     */
    onItemClick(itemId) {
        const item = this.currentMerchant.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        // Händler reagiert auf Item
        const reaction = this.getItemReaction(item);
        // Zeige Item-Details mit Händler-Reaktion
        this.showItemDetails(item, reaction);
    },
    
    /**
     * Zeigt Item-Details mit Händler-Reaktion
     */
    showItemDetails(item, reactionText) {
        const textEl = document.getElementById('merchantDialogText');
        if (textEl) {
            textEl.innerHTML = `
                <strong>${item.name}</strong><br>
                <em style="font-size: 0.9em; opacity: 0.8;">"${reactionText}"</em><br><br>
                Preis: ${item.price} Gold<br>
                ${item.description || ''}
            `;
        }
        
        // Antwortoptionen für Kauf
        const container = document.getElementById('merchantResponseOptions');
        if (container) {
            container.innerHTML = `
                <button class="dialog-option" onclick="MerchantDialogSystem.buyItem('${item.id}')">
                    Kaufen (${item.price} Gold)
                </button>
                <button class="dialog-option" onclick="MerchantDialogSystem.attemptHaggle('${item.id}')">
                    Feilschen
                </button>
                <button class="dialog-option" onclick="MerchantDialogSystem.showDialogNode('show_goods')">
                    Zurück zur Übersicht
                </button>
            `;
        }
    },
    
    /**
     * Holt Reaktion auf ein Item
     */
    getItemReaction(item) {
        const reactions = {
            'taro': {
                weapon: ["Standard. Tötet trotzdem.", "Solide Klinge. Nichts für Anfänger.", "Die hier hat schon Männern das Leben gerettet."],
                cheap: ["Billig, aber funktional.", "Für den Preis kannst du nicht meckern.", "Nimm's oder lass es."],
                expensive: ["Die hier ist nichts für große Worte. Nur für große Taten.", "Qualität hat ihren Preis.", "Das beste Stück im Laden."]
            }
        };
        
        const merchantReactions = reactions[this.currentMerchant.id] || reactions['taro'];
        
        if (item.price >= 500) {
            return merchantReactions.expensive[Math.floor(Math.random() * merchantReactions.expensive.length)];
        } else if (item.price <= 50) {
            return merchantReactions.cheap[Math.floor(Math.random() * merchantReactions.cheap.length)];
        } else {
            return merchantReactions.weapon[Math.floor(Math.random() * merchantReactions.weapon.length)];
        }
    },
    
    /**
     * Kauft ein Item
     */
    buyItem(itemId) {
        const item = this.currentMerchant.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        // BUGFIX 8: Geld-Validierung vor Kauf
        const price = item.tempPrice || item.price;
        const currentGold = window.currentCharacter?.money?.gold || 0;
        
        if (currentGold < price) {
            // Händler reagiert genervt/ablehnend
            const mood = this.currentEmotion || 'neutral';
            const responses = {
                'happy': 'Du hast nicht genug Gold. Komm wieder, wenn du ernsthaft kaufen willst.',
                'neutral': 'Nicht genug Gold. Türen funktionieren in beide Richtungen.',
                'suspicious': 'Wenig Gold, viele Fragen. Typisch.',
                'annoyed': 'Verschwende meine Zeit nicht ohne Gold.',
                'angry': 'Du hast genau einen Satz übrig. Und der sollte "Auf Wiedersehen" sein.'
            };
            
            const textEl = document.getElementById('merchantDialogText');
            if (textEl) {
                textEl.innerHTML = `<em>"${responses[mood] || responses.neutral}"</em>`;
            }
            
            // Beziehung verschlechtern
            this.applyEffects({ relationship: -2, trust: -1 });
            
            // Logging
            if (typeof GameLog !== 'undefined') {
                GameLog.log(`Kauf fehlgeschlagen: Nicht genug Gold (${currentGold}/${price})`);
            }
            
            // Zurück-Option
            setTimeout(() => {
                this.showDialogNode('show_goods');
            }, 2000);
            
            return;
        }
        
        // Gold abziehen
        window.currentCharacter.money.gold -= price;
        
        // Zum Inventar hinzufügen
        if (!window.currentCharacter.inventory) {
            window.currentCharacter.inventory = [];
        }
        
        const existingItem = window.currentCharacter.inventory.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            window.currentCharacter.inventory.push({
                id: itemId,
                name: item.name,
                quantity: 1,
                price: price
            });
        }
        
        // Speichern
        if (typeof autoSave === 'function') {
            autoSave();
        }
        
        // Erfolgs-Dialog
        this.showDialogNode('purchase_success');
    },
    
    /**
     * Versucht zu feilschen
     */
    attemptHaggle(itemId) {
        const item = this.currentMerchant.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        // Charisma-Check
        const charisma = window.currentCharacter?.attributes?.cha || 10;
        const modifier = Math.floor((charisma - 10) / 2);
        const roll = Math.floor(Math.random() * 20) + 1;
        const result = roll + modifier;
        
        // Stimmungs-Modifikator
        let moodModifier = 0;
        if (this.currentEmotion === 'happy') moodModifier = 2;
        if (this.currentEmotion === 'annoyed') moodModifier = -3;
        if (this.currentEmotion === 'angry') moodModifier = -5;
        
        const finalResult = result + moodModifier;
        
        // Ergebnis bestimmen
        if (finalResult >= 15) {
            // Erfolg
            const discount = Math.floor(item.price * 0.15);
            this.showHaggleSuccess(item, discount);
        } else if (finalResult >= 10) {
            // Teilweise Erfolg
            const discount = Math.floor(item.price * 0.05);
            this.showHagglePartial(item, discount);
        } else {
            // Misserfolg
            this.showHaggleFail();
        }
        
        // Logge den Wurf
        if (typeof GameLog !== 'undefined') {
            GameLog.log(`Feilschen bei ${this.currentMerchant.name}: Wurf ${roll} + CHA ${modifier} + Stimmung ${moodModifier} = ${finalResult}`);
        }
    },
    
    /**
     * Zeigt Feilsch-Erfolg
     */
    showHaggleSuccess(item, discount) {
        const newPrice = item.price - discount;
        
        const textEl = document.getElementById('merchantDialogText');
        if (textEl) {
            textEl.innerHTML = `
                <em>"Für dich... vielleicht ein wenig weniger. Aber nur dieses eine Mal."</em><br><br>
                Preis reduziert um ${discount} Gold!<br>
                Neuer Preis: ${newPrice} Gold
            `;
        }
        
        // Temporärer Preis-Update
        item.tempPrice = newPrice;
        
        // Beziehung leicht verbessern
        this.applyEffects({ relationship: 2 });
        
        // Antwortoptionen
        const container = document.getElementById('merchantResponseOptions');
        if (container) {
            container.innerHTML = `
                <button class="dialog-option" onclick="MerchantDialogSystem.buyItem('${item.id}')">
                    Kaufen (${newPrice} Gold)
                </button>
                <button class="dialog-option" onclick="MerchantDialogSystem.showDialogNode('show_goods')">
                    Zurück
                </button>
            `;
        }
    },
    
    /**
     * Zeigt Teilweisen Feilsch-Erfolg
     */
    showHagglePartial(item, discount) {
        const newPrice = item.price - discount;
        
        const textEl = document.getElementById('merchantDialogText');
        if (textEl) {
            textEl.innerHTML = `
                <em>"Ich kann dir nicht viel geben... aber etwas."</em><br><br>
                Preis reduziert um ${discount} Gold.<br>
                Neuer Preis: ${newPrice} Gold
            `;
        }
        
        item.tempPrice = newPrice;
        
        const container = document.getElementById('merchantResponseOptions');
        if (container) {
            container.innerHTML = `
                <button class="dialog-option" onclick="MerchantDialogSystem.buyItem('${item.id}')">
                    Kaufen (${newPrice} Gold)
                </button>
                <button class="dialog-option" onclick="MerchantDialogSystem.showDialogNode('show_goods')">
                    Zurück
                </button>
            `;
        }
    },
    
    /**
     * Zeigt Feilsch-Misserfolg
     */
    showHaggleFail() {
        const failResponses = [
            "Der Preis ist der Preis. Nicht verhandelbar.",
            "Wenn du feilschen willst, geh zum Markt.",
            "Meine Geduld wird dünn...",
            "Das ist Qualität. Kein Basar."
        ];
        
        const response = failResponses[Math.floor(Math.random() * failResponses.length)];
        
        const textEl = document.getElementById('merchantDialogText');
        if (textEl) {
            textEl.innerHTML = `<em>"${response}"</em>`;
        }
        
        // Beziehung leicht verschlechtern
        this.applyEffects({ relationship: -3, mood: 'annoyed' });
        
        const container = document.getElementById('merchantResponseOptions');
        if (container) {
            container.innerHTML = `
                <button class="dialog-option" onclick="MerchantDialogSystem.showDialogNode('show_goods')">
                    Verstanden... (zurück)
                </button>
            `;
        }
    },
    
    /**
     * Startet Feilschen
     */
    startHaggle(params) {
        console.log('Feilschen gestartet:', params);
    },
    
    /**
     * Führt Small Talk durch
     */
    doSmallTalk() {
        // Prüfe ob Small Talk heute schon gemacht wurde
        const lastSmallTalk = localStateManager.getItem(`merchant_${this.currentMerchant.id}_lastsmalltalk`);
        const today = new Date().toDateString();
        
        if (lastSmallTalk === today) {
            // Bereits heute gemacht
            this.showDialogNode('smalltalk_used');
            return;
        }
        
        // Speichere Small Talk Datum
        localStateManager.setItem(`merchant_${this.currentMerchant.id}_lastsmalltalk`, today);
        
        // Charisma-Check für Small Talk
        const charisma = window.currentCharacter?.attributes?.cha || 10;
        const modifier = Math.floor((charisma - 10) / 2);
        const roll = Math.floor(Math.random() * 20) + 1;
        const result = roll + modifier;
        
        if (result >= 12) {
            // Erfolg
            this.applyEffects({ relationship: 5, trust: 3, mood: 'friendly' });
            this.showDialogNode('smalltalk_success');
        } else {
            // Neutral
            this.applyEffects({ relationship: 1 });
            this.showDialogNode('smalltalk_neutral');
        }
        
        if (typeof GameLog !== 'undefined') {
            GameLog.log(`Small Talk mit ${this.currentMerchant.name}: Wurf ${roll} + CHA ${modifier} = ${result}`);
        }
    },
    
    /**
     * Öffnet Verkaufs-Dialog
     */
    openSellDialog() {
        const textEl = document.getElementById('merchantDialogText');
        if (textEl) {
            textEl.innerHTML = `<em>"Zeig mir, was du hast. Aber sei gewarnt: Ich zahle nur für Qualität."</em>`;
        }
        
        // TODO: Inventar des Spielers anzeigen
        const container = document.getElementById('merchantResponseOptions');
        if (container) {
            container.innerHTML = `
                <button class="dialog-option" onclick="MerchantDialogSystem.showDialogNode('greeting')">
                    Zurück
                </button>
            `;
        }
    },
    
    /**
     * Schließt den Dialog
     */
    closeDialog() {
        const container = document.getElementById('merchantDialogContainer');
        if (container) {
            container.classList.add('hidden');
        }
    },
    
    /**
     * Aktualisiert die Info-Bar
     */
    updateInfoBar() {
        const container = document.querySelector('.merchant-info-bar');
        if (container) {
            container.innerHTML = `
                <span class="merchant-mood">Stimmung: ${this.getMoodText(this.currentEmotion)}</span>
                <span class="merchant-relationship">Beziehung: ${this.getRelationshipText(this.currentMerchant.relationship)}</span>
                <span class="merchant-trust">Vertrauen: ${this.currentMerchant.trust}%</span>
            `;
        }
    },
    
    /**
     * Text-Helfer für Stimmung
     */
    getMoodText(mood) {
        const moods = {
            happy: '😊 Fröhlich',
            friendly: '🙂 Freundlich',
            neutral: '😐 Neutral',
            annoyed: '😤 Genervt',
            grumpy: '😠 Mürrisch',
            angry: '😡 Wütend',
            suspicious: '🤨 Misstrauisch',
            thinking: '🤔 Nachdenklich'
        };
        return moods[mood] || mood;
    },
    
    /**
     * Text-Helfer für Beziehung
     */
    getRelationshipText(rel) {
        if (rel >= 80) return '❤️ Vertraut';
        if (rel >= 50) return '🤝 Freundlich';
        if (rel >= 20) return '🙂 Bekannt';
        if (rel >= -20) return '😐 Neutral';
        if (rel >= -50) return '🙄 Kalt';
        if (rel >= -80) return '😠 Feindlich';
        return '💀 Erbittert';
    },
    
    // ============================================
    // DIALOG-DATEN FÜR TARO
    // ============================================
    // DIALOG-DATEN FÜR TARO - WAFFENHÄNDLER
    // ============================================
    
    getTaroDialogs() {
        return {
            // STIMMUNG: FREUNDLICH (Vertrauen hoch, guter Kunde)
            greeting_friendly: {
                text: this.getRandomTaroDialog('friendly'),
                emotion: 'friendly',
                options: [
                    { text: "Zeig mir deine Waren", target: 'show_goods_friendly', effects: { relationship: 1 } },
                    { text: "Ich suche etwas Besonderes", target: 'show_special_friendly', condition: { type: 'relationship', min: 30 } },
                    { text: "Small Talk", target: 'small_talk_friendly' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_friendly: {
                text: "Für dich hole ich sogar die guten Klingen raus. Komm näher. Heute habe ich gute Ware.",
                emotion: 'friendly',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            show_special_friendly: {
                text: "Ich habe da etwas, das dir gefallen könnte. Diese Waffe wählt ihren Besitzer. Aber für dich mache ich eine Ausnahme.",
                emotion: 'friendly',
                options: [
                    { text: "[Sonderware ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            small_talk_friendly: {
                text: "Wenigstens kannst du reden wie ein Mensch. Erzähl mir, was es Neues gibt.",
                emotion: 'thinking',
                options: [
                    { text: "Wie läuft das Geschäft?", target: 'talk_business_friendly' },
                    { text: "Was ist deine beste Waffe?", target: 'best_weapon' },
                    { text: "Vergiss es", target: 'greeting_friendly' }
                ]
            },
            talk_business_friendly: {
                text: "Besser als letzte Woche. Wenn jemand meine Ware versteht, dann du. Manche Kunden kaufen. Du investierst.",
                emotion: 'friendly',
                options: [
                    { text: "[Small Talk beenden]", action: 'smallTalk' },
                    { text: "Zeig mir deine Waren", target: 'show_goods_friendly' }
                ]
            },
            best_weapon: {
                text: "Meine beste Waffe? Die, die niemand braucht. Weil der Träger stark genug war. Gute Waffen verlangen Respekt.",
                emotion: 'friendly',
                options: [
                    { text: "Weise Worte", target: 'greeting_friendly', effects: { relationship: 2 } }
                ]
            },
            
            // STIMMUNG: NEUTRAL (Standard)
            greeting: {
                text: this.getRandomTaroDialog('neutral'),
                emotion: 'neutral',
                options: [
                    { text: "Was brauchst du?", target: 'show_goods' },
                    { text: "Ich suche etwas Bestimmtes", target: 'search_weapon' },
                    { text: "Small Talk", target: 'small_talk' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods: {
                text: "Schau dich um, aber verschwende meine Zeit nicht. Wenn du Gold hast, höre ich zu.",
                emotion: 'neutral',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            small_talk: {
                text: "Reden kostet. Kaufen auch. Aber für dich mache ich eine Ausnahme... heute.",
                emotion: 'thinking',
                options: [
                    { text: "Wie läuft das Geschäft?", target: 'talk_business' },
                    { text: "Was empfiehlst du?", target: 'recommendation' },
                    { text: "Vergiss es", target: 'greeting', effects: { relationship: -1 } }
                ]
            },
            talk_business: {
                text: "Waffen sprechen sauberer als Menschen. Das Geschäft läuft, solange Kämpfer sterben.",
                emotion: 'thinking',
                options: [
                    { text: "[Small Talk beenden]", action: 'smallTalk' },
                    { text: "Zeig mir deine Waren", target: 'show_goods' }
                ]
            },
            recommendation: {
                text: "Ich empfehle nicht. Ich verkaufe. Du entscheidest. Aber bedenke: Wer billig kauft, stirbt billig.",
                emotion: 'neutral',
                options: [
                    { text: "Verstanden", target: 'greeting' }
                ]
            },
            search_weapon: {
                text: "Sag direkt, was du willst. Stahl wird nicht billiger durchs Anstarren.",
                emotion: 'neutral',
                options: [
                    { text: "Klingenwaffen", target: 'show_blades' },
                    { text: "Wurfwaffen", target: 'show_thrown' },
                    { text: "Bomben", target: 'show_bombs', condition: { type: 'trust', min: 40 } },
                    { text: "Sonderware", target: 'show_special', condition: { type: 'relationship', min: 30 } },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_blades: {
                text: "Klingen. Ehrlich. Direkt. Eine Katana verlangt Disziplin. Ein Kunai verlangt nichts. Beide töten.",
                emotion: 'neutral',
                options: [
                    { text: "[Klingen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_thrown: {
                text: "Shuriken. Präzision trennt Anfänger von Leichen. Wer wirft, sollte auch treffen.",
                emotion: 'neutral',
                options: [
                    { text: "[Wurfwaffen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_bombs: {
                text: "Bomben. Schnell. Laut. Überzeugend. Diplomatie in Papierform. Manche Diskussionen enden besser mit Feuer.",
                emotion: 'friendly',
                options: [
                    { text: "[Bomben ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_special: {
                text: "Sonderware? Dafür brauchst du mehr als nur Geld. Diese Waffe wählt ihren Besitzer.",
                emotion: 'friendly',
                options: [
                    { text: "[Sonderware ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // STIMMUNG: MISSTRAUISCH (neuer Spieler, schlechter Ruf)
            greeting_suspicious: {
                text: this.getRandomTaroDialog('suspicious'),
                emotion: 'suspicious',
                options: [
                    { text: "Ich suche nur Waffen", target: 'show_goods_suspicious' },
                    { text: "Wer schickt dich?", target: 'who_sent_you' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_suspicious: {
                text: "Ich verkaufe nicht an jeden. Deine Augen suchen mehr als Ware. Sag besser sofort, warum du hier bist.",
                emotion: 'suspicious',
                options: [
                    { text: "[Vorsichtig einkaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            who_sent_you: {
                text: "Das ist keine Antwort. Erst Vertrauen. Dann Stahl. Manche Kunden zahlen mit Geld. Andere mit Problemen.",
                emotion: 'annoyed',
                options: [
                    { text: "Entschuldigung, ich gehe", action: 'close', effects: { relationship: -2 } },
                    { text: "Ich will nur kaufen", target: 'show_goods_suspicious' }
                ]
            },
            
            // STIMMUNG: GENERVT (zu oft gefeißt, nervig)
            greeting_annoyed: {
                text: this.getRandomTaroDialog('annoyed'),
                emotion: 'annoyed',
                options: [
                    { text: "Ich will kaufen", target: 'show_goods_annoyed' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_annoyed: {
                text: "Entweder kaufen oder gehen. Mein Geduldswert sinkt schneller als deine Chancen.",
                emotion: 'annoyed',
                options: [
                    { text: "[Schnell kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // STIMMUNG: WÜTEND (beleidigt, betrogen)
            greeting_angry: {
                text: this.getRandomTaroDialog('angry'),
                emotion: 'angry',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // FEILSCHEN
            haggle_attempt: {
                text: this.getRandomTaroHaggleResponse(),
                emotion: 'thinking',
                options: [
                    { text: "[Feilschen starten]", action: 'haggle' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_success: {
                text: "Für dich vielleicht ein wenig. Du bist wenigstens ehrlich. Ein kleiner Nachlass.",
                emotion: 'friendly',
                options: [
                    { text: "[Kaufen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_fail: {
                text: "Nein. Absolut nicht. Noch ein Versuch und es wird teurer.",
                emotion: 'annoyed',
                options: [
                    { text: "[Zum Normalpreis kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // VERKAUFEN
            sell_intro: {
                text: "Zeig her. Aber sei gewarnt: Ich erkenne Müll sofort.",
                emotion: 'thinking',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_good: {
                text: "Endlich bringt mir jemand etwas Brauchbares. Dafür zahle ich gut.",
                emotion: 'friendly',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_bad: {
                text: "Das ist Schrott. Dafür zahlt nicht mal ein Genin. Bring mir Qualität, nicht Müll.",
                emotion: 'annoyed',
                options: [
                    { text: "[Trotzdem verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_suspicious: {
                text: "Wo hast du DAS her? Entweder du lügst oder jemand sucht dich bereits. Diese Ware bringt Ärger.",
                emotion: 'suspicious',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // ABSCHLUSS
            purchase_success: {
                text: "Gute Wahl. Damit stirbt hoffentlich der Richtige. Pflege die Klinge, dann pflegt sie dich.",
                emotion: 'friendly',
                options: [
                    { text: "Zeig mir mehr", target: 'show_goods' },
                    { text: "Danke, auf Wiedersehen", action: 'close' }
                ]
            },
            purchase_cancel: {
                text: "Dann verschwende morgen jemand anderes meine Zeit. Komm wieder, wenn du entschlossener bist.",
                emotion: 'annoyed',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            }
        };
    },
    
    // ============================================
    // TARO DIALOG HILFSFUNKTIONEN
    // ============================================
    
    getRandomTaroDialog(mood) {
        const dialogs = {
            friendly: [
                "Ah, mein bester Kunde ist wieder da. Für dich hole ich sogar die guten Klingen raus.",
                "Heute suchst du Stahl oder nur Ärger? Wenn jemand meine Ware versteht, dann du.",
                "Ich habe da etwas, das dir gefallen könnte. Du siehst aus, als brauchst du eine neue Waffe.",
                "Für dich verschwende ich ausnahmsweise Zeit. Komm näher. Heute habe ich gute Ware.",
                "Manche Kunden kaufen. Du investierst. Du kämpfst wenigstens nicht wie ein Idiot.",
                "Du bist einer der wenigen Kunden, die Stahl respektieren. Was darf es sein?"
            ],
            neutral: [
                "Was brauchst du? Schnell. Ich habe Arbeit.",
                "Reden kostet. Kaufen auch. Schau dich um, aber verschwende meine Zeit nicht.",
                "Wenn du Gold hast, höre ich zu. Waffen sprechen sauberer als Menschen.",
                "Sag direkt, was du willst. Heute viele Fragen, wenige Käufer.",
                "Wenn du nur schauen willst, geh weiter. Stahl wird nicht billiger durchs Anstarren.",
                "Ich höre nur zu, wenn Gold mitredet. Was suchst du?"
            ],
            suspicious: [
                "Ich kenne dein Gesicht nicht. Das gefällt mir nicht.",
                "Fremde stellen oft die falschen Fragen. Wer schickt dich?",
                "Du wirkst wie jemand, der Ärger bringt. Ich verkaufe nicht an jeden.",
                "Erst Vertrauen. Dann Stahl. Manche Kunden zahlen mit Geld. Andere mit Problemen.",
                "Sag mir lieber sofort, warum du hier bist. Ich hoffe, du bist nicht dumm genug, mich zu belügen.",
                "Deine Augen suchen mehr als Ware. Sei ehrlich oder geh."
            ],
            annoyed: [
                "Wenn du noch einmal feilschst, wird es teurer.",
                "Ich bin Händler, kein Wohltätigkeitsverein. Du redest viel für jemanden ohne Kauf.",
                "Entweder kaufen oder gehen. Mein Geduldswert sinkt schneller als deine Chancen.",
                "Schon wieder du… Heute nicht. Wirklich nicht.",
                "Manche Kunden kosten mehr Nerven als Gold. Noch ein dummer Spruch und ich verdopple den Preis.",
                "Du testest meine Geduld mutig. Beeindruckend."
            ],
            angry: [
                "Noch ein Wort und du fliegst raus.",
                "Ich verkaufe Waffen. Ich benutze sie auch. Verschwinde, bevor ich meine Meinung ändere.",
                "Heute endet dieses Gespräch schlecht für jemanden. Du hast genau einen Satz übrig.",
                "Ich hoffe, du kannst schneller laufen als reden. Manche Probleme löst man nicht mit Worten.",
                "Kauf jetzt oder verschwinde. Du bist nah dran, mein schlechtester Kunde zu werden.",
                "Ich hatte schon angenehmere Attentäter hier."
            ]
        };
        
        const pool = dialogs[mood] || dialogs.neutral;
        return pool[Math.floor(Math.random() * pool.length)];
    },
    
    getRandomTaroHaggleResponse() {
        const responses = [
            "Warum sollte ich? Überzeug mich.",
            "Der Preis ist fair. Dein Gesicht nicht.",
            "Für dich vielleicht ein wenig. Du bist wenigstens ehrlich.",
            "Nein. Absolut nicht. Noch ein Versuch und es wird teurer.",
            "Ich verliere ungern Geld… aber gut. Ein kleiner Nachlass."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getTaroInventory() {
        return [
            { id: 'kunai', name: 'Kunai', price: 50, icon: '🗡️', description: 'Standard-Wurfwaffe jedes Shinobi' },
            { id: 'shuriken', name: 'Shuriken (5x)', price: 30, icon: '⭐', description: 'Sternförmige Wurfwaffen' },
            { id: 'katana', name: 'Katana', price: 500, icon: '⚔️', description: 'Eine scharfe, gut ausbalancierte Klinge' },
            { id: 'tanto', name: 'Tanto', price: 200, icon: '🗡️', description: 'Kurzes Stich-Schwert für Nahkämpfe' },
            { id: 'wakizashi', name: 'Wakizashi', price: 350, icon: '⚔️', description: 'Begleitklinge zur Katana' }
        ];
    },
    
    // ============================================
    // DIALOG-DATEN FÜR YUKI - RÜSTUNGSSCHMIEDIN
    // ============================================
    
    getYukiDialogs() {
        return {
            // STIMMUNG: FREUNDLICH (Vertrauen hoch, guter Kunde)
            greeting_friendly: {
                text: this.getRandomYukiDialog('friendly'),
                emotion: 'friendly',
                options: [
                    { text: "Zeig mir deine Rüstungen", target: 'show_armor_friendly', effects: { relationship: 1 } },
                    { text: "Ich suche etwas Besonderes", target: 'show_special_friendly', condition: { type: 'relationship', min: 30 } },
                    { text: "Small Talk", target: 'small_talk_friendly' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_armor_friendly: {
                text: "Für dich öffne ich auch die besseren Regale. Komm näher, ich habe etwas Passendes für dich.",
                emotion: 'friendly',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            show_special_friendly: {
                text: "Manche Stücke wähle nicht ich aus. Nicht jede Rüstung akzeptiert jeden Träger. Aber für dich mache ich eine Ausnahme.",
                emotion: 'friendly',
                options: [
                    { text: "[Sonderware ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            small_talk_friendly: {
                text: "Wenigstens kannst du dich vernünftig ausdrücken. Erzähl mir, was es Neues gibt.",
                emotion: 'thinking',
                options: [
                    { text: "Wie läuft das Geschäft?", target: 'talk_business_friendly' },
                    { text: "Was ist deine beste Arbeit?", target: 'best_work' },
                    { text: "Vergiss es", target: 'greeting_friendly' }
                ]
            },
            talk_business_friendly: {
                text: "Besser als letzte Woche. Heute sehe ich jemanden, der Qualität versteht. Das ist selten.",
                emotion: 'friendly',
                options: [
                    { text: "[Small Talk beenden]", action: 'smallTalk' },
                    { text: "Zeig mir deine Rüstungen", target: 'show_armor_friendly' }
                ]
            },
            best_work: {
                text: "Meine beste Arbeit? Die, die niemand sieht. Weil der Träger sie nicht brauchte. Gute Rüstung erkennt man daran, dass man sie vergisst.",
                emotion: 'friendly',
                options: [
                    { text: "Tiefgründig", target: 'greeting_friendly', effects: { relationship: 2 } }
                ]
            },
            
            // STIMMUNG: NEUTRAL (Standard)
            greeting: {
                text: this.getRandomYukiDialog('neutral'),
                emotion: 'neutral',
                options: [
                    { text: "Was brauchst du?", target: 'show_armor' },
                    { text: "Ich suche etwas Bestimmtes", target: 'search_armor' },
                    { text: "Small Talk", target: 'small_talk' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_armor: {
                text: "Schau dich um, aber verschwende meine Zeit nicht. Rüstung kauft man nicht aus Langeweile.",
                emotion: 'neutral',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            small_talk: {
                text: "Ich höre nur zu, wenn Gold mitredet. Aber für dich mache ich eine Ausnahme... heute.",
                emotion: 'thinking',
                options: [
                    { text: "Wie läuft das Geschäft?", target: 'talk_business' },
                    { text: "Was empfiehlst du?", target: 'recommendation' },
                    { text: "Vergiss es", target: 'greeting', effects: { relationship: -1 } }
                ]
            },
            talk_business: {
                text: "Stahl ist ehrlich. Menschen selten. Das Geschäft läuft, solange Kämpfer Schutz brauchen.",
                emotion: 'thinking',
                options: [
                    { text: "[Small Talk beenden]", action: 'smallTalk' },
                    { text: "Zeig mir deine Rüstungen", target: 'show_armor' }
                ]
            },
            recommendation: {
                text: "Ich empfehle nicht. Ich schmiede. Du entscheidest. Aber bedenke: Wer billig kauft, blutet teuer.",
                emotion: 'neutral',
                options: [
                    { text: "Weise Worte", target: 'greeting' }
                ]
            },
            search_armor: {
                text: "Sag direkt, was du suchst. Ich verkaufe Sicherheit, nicht Dekoration.",
                emotion: 'neutral',
                options: [
                    { text: "Leder-Rüstung", target: 'show_leather' },
                    { text: "Metall-Rüstung", target: 'show_metal' },
                    { text: "Chakra-Rüstung", target: 'show_chakra', condition: { type: 'trust', min: 50 } },
                    { text: "Schmuck/Accessoires", target: 'show_jewelry' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_leather: {
                text: "Leder. Leicht. Flexibel. Überlebt oft länger als Stolz. Anfänger unterschätzen gute Lederarbeit.",
                emotion: 'neutral',
                options: [
                    { text: "[Leder-Rüstungen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_metal: {
                text: "Metall. Schwer. Ehrlich. Effektiv. Wer das trägt, meint es ernst. Schutz kostet Gewicht. Und Gold.",
                emotion: 'neutral',
                options: [
                    { text: "[Metall-Rüstungen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_chakra: {
                text: "Chakra-Rüstung. Nicht für jeden. Nicht für jeden bezahlbar. Diese Rüstung schützt mehr als Fleisch.",
                emotion: 'friendly',
                options: [
                    { text: "[Chakra-Rüstungen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_jewelry: {
                text: "Ringe. Halsketten. Klein bedeutet nicht bedeutungslos. Manche Kämpfe entscheidet ein Fingerbreit.",
                emotion: 'neutral',
                options: [
                    { text: "[Schmuck ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // STIMMUNG: MISSTRAUISCH (neuer Spieler, schlechter Ruf)
            greeting_suspicious: {
                text: this.getRandomYukiDialog('suspicious'),
                emotion: 'suspicious',
                options: [
                    { text: "Ich suche nur Rüstung", target: 'show_armor_suspicious' },
                    { text: "Wer schickt dich?", target: 'who_sent_you' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_armor_suspicious: {
                text: "Ich verkaufe Schutz, nicht Vertrauen. Deine Schritte klingen nach Ärger. Sag besser sofort, was du willst.",
                emotion: 'suspicious',
                options: [
                    { text: "[Vorsichtig einkaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            who_sent_you: {
                text: "Das ist keine Antwort. Erst beweist du dich. Dann reden wir. Manche Kunden bringen Gold. Andere Krieg.",
                emotion: 'annoyed',
                options: [
                    { text: "Entschuldigung, ich gehe", action: 'close', effects: { relationship: -2 } },
                    { text: "Ich will nur kaufen", target: 'show_armor_suspicious' }
                ]
            },
            
            // STIMMUNG: GENERVT (zu oft gefeißt, nervig)
            greeting_annoyed: {
                text: this.getRandomYukiDialog('annoyed'),
                emotion: 'annoyed',
                options: [
                    { text: "Ich will kaufen", target: 'show_armor_annoyed' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_armor_annoyed: {
                text: "Entweder kaufen oder gehen. Mein Hammer hat heute weniger Geduld als ich.",
                emotion: 'annoyed',
                options: [
                    { text: "[Schnell kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // STIMMUNG: WÜTEND (beleidigt, betrogen)
            greeting_angry: {
                text: this.getRandomYukiDialog('angry'),
                emotion: 'angry',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // FEILSCHEN
            haggle_attempt: {
                text: this.getRandomYukiHaggleResponse(),
                emotion: 'thinking',
                options: [
                    { text: "[Feilschen starten]", action: 'haggle' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_success: {
                text: "Für dich vielleicht ein wenig. Ich verliere ungern Gold… aber gut.",
                emotion: 'friendly',
                options: [
                    { text: "[Kaufen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_fail: {
                text: "Nein. Ganz sicher nicht. Noch ein Versuch und es wird teurer.",
                emotion: 'annoyed',
                options: [
                    { text: "[Zum Normalpreis kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // VERKAUFEN
            sell_intro: {
                text: "Zeig her. Aber sei gewarnt: Ich erkenne Schrott sofort.",
                emotion: 'thinking',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_good: {
                text: "Das ist brauchbar. Endlich bringt jemand Qualität. Dafür zahle ich fair.",
                emotion: 'friendly',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_bad: {
                text: "Das ist Schrott. Dafür zahlt niemand mit Verstand. Bring mir Stahl, nicht Müll.",
                emotion: 'annoyed',
                options: [
                    { text: "[Trotzdem verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_suspicious: {
                text: "Woher stammt das? Diese Ware riecht nach Problemen. Entweder du lügst oder jemand sucht bereits nach dir.",
                emotion: 'suspicious',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // ABSCHLUSS
            purchase_success: {
                text: "Gute Wahl. Trag sie richtig, dann trägt sie dich. Schutz beginnt vor dem ersten Treffer.",
                emotion: 'friendly',
                options: [
                    { text: "Zeig mir mehr", target: 'show_armor' },
                    { text: "Danke, auf Wiedersehen", action: 'close' }
                ]
            },
            purchase_cancel: {
                text: "Dann verschwende morgen jemand anderes meine Zeit. Komm wieder, wenn du verstanden hast, wie teuer Blut ist.",
                emotion: 'annoyed',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            }
        };
    },
    
    // ============================================
    // YUKI DIALOG HILFSFUNKTIONEN
    // ============================================
    
    getRandomYukiDialog(mood) {
        const dialogs = {
            friendly: [
                "Ah, du lebst noch. Meine Arbeit also auch.",
                "Für dich nehme ich mir Zeit. Gute Rüstung erkennt man daran, dass man sie vergisst.",
                "Komm näher, ich habe etwas Passendes für dich. Du trägst meine Arbeit wenigstens mit Würde.",
                "Schutz ist kein Luxus. Es ist Überleben. Heute sehe ich jemanden, der Qualität versteht.",
                "Haltung gefällt mir. Das ist selten. Manche kaufen Schmuck. Du kaufst Zukunft.",
                "Du bist einer der wenigen Kunden, die Qualität erkennen. Was darf es sein?"
            ],
            neutral: [
                "Was brauchst du?",
                "Wenn du Schutz willst, rede klar. Rüstung kauft man nicht aus Langeweile.",
                "Ich verkaufe Sicherheit, nicht Dekoration. Sag direkt, was du suchst.",
                "Stahl ist ehrlich. Menschen selten. Schau dich um, aber verschwende meine Zeit nicht.",
                "Wer billig kauft, blutet teuer. Deine Entscheidung heute bestimmt deinen morgigen Schmerz.",
                "Ich höre nur zu, wenn Gold mitredet. Was suchst du?"
            ],
            suspicious: [
                "Ich kenne dich nicht. Das ist ein Problem.",
                "Fremde mit Fragen gefallen mir selten. Wer schickt dich?",
                "Deine Schritte klingen nach Ärger. Ich verkaufe Schutz, nicht Vertrauen.",
                "Erst beweist du dich. Dann reden wir. Manche Kunden bringen Gold. Andere Krieg.",
                "Deine Augen suchen mehr als Ausrüstung. Ich hoffe, du bist klüger als du aussiehst.",
                "Lügen rosten schneller als Stahl. Sei ehrlich oder geh."
            ],
            annoyed: [
                "Wenn du noch einmal über den Preis redest, endet das hier schlecht.",
                "Ich schmiede Rüstungen, keine Wunder. Du redest viel für jemanden ohne Kauf.",
                "Entweder kaufen oder gehen. Mein Hammer hat heute weniger Geduld als ich.",
                "Schon wieder dieselbe Frage? Heute nicht.",
                "Manche Kunden sind schwerer zu ertragen als Vollplattenrüstung.",
                "Noch ein dummer Kommentar und ich erhöhe den Preis. Deine Ausdauer beeindruckt mich nicht."
            ],
            angry: [
                "Noch ein Wort und du fliegst raus.",
                "Ich baue Schutz. Ich kann ihn auch entfernen. Verschwinde, bevor ich unfreundlich werde.",
                "Dieses Gespräch endet gleich sehr kurz. Du hast genau einen Satz übrig.",
                "Teste nicht meine Geduld. Manche Lektionen lernt man durch Schmerzen.",
                "Kauf jetzt oder geh. Du bist nah dran, Hausverbot zu bekommen."
            ]
        };
        
        const pool = dialogs[mood] || dialogs.neutral;
        return pool[Math.floor(Math.random() * pool.length)];
    },
    
    getRandomYukiHaggleResponse() {
        const responses = [
            "Warum sollte ich? Überzeug mich.",
            "Der Preis ist fair. Deine Hoffnung nicht.",
            "Für dich vielleicht ein wenig. Du hast wenigstens Stil beim Fragen.",
            "Nein. Ganz sicher nicht. Noch ein Versuch und es wird teurer.",
            "Ich verliere ungern Gold… aber gut. Ein kleiner Nachlass."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getYukiInventory() {
        return [
            { id: 'leather_armor', name: 'Leder-Rüstung', price: 100, icon: '🛡️', description: 'Grundlegende Schutzausrüstung' },
            { id: 'chain_mail', name: 'Kettenhemd', price: 300, icon: '🛡️', description: 'Guter Schutz bei Bewegungsfreiheit' },
            { id: 'plate_armor', name: 'Plattenrüstung', price: 800, icon: '🛡️', description: 'Schwerer, aber ausgezeichneter Schutz' },
            { id: 'shin_guards', name: 'Schienbeinschoner', price: 75, icon: '🦵', description: 'Schützt die Beine im Kampf' }
        ];
    },
    
    // ============================================
    // DIALOG-DATEN FÜR SHIN - ALLZWECKHÄNDLER
    // ============================================
    
    getShinDialogs() {
        return {
            // STIMMUNG: FREUNDLICH (Vertrauen hoch, guter Kunde)
            greeting_friendly: {
                text: this.getRandomShinDialog('friendly'),
                emotion: 'happy',
                options: [
                    { text: "Zeig mir deine Ware", target: 'show_goods_friendly', effects: { relationship: 1 } },
                    { text: "Ich habe Gerüchte gehört...", target: 'rumors', condition: { type: 'relationship', min: 20 } },
                    { text: "Small Talk", target: 'small_talk_friendly' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_friendly: {
                text: "Für dich finde ich immer etwas Interessantes. Schau dir das an!",
                emotion: 'friendly',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            small_talk_friendly: {
                text: "Wenigstens bist du interessant. Erzähl mir was Neues.",
                emotion: 'thinking',
                options: [
                    { text: "Wie läuft das Geschäft?", target: 'talk_business_friendly' },
                    { text: "Hast du Neuigkeiten?", target: 'rumors' },
                    { text: "Vergiss es", target: 'greeting_friendly' }
                ]
            },
            talk_business_friendly: {
                text: "Besser als letzte Woche. Schlechter als morgen. Aber für dich mache ich gerne eine Ausnahme.",
                emotion: 'happy',
                options: [
                    { text: "[Small Talk beenden]", action: 'smallTalk' },
                    { text: "Zeig mir deine Ware", target: 'show_goods_friendly' }
                ]
            },
            
            // STIMMUNG: NEUTRAL (Standard)
            greeting: {
                text: this.getRandomShinDialog('neutral'),
                emotion: 'neutral',
                options: [
                    { text: "Was hast du?", target: 'show_goods' },
                    { text: "Ich suche etwas Bestimmtes", target: 'search_item' },
                    { text: "Small Talk", target: 'small_talk' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods: {
                text: "Schau dich ruhig um. Wenn ich es nicht habe, brauchst du es wahrscheinlich nicht.",
                emotion: 'neutral',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            small_talk: {
                text: "Informationen kosten übrigens extra. Aber für dich mache ich eine Ausnahme... heute.",
                emotion: 'thinking',
                options: [
                    { text: "Wie läuft das Geschäft?", target: 'talk_business' },
                    { text: "Hast du Neuigkeiten?", target: 'rumors', condition: { type: 'relationship', min: 0 } },
                    { text: "Vergiss es", target: 'greeting', effects: { relationship: -1 } }
                ]
            },
            talk_business: {
                text: "Manche Dinge verkauft man. Manche nur fast. Das Geschäft ist... kompliziert.",
                emotion: 'thinking',
                options: [
                    { text: "[Small Talk beenden]", action: 'smallTalk' },
                    { text: "Zeig mir deine Ware", target: 'show_goods' }
                ]
            },
            search_item: {
                text: "Sag mir, was du suchst. Aber sei gewarnt: Seltene Dinge haben seltene Preise.",
                emotion: 'thinking',
                options: [
                    { text: "Heilkräuter", target: 'show_herbs' },
                    { text: "Schriftrollen", target: 'show_scrolls', condition: { type: 'trust', min: 40 } },
                    { text: "Sonderware", target: 'show_special', condition: { type: 'relationship', min: 30 } },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_herbs: {
                text: "Heilkräuter? Schmeckt furchtbar. Wirkt wunderbar. Wer das freiwillig trinkt, will wirklich leben.",
                emotion: 'friendly',
                options: [
                    { text: "[Heilkräuter ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_scrolls: {
                text: "Schriftrollen? Wissen wiegt wenig, kostet aber viel. Manche retten Leben. Andere ruinieren sie.",
                emotion: 'thinking',
                options: [
                    { text: "[Schriftrollen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_special: {
                text: "Sonderware? Dafür brauchst du mehr als Geld. Manche Dinge verkaufe ich nur an interessante Menschen.",
                emotion: 'friendly',
                options: [
                    { text: "[Sonderware ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // STIMMUNG: MISSTRAUISCH (neuer Spieler, schlechter Ruf)
            greeting_suspicious: {
                text: this.getRandomShinDialog('suspicious'),
                emotion: 'suspicious',
                options: [
                    { text: "Ich suche nur...", target: 'show_goods_suspicious' },
                    { text: "Wer hat dich geschickt?", target: 'who_sent_you' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_suspicious: {
                text: "Fremde kaufen oft Probleme. Ich beobachte dich. Sag besser sofort, was du willst.",
                emotion: 'suspicious',
                options: [
                    { text: "[Vorsichtig einkaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            who_sent_you: {
                text: "Das ist keine Antwort. Das ist eine neue Frage. Und ich mag deine Fragen nicht.",
                emotion: 'annoyed',
                options: [
                    { text: "Entschuldigung, ich gehe", action: 'close', effects: { relationship: -2 } },
                    { text: "Ich will nur kaufen", target: 'show_goods_suspicious' }
                ]
            },
            
            // STIMMUNG: GENERVT (zu oft gefeißt, nervig)
            greeting_annoyed: {
                text: this.getRandomShinDialog('annoyed'),
                emotion: 'annoyed',
                options: [
                    { text: "Ich will kaufen", target: 'show_goods_annoyed' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_annoyed: {
                text: "Entweder kaufen oder Platz machen. Ich handle mit Waren, nicht mit Geduld.",
                emotion: 'annoyed',
                options: [
                    { text: "[Schnell kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // STIMMUNG: WÜTEND (beleidigt, betrogen)
            greeting_angry: {
                text: this.getRandomShinDialog('angry'),
                emotion: 'angry',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // GERÜCHTE
            rumors: {
                text: this.getRandomShinRumor(),
                emotion: 'thinking',
                options: [
                    { text: "Erzähl mir mehr", target: 'rumors_more', condition: { type: 'relationship', min: 10 } },
                    { text: "Danke für die Info", target: 'greeting', effects: { relationship: 2 } }
                ]
            },
            rumors_more: {
                text: "Informationen kosten extra. Gerüchte sind billiger als Wahrheit. Was willst du wissen?",
                emotion: 'friendly',
                options: [
                    { text: "[10 Gold bezahlen]", target: 'rumors_paid', effects: { relationship: 1 } },
                    { text: "Vielleicht später", target: 'greeting' }
                ]
            },
            rumors_paid: {
                text: this.getRandomShinRumor(),
                emotion: 'happy',
                options: [
                    { text: "Danke", target: 'greeting' }
                ]
            },
            
            // FEILSCHEN
            haggle_attempt: {
                text: this.getRandomShinHaggleResponse(),
                emotion: 'thinking',
                options: [
                    { text: "[Feilschen starten]", action: 'haggle' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_success: {
                text: "Gut. Ein kleiner Nachlass. Aber nur weil du charmant fragst.",
                emotion: 'friendly',
                options: [
                    { text: "[Kaufen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_fail: {
                text: "Nein. Absolut nicht. Noch ein Versuch und es wird teurer.",
                emotion: 'annoyed',
                options: [
                    { text: "[Zum Normalpreis kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // VERKAUFEN
            sell_intro: {
                text: "Zeig her. Aber sei gewarnt: Ich erkenne Müll sofort.",
                emotion: 'thinking',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_good: {
                text: "Gute Ware erkenne ich sofort. Dafür finde ich sofort einen Käufer.",
                emotion: 'happy',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_bad: {
                text: "Das ist Müll. Selbst Genin würden dafür nicht zahlen.",
                emotion: 'annoyed',
                options: [
                    { text: "[Trotzdem verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_suspicious: {
                text: "Wo hast du DAS her? Interessant... und gefährlich.",
                emotion: 'suspicious',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // ABSCHLUSS
            purchase_success: {
                text: "Gute Wahl. Hoffentlich rettet dir das irgendwann das Leben.",
                emotion: 'friendly',
                options: [
                    { text: "Zeig mir mehr", target: 'show_goods' },
                    { text: "Danke, auf Wiedersehen", action: 'close' }
                ]
            },
            purchase_cancel: {
                text: "Dann verschwende morgen jemand anderes meine Zeit. Komm wieder, wenn du mehr Gold und weniger Zweifel hast.",
                emotion: 'annoyed',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            }
        };
    },
    
    // ============================================
    // SHIN DIALOG HILFSFUNKTIONEN
    // ============================================
    
    getRandomShinDialog(mood) {
        const dialogs = {
            friendly: [
                "Ahhh, mein Lieblingskunde lebt noch. Für dich finde ich immer etwas Interessantes.",
                "Du kommst nie ohne gute Geschichten zurück. Willkommen zurück.",
                "Manche bringen Geld. Du bringst Unterhaltung. Heute habe ich besondere Ware.",
                "Für dich öffne ich sogar die guten Kisten. Ich habe da etwas, das perfekt zu deinem schlechten Lebensstil passt.",
                "Wer vorbereitet ist, stirbt langsamer. Heute bist du genau zur richtigen Zeit hier.",
                "Du bist einer der wenigen Kunden, die ich vermisse. Was darf es sein?"
            ],
            neutral: [
                "Was darf es heute sein?",
                "Wenn ich es nicht habe, brauchst du es wahrscheinlich nicht.",
                "Sag mir, was du suchst. Alles hat seinen Preis.",
                "Manche Dinge verkauft man. Manche nur fast.",
                "Wer vorbereitet ist, lebt länger. Schau dich ruhig um.",
                "Heute kaufst du hoffentlich mehr als nur Fragen."
            ],
            suspicious: [
                "Ich kenne dich nicht. Das macht mich vorsichtig.",
                "Fremde kaufen oft Probleme. Wer hat dich zu mir geschickt?",
                "Deine Fragen gefallen mir nicht. Manche Kunden suchen Ware. Andere suchen Ärger.",
                "Vertrauen ist hier teurer als Gold. Du wirkst wie jemand, der zu viele Geheimnisse hat.",
                "Sag besser sofort, was du willst. Ich hoffe, du bist klüger als deine Ausstrahlung.",
                "Lügen erkenne ich schneller als Rabatte."
            ],
            annoyed: [
                "Wenn du noch einmal feilschst, verkaufe ich dir Luft.",
                "Ich handle mit Waren, nicht mit Geduld. Du redest viel für jemanden mit wenig Gold.",
                "Entweder kaufen oder Platz machen. Manche Kunden kosten mehr Energie als Gewinn.",
                "Schon wieder du? Heute ist nicht dein Glückstag.",
                "Noch ein schlechter Witz und ich erhöhe den Preis.",
                "Selbst meine Bandagen halten länger als meine Geduld."
            ],
            angry: [
                "Noch ein Wort und ich vergesse meine Freundlichkeit.",
                "Ich verkaufe Hilfe. Ich kann auch das Gegenteil liefern. Verschwinde, bevor das teuer wird.",
                "Dieses Gespräch endet gleich schlecht für dich. Du hast genau einen Satz übrig.",
                "Manche Probleme verkauft man nicht. Man beseitigt sie. Kauf jetzt oder geh.",
                "Ich hoffe, du kannst schneller laufen als diskutieren. Du bist gefährlich nah an Hausverbot."
            ]
        };
        
        const pool = dialogs[mood] || dialogs.neutral;
        return pool[Math.floor(Math.random() * pool.length)];
    },
    
    getRandomShinRumor() {
        const rumors = [
            "Gerücht: Ein gewisser Händler in der nächsten Stadt verkauft verfluchte Schriftrollen. Billig, aber teuer im Nachhinein.",
            "Wissen: Die Chakra-Steine aus dem Norden sind rein, aber die Händler dort lügen über die Herkunft.",
            "Neuigkeit: Ein Team von Genin hat gestern eine verbotene Höhle erkundet. Niemand ist zurückgekommen. Interessante Funde sicher.",
            "Gerücht: Der Dorfälteste sucht seltene Kräuter. Zahlt gut, aber schweigt über den Grund.",
            "Wissen: Die Preise für Heiltränke steigen. Ein Händler namens Shin hat angeblich den Markt unter Kontrolle.",
            "Neuigkeit: Ein Schwarzhändler wurde gesehen. Nicht Kira. Jemand Neues. Gefährlich.",
            "Gerücht: Die Banditen im Wald haben ein Lager. Voller Beute. Und Fallen. Viele Fallen.",
            "Wissen: Chakra-Pillen wirken schneller, wenn man sie mit Tee nimmt. Aber schmecken sie dann besser? Nein."
        ];
        return rumors[Math.floor(Math.random() * rumors.length)];
    },
    
    getRandomShinHaggleResponse() {
        const responses = [
            "Warum sollte ich? Der Preis ist fair. Dein Blick nicht.",
            "Gib mir einen guten Grund. Aber beeil dich, meine Geduld ist begrenzt.",
            "Für dich vielleicht ein kleines Wunder. Aber nur weil du charmant fragst.",
            "Nein. Absolut nicht. Noch ein Versuch und es wird teurer.",
            "Du fragst wenigstens charmant. Gut. Ein kleiner Nachlass."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getShinInventory() {
        return [
            { id: 'potion', name: 'Heiltrank', price: 25, icon: '🧪', description: 'Stellt Lebenspunkte wieder her' },
            { id: 'bandage', name: 'Verbände', price: 10, icon: '🩹', description: 'Grundlegende Erste-Hilfe' },
            { id: 'rope', name: 'Seil (10m)', price: 15, icon: '🪢', description: 'Nützlich für Missionen' },
            { id: 'rations', name: 'Rationen (3 Tage)', price: 20, icon: '🍱', description: 'Essen für unterwegs' },
            { id: 'torch', name: 'Fackeln (5x)', price: 8, icon: '🔥', description: 'Beleuchtung für dunkle Orte' }
        ];
    },
    
    // ============================================
    // DIALOG-DATEN FÜR KIRA
    // ============================================
    // DIALOG-DATEN FÜR KIRA - SCHWARZMARKT HÄNDLERIN
    // ============================================
    
    getKiraDialogs() {
        return {
            // STIMMUNG: FREUNDLICH (selten, sehr hohes Vertrauen)
            greeting_friendly: {
                text: this.getRandomKiraDialog('friendly'),
                emotion: 'happy',
                options: [
                    { text: "Zeig mir deine Ware", target: 'show_goods_friendly', effects: { relationship: 1 } },
                    { text: "Ich suche etwas Besonderes", target: 'show_special_friendly', condition: { type: 'relationship', min: 50 } },
                    { text: "Hast du Informationen?", target: 'info_friendly', condition: { type: 'trust', min: 60 } },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_friendly: {
                text: "Für dich öffne ich vielleicht die richtige Schublade. Manche Kunden kaufen Ware. Du kaufst Möglichkeiten.",
                emotion: 'friendly',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            show_special_friendly: {
                text: "Manche Türen öffnen sich nur einmal. Für dich mache ich eine Ausnahme. Aber denk daran: Nicht jedes Geschäft endet beim Bezahlen.",
                emotion: 'friendly',
                options: [
                    { text: "[Sonderware ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            info_friendly: {
                text: "Wahrheit ist die teuerste Ware. Informationen kosten mehr, wenn sie nützlich sind. Was willst du wissen?",
                emotion: 'thinking',
                options: [
                    { text: "[20 Gold bezahlen]", target: 'info_reveal', effects: { relationship: 1 } },
                    { text: "Zurück", target: 'greeting_friendly' }
                ]
            },
            info_reveal: {
                text: this.getRandomKiraSecret(),
                emotion: 'friendly',
                options: [
                    { text: "Danke für die Info", target: 'greeting_friendly' }
                ]
            },
            
            // STIMMUNG: NEUTRAL (Standard - ruhig gefährlich)
            greeting: {
                text: this.getRandomKiraDialog('neutral'),
                emotion: 'neutral',
                options: [
                    { text: "Sag, was du willst", target: 'show_goods' },
                    { text: "Ich suche etwas Illegales", target: 'search_illegal', condition: { type: 'trust', min: 20 } },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods: {
                text: "Nicht alles, was verkauft wird, sollte gekauft werden. Ware ist einfach. Konsequenzen nicht.",
                emotion: 'neutral',
                options: [
                    { text: "[Shop öffnen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            search_illegal: {
                text: "Wenn du hier bist, suchst du entweder Macht oder Probleme. Ich hoffe für dich, dass du den Unterschied kennst.",
                emotion: 'thinking',
                options: [
                    { text: "Gift", target: 'show_poison' },
                    { text: "Verbotene Schriftrollen", target: 'show_forbidden', condition: { type: 'trust', min: 40 } },
                    { text: "Dunkle Artefakte", target: 'show_artifacts', condition: { type: 'relationship', min: 30 } },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_poison: {
                text: "Gift. Schnell. Still. Elegant. Für Menschen, die Probleme diskret lösen. Manche Gespräche enden besser ohne Zeugen.",
                emotion: 'neutral',
                options: [
                    { text: "[Gifte ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_forbidden: {
                text: "Verbotene Schriftrollen. Manche Dinge sollte man nicht lesen. Wissen ist oft gefährlicher als Stahl. Diese Schriftrolle verändert Menschen.",
                emotion: 'thinking',
                options: [
                    { text: "[Schriftrollen ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            show_artifacts: {
                text: "Dunkle Artefakte. Manche Dinge besitzen ihre Besitzer. Wenn du das kaufst, kaufst du Folgen. Nicht jedes Geschäft endet beim Bezahlen.",
                emotion: 'friendly',
                options: [
                    { text: "[Artefakte ansehen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // STIMMUNG: MISSTRAUISCH (Standard für neue Spieler)
            greeting_suspicious: {
                text: this.getRandomKiraDialog('suspicious'),
                emotion: 'suspicious',
                options: [
                    { text: "Ich suche nur... Ware", target: 'show_goods_suspicious' },
                    { text: "Wer hat dir meinen Namen gegeben?", target: 'who_sent_you' },
                    { text: "Entschuldigung, falscher Laden", action: 'close' }
                ]
            },
            show_goods_suspicious: {
                text: "Ich kenne dich nicht. Das ist ein Problem. Fremde überleben hier selten lange. Sag besser sofort, was du willst.",
                emotion: 'suspicious',
                options: [
                    { text: "[Vorsichtig einkaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            who_sent_you: {
                text: "Das ist keine Antwort. Manche Gesichter bringen nur Fragen. Du bist eines davon. Ich entscheide gleich, ob du Kunde bist… oder Warnung.",
                emotion: 'annoyed',
                options: [
                    { text: "Entschuldigung, ich gehe", action: 'close', effects: { relationship: -3 } },
                    { text: "Ich will nur kaufen", target: 'show_goods_suspicious' }
                ]
            },
            
            // STIMMUNG: GENERVT (zu oft gefeißt, nervig)
            greeting_annoyed: {
                text: this.getRandomKiraDialog('annoyed'),
                emotion: 'annoyed',
                options: [
                    { text: "Ich will kaufen", target: 'show_goods_annoyed' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            show_goods_annoyed: {
                text: "Entweder kaufen oder gehen. Meine Geduld ist deutlich gefährlicher als meine Ware. Heute wäre ein guter Tag für weniger Worte.",
                emotion: 'annoyed',
                options: [
                    { text: "[Schnell kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // STIMMUNG: WÜTEND (beleidigt, Verrat, betrogen)
            greeting_angry: {
                text: this.getRandomKiraDialog('angry'),
                emotion: 'angry',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // FEILSCHEN
            haggle_attempt: {
                text: this.getRandomKiraHaggleResponse(),
                emotion: 'thinking',
                options: [
                    { text: "[Feilschen starten]", action: 'haggle' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_success: {
                text: "Mutig. Ich respektiere das. Für dich vielleicht… ein wenig.",
                emotion: 'friendly',
                options: [
                    { text: "[Kaufen]", action: 'openShop' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            haggle_fail: {
                text: "Nein. Noch einmal und es wird teurer. Manche Fehler sollte man nicht wiederholen.",
                emotion: 'annoyed',
                options: [
                    { text: "[Zum Normalpreis kaufen]", action: 'openShop' },
                    { text: "Verlassen", action: 'close' }
                ]
            },
            
            // VERKAUFEN
            sell_intro: {
                text: "Zeig her. Aber sei gewarnt: Selbst auf dem Schwarzmarkt hat Schrott Grenzen.",
                emotion: 'thinking',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_good: {
                text: "Gute Ware erkennt man am Schweigen danach. Dafür finde ich schnell einen Käufer.",
                emotion: 'friendly',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_bad: {
                text: "Das ist Müll. Selbst auf dem Schwarzmarkt hat Schrott Grenzen. Bring mir Wert, nicht Ausreden.",
                emotion: 'annoyed',
                options: [
                    { text: "[Trotzdem verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            sell_suspicious: {
                text: "Woher stammt das wirklich? Interessant… sehr interessant. Entweder du bist mutig oder bereits tot.",
                emotion: 'suspicious',
                options: [
                    { text: "[Verkaufen]", action: 'sell' },
                    { text: "Zurück", target: 'greeting' }
                ]
            },
            
            // ABSCHLUSS
            purchase_success: {
                text: "Gute Wahl. Hoffentlich überlebst du lang genug, um sie zu bereuen. Manche Käufe verändern mehr als nur dein Inventar.",
                emotion: 'friendly',
                options: [
                    { text: "Zeig mir mehr", target: 'show_goods' },
                    { text: "Danke, auf Wiedersehen", action: 'close' }
                ]
            },
            purchase_cancel: {
                text: "Dann geh. Türen schließen sich schneller als sie sich öffnen. Komm wieder… falls du noch kannst.",
                emotion: 'annoyed',
                options: [
                    { text: "Verlassen", action: 'close' }
                ]
            }
        };
    },
    
    // ============================================
    // KIRA DIALOG HILFSFUNKTIONEN
    // ============================================
    
    getRandomKiraDialog(mood) {
        const dialogs = {
            friendly: [
                "Interessant… du lebst also noch. Nicht viele schaffen es, zweimal eingeladen zu werden.",
                "Für dich öffne ich vielleicht die richtige Schublade. Manche Kunden kaufen Ware. Du kaufst Möglichkeiten.",
                "Ich schätze Menschen, die wissen, wann sie schweigen müssen. Heute könnte dein Glück stärker sein als dein Verstand.",
                "Du bist entweder nützlich… oder unterhaltsam. Komm näher. Heute rede ich mit dir.",
                "Vertrauen ist teuer. Du hast bereits bezahlt. Manche Türen öffnen sich nur einmal.",
                "Du bist einer der wenigen, die zurückgekehrt sind. Das sagt entweder etwas über dich… oder über meine Preise."
            ],
            neutral: [
                "Sag, was du willst. Zeit ist hier teurer als Gold.",
                "Manche Dinge fragt man nur einmal. Nicht alles, was verkauft wird, sollte gekauft werden.",
                "Worte sind gefährlich. Wähle sie gut. Wenn du hier bist, suchst du entweder Macht oder Probleme.",
                "Ich hoffe für dich, dass du den Unterschied kennst. Ware ist einfach. Konsequenzen nicht.",
                "Rede leise. Wände erinnern sich. Wer zu viel fragt, bleibt selten lange.",
                "Ich höre zu. Aber nur, wenn es sich lohnt. Was suchst du wirklich?"
            ],
            suspicious: [
                "Ich kenne dich nicht. Das ist ein Problem. Fremde überleben hier selten lange.",
                "Wer hat dir meinen Namen gegeben? Deine Schritte klingen nach Ärger.",
                "Manche Gesichter bringen nur Fragen. Du bist eines davon. Ich mag keine Überraschungen.",
                "Noch weniger mag ich schlechte Lügner. Warum sollte ich dir vertrauen?",
                "Deine Augen verraten zu viel. Ich entscheide gleich, ob du Kunde bist… oder Warnung.",
                "Lügen sind hier teurer als Wahrheit. Sei ehrlich oder geh."
            ],
            annoyed: [
                "Wenn du noch einmal feilschst, verkaufe ich dir dein eigenes Problem zurück.",
                "Ich bin nicht hier, um deine Unsicherheit zu finanzieren. Du redest viel für jemanden, der noch lebt.",
                "Manche Kunden sind teuer, ohne etwas zu kaufen. Noch ein schlechter Versuch und dieses Gespräch endet.",
                "Du solltest lernen, wann man still ist. Meine Geduld ist deutlich gefährlicher als meine Ware.",
                "Beeindruckend, wie konsequent du falsche Entscheidungen triffst. Heute wäre ein guter Tag für weniger Worte.",
                "Deine Stimme verliert gerade an Wert. Entweder kaufen oder verschwinden."
            ],
            angry: [
                "Noch ein Wort und du verschwindest. Ich verkaufe Lösungen. Ich werde selbst eine.",
                "Du bist gefährlich nah daran, ein Beispiel zu werden. Dieses Gespräch endet jetzt.",
                "Du hast genau einen Atemzug übrig. Manche Fehler bezahlt man nicht mit Geld.",
                "Lauf. Das wäre heute deine beste Entscheidung. Du hast meine schlechte Seite gefunden. Gratulation.",
                "Manche Namen verschwinden aus meinen Listen. Menschen auch. Ich hoffe, du betest schneller als du redest."
            ]
        };
        
        const pool = dialogs[mood] || dialogs.neutral;
        return pool[Math.floor(Math.random() * pool.length)];
    },
    
    getRandomKiraSecret() {
        const secrets = [
            "Gerücht: Ein hoher Offizier des Dorfes kauft regelmäßig Gegengift. Ob er Angst hat… oder plant?",
            "Wissen: Die verbotenen Schriftrollen im Ostturm sind nicht alle Fälschungen. Manche sind nur… vergessen.",
            "Geheimnis: Ein gewisser Clan-Anführer hat eine Schwäche für seltene Gifte. Nicht zum Töten. Zum Probieren.",
            "Information: Die nächste Lieferung 'verlorener' Waren kommt in drei Nächten. Am alten Brunnen.",
            "Gerücht: Jemand sucht nach einem Attentäter. Hohes Kopfgeld. Aber der Auftraggeber ist… kompliziert.",
            "Wissen: Die Hokage weiß mehr über den Schwarzmarkt, als sie zugibt. Manche Augen sehen gerne zu.",
            "Geheimnis: Ein bestimmter Jutsu-Meister verkauft seine Techniken. Nicht an jeden. Nur an Verzweifelte.",
            "Warnung: Jemand hat nach dir gefragt. Nicht mit Freundlichkeit. Sei vorsichtig die nächsten Tage."
        ];
        return secrets[Math.floor(Math.random() * secrets.length)];
    },
    
    getRandomKiraHaggleResponse() {
        const responses = [
            "Warum sollte ich? Gib mir einen überzeugenden Grund.",
            "Der Preis ist fair. Dein Wunsch nicht.",
            "Mutig. Ich respektiere das. Für dich vielleicht… ein wenig.",
            "Nein. Noch einmal und es wird teurer.",
            "Du weißt wenigstens, wie man fragt. Aber das reicht nicht."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getKiraInventory() {
        return [
            { id: 'poison', name: 'Gift', price: 200, icon: '☠️', description: 'Nicht für den zivilen Gebrauch' },
            { id: 'lockpick', name: 'Dietriche', price: 50, icon: '🗝️', description: 'Öffnet verschlossene Türen' },
            { id: 'forbidden_scroll', name: 'Verbotene Schriftrolle', price: 1000, icon: '📜', description: 'Jutsu von zweifelhafter Herkunft' },
            { id: 'smoke_bomb', name: 'Rauchbomben (3x)', price: 75, icon: '💨', description: 'Für schnelle Fluchten' }
        ];
    }
};

// Global verfügbar machen
window.MerchantDialogSystem = MerchantDialogSystem;