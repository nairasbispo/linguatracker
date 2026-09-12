import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../lib/dateUtils';
import confetti from 'canvas-confetti';

export const RitualTimerModal: React.FC = () => {
  const { languages, modal, setModal, createSession } = useApp();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(languages[0]?.id || 'en');
  const [selectedSkill, setSelectedSkill] = useState<'listening' | 'speaking' | 'reading' | 'writing'>('listening');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(10);
  const [secondsLeft, setSecondsLeft] = useState<number>(10 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setHasFinished(true);
            playGentleBell();
            try {
              confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
            } catch {}
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Audio chime via native browser Web Audio API (Zero AI / Zero external audio assets)
  const playGentleBell = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.5); // E5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);
    } catch {
      // AudioContext fallback
    }
  };

  const handleSelectDuration = (min: number) => {
    setIsActive(false);
    setTargetDurationMinutes(min);
    setSecondsLeft(min * 60);
    setElapsedSeconds(0);
    setHasFinished(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(targetDurationMinutes * 60);
    setElapsedSeconds(0);
    setHasFinished(false);
  };

  const handleLogElapsedPractice = () => {
    const totalMin = Math.max(1, Math.round(elapsedSeconds / 60) || targetDurationMinutes);
    createSession({
      languageId: selectedLanguage,
      date: getLocalDateString(new Date()),
      listening: selectedSkill === 'listening' ? totalMin : 0,
      speaking: selectedSkill === 'speaking' ? totalMin : 0,
      reading: selectedSkill === 'reading' ? totalMin : 0,
      writing: selectedSkill === 'writing' ? totalMin : 0,
      totalMinutes: totalMin,
      notes: `Focus ritual practice (${selectedSkill}, ${totalMin}m)`,
      createdAt: Date.now(),
    }).catch(console.error);
    setModal(null);
  };

  if (modal !== 'ritualTimer') return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalTargetSec = targetDurationMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTargetSec - secondsLeft) / totalTargetSec) * 100));

  return (
    <div
      id="modal-backdrop-ritual-timer"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-ritual-timer"
        className="bg-[#161B26] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#2B354D] relative flex flex-col items-center text-center"
      >
        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Eyebrow */}
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
          <Sparkles className="w-4 h-4" />
          <span>A SMALL RITUAL</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 mb-1">
          Ten deliberate minutes.
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mb-6">
          Focus gently on your target language without distractions.
        </p>

        {/* Target Options */}
        <div className="flex items-center gap-2 mb-6">
          {[5, 10, 15, 25].map((m) => (
            <button
              key={m}
              onClick={() => handleSelectDuration(m)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                targetDurationMinutes === m
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-[#222B3D] text-slate-300 hover:bg-[#2D384E]'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="relative w-48 h-48 rounded-full border-4 border-[#242F42] flex flex-col items-center justify-center mb-6 bg-[#1A2030] shadow-inner">
          <div
            className="absolute inset-0 rounded-full border-4 border-emerald-400 transition-all duration-1000"
            style={{
              clipPath: `inset(0 0 ${100 - progressPercent}% 0)`,
            }}
          ></div>
          <span className="text-4xl font-extrabold tracking-tighter text-white font-mono z-10">
            {formattedTime}
          </span>
          <span className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase mt-1 z-10">
            {isActive ? 'In rhythm' : hasFinished ? 'Ritual completed' : 'Ready'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-[#242F42] hover:bg-[#2E3B52] text-slate-300 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isActive ? 'Pause' : 'Begin practice'}</span>
          </button>
        </div>

        {/* Language & Skill Selection */}
        <div className="w-full bg-[#1C2333] p-4 rounded-2xl border border-[#2B354D] text-left space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#252E42] border border-[#333E56] text-white text-xs font-semibold focus:outline-hidden"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as 'listening' | 'speaking' | 'reading' | 'writing')}
                className="w-full px-3 py-1.5 rounded-lg bg-[#252E42] border border-[#333E56] text-white text-xs font-semibold focus:outline-hidden"
              >
                <option value="listening">🎧 Listening</option>
                <option value="speaking">🗣️ Speaking</option>
                <option value="reading">📖 Reading</option>
                <option value="writing">✍️ Writing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Log button */}
        {(elapsedSeconds > 30 || hasFinished) && (
          <button
            onClick={handleLogElapsedPractice}
            className="w-full py-3 rounded-xl bg-[#1E5E44] hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>
              Log {Math.max(1, Math.round(elapsedSeconds / 60))} min to your {languages.find((l) => l.id === selectedLanguage)?.name} record →
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
