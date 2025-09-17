import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Brain, TrendingUp, Tag, Calendar, Lightbulb } from 'lucide-react-native';

interface AIInsight {
  id: string;
  type: 'trend' | 'suggestion' | 'pattern' | 'reminder';
  title: string;
  description: string;
  action?: string;
}

interface AIInsightsProps {
  insights: AIInsight[];
  loading: boolean;
}

export function AIInsights({ insights, loading }: AIInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return TrendingUp;
      case 'suggestion':
        return Lightbulb;
      case 'pattern':
        return Tag;
      case 'reminder':
        return Calendar;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return '#10B981';
      case 'suggestion':
        return '#F59E0B';
      case 'pattern':
        return '#8B5CF6';
      case 'reminder':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const renderInsight = ({ item }: { item: AIInsight }) => {
    const IconComponent = getInsightIcon(item.type);
    const color = getInsightColor(item.type);

    return (
      <TouchableOpacity style={styles.insightCard} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{item.title}</Text>
          <Text style={styles.insightDescription}>{item.description}</Text>
          {item.action && (
            <Text style={[styles.actionText, { color }]}>{item.action}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.loadingContainer}>
          {[1, 2].map((item) => (
            <View key={item} style={styles.loadingSkeleton} />
          ))}
        </View>
      </View>
    );
  }

  if (!insights.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Brain size={20} color="#8B5CF6" />
      </View>
      
      <FlatList
        data={insights}
        renderItem={renderInsight}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.insightsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  insightsList: {
    paddingHorizontal: 20,
  },
  insightCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingHorizontal: 20,
  },
  loadingSkeleton: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 12,
  },
});