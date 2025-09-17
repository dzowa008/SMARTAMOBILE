import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText, Clock, Brain, TrendingUp } from 'lucide-react-native';

interface DashboardStatsProps {
  stats: {
    totalNotes: number;
    wordsWritten: number;
    timeSpent: number;
    aiSummaries: number;
  };
  loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
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
      color: '#8B5CF6',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((item) => (
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
      <Text style={styles.sectionTitle}>Your Stats</Text>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
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
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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