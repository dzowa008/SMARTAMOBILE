import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Users, Share2, MoveVertical as MoreVertical, Eye, CreditCard as Edit, Shield } from 'lucide-react-native';
import { format } from 'date-fns';

interface SharedNoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    owner: {
      name: string;
      email: string;
    };
    collaborators: Array<{
      id: string;
      name: string;
      permission: 'view' | 'edit' | 'admin';
    }>;
    permission: 'view' | 'edit' | 'admin';
    updated_at: string;
  };
  onPress: () => void;
  onShare: () => void;
  onUpdatePermissions: (noteId: string, collaboratorId: string, permission: string) => void;
  onRemoveCollaborator: (collaboratorId: string, noteId: string) => void;
}

export function SharedNoteCard({ 
  note, 
  onPress, 
  onShare, 
  onUpdatePermissions, 
  onRemoveCollaborator 
}: SharedNoteCardProps) {
  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin':
        return Shield;
      case 'edit':
        return Edit;
      default:
        return Eye;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin':
        return '#EF4444';
      case 'edit':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const PermissionIcon = getPermissionIcon(note.permission);
  const permissionColor = getPermissionColor(note.permission);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FileText size={20} color="#3B82F6" />
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
        </View>
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Share2 size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content} numberOfLines={2}>
        {note.content}
      </Text>

      <View style={styles.ownerInfo}>
        <Text style={styles.ownerLabel}>Owner:</Text>
        <Text style={styles.ownerName}>{note.owner.name}</Text>
      </View>

      <View style={styles.collaboratorsSection}>
        <View style={styles.collaboratorsHeader}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.collaboratorsLabel}>
            {note.collaborators.length} collaborator{note.collaborators.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {note.collaborators.slice(0, 3).map((collaborator) => {
          const CollabIcon = getPermissionIcon(collaborator.permission);
          const collabColor = getPermissionColor(collaborator.permission);
          
          return (
            <View key={collaborator.id} style={styles.collaboratorItem}>
              <View style={styles.collaboratorInfo}>
                <View style={styles.collaboratorAvatar}>
                  <Text style={styles.collaboratorAvatarText}>
                    {collaborator.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <Text style={styles.collaboratorName}>{collaborator.name}</Text>
              </View>
              <View style={styles.permissionIndicator}>
                <CollabIcon size={12} color={collabColor} />
              </View>
            </View>
          );
        })}
        
        {note.collaborators.length > 3 && (
          <Text style={styles.moreCollaborators}>
            +{note.collaborators.length - 3} more
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.permissionBadge}>
          <PermissionIcon size={12} color={permissionColor} />
          <Text style={[styles.permissionText, { color: permissionColor }]}>
            {note.permission}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {format(new Date(note.updated_at), 'MMM d, yyyy')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 6,
  },
  ownerName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  collaboratorsSection: {
    marginBottom: 12,
  },
  collaboratorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collaboratorsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collaboratorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  collaboratorAvatarText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  collaboratorName: {
    fontSize: 12,
    color: '#374151',
  },
  permissionIndicator: {
    padding: 2,
  },
  moreCollaborators: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});