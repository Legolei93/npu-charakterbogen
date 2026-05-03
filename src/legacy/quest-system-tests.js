/**
 * Quest System v4.0 - System Tests
 * 
 * Tests für:
 * - Quest Engine
 * - Dialog System
 * - Combat System
 * - Reward System
 * - Training System
 * - Karma System
 */

const QuestSystemTests = {
    
    /**
     * Führt alle Tests aus
     */
    runAll() {
        console.log('=== Quest System v4.0 Tests ===');
        
        const results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Einzelne Tests
        const tests = [
            { name: 'EventBus', fn: this.testEventBus },
            { name: 'StateManager', fn: this.testStateManager },
            { name: 'QuestRegistry', fn: this.testQuestRegistry },
            { name: 'QuestEngine', fn: this.testQuestEngine },
            { name: 'KarmaSystem', fn: this.testKarmaSystem },
            { name: 'RewardSystem', fn: this.testRewardSystem }
        ];
        
        tests.forEach(test => {
            try {
                console.log(`\n[Test] ${test.name}...`);
                test.fn.call(this);
                results.passed++;
                results.tests.push({ name: test.name, status: 'PASSED' });
                console.log(`✅ ${test.name} PASSED`);
            } catch (error) {
                results.failed++;
                results.tests.push({ name: test.name, status: 'FAILED', error: error.message });
                console.error(`❌ ${test.name} FAILED:`, error.message);
            }
        });
        
        console.log('\n=== Test Ergebnisse ===');
        console.log(`✅ Bestanden: ${results.passed}`);
        console.log(`❌ Fehlgeschlagen: ${results.failed}`);
        console.log(`📊 Gesamt: ${results.passed + results.failed}`);
        
        return results;
    },
    
    /**
     * Testet den EventBus
     */
    testEventBus() {
        if (typeof EventBus === 'undefined') {
            throw new Error('EventBus nicht verfügbar');
        }
        
        let received = false;
        const unsubscribe = EventBus.on('test:event', (data) => {
            received = true;
            if (data.test !== true) {
                throw new Error('Event-Daten nicht korrekt');
            }
        });
        
        EventBus.emit('test:event', { test: true });
        
        if (!received) {
            throw new Error('Event nicht empfangen');
        }
        
        unsubscribe();
        
        // Test: once
        let onceReceived = false;
        EventBus.once('test:once', () => {
            onceReceived = true;
        });
        
        EventBus.emit('test:once');
        EventBus.emit('test:once');
        
        if (!onceReceived) {
            throw new Error('Once-Event nicht empfangen');
        }
    },
    
    /**
     * Testet den StateManager
     */
    testStateManager() {
        if (typeof StateManager === 'undefined') {
            throw new Error('StateManager nicht verfügbar');
        }
        
        // Test: Character setzen und abrufen
        const testChar = {
            id: 'test-123',
            name: 'Test Character',
            level: 5
        };
        
        StateManager._character = testChar;
        const retrieved = StateManager.getCharacter();
        
        if (retrieved?.id !== testChar.id) {
            throw new Error('Character nicht korrekt gespeichert/abgerufen');
        }
    },
    
    /**
     * Testet die Quest Registry
     */
    testQuestRegistry() {
        if (typeof QuestRegistryV4 === 'undefined') {
            throw new Error('QuestRegistryV4 nicht verfügbar');
        }
        
        // Test: Quests nach Typ abrufen
        const storyQuests = QuestRegistryV4.getByType('story');
        if (!storyQuests || storyQuests.length === 0) {
            throw new Error('Keine Story-Quests gefunden');
        }
        
        // Test: Quest nach ID finden
        const quest = QuestRegistryV4.getById('story_banditen_grenzwald');
        if (!quest) {
            throw new Error('Quest nicht gefunden');
        }
        
        if (!quest.title || !quest.description) {
            throw new Error('Quest-Daten unvollständig');
        }
    },
    
    /**
     * Testet die Quest Engine
     */
    testQuestEngine() {
        if (typeof QuestEngine === 'undefined') {
            throw new Error('QuestEngine nicht verfügbar');
        }
        
        // Test: State initialisieren
        if (!QuestEngine.state) {
            throw new Error('QuestEngine State nicht initialisiert');
        }
        
        // Test: Verfügbare Quests abrufen
        const quests = QuestEngine.getAvailableQuests();
        if (!Array.isArray(quests)) {
            throw new Error('getAvailableQuests gibt kein Array zurück');
        }
        
        // Test: Daily Quests generieren
        QuestEngine.generateDailyQuests();
        
        if (!QuestEngine.state.availableQuests || QuestEngine.state.availableQuests.length === 0) {
            throw new Error('Daily Quests nicht generiert');
        }
    },
    
    /**
     * Testet das Karma System
     */
    testKarmaSystem() {
        if (typeof KarmaSystem === 'undefined') {
            throw new Error('KarmaSystem nicht verfügbar');
        }
        
        // Test: Karma Tier abrufen
        const tier = KarmaSystem.getKarmaTier();
        if (!tier || !tier.name || !tier.label) {
            throw new Error('Karma Tier nicht korrekt');
        }
        
        // Test: NPC Trust berechnen
        const trust = KarmaSystem.calculateTrust('taro');
        if (typeof trust !== 'number') {
            throw new Error('Trust-Berechnung nicht korrekt');
        }
    },
    
    /**
     * Testet das Reward System
     */
    testRewardSystem() {
        if (typeof RewardSystem === 'undefined') {
            throw new Error('RewardSystem nicht verfügbar');
        }
        
        // Test: Chest Selection generieren
        const chests = RewardSystem.generateChestSelection();
        if (!chests || chests.length !== 3) {
            throw new Error('Chest Selection nicht korrekt');
        }
        
        // Test: Chest öffnen
        const reward = RewardSystem.openChest('wood');
        if (!reward || !reward.contents) {
            throw new Error('Chest Reward nicht korrekt');
        }
    },
    
    /**
     * Testet das Dialog System
     */
    testDialogSystem() {
        if (typeof DialogSystem === 'undefined') {
            throw new Error('DialogSystem nicht verfügbar');
        }
        
        // Test: Dialog starten
        const testTree = {
            start: {
                text: 'Test',
                options: [
                    { text: 'Option 1', next: 'end' }
                ]
            },
            end: {
                text: 'Ende',
                result: 'quest_completed'
            }
        };
        
        const result = DialogSystem.start(testTree, { id: 'test', title: 'Test Quest' });
        if (result !== true) {
            throw new Error('Dialog konnte nicht gestartet werden');
        }
        
        DialogSystem.end();
    },
    
    /**
     * Testet das Training System
     */
    testTrainingSystem() {
        if (typeof TrainingSystem === 'undefined') {
            throw new Error('TrainingSystem nicht verfügbar');
        }
        
        // Test: Verfügbare Trainings abrufen
        const trainings = TrainingSystem.getAvailableTrainings();
        if (!trainings || trainings.length === 0) {
            throw new Error('Keine Trainings verfügbar');
        }
    },
    
    /**
     * Testet das Combat System
     */
    testCombatSystem() {
        if (typeof FastCombatSystem === 'undefined') {
            throw new Error('FastCombatSystem nicht verfügbar');
        }
        
        // Test: Combat simulieren
        const result = FastCombatSystem.simulate({
            enemies: [
                { type: 'wolf', count: 1, level: 1 }
            ]
        });
        
        if (!result || !result.result) {
            throw new Error('Combat Simulation nicht korrekt');
        }
    }
};

// Global verfügbar machen
window.QuestSystemTests = QuestSystemTests;

// Automatisch ausführen wenn URL Parameter ?test=true
if (window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => QuestSystemTests.runAll(), 1000);
    });
}

console.log('[QuestSystemTests] Geladen - Führe QuestSystemTests.runAll() aus um Tests zu starten');
