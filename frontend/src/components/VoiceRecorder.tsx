import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, RefreshCw, AlertCircle, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, durationSec: number) => void;
  onFallbackToText?: () => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'requesting' | 'recording' | 'preview' | 'error';

export default function VoiceRecorder({
  onRecordingComplete,
  onFallbackToText,
  disabled = false,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  }, [audioUrl]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    setState('requesting');

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Your browser does not support microphone access. Please type your problem instead.');
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const dur = (Date.now() - startTimeRef.current) / 1000;
        setAudioUrl(url);
        setRecordedBlob(blob);
        setDuration(dur);
        setState('preview');
      };

      recorder.onerror = () => {
        setErrorMsg('Recording failed. Please try again or type your problem.');
        setState('error');
      };

      recorder.start(250); // collect chunks every 250ms
      startTimeRef.current = Date.now();
      setState('recording');

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('denied') || msg.includes('NotAllowed')) {
        setErrorMsg('Microphone permission was denied. Please allow microphone access and try again.');
      } else if (msg.includes('NotFound')) {
        setErrorMsg('No microphone found. Please connect a microphone or type your problem.');
      } else {
        setErrorMsg('Could not access microphone. Please type your problem instead.');
      }
      setState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const confirmRecording = useCallback(() => {
    if (recordedBlob && duration > 0) {
      if (duration < 1) {
        setErrorMsg('Recording too short. Please speak for at least 1 second.');
        return;
      }
      onRecordingComplete(recordedBlob, duration);
    }
  }, [recordedBlob, duration, onRecordingComplete]);

  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordedBlob(null);
    setDuration(0);
    setElapsed(0);
    setState('idle');
  }, [audioUrl]);

  return (
    <div className="space-y-4">
      {/* [DEV] Mock label */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
        <span className="text-amber-400 text-xs font-mono">DEV</span>
        <span className="text-amber-300/80 text-xs">
          Voice recording is captured locally. AI transcription uses mock fixtures in development.
        </span>
      </div>

      {state === 'idle' && (
        <button
          onClick={startRecording}
          disabled={disabled}
          aria-label="Start recording"
          className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed border-blue-500/30 hover:border-blue-400/60 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Tap to speak your problem</p>
            <p className="text-slate-400 text-sm mt-1">Speak clearly in Hindi, English, or your local language</p>
          </div>
        </button>
      )}

      {state === 'requesting' && (
        <div className="flex flex-col items-center gap-3 p-8">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-300 text-sm">Requesting microphone access…</p>
        </div>
      )}

      {state === 'recording' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
            {/* Pulsing indicator */}
            <div className="relative">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-red-400 font-mono text-2xl font-bold">{formatTime(elapsed)}</p>
              <p className="text-slate-400 text-sm mt-1">Recording in progress…</p>
            </div>
          </div>
          <button
            onClick={stopRecording}
            aria-label="Stop recording"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Recording
          </button>
        </div>
      )}

      {state === 'preview' && audioUrl && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium text-sm">Recording preview</p>
              <span className="text-slate-400 text-xs font-mono">{formatTime(Math.floor(duration))}</span>
            </div>
            <audio
              controls
              src={audioUrl}
              className="w-full h-8"
              aria-label="Preview your recording"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={resetRecording}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-xl border border-slate-600/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Re-record
            </button>
            <button
              onClick={confirmRecording}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Use Recording
            </button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-4">
          <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-medium">Microphone unavailable</p>
              <p className="text-red-300/70 text-xs mt-1">{errorMsg}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setState('idle')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-xl border border-slate-600/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            {onFallbackToText && (
              <button
                onClick={onFallbackToText}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm rounded-xl border border-blue-500/30 transition-colors"
              >
                <MicOff className="w-4 h-4" />
                Type instead
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
