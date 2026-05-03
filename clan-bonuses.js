/**
 * Clan Boni System
 * Definiert alle Clans und ihre spezifischen Boni/Mali
 */

const CLAN_BONUSES = {
    // Aburame - Kaefer-Nutzer
    'aburame': {
        name: 'Aburame',
        description: 'Kaefer-Nutzer mit einzigartigen Faehigkeiten',
        bonuses: {
            chakra: 20,
            chakraRegen: 2,
            initiative: 1
        },
        specialAbilities: [
            'Kikaichu-Nutzer: Kann Chakra von Gegnern absorbieren',
            'Kaefer-Sensoren: +2 auf Wahrnehmung'
        ],
        jutsuAccess: ['aburame'],
        startingJutsu: ['kikaichu_no_jutsu']
    },
    
    // Akimichi - Expansions-Jutsu
    'akimichi': {
        name: 'Akimichi',
        description: 'Meister des Expansions-Jutsu und Nahkaempfer',
        bonuses: {
            hp: 10,
            kk: 1,
            kon: 1
        },
        specialAbilities: [
            'Baika no Jutsu: Kann Koerperteile vergroessern',
            'Kalorien-Umwandlung: Kann Nahrung in Chakra umwandeln'
        ],
        jutsuAccess: ['akimichi'],
        startingJutsu: ['baika_no_jutsu']
    },
    
    // Hyuga - Byakugan
    'hyuga': {
        name: 'Hyuga',
        description: 'Traeger des Byakugan mit 360 Grad Sicht',
        bonuses: {
            wahrnehmung: 3,
            chakra: 10,
            initiative: 1
        },
        specialAbilities: [
            'Byakugan: 360 Grad Sicht und Chakra-Sicht',
            'Juuken: Angriffe auf Chakra-Punkte'
        ],
        jutsuAccess: ['hyuga'],
        startingJutsu: ['byakugan_activation']
    },
    
    // Inuzuka - Hunde-Nutzer
    'inuzuka': {
        name: 'Inuzuka',
        description: 'Ninja mit Hunde-Begleiter und tierischen Sinnen',
        bonuses: {
            wahrnehmung: 2,
            gsw: 1,
            initiative: 1
        },
        specialAbilities: [
            'Juujin Bunshin: Kann sich mit Hund zusammenschliessen',
            'Giga Tsuuga: Verbesserter Dreh-Angriff'
        ],
        jutsuAccess: ['inuzuka'],
        startingJutsu: ['shikyaku_no_jutsu']
    },
    
    // Nara - Schatten-Manipulation
    'nara': {
        name: 'Nara',
        description: 'Strategen mit Schatten-Manipulations-Jutsu',
        bonuses: {
            int: 2,
            chakra: 15,
            initiative: -1
        },
        specialAbilities: [
            'Kagemane no Jutsu: Kann Schatten manipulieren',
            'Stratege: +2 auf Taktik-Wuerfe'
        ],
        jutsuAccess: ['nara'],
        startingJutsu: ['kagemane_no_jutsu']
    },
    
    // Uchiha - Sharingan
    'uchiha': {
        name: 'Uchiha',
        description: 'Traeger des Sharingan mit maichtigen Genjutsu',
        bonuses: {
            chakra: 15,
            itu: 1,
            initiative: 1
        },
        specialAbilities: [
            'Sharingan: Kann Jutsu kopieren und Genjutsu wirken',
            'Katon-Master: +2 auf Feuer-Jutsu'
        ],
        jutsuAccess: ['uchiha'],
        startingJutsu: ['sharingan_activation']
    },
    
    // Yamanaka - Geist-Manipulation
    'yamanaka': {
        name: 'Yamanaka',
        description: 'Spezialisten fuer Geist- und Gedanken-Manipulation',
        bonuses: {
            cha: 1,
            int: 1,
            chakra: 10
        },
        specialAbilities: [
            'Shintenshin: Kann in andere Koerper eindringen',
            'Telepathie: Gedankenkommunikation'
        ],
        jutsuAccess: ['yamanaka'],
        startingJutsu: ['shintenshin_no_jutsu']
    },
    
    // Senju - Holz-Stil
    'senju': {
        name: 'Senju',
        description: 'Maichtiges Clan mit Holz-Stil und grossem Chakra',
        bonuses: {
            chakra: 30,
            hp: 10,
            kon: 1
        },
        specialAbilities: [
            'Mokuton: Holz-Stil Jutsu',
            'Grosses Chakra: Erhoehte Chakra-Regeneration'
        ],
        jutsuAccess: ['senju'],
        startingJutsu: ['mokuton_no_jutsu']
    },
    
    // Hatake - Weisse Klinge
    'hatake': {
        name: 'Hatake',
        description: 'Elite-Ninja mit Weisser Klinge',
        bonuses: {
            gsw: 1,
            itu: 1,
            initiative: 2
        },
        specialAbilities: [
            'Weisse Klinge: Meisterhafter Schwertkampf',
            'Taktisches Genie: +2 auf Initiative'
        ],
        jutsuAccess: ['hatake'],
        startingJutsu: ['white_fang_style']
    },
    
    // Sarutobi - Feuer-Stil
    'sarutobi': {
        name: 'Sarutobi',
        description: 'Feuer-Stil Spezialisten mit Affen-Vertraeten',
        bonuses: {
            int: 1,
            cha: 1,
            chakra: 10
        },
        specialAbilities: [
            'Katon-Master: +1 auf alle Feuer-Jutsu',
            'Enma-Vertrag: Kann Affen-Monzun rufen'
        ],
        jutsuAccess: ['sarutobi'],
        startingJutsu: ['katon_goukakyuu']
    },
    
    // Ohne Clan
    'none': {
        name: 'Kein Clan',
        description: 'Ein Ninja ohne speziellen Clan-Hintergrund',
        bonuses: {},
        specialAbilities: ['Freiheit: Keine Clan-Beschraenkungen'],
        jutsuAccess: ['general'],
        startingJutsu: []
    }
};

/**
 * Wendet Clan-Boni auf einen Charakter an
 */
function applyClanBonuses(character) {
    const clanId = character.clan || 'none';
    const clanData = CLAN_BONUSES[clanId];
    
    if (!clanData) {
        console.warn('Unbekannter Clan:', clanId);
        return character;
    }
    
    // Wende Boni an
    if (clanData.bonuses) {
        Object.keys(clanData.bonuses).forEach(stat => {
            const bonus = clanData.bonuses[stat];
            
            if (character.attributes && character.attributes[stat] !== undefined) {
                character.attributes[stat] += bonus;
            } else if (character.stats && character.stats[stat] !== undefined) {
                character.stats[stat] += bonus;
            } else if (character.combat && character.combat[stat] !== undefined) {
                character.combat[stat] += bonus;
            }
        });
    }
    
    // Fuege Spezialfaehigkeiten hinzu
    if (clanData.specialAbilities) {
        character.clanAbilities = [...clanData.specialAbilities];
    }
    
    // Setze Jutsu-Zugang
    character.jutsuAccess = clanData.jutsuAccess || ['general'];
    
    return character;
}

/**
 * Gibt Clan-Informationen zurueck
 */
function getClanInfo(clanId) {
    return CLAN_BONUSES[clanId] || CLAN_BONUSES['none'];
}

/**
 * Liste aller verfuegbaren Clans
 */
function getAvailableClans() {
    return Object.keys(CLAN_BONUSES).map(key => ({
        id: key,
        name: CLAN_BONUSES[key].name,
        description: CLAN_BONUSES[key].description
    }));
}

// Global verfuegbar machen
window.CLAN_BONUSES = CLAN_BONUSES;
window.applyClanBonuses = applyClanBonuses;
window.getClanInfo = getClanInfo;
window.getAvailableClans = getAvailableClans;