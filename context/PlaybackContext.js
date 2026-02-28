import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const PlaybackContext = createContext({});

export const PlaybackProvider = ({ children }) => {
    const [playingSession, setPlayingSession] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [loading, setLoading] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const onPlaybackStatusUpdate = (status) => {
        setPlaybackStatus(status);
        if (status.didJustFinish) {
            setIsPlaying(false);
        }
    };

    const playSession = async (session) => {
        if (!session.audioPath) return;

        // If same session, toggle play/pause
        if (playingSession?.id === session.id) {
            setIsVisible(true);
            setIsMinimized(false);
            await togglePlay();
            return;
        }

        // New session
        setLoading(true);
        setIsVisible(true);
        setIsMinimized(false);
        try {
            if (sound) {
                await sound.unloadAsync();
            }

            const audioRef = ref(storage, session.audioPath);
            const url = await getDownloadURL(audioRef);

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setPlayingSession(session);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing audio:', error);
            throw error; // Let the UI handle the error
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const seekTo = async (position) => {
        if (sound) {
            await sound.setPositionAsync(position);
        }
    };

    const minimize = () => setIsMinimized(true);
    const maximize = () => setIsMinimized(false);

    const close = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
        }
        setIsVisible(false);
        setIsMinimized(false);
    };

    return (
        <PlaybackContext.Provider value={{
            playingSession,
            isPlaying,
            loading,
            playbackStatus,
            isMinimized,
            isVisible,
            playSession,
            togglePlay,
            minimize,
            maximize,
            close,
            seekTo
        }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => useContext(PlaybackContext);
