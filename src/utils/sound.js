// Simple Sound Engine - Uses HTML5 Audio for better compatibility

const audioCache = {};

export const initAudio = () => {
    // Preload all sounds
    SOUND_OPTIONS.forEach(sound => {
        if (!audioCache[sound.id]) {
            const audio = new Audio(sound.id);
            audio.preload = 'auto';
            audioCache[sound.id] = audio;
        }
    });
};

// Keep track of active audio instances to prevent garbage collection
const activeSounds = new Set();

export const playNotificationSound = async (type = 'bell') => {
    // Map 'bell' to a default sound
    let soundToPlay = type;
    if (type === 'bell') {
        soundToPlay = '/sounds/new-notification-1-398650.mp3';
    }

    // Check if it's a custom audio file (starts with /sounds/)
    if (soundToPlay.startsWith('/sounds/')) {
        try {
            console.log('Starting playback for:', soundToPlay);
            const audio = new Audio(soundToPlay);
            audio.volume = 1.0; // Max volume

            // Add to active set
            activeSounds.add(audio);

            // Cleanup on end
            audio.onended = () => {
                console.log('Playback ended for:', soundToPlay);
                activeSounds.delete(audio);
            };

            audio.onerror = (e) => {
                console.error('Playback error:', e);
                activeSounds.delete(audio);
            };

            await audio.play();
        } catch (error) {
            console.error(`Failed to play ${soundToPlay}:`, error);
        }
    }
};

// Custom notification sounds
const CUSTOM_SOUNDS = [
    { id: '/sounds/new-notification-1-398650.mp3', label: 'Alynto 1', type: 'file' },
    { id: '/sounds/new-notification-026-380249.mp3', label: 'Alynto 2', type: 'file' },
    { id: '/sounds/new-notification-3-398649.mp3', label: 'Alynto 3', type: 'file' },
    { id: '/sounds/new-notification-444814.mp3', label: 'Alynto 4', type: 'file' },
    { id: '/sounds/notification-crackle-432435.mp3', label: 'Alynto 5', type: 'file' },
    { id: '/sounds/notification-power-432434.mp3', label: 'Alynto 6', type: 'file' },
    { id: '/sounds/notification-sound-effect-372475.mp3', label: 'Alynto 7', type: 'file' }
];

export const SOUND_OPTIONS = CUSTOM_SOUNDS;
