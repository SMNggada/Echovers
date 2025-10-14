import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Moon,
  Sun,
  Bell,
  Download,
  Wifi,
  HardDrive,
  Lock,
  User,
  LogOut,
  ChevronRight,
  Trash2,
  HelpCircle,
  FileText,
  Star
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [downloadOnWifiOnly, setDownloadOnWifiOnly] = useState(true);
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(false);
  const [dataUsageLimit, setDataUsageLimit] = useState('1GB');
  const [storageUsed, setStorageUsed] = useState('256MB');
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            toast.success('Logged out successfully');
          }
        }
      ]
    );
  };
  
  // Handle clear data
  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all app data? This will remove all downloaded content and reset your preferences.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear data logic would go here
            toast.success('App data cleared successfully');
          }
        }
      ]
    );
  };
  
  // Handle theme change
  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    toast.success(`${mode === 'dark' ? 'Dark' : 'Light'} mode activated`);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={theme.icon} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Appearance
          </Text>
          
          <View style={[styles.themeOptions, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                theme.mode === 'light' && [styles.activeThemeOption, { borderColor: theme.primary }]
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Sun 
                size={24} 
                color={theme.mode === 'light' ? theme.primary : theme.icon} 
              />
              <Text 
                style={[
                  styles.themeText, 
                  { color: theme.mode === 'light' ? theme.primary : theme.text }
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.themeOption,
                theme.mode === 'dark' && [styles.activeThemeOption, { borderColor: theme.primary }]
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Moon 
                size={24} 
                color={theme.mode === 'dark' ? theme.primary : theme.icon} 
              />
              <Text 
                style={[
                  styles.themeText, 
                  { color: theme.mode === 'dark' ? theme.primary : theme.text }
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notifications
          </Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            <View style={[styles.settingsItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingsItemLeft}>
                <Bell size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Push Notifications
                </Text>
              </View>
              
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : notificationsEnabled ? theme.primaryLight : '#f4f3f4'}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('NotificationPreferences')}
            >
              <View style={styles.settingsItemLeft}>
                <Bell size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Notification Preferences
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Downloads & Storage Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Downloads & Storage
          </Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            <View style={[styles.settingsItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingsItemLeft}>
                <Wifi size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Download on Wi-Fi Only
                </Text>
              </View>
              
              <Switch
                value={downloadOnWifiOnly}
                onValueChange={setDownloadOnWifiOnly}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : downloadOnWifiOnly ? theme.primaryLight : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingsItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingsItemLeft}>
                <Download size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Auto-Download New Episodes
                </Text>
              </View>
              
              <Switch
                value={autoDownloadEnabled}
                onValueChange={setAutoDownloadEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : autoDownloadEnabled ? theme.primaryLight : '#f4f3f4'}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('DataUsage')}
            >
              <View style={styles.settingsItemLeft}>
                <HardDrive size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Data Usage Limit
                </Text>
              </View>
              
              <View style={styles.settingsItemRight}>
                <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>
                  {dataUsageLimit}
                </Text>
                <ChevronRight size={20} color={theme.icon} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('StorageManagement')}
            >
              <View style={styles.settingsItemLeft}>
                <HardDrive size={20} color={theme.icon} style={styles.settingsIcon} />
                <View>
                  <Text style={[styles.settingsLabel, { color: theme.text }]}>
                    Storage Used
                  </Text>
                  <Text style={[styles.settingsSubLabel, { color: theme.textSecondary }]}>
                    {storageUsed} of downloaded content
                  </Text>
                </View>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account
          </Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('AccountDetails')}
            >
              <View style={styles.settingsItemLeft}>
                <User size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Account Details
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('PrivacySettings')}
            >
              <View style={styles.settingsItemLeft}>
                <Lock size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Privacy Settings
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleLogout}
            >
              <View style={styles.settingsItemLeft}>
                <LogOut size={20} color={theme.error} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.error }]}>
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Support
          </Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('HelpCenter')}
            >
              <View style={styles.settingsItemLeft}>
                <HelpCircle size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Help Center
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              <View style={styles.settingsItemLeft}>
                <FileText size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Terms of Service
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.settingsItemLeft}>
                <Lock size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Privacy Policy
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate('RateApp')}
            >
              <View style={styles.settingsItemLeft}>
                <Star size={20} color={theme.icon} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.text }]}>
                  Rate the App
                </Text>
              </View>
              
              <ChevronRight size={20} color={theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={handleClearData}
            >
              <View style={styles.settingsItemLeft}>
                <Trash2 size={20} color={theme.error} style={styles.settingsIcon} />
                <Text style={[styles.settingsLabel, { color: theme.error }]}>
                  Clear App Data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            Echovers v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThemeOption: {
    borderWidth: 2,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingsGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsLabel: {
    fontSize: 16,
  },
  settingsSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 16,
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;