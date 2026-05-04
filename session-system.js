/**
 * Session System - Verwaltung von Spiel-Sessions
 * Start/Ende, Notizen, Zusammenfassung, Zeit-Tracking
 */

const SessionSystem = {
    // Aktuelle Session
    currentSession: null,
    
    // Session-Verlauf
    sessionHistory: [],
    
    // Auto-save Interval
    autoSaveInterval: null,
    
    /**
     * Initialisiert das Session-System
     */
    init() {
        this.loadFromStorage();
        this.checkActiveSession();
        this.startAutoSave();
        console.log('SessionSystem initialisiert');
    },
    
    /**
     * Lädt aus dem Speicher
     */
    loadFromStorage() {
        const saved = localStateManager.getItem('npu_session_system');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentSession = data.currentSession;
            this.sessionHistory = data.sessionHistory || [];
        }
    },
    
    /**
     * Speichert in den Speicher
     */
    saveToStorage() {
        localStateManager.setItem('npu_session_system', JSON.stringify({
            currentSession: this.currentSession,
            sessionHistory: this.sessionHistory
        }));
    },
    
    /**
     * Startet Auto-Save
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.currentSession && this.currentSession.active) {
                this.saveToStorage();
            }
        }, 30000); // Alle 30 Sekunden
    },
    
    /**
     * Prüft auf aktive Session
     */
    checkActiveSession() {
        if (this.currentSession?.active) {
            const startTime = new Date(this.currentSession.startTime);
            const now = new Date();
            const duration = Math.floor((now - startTime) / 1000 / 60); // Minuten
            
            this.currentSession.duration = duration;
            this.updateSessionDisplay();
        }
    },
    
    /**
     * Startet eine neue Session
     */
    startSession(sessionName = '', sessionType = 'regular') {
        if (this.currentSession?.active) {
            if (!confirm('Es läuft bereits eine Session. Soll diese beendet werden?')) {
                return { success: false, message: 'Bereits aktive Session' };
            }
            this.endSession();
        }
        
        this.currentSession = {
            id: 'session_' + Date.now(),
            name: sessionName || `Session ${this.sessionHistory.length + 1}`,
            type: sessionType,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            active: true,
            notes: [],
            events: [],
            participants: this.getParticipants(),
            summary: ''
        };
        
        this.saveToStorage();
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('session_started', { sessionName: this.currentSession.name });
        }
        
        this.updateSessionDisplay();
        
        return { 
            success: true, 
            message: `Session "${this.currentSession.name}" gestartet`,
            session: this.currentSession
        };
    },
    
    /**
     * Beendet die aktuelle Session
     */
    endSession() {
        if (!this.currentSession?.active) {
            return { success: false, message: 'Keine aktive Session' };
        }
        
        const endTime = new Date();
        const startTime = new Date(this.currentSession.startTime);
        const duration = Math.floor((endTime - startTime) / 1000 / 60);
        
        this.currentSession.endTime = endTime.toISOString();
        this.currentSession.duration = duration;
        this.currentSession.active = false;
        
        // Generiere Zusammenfassung
        this.currentSession.summary = this.generateSummary();
        
        // Zum Verlauf hinzufügen
        this.sessionHistory.unshift({ ...this.currentSession });
        
        // Begrenze Verlauf
        if (this.sessionHistory.length > 50) {
            this.sessionHistory = this.sessionHistory.slice(0, 50);
        }
        
        this.saveToStorage();
        
        // Log
        if (typeof GameLog !== 'undefined') {
            GameLog.addEntry('session_ended', { 
                sessionName: this.currentSession.name,
                duration: this.formatDuration(duration)
            });
        }
        
        const session = this.currentSession;
        this.currentSession = null;
        this.updateSessionDisplay();
        
        return { 
            success: true, 
            message: `Session "${session.name}" beendet`,
            session: session
        };
    },
    
    /**
     * Fügt eine Notiz hinzu
     */
    addNote(note, category = 'general') {
        if (!this.currentSession?.active) {
            return { success: false, message: 'Keine aktive Session' };
        }
        
        const noteObj = {
            id: Date.now(),
            text: note,
            category,
            timestamp: new Date().toISOString(),
            author: currentCharacter?.name || 'Unbekannt'
        };
        
        this.currentSession.notes.push(noteObj);
        this.saveToStorage();
        
        this.updateNotesDisplay();
        
        return { success: true, message: 'Notiz hinzugefügt' };
    },
    
    /**
     * Fügt ein Ereignis hinzu
     */
    addEvent(eventType, description, data = {}) {
        if (!this.currentSession?.active) {
            return { success: false, message: 'Keine aktive Session' };
        }
        
        const event = {
            id: Date.now(),
            type: eventType,
            description,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.currentSession.events.push(event);
        this.saveToStorage();
        
        return { success: true, message: 'Ereignis hinzugefügt' };
    },
    
    /**
     * Generiert Zusammenfassung
     */
    generateSummary() {
        if (!this.currentSession) return '';
        
        const events = this.currentSession.events;
        const notes = this.currentSession.notes;
        
        let summary = `Session: ${this.currentSession.name}\n`;
        summary += `Dauer: ${this.formatDuration(this.currentSession.duration)}\n`;
        summary += `Teilnehmer: ${this.currentSession.participants.join(', ')}\n\n`;
        
        if (events.length > 0) {
            summary += 'Wichtige Ereignisse:\n';
            events.filter(e => e.type === 'milestone' || e.type === 'combat' || e.type === 'quest')
                .forEach(e => {
                    summary += `- ${e.description}\n`;
                });
        }
        
        if (notes.length > 0) {
            summary += '\nNotizen:\n';
            notes.slice(-5).forEach(n => {
                summary += `- ${n.text}\n`;
            });
        }
        
        return summary;
    },
    
    /**
     * Gibt Teilnehmer zurück
     */
    getParticipants() {
        const participants = [];
        
        // Aktueller Charakter
        if (currentCharacter?.name) {
            participants.push(currentCharacter.name);
        }
        
        // DM
        if (currentUser?.role === 'dm') {
            participants.push('DM');
        }
        
        return participants;
    },
    
    /**
     * Formatiert Dauer
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    },
    
    /**
     * Aktualisiert Session-Anzeige
     */
    updateSessionDisplay() {
        const container = document.getElementById('sessionDisplay');
        if (!container) return;
        
        if (!this.currentSession?.active) {
            container.innerHTML = `
                <div class="session-inactive">
                    <p>Keine aktive Session</p>
                    <button class="btn-primary" onclick="SessionSystem.showStartDialog()">
                        ▶️ Session starten
                    </button>
                </div>
            `;
            return;
        }
        
        const duration = this.formatDuration(this.currentSession.duration);
        
        container.innerHTML = `
            <div class="session-active">
                <div class="session-header">
                    <h4>📅 ${this.currentSession.name}</h4>
                    <span class="session-timer">⏱️ ${duration}</span>
                </div>
                
                <div class="session-actions">
                    <button class="btn-secondary" onclick="SessionSystem.showAddNoteDialog()">
                        📝 Notiz
                    </button>
                    <button class="btn-secondary" onclick="SessionSystem.showAddEventDialog()">
                        ⚡ Ereignis
                    </button>
                    <button class="btn-danger" onclick="SessionSystem.confirmEndSession()">
                        ⏹️ Beenden
                    </button>
                </div>
                
                <div class="session-notes-preview">
                    ${this.currentSession.notes.length} Notizen
                    ${this.currentSession.events.length} Ereignisse
                </div>
            </div>
        `;
    },
    
    /**
     * Aktualisiert Notizen-Anzeige
     */
    updateNotesDisplay() {
        const container = document.getElementById('sessionNotes');
        if (!container || !this.currentSession) return;
        
        container.innerHTML = this.currentSession.notes.map(note => `
            <div class="session-note ${note.category}">
                <div class="note-header">
                    <span class="note-author">${note.author}</span>
                    <span class="note-time">${new Date(note.timestamp).toLocaleTimeString()}</span>
                </div>
                <p class="note-text">${note.text}</p>
            </div>
        `).join('');
    },
    
    /**
     * Zeigt Start-Dialog
     */
    showStartDialog() {
        const name = prompt('Name der Session (optional):');
        if (name === null) return; // Abgebrochen
        
        const result = this.startSession(name);
        if (result.success) {
            alert(result.message);
        }
    },
    
    /**
     * Zeigt Notiz-Dialog
     */
    showAddNoteDialog() {
        const note = prompt('Notiz eingeben:');
        if (!note) return;
        
        const result = this.addNote(note);
        if (result.success) {
            alert('Notiz hinzugefügt!');
        }
    },
    
    /**
     * Zeigt Ereignis-Dialog
     */
    showAddEventDialog() {
        const eventTypes = ['combat', 'quest', 'milestone', 'social', 'exploration'];
        const type = prompt(`Ereignistyp (${eventTypes.join(', ')}):`);
        if (!type || !eventTypes.includes(type)) {
            alert('Ungültiger Ereignistyp');
            return;
        }
        
        const description = prompt('Beschreibung:');
        if (!description) return;
        
        const result = this.addEvent(type, description);
        if (result.success) {
            alert('Ereignis hinzugefügt!');
        }
    },
    
    /**
     * Bestätigt Session-Ende
     */
    confirmEndSession() {
        if (!confirm('Möchtest du die Session wirklich beenden?')) return;
        
        const result = this.endSession();
        if (result.success) {
            alert(`${result.message}\n\nZusammenfassung:\n${result.session.summary}`);
        }
    },
    
    /**
     * Rendert Session-Verwaltung
     */
    renderSessionManager() {
        return `
            <div class="session-manager">
                <h3>📅 Session-Verwaltung</h3>
                
                <div id="sessionDisplay" class="session-display">
                    ${this.currentSession?.active ? '' : `
                        <div class="session-inactive">
                            <p>Keine aktive Session</p>
                            <button class="btn-primary" onclick="SessionSystem.showStartDialog()">
                                ▶️ Session starten
                            </button>
                        </div>
                    `}
                </div>
                
                <div class="session-history-section">
                    <h4>📜 Vergangene Sessions</h4>
                    <div class="session-history-list">
                        ${this.renderSessionHistory()}
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Rendert Session-Verlauf
     */
    renderSessionHistory() {
        if (this.sessionHistory.length === 0) {
            return '<p class="no-sessions">Noch keine vergangenen Sessions</p>';
        }
        
        return this.sessionHistory.map(session => `
            <div class="session-history-item">
                <div class="session-info">
                    <span class="session-name">${session.name}</span>
                    <span class="session-date">${new Date(session.startTime).toLocaleDateString()}</span>
                </div>
                <div class="session-stats">
                    <span class="session-duration">⏱️ ${this.formatDuration(session.duration)}</span>
                    <span class="session-notes-count">📝 ${session.notes.length}</span>
                    <span class="session-events-count">⚡ ${session.events.length}</span>
                </div>
                <button class="btn-small" onclick="SessionSystem.showSessionDetails('${session.id}')">
                    Details
                </button>
            </div>
        `).join('');
    },
    
    /**
     * Zeigt Session-Details
     */
    showSessionDetails(sessionId) {
        const session = this.sessionHistory.find(s => s.id === sessionId);
        if (!session) return;
        
        const modal = document.createElement('div');
        modal.className = 'session-modal';
        modal.innerHTML = `
            <div class="session-modal-content">
                <h3>${session.name}</h3>
                <p class="session-meta">
                    ${new Date(session.startTime).toLocaleString()} - 
                    ${session.endTime ? new Date(session.endTime).toLocaleString() : 'Laufend'}
                </p>
                <p class="session-duration">Dauer: ${this.formatDuration(session.duration)}</p>
                
                <h4>Notizen</h4>
                <div class="session-notes-list">
                    ${session.notes.map(n => `
                        <div class="note-item">
                            <span class="note-time">${new Date(n.timestamp).toLocaleTimeString()}</span>
                            <p>${n.text}</p>
                        </div>
                    `).join('') || '<p>Keine Notizen</p>'}
                </div>
                
                <h4>Zusammenfassung</h4>
                <pre class="session-summary">${session.summary}</pre>
                
                <button onclick="this.closest('.session-modal').remove()">Schließen</button>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    /**
     * Exportiert Session-Daten
     */
    exportSession(sessionId) {
        const session = sessionId 
            ? this.sessionHistory.find(s => s.id === sessionId)
            : this.currentSession;
            
        if (!session) return null;
        
        return JSON.stringify(session, null, 2);
    }
};

// Global verfügbar machen
window.SessionSystem = SessionSystem;