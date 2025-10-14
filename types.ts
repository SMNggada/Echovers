// types.ts or inside same file

export type RootStackParamList = {
  MainTabs: undefined;
  BecomeCreator: undefined;
  CreatePodcast: undefined;
  ContentDetails: undefined;
  Search: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Profile: undefined;
};

type PodcastItem = {
  id: string;
  title: string;
  authorName: string;
  coverImage: string;
  type: 'podcast';
  // other fields...
}
type AudiobookItem = {
  id: string;
  title: string;
  authorName: string;
  coverImage: string;
  type: 'audiobook';
  // other fields...
}