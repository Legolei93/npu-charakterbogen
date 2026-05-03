/**
 * Clan Data - Zentrale Clan-Definitionen
 * 
 * Konsolidiert aus:
 * - app.js (CLAN_JUTSUS)
 * - clan-bonuses.js
 * - npu-core.js (Clan-Boni)
 * 
 * Single Source of Truth für alle Clan-bezogenen Daten
 */

const ClanData = {
    
    // === HAUPTCLANS ===
    
    uchiha: {
        name: 'Uchiha',
        description: 'Träger des Sharingan mit mächtigen Genjutsu',
        symbol: '🔥',
        bonuses: {
            chakra: 15,
            itu: 1,
            initiative: 1
        },
        startingJutsu: ['sharingan_activation'],
        jutsuAccess: ['uchiha', 'sharingan'],
        specialAbilities: [
            'Sharingan: Kopiert Ninjutsu und Taijutsu',
            'Genjutsu: Erhöhte Resistenz gegen Genjutsu'
        ],
        kekkeiGenkai: 'sharingan'
    },
    
    hyuga: {
        name: 'Hyuga',
        description: 'Träger des Byakugan mit 360 Grad Sicht',
        symbol: '👁️',
        bonuses: {
            wahrnehmung: 3,
            chakra: 10,
            initiative: 1
        },
        startingJutsu: ['byakugan_activation'],
        jutsuAccess: ['hyuga', 'byakugan'],
        specialAbilities: [
            'Byakugan: 360 Grad Sicht und Chakra-Sicht',
            'Juuken: Angriffe auf Chakra-Punkte'
        ],
        kekkeiGenkai: 'byakugan'
    },
    
    aburame: {
        name: 'Aburame',
        description: 'Käfer-Nutzer mit einzigartigen Fähigkeiten',
        symbol: '🐛',
        bonuses: {
            chakra: 20,
            chakraRegen: 2,
            initiative: 1
        },
        startingJutsu: ['kikaichu_no_jutsu'],
        jutsuAccess: ['aburame'],
        specialAbilities: [
            'Kikaichu-Nutzer: Kann Chakra von Gegnern absorbieren',
            'Käfer-Sensoren: +2 auf Wahrnehmung'
        ]
    },
    
    akimichi: {
        name: 'Akimichi',
        description: 'Meister des Expansions-Jutsu und Nahkämpfer',
        symbol: '🍖',
        bonuses: {
            hp: 10,
            kk: 1,
            kon: 1
        },
        startingJutsu: ['baika_no_jutsu'],
        jutsuAccess: ['akimichi'],
        specialAbilities: [
            'Baika no Jutsu: Kann Körperteile vergrößern',
            'Kalorien-Umwandlung: Kann Nahrung in Chakra umwandeln'
        ]
    },
    
    nara: {
        name: 'Nara',
        description: 'Strategen mit Schatten-Manipulations-Jutsu',
        symbol: '🌑',
        bonuses: {
            int: 2,
            chakra: 15,
            initiative: -1
        },
        startingJutsu: ['kagemane_no_jutsu'],
        jutsuAccess: ['nara'],
        specialAbilities: [
            'Kagemane no Jutsu: Kann Schatten manipulieren',
            'Stratege: +2 auf Taktik-Würfe'
        ]
    },
    
    yamanaka: {
        name: 'Yamanaka',
        description: 'Meister des Geist-Transfer-Jutsu',
        symbol: '🌸',
        bonuses: {
            int: 1,
            cha: 1,
            chakra: 10
        },
        startingJutsu: ['shintenshin_no_jutsu'],
        jutsuAccess: ['yamanaka'],
        specialAbilities: [
            'Shintenshin: Geistübertragung',
            'Telepathie: Kann Gedanken lesen'
        ]
    },
    
    inuzuka: {
        name: 'Inuzuka',
        description: 'Ninja mit Hunde-Begleiter und tierischen Sinnen',
        symbol: '🐕',
        bonuses: {
            wahrnehmung: 2,
            gsw: 1,
            initiative: 1
        },
        startingJutsu: ['shikyaku_no_jutsu'],
        jutsuAccess: ['inuzuka'],
        specialAbilities: [
            'Juujin Bunshin: Kann sich mit Hund zusammenschließen',
            'Giga Tsuuga: Verbesserter Dreh-Angriff'
        ]
    },
    
    // === SPEZIALCLANS ===
    
    hozuki: {
        name: 'Hozuki',
        description: 'Wasser-Ninja mit flüssiger Körperform',
        symbol: '💧',
        bonuses: {
            chakra: 15,
            kon: 1
        },
        startingJutsu: ['suika_no_jutsu'],
        jutsuAccess: ['hozuki'],
        specialAbilities: [
            'Suika no Jutsu: Kann in Wasser verwandeln',
            'Wasser-Immunität: Immun gegen Wasser-Jutsu'
        ]
    },
    
    hoshigaki: {
        name: 'Hoshigaki',
        description: 'Hai-Ninja mit enormer Chakra-Reserve',
        symbol: '🦈',
        bonuses: {
            chakra: 30,
            kk: 1
        },
        startingJutsu: ['samehada_binding'],
        jutsuAccess: ['hoshigaki'],
        specialAbilities: [
            'Samehada Bindung: Lebendiges Schwert',
            'Chakra-Absorption: Kann Chakra absorbieren'
        ]
    },
    
    kaguya: {
        name: 'Kaguya',
        description: 'Knochen-Manipulations-Ninja',
        symbol: '🦴',
        bonuses: {
            kk: 2,
            kon: 1
        },
        startingJutsu: ['knochenhärtung'],
        jutsuAccess: ['kaguya'],
        specialAbilities: [
            'Shikotsumyaku: Kann Knochen manipulieren',
            'Knochen-Rüstung: Natürliche Rüstung'
        ],
        kekkeiGenkai: 'shikotsumyaku'
    },
    
    // === FROSTFELS SPEZIFISCH ===
    
    guren: {
        name: 'Guren',
        description: 'Kristall-Manipulations-Clan',
        symbol: '💎',
        bonuses: {
            chakra: 15,
            int: 1
        },
        startingJutsu: ['kristallversteck_activation'],
        jutsuAccess: ['guren', 'kristallversteck'],
        specialAbilities: [
            'Kristall-Manipulation: Kann Kristalle formen',
            'Kristall-Versteck: Zugang zum Kristallversteck'
        ],
        kekkeiGenkai: 'kristallversteck',
        hideout: 'kristallversteck'
    },
    
    // === KEIN CLAN ===
    
    none: {
        name: 'Kein Clan',
        description: 'Ein normaler Ninja ohne Clan-Boni',
        symbol: '⚪',
        bonuses: {},
        startingJutsu: [],
        jutsuAccess: ['basic'],
        specialAbilities: ['Keine besonderen Fähigkeiten']
    }
};

// === HILFSMETHODEN ===

/**
 * Gibt Clan-Daten zurück
 * @param {string} clanId - Die Clan-ID
 * @returns {Object|null}
 */
ClanData.get = function(clanId) {
    return this[clanId] || this.none;
};

/**
 * Gibt alle verfügbaren Clans zurück
 * @returns {Array}
 */
ClanData.getAll = function() {
    return Object.entries(this)
        .filter(([key]) => key !== 'get' && key !== 'getAll' && key !== 'getByKekkeiGenkai')
        .map(([key, data]) => ({ id: key, ...data }));
};

/**
 * Gibt Clans mit Kekkei Genkai zurück
 * @returns {Array}
 */
ClanData.getWithKekkeiGenkai = function() {
    return this.getAll().filter(clan => clan.kekkeiGenkai);
};

/**
 * Gibt den Clan für ein Kekkei Genkai zurück
 * @param {string} kekkeiGenkai - Das Kekkei Genkai
 * @returns {Object|null}
 */
ClanData.getByKekkeiGenkai = function(kekkeiGenkai) {
    return this.getAll().find(clan => clan.kekkeiGenkai === kekkeiGenkai) || null;
};

// Global verfügbar machen
window.ClanData = ClanData;
