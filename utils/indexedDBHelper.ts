// IndexedDB helper for storing newsletters with large PDF images
const DB_NAME = 'NewsletterDB';
const DB_VERSION = 1;
const STORE_NAME = 'newsletters';

export interface Newsletter {
    id: number;
    title: string;
    date: string;
    cover: string;
    pages: string[];
    isNew: boolean;
    pdfPath?: string;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Save all newsletters
export const saveNewsletters = async (newsletters: Newsletter[]): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all newsletters
    for (const newsletter of newsletters) {
        await new Promise<void>((resolve, reject) => {
            const addRequest = store.add(newsletter);
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        });
    }

    db.close();
};

// Load all newsletters
export const loadNewsletters = async (): Promise<Newsletter[]> => {
    try {
        const db = await initDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                db.close();
                resolve(request.result || []);
            };
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('IndexedDB load error:', error);
        return [];
    }
};

// Delete a newsletter
export const deleteNewsletter = async (id: number): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
            db.close();
            resolve();
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
};

// Update a newsletter
export const updateNewsletter = async (newsletter: Newsletter): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put(newsletter);
        request.onsuccess = () => {
            db.close();
            resolve();
        };
        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
};

// Migrate from LocalStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<Newsletter[]> => {
    try {
        const saved = localStorage.getItem('newsletters');
        if (saved) {
            const newsletters = JSON.parse(saved) as Newsletter[];
            await saveNewsletters(newsletters);
            localStorage.removeItem('newsletters'); // Clean up
            console.log('Migrated newsletters from LocalStorage to IndexedDB');
            return newsletters;
        }
    } catch (error) {
        console.error('Migration error:', error);
    }
    return [];
};
