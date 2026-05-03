/**
 * DM Panel - Haendler Verwaltung
 * Ermoeglicht dem DM Haendler zu erstellen, bearbeiten und zu verwalten
 */

const DMMerchantAdmin = {
    merchants: [],
    currentEditingMerchant: null,
    
    /**
     * Initialisiert das Haendler-Admin-Panel
     */
    init() {
        this.loadMerchants();
        this.renderMerchantList();
    },
    
    /**
     * Laedt alle Haendler
     */
    loadMerchants() {
        // Lade aus localStorage oder verwende Demo-Daten
        const saved = localStorage.getItem('dm_merchants');
        if (saved) {
            this.merchants = JSON.parse(saved);
        } else {
            // Demo-Haendler als Basis
            this.merchants = this.getDemoMerchants();
            this.saveMerchants();
        }
    },
    
    /**
     * Speichert alle Haendler
     */
    saveMerchants() {
        localStorage.setItem('dm_merchants', JSON.stringify(this.merchants));
    },
    
    /**
     * Demo-Haendler als Ausgangsbasis
     */
    getDemoMerchants() {
        return [
            {
                id: 'taro',
                name: 'Taro',
                type: 'weapon',
                location: 'Hauptstrasse',
                personality: 'neutral',
                description: 'Waffenhaendler - direkt, rau, pragmatisch',
                allows_haggle: true,
                haggle_difficulty: 12,
                emotion_images: {
                    greeting: 'images/merchants/taro-neutral.png',
                    happy: 'images/merchants/taro-happy.png',
                    angry: 'images/merchants/taro-angry.png',
                    surprised: 'images/merchants/taro-surprised.png',
                    skeptical: 'images/merchants/taro-skeptical.png',
                    confused: 'images/merchants/taro-confused.png'
                },
                dialogs: {
                    greeting: ['Willkommen in meiner Schmiede!'],
                    buy: ['Gute Wahl!'],
                    sell: ['Das koennte ich gebrauchen.'],
                    haggle: ['Das ist mein letztes Angebot!']
                },
                inventory: [],
                is_active: true,
                appearance_chance: 100,
                special_traits: []
            },
            {
                id: 'yuki',
                name: 'Yuki',
                type: 'armor',
                location: 'Marktplatz',
                personality: 'friendly',
                description: 'Ruestungsschmiedin - stolz, kritisch, respektiert Staerke',
                allows_haggle: true,
                haggle_difficulty: 10,
                emotion_images: {
                    greeting: 'images/merchants/yuki-neutral.png',
                    happy: 'images/merchants/yuki-happy.png',
                    angry: 'images/merchants/yuki-angry.png',
                    surprised: 'images/merchants/yuki-surprised.png',
                    skeptical: 'images/merchants/yuki-skeptical.png',
                    confused: 'images/merchants/yuki-confused.png'
                },
                dialogs: {
                    greeting: ['Willkommen! Was kann ich fuer dich tun?'],
                    buy: ['Ausgezeichnete Wahl!'],
                    sell: ['Das nehme ich gerne.'],
                    haggle: ['Fuer dich mache ich einen Sonderpreis!']
                },
                inventory: [],
                is_active: true,
                appearance_chance: 100,
                special_traits: []
            },
            {
                id: 'shin',
                name: 'Shin',
                type: 'general',
                location: 'Hafen',
                personality: 'greedy',
                description: 'Allzweckhaendler - freundlich, aufmerksam, vorsichtig',
                allows_haggle: true,
                haggle_difficulty: 14,
                emotion_images: {
                    greeting: 'images/merchants/shin-neutral.png',
                    happy: 'images/merchants/shin-happy.png',
                    angry: 'images/merchants/shin-angry.png',
                    surprised: 'images/merchants/shin-surprised.png',
                    skeptical: 'images/merchants/shin-skeptical.png',
                    confused: 'images/merchants/shin-confused.png'
                },
                dialogs: {
                    greeting: ['Willkommen! Meine besten Waren fuer dich!'],
                    buy: ['Ein wahrer Schatz!'],
                    sell: ['Das koennte ich weiterverkaufen.'],
                    haggle: ['Der Preis ist schon guenstig...']
                },
                inventory: [],
                is_active: true,
                appearance_chance: 100,
                special_traits: []
            },
            {
                id: 'kira',
                name: 'Kira',
                type: 'black_market',
                location: 'Versteckte Gasse',
                personality: 'grumpy',
                description: 'Schwarzhaendlerin - misstrauisch, manipulativ, gefaehrlich',
                allows_haggle: true,
                haggle_difficulty: 16,
                emotion_images: {
                    greeting: 'images/merchants/kira-neutral.png',
                    happy: 'images/merchants/kira-happy.png',
                    angry: 'images/merchants/kira-angry.png',
                    surprised: 'images/merchants/kira-surprised.png',
                    skeptical: 'images/merchants/kira-skeptical.png',
                    confused: 'images/merchants/kira-confused.png'
                },
                dialogs: {
                    greeting: ['Wer bist du? Was willst du?'],
                    buy: ['Nimm es und stell keine Fragen.'],
                    sell: ['Das nehme ich. Aber schweige darueber.'],
                    haggle: ['Der Preis steht fest. Zahl oder geh.']
                },
                inventory: [],
                is_active: false,
                appearance_chance: 30,
                special_traits: ['random_appearance', 'rare_items', 'illegal_goods']
            }
        ];
    },
    
    /**
     * Rendert die Haendler-Liste im DM-Panel
     */
    renderMerchantList() {
        const container = document.getElementById('dmMerchantList');
        if (!container) return;
        
        container.innerHTML = this.merchants.map(m => `
            <div class="dm-merchant-card ${m.is_active ? 'active' : 'inactive'}">
                <div class="merchant-header">
                    <img src="${m.emotion_images?.greeting || 'images/merchants/default.png'}" 
                         alt="${m.name}" 
                         class="merchant-thumb"
                         onerror="this.src='images/merchants/default.png'">
                    <div class="merchant-info">
                        <h4>${m.name}</h4>
                        <span class="merchant-type">${this.getTypeLabel(m.type)}</span>
                        <span class="merchant-location">[Ort] ${m.location}</span>
                        <span class="merchant-personality">${this.getPersonalityLabel(m.personality)}</span>
                    </div>
                    <div class="merchant-status">
                        <span class="status-badge ${m.is_active ? 'active' : 'inactive'}">
                            ${m.is_active ? '[Aktiv]' : '[Inaktiv]'}
                        </span>
                        ${m.appearance_chance < 100 ? `
                            <span class="chance-badge">${m.appearance_chance}% Spawn</span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="merchant-actions">
                    <button onclick="DMMerchantAdmin.editMerchant('${m.id}')">Bearbeiten</button>
                    <button onclick="DMMerchantAdmin.toggleMerchant('${m.id}')">
                        ${m.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    <button onclick="DMMerchantAdmin.editInventory('${m.id}')">Inventar</button>
                    <button onclick="DMMerchantAdmin.showRPGControlPanel('${m.id}')" class="btn-rpg">
                        🎭 RPG
                    </button>
                    <button onclick="DMMerchantAdmin.deleteMerchant('${m.id}')" class="danger">Loeschen</button>
                </div>
            </div>
        `).join('');
    },
    
    /**
     * Oeffnet den Editor fuer einen Haendler
     */
    editMerchant(merchantId) {
        const merchant = this.merchants.find(m => m.id === merchantId);
        if (!merchant) return;
        
        this.currentEditingMerchant = merchant;
        
        const modal = document.getElementById('dmMerchantModal');
        if (!modal) {
            this.createMerchantModal();
            return this.editMerchant(merchantId);
        }
        
        // Fuelle Formular
        document.getElementById('merchantId').value = merchant.id;
        document.getElementById('merchantName').value = merchant.name;
        document.getElementById('merchantType').value = merchant.type;
        document.getElementById('merchantLocation').value = merchant.location;
        document.getElementById('merchantPersonality').value = merchant.personality;
        document.getElementById('merchantDescription').value = merchant.description || '';
        document.getElementById('merchantHaggleDifficulty').value = merchant.haggle_difficulty || 12;
        document.getElementById('merchantAllowsHaggle').checked = merchant.allows_haggle !== false;
        document.getElementById('merchantAppearanceChance').value = merchant.appearance_chance || 100;
        document.getElementById('merchantIsActive').checked = merchant.is_active !== false;
        
        // Dialog-Texte
        document.getElementById('dialogGreeting').value = (merchant.dialogs?.greeting || []).join('\n');
        document.getElementById('dialogBuy').value = (merchant.dialogs?.buy || []).join('\n');
        document.getElementById('dialogSell').value = (merchant.dialogs?.sell || []).join('\n');
        document.getElementById('dialogHaggle').value = (merchant.dialogs?.haggle || []).join('\n');
        
        modal.classList.remove('hidden');
    },
    
    /**
     * Speichert den bearbeiteten Haendler
     */
    saveMerchant() {
        if (!this.currentEditingMerchant) return;
        
        const merchant = this.currentEditingMerchant;
        
        // Aktualisiere Daten
        merchant.name = document.getElementById('merchantName').value;
        merchant.type = document.getElementById('merchantType').value;
        merchant.location = document.getElementById('merchantLocation').value;
        merchant.personality = document.getElementById('merchantPersonality').value;
        merchant.description = document.getElementById('merchantDescription').value;
        merchant.haggle_difficulty = parseInt(document.getElementById('merchantHaggleDifficulty').value);
        merchant.allows_haggle = document.getElementById('merchantAllowsHaggle').checked;
        merchant.appearance_chance = parseInt(document.getElementById('merchantAppearanceChance').value);
        merchant.is_active = document.getElementById('merchantIsActive').checked;
        
        // Dialoge
        merchant.dialogs = {
            greeting: document.getElementById('dialogGreeting').value.split('\n').filter(l => l.trim()),
            buy: document.getElementById('dialogBuy').value.split('\n').filter(l => l.trim()),
            sell: document.getElementById('dialogSell').value.split('\n').filter(l => l.trim()),
            haggle: document.getElementById('dialogHaggle').value.split('\n').filter(l => l.trim())
        };
        
        this.saveMerchants();
        this.renderMerchantList();
        this.closeModal();
        
        // LOGGING
        if (typeof GameLog !== 'undefined') {
            GameLog.dm('merchant_updated', {
                merchantId: merchant.id,
                merchantName: merchant.name
            });
        }
        
        alert('Haendler gespeichert!');
    },
    
    /**
     * Erstellt das Haendler-Modal
     */
    createMerchantModal() {
        const modal = document.createElement('div');
        modal.id = 'dmMerchantModal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Haendler bearbeiten</h2>
                    <button onclick="DMMerchantAdmin.closeModal()" class="btn-close">x</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="merchantId">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="merchantName" required>
                        </div>
                        <div class="form-group">
                            <label>Typ</label>
                            <select id="merchantType">
                                <option value="weapon">Waffen</option>
                                <option value="armor">Ruestung</option>
                                <option value="general">Allgemein</option>
                                <option value="black_market">Schwarzmarkt</option>
                                <option value="magic">Magie</option>
                                <option value="potion">Traenke</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Ort</label>
                            <input type="text" id="merchantLocation">
                        </div>
                        <div class="form-group">
                            <label>Persoenlichkeit</label>
                            <select id="merchantPersonality">
                                <option value="friendly">Freundlich</option>
                                <option value="neutral">Neutral</option>
                                <option value="greedy">Geizig</option>
                                <option value="grumpy">Muerrisch</option>
                                <option value="suspicious">Misstrauisch</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Beschreibung</label>
                        <textarea id="merchantDescription" rows="2"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Feilsch-Schwierigkeit (5-20)</label>
                            <input type="number" id="merchantHaggleDifficulty" 
                                   min="5" max="20" value="12">
                        </div>
                        <div class="form-group">
                            <label>Spawn-Chance (%)</label>
                            <input type="number" id="merchantAppearanceChance" 
                                   min="1" max="100" value="100">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="merchantAllowsHaggle" checked>
                            Feilschen erlaubt
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="merchantIsActive" checked>
                            Aktiv
                        </label>
                    </div>
                    
                    <h3>Dialoge (eine Zeile pro Text)</h3>
                    
                    <div class="form-group">
                        <label>Begruessung</label>
                        <textarea id="dialogGreeting" rows="3" placeholder="Eine Zeile pro Dialog..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Kauf</label>
                        <textarea id="dialogBuy" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Verkauf</label>
                        <textarea id="dialogSell" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Feilschen</label>
                        <textarea id="dialogHaggle" rows="3"></textarea>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button onclick="DMMerchantAdmin.saveMerchant()" class="btn-primary">Speichern</button>
                    <button onclick="DMMerchantAdmin.closeModal()">Abbrechen</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    /**
     * Schliesst das Modal
     */
    closeModal() {
        const modal = document.getElementById('dmMerchantModal');
        if (modal) modal.classList.add('hidden');
        this.currentEditingMerchant = null;
    },
    
    /**
     * Hilfsmethoden
     */
    getTypeLabel(type) {
        const labels = {
            weapon: '[Waffe] Waffen',
            armor: '[Ruestung] Ruestung',
            general: '[Box] Allgemein',
            black_market: '[Mond] Schwarzmarkt',
            magic: '[Stern] Magie',
            potion: '[Trank] Traenke'
        };
        return labels[type] || type;
    },
    
    getPersonalityLabel(personality) {
        const labels = {
            friendly: '[Smile] Freundlich',
            neutral: '[Neutral] Neutral',
            greedy: '[Gold] Geizig',
            grumpy: '[Wut] Muerrisch',
            suspicious: '[Argwohn] Misstrauisch'
        };
        return labels[personality] || personality;
    },
    
    /**
     * Weitere Aktionen
     */
    toggleMerchant(merchantId) {
        const merchant = this.merchants.find(m => m.id === merchantId);
        if (merchant) {
            merchant.is_active = !merchant.is_active;
            this.saveMerchants();
            this.renderMerchantList();
            
            if (typeof GameLog !== 'undefined') {
                GameLog.dm('merchant_toggled', {
                    merchantId: merchant.id,
                    merchantName: merchant.name,
                    isActive: merchant.is_active
                });
            }
        }
    },
    
    deleteMerchant(merchantId) {
        if (!confirm('Haendler wirklich loeschen?')) return;
        
        this.merchants = this.merchants.filter(m => m.id !== merchantId);
        this.saveMerchants();
        this.renderMerchantList();
        
        if (typeof GameLog !== 'undefined') {
            GameLog.dm('merchant_deleted', { merchantId });
        }
    },
    
    editInventory(merchantId) {
        // TODO: Inventar-Verwaltung
        alert('Inventar-Verwaltung wird implementiert...');
    },
    
    /**
     * Zeigt das RPG-Händler-Kontroll-Panel
     */
    showRPGControlPanel(merchantId) {
        const merchant = this.merchants.find(m => m.id === merchantId);
        if (!merchant) return;
        
        // Lade aktuelle Werte aus dem Dialog-System
        const relationship = localStorage.getItem(`merchant_${merchantId}_relationship`) || 0;
        const trust = localStorage.getItem(`merchant_${merchantId}_trust`) || 50;
        
        const modal = document.createElement('div');
        modal.id = 'rpgControlModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>🎭 ${merchant.name} - RPG Kontrolle</h2>
                    <button class="btn-close" onclick="DMMerchantAdmin.closeRPGControlPanel()">×</button>
                </div>
                
                <div class="rpg-controls" style="padding: 20px;">
                    <!-- Stimmung -->
                    <div class="control-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                            😊 Aktuelle Stimmung
                        </label>
                        <select id="rpgMoodSelect" class="form-control" style="width: 100%; padding: 8px;">
                            <option value="happy" ${merchant.mood === 'happy' ? 'selected' : ''}>😊 Fröhlich</option>
                            <option value="friendly" ${merchant.mood === 'friendly' ? 'selected' : ''}>🙂 Freundlich</option>
                            <option value="neutral" ${merchant.mood === 'neutral' ? 'selected' : ''}>😐 Neutral</option>
                            <option value="thinking" ${merchant.mood === 'thinking' ? 'selected' : ''}>🤔 Nachdenklich</option>
                            <option value="annoyed" ${merchant.mood === 'annoyed' ? 'selected' : ''}>😤 Genervt</option>
                            <option value="angry" ${merchant.mood === 'angry' ? 'selected' : ''}>😡 Wütend</option>
                            <option value="suspicious" ${merchant.mood === 'suspicious' ? 'selected' : ''}>🤨 Misstrauisch</option>
                        </select>
                    </div>
                    
                    <!-- Beziehung -->
                    <div class="control-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                            🤝 Beziehung zum Spieler: <span id="relationshipValue">${relationship}</span>
                        </label>
                        <input type="range" id="rpgRelationship" min="-100" max="100" value="${relationship}"
                               style="width: 100%;" oninput="document.getElementById('relationshipValue').textContent = this.value">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                            <span>💀 Erbittert (-100)</span>
                            <span>❤️ Vertraut (+100)</span>
                        </div>
                    </div>
                    
                    <!-- Vertrauen -->
                    <div class="control-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                            🔐 Vertrauen: <span id="trustValue">${trust}</span>%
                        </label>
                        <input type="range" id="rpgTrust" min="0" max="100" value="${trust}"
                               style="width: 100%;" oninput="document.getElementById('trustValue').textContent = this.value">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                            <span>0% (Misstrauisch)</span>
                            <span>100% (Vollstes Vertrauen)</span>
                        </div>
                    </div>
                    
                    <!-- Tageslaune -->
                    <div class="control-group" style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="rpgRandomMood" ${merchant.randomMood ? 'checked' : ''}>
                            <span>Zufällige Tageslaune aktivieren</span>
                        </label>
                        <p style="font-size: 12px; color: #666; margin-top: 5px;">
                            Wenn aktiviert, ändert sich die Stimmung täglich zufällig.
                        </p>
                    </div>
                    
                    <!-- Spezielle Aktionen -->
                    <div class="control-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                            ⚡ Spezielle Aktionen
                        </label>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button onclick="DMMerchantAdmin.resetRelationship('${merchantId}')" 
                                    class="btn-secondary" style="font-size: 12px;">
                                Beziehung zurücksetzen
                            </button>
                            <button onclick="DMMerchantAdmin.makeBestFriends('${merchantId}')" 
                                    class="btn-secondary" style="font-size: 12px;">
                                Befreunden
                            </button>
                            <button onclick="DMMerchantAdmin.makeEnemy('${merchantId}')" 
                                    class="btn-secondary" style="font-size: 12px;">
                                Zum Feind machen
                            </button>
                            <button onclick="DMMerchantAdmin.resetDailyInteractions('${merchantId}')" 
                                    class="btn-secondary" style="font-size: 12px;">
                                Tägliche Interaktionen zurücksetzen
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 15px; border-top: 1px solid #ddd; text-align: right;">
                    <button onclick="DMMerchantAdmin.saveRPGSettings('${merchantId}')" class="btn-primary">
                        💾 Speichern
                    </button>
                    <button onclick="DMMerchantAdmin.closeRPGControlPanel()" class="btn-secondary">
                        Abbrechen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Schließen bei Klick außerhalb
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeRPGControlPanel();
            }
        });
    },
    
    /**
     * Schließt das RPG-Kontroll-Panel
     */
    closeRPGControlPanel() {
        const modal = document.getElementById('rpgControlModal');
        if (modal) {
            modal.remove();
        }
    },
    
    /**
     * Speichert RPG-Einstellungen
     */
    saveRPGSettings(merchantId) {
        const mood = document.getElementById('rpgMoodSelect').value;
        const relationship = parseInt(document.getElementById('rpgRelationship').value);
        const trust = parseInt(document.getElementById('rpgTrust').value);
        const randomMood = document.getElementById('rpgRandomMood').checked;
        
        // Speichere im localStorage (für Dialog-System)
        localStorage.setItem(`merchant_${merchantId}_relationship`, relationship);
        localStorage.setItem(`merchant_${merchantId}_trust`, trust);
        localStorage.setItem(`merchant_${merchantId}_mood`, mood);
        localStorage.setItem(`merchant_${merchantId}_randomMood`, randomMood);
        
        // Aktualisiere Merchant-Daten
        const merchant = this.merchants.find(m => m.id === merchantId);
        if (merchant) {
            merchant.mood = mood;
            merchant.randomMood = randomMood;
            this.saveMerchants();
        }
        
        // Logge Änderung
        if (typeof GameLog !== 'undefined') {
            GameLog.dm('merchant_rpg_updated', { 
                merchantId, 
                mood, 
                relationship, 
                trust 
            });
        }
        
        this.closeRPGControlPanel();
        this.renderMerchantList();
        
        // Zeige Bestätigung
        if (typeof showNotification !== 'undefined') {
            showNotification('RPG-Einstellungen gespeichert', 'success');
        }
    },
    
    /**
     * Setzt die Beziehung zurück
     */
    resetRelationship(merchantId) {
        document.getElementById('rpgRelationship').value = 0;
        document.getElementById('relationshipValue').textContent = '0';
    },
    
    /**
     * Macht den Händler zum besten Freund
     */
    makeBestFriends(merchantId) {
        document.getElementById('rpgRelationship').value = 100;
        document.getElementById('relationshipValue').textContent = '100';
        document.getElementById('rpgTrust').value = 100;
        document.getElementById('trustValue').textContent = '100';
        document.getElementById('rpgMoodSelect').value = 'happy';
    },
    
    /**
     * Macht den Händler zum Feind
     */
    makeEnemy(merchantId) {
        document.getElementById('rpgRelationship').value = -100;
        document.getElementById('relationshipValue').textContent = '-100';
        document.getElementById('rpgTrust').value = 0;
        document.getElementById('trustValue').textContent = '0';
        document.getElementById('rpgMoodSelect').value = 'angry';
    },
    
    /**
     * Setzt tägliche Interaktionen zurück
     */
    resetDailyInteractions(merchantId) {
        localStorage.removeItem(`merchant_${merchantId}_lastsmalltalk`);
        
        if (typeof showNotification !== 'undefined') {
            showNotification('Tägliche Interaktionen zurückgesetzt', 'success');
        }
    }
};

// Initialisieren wenn DM-Panel geladen wird
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dmMerchantList')) {
        DMMerchantAdmin.init();
    }
});
