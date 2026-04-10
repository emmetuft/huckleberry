import { FC, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { CheckIcon, MicrophoneIcon, XIcon } from '@phosphor-icons/react';
import styles from './DictateBtn.module.css';
import { IconBtn } from 'components/shared/IconBtn/IconBtn';

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface DictateButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const DictateButton: FC<DictateButtonProps> = ({
  onTranscript,
  disabled,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>([0, 0, 0, 0, 0]);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');

      // Accumulate the transcript instead of sending it immediately
      setAccumulatedTranscript(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onTranscript]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 32;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Sample 5 different frequency ranges for the bars
        const bars = [
          dataArray[2] / 255,
          dataArray[4] / 255,
          dataArray[6] / 255,
          dataArray[4] / 255,
          dataArray[2] / 255,
        ];

        setAudioLevel(bars);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel([0, 0, 0, 0, 0]);
  };

  const startDictation = () => {
    if (!recognitionRef.current) {
      console.warn('Speech recognition not available');
      return;
    }

    setAccumulatedTranscript('');
    recognitionRef.current.start();
    startAudioVisualization();
    setIsListening(true);
  };

  const handleConfirm = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopAudioVisualization();
    setIsListening(false);

    // Send the accumulated transcript
    if (accumulatedTranscript.trim()) {
      onTranscript(accumulatedTranscript);
    }
    setAccumulatedTranscript('');
  };

  const handleCancel = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopAudioVisualization();
    setIsListening(false);
    setAccumulatedTranscript('');
  };

  return (
    <div className={styles.dictateContainer}>
      {!isListening ? (
        <IconBtn
          icon={<MicrophoneIcon />}
          disabled={disabled}
          onClick={startDictation}
        />
      ) : (
        <>
          <div className={styles.soundwave}>
            {audioLevel.map((level, index) => (
              <div
                key={index}
                className={styles.bar}
                style={{
                  height: `${Math.max(20, level * 100)}%`,
                }}
              />
            ))}
          </div>
          <div className={styles.controls}>
            <Button
              type="text"
              icon={<XIcon color="#e53935" size={18} weight="bold" />}
              onClick={handleCancel}
              className={styles.cancelBtn}
            />
            <Button
              type="text"
              icon={<CheckIcon color="#4caf50" size={18} weight="bold" />}
              onClick={handleConfirm}
              className={styles.confirmBtn}
            />
          </div>
        </>
      )}
    </div>
  );
};
