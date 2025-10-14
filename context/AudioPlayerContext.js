import React, { createContext, useContext, useState, useEffect } from 'react';
import SoundPlayer from 'react-native-sound-player';

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ position: 0, duration: 0 });

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const parseDuration = (durationStr) => {
    if (!durationStr || durationStr === '0:00') return 0;
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const playAudio = async (audio) => {
    try {
      SoundPlayer.stop();
      setIsPlaying(false);

      SoundPlayer.playUrl(audio.audioUrl);
      setCurrentAudio(audio);
      setIsPlaying(true);

      SoundPlayer.onFinishedLoading((success) => {
        if (success) {
          const duration = parseDuration(audio.duration);
          setProgress({ position: 0, duration });

          const interval = setInterval(() => {
            SoundPlayer.getInfo()
              .then((info) => {
                if (info) {
                  setProgress((prev) => ({
                    ...prev,
                    position: Math.floor(info.currentTime),
                  }));
                }
              })
              .catch((err) => {
                console.error('(NOBRIDGE) GetInfo Error:', JSON.stringify(err, null, 2));
              });
          }, 1000);

          SoundPlayer.onFinishedPlaying(() => {
            clearInterval(interval);
            setIsPlaying(false);
            setProgress({ position: 0, duration });
            setCurrentAudio(null);
          });
        }
      });

      console.log('(NOBRIDGE) Playing audio:', audio);
    } catch (err) {
      console.error('(NOBRIDGE) Play Audio Error:', JSON.stringify(err, null, 2));
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    try {
      SoundPlayer.pause();
      setIsPlaying(false);
    } catch (err) {
      console.error('(NOBRIDGE) Pause Audio Error:', JSON.stringify(err, null, 2));
    }
  };

  const resumeAudio = () => {
    try {
      SoundPlayer.resume();
      setIsPlaying(true);
    } catch (err) {
      console.error('(NOBRIDGE) Resume Audio Error:', JSON.stringify(err, null, 2));
    }
  };

  const stopAudio = () => {
    try {
      SoundPlayer.stop();
      setIsPlaying(false);
      setCurrentAudio(null);
      setProgress({ position: 0, duration: 0 });
    } catch (err) {
      console.error('(NOBRIDGE) Stop Audio Error:', JSON.stringify(err, null, 2));
    }
  };

  const seekTo = (position) => {
    try {
      SoundPlayer.seek(position);
      setProgress((prev) => ({ ...prev, position }));
    } catch (err) {
      console.error('(NOBRIDGE) Seek Error:', JSON.stringify(err, null, 2));
    }
  };

  useEffect(() => {
    return () => {
      SoundPlayer.stop();
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentAudio,
        isPlaying,
        progress,
        playAudio,
        pauseAudio,
        resumeAudio,
        stopAudio,
        seekTo,
        formatDuration,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};