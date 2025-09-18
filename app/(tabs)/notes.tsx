import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Filter, Grid, List, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { NoteCard } from '../components/NoteCard';
import { FilterModal } from '../components/FilterModal';
import { notesService } from '../services/notesService';

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    folders: [],
    dateRange: null,
    sortBy: 'modified',
  });

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, filters]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = await notesService.getAllNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = async () => {
    try {
      let filtered = [...notes];

      // Apply search query
      if (searchQuery.trim()) {
        filtered = await notesService.searchNotes(searchQuery, notes);
      }

      // Apply filters
      if (filters.tags.length > 0) {
        filtered = filtered.filter(note => 
          note.tags?.some(tag => filters.tags.includes(tag))
        );
      }

      if (filters.folders.length > 0) {
        filtered = filtered.filter(note => 
          filters.folders.includes(note.folder)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'created':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'modified':
          default:
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
      });

      setFilteredNotes(filtered);
    } catch (error) {
      console.error('Error filtering notes:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleNotePress = (noteId) => {
    router.push(`/notes/${noteId}`);
  };

  const handleNoteOptions = (noteId) => {
    // Show options modal for note actions
    Alert.alert(
      'Note Options',
      'Choose an action',
      [
        { text: 'Edit', onPress: () => router.push(`/notes/${noteId}/edit`) },
        { text: 'Share', onPress: () => handleShareNote(noteId) },
        { text: 'Delete', onPress: () => handleDeleteNote(noteId), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShareNote = async (noteId) => {
    try {
      await notesService.shareNote(noteId);
      Alert.alert('Success', 'Note shared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesService.deleteNote(noteId);
      await loadNotes();
      Alert.alert('Success', 'Note deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const renderNote = ({ item }) => (
    <NoteCard
      note={item}
      viewMode={viewMode}
      onPress={() => handleNotePress(item.id)}
      onOptions={() => handleNoteOptions(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={24} color="#6B7280" /> : <Grid size={24} color="#6B7280" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/notes/new')}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.notesContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No notes found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search terms' : 'Tap + to create your first note'}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilter(false)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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