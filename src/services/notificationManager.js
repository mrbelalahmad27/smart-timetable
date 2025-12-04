import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationManager {
    constructor() {
        this.activeSounds = new Set();
        this.poller = null;
        this.init();
    }

    init() {
        if (!Capacitor.isNativePlatform()) {
            this.startPolling();
            // Request permission immediately if possible/appropriate, or wait for user action
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }

    startPolling() {
        if (this.poller) clearInterval(this.poller);
        console.log('NotificationManager: Starting poller');

        this.poller = setInterval(() => {
            this.checkNotifications();
        }, 1000); // Check every second
    }

    async schedule(id, title, body, scheduleDate, soundPath = '/sounds/new-notification-1-398650.mp3') {
        if (Capacitor.isNativePlatform()) {
            await this.scheduleNative(id, title, body, scheduleDate, soundPath);
        } else {
            this.scheduleWeb(id, title, body, scheduleDate, soundPath);
        }
    }

    async scheduleNative(id, title, body, scheduleDate, soundPath) {
        try {
            const permStatus = await LocalNotifications.requestPermissions();
            if (permStatus.display === 'granted') {
                // Ensure ID is integer for native
                const numericId = typeof id === 'string' ? this.hashString(id) : id;

                await LocalNotifications.schedule({
                    notifications: [{
                        title,
                        body,
                        id: numericId,
                        schedule: { at: scheduleDate },
                        sound: soundPath ? soundPath.split('/').pop() : undefined,
                        extra: { originalId: id }
                    }]
                });
            }
        } catch (error) {
            console.error('Native schedule error:', error);
        }
    }

    scheduleWeb(id, title, body, scheduleDate, soundPath) {
        const notifications = this.getScheduled();
        notifications.push({
            id,
            title,
            body,
            scheduleDate: scheduleDate.toISOString(),
            soundPath
        });
        this.saveScheduled(notifications);
        console.log(`Scheduled web notification: ${title} at ${scheduleDate.toLocaleString()}`);
    }

    async cancel(id) {
        if (Capacitor.isNativePlatform()) {
            const numericId = typeof id === 'string' ? this.hashString(id) : id;
            await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
        } else {
            const notifications = this.getScheduled();
            // Filter out exact ID match AND reminder variations
            const filtered = notifications.filter(n =>
                n.id !== id && !String(n.id).startsWith(`${id}-reminder-`)
            );
            this.saveScheduled(filtered);
            console.log(`Cancelled notifications for ID: ${id}`);
        }
    }

    checkNotifications() {
        const now = new Date();
        const notifications = this.getScheduled();
        const remaining = [];
        let hasChanges = false;

        notifications.forEach(notif => {
            const scheduleTime = new Date(notif.scheduleDate);

            // Fire if time has passed (with 1 minute grace period for late checks)
            // But don't fire if it's WAY in the past (e.g. > 5 mins old) to avoid spam on reload
            const timeDiff = now.getTime() - scheduleTime.getTime();

            if (timeDiff >= 0) {
                if (timeDiff < 5 * 60 * 1000) { // Within 5 minutes
                    this.trigger(notif);
                } else {
                    console.warn(`Skipping stale notification: ${notif.title} (${timeDiff}ms old)`);
                }
                hasChanges = true;
            } else {
                remaining.push(notif);
            }
        });

        if (hasChanges) {
            this.saveScheduled(remaining);
        }
    }

    trigger(notif) {
        console.log('Triggering notification:', notif.title);

        // 1. Play Sound
        if (notif.soundPath) {
            this.playSound(notif.soundPath);
        }

        // 2. Dispatch Event for UI (Toast)
        window.dispatchEvent(new CustomEvent('trigger-notification', {
            detail: { ...notif }
        }));

        // 3. System Notification
        if (Notification.permission === 'granted') {
            try {
                new Notification(notif.title, {
                    body: notif.body,
                    icon: '/app-icon.jpg' // Ensure this exists or use a default
                });
            } catch (e) {
                console.error('System notification error:', e);
            }
        }
    }

    playSound(path) {
        try {
            const audio = new Audio(path);
            audio.volume = 1.0;
            this.activeSounds.add(audio);

            audio.onended = () => {
                this.activeSounds.delete(audio);
            };

            audio.onerror = (e) => {
                console.error('Audio playback error:', e);
                this.activeSounds.delete(audio);
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Audio play failed (autoplay policy?):', error);
                    this.activeSounds.delete(audio);
                });
            }
        } catch (e) {
            console.error('Audio creation error:', e);
        }
    }

    getScheduled() {
        try {
            return JSON.parse(localStorage.getItem('scheduled-notifications') || '[]');
        } catch {
            return [];
        }
    }

    saveScheduled(notifications) {
        localStorage.setItem('scheduled-notifications', JSON.stringify(notifications));
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}

export const notificationManager = new NotificationManager();
