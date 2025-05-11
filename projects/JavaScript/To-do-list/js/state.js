// state.js
// Central state manager for the app

import { Storage } from './storage.js';

export class StateManager {
    constructor(initialList) {
        this.activeList = initialList;
        this.lists = [initialList];
        this.listeners = {
            activeList: [],
            lists: []
        };
    }

    // Subscribe to updates on the active list
    subscribeToActiveList(callback) {
        this.listeners.activeList.push(callback);
        // Immediately invoke for initial render
        callback(this.activeList);
    }

    // Subscribe to updates on the lists array
    subscribeToLists(callback) {
        this.listeners.lists.push(callback);
        // Immediately invoke for initial render
        callback(this.lists);
    }

    // Notify listeners about active list changes
    notifyActiveListListeners() {
        this.listeners.activeList.forEach((cb) => cb(this.activeList));
    }

    // Notify listeners about lists array changes
    notifyListsListeners() {
        this.listeners.lists.forEach((cb) => cb(this.lists));
    }

    // Set all known lists
    setLists(lists) {
        this.lists = lists;
        this.notifyListsListeners();
    }

    // Add a new list
    addList(listTitle) {
        const newList = {
            id: crypto.randomUUID(),
            title: listTitle,
            tasks: []
        };
        this.lists.push(newList);
        Storage.saveList(newList);
        this.notifyListsListeners();
        return newList;
    }

    // Delete a list
    async deleteList(listId) {
        // Don't delete the last list
        if (this.lists.length <= 1) {
            return;
        }

        await Storage.deleteList(listId);
        this.lists = this.lists.filter(list => list.id !== listId);
        this.notifyListsListeners();

        // If the active list was deleted, switch to another list
        if (this.activeList.id === listId) {
            this.switchList(this.lists[0].id);
        }
    }

    // Switch to a different list
    async switchList(listId) {
        const list = this.lists.find(list => list.id === listId);
        if (list) {
            this.activeList = list;
            this.notifyActiveListListeners();
        } else {
            // List not found in memory, try to load it
            try {
                const loadedList = await Storage.loadList(listId);
                this.activeList = loadedList;
                this.lists.push(loadedList);
                this.notifyActiveListListeners();
                this.notifyListsListeners();
            } catch (error) {
                console.error('Error switching list:', error);
            }
        }
    }

    // Task management on the active list
    setTitle(title) {
        this.activeList.title = title;
        this._persistActiveList();
    }

    addTask(task) {
        this.activeList.tasks.push(task);
        this._persistActiveList();
    }

    updateTask(updatedTask) {
        this.activeList.tasks = this.activeList.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
        );
        this._persistActiveList();
    }

    deleteTask(taskId) {
        this.activeList.tasks = this.activeList.tasks.filter((task) => task.id !== taskId);
        this._persistActiveList();
    }

    _persistActiveList() {
        Storage.saveList(this.activeList);
        // Update the list in our lists array too
        this.lists = this.lists.map(list =>
            list.id === this.activeList.id ? this.activeList : list
        );
        this.notifyActiveListListeners();
        this.notifyListsListeners();
    }
} 