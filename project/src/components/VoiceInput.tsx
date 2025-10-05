import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className = '' }: VoiceInputProps) {
  const { user } = useAuth();
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported, error } =
    useVoiceInput(user?.language || 'en');

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  if (!isSupported) {
    return (
      <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        Voice input is not supported in your browser
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105'
          }
        `}
      >
        {isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
        )}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Listening...</span>
        </div>
      )}

      {transcript && (
        <div className="max-w-md p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
