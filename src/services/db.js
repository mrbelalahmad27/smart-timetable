import Dexie from 'dexie';

export const db = new Dexie('SmartTimetableDB');

db.version(1).stores({
    items: 'id, category, date, type, deleted, updated_at', // events, tasks, habits
    syncQueue: '++id, operation, data, timestamp' // For offline sync
});

// Helper to get all items (excluding deleted)
export const getActiveItems = async () => {
    return await db.items.filter(item => !item.deleted).toArray();
};

// Helper to queue sync operation
export const queueSync = async (operation, data) => {
    await db.syncQueue.add({
        operation,
        data,
        timestamp: new Date().toISOString()
    });
};
