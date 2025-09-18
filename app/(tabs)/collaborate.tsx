import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Share2, Plus, Search, UserPlus, Globe, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SharedNoteCard } from '../../components/SharedNoteCard';
import { CollaborationModal } from '../../components/CollaborationModal';
import { InviteModal } from '../../components/InviteModal';
import { collaborationService } from '../../services/collaborationService';

export default function CollaborateScreen() {
  const router = useRouter();
  const [sharedNotes, setSharedNotes] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTab, setActiveTab] = useState('shared'); // 'shared' or 'collaborators'

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    setLoading(true);
    try {
      const [notesData, collaboratorsData] = await Promise.all([
        collaborationService.getSharedNotes(),
        collaborationService.getCollaborators(),
      ]);
      setSharedNotes(notesData);
      setCollaborators(collaboratorsData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      Alert.alert('Error', 'Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const handleNotePress = (note) => {
    if (note.permission === 'view') {
      router.push(`/notes/${note.id}`);
    } else {
      router.push(`/notes/${note.id}/edit`);
    }
  };

  const handleShareNote = (note) => {
    setSelectedNote(note);
    setShowCollaboration(true);
  };

  const handleInviteCollaborator = () => {
    setShowInvite(true);
  };

  const handleRemoveCollaborator = async (collaboratorId, noteId) => {
    Alert.alert(
      'Remove Collaborator',
      'Are you sure you want to remove this collaborator?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await collaborationService.removeCollaborator(noteId, collaboratorId);
              await loadCollaborationData();
              Alert.alert('Success', 'Collaborator removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove collaborator');
            }
          },
        },
      ]
    );
  };

  const handleUpdatePermissions = async (noteId, collaboratorId, permission) => {
    try {
      await collaborationService.updatePermissions(noteId, collaboratorId, permission);
      await loadCollaborationData();
      Alert.alert('Success', 'Permissions updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update permissions');
    }
  };

  const filteredSharedNotes = sharedNotes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.collaborators.some(c => c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCollaborators = collaborators.filter(collaborator =>
    collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collaborator.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSharedNote = ({ item }) => (
    <SharedNoteCard
      note={item}
      onPress={() => handleNotePress(item)}
      onShare={() => handleShareNote(item)}
      onUpdatePermissions={handleUpdatePermissions}
      onRemoveCollaborator={handleRemoveCollaborator}
    />
  );

  const renderCollaborator = ({ item }) => (
    <TouchableOpacity style={styles.collaboratorItem}>
      <View style={styles.collaboratorInfo}>
        <View style={styles.collaboratorAvatar}>
          <Text style={styles.collaboratorAvatarText}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.collaboratorDetails}>
          <Text style={styles.collaboratorName}>{item.name}</Text>
          <Text style={styles.collaboratorEmail}>{item.email}</Text>
          <Text style={styles.collaboratorStats}>
            {item.shared_notes} shared notes • Last active {item.last_active}
          </Text>
        </View>
      </View>
      <View style={styles.collaboratorActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleInviteCollaborator(item)}
        >
          <Share2 size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Collaboration</Text>
        <TouchableOpacity style={styles.inviteButton} onPress={handleInviteCollaborator}>
          <UserPlus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shared notes or collaborators..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shared' && styles.activeTab]}
          onPress={() => setActiveTab('shared')}
        >
          <Share2 size={16} color={activeTab === 'shared' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'shared' && styles.activeTabText]}>
            Shared Notes ({filteredSharedNotes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'collaborators' && styles.activeTab]}
          onPress={() => setActiveTab('collaborators')}
        >
          <Users size={16} color={activeTab === 'collaborators' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'collaborators' && styles.activeTabText]}>
            Collaborators ({filteredCollaborators.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'shared' ? filteredSharedNotes : filteredCollaborators}
        renderItem={activeTab === 'shared' ? renderSharedNote : renderCollaborator}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadCollaborationData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {activeTab === 'shared' ? (
              <>
                <Share2 size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No shared notes</Text>
                <Text style={styles.emptySubtext}>
                  Start collaborating by sharing your notes with others
                </Text>
              </>
            ) : (
              <>
                <Users size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No collaborators</Text>
                <Text style={styles.emptySubtext}>
                  Invite others to collaborate on your notes
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Collaboration Modal */}
      <CollaborationModal
        visible={showCollaboration}
        note={selectedNote}
        onClose={() => setShowCollaboration(false)}
        onUpdate={loadCollaborationData}
      />

      {/* Invite Modal */}
      <InviteModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={loadCollaborationData}
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
  inviteButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#3B82F6',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  collaboratorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collaboratorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  collaboratorAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  collaboratorDetails: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  collaboratorEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  collaboratorStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  collaboratorActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
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