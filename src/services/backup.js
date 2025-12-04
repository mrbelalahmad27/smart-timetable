export const backupService = {
    exportData: (events, tasks, habits, preferences) => {
        const data = {
            events,
            tasks,
            habits,
            preferences,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    },

    importData: (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (!data.version) throw new Error('Invalid backup format');
            return data;
        } catch (e) {
            throw new Error('Failed to parse backup data');
        }
    }
};
