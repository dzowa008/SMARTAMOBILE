import { supabase } from './supabaseClient';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  folder?: string;
  tags?: string[];
  summary?: string;
  keywords?: string[];
  audio_uri?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

class NotesService {
  async createNote(noteData: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAllNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRecentNotes(limit: number = 10): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getNoteById(id: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async searchNotes(query: string, notes?: Note[]): Promise<Note[]> {
    if (notes) {
      // Client-side search for filtering
      return notes.filter(note =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Server-side search
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserStats(): Promise<any> {
    // Get total notes count
    const { count: totalNotes } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    // Get total word count (simplified)
    const { data: notes } = await supabase
      .from('notes')
      .select('content');

    const wordsWritten = notes?.reduce((total, note) => {
      return total + (note.content?.split(' ').length || 0);
    }, 0) || 0;

    // Mock other stats for now
    return {
      totalNotes: totalNotes || 0,
      wordsWritten,
      timeSpent: Math.floor(wordsWritten * 0.5), // Estimate based on words
      aiSummaries: Math.floor((totalNotes || 0) * 0.3), // Estimate
    };
  }

  async getAIInsights(): Promise<any[]> {
    // Mock AI insights for now
    return [
      {
        id: '1',
        type: 'trend',
        title: 'Writing Streak',
        description: "You've been consistently taking notes for 7 days!",
        action: 'Keep it up!',
      },
      {
        id: '2',
        type: 'suggestion',
        title: 'Tag Suggestion',
        description: 'Consider using #productivity tag for work-related notes',
        action: 'Auto-tag similar notes',
      },
    ];
  }

  async shareNote(noteId: string): Promise<string> {
    // Generate share link (simplified)
    const shareId = Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('shared_notes')
      .insert([{
        note_id: noteId,
        share_id: shareId,
        permissions: 'view',
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
    
    return `https://app.smartnotes.ai/shared/${shareId}`;
  }
}

export const notesService = new NotesService();