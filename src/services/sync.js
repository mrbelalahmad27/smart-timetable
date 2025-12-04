import { db } from './db';
import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export const syncService = {
    // Push local changes to Supabase
    pushChanges: async () => {
        const queue = await db.syncQueue.toArray();
        if (queue.length === 0) return;

        console.log(`Pushing ${queue.length} changes to cloud...`);

        for (const item of queue) {
            try {
                const { operation, data } = item;
                const { id, ...payload } = data;

                // Ensure user is authenticated
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('User not authenticated');

                if (operation === 'add' || operation === 'update') {
                    // Upsert to Supabase
                    const { error } = await supabase
                        .from('items')
                        .upsert({
                            id: data.id,
                            user_id: user.id,
                            category: data.category,
                            data: payload, // Store full object in JSONB column
                            updated_at: new Date().toISOString(),
                            deleted: data.deleted || false
                        });
                    if (error) throw error;
                } else if (operation === 'delete') {
                    // Soft delete in Supabase
                    const { error } = await supabase
                        .from('items')
                        .update({ deleted: true, updated_at: new Date().toISOString() })
                        .eq('id', data.id);
                    if (error) throw error;
                }

                // Remove from queue on success
                await db.syncQueue.delete(item.id);

            } catch (error) {
                console.error('Sync push failed for item:', item, error);
                // Keep in queue to retry later
            }
        }
    },

    // Pull remote changes from Supabase
    pullChanges: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get last sync time (stored in localStorage)
            const lastSync = localStorage.getItem('last-sync-time');
            let query = supabase.from('items').select('*').eq('user_id', user.id);

            if (lastSync) {
                query = query.gt('updated_at', lastSync);
            }

            const { data: remoteItems, error } = await query;

            if (error) throw error;

            if (remoteItems && remoteItems.length > 0) {
                console.log(`Pulling ${remoteItems.length} changes from cloud...`);

                await db.transaction('rw', db.items, async () => {
                    for (const remote of remoteItems) {
                        const localItem = {
                            id: remote.id,
                            category: remote.category,
                            ...remote.data, // Spread JSONB data
                            updatedAt: remote.updated_at,
                            deleted: remote.deleted
                        };

                        if (remote.deleted) {
                            // If deleted remotely, delete locally (or soft delete)
                            // We'll update it as deleted to respect the soft delete architecture
                            await db.items.put(localItem);
                        } else {
                            await db.items.put(localItem);
                        }
                    }
                });
            }

            // Update last sync time
            localStorage.setItem('last-sync-time', new Date().toISOString());

        } catch (error) {
            console.error('Sync pull failed:', error);
        }
    },

    // Main sync function
    sync: async () => {
        if (!navigator.onLine) return;
        await syncService.pushChanges();
        await syncService.pullChanges();
    }
};
