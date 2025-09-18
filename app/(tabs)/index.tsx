import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Mic, Brain, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DashboardStats } from '../../components/DashboardStats';
import { RecentNotes } from '../../components/RecentNotes';
import { QuickActions } from '../../components/QuickActions';
import { AIInsights } from '../../components/AIInsights';
import { notesService } from '../../services/notesService';

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalNotes: 0,
    wordsWritten: 0,
    timeSpent: 0,
    aiSummaries: 0,
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [notesData, statsData, insights] = await Promise.all([
        notesService.getRecentNotes(5),
        notesService.getUserStats(),
        notesService.getAIInsights(),
      ]);
      
      setRecentNotes(notesData);
      setStats(statsData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'new-note',
      title: 'New Note',
      icon: Plus,
      color: '#3B82F6',
      onPress: () => router.push('/notes/new'),
    },
    {
      id: 'voice-note',
      title: 'Voice Note',
      icon: Mic,
      color: '#8B5CF6',
      onPress: () => router.push('/voice'),
    },
    {
      id: 'ai-summary',
      title: 'AI Summary',
      icon: Brain,
      color: '#10B981',
      onPress: () => router.push('/ai-summary'),
    },
    {
      id: 'reminders',
      title: 'Reminders',
      icon: Calendar,
      color: '#F59E0B',
      onPress: () => router.push('/reminders'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Ready to capture your thoughts?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileText}>JD</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Dashboard Stats */}
        <DashboardStats stats={stats} loading={loading} />

        {/* AI Insights */}
        <AIInsights insights={aiInsights} loading={loading} />

        {/* Recent Notes */}
        <RecentNotes notes={recentNotes} loading={loading} onRefresh={loadDashboardData} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});