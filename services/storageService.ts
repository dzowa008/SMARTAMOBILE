import { supabase } from './supabaseClient';
import * as DocumentPicker from 'expo-document-picker';

class StorageService {
  async exportUserData(format: 'json' | 'pdf'): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: { format },
      });

      if (error) throw error;
      return data.downloadUrl;
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export data');
    }
  }

  async importUserData(): Promise<void> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      const { error } = await supabase.functions.invoke('import-data', {
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Import error:', error);
      throw new Error('Failed to import data');
    }
  }

  async syncOfflineData(): Promise<void> {
    try {
      // Get offline data from local storage
      // Sync with Supabase
      const { error } = await supabase.functions.invoke('sync-offline-data', {
        body: { timestamp: new Date().toISOString() },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  async uploadAudio(audioUri: string, noteId: string): Promise<string> {
    try {
      const response = await fetch(audioUri);
      const blob = await response.blob();

      const fileName = `${noteId}/audio_${Date.now()}.m4a`;
      
      const { data, error } = await supabase.storage
        .from('audio-files')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  }

  async uploadImage(imageUri: string, noteId: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const fileName = `${noteId}/image_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, blob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();