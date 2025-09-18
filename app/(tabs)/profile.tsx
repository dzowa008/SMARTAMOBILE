import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, Palette, Cloud, Download, Upload, Trash2, LogOut, Moon, Sun, BarChart3, FileText, Clock, Brain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ProfileStats } from '../../components/ProfileStats';
import { SettingsGroup } from '../../components/SettingsGroup';
import { userService } from '../../services/userService';
import { storageService } from '../../services/storageService';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSync: true,
    voiceTranscription: true,
    aiSuggestions: true,
    offlineMode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [userData, userStats, userSettings] = await Promise.all([
        userService.getCurrentUser(),
        userService.getUserStats(),
        userService.getUserSettings(),
      ]);
      
      setUser(userData);
      setStats(userStats);
      setSettings({ ...settings, ...userSettings });
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await userService.updateSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
      // Revert the setting
      setSettings(settings);
    }
  };

  const handleExportData = async () => {
    try {
      Alert.alert(
        'Export Data',
        'Choose export format',
        [
          {
            text: 'JSON',
            onPress: () => exportData('json'),
          },
          {
            text: 'PDF',
            onPress: () => exportData('pdf'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const exportData = async (format) => {
    try {
      const exportUrl = await storageService.exportUserData(format);
      Alert.alert('Success', `Data exported successfully. Download link: ${exportUrl}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportData = async () => {
    try {
      Alert.alert(
        'Import Data',
        'This will merge imported data with your existing notes. Continue?',
        [
          {
            text: 'Import',
            onPress: async () => {
              try {
                await storageService.importUserData();
                Alert.alert('Success', 'Data imported successfully');
                loadProfileData();
              } catch (error) {
                Alert.alert('Error', 'Failed to import data');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to import data');
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your notes, recordings, and data. This action cannot be undone.',
      [
        {
          text: 'DELETE EVERYTHING',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAllUserData();
              Alert.alert('Success', 'All data deleted successfully');
              // Logout or navigate to onboarding
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await userService.logout();
              // Navigate to login screen
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          title: 'Dark Mode',
          icon: settings.darkMode ? Moon : Sun,
          type: 'switch',
          value: settings.darkMode,
          onValueChange: (value) => handleSettingChange('darkMode', value),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          title: 'Push Notifications',
          type: 'switch',
          value: settings.notifications,
          onValueChange: (value) => handleSettingChange('notifications', value),
        },
      ],
    },
    {
      title: 'AI & Voice',
      icon: Brain,
      settings: [
        {
          title: 'Voice Transcription',
          type: 'switch',
          value: settings.voiceTranscription,
          onValueChange: (value) => handleSettingChange('voiceTranscription', value),
        },
        {
          title: 'AI Suggestions',
          type: 'switch',
          value: settings.aiSuggestions,
          onValueChange: (value) => handleSettingChange('aiSuggestions', value),
        },
      ],
    },
    {
      title: 'Sync & Storage',
      icon: Cloud,
      settings: [
        {
          title: 'Auto Sync',
          type: 'switch',
          value: settings.autoSync,
          onValueChange: (value) => handleSettingChange('autoSync', value),
        },
        {
          title: 'Offline Mode',
          type: 'switch',
          value: settings.offlineMode,
          onValueChange: (value) => handleSettingChange('offlineMode', value),
        },
      ],
    },
    {
      title: 'Data Management',
      icon: Shield,
      settings: [
        {
          title: 'Export Data',
          icon: Download,
          type: 'action',
          onPress: handleExportData,
        },
        {
          title: 'Import Data',
          icon: Upload,
          type: 'action',
          onPress: handleImportData,
        },
        {
          title: 'Delete All Data',
          icon: Trash2,
          type: 'action',
          onPress: handleDeleteAllData,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <User size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Profile Stats */}
        <ProfileStats stats={stats} loading={loading} />

        {/* Settings Groups */}
        {settingsGroups.map((group, index) => (
          <SettingsGroup
            key={index}
            title={group.title}
            icon={group.icon}
            settings={group.settings}
          />
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Smart Notes AI v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for productivity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});