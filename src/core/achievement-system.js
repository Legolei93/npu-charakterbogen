/**
 * Achievement System v1.0
 * 
 * Features:
 * - Erfolge für Quests, Kämpfe, Training
 * - Fortschritts-Tracking
 * - Belohnungen für Erfolge
 * - Kategorien
 */

const AchievementSystem = {
    
    // === KONFIGURATION ===
    CONFIG: {
        STORAGE_KEY: 'npu_achievements'
    },
    
    // === ACHIEVEMENT DEFINITIONS ===
    ACHIEVEMENTS: {
        // Quest-Erfolge
        quest_novice: {
            id: 'quest_novice',
            name: 'Quest-Anfänger',
            description: 'Schließe deine erste Quest ab',
            category: 'quests',
            icon: '📜',
            requirement: { type: 'quests_completed', count: 1 },
            reward: { xp: 10, title: 'Anfänger' }
        },
        quest_apprentice: {
            id: 'quest_apprentice',
            name: 'Quest-Lehrling',
            description: 'Schließe 10 Quests ab',
            category: 'quests',
            icon: '📜',
            requirement: { type: 'quests_completed', count: 10 },
            reward: { xp: 50, title: 'Lehrling' }
        },
        quest_master: {
            id: 'quest_master',
            name: 'Quest-Meister',
            description: 'Schließe 50 Quests ab',
            category: 'quests',
            icon: '📜',
            requirement: { type: 'quests_completed', count: 50 },
            reward: { xp: 200, title: 'Quest-Meister' }
        },
        quest_chain_master: {
            id: 'quest_chain_master',
            name: 'Ketten-Reaktor',
            description: 'Schließe eine komplette Quest-Chain ab',
            category: 'quests',
            icon: '⛓️',
            requirement: { type: 'chains_completed', count: 1 },
            reward: { xp: 100, title: 'Ketten-Meister' }
        },
        
        // Kampf-Erfolge
        combat_novice: {
            id: 'combat_novice',
            name: 'Kampf-Anfänger',
            description: 'Gewinne deinen ersten Kampf',
            category: 'combat',
            icon: '⚔️',
            requirement: { type: 'combats_won', count: 1 },
            reward: { xp: 10 }
        },
        combat_veteran: {
            id: 'combat_veteran',
            name: 'Kampf-Veteran',
            description: 'Gewinne 20 Kämpfe',
            category: 'combat',
            icon: '⚔️',
            requirement: { type: 'combats_won', count: 20 },
            reward: { xp: 100 }
        },
        combat_master: {
            id: 'combat_master',
            name: 'Kampf-Meister',
            description: 'Gewinne 100 Kämpfe',
            category: 'combat',
            icon: '⚔️',
            requirement: { type: 'combats_won', count: 100 },
            reward: { xp: 500, title: 'Kampf-Meister' }
        },
        
        // Training-Erfolge
        training_novice: {
            id: 'training_novice',
            name: 'Trainings-Anfänger',
            description: 'Absolviere dein erstes Training',
            category: 'training',
            icon: '🏋️',
            requirement: { type: 'training_completed', count: 1 },
            reward: { xp: 10 }
        },
        training_dedicated: {
            id: 'training_dedicated',
            name: 'Diszipliniert',
            description: 'Trainiere 7 Tage in Folge',
            category: 'training',
            icon: '🏋️',
            requirement: { type: 'training_streak', count: 7 },
            reward: { xp: 100, title: 'Diszipliniert' }
        },
        
        // Karma-Erfolge
        karma_hero: {
            id: 'karma_hero',
            name: 'Held',
            description: 'Erreiche +50 Karma',
            category: 'karma',
            icon: '☀️',
            requirement: { type: 'karma_reached', value: 50 },
            reward: { xp: 100, title: 'Held' }
        },
        karma_villain: {
            id: 'karma_villain',
            name: 'Schurke',
            description: 'Erreiche -50 Karma',
            category: 'karma',
            icon: '🌑',
            requirement: { type: 'karma_reached', value: -50 },
            reward: { xp: 100, title: 'Schurke' }
        },
        
        // Jutsu-Erfolge
        jutsu_collector: {
            id: 'jutsu_collector',
            name: 'Jutsu-Sammler',
            description: 'Lerne 10 Jutsus',
            category: 'jutsu',
            icon: '📜',
            requirement: { type: 'jutsus_learned', count: 10 },
            reward: { xp: 50 }
        },
        jutsu_master: {
            id: 'jutsu_master',
            name: 'Jutsu-Meister',
            description: 'Lerne 30 Jutsus',
            category: 'jutsu',
            icon: '📜',
            requirement: { type: 'jutsus_learned', count: 30 },
            reward: { xp: 200, title: 'Jutsu-Meister' }
        },
        
        // Spezial-Erfolge
        rare_hunter: {
            id: 'rare_hunter',
            name: 'Rare Hunter',
            description: 'Schließe eine Quest während eines Rare Events ab',
            category: 'special',
            icon: '⚡',
            requirement: { type: 'rare_event_quest', count: 1 },
            reward: { xp: 150, title: 'Rare Hunter' }
        },
        first_blood: {
            id: 'first_blood',
            name: 'First Blood',
            description: 'Besiege einen Boss-Gegner',
            category: 'special',
            icon: '🩸',
            requirement: { type: 'boss_defeated', count: 1 },
            reward: { xp: 100 }
        }
    },
    
    // === STATE ===
    state: {
        unlocked: [],
        progress: {},
        stats: {
            quests_completed: 0,
            combats_won: 0,
            training_completed: 0,
            training_streak: 0,
            chains_completed: 0,
            jutsus_learned: 0,
            boss_defeated: 0,
            rare_event_quest: 0
        }
    },
    
    // === INITIALISIERUNG ===
    
    init() {
        console.log('[AchievementSystem] Initialisiere...');
        this.loadState();
        this.setupEventListeners();
        console.log('[AchievementSystem] Initialisiert');
    },
    
    // === EVENT LISTENERS ===
    
    setupEventListeners() {
        if (typeof EventBus === 'undefined') return;
        
        // Quest Events
        EventBus.on('quest:completed', () => {
            this.incrementStat('quests_completed');
        });
        
        // Combat Events
        EventBus.on('combat:victory', () => {
            this.incrementStat('combats_won');
        });
        
        // Training Events
        EventBus.on('training:completed', () => {
            this.incrementStat('training_completed');
        });
        
        // Chain Events
        EventBus.on('quest:chain_completed', () => {
            this.incrementStat('chains_completed');
        });
        
        // Jutsu Events
        EventBus.on('jutsu:learned', () => {
            this.incrementStat('jutsus_learned');
        });
    },
    
    // === STAT TRACKING ===
    
    incrementStat(statName, amount = 1) {
        this.state.stats[statName] = (this.state.stats[statName] || 0) + amount;
        this.checkAchievements();
        this.saveState();
    },
    
    updateStat(statName, value) {
        this.state.stats[statName] = value;
        this.checkAchievements();
        this.saveState();
    },
    
    // === ACHIEVEMENT CHECKING ===
    
    checkAchievements() {
        for (const [id, achievement] of Object.entries(this.ACHIEVEMENTS)) {
            // Prüfe ob bereits freigeschaltet
            if (this.state.unlocked.includes(id)) continue;
            
            // Prüfe Requirement
            if (this._checkRequirement(achievement.requirement)) {
                this.unlockAchievement(id);
            }
        }
    },
    
    _checkRequirement(req) {
        switch (req.type) {
            case 'quests_completed':
            case 'combats_won':
            case 'training_completed':
            case 'chains_completed':
            case 'jutsus_learned':
            case 'boss_defeated':
            case 'rare_event_quest':
                return (this.state.stats[req.type] || 0) >= req.count;
                
            case 'training_streak':
                return (this.state.stats.training_streak || 0) >= req.count;
                
            case 'karma_reached':
                const karma = this._getCurrentKarma();
                return req.value > 0 ? karma >= req.value : karma <= req.value;
                
            default:
                return false;
        }
    },
    
    // === ACHIEVEMENT UNLOCKING ===
    
    unlockAchievement(achievementId) {
        const achievement = this.ACHIEVEMENTS[achievementId];
        if (!achievement) return;
        
        // Füge zu unlocked hinzu
        this.state.unlocked.push(achievementId);
        
        // Gebe Belohnung
        this._giveReward(achievement.reward);
        
        // Speichern
        this.saveState();
        
        // Zeige Benachrichtigung
        this._showUnlockNotification(achievement);
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('achievement:unlocked', achievement);
        }
        
        console.log(`[AchievementSystem] Erfolg freigeschaltet: ${achievement.name}`);
    },
    
    _giveReward(reward) {
        const character = this._getCurrentCharacter();
        if (!character) return;
        
        if (reward.xp) {
            character.xp = (character.xp || 0) + reward.xp;
        }
        
        if (reward.title) {
            character.titles = character.titles || [];
            if (!character.titles.includes(reward.title)) {
                character.titles.push(reward.title);
            }
        }
        
        // Speichern
        if (typeof AccountSystem !== 'undefined') {
            AccountSystem.saveCharacter(character);
        }
    },
    
    _showUnlockNotification(achievement) {
        // Erstelle Benachrichtigung
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">Erfolg freigeschaltet!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-reward">+${achievement.reward.xp} XP</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Entfernen nach 5 Sekunden
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    },
    
    // === UI ===
    
    renderAchievementPanel() {
        const categories = ['quests', 'combat', 'training', 'karma', 'jutsu', 'special'];
        
        return `
            <div class="achievement-panel">
                <h2>🏆 Erfolge</h2>
                <div class="achievement-stats">
                    <span>Freigeschaltet: ${this.state.unlocked.length} / ${Object.keys(this.ACHIEVEMENTS).length}</span>
                </div>
                ${categories.map(cat => this.renderCategory(cat)).join('')}
            </div>
        `;
    },
    
    renderCategory(category) {
        const achievements = Object.values(this.ACHIEVEMENTS).filter(a => a.category === category);
        
        return `
            <div class="achievement-category">
                <h3>${this._getCategoryName(category)}</h3>
                <div class="achievement-list">
                    ${achievements.map(a => this.renderAchievementCard(a)).join('')}
                </div>
            </div>
        `;
    },
    
    renderAchievementCard(achievement) {
        const unlocked = this.state.unlocked.includes(achievement.id);
        const progress = this._getProgress(achievement);
        
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${!unlocked ? `<div class="achievement-progress">${progress}</div>` : ''}
                </div>
                <div class="achievement-reward">+${achievement.reward.xp} XP</div>
            </div>
        `;
    },
    
    _getCategoryName(category) {
        const names = {
            quests: '📜 Quests',
            combat: '⚔️ Kampf',
            training: '🏋️ Training',
            karma: '☯️ Karma',
            jutsu: '📜 Jutsu',
            special: '✨ Spezial'
        };
        return names[category] || category;
    },
    
    _getProgress(achievement) {
        const req = achievement.requirement;
        const current = this.state.stats[req.type] || 0;
        
        if (req.count) {
            return `${current} / ${req.count}`;
        }
        return '';
    },
    
    // === STORAGE ===
    
    saveState() {
        const userId = this._getCurrentUserId();
        if (!userId) return;
        
        const key = `${this.CONFIG.STORAGE_KEY}_${userId}`;
        localStorage.setItem(key, JSON.stringify(this.state));
    },
    
    loadState() {
        const userId = this._getCurrentUserId();
        if (!userId) return;
        
        const key = `${this.CONFIG.STORAGE_KEY}_${userId}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('[AchievementSystem] Fehler beim Laden:', e);
            }
        }
    },
    
    // === HELPERS ===
    
    _getCurrentCharacter() {
        if (typeof AccountSystem !== 'undefined') {
            return AccountSystem.getCurrentCharacter();
        }
        return window.currentCharacter || null;
    },
    
    _getCurrentUserId() {
        if (typeof AccountSystem !== 'undefined') {
            const user = AccountSystem.getCurrentUser();
            return user?.id;
        }
        return null;
    },
    
    _getCurrentKarma() {
        if (typeof KarmaSystem !== 'undefined') {
            return KarmaSystem.getKarma();
        }
        return 0;
    }
};

// Global verfügbar machen
window.AchievementSystem = AchievementSystem;

// Automatisch initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AchievementSystem.init());
} else {
    AchievementSystem.init();
}
