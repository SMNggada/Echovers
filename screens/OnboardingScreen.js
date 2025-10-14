import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './LoginScreen';

const { width, height } = Dimensions.get('window');

// Onboarding data
const slides = [
  {
    id: '1',
    image: 'https://api.a0.dev/assets/image?text=IQspace%20Audio&aspect=1:1&seed=1',
    title: 'Welcome to IQspace',
    description: 'Your audio learning and social platform. Discover, learn, and grow with audio content.',
  },
  {
    id: '2',
    image: 'https://api.a0.dev/assets/image?text=Discover&aspect=1:1&seed=2',
    title: 'Discover Audio Content',
    description: 'Explore narrations, audiobooks, podcasts, and more - all in one place.',
  },
  {
    id: '3',
    image: 'https://api.a0.dev/assets/image?text=Learn&aspect=1:1&seed=3',
    title: 'Learn On The Go',
    description: 'Listen and learn anytime, anywhere - even in low-bandwidth areas.',
  },
  {
    id: '4',
    image: 'https://api.a0.dev/assets/image?text=Connect&aspect=1:1&seed=4',
    title: 'Connect & Share',
    description: 'Like, comment, and share your favorite audio with friends and followers.',
  },
  {
    id: '5',
    image: 'https://api.a0.dev/assets/image?text=Rewards&aspect=1:1&seed=5',
    title: 'Earn Rewards',
    description: 'Watch ads to earn points and unlock premium audio content.',
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Complete onboarding and navigate to Auth
  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.log('Error saving onboarding state:', error);
    }
  };

  // Skip to last slide
  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({
      index: slides.length - 1,
      animated: true,
    });
  };

  // Go to next slide
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleDone();
    }
  };

  // Render individual slide
  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  // Render pagination dots
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: index === currentIndex ? '#4361ee' : '#ccc',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButton} />
        )}
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderPagination()}

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            currentIndex === slides.length - 1
              ? styles.doneButton
              : styles.nextButton,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentIndex === slides.length - 1 && (
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
    marginTop: height * 0.05,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButton: {
    backgroundColor: '#4361ee',
    shadowColor: '#4361ee',
  },
  doneButton: {
    backgroundColor: '#05c46b',
    shadowColor: '#05c46b',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4361ee',
    marginLeft: 5,
  },
});

export default OnboardingScreen;