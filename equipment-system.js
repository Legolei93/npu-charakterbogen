/**
 * Erweitertes Auesruestungssystem
 * Verwaltet alle Auesruestungsslots und Item-Beschraenkungen
 */

const EquipmentSystem = {
    // Erweiterte Slot-Definitionen
    slots: {
        // Hauptwaffen (2 Slots)
        mainHand1: { name: 'Hauptwaffe 1', category: 'weapon', icon: '[Waffe]' },
        mainHand2: { name: 'Hauptwaffe 2', category: 'weapon', icon: '[Waffe]' },
        
        // Ruestung
        head: { name: 'Kopf', category: 'armor', icon: '[Helm]' },
        chest: { name: 'Brust', category: 'armor', icon: '[Ruestung]' },
        arms: { name: 'Arme', category: 'armor', icon: '[Arme]' },
        hands: { name: 'Haende', category: 'armor', icon: '[Haende]' },
        legs: { name: 'Hose', category: 'armor', icon: '[Hose]' },
        feet: { name: 'Schuhe', category: 'armor', icon: '[Schuhe]' },
        jacket: { name: 'Jacke/Umhang', category: 'armor', icon: '[Jacke]' },
        
        // Accessoires
        belt: { name: 'Guertel', category: 'accessory', icon: '[Guertel]' },
        necklace: { name: 'Halskette', category: 'accessory', icon: '[Kette]' },
        earrings: { name: 'Ohrringe', category: 'accessory', icon: '[Ringe]' },
        ring1: { name: 'Ring 1', category: 'accessory', icon: '[Ring]' },
        ring2: { name: 'Ring 2', category: 'accessory', icon: '[Ring]' },
        ring3: { name: 'Ring 3', category: 'accessory', icon: '[Ring]' },
        ring4: { name: 'Ring 4', category: 'accessory', icon: '[Ring]' },
        ring5: { name: 'Ring 5', category: 'accessory', icon: '[Ring]' },
        
        // Rucksack (nicht sichtbar, aber tragbar)
        backpack: { name: 'Rucksack', category: 'container', icon: '[Rucksack]' }
    },
    
    // Inventar (Rucksack-Inhalt)
    inventory: [],
    
    // Verfuegbare Items (gekauft oder erhalten)
    availableItems: [],
    
    /**
     * Initialisiert das System
     */
    init() {
        this.loadInventory();
        this.loadAvailableItems();
        this.initializeStartingEquipment();
        console.log('EquipmentSystem initialisiert');
    },
    
    /**
     * Laedt das Inventar
     */
    loadInventory() {
        const saved = localStateManager.getItem('player_inventory');
        this.inventory = saved ? JSON.parse(saved) : [];
    },
    
    /**
     * Speichert das Inventar
     */
    saveInventory() {
        localStateManager.setItem('player_inventory', JSON.stringify(this.inventory));
    },
    
    /**
     * Laedt verfuegbare Items (gekauft/erhalten)
     */
    loadAvailableItems() {
        const saved = localStateManager.getItem('available_equipment');
        this.availableItems = saved ? JSON.parse(saved) : [];
    },
    
    /**
     * Speichert verfuegbare Items
     */
    saveAvailableItems() {
        localStateManager.setItem('available_equipment', JSON.stringify(this.availableItems));
    },
    
    /**
     * Fuegt ein Item zum verfuegbaren Equipment hinzu (nach Kauf/Erhalt)
     */
    addAvailableItem(item) {
        // Pruefe ob Item bereits vorhanden
        const exists = this.availableItems.some(i => i.id === item.id);
        if (!exists) {
            this.availableItems.push({
                ...item,
                acquiredDate: new Date().toISOString(),
                source: item.source || 'unknown' // 'merchant', 'dm', 'quest', 'start'
            });
            this.saveAvailableItems();
            
            // LOGGING
            if (typeof GameLog !== 'undefined') {
                GameLog.character('item_acquired', {
                    itemId: item.id,
                    itemName: item.name,
                    source: item.source
                });
            }
        }
    },
    
    /**
     * Entfernt ein verfuegbares Item (z.B. verkauft/verloren)
     */
    removeAvailableItem(itemId) {
        this.availableItems = this.availableItems.filter(i => i.id !== itemId);
        this.saveAvailableItems();
    },
    
    /**
     * Initialisiert die Startauesruestung
     */
    initializeStartingEquipment() {
        // Pruefe ob bereits initialisiert
        if (this.availableItems.length > 0) return;
        
        // Startauesruestung definieren
        const startingItems = [
            {
                id: 'leather_armor',
                name: 'Leder-Ruestung',
                type: 'armor',
                slot: 'chest',
                stats: { rk: 2 },
                description: 'Einfache Leder-Ruestung fuer Anfaenger',
                source: 'start'
            },
            {
                id: 'kunai',
                name: 'Kunai',
                type: 'weapon',
                slot: 'mainHand1',
                stats: { damage: '1W4', angriff: 1 },
                description: 'Standard-Kunai fuer Ninja',
                source: 'start',
                quantity: 5
            },
            {
                id: 'shuriken',
                name: 'Shuriken',
                type: 'weapon',
                slot: 'mainHand2',
                stats: { damage: '1W3', range: '10m' },
                description: 'Wurfsterne fuer Fernangriffe',
                source: 'start',
                quantity: 10
            },
            {
                id: 'healing_potion_small',
                name: 'Kleiner Heiltrank',
                type: 'consumable',
                slot: 'backpack',
                stats: { healing: '1W8+2' },
                description: 'Stellt 1W8+2 HP wieder her',
                source: 'start',
                quantity: 3
            },
            {
                id: 'explosive_tag',
                name: 'Explosionszettel',
                type: 'consumable',
                slot: 'backpack',
                stats: { damage: '2W6', area: '3m' },
                description: 'Explodiert nach Aktivierung',
                source: 'start',
                quantity: 2
            },
            {
                id: 'smoke_bomb',
                name: 'Rauchbombe',
                type: 'consumable',
                slot: 'backpack',
                stats: { effect: 'Verdeckt Sicht' },
                description: 'Erzeugt Rauchwolke zur Flucht',
                source: 'start',
                quantity: 3
            },
            {
                id: 'rope',
                name: 'Seil (10m)',
                type: 'tool',
                slot: 'backpack',
                description: 'Nuetzliches Seil fuer verschiedene Zwecke',
                source: 'start',
                quantity: 1
            },
            {
                id: 'rations',
                name: 'Rationen (3 Tage)',
                type: 'consumable',
                slot: 'backpack',
                description: 'Nahrung fuer unterwegs',
                source: 'start',
                quantity: 1
            },
            {
                id: 'bedroll',
                name: 'Schlafsack',
                type: 'tool',
                slot: 'backpack',
                description: 'Zum Schlafen im Freien',
                source: 'start',
                quantity: 1
            },
            {
                id: 'flint_steel',
                name: 'Feuerstein & Stahl',
                type: 'tool',
                slot: 'backpack',
                description: 'Zum Feuermachen',
                source: 'start',
                quantity: 1
            }
        ];
        
        // Fuege Startauesruestung zu verfuegbaren Items hinzu
        startingItems.forEach(item => {
            this.addAvailableItem(item);
        });
        
        // Auesrueesten der Startauesruestung
        if (currentCharacter) {
            if (!currentCharacter.equipment) currentCharacter.equipment = {};
            
            // Ruestung auesrueesten
            currentCharacter.equipment.chest = startingItems.find(i => i.id === 'leather_armor');
            
            // Waffen auesrueesten
            currentCharacter.equipment.mainHand1 = startingItems.find(i => i.id === 'kunai');
            currentCharacter.equipment.mainHand2 = startingItems.find(i => i.id === 'shuriken');
            
            // Rest in Inventar
            startingItems.filter(i => 
                !['leather_armor', 'kunai', 'shuriken'].includes(i.id)
            ).forEach(item => {
                this.addToInventory(item);
            });
        }
    },
    
    /**
     * Fuegt Item zum Inventar (Rucksack) hinzu
     */
    addToInventory(item) {
        const existing = this.inventory.find(i => i.id === item.id);
        if (existing && item.quantity) {
            existing.quantity += item.quantity;
        } else {
            this.inventory.push({ ...item });
        }
        this.saveInventory();
    },
    
    /**
     * Entfernt Item aus Inventar
     */
    removeFromInventory(itemId, quantity = 1) {
        const item = this.inventory.find(i => i.id === itemId);
        if (item) {
            if (item.quantity && item.quantity > quantity) {
                item.quantity -= quantity;
            } else {
                this.inventory = this.inventory.filter(i => i.id !== itemId);
            }
            this.saveInventory();
        }
    },
    
    /**
     * Holt Items fuer einen bestimmten Slot (nur verfuegbare)
     */
    getItemsForSlot(slotId) {
        const slot = this.slots[slotId];
        if (!slot) return [];
        
        // Filtere nur verfuegbare Items fuer diesen Slot
        return this.availableItems.filter(item => {
            // Pruefe ob Item fuer diesen Slot geeignet ist
            if (item.slot === slotId) return true;
            if (slot.category === 'weapon' && item.type === 'weapon') return true;
            if (slot.category === 'armor' && item.type === 'armor') return true;
            if (slot.category === 'accessory' && item.type === 'accessory') return true;
            return false;
        });
    },
    
    /**
     * Prueft ob ein Item auesgerueestet werden darf
     */
    canEquipItem(item) {
        // Pruefe ob Item in verfuegbaren Items ist
        return this.availableItems.some(i => i.id === item.id);
    },
    
    /**
     * Berechnet Gesamtboni aller auesgerueesteten Items
     */
    calculateTotalBonuses() {
        if (!currentCharacter || !currentCharacter.equipment) return {};
        
        const bonuses = {};
        
        for (const slotId in currentCharacter.equipment) {
            const item = currentCharacter.equipment[slotId];
            if (item && item.stats) {
                for (const stat in item.stats) {
                    bonuses[stat] = (bonuses[stat] || 0) + item.stats[stat];
                }
            }
        }
        
        return bonuses;
    },
    
    /**
     * Rendert das Inventar
     */
    renderInventory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (this.inventory.length === 0) {
            container.innerHTML = '<p class="hint">Rucksack ist leer.</p>';
            return;
        }
        
        container.innerHTML = this.inventory.map(item => `
            <div class="inventory-item">
                <span class="item-icon">${this.getItemIcon(item)}</span>
                <span class="item-name">${item.name}</span>
                ${item.quantity > 1 ? `<span class="item-quantity">x${item.quantity}</span>` : ''}
                <button onclick="EquipmentSystem.useItem('${item.id}')" class="btn-use">Benutzen</button>
            </div>
        `).join('');
    },
    
    /**
     * Holt Icon fuer Item-Typ
     */
    getItemIcon(item) {
        const icons = {
            weapon: '[Waffe]',
            armor: '[Ruestung]',
            accessory: '[Ring]',
            consumable: '[Trank]',
            tool: '[Werkzeug]',
            container: '[Rucksack]'
        };
        return icons[item.type] || '[Item]';
    },
    
    /**
     * Benutzt ein Item aus dem Inventar
     */
    useItem(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        // TODO: Implementiere Item-Nutzung (Heiltrank, etc.)
        alert(`Benutze: ${item.name}`);
        
        // Bei Verbrauchsgegenstaenden Menge reduzieren
        if (item.type === 'consumable' && item.quantity) {
            this.removeFromInventory(itemId, 1);
            this.renderInventory('inventoryContainer');
        }
    }
};

// Initialisieren
document.addEventListener('DOMContentLoaded', () => {
    EquipmentSystem.init();
});
