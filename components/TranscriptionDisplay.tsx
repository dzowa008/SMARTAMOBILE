import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { FileText, Brain, Tag, Lightbulb } from 'lucide-react-native';

interface TranscriptionDisplayProps {
  transcription: string;
  isProcessing: boolean;
  aiSummary: string;
  keywords: string[];
}

export function TranscriptionDisplay({ 
  transcription, 
  isProcessing, 
  aiSummary, 
  keywords 
}: TranscriptionDisplayProps) {
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.processingText}>Processing with AI...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Transcription */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Transcription</Text>
        </View>
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      </View>

      {/* AI Summary */}
      {aiSummary && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>AI Summary</Text>
          </View>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{aiSummary}</Text>
          </View>
        </View>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Keywords</Text>
          </View>
          <View style={styles.keywordsContainer}>
            {keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordTag}>
                <Text style={styles.keywordText}>#{keyword}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  transcriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  summaryContainer: {
    backgroundColor: '#F8F4FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  summaryText: {
    fontSize: 15,
    color: '#5B21B6',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  keywordText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
});