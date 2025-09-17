import { supabase } from './supabaseClient';

class VoiceService {
  async transcribeAudio(audioUri: string): Promise<{ text: string; confidence: number }> {
    try {
      // Create form data for audio upload
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      // Call Supabase edge function for transcription
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (error) throw error;

      return {
        text: data.text || 'Unable to transcribe audio',
        confidence: data.confidence || 0.5,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      // Fallback mock transcription for development
      return {
        text: 'This is a mock transcription. Voice transcription would work with proper API setup.',
        confidence: 0.8,
      };
    }
  }

  async generateSummary(text: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-summary', {
        body: { text, type: 'summary' },
      });

      if (error) throw error;
      return data.summary || '';
    } catch (error) {
      console.error('Summary generation error:', error);
      // Fallback mock summary
      return text.length > 100 
        ? `Summary: ${text.substring(0, 100)}...`
        : text;
    }
  }

  async extractKeywords(text: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-keywords', {
        body: { text },
      });

      if (error) throw error;
      return data.keywords || [];
    } catch (error) {
      console.error('Keyword extraction error:', error);
      // Fallback mock keywords
      const words = text.split(' ');
      return words
        .filter(word => word.length > 4)
        .slice(0, 5)
        .map(word => word.toLowerCase().replace(/[^\w]/g, ''));
    }
  }

  async generateActionItems(text: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-actions', {
        body: { text },
      });

      if (error) throw error;
      return data.actions || [];
    } catch (error) {
      console.error('Action items error:', error);
      // Mock action items
      const actionKeywords = ['need to', 'should', 'must', 'remember to', 'todo'];
      const sentences = text.split('.');
      
      return sentences
        .filter(sentence => 
          actionKeywords.some(keyword => 
            sentence.toLowerCase().includes(keyword)
          )
        )
        .map(sentence => sentence.trim())
        .slice(0, 3);
    }
  }
}

export const voiceService = new VoiceService();