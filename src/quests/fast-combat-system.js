/**
 * Fast Combat System v4.0 - Hintergrundkämpfe mit echten Werten
 * 
 * Features:
 * - Schnelle Kampf-Resolution (5-15 Sekunden)
 * - Echte Charakterwerte (Stats, Skills, Ausrüstung)
 * - Initiative-System
 * - Schadensberechnung
 * - Status-Effekte
 * - Ergebnis mit Konsequenzen
 */

const FastCombatSystem = {
    
    // === STATE ===
    currentCombat: null,
    combatLog: [],
    
    // === KONFIGURATION ===
    CONFIG: {
        MAX_ROUNDS: 10,
        CRITICAL_HIT_THRESHOLD: 20,
        CRITICAL_FAIL_THRESHOLD: 1,
        BASE_AC: 10
    },
    
    // === INITIALISIERUNG ===
    
    /**
     * Startet einen schnellen Kampf
     * @param {Object} quest - Die Quest mit combat Daten
     * @returns {Object} - Kampf-Ergebnis
     */
    start(quest) {
        if (!quest?.combat) {
            console.error('[FastCombat] Keine Kampf-Daten in Quest');
            return null;
        }
        
        const character = this._getCharacter();
        if (!character) {
            console.error('[FastCombat] Kein Character gefunden');
            return null;
        }
        
        console.log(`[FastCombat] Starte Kampf: ${quest.title}`);
        
        // Kampf initialisieren
        this.currentCombat = {
            quest: quest,
            character: this._createCombatant(character),
            enemies: quest.combat.enemies.map(e => this._createEnemy(e)),
            round: 1,
            log: [],
            result: null,
            startTime: Date.now()
        };
        
        // Initiative bestimmen
        this._rollInitiative();
        
        // Kampf ausführen
        const result = this._executeCombat();
        
        // Ergebnis anwenden
        this._applyResult(result);
        
        return result;
    },
    
    /**
     * Erstellt einen Combatant aus Character-Daten
     * @private
     */
    _createCombatant(character) {
        const combat = character.combat || {};
        const stats = character.stats || {};
        
        return {
            name: character.name || 'Shinobi',
            type: 'player',
            level: character.level || 1,
            
            // HP
            hp: {
                current: stats.hp?.current || 30,
                max: stats.hp?.max || 30
            },
            
            // Chakra
            chakra: {
                current: stats.chakra?.current || 100,
                max: stats.chakra?.max || 100
            },
            
            // Combat Werte
            initiative: combat.initiative || 0,
            attack: combat.angriff || 0,
            defense: combat.rk || 10,
            damage: combat.damage || { dice: '1W6', bonus: 0 },
            
            // Jutsus
            jutsus: character.jutsus || [],
            
            // Status
            status: [],
            
            // Stats für Skill Checks
            stats: character.baseAttributes || {},
            modifiers: character.modifiers || {}
        };
    },
    
    /**
     * Erstellt einen Gegner
     * @private
     */
    _createEnemy(enemyData) {
        const enemyTypes = {
            wolf: {
                name: 'Wolf',
                hp: 15,
                initiative: 2,
                attack: 3,
                defense: 12,
                damage: { dice: '1W4', bonus: 1 },
                xp: 10
            },
            bandit: {
                name: 'Bandit',
                hp: 25,
                initiative: 1,
                attack: 4,
                defense: 13,
                damage: { dice: '1W6', bonus: 1 },
                xp: 15
            },
            bandit_leader: {
                name: 'Banditen-Anführer',
                hp: 40,
                initiative: 2,
                attack: 6,
                defense: 15,
                damage: { dice: '1W8', bonus: 2 },
                xp: 30
            },
            shadow_beast: {
                name: 'Schattenbestie',
                hp: 50,
                initiative: 3,
                attack: 7,
                defense: 16,
                damage: { dice: '1W10', bonus: 3 },
                xp: 50
            },
            shadow_beast_alpha: {
                name: 'Schattenbestie Alpha',
                hp: 80,
                initiative: 4,
                attack: 9,
                defense: 18,
                damage: { dice: '2W6', bonus: 4 },
                xp: 100
            },
            training_dummy: {
                name: 'Trainingspuppe',
                hp: 999,
                initiative: 0,
                attack: 0,
                defense: 10,
                damage: { dice: '0', bonus: 0 },
                xp: 5
            }
        };
        
        const template = enemyTypes[enemyData.type] || enemyTypes.bandit;
        const level = enemyData.level || 1;
        
        // Skalierung nach Level
        const levelMultiplier = 1 + ((level - 1) * 0.2);
        
        return {
            name: template.name,
            type: 'enemy',
            level: level,
            
            hp: {
                current: Math.floor(template.hp * levelMultiplier),
                max: Math.floor(template.hp * levelMultiplier)
            },
            
            initiative: template.initiative + Math.floor((level - 1) / 2),
            attack: template.attack + Math.floor((level - 1) * 0.5),
            defense: template.defense + Math.floor((level - 1) * 0.5),
            damage: template.damage,
            
            xp: Math.floor(template.xp * levelMultiplier),
            
            status: [],
            elite: enemyData.elite || false,
            boss: enemyData.boss || false
        };
    },
    
    /**
     * Würfelt Initiative
     * @private
     */
    _rollInitiative() {
        const combat = this.currentCombat;
        
        // Character Initiative
        combat.character.initiativeRoll = this._d20() + combat.character.initiative;
        
        // Enemy Initiative
        combat.enemies.forEach(enemy => {
            enemy.initiativeRoll = this._d20() + enemy.initiative;
        });
        
        // Sortieren
        combat.turnOrder = [
            { ...combat.character, isPlayer: true },
            ...combat.enemies.map(e => ({ ...e, isPlayer: false }))
        ].sort((a, b) => b.initiativeRoll - a.initiativeRoll);
        
        combat.log.push({
            type: 'initiative',
            message: 'Initiative wird gewürfelt...',
            details: combat.turnOrder.map(t => `${t.name}: ${t.initiativeRoll}`).join(', ')
        });
    },
    
    /**
     * Führt den Kampf aus
     * @private
     */
    _executeCombat() {
        const combat = this.currentCombat;
        
        while (combat.round <= this.CONFIG.MAX_ROUNDS) {
            combat.log.push({
                type: 'round',
                message: `Runde ${combat.round}`
            });
            
            // Jeder Combatant agiert
            for (const combatant of combat.turnOrder) {
                if (combatant.isPlayer) {
                    this._playerTurn(combatant);
                } else {
                    this._enemyTurn(combatant);
                }
                
                // Prüfe Kampf-Ende
                if (this._checkCombatEnd()) {
                    return this._generateResult();
                }
            }
            
            combat.round++;
        }
        
        // Max Rounds erreicht - Unentschieden/Flucht
        return this._generateResult('draw');
    },
    
    /**
     * Spieler-Zug
     * @private
     */
    _playerTurn(player) {
        if (player.hp.current <= 0) return;
        
        // Ziel wählen (niedrigste HP)
        const target = this._selectTarget();
        if (!target) return;
        
        // Angriff würfeln
        const attackRoll = this._d20();
        const attackTotal = attackRoll + player.attack;
        
        // Kritischer Treffer?
        const isCritical = attackRoll === this.CONFIG.CRITICAL_HIT_THRESHOLD;
        
        // Treffer?
        const hits = isCritical || attackTotal >= target.defense;
        
        if (hits) {
            // Schaden berechnen
            const damage = this._calculateDamage(player.damage, isCritical);
            target.hp.current -= damage;
            
            this.currentCombat.log.push({
                type: 'attack',
                attacker: player.name,
                target: target.name,
                hit: true,
                critical: isCritical,
                damage: damage,
                message: isCritical 
                    ? `Kritischer Treffer! ${player.name} trifft ${target.name} für ${damage} Schaden!`
                    : `${player.name} trifft ${target.name} für ${damage} Schaden.`
            });
            
            // Ziel besiegt?
            if (target.hp.current <= 0) {
                this.currentCombat.log.push({
                    type: 'defeat',
                    message: `${target.name} wurde besiegt!`
                });
            }
        } else {
            this.currentCombat.log.push({
                type: 'attack',
                attacker: player.name,
                target: target.name,
                hit: false,
                message: `${player.name} verfehlt ${target.name}.`
            });
        }
    },
    
    /**
     * Gegner-Zug
     * @private
     */
    _enemyTurn(enemy) {
        if (enemy.hp.current <= 0) return;
        
        const player = this.currentCombat.character;
        
        // Angriff würfeln
        const attackRoll = this._d20();
        const attackTotal = attackRoll + enemy.attack;
        
        const isCritical = attackRoll === this.CONFIG.CRITICAL_HIT_THRESHOLD;
        const hits = isCritical || attackTotal >= player.defense;
        
        if (hits) {
            const damage = this._calculateDamage(enemy.damage, isCritical);
            player.hp.current -= damage;
            
            this.currentCombat.log.push({
                type: 'attack',
                attacker: enemy.name,
                target: player.name,
                hit: true,
                critical: isCritical,
                damage: damage,
                message: isCritical
                    ? `Kritischer Treffer! ${enemy.name} trifft dich für ${damage} Schaden!`
                    : `${enemy.name} trifft dich für ${damage} Schaden.`
            });
        } else {
            this.currentCombat.log.push({
                type: 'attack',
                attacker: enemy.name,
                target: player.name,
                hit: false,
                message: `${enemy.name} verfehlt dich.`
            });
        }
    },
    
    /**
     * Wählt ein Ziel (niedrigste HP)
     * @private
     */
    _selectTarget() {
        const aliveEnemies = this.currentCombat.enemies.filter(e => e.hp.current > 0);
        if (aliveEnemies.length === 0) return null;
        
        return aliveEnemies.sort((a, b) => a.hp.current - b.hp.current)[0];
    },
    
    /**
     * Prüft ob Kampf beendet ist
     * @private
     */
    _checkCombatEnd() {
        const player = this.currentCombat.character;
        const aliveEnemies = this.currentCombat.enemies.filter(e => e.hp.current > 0);
        
        // Spieler besiegt
        if (player.hp.current <= 0) return true;
        
        // Alle Gegner besiegt
        if (aliveEnemies.length === 0) return true;
        
        return false;
    },
    
    /**
     * Generiert Kampf-Ergebnis
     * @private
     */
    _generateResult(forcedResult = null) {
        const combat = this.currentCombat;
        const player = combat.character;
        const aliveEnemies = combat.enemies.filter(e => e.hp.current > 0);
        
        let result;
        
        if (forcedResult === 'draw') {
            result = {
                victory: false,
                draw: true,
                message: 'Der Kampf endet unentschieden. Ihr zieht euch zurück.',
                hpRemaining: player.hp.current,
                hpMax: player.hp.max,
                xpGained: 0
            };
        } else if (player.hp.current <= 0) {
            result = {
                victory: false,
                defeat: true,
                message: 'Ihr wurdet besiegt! Die Gegner plündern euch aus und lassen euch liegen.',
                hpRemaining: 0,
                hpMax: player.hp.max,
                xpGained: Math.floor(combat.enemies.reduce((sum, e) => sum + e.xp, 0) * 0.1),
                consequences: ['hp_1', 'gold_loss']
            };
        } else {
            const totalXP = combat.enemies
                .filter(e => e.hp.current <= 0)
                .reduce((sum, e) => sum + e.xp, 0);
            
            result = {
                victory: true,
                message: `Sieg! Ihr habt alle Gegner besiegt.`,
                hpRemaining: player.hp.current,
                hpMax: player.hp.max,
                enemiesDefeated: combat.enemies.filter(e => e.hp.current <= 0).length,
                xpGained: totalXP,
                loot: this._generateLoot(combat.enemies)
            };
        }
        
        result.log = combat.log;
        result.rounds = combat.round;
        result.duration = Date.now() - combat.startTime;
        
        combat.result = result;
        return result;
    },
    
    /**
     * Wendet Kampf-Ergebnis auf Character an
     * @private
     */
    _applyResult(result) {
        const character = this._getCharacter();
        if (!character) return;
        
        // HP aktualisieren
        if (character.stats?.hp) {
            character.stats.hp.current = result.hpRemaining;
        }
        
        // XP hinzufügen
        if (result.xpGained > 0) {
            character.xp = (character.xp || 0) + result.xpGained;
        }
        
        // Konsequenzen anwenden
        if (result.consequences) {
            result.consequences.forEach(consequence => {
                switch (consequence) {
                    case 'hp_1':
                        character.stats.hp.current = 1;
                        break;
                    case 'gold_loss':
                        const goldLoss = Math.floor((character.stats.gold || 0) * 0.2);
                        character.stats.gold = (character.stats.gold || 0) - goldLoss;
                        break;
                }
            });
        }
        
        // Speichern
        if (typeof StateManager !== 'undefined') {
            StateManager.updateCharacter({ stats: character.stats, xp: character.xp });
        }
        
        // Event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('combat:ended', result);
        }
    },
    
    /**
     * Generiert Loot
     * @private
     */
    _generateLoot(enemies) {
        const loot = [];
        
        enemies.forEach(enemy => {
            if (enemy.hp.current <= 0) {
                // Basis-Loot
                const copper = Math.floor(Math.random() * 20) + 5;
                loot.push({ type: 'copper', amount: copper });
                
                // Elite/Boss Bonus
                if (enemy.elite || enemy.boss) {
                    const silver = Math.floor(Math.random() * 5) + 1;
                    loot.push({ type: 'silver', amount: silver });
                }
            }
        });
        
        return loot;
    },
    
    // === HILFSMETHODEN ===
    
    /**
     * Würfelt d20
     * @private
     */
    _d20() {
        return Math.floor(Math.random() * 20) + 1;
    },
    
    /**
     * Berechnet Schaden
     * @private
     */
    _calculateDamage(damage, critical = false) {
        let baseDamage = 0;
        
        if (damage.dice.includes('W')) {
            const [count, sides] = damage.dice.split('W').map(Number);
            for (let i = 0; i < count; i++) {
                baseDamage += Math.floor(Math.random() * sides) + 1;
            }
        }
        
        baseDamage += damage.bonus || 0;
        
        // Kritischer Treffer = doppelter Schaden
        if (critical) {
            baseDamage *= 2;
        }
        
        return Math.max(1, baseDamage);
    },
    
    /**
     * Gibt den aktuellen Character zurück
     * @private
     */
    _getCharacter() {
        if (typeof StateManager !== 'undefined') {
            return StateManager.getCharacter();
        }
        return window.currentCharacter || null;
    },
    
    // === UI ===
    
    /**
     * Rendert Kampf-Ergebnis
     * @param {Object} result - Das Kampf-Ergebnis
     */
    renderResult(result) {
        let container = document.getElementById('combat-result-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'combat-result-container';
            container.className = 'combat-result-container';
            document.body.appendChild(container);
        }
        
        const victoryClass = result.victory ? 'victory' : result.draw ? 'draw' : 'defeat';
        const title = result.victory ? '⚔️ Sieg!' : result.draw ? '⏸️ Unentschieden' : '💀 Niederlage';
        
        container.innerHTML = `
            <div class="combat-result-overlay">
                <div class="combat-result-box ${victoryClass}">
                    <h2>${title}</h2>
                    
                    <div class="combat-summary">
                        <p>${result.message}</p>
                        
                        <div class="combat-stats">
                            <div class="stat">
                                <span class="label">Runden:</span>
                                <span class="value">${result.rounds}</span>
                            </div>
                            <div class="stat">
                                <span class="label">HP:</span>
                                <span class="value">${result.hpRemaining}/${result.hpMax}</span>
                            </div>
                            ${result.enemiesDefeated !== undefined ? `
                            <div class="stat">
                                <span class="label">Besiegt:</span>
                                <span class="value">${result.enemiesDefeated}</span>
                            </div>
                            ` : ''}
                            <div class="stat">
                                <span class="label">XP:</span>
                                <span class="value">+${result.xpGained}</span>
                            </div>
                        </div>
                        
                        ${result.loot?.length ? `
                        <div class="combat-loot">
                            <h4>Beute:</h4>
                            ${result.loot.map(item => `
                                <span class="loot-item">${item.amount} ${item.type}</span>
                            `).join(', ')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <button class="combat-close-btn" onclick="this.closest('.combat-result-container').remove()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }
};

// Global verfügbar machen
window.FastCombatSystem = FastCombatSystem;
