/**
 * Auth API mit DM- und Spielerverwaltung
 * Zentrales Verwaltungssystem für NPU Charakterbogen
 */

// Feste Spielerliste (vom DM verwaltet)
const PLAYERS_DB = [
    { id: 'p1', username: 'Niklas', password: 'Naruto', role: 'player', characterId: null },
    { id: 'p2', username: 'Sascha', password: 'Naruto', role: 'player', characterId: null },
    { id: 'p3', username: 'Richard', password: 'Naruto', role: 'player', characterId: null },
    { id: 'p4', username: 'Michael', password: 'Naruto', role: 'player', characterId: null },
    { id: 'p5', username: 'Kevin', password: 'Naruto', role: 'player', characterId: null }
];

// DM Account
const DM_ACCOUNT = {
    id: 'dm1',
    username: 'Alex',
    password: 'Alex-Osterhase-1993',
    role: 'dm'
};

// Aktueller Benutzer
let currentUser = null;

// Alle Charaktere (DM verwaltet diese)
let allCharacters = JSON.parse(localStorage.getItem('npu_all_characters') || '[]');

// Spieler-Charakter-Zuweisungen
let characterAssignments = JSON.parse(localStorage.getItem('npu_character_assignments') || '{}');

/**
 * Login-Funktion
 */
function login(username, password) {
    // DM Login
    if (username === DM_ACCOUNT.username && password === DM_ACCOUNT.password) {
        currentUser = { ...DM_ACCOUNT, isDM: true };
        localStorage.setItem('npu_current_user', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }
    
    // Spieler Login
    const player = PLAYERS_DB.find(p => p.username === username && p.password === password);
    if (player) {
        // Prüfen ob Spieler einen Charakter zugewiesen bekommen hat
        const assignedCharacterId = characterAssignments[player.id];
        currentUser = { 
            ...player, 
            isPlayer: true,
            assignedCharacterId: assignedCharacterId
        };
        localStorage.setItem('npu_current_user', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }
    
    return { success: false, error: 'Ungültige Anmeldedaten' };
}

/**
 * Logout
 */
function logout() {
    currentUser = null;
    localStorage.removeItem('npu_current_user');
}

/**
 * Aktuellen Benutzer abrufen
 */
function getCurrentUser() {
    if (!currentUser) {
        const saved = localStorage.getItem('npu_current_user');
        if (saved) {
            currentUser = JSON.parse(saved);
        }
    }
    return currentUser;
}

/**
 * Prüfen ob eingeloggt
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * Prüfen ob DM
 */
function isDM() {
    const user = getCurrentUser();
    return user && user.role === 'dm';
}

/**
 * Prüfen ob Spieler
 */
function isPlayer() {
    const user = getCurrentUser();
    return user && user.role === 'player';
}

/**
 * Alle Spieler abrufen (nur DM)
 */
function getAllPlayers() {
    if (!isDM()) return [];
    
    return PLAYERS_DB.map(player => ({
        ...player,
        assignedCharacter: getCharacterById(characterAssignments[player.id])
    }));
}

/**
 * Charakter einem Spieler zuweisen (nur DM)
 */
function assignCharacterToPlayer(playerId, characterId) {
    if (!isDM()) return false;
    
    characterAssignments[playerId] = characterId;
    localStorage.setItem('npu_character_assignments', JSON.stringify(characterAssignments));
    
    // Spieler-Account aktualisieren
    const player = PLAYERS_DB.find(p => p.id === playerId);
    if (player) {
        player.characterId = characterId;
    }
    
    return true;
}

/**
 * Charakter-Zuweisung entfernen (nur DM)
 */
function removeCharacterAssignment(playerId) {
    if (!isDM()) return false;
    
    delete characterAssignments[playerId];
    localStorage.setItem('npu_character_assignments', JSON.stringify(characterAssignments));
    
    const player = PLAYERS_DB.find(p => p.id === playerId);
    if (player) {
        player.characterId = null;
    }
    
    return true;
}

/**
 * Alle Charaktere abrufen (nur DM)
 * Spieler sieht nur seinen eigenen
 */
function getCharacters() {
    const user = getCurrentUser();
    if (!user) return [];
    
    if (user.role === 'dm') {
        // DM sieht alle Charaktere
        return allCharacters.map(char => ({
            ...char,
            assignedPlayer: getPlayerByCharacterId(char.id)
        }));
    } else {
        // Spieler sieht nur seinen zugewiesenen Charakter
        if (user.assignedCharacterId) {
            const char = getCharacterById(user.assignedCharacterId);
            return char ? [char] : [];
        }
        return [];
    }
}

/**
 * Einzelnen Charakter abrufen
 */
function getCharacterById(characterId) {
    if (!characterId) return null;
    return allCharacters.find(c => c.id === characterId) || null;
}

/**
 * Spieler anhand Charakter-ID finden
 */
function getPlayerByCharacterId(characterId) {
    if (!characterId) return null;
    
    const entry = Object.entries(characterAssignments).find(([_, charId]) => charId === characterId);
    if (entry) {
        const playerId = entry[0];
        return PLAYERS_DB.find(p => p.id === playerId) || null;
    }
    return null;
}

/**
 * Charakter speichern
 */
function saveCharacter(character) {
    if (!character || !character.id) return false;
    
    const user = getCurrentUser();
    if (!user) return false;
    
    // Prüfen ob Spieler berechtigt ist (nur eigener Charakter)
    if (user.role === 'player' && user.assignedCharacterId !== character.id) {
        return false;
    }
    
    const index = allCharacters.findIndex(c => c.id === character.id);
    if (index >= 0) {
        allCharacters[index] = { ...character, lastModified: Date.now(), modifiedBy: user.username };
    } else {
        allCharacters.push({ 
            ...character, 
            createdAt: Date.now(),
            lastModified: Date.now(),
            createdBy: user.username,
            modifiedBy: user.username
        });
    }
    
    localStorage.setItem('npu_all_characters', JSON.stringify(allCharacters));
    return true;
}

/**
 * Charakter löschen (nur DM)
 */
function deleteCharacter(characterId) {
    if (!isDM()) return false;
    
    allCharacters = allCharacters.filter(c => c.id !== characterId);
    localStorage.setItem('npu_all_characters', JSON.stringify(allCharacters));
    
    // Zuweisung entfernen falls vorhanden
    const assignment = Object.entries(characterAssignments).find(([_, charId]) => charId === characterId);
    if (assignment) {
        removeCharacterAssignment(assignment[0]);
    }
    
    return true;
}

/**
 * Neuen Charakter erstellen (nur DM)
 */
function createCharacter(characterData) {
    if (!isDM()) return null;
    
    const newCharacter = {
        id: 'char_' + Date.now(),
        ...characterData,
        createdAt: Date.now(),
        lastModified: Date.now(),
        createdBy: getCurrentUser().username,
        modifiedBy: getCurrentUser().username
    };
    
    allCharacters.push(newCharacter);
    localStorage.setItem('npu_all_characters', JSON.stringify(allCharacters));
    
    return newCharacter;
}

/**
 * DM-Panel Daten laden
 */
function getDMPanelData() {
    if (!isDM()) return null;
    
    return {
        players: getAllPlayers(),
        characters: allCharacters,
        assignments: characterAssignments
    };
}

// Export
window.AuthAPI = {
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    isDM,
    isPlayer,
    getAllPlayers,
    assignCharacterToPlayer,
    removeCharacterAssignment,
    getCharacters,
    getCharacterById,
    saveCharacter,
    deleteCharacter,
    createCharacter,
    getDMPanelData
};
