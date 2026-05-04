
// MONEY SYSTEM FIX
const MoneySystem = {
    normalizeMoney(copper) {
        const copperInt = parseInt(copper) || 0;
        const silver = Math.floor(copperInt / 100);
        const restCopper = copperInt % 100;
        
        return {
            gold: Math.floor(silver / 100),
            silver: silver % 100,
            copper: restCopper
        };
    },
    
    toCopper(gold, silver, copper) {
        return (parseInt(gold) || 0) * 10000 + 
               (parseInt(silver) || 0) * 100 + 
               (parseInt(copper) || 0);
    },
    
    formatMoney(copper) {
        const m = this.normalizeMoney(copper);
        let parts = [];
        if (m.gold > 0) parts.push(m.gold + ' Gold');
        if (m.silver > 0) parts.push(m.silver + ' Silber');
        if (m.copper > 0 || parts.length === 0) parts.push(m.copper + ' Kupfer');
        return parts.join(', ');
    },
    
    addMoney(character, copperAmount) {
        if (!character) return null;
        
        const currentCopper = parseInt(character.money?.copper || character.copper || 0);
        const newCopper = currentCopper + (parseInt(copperAmount) || 0);
        
        const normalized = this.normalizeMoney(newCopper);
        character.money = normalized;
        character.copper = newCopper; // Für Kompatibilität
        
        return character;
    }
};

// Override globale Money Funktionen
window.normalizeMoney = MoneySystem.normalizeMoney.bind(MoneySystem);
window.formatMoney = MoneySystem.formatMoney.bind(MoneySystem);
window.addMoney = MoneySystem.addMoney.bind(MoneySystem);
