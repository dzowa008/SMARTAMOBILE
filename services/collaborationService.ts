import { supabase } from './supabaseClient';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    permission: 'view' | 'edit' | 'admin';
  }>;
  permission: 'view' | 'edit' | 'admin';
  updated_at: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  shared_notes: number;
  last_active: string;
}

class CollaborationService {
  async getSharedNotes(): Promise<SharedNote[]> {
    try {
      const { data, error } = await supabase
        .from('note_collaborators')
        .select(`
          permission,
          notes (
            id,
            title,
            content,
            updated_at,
            user_id,
            users (name, email)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.notes.id,
        title: item.notes.title,
        content: item.notes.content,
        owner: {
          id: item.notes.user_id,
          name: item.notes.users.name,
          email: item.notes.users.email,
        },
        collaborators: [], // Will be populated separately
        permission: item.permission,
        updated_at: item.notes.updated_at,
      }));
    } catch (error) {
      console.error('Error loading shared notes:', error);
      return [];
    }
  }

  async getCollaborators(): Promise<Collaborator[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          last_active,
          note_collaborators (count)
        `)
        .neq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      return (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        shared_notes: user.note_collaborators?.length || 0,
        last_active: user.last_active || 'Never',
      }));
    } catch (error) {
      console.error('Error loading collaborators:', error);
      return [];
    }
  }

  async inviteCollaborator(email: string, noteId?: string, permission: 'view' | 'edit' = 'view'): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('invite-collaborator', {
        body: {
          email,
          noteId,
          permission,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  }

  async shareNote(noteId: string, email: string, permission: 'view' | 'edit' = 'view'): Promise<void> {
    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        // Invite new user
        await this.inviteCollaborator(email, noteId, permission);
        return;
      }

      // Add to note_collaborators
      const { error } = await supabase
        .from('note_collaborators')
        .insert([{
          note_id: noteId,
          user_id: userData.id,
          permission,
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sharing note:', error);
      throw error;
    }
  }

  async updatePermissions(noteId: string, userId: string, permission: 'view' | 'edit' | 'admin'): Promise<void> {
    const { error } = await supabase
      .from('note_collaborators')
      .update({ permission })
      .eq('note_id', noteId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async removeCollaborator(noteId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('note_collaborators')
      .delete()
      .eq('note_id', noteId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getRealtimeUpdates(noteId: string, callback: (update: any) => void): Promise<() => void> {
    const channel = supabase
      .channel(`note-${noteId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes',
          filter: `id=eq.${noteId}`
        }, 
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async saveRealtimeEdit(noteId: string, content: string, cursor: number): Promise<void> {
    try {
      await supabase.functions.invoke('realtime-edit', {
        body: {
          noteId,
          content,
          cursor,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error saving realtime edit:', error);
    }
  }
}

export const collaborationService = new CollaborationService();