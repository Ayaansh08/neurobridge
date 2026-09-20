import React, { useState, useEffect, useRef, useCallback } from 'react';
import { defaultScenarios, userProgressService } from '../../services/userProgressService';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';
import { authConfig } from '../../config/auth';
import {
  PlayIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  MicIcon,
  MicOffIcon,
  VolumeIcon,
  VolumeOffIcon,
  StopCircleIcon,
  ChevronDownIcon,
  CloseIcon,
  BookOpenIcon,
} from './Icons';
import type { FeedbackEvaluation, ScenarioItem } from './types';

// Web Speech API interface declarations for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface PracticeViewProps {
  initialScenarioId?: string;
  onSessionComplete?: () => void;
  onNavigate?: (path: string) => void;
  restoredSessionData?: any;
}

interface PersonaInfo {
  name: string;
  role: string;
  initials: string;
  goal: string;
  tips: string[];
}

const PERSONA_DETAILS: Record<string, PersonaInfo> = {
  'job-interview': {
    name: 'Taylor',
    role: 'Engineering Hiring Manager',
    initials: 'T',
    goal: 'Demonstrate technical problem solving and answer behavioral questions with calm clarity.',
    tips: [
      'Take a breath before answering complex questions.',
      'Use the STAR method (Situation, Task, Action, Result) if helpful.',
      'It is completely okay to pause for 2–3 seconds to collect your thoughts.',
    ],
  },
  'talk-to-manager': {
    name: 'Marcus',
    role: 'Engineering Director',
    initials: 'M',
    goal: 'Discuss your performance, advocate for compensation adjustment, and align on next career steps.',
    tips: [
      'Focus on tangible achievements and business impact.',
      'Use clear, non-confrontational phrasing ("I would like to discuss adjusting my compensation based on...").',
      'Ask collaborative questions about timing and budget.',
    ],
  },
  'talk-to-professor': {
    name: 'Prof. Vance',
    role: 'Academic Advisor & Professor',
    initials: 'P',
    goal: 'Request a deadline extension or clarify complex coursework concepts during office hours.',
    tips: [
      'State your situation concisely up front.',
      'Propose a realistic timeline for completion.',
      'Show that you have started the work and identified specific roadblocks.',
    ],
  },
  'set-boundary': {
    name: 'Sam',
    role: 'Coworker & Teammate',
    initials: 'S',
    goal: 'Politely and firmly decline an unreasonable workload request while preserving a constructive working relationship.',
    tips: [
      'Keep your decline clear without over-apologizing.',
      'Offer an alternative if appropriate ("I cannot take this on today, but I can review on Thursday").',
      'Remember that setting boundaries is a healthy, professional practice.',
    ],
  },
  'ask-for-help': {
    name: 'Jordan',
    role: 'Senior Staff Engineer',
    initials: 'J',
    goal: 'Explain a technical roadblock clearly and request guidance without anxiety.',
    tips: [
      'Summarize what you tried and where you are blocked.',
      'Be specific about the question or decision needed.',
      'Respect their time by being prepared with error logs or repro steps.',
    ],
  },
  'phone-call': {
    name: 'Morgan',
    role: 'Clinic Front-Desk Receptionist',
    initials: 'M',
    goal: 'Navigate real-time scheduling constraints and confirm appointments over the phone.',
    tips: [
      'Have your calendar and insurance information ready in front of you.',
      'Ask the receptionist to repeat dates or details if needed.',
      'Take notes as you speak to reduce working-memory strain.',
    ],
  },
  'meet-someone-new': {
    name: 'Alex',
    role: 'Meetup Attendee & Developer',
    initials: 'A',
    goal: 'Initiate a casual, low-pressure conversation and find common technical interests.',
    tips: [
      'Start with an open-ended observation ("Have you been to this meetup before?").',
      'Listen actively and ask follow-ups about their projects.',
      'You can wrap up the conversation anytime with a polite exit.',
    ],
  },
  'handle-conflict': {
    name: 'Riley',
    role: 'Startup Co-Founder',
    initials: 'R',
    goal: 'De-escalate a heated product priority disagreement and find a principled path forward.',
    tips: [
      'Acknowledge their perspective before presenting your counterpoint.',
      'Focus on shared project goals rather than personal differences.',
      'Maintain an even, measured tone.',
    ],
  },
};

export const PracticeView: React.FC<PracticeViewProps> = ({
  initialScenarioId,
  onSessionComplete,
  onNavigate,
  restoredSessionData,
}) => {
  const { user } = useAuth();
  const selectedScenario =
    defaultScenarios.find((s) => s.id === initialScenarioId) || defaultScenarios[0];

  const [activeScenario, setActiveScenario] = useState<ScenarioItem>(selectedScenario);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(() => {
    if (selectedScenario.difficulty === 'Advanced') return 3;
    if (selectedScenario.difficulty === 'Intermediate') return 2;
    return 1;
  });

  const [sessionId, setSessionId] = useState<string | null>(() => restoredSessionData?.sessionRecord?.sessionId || null);
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; content: string }>>(() => {
    if (restoredSessionData?.sessionRecord?.messages) {
      return restoredSessionData.sessionRecord.messages.map((m: any) => ({ role: m.role, content: m.content }));
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(() => restoredSessionData?.sessionRecord?.status === 'completed');
  const [completionStep, setCompletionStep] = useState<'summary' | 'insights'>('summary');
  const [feedbackEvaluation, setFeedbackEvaluation] = useState<FeedbackEvaluation | null>(null);

  // Scenario Switcher Drawer & Tips Drawer
  const [isScenarioPickerOpen, setIsScenarioPickerOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isConfirmFinishOpen, setIsConfirmFinishOpen] = useState(false);

  // Voice Mode state (Browser-native Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [speakAloud, setSpeakAloud] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptPrefixRef = useRef<string>('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const persona = PERSONA_DETAILS[activeScenario.scenarioType] || {
    name: 'Practice Partner',
    role: 'Conversational Coach',
    initials: 'NB',
    goal: 'Practice clear, composed dialogue in a low-pressure setting.',
    tips: ['Take your time.', 'Focus on expressing your thoughts clearly.'],
  };

  const userTurnCount = messages.filter((m) => m.role === 'user').length;

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

  // Auto scroll chat to bottom when messages change or loading
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isInitializing]);

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
        setApiError('API endpoint not configured. Please set VITE_API_GATEWAY_URL in your .env file.');
        setIsInitializing(false);
        return;
      }

      try {
        // Check 3 unfinished sessions cap
        const unfinished = userProgressService.getUnfinishedSessions(user?.email);
        if (unfinished.length >= 3 && !unfinished.some((s) => s.scenarioId === scenario.id)) {
          setApiError('You have 3 unfinished sessions. Finish or discard one to start another.');
          setIsInitializing(false);
          return;
        }

        const res = await fetch(`${endpoint}/sessions`, {
          method: 'POST',
          signal: AbortSignal.timeout(25000),
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
        localStorage.setItem(`nb_active_session_${user?.email || 'guest'}`, JSON.stringify({
          sessionId: data.sessionId,
          scenarioId: scenario.id,
        }));

        userProgressService.saveUnfinishedSession({
          sessionId: data.sessionId,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          scenarioIcon: scenario.icon,
          difficulty: scenario.difficulty,
          startedAt: new Date().toISOString(),
          userTurns: 0,
        }, user?.email);

        // Populate with real opening line from DynamoDB RulesTable
        if (data.messages && Array.isArray(data.messages)) {
          const initialMsgs = data.messages.map((m: any) => ({ role: m.role, content: m.content }));
          setMessages(initialMsgs);
          if (speakAloud && initialMsgs[0]?.content) {
            speakText(initialMsgs[0].content);
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

  // Initialize session whenever scenario changes, UNLESS we just restored one
  const [initialRestoreDone, setInitialRestoreDone] = useState(!!restoredSessionData);
  useEffect(() => {
    if (initialRestoreDone) {
      setInitialRestoreDone(false);
      return;
    }
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
        setVoiceNotice('Listening... speak clearly into your microphone.');
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
          setVoiceNotice('Microphone permission was denied. Please allow microphone access in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech detected. Click the mic to try again.');
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
        setVoiceNotice('Could not start microphone recognition. Please try again.');
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

    if (sessionId) {
      const userTurns = newHistory.filter((m) => m.role === 'user').length;
      userProgressService.updateSessionTurns(sessionId, userTurns, user?.email);
    }

    const endpoint = authConfig.apiEndpoint.replace(/\/+$/, '');

    if (!sessionId || !endpoint) {
      setApiError('Session not connected to backend. Please check VITE_API_GATEWAY_URL.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${endpoint}/sessions/${sessionId}/messages`, {
        method: 'POST',
        signal: AbortSignal.timeout(25000),
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 400 && errData.error === 'session limit reached') {
          throw new Error('Session turn limit reached (30 turns). Please finish and view feedback.');
        } else if (res.status === 503) {
          throw new Error('AI service is temporarily busy. Please try again in a moment.');
        } else {
          throw new Error(errData.message || errData.error || `Server error (${res.status})`);
        }
      }

      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        const nextMsgs = data.messages.map((m: any) => ({ role: m.role, content: m.content }));
        const lastMsg = nextMsgs[nextMsgs.length - 1];

        // Apply pacing delay for realistic sensory rhythm
        const pacingDelay = settingsService.getPacingDelayMs();
        if (pacingDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, pacingDelay));
        }

        setMessages(nextMsgs);
        if (lastMsg && lastMsg.role === 'ai' && speakAloud) {
          speakText(lastMsg.content);
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setApiError(err.name === 'TimeoutError' ? 'The request timed out. The AI might be busy.' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishPractice = async () => {
    setIsConfirmFinishOpen(false);
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
        signal: AbortSignal.timeout(25000),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to generate feedback');

      const data = await res.json();
      const evaluation: FeedbackEvaluation = {
        summary: data.summary || 'You handled the conversation with composure and clarity.',
        dimensions: {
          clarity: data.dimensions?.clarity || { rating: 'strong', note: 'Clear points and well-structured responses.' },
          tone: data.dimensions?.tone || { rating: 'developing', note: 'Constructive, respectful, and grounded.' },
          responsiveness: data.dimensions?.responsiveness || { rating: 'strong', note: 'Directly addressed pushback and questions.' },
          composure: data.dimensions?.composure || { rating: 'developing', note: 'Maintained conversational flow under pressure.' },
        },
        whatWentWell: data.whatWentWell || 'You stepped into the scenario with clear intent and kept the conversation moving forward constructively.',
        tryImproving: data.tryImproving || 'Experiment with pausing before answering difficult pushback to give yourself space to formulate composed answers.',
        encouragement: data.encouragement || 'Every practice session strengthens your real-world communication reflexes — great job showing up.',
      };

      userProgressService.recordCompletedSession(
        activeScenario.scenarioType,
        activeScenario.title,
        evaluation.whatWentWell,
        evaluation,
        user?.email
      );

      if (sessionId) {
        userProgressService.removeUnfinishedSession(sessionId, user?.email);
      }
      localStorage.removeItem(`nb_active_session_${user?.email || 'guest'}`);

      setFeedbackEvaluation(evaluation);
      setIsCompleted(true);
      onSessionComplete?.();
    } catch (err: any) {
      console.error('Feedback error:', err);
      setApiError(err.name === 'TimeoutError' ? 'Feedback generation timed out.' : (err.message || 'Failed to generate AI feedback. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackFinish = () => {
    const evaluation: FeedbackEvaluation = {
      summary: 'You completed this practice scenario with clear communication and a grounded demeanor.',
      dimensions: {
        clarity: { rating: 'strong', note: 'Your points were stated clearly throughout the dialogue.' },
        tone: { rating: 'developing', note: 'Maintained a calm, respectful, and constructive conversational cadence.' },
        responsiveness: { rating: 'strong', note: 'Directly addressed the points raised by your partner.' },
        composure: { rating: 'developing', note: 'Handled the back-and-forth scenario without breaking flow.' },
      },
      whatWentWell: 'You stepped into the scenario with clear intent and kept the conversation moving forward constructively.',
      tryImproving: 'Experiment with pausing before answering difficult pushback to give yourself space to formulate composed answers.',
      encouragement: 'Every practice session builds communication reflexes — great job showing up today.',
    };

    userProgressService.recordCompletedSession(
      activeScenario.scenarioType,
      activeScenario.title,
      evaluation.whatWentWell,
      evaluation,
      user?.email
    );

    if (sessionId) {
      userProgressService.removeUnfinishedSession(sessionId, user?.email);
    }
    localStorage.removeItem(`nb_active_session_${user?.email || 'guest'}`);

    setFeedbackEvaluation(evaluation);
    setIsCompleted(true);
    onSessionComplete?.();
  };

  const computeScore = (dimensions: any) => {
    if (!dimensions) return 0;
    const map: Record<string, number> = { strong: 3, developing: 2, 'needs practice': 1 };
    return (
      (map[dimensions.clarity?.rating] || 0) +
      (map[dimensions.tone?.rating] || 0) +
      (map[dimensions.responsiveness?.rating] || 0) +
      (map[dimensions.composure?.rating] || 0)
    );
  };

  const handleSwitchScenario = (scenario: ScenarioItem) => {
    const unfinished = userProgressService.getUnfinishedSessions(user?.email);
    if (unfinished.length >= 3 && !unfinished.some((s) => s.scenarioId === scenario.id)) {
      setApiError('You have 3 unfinished sessions. Finish or discard one to start another.');
      setIsScenarioPickerOpen(false);
      return;
    }
    setActiveScenario(scenario);
    const diff = scenario.difficulty === 'Advanced' ? 3 : scenario.difficulty === 'Intermediate' ? 2 : 1;
    setSelectedDifficulty(diff);
    setIsCompleted(false);
    setCompletionStep('summary');
    setFeedbackEvaluation(null);
    setIsScenarioPickerOpen(false);
  };

  return (
    <div className="practice-view-container">
      {/* Rehearsal Header Card */}
      <div className="practice-header-card">
        <div className="practice-header-persona-row">
          <div className="practice-persona-avatar-badge" aria-hidden="true">
            {persona.initials}
          </div>

          <div className="practice-persona-meta">
            <div className="practice-persona-title-row">
              <h2 className="practice-persona-name">{persona.name}</h2>
              <span className="practice-persona-role">&middot; {persona.role}</span>
              <span className={`difficulty-pill difficulty-pill--${activeScenario.difficulty.toLowerCase()}`}>
                {activeScenario.difficulty}
              </span>
            </div>
            <p className="practice-scenario-title-label">
              Scenario: <strong>{activeScenario.title}</strong>
            </p>
          </div>

          <div className="practice-header-actions">
            {/* Scenario Switcher Button */}
            <button
              type="button"
              className="practice-scenario-switch-btn"
              onClick={() => setIsScenarioPickerOpen(true)}
              title="Change active practice scenario"
            >
              <span>Change Scenario</span>
              <ChevronDownIcon size={13} />
            </button>
          </div>
        </div>

        {/* Goal Banner */}
        <div className="practice-goal-banner">
          <span className="practice-goal-label">Your Goal:</span>
          <span className="practice-goal-text">{persona.goal}</span>
        </div>

        {/* Collapsible Tips Drawer */}
        <div className="practice-tips-accordion">
          <button
            type="button"
            className="practice-tips-toggle"
            onClick={() => setIsTipsOpen(!isTipsOpen)}
            aria-expanded={isTipsOpen}
          >
            <div className="practice-tips-toggle-left">
              <BookOpenIcon size={14} className="practice-tips-icon" />
              <span>Scenario Tips & Guidance ({persona.tips.length})</span>
            </div>
            <ChevronDownIcon
              size={13}
              className={`practice-tips-chevron ${isTipsOpen ? 'practice-tips-chevron--open' : ''}`}
            />
          </button>

          {isTipsOpen && (
            <div className="practice-tips-body">
              <ul className="practice-tips-list">
                {persona.tips.map((tip, idx) => (
                  <li key={idx} className="practice-tips-item">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Switcher Modal */}
      {isScenarioPickerOpen && (
        <div
          className="comfort-modal-overlay"
          onClick={() => setIsScenarioPickerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scenario-modal-title"
        >
          <div className="comfort-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="comfort-modal-header">
              <h3 id="scenario-modal-title" className="comfort-modal-title">
                Select Practice Scenario
              </h3>
              <button
                type="button"
                className="comfort-modal-close-btn"
                onClick={() => setIsScenarioPickerOpen(false)}
                aria-label="Close scenario picker"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <p className="comfort-modal-desc">
              Choose a scenario to practice real-world conversations with your AI partner.
            </p>

            <div className="practice-scenario-picker-list">
              {defaultScenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`practice-scenario-picker-item ${activeScenario.id === s.id ? 'practice-scenario-picker-item--active' : ''}`}
                  onClick={() => handleSwitchScenario(s)}
                >
                  <div className="practice-scenario-picker-item-top">
                    <span className="practice-scenario-picker-title">{s.title}</span>
                    <span className={`difficulty-pill difficulty-pill--${s.difficulty.toLowerCase()}`}>
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="practice-scenario-picker-desc">{s.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Finish Practice */}
      {isConfirmFinishOpen && (
        <div
          className="comfort-modal-overlay"
          onClick={() => setIsConfirmFinishOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-finish-title"
        >
          <div className="comfort-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="comfort-modal-header">
              <h3 id="confirm-finish-title" className="comfort-modal-title">
                Complete Rehearsal & Get Feedback?
              </h3>
              <button
                type="button"
                className="comfort-modal-close-btn"
                onClick={() => setIsConfirmFinishOpen(false)}
                aria-label="Close confirmation"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <p className="comfort-modal-desc">
              Your AI coach will analyze this conversation across clarity, tone, responsiveness, and composure to provide constructive feedback.
            </p>

            <div className="comfort-modal-footer">
              <button
                type="button"
                className="dashboard-view-all-btn"
                onClick={() => setIsConfirmFinishOpen(false)}
              >
                <span>Continue Practicing</span>
              </button>
              <button
                type="button"
                className="dashboard-cta-btn"
                onClick={handleFinishPractice}
              >
                <span>Finish & View Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <div className="practice-error-banner" role="alert">
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

        <div className="practice-workspace-card">
          {/* Chat message stream */}
          <div className="practice-chat-area" aria-label="Conversation Rehearsal Thread">
            {isInitializing && (
              <div className="practice-message practice-message--ai">
                <div className="practice-message-avatar">{persona.initials}</div>
                <div className="practice-message-body">
                  <div className="practice-message-sender">{persona.name}</div>
                  <div className="practice-typing-indicator" aria-label={`${persona.name} is connecting...`}>
                    <div className="practice-typing-dot" />
                    <div className="practice-typing-dot" />
                    <div className="practice-typing-dot" />
                    <span className="practice-typing-label">Connecting to rehearsal...</span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`practice-message practice-message--${m.role}`}
              >
                <div className="practice-message-avatar">
                  {m.role === 'ai' ? persona.initials : 'You'}
                </div>
                <div className="practice-message-body">
                  <div className="practice-message-sender">
                    {m.role === 'ai' ? persona.name : 'You'}
                  </div>
                  <div className="practice-message-bubble">{m.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="practice-message practice-message--ai">
                <div className="practice-message-avatar">{persona.initials}</div>
                <div className="practice-message-body">
                  <div className="practice-message-sender">{persona.name}</div>
                  <div className="practice-typing-indicator" aria-label={`${persona.name} is thinking...`}>
                    <div className="practice-typing-dot" />
                    <div className="practice-typing-dot" />
                    <div className="practice-typing-dot" />
                    <span className="practice-typing-label">{persona.name} is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {isCompleted && (
            <div className="practice-completed-notice">
              <span>This practice session has been completed.</span>
            </div>
          )}
          {!isCompleted && (
          <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--nb-gray-400)', textAlign: 'center', borderTop: '1px solid var(--nb-charcoal-border)' }}>
            Turn {userTurnCount} of 30
          </div>
          )}
          {/* Voice and Audio Toolbar */}
          {!isCompleted && (
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
                <span>{speakAloud ? 'Read replies aloud' : 'Audio off'}</span>
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

              <span className="practice-turn-counter">
                Turn {userTurnCount} of 30
              </span>
            </div>

            <div className="practice-voice-right">
              {isListening && (
                <span className="practice-voice-notice practice-voice-notice--listening">
                  <span className="practice-voice-dot" aria-hidden="true" /> Listening... review before sending
                </span>
              )}
              {voiceNotice && !isListening && (
                <span className="practice-voice-notice practice-voice-notice--error">
                  {voiceNotice}
                </span>
              )}
            </div>
          </div>

            )}
          {/* Input & Action Form */}
          {!isCompleted && (
          <form className="practice-input-row" onSubmit={handleSendMessage}>
            <button
              type="button"
              className={`practice-mic-btn ${isListening ? 'practice-mic-btn--recording' : ''}`}
              onClick={toggleListening}
              disabled={!isVoiceSupported || isLoading || isInitializing}
              title={
                !isVoiceSupported
                  ? 'Voice input not supported in this browser (Chrome or Edge recommended)'
                  : isListening
                  ? 'Stop recording voice'
                  : 'Speak response via microphone'
              }
              aria-label={isListening ? 'Stop recording' : 'Speak response'}
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
                  ? `${persona.name} is thinking...`
                  : isListening
                  ? 'Listening... speak clearly into your mic'
                  : 'Type or speak what you would say in this scenario...'
              }
              value={inputText}
              disabled={isLoading || isInitializing}
              onChange={(e) => setInputText(e.target.value)}
              aria-label="Your conversational response"
            />

            <button
              type="submit"
              className="practice-send-btn"
              disabled={isLoading || isInitializing || !inputText.trim()}
              title="Send your response"
            >
              <span>Respond</span>
              <ArrowRightIcon size={13} />
            </button>

            <div className="practice-finish-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                className={"practice-complete-btn " + (userTurnCount >= 3 ? "practice-complete-btn--ready" : "")}
                disabled={isLoading || isInitializing || userTurnCount < 3}
                onClick={() => setIsConfirmFinishOpen(true)}
                title="Finish session and get constructive feedback"
                style={userTurnCount >= 3 ? { boxShadow: '0 0 12px rgba(183,165,152,0.4)', borderColor: 'var(--nb-terracotta)' } : {}}
              >
                Finish & get feedback
              </button>
              {userTurnCount < 3 && (
                <span className="practice-finish-hint" style={{ fontSize: '10px', color: 'var(--nb-ink-muted)' }}>
                  Send {3 - userTurnCount} more message{3 - userTurnCount !== 1 ? 's' : ''} to finish
                </span>
              )}
            </div>
          </form>
          )}
        </div>

        {isCompleted && feedbackEvaluation && (
          <div className="practice-completed-card">
            {completionStep === 'summary' ? (
              <div className="practice-summary-screen">
                <div className="practice-completed-header">
                  <div className="practice-completed-icon">
                    <CheckCircleIcon size={26} />
                  </div>
                  <div className="practice-completed-header-text">
                    <h3 className="practice-completed-title">Session Summary</h3>
                    <p className="practice-completed-subtitle">
                      You completed {activeScenario.title} with {persona.name}
                    </p>
                  </div>
                </div>
                
                <div className="practice-score-ring-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '30px 0' }}>
                  <div className="score-ring" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--nb-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'var(--nb-emerald)', marginBottom: '12px' }}>
                    {computeScore(feedbackEvaluation.dimensions)}<span style={{ fontSize: '14px', color: 'var(--nb-ink-muted)' }}>/12</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--nb-ink-muted)' }}>Based on the four ratings below</div>
                </div>

                <div className="practice-narrative-sections">
                  <div className="practice-narrative-block" style={{ textAlign: 'center' }}>
                    <p className="practice-narrative-text" style={{ fontSize: '1.1rem', fontWeight: 500, margin: '0 auto', maxWidth: '600px' }}>
                      {feedbackEvaluation.summary || `${feedbackEvaluation.whatWentWell} ${feedbackEvaluation.tryImproving}`}
                    </p>
                    <p style={{ marginTop: '16px', color: 'var(--nb-terracotta)', fontWeight: 'bold' }}>+100 XP earned</p>
                  </div>
                </div>
                
                <div className="practice-completed-actions" style={{ marginTop: '30px', justifyContent: 'center' }}>
                  <button type="button" className="dashboard-cta-btn" onClick={() => setCompletionStep('insights')}>
                    <span>See insights</span>
                  </button>
                  <button
                    type="button"
                    className="dashboard-view-all-btn"
                    onClick={() => {
                      setIsCompleted(false);
                      setCompletionStep('summary');
                      setFeedbackEvaluation(null);
                      initSession(activeScenario, selectedDifficulty);
                    }}
                  >
                    <span>Practice again</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="practice-insights-screen">
                <div className="practice-completed-header">
                  <div className="practice-completed-icon">
                    <CheckCircleIcon size={26} />
                  </div>
                  <div className="practice-completed-header-text">
                    <h3 className="practice-completed-title">Rehearsal Insights</h3>
                    <p className="practice-completed-subtitle">
                      Constructive reflection on your practice with {persona.name} ({activeScenario.title})
                    </p>
                  </div>
                </div>

          {feedbackEvaluation && (
            <>
              <div className="practice-narrative-sections">
                <div className="practice-narrative-block">
                  <span className="practice-narrative-eyebrow">Executive Summary</span>
                  <p className="practice-narrative-text" style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                    {feedbackEvaluation.summary || `${feedbackEvaluation.whatWentWell} ${feedbackEvaluation.tryImproving}`}
                  </p>
                </div>
              </div>

              {/* 4 Dimension Cards */}
              <div className="practice-dimensions-grid">
                {([
                  { key: 'clarity', label: 'Clarity', data: feedbackEvaluation.dimensions.clarity },
                  { key: 'tone', label: 'Tone', data: feedbackEvaluation.dimensions.tone },
                  { key: 'responsiveness', label: 'Responsiveness', data: feedbackEvaluation.dimensions.responsiveness },
                  { key: 'composure', label: 'Composure', data: feedbackEvaluation.dimensions.composure },
                ] as const).map(({ key, label, data }) => (
                  <div key={key} className="practice-dimension-card">
                    <div className="practice-dimension-top">
                      <span className="practice-dimension-name">{label}</span>
                      <span className={`practice-rating-badge practice-rating-badge--${data.rating.replace(/\s+/g, '-')}`}>
                        {data.rating}
                      </span>
                    </div>
                    <p className="practice-dimension-note">{data.note}</p>
                  </div>
                ))}
              </div>

              {/* Narrative Breakdown */}
              <div className="practice-narrative-sections">
                <div className="practice-narrative-block">
                  <span className="practice-narrative-eyebrow">What Went Well</span>
                  <p className="practice-narrative-text">{feedbackEvaluation.whatWentWell}</p>
                </div>

                <div className="practice-narrative-block">
                  <span className="practice-narrative-eyebrow">Practice Focus</span>
                  <p className="practice-narrative-text">{feedbackEvaluation.tryImproving}</p>
                </div>

                <div className="practice-encouragement-box">
                  <SparklesIcon size={18} className="practice-encouragement-icon" />
                  <p className="practice-encouragement-text">{feedbackEvaluation.encouragement}</p>
                </div>
              </div>
            </>
          )}

          <div className="practice-completed-actions">
            <button
              type="button"
              className="dashboard-cta-btn"
              onClick={() => setCompletionStep('summary')}
            >
              <span>Back to summary</span>
            </button>
            <button
              type="button"
              className="dashboard-view-all-btn"
              onClick={() => {
                setIsCompleted(false);
                setCompletionStep('summary');
                setFeedbackEvaluation(null);
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

          <div className="practice-disclaimer-note">
            NeuroBridge is a conversational practice tool, not a clinical therapy service.
          </div>
              </div>
            )}
        </div>
        )}
    </div>
  );
};






