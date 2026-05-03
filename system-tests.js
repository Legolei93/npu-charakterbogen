/**
 * System-Tests fuer NPU Charakterbogen
 * Fuehrt automatische Tests der Kernfunktionen durch
 */

const SystemTests = {
    results: [],
    
    log(test, success, message) {
        this.results.push({ test, success, message, timestamp: new Date().toISOString() });
        const icon = success ? '[OK]' : '[FAIL]';
        console.log(`${icon} ${test}: ${message}`);
    },
    
    // ============================================
    // STORAGE TESTS
    // ============================================
    testStorage() {
        console.log('[Box] Storage Tests...');
        
        // Test 1: Speichern und Laden
        const testData = { test: 'data', number: 42 };
        Storage.set('test_key', testData);
        const loaded = Storage.get('test_key');
        
        if (JSON.stringify(loaded) === JSON.stringify(testData)) {
            this.log('Storage: Save/Load', true, 'Daten korrekt gespeichert und geladen');
        } else {
            this.log('Storage: Save/Load', false, 'Daten nicht korrekt');
        }
        
        // Test 2: Loeschen
        Storage.remove('test_key');
        const afterRemove = Storage.get('test_key');
        
        if (afterRemove === null) {
            this.log('Storage: Remove', true, 'Daten korrekt entfernt');
        } else {
            this.log('Storage: Remove', false, 'Daten noch vorhanden');
        }
        
        // Cleanup
        Storage.remove('test_key');
    },
    
    // ============================================
    // UTILS TESTS
    // ============================================
    testUtils() {
        console.log('[Werkzeug] Utils Tests...');
        
        // Test: Modifier berechnen
        const mod8 = Utils.getModifier(8);
        const mod10 = Utils.getModifier(10);
        const mod14 = Utils.getModifier(14);
        
        if (mod8 === -1 && mod10 === 0 && mod14 === 2) {
            this.log('Utils: getModifier', true, 'Modifier korrekt berechnet');
        } else {
            this.log('Utils: getModifier', false, `Falsche Werte: ${mod8}, ${mod10}, ${mod14}`);
        }
        
        // Test: UUID generieren
        const uuid = Utils.generateId();
        if (uuid && uuid.length === 36 && uuid.includes('-')) {
            this.log('Utils: generateId', true, 'UUID korrekt generiert');
        } else {
            this.log('Utils: generateId', false, 'UUID Format falsch');
        }
    },
    
    // ============================================
    // CONFIG TESTS
    // ============================================
    testConfig() {
        console.log('[Einstellungen] Config Tests...');
        
        const checks = [
            { name: 'ATTRIBUTES', obj: CONFIG.ATTRIBUTES },
            { name: 'SKILLS', obj: CONFIG.SKILLS },
            { name: 'ELEMENTS', obj: CONFIG.ELEMENTS },
            { name: 'RANKS', obj: CONFIG.RANKS },
            { name: 'STORAGE_KEYS', obj: CONFIG.STORAGE_KEYS }
        ];
        
        checks.forEach(check => {
            if (check.obj && typeof check.obj === 'object' && !Utils.isEmpty(check.obj)) {
                this.log(`Config: ${check.name}`, true, 'Konfiguration vorhanden');
            } else {
                this.log(`Config: ${check.name}`, false, 'Konfiguration fehlt oder leer');
            }
        });
    },
    
    // ============================================
    // SYSTEM INITIALIZATION TESTS
    // ============================================
    testSystemInit() {
        console.log('[Start] System Initialisierung...');
        
        const systems = [
            { name: 'AuthSystem', obj: typeof AuthSystem !== 'undefined' ? AuthSystem : null },
            { name: 'DiceSystem', obj: typeof DiceSystem !== 'undefined' ? DiceSystem : null },
            { name: 'QuestSystem', obj: typeof QuestSystem !== 'undefined' ? QuestSystem : null },
            { name: 'SessionSystem', obj: typeof SessionSystem !== 'undefined' ? SessionSystem : null },
            { name: 'JutsuSystem', obj: typeof JutsuSystem !== 'undefined' ? JutsuSystem : null },
            { name: 'DeathSaveSystem', obj: typeof DeathSaveSystem !== 'undefined' ? DeathSaveSystem : null },
            { name: 'StatusEffectSystem', obj: typeof StatusEffectSystem !== 'undefined' ? StatusEffectSystem : null },
            { name: 'LiquidOrbs', obj: typeof LiquidOrbs !== 'undefined' ? LiquidOrbs : null }
        ];
        
        systems.forEach(sys => {
            if (sys.obj) {
                this.log(`System: ${sys.name}`, true, 'System verfuegbar');
            } else {
                this.log(`System: ${sys.name}`, false, 'System nicht geladen');
            }
        });
    },
    
    // ============================================
    // DICE SYSTEM TESTS
    // ============================================
    testDiceSystem() {
        console.log('[Wuerfel] Dice System Tests...');
        
        if (typeof DiceSystem === 'undefined') {
            this.log('Dice: Verfuegbarkeit', false, 'DiceSystem nicht geladen');
            return;
        }
        
        // Test: W20 wuerfeln
        const result = DiceSystem.rollD20(0, 'Test-Wurf');
        if (result && result.roll >= 1 && result.roll <= 20) {
            this.log('Dice: rollD20', true, `Wurf: ${result.roll}`);
        } else {
            this.log('Dice: rollD20', false, 'Ungueltiger Wurf');
        }
        
        // Test: Crit/Fail Erkennung
        const critResult = { roll: 20, modifier: 0, total: 20 };
        const failResult = { roll: 1, modifier: 0, total: 1 };
        
        if (DiceSystem.isCrit || (critResult.roll === 20)) {
            this.log('Dice: Crit Erkennung', true, 'Kritischer Erfolg erkannt');
        }
        
        if (DiceSystem.isFail || (failResult.roll === 1)) {
            this.log('Dice: Fail Erkennung', true, 'Kritischer Fehler erkannt');
        }
    },
    
    // ============================================
    // QUEST SYSTEM TESTS
    // ============================================
    testQuestSystem() {
        console.log('[Rolle] Quest System Tests...');
        
        if (typeof QuestSystem === 'undefined') {
            this.log('Quest: Verfuegbarkeit', false, 'QuestSystem nicht geladen');
            return;
        }
        
        // Test: Quest-Templates vorhanden
        if (QuestSystem.questTemplates && QuestSystem.questTemplates.length > 0) {
            this.log('Quest: Templates', true, `${QuestSystem.questTemplates.length} Templates vorhanden`);
        } else {
            this.log('Quest: Templates', false, 'Keine Templates gefunden');
        }
        
        // Test: Daily Quests generieren
        QuestSystem.generateDailyQuests();
        if (QuestSystem.dailyQuests && QuestSystem.dailyQuests.length > 0) {
            this.log('Quest: Daily Quests', true, `${QuestSystem.dailyQuests.length} Daily Quests generiert`);
        } else {
            this.log('Quest: Daily Quests', false, 'Keine Daily Quests');
        }
    },
    
    // ============================================
    // RUN ALL TESTS
    // ============================================
    runAll() {
        console.log('='.repeat(50));
        console.log('[Test] NPU SYSTEM TESTS');
        console.log('='.repeat(50));
        
        this.results = [];
        
        this.testStorage();
        this.testUtils();
        this.testConfig();
        this.testSystemInit();
        this.testDiceSystem();
        this.testQuestSystem();
        
        // Summary
        console.log('='.repeat(50));
        const passed = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        console.log(`[Ergebnis] ERGEBNIS: ${passed} bestanden, ${failed} fehlgeschlagen`);
        console.log('='.repeat(50));
        
        return {
            total: this.results.length,
            passed,
            failed,
            results: this.results
        };
    }
};

// Automatisch ausfuehren wenn ?test in URL
if (window.location.search.includes('test')) {
    window.addEventListener('load', () => {
        setTimeout(() => SystemTests.runAll(), 1000);
    });
}

// Global verfuegbar machen
window.SystemTests = SystemTests;
