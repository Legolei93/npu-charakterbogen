// EVENT SYSTEM FIX
// Zentrale Event-Verarbeitung für Quests

import { StateManager } from "./state-manager.js";

import { simulateEvent, processGameEvent, dispatchEvent } from "../core/event-system.js";

/**
 * Simuliert ein Game Event und updated aktive Quests
 * @param {string} eventType - Typ des Events (z.B. "exploration", "combat_won")
 * @param {Object} data - Zusätzliche Event-Daten
 */
export function simulateEvent(eventType, data = {}) {
    console.log("[EVENT]", eventType, data);
    
    const state = StateManager.getState ? StateManager.getState() : 
                  (StateManager.state || StateManager.getCharacter?.());
    
    if (!state) {
        console.warn("[EVENT] Kein State verfügbar");
        return;
    }
    
    const activeQuests = state.activeQuests || [];
    
    if (activeQuests.length === 0) {
        console.log("[EVENT] Keine aktiven Quests");
        return;
    }
    
    // Verarbeite Event für jede aktive Quest
    activeQuests.forEach(quest => {
        if (quest.status !== 'active') return;
        
        // Prüfe Objectives
        if (quest.objectives) {
            quest.objectives.forEach(obj => {
                if (obj.completed) return;
                
                // Matche Event-Type mit Objective-Trigger
                const trigger = (obj.trigger || obj.type || '').toLowerCase();
                const event = eventType.toLowerCase();
                
                if (trigger === event || 
                    (trigger === 'exploration' && event === 'explore') ||
                    (trigger === 'combat' && event.includes('combat'))) {
                    
                    obj.progress = (obj.progress || 0) + 1;
                    console.log(
                        '[QUEST PROGRESS]', 
                        quest.id, 
                        obj.id, 
                        obj.progress + '/' + obj.target
                    );
                    
                    if (obj.progress >= (obj.target || 1)) {
                        obj.completed = true;
                        console.log('[QUEST] Objective completed:', obj.id);
                    }
                }
            });
        }
    });
    
    // Speichere State
    if (StateManager.saveState) {
        StateManager.saveState();
    } else if (StateManager.save) {
        StateManager.save();
    }
    
    return activeQuests;
}

/**
 * Verarbeitet ein Game Event (Alias für simulateEvent)
 */
export function processGameEvent(eventType, data = {}) {
    return simulateEvent(eventType, data);
}

/**
 * Dispatched ein DOM Event (für UI-Updates)
 */
export function dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
    console.log('[DISPATCH]', eventName, detail);
}

// Exportiere für globale Verwendung
window.simulateEvent = simulateEvent;
window.processGameEvent = processGameEvent;
