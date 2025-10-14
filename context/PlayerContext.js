import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';

const PlayerContext = createContext({
  isPlaying: false,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1,
  volume: 1,
  isLoading: false,
  play: (content: any) => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
  seekTo: () => {},
  setPlaybackSpeed: () => {},
  setVolume: () => {},
  skipForward: () => {},
  skipBackward: () => {},
});

export const PlayerProvider = ({ children }) => {
  const { getAudioContent } = useData();
  const { user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const intervalRef = useRef(null);

  // Setup SoundPlayer events
  useEffect(() => {
    const soundPlayerEmitter = new NativeEventEmitter(NativeModules.RNSoundPlayer);
    const subscriptions = [
      soundPlayerEmitter.addListener('onFinishedPlaying', ({ success }) => {
        setIsPlaying(false);
        setCurrentTime(0);
      }),
      soundPlayerEmitter.addListener('onFinishedLoading', ({ duration }) => {
        setDuration(duration);
        setIsLoading(false);
      }),
      soundPlayerEmitter.addListener('onStartedPlaying', () => {
        setIsPlaying(true);
      }),
    ];

    return () => {
      subscriptions.forEach(sub => sub.remove());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Time updater
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(async () => {
        try {
          const info = await SoundPlayer.getInfo();
          setCurrentTime(info.currentTime);
          setDuration(info.duration);
        } catch (e) {
          console.warn('Failed to get sound info', e);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const play = async (track) => {
    try {
      setIsLoading(true);
      const audioUrl = await getAudioContent(track.audioKey || track.id);
      setCurrentTrack(track);

      SoundPlayer.playUrl(audioUrl);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsLoading(false);
    }
  };

  const pause = () => {
    SoundPlayer.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    SoundPlayer.resume();
    setIsPlaying(true);
  };

  const stop = () => {
    SoundPlayer.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekTo = (seconds) => {
    SoundPlayer.seek(seconds);
    setCurrentTime(seconds);
  };

  const skipForward = (seconds = 15) => {
    seekTo(Math.min(currentTime + seconds, duration));
  };

  const skipBackward = (seconds = 15) => {
    seekTo(Math.max(currentTime - seconds, 0));
  };

  const setPlaybackSpeedValue = (speed) => {
    if (Platform.OS === 'ios') {
      SoundPlayer.setSpeed(speed);
    }
    setPlaybackSpeed(speed);
  };

  const setVolumeValue = (vol) => {
    if (Platform.OS === 'ios') {
      SoundPlayer.setVolume(vol);
    }
    setVolume(vol);
  };

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        isLoading,
        volume,
        playbackSpeed,
        play,
        pause,
        resume,
        stop,
        seekTo,
        setPlaybackSpeed: setPlaybackSpeedValue,
        setVolume: setVolumeValue,
        skipForward,
        skipBackward,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
