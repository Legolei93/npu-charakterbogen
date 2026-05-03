/**
 * Quest Pool System v1.0
 * 
 * Zentrales, kontrolliertes Quest-Pool-System
 * - Deterministische Quest-Auswahl
 * - Duplikat-Vermeidung
 * - Gewichtung (Seltenheit)
 * - Kategorien
 */

var QuestPool = {
    
    categories: {
        story: [],
        exploration: [],
        combat: [],
        moral: [],
        training: [],
        merchant: [],
        investigation: [],
        daily: [],
        blackmarket: [],
        elite: []
    },
    
    /**
     * Gibt den Pool einer Kategorie zurück
     * @param {string} category
     * @returns {Array}
     */
    getPool: function(category) {
        return this.categories[category] || [];
    },
    
    /**
     * Registriert ein Quest-Template im Pool
     * @param {string} category
     * @param {Object} template
     */
    register: function(category, template) {
        if (!this.categories[category]) {
            this.categories[category] = [];
        }
        // Duplikat-Check
        if (!this.categories[category].some(function(t) { return t.id === template.id; })) {
            this.categories[category].push(template);
        }
    },
    
    /**
     * Registriert mehrere Templates aus einem Objekt
     * @param {Object} registry - { category: [templates] }
     */
    registerAll: function(registry) {
        for (var category in registry) {
            if (!Array.isArray(registry[category])) continue;
            for (var i = 0; i < registry[category].length; i++) {
                this.register(category, registry[category][i]);
            }
        }
    },
    
    /**
     * Gibt Statistiken über den Pool zurück
     * @returns {Object}
     */
    getStats: function() {
        var stats = {};
        var total = 0;
        for (var cat in this.categories) {
            stats[cat] = this.categories[cat].length;
            total += this.categories[cat].length;
        }
        stats._total = total;
        return stats;
    }
};

window.QuestPool = QuestPool;
console.log('[QuestPool] System initialisiert');
