import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Brain, Filter, Clock, Hash, Folder } from 'lucide-react-native';
import { SearchResults } from '../../components/SearchResults';
import { SearchFilters } from '../../components/SearchFilters';
import { SemanticSearch } from '../../components/SemanticSearch';
import { searchService } from '../../services/searchService';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' or 'keyword'
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    tags: [],
    dateRange: null,
    hasAudio: false,
    hasImages: false,
  });

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
    }
  }, [query, searchMode, filters]);

  const loadRecentSearches = async () => {
    try {
      const recent = await searchService.getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      let searchResults;
      
      if (searchMode === 'semantic') {
        searchResults = await searchService.semanticSearch(query, filters);
      } else {
        searchResults = await searchService.keywordSearch(query, filters);
      }

      setResults(searchResults);
      await searchService.saveRecentSearch(query, searchMode);
      await loadRecentSearches();
    } catch (error) {
      console.error('Error performing search:', error);
      Alert.alert('Error', 'Failed to search notes');
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearchPress = (search) => {
    setQuery(search.query);
    setSearchMode(search.mode);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const clearRecentSearches = async () => {
    try {
      await searchService.clearRecentSearches();
      setRecentSearches([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear recent searches');
    }
  };

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Clock size={16} color="#9CA3AF" />
      <Text style={styles.recentSearchText}>{item.query}</Text>
      <View style={[styles.searchModeIndicator, 
        { backgroundColor: item.mode === 'semantic' ? '#8B5CF6' : '#3B82F6' }
      ]}>
        <Text style={styles.searchModeText}>
          {item.mode === 'semantic' ? 'AI' : 'KW'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Notes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your thoughts..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          {query && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Mode Toggle */}
      <View style={styles.searchModeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, searchMode === 'semantic' && styles.activeModeButton]}
          onPress={() => setSearchMode('semantic')}
        >
          <Brain size={16} color={searchMode === 'semantic' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.modeButtonText, searchMode === 'semantic' && styles.activeModeText]}>
            AI Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, searchMode === 'keyword' && styles.activeModeButton]}
          onPress={() => setSearchMode('keyword')}
        >
          <Hash size={16} color={searchMode === 'keyword' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.modeButtonText, searchMode === 'keyword' && styles.activeModeText]}>
            Keywords
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {query.trim() ? (
        <SearchResults
          results={results}
          loading={loading}
          searchMode={searchMode}
          query={query}
        />
      ) : (
        <View style={styles.emptyState}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearRecentText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentSearches.slice(0, 10)}
                renderItem={renderRecentSearch}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Search Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Search Tips</Text>
            <View style={styles.tip}>
              <Brain size={20} color="#8B5CF6" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>AI Search</Text>
                <Text style={styles.tipDescription}>
                  Find notes by meaning, not just exact words
                </Text>
              </View>
            </View>
            <View style={styles.tip}>
              <Hash size={20} color="#3B82F6" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Keyword Search</Text>
                <Text style={styles.tipDescription}>
                  Search for specific words and phrases
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Search Filters Modal */}
      <SearchFilters
        visible={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  clearButton: {
    fontSize: 18,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  searchModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeModeButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recentSection: {
    marginBottom: 32,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearRecentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  searchModeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsSection: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});