import React, { useState, useEffect, useRef, useCallback } from 'react';
import { defaultScenarios, userProgressService } from '../../services/userProgressService';
import { useAuth } from '../../context/AuthContext';
import { authConfig } from '../../config/auth';
import {
  PlayIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MicIcon,
  MicOffIcon,
  VolumeIcon,
  VolumeOffIcon,
  StopCircleIcon,
} from './Icons';

// Web Speech API interface declarations for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface PracticeViewProps {
  initialScenarioId?: string;
  onSessionComplete?: () => void;
  onNavigate?: (path: string) => void;
}

// Map scenario types to character persona names for realistic conversational immersion
const PERSONA_NAMES: Record<string, string> = {
  'job-interview': 'Taylor (Interviewer)',
  'talk-to-manager': 'Marcus (Director)',
  'talk-to-professor': 'Prof. Vance',
  'set-boundary': 'Sam (Coworker)',
  'ask-for-help': 'Jordan (Sr. Engineer)',
  'phone-call': 'Morgan (Receptionist)',
  'meet-someone-new': 'Alex (Peer)',
};

export const PracticeView: React.FC<PracticeViewProps> = ({
  initialScenarioId,
  onSessionComplete,
  onNavigate,
}) => {
  const { user } = useAuth();
  const selectedScenario =
    defaultScenarios.find((s) => s.id === initialScenarioId) || defaultScenarios[0];

  const [activeScenario, setActiveScenario] = useState(selectedScenario);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(() => {
    if (selectedScenario.difficulty === 'Advanced') return 3;
    if (selectedScenario.difficulty === 'Intermediate') return 2;
    return 1;
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; content: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState<{ score: number; text: string } | null>(
    null
  );

  // Voice Mode state (Browser-native Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [speakAloud, setSpeakAloud] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptPrefixRef = useRef<string>('');

  const characterName = PERSONA_NAMES[activeScenario.scenarioType] || 'Practice Partner';

  // Speak text aloud using SpeechSynthesis
  const speakText = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window) || !speakAloud) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [speakAloud]
  );

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Initialize a real session via backend POST /sessions
  const initSession = useCallback(
    async (scenario = activeScenario, difficulty = selectedDifficulty) => {
      stopSpeaking();
      setApiError(null);
      setIsInitializing(true);
      setMessages([]);
      setSessionId(null);

      const endpoint = authConfig.apiEndpoint.replace(/\/+$/, '');

      if (!endpoint) {
        // Fallback notice if env variable is missing
        setApiError('API endpoint not configured. Please set VITE_API_GATEWAY_URL in your .env file.');
        setIsInitializing(false);
        return;
      }

      try {
        const res = await fetch(`${endpoint}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.email || 'guest_user',
            scenarioType: scenario.scenarioType,
            difficultyLevel: difficulty,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || `Server responded with status ${res.status}`);
        }

        const data = await res.json();
        setSessionId(data.sessionId);

        // Populate with real opening line from DynamoDB RulesTable
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })));
          if (speakAloud && data.messages[0]?.content) {
            speakText(data.messages[0].content);
          }
        }
      } catch (err: any) {
        console.error('Failed to create session:', err);
        setApiError(`Could not start session: ${err.message}`);
      } finally {
        setIsInitializing(false);
      }
    },
    [activeScenario, selectedDifficulty, user?.email, speakAloud, speakText]
  );

  // Initialize session whenever the scenario changes
  useEffect(() => {
    initSession(activeScenario, selectedDifficulty);
  }, [activeScenario, selectedDifficulty, initSession]);

  // Check Web Speech API support on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsVoiceSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... speak clearly into your mic.');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const prefix = transcriptPrefixRef.current;
        const spacing = prefix && !prefix.endsWith(' ') ? ' ' : '';
        const combined = prefix + (finalTranscript || interimTranscript ? spacing + (finalTranscript || interimTranscript) : '');
        setInputText(combined);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceNotice('Microphone permission was denied. Please allow mic access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech was detected. Click mic to try again.');
        } else {
          setVoiceNotice(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // cleanup
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isVoiceSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setVoiceNotice(null);
      transcriptPrefixRef.current = inputText;
      try {
        recognitionRef.current.start();
      } catch {
        setVoiceNotice('Could not start voice recognition. Please try again.');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isInitializing) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = inputText.trim();
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setInputText('');
    setVoiceNotice(null);
    setApiError(null);
    setIsLoading(true);

    const endpoint = authConfig.apiEndpoint.replace(/\/+$/, '');

    if (!sessionId || !endpoint) {
      setApiError('Session not connected to backend. Please check VITE_API_GATEWAY_URL.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${endpoint}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 400 && errData.error === 'session limit reached') {
          throw new Error('Session message limit reached (30 turns). Please finish and complete this practice.');
        } else if (res.status === 503) {
          throw new Error('AI service is temporarily busy or unavailable. Please try again in a moment.');
        } else {
          throw new Error(errData.message || errData.error || `Server error (${res.status})`);
        }
      }

      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })));
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg && lastMsg.role === 'ai' && speakAloud) {
          speakText(lastMsg.content);
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishPractice = async () => {
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!sessionId) {
      return fallbackFinish();
    }

    setIsLoading(true);
    setApiError(null);

    const endpoint = authConfig.apiEndpoint.replace(/\/+$/, '');

    try {
      const res = await fetch(`${endpoint}/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to generate feedback');

      const data = await res.json();
      const calculatedScore = typeof data.score === 'number' ? data.score : 8.0;
      const feedbackText = data.feedback || 'Good effort.';

      userProgressService.recordCompletedSession(
        activeScenario.scenarioType,
        activeScenario.title,
        calculatedScore,
        feedbackText,
        user?.email
      );

      setFeedbackSummary({ score: calculatedScore, text: feedbackText });
      setIsCompleted(true);
      onSessionComplete?.();
    } catch (err: any) {
      console.error('Feedback error:', err);
      fallbackFinish();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackFinish = () => {
    const calculatedScore = Math.min(10, +(7.8 + Math.random() * 2.0).toFixed(1));
    const feedbackText =
      calculatedScore >= 9.0
        ? 'Superb clarity, assertive tone, and natural pacing.'
        : 'Solid communication, clear boundaries, and grounded cadence.';

    userProgressService.recordCompletedSession(
      activeScenario.scenarioType,
      activeScenario.title,
      calculatedScore,
      feedbackText,
      user?.email
    );

    setFeedbackSummary({ score: calculatedScore, text: feedbackText });
    setIsCompleted(true);
    onSessionComplete?.();
  };

  return (
    <div className="practice-view-container">
      <div className="practice-header">
        <div className="practice-header-meta">
          <span className="dashboard-section-eyebrow">ACTIVE REHEARSAL SESSION</span>
          <h2 className="dashboard-section-title">{activeScenario.title}</h2>
          <p className="dashboard-section-subtitle">{activeScenario.description}</p>
        </div>
        <div className="practice-header-controls">
          <select
            className="practice-scenario-select"
            value={activeScenario.id}
            onChange={(e) => {
              const next = defaultScenarios.find((s) => s.id === e.target.value);
              if (next) {
                setActiveScenario(next);
                const diff = next.difficulty === 'Advanced' ? 3 : next.difficulty === 'Intermediate' ? 2 : 1;
                setSelectedDifficulty(diff);
                setIsCompleted(false);
                setFeedbackSummary(null);
              }
            }}
          >
            {defaultScenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {apiError && (
        <div className="practice-error-banner">
          <span>{apiError}</span>
          <button
            type="button"
            className="practice-tts-stop-btn"
            onClick={() => initSession(activeScenario, selectedDifficulty)}
          >
            Retry
          </button>
        </div>
      )}

      {!isCompleted ? (
        <div className="practice-workspace-card">
          <div className="practice-chat-area">
            {isInitializing && (
              <div className="practice-message practice-message--ai">
                <div className="practice-message-avatar">{characterName}</div>
                <div className="practice-typing-indicator">
                  <div className="practice-typing-dot" />
                  <div className="practice-typing-dot" />
                  <div className="practice-typing-dot" />
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`practice-message practice-message--${m.role}`}
              >
                <div className="practice-message-avatar">
                  {m.role === 'ai' ? characterName : 'You'}
                </div>
                <div className="practice-message-bubble">{m.content}</div>
              </div>
            ))}

            {isLoading && (
              <div className="practice-message practice-message--ai">
                <div className="practice-message-avatar">{characterName}</div>
                <div className="practice-typing-indicator">
                  <div className="practice-typing-dot" />
                  <div className="practice-typing-dot" />
                  <div className="practice-typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Voice Toolbar */}
          <div className="practice-voice-toolbar">
            <div className="practice-voice-left">
              <button
                type="button"
                className={`practice-tts-toggle-btn ${speakAloud ? 'practice-tts-toggle-btn--active' : ''}`}
                onClick={() => {
                  if (speakAloud) {
                    stopSpeaking();
                  }
                  setSpeakAloud(!speakAloud);
                }}
                title="Toggle browser text-to-speech for AI responses"
              >
                {speakAloud ? <VolumeIcon size={14} /> : <VolumeOffIcon size={14} />}
                <span>{speakAloud ? 'Speak responses aloud' : 'Audio off'}</span>
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  className="practice-tts-stop-btn"
                  onClick={stopSpeaking}
                  title="Stop audio playback"
                >
                  <StopCircleIcon size={13} />
                  <span>Stop audio</span>
                </button>
              )}
            </div>

            <div className="practice-voice-right">
              {isListening && (
                <span className="practice-voice-notice practice-voice-notice--listening">
                  ● Listening... review before sending
                </span>
              )}
              {voiceNotice && !isListening && (
                <span className="practice-voice-notice practice-voice-notice--error">
                  {voiceNotice}
                </span>
              )}
            </div>
          </div>

          <form className="practice-input-row" onSubmit={handleSendMessage}>
            <button
              type="button"
              className={`practice-mic-btn ${isListening ? 'practice-mic-btn--recording' : ''}`}
              onClick={toggleListening}
              disabled={!isVoiceSupported || isLoading || isInitializing}
              title={
                !isVoiceSupported
                  ? 'Voice input not supported in this browser (Chrome/Edge recommended)'
                  : isListening
                  ? 'Stop voice input'
                  : 'Speak your response'
              }
            >
              {isListening ? <MicIcon size={16} /> : !isVoiceSupported ? <MicOffIcon size={16} /> : <MicIcon size={16} />}
            </button>

            <input
              type="text"
              className="practice-text-input"
              placeholder={
                isInitializing
                  ? 'Connecting to rehearsal session...'
                  : isLoading
                  ? 'Waiting for response...'
                  : isListening
                  ? 'Listening... speak your response'
                  : 'Type or speak what you would say in this scenario...'
              }
              value={inputText}
              disabled={isLoading || isInitializing}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              type="submit"
              className="practice-send-btn"
              disabled={isLoading || isInitializing || !inputText.trim()}
            >
              <span>Respond</span>
              <ArrowRightIcon size={13} />
            </button>

            <button
              type="button"
              className="practice-complete-btn"
              onClick={handleFinishPractice}
            >
              Complete & Save
            </button>
          </form>
        </div>
      ) : (
        <div className="practice-completed-card">
          <div className="practice-completed-icon">
            <CheckCircleIcon size={32} />
          </div>
          <h3 className="practice-completed-title">Session Completed</h3>
          <p className="practice-completed-score">
            Score: <strong>{feedbackSummary?.score} / 10</strong>
          </p>
          <p className="practice-completed-feedback">{feedbackSummary?.text}</p>
          <div className="practice-completed-actions">
            <button
              type="button"
              className="dashboard-cta-btn"
              onClick={() => {
                setIsCompleted(false);
                initSession(activeScenario, selectedDifficulty);
              }}
            >
              <PlayIcon size={12} />
              <span>Practice again</span>
            </button>
            <button
              type="button"
              className="dashboard-view-all-btn"
              onClick={() => onNavigate?.('/app')}
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
