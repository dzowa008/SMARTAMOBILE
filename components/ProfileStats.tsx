import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText, Clock, Brain, Users, Mic, TrendingUp } from 'lucide-react-native';

interface ProfileStatsProps {
  stats: {
    totalNotes: number;
    wordsWritten: number;
    timeSpent: number;
    aiSummaries: number;
    voiceNotes: number;
    collaborations: number;
  };
  loading: boolean;
}

export function ProfileStats({ stats, loading }: ProfileStatsProps) {
  const statItems = [
    {
      id: 'notes',
      icon: FileText,
      value: stats.totalNotes || 0,
      label: 'Total Notes',
      color: '#3B82F6',
    },
    {
      id: 'words',
      icon: TrendingUp,
      value: stats.wordsWritten || 0,
      label: 'Words Written',
      color: '#10B981',
    },
    {
      id: 'voice',
      icon: Mic,
      value: stats.voiceNotes || 0,
      label: 'Voice Notes',
      color: '#8B5CF6',
    },
    {
      id: 'time',
      icon: Clock,
      value: `${Math.floor((stats.timeSpent || 0) / 60)}h`,
      label: 'Time Spent',
      color: '#F59E0B',
    },
    {
      id: 'ai',
      icon: Brain,
      value: stats.aiSummaries || 0,
      label: 'AI Summaries',
      color: '#EF4444',
    },
    {
      id: 'collab',
      icon: Users,
      value: stats.collaborations || 0,
      label: 'Collaborations',
      color: '#06B6D4',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={styles.statCard}>
              <View style={styles.loadingSkeleton} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        {statItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <View key={item.id} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <IconComponent size={20} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingSkeleton: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});