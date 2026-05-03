/**
 * NPU Charakterbogen - Vollständige Version mit Jutsu-Karten-System
 */

// Globale Charakter-Variable - wird von allen Seiten verwendet
window.currentCharacter = null;
let currentJutsuCardId = null;
let currentSlot = null;

/**
 * Clan-spezifische Jutsus (Kekkei Genkai)
 * Diese Jutsus werden nur angezeigt, wenn der entsprechende Clan gewählt wurde
 */
const CLAN_JUTSUS = {
    uchiha: [
        { id: 'uchiha_sharingan_1', name: 'Sharingan: Erwachen', rank: 'E', chakra: 5, type: 'Kekkei Genkai', element: 'neutral', clan: 'uchiha', damage: null, description: 'Das Sharingan erwacht im Kampf.' },
        { id: 'uchiha_sharingan_2', name: 'Sharingan: Genjutsu', rank: 'D', chakra: 15, type: 'Kekkei Genkai', element: 'neutral', clan: 'uchiha', damage: null, description: 'Einfaches Genjutsu durch Blickkontakt.' },
        { id: 'uchiha_katon_1', name: 'Katon: Goukakyuu', rank: 'C', chakra: 25, type: 'Ninjutsu', element: 'feuer', clan: 'uchiha', damage: '2W6', description: 'Feuerball-Technik der Uchiha.' }
    ],
    hyuga: [
        { id: 'hyuga_byakugan_1', name: 'Byakugan: Erwachen', rank: 'E', chakra: 5, type: 'Kekkei Genkai', element: 'neutral', clan: 'hyuga', damage: null, description: 'Das Byakugan erwacht.' },
        { id: 'hyuga_juuken_1', name: 'Juuken: Zwei-Palmen', rank: 'D', chakra: 15, type: 'Taijutsu', element: 'neutral', clan: 'hyuga', damage: '1W6+2', description: 'Gentle Fist mit zwei Palmen.' },
        { id: 'hyuga_kaiten_1', name: 'Hakkeshou Kaiten', rank: 'C', chakra: 30, type: 'Taijutsu', element: 'neutral', clan: 'hyuga', damage: null, description: 'Rotation der 8 Trigramme als Verteidigung.' }
    ],
    aburame: [
        { id: 'aburame_kikaichuu_1', name: 'Kikaichuu: Schwarm', rank: 'D', chakra: 20, type: 'Hijutsu', element: 'neutral', clan: 'aburame', damage: '1W4', description: 'Angriff mit Käfer-Schwarm.' },
        { id: 'aburame_kikaichuu_2', name: 'Kikaichuu: Spionage', rank: 'C', chakra: 25, type: 'Hijutsu', element: 'neutral', clan: 'aburame', damage: null, description: 'Käfer als Spione einsetzen.' }
    ],
    akimichi: [
        { id: 'akimichi_baika_1', name: 'Baika no Jutsu', rank: 'D', chakra: 20, type: 'Hijutsu', element: 'neutral', clan: 'akimichi', damage: null, description: 'Körperteil vergrößern.' },
        { id: 'akimichi_nikudan_1', name: 'Nikudan Sensha', rank: 'C', chakra: 30, type: 'Taijutsu', element: 'neutral', clan: 'akimichi', damage: '2W6', description: 'Menschliche Kanonenkugel.' }
    ],
    nara: [
        { id: 'nara_kage_1', name: 'Kage Mane', rank: 'D', chakra: 20, type: 'Hijutsu', element: 'neutral', clan: 'nara', damage: null, description: 'Schattenfesthalt.' },
        { id: 'nara_kage_2', name: 'Kage Kubi Shibari', rank: 'C', chakra: 30, type: 'Hijutsu', element: 'neutral', clan: 'nara', damage: '1W6', description: 'Schattenwürge.' }
    ],
    yamanaka: [
        { id: 'yamanaka_shintenshin_1', name: 'Shintenshin', rank: 'D', chakra: 25, type: 'Hijutsu', element: 'neutral', clan: 'yamanaka', damage: null, description: 'Geistübertragung.' },
        { id: 'yamanaka_shishien_1', name: 'Shishien no Jutsu', rank: 'C', chakra: 30, type: 'Hijutsu', element: 'neutral', clan: 'yamanaka', damage: null, description: 'Geistfesselung.' }
    ],
    inuzuka: [
        { id: 'inuzuka_gatsuga_1', name: 'Tsuga', rank: 'D', chakra: 20, type: 'Taijutsu', element: 'neutral', clan: 'inuzuka', damage: '1W6+2', description: 'Drehende Fangattacke.' },
        { id: 'inuzuka_gatsuga_2', name: 'Gatsuga', rank: 'C', chakra: 30, type: 'Taijutsu', element: 'neutral', clan: 'inuzuka', damage: '2W6', description: 'Zweifache Drehattacke mit Partner.' }
    ],
    hozuki: [
        { id: 'hozuki_kirigakure_1', name: 'Suika no Jutsu', rank: 'D', chakra: 20, type: 'Hijutsu', element: 'wasser', clan: 'hozuki', damage: null, description: 'In Wasser verwandeln.' },
        { id: 'hozuki_namida_1', name: 'Demon Fish Rain', rank: 'C', chakra: 30, type: 'Ninjutsu', element: 'wasser', clan: 'hozuki', damage: '1W6', description: 'Wasser-Druckattacke.' }
    ],
    hoshigaki: [
        { id: 'hoshigaki_samehada_1', name: 'Samehada Bindung', rank: 'D', chakra: 20, type: 'Kenjutsu', element: 'neutral', clan: 'hoshigaki', damage: '1W8', description: 'Bindung mit Samehada.' },
        { id: 'hoshigaki_suiton_1', name: 'Suiton: Bakusui Shōha', rank: 'C', chakra: 35, type: 'Ninjutsu', element: 'wasser', clan: 'hoshigaki', damage: '2W6', description: 'Explosive Wasserwelle.' }
    ],
    yuki: [
        { id: 'yuki_hyoton_1', name: 'Hyōton: Eisnadeln', rank: 'D', chakra: 20, type: 'Kekkei Genkai', element: 'wasser', clan: 'yuki', damage: '1W4', description: 'Eisnadel-Angriff.' },
        { id: 'yuki_hyoton_2', name: 'Hyōton: Eisspiegel', rank: 'C', chakra: 30, type: 'Kekkei Genkai', element: 'wasser', clan: 'yuki', damage: null, description: 'Schützendes Eis.' }
    ],
    kaguya: [
        { id: 'kaguya_shikotsu_1', name: 'Shikotsumyaku: Knochenklinge', rank: 'D', chakra: 20, type: 'Kekkei Genkai', element: 'neutral', clan: 'kaguya', damage: '1W6', description: 'Knochen als Waffe.' },
        { id: 'kaguya_shikotsu_2', name: 'Shikotsumyaku: Tanz der Kamelie', rank: 'C', chakra: 35, type: 'Kekkei Genkai', element: 'neutral', clan: 'kaguya', damage: '2W6', description: 'Schneller Knochen-Angriff.' }
    ]
};

// Global verfügbar machen
window.CLAN_JUTSUS = CLAN_JUTSUS;

// WICHTIG: Warte bis DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOMContentLoaded - App startet ===');
    
    // Prüfe ob alle Datenbanken geladen sind
    console.log('TALENTS_DB verfügbar:', typeof TALENTS_DB !== 'undefined' ? 'JA (' + Object.keys(TALENTS_DB).length + ' Talente)' : 'NEIN');
    console.log('JUTSU_DATA verfügbar:', typeof JUTSU_DATA !== 'undefined' ? 'JA (' + JUTSU_DATA.length + ' Jutsus)' : 'NEIN');
    console.log('ITEMS_DB verfügbar:', typeof ITEMS_DB !== 'undefined' ? 'JA' : 'NEIN');
    console.log('NPUCore verfügbar:', typeof NPUCore !== 'undefined' ? 'JA' : 'NEIN');
    console.log('Rules verfügbar:', typeof Rules !== 'undefined' ? 'JA' : 'NEIN');
    console.log('JutsuSystem verfügbar:', typeof JutsuSystem !== 'undefined' ? 'JA' : 'NEIN');
    
    // Initialisiere AuthSystem
    if (typeof AuthSystem !== 'undefined') {
        AuthSystem.init();
    }
    
    // Initialisiere LiquidOrbs
    if (typeof LiquidOrbs !== 'undefined') {
        LiquidOrbs.init();
    }
    
    // Initialisiere DiceSystem
    if (typeof DiceSystem !== 'undefined') {
        DiceSystem.init();
    }
    
    // Initialisiere SessionSystem
    if (typeof SessionSystem !== 'undefined') {
        SessionSystem.init();
    }
    
    // Initialisiere JutsuSystem Tooltip
    if (typeof JutsuSystem !== 'undefined') {
        JutsuSystem.init();
    }
    
    // Initialisiere QuestSystem
    if (typeof QuestSystem !== 'undefined') {
        QuestSystem.init();
    }
    
    // Initialisiere DeathSaveSystem
    if (typeof DeathSaveSystem !== 'undefined') {
        DeathSaveSystem.init();
    }
    
    // Initialisiere StatusEffectSystem
    if (typeof StatusEffectSystem !== 'undefined') {
        StatusEffectSystem.init();
    }
    
    // BUGFIX 10: Initialisiere Sync-Listener für Live-Synchronisation
    initSyncListener();
    
    // Immer mit Login starten
    showLoginPage();
    
    // Login-Formular
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            doLogin();
        });
    }
});

function showLoginPage() {
    console.log('Zeige Login');
    const loginPage = document.getElementById('loginPage');
    const appContainer = document.getElementById('appContainer');
    
    if (loginPage) loginPage.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
}

function showApp() {
    console.log('Zeige App');
    const loginPage = document.getElementById('loginPage');
    const appContainer = document.getElementById('appContainer');
    const dmPanelContainer = document.getElementById('dmPanelContainer');
    
    if (loginPage) loginPage.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    if (dmPanelContainer) dmPanelContainer.classList.add('hidden');
}

/**
 * Zeigt das DM Panel
 */
function showDMPanel() {
    console.log('Zeige DM Panel');
    
    // BUG 9 FIX: Prüfe ob User wirklich DM ist
    const isDM = checkIsDM();
    if (!isDM) {
        console.error('[SICHERHEIT] Nicht-DM versucht DM Panel zu öffnen!');
        alert('Zugriff verweigert: Nur für DM');
        showApp();
        return;
    }
    
    const loginPage = document.getElementById('loginPage');
    const appContainer = document.getElementById('appContainer');
    const dmPanelContainer = document.getElementById('dmPanelContainer');
    
    if (loginPage) loginPage.classList.add('hidden');
    if (appContainer) appContainer.classList.add('hidden');
    if (dmPanelContainer) {
        dmPanelContainer.classList.remove('hidden');
        // Initialisiere DM Panel
        if (typeof DMPanel !== 'undefined') {
            DMPanel.init();
        }
    }
}

/**
 * Prüft ob aktueller User DM ist (BUG 9 Sicherheit)
 */
function checkIsDM() {
    // Prüfe AccountSystem
    if (typeof AccountSystem !== 'undefined' && AccountSystem.isDM) {
        return AccountSystem.isDM();
    }
    
    // Prüfe AuthSystem
    if (typeof AuthSystem !== 'undefined' && AuthSystem.getCurrentUser) {
        const user = AuthSystem.getCurrentUser();
        return user?.role === 'dm' || user?.isDM === true;
    }
    
    // Prüfe localStorage
    try {
        const stored = localStorage.getItem('npu_current_user');
        if (stored) {
            const user = JSON.parse(stored);
            return user?.role === 'dm' || user?.isDM === true;
        }
    } catch (e) {
        console.error('Fehler beim Prüfen der DM-Rolle:', e);
    }
    
    return false;
}

function doLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login versuch:', username);
    
    // Verwende das neue Account System
    if (typeof AccountSystem !== 'undefined') {
        const result = AccountSystem.login(username, password);
        
        if (!result.success) {
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) {
                errorDiv.textContent = result.error;
                errorDiv.classList.add('show');
            }
            return;
        }
        
        // Login erfolgreich
        if (result.isDM) {
            showDMPanel();
            document.getElementById('currentUser').textContent = username;
            document.getElementById('currentRole').textContent = 'DM';
            if (document.getElementById('dmPanelBtn')) {
                document.getElementById('dmPanelBtn').classList.remove('hidden');
            }
        } else {
            showApp();
            document.getElementById('currentUser').textContent = username;
            document.getElementById('currentRole').textContent = 'Spieler';
            if (document.getElementById('dmPanelBtn')) {
                document.getElementById('dmPanelBtn').classList.add('hidden');
            }
            initApp();
        }
        
        return;
    }
    
    // Fallback zu altem Login-System
    legacyDoLogin(username, password);
}

function legacyDoLogin(username, password) {
    // WICHTIG: Lösche alten Charakter beim Login
    window.currentCharacter = null;
    
    // Test-Login ohne AuthAPI
    if (username === 'Alex' && password === 'Alex-Osterhase-1993') {
        // DM Login
        if (typeof AuthSystem !== 'undefined') {
            AuthSystem.currentUser = {
                id: 'user_alex_dm',
                username: 'Alex',
                email: 'dm@frostfels.de',
                role: 'dm'
            };
        }
        
        showDMPanel();
        document.getElementById('currentUser').textContent = 'Alex';
        document.getElementById('currentRole').textContent = 'DM';
        if (document.getElementById('dmPanelBtn')) {
            document.getElementById('dmPanelBtn').classList.remove('hidden');
        }
    } else if (['Niklas', 'Sascha', 'Richard', 'Michael', 'Kevin'].includes(username) && password === 'Naruto') {
        // Spieler Login
        if (typeof AuthSystem !== 'undefined') {
            AuthSystem.currentUser = {
                id: 'user_' + username.toLowerCase(),
                username: username,
                email: username.toLowerCase() + '@frostfels.de',
                role: 'player'
            };
            localStorage.setItem('npu_current_user', JSON.stringify(AuthSystem.currentUser));
        }
        
        showApp();
        document.getElementById('currentUser').textContent = username;
        document.getElementById('currentRole').textContent = 'Spieler';
        if (document.getElementById('dmPanelBtn')) {
            document.getElementById('dmPanelBtn').classList.add('hidden');
        }
        initApp();
    } else {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = 'Falsche Anmeldedaten!';
            errorDiv.classList.add('show');
        }
    }
}

function logout() {
    console.log('[Logout] Starte Logout-Prozess...');
    
    // WICHTIG: DM Panel explizit verstecken (BUG 9 Fix)
    const dmPanelContainer = document.getElementById('dmPanelContainer');
    if (dmPanelContainer) {
        dmPanelContainer.classList.add('hidden');
        console.log('[Logout] DM Panel versteckt');
    }
    
    // App Container anzeigen (für nächsten Login)
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
        appContainer.classList.remove('hidden');
    }
    
    // Verwende das neue Account System
    if (typeof AccountSystem !== 'undefined') {
        AccountSystem.logout();
    }
    
    // Fallback
    if (typeof AuthSystem !== 'undefined') {
        AuthSystem.currentUser = null;
    }
    localStorage.removeItem('npu_current_user');
    window.currentCharacter = null;
    
    // DM Button verstecken
    const dmPanelBtn = document.getElementById('dmPanelBtn');
    if (dmPanelBtn) {
        dmPanelBtn.classList.add('hidden');
    }
    
    AuthAPI.logout();
    showLoginPage();
    
    console.log('[Logout] Abgeschlossen');
}

// ============================================
// PASSWORT RESET SYSTEM
// ============================================

// Speicher für Reset-Tokens (im echten System wäre das in der Datenbank)
const passwordResetTokens = {};

/**
 * Zeigt das Passwort-vergessen Formular
 */
function showForgotPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.querySelector('.forgot-password-link').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
    document.getElementById('resetMessage').textContent = '';
    document.getElementById('resetMessage').className = 'reset-message';
}

/**
 * Versteckt das Passwort-vergessen Formular
 */
function hideForgotPassword() {
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.querySelector('.forgot-password-link').classList.remove('hidden');
    document.getElementById('resetEmail').value = '';
    document.getElementById('resetMessage').textContent = '';
}

/**
 * Fordert einen Passwort-Reset an
 */
function requestPasswordReset() {
    const email = document.getElementById('resetEmail').value;
    const messageEl = document.getElementById('resetMessage');
    
    if (!email || !email.includes('@')) {
        messageEl.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        messageEl.className = 'reset-message error';
        return;
    }
    
    // Generiere 6-stelligen Token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Speichere Token mit Ablaufzeit (30 Minuten)
    passwordResetTokens[email] = {
        token: token,
        expires: Date.now() + (30 * 60 * 1000), // 30 Minuten
        used: false
    };
    
    // Simuliere E-Mail-Versand
    console.log('=== PASSWORT RESET ===');
    console.log('E-Mail:', email);
    console.log('Reset-Code:', token);
    console.log('======================');
    
    // Zeige Erfolgsmeldung
    messageEl.innerHTML = `
        <strong>Reset-Link gesendet!</strong><br>
        <small>(In einer echten Anwendung würde dieser per E-Mail verschickt)</small><br>
        <strong>Dein Code: ${token}</strong>
    `;
    messageEl.className = 'reset-message success';
    
    // Nach 3 Sekunden zum Token-Formular wechseln
    setTimeout(() => {
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        document.getElementById('resetTokenForm').classList.remove('hidden');
        document.getElementById('resetTokenMessage').textContent = '';
        document.getElementById('resetTokenMessage').className = 'reset-message';
    }, 3000);
}

/**
 * Versteckt das Token-Formular
 */
function hideResetTokenForm() {
    document.getElementById('resetTokenForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.querySelector('.forgot-password-link').classList.remove('hidden');
    
    // Felder zurücksetzen
    document.getElementById('resetToken').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('resetTokenMessage').textContent = '';
}

/**
 * Setzt das Passwort zurück
 */
function resetPassword() {
    const token = document.getElementById('resetToken').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('resetTokenMessage');
    
    // Validierung
    if (!token || token.length !== 6) {
        messageEl.textContent = 'Bitte gib den 6-stelligen Code ein.';
        messageEl.className = 'reset-message error';
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        messageEl.textContent = 'Das Passwort muss mindestens 6 Zeichen haben.';
        messageEl.className = 'reset-message error';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        messageEl.textContent = 'Die Passwörter stimmen nicht überein.';
        messageEl.className = 'reset-message error';
        return;
    }
    
    // Suche Token
    let found = false;
    let email = null;
    
    for (const [e, data] of Object.entries(passwordResetTokens)) {
        if (data.token === token && !data.used && data.expires > Date.now()) {
            found = true;
            email = e;
            break;
        }
    }
    
    if (!found) {
        messageEl.textContent = 'Ungültiger oder abgelaufener Code.';
        messageEl.className = 'reset-message error';
        return;
    }
    
    // Token als verwendet markieren
    passwordResetTokens[email].used = true;
    
    // Erfolgsmeldung
    messageEl.innerHTML = `
        <strong>Passwort erfolgreich geändert!</strong><br>
        Du kannst dich jetzt mit dem neuen Passwort anmelden.
    `;
    messageEl.className = 'reset-message success';
    
    // Nach 2 Sekunden zurück zum Login
    setTimeout(() => {
        hideResetTokenForm();
    }, 2000);
}

// ============================================
// CHARAKTER ERSTELLUNG WIZARD
// ============================================

let creationStep = 1;
const totalCreationSteps = 5;

/**
 * Startet den Charakter-Erstellungs-Wizard
 */
function startCharacterCreation() {
    creationStep = 1;
    showCreationStep(1);
    document.getElementById('characterCreationModal').classList.remove('hidden');
}

/**
 * Zeigt einen bestimmten Schritt des Erstellungs-Wizards
 */
function showCreationStep(step) {
    // Verstecke alle Schritte
    for (let i = 1; i <= totalCreationSteps; i++) {
        const stepEl = document.getElementById(`creationStep${i}`);
        if (stepEl) stepEl.classList.add('hidden');
    }
    
    // Zeige aktuellen Schritt
    const currentStepEl = document.getElementById(`creationStep${step}`);
    if (currentStepEl) currentStepEl.classList.remove('hidden');
    
    // Aktualisiere Fortschrittsbalken
    const progress = (step / totalCreationSteps) * 100;
    document.getElementById('creationProgress').style.width = `${progress}%`;
    document.getElementById('creationStepCounter').textContent = `Schritt ${step} von ${totalCreationSteps}`;
    
    // Button-Status aktualisieren
    document.getElementById('creationPrevBtn').disabled = (step === 1);
    document.getElementById('creationNextBtn').textContent = (step === totalCreationSteps) ? 'Fertigstellen' : 'Weiter';
    
    // Lade dynamische Inhalte
    if (step === 4) {
        loadCreationJutsuList();
    } else if (step === 5) {
        loadCreationTalentList();
    }
}

/**
 * Nächster Schritt im Erstellungs-Wizard
 */
function nextCreationStep() {
    // Validiere aktuellen Schritt
    if (!validateCreationStep(creationStep)) {
        return;
    }
    
    if (creationStep < totalCreationSteps) {
        creationStep++;
        showCreationStep(creationStep);
    } else {
        // Letzter Schritt - Charakter erstellen
        finishCharacterCreation();
    }
}

/**
 * Vorheriger Schritt im Erstellungs-Wizard
 */
function prevCreationStep() {
    if (creationStep > 1) {
        creationStep--;
        showCreationStep(creationStep);
    }
}

/**
 * Validiert den aktuellen Erstellungsschritt
 */
function validateCreationStep(step) {
    const errorEl = document.getElementById('creationError');
    errorEl.textContent = '';
    
    switch(step) {
        case 1: // Persönliche Daten
            const name = document.getElementById('charCreateName').value;
            if (!name || name.length < 2) {
                errorEl.textContent = 'Bitte gib einen gültigen Namen ein.';
                return false;
            }
            break;
            
        case 2: // Clan und Element
            const clan = document.getElementById('charCreateClan').value;
            if (!clan) {
                errorEl.textContent = 'Bitte wähle einen Clan aus.';
                return false;
            }
            break;
            
        case 3: // Attribute
            // Attribute werden automatisch validiert
            break;
            
        case 4: // Jutsus
            const selectedJutsus = document.querySelectorAll('.jutsu-select:checked');
            if (selectedJutsus.length === 0) {
                errorEl.textContent = 'Wähle mindestens ein Jutsu aus.';
                return false;
            }
            if (selectedJutsus.length > 6) {
                errorEl.textContent = 'Du kannst maximal 6 Jutsus wählen.';
                return false;
            }
            break;
            
        case 5: // Talente
            // Talente sind optional
            break;
    }
    
    return true;
}

/**
 * Beendet die Charakter-Erstellung
 */
function finishCharacterCreation() {
    // Sammle alle Daten
    const charData = {
        name: document.getElementById('charCreateName').value,
        age: parseInt(document.getElementById('charCreateAge').value) || 16,
        gender: document.getElementById('charCreateGender').value,
        height: document.getElementById('charCreateHeight').value + ' cm',
        weight: document.getElementById('charCreateWeight').value + ' kg',
        originCountry: document.getElementById('charCreateOriginCountry').value,
        homeVillage: document.getElementById('charCreateHomeVillage').value,
        rank: document.getElementById('charCreateRank').value,
        clan: document.getElementById('charCreateClan').value,
        maritalStatus: document.getElementById('charCreateMaritalStatus')?.value || '',
        religion: document.getElementById('charCreateReligion')?.value || '',
        level: 1,
        ap: 0
    };
    
    // Erstelle neuen Charakter
    createNewCharacter();
    
    // Übertrage Daten
    Object.assign(window.currentCharacter, charData);
    
    // Karma initialisieren
    window.currentCharacter.stats.karma = 0;
    
    // Attribute übernehmen
    const attrs = ['kk', 'kon', 'ges', 'gsw', 'itu', 'int', 'cha'];
    attrs.forEach(attr => {
        const val = parseInt(document.getElementById(`charCreateAttr_${attr}`).value);
        if (val) window.currentCharacter.baseAttributes[attr] = val;
    });
    
    // Jutsus übernehmen
    const selectedJutsus = document.querySelectorAll('.jutsu-select:checked');
    selectedJutsus.forEach(cb => {
        const jutsuId = cb.dataset.jutsuId;
        const jutsu = JUTSU_DATA.find(j => j.id === jutsuId);
        if (jutsu) {
            window.currentCharacter.jutsus.push({
                jutsuId: jutsu.id,
                name: jutsu.name,
                rank: jutsu.rank,
                type: jutsu.type,
                element: jutsu.element,
                chakraCost: jutsu.chakra,
                damage: jutsu.damage,
                learned: true,
                level: 1
            });
        }
    });
    
    // Talente übernehmen
    const selectedTalents = document.querySelectorAll('.talent-select:checked');
    selectedTalents.forEach(cb => {
        const talentId = cb.dataset.talentId;
        const talent = TALENTS_DB[talentId];
        if (talent) {
            window.currentCharacter.talents.push({
                id: talentId,
                name: talent.name,
                cost: talent.cost
            });
        }
    });
    
    // Geld auswürfeln (W100 x 6 = Kupfer)
    const goldRoll = Math.floor(Math.random() * 100) + 1;
    const startingCopper = goldRoll * 6;
    window.currentCharacter.money = { gold: 0, silver: 0, copper: startingCopper };
    
    // Elemente übernehmen
    const selectedElements = [];
    document.querySelectorAll('#charCreateElements .element-option.selected').forEach(el => {
        selectedElements.push(el.dataset.element);
    });
    window.currentCharacter.elements = selectedElements;
    
    // Modal schließen
    document.getElementById('characterCreationModal').classList.add('hidden');
    
    // Berechnungen durchführen
    calculateAll();
    
    // UI aktualisieren
    renderCharacter();
    
    // Speichern
    saveCharacter();
    
    // Erfolgsmeldung mit Geld-Info
    alert(`Charakter "${charData.name}" wurde erfolgreich erstellt!\n\nStartgeld: ${goldRoll} x 6 = ${startingCopper} Kupfer`);
}

/**
 * Schließt den Erstellungs-Wizard ohne Speichern
 */
function cancelCharacterCreation() {
    if (confirm('Möchtest du die Charakter-Erstellung wirklich abbrechen? Alle Eingaben gehen verloren.')) {
        document.getElementById('characterCreationModal').classList.add('hidden');
        // Erstelle Standard-Charakter
        createNewCharacter();
        renderCharacter();
    }
}

/**
 * Aktualisiert die verbleibenden Attributpunkte im Wizard
 * Regel: Max 16 pro Attribut, 26 Punkte insgesamt
 */
function updateAttrPoints() {
    const attrs = ['kk', 'kon', 'ges', 'gsw', 'itu', 'int', 'cha'];
    let spent = 0;
    let hasError = false;
    
    attrs.forEach(attr => {
        const input = document.getElementById(`charCreateAttr_${attr}`);
        let val = parseInt(input?.value) || 8;
        
        // Regel: Max 16
        if (val > 16) {
            val = 16;
            input.value = 16;
            hasError = true;
        }
        
        // Regel: Min 8
        if (val < 8) {
            val = 8;
            input.value = 8;
        }
        
        spent += (val - 8);
    });
    
    const remaining = 26 - spent;
    const el = document.getElementById('attrPointsRemaining');
    const errorEl = document.getElementById('creationError');
    
    if (el) {
        el.textContent = remaining;
        el.style.color = remaining < 0 ? '#dc3545' : (remaining === 0 ? '#28a745' : '#b22222');
    }
    
    // Validierung
    if (remaining < 0) {
        errorEl.textContent = 'Du hast zu viele Punkte verteilt!';
    } else if (hasError) {
        errorEl.textContent = 'Attribute können maximal auf 16 gesteigert werden!';
    } else {
        errorEl.textContent = '';
    }
}

/**
 * Togglet ein Element im Erstellungs-Wizard
 */
function toggleCreationElement(element) {
    const el = document.querySelector(`#charCreateElements .element-option[data-element="${element}"]`);
    if (el) {
        el.classList.toggle('selected');
    }
}

/**
 * Lädt die Jutsu-Liste für den Erstellungs-Wizard
 * Filter: Clan, Element, Max 1 B-Rang
 */
function loadCreationJutsuList() {
    const container = document.getElementById('creationJutsuList');
    if (!container || typeof JUTSU_DATA === 'undefined') return;
    
    // Hole ausgewählten Clan und Elemente
    const selectedClan = document.getElementById('charCreateClan')?.value || '';
    const selectedElements = [];
    document.querySelectorAll('#charCreateElements .element-option.selected').forEach(el => {
        selectedElements.push(el.dataset.element);
    });
    
    // Filter: Nur E, D, C, B Rang
    let availableJutsus = JUTSU_DATA.filter(j => ['E', 'D', 'C', 'B'].includes(j.rank));
    
    // Filter: Nach Element (wenn Elemente ausgewählt)
    if (selectedElements.length > 0) {
        availableJutsus = availableJutsus.filter(j => {
            // Neutral immer erlaubt
            if (!j.element || j.element === 'neutral') return true;
            // Sonst muss Element passen
            return selectedElements.includes(j.element);
        });
    }
    
    // Clan-Jutsus (Kekkei Genkai) hinzufügen
    if (selectedClan && CLAN_JUTSUS[selectedClan]) {
        const clanJutsus = CLAN_JUTSUS[selectedClan].filter(j => ['E', 'D', 'C', 'B'].includes(j.rank));
        availableJutsus = [...availableJutsus, ...clanJutsus];
    }
    
    // Duplikate entfernen (nach ID)
    const seen = new Set();
    availableJutsus = availableJutsus.filter(j => {
        if (seen.has(j.id)) return false;
        seen.add(j.id);
        return true;
    });
    
    container.innerHTML = availableJutsus.map(jutsu => {
        const isClanJutsu = jutsu.clan ? 'clan-jutsu' : '';
        const clanLabel = jutsu.clan ? `<span class="clan-badge">${jutsu.clan}</span>` : '';
        
        return `
            <div class="jutsu-item ${isClanJutsu}">
                <input type="checkbox" class="jutsu-select" data-jutsu-id="${jutsu.id}" data-rank="${jutsu.rank}" id="jutsu_${jutsu.id}" onchange="onJutsuSelectChange()">
                <div class="jutsu-info">
                    <div class="name">${jutsu.name} ${clanLabel}</div>
                    <div class="details">${jutsu.type} | ${jutsu.chakra} Chakra${jutsu.element ? ' | ' + jutsu.element : ''}</div>
                </div>
                <span class="jutsu-rank ${jutsu.rank}">${jutsu.rank}</span>
            </div>
        `;
    }).join('');
}

/**
 * Wird aufgerufen wenn ein Jutsu ausgewählt/abgewählt wird
 * Enforced: Max 1 B-Rang
 */
function onJutsuSelectChange() {
    const selectedJutsus = document.querySelectorAll('.jutsu-select:checked');
    const bRankSelected = document.querySelectorAll('.jutsu-select:checked[data-rank="B"]');
    const errorEl = document.getElementById('creationError');
    
    // Max 6 Jutsus
    if (selectedJutsus.length > 6) {
        errorEl.textContent = 'Du kannst maximal 6 Jutsus wählen!';
        // Letzte Auswahl rückgängig machen
        event.target.checked = false;
        return;
    }
    
    // Max 1 B-Rang
    if (bRankSelected.length > 1) {
        errorEl.textContent = 'Du kannst maximal 1 B-Rang Jutsu wählen!';
        // Letzte Auswahl rückgängig machen
        event.target.checked = false;
        return;
    }
    
    // Keine A oder S Rangs (sollten bereits gefiltert sein)
    const aRankSelected = document.querySelectorAll('.jutsu-select:checked[data-rank="A"], .jutsu-select:checked[data-rank="S"]');
    if (aRankSelected.length > 0) {
        errorEl.textContent = 'A und S Rang Jutsus sind für Level 1 nicht erlaubt!';
        event.target.checked = false;
        return;
    }
    
    errorEl.textContent = '';
}

/**
 * Lädt die Talent-Liste für den Erstellungs-Wizard
 */
function loadCreationTalentList() {
    const container = document.getElementById('creationTalentList');
    if (!container || typeof TALENTS_DB === 'undefined') return;
    
    const talents = Object.entries(TALENTS_DB);
    
    container.innerHTML = talents.map(([id, talent]) => `
        <div class="talent-item">
            <input type="checkbox" class="talent-select" data-talent-id="${id}" id="talent_${id}">
            <div class="talent-info">
                <div class="name">${talent.name}</div>
                <div class="cost">${talent.cost} Punkte</div>
            </div>
        </div>
    `).join('');
}

function initApp() {
    console.log('=== initApp() START ===');
    
    // StateManager ist bereits über DOMContentLoaded initialisiert (state-manager.js:344-347)
    if (typeof StateManager !== 'undefined') {
        console.log('StateManager verfügbar, Version 4.0');
    }
    
    // WICHTIG: Lösche alten globalen Speicher um Verwechslungen zu vermeiden
    localStorage.removeItem('npu_characters');
    
    // WICHTIG: Lade zuerst die Session
    const savedUser = localStorage.getItem('npu_current_user');
    if (savedUser && typeof AuthSystem !== 'undefined') {
        AuthSystem.currentUser = JSON.parse(savedUser);
        console.log('Session wiederhergestellt für:', AuthSystem.currentUser.username);
    }
    
    // BUGFIX 13: Lade Charaktere des aktuellen Users
    const characters = loadCharacters();
    console.log('Geladene Charaktere für', AuthSystem.currentUser?.username, ':', characters.length);
    
    // Wenn kein Charakter existiert, starte den Erstellungs-Wizard
    if (characters.length === 0) {
        console.log('Keine Charaktere gefunden - starte Erstellungs-Wizard');
        startCharacterCreation();
    } else {
        // Lade den ersten Charakter
        window.currentCharacter = characters[0];
        console.log('Charakter geladen:', window.currentCharacter.name, 'für User:', AuthSystem.currentUser?.username);
        renderCharacter();
    }
    
    // 2. Dropdowns befüllen
    console.log('Befülle Dropdowns...');
    updateTalentDropdown();
    updateJutsuDropdown();
    
    // 3. Initialberechnung durchführen
    console.log('Führe Initialberechnung durch...');
    calculateAll();
    
    // 4. Attribut-Modifikatoren aktualisieren
    updateAttributeModifiers();
    
    // 5. UI rendern
    console.log('Rendere UI...');
    renderCharacter();
    updateTalentDisplay();
    
    // 6. Erste Seite anzeigen
    console.log('Zeige Seite 1...');
    showPage(1);
    
    console.log('=== initApp() ENDE ===');
}

function createNewCharacter() {
    window.currentCharacter = {
        id: Date.now(),
        name: '',
        level: 1,
        rank: '',
        age: null,
        clan: '',
        
        // Neue Felder
        gender: '',
        height: '',
        weight: '',
        originCountry: '',
        homeVillage: '',
        maritalStatus: '',
        religion: '',
        
        elements: [],
        
        // Primäre Attribute
        baseAttributes: {
            kk: 8, kon: 8, ges: 8, gsw: 8,
            itu: 8, int: 8, cha: 8
        },
        
        // Hauptwerte
        stats: {
            hp: { current: 30, max: 30 },
            chakra: { current: 100, max: 100 },
            stamina: 3,
            aufladungen: 0,
            karma: 0
        },
        
        // Kampfwerte
        combat: {
            initiative: 5,
            ausweichen: 5,
            angriff: 2,
            rk: 8,
            ninjutsu: 0,
            taijutsu: 0,
            genjutsu: 0,
            chakraWiderstand: 10,
            geistigerWiderstand: 10,
            wahrnehmung: 10,
            bewegungsradius: 10,
            inspiration: 0,
            hasReacted: false
        },
        
        // Widerstände
        resistances: {
            chakra: 10,
            koerper: 10,
            geist: 10
        },
        
        // Fertigkeiten
        skills: {},
        
        // Jutsu-Fortschritt
        jutsuProgress: {
            unlocks: 0,
            maxTraining: 2
        },
        
        // Jutsus
        jutsus: [],
        
        // Kekkei Genkai
        kekkeiGenkai: null,
        
        // Status-Effekte
        statusEffects: [],
        
        // Ausrüstung
        equipment: {
            head: null, chest: null, armLeft: null, armRight: null,
            legLeft: null, legRight: null, weapon1: null, weapon2: null, accessory: null
        },
        
        // Inventar
        inventory: [],
        money: { gold: 0, silver: 0, copper: 0 },
        
        // AP-System
        ap: 0,
        attributePoints: {
            total: 26,
            spent: 0
        },
        
        // Talente
        talents: [],
        
        // Meta
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    // Fertigkeiten initial berechnen (nach window.currentCharacter Zuweisung)
    // calculateAllSkills wird später in calculateAll() aufgerufen
    
    renderCharacter();
    updateElementFilterDisplay();
    updateJutsuDropdown();
    updateTalentDropdown();
}

function renderCharacter() {
    if (!window.currentCharacter) return;
    
    const char = window.currentCharacter;
    
    // Quest-System mit aktuellem Charakter synchronisieren
    if (typeof QuestSystem !== 'undefined') {
        QuestSystem.checkDailyReset();
    }
    
    // Globale Geld-Anzeige aktualisieren
    updateGlobalMoneyDisplay();
    
    // Ausrüstungstabelle aktualisieren
    updateEquipmentTable();
    
    // Basis-Felder
    if (document.getElementById('name')) document.getElementById('name').value = char.name || '';
    if (document.getElementById('level')) document.getElementById('level').value = char.level;
    if (document.getElementById('rank')) document.getElementById('rank').value = char.rank || '';
    if (document.getElementById('age')) document.getElementById('age').value = char.age || '';
    if (document.getElementById('clan')) document.getElementById('clan').value = char.clan || '';
    
    // Neue Felder
    if (document.getElementById('gender')) document.getElementById('gender').value = char.gender || '';
    if (document.getElementById('height')) document.getElementById('height').value = char.height || '';
    if (document.getElementById('weight')) document.getElementById('weight').value = char.weight || '';
    if (document.getElementById('originCountry')) document.getElementById('originCountry').value = char.originCountry || '';
    if (document.getElementById('homeVillage')) document.getElementById('homeVillage').value = char.homeVillage || '';
    if (document.getElementById('maritalStatus')) document.getElementById('maritalStatus').value = char.maritalStatus || '';
    if (document.getElementById('religion')) document.getElementById('religion').value = char.religion || '';
    // BUGFIX 14: Karma sauber anzeigen mit visueller Skala
    const karmaDisplay = document.getElementById('karmaDisplay');
    const karmaBarFill = document.getElementById('karmaBarFill');
    const karmaMarker = document.getElementById('karmaMarker');
    
    const karmaValue = char.karma || 0;
    
    if (karmaDisplay) {
        karmaDisplay.textContent = karmaValue > 0 ? `+${karmaValue}` : karmaValue;
        karmaDisplay.className = `karma-value ${karmaValue > 0 ? 'positive' : karmaValue < 0 ? 'negative' : 'neutral'}`;
    }
    
    // BUGFIX 14: Karma-Balken und Marker positionieren
    if (karmaBarFill && karmaMarker) {
        // Berechne Position (-50 bis +50 = 0% bis 100%)
        const percentage = ((karmaValue + 50) / 100) * 100;
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        
        // Balken-Füllung (von Mitte aus)
        if (karmaValue >= 0) {
            karmaBarFill.style.left = '50%';
            karmaBarFill.style.width = `${(karmaValue / 50) * 50}%`;
            karmaBarFill.className = 'karma-bar-fill positive';
        } else {
            karmaBarFill.style.left = `${50 - (Math.abs(karmaValue) / 50) * 50}%`;
            karmaBarFill.style.width = `${(Math.abs(karmaValue) / 50) * 50}%`;
            karmaBarFill.className = 'karma-bar-fill negative';
        }
        
        // Marker Position
        karmaMarker.style.left = `${clampedPercentage}%`;
    }
    
    // Hidden input für DM/System-Änderungen
    if (document.getElementById('karma')) document.getElementById('karma').value = karmaValue;
    
    // Geld - synchron auf allen Seiten
    if (document.getElementById('gold')) document.getElementById('gold').value = char.money?.gold || 0;
    if (document.getElementById('silver')) document.getElementById('silver').value = char.money?.silver || 0;
    if (document.getElementById('copper')) document.getElementById('copper').value = char.money?.copper || 0;
    
    // Elemente rendern
    renderElementSelector();
    
    // Attribute
    for (const attr in char.baseAttributes) {
        const el = document.getElementById('attr_' + attr);
        if (el) el.value = char.baseAttributes[attr];
    }
    
    // AP-Anzeige aktualisieren
    updateAPDisplay();
    
    // DM-Button nur für DM anzeigen
    const apActions = document.getElementById('apActions');
    if (apActions) {
        apActions.style.display = isDM() ? 'flex' : 'none';
    }
    
    // Talente aktualisieren
    updateTalentDisplay();
    
    // Skills rendern
    renderSkills();
    
    // Alle Berechnungen durchführen
    calculateAll();
    
    // Skills nochmals aktualisieren nach Berechnung
    updateSkillsDisplay();
    
    // UI-Updates
    renderJutsuTable();
    renderJutsuCards();
    updateElementFilterDisplay();
    updateJutsuDropdown();
    updateEquipmentDisplay();
    updateEquipmentList();
    updateEquipmentStatsTable();
}

// ============================================
// ELEMENT-SYSTEM (Mehrfachauswahl)
// ============================================

function toggleElement(element) {
    if (!window.currentCharacter) return;
    
    const index = window.currentCharacter.elements.indexOf(element);
    if (index > -1) {
        // Element entfernen
        window.currentCharacter.elements.splice(index, 1);
    } else {
        // Element hinzufügen
        window.currentCharacter.elements.push(element);
    }
    
    renderElementSelector();
    updateElementFilterDisplay();
    updateJutsuDropdown();
    autoSave();
}

function renderElementSelector() {
    const options = document.querySelectorAll('.element-option');
    options.forEach(option => {
        const element = option.dataset.element;
        if (window.currentCharacter && window.currentCharacter.elements.includes(element)) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Selected Elements Tags anzeigen
    const container = document.getElementById('selectedElements');
    if (container && window.currentCharacter) {
        if (window.currentCharacter.elements.length === 0) {
            container.innerHTML = '';
        } else {
            container.innerHTML = window.currentCharacter.elements.map(el => {
                const elementData = ELEMENT_DATA[el];
                return `<span class="selected-element-tag">${elementData ? elementData.icon : ''} ${elementData ? elementData.name : el}</span>`;
            }).join('');
        }
    }
}

function updateElementFilterDisplay() {
    const container = document.getElementById('elementFilterDisplay');
    if (!container || !window.currentCharacter) return;
    
    if (window.currentCharacter.elements.length === 0) {
        container.innerHTML = '<p class="hint">Wähle Elemente auf der Charakterseite aus, um Jutsus zu filtern.</p>';
        return;
    }
    
    const elementsHtml = window.currentCharacter.elements.map(el => {
        const elementData = ELEMENT_DATA[el];
        return `<span class="element-filter-tag ${el}">${elementData ? elementData.icon : ''} ${elementData ? elementData.name : el}</span>`;
    }).join('');
    
    container.innerHTML = `
        <p style="margin-bottom: 10px; font-weight: 600;">Aktive Element-Filter:</p>
        <div class="element-filter-tags">${elementsHtml}</div>
        <p style="margin-top: 10px; font-size: 12px; color: #666;">Nur Jutsus dieser Elemente + neutrale Jutsus werden angezeigt.</p>
    `;
}

function updateCharacter() {
    if (!window.currentCharacter) return;
    
    // Basisdaten
    window.currentCharacter.name = document.getElementById('name')?.value || '';
    window.currentCharacter.level = parseInt(document.getElementById('level')?.value) || 1;
    window.currentCharacter.rank = document.getElementById('rank')?.value || '';
    window.currentCharacter.age = parseInt(document.getElementById('age')?.value) || null;
    window.currentCharacter.clan = document.getElementById('clan')?.value || '';
    
    // Neue Felder
    window.currentCharacter.gender = document.getElementById('gender')?.value || '';
    window.currentCharacter.height = document.getElementById('height')?.value || '';
    window.currentCharacter.weight = document.getElementById('weight')?.value || '';
    window.currentCharacter.originCountry = document.getElementById('originCountry')?.value || '';
    window.currentCharacter.homeVillage = document.getElementById('homeVillage')?.value || '';
    window.currentCharacter.maritalStatus = document.getElementById('maritalStatus')?.value || '';
    window.currentCharacter.religion = document.getElementById('religion')?.value || '';
    
    // BUGFIX 11: Karma wird nicht mehr aus dem Input gelesen
    // Karma darf nur durch Spielsysteme (Quests, Entscheidungen, DM) verändert werden
    // window.currentCharacter.karma = parseInt(document.getElementById('karma')?.value) || 0;
    
    // BUGFIX 4: Geld und Inventar synchronisieren
    updateMoney();
    updateInventory();
    
    // UI Updates
    document.getElementById('charLevel').textContent = window.currentCharacter.level;
    document.getElementById('charAP').textContent = window.currentCharacter.ap || 0;
    
    calculateAll();
    updateJutsuDropdown();
}

function onClanChange() {
    const clan = document.getElementById('clan')?.value;
    if (clan && window.currentCharacter) {
        // Auto-Element basierend auf Clan hinzufügen
        const clanElements = {
            'uchiha': 'feuer',
            'hoshigaki': 'wasser',
            'hozuki': 'wasser',
            'yuki': 'kristall',
            'guren': 'kristall'  // BUGFIX 12: Guren Clan mit Kristallversteck
        };
        
        if (clanElements[clan] && !window.currentCharacter.elements.includes(clanElements[clan])) {
            window.currentCharacter.elements.push(clanElements[clan]);
            renderElementSelector();
            updateElementFilterDisplay();
            updateJutsuDropdown();
        }
    }
    updateCharacter();
}

function updateAttribute(attr) {
    if (!window.currentCharacter) return;
    
    // BUGFIX 1: Attribute können nach Charaktererstellung nicht mehr frei manipuliert werden
    // Nur erlaubt wenn Attributpunkte durch Level-Up verfügbar sind
    const availablePoints = window.currentCharacter.availableAttributePoints || 0;
    
    // Wenn keine Punkte verfügbar, Änderung komplett blockieren
    if (availablePoints <= 0) {
        console.log('Attribute-Änderung blockiert: Keine Attributpunkte verfügbar');
        // Input auf aktuellen Wert zurücksetzen
        const currentValue = window.currentCharacter.baseAttributes[attr] || 8;
        const input = document.getElementById('attr_' + attr);
        if (input) input.value = currentValue;
        return;
    }
    
    const input = document.getElementById('attr_' + attr);
    if (!input) return;
    
    const oldValue = window.currentCharacter.baseAttributes[attr] || 8;
    let newValue = parseInt(input.value) || 8;
    newValue = Math.max(8, Math.min(20, newValue));
    
    // BUGFIX 1: Senken von Attributen ist nach Charaktererstellung verboten
    if (newValue < oldValue) {
        console.log('Attribute-Senkung blockiert: Nicht erlaubt nach Charaktererstellung');
        input.value = oldValue;
        return;
    }
    
    // Prüfe ob genug Punkte für Erhöhung vorhanden
    const cost = newValue - oldValue;
    if (cost > availablePoints) {
        console.log('Attribute-Erhöhung blockiert: Nicht genug Punkte');
        input.value = oldValue;
        return;
    }
    
    input.value = newValue;
    window.currentCharacter.baseAttributes[attr] = newValue;
    window.currentCharacter.availableAttributePoints = availablePoints - cost;
    
    // Modifikator sofort aktualisieren
    updateAttributeModifiers();
    
    calculateAll();
}

/**
 * Aktualisiert die Attribut-Modifikatoren in der UI
 */
function updateAttributeModifiers() {
    if (!window.currentCharacter) return;
    
    const attrs = window.currentCharacter.baseAttributes;
    
    // Hilfsfunktion: Wert zu Modifikator
    const valueToMod = (val) => {
        if (val <= 7) return -2;
        if (val <= 9) return -1;
        if (val <= 11) return 0;
        if (val <= 13) return 1;
        if (val <= 15) return 2;
        if (val <= 17) return 3;
        if (val <= 19) return 4;
        return 5;
    };
    
    // Modifikatoren für alle Attribute aktualisieren
    const attrNames = ['kk', 'kon', 'ges', 'gsw', 'itu', 'int', 'cha'];
    attrNames.forEach(attr => {
        const modEl = document.getElementById('mod_' + attr);
        if (modEl) {
            const value = attrs[attr] || 8;
            const mod = valueToMod(value);
            modEl.textContent = mod >= 0 ? `+${mod}` : mod;
            
            // CSS-Klasse basierend auf Modifikator setzen
            modEl.className = 'modifier-value';
            if (mod > 0) {
                modEl.classList.add('positive');
            } else if (mod < 0) {
                modEl.classList.add('negative');
            } else {
                modEl.classList.add('neutral');
            }
        }
    });
}

/**
 * Rendert alle Skills (verwendet jetzt Rules.SKILLS)
 */
function renderSkills() {
    if (!window.currentCharacter || !window.currentCharacter.skills) return;
    
    const skills = window.currentCharacter.skills;
    
    // Hilfsfunktion zum Anzeigen einer Fertigkeit
    const displaySkill = (skillData) => {
        if (typeof skillData === 'object' && skillData !== null) {
            // Neues Format: { base: X, mod: Y }
            const mod = skillData.mod;
            return `${skillData.base} (${mod >= 0 ? '+' : ''}${mod})`;
        }
        // Altes Format: nur Zahl
        return skillData;
    };
    
    // Körperliche Fertigkeiten
    if (skills.koerperlich) {
        for (const skillKey in skills.koerperlich) {
            const el = document.getElementById('skill_' + skillKey);
            if (el) el.textContent = displaySkill(skills.koerperlich[skillKey]);
        }
    }
    
    // Soziale Fertigkeiten
    if (skills.sozial) {
        for (const skillKey in skills.sozial) {
            const el = document.getElementById('skill_' + skillKey);
            if (el) el.textContent = displaySkill(skills.sozial[skillKey]);
        }
    }
    
    // Wissen Fertigkeiten
    if (skills.wissen) {
        for (const skillKey in skills.wissen) {
            const el = document.getElementById('skill_' + skillKey);
            if (el) el.textContent = displaySkill(skills.wissen[skillKey]);
        }
    }
}

function calculateAll() {
    if (!window.currentCharacter) return;
    
    console.log('calculateAll() wird ausgeführt (mit RulesEngine)...');
    
    // REFACTORING: Verwende RulesEngine für alle Berechnungen
    if (typeof RulesEngine !== 'undefined') {
        const calculated = RulesEngine.calculateCharacter(window.currentCharacter);
        
        // Berechnete Werte übernehmen
        window.currentCharacter.skills = calculated.skills;
        window.currentCharacter.combat = calculated.combat;
        window.currentCharacter.stats = calculated.stats;
        window.currentCharacter.resistances = calculated.resistances;
        window.currentCharacter.modifiers = calculated.modifiers;
    } else {
        // Fallback: Alte Berechnung (während Migration)
        console.warn('RulesEngine nicht verfügbar - verwende Fallback-Berechnung');
        calculateAllLegacy();
        return;
    }
    
    // 3.5 Clan-Boni anwenden (falls vorhanden)
    if (typeof applyClanBonuses === 'function' && window.currentCharacter.clan) {
        applyClanBonuses(window.currentCharacter);
    }
    
    // 6. UI aktualisieren
    updateStatsDisplay();
    updateCombatDisplay();
    updateResistancesDisplay();
    updateSkillsDisplay();
    
    // 7. Attributpunkte aktualisieren
    const spent = Object.values(window.currentCharacter.baseAttributes).reduce((sum, val) => sum + (val - 8), 0);
    window.currentCharacter.attributePoints.spent = spent;
    if (document.getElementById('attrPoints')) {
        document.getElementById('attrPoints').textContent = window.currentCharacter.attributePoints.total - spent;
    }
    
    // 8. Attribut-Modifikatoren aktualisieren
    updateAttributeModifiers();
    
    console.log('calculateAll() abgeschlossen');
}

/**
 * Legacy-Berechnung (Fallback während Migration)
 * @deprecated Verwende stattdessen RulesEngine.calculateCharacter()
 */
function calculateAllLegacy() {
    if (!window.currentCharacter) return;
    
    // 1. Attribute Modifikatoren berechnen
    const mods = {};
    for (const [attr, value] of Object.entries(window.currentCharacter.baseAttributes)) {
        mods[attr] = getMod(value);
    }
    
    // 2. Fertigkeiten mit Modifikatoren berechnen
    const attrs = window.currentCharacter.baseAttributes;
    
    const valueToMod = (val) => {
        if (val <= 7) return -2;
        if (val <= 9) return -1;
        if (val <= 11) return 0;
        if (val <= 13) return 1;
        if (val <= 15) return 2;
        if (val <= 17) return 3;
        if (val <= 19) return 4;
        return 5;
    };
    
    window.currentCharacter.skills = {
        koerperlich: {
            athletik: { base: Math.floor((attrs.kk + attrs.kon + attrs.ges) / 3), mod: valueToMod(Math.floor((attrs.kk + attrs.kon + attrs.ges) / 3)) },
            akrobatik: { base: Math.floor((attrs.kk + attrs.kk + attrs.kon) / 3), mod: valueToMod(Math.floor((attrs.kk + attrs.kk + attrs.kon) / 3)) },
            klettern: { base: Math.floor((attrs.kon + attrs.kon + attrs.kk) / 3), mod: valueToMod(Math.floor((attrs.kon + attrs.kon + attrs.kk) / 3)) },
            koerperbeherrschung: { base: Math.floor((attrs.kon + attrs.kk + attrs.gsw) / 3), mod: valueToMod(Math.floor((attrs.kon + attrs.kk + attrs.gsw) / 3)) },
            schleichen: { base: Math.floor((attrs.ges + attrs.ges + attrs.itu) / 3), mod: valueToMod(Math.floor((attrs.ges + attrs.ges + attrs.itu) / 3)) },
            verstecken_tarnen: { base: Math.floor((attrs.itu + attrs.ges + attrs.gsw) / 3), mod: valueToMod(Math.floor((attrs.itu + attrs.ges + attrs.gsw) / 3)) },
            fingerfertigkeit: { base: Math.floor((attrs.itu + attrs.int + attrs.ges) / 3), mod: valueToMod(Math.floor((attrs.itu + attrs.int + attrs.ges) / 3)) },
            waffentalent: { base: Math.floor((attrs.kk + attrs.ges + attrs.gsw) / 3), mod: valueToMod(Math.floor((attrs.kk + attrs.ges + attrs.gsw) / 3)) }
        },
        sozial: {
            menschenkenntnis: { base: Math.floor((attrs.cha + attrs.itu) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.itu) / 2)) },
            redekunst_verhandeln: { base: Math.floor((attrs.cha + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.int) / 2)) },
            beruhigen: { base: Math.floor((attrs.cha + attrs.ges) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.ges) / 2)) },
            einschuechtern: { base: Math.floor((attrs.cha + attrs.kk) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.kk) / 2)) },
            manipulieren: { base: Math.floor((attrs.cha + attrs.itu) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.itu) / 2)) },
            alleinunterhalter: { base: Math.floor((attrs.cha + attrs.cha) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.cha) / 2)) },
            flirten_verfuehren: { base: Math.floor((attrs.cha + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.cha + attrs.int) / 2)) }
        },
        wissen: {
            naturwissenschaften: { base: Math.floor((attrs.itu + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.itu + attrs.int) / 2)) },
            ueberlebenstechniken: { base: Math.floor((attrs.kk + attrs.kon) / 2), mod: valueToMod(Math.floor((attrs.kk + attrs.kon) / 2)) },
            pflanzenkunde_alchemie: { base: Math.floor((attrs.itu + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.itu + attrs.int) / 2)) },
            tierkunde: { base: Math.floor((attrs.int + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.int + attrs.int) / 2)) },
            geschichte: { base: Math.floor((attrs.int + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.int + attrs.int) / 2)) },
            kriegskunst: { base: Math.floor((attrs.itu + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.itu + attrs.int) / 2)) },
            handwerk_technologie: { base: Math.floor((attrs.kon + attrs.kk) / 2), mod: valueToMod(Math.floor((attrs.kon + attrs.kk) / 2)) },
            jutsu_wissen: { base: Math.floor((attrs.kon + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.kon + attrs.int) / 2)) },
            medizin_heilkunst: { base: Math.floor((attrs.ges + attrs.int) / 2), mod: valueToMod(Math.floor((attrs.ges + attrs.int) / 2)) },
            chakrakontrolle: { base: Math.floor((attrs.int + attrs.int + attrs.kon) / 3), mod: valueToMod(Math.floor((attrs.int + attrs.int + attrs.kon) / 3)) }
        }
    };
    
    // 3. Kampfwerte berechnen
    const level = window.currentCharacter.level || 1;
    window.currentCharacter.combat = {
        initiative: 5 + (mods.ges || 0) + (mods.gsw || 0) + (mods.itu || 0),
        ausweichen: 5 + (mods.ges || 0) + Math.floor((mods.gsw || 0) / 2),
        angriff: 2 + Math.max((mods.kk || 0), (mods.ges || 0)),
        rk: 8,
        ninjutsu: 2 + Math.floor(((mods.int || 0) + (mods.ges || 0)) / 2),
        taijutsu: (mods.kk || 0) + (mods.ges || 0),
        genjutsu: (mods.int || 0) + (mods.itu || 0),
        wahrnehmung: (mods.itu || 0) + (mods.int || 0),
        bewegungsradius: 10 + Math.max(0, (mods.gsw || 0) * 5),
        chakraWiderstand: (mods.kon || 0) + Math.floor((mods.int || 0) / 2),
        geistigerWiderstand: (mods.int || 0) + Math.floor((mods.itu || 0) / 2),
        inspiration: Math.floor(level / 5)
    };
    
    // 4. Hauptwerte berechnen
    const baseHP = 30 + (mods.kon || 0) + 6 + ((level - 1) * 5);
    const baseChakra = 100 + (mods.kon || 0) + (mods.int || 0) + 22 + ((level - 1) * 7);
    
    window.currentCharacter.stats = {
        hp: {
            current: window.currentCharacter.stats?.hp?.current || baseHP,
            max: baseHP
        },
        chakra: {
            current: window.currentCharacter.stats?.chakra?.current || baseChakra,
            max: baseChakra
        },
        stamina: Math.max(0, 3 + Math.max((mods.kon || 0), (mods.gsw || 0))),
        aufladungen: window.currentCharacter.stats?.aufladungen || 0,
        karma: window.currentCharacter.stats?.karma || 0
    };
    
    // 5. Widerstände berechnen
    window.currentCharacter.resistances = {
        chakra: (mods.kon || 0) + Math.floor((mods.int || 0) / 2),
        koerper: (mods.kon || 0),
        geist: (mods.int || 0) + Math.floor((mods.itu || 0) / 2)
    };
}

/**
 * Berechnet alle Fertigkeiten
 */
function calculateAllSkills() {
    if (!window.currentCharacter) return;
    
    const attrs = window.currentCharacter.baseAttributes;
    
    // Prüfen, ob Rules definiert ist
    if (typeof Rules === 'undefined' || !Rules.calculateAllSkills) {
        console.error('Rules nicht definiert!');
        // Fallback-Berechnung
        window.currentCharacter.skills = {
            koerperlich: {
                athletik: Math.floor((attrs.kk + attrs.kon + attrs.ges) / 3),
                akrobatik: Math.floor((attrs.kk + attrs.kk + attrs.kon) / 3),
                klettern: Math.floor((attrs.kon + attrs.kon + attrs.kk) / 3),
                koerperbeherrschung: Math.floor((attrs.kon + attrs.kk + attrs.gsw) / 3),
                schleichen: Math.floor((attrs.ges + attrs.ges + attrs.itu) / 3),
                verstecken_tarnen: Math.floor((attrs.itu + attrs.ges + attrs.gsw) / 3),
                fingerfertigkeit: Math.floor((attrs.itu + attrs.int + attrs.ges) / 3),
                waffentalent: Math.floor((attrs.kk + attrs.ges + attrs.gsw) / 3)
            },
            sozial: {
                menschenkenntnis: Math.floor((attrs.cha + attrs.itu) / 2),
                redekunst_verhandeln: Math.floor((attrs.cha + attrs.int) / 2),
                beruhigen: Math.floor((attrs.cha + attrs.ges) / 2),
                einschuechtern: Math.floor((attrs.cha + attrs.kk) / 2),
                manipulieren: Math.floor((attrs.cha + attrs.itu) / 2),
                alleinunterhalter: Math.floor((attrs.cha + attrs.cha) / 2),
                flirten_verfuehren: Math.floor((attrs.cha + attrs.int) / 2)
            },
            wissen: {
                naturwissenschaften: Math.floor((attrs.itu + attrs.int) / 2),
                ueberlebenstechniken: Math.floor((attrs.kk + attrs.kon) / 2),
                pflanzenkunde_alchemie: Math.floor((attrs.itu + attrs.int) / 2),
                tierkunde: Math.floor((attrs.int + attrs.int) / 2),
                geschichte: Math.floor((attrs.int + attrs.int) / 2),
                kriegskunst: Math.floor((attrs.itu + attrs.int) / 2),
                handwerk_technologie: Math.floor((attrs.kon + attrs.kk) / 2),
                jutsu_wissen: Math.floor((attrs.kon + attrs.int) / 2),
                medizin_heilkunst: Math.floor((attrs.ges + attrs.int) / 2),
                chakrakontrolle: Math.floor((attrs.int + attrs.int + attrs.kon) / 3)
            }
        };
    } else {
        window.currentCharacter.skills = Rules.calculateAllSkills(attrs);
    }
    
    console.log('Skills berechnet:', window.currentCharacter.skills);
    
    // UI aktualisieren
    updateSkillsDisplay();
}

/**
 * Aktualisiert die Anzeige der Hauptwerte
 */
function updateStatsDisplay() {
    if (!window.currentCharacter) return;
    
    const stats = window.currentCharacter.stats;
    const combat = window.currentCharacter.combat;
    
    // Hilfsfunktion zum sicheren Anzeigen von Werten
    const safeDisplay = (value, defaultValue = 0) => {
        if (typeof value === 'object' && value !== null) {
            // Wenn es ein Objekt mit current/max ist, zeige current/max
            if ('current' in value && 'max' in value) {
                return `${value.current || 0} / ${value.max || 0}`;
            }
            // Sonst zeige den default
            return defaultValue;
        }
        return value !== undefined && value !== null ? value : defaultValue;
    };
    
    // Hauptwerte (HP, Chakra als current/max)
    if (document.getElementById('hp')) {
        document.getElementById('hp').textContent = safeDisplay(stats.hp, '30 / 30');
    }
    if (document.getElementById('chakra')) {
        document.getElementById('chakra').textContent = safeDisplay(stats.chakra, '100 / 100');
    }
    if (document.getElementById('stamina')) {
        document.getElementById('stamina').textContent = safeDisplay(stats.stamina, 3);
    }
    
    // Hauptwerte im unteren Bereich (einzigartige IDs)
    if (document.getElementById('hpMain')) {
        document.getElementById('hpMain').textContent = safeDisplay(stats.hp, '30 / 30');
    }
    if (document.getElementById('chakraMain')) {
        document.getElementById('chakraMain').textContent = safeDisplay(stats.chakra, '100 / 100');
    }
    if (document.getElementById('staminaMain')) {
        document.getElementById('staminaMain').textContent = safeDisplay(stats.stamina, 3);
    }
    if (document.getElementById('angriffMain')) {
        document.getElementById('angriffMain').textContent = safeDisplay(combat?.angriff, 0);
    }
    if (document.getElementById('aufladungen')) {
        document.getElementById('aufladungen').textContent = safeDisplay(stats.aufladungen, 0);
    }
    if (document.getElementById('karma')) {
        document.getElementById('karma').textContent = safeDisplay(stats.karma, 0);
    }
    
    // Kampfwerte
    if (document.getElementById('initiative')) {
        document.getElementById('initiative').textContent = safeDisplay(combat?.initiative, 0);
    }
    if (document.getElementById('ausweichen')) {
        document.getElementById('ausweichen').textContent = safeDisplay(combat?.ausweichen, 0);
    }
    if (document.getElementById('angriff')) {
        document.getElementById('angriff').textContent = safeDisplay(combat?.angriff, 0);
    }
    if (document.getElementById('rk')) {
        document.getElementById('rk').textContent = safeDisplay(combat?.rk, 8);
    }
    if (document.getElementById('ninjutsu')) {
        document.getElementById('ninjutsu').textContent = safeDisplay(combat?.ninjutsu, 0);
    }
    if (document.getElementById('taijutsu')) {
        document.getElementById('taijutsu').textContent = safeDisplay(combat?.taijutsu, 0);
    }
    if (document.getElementById('genjutsu')) {
        document.getElementById('genjutsu').textContent = safeDisplay(combat?.genjutsu, 0);
    }
    
    // Neue Kampfwerte (Sekundärwerte)
    if (document.getElementById('chakraWiderstand')) {
        document.getElementById('chakraWiderstand').textContent = safeDisplay(combat?.chakraWiderstand, 0);
    }
    if (document.getElementById('geistigerWiderstand')) {
        document.getElementById('geistigerWiderstand').textContent = safeDisplay(combat?.geistigerWiderstand, 0);
    }
    if (document.getElementById('wahrnehmung')) {
        document.getElementById('wahrnehmung').textContent = safeDisplay(combat?.wahrnehmung, 0);
    }
    if (document.getElementById('bewegungsradius')) {
        document.getElementById('bewegungsradius').textContent = safeDisplay(combat?.bewegungsradius, 10);
    }
    if (document.getElementById('inspiration')) {
        document.getElementById('inspiration').textContent = safeDisplay(combat?.inspiration, 0);
    }
    
    // Kreise für Lebenspunkte und Chakra aktualisieren
    if (document.getElementById('hpCircle')) {
        const hpText = safeDisplay(stats.hp, '30 / 30');
        document.getElementById('hpCircle').textContent = hpText;
    }
    if (document.getElementById('chakraCircle')) {
        const chakraText = safeDisplay(stats.chakra, '100 / 100');
        document.getElementById('chakraCircle').textContent = chakraText;
    }
    
    // Level und AP aktualisieren
    if (document.getElementById('charLevel')) {
        document.getElementById('charLevel').textContent = window.currentCharacter.level || 1;
    }
    if (document.getElementById('charAP')) {
        document.getElementById('charAP').textContent = window.currentCharacter.ap || 0;
    }
}

/**
 * Aktualisiert die Anzeige der Kampfwerte
 */
function updateCombatDisplay() {
    updateStatsDisplay();
}

/**
 * Aktualisiert die Anzeige der Widerstände
 */
function updateResistancesDisplay() {
    if (!window.currentCharacter) return;
    
    const res = window.currentCharacter.resistances;
    if (document.getElementById('resChakra')) document.getElementById('resChakra').textContent = res.chakra;
    if (document.getElementById('resKoerper')) document.getElementById('resKoerper').textContent = res.koerper;
    if (document.getElementById('resGeist')) document.getElementById('resGeist').textContent = res.geist;
}

/**
 * Aktualisiert die Anzeige aller Fertigkeiten
 */
function updateSkillsDisplay() {
    if (!window.currentCharacter || !window.currentCharacter.skills) {
        console.log('Keine Skills zum Anzeigen');
        return;
    }
    
    const skills = window.currentCharacter.skills;
    console.log('Update Skills Display - skills:', skills);
    
    // Hilfsfunktion zum Formatieren des Modifikators
    const formatMod = (mod) => {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };
    
    // Körperliche Fertigkeiten
    if (skills.koerperlich) {
        for (const [skillKey, skillData] of Object.entries(skills.koerperlich)) {
            const el = document.getElementById('skill_' + skillKey);
            if (el) {
                // Zeige Modifikator als Hauptwert, Basiswert als Tooltip
                const modText = formatMod(skillData.mod);
                el.textContent = modText;
                el.title = `Basiswert: ${skillData.base}`;
                el.dataset.base = skillData.base;
                el.dataset.mod = skillData.mod;
                
                // Färbe positive/negative Modifikatoren
                el.classList.remove('mod-positive', 'mod-negative', 'mod-neutral');
                if (skillData.mod > 0) el.classList.add('mod-positive');
                else if (skillData.mod < 0) el.classList.add('mod-negative');
                else el.classList.add('mod-neutral');
                
                console.log(`Skill ${skillKey} = Basis: ${skillData.base}, Mod: ${modText}`);
            } else {
                console.warn(`Element skill_${skillKey} nicht gefunden`);
            }
        }
    }
    
    // Soziale Fertigkeiten
    if (skills.sozial) {
        for (const [skillKey, skillData] of Object.entries(skills.sozial)) {
            const el = document.getElementById('skill_' + skillKey);
            if (el) {
                const modText = formatMod(skillData.mod);
                el.textContent = modText;
                el.title = `Basiswert: ${skillData.base}`;
                el.dataset.base = skillData.base;
                el.dataset.mod = skillData.mod;
                
                el.classList.remove('mod-positive', 'mod-negative', 'mod-neutral');
                if (skillData.mod > 0) el.classList.add('mod-positive');
                else if (skillData.mod < 0) el.classList.add('mod-negative');
                else el.classList.add('mod-neutral');
                
                console.log(`Skill ${skillKey} = Basis: ${skillData.base}, Mod: ${modText}`);
            }
        }
    }
    
    // Wissen Fertigkeiten
    if (skills.wissen) {
        for (const [skillKey, skillData] of Object.entries(skills.wissen)) {
            const el = document.getElementById('skill_' + skillKey);
            if (el) {
                const modText = formatMod(skillData.mod);
                el.textContent = modText;
                el.title = `Basiswert: ${skillData.base}`;
                el.dataset.base = skillData.base;
                el.dataset.mod = skillData.mod;
                
                el.classList.remove('mod-positive', 'mod-negative', 'mod-neutral');
                if (skillData.mod > 0) el.classList.add('mod-positive');
                else if (skillData.mod < 0) el.classList.add('mod-negative');
                else el.classList.add('mod-neutral');
                
                console.log(`Skill ${skillKey} = Basis: ${skillData.base}, Mod: ${modText}`);
            }
        }
    }
}

function getMod(value) {
    if (typeof Rules !== 'undefined' && Rules.ATTRIBUTES && Rules.ATTRIBUTES.getModifier) {
        return Rules.ATTRIBUTES.getModifier(value);
    }
    // Fallback-Berechnung
    if (value <= 9) return -1;
    if (value <= 11) return 0;
    if (value <= 13) return 1;
    if (value <= 15) return 2;
    if (value <= 17) return 3;
    if (value <= 19) return 4;
    return 5;
}

// ============================================
// SEITENWECHSEL
// ============================================

function showPage(pageNum) {
    console.log('Seite wechseln zu:', pageNum);
    
    // BUGFIX 4: Charakter neu laden vor Seitenwechsel für Synchronisation
    if (window.currentCharacter) {
        renderCharacter();
    }
    
    // Alle Seiten ausblenden
    document.querySelectorAll('.sheet-page').forEach(p => p.classList.remove('active'));
    
    // Alle Buttons zurücksetzen
    document.querySelectorAll('.page-nav button').forEach(b => b.classList.remove('active'));
    
    // Gewählte Seite anzeigen
    const page = document.getElementById('page' + pageNum);
    if (page) page.classList.add('active');
    
    // Button aktivieren
    const btn = document.getElementById('btnPage' + pageNum);
    if (btn) btn.classList.add('active');
    
    // Wenn Jutsu-Karten-Seite, aktualisiere die Anzeige
    if (pageNum === 4) {
        renderJutsuCards();
    }
    
    // Wenn Quest-Seite: Quest-Init wird von app-quest-integration.js gesteuert
    if (pageNum === 7) {
        console.log('[App] Seite 7 aktiv - Quest-Init über Integration');
    }
}

/**
 * Zeigt die Quest-Seite an (wird vom Button aufgerufen)
 */
// showQuestPage wird von app-quest-integration.js bereitgestellt
// Fallback nur falls Integration nicht geladen
if (typeof window.showQuestPage !== 'function') {
    window.showQuestPage = function() {
        console.log('[App] showQuestPage Fallback');
        document.querySelectorAll('.sheet-page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.page-nav button').forEach(b => b.classList.remove('active'));
        const page = document.getElementById('page7');
        if (page) page.classList.add('active');
        const btn = document.getElementById('btnPage7');
        if (btn) btn.classList.add('active');
    };
}

/**
 * Initialisiert die Quest-Seite
 */
function initQuestPage() {
    console.log('[App] initQuestPage...');
    
    // Prüfe ob Quest Engine verfügbar
    if (typeof QuestEngine === 'undefined') {
        console.error('[App] QuestEngine nicht verfügbar!');
        showQuestError('Quest-System nicht verfügbar');
        return;
    }
    
    // Prüfe ob Character geladen ist
    const character = window.currentCharacter;
    if (!character) {
        console.warn('[App] Kein Character geladen');
        showQuestError('Bitte wähle zuerst einen Charakter aus');
        return;
    }
    
    // Initialisiere Quest Engine
    try {
        QuestEngine.init();
    } catch (e) {
        console.error('[App] Fehler bei QuestEngine.init():', e);
    }
    
    // Generiere Quest Board wenn leer
    if (QuestEngine.state.questBoard.length === 0) {
        QuestEngine.generateQuestBoard();
    }
    
    // Rendere Quest Board
    const container = document.getElementById('quest-board-container');
    if (container && typeof QuestBoardUI !== 'undefined') {
        console.log('[App] Rendere Quest Board...');
        QuestBoardUI.init();
    } else {
        console.error('[App] Quest Board Container oder UI nicht gefunden');
    }
}

/**
 * Zeigt Fehlermeldung auf Quest-Seite
 */
function showQuestError(message) {
    const container = document.getElementById('quest-board-container');
    if (container) {
        container.innerHTML = `
            <div class="quest-error">
                <span class="icon">⚠️</span>
                <h3>${message}</h3>
                <p>Bitte lade die Seite neu oder wähle einen Charakter.</p>
            </div>
        `;
    }
}

// ============================================
// JUTSU LEVEL-SYSTEM
// ============================================

/**
 * Berechnet die aktuellen Werte eines Jutsus basierend auf seinem Level
 */
function calculateJutsuValues(jutsu) {
    if (!jutsu || !jutsu.jutsuId) return jutsu;
    
    const jutsuData = JUTSU_DATA.find(j => j.id === jutsu.jutsuId);
    if (!jutsuData) return jutsu;
    
    const level = jutsu.level || 1;
    
    // Berechne modifizierte Werte
    const calculatedChakra = Rules.calculateJutsuChakra(jutsuData.chakra, level, jutsu.rank);
    const calculatedDamage = Rules.calculateJutsuDamage(jutsuData.damage, level);
    const calculatedRange = Rules.calculateJutsuRange(jutsuData.rangeM, level);
    
    return {
        ...jutsu,
        chakraCost: calculatedChakra,
        damage: calculatedDamage,
        rangeM: calculatedRange,
        // Speichere Basiswerte für Anzeige
        baseChakra: jutsuData.chakra,
        baseDamage: jutsuData.damage,
        baseRange: jutsuData.rangeM
    };
}

/**
 * Levelt ein Jutsu auf das nächste Level up
 */
function levelUpJutsu(jutsuId) {
    if (!window.currentCharacter) return;
    
    const jutsuIndex = window.currentCharacter.jutsus.findIndex(j => j.id === jutsuId);
    if (jutsuIndex === -1) return;
    
    const jutsu = window.currentCharacter.jutsus[jutsuIndex];
    const currentLevel = jutsu.level || 1;
    
    // Prüfe Max-Level
    if (currentLevel >= Rules.JUTSU_LEVEL.maxLevel) {
        alert('Dieses Jutsu hat bereits das maximale Level erreicht!');
        return;
    }
    
    // Berechne AP-Kosten
    const apCost = Rules.getJutsuLevelUpCost(jutsu.rank, currentLevel);
    const availableAP = window.currentCharacter.ap.total - window.currentCharacter.ap.spent;
    
    if (availableAP < apCost) {
        alert(`Nicht genug AP! Benötigt: ${apCost}, Verfügbar: ${availableAP}`);
        return;
    }
    
    // AP abziehen
    window.currentCharacter.ap.spent += apCost;
    window.currentCharacter.ap.history.push({
        type: 'jutsu_levelup',
        jutsuName: jutsu.name,
        fromLevel: currentLevel,
        toLevel: currentLevel + 1,
        cost: apCost,
        date: Date.now()
    });
    
    // Level erhöhen
    window.currentCharacter.jutsus[jutsuIndex].level = currentLevel + 1;
    
    // UI aktualisieren
    renderJutsuTable();
    renderJutsuCards();
    updateAPDisplay();
    autoSave();
    
    alert(`${jutsu.name} ist jetzt Level ${currentLevel + 1}!`);
}

/**
 * Zeigt die Jutsu-Details mit Level-Informationen an
 */
function getJutsuDisplayValues(jutsu) {
    const calculated = calculateJutsuValues(jutsu);
    
    return {
        ...calculated,
        // Zeige Level-Bonus an
        levelBonus: {
            chakra: calculated.baseChakra ? Math.round((1 - calculated.chakraCost / calculated.baseChakra) * 100) : 0,
            damage: calculated.baseDamage && calculated.baseDamage !== '-' ? 
                Math.round((calculated.damage !== '-' ? parseInt(calculated.damage.match(/\d+/)?.[0] || 1) : 1) / 
                (parseInt(calculated.baseDamage.match(/\d+/)?.[0] || 1)) * 100 - 100) : 0
        }
    };
}

// ============================================
// AP-SYSTEM
// ============================================

/**
 * Vergibt AP an den Charakter (nur DM)
 */
function awardAP(amount, reason) {
    if (!window.currentCharacter || !isDM()) {
        alert('Nur der DM kann AP vergeben!');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Ungültige AP-Anzahl!');
        return;
    }
    
    window.currentCharacter.ap.total += amount;
    window.currentCharacter.ap.history.push({
        type: 'awarded',
        amount: amount,
        reason: reason || 'Kein Grund angegeben',
        date: Date.now(),
        awardedBy: document.getElementById('currentUser')?.textContent || 'DM'
    });
    
    updateAPDisplay();
    autoSave();
    
    alert(`${amount} AP wurden vergeben! Grund: ${reason}`);
}

/**
 * Aktualisiert die AP-Anzeige
 */
function updateAPDisplay() {
    const totalEl = document.getElementById('apTotal');
    const spentEl = document.getElementById('apSpent');
    const availableEl = document.getElementById('apAvailable');
    
    if (!window.currentCharacter) return;
    
    const total = window.currentCharacter.ap.total || 0;
    const spent = window.currentCharacter.ap.spent || 0;
    const available = total - spent;
    
    if (totalEl) totalEl.textContent = total;
    if (spentEl) spentEl.textContent = spent;
    if (availableEl) availableEl.textContent = available;
}

/**
 * Prüft ob der aktuelle Benutzer DM ist
 */
function isDM() {
    const role = document.getElementById('currentRole')?.textContent;
    return role === 'DM';
}

// ============================================
// AUSRÜSTUNG & CHARAKTERWERTE
// ============================================

/**
 * Berechnet die Gesamtwerte des Charakters inklusive Ausrüstung
 */
function calculateTotalStats() {
    if (!window.currentCharacter) return null;
    
    const baseStats = calculateBaseStats();
    const equipmentBonuses = calculateEquipmentBonuses();
    
    return {
        hp: {
            base: baseStats.hp,
            bonus: equipmentBonuses.hp || 0,
            total: baseStats.hp + (equipmentBonuses.hp || 0)
        },
        chakra: {
            base: baseStats.chakra,
            bonus: equipmentBonuses.chakra || 0,
            total: baseStats.chakra + (equipmentBonuses.chakra || 0)
        },
        rk: {
            base: baseStats.rk,
            bonus: equipmentBonuses.rk || 0,
            total: baseStats.rk + (equipmentBonuses.rk || 0)
        },
        angriff: {
            base: baseStats.angriff,
            bonus: equipmentBonuses.angriff || 0,
            total: baseStats.angriff + (equipmentBonuses.angriff || 0)
        },
        ausweichen: {
            base: baseStats.ausweichen,
            bonus: equipmentBonuses.ausweichen || 0,
            total: baseStats.ausweichen + (equipmentBonuses.ausweichen || 0)
        },
        initiative: {
            base: baseStats.initiative,
            bonus: equipmentBonuses.initiative || 0,
            total: baseStats.initiative + (equipmentBonuses.initiative || 0)
        }
    };
}

/**
 * Berechnet die Basis-Stats ohne Ausrüstung
 * WICHTIG: Muss exakt dieselbe Berechnung wie calculateAll() verwenden!
 */
function calculateBaseStats() {
    if (!window.currentCharacter) return {};
    
    const attrs = window.currentCharacter.baseAttributes;
    const mods = {
        kk: getMod(attrs.kk),
        ges: getMod(attrs.ges),
        kon: getMod(attrs.kon),
        gsw: getMod(attrs.gsw),
        itu: getMod(attrs.itu),
        int: getMod(attrs.int),
        cha: getMod(attrs.cha)
    };
    
    const level = window.currentCharacter.level || 1;
    
    // EXAKT dieselbe Berechnung wie in calculateAll()!
    // Siehe Zeile 1470-1471 in calculateAll()
    const baseHP = 30 + (mods.kon || 0) + 6 + ((level - 1) * 5);
    const baseChakra = 100 + (mods.kon || 0) + (mods.int || 0) + 22 + ((level - 1) * 7);
    
    return {
        hp: baseHP,
        chakra: baseChakra,
        rk: 8 + mods.ges,
        angriff: 2 + mods.kk,
        ausweichen: 5 + mods.ges + Math.floor(mods.gsw / 2),
        initiative: 5 + mods.ges + mods.gsw + mods.itu
    };
}

/**
 * Berechnet die Boni durch Ausrüstung
 */
function calculateEquipmentBonuses() {
    if (!window.currentCharacter || !window.currentCharacter.equipment) {
        return { hp: 0, chakra: 0, rk: 0, angriff: 0, ausweichen: 0, initiative: 0 };
    }
    
    const bonuses = {
        hp: 0,
        chakra: 0,
        rk: 0,
        angriff: 0,
        ausweichen: 0,
        initiative: 0
    };
    
    // Parse Modifikatoren aus Ausrüstung
    for (const slot in window.currentCharacter.equipment) {
        const item = window.currentCharacter.equipment[slot];
        if (!item || !item.mod) continue;
        
        const mod = item.mod.toLowerCase();
        
        // RK-Bonus
        if (mod.includes('rk')) {
            const match = mod.match(/rk\s*([+-]\d+)/);
            if (match) bonuses.rk += parseInt(match[1]);
        }
        
        // Angriffs-Bonus
        if (mod.includes('angriff')) {
            const match = mod.match(/angriff\s*([+-]\d+)/);
            if (match) bonuses.angriff += parseInt(match[1]);
        }
        
        // Chakra-Bonus
        if (mod.includes('chakra')) {
            const match = mod.match(/chakra\s*([+-]\d+)/);
            if (match) bonuses.chakra += parseInt(match[1]);
        }
        
        // Initiative-Bonus
        if (mod.includes('initiative') || mod.includes('ini')) {
            const match = mod.match(/(?:initiative|ini)\s*([+-]\d+)/);
            if (match) bonuses.initiative += parseInt(match[1]);
        }
        
        // Ausweichen-Bonus
        if (mod.includes('ausweichen')) {
            const match = mod.match(/ausweichen\s*([+-]\d+)/);
            if (match) bonuses.ausweichen += parseInt(match[1]);
        }
        
        // Direkte RK von Rüstungsteilen
        if (item.rk && item.rk !== '-') {
            const rkMatch = item.rk.match(/([+-]\d+)/);
            if (rkMatch) bonuses.rk += parseInt(rkMatch[1]);
        }
    }
    
    return bonuses;
}

/**
 * Aktualisiert die Statistik-Tabelle auf der Ausrüstungsseite
 */
function updateEquipmentStatsTable() {
    const container = document.getElementById('equipmentStatsTable');
    if (!container) return;
    
    const stats = calculateTotalStats();
    if (!stats) {
        container.innerHTML = '<p class="hint">Keine Statistiken verfügbar</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>Wert</th>
                    <th>Basis</th>
                    <th>Ausrüstung</th>
                    <th class="total">Gesamt</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>❤️ Lebenspunkte</td>
                    <td>${stats.hp.base}</td>
                    <td class="bonus">${stats.hp.bonus > 0 ? '+' : ''}${stats.hp.bonus}</td>
                    <td class="total">${stats.hp.total}</td>
                </tr>
                <tr>
                    <td>⚡ Chakra</td>
                    <td>${stats.chakra.base}</td>
                    <td class="bonus">${stats.chakra.bonus > 0 ? '+' : ''}${stats.chakra.bonus}</td>
                    <td class="total">${stats.chakra.total}</td>
                </tr>
                <tr>
                    <td>🛡️ Rüstungsklasse</td>
                    <td>${stats.rk.base}</td>
                    <td class="bonus">${stats.rk.bonus > 0 ? '+' : ''}${stats.rk.bonus}</td>
                    <td class="total">${stats.rk.total}</td>
                </tr>
                <tr>
                    <td>⚔️ Angriff</td>
                    <td>${stats.angriff.base}</td>
                    <td class="bonus">${stats.angriff.bonus > 0 ? '+' : ''}${stats.angriff.bonus}</td>
                    <td class="total">${stats.angriff.total}</td>
                </tr>
                <tr>
                    <td>💨 Ausweichen</td>
                    <td>${stats.ausweichen.base}</td>
                    <td class="bonus">${stats.ausweichen.bonus > 0 ? '+' : ''}${stats.ausweichen.bonus}</td>
                    <td class="total">${stats.ausweichen.total}</td>
                </tr>
                <tr>
                    <td>⚡ Initiative</td>
                    <td>${stats.initiative.base}</td>
                    <td class="bonus">${stats.initiative.bonus > 0 ? '+' : ''}${stats.initiative.bonus}</td>
                    <td class="total">${stats.initiative.total}</td>
                </tr>
            </tbody>
        </table>
    `;
}

/**
 * Zeigt das AP-Vergabe-Modal
 */
function showAPAwardModal() {
    if (!isDM()) {
        alert('Nur der DM kann AP vergeben!');
        return;
    }
    
    const modal = document.getElementById('apAwardModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Reset Felder
        document.getElementById('apAwardAmount').value = '1';
        document.getElementById('apAwardReason').value = '';
    }
}

/**
 * Schließt das AP-Vergabe-Modal
 */
function closeAPAwardModal() {
    const modal = document.getElementById('apAwardModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Bestätigt die AP-Vergabe
 */
function confirmAPAward() {
    if (!isDM()) {
        alert('Nur der DM kann AP vergeben!');
        return;
    }
    
    const amount = parseInt(document.getElementById('apAwardAmount').value);
    const reason = document.getElementById('apAwardReason').value;
    
    if (!amount || amount <= 0) {
        alert('Bitte eine gültige AP-Anzahl eingeben!');
        return;
    }
    
    awardAP(amount, reason);
    closeAPAwardModal();
}

// ============================================
// AUSRÜSTUNG - NEUES DROPDOWN-SYSTEM
// ============================================

// Slot-Namen für die Anzeige
const slotNames = {
    head: 'Kopf',
    chest: 'Brust',
    armLeft: 'Linker Arm',
    armRight: 'Rechter Arm',
    legLeft: 'Linkes Bein',
    legRight: 'Rechtes Bein',
    weapon1: 'Waffe 1',
    weapon2: 'Waffe 2',
    accessory: 'Zubehör'
};

// Slot zu Kategorie Mapping
const slotCategoryMap = {
    head: 'head',
    chest: 'chest',
    armLeft: 'arms',
    armRight: 'arms',
    legLeft: 'legs',
    legRight: 'legs',
    weapon1: 'weapon1',
    weapon2: 'weapon2',
    accessory: 'accessory'
};

/**
 * Öffnet das Dropdown für einen bestimmten Slot
 */
function openSlotDropdown(slot) {
    currentSlot = slot;
    
    const dropdown = document.getElementById('slotDropdown');
    const title = document.getElementById('slotDropdownTitle');
    const select = document.getElementById('slotItemSelect');
    
    if (!dropdown || !title || !select) return;
    
    // Titel setzen
    title.textContent = slotNames[slot] || slot;
    
    // Dropdown-Position basierend auf Slot setzen
    dropdown.removeAttribute('data-slot');
    dropdown.setAttribute('data-slot', slot);
    
    // Select-Optionen füllen - NUR gekaufte Items oder Startausrüstung
    select.innerHTML = '<option value="">-- Gegenstand auswählen --</option>';
    
    // Hole gekaufte Items aus dem Charakter
    const purchasedItems = window.currentCharacter?.purchasedItems || [];
    const dmItems = window.currentCharacter?.dmItems || [];
    
    // Startausrüstung erlauben
    const startingEquipment = [
        { id: 'leather_armor', name: 'Leder-Rüstung', type: 'armor', slot: 'chest' },
        { id: 'kunai', name: 'Kunai', type: 'weapon', slot: 'weapon1' },
        { id: 'shuriken', name: 'Shuriken', type: 'weapon', slot: 'weapon2' }
    ];
    
    // Kombiniere alle erlaubten Items
    const allowedItems = [...startingEquipment, ...purchasedItems, ...dmItems];
    
    // Filtere nach passendem Slot
    const slotItems = allowedItems.filter(item => item.slot === slot || item.slot === slotCategoryMap[slot]);
    
    if (slotItems.length > 0) {
        slotItems.forEach(item => {
            const option = document.createElement('option');
            option.value = JSON.stringify(item);
            option.textContent = `${item.name} ${item.source === 'dm' ? '(DM)' : item.source === 'merchant' ? '(Gekauft)' : ''}`;
            select.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'Keine Items verfügbar. Besuche einen Händler!';
        select.appendChild(option);
    }
    
    // Aktuell ausgerüstetes Item markieren
    if (window.currentCharacter && window.currentCharacter.equipment[slot]) {
        const currentItem = window.currentCharacter.equipment[slot];
        const matchingOption = Array.from(select.options).find(opt => {
            if (opt.value === '') return false;
            try {
                const item = JSON.parse(opt.value);
                return item.name === currentItem.name;
            } catch {
                return false;
            }
        });
        if (matchingOption) {
            matchingOption.selected = true;
        }
    }
    
    // Dropdown anzeigen
    dropdown.classList.remove('hidden');
}

/**
 * Schließt das Slot-Dropdown
 */
function closeSlotDropdown() {
    const dropdown = document.getElementById('slotDropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
    currentSlot = null;
}

/**
 * Bestätigt die Auswahl eines Items für den aktuellen Slot
 */
function confirmSlotSelection() {
    const select = document.getElementById('slotItemSelect');
    if (!select) {
        console.error('slotItemSelect nicht gefunden');
        return;
    }
    
    const itemJson = select.value;
    if (!itemJson) {
        alert('Bitte wähle einen Gegenstand aus!');
        return;
    }
    
    // Rufe die bestehende Funktion auf
    onSlotItemSelect(itemJson);
}

/**
 * Wird aufgerufen wenn ein Item im Dropdown ausgewählt wird
 */
function onSlotItemSelect(itemJson) {
    console.log('onSlotItemSelect aufgerufen mit:', itemJson);
    if (!currentSlot) {
        console.error('Kein currentSlot');
        return;
    }
    if (!window.currentCharacter) {
        console.error('Kein window.currentCharacter');
        return;
    }
    if (!itemJson) {
        console.error('Kein itemJson');
        return;
    }
    
    try {
        const item = JSON.parse(itemJson);
        console.log('Item parsed:', item);
        
        // Item dem Slot zuweisen
        window.currentCharacter.equipment[currentSlot] = {
            name: item.name,
            damage: item.damage || '-',
            mod: item.mod || '-',
            rk: item.rk || '-',
            desc: item.desc || ''
        };
        
        // UI aktualisieren
        updateEquipmentDisplay();
        updateEquipmentList();
        updateEquipmentStatsTable(); // NEU: Statistiken aktualisieren
        
        // Dropdown schließen
        closeSlotDropdown();
        
        // Auto-save
        autoSave();
        
    } catch (err) {
        console.error('Fehler beim Auswählen des Items:', err);
    }
}

/**
 * Entfernt das aktuell ausgerüstete Item vom Slot
 */
function unequipSlot() {
    if (!currentSlot || !window.currentCharacter) return;
    
    window.currentCharacter.equipment[currentSlot] = null;
    
    updateEquipmentDisplay();
    updateEquipmentList();
    updateEquipmentStatsTable(); // NEU: Statistiken aktualisieren
    closeSlotDropdown();
    autoSave();
}

/**
 * Aktualisiert die Slot-Indikatoren (grüner Rahmen wenn belegt)
 */
function updateEquipmentDisplay() {
    if (!window.currentCharacter) return;
    
    for (const slot in window.currentCharacter.equipment) {
        const indicator = document.getElementById('indicator-' + slot);
        const item = window.currentCharacter.equipment[slot];
        
        if (indicator) {
            if (item) {
                indicator.classList.add('active');
                indicator.style.opacity = '1';
            } else {
                indicator.classList.remove('active');
                indicator.style.opacity = '0';
            }
        }
    }
}

/**
 * Aktualisiert die Ausrüstungsliste unter der Figur
 */
function updateEquipmentList() {
    const list = document.getElementById('equipmentList');
    if (!list || !window.currentCharacter) return;
    
    const equipped = Object.entries(window.currentCharacter.equipment)
        .filter(([_, item]) => item !== null);
    
    if (equipped.length === 0) {
        list.innerHTML = '<p class="hint">Noch keine Ausrüstung ausgewählt. Klicke auf einen Slot um ein Item auszuwählen.</p>';
        return;
    }
    
    list.innerHTML = equipped.map(([slot, item]) => `
        <div class="equipment-list-item">
            <div class="slot-name">${slotNames[slot]}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-stats">
                ${item.damage !== '-' ? `<span class="stat">⚔️ ${item.damage}</span>` : ''}
                ${item.mod !== '-' ? `<span class="stat">✨ ${item.mod}</span>` : ''}
                ${item.rk !== '-' ? `<span class="stat">🛡️ ${item.rk}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// ============================================
// ALTE MODAL-FUNKTIONEN (für Abwärtskompatibilität)
// ============================================

let currentEquipSlot = null;

function openEquipmentModal(slot) {
    // Neue Dropdown-Funktion verwenden
    openSlotDropdown(slot);
}

function openCustomInput(slot) {
    // Neue Dropdown-Funktion verwenden
    openSlotDropdown(slot);
}

function closeEquipmentModal() {
    closeSlotDropdown();
}

function saveEquipment() {
    // Wird jetzt durch onSlotItemSelect ersetzt
}

function removeEquipment() {
    unequipSlot();
}

function onItemSelect() {
    // Wird jetzt durch onSlotItemSelect ersetzt
}

// ============================================
// INVENTAR & GELD
// ============================================

function updateInventory() {
    if (!window.currentCharacter) return;
    window.currentCharacter.inventory.backpack = document.getElementById('backpack')?.value || '';
    window.currentCharacter.inventory.beltPouch = document.getElementById('beltPouch')?.value || '';
}

function updateMoney() {
    if (!window.currentCharacter) return;
    window.currentCharacter.money.gold = parseInt(document.getElementById('gold')?.value) || 0;
    window.currentCharacter.money.silver = parseInt(document.getElementById('silver')?.value) || 0;
    window.currentCharacter.money.copper = parseInt(document.getElementById('copper')?.value) || 0;
    
    // Globale Geld-Anzeige aktualisieren
    updateGlobalMoneyDisplay();
}

// ============================================
// JUTSU SYSTEM - KORRIGIERT
// ============================================

// Jutsu-Typen Definition
const JUTSU_TYPES = {
    'Ninjutsu': { icon: '⚡', name: 'Ninjutsu' },
    'Taijutsu': { icon: '👊', name: 'Taijutsu' },
    'Genjutsu': { icon: '👁️', name: 'Genjutsu' },
    'Kenjutsu': { icon: '⚔️', name: 'Kenjutsu' }
};

// Rang-Reihenfolge für Vergleiche
const RANK_ORDER = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };

// Kekkei Genkai Clans und ihre Elemente
const KEKKEI_GENKAI_CLANS = {
    'aburame': { element: 'aburame', name: 'Aburame', type: 'kekkei_genkai' },
    'akimichi': { element: 'akimichi', name: 'Akimichi', type: 'hiden' },
    'hyuga': { element: 'hyuga', name: 'Hyuga', type: 'kekkei_genkai' },
    'inuzuka': { element: 'inuzuka', name: 'Inuzuka', type: 'hiden' },
    'nara': { element: 'nara', name: 'Nara', type: 'hiden' },
    'uchiha': { element: 'uchiha', name: 'Uchiha', type: 'kekkei_genkai' },
    'yamanaka': { element: 'yamanaka', name: 'Yamanaka', type: 'hiden' },
    'chinoike': { element: 'chinoike', name: 'Chinoike', type: 'kekkei_genkai' },
    'yotsuki': { element: 'yotsuki', name: 'Yotsuki', type: 'kekkei_genkai' },
    'hozuki': { element: 'hozuki', name: 'Hozuki', type: 'hiden' },
    'hoshigaki': { element: 'hoshigaki', name: 'Hoshigaki', type: 'hiden' },
    'yuki': { element: 'yuki', name: 'Yuki', type: 'kekkei_genkai' },
    'kamizuru': { element: 'kamizuru', name: 'Kamizuru', type: 'hiden' },
    'kaguya': { element: 'kaguya', name: 'Kaguya', type: 'kekkei_genkai' },
    'kurama': { element: 'kurama', name: 'Kurama', type: 'kekkei_genkai' }
};

/**
 * Prüft ob ein Jutsu für den Charakter verfügbar ist
 */
function isJutsuAvailable(jutsu) {
    if (!window.currentCharacter) return false;
    
    const charLevel = window.currentCharacter.level || 1;
    const charClan = window.currentCharacter.clan || '';
    const charElements = window.currentCharacter.elements || [];
    const jutsuRank = jutsu.rank;
    const jutsuElement = jutsu.element;
    
    // 1. Rang-Prüfung für Level 1
    if (charLevel === 1) {
        // Max C-Rang erlaubt, 1x B-Rang
        const learnedCounts = getLearnedJutsuCountByRank();
        
        // A und S Rang nie auf Level 1 erlaubt
        if (jutsuRank === 'A' || jutsuRank === 'S') {
            return false;
        }
        
        // B-Rang nur einmal erlaubt
        if (jutsuRank === 'B' && learnedCounts['B'] >= 1) {
            return false;
        }
    }
    
    // 2. Element-Prüfung
    // Neutrale Jutsus sind immer erlaubt (nach Rang-Prüfung)
    if (jutsuElement === 'neutral') {
        return true;
    }
    
    // 3. Kekkei Genkai / Clan-Prüfung
    const clanData = KEKKEI_GENKAI_CLANS[jutsuElement];
    if (clanData) {
        // Clan-Jutsus nur für den passenden Clan
        return charClan === jutsuElement;
    }
    
    // 4. Standard-Element-Prüfung
    // Element muss vom Charakter beherrscht werden
    if (charElements.includes(jutsuElement)) {
        return true;
    }
    
    // Wenn keines der Kriterien erfüllt ist
    return false;
}

/**
 * Zählt wie viele Jutsus pro Rang bereits gelernt wurden
 */
function getLearnedJutsuCountByRank() {
    if (!window.currentCharacter) return {};
    
    const counts = { 'E': 0, 'D': 0, 'C': 0, 'B': 0, 'A': 0, 'S': 0 };
    window.currentCharacter.jutsus.forEach(jutsu => {
        if (counts[jutsu.rank] !== undefined) {
            counts[jutsu.rank]++;
        }
    });
    return counts;
}

function updateJutsuDropdown() {
    const select = document.getElementById('jutsuSelect');
    if (!select || typeof JUTSU_DATA === 'undefined') return;
    
    // Neue Filter verwenden (JutsuSystem oder direkt aus DOM)
    const elementFilter = document.getElementById('jutsuFilterElement')?.value || '';
    const typeFilter = document.getElementById('jutsuFilterType')?.value || '';
    const rankFilter = document.getElementById('jutsuFilterRank')?.value || '';
    
    // Alle Jutsus filtern
    let filteredJutsus = JUTSU_DATA.filter(jutsu => {
        // Verfügbarkeits-Prüfung
        if (!isJutsuAvailable(jutsu)) return false;
        
        // Element-Filter
        if (elementFilter && jutsu.element !== elementFilter) return false;
        
        // Typ-Filter (general vs clan)
        if (typeFilter === 'clan' && !jutsu.clan) return false;
        if (typeFilter === 'general' && jutsu.clan) return false;
        
        // Rang-Filter
        if (rankFilter && jutsu.rank !== rankFilter) return false;
        
        return true;
    });
    
    // Clan-Jutsus hinzufügen wenn Clan ausgewählt und Typ-Filter passt
    if (window.currentCharacter?.clan && CLAN_JUTSUS[window.currentCharacter.clan]) {
        const clanJutsus = CLAN_JUTSUS[window.currentCharacter.clan].filter(jutsu => {
            // Element-Filter
            if (elementFilter && jutsu.element !== elementFilter) return false;
            // Rang-Filter
            if (rankFilter && jutsu.rank !== rankFilter) return false;
            return true;
        });
        
        if (typeFilter !== 'general') {
            filteredJutsus = [...filteredJutsus, ...clanJutsus];
        }
    }
    
    // Duplikate entfernen
    const seen = new Set();
    filteredJutsus = filteredJutsus.filter(j => {
        if (seen.has(j.id)) return false;
        seen.add(j.id);
        return true;
    });
    
    // Prüfe ob Jutsu bereits gelernt
    const learnedJutsuIds = window.currentCharacter ? window.currentCharacter.jutsus.map(j => j.jutsuId) : [];
    
    // Dropdown neu aufbauen
    select.innerHTML = '<option value="">-- Jutsu auswählen --</option>';
    
    if (filteredJutsus.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'Keine Jutsus verfügbar (prüfe Filter/Element/Clan/Level)';
        select.appendChild(option);
        return;
    }
    
    // Nach Typ und dann nach Rang gruppieren
    const types = ['Ninjutsu', 'Taijutsu', 'Genjutsu', 'Kenjutsu', 'Hijutsu'];
    
    types.forEach(type => {
        const typeJutsus = filteredJutsus.filter(j => j.type === type);
        if (typeJutsus.length === 0) return;
        
        const typeData = JUTSU_TYPES[type];
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${typeData ? typeData.icon : '📜'} ${typeData ? typeData.name : type}`;
        
        // Innerhalb des Typs nach Rang sortieren (E -> S)
        typeJutsus.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
        
        typeJutsus.forEach(jutsu => {
            const isLearned = learnedJutsuIds.includes(jutsu.id);
            
            const option = document.createElement('option');
            option.value = JSON.stringify({
                id: jutsu.id,
                name: jutsu.name,
                rank: jutsu.rank,
                chakra: jutsu.chakra,
                element: jutsu.element,
                type: jutsu.type,
                damage: jutsu.damage,
                rangeM: jutsu.rangeM,
                effect: jutsu.effect,
                description: jutsu.description,
                clan: jutsu.clan
            });
            option.textContent = `${jutsu.name} [${jutsu.rank}]${isLearned ? ' ✅' : ''}${jutsu.clan ? ' 🩸' : ''}`;
            option.disabled = isLearned;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });
}

/**
 * Filtert die Jutsu-Dropdown basierend auf dem ausgewählten Filter
 */
function filterJutsuDropdown() {
    const filterValue = document.getElementById('jutsuFilter')?.value || 'all';
    const select = document.getElementById('jutsuSelect');
    if (!select || typeof JUTSU_DATA === 'undefined') return;
    
    // Alle Jutsus filtern
    let filteredJutsus = JUTSU_DATA.filter(jutsu => {
        // Verfügbarkeits-Prüfung
        if (!isJutsuAvailable(jutsu)) return false;
        
        // Filter anwenden
        switch(filterValue) {
            case 'element':
                // Nur Jutsus vom Charakter-Element
                return window.currentCharacter?.elements?.includes(jutsu.element);
            case 'clan':
                // Nur Clan-Jutsus
                return jutsu.clan || (window.currentCharacter?.clan && CLAN_JUTSUS[window.currentCharacter.clan]?.some(cj => cj.id === jutsu.id));
            case 'general':
                // Keine Clan-Jutsus
                return !jutsu.clan;
            default:
                return true;
        }
    });
    
    // Clan-Jutsus hinzufügen wenn Filter 'clan' oder 'all'
    if ((filterValue === 'clan' || filterValue === 'all') && window.currentCharacter?.clan && CLAN_JUTSUS[window.currentCharacter.clan]) {
        const clanJutsus = CLAN_JUTSUS[window.currentCharacter.clan].filter(cj => 
            !filteredJutsus.some(fj => fj.id === cj.id)
        );
        filteredJutsus = [...filteredJutsus, ...clanJutsus];
    }
    
    // Prüfe ob Jutsu bereits gelernt
    const learnedJutsuIds = window.currentCharacter ? window.currentCharacter.jutsus.map(j => j.jutsuId) : [];
    
    // Dropdown neu aufbauen
    select.innerHTML = '<option value="">-- Jutsu auswählen --</option>';
    
    if (filteredJutsus.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'Keine Jutsus verfügbar für diesen Filter';
        select.appendChild(option);
        return;
    }
    
    // Nach Typ gruppieren
    const types = ['Ninjutsu', 'Taijutsu', 'Genjutsu', 'Kenjutsu', 'Hijutsu'];
    
    types.forEach(type => {
        const typeJutsus = filteredJutsus.filter(j => j.type === type);
        if (typeJutsus.length === 0) return;
        
        const typeData = JUTSU_TYPES[type];
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${typeData ? typeData.icon : '📜'} ${typeData ? typeData.name : type}`;
        
        // Nach Rang sortieren
        typeJutsus.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
        
        typeJutsus.forEach(jutsu => {
            const isLearned = learnedJutsuIds.includes(jutsu.id);
            
            const option = document.createElement('option');
            option.value = JSON.stringify({
                id: jutsu.id,
                name: jutsu.name,
                rank: jutsu.rank,
                chakra: jutsu.chakra,
                element: jutsu.element,
                type: jutsu.type,
                damage: jutsu.damage,
                rangeM: jutsu.rangeM,
                effect: jutsu.effect,
                description: jutsu.description,
                clan: jutsu.clan
            });
            option.textContent = `${jutsu.name} [${jutsu.rank}]${isLearned ? ' ✅' : ''}${jutsu.clan ? ' 🩸' : ''}`;
            option.disabled = isLearned;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });
}

function onJutsuSelect() {
    // Diese Funktion wird nicht mehr verwendet - siehe addSelectedJutsu
    console.log('onJutsuSelect ist veraltet, verwende addSelectedJutsu()');
}

function addSelectedJutsu() {
    console.log('addSelectedJutsu aufgerufen');
    const select = document.getElementById('jutsuSelect');
    if (!select) {
        console.error('jutsuSelect nicht gefunden');
        return;
    }
    if (!select.value) {
        console.log('Kein Wert ausgewählt');
        alert('Bitte wähle ein Jutsu aus dem Dropdown aus!');
        return;
    }
    if (!window.currentCharacter) {
        console.error('Kein window.currentCharacter');
        return;
    }
    
    console.log('Ausgewählter Wert:', select.value);
    
    let jutsuData;
    try {
        jutsuData = JSON.parse(select.value);
    } catch (e) {
        console.error('Fehler beim Parsen:', e);
        return;
    }
    
    console.log('Jutsu Daten:', jutsuData);
    
    // Prüfe ob Jutsu bereits existiert
    const existingIndex = window.currentCharacter.jutsus.findIndex(j => j.jutsuId === jutsuData.id);
    if (existingIndex > -1) {
        alert('Dieses Jutsu hast du bereits in deiner Liste!');
        select.value = '';
        return;
    }
    
    // Prüfe Level-1 Beschränkungen
    if (window.currentCharacter.level === 1) {
        const learnedCounts = getLearnedJutsuCountByRank();
        
        if (jutsuData.rank === 'B' && learnedCounts['B'] >= 1) {
            alert('Auf Level 1 darfst du nur ein B-Rang Jutsu lernen!');
            select.value = '';
            return;
        }
        
        if (RANK_ORDER[jutsuData.rank] > RANK_ORDER['B']) {
            alert(`Auf Level 1 kannst du kein ${jutsuData.rank}-Rang Jutsu lernen!`);
            select.value = '';
            return;
        }
    }
    
    // Prüfe Kekkei Genkai
    const clanData = KEKKEI_GENKAI_CLANS[jutsuData.element];
    if (clanData && jutsuData.element !== window.currentCharacter.clan) {
        alert(`Dieses Jutsu erfordert den ${clanData.name}-Clan!`);
        select.value = '';
        return;
    }
    
    const newJutsu = {
        id: 'jutsu_' + Date.now(),
        jutsuId: jutsuData.id,
        name: jutsuData.name,
        rank: jutsuData.rank,
        chakraCost: jutsuData.chakra,
        element: jutsuData.element,
        type: jutsuData.type,
        damage: jutsuData.damage,
        rangeM: jutsuData.rangeM,
        effect: jutsuData.effect,
        description: jutsuData.description,
        level: 1,
        source: 'Datenbank',
        status: 'learned'
    };
    
    window.currentCharacter.jutsus.push(newJutsu);
    
    renderJutsuTable();
    renderJutsuCards();
    select.value = '';
    autoSave();
    
    alert(`Jutsu "${jutsuData.name}" wurde hinzugefügt!`);
}

function renderJutsuTable() {
    const tbody = document.getElementById('jutsuTableBody');
    if (!tbody || !window.currentCharacter) return;
    
    const jutsus = window.currentCharacter.jutsus || [];
    
    if (jutsus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Noch keine Jutsus ausgewählt</td></tr>';
        return;
    }
    
    tbody.innerHTML = jutsus.map((jutsu, index) => {
        const elementData = ELEMENT_DATA[jutsu.element];
        const rankColors = {
            'E': '#90EE90', 'D': '#87CEEB', 'C': '#FFD700',
            'B': '#FF8C00', 'A': '#DC143C', 'S': '#8B008B'
        };
        
        // Berechne aktuelle Werte basierend auf Level
        const displayJutsu = calculateJutsuValues(jutsu);
        const level = jutsu.level || 1;
        const maxLevel = Rules.JUTSU_LEVEL.maxLevel;
        
        // Prüfe ob Level-Up möglich
        const canLevelUp = level < maxLevel && jutsu.status === 'learned';
        const apCost = canLevelUp ? Rules.getJutsuLevelUpCost(jutsu.rank, level) : 0;
        const availableAP = window.currentCharacter.ap.total - window.currentCharacter.ap.spent;
        const hasEnoughAP = availableAP >= apCost;
        
        return `
            <tr>
                <td>
                    <strong>${jutsu.name}</strong>
                    ${level > 1 ? `<span class="level-badge">Lv.${level}</span>` : ''}
                </td>
                <td><span class="rank-cell" style="background: ${rankColors[jutsu.rank] || '#ccc'}; color: ${jutsu.rank >= 'B' ? 'white' : '#1a1a1a'};">${jutsu.rank}</span></td>
                <td>${jutsu.type || '-'}</td>
                <td class="element-cell">${elementData ? elementData.icon : ''} ${elementData ? elementData.name : jutsu.element}</td>
                <td>
                    ${displayJutsu.chakraCost}
                    ${level > 1 ? `<span class="level-bonus">(-${Math.round((1 - Rules.JUTSU_LEVEL.chakraModifier[level]) * 100)}%)</span>` : ''}
                </td>
                <td>${displayJutsu.damage || '-'}</td>
                <td>
                    <!-- BUGFIX 5: Status nicht mehr frei änderbar, nur Anzeige -->
                    <span class="jutsu-status-badge ${jutsu.status}">
                        ${jutsu.status === 'locked' ? '🔒 Gesperrt' : 
                          jutsu.status === 'training' ? '📖 Training' : '✅ Erlernt'}
                    </span>
                </td>
                <td>
                    ${canLevelUp ? `
                        <button onclick="levelUpJutsu('${jutsu.id}')" 
                                class="btn-levelup ${hasEnoughAP ? '' : 'disabled'}" 
                                title="Level-Up kostet ${apCost} AP"
                                style="padding: 4px 8px; font-size: 11px; background: ${hasEnoughAP ? '#4caf50' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: ${hasEnoughAP ? 'pointer' : 'not-allowed'};">
                            ⬆️ ${apCost} AP
                        </button>
                    ` : level >= maxLevel ? '<span class="max-level">MAX</span>' : '-'}
                </td>
                <td>
                    <button onclick="removeJutsu(${index})" class="btn-remove" style="padding: 6px 12px; font-size: 12px;">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateJutsuStatus(index, status) {
    if (!window.currentCharacter || !window.currentCharacter.jutsus[index]) return;
    
    // BUGFIX 5: Spieler darf Jutsu-Status nicht frei manipulieren
    // Status-Änderungen sind nur durch das Level-Up-System erlaubt
    console.log('BUGFIX 5: Jutsu-Status-Änderung blockiert - nur durch Level-Up-System erlaubt');
    
    // Zeige Fehlermeldung
    alert('Jutsu-Status kann nicht manuell geändert werden.\\n\\nVerwende das Level-Up-System:\\n• Option A: 1 Jutsu direkt auf \"Gelernt\"\\n• Option B: 2 Jutsus auf \"Training\"');
    
    // UI neu rendern um den ursprünglichen Wert wiederherzustellen
    renderJutsuTable();
    renderJutsuCards();
}

function addCustomJutsu() {
    if (!window.currentCharacter) return;
    
    const name = prompt('Name des Jutsu:');
    if (!name) return;
    
    const newJutsu = {
        id: 'jutsu_' + Date.now(),
        jutsuId: null,
        name: name,
        rank: 'E',
        chakraCost: 0,
        element: 'neutral',
        type: 'Ninjutsu',
        damage: null,
        rangeM: null,
        effect: '',
        description: '',
        level: 1,
        source: 'Manuell',
        status: 'locked'
    };
    
    window.currentCharacter.jutsus.push(newJutsu);
    renderJutsuTable();
    renderJutsuCards();
    autoSave();
}

// Manuelle Eingabe Toggle
function toggleManualInput() {
    const manualInput = document.getElementById('manualJutsuInput');
    if (manualInput) {
        manualInput.classList.toggle('hidden');
    }
}

// Manuelles Jutsu hinzufügen
function addManualJutsu() {
    if (!window.currentCharacter) return;
    
    const nameInput = document.getElementById('manualJutsuName');
    const rankInput = document.getElementById('manualJutsuRank');
    
    const name = nameInput?.value?.trim();
    const rank = rankInput?.value || 'C';
    
    if (!name) {
        alert('Bitte gib einen Namen für das Jutsu ein.');
        return;
    }
    
    const newJutsu = {
        id: 'jutsu_' + Date.now(),
        jutsuId: null,
        name: name,
        rank: rank,
        chakraCost: 20,
        element: 'neutral',
        type: 'Ninjutsu',
        damage: null,
        rangeM: null,
        effect: '',
        description: '',
        level: 1,
        source: 'Manuell',
        status: 'locked'
    };
    
    window.currentCharacter.jutsus.push(newJutsu);
    
    // Felder zurücksetzen
    if (nameInput) nameInput.value = '';
    
    // Manuelle Eingabe ausblenden
    toggleManualInput();
    
    renderJutsuTable();
    renderJutsuCards();
    autoSave();
}

function removeJutsu(index) {
    if (!window.currentCharacter) return;
    window.currentCharacter.jutsus.splice(index, 1);
    renderJutsuTable();
    renderJutsuCards();
    autoSave();
}

// ============================================
// JUTSU KARTEN SYSTEM (VISUELL MIT BILDERN)
// ============================================

function renderJutsuCards() {
    const container = document.getElementById('jutsuCardsGrid');
    if (!container || !window.currentCharacter) return;
    
    const jutsus = window.currentCharacter.jutsus || [];
    
    if (jutsus.length === 0) {
        container.innerHTML = '<p class="hint">Noch keine Jutsus ausgewählt. Wähle Jutsus auf der vorherigen Seite aus.</p>';
        return;
    }
    
    // Zeige Admin-Panel wenn DM/Admin
    const adminPanel = document.getElementById('adminJutsuOverride');
    if (adminPanel) {
        const isAdmin = currentUser?.role === 'dm' || currentUser?.role === 'admin';
        adminPanel.classList.toggle('hidden', !isAdmin);
    }
    
    container.innerHTML = jutsus.map(jutsu => {
        const elementData = ELEMENT_DATA[jutsu.element];
        const rankData = RANK_DATA[jutsu.rank];
        
        // Berechne aktuelle Werte basierend auf Level
        const displayJutsu = calculateJutsuValues(jutsu);
        const level = jutsu.level || 1;
        
        // Bild-Pfad aus JUTSU_DATA suchen
        const jutsuData = JUTSU_DATA.find(j => j.id === jutsu.jutsuId);
        const imagePath = jutsuData?.imagePath || null;
        
        // Status-Emoji
        const statusEmoji = jutsu.status === 'learned' ? '✅' : 
                           jutsu.status === 'training' ? '📖' : '🔒';
        
        // Level-Badge
        const levelBadge = level > 1 ? `<span class="jutsu-level-badge">Lv.${level}</span>` : '';
        
        // Level-Up Button (nur wenn gelernt und nicht max level)
        const canLevelUp = jutsu.status === 'learned' && level < 5;
        const levelUpCost = JutsuSystem ? JutsuSystem.getLevelUpCost(jutsu.rank, level) : 0;
        const hasEnoughAP = window.currentCharacter.ap >= levelUpCost;
        
        const levelUpBtn = canLevelUp ? `
            <button class="jutsu-level-btn" 
                onclick="event.stopPropagation(); JutsuSystem.levelUpJutsu('${jutsu.id}')"
                ${!hasEnoughAP ? 'disabled title="Nicht genug AP"' : `title="Level Up kostet ${levelUpCost} AP"`}
            >
                ⬆️ Lv.${level + 1} (${levelUpCost} AP)
            </button>
        ` : '';
        
        return `
            <div class="jutsu-card-visual rank-${jutsu.rank} element-${jutsu.element}" 
                 onclick="openJutsuCardModal('${jutsu.id}')"
                 onmouseenter="JutsuSystem.showTooltip(event, '${jutsu.id}')"
                 onmouseleave="JutsuSystem.hideTooltip()"
                 data-jutsu-id="${jutsu.id}">
                ${imagePath ? `<div class="jutsu-card-bg" style="background-image: url('${imagePath}')"></div>` : ''}
                <div class="jutsu-card-overlay"></div>
                <div class="jutsu-card-accent"></div>
                
                <div class="jutsu-card-rang-badge">${jutsu.rank}</div>
                ${levelBadge}
                ${levelUpBtn}
                
                <div class="jutsu-card-content">
                    <div class="jutsu-card-header">
                        <div class="jutsu-card-type">${jutsu.type || 'Ninjutsu'}</div>
                        <h3 class="jutsu-card-title">${jutsu.name}</h3>
                        <div class="jutsu-card-element">
                            ${elementData ? elementData.icon : '📜'} ${elementData ? elementData.name : jutsu.element}
                        </div>
                    </div>
                    
                    <div class="jutsu-card-stats">
                        ${displayJutsu.damage ? `
                            <div class="jutsu-card-stat">
                                <span class="jutsu-card-stat-label">Schaden</span>
                                <span class="jutsu-card-stat-value">${displayJutsu.damage}</span>
                                ${level > 1 ? `<span class="stat-bonus">+${Math.round((Rules.JUTSU_LEVEL.damageModifier[level] - 1) * 100)}%</span>` : ''}
                            </div>
                        ` : ''}
                        ${displayJutsu.rangeM ? `
                            <div class="jutsu-card-stat">
                                <span class="jutsu-card-stat-label">Reichweite</span>
                                <span class="jutsu-card-stat-value">${displayJutsu.rangeM}m</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="jutsu-card-footer">
                        <div class="jutsu-card-chakra">
                            ⚡ ${displayJutsu.chakraCost} Chakra
                            ${level > 1 ? `<span class="chakra-bonus">(-${Math.round((1 - Rules.JUTSU_LEVEL.chakraModifier[level]) * 100)}%)</span>` : ''}
                        </div>
                        <div class="jutsu-card-status">${statusEmoji}</div>
                    </div>
                </div>
                
                ${jutsu.effect ? `
                    <div class="jutsu-card-effect">
                        <div class="jutsu-card-effect-label">Effekt</div>
                        <div class="jutsu-card-effect-text">${jutsu.effect}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function openJutsuCardModal(jutsuId) {
    const jutsu = window.currentCharacter.jutsus.find(j => j.id === jutsuId);
    if (!jutsu) return;
    
    currentJutsuCardId = jutsuId;
    
    const modal = document.getElementById('jutsuCardModal');
    const content = document.getElementById('jutsuCardDetailContent');
    
    const elementData = ELEMENT_DATA[jutsu.element];
    const rankData = RANK_DATA[jutsu.rank];
    
    content.innerHTML = `
        <div class="jutsu-card-detail">
            <div class="jutsu-card-detail-header">
                <h2 class="jutsu-card-detail-title">${jutsu.name}</h2>
                <div class="jutsu-card-detail-meta">
                    <span style="background: ${rankData ? rankData.color : '#ccc'}; color: ${rankData ? rankData.textColor : '#1a1a1a'};">${jutsu.rank}-Rang</span>
                    <span>${jutsu.type || 'Ninjutsu'}</span>
                    <span>${elementData ? elementData.icon : ''} ${elementData ? elementData.name : jutsu.element}</span>
                </div>
            </div>
            <div class="jutsu-card-detail-body">
                <div class="jutsu-card-detail-section">
                    <h4>⚡ Chakra-Kosten</h4>
                    <p>${jutsu.chakraCost} Chakra</p>
                </div>
                ${jutsu.damage ? `
                    <div class="jutsu-card-detail-section">
                        <h4>⚔️ Schaden</h4>
                        <p>${jutsu.damage}</p>
                    </div>
                ` : ''}
                ${jutsu.rangeM ? `
                    <div class="jutsu-card-detail-section">
                        <h4>📏 Reichweite</h4>
                        <p>${jutsu.rangeM} Meter</p>
                    </div>
                ` : ''}
                ${jutsu.description ? `
                    <div class="jutsu-card-detail-section">
                        <h4>📝 Beschreibung</h4>
                        <p>${jutsu.description}</p>
                    </div>
                ` : ''}
                ${jutsu.effect ? `
                    <div class="jutsu-card-detail-section">
                        <h4>✨ Effekt</h4>
                        <p>${jutsu.effect}</p>
                    </div>
                ` : ''}
                <div class="jutsu-card-detail-section">
                    <h4>📊 Status</h4>
                    <p>${jutsu.status === 'learned' ? '✅ Erlernt' : jutsu.status === 'training' ? '📖 Im Training' : '🔒 Gesperrt'}</p>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeJutsuCardModal() {
    const modal = document.getElementById('jutsuCardModal');
    if (modal) modal.classList.add('hidden');
    currentJutsuCardId = null;
}

function removeJutsuFromCard() {
    if (!currentJutsuCardId || !window.currentCharacter) return;
    
    const index = window.currentCharacter.jutsus.findIndex(j => j.id === currentJutsuCardId);
    if (index > -1) {
        window.currentCharacter.jutsus.splice(index, 1);
        renderJutsuTable();
        renderJutsuCards();
        autoSave();
    }
    
    closeJutsuCardModal();
}

// ============================================
// DM PANEL - Verweist auf DMPanel Objekt in dm-panel.js
// ============================================

// Die Funktionen showDMPanel() und closeDMPanel() sind jetzt in dm-panel.js
// und werden vom DMPanel Objekt verwaltet

// ============================================
// EXPORT/IMPORT
// ============================================

function exportCharacter() {
    if (!window.currentCharacter) return;
    
    const dataStr = JSON.stringify(window.currentCharacter, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = (window.currentCharacter.name || 'charakter') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importCharacter(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const char = JSON.parse(e.target.result);
            char.id = Date.now();
            
            // Migration: Alte Charaktere ohne elements Array
            if (!char.elements) {
                char.elements = char.element ? [char.element] : [];
                delete char.element;
            }
            
            window.currentCharacter = char;
            renderCharacter();
            alert('Charakter importiert!');
        } catch (err) {
            alert('Fehler beim Import: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ============================================
// HILFSFUNKTIONEN
// ============================================

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

// ============================================
// AUSRÜSTUNGSTABELLE
// ============================================

/**
 * Aktualisiert die Ausrüstungstabelle
 */
function updateEquipmentTable() {
    const tbody = document.getElementById('equipmentTableBody');
    if (!tbody || !window.currentCharacter) return;
    
    // Sammle alle Items
    const allItems = [];
    
    // Startausrüstung
    const startingItems = [
        { id: 'leather_armor', name: 'Leder-Rüstung', type: 'Rüstung', slot: 'Brust', rarity: 'Gewöhnlich', bonus: '+1 RK', value: '10', merchant: 'Start', source: 'start', equipped: window.currentCharacter.equipment?.chest?.id === 'leather_armor' },
        { id: 'kunai', name: 'Kunai', type: 'Waffe', slot: 'Waffe 1', rarity: 'Gewöhnlich', bonus: '1W4 Schaden', value: '2', merchant: 'Start', source: 'start', equipped: window.currentCharacter.equipment?.weapon1?.id === 'kunai' },
        { id: 'shuriken', name: 'Shuriken', type: 'Waffe', slot: 'Waffe 2', rarity: 'Gewöhnlich', bonus: '1W4 Schaden', value: '1', merchant: 'Start', source: 'start', equipped: window.currentCharacter.equipment?.weapon2?.id === 'shuriken' }
    ];
    allItems.push(...startingItems);
    
    // Gekaufte Items
    (window.currentCharacter.purchasedItems || []).forEach(item => {
        allItems.push({
            ...item,
            equipped: window.currentCharacter.equipment?.[item.slot]?.id === item.id
        });
    });
    
    // DM Items
    (window.currentCharacter.dmItems || []).forEach(item => {
        allItems.push({
            ...item,
            equipped: window.currentCharacter.equipment?.[item.slot]?.id === item.id
        });
    });
    
    if (allItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">Keine Ausrüstung vorhanden. Besuche einen Händler oder frage den DM.</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = allItems.map(item => {
        const statusClass = item.equipped ? 'status-equipped' : item.source === 'dm' ? 'status-dm' : 'status-owned';
        const statusText = item.equipped ? '● Ausgerüstet' : item.source === 'dm' ? '● DM-Item' : '● Im Besitz';
        
        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.type || '-'}</td>
                <td>${item.slot || '-'}</td>
                <td>${item.rarity || 'Gewöhnlich'}</td>
                <td>${item.bonus || '-'}</td>
                <td>${item.value || '0'} Gold</td>
                <td>${item.merchant || '-'}</td>
                <td class="${statusClass}">${statusText}</td>
            </tr>
        `;
    }).join('');
}

// ============================================
// GLOBALE GELD-ANZEIGE
// ============================================

/**
 * Aktualisiert die globale Geld-Anzeige in der Sidebar
 */
function updateGlobalMoneyDisplay() {
    if (!window.currentCharacter || !window.currentCharacter.money) return;
    
    const goldEl = document.getElementById('globalGold');
    const silverEl = document.getElementById('globalSilver');
    const copperEl = document.getElementById('globalCopper');
    
    if (goldEl) goldEl.textContent = window.currentCharacter.money.gold || 0;
    if (silverEl) silverEl.textContent = window.currentCharacter.money.silver || 0;
    if (copperEl) copperEl.textContent = window.currentCharacter.money.copper || 0;
}

/**
 * Konvertiert Kupfer in Gold/Silver/Kupfer
 */
function convertMoney(copper) {
    const gold = Math.floor(copper / 100);
    copper %= 100;
    const silver = Math.floor(copper / 10);
    copper %= 10;
    return { gold, silver, copper };
}

/**
 * Konvertiert Gold/Silver/Kupfer in Kupfer
 */
function moneyToCopper(gold, silver, copper) {
    return (gold * 100) + (silver * 10) + copper;
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function autoSave() {
    // Hier könnte automatische Speicherung implementiert werden
    console.log('Auto-save triggered');
    saveCharacter();
    
    // BUGFIX 10: Broadcast Änderung an andere Tabs
    broadcastCharacterUpdate();
}

/**
 * Broadcastet Charakter-Änderungen an andere Tabs
 */
function broadcastCharacterUpdate() {
    if (!window.currentCharacter) return;
    
    // Verwende BroadcastChannel API falls verfügbar
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('npu_sync');
        channel.postMessage({
            type: 'character_updated',
            characterId: window.currentCharacter.id,
            timestamp: Date.now()
        });
        channel.close();
    }
    
    // Fallback: Storage Event
    localStorage.setItem('npu_last_update', JSON.stringify({
        characterId: window.currentCharacter.id,
        timestamp: Date.now()
    }));
}

/**
 * Hört auf Änderungen von anderen Tabs
 */
function initSyncListener() {
    // BroadcastChannel API
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('npu_sync');
        channel.onmessage = (event) => {
            if (event.data.type === 'character_updated') {
                handleExternalUpdate(event.data.characterId);
            }
        };
    }
    
    // Storage Event Fallback
    window.addEventListener('storage', (e) => {
        if (e.key === 'npu_last_update') {
            try {
                const data = JSON.parse(e.newValue);
                handleExternalUpdate(data.characterId);
            } catch (err) {
                console.error('Fehler beim Verarbeiten des Sync-Events:', err);
            }
        }
    });
}

/**
 * Verarbeitet externe Updates (von anderen Tabs)
 */
function handleExternalUpdate(characterId) {
    // Nur aktualisieren wenn wir den gleichen Charakter anzeigen
    if (window.currentCharacter && window.currentCharacter.id === characterId) {
        console.log('Externes Update empfangen für Charakter:', characterId);
        
        // Lade aktuelle Daten aus localStorage
        const savedChars = localStorage.getItem('npu_characters');
        if (savedChars) {
            const characters = JSON.parse(savedChars);
            const updatedChar = characters.find(c => c.id === characterId);
            
            if (updatedChar) {
                // Aktualisiere currentCharacter
                window.currentCharacter = updatedChar;
                
                // UI neu rendern
                renderCharacter();
                
                // Zeige Benachrichtigung
                showSyncNotification('Charakter wurde aktualisiert');
            }
        }
    }
}

/**
 * Zeigt eine Synchronisations-Benachrichtigung
 */
function showSyncNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.innerHTML = `
        <span class="sync-icon">🔄</span>
        <span class="sync-message">${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Speichert den aktuellen Charakter im localStorage
 * BUGFIX 13: Account-gebundenes Speichern
 */
function saveCharacter() {
    if (!window.currentCharacter) return;
    
    // BUGFIX 13: Prüfe eingeloggten User
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        console.error('Kein User eingeloggt - Charakter kann nicht gespeichert werden');
        return;
    }
    
    // BUGFIX 13: Weise Charakter dem User zu
    window.currentCharacter.userId = currentUser.id;
    window.currentCharacter.lastModified = new Date().toISOString();
    
    // BUGFIX 13: User-spezifischer Speicher-Key
    const storageKey = `npu_characters_${currentUser.id}`;
    const savedChars = localStorage.getItem(storageKey);
    let characters = savedChars ? JSON.parse(savedChars) : [];
    
    // Prüfe ob Charakter bereits existiert
    const existingIndex = characters.findIndex(c => c.id === window.currentCharacter.id);
    
    if (existingIndex >= 0) {
        // Aktualisiere bestehenden Charakter
        characters[existingIndex] = window.currentCharacter;
    } else {
        // Füge neuen Charakter hinzu
        characters.push(window.currentCharacter);
    }
    
    // BUGFIX 13: Speichere im user-spezifischen localStorage
    localStorage.setItem(storageKey, JSON.stringify(characters));
    console.log('Charakter gespeichert:', window.currentCharacter.name, 'für User:', currentUser.username);
}

/**
 * Lädt alle gespeicherten Charaktere des aktuellen Users
 * BUGFIX 13: Account-gebundenes Laden
 */
function loadCharacters() {
    // Versuche zuerst das neue AccountSystem
    if (typeof AccountSystem !== 'undefined' && AccountSystem.isLoggedIn()) {
        const characters = AccountSystem.getUserCharacters();
        console.log('[loadCharacters] AccountSystem:', characters.length, 'Charaktere geladen');
        return characters;
    }
    
    // Fallback zu altem System
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        console.log('Kein User eingeloggt - keine Charaktere geladen');
        return [];
    }
    
    // BUGFIX 13: Lade nur Charaktere des aktuellen Users
    const storageKey = `npu_characters_${currentUser.id}`;
    const savedChars = localStorage.getItem(storageKey);
    
    if (!savedChars) {
        // KEINE Migration mehr - jeder User startet mit leeren Charakteren
        // Dadurch wird verhindert, dass Charaktere zwischen Usern geteilt werden
        console.log('Keine Charaktere für User:', currentUser.username);
        return [];
    }
    
    return JSON.parse(savedChars);
}

/**
 * Lädt einen spezifischen Charakter des aktuellen Users
 * BUGFIX 13: Account-gebundenes Laden
 */
function loadCharacterById(characterId) {
    // Versuche zuerst das neue AccountSystem
    if (typeof AccountSystem !== 'undefined' && AccountSystem.isLoggedIn()) {
        return AccountSystem.loadCharacter(characterId);
    }
    
    // Fallback zu altem System
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) return null;
    
    const storageKey = `npu_characters_${currentUser.id}`;
    const savedChars = localStorage.getItem(storageKey);
    
    if (!savedChars) return null;
    
    const characters = JSON.parse(savedChars);
    return characters.find(c => c.id === characterId) || null;
}

// ============================================
// TALENT-SYSTEM
// ============================================

/**
 * Aktualisiert das Talent-Dropdown
 */
function updateTalentDropdown() {
    console.log('=== updateTalentDropdown START ===');
    const select = document.getElementById('talentSelect');
    if (!select) {
        console.error('talentSelect Element nicht gefunden!');
        return;
    }
    
    if (typeof TALENTS_DB === 'undefined') {
        console.error('TALENTS_DB ist nicht definiert!');
        return;
    }
    
    console.log('TALENTS_DB verfügbar, Anzahl Talente:', Object.keys(TALENTS_DB).length);
    console.log('currentCharacter:', window.currentCharacter ? 'vorhanden' : 'nicht vorhanden');
    
    select.innerHTML = '<option value="">-- Talent wählen --</option>';
    
    // Nach Kategorien gruppieren
    const categories = ['Chakra', 'Kampf', 'Spezialisierung', 'Element', 'Verteidigung'];
    let totalOptions = 0;
    
    categories.forEach(category => {
        const categoryTalents = Object.values(TALENTS_DB).filter(t => 
            t.category === category && isTalentAvailable(t.id)
        );
        
        console.log(`Kategorie ${category}: ${categoryTalents.length} verfügbare Talente`);
        
        if (categoryTalents.length === 0) return;
        
        const categoryData = TALENT_CATEGORIES[category];
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${categoryData ? categoryData.icon : '📜'} ${categoryData ? categoryData.name : category}`;
        
        // Nach Kosten sortieren
        categoryTalents.sort((a, b) => a.cost - b.cost);
        
        categoryTalents.forEach(talent => {
            const option = document.createElement('option');
            option.value = talent.id;
            option.textContent = `${talent.name} [${talent.cost} Punkte]`;
            optgroup.appendChild(option);
            totalOptions++;
        });
        
        select.appendChild(optgroup);
    });
    
    console.log(`=== updateTalentDropdown ENDE - ${totalOptions} Optionen hinzugefügt ===`);
}

/**
 * Prüft ob ein Talent verfügbar ist
 */
function isTalentAvailable(talentId) {
    if (!window.currentCharacter) return false;
    if (!window.currentCharacter.talents) return false;
    
    const talent = TALENTS_DB[talentId];
    if (!talent) return false;
    
    // Talente können als Array oder Objekt gespeichert sein
    let selectedIds = [];
    if (Array.isArray(window.currentCharacter.talents)) {
        selectedIds = window.currentCharacter.talents.map(t => t.id || t);
    } else if (window.currentCharacter.talents.selected) {
        selectedIds = window.currentCharacter.talents.selected;
    }
    
    // Bereits gewählt?
    if (selectedIds.includes(talentId)) return false;
    
    // Voraussetzungen prüfen
    if (talent.requires) {
        const hasRequirements = talent.requires.every(req => 
            selectedIds.includes(req)
        );
        if (!hasRequirements) return false;
    }
    
    return true;
}

/**
 * Wird aufgerufen wenn ein Talent im Dropdown ausgewählt wird
 */
function onTalentSelect() {
    const select = document.getElementById('talentSelect');
    const infoDiv = document.getElementById('talentInfo');
    const btnAdd = document.getElementById('btnAddTalent');
    
    if (!select || !infoDiv || !btnAdd) return;
    
    const talentId = select.value;
    
    if (!talentId) {
        infoDiv.style.display = 'none';
        btnAdd.disabled = true;
        return;
    }
    
    const talent = TALENTS_DB[talentId];
    if (!talent) return;
    
    // Info anzeigen
    document.getElementById('talentInfoName').textContent = talent.name;
    document.getElementById('talentInfoCost').textContent = `${talent.cost} Punkte`;
    document.getElementById('talentInfoDescription').textContent = talent.description;
    
    // Effekte formatieren
    const effectsText = formatTalentEffects(talent.effects);
    document.getElementById('talentInfoEffects').innerHTML = effectsText ? `<strong>Effekte:</strong> ${effectsText}` : '';
    
    infoDiv.style.display = 'block';
    
    // Prüfen ob hinzugefügt werden kann
    const canAdd = canAddTalent(talentId);
    btnAdd.disabled = !canAdd;
    btnAdd.title = canAdd ? '' : 'Nicht genug Punkte oder Limit erreicht';
}

/**
 * Formatiert Talent-Effekte für die Anzeige
 */
function formatTalentEffects(effects) {
    if (!effects) return '';
    
    const effectTexts = [];
    
    if (effects.chakraBonus) effectTexts.push(`+${effects.chakraBonus} Chakra`);
    if (effects.chakraRegen) effectTexts.push(`+${effects.chakraRegen} Chakra/Regen`);
    if (effects.initiativeBonus) effectTexts.push(`+${effects.initiativeBonus} Initiative`);
    if (effects.ausweichenBonus) effectTexts.push(`+${effects.ausweichenBonus} Ausweichen`);
    if (effects.angriffBonus) effectTexts.push(`+${effects.angriffBonus} Angriff`);
    if (effects.paradeBonus) effectTexts.push(`+${effects.paradeBonus} RK (Parade)`);
    if (effects.staminaBonus) effectTexts.push(`+${effects.staminaBonus} Ausdauer`);
    if (effects.ninjutsuBonus) effectTexts.push(`+${effects.ninjutsuBonus} Ninjutsu`);
    if (effects.taijutsuBonus) effectTexts.push(`+${effects.taijutsuBonus} Taijutsu`);
    if (effects.genjutsuBonus) effectTexts.push(`+${effects.genjutsuBonus} Genjutsu`);
    if (effects.chakraCostReduction) effectTexts.push(`-${Math.round(effects.chakraCostReduction * 100)}% Chakra-Kosten`);
    if (effects.critRange) effectTexts.push(`Kritisch bei ${effects.critRange}-20`);
    
    return effectTexts.join(', ');
}

/**
 * Prüft ob ein Talent hinzugefügt werden kann
 */
function canAddTalent(talentId) {
    if (!window.currentCharacter) return false;
    
    const talent = TALENTS_DB[talentId];
    if (!talent) return false;
    
    let talents = window.currentCharacter.talents;
    
    // BUGFIX 3: Stelle sicher, dass Talente im korrekten Format sind
    if (Array.isArray(talents)) {
        const pointsSpent = talents.reduce((sum, t) => sum + (t.cost || 0), 0);
        talents = {
            selected: talents.map(t => t.id || t),
            pointsSpent: pointsSpent,
            pointsTotal: 5
        };
    }
    
    // Fallback wenn talents nicht das erwartete Format hat
    if (!talents.selected) talents.selected = [];
    if (!talents.pointsTotal) talents.pointsTotal = 5;
    if (!talents.pointsSpent) talents.pointsSpent = 0;
    
    // Genug Punkte?
    const availablePoints = talents.pointsTotal - talents.pointsSpent;
    if (talent.cost > availablePoints) return false;
    
    // Max 5 Talente?
    if (talents.selected.length >= TALENT_RULES.maxTalents) return false;
    
    // Max 2 teure Talente?
    if (talent.cost >= TALENT_RULES.highCostThreshold) {
        const highCostCount = talents.selected.filter(id => 
            TALENTS_DB[id].cost >= TALENT_RULES.highCostThreshold
        ).length;
        if (highCostCount >= TALENT_RULES.maxHighCostTalents) return false;
    }
    
    return true;
}

/**
 * Fügt das ausgewählte Talent hinzu
 */
function addSelectedTalent() {
    console.log('addSelectedTalent aufgerufen');
    const select = document.getElementById('talentSelect');
    if (!select) {
        console.error('talentSelect nicht gefunden');
        return;
    }
    if (!select.value) {
        console.log('Kein Talent ausgewählt');
        return;
    }
    if (!window.currentCharacter) {
        console.error('Kein window.currentCharacter');
        return;
    }
    
    const talentId = select.value;
    console.log('Talent ID:', talentId);
    
    const talent = TALENTS_DB[talentId];
    if (!talent) {
        console.error('Talent nicht gefunden:', talentId);
        return;
    }
    
    console.log('Talent:', talent);
    
    if (!canAddTalent(talentId)) {
        alert('Dieses Talent kann nicht hinzugefügt werden!');
        return;
    }
    
    // Talent hinzufügen
    if (Array.isArray(window.currentCharacter.talents)) {
        window.currentCharacter.talents.push({
            id: talentId,
            name: talent.name,
            cost: talent.cost
        });
    } else {
        window.currentCharacter.talents.selected.push(talentId);
        window.currentCharacter.talents.pointsSpent += talent.cost;
    }
    
    // UI aktualisieren
    updateTalentDisplay();
    updateTalentDropdown();
    calculateAll(); // Charakterwerte neu berechnen
    autoSave();
}

/**
 * Entfernt ein Talent
 */
function removeTalent(talentId) {
    if (!window.currentCharacter) return;
    
    const index = window.currentCharacter.talents.selected.indexOf(talentId);
    if (index === -1) return;
    
    const talent = TALENTS_DB[talentId];
    
    // Prüfen ob andere Talente dieses als Voraussetzung haben
    let selectedIds = [];
    if (Array.isArray(window.currentCharacter.talents)) {
        selectedIds = window.currentCharacter.talents.map(t => t.id || t);
    } else if (window.currentCharacter.talents.selected) {
        selectedIds = window.currentCharacter.talents.selected;
    }
    
    const dependentTalents = selectedIds.filter(id => {
        const t = TALENTS_DB[id];
        return t.requires && t.requires.includes(talentId);
    });
    
    if (dependentTalents.length > 0) {
        const names = dependentTalents.map(id => TALENTS_DB[id].name).join(', ');
        alert(`Dieses Talent ist Voraussetzung für: ${names}. Bitte zuerst diese entfernen.`);
        return;
    }
    
    // Talent entfernen
    if (Array.isArray(window.currentCharacter.talents)) {
        const index = window.currentCharacter.talents.findIndex(t => (t.id || t) === talentId);
        if (index > -1) {
            window.currentCharacter.talents.splice(index, 1);
        }
    } else {
        const index = window.currentCharacter.talents.selected.indexOf(talentId);
        if (index > -1) {
            window.currentCharacter.talents.selected.splice(index, 1);
            window.currentCharacter.talents.pointsSpent -= talent.cost;
        }
    }
    
    // UI aktualisieren
    updateTalentDisplay();
    updateTalentDropdown();
    calculateAll();
    autoSave();
}

/**
 * Kauft zusätzliche Talentpunkte mit AP
 */
function buyTalentPointWithAP() {
    if (!window.currentCharacter) return;
    
    const availableAP = window.currentCharacter.ap.total - window.currentCharacter.ap.spent;
    
    if (availableAP < TALENT_RULES.apPerTalentPoint) {
        alert(`Nicht genug AP! Benötigt: ${TALENT_RULES.apPerTalentPoint}, Verfügbar: ${availableAP}`);
        return;
    }
    
    // AP abziehen
    window.currentCharacter.ap.spent += TALENT_RULES.apPerTalentPoint;
    window.currentCharacter.ap.history.push({
        type: 'talent_point',
        cost: TALENT_RULES.apPerTalentPoint,
        date: Date.now()
    });
    
    // Talentpunkt hinzufügen
    if (Array.isArray(window.currentCharacter.talents)) {
        // Konvertiere zu Objekt-Format
        const oldTalents = [...window.currentCharacter.talents];
        window.currentCharacter.talents = {
            selected: oldTalents.map(t => t.id || t),
            pointsSpent: oldTalents.reduce((sum, t) => sum + (t.cost || 0), 0),
            pointsTotal: 6 // 5 + 1 gekauft
        };
    } else {
        window.currentCharacter.talents.pointsTotal += 1;
    }
    
    // UI aktualisieren
    updateAPDisplay();
    updateTalentDisplay();
    autoSave();
    
    alert('Talentpunkt erfolgreich erworben!');
}

/**
 * Aktualisiert die Talent-Anzeige
 */
function updateTalentDisplay() {
    if (!window.currentCharacter) return;
    
    // Talente können als Array oder Objekt gespeichert sein
    let talents = window.currentCharacter.talents;
    
    // Wenn Talente ein Array ist, konvertiere zu Objekt-Format
    if (Array.isArray(talents)) {
        const pointsSpent = talents.reduce((sum, t) => sum + (t.cost || 0), 0);
        talents = {
            selected: talents.map(t => t.id || t),
            pointsSpent: pointsSpent,
            pointsTotal: 5
        };
    }
    
    // Fallback wenn talents nicht das erwartete Format hat
    if (!talents.selected) talents.selected = [];
    if (!talents.pointsTotal) talents.pointsTotal = 5;
    if (!talents.pointsSpent) talents.pointsSpent = 0;
    
    // Punkte-Anzeige
    const availablePoints = talents.pointsTotal - talents.pointsSpent;
    const pointsAvailableEl = document.getElementById('talentPointsAvailable');
    const pointsTotalEl = document.getElementById('talentPointsTotal');
    
    if (pointsAvailableEl) pointsAvailableEl.textContent = availablePoints;
    if (pointsTotalEl) pointsTotalEl.textContent = talents.pointsTotal;
    
    // Limits
    const talentCountEl = document.getElementById('talentCount');
    const highCostCountEl = document.getElementById('highCostTalentCount');
    
    if (talentCountEl) {
        talentCountEl.textContent = `${talents.selected.length} / ${TALENT_RULES.maxTalents}`;
    }
    
    if (highCostCountEl) {
        const highCostCount = talents.selected.filter(id => {
            const talent = TALENTS_DB[id];
            return talent && talent.cost >= TALENT_RULES.highCostThreshold;
        }).length;
        highCostCountEl.textContent = `${highCostCount} / ${TALENT_RULES.maxHighCostTalents}`;
    }
    
    // Gewählte Talente Liste
    const talentsListEl = document.getElementById('talentsList');
    if (talentsListEl) {
        if (talents.selected.length === 0) {
            talentsListEl.innerHTML = '<p class="hint">Noch keine Talente ausgewählt</p>';
        } else {
            talentsListEl.innerHTML = talents.selected.map(talentId => {
                const talent = TALENTS_DB[talentId];
                if (!talent) return '';
                
                const effectsText = formatTalentEffects(talent.effects);
                
                return `
                    <div class="talent-item">
                        <div class="talent-item-header">
                            <span class="talent-item-name">${talent.name}</span>
                            <span class="talent-item-cost">${talent.cost} Punkte</span>
                            <button class="btn-remove-talent" onclick="removeTalent('${talentId}')" title="Entfernen">×</button>
                        </div>
                        <div class="talent-item-description">${talent.description}</div>
                        ${effectsText ? `<div class="talent-item-effects">${effectsText}</div>` : ''}
                    </div>
                `;
            }).join('');
        }
    }
    
    // Button-Status aktualisieren
    const btnAdd = document.getElementById('btnAddTalent');
    if (btnAdd) {
        const select = document.getElementById('talentSelect');
        if (select && select.value) {
            btnAdd.disabled = !canAddTalent(select.value);
        }
    }
}

/**
 * Berechnet die Talent-Boni für Charakterwerte
 */
function calculateTalentBonuses() {
    if (!window.currentCharacter) {
        return {
            chakraBonus: 0, chakraRegen: 0, initiativeBonus: 0, ausweichenBonus: 0,
            angriffBonus: 0, paradeBonus: 0, staminaBonus: 0, ninjutsuBonus: 0,
            taijutsuBonus: 0, genjutsuBonus: 0, chakraCostReduction: 0, critRange: 20
        };
    }
    
    // Talente können als Array oder Objekt gespeichert sein
    let talentIds = [];
    if (Array.isArray(window.currentCharacter.talents)) {
        talentIds = window.currentCharacter.talents.map(t => t.id || t);
    } else if (window.currentCharacter.talents && window.currentCharacter.talents.selected) {
        talentIds = window.currentCharacter.talents.selected;
    }
    
    if (talentIds.length === 0) {
        return {
            chakraBonus: 0, chakraRegen: 0, initiativeBonus: 0, ausweichenBonus: 0,
            angriffBonus: 0, paradeBonus: 0, staminaBonus: 0, ninjutsuBonus: 0,
            taijutsuBonus: 0, genjutsuBonus: 0, chakraCostReduction: 0, critRange: 20
        };
    }
    
    const bonuses = {
        chakraBonus: 0,
        chakraRegen: 0,
        initiativeBonus: 0,
        ausweichenBonus: 0,
        angriffBonus: 0,
        paradeBonus: 0,
        staminaBonus: 0,
        ninjutsuBonus: 0,
        taijutsuBonus: 0,
        genjutsuBonus: 0,
        chakraCostReduction: 0,
        critRange: 20
    };
    
    talentIds.forEach(talentId => {
        const talent = TALENTS_DB[talentId];
        if (!talent || !talent.effects) return;
        
        const effects = talent.effects;
        
        if (effects.chakraBonus) bonuses.chakraBonus += effects.chakraBonus;
        if (effects.chakraRegen) bonuses.chakraRegen += effects.chakraRegen;
        if (effects.initiativeBonus) bonuses.initiativeBonus += effects.initiativeBonus;
        if (effects.ausweichenBonus) bonuses.ausweichenBonus += effects.ausweichenBonus;
        if (effects.angriffBonus) bonuses.angriffBonus += effects.angriffBonus;
        if (effects.paradeBonus) bonuses.paradeBonus += effects.paradeBonus;
        if (effects.staminaBonus) bonuses.staminaBonus += effects.staminaBonus;
        if (effects.ninjutsuBonus) bonuses.ninjutsuBonus += effects.ninjutsuBonus;
        if (effects.taijutsuBonus) bonuses.taijutsuBonus += effects.taijutsuBonus;
        if (effects.genjutsuBonus) bonuses.genjutsuBonus += effects.genjutsuBonus;
        if (effects.chakraCostReduction) bonuses.chakraCostReduction += effects.chakraCostReduction;
        if (effects.critRange && effects.critRange < bonuses.critRange) {
            bonuses.critRange = effects.critRange;
        }
    });
    
    return bonuses;
}

// ============================================
// JUTSU LERN-SYSTEM
// ============================================

/**
 * Berechnet verfügbare Jutsu-Lern-Slots
 * Pro Level: 1 direkt ODER 2 im Training
 */
function calculateAvailableJutsuSlots() {
    if (!window.currentCharacter) return { direct: 0, training: 0 };
    
    const level = window.currentCharacter.level || 1;
    const learnedJutsus = window.currentCharacter.jutsus || [];
    const jutsuInTraining = window.currentCharacter.jutsuInTraining || [];
    
    // Maximal mögliche Jutsus basierend auf Level
    const maxDirect = level; // 1 pro Level direkt
    const maxTraining = level * 2; // 2 pro Level im Training
    
    // Bereits gelernte Jutsus zählen
    const learnedDirect = learnedJutsus.filter(j => j.learnedDirectly).length;
    const learnedTraining = jutsuInTraining.length;
    
    return {
        direct: maxDirect - learnedDirect,
        training: maxTraining - learnedTraining,
        totalDirect: maxDirect,
        totalTraining: maxTraining,
        usedDirect: learnedDirect,
        usedTraining: learnedTraining
    };
}

/**
 * Aktualisiert die Jutsu-Lern-Optionen basierend auf gewähltem Modus
 */
function updateJutsuLearningOptions() {
    const modeSelect = document.getElementById('jutsuLearningMode');
    const jutsuSelect = document.getElementById('jutsuSelect');
    const addBtn = document.getElementById('addJutsuBtn');
    const slots = calculateAvailableJutsuSlots();
    
    if (!modeSelect || !jutsuSelect || !addBtn) return;
    
    const mode = modeSelect.value;
    
    // Prüfe ob Slots verfügbar
    if (mode === 'direct' && slots.direct <= 0) {
        alert('Keine direkten Lern-Slots mehr verfügbar!');
        modeSelect.value = '';
        jutsuSelect.disabled = true;
        addBtn.disabled = true;
        return;
    }
    
    if (mode === 'training' && slots.training <= 0) {
        alert('Keine Trainings-Slots mehr verfügbar!');
        modeSelect.value = '';
        jutsuSelect.disabled = true;
        addBtn.disabled = true;
        return;
    }
    
    if (!mode) {
        jutsuSelect.disabled = true;
        jutsuSelect.innerHTML = '<option value="">-- Wähle zuerst den Lern-Modus --</option>';
        addBtn.disabled = true;
        return;
    }
    
    // Filter Jutsus basierend auf Element, Clan und Rang
    const availableJutsus = getAvailableJutsusForLearning();
    
    jutsuSelect.disabled = false;
    jutsuSelect.innerHTML = '<option value="">-- Jutsu auswählen --</option>';
    
    if (availableJutsus.length === 0) {
        jutsuSelect.innerHTML = '<option value="">Keine Jutsus verfügbar (prüfe Element/Clan/Rang)</option>';
        addBtn.disabled = true;
    } else {
        availableJutsus.forEach(jutsu => {
            const option = document.createElement('option');
            option.value = JSON.stringify(jutsu);
            option.textContent = `${jutsu.name} [${jutsu.rank}] - ${jutsu.type} (${jutsu.element})`;
            jutsuSelect.appendChild(option);
        });
        addBtn.disabled = false;
    }
    
    // Aktualisiere Filter-Info
    updateJutsuFilterInfo();
    updateAvailableSlotsDisplay();
}

/**
 * Holt verfügbare Jutsus basierend auf Charakter-Eigenschaften
 */
function getAvailableJutsusForLearning() {
    if (!window.currentCharacter || typeof JUTSU_DATA === 'undefined') return [];
    
    const char = window.currentCharacter;
    const charElements = char.elements || [];
    const charClan = char.clan || '';
    const charRank = char.rank || 'Genin';
    
    // Rang-Grenzen
    const rankLimits = {
        'Academy Student': ['E'],
        'Genin': ['E', 'D'],
        'Chunin': ['E', 'D', 'C'],
        'Jonin': ['E', 'D', 'C', 'B'],
        'ANBU': ['E', 'D', 'C', 'B', 'A'],
        'S-Rang': ['E', 'D', 'C', 'B', 'A', 'S']
    };
    
    const allowedRanks = rankLimits[charRank] || ['E'];
    
    return JUTSU_DATA.filter(jutsu => {
        // 1. Rang-Prüfung
        if (!allowedRanks.includes(jutsu.rank)) return false;
        
        // 2. Element-Prüfung (Charakter muss Element beherrschen oder es ist neutral/clan)
        if (jutsu.element !== 'neutral') {
            // Clan-Jutsus nur für passenden Clan
            const clanData = KEKKEI_GENKAI_CLANS[jutsu.element];
            if (clanData) {
                if (charClan !== jutsu.element) return false;
            } else {
                // Normale Element-Jutsus
                if (!charElements.includes(jutsu.element)) return false;
            }
        }
        
        // 3. Prüfe ob Jutsu bereits gelernt
        const alreadyLearned = char.jutsus?.some(j => j.jutsuId === jutsu.id);
        if (alreadyLearned) return false;
        
        return true;
    });
}

/**
 * Aktualisiert die Anzeige der verfügbaren Slots
 */
function updateAvailableSlotsDisplay() {
    const slots = calculateAvailableJutsuSlots();
    const display = document.getElementById('availableJutsuSlots');
    if (display) {
        display.innerHTML = `
            ${slots.direct} Direkt / ${slots.training} Training 
            (Genutzt: ${slots.usedDirect}/${slots.totalDirect} Direkt, ${slots.usedTraining}/${slots.totalTraining} Training)
        `;
    }
}

/**
 * Aktualisiert die Filter-Info-Anzeige
 */
function updateJutsuFilterInfo() {
    if (!window.currentCharacter) return;
    
    const char = window.currentCharacter;
    const filters = [];
    
    if (char.elements?.length > 0) {
        filters.push(`Element: ${char.elements.join(', ')}`);
    }
    if (char.clan) {
        filters.push(`Clan: ${char.clan}`);
    }
    filters.push(`Rang: bis ${char.rank || 'Genin'}`);
    
    const filterSpan = document.getElementById('activeJutsuFilters');
    if (filterSpan) {
        filterSpan.textContent = filters.join(' | ') || 'Keine';
    }
}

/**
 * Fügt ein ausgewähltes Jutsu hinzu
 */
function addSelectedJutsu() {
    const modeSelect = document.getElementById('jutsuLearningMode');
    const jutsuSelect = document.getElementById('jutsuSelect');
    
    if (!modeSelect || !jutsuSelect) return;
    
    const mode = modeSelect.value;
    const jutsuValue = jutsuSelect.value;
    
    if (!mode || !jutsuValue) {
        alert('Bitte wähle einen Lern-Modus und ein Jutsu aus!');
        return;
    }
    
    try {
        const jutsuData = JSON.parse(jutsuValue);
        
        // Füge Jutsu zum Charakter hinzu
        if (!window.currentCharacter.jutsus) {
            window.currentCharacter.jutsus = [];
        }
        
        const newJutsu = {
            jutsuId: jutsuData.id,
            name: jutsuData.name,
            rank: jutsuData.rank,
            type: jutsuData.type,
            element: jutsuData.element,
            chakra: jutsuData.chakra,
            damage: jutsuData.damage,
            rangeM: jutsuData.rangeM,
            effect: jutsuData.effect,
            description: jutsuData.description,
            learnedAt: new Date().toISOString(),
            learnedDirectly: mode === 'direct',
            inTraining: mode === 'training',
            level: 1,
            xp: 0
        };
        
        window.currentCharacter.jutsus.push(newJutsu);
        
        // BUGFIX 6: UI sofort aktualisieren
        renderJutsuTable();
        renderJutsuCards();
        
        // Speichern
        saveCharacter();
        
        // UI aktualisieren
        alert(`Jutsu "${jutsuData.name}" wurde ${mode === 'direct' ? 'direkt gelernt' : 'in Training gestellt'}!`);
        
        // Zurücksetzen
        modeSelect.value = '';
        jutsuSelect.innerHTML = '<option value="">-- Wähle zuerst den Lern-Modus --</option>';
        jutsuSelect.disabled = true;
        document.getElementById('addJutsuBtn').disabled = true;
        
        updateAvailableSlotsDisplay();
        // updateJutsuTable(); // TODO: Implementieren wenn Jutsu-Tabelle existiert
        
    } catch (e) {
        console.error('Fehler beim Hinzufügen des Jutsu:', e);
        alert('Fehler beim Hinzufügen des Jutsu!');
    }
}

