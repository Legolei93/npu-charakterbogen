/**
 * Items-Datenbank für NPU Charakterbogen
 * Waffen, Rüstungen und Zubehör
 */

const ITEMS_DB = {
    // Kopf-Ausrüstung
    head: [
        { name: "Stirnband (Konoha)", damage: "-", mod: "+1 CHA", rk: "-", desc: "Zeigt Zugehörigkeit zu Konoha" },
        { name: "Stirnband (Wolke)", damage: "-", mod: "+1 CHA", rk: "-", desc: "Zeigt Zugehörigkeit zu Kumogakure" },
        { name: "Stirnband (Nebel)", damage: "-", mod: "+1 CHA", rk: "-", desc: "Zeigt Zugehörigkeit zu Kirigakure" },
        { name: "Schutzbrille", damage: "-", mod: "-", rk: "-", desc: "Schützt vor Blendung" },
        { name: "Kopfschutz (Leder)", damage: "-", mod: "-", rk: "+1", desc: "Einfacher Lederschutz" },
        { name: "Kopfschutz (Metall)", damage: "-", mod: "-", rk: "+2", desc: "Verstärkter Metallschutz" },
        { name: "Anbu-Maske", damage: "-", mod: "+2 Schleichen", rk: "-", desc: "Verdeckt Identität" },
        { name: "Hitzeschutzhaube", damage: "-", mod: "Resistenz (Feuer)", rk: "-", desc: "Schutz vor Feuer" }
    ],
    
    // Brust-Ausrüstung
    chest: [
        { name: "Chunin-Weste", damage: "-", mod: "-", rk: "+2", desc: "Standardweste der Chunin" },
        { name: "Jonin-Weste", damage: "-", mod: "+1 ITU", rk: "+3", desc: "Verstärkte Jonin-Weste" },
        { name: "Anbu-Panzer", damage: "-", mod: "+2 GSW", rk: "+4", desc: "Leichter, flexibler Panzer" },
        { name: "Leder-Rüstung", damage: "-", mod: "-", rk: "+2", desc: "Einfache Lederrüstung" },
        { name: "Kettenhemd", damage: "-", mod: "-5 GSW", rk: "+5", desc: "Schwer aber schützend" },
        { name: "Schuppenpanzer", damage: "-", mod: "-3 GSW", rk: "+4", desc: "Gelenkiger Metallpanzer" },
        { name: "Chakra-Rüstung", damage: "-", mod: "+10 Chakra", rk: "+2", desc: "Verstärkt Chakravorkommen" },
        { name: "Explosionsgeschützte Weste", damage: "-", mod: "Resistenz (Explosion)", rk: "+3", desc: "Schutz vor Explosionen" }
    ],
    
    // Arme
    arms: [
        { name: "Arm-Schienen (Leder)", damage: "-", mod: "-", rk: "+1", desc: "Einfacher Armschutz" },
        { name: "Arm-Schienen (Metall)", damage: "-", mod: "-", rk: "+2", desc: "Verstärkter Schutz" },
        { name: "Chakra-Leitungen", damage: "-", mod: "+1 Ninjutsu", rk: "-", desc: "Verbessern Chakrafluss" },
        { name: "Shuriken-Armband", damage: "-", mod: "+1 Wurfwaffen", rk: "-", desc: "Schneller Zugriff auf Shuriken" },
        { name: "Explosionsarmbänder", damage: "1W6 (Explosion)", mod: "-", rk: "-", desc: "Einmaliger Explosionsangriff" },
        { name: "Seilkürzel", damage: "-", mod: "+2 Klettern", rk: "-", desc: "Hilft beim Klettern" }
    ],
    
    // Beine
    legs: [
        { name: "Bein-Schienen (Leder)", damage: "-", mod: "-", rk: "+1", desc: "Einfacher Beinschutz" },
        { name: "Bein-Schienen (Metall)", damage: "-", mod: "-1 GSW", rk: "+2", desc: "Verstärkter Schutz" },
        { name: "Chakra-Stiefel", damage: "-", mod: "+2 GSW", rk: "-", desc: "Leichtere Bewegung" },
        { name: "Wassergehärtete Stoffhose", damage: "-", mod: "Resistenz (Wasser)", rk: "-", desc: "Schnell trocknend" },
        { name: "Spring-Schuhe", damage: "-", mod: "+2 Akrobatik", rk: "-", desc: "Höhere Sprünge" }
    ],
    
    // Waffen
    weapon1: [
        { name: "Kunai", damage: "1W4", mod: "-", rk: "-", desc: "Standard-Ninjawaffe" },
        { name: "Shuriken (3x)", damage: "3x1W3", mod: "-", rk: "-", desc: "Wurfwaffen" },
        { name: "Katana", damage: "1W8", mod: "+1 Angriff", rk: "-", desc: "Traditionelles Schwert" },
        { name: "Tanto", damage: "1W6", mod: "+2 Schleichen", rk: "-", desc: "Kurzes Stichschwert" },
        { name: "Bokken", damage: "1W6 (nicht-tödlich)", mod: "-", rk: "-", desc: "Holzschwert für Training" },
        { name: "Kusarigama", damage: "1W6", mod: "+1 Waffentalent", rk: "-", desc: "Sichel mit Kette" },
        { name: "Bo-Stab", damage: "1W6", mod: "+1 Reichweite", rk: "-", desc: "Langer Kampfstab" },
        { name: "Tonfa", damage: "1W4", mod: "+1 Parieren", rk: "+1", desc: "Defensive Waffe" },
        { name: "Chakra-Klinge", damage: "2W4", mod: "+1W4 Chakra", rk: "-", desc: "Verstärkt durch Chakra" },
        { name: "Explosives Kunai", damage: "2W6", mod: "Einmalig", rk: "-", desc: "Kunai mit Sprengladung" }
    ],
    
    weapon2: [
        { name: "Kunai", damage: "1W4", mod: "-", rk: "-", desc: "Standard-Ninjawaffe" },
        { name: "Shuriken (3x)", damage: "3x1W3", mod: "-", rk: "-", desc: "Wurfwaffen" },
        { name: "Tanto", damage: "1W6", mod: "+1 Schleichen", rk: "-", desc: "Kurzes Stichschwert" },
        { name: "Senbon (5x)", damage: "5x1W2", mod: "Gift möglich", rk: "-", desc: "Nadelwaffen" },
        { name: "Fuma-Shuriken", damage: "1W10", mod: "-1 Angriff", rk: "-", desc: "Großer Shuriken" },
        { name: "Schwert (kurz)", damage: "1W6", mod: "-", rk: "-", desc: "Einfaches Kurzschwert" },
        { name: "Dolch", damage: "1W4", mod: "+1 Initiative", rk: "-", desc: "Schnelle Waffe" },
        { name: "Chakra-Kunai", damage: "1W6", mod: "+1W4 Chakra", rk: "-", desc: "Verstärktes Kunai" },
        { name: "Schild (klein)", damage: "1W4", mod: "+2 RK", rk: "+2", desc: "Defensiver Gegenstand" }
    ],
    
    // Zubehör
    accessory: [
        { name: "Heiltrank (klein)", damage: "-", mod: "Heilt 1W8+2", rk: "-", desc: "Einmalige Heilung" },
        { name: "Heiltrank (mittel)", damage: "-", mod: "Heilt 2W8+4", rk: "-", desc: "Stärkere Heilung" },
        { name: "Chakra-Tablette", damage: "-", mod: "+20 Chakra", rk: "-", desc: "Stellt Chakra wieder her" },
        { name: "Antidot", damage: "-", mod: "Heilt Gift", rk: "-", desc: "Gegen Gifte" },
        { name: "Schriftrolle (leer)", damage: "-", mod: "Speichert 1 Jutsu", rk: "-", desc: "Für Jutsu-Siegel" },
        { name: "Explosionskugel", damage: "3W6", mod: "Fläche 3m", rk: "-", desc: "Wurfexplosiv" },
        { name: "Rauchbombe", damage: "-", mod: "Deckungswurf", rk: "-", desc: "Erzeugt Rauchwand" },
        { name: "Blitzkugel", damage: "-", mod: "Blendet Gegner", rk: "-", desc: "Lichtblitz" },
        { name: "Seil (20m)", damage: "-", mod: "+2 Klettern", rk: "-", desc: "Ninja-Seil" },
        { name: "Wasserfass", damage: "-", mod: "Wasserquelle", rk: "-", desc: "Für Wasser-Jutsu" },
        { name: "Feldflasche", damage: "-", mod: "Wasser für 2 Tage", rk: "-", desc: "Grundbedürfnis" },
        { name: "Proviant (3 Tage)", damage: "-", mod: "Nahrung", rk: "-", desc: "Grundbedürfnis" },
        { name: "Bettrolle", damage: "-", mod: "Erholung +1", rk: "-", desc: "Besserer Schlaf" },
        { name: "Karte (Region)", damage: "-", mod: "+2 Orientierung", rk: "-", desc: "Ortskunde" },
        { name: "Kompass", damage: "-", mod: "Nie verlaufen", rk: "-", desc: "Navigation" },
        { name: "Fernglas", damage: "-", mod: "+2 Wahrnehmung", rk: "-", desc: "Sichtverstärkung" },
        { name: "Gift (schwach)", damage: "1W4/Runde", mod: "3 Runden", rk: "-", desc: "Auf Waffen" },
        { name: "Gift (stark)", damage: "1W8/Runde", mod: "5 Runden", rk: "-", desc: "Auf Waffen" },
        { name: "Schleifstein", damage: "-", mod: "Waffe +1 Schaden", rk: "-", desc: "Einmalig" },
        { name: "Bandagen", damage: "-", mod: "Stabilisiert", rk: "-", desc: "Erste Hilfe" }
    ]
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITEMS_DB;
}
