// Generate a random date within the last year
const randomDate = () => {
  const now = new Date();
  const pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  return new Date(randomTime);
};

// Generate a random duration between 10 and 120 minutes (in seconds)
const randomDuration = () => Math.floor(Math.random() * (7200 - 600) + 600);

// Generate a random progress percentage
const randomProgress = (duration) => Math.floor(Math.random() * duration);

// Generate a list of podcast categories
const podcastCategories = [
  'True Crime', 'Comedy', 'News', 'Business', 'Politics', 'Health', 
  'Science', 'Technology', 'Arts', 'Education', 'Fiction', 'History',
  'Society & Culture', 'Music', 'TV & Film', 'Sports', 'Religion & Spirituality',
  'Philosophy', 'Self-Improvement', 'Storytelling'
];

// Generate a list of audiobook genres
const audiobookGenres = [
  'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Fantasy', 'Horror',
  'Biography', 'History', 'Self-Help', 'Business', 'Fiction', 'Non-Fiction',
  'Young Adult', 'Children', 'Poetry', 'Drama', 'Adventure', 'Classics',
  'Memoir', 'Philosophy', 'Psychology', 'Politics', 'Travel', 'Cooking'
];

// Generate a list of creator names
const creatorNames = [
  'Alex Johnson', 'Maya Patel', 'James Wilson', 'Sophia Chen', 'Noah Garcia',
  'Emma Rodriguez', 'Liam Thompson', 'Olivia Kim', 'Ethan Davis', 'Ava Martinez',
  'Benjamin Lee', 'Isabella Taylor', 'William Brown', 'Mia Clark', 'Lucas White',
  'Charlotte Lewis', 'Henry Walker', 'Amelia Hall', 'Alexander Young', 'Harper Allen',
  'Daniel King', 'Evelyn Scott', 'Matthew Green', 'Abigail Baker', 'Joseph Adams',
  'Elizabeth Nelson', 'Samuel Carter', 'Sofia Mitchell', 'David Turner', 'Grace Phillips'
];

// Generate a list of podcast titles
const generatePodcastTitle = () => {
  const prefixes = ['The', 'Inside', 'Beyond', 'Exploring', 'Discover', 'Uncover', 'Secret', 'Hidden', 'Daily', 'Weekly'];
  const subjects = ['World', 'Mind', 'Story', 'Truth', 'Mystery', 'Science', 'Tech', 'Business', 'Life', 'Culture'];
  const suffixes = ['Show', 'Podcast', 'Hour', 'Talk', 'Cast', 'Radio', 'Network', 'Series', 'Chronicles', 'Diaries'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${subject} ${suffix}`;
};

// Generate a list of audiobook titles
const generateAudiobookTitle = () => {
  const adjectives = ['Lost', 'Hidden', 'Secret', 'Last', 'Forgotten', 'Eternal', 'Silent', 'Broken', 'Distant', 'Ancient'];
  const nouns = ['Kingdom', 'City', 'Garden', 'Memory', 'Promise', 'Shadow', 'Dream', 'Star', 'Path', 'Legacy'];
  const phrases = ['of Time', 'of Destiny', 'of Shadows', 'of Light', 'of the Sea', 'of the Mountain', 'of Truth', 'of Lies', 'of Hope', 'of Despair'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  return `The ${adjective} ${noun} ${phrase}`;
};

// Generate a list of episode titles
const generateEpisodeTitle = () => {
  const numbers = ['#1:', '#2:', '#3:', '#4:', '#5:', '#6:', '#7:', '#8:', '#9:', '#10:'];
  const topics = ['Introduction to', 'Deep Dive into', 'Exploring', 'Understanding', 'The Truth About', 'Behind the Scenes of', 'The Future of', 'The History of', 'Secrets of', 'Mastering'];
  const subjects = ['Success', 'Failure', 'Innovation', 'Leadership', 'Creativity', 'Relationships', 'Health', 'Wealth', 'Happiness', 'Growth'];
  
  const number = numbers[Math.floor(Math.random() * numbers.length)];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  
  return `${number} ${topic} ${subject}`;
};

// Generate a list of playlist names
const generatePlaylistName = () => {
  const adjectives = ['Chill', 'Energetic', 'Relaxing', 'Inspiring', 'Motivational', 'Thought-Provoking', 'Calming', 'Exciting', 'Fascinating', 'Intriguing'];
  const nouns = ['Listens', 'Podcasts', 'Stories', 'Episodes', 'Audiobooks', 'Narratives', 'Talks', 'Discussions', 'Conversations', 'Interviews'];
  const purposes = ['for Focus', 'for Relaxation', 'for Learning', 'for Bedtime', 'for Commuting', 'for Workouts', 'for Meditation', 'for Cooking', 'for Road Trips', 'for Inspiration'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const purpose = purposes[Math.floor(Math.random() * purposes.length)];
  
  return `${adjective} ${noun} ${purpose}`;
};

// Generate a description
const generateDescription = () => {
  const descriptions = [
    "Join us as we explore fascinating topics with expert guests and insightful commentary.",
    "Dive deep into compelling stories that will change the way you see the world.",
    "A thought-provoking journey through ideas that matter, with voices that inspire.",
    "Discover new perspectives and expand your horizons with our engaging content.",
    "Uncover hidden truths and gain valuable insights with our expert hosts.",
    "Embark on an audio adventure that will entertain, educate, and inspire you.",
    "Listen to captivating conversations that challenge conventional wisdom.",
    "Experience storytelling at its finest, with narratives that transport you.",
    "Gain knowledge and understanding through our carefully crafted episodes.",
    "Be part of a community of curious minds exploring important topics together."
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Generate podcasts
const generatePodcasts = (count) => {
  const podcasts = [];
  
  for (let i = 0; i < count; i++) {
    const id = `podcast-${i + 1}`;
    const title = generatePodcastTitle();
    const authorName = creatorNames[Math.floor(Math.random() * creatorNames.length)];
    const category = podcastCategories[Math.floor(Math.random() * podcastCategories.length)];
    const createdAt = randomDate();
    const coverImage = `https://api.a0.dev/assets/image?text=${encodeURIComponent(title)}&aspect=1:1&seed=${id}`;
    
    podcasts.push({
      id,
      title,
      authorName,
      authorId: `user-${Math.floor(Math.random() * 30) + 1}`,
      category,
      description: generateDescription(),
      coverImage,
      isPublished: true,
      createdAt,
      updatedAt: new Date(),
      episodeCount: Math.floor(Math.random() * 50) + 5,
      rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0 and 5.0
      audioKey: id
    });
  }
  
  return podcasts;
};

// Generate episodes
const generateEpisodes = (count, podcasts) => {
  const episodes = [];
  
  for (let i = 0; i < count; i++) {
    const podcast = podcasts[Math.floor(Math.random() * podcasts.length)];
    const id = `episode-${i + 1}`;
    const title = generateEpisodeTitle();
    const duration = randomDuration();
    const createdAt = randomDate();
    const coverImage = podcast.coverImage;
    
    episodes.push({
      id,
      title,
      podcastId: podcast.id,
      podcastTitle: podcast.title,
      authorName: podcast.authorName,
      authorId: podcast.authorId,
      duration,
      description: generateDescription(),
      coverImage,
      isPublished: true,
      createdAt,
      publishedAt: createdAt,
      listens: Math.floor(Math.random() * 10000),
      audioKey: id
    });
  }
  
  return episodes;
};

// Generate audiobooks
const generateAudiobooks = (count) => {
  const audiobooks = [];
  
  for (let i = 0; i < count; i++) {
    const id = `audiobook-${i + 1}`;
    const title = generateAudiobookTitle();
    const authorName = creatorNames[Math.floor(Math.random() * creatorNames.length)];
    const genre = audiobookGenres[Math.floor(Math.random() * audiobookGenres.length)];
    const duration = randomDuration() * 5; // Audiobooks are longer
    const createdAt = randomDate();
    const coverImage = `https://api.a0.dev/assets/image?text=${encodeURIComponent(title)}&aspect=1:1&seed=${id}`;
    
    audiobooks.push({
      id,
      title,
      authorName,
      authorId: `user-${Math.floor(Math.random() * 30) + 1}`,
      genre,
      duration,
      description: generateDescription(),
      coverImage,
      isPublished: true,
      createdAt,
      updatedAt: new Date(),
      chapters: Math.floor(Math.random() * 20) + 5,
      rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0 and 5.0
      audioKey: id
    });
  }
  
  return audiobooks;
};

// Generate playlists
const generatePlaylists = (count, episodes, audiobooks) => {
  const playlists = [];
  
  for (let i = 0; i < count; i++) {
    const id = `playlist-${i + 1}`;
    const title = generatePlaylistName();
    const creatorName = creatorNames[Math.floor(Math.random() * creatorNames.length)];
    const createdAt = randomDate();
    const coverImage = `https://api.a0.dev/assets/image?text=${encodeURIComponent(title)}&aspect=1:1&seed=${id}`;
    
    // Generate random items for the playlist
    const itemCount = Math.floor(Math.random() * 15) + 5;
    const items = [];
    
    for (let j = 0; j < itemCount; j++) {
      // 70% chance of episode, 30% chance of audiobook
      if (Math.random() < 0.7) {
        const episode = episodes[Math.floor(Math.random() * episodes.length)];
        items.push({
          id: episode.id,
          type: 'episode',
          title: episode.title,
          podcastTitle: episode.podcastTitle,
          authorName: episode.authorName,
          duration: episode.duration,
          coverImage: episode.coverImage
        });
      } else {
        const audiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
        items.push({
          id: audiobook.id,
          type: 'audiobook',
          title: audiobook.title,
          authorName: audiobook.authorName,
          duration: audiobook.duration,
          coverImage: audiobook.coverImage
        });
      }
    }
    
    playlists.push({
      id,
      title,
      creatorId: `user-${Math.floor(Math.random() * 30) + 1}`,
      creatorName,
      description: generateDescription(),
      coverImage,
      isPublic: true,
      createdAt,
      updatedAt: new Date(),
      itemCount: items.length,
      items
    });
  }
  
  return playlists;
};

// Generate continue listening
const generateContinueListening = (count, episodes, audiobooks) => {
  const continueListening = [];
  
  for (let i = 0; i < count; i++) {
    // 70% chance of episode, 30% chance of audiobook
    if (Math.random() < 0.7) {
      const episode = episodes[Math.floor(Math.random() * episodes.length)];
      const progress = randomProgress(episode.duration);
      
      continueListening.push({
        ...episode,
        progress,
        lastListened: randomDate()
      });
    } else {
      const audiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
      const progress = randomProgress(audiobook.duration);
      
      continueListening.push({
        ...audiobook,
        progress,
        lastListened: randomDate()
      });
    }
  }
  
  // Sort by last listened (most recent first)
  return continueListening.sort((a, b) => b.lastListened - a.lastListened);
};

// Generate categories
const generateCategories = () => {
  const allCategories = [...podcastCategories, ...audiobookGenres];
  const uniqueCategories = [...new Set(allCategories)];
  
  return uniqueCategories.map((name, index) => ({
    id: `category-${index + 1}`,
    name,
    coverImage: `https://api.a0.dev/assets/image?text=${encodeURIComponent(name)}&aspect=1:1&seed=${name}`
  }));
};

// Generate creators
const generateCreators = (count) => {
  const creators = [];
  
  for (let i = 0; i < count; i++) {
    const id = `user-${i + 1}`;
    const displayName = creatorNames[i % creatorNames.length];
    const username = displayName.toLowerCase().replace(' ', '');
    
    creators.push({
      id,
      uid: id,
      email: `${username}@example.com`,
      displayName,
      role: 'creator',
      bio: generateDescription(),
      profileImage: `https://api.a0.dev/assets/image?text=${encodeURIComponent(displayName.charAt(0))}&aspect=1:1&seed=${id}`,
      createdAt: randomDate(),
      contentCount: Math.floor(Math.random() * 50) + 5,
      followers: Math.floor(Math.random() * 10000)
    });
  }
  
  return creators;
};

// Generate badges
const generateBadges = () => {
  return [
    {
      id: 'badge-1',
      name: 'First Listen',
      description: 'Completed your first audio content',
      icon: '🎧',
      level: 1
    },
    {
      id: 'badge-2',
      name: 'Podcast Explorer',
      description: 'Listened to 10 different podcasts',
      icon: '🔍',
      level: 2
    },
    {
      id: 'badge-3',
      name: 'Audiobook Enthusiast',
      description: 'Completed 5 audiobooks',
      icon: '📚',
      level: 2
    },
    {
      id: 'badge-4',
      name: 'Daily Listener',
      description: 'Listened for 7 consecutive days',
      icon: '📅',
      level: 3
    },
    {
      id: 'badge-5',
      name: 'Genre Master',
      description: 'Explored content from 10 different genres',
      icon: '🏆',
      level: 3
    },
    {
      id: 'badge-6',
      name: 'Content Creator',
      description: 'Published your first audio content',
      icon: '🎤',
      level: 4
    },
    {
      id: 'badge-7',
      name: 'Marathon Listener',
      description: 'Listened for more than 24 hours total',
      icon: '⏱️',
      level: 4
    },
    {
      id: 'badge-8',
      name: 'Social Butterfly',
      description: 'Shared content with 10 friends',
      icon: '🦋',
      level: 3
    },
    {
      id: 'badge-9',
      name: 'Night Owl',
      description: 'Listened for more than 3 hours after midnight',
      icon: '🦉',
      level: 2
    },
    {
      id: 'badge-10',
      name: 'Early Bird',
      description: 'Listened for more than 3 hours before 8 AM',
      icon: '🐦',
      level: 2
    }
  ];
};

// Generate rewards
const generateRewards = () => {
  return [
    {
      id: 'reward-1',
      name: 'Premium Content Access',
      description: 'Unlock exclusive premium content for 7 days',
      icon: '🔓',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'reward-2',
      name: 'Creator Spotlight',
      description: 'Get featured on the Echovers homepage',
      icon: '🌟',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'reward-3',
      name: 'Ad-Free Listening',
      description: 'Enjoy ad-free listening for 3 days',
      icon: '🔇',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'reward-4',
      name: 'Early Access',
      description: 'Get early access to new features',
      icon: '⏰',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'reward-5',
      name: 'Custom Playlist',
      description: 'Get a personalized playlist curated by our team',
      icon: '🎵',
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Generate user activity
const generateUserActivity = (count, podcasts, audiobooks, episodes) => {
  const activities = [];
  const activityTypes = ['listened', 'liked', 'shared', 'followed', 'completed'];
  
  for (let i = 0; i < count; i++) {
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const timestamp = randomDate();
    let activity;
    
    switch (activityType) {
      case 'listened':
        if (Math.random() < 0.7) {
          const episode = episodes[Math.floor(Math.random() * episodes.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'listened',
            contentType: 'episode',
            contentId: episode.id,
            contentTitle: episode.title,
            podcastTitle: episode.podcastTitle,
            coverImage: episode.coverImage,
            timestamp
          };
        } else {
          const audiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'listened',
            contentType: 'audiobook',
            contentId: audiobook.id,
            contentTitle: audiobook.title,
            coverImage: audiobook.coverImage,
            timestamp
          };
        }
        break;
      
      case 'liked':
        if (Math.random() < 0.5) {
          const podcast = podcasts[Math.floor(Math.random() * podcasts.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'liked',
            contentType: 'podcast',
            contentId: podcast.id,
            contentTitle: podcast.title,
            coverImage: podcast.coverImage,
            timestamp
          };
        } else {
          const episode = episodes[Math.floor(Math.random() * episodes.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'liked',
            contentType: 'episode',
            contentId: episode.id,
            contentTitle: episode.title,
            podcastTitle: episode.podcastTitle,
            coverImage: episode.coverImage,
            timestamp
          };
        }
        break;
      
      case 'shared':
        if (Math.random() < 0.7) {
          const episode = episodes[Math.floor(Math.random() * episodes.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'shared',
            contentType: 'episode',
            contentId: episode.id,
            contentTitle: episode.title,
            podcastTitle: episode.podcastTitle,
            coverImage: episode.coverImage,
            timestamp
          };
        } else {
          const audiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'shared',
            contentType: 'audiobook',
            contentId: audiobook.id,
            contentTitle: audiobook.title,
            coverImage: audiobook.coverImage,
            timestamp
          };
        }
        break;
      
      case 'followed':
        const creator = creatorNames[Math.floor(Math.random() * creatorNames.length)];
        activity = {
          id: `activity-${i + 1}`,
          type: 'followed',
          creatorId: `user-${Math.floor(Math.random() * 30) + 1}`,
          creatorName: creator,
          timestamp
        };
        break;
      
      case 'completed':
        if (Math.random() < 0.3) {
          const audiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'completed',
            contentType: 'audiobook',
            contentId: audiobook.id,
            contentTitle: audiobook.title,
            coverImage: audiobook.coverImage,
            timestamp
          };
        } else {
          const podcast = podcasts[Math.floor(Math.random() * podcasts.length)];
          activity = {
            id: `activity-${i + 1}`,
            type: 'completed',
            contentType: 'podcast',
            contentId: podcast.id,
            contentTitle: podcast.title,
            coverImage: podcast.coverImage,
            timestamp
          };
        }
        break;
    }
    
    activities.push(activity);
  }
  
  // Sort by timestamp (most recent first)
  return activities.sort((a, b) => b.timestamp - a.timestamp);
};

// Generate user stats
const generateUserStats = () => {
  return {
    totalListeningTime: Math.floor(Math.random() * 500) + 50, // Hours
    podcastsCompleted: Math.floor(Math.random() * 50) + 5,
    audiobooksCompleted: Math.floor(Math.random() * 20) + 2,
    episodesListened: Math.floor(Math.random() * 200) + 20,
    categoriesExplored: Math.floor(Math.random() * 15) + 5,
    creatorsFollowed: Math.floor(Math.random() * 30) + 3,
    contentShared: Math.floor(Math.random() * 40) + 2,
    streak: Math.floor(Math.random() * 30) + 1, // Days
    level: Math.floor(Math.random() * 10) + 1,
    xp: Math.floor(Math.random() * 1000) + 100,
    nextLevelXp: 1000
  };
};

// Generate all mock data
const podcasts = generatePodcasts(40);
const episodes = generateEpisodes(120, podcasts);
const audiobooks = generateAudiobooks(40);
const playlists = generatePlaylists(30, episodes, audiobooks);
const continueListening = generateContinueListening(15, episodes, audiobooks);
const categories = generateCategories();
const creators = generateCreators(30);
const badges = generateBadges();
const rewards = generateRewards();
const userActivity = generateUserActivity(50, podcasts, audiobooks, episodes);
const userStats = generateUserStats();

// Export the mock data
export default {
  podcasts,
  episodes,
  audiobooks,
  playlists,
  continueListening,
  categories,
  creators,
  badges,
  rewards,
  userActivity,
  userStats
};