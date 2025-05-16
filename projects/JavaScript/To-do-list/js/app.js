// app.js
// Entry point for the To-Do List app

import { initRouter } from './router.js';
import { Storage } from './storage.js';
import { StateManager } from './state.js';
import { UIRenderer } from './ui.js';

// Ensure DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', async () => {
    const listId = initRouter();

    // Load all available lists
    const allLists = await Storage.getAllLists();

    // Find the requested list or use the first one
    let activeList = allLists.find(list => list.id === listId);
    if (!activeList && allLists.length > 0) {
        activeList = allLists[0];
    }

    // Initialize state manager
    const stateManager = new StateManager(activeList);
    stateManager.setLists(allLists);

    // Initialize UI
    const ui = new UIRenderer(stateManager);
    ui.attachEventListeners();

    console.log('To-Do List application initialized');
});

// Legacy IIFE initialization (now disabled)
// (async () => {
//     // Old initialization code
// })(); 