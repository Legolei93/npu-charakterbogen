/**
 * Auth System - Erweitertes Login mit Passwort-Reset
 */

const AuthSystem = {
    // Aktueller Benutzer
    currentUser: null,
    
    // Reset-Token Speicher
    resetTokens: {},
    
    /**
     * Initialisiert das Auth-System
     */
    init() {
        this.loadFromStorage();
        
        // Auto-Login mit StateManager Sync
        const user = this.loadStoredUser();
        if (user && user.id) {
            if (window.StateManager && window.StateManager.onUserLogin) {
                window.StateManager.onUserLogin(user.id);
            }
        }
        
        console.log('AuthSystem initialisiert');
    },
    
    /**
     * Laedt aus dem Speicher
     */
    loadFromStorage() {
        const saved = localStorage.getItem('npu_auth_system');
        if (saved) {
            const data = JSON.parse(saved);
            this.resetTokens = data.resetTokens || {};
        }
    },
    
    /**
     * Laedt gespeicherten User (Auto-Login)
     * @returns {Object|null}
     */
    loadStoredUser() {
        try {
            const data = localStorage.getItem('npu_current_user');
            if (!data) return null;
            
            const user = JSON.parse(data);
            if (user && user.id) {
                this.currentUser = user;
                console.log('[AuthSystem] Auto-Login:', user.username);
                return user;
            }
        } catch (e) {
            console.warn('[AuthSystem] Fehler beim Laden des Users:', e);
        }
        return null;
    },
    
    /**
     * Speichert in den Speicher
     */
    saveToStorage() {
        localStorage.setItem('npu_auth_system', JSON.stringify({
            resetTokens: this.resetTokens
        }));
    },
    
    /**
     * Registriert einen neuen Benutzer
     */
    register(username, password, email, role = 'player') {
        // Pruefe ob Benutzer existiert
        const existingUser = this.getUser(username);
        if (existingUser) {
            return { success: false, message: 'Benutzername bereits vergeben' };
        }
        
        // Erstelle neuen Benutzer
        const user = {
            id: 'user_' + Date.now(),
            username,
            password: this.hashPassword(password),
            email,
            role,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            characters: []
        };
        
        // Speichere Benutzer
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('npu_users', JSON.stringify(users));
        
        return { success: true, message: 'Registrierung erfolgreich', userId: user.id };
    },
    
    /**
     * Login-Funktion
     */
    login(username, password) {
        const user = this.getUser(username);
        if (!user) {
            return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Falsches Passwort' };
        }
        
        // Aktualisiere letzten Login
        user.lastLogin = new Date().toISOString();
        this.updateUser(user);
        
        // Setze aktuellen Benutzer
        this.currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        
        // Speichere Session
        localStorage.setItem('npu_current_user', JSON.stringify(this.currentUser));
        
        // === STATE MANAGER SYNC ===
        if (window.StateManager && window.StateManager.onUserLogin) {
            window.StateManager.onUserLogin(user.id);
        }
        
        // Pruefe ob Benutzer Charaktere hat
        const hasCharacters = this.userHasCharacters(user.id);
        
        return { 
            success: true, 
            message: 'Login erfolgreich',
            user: this.currentUser,
            hasCharacters
        };
    },
    
    /**
     * Logout
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('npu_current_user');
        
        // StateManager zurücksetzen (via API)
        if (window.StateManager && StateManager.clear) {
            StateManager.clear();
        }
        
        return { success: true, message: 'Logout erfolgreich' };
    },
    
    /**
     * Fordert Passwort-Reset an
     */
    requestPasswordReset(email) {
        // Suche Benutzer mit E-Mail
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            // Aus Sicherheitsgruenden: Zeige keine Info ob E-Mail existiert
            return { success: true, message: 'Falls die E-Mail existiert, wurde ein Reset-Link gesendet' };
        }
        
        // Erstelle Token
        const token = this.generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden
        
        this.resetTokens[token] = {
            userId: user.id,
            email: user.email,
            expiresAt: expiresAt.toISOString(),
            used: false
        };
        
        this.saveToStorage();
        
        // In echter Anwendung: Sende E-Mail
        // Hier: Zeige Token in Konsole/Alert fuer Demo-Zwecke
        console.log('Passwort-Reset Token:', token);
        
        // Simuliere E-Mail-Versand
        this.showResetEmailSimulation(user.email, token);
        
        return { success: true, message: 'Reset-Link wurde an ' + email + ' gesendet', token };
    },
    
    /**
     * Zeigt E-Mail-Simulation
     */
    showResetEmailSimulation(email, token) {
        const modal = document.createElement('div');
        modal.className = 'reset-email-modal';
        modal.innerHTML = `
            <div class="reset-email-content">
                <h3>[Mail] E-Mail Simulation</h3>
                <p>An: ${email}</p>
                <p>Betreff: Passwort zuruecksetzen</p>
                <hr>
                <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurueckzusetzen:</p>
                <div class="reset-token">${token}</div>
                <p class="token-info">Dieser Link ist 24 Stunden gueltig.</p>
                <button onclick="this.closest('.reset-email-modal').remove()">Schliessen</button>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    /**
     * Setzt Passwort mit Token zurueck
     */
    resetPassword(token, newPassword) {
        const resetData = this.resetTokens[token];
        
        if (!resetData) {
            return { success: false, message: 'Ungueltiger oder abgelaufener Token' };
        }
        
        if (resetData.used) {
            return { success: false, message: 'Token wurde bereits verwendet' };
        }
        
        if (new Date(resetData.expiresAt) < new Date()) {
            return { success: false, message: 'Token ist abgelaufen' };
        }
        
        // Finde Benutzer
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === resetData.userId);
        
        if (userIndex === -1) {
            return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        // Setze neues Passwort
        users[userIndex].password = this.hashPassword(newPassword);
        localStorage.setItem('npu_users', JSON.stringify(users));
        
        // Markiere Token als verwendet
        this.resetTokens[token].used = true;
        this.saveToStorage();
        
        return { success: true, message: 'Passwort wurde erfolgreich zurueckgesetzt' };
    },
    
    /**
     * Aendert Passwort (eingeloggt)
     */
    changePassword(userId, oldPassword, newPassword) {
        const user = this.getUserById(userId);
        if (!user) {
            return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        if (user.password !== this.hashPassword(oldPassword)) {
            return { success: false, message: 'Aktuelles Passwort ist falsch' };
        }
        
        user.password = this.hashPassword(newPassword);
        this.updateUser(user);
        
        return { success: true, message: 'Passwort wurde geaendert' };
    },
    
    /**
     * Prueft ob Benutzer eingeloggt ist
     */
    isLoggedIn() {
        if (this.currentUser) return true;
        
        // Pruefe gespeicherte Session
        const saved = localStorage.getItem('npu_current_user');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            return true;
        }
        
        return false;
    },
    
    /**
     * Gibt aktuellen Benutzer zurueck
     */
    getCurrentUser() {
        return this.currentUser;
    },
    
    /**
     * Prueft ob Benutzer Charaktere hat
     */
    userHasCharacters(userId) {
        const chars = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('npu_character_')) {
                try {
                    const char = JSON.parse(localStorage.getItem(key));
                    if (char.userId === userId) {
                        chars.push(char);
                    }
                } catch(e) {}
            }
        }
        return chars.length > 0;
    },
    
    /**
     * Hilfsfunktionen
     */
    getAllUsers() {
        return JSON.parse(localStorage.getItem('npu_users') || '[]');
    },
    
    getUser(username) {
        return this.getAllUsers().find(u => u.username === username);
    },
    
    getUserById(userId) {
        return this.getAllUsers().find(u => u.id === userId);
    },
    
    updateUser(updatedUser) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('npu_users', JSON.stringify(users));
        }
    },
    
    hashPassword(password) {
        // Einfache Hash-Funktion (in Produktion: bcrypt verwenden)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },
    
    generateToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Rendert Login-Formular mit Passwort-vergessen
     */
    renderLoginForm() {
        const container = document.getElementById('loginPage');
        if (!container) return;
        
        container.innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <div class="login-avatar">[Ninja]</div>
                        <h1>NPU Charakterbogen</h1>
                        <p>Naruto Pen &amp; Paper Universe</p>
                    </div>
                    
                    <form id="loginForm" onsubmit="event.preventDefault(); AuthSystem.handleLogin();">
                        <div class="form-group">
                            <label>Benutzername</label>
                            <input type="text" id="loginUsername" required placeholder="Dein Name">
                        </div>
                        
                        <div class="form-group">
                            <label>Passwort</label>
                            <input type="password" id="loginPassword" required placeholder="********">
                        </div>
                        
                        <button type="submit" class="btn-login">Einloggen</button>
                    </form>
                    
                    <div class="login-links">
                        <a href="#" onclick="AuthSystem.showForgotPassword(); return false;">Passwort vergessen?</a>
                        <a href="#" onclick="AuthSystem.showRegister(); return false;">Neu registrieren</a>
                    </div>
                    
                    <div class="login-hints">
                        <p class="hint">Test-Accounts:</p>
                        <p>Spieler: player / player123</p>
                        <p>DM: dm / dm123</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Zeigt Passwort-vergessen Formular
     */
    showForgotPassword() {
        const container = document.querySelector('.login-box');
        if (!container) return;
        
        container.innerHTML = `
            <div class="login-header">
                <div class="login-avatar">[Schloss]</div>
                <h1>Passwort zuruecksetzen</h1>
                <p>Gib deine E-Mail-Adresse ein</p>
            </div>
            
            <form onsubmit="event.preventDefault(); AuthSystem.handleForgotPassword();">
                <div class="form-group">
                    <label>E-Mail</label>
                    <input type="email" id="resetEmail" required placeholder="deine@email.de">
                </div>
                
                <button type="submit" class="btn-login">Reset-Link senden</button>
            </form>
            
            <div class="login-links">
                <a href="#" onclick="AuthSystem.renderLoginForm(); return false;">&larr; Zurueck zum Login</a>
            </div>
        `;
    },
    
    /**
     * Zeigt Registrierungs-Formular
     */
    showRegister() {
        const container = document.querySelector('.login-box');
        if (!container) return;
        
        container.innerHTML = `
            <div class="login-header">
                <div class="login-avatar">[Stift]</div>
                <h1>Registrieren</h1>
                <p>Erstelle einen neuen Account</p>
            </div>
            
            <form onsubmit="event.preventDefault(); AuthSystem.handleRegister();">
                <div class="form-group">
                    <label>Benutzername</label>
                    <input type="text" id="regUsername" required placeholder="Dein Name">
                </div>
                
                <div class="form-group">
                    <label>E-Mail</label>
                    <input type="email" id="regEmail" required placeholder="deine@email.de">
                </div>
                
                <div class="form-group">
                    <label>Passwort</label>
                    <input type="password" id="regPassword" required placeholder="********" minlength="6">
                </div>
                
                <div class="form-group">
                    <label>Rolle</label>
                    <select id="regRole">
                        <option value="player">Spieler</option>
                        <option value="dm">DM</option>
                    </select>
                </div>
                
                <button type="submit" class="btn-login">Registrieren</button>
            </form>
            
            <div class="login-links">
                <a href="#" onclick="AuthSystem.renderLoginForm(); return false;">&larr; Zurueck zum Login</a>
            </div>
        `;
    },
    
    /**
     * Handler: Login
     */
    handleLogin() {
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        
        if (!username || !password) {
            alert('Bitte Benutzername und Passwort eingeben');
            return;
        }
        
        const result = this.login(username, password);
        
        if (result.success) {
            // Pruefe ob Charakter existiert
            if (!result.hasCharacters) {
                // Starte Charaktererstellung
                this.startCharacterCreation();
            } else {
                // Zeige App
                showApp();
                loadCharacters();
            }
        } else {
            alert(result.message);
        }
    },
    
    /**
     * Handler: Passwort vergessen
     */
    handleForgotPassword() {
        const email = document.getElementById('resetEmail')?.value;
        
        if (!email) {
            alert('Bitte E-Mail eingeben');
            return;
        }
        
        const result = this.requestPasswordReset(email);
        alert(result.message);
        
        if (result.success) {
            // Zeige Token-Eingabe
            this.showResetTokenForm(email);
        }
    },
    
    /**
     * Zeigt Token-Eingabe Formular
     */
    showResetTokenForm(email) {
        const container = document.querySelector('.login-box');
        if (!container) return;
        
        container.innerHTML = `
            <div class="login-header">
                <div class="login-avatar">[Schloss]</div>
                <h1>Neues Passwort</h1>
                <p>Gib den Token und neues Passwort ein</p>
            </div>
            
            <form onsubmit="event.preventDefault(); AuthSystem.handleResetPassword();">
                <div class="form-group">
                    <label>Token (aus der E-Mail)</label>
                    <input type="text" id="resetToken" required placeholder="Token hier einfuegen">
                </div>
                
                <div class="form-group">
                    <label>Neues Passwort</label>
                    <input type="password" id="newPassword" required placeholder="********" minlength="6">
                </div>
                
                <button type="submit" class="btn-login">Passwort speichern</button>
            </form>
            
            <div class="login-links">
                <a href="#" onclick="AuthSystem.renderLoginForm(); return false;">&larr; Zurueck zum Login</a>
            </div>
        `;
    },
    
    /**
     * Handler: Passwort zuruecksetzen
     */
    handleResetPassword() {
        const token = document.getElementById('resetToken')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        
        if (!token || !newPassword) {
            alert('Bitte alle Felder ausfuellen');
            return;
        }
        
        const result = this.resetPassword(token, newPassword);
        alert(result.message);
        
        if (result.success) {
            this.renderLoginForm();
        }
    },
    
    /**
     * Handler: Registrierung
     */
    handleRegister() {
        const username = document.getElementById('regUsername')?.value;
        const email = document.getElementById('regEmail')?.value;
        const password = document.getElementById('regPassword')?.value;
        const role = document.getElementById('regRole')?.value || 'player';
        
        if (!username || !email || !password) {
            alert('Bitte alle Felder ausfuellen');
            return;
        }
        
        const result = this.register(username, password, email, role);
        alert(result.message);
        
        if (result.success) {
            this.renderLoginForm();
        }
    },
    
    /**
     * Startet Charaktererstellung
     */
    startCharacterCreation() {
        alert('Willkommen! Da du noch keinen Charakter hast, starten wir jetzt die Charaktererstellung.');
        showApp();
        if (typeof startCharacterCreationWizard === 'function') {
            startCharacterCreationWizard();
        }
    }
};

// Global verfuegbar machen
window.AuthSystem = AuthSystem;
