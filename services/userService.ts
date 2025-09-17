import { supabase } from './supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalNotes: number;
  wordsWritten: number;
  timeSpent: number;
  aiSummaries: number;
  voiceNotes: number;
  collaborations: number;
}

interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  autoSync: boolean;
  voiceTranscription: boolean;
  aiSuggestions: boolean;
  offlineMode: boolean;
}

class UserService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in users table, create one
          return this.createUserProfile(authUser);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async createUserProfile(authUser: any): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get notes count
      const { count: totalNotes } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get voice notes count
      const { count: voiceNotes } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'voice');

      // Get collaborations count
      const { count: collaborations } = await supabase
        .from('note_collaborators')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get content for word count
      const { data: notes } = await supabase
        .from('notes')
        .select('content')
        .eq('user_id', user.id);

      const wordsWritten = notes?.reduce((total, note) => {
        return total + (note.content?.split(' ').length || 0);
      }, 0) || 0;

      return {
        totalNotes: totalNotes || 0,
        wordsWritten,
        timeSpent: Math.floor(wordsWritten * 0.5), // Estimate
        aiSummaries: Math.floor((totalNotes || 0) * 0.4), // Estimate
        voiceNotes: voiceNotes || 0,
        collaborations: collaborations || 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalNotes: 0,
        wordsWritten: 0,
        timeSpent: 0,
        aiSummaries: 0,
        voiceNotes: 0,
        collaborations: 0,
      };
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Settings not found, create default
          return this.createDefaultSettings();
        }
        throw error;
      }

      return {
        darkMode: data.dark_mode || false,
        notifications: data.notifications ?? true,
        autoSync: data.auto_sync ?? true,
        voiceTranscription: data.voice_transcription ?? true,
        aiSuggestions: data.ai_suggestions ?? true,
        offlineMode: data.offline_mode || false,
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: UserSettings): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert([{
        user_id: user.id,
        dark_mode: settings.darkMode,
        notifications: settings.notifications,
        auto_sync: settings.autoSync,
        voice_transcription: settings.voiceTranscription,
        ai_suggestions: settings.aiSuggestions,
        offline_mode: settings.offlineMode,
        updated_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  private async createDefaultSettings(): Promise<UserSettings> {
    const defaultSettings = this.getDefaultSettings();
    await this.updateSettings(defaultSettings);
    return defaultSettings;
  }

  private getDefaultSettings(): UserSettings {
    return {
      darkMode: false,
      notifications: true,
      autoSync: true,
      voiceTranscription: true,
      aiSuggestions: true,
      offlineMode: false,
    };
  }

  async deleteAllUserData(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete in correct order to avoid foreign key constraints
    await Promise.all([
      supabase.from('note_collaborators').delete().eq('user_id', user.id),
      supabase.from('recent_searches').delete().eq('user_id', user.id),
      supabase.from('user_settings').delete().eq('user_id', user.id),
    ]);

    await supabase.from('notes').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('id', user.id);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const userService = new UserService();