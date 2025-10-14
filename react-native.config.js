module.exports = {
  codegenConfig: {
    libraries: [
      { name: '@react-native-community/slider', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: '@react-native-google-signin/google-signin', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: 'react-native-gesture-handler', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: 'react-native-reanimated', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: 'react-native-safe-area-context', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: 'react-native-screens', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: 'react-native-svg', type: 'all', jsSrcsDir: 'lib/typescript' },
      { name: 'react-native-vector-icons', type: 'all', jsSrcsDir: 'lib/typescript' },
    ],
  },
};