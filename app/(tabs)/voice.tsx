import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, Play, Pause, Save, Brain, AudioWaveform as Waveform } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { AIProcessingModal } from '@/components/AIProcessingModal';
import { voiceService } from '@/services/voiceService';
import { notesService } from '@/services/notesService';

export default function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone access to record voice notes');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      setTranscription('');
      setAiSummary('');
      setKeywords([]);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);

      // Process the audio
      await processAudio(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const processAudio = async (audioUri) => {
    setIsProcessing(true);
    try {
      // Transcribe audio
      const transcriptionResult = await voiceService.transcribeAudio(audioUri);
      setTranscription(transcriptionResult.text);

      // Generate AI summary and keywords
      const aiResults = await Promise.all([
        voiceService.generateSummary(transcriptionResult.text),
        voiceService.extractKeywords(transcriptionResult.text),
      ]);

      setAiSummary(aiResults[0]);
      setKeywords(aiResults[1]);
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Error', 'Failed to process audio recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
        setSound(newSound);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        await newSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const saveNote = async () => {
    if (!transcription.trim()) {
      Alert.alert('No content', 'Please record some audio first');
      return;
    }

    try {
      const noteData = {
        title: `Voice Note - ${new Date().toLocaleDateString()}`,
        content: transcription,
        summary: aiSummary,
        keywords: keywords,
        type: 'voice',
        audio_uri: audioUri,
        created_at: new Date().toISOString(),
      };

      await notesService.createNote(noteData);
      Alert.alert('Success', 'Voice note saved successfully');
      
      // Reset form
      setTranscription('');
      setAiSummary('');
      setKeywords([]);
      setAudioUri(null);
      setRecordingDuration(0);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Voice Notes</Text>
          <Text style={styles.subtitle}>Tap to record, AI will transcribe and organize</Text>
        </View>

        {/* Recording Controls */}
        <View style={styles.recordingContainer}>
          <VoiceRecorder
            isRecording={isRecording}
            duration={recordingDuration}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />

          {/* Playback Controls */}
          {audioUri && (
            <View style={styles.playbackContainer}>
              <TouchableOpacity style={styles.playButton} onPress={playRecording}>
                {isPlaying ? <Pause size={24} color="#FFFFFF" /> : <Play size={24} color="#FFFFFF" />}
              </TouchableOpacity>
              <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
            </View>
          )}
        </View>

        {/* Transcription Display */}
        {(transcription || isProcessing) && (
          <TranscriptionDisplay
            transcription={transcription}
            isProcessing={isProcessing}
            aiSummary={aiSummary}
            keywords={keywords}
          />
        )}

        {/* Action Buttons */}
        {transcription && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* AI Processing Modal */}
      <AIProcessingModal visible={isProcessing} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  playButton: {
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  durationText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});