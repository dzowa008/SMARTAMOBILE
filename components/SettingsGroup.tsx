import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

interface Setting {
  title: string;
  icon?: any;
  type: 'switch' | 'action';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

interface SettingsGroupProps {
  title: string;
  icon: any;
  settings: Setting[];
}

export function SettingsGroup({ title, icon: GroupIcon, settings }: SettingsGroupProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GroupIcon size={20} color="#6B7280" />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.settingsContainer}>
        {settings.map((setting, index) => (
          <View key={index} style={styles.settingItem}>
            <View style={styles.settingContent}>
              {setting.icon && (
                <View style={styles.settingIconContainer}>
                  <setting.icon size={20} color={setting.destructive ? '#EF4444' : '#6B7280'} />
                </View>
              )}
              <Text style={[
                styles.settingTitle,
                setting.destructive && styles.destructiveText
              ]}>
                {setting.title}
              </Text>
            </View>
            
            {setting.type === 'switch' ? (
              <Switch
                value={setting.value}
                onValueChange={setting.onValueChange}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={setting.value ? '#FFFFFF' : '#FFFFFF'}
              />
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={setting.onPress}
              >
                <Text style={[
                  styles.actionText,
                  setting.destructive && styles.destructiveText
                ]}>
                  {setting.destructive ? 'Delete' : 'Open'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#374151',
  },
  destructiveText: {
    color: '#EF4444',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});