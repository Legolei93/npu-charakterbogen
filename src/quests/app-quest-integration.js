/**
 * App Integration für Quest System v4.0
 * Verbindet das Quest System mit der bestehenden App
 */

(function() {
    'use strict';
    
    // Warte bis DOM geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('[AppQuestIntegration] Initialisiere...');
        
        // Überschreibe showPage Funktion für Quest-Seite
        const originalShowPage = window.showPage;
        window.showPage = function(pageNum) {
            // Rufe originale Funktion auf
            if (originalShowPage) {
                originalShowPage(pageNum);
            }
            
            // Wenn Quest-Seite (Page 7), initialisiere Quest Board
            if (pageNum === 7) {
                console.log('[AppQuestIntegration] Quest-Seite wird angezeigt');
                setTimeout(initQuestPage, 0);
            }
        };
        
        // Überschreibe showQuestPage
        window.showQuestPage = function() {
            console.log('[AppQuestIntegration] showQuestPage aufgerufen');
            
            // Alle Pages deaktivieren (CSS: .sheet-page { display: none })
            document.querySelectorAll('.sheet-page').forEach(function(p) {
                p.classList.remove('active');
            });
            
            // Alle Nav-Buttons deaktivieren
            document.querySelectorAll('.page-nav button').forEach(function(b) {
                b.classList.remove('active');
            });
            
            // Quest-Page aktivieren (CSS: .sheet-page.active { display: block })
            var questPage = document.getElementById('page7');
            if (questPage) {
                questPage.classList.add('active');
            }
            
            // Nav-Button aktivieren
            var btn = document.getElementById('btnPage7');
            if (btn) {
                btn.classList.add('active');
            }
            
            // Quest-Page initialisieren (mit minimalem Delay für DOM-Update)
            setTimeout(initQuestPage, 0);
        };
        
        console.log('[AppQuestIntegration] Initialisiert');
    }
    
    /**
     * Initialisiert die Quest-Seite
     */
    function initQuestPage() {
        console.log('[AppQuestIntegration] Initialisiere Quest-Page...');
        
        // Debug: Verfügbarkeit prüfen
        var container = document.getElementById('quest-board-container');
        console.log('[DEBUG] Container:', container);
        console.log('[DEBUG] QuestBoardUI vorhanden:', typeof window.QuestBoardUI);
        console.log('[DEBUG] QuestEngine vorhanden:', typeof window.QuestEngine);
        console.log('[DEBUG] DOM ready state:', document.readyState);
        
        // Prüfe ob Quest Engine verfügbar
        if (typeof QuestEngine === 'undefined') {
            console.error('[AppQuestIntegration] QuestEngine nicht verfügbar!');
            showQuestError('Quest-System nicht verfügbar');
            return;
        }
        
        // Prüfe ob Character geladen ist (StateManager ODER window.currentCharacter)
        var character = null;
        if (typeof StateManager !== 'undefined' && StateManager.getCharacter) {
            character = StateManager.getCharacter();
        }
        if (!character) {
            character = window.currentCharacter;
        }
        if (!character) {
            console.warn('[AppQuestIntegration] Kein Character geladen');
            showQuestError('Bitte wähle zuerst einen Charakter aus');
            return;
        }
        
        // Initialisiere Quest Engine
        try {
            QuestEngine.init();
        } catch (e) {
            console.error('[AppQuestIntegration] Fehler bei QuestEngine.init():', e);
        }
        
        // Rendere Quest Board
        if (!container) {
            console.error('[AppQuestIntegration] Container #quest-board-container NICHT im DOM!');
            return;
        }
        
        // QuestBoardUI Verfügbarkeit prüfen - mehrere Fallbacks
        var questUI = window.QuestBoardUI;
        if (!questUI) {
            // Fallback: Versuche über globalen Scope
            try { questUI = QuestBoardUI; } catch(e) {}
        }
        
        if (!questUI) {
            console.error('[AppQuestIntegration] QuestBoardUI nicht verfügbar!');
            console.error('[AppQuestIntegration] Prüfe: Wird http://localhost verwendet (NICHT file://)?');
            container.innerHTML = 
                '<div style="text-align:center;padding:40px;color:#e74c3c;">' +
                '<h3>Quest-UI konnte nicht geladen werden</h3>' +
                '<p>Bitte starte die App über den lokalen Server:</p>' +
                '<code style="background:#222;padding:8px;border-radius:4px;">start-server.ps1</code>' +
                '<p style="margin-top:10px;">Dann öffne: <strong>http://localhost:9000</strong></p>' +
                '</div>';
            return;
        }
        
        console.log('[AppQuestIntegration] Rendere Quest Board...');
        questUI.init();
    }
    
    /**
     * Zeigt Fehlermeldung auf Quest-Seite
     */
    function showQuestError(message) {
        var container = document.getElementById('quest-board-container');
        if (container) {
            container.innerHTML = 
                '<div class="quest-error">' +
                    '<span class="icon">&#9888;</span>' +
                    '<h3>' + message + '</h3>' +
                    '<p>Bitte lade die Seite neu oder w\u00e4hle einen Charakter.</p>' +
                '</div>';
        }
    }
    
    // CSS für Fehlermeldung hinzufügen
    var style = document.createElement('style');
    style.textContent = 
        '.quest-error {' +
            'text-align: center;' +
            'padding: 40px;' +
            'background: rgba(0, 0, 0, 0.3);' +
            'border: 1px solid #e74c3c;' +
            'border-radius: 12px;' +
            'margin: 20px;' +
        '}' +
        '.quest-error .icon {' +
            'font-size: 3em;' +
            'display: block;' +
            'margin-bottom: 15px;' +
        '}' +
        '.quest-error h3 {' +
            'color: #e74c3c;' +
            'margin-bottom: 10px;' +
        '}' +
        '.quest-error p {' +
            'color: #888;' +
        '}';
    document.head.appendChild(style);
    
})();
