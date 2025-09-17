import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { X, Share2, UserPlus, Mail } from 'lucide-react-native';
import { collaborationService } from '@/services/collaborationService';

interface CollaborationModalProps {
  visible: boolean;
  note: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function CollaborationModal({ visible, note, onClose, onUpdate }: CollaborationModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await collaborationService.shareNote(note?.id, email, permission);
      Alert.alert('Success', 'Note shared successfully');
      setEmail('');
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Share Note</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.noteTitle}>{note?.title}</Text>
            
            <View style={styles.inputContainer}>
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.permissionContainer}>
              <Text style={styles.permissionLabel}>Permission:</Text>
              <View style={styles.permissionButtons}>
                <TouchableOpacity
                  style={[styles.permissionButton, permission === 'view' && styles.activePermission]}
                  onPress={() => setPermission('view')}
                >
                  <Text style={[styles.permissionText, permission === 'view' && styles.activePermissionText]}>
                    View Only
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.permissionButton, permission === 'edit' && styles.activePermission]}
                  onPress={() => setPermission('edit')}
                >
                  <Text style={[styles.permissionText, permission === 'edit' && styles.activePermissionText]}>
                    Can Edit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.shareButton, loading && styles.disabledButton]}
              onPress={handleShare}
              disabled={loading}
            >
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>
                {loading ? 'Sharing...' : 'Share Note'}
              </Text>
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
    paddingBottom: 40,
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
    padding: 20,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  permissionContainer: {
    marginBottom: 24,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  permissionButtons: {
    flexDirection: 'row',
  },
  permissionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
  },
  activePermission: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  permissionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activePermissionText: {
    color: '#FFFFFF',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});