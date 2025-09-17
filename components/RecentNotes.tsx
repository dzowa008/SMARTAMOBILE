import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FileText, Clock, Mic, Camera } from 'lucide-react-native';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  updated_at: string;
  tags?: string[];
}

interface RecentNotesProps {
  notes: Note[];
  loading: boolean;
  onRefresh: () => void;
}

export function RecentNotes({ notes, loading, onRefresh }: RecentNotesProps) {
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

  const renderNote = ({ item }: { item: Note }) => {
    const IconComponent = getTypeIcon(item.type);
    const typeColor = getTypeColor(item.type);

    return (
      <TouchableOpacity style={styles.noteCard} activeOpacity={0.7}>
        <View style={styles.noteHeader}>
          <View style={[styles.typeIndicator, { backgroundColor: `${typeColor}20` }]}>
            <IconComponent size={16} color={typeColor} />
          </View>
          <Text style={styles.dateText}>
            {format(new Date(item.updated_at), 'MMM d')}
          </Text>
        </View>
        <Text style={styles.noteTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.notePreview} numberOfLines={3}>
          {item.content}
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Notes</Text>
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.loadingSkeleton} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Notes</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.notesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FileText size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No recent notes</Text>
          <Text style={styles.emptySubtext}>Start creating notes to see them here</Text>
        </View>
      )}
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
  refreshText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  notesList: {
    paddingHorizontal: 20,
  },
  noteCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    paddingHorizontal: 20,
  },
  loadingSkeleton: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});