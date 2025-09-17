import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react-native';

interface SemanticSearchProps {
  onSuggestionPress: (suggestion: string) => void;
}

export function SemanticSearch({ onSuggestionPress }: SemanticSearchProps) {
  const suggestions = [
    {
      id: '1',
      text: 'Find notes about productivity tips',
      icon: TrendingUp,
      color: '#10B981',
    },
    {
      id: '2',
      text: 'Show me meeting notes from last week',
      icon: Brain,
      color: '#8B5CF6',
    },
    {
      id: '3',
      text: 'Ideas for weekend projects',
      icon: Lightbulb,
      color: '#F59E0B',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Try AI-powered search</Text>
      <Text style={styles.subtitle}>
        Search by meaning, not just keywords
      </Text>
      
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;
          return (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionCard}
              onPress={() => onSuggestionPress(suggestion.text)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${suggestion.color}20` }]}>
                <IconComponent size={20} color={suggestion.color} />
              </View>
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
});