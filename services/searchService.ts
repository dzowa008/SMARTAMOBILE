import { supabase } from './supabaseClient';
import { Note } from './notesService';

interface SearchFilters {
  types: string[];
  tags: string[];
  dateRange: { start: Date; end: Date } | null;
  hasAudio: boolean;
  hasImages: boolean;
}

interface RecentSearch {
  id: string;
  query: string;
  mode: 'semantic' | 'keyword';
  timestamp: string;
}

class SearchService {
  async semanticSearch(query: string, filters: SearchFilters): Promise<Note[]> {
    try {
      // Call AI-powered semantic search
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { 
          query, 
          filters,
          embedding: true // Use vector embeddings
        },
      });

      if (error) throw error;
      return data.results || [];
    } catch (error) {
      console.error('Semantic search error:', error);
      // Fallback to keyword search
      return this.keywordSearch(query, filters);
    }
  }

  async keywordSearch(query: string, filters: SearchFilters): Promise<Note[]> {
    let searchQuery = supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

    // Apply filters
    if (filters.types.length > 0) {
      searchQuery = searchQuery.in('type', filters.types);
    }

    if (filters.hasAudio) {
      searchQuery = searchQuery.not('audio_uri', 'is', null);
    }

    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    const { data, error } = await searchQuery
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    let results = data || [];

    // Client-side tag filtering
    if (filters.tags.length > 0) {
      results = results.filter(note =>
        note.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    return results;
  }

  async saveRecentSearch(query: string, mode: 'semantic' | 'keyword'): Promise<void> {
    try {
      const { error } = await supabase
        .from('recent_searches')
        .insert([{
          query,
          mode,
          timestamp: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }

  async getRecentSearches(): Promise<RecentSearch[]> {
    try {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading recent searches:', error);
      return [];
    }
  }

  async clearRecentSearches(): Promise<void> {
    const { error } = await supabase
      .from('recent_searches')
      .delete()
      .neq('id', ''); // Delete all

    if (error) throw error;
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-suggestions', {
        body: { query },
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();