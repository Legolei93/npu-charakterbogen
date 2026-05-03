/**
 * Inventory Overlay - Ausrüstung und Rucksack
 * Zeigt ausgerüstete Items und Inventar an
 */

const InventoryOverlay = {
    characterId: null,
    inventory: null,
    slots: null,
    
    /**
     * Initialisiert das Overlay
     */
    async init(characterId) {
        this.characterId = characterId;
        await this.loadData();
        this.render();
    },
    
    /**
     * Lädt Inventar-Daten
     */
    async loadData() {
        try {
            const response = await fetch(
                `http://localhost:3001/api/inventory/${this.characterId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to load inventory');
            
            const data = await response.json();
            this.inventory = data;
            this.slots = data.slots;
            
        } catch (error) {
            console.error('Load inventory error:', error);
        }
    },
    
    /**
     * Rendert das Overlay
     */
    render() {
        const container = document.getElementById('inventoryOverlay');
        if (!container) {
            this.createOverlay();
            return this.render();
        }
        
        container.innerHTML = `
            <div class="inventory-overlay-content">
                <div class="inventory-header">
                    <h2>🎒 Inventar</h2>
                    <div class="inventory-gold">💰 ${this.inventory.gold || 0} Gold</div>
                    <button class="btn-close" onclick="InventoryOverlay.close()">×</button>
                </div>
                
                <div class="inventory-body">
                    <!-- Ausrüstung -->
                    <div class="equipment-section">
                        <h3>⚔️ Ausrüstung</h3>
                        <div class="equipment-slots">
                            ${this.renderEquipmentSlots()}
                        </div>
                    </div>
                    
                    <!-- Rucksack -->
                    <div class="backpack-section">
                        <h3>📦 Rucksack</h3>
                        <div class="backpack-grid">
                            ${this.renderBackpack()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Item Context Menu -->
            <div id="itemContextMenu" class="context-menu hidden"></div>
        `;
        
        container.classList.remove('hidden');
    },
    
    /**
     * Erstellt das Overlay
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'inventoryOverlay';
        overlay.className = 'overlay hidden inventory-overlay';
        document.body.appendChild(overlay);
    },
    
    /**
     * Rendert die Ausrüstungs-Slots
     */
    renderEquipmentSlots() {
        return this.slots.map(slot => {
            const equipped = this.inventory.equipped.find(e => e.equipped_slot === slot.id);
            
            return `
                <div class="equipment-slot ${slot.id} ${equipped ? 'occupied' : 'empty'}"
                     title="${slot.name}: ${slot.description}"
                     onclick="${equipped ? `InventoryOverlay.unequipItem('${slot.id}')` : ''}">
                    <div class="slot-label">${slot.name}</div>
                    
                    ${equipped ? `
                        <div class="equipped-item">
                            <span class="item-icon">${this.getItemIcon(equipped.type)}</span>
                            <span class="item-name">${equipped.name}</span>
                            <button class="btn-unequip" onclick="event.stopPropagation(); InventoryOverlay.unequipItem('${slot.id}')">✕</button>
                        </div>
                    ` : `
                        <div class="slot-empty">Leer</div>
                    `}
                </div>
            `;
        }).join('');
    },
    
    /**
     * Rendert den Rucksack
     */
    renderBackpack() {
        if (!this.inventory.backpack || this.inventory.backpack.length === 0) {
            return '<p class="empty-backpack">Dein Rucksack ist leer.</p>';
        }
        
        return this.inventory.backpack.map(item => `
            <div class="backpack-item ${item.type}"
                 onclick="InventoryOverlay.showItemMenu(event, '${item.item_id}')">
                <div class="item-icon">${this.getItemIcon(item.type)}</div>
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">×${item.quantity}</span>
                </div>
                <div class="item-actions">
                    ${item.type === 'consumable' ? `
                        <button onclick="event.stopPropagation(); InventoryOverlay.useItem('${item.item_id}')">🍷 Nutzen</button>
                    ` : item.type !== 'misc' ? `
                        <button onclick="event.stopPropagation(); InventoryOverlay.showEquipMenu(event, '${item.item_id}')">⚔️ Ausrüsten</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },
    
    /**
     * Zeigt das Item-Kontextmenü
     */
    showItemMenu(event, itemId) {
        const item = this.inventory.backpack.find(i => i.item_id === itemId);
        if (!item) return;
        
        const menu = document.getElementById('itemContextMenu');
        
        menu.innerHTML = `
            <div class="context-header">
                <strong>${item.name}</strong>
                <span>${item.type} ×${item.quantity}</span>
            </div>
            
            ${item.description ? `<div class="context-desc">${item.description}</div>` : ''}
            
            <div class="context-actions">
                ${item.type === 'consumable' ? `
                    <button onclick="InventoryOverlay.useItem('${itemId}')">🍷 Verwenden</button>
                ` : ''}
                
                ${item.type !== 'misc' ? `
                    <button onclick="InventoryOverlay.showEquipMenu(event, '${itemId}')">⚔️ Ausrüsten...</button>
                ` : ''}
                
                <button onclick="InventoryOverlay.dropItem('${itemId}')">🗑️ Wegwerfen</button>
            </div>
        `;
        
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';
        menu.classList.remove('hidden');
        
        // Schließen bei Klick außerhalb
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.classList.add('hidden');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    },
    
    /**
     * Zeigt das Ausrüsten-Menü
     */
    showEquipMenu(event, itemId) {
        const item = this.inventory.backpack.find(i => i.item_id === itemId);
        if (!item) return;
        
        const allowedSlots = this.slots.filter(slot => {
            const allowedTypes = JSON.parse(slot.allowed_item_types);
            return allowedTypes.includes(item.type) || 
                   (item.slot && slot.id === item.slot);
        });
        
        if (allowedSlots.length === 0) {
            alert('Dieses Item kann nicht ausgerüstet werden.');
            return;
        }
        
        const menu = document.getElementById('itemContextMenu');
        
        menu.innerHTML = `
            <div class="context-header">
                <strong>${item.name} ausrüsten</strong>
            </div>
            <div class="context-actions">
                ${allowedSlots.map(slot => `
                    <button onclick="InventoryOverlay.equipItem('${itemId}', '${slot.id}')">${slot.name}</button>
                `).join('')}
            </div>
        `;
        
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';
        menu.classList.remove('hidden');
    },
    
    /**
     * Item ausrüsten
     */
    async equipItem(itemId, slot) {
        try {
            const response = await fetch(
                `http://localhost:3001/api/inventory/${this.characterId}/equip`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ item_id: itemId, slot })
                }
            );
            
            if (!response.ok) throw new Error('Equip failed');
            
            const result = await response.json();
            alert(result.message);
            
            // Neu laden
            await this.loadData();
            this.render();
            
        } catch (error) {
            console.error('Equip error:', error);
            alert('Fehler beim Ausrüsten: ' + error.message);
        }
    },
    
    /**
     * Item ablegen
     */
    async unequipItem(slot) {
        try {
            const response = await fetch(
                `http://localhost:3001/api/inventory/${this.characterId}/unequip`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ slot })
                }
            );
            
            if (!response.ok) throw new Error('Unequip failed');
            
            const result = await response.json();
            alert(result.message);
            
            // Neu laden
            await this.loadData();
            this.render();
            
        } catch (error) {
            console.error('Unequip error:', error);
            alert('Fehler beim Ablegen: ' + error.message);
        }
    },
    
    /**
     * Item verwenden
     */
    async useItem(itemId) {
        try {
            const response = await fetch(
                `http://localhost:3001/api/inventory/${this.characterId}/use`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ item_id: itemId })
                }
            );
            
            if (!response.ok) throw new Error('Use item failed');
            
            const result = await response.json();
            alert(`${result.message}\n${result.effects.join('\n')}`);
            
            // Neu laden
            await this.loadData();
            this.render();
            
        } catch (error) {
            console.error('Use item error:', error);
            alert('Fehler beim Verwenden: ' + error.message);
        }
    },
    
    /**
     * Item wegwerfen
     */
    async dropItem(itemId) {
        if (!confirm('Bist du sicher, dass du dieses Item wegwerfen möchtest?')) {
            return;
        }
        
        try {
            const response = await fetch(
                `http://localhost:3001/api/inventory/${this.characterId}/${itemId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Drop item failed');
            
            // Neu laden
            await this.loadData();
            this.render();
            
        } catch (error) {
            console.error('Drop item error:', error);
            alert('Fehler beim Wegwerfen: ' + error.message);
        }
    },
    
    /**
     * Overlay schließen
     */
    close() {
        const overlay = document.getElementById('inventoryOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        document.getElementById('itemContextMenu')?.classList.add('hidden');
    },
    
    /**
     * Item-Icon
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
    }
};

// Global verfügbar machen
window.InventoryOverlay = InventoryOverlay;

console.log('inventory-overlay.js geladen');
