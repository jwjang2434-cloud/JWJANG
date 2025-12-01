// IndexedDB helper for storing newsletters with large PDF images
const DB_NAME = 'NewsletterDB';
const DB_VERSION = 3; // Incremented for regulations
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

// --- Brochure Helper ---

export interface Brochure {
    id: number;
    title: string;
    description: string;
    date: string;
    cover: string; // Base64 image
    pdfPath?: string; // For local files
    fileData?: string; // Base64 PDF data (optional, for uploaded files)
    isNew: boolean;
}

const BROCHURE_STORE_NAME = 'brochures';

// --- Regulation Helper ---

export interface Regulation {
    id: string;
    title: string;
    type: 'PDF' | 'IMAGE';
    lastUpdated: string;
    content: string;
    keywords: string[];
    fileUrl?: string; // Base64 or Blob URL
    pdfPath?: string; // For local files
    isNew: boolean;
}

const REGULATION_STORE_NAME = 'regulations';

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
            if (!db.objectStoreNames.contains(BROCHURE_STORE_NAME)) {
                db.createObjectStore(BROCHURE_STORE_NAME, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(REGULATION_STORE_NAME)) {
                db.createObjectStore(REGULATION_STORE_NAME, { keyPath: 'id' });
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


// Save all brochures
export const saveBrochures = async (brochures: Brochure[]): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(BROCHURE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(BROCHURE_STORE_NAME);

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all brochures
    for (const brochure of brochures) {
        await new Promise<void>((resolve, reject) => {
            const addRequest = store.add(brochure);
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        });
    }

    db.close();
};

// Load all brochures
export const loadBrochures = async (): Promise<Brochure[]> => {
    try {
        const db = await initDB();
        const transaction = db.transaction(BROCHURE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(BROCHURE_STORE_NAME);

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

// Delete a brochure
export const deleteBrochure = async (id: number): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(BROCHURE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(BROCHURE_STORE_NAME);

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

// Update a brochure
export const updateBrochure = async (brochure: Brochure): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(BROCHURE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(BROCHURE_STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put(brochure);
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

// Save all regulations
export const saveRegulations = async (regulations: Regulation[]): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(REGULATION_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(REGULATION_STORE_NAME);

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all regulations
    for (const regulation of regulations) {
        await new Promise<void>((resolve, reject) => {
            const addRequest = store.add(regulation);
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        });
    }

    db.close();
};

// Load all regulations
export const loadRegulations = async (): Promise<Regulation[]> => {
    try {
        const db = await initDB();
        const transaction = db.transaction(REGULATION_STORE_NAME, 'readonly');
        const store = transaction.objectStore(REGULATION_STORE_NAME);

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

// Delete a regulation
export const deleteRegulation = async (id: string): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(REGULATION_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(REGULATION_STORE_NAME);

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

// Update a regulation
export const updateRegulation = async (regulation: Regulation): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(REGULATION_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(REGULATION_STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put(regulation);
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
