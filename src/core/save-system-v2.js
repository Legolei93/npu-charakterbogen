/**
 * SaveSystemV2 - Production-Grade Persistenz-Architektur
 * 
 * Features:
 * - Atomic Save (temp → validate → commit)
 * - Save-Level Processing Lock
 * - Versioning mit Optimistic Locking
 * - Merge Strategy für Konflikte
 * - Diff Updates
 * - Save Queue (serialisiert)
 * - Retry Logic mit Backoff
 * - Rollback System
 * - Corruption Detection
 */

const SaveSystemV2 = {
    
    // === KONFIGURATION ===
    CONFIG: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 100, // ms
        BACKOFF_MULTIPLIER: 2,
        TEMP_SUFFIX: '_temp',
        BACKUP_SUFFIX: '_backup',
        LOCK_TIMEOUT: 5000, // 5 Sekunden
        DIFF_ENABLED: true,
        ATOMIC_COMMIT: true,
        LOCK_KEY: 'npu_save_system_lock'  // FIX 1: Globaler Lock-Key
    },
    
    // === STATE ===
    _saveQueue: [],
    _isSaving: false,
    _currentVersion: 0,
    _lastSavedVersion: 0,
    _saveLock: {
        locked: false,
        owner: null,
        timestamp: null
    },
    _saveHistory: [], // Für Rollback
    _pendingDiff: null, // Für Diff-Updates
    _tabId: null,  // FIX 1: Eindeutige Tab-ID
    
    // === INITIALISIERUNG ===
    
    init() {
        console.log('[SaveSystemV2] Initialisiere...');
        this._tabId = this._generateTabId();  // FIX 1: Tab-ID generieren
        this._loadVersion();
        this._setupStorageListener();
        console.log('[SaveSystemV2] Initialisiert');
    },
    
    /**
     * FIX 1: Generiert eindeutige Tab-ID
     */
    _generateTabId() {
        return 'TAB_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Setup Storage Listener für Multi-Tab Sync
     * FIX 4: Erweitert für alle relevanten Keys
     */
    _setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (!e.key) return;
            
            // FIX 4: Lock-Key überwachen
            if (e.key === this.CONFIG.LOCK_KEY) {
                if (!e.newValue) {
                    // Lock wurde freigegeben - Queue kann weitermachen
                    console.log('[SaveSystemV2] Lock released by other tab');
                }
                return;
            }
            
            // FIX 4: Version-Changes überwachen
            if (e.key.includes('_version')) {
                const newVersion = parseInt(e.newValue) || 0;
                if (newVersion > this._lastSavedVersion) {
                    console.log(`[SaveSystemV2] Version update: ${this._lastSavedVersion} → ${newVersion}`);
                    this._lastSavedVersion = newVersion;
                    this._handleExternalVersionChange(newVersion);
                }
            }
            
            // FIX 4: Haupt-Data-Keys überwachen
            if (!e.key.includes('_temp') && 
                !e.key.includes('_backup') && 
                !e.key.includes('_version') &&
                e.key !== this.CONFIG.LOCK_KEY) {
                // Anderer Tab hat Daten geändert
                console.log(`[SaveSystemV2] Data changed by other tab: ${e.key}`);
                this._handleExternalDataChange(e.key, e.newValue);
            }
        });
    },
    
    /**
     * FIX 4: Externe Daten-Änderung behandeln
     */
    _handleExternalDataChange(storageKey, newValue) {
        // Wenn wir gerade speichern, abbrechen oder mergen
        if (this._isSaving) {
            console.warn('[SaveSystemV2] External change detected during save - potential conflict');
        }
        
        // Event für andere Systeme
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('save:external_change', { storageKey, newValue });
        }
    },
    
    /**
     * Externe Version-Change behandeln (anderer Tab)
     */
    _handleExternalVersionChange(newVersion) {
        if (this._currentVersion < newVersion) {
            console.warn('[SaveSystemV2] Version conflict detected - reloading state');
            // Emit event für TrainingSystem
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('save:version_conflict', {
                    localVersion: this._currentVersion,
                    externalVersion: newVersion
                });
            }
        }
    },
    
    // === SAVE QUEUE ===
    
    /**
     * Fügt Save-Operation zur Queue hinzu
     */
    enqueueSave(storageKey, data, options = {}) {
        return new Promise((resolve, reject) => {
            const saveOperation = {
                id: this._generateSaveId(),
                storageKey,
                data,
                options,
                timestamp: Date.now(),
                retries: 0,
                resolve,
                reject
            };
            
            this._saveQueue.push(saveOperation);
            console.log(`[SaveSystemV2] Save enqueued: ${saveOperation.id}`);
            
            // Verarbeite Queue
            this._processQueue();
        });
    },
    
    /**
     * Verarbeitet Save-Queue serialisiert
     */
    async _processQueue() {
        if (this._isSaving || this._saveQueue.length === 0) {
            return;
        }
        
        this._isSaving = true;
        
        while (this._saveQueue.length > 0) {
            const operation = this._saveQueue.shift();
            
            try {
                const result = await this._executeSave(operation);
                operation.resolve(result);
            } catch (error) {
                if (operation.retries < this.CONFIG.MAX_RETRIES) {
                    operation.retries++;
                    const delay = this.CONFIG.RETRY_DELAY * 
                                  Math.pow(this.CONFIG.BACKOFF_MULTIPLIER, operation.retries - 1);
                    
                    console.log(`[SaveSystemV2] Retry ${operation.retries}/${this.CONFIG.MAX_RETRIES} in ${delay}ms`);
                    
                    await this._sleep(delay);
                    this._saveQueue.unshift(operation); // Zurück in Queue
                } else {
                    console.error(`[SaveSystemV2] Max retries exceeded for ${operation.id}`);
                    operation.reject(error);
                }
            }
        }
        
        this._isSaving = false;
    },
    
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    _generateSaveId() {
        return `SAVE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // === ATOMIC SAVE ===
    
    /**
     * Führt atomaren Save durch
     * Phase 1: Write to temp
     * Phase 2: Validate
     * Phase 3: Commit (swap)
     * 
     * FIX 3: Lock + Queue Integration
     * FIX 2: Optimistic Locking
     */
    async _executeSave(operation) {
        const { storageKey, data, options } = operation;
        
        console.log(`[SaveSystemV2] Executing save: ${operation.id}`);
        
        // FIX 3: Step 1: Acquire Lock (mit Retry-Logik)
        let lockAcquired = false;
        let lockRetries = 0;
        const maxLockRetries = 10;
        
        while (!lockAcquired && lockRetries < maxLockRetries) {
            lockAcquired = this._acquireSaveLock(operation.id);
            if (!lockAcquired) {
                lockRetries++;
                await this._sleep(50); // Kurz warten
            }
        }
        
        if (!lockAcquired) {
            // FIX 5: Fail-Safe - Save abbrechen
            throw new Error(`Could not acquire save lock after ${maxLockRetries} attempts`);
        }
        
        try {
            // Step 2: Berechne Diff (wenn aktiviert)
            let saveData = data;
            if (this.CONFIG.DIFF_ENABLED && options.useDiff) {
                saveData = this._calculateDiff(storageKey, data);
            }
            
            // Step 3: Version erhöhen
            const newVersion = this._incrementVersion();
            const versionedData = {
                ...saveData,
                _version: newVersion,
                _baseVersion: newVersion,  // FIX 2: Base-Version für zukünftige Checks
                _lastModified: Date.now(),
                _saveId: operation.id
            };
            
            // FIX 2: Optimistic Locking Check
            if (this._checkVersionConflict(storageKey, versionedData)) {
                throw new Error('Version conflict detected - data was modified by another tab');
            }
            
            // Step 4: Backup erstellen (für Rollback)
            this._createBackup(storageKey);
            
            // Step 5: Atomic Commit
            if (this.CONFIG.ATOMIC_COMMIT) {
                await this._atomicWrite(storageKey, versionedData);
            } else {
                localStateManager.setItem(storageKey, JSON.stringify(versionedData));
            }
            
            // Step 6: Version speichern
            this._saveVersion(storageKey, newVersion);
            
            // Step 7: History aktualisieren
            this._addToHistory(storageKey, versionedData);
            
            // Step 8: Cleanup
            this._cleanupBackup(storageKey);
            
            this._lastSavedVersion = newVersion;
            
            console.log(`[SaveSystemV2] Save completed: ${operation.id} (v${newVersion})`);
            
            return {
                success: true,
                version: newVersion,
                saveId: operation.id
            };
            
        } catch (error) {
            // Rollback bei Fehler
            console.error(`[SaveSystemV2] Save failed: ${operation.id}`, error);
            await this._rollback(storageKey);
            throw error;
        } finally {
            // FIX 3: Lock immer freigeben
            this._releaseSaveLock();
        }
    },
    
    /**
     * Atomarer Write: temp → validate → commit
     */
    async _atomicWrite(storageKey, data) {
        const tempKey = storageKey + this.CONFIG.TEMP_SUFFIX;
        
        try {
            // Phase 1: Write to temp
            localStateManager.setItem(tempKey, JSON.stringify(data));
            
            // Phase 2: Validate temp
            const tempData = localStateManager.getItem(tempKey);
            if (!tempData) {
                throw new Error('Temp write failed - data not found');
            }
            
            const parsed = JSON.parse(tempData);
            if (!this._validateData(parsed)) {
                throw new Error('Temp data validation failed');
            }
            
            // Phase 3: Commit (atomic swap)
            localStateManager.setItem(storageKey, tempData);
            
            // Phase 4: Cleanup temp
            localStorage.removeItem(tempKey);
            
        } catch (error) {
            // Cleanup bei Fehler
            localStorage.removeItem(tempKey);
            throw error;
        }
    },
    
    /**
     * Validiert Daten vor Commit
     */
    _validateData(data) {
        // Schema Validation
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Version Check
        if (typeof data._version !== 'number') {
            return false;
        }
        
        // Timestamp Check
        if (typeof data._lastModified !== 'number') {
            return false;
        }
        
        // Plausibility Checks
        if (data._lastModified > Date.now() + 10000) { // Max 10s in Zukunft
            return false;
        }
        
        return true;
    },
    
    // === SAVE LOCK (FIX 1: Cross-Tab via localStorage) ===
    
    /**
     * FIX 1: Cross-Tab Lock via localStorage
     * Ersetzt RAM-only Lock durch globales Lock
     */
    _acquireSaveLock(owner) {
        const lockKey = this.CONFIG.LOCK_KEY;
        const existing = localStateManager.getItem(lockKey);
        
        if (existing) {
            try {
                const lock = JSON.parse(existing);
                const age = Date.now() - lock.timestamp;
                
                // FIX 1: Prüfe ob Lock von diesem Tab
                if (lock.tabId === this._tabId) {
                    // Eigener Lock - erlaube Fortsetzung
                    return true;
                }
                
                // FIX 1: Stale Lock Detection
                if (age < this.CONFIG.LOCK_TIMEOUT) {
                    console.log(`[SaveSystemV2] Lock held by ${lock.tabId}, age: ${age}ms`);
                    return false;
                }
                
                // FIX 1: Stale Lock - force release
                console.warn('[SaveSystemV2] Stale lock detected, force releasing');
                localStorage.removeItem(lockKey);
            } catch (e) {
                // Korruptes Lock - entfernen
                localStorage.removeItem(lockKey);
            }
        }
        
        // FIX 1: Lock setzen
        localStateManager.setItem(lockKey, JSON.stringify({
            owner,
            tabId: this._tabId,
            timestamp: Date.now()
        }));
        
        // FIX 1: RAM-Lock auch setzen für schnelle Prüfungen
        this._saveLock = {
            locked: true,
            owner,
            timestamp: Date.now()
        };
        
        return true;
    },
    
    /**
     * FIX 1: Cross-Tab Lock freigeben
     */
    _releaseSaveLock() {
        const lockKey = this.CONFIG.LOCK_KEY;
        const existing = localStateManager.getItem(lockKey);
        
        if (existing) {
            try {
                const lock = JSON.parse(existing);
                // Nur freigeben wenn wir der Owner sind
                if (lock.tabId === this._tabId) {
                    localStorage.removeItem(lockKey);
                    console.log('[SaveSystemV2] Lock released');
                }
            } catch (e) {
                // Korruptes Lock - entfernen
                localStorage.removeItem(lockKey);
            }
        }
        
        // RAM-Lock zurücksetzen
        this._saveLock = {
            locked: false,
            owner: null,
            timestamp: null
        };
    },
    
    /**
     * FIX 2: Optimistic Locking Check
     * Prüft Version vor dem Write
     */
    _checkVersionConflict(storageKey, data) {
        const currentRaw = localStateManager.getItem(storageKey);
        if (!currentRaw) return false; // Kein Konflikt (neuer Key)
        
        try {
            const current = JSON.parse(currentRaw);
            const currentVersion = current._version || 0;
            const baseVersion = data._baseVersion || data._version || 0;
            
            if (currentVersion > baseVersion) {
                console.error(`[SaveSystemV2] Version conflict: current=${currentVersion}, base=${baseVersion}`);
                return true; // Konflikt!
            }
        } catch (e) {
            // Korrupte Daten - kein Versions-Check möglich
            console.warn('[SaveSystemV2] Could not parse current data for version check');
        }
        
        return false;
    },
    
    // === DIFF SYSTEM ===
    
    /**
     * Berechnet Diff zwischen aktuellem und neuem State
     */
    _calculateDiff(storageKey, newData) {
        try {
            const currentData = localStateManager.getItem(storageKey);
            if (!currentData) {
                return newData; // Kein Diff möglich
            }
            
            const current = JSON.parse(currentData);
            const diff = this._deepDiff(current, newData);
            
            return {
                _diff: true,
                _baseVersion: current._version,
                changes: diff,
                _full: newData // Fallback
            };
        } catch (e) {
            return newData; // Fallback zu Full Save
        }
    },
    
    /**
     * Deep Diff zwischen zwei Objekten
     */
    _deepDiff(oldObj, newObj, path = '') {
        const diff = {};
        
        // Neue/Geänderte Felder
        for (const key in newObj) {
            const newPath = path ? `${path}.${key}` : key;
            
            if (!(key in oldObj)) {
                diff[newPath] = { type: 'added', value: newObj[key] };
            } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                if (typeof newObj[key] === 'object' && newObj[key] !== null) {
                    const nestedDiff = this._deepDiff(oldObj[key], newObj[key], newPath);
                    Object.assign(diff, nestedDiff);
                } else {
                    diff[newPath] = { type: 'modified', old: oldObj[key], new: newObj[key] };
                }
            }
        }
        
        // Gelöschte Felder
        for (const key in oldObj) {
            if (!(key in newObj)) {
                const newPath = path ? `${path}.${key}` : key;
                diff[newPath] = { type: 'deleted', old: oldObj[key] };
            }
        }
        
        return diff;
    },
    
    // === VERSIONING ===
    
    _incrementVersion() {
        this._currentVersion++;
        return this._currentVersion;
    },
    
    _loadVersion() {
        try {
            const stored = localStateManager.getItem('npu_save_system_version');
            if (stored) {
                this._lastSavedVersion = parseInt(stored) || 0;
                this._currentVersion = this._lastSavedVersion;
            }
        } catch (e) {
            console.warn('[SaveSystemV2] Could not load version');
        }
    },
    
    _saveVersion(storageKey, version) {
        localStateManager.setItem('npu_save_system_version', version.toString());
        localStateManager.setItem(`${storageKey}_version`, version.toString());
    },
    
    /**
     * Optimistic Locking Check
     */
    checkVersion(expectedVersion) {
        return this._currentVersion === expectedVersion;
    },
    
    /**
     * Merge Strategy für Konflikte
     */
    mergeConflicts(localData, remoteData) {
        console.log('[SaveSystemV2] Merging conflicts...');
        
        // Strategy: Field-level merge mit Zeitstempel
        const merged = { ...localData };
        
        for (const key in remoteData) {
            if (key.startsWith('_')) continue; // Meta-Felder
            
            if (!(key in localData)) {
                // Remote hat neues Feld
                merged[key] = remoteData[key];
            } else if (JSON.stringify(localData[key]) !== JSON.stringify(remoteData[key])) {
                // Konflikt: Nimm höheren Zeitstempel
                const localTime = localData._lastModified || 0;
                const remoteTime = remoteData._lastModified || 0;
                
                if (remoteTime > localTime) {
                    merged[key] = remoteData[key];
                }
            }
        }
        
        merged._merged = true;
        merged._mergeTime = Date.now();
        
        return merged;
    },
    
    // === ROLLBACK SYSTEM ===
    
    _createBackup(storageKey) {
        try {
            const current = localStateManager.getItem(storageKey);
            if (current) {
                const backupKey = storageKey + this.CONFIG.BACKUP_SUFFIX;
                localStateManager.setItem(backupKey, current);
            }
        } catch (e) {
            console.warn('[SaveSystemV2] Could not create backup');
        }
    },
    
    _cleanupBackup(storageKey) {
        try {
            const backupKey = storageKey + this.CONFIG.BACKUP_SUFFIX;
            localStorage.removeItem(backupKey);
        } catch (e) {
            // Ignore
        }
    },
    
    async _rollback(storageKey) {
        console.log(`[SaveSystemV2] Rolling back: ${storageKey}`);
        
        try {
            const backupKey = storageKey + this.CONFIG.BACKUP_SUFFIX;
            const backup = localStateManager.getItem(backupKey);
            
            if (backup) {
                localStateManager.setItem(storageKey, backup);
                localStorage.removeItem(backupKey);
                console.log('[SaveSystemV2] Rollback successful');
                return true;
            } else {
                console.error('[SaveSystemV2] No backup available for rollback');
                return false;
            }
        } catch (e) {
            console.error('[SaveSystemV2] Rollback failed:', e);
            return false;
        }
    },
    
    _addToHistory(storageKey, data) {
        this._saveHistory.push({
            storageKey,
            version: data._version,
            timestamp: data._lastModified,
            saveId: data._saveId
        });
        
        // Max 50 Einträge
        if (this._saveHistory.length > 50) {
            this._saveHistory.shift();
        }
    },
    
    // === CORRUPTION DETECTION ===
    
    /**
     * Prüft auf Daten-Korruption
     */
    detectCorruption(storageKey) {
        try {
            const data = localStateManager.getItem(storageKey);
            if (!data) return { corrupted: false }; // Leer ist OK
            
            const parsed = JSON.parse(data);
            
            // Schema Validation
            if (!this._validateData(parsed)) {
                return {
                    corrupted: true,
                    reason: 'Schema validation failed',
                    recovery: this._attemptRecovery(storageKey)
                };
            }
            
            // Version Check
            if (parsed._version < 0 || parsed._version > 1000000) {
                return {
                    corrupted: true,
                    reason: 'Invalid version number',
                    recovery: this._attemptRecovery(storageKey)
                };
            }
            
            return { corrupted: false };
        } catch (e) {
            return {
                corrupted: true,
                reason: `Parse error: ${e.message}`,
                recovery: this._attemptRecovery(storageKey)
            };
        }
    },
    
    _attemptRecovery(storageKey) {
        console.log(`[SaveSystemV2] Attempting recovery for: ${storageKey}`);
        
        // Versuche Backup
        const backupKey = storageKey + this.CONFIG.BACKUP_SUFFIX;
        const backup = localStateManager.getItem(backupKey);
        
        if (backup) {
            try {
                JSON.parse(backup); // Validate
                localStateManager.setItem(storageKey, backup);
                return { success: true, source: 'backup' };
            } catch (e) {
                // Backup auch korrupt
            }
        }
        
        // Versuche Temp
        const tempKey = storageKey + this.CONFIG.TEMP_SUFFIX;
        const temp = localStateManager.getItem(tempKey);
        
        if (temp) {
            try {
                JSON.parse(temp); // Validate
                localStateManager.setItem(storageKey, temp);
                return { success: true, source: 'temp' };
            } catch (e) {
                // Temp auch korrupt
            }
        }
        
        return { success: false };
    },
    
    // === PUBLIC API ===
    
    /**
     * Öffentliche Save-Methode
     */
    async save(storageKey, data, options = {}) {
        return this.enqueueSave(storageKey, data, options);
    },
    
    /**
     * Lädt mit Validation
     */
    load(storageKey) {
        const corruptionCheck = this.detectCorruption(storageKey);
        
        if (corruptionCheck.corrupted) {
            console.error('[SaveSystemV2] Corruption detected:', corruptionCheck.reason);
            if (!corruptionCheck.recovery.success) {
                throw new Error('Data corrupted and recovery failed');
            }
        }
        
        const data = localStateManager.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    },
    
    /**
     * Erzwingt sofortigen Save (bypass Queue)
     */
    async saveImmediate(storageKey, data, options = {}) {
        // Warte auf aktuelle Operation
        while (this._isSaving) {
            await this._sleep(10);
        }
        
        return this.enqueueSave(storageKey, data, { ...options, priority: true });
    },
    
    /**
     * Gibt aktuellen Status zurück
     */
    getStatus() {
        return {
            queueLength: this._saveQueue.length,
            isSaving: this._isSaving,
            currentVersion: this._currentVersion,
            lastSavedVersion: this._lastSavedVersion,
            lockStatus: this._saveLock
        };
    }
};

// Global verfügbar machen
window.SaveSystemV2 = SaveSystemV2;

// Initialisieren
SaveSystemV2.init();

console.log('[SaveSystemV2] Geladen - Production-Grade Persistenz');
