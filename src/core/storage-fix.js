
// GLOBAL STORAGE FIX
const STORAGE_KEY = "npu_characters";

const GlobalStorage = {
    saveCharacter(character) {
        const characters = this.loadAllCharacters();
        const index = characters.findIndex(c => c.id === character.id);
        
        if (index >= 0) {
            characters[index] = character;
        } else {
            characters.push(character);
        }
        
        localStateManager.setItem(STORAGE_KEY, JSON.stringify(characters));
        console.log('[STORAGE] Character gespeichert:', character.id);
        return true;
    },
    
    loadAllCharacters() {
        try {
            const data = localStateManager.getItem(STORAGE_KEY);
            if (!data) return [];
            const chars = JSON.parse(data);
            return Array.isArray(chars) ? chars : [];
        } catch (e) {
            console.error('[STORAGE] Fehler beim Laden:', e);
            return [];
        }
    },
    
    getCharacterById(id) {
        const chars = this.loadAllCharacters();
        return chars.find(c => c.id === id) || null;
    },
    
    deleteCharacter(id) {
        const chars = this.loadAllCharacters().filter(c => c.id !== id);
        localStateManager.setItem(STORAGE_KEY, JSON.stringify(chars));
        return true;
    }
};

// Override alte Storage Funktionen
if (typeof CharacterService !== 'undefined') {
    CharacterService.save = function(character) {
        return GlobalStateManager.saveCharacter(character);
    };
    CharacterService.loadAll = function() {
        return GlobalStateManager.loadAllCharacters();
    };
    CharacterService.loadById = function(id) {
        return GlobalStateManager.getCharacterById(id);
    };
}

// AccountSystem override
if (typeof AccountSystem !== 'undefined') {
    AccountSystem.saveCharacter = function(character) {
        return GlobalStateManager.saveCharacter(character);
    };
    AccountSystem.loadCharacters = function() {
        return GlobalStateManager.loadAllCharacters();
    };
}
