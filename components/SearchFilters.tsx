import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Filter, Calendar, Tag, FileText, Mic, Camera } from 'lucide-react-native';

interface SearchFiltersProps {
  visible: boolean;
  filters: {
    types: string[];
    tags: string[];
    dateRange: any;
    hasAudio: boolean;
    hasImages: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function SearchFilters({ visible, filters, onFiltersChange, onClose }: SearchFiltersProps) {
  const noteTypes = [
    { value: 'text', label: 'Text Notes', icon: FileText },
    { value: 'voice', label: 'Voice Notes', icon: Mic },
    { value: 'image', label: 'Image Notes', icon: Camera },
  ];

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const clearFilters = () => {
    onFiltersChange({
      types: [],
      tags: [],
      dateRange: null,
      hasAudio: false,
      hasImages: false,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Search Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note Types</Text>
              {noteTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = filters.types.includes(type.value);
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.filterItem, isSelected && styles.selectedItem]}
                    onPress={() => toggleType(type.value)}
                  >
                    <IconComponent size={20} color={isSelected ? '#3B82F6' : '#6B7280'} />
                    <Text style={[styles.filterText, isSelected && styles.selectedText]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content Filters</Text>
              <TouchableOpacity
                style={[styles.filterItem, filters.hasAudio && styles.selectedItem]}
                onPress={() => onFiltersChange({ ...filters, hasAudio: !filters.hasAudio })}
              >
                <Mic size={20} color={filters.hasAudio ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.filterText, filters.hasAudio && styles.selectedText]}>
                  Has Audio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterItem, filters.hasImages && styles.selectedItem]}
                onPress={() => onFiltersChange({ ...filters, hasImages: !filters.hasImages })}
              >
                <Camera size={20} color={filters.hasImages ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.filterText, filters.hasImages && styles.selectedText]}>
                  Has Images
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedItem: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  selectedText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});