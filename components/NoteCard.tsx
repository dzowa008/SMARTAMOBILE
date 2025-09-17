import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Mic, Camera, MoveVertical as MoreVertical } from 'lucide-react-native';
import { format } from 'date-fns';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'voice' | 'image';
    updated_at: string;
    tags?: string[];
  };
  viewMode: 'grid' | 'list';
  onPress: () => void;
  onOptions: () => void;
}

export function NoteCard({ note, viewMode, onPress, onOptions }: NoteCardProps) {
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

  const IconComponent = getTypeIcon(note.type);
  const typeColor = getTypeColor(note.type);

  if (viewMode === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <View style={[styles.typeIndicator, { backgroundColor: `${typeColor}20` }]}>
              <IconComponent size={16} color={typeColor} />
            </View>
            <Text style={styles.listTitle} numberOfLines={1}>
              {note.title}
            </Text>
            <TouchableOpacity onPress={onOptions} style={styles.optionsButton}>
              <MoreVertical size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.listPreview} numberOfLines={2}>
            {note.content}
          </Text>
          <View style={styles.listFooter}>
            <Text style={styles.dateText}>
              {format(new Date(note.updated_at), 'MMM d, yyyy')}
            </Text>
            {note.tags && note.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {note.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.gridHeader}>
        <View style={[styles.typeIndicator, { backgroundColor: `${typeColor}20` }]}>
          <IconComponent size={16} color={typeColor} />
        </View>
        <TouchableOpacity onPress={onOptions} style={styles.optionsButton}>
          <MoreVertical size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.gridTitle} numberOfLines={2}>
        {note.title}
      </Text>
      <Text style={styles.gridPreview} numberOfLines={3}>
        {note.content}
      </Text>
      <View style={styles.gridFooter}>
        <Text style={styles.dateText}>
          {format(new Date(note.updated_at), 'MMM d')}
        </Text>
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, 1).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {note.tags.length > 1 && (
              <Text style={styles.moreTagsText}>+{note.tags.length - 1}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listContent: {
    flex: 1,
  },
  typeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsButton: {
    padding: 4,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  listTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  gridPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  listPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});