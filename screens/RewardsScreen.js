import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRewards } from '../context/RewardsContext';

const RewardsScreen = () => {
  const navigation = useNavigation();
  const {
    points,
    dailyAdViews,
    rewardItems,
    canWatchAd,
    recordAdView,
    unlockRewardItem,
    resetDailyAdLimit,
  } = useRewards();

  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [adProgress, setAdProgress] = useState(0);
  const [adCompleted, setAdCompleted] = useState(false);
  
  // Mock ad view function (to simulate AdMob)
  const watchRewardAd = async () => {
    if (!canWatchAd) {
      Alert.alert(
        "Daily Limit Reached",
        "You've reached your daily limit of 3 reward ads. Come back tomorrow for more rewards!"
      );
      return;
    }

    try {
      setIsWatchingAd(true);
      setShowAdModal(true);
      setAdProgress(0);
      setAdCompleted(false);
      
      // Simulate ad loading and playing
      for (let i = 0; i <= 100; i += 10) {
        setAdProgress(i);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      
      setAdCompleted(true);
      
      // Record the ad view in our rewards system
      const success = await recordAdView();
      
      if (success) {
        setEarnedPoints(10); // 10 points per ad view
        setShowAdModal(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load reward ad. Please try again later.");
    } finally {
      setIsWatchingAd(false);
    }
  };
  
  // Unlock a premium feature with points
  const handleUnlock = async (itemId, cost) => {
    if (points < cost) {
      Alert.alert(
        "Not Enough Points",
        `You need ${cost - points} more points to unlock this feature.`
      );
      return;
    }
    
    try {
      setIsUnlocking(true);
      const success = await unlockRewardItem(itemId);
      
      if (success) {
        Alert.alert("Success", "Feature unlocked successfully!");
      } else {
        Alert.alert("Error", "Failed to unlock feature. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsUnlocking(false);
    }
  };
  
  // Render each reward item
  const renderRewardItem = ({ item }) => {
    return (
      <View style={styles.rewardItem}>
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.rewardImage}
        />
        <View style={styles.rewardContent}>
          <Text style={styles.rewardTitle}>{item.title}</Text>
          <Text style={styles.rewardDescription}>{item.description}</Text>
          
          <View style={styles.rewardFooter}>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsValue}>{item.pointCost}</Text>
              <Text style={styles.pointsLabel}>points</Text>
            </View>
            
            {item.unlocked ? (
              <View style={[styles.unlockButton, styles.unlockedButton]}>
                <Text style={styles.unlockedButtonText}>Unlocked</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.unlockButton, 
                  points < item.pointCost && styles.disabledButton
                ]}
                onPress={() => handleUnlock(item.id, item.pointCost)}
                disabled={points < item.pointCost || isUnlocking}
              >
                {isUnlocking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.unlockButtonText}>
                    {points < item.pointCost ? `Need ${item.pointCost - points} more` : 'Unlock'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards & Premium</Text>
        <View style={{ width: 50 }} />
      </View>
      
      <View style={styles.pointsSummary}>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsBoxValue}>{points}</Text>
          <Text style={styles.pointsBoxLabel}>Points</Text>
        </View>
        
        <View style={styles.adCountContainer}>
          <Text style={styles.adCountLabel}>Daily ads watched:</Text>
          <View style={styles.adCountDots}>
            {[...Array(3)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.adCountDot, 
                  i < dailyAdViews && styles.adCountDotActive
                ]} 
              />
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.watchAdButton,
            !canWatchAd && styles.watchAdButtonDisabled
          ]}
          onPress={watchRewardAd}
          disabled={!canWatchAd || isWatchingAd}
        >
          {isWatchingAd ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.watchAdButtonText}>
              {canWatchAd ? "Watch Ad for Points" : "Daily Limit Reached"}
            </Text>
          )}
        </TouchableOpacity>

        {/* For development/testing only */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetDailyAdLimit}
        >
          <Text style={styles.resetButtonText}>Reset Daily Ad Limit</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Premium Features</Text>
      <Text style={styles.sectionSubtitle}>
        Unlock premium features with your points
      </Text>
      
      <FlatList
        data={rewardItems}
        renderItem={renderRewardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.rewardsList}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Ad Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showAdModal}
        onRequestClose={() => {
          if (adCompleted) setShowAdModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.adModal}>
            <Text style={styles.adModalTitle}>Reward Ad</Text>
            <Image
              source={{ 
                uri: `https://api.a0.dev/assets/image?text=Watching%20Ad&aspect=16:9&seed=${Date.now()}` 
              }}
              style={styles.adImage}
            />
            
            {!adCompleted ? (
              <>
                <Text style={styles.adModalMessage}>
                  Please watch the ad to earn points.
                </Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${adProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{adProgress}%</Text>
              </>
            ) : (
              <>
                <Text style={styles.adModalMessage}>
                  Ad completed! Earning your points...
                </Text>
                <ActivityIndicator size="large" color="#4361ee" style={{ marginTop: 20 }} />
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.confettiContainer}>
              <Text style={styles.confettiEmoji}>🎉</Text>
            </View>
            
            <Text style={styles.successTitle}>Congratulations!</Text>
            <Text style={styles.successMessage}>
              You earned {earnedPoints} points for watching the ad.
            </Text>
            
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: '#4361ee',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsSummary: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pointsBox: {
    alignItems: 'center',
    marginBottom: 15,
  },
  pointsBoxValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  pointsBoxLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  adCountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  adCountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  adCountDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  adCountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  adCountDotActive: {
    backgroundColor: '#4361ee',
  },
  watchAdButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  watchAdButtonDisabled: {
    backgroundColor: '#b3b7ed',
  },
  watchAdButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 10,
    padding: 10,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 12,
  },
  divider: {
    height: 10,
    backgroundColor: '#eaeef2',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  rewardsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  rewardItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  rewardContent: {
    padding: 15,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  unlockButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unlockedButton: {
    backgroundColor: '#05c46b',
  },
  unlockedButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#b3b7ed',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  adModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  adImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 15,
  },
  adModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#4361ee',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  successModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  confettiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confettiEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RewardsScreen;