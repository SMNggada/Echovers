import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type RewardItem = {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  imageUrl: string;
  unlocked: boolean;
};

type RewardsContextType = {
  points: number;
  dailyAdViews: number;
  lastAdViewDate: string | null;
  rewardItems: RewardItem[];
  isLoading: boolean;
  canWatchAd: boolean;
  addPoints: (amount: number) => Promise<void>;
  usePoints: (amount: number) => Promise<boolean>;
  recordAdView: () => Promise<boolean>;
  unlockRewardItem: (itemId: string) => Promise<boolean>;
  resetDailyAdLimit: () => Promise<void>; // For testing purposes
};

// Create Rewards Context
export const RewardsContext = createContext<RewardsContextType>({} as RewardsContextType);

// Maximum ads per day
const MAX_DAILY_ADS = 3;

// Sample reward items data
const SAMPLE_REWARDS: RewardItem[] = [
  {
    id: '1',
    title: 'Premium Audiobook Collection',
    description: 'Unlock our curated collection of premium audiobooks.',
    pointCost: 50,
    imageUrl: 'https://api.a0.dev/assets/image?text=Premium%20Books&aspect=16:9&seed=123',
    unlocked: false,
  },
  {
    id: '2',
    title: 'Advanced Playback Features',
    description: 'Unlock sleep timer, bookmarks, and more advanced features.',
    pointCost: 30,
    imageUrl: 'https://api.a0.dev/assets/image?text=Features&aspect=16:9&seed=456',
    unlocked: false,
  },
  {
    id: '3',
    title: 'No Ads Experience',
    description: 'Remove all advertisements from the app for 30 days.',
    pointCost: 100,
    imageUrl: 'https://api.a0.dev/assets/image?text=No%20Ads&aspect=16:9&seed=789',
    unlocked: false,
  },
  {
    id: '4',
    title: 'Offline Download Limit Increase',
    description: 'Increase your offline download limit from 5 to 50 items.',
    pointCost: 75,
    imageUrl: 'https://api.a0.dev/assets/image?text=Downloads&aspect=16:9&seed=101',
    unlocked: false,
  },
  {
    id: '5',
    title: 'Exclusive Creator Content',
    description: 'Access exclusive audio content from premium creators.',
    pointCost: 60,
    imageUrl: 'https://api.a0.dev/assets/image?text=Exclusive&aspect=16:9&seed=202',
    unlocked: false,
  },
];

// Rewards Provider Component
export const RewardsProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(0);
  const [dailyAdViews, setDailyAdViews] = useState(0);
  const [lastAdViewDate, setLastAdViewDate] = useState<string | null>(null);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>(SAMPLE_REWARDS);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user can watch more ads today
  const canWatchAd = dailyAdViews < MAX_DAILY_ADS;

  // Load saved data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          savedPoints,
          savedDailyAdViews,
          savedLastAdViewDate,
          savedRewardItems
        ] = await Promise.all([
          AsyncStorage.getItem('rewards_points'),
          AsyncStorage.getItem('rewards_dailyAdViews'),
          AsyncStorage.getItem('rewards_lastAdViewDate'),
          AsyncStorage.getItem('rewards_items')
        ]);
        
        // Set points
        if (savedPoints) setPoints(parseInt(savedPoints, 10));
        
        // Check if we need to reset daily ad views (new day)
        const today = new Date().toDateString();
        
        if (savedLastAdViewDate && savedLastAdViewDate !== today) {
          // It's a new day, reset ad views
          setDailyAdViews(0);
          setLastAdViewDate(today);
          await AsyncStorage.setItem('rewards_dailyAdViews', '0');
          await AsyncStorage.setItem('rewards_lastAdViewDate', today);
        } else {
          // Same day, use saved values
          if (savedDailyAdViews) setDailyAdViews(parseInt(savedDailyAdViews, 10));
          if (savedLastAdViewDate) setLastAdViewDate(savedLastAdViewDate);
        }
        
        // Set reward items
        if (savedRewardItems) {
          setRewardItems(JSON.parse(savedRewardItems));
        }
      } catch (error) {
        console.log('Error loading rewards data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Add points to user's balance
  const addPoints = async (amount: number) => {
    try {
      const newPoints = points + amount;
      setPoints(newPoints);
      await AsyncStorage.setItem('rewards_points', newPoints.toString());
    } catch (error) {
      console.log('Error adding points:', error);
    }
  };

  // Use points from user's balance
  const usePoints = async (amount: number): Promise<boolean> => {
    try {
      if (points < amount) return false;
      
      const newPoints = points - amount;
      setPoints(newPoints);
      await AsyncStorage.setItem('rewards_points', newPoints.toString());
      return true;
    } catch (error) {
      console.log('Error using points:', error);
      return false;
    }
  };

  // Record an ad view and add points if successful
  const recordAdView = async (): Promise<boolean> => {
    try {
      if (dailyAdViews >= MAX_DAILY_ADS) return false;
      
      const today = new Date().toDateString();
      const newDailyAdViews = dailyAdViews + 1;
      
      // Update state and storage
      setDailyAdViews(newDailyAdViews);
      setLastAdViewDate(today);
      await AsyncStorage.setItem('rewards_dailyAdViews', newDailyAdViews.toString());
      await AsyncStorage.setItem('rewards_lastAdViewDate', today);
      
      // Add points for watching ad
      await addPoints(10); // 10 points per ad view
      return true;
    } catch (error) {
      console.log('Error recording ad view:', error);
      return false;
    }
  };

  // Unlock a reward item using points
  const unlockRewardItem = async (itemId: string): Promise<boolean> => {
    try {
      const item = rewardItems.find(r => r.id === itemId);
      if (!item) return false;
      if (item.unlocked) return true; // Already unlocked
      if (points < item.pointCost) return false; // Not enough points
      
      // Deduct points
      const success = await usePoints(item.pointCost);
      if (!success) return false;
      
      // Update item to unlocked
      const updatedItems = rewardItems.map(r => 
        r.id === itemId ? { ...r, unlocked: true } : r
      );
      
      setRewardItems(updatedItems);
      await AsyncStorage.setItem('rewards_items', JSON.stringify(updatedItems));
      return true;
    } catch (error) {
      console.log('Error unlocking reward:', error);
      return false;
    }
  };

  // Reset daily ad limit (for testing)
  const resetDailyAdLimit = async () => {
    try {
      setDailyAdViews(0);
      await AsyncStorage.setItem('rewards_dailyAdViews', '0');
    } catch (error) {
      console.log('Error resetting ad limit:', error);
    }
  };

  return (
    <RewardsContext.Provider value={{
      points,
      dailyAdViews,
      lastAdViewDate,
      rewardItems,
      isLoading,
      canWatchAd,
      addPoints,
      usePoints,
      recordAdView,
      unlockRewardItem,
      resetDailyAdLimit,
    }}>
      {children}
    </RewardsContext.Provider>
  );
};

// Custom hook for using rewards context
export const useRewards = () => useContext(RewardsContext);