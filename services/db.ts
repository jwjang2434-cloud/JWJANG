import { BusRoute } from '../types';

const DB_NAME = 'CommuterBusDB';
const DB_VERSION = 1;
const STORE_NAME = 'routes';

export const db = {
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    },

    async getAllRoutes(): Promise<BusRoute[]> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    resolve(getAllRequest.result as BusRoute[]);
                };
                getAllRequest.onerror = () => reject(getAllRequest.error);
            };
        });
    },

    async saveRoutes(routes: BusRoute[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // Clear existing data first to ensure full sync
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    let completed = 0;
                    if (routes.length === 0) {
                        resolve();
                        return;
                    }

                    routes.forEach(route => {
                        const addRequest = store.add(route);
                        addRequest.onsuccess = () => {
                            completed++;
                            if (completed === routes.length) resolve();
                        };
                        addRequest.onerror = () => reject(addRequest.error);
                    });
                };

                clearRequest.onerror = () => reject(clearRequest.error);
            };
        });
    },

    async clearAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            };
        });
    }
};
