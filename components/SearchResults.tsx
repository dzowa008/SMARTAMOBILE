import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileText, Mic, Camera, Brain, Hash } from 'lucide-react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  updated_at: string;
  relevance?: number;
  highlights?: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  searchMode: 'semantic' | 'keyword';
  query: string;
}

export function SearchResults({ results, loading, searchMode, query }: SearchResultsProps) {
  const router = useRouter();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return Mic;
      case 'image':
        return Camera;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'voice':
        return '#8B5CF6';
      case 'image':
        return '#10B981';
      default:
        return '#3B82F6';
    }
  };

  const handleResultPress = (result: SearchResult) => {
    router.push(`/notes/${result.id}`);
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const IconComponent = getTypeIcon(item.type);
    const typeColor = getTypeColor(item.type);

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultHeader}>
          <View style={[styles.typeIndicator, { backgroundColor: `${typeColor}20` }]}>
            <IconComponent size={16} color={typeColor} />
          </View>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {searchMode === 'semantic' && item.relevance && (
            <View style={styles.relevanceIndicator}>
              <Text style={styles.relevanceText}>
                {Math.round(item.relevance * 100)}%
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.resultContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        {item.highlights && item.highlights.length > 0 && (
          <View style={styles.highlightsContainer}>
            {item.highlights.slice(0, 2).map((highlight, index) => (
              <Text key={index} style={styles.highlight}>
                ...{highlight}...
              </Text>
            ))}
          </View>
        )}
        
        <View style={styles.resultFooter}>
          <Text style={styles.dateText}>
            {format(new Date(item.updated_at), 'MMM d, yyyy')}
          </Text>
          <View style={styles.searchModeIndicator}>
            {searchMode === 'semantic' ? (
              <Brain size={12} color="#8B5CF6" />
            ) : (
              <Hash size={12} color="#3B82F6" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          {searchMode === 'semantic' ? 'AI is searching...' : 'Searching...'}
        </Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FileText size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>No results found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your search terms or filters
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </Text>
        <View style={styles.searchModeLabel}>
          {searchMode === 'semantic' ? (
            <>
              <Brain size={14} color="#8B5CF6" />
              <Text style={styles.searchModeText}>AI Search</Text>
            </>
          ) : (
            <>
              <Hash size={14} color="#3B82F6" />
              <Text style={styles.searchModeText}>Keyword</Text>
            </>
          )}
        </View>
      </View>
      
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchModeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchModeText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  resultsList: {
    paddingBottom: 100,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  relevanceIndicator: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  relevanceText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  resultContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  highlightsContainer: {
    marginBottom: 12,
  },
  highlight: {
    fontSize: 13,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchModeIndicator: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});