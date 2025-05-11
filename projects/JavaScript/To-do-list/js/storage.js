// storage.js
// Wrapper around IndexedDB for offline storage of lists

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('todoAppDB', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('lists')) {
                db.createObjectStore('lists', { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export const Storage = {
    async getAllLists() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('lists', 'readonly');
            const store = tx.objectStore('lists');
            const getReq = store.getAll();
            getReq.onsuccess = () => {
                const lists = getReq.result || [];
                // If no lists exist, create a default one
                if (lists.length === 0) {
                    const defaultList = {
                        id: crypto.randomUUID(),
                        title: 'My To-Do List',
                        tasks: []
                    };
                    resolve([defaultList]);
                    // Save this default list
                    this.saveList(defaultList);
                } else {
                    resolve(lists);
                }
            };
            getReq.onerror = () => reject(getReq.error);
        });
    },

    async loadList(id) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('lists', 'readonly');
            const store = tx.objectStore('lists');
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                resolve(getReq.result || {
                    id,
                    title: 'New List',
                    tasks: []
                });
            };
            getReq.onerror = () => reject(getReq.error);
        });
    },

    async saveList(list) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('lists', 'readwrite');
            const store = tx.objectStore('lists');
            const putReq = store.put(list);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        });
    },

    async deleteList(id) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('lists', 'readwrite');
            const store = tx.objectStore('lists');
            const deleteReq = store.delete(id);
            deleteReq.onsuccess = () => resolve();
            deleteReq.onerror = () => reject(deleteReq.error);
        });
    }
}; 