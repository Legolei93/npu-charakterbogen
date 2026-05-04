import { simulateEvent, processGameEvent, dispatchEvent } from "../core/event-system.js";

console.log('[QuestBoardUI] Script wird geladen...');

/**
 * Quest Board UI v4.0 - Spieler Quest-Seite
 * 
 * Features:
 * - 6 Quests anzeigen
 * - Maximal 3 auswählbar/startbar
 * - Quest-Details mit Objectives
 * - Fortschrittsanzeige
 * - Training Integration
 * - Completion + Claim
 */

const QuestBoardUI = {
    
    // === STATE ===
    maxSelections: 3,
    
    // === INITIALISIERUNG ===
    
    init() {
        console.log('[QuestBoardUI] Initialisiert');
        this.render();
        
        // Zentraler UI-Listener: reagiert auf ALLE Quest-Änderungen
        if (typeof EventBus !== 'undefined') {
            EventBus.on('quest:updated', () => this.render());
            EventBus.on('quest:feedback', (data) => this._showFeedbackToast(data));
            
            // === LOGOUT HANDLER (KRITISCH) ===
            if (!this._logoutListenerAttached) {
                EventBus.on('state:cleared', () => {
                    console.log('[QuestBoardUI] UI Reset durch Logout');
                    
                    var container = document.getElementById('quest-board-container');
                    if (container) {
                        container.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">' +
                            '<p>👤 Bitte einloggen, um Quests zu sehen.</p>' +
                        '</div>';
                    }
                });
                this._logoutListenerAttached = true;
            }
        }
    },
    
    // === RENDERING ===
    
    render() {
        var container = document.getElementById('quest-board-container');
        if (!container) {
            console.error('[QuestBoardUI] Container nicht gefunden');
            return;
        }
        
        var questEngine = window.QuestEngine;
        if (!questEngine) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Quest-System wird geladen...</p>';
            return;
        }
        
        // Daten über Public API sammeln (UI Contract)
        var boardQuests = questEngine.getAvailableQuests();
        var activeQuests = questEngine.getActiveQuests();
        var completedQuests = questEngine.getCompletedQuests();
        var trainingQuest = questEngine.getTrainingQuest();
        
        // HTML aufbauen
        var html = '<div class="quest-board-v4">';
        
        // Header
        html += this._renderHeader(activeQuests.length, completedQuests.length);
        
        // Weltzustand (World State)
        html += this._renderWorldStateSection();
        
        // Aktive Storylines / Chains
        html += this._renderChainsSection();
        
        // Aktive Quests (oben anzeigen wenn vorhanden)
        if (activeQuests.length > 0) {
            html += this._renderActiveSection(activeQuests);
        }
        
        // Quest Board
        html += this._renderBoardSection(boardQuests, activeQuests.length);
        
        // Training
        html += this._renderTrainingSection(trainingQuest);
        
        // Abgeschlossene Quests (heute)
        if (completedQuests.length > 0) {
            html += this._renderCompletedSection(completedQuests);
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        // Event Listener binden
        this._attachEventListeners(container);
    },
    
    _renderHeader: function(activeCount, completedCount) {
        var totalProgress = completedCount;
        var progressPercent = Math.min(100, (totalProgress / this.maxSelections) * 100);
        
        return '<div class="quest-board-header" style="text-align:center;padding:20px 0;border-bottom:1px solid #333;margin-bottom:20px;">' +
            '<h2 style="color:#d4af37;margin:0 0 8px 0;">Quest Board</h2>' +
            '<p style="color:#888;margin:0 0 12px 0;">Aktiv: ' + activeCount + '/' + this.maxSelections + ' | Abgeschlossen heute: ' + completedCount + '</p>' +
            '<div style="background:#222;border-radius:4px;height:8px;max-width:300px;margin:0 auto;">' +
                '<div style="background:#4ecca3;height:100%;border-radius:4px;width:' + progressPercent + '%;transition:width 0.3s;"></div>' +
            '</div>' +
        '</div>';
    },
    
    _renderWorldStateSection: function() {
        if (!window.QuestEngine || !window.QuestEngine.state.worldState) return '';
        
        var ws = window.QuestEngine.state.worldState;
        var karma = ws.karma || 0;
        var factions = ws.factions || {};
        
        // Karma-Farbe basierend auf Wert
        var karmaColor = karma > 20 ? '#4ecca3' : karma < -20 ? '#e74c3c' : '#888';
        var karmaIcon = karma > 20 ? '&#128155;' : karma < -20 ? '&#128148;' : '&#128280;';
        
        var html = '<div class="world-state-section" style="margin-bottom:20px;padding:14px;background:rgba(0,0,0,0.25);border:1px solid #333;border-radius:10px;">' +
            '<h3 style="color:#8af;margin:0 0 10px 0;font-size:0.95em;">&#127758; Weltzustand</h3>' +
            '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">' +
                // Karma
                '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<span style="font-size:1.1em;">' + karmaIcon + '</span>' +
                    '<span style="color:' + karmaColor + ';font-weight:bold;font-size:0.9em;">Karma: ' + (karma > 0 ? '+' : '') + karma + '</span>' +
                '</div>';
        
        // Factions (nur die mit Wert != 0)
        var factionNames = {
            village: 'Dorf',
            bandits: 'Banditen',
            kira: 'Kira',
            church: 'Kirche',
            karl: 'Karl',
            taro: 'Taro',
            yuki: 'Yuki',
            shin: 'Shin',
            blackmarket: 'Schwarzmarkt'
        };
        
        for (var key in factions) {
            var val = factions[key];
            if (val !== 0) {
                var fColor = val > 10 ? '#4ecca3' : val < -10 ? '#e74c3c' : '#888';
                var fIcon = val > 0 ? '&#8593;' : '&#8595;';
                html += '<div style="display:flex;align-items:center;gap:4px;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:4px;">' +
                    '<span style="color:#666;font-size:0.75em;">' + (factionNames[key] || key) + '</span>' +
                    '<span style="color:' + fColor + ';font-size:0.8em;font-weight:bold;">' + fIcon + ' ' + Math.abs(val) + '</span>' +
                '</div>';
            }
        }
        
        // Aktive Flags (wenn vorhanden)
        var flags = ws.flags || {};
        var flagCount = Object.keys(flags).length;
        if (flagCount > 0) {
            html += '<div style="margin-left:auto;color:#666;font-size:0.7em;">' +
                '&#128204; ' + flagCount + ' Entscheidungen gespeichert' +
            '</div>';
        }
        
        html += '</div>';
        
        // === EVENT HISTORY (Phase 11) ===
        var lastEvents = ws.lastEvents || [];
        if (lastEvents.length > 0) {
            html += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;">' +
                '<p style="color:#666;font-size:0.75em;margin:0 0 6px 0;">&#128220; Jüngste Ereignisse:</p>';
            
            // Max 3 Events anzeigen
            var displayEvents = lastEvents.slice(0, 3);
            for (var i = 0; i < displayEvents.length; i++) {
                var evt = displayEvents[i];
                var timeAgo = this._formatTimeAgo(evt.timestamp);
                html += '<div style="color:#888;font-size:0.7em;margin:2px 0;padding-left:12px;border-left:2px solid #444;">' +
                    '<span style="color:#555;">' + timeAgo + '</span> — ' + (evt.cause || 'Ereignis') +
                '</div>';
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    },
    
    _renderChainsSection: function() {
        if (!window.QuestEngine) return '';
        
        var chains = window.QuestEngine.getAvailableQuestChains ? window.QuestEngine.getAvailableQuestChains() : [];
        if (!chains || chains.length === 0) return '';
        
        var activeChains = chains.filter(function(c) { return c.isActive; });
        var availableChains = chains.filter(function(c) { return !c.isActive && !c.isCompleted; });
        var completedChains = chains.filter(function(c) { return c.isCompleted; });
        
        if (activeChains.length === 0 && availableChains.length === 0 && completedChains.length === 0) return '';
        
        var html = '<div class="quest-chains-section" style="margin-bottom:24px;padding:16px;background:rgba(0,0,0,0.2);border:1px solid #444;border-radius:10px;">' +
            '<h3 style="color:#d4af37;margin:0 0 12px 0;font-size:1em;">&#128220; Storylines</h3>';
        
        // Aktive Chains
        for (var i = 0; i < activeChains.length; i++) {
            var chain = activeChains[i];
            var chainInstance = window.QuestEngine.state.activeQuestChains.find(function(c) { return c.id === chain.id; });
            var progress = chainInstance ? (chainInstance.currentQuestIndex + 1) : 1;
            var total = chain.quests ? Math.max.apply(null, chain.quests.map(function(q) { return q.index; })) + 1 : progress;
            var percent = Math.floor((progress / total) * 100);
            var branchLabel = chainInstance && chainInstance.branchTaken ? ' [' + chainInstance.branchTaken + ']' : '';
            
            html += '<div style="margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:6px;border-left:3px solid #d4af37;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                    '<span style="color:#fff;font-weight:bold;font-size:0.9em;">' + (chain.icon || '') + ' ' + chain.name + branchLabel + '</span>' +
                    '<span style="color:#d4af37;font-size:0.75em;">Schritt ' + progress + '/' + total + '</span>' +
                '</div>' +
                '<div style="background:#333;border-radius:3px;height:4px;">' +
                    '<div style="background:#d4af37;height:100%;border-radius:3px;width:' + percent + '%;"></div>' +
                '</div>' +
                '<p style="color:#888;font-size:0.75em;margin:4px 0 0 0;">' + chain.description + '</p>' +
            '</div>';
        }
        
        // Verfügbare Chains zum Starten
        for (var j = 0; j < availableChains.length; j++) {
            var avail = availableChains[j];
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(78,204,163,0.05);border:1px dashed #4ecca3;border-radius:6px;margin-bottom:8px;">' +
                '<div>' +
                    '<span style="color:#fff;font-weight:bold;font-size:0.85em;">' + (avail.icon || '') + ' ' + avail.name + '</span>' +
                    '<p style="color:#888;font-size:0.75em;margin:2px 0 0 0;">' + avail.description + '</p>' +
                '</div>' +
                '<button class="chain-start-btn" data-chain-id="' + avail.id + '" style="background:#4ecca3;color:#000;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:0.8em;white-space:nowrap;">Starten</button>' +
            '</div>';
        }
        
        // Abgeschlossene Chains (nur 1 Zeile)
        if (completedChains.length > 0) {
            html += '<div style="margin-top:8px;">' +
                '<span style="color:#888;font-size:0.75em;">Abgeschlossen: ';
            var completedNames = [];
            for (var k = 0; k < completedChains.length; k++) {
                completedNames.push(completedChains[k].name);
            }
            html += completedNames.join(', ');
            html += '</span></div>';
        }
        
        html += '</div>';
        return html;
    },
    
    _renderActiveSection: function(activeQuests) {
        var html = '<div class="quest-active-section" style="margin-bottom:24px;">' +
            '<h3 style="color:#4ecca3;margin-bottom:12px;">Aktive Quests</h3>' +
            '<div style="display:grid;gap:12px;">';
        
        for (var i = 0; i < activeQuests.length; i++) {
            var quest = activeQuests[i];
            html += this._renderActiveQuestCard(quest);
        }
        
        html += '</div></div>';
        return html;
    },
    
    _renderActiveQuestCard: function(quest) {
        // Objectives Fortschritt berechnen
        var totalObj = quest.objectives ? quest.objectives.length : 0;
        var completedObj = 0;
        var objectivesHtml = '';
        
        // === DECISION BLOCKING CHECK ===
        var isDecisionBlocked = quest.decisions && quest.decisions.length > 0 && !quest.decisionMade;
        
        if (quest.objectives) {
            for (var i = 0; i < quest.objectives.length; i++) {
                var obj = quest.objectives[i];
                if (obj.completed) completedObj++;
                var icon = obj.completed ? '&#10004;' : '&#9744;';
                var color = obj.completed ? '#4ecca3' : '#ccc';
                var progressText = '';
                if (obj.target && obj.target > 1) {
                    progressText = ' (' + (obj.current || 0) + '/' + obj.target + ')';
                }
                
                // Action Button für nicht-abgeschlossene Objectives
                var actionBtn = '';
                if (!obj.completed) {
                    if (isDecisionBlocked) {
                        // Button disabled wenn Decision offen
                        actionBtn = '<button disabled style="background:#333;color:#666;border:1px solid #444;padding:3px 8px;border-radius:3px;font-size:0.75em;margin-left:8px;cursor:not-allowed;" title="Erst Entscheidung treffen">&#128274; Gesperrt</button>';
                    } else {
                        actionBtn = this._getObjectiveActionButton(obj, quest.id);
                    }
                }
                
                // Flavor/Location Zeile (nur wenn nicht abgeschlossen)
                var flavorHtml = '';
                if (!obj.completed && obj.context) {
                    if (obj.context.flavor) {
                        flavorHtml = '<div style="color:#666;font-size:0.75em;font-style:italic;padding:2px 0 2px 20px;">' + obj.context.flavor + '</div>';
                    }
                }
                
                objectivesHtml += '<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;">' +
                        '<span style="color:' + color + ';font-size:0.85em;">' + icon + ' ' + (obj.text || obj.id) + progressText + '</span>' +
                        actionBtn +
                    '</div>' +
                    flavorHtml +
                '</div>';
            }
        }
        
        var isReady = quest.status === 'ready_for_turn_in';
        var borderColor = isReady ? '#d4af37' : '#4ecca3';
        var statusText = isReady ? '&#9733; Bereit zum Abgeben!' : 'In Bearbeitung (' + completedObj + '/' + totalObj + ')';
        
        // Chain Badge
        var chainBadge = '';
        if (quest.chainId) {
            var chainInfo = '';
            if (quest.chainTotal) {
                chainInfo = ' (' + (quest.chainIndex + 1) + '/' + quest.chainTotal + ')';
            }
            chainBadge = '<div style="margin-bottom:6px;"><span style="background:rgba(212,175,55,0.15);color:#d4af37;border:1px solid #d4af37;border-radius:4px;padding:2px 8px;font-size:0.7em;font-weight:bold;">&#128220; Storyline' + chainInfo + '</span></div>';
        }
        
        var buttonsHtml = '';
        if (isReady) {
            buttonsHtml = '<button class="quest-claim-btn" data-quest-id="' + quest.id + '" style="background:#d4af37;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:0.95em;">&#127873; Belohnung abholen</button>';
        } else {
            buttonsHtml = '<button class="quest-abandon-btn" data-quest-id="' + quest.id + '" style="background:transparent;color:#e74c3c;border:1px solid #e74c3c;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:0.75em;">Abbrechen</button>';
        }
        
        // Decision-Bereich (Phase 4)
        var decisionHtml = '';
        if (quest.decisions && quest.decisions.length > 0 && !quest.decisionMade) {
            decisionHtml = '<div id="decision-section-' + quest.id + '" style="margin:10px 0;padding:12px;background:rgba(148,103,189,0.1);border:1px solid #9b59b6;border-radius:6px;">' +
                '<div style="color:#9b59b6;font-size:0.7em;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">&#9878; Entscheidung erforderlich</div>';
            for (var d = 0; d < quest.decisions.length; d++) {
                var dec = quest.decisions[d];
                var effectHint = '';
                if (dec.effects) {
                    if (dec.effects.karma > 0) effectHint = ' <span style="color:#4ecca3;font-size:0.75em;">(Karma +' + dec.effects.karma + ')</span>';
                    else if (dec.effects.karma < 0) effectHint = ' <span style="color:#e74c3c;font-size:0.75em;">(Karma ' + dec.effects.karma + ')</span>';
                }
                
                // === DECISION INTENSITY VISUAL (Phase 12) ===
                var intensityStyle = '';
                var intensityIcon = '&#9654;';
                if (dec.intensity === 'high') {
                    intensityStyle = 'background:#3a1a1a;border-color:#e74c3c;color:#fff;';
                    intensityIcon = '&#128148;'; // broken heart
                } else if (dec.intensity === 'medium') {
                    intensityStyle = 'background:#2a2a3a;border-color:#9b59b6;';
                    intensityIcon = '&#9889;'; // lightning
                }
                
                decisionHtml += '<button class="quest-decision-btn" data-quest-id="' + quest.id + '" data-decision-id="' + dec.id + '" style="display:block;width:100%;text-align:left;background:#2a2a4a;color:#ddd;border:1px solid #9b59b6;padding:8px 12px;border-radius:4px;cursor:pointer;margin-bottom:6px;font-size:0.85em;' + intensityStyle + '">' +
                    intensityIcon + ' ' + dec.text + effectHint +
                '</button>';
            }
            decisionHtml += '</div>';
        } else if (quest.decisionMade && quest.decisions) {
            var chosen = quest.decisions.find(function(d) { return d.id === quest.decisionMade; });
            if (chosen) {
                decisionHtml = '<div style="margin:10px 0;padding:8px;background:rgba(78,204,163,0.05);border-left:3px solid #4ecca3;border-radius:4px;">' +
                    '<span style="color:#4ecca3;font-size:0.8em;">&#10004; Entscheidung: ' + chosen.text + '</span>' +
                '</div>';
            }
        }
        
        // === DECISION BLOCKING WARNING ===
        var blockingWarningHtml = '';
        if (isDecisionBlocked) {
            blockingWarningHtml = '<div style="margin:10px 0;padding:10px;background:rgba(231,76,60,0.1);border:1px solid #e74c3c;border-radius:6px;display:flex;align-items:center;gap:8px;">' +
                '<span style="font-size:1.2em;">&#9888;</span>' +
                '<span style="color:#e74c3c;font-size:0.85em;">Du musst zuerst eine <strong>Entscheidung treffen</strong>, bevor du fortfahren kannst.</span>' +
            '</div>';
        }
        
        return '<div style="background:rgba(0,0,0,0.4);border:1px solid ' + borderColor + ';border-radius:10px;padding:16px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<h4 style="color:#fff;margin:0;font-size:1em;">' + quest.title + '</h4>' +
                '<span style="color:' + borderColor + ';font-size:0.75em;font-weight:bold;">' + statusText + '</span>' +
            '</div>' +
            chainBadge +
            '<p style="color:#aaa;font-size:0.82em;margin:0 0 10px 0;font-style:italic;">' + quest.description + '</p>' +
            // === DECISION ZUERST (wenn offen) ===
            decisionHtml +
            blockingWarningHtml +
            // === OBJECTIVES DANACH (disabled wenn Decision offen) ===
            (totalObj > 0 ? '<div style="margin:8px 0;padding:10px;background:rgba(0,0,0,0.3);border-radius:6px;' + (isDecisionBlocked ? 'opacity:0.5;' : '') + '">' +
                '<div style="color:#666;font-size:0.7em;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Ziele</div>' +
                objectivesHtml +
            '</div>' : '') +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">' +
                '<span style="color:#4ecca3;font-size:0.85em;">Belohnung: ' + (quest.rewards && quest.rewards.xp || 0) + ' XP</span>' +
                buttonsHtml +
            '</div>' +
        '</div>';
    },
    
    /**
     * Generiert Action-Buttons als narrative Entscheidungen
     */
    _getObjectiveActionButton: function(objective, questId) {
        var trigger = objective.trigger || objective.type || '';
        var location = objective.context && objective.context.location || objective.target || '';
        
        var btnStyle = 'background:#2a2a4a;color:#8af;border:1px solid #446;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;margin:4px 4px 4px 0;white-space:nowrap;display:inline-block;';
        var btnStyleRisk = 'background:#4a2a2a;color:#e74c3c;border:1px solid #e74c3c;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;margin:4px 4px 4px 0;white-space:nowrap;display:inline-block;';
        var btnStyleSafe = 'background:#2a4a2a;color:#4ecca3;border:1px solid #4ecca3;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.8em;margin:4px 4px 4px 0;white-space:nowrap;display:inline-block;';
        
        switch (trigger) {
            case 'exploration':
            case 'travel':
            case 'discover':
                return '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="exploration_fast" data-quest-id="' + questId + '" data-location="' + location + '">&#127795; Schnell vorstoßen</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="exploration_safe" data-quest-id="' + questId + '" data-location="' + location + '">&#128064; Vorsichtig erkunden</button>';
            
            case 'investigate':
                return '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="investigate_thorough" data-quest-id="' + questId + '" data-target="' + objective.target + '">&#128269; Gründlich untersuchen</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="investigate_quick" data-quest-id="' + questId + '" data-target="' + objective.target + '">&#9201; Schnell prüfen</button>';
            
            case 'combat_won':
            case 'combat':
                return '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="combat_aggressive" data-quest-id="' + questId + '">&#9876; Aggressiv angreifen</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="combat_tactical" data-quest-id="' + questId + '">&#129504; Taktisch vorgehen</button>';
            
            case 'item_collected':
            case 'collect':
                return '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="collect_search" data-quest-id="' + questId + '">&#128300; Alles durchsuchen</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="collect_focus" data-quest-id="' + questId + '">&#127919; Zielgerichtet suchen</button>';
            
            case 'talk':
                return '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="talk_charm" data-quest-id="' + questId + '">&#128150; Charmant überzeugen</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="talk_intimidate" data-quest-id="' + questId + '">&#128520; Einschüchtern</button>';
            
            case 'deliver':
                return '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="deliver_safe" data-quest-id="' + questId + '">&#128666; Sicherer Weg</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="deliver_fast" data-quest-id="' + questId + '">&#128168; Schnelle Lieferung</button>';
            
            case 'merchant_trade':
            case 'trade':
                return '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="trade_fair" data-quest-id="' + questId + '">&#9878; Fair handeln</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="trade_haggle" data-quest-id="' + questId + '">&#129297; Hart feilschen</button>';
            
            case 'training_completed':
                return '<button class="quest-action-btn" style="' + btnStyleRisk + '" data-action="training_intense" data-quest-id="' + questId + '">&#127947; Intensives Training</button>' +
                       '<button class="quest-action-btn" style="' + btnStyleSafe + '" data-action="training_balanced" data-quest-id="' + questId + '">&#129336; Ausgewogen üben</button>';
            
            default:
                if (trigger) {
                    return '<button class="quest-action-btn" style="' + btnStyle + '" data-action="' + trigger + '" data-quest-id="' + questId + '">&#9654; Handeln</button>';
                }
                return '';
        }
    },
    
    /**
     * Rendert einen Story Moment
     */
    _renderStoryMoment: function(text) {
        if (!text) return '';
        return '<div class="story-moment" style="margin:10px 0;padding:12px;background:rgba(139,90,43,0.15);border-left:3px solid #d4af37;border-radius:4px;font-style:italic;color:#d4af37;font-size:0.9em;animation:fadeIn 0.5s;">' +
            '&#128220; ' + text +
        '</div>';
    },
    
    _renderBoardSection: function(boardQuests, activeCount) {
        var canStart = activeCount < this.maxSelections;
        
        var html = '<div class="quest-board-section" style="margin-bottom:24px;">' +
            '<h3 style="color:#d4af37;margin-bottom:12px;">Verfügbare Quests (' + boardQuests.length + ')</h3>';
        
        if (boardQuests.length === 0) {
            html += '<p style="color:#666;text-align:center;padding:20px;">Keine Quests verfügbar. Neue Quests um Mitternacht!</p>';
        } else {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">';
            for (var i = 0; i < boardQuests.length; i++) {
                html += this._renderBoardQuestCard(boardQuests[i], canStart);
            }
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    },
    
    _renderBoardQuestCard: function(quest, canStart) {
        var diffColors = { easy: '#4ecca3', medium: '#f1c40f', hard: '#e67e22', very_hard: '#e74c3c' };
        var diffLabels = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer', very_hard: 'Sehr Schwer' };
        var typeIcons = { story: '&#128214;', merchant: '&#9878;', investigation: '&#128269;', moral: '&#9878;', combat: '&#9876;', daily: '&#128197;', exploration: '&#127757;', elite: '&#128081;', blackmarket: '&#127761;' };
        
        var diffColor = diffColors[quest.difficulty] || '#888';
        var diffLabel = diffLabels[quest.difficulty] || quest.difficulty;
        var typeIcon = typeIcons[quest.category] || '&#128220;';
        
        // Chain Badge
        var chainBadge = '';
        if (quest.chainId) {
            var chainInfo = '';
            if (quest.chainTotal) {
                chainInfo = ' ' + (quest.chainIndex + 1) + '/' + quest.chainTotal;
            }
            chainBadge = '<div style="margin-bottom:4px;"><span style="background:rgba(212,175,55,0.15);color:#d4af37;border:1px solid #d4af37;border-radius:4px;padding:2px 6px;font-size:0.65em;font-weight:bold;">&#128220; Storyline' + chainInfo + '</span></div>';
        }
        
        // === NPC REACTION BADGE (Phase 9) ===
        var reactionBadge = '';
        if (quest.giver && window.QuestEngine) {
            var reaction = window.QuestEngine.getNpcReaction(quest.giver);
            var reactionColors = {
                hostile: '#e74c3c',
                neutral: '#888',
                friendly: '#4ecca3'
            };
            var reactionIcons = {
                hostile: '&#128545;',
                neutral: '&#128528;',
                friendly: '&#128522;'
            };
            reactionBadge = '<div style="margin-bottom:4px;"><span style="background:rgba(0,0,0,0.3);color:' + reactionColors[reaction] + ';border:1px solid ' + reactionColors[reaction] + ';border-radius:4px;padding:2px 6px;font-size:0.65em;font-weight:bold;">' + reactionIcons[reaction] + ' ' + quest.giver.name + '</span></div>';
        }
        
        var buttonHtml = '';
        if (canStart) {
            buttonHtml = '<button class="quest-start-btn" data-quest-id="' + quest.id + '" style="background:#4ecca3;color:#000;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:bold;">Starten</button>';
        } else {
            buttonHtml = '<button disabled style="background:#333;color:#666;border:1px solid #444;padding:6px 14px;border-radius:4px;">Max erreicht</button>';
        }
        
        var rewardsHtml = '<span style="color:#4ecca3;">XP: ' + (quest.rewards && quest.rewards.xp || 5) + '</span>';
        if (quest.rewards && quest.rewards.silver) rewardsHtml += ' <span style="color:#c0c0c0;">Ag: ' + quest.rewards.silver + '</span>';
        if (quest.rewards && quest.rewards.gold) rewardsHtml += ' <span style="color:#d4af37;">Au: ' + quest.rewards.gold + '</span>';
        
        var objectiveCount = quest.objectives ? quest.objectives.length : 0;
        
        return '<div style="background:rgba(0,0,0,0.3);border:1px solid #444;border-radius:8px;padding:16px;border-left:3px solid ' + diffColor + ';">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="font-size:1.2em;">' + typeIcon + '</span>' +
                '<span style="color:' + diffColor + ';font-size:0.75em;font-weight:bold;">' + diffLabel + '</span>' +
            '</div>' +
            chainBadge +
            reactionBadge +
            '<h4 style="color:#fff;margin:0 0 6px 0;font-size:0.95em;">' + quest.title + '</h4>' +
            '<p style="color:#aaa;font-size:0.8em;margin:0 0 8px 0;">' + quest.description + '</p>' +
            (quest.giver ? '<div style="color:#666;font-size:0.75em;margin-bottom:6px;">Von: ' + quest.giver.name + '</div>' : '') +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<span style="font-size:0.8em;">' + rewardsHtml + '</span>' +
                (objectiveCount > 0 ? '<span style="color:#666;font-size:0.75em;">' + objectiveCount + ' Ziele</span>' : '') +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="color:#666;font-size:0.75em;">~' + (quest.estimatedDuration || 10) + ' Min</span>' +
                buttonHtml +
            '</div>' +
        '</div>';
    },
    
    _renderTrainingSection: function(trainingQuest) {
        if (!trainingQuest) {
            return '<div style="background:rgba(0,0,0,0.2);border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">' +
                '<span style="font-size:1.5em;">&#127947;</span>' +
                '<h4 style="color:#888;margin:8px 0 4px 0;">Kein Training verfügbar</h4>' +
                '<p style="color:#666;font-size:0.85em;margin:0;">Training wird beim täglichen Reset generiert.</p>' +
            '</div>';
        }
        
        var isAvailable = trainingQuest.status === 'available';
        var borderColor = isAvailable ? '#9b59b6' : '#333';
        
        return '<div style="background:rgba(0,0,0,0.2);border:1px solid ' + borderColor + ';border-radius:8px;padding:16px;margin-bottom:24px;">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
                '<span style="font-size:1.5em;">&#127947;</span>' +
                '<div style="flex:1;">' +
                    '<h4 style="color:#9b59b6;margin:0 0 4px 0;">' + trainingQuest.title + '</h4>' +
                    '<p style="color:#aaa;font-size:0.85em;margin:0;">' + trainingQuest.description + '</p>' +
                '</div>' +
                (isAvailable ? '<button class="quest-training-btn" style="background:#9b59b6;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">Trainieren</button>' : '<span style="color:#4ecca3;">Abgeschlossen</span>') +
            '</div>' +
        '</div>';
    },
    
    _renderCompletedSection: function(completedQuests) {
        var html = '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #333;">' +
            '<h4 style="color:#888;margin-bottom:8px;">Heute abgeschlossen (' + completedQuests.length + ')</h4>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
        
        for (var i = 0; i < Math.min(completedQuests.length, 6); i++) {
            var q = completedQuests[i];
            html += '<span style="background:rgba(78,204,163,0.1);border:1px solid #4ecca3;border-radius:4px;padding:4px 8px;font-size:0.8em;color:#4ecca3;">&#10004; ' + q.title + '</span>';
        }
        
        html += '</div></div>';
        return html;
    },
    
    // === EVENT LISTENERS ===
    
    _attachEventListeners: function(container) {
        // Quest starten
        var startBtns = container.querySelectorAll('.quest-start-btn');
        for (var i = 0; i < startBtns.length; i++) {
            startBtns[i].addEventListener('click', this._onStartQuest.bind(this));
        }
        
        // Quest Belohnung abholen
        var claimBtns = container.querySelectorAll('.quest-claim-btn');
        for (var i = 0; i < claimBtns.length; i++) {
            claimBtns[i].addEventListener('click', this._onClaimQuest.bind(this));
        }
        
        // Quest abbrechen
        var abandonBtns = container.querySelectorAll('.quest-abandon-btn');
        for (var i = 0; i < abandonBtns.length; i++) {
            abandonBtns[i].addEventListener('click', this._onAbandonQuest.bind(this));
        }
        
        // Training starten
        var trainingBtn = container.querySelector('.quest-training-btn');
        if (trainingBtn) {
            trainingBtn.addEventListener('click', this._onStartTraining.bind(this));
        }
        
        // Decision Buttons
        var decisionBtns = container.querySelectorAll('.quest-decision-btn');
        for (var i = 0; i < decisionBtns.length; i++) {
            decisionBtns[i].addEventListener('click', this._onMakeDecision.bind(this));
        }
        
        // Chain Start Buttons
        var chainStartBtns = container.querySelectorAll('.chain-start-btn');
        for (var j = 0; j < chainStartBtns.length; j++) {
            chainStartBtns[j].addEventListener('click', this._onStartChain.bind(this));
        }
        
        // === ACTION BUTTONS (RPG Entscheidungen) ===
        var actionBtns = container.querySelectorAll('.quest-action-btn');
        for (var k = 0; k < actionBtns.length; k++) {
            actionBtns[k].addEventListener('click', this._onActionClick.bind(this));
        }
    },
    
    /**
     * Handler für RPG Action Buttons
     */
    _onActionClick: function(e) {
        var action = e.target.getAttribute('data-action');
        var questId = e.target.getAttribute('data-quest-id');
        var location = e.target.getAttribute('data-location');
        var target = e.target.getAttribute('data-target');
        
        if (!action || !questId || !window.QuestEngine) return;
        
        // === DECISION GUARD ===
        // Prüfe ob diese Quest eine offene Decision hat
        var quest = window.QuestEngine.state.activeQuests.find(function(q) { return q.id === questId; });
        if (quest && quest.decisions && quest.decisions.length > 0 && !quest.decisionMade) {
            // Zeige Warnung und scrolle zu Decision
            this._showFeedbackToast({
                type: 'warning',
                text: '⚖️ Treffe zuerst eine Entscheidung, bevor du handelst.'
            });
            
            // Auto-scroll zu Decision Section
            var decisionSection = document.getElementById('decision-section-' + questId);
            if (decisionSection) {
                decisionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                decisionSection.style.animation = 'pulse 1s 2';
            }
            
            return;
        }
        
        // Build data object
        var data = { questId: questId };
        if (location) data.location = location;
        if (target) data.target = target;
        
        // Show story moment before action
        var storyText = window.QuestEngine._generateStoryMoment ? 
            window.QuestEngine._generateStoryMoment(action) : null;
        if (storyText) {
            this._showStoryToast(storyText);
        }
        
        // Execute the action
        var result = window.QuestEngine.simulateEvent(action, data);
        
        console.log('[QuestBoardUI] Action executed:', action, result);
    },
    
    /**
     * Zeigt einen Story Moment als Toast
     */
    _showStoryToast: function(text) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(139,90,43,0.95);color:#d4af37;padding:16px 24px;border-radius:8px;font-style:italic;z-index:10000;max-width:400px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);animation:fadeInUp 0.5s;';
        toast.innerHTML = '&#128220; ' + text;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(function() { toast.remove(); }, 500);
        }, 3000);
    },
    
    _onStartQuest: function(e) {
        var questId = e.target.getAttribute('data-quest-id');
        
        // FIX 3: UI Silent Fail mit Feedback
        if (!questId || !window.QuestEngine) {
            console.warn('[QuestUI] QuestEngine nicht verfügbar');
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.show('error', 'Systemfehler: Quest konnte nicht gestartet werden');
            }
            return;
        }
        
        // Finde die Quest
        var quest = null;
        if (window.QuestEngine.state.questBoard) {
            quest = window.QuestEngine.state.questBoard.find(function(q) { return q.id === questId; });
        }
        if (!quest && window.QuestEngine.state.selectedDailyQuests) {
            quest = window.QuestEngine.state.selectedDailyQuests.find(function(q) { return q.id === questId; });
        }
        
        // === NPC DIALOG SCENE (Phase NEXT+++) ===
        // Wenn Quest einen Dialog hat, zeige ihn vor dem Start
        if (quest && quest.dialogue && quest.dialogue.length > 0) {
            this._startDialogueScene(quest, function() {
                // Callback nach Dialog: Starte Quest
                var result = window.QuestEngine.startQuest(questId);
                if (result.success) {
                    console.log('[QuestBoardUI] Quest gestartet nach Dialog:', result.quest.title);
                    QuestBoardUI.render();
                }
            });
            return;
        }
        
        // Standard: Direkt starten
        var result = window.QuestEngine.startQuest(questId);
        
        if (result.success) {
            console.log('[QuestBoardUI] Quest gestartet:', result.quest.title);
            this.render();
        } else {
            alert(result.message || 'Quest konnte nicht gestartet werden.');
        }
    },
    
    _onClaimQuest: function(e) {
        var questId = e.target.getAttribute('data-quest-id');
        if (!questId || !window.QuestEngine) return;
        
        var result = window.QuestEngine.completeQuest(questId);
        
        if (result.success) {
            console.log('[QuestBoardUI] Quest abgeschlossen:', result.quest.title, 'Rewards:', result.rewards);
            
            // Belohnungsanzeige
            this._showRewardNotification(result.rewards);
            this.render();
        } else {
            alert('Quest konnte nicht abgeschlossen werden.');
        }
    },
    
    _onAbandonQuest: function(e) {
        var questId = e.target.getAttribute('data-quest-id');
        if (!questId || !window.QuestEngine) return;
        
        if (confirm('Quest wirklich abbrechen? Du erhältst keine Belohnung.')) {
            window.QuestEngine.abandonQuest(questId);
            this.render();
        }
    },
    
    _onMakeDecision: function(e) {
        var questId = e.target.getAttribute('data-quest-id');
        var decisionId = e.target.getAttribute('data-decision-id');
        if (!questId || !decisionId || !window.QuestEngine) return;
        
        // === DECISION AFTERMATH UI (Phase 12.5) ===
        // Finde die Quest Card und färbe sie kurz ein
        var card = e.target.closest('.quest-card, [style*="border"]');
        if (card) {
            // Prüfe Intensity für Farbe
            var quest = window.QuestEngine.state.activeQuests.find(function(q) { return q.id === questId; });
            if (quest && quest.decisions) {
                var decision = quest.decisions.find(function(d) { return d.id === decisionId; });
                if (decision) {
                    if (decision.intensity === 'high') {
                        card.style.transition = 'all 0.3s ease';
                        card.style.borderColor = '#e74c3c';
                        card.style.boxShadow = '0 0 20px rgba(231,76,60,0.4)';
                        
                        // Nach 2 Sekunden zurücksetzen
                        setTimeout(function() {
                            card.style.borderColor = '';
                            card.style.boxShadow = '';
                        }, 2000);
                    } else if (decision.intensity === 'medium') {
                        card.style.transition = 'all 0.3s ease';
                        card.style.borderColor = '#9b59b6';
                        
                        setTimeout(function() {
                            card.style.borderColor = '';
                        }, 1500);
                    }
                }
            }
        }
        
        var result = window.QuestEngine.makeDecision(questId, decisionId);
        if (!result.success) {
            console.warn('[QuestBoardUI] Decision failed:', result.message);
        }
    },
    
    _onStartChain: function(e) {
        var chainId = e.target.getAttribute('data-chain-id');
        if (!chainId || !window.QuestEngine) return;
        
        var result = window.QuestEngine.startQuestChain(chainId);
        if (result.success) {
            console.log('[QuestBoardUI] Chain gestartet:', result.chain.name);
            this.render();
        } else {
            console.warn('[QuestBoardUI] Chain start failed:', result.message);
            alert(result.message || 'Storyline konnte nicht gestartet werden.');
        }
    },
    
    _onStartTraining: function() {
        var trainingQuest = window.QuestEngine && window.QuestEngine.state.trainingQuest;
        if (!trainingQuest) return;
        
        // Training als "abgeschlossen" markieren und XP geben
        trainingQuest.status = 'completed';
        trainingQuest.completedAt = new Date().toISOString();
        
        // Rewards anwenden
        var character = window.currentCharacter;
        if (character && trainingQuest.rewards) {
            character.xp = (character.xp || 0) + (trainingQuest.rewards.xp || 0);
            
            if (typeof StateManager !== 'undefined') {
                StateManager.updateCharacter(character);
            }
        }
        
        // Event für Quest-Progress-Tracking
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('training:completed', { type: trainingQuest.templateId });
        }
        
        window.QuestEngine.StateManager.saveState();
        
        this._showRewardNotification(trainingQuest.rewards || { xp: 10 });
        this.render();
    },
    
    _showRewardNotification: function(rewards) {
        var msg = 'Belohnung erhalten: ';
        var parts = [];
        if (rewards.xp) parts.push('+' + rewards.xp + ' XP');
        if (rewards.gold) parts.push('+' + rewards.gold + ' Gold');
        if (rewards.silver) parts.push('+' + rewards.silver + ' Silber');
        if (rewards.karma) parts.push((rewards.karma > 0 ? '+' : '') + rewards.karma + ' Karma');
        msg += parts.join(', ');
        
        this._showToast(msg, '#4ecca3', '#1a1a2e');
    },
    
    _showFeedbackToast: function(data) {
        var message = '';
        var color = '#8af';
        var bg = '#1a1a2e';
        
        switch (data.type) {
            case 'progress':
                if (data.questCompleted) {
                    message = '⭐ Alle Ziele erfüllt! Belohnung bereit.';
                    color = '#d4af37';
                } else if (data.objectiveCompleted) {
                    message = '✔ ' + data.text + ' abgeschlossen!';
                    color = '#4ecca3';
                } else {
                    // Flavor-Text anzeigen wenn vorhanden
                    var flavorLine = data.flavor ? data.flavor : data.text;
                    message = flavorLine + ' (' + data.current + '/' + data.target + ')';
                    color = '#8af';
                }
                break;
            case 'quest_started':
                message = '📜 Quest gestartet: ' + data.title;
                color = '#4ecca3';
                break;
            case 'quest_completed':
                message = data.outcome
                    ? '🎉 ' + data.outcome
                    : '🎉 Quest abgeschlossen: ' + data.title;
                color = '#d4af37';
                break;
            case 'decision_made':
                message = '⚖ Entscheidung: ' + data.decision;
                color = '#9b59b6';
                break;
            case 'chain_completed':
                message = '&#127942; Storyline abgeschlossen: ' + data.name;
                color = '#d4af37';
                break;
            case 'story_event':
                message = data.text;
                color = '#9b59b6';
                // High intensity → rot, Medium → lila
                if (data.intensity === 'high') {
                    color = '#e74c3c';
                    bg = '#2a1a1a';
                } else if (data.intensity === 'medium') {
                    color = '#9b59b6';
                    bg = '#1a1a2e';
                }
                break;
            case 'world_reacts':
                message = data.text;
                color = '#e74c3c';
                bg = '#2a1a1a';
                break;
            default:
                return;
        }
        
        this._showToast(message, color, bg);
    },
    
    _showToast: function(message, color, bg) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:' + (bg || '#1a1a2e') + ';border:1px solid ' + (color || '#8af') + ';border-radius:8px;padding:12px 20px;color:' + (color || '#fff') + ';font-weight:bold;z-index:9999;font-size:0.9em;max-width:350px;box-shadow:0 4px 12px rgba(0,0,0,0.4);transform:translateY(20px);opacity:0;transition:all 0.3s ease;';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(function() {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
        
        // Stack: Verschiebe vorherige Toasts nach oben
        var existing = document.querySelectorAll('.quest-feedback-toast');
        for (var i = 0; i < existing.length; i++) {
            var current = parseInt(existing[i].style.bottom) || 20;
            existing[i].style.bottom = (current + 60) + 'px';
        }
        toast.className = 'quest-feedback-toast';
        
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(function() { toast.remove(); }, 400);
        }, 3000);
    },
    
    /**
     * Formatiert einen Timestamp als "vor X Minuten" etc.
     * @private
     */
    _formatTimeAgo: function(timestamp) {
        if (!timestamp) return 'unbekannt';
        
        var now = Date.now();
        var then = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
        var diff = now - then;
        
        var seconds = Math.floor(diff / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'gerade eben';
        if (minutes < 60) return 'vor ' + minutes + ' Min';
        if (hours < 24) return 'vor ' + hours + ' Std';
        if (days < 7) return 'vor ' + days + ' Tagen';
        
        return 'vor langer Zeit';
    },

    /**
     * Startet eine NPC Dialog Szene (Phase NEXT+++)
     * @private
     * @param {Object} quest - Quest mit oder ohne dialogue Array
     * @param {Function} onComplete - Callback nach Dialog-Abschluss
     */
    _startDialogueScene: function(quest, onComplete) {
        var self = this;

        // === DYNAMIC DIALOGUE GENERATION ===
        // Wenn kein Dialogue vorhanden, generiere dynamisch
        var dialogue = quest.dialogue;
        if (!dialogue || dialogue.length === 0) {
            dialogue = this._generateDynamicDialogue(quest);
        }

        if (!dialogue || dialogue.length === 0) {
            onComplete();
            return;
        }

        var currentStep = 0;

        // Erstelle Modal Container
        var modal = document.createElement('div');
        modal.id = 'dialogue-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;';

        // NPC Bild Container
        var npcContainer = document.createElement('div');
        npcContainer.className = 'dialogue-npc';
        npcContainer.style.cssText = 'margin-bottom:20px;text-align:center;';

        var npcImage = document.createElement('img');
        npcImage.id = 'dialogue-npc-image';
        npcImage.style.cssText = 'width:200px;height:200px;object-fit:cover;border-radius:50%;border:3px solid #8af;box-shadow:0 0 30px rgba(138,175,255,0.3);';
        npcContainer.appendChild(npcImage);

        // NPC Name
        var npcName = document.createElement('div');
        npcName.id = 'dialogue-npc-name';
        npcName.style.cssText = 'color:#8af;font-size:1.2em;margin-top:10px;font-weight:bold;';
        npcContainer.appendChild(npcName);

        // Dialog Box
        var dialogBox = document.createElement('div');
        dialogBox.className = 'dialogue-box';
        dialogBox.style.cssText = 'width:90%;max-width:600px;background:rgba(20,20,40,0.95);border:2px solid #8af;border-radius:10px;padding:20px;';

        // Dialog Text
        var dialogText = document.createElement('p');
        dialogText.id = 'dialogue-text';
        dialogText.style.cssText = 'color:#fff;font-size:1.1em;line-height:1.6;margin:0 0 20px 0;min-height:60px;';
        dialogBox.appendChild(dialogText);

        // Choices Container
        var choicesContainer = document.createElement('div');
        choicesContainer.id = 'dialogue-choices';
        choicesContainer.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
        dialogBox.appendChild(choicesContainer);

        // Zusammenbauen
        modal.appendChild(npcContainer);
        modal.appendChild(dialogBox);
        document.body.appendChild(modal);

        // Render Funktion
        function renderStep() {
            var step = dialogue[currentStep];
            if (!step) {
                closeDialogue();
                return;
            }

            // NPC Bild
            npcImage.src = self._getNpcImage(step.speaker, step.emotion);
            npcImage.onerror = function() {
                this.src = self._getNpcImage('default', 'neutral');
            };

            // NPC Name
            var speakerName = step.speaker ? step.speaker.charAt(0).toUpperCase() + step.speaker.slice(1) : 'Unbekannt';
            npcName.textContent = speakerName;

            // Dialog Text mit Typewriter-Effekt
            dialogText.textContent = '';
            var text = step.text || '';
            var charIndex = 0;
            var typeInterval = setInterval(function() {
                if (charIndex < text.length) {
                    dialogText.textContent += text.charAt(charIndex);
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 20);

            // Choices
            choicesContainer.innerHTML = '';
            if (step.choices && step.choices.length > 0) {
                step.choices.forEach(function(choice) {
                    var btn = document.createElement('button');
                    btn.textContent = choice.text;
                    btn.style.cssText = 'background:#2a2a4a;color:#fff;border:1px solid #8af;padding:12px 20px;border-radius:6px;cursor:pointer;font-size:1em;text-align:left;transition:all 0.2s;';
                    btn.onmouseover = function() { this.style.background = '#3a3a6a'; };
                    btn.onmouseout = function() { this.style.background = '#2a2a4a'; };
                    btn.onclick = function() {
                        clearInterval(typeInterval);
                        if (choice.next === null || choice.next === undefined) {
                            closeDialogue();
                        } else {
                            currentStep = choice.next;
                            renderStep();
                        }
                    };
                    choicesContainer.appendChild(btn);
                });
            } else if (step.next !== undefined && step.next !== null) {
                // Auto-Weiter wenn keine Choices
                setTimeout(function() {
                    currentStep = step.next;
                    renderStep();
                }, 2000);
            } else {
                // Ende
                var continueBtn = document.createElement('button');
                continueBtn.textContent = 'Weiter...';
                continueBtn.style.cssText = 'background:#8af;color:#000;border:none;padding:12px 20px;border-radius:6px;cursor:pointer;font-size:1em;font-weight:bold;';
                continueBtn.onclick = closeDialogue;
                choicesContainer.appendChild(continueBtn);
            }
        }

        // Schließen Funktion
        function closeDialogue() {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            onComplete();
        }

        // Starte Dialog
        renderStep();
    },

    /**
     * Holt das NPC Bild (Phase NEXT+++)
     * @private
     * @param {string} npc - NPC ID
     * @param {string} emotion - Emotion (serious, happy, worried, etc.)
     * @returns {string} - Bild Pfad
     */
    _getNpcImage: function(npc, emotion) {
        // Fallback für fehlende Parameter
        npc = npc || 'default';
        emotion = emotion || 'neutral';

        // Versuche spezifisches Bild
        var specificPath = 'assets/npcs/' + npc + '_' + emotion + '.png';

        // Prüfe ob Bild existiert (simplified - in echter App mit preload)
        // Für jetzt: return specific, onerror wird fallback handlen
        return specificPath;
    },

    /**
     * Generiert dynamischen Dialog basierend auf World State (Phase NEXT+++)
     * @private
     * @param {Object} quest - Quest Objekt
     * @returns {Array} - Dialogue Array
     */
    _generateDynamicDialogue: function(quest) {
        var ctx = this._getDialogueContext(quest);
        var lines = [];

        // === NPC PERSONALITY (Phase NEXT+++) ===
        var npcProfile = this._getNpcProfile(ctx.npc);

        // === GREETING BASIEREND AUF REAKTION + PERSONALITY ===
        var greeting = this._getDynamicGreeting(ctx, npcProfile);
        lines.push(greeting);

        // === WORLD STATE EINFLÜSSE (mit Personality-Stil) ===
        if (ctx.flags.village_corrupt) {
            lines.push(this._getPersonalityLine('corruption', npcProfile));
        }

        if (ctx.flags.player_hunted) {
            lines.push(this._getPersonalityLine('hunted', npcProfile));
        }

        if (ctx.flags.kira_network_member && ctx.npc === 'kira') {
            lines.push(this._getRandomLine([
                'Willkommen zurück, Verbündeter.',
                'Wir haben Arbeit für dich.'
            ]));
        }

        // === QUEST SPEZIFISCH ===
        if (quest.category === 'dynamic' || quest.isDynamic) {
            lines.push(this._getPersonalityLine('dynamic', npcProfile));
        }

        // === TON-ANPASSUNG ===
        if (npcProfile.tone === 'greedy') {
            lines.push('…wenn der Preis stimmt.');
        } else if (npcProfile.tone === 'honorable') {
            lines.push('Es ist unsere Pflicht, zu helfen.');
        } else if (npcProfile.tone === 'suspicious') {
            lines.push('Wir werden sehen, ob du vertrauenswürdig bist.');
        }

        // === ZUSAMMENBAU ===
        var fullText = lines.join(' ');

        // Emotion basierend auf Kontext + Personality
        var emotion = this._getEmotionFromContext(ctx, npcProfile);

        return [{
            speaker: ctx.npc || 'npc',
            emotion: emotion,
            text: fullText,
            choices: this._getPersonalityChoices(npcProfile)
        }];
    },

    /**
     * NPC Profile mit Personality Traits (Phase NEXT+++)
     * @private
     */
    NPC_PROFILES: {
        taro: { style: 'calm', tone: 'honorable' },
        kira: { style: 'mysterious', tone: 'calculating' },
        guard: { style: 'direct', tone: 'suspicious' },
        merchant: { style: 'friendly', tone: 'greedy' },
        elder: { style: 'wise', tone: 'concerned' },
        villager: { style: 'simple', tone: 'neutral' },
        bandit: { style: 'rough', tone: 'hostile' },
        default: { style: 'neutral', tone: 'neutral' }
    },

    /**
     * Dialog Lines nach Personality Style (Phase NEXT+++)
     * @private
     */
    DIALOGUE_LINES: {
        calm: {
            greeting: [
                'Wir sollten vorsichtig vorgehen.',
                'Es ist besser, nichts zu überstürzen.',
                'Geduld wird uns weiterbringen.'
            ],
            corruption: [
                'Die Dinge haben sich verändert...',
                'Ich fürchte, wir haben ein Problem.'
            ],
            hunted: [
                'Du solltest dich ausruhen.',
                'Die Verfolgung wird dich ermüden.'
            ],
            dynamic: [
                'Diese Angelegenheit erfordert Fingerspitzengefühl.'
            ]
        },
        direct: {
            greeting: [
                'Hier stimmt etwas nicht.',
                'Ich sage es dir gerade heraus.',
                'Keine Zeit für Höflichkeiten.'
            ],
            corruption: [
                'Das Dorf ist verdorben!',
                'Jemand muss dafür bezahlen!'
            ],
            hunted: [
                'Du wirst gejagt. Lauf!',
                'Die Jäger sind hinter dir her.'
            ],
            dynamic: [
                'Das ist eine verdammte Katastrophe!'
            ]
        },
        friendly: {
            greeting: [
                'Ah, ein bekanntes Gesicht!',
                'Schön dich zu sehen!',
                'Willkommen, willkommen!'
            ],
            corruption: [
                'Ich wünschte, ich könnte mehr tun...',
                'Es ist schwer, positiv zu bleiben.'
            ],
            hunted: [
                'Oh je, du siehst müde aus!',
                'Kann ich dir helfen?'
            ],
            dynamic: [
                'Das klingt nach einer spannenden Geschichte!'
            ]
        },
        mysterious: {
            greeting: [
                'Die Fäden bewegen sich...',
                'Interessant, dass du hier bist.',
                'Das Schicksal führt dich.'
            ],
            corruption: [
                'Die Schatten werden länger.',
                'Nicht alles ist, wie es scheint.'
            ],
            hunted: [
                'Die Jäger sind nur Marionetten.',
                'Du musst tiefer graben.'
            ],
            dynamic: [
                'Gelegenheiten wie diese sind selten.'
            ]
        },
        wise: {
            greeting: [
                'Die Zeit lehrt uns viel.',
                'Weisheit kommt mit Erfahrung.',
                'Höre gut zu, junger Freund.'
            ],
            corruption: [
                'So enden alle Reiche, die ihre Werte verlieren.',
                'Die Wurzeln sind faul geworden.'
            ],
            hunted: [
                'Flucht ist manchmal der einzige Weg.',
                'Die Vergangenheit holt uns alle ein.'
            ],
            dynamic: [
                'Das Universum testet dich.'
            ]
        },
        rough: {
            greeting: [
                'Was willst du?',
                'Mach es kurz.',
                'Ich habe keine Zeit für dich.'
            ],
            corruption: [
                'Das Dorf ist erledigt.',
                'Jeder für sich selbst.'
            ],
            hunted: [
                'Ha! Jemand hat es auf dich abgesehen.',
                'Vielleicht helfe ich dir... gegen Bezahlung.'
            ],
            dynamic: [
                'Klingt nach Ärger. Ich bin dabei.'
            ]
        },
        simple: {
            greeting: [
                'Guten Tag!',
                'Was gibt\'s Neues?',
                'Kann ich helfen?'
            ],
            corruption: [
                'Ich verstehe nicht, was passiert...',
                'Die Leute sind so merkwürdig geworden.'
            ],
            hunted: [
                'Du siehst erschöpft aus.',
                'Pass auf dich auf!'
            ],
            dynamic: [
                'Das klingt kompliziert...'
            ]
        },
        neutral: {
            greeting: [
                'Gut, dass du da bist.',
                'Ich habe einen Auftrag für dich.',
                'Da ist etwas, das erledigt werden muss.'
            ],
            corruption: [
                'Im Dorf stimmt etwas nicht...',
                'Die Leute flüstern nur noch...'
            ],
            hunted: [
                'Du wirst verfolgt. Sei vorsichtig.',
                'Sie suchen dich.'
            ],
            dynamic: [
                'Diese Situation erfordert jemanden mit deinen Fähigkeiten.'
            ]
        }
    },

    /**
     * Holt das NPC Profil (Phase NEXT+++)
     * @private
     * @param {string} npcId - NPC ID
     * @returns {Object} - { style, tone }
     */
    _getNpcProfile: function(npcId) {
        return this.NPC_PROFILES[npcId] || this.NPC_PROFILES.default;
    },

    /**
     * Holt eine Line basierend auf Personality (Phase NEXT+++)
     * @private
     * @param {string} category - corruption, hunted, dynamic, greeting
     * @param {Object} profile - NPC Profile
     * @returns {string}
     */
    _getPersonalityLine: function(category, profile) {
        var styleLines = this.DIALOGUE_LINES[profile.style];
        if (!styleLines) {
            styleLines = this.DIALOGUE_LINES.neutral;
        }

        var lines = styleLines[category];
        if (!lines || lines.length === 0) {
            // Fallback zu neutral
            lines = this.DIALOGUE_LINES.neutral[category] || ['...'];
        }

        return this._getRandomLine(lines);
    },

    /**
     * Holt Emotion basierend auf Kontext und Personality (Phase NEXT+++)
     * @private
     * @param {Object} ctx - Dialog Kontext
     * @param {Object} profile - NPC Profile
     * @returns {string} - Emotion
     */
    _getEmotionFromContext: function(ctx, profile) {
        // Personality-basierte Basis-Emotion
        var baseEmotion = 'neutral';
        if (profile.style === 'friendly') baseEmotion = 'happy';
        if (profile.style === 'mysterious') baseEmotion = 'serious';
        if (profile.style === 'rough') baseEmotion = 'angry';
        if (profile.style === 'calm') baseEmotion = 'neutral';

        // Kontext-Overrides
        if (ctx.reaction === 'hostile') return 'serious';
        if (ctx.reaction === 'friendly') return 'happy';
        if (ctx.flags.village_corrupt) return 'worried';
        if (ctx.flags.player_hunted) return 'serious';

        return baseEmotion;
    },

    /**
     * Holt Choices basierend auf Personality (Phase NEXT+++)
     * @private
     * @param {Object} profile - NPC Profile
     * @returns {Array} - Choice Array
     */
    _getPersonalityChoices: function(profile) {
        var baseChoices = [
            { text: 'Ich kümmere mich darum.', next: null },
            { text: 'Erzähl mir mehr.', next: null }
        ];

        // Greedy NPCs bekommen Preis-Option
        if (profile.tone === 'greedy') {
            baseChoices.push({ text: 'Was bekomme ich dafür?', next: null });
        }

        // Honorable NPCs bekommen Pflicht-Option
        if (profile.tone === 'honorable') {
            baseChoices.push({ text: 'Es ist meine Pflicht.', next: null });
        }

        // Suspicious NPCs bekommen Misstrauens-Option
        if (profile.tone === 'suspicious') {
            baseChoices.push({ text: 'Warum ich?', next: null });
        }

        return baseChoices;
    },

    /**
     * Generiert dynamischen Gruß basierend auf Kontext + Personality (Phase NEXT+++)
     * @private
     * @param {Object} ctx - Dialog Kontext
     * @param {Object} profile - NPC Profile
     * @returns {string} - Gruß-Text
     */
    _getDynamicGreeting: function(ctx, profile) {
        // Nutze Personality-basierten Gruß
        var personalityGreeting = this._getPersonalityLine('greeting', profile);

        // Hostile Reaktion überschreibt
        if (ctx.reaction === 'hostile') {
            return this._getRandomLine([
                'Du schon wieder...',
                'Ich habe gehört, was du getan hast.',
                'Warum sollte ich dir helfen?'
            ]);
        }

        // Friendly Reaktion
        if (ctx.reaction === 'friendly') {
            return this._getRandomLine([
                'Ah, genau dich habe ich gebraucht!',
                'Gut, dass du da bist, Freund.',
                'Willkommen zurück!'
            ]);
        }

        // Karma-Einfluss auf neutral
        if (ctx.karma > 20) {
            return 'Man hat mir Gutes von dir erzählt. ' + personalityGreeting;
        }

        if (ctx.karma < -20) {
            return 'Ich habe von dir gehört... ' + personalityGreeting;
        }

        return personalityGreeting;
    },

    /**
     * Holt den Dialog-Kontext (Phase NEXT+++)
     * @private
     * @param {Object} quest - Quest Objekt
     * @returns {Object} - Kontext für Dialog-Generierung
     */
    _getDialogueContext: function(quest) {
        var worldState = window.QuestEngine?.state?.worldState || {};
        var giver = quest.giver || {};

        // Bestimme NPC-Reaktion
        var reaction = 'neutral';
        if (window.QuestEngine && window.QuestEngine.getNpcReaction) {
            reaction = window.QuestEngine.getNpcReaction(giver);
        }

        return {
            karma: worldState.karma || 0,
            flags: worldState.flags || {},
            factions: worldState.factions || {},
            faction: giver.faction,
            npc: giver.id || quest.giverId || 'npc',
            reaction: reaction,
            questCategory: quest.category
        };
    },

    /**
     * Generiert dynamischen Gruß basierend auf Kontext (Phase NEXT+++)
     * @private
     * @param {Object} ctx - Dialog Kontext
     * @returns {string} - Gruß-Text
     */
    _getDynamicGreeting: function(ctx) {
        // Hostile Reaktion
        if (ctx.reaction === 'hostile') {
            return this._getRandomLine([
                'Du schon wieder...',
                'Ich habe gehört, was du getan hast.',
                'Warum sollte ich dir helfen?',
                '*mustert dich misstrauisch*'
            ]);
        }

        // Friendly Reaktion
        if (ctx.reaction === 'friendly') {
            return this._getRandomLine([
                'Ah, genau dich habe ich gebraucht!',
                'Gut, dass du da bist, Freund.',
                'Ich wusste, du würdest kommen.',
                'Willkommen zurück!'
            ]);
        }

        // Neutral (mit Karma-Einfluss)
        if (ctx.karma > 20) {
            return this._getRandomLine([
                'Man hat mir von dir erzählt.',
                'Dein Ruf eilt dir voraus.',
                'Gut, dass du da bist.'
            ]);
        }

        if (ctx.karma < -20) {
            return this._getRandomLine([
                'Du bist der Neue, ja?',
                'Ich habe von dir gehört...',
                'Wir werden sehen, ob ich dir traue.'
            ]);
        }

        // Standard
        return this._getRandomLine([
            'Gut, dass du da bist.',
            'Ich habe einen Auftrag für dich.',
            'Da ist etwas, das erledigt werden muss.',
            'Kannst du mir helfen?'
        ]);
    },

    /**
     * Wählt zufällig ein Element aus einem Array (Phase NEXT+++)
     * @private
     * @param {Array} lines - Array von Strings
     * @returns {string} - Zufällig ausgewählter String
     */
    _getRandomLine: function(lines) {
        if (!lines || lines.length === 0) return '';
        return lines[Math.floor(Math.random() * lines.length)];
    }
};

// Global verfügbar machen
if (typeof QuestBoardUI === 'undefined') {
    throw new Error('[QuestBoardUI] FATAL: QuestBoardUI ist nicht definiert im Script!');
}
window.QuestBoardUI = QuestBoardUI;
console.log('[QuestBoardUI] Global registriert:', typeof window.QuestBoardUI);
