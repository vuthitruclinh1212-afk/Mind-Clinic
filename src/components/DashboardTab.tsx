import React, { useState, useMemo, useEffect } from 'react';
import { 
  Syringe, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Tablets, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Clock, 
  Droplets, 
  Sliders, 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Calendar,
  CalendarRange,
  Zap,
  Info,
  Music,
  Plus,
  Flame,
  Star,
  FileText,
  ExternalLink,
  Target,
  Timer,
  Coffee,
  Bell,
  Heart,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { Task, DripSession, MoodType, MusicTrack } from '../types';
import { soundEngine } from '../utils/audio';

interface DashboardTabProps {
  flowSeconds: number;
  isFlowing: boolean;
  onToggleFlow: () => void;
  onResetFlow: () => void;
  onSaveSession: (volumeMl: number, taskTitle?: string, musicTrackTitle?: string) => void;
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onSwitchTab: (tabId: string) => void;
  sessions: DripSession[];
  currentMood: MoodType;
  dripSpeed: 'slow' | 'normal' | 'fast';
  onChangeDripSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  onSelectTrack: (track: MusicTrack) => void;
  isPlayingMusic: boolean;
  onTogglePlayMusic: () => void;
  onOpenMusicModal: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  flowSeconds,
  isFlowing,
  onToggleFlow,
  onResetFlow,
  onSaveSession,
  tasks,
  onToggleTask,
  onSwitchTab,
  sessions,
  currentMood,
  dripSpeed,
  onChangeDripSpeed,
  tracks,
  currentTrack,
  onSelectTrack,
  isPlayingMusic,
  onTogglePlayMusic,
  onOpenMusicModal,
}) => {
  const [selectedTaskForDrip, setSelectedTaskForDrip] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<'volume' | 'time'>('volume');

  // Study Goal & Break Encouragement States
  const [studyGoalMinutes, setStudyGoalMinutes] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_study_goal_minutes');
      return saved !== null ? JSON.parse(saved) : 25; // Default 25 min (Pomodoro)
    } catch {
      return 25;
    }
  });
  const [customGoalInput, setCustomGoalInput] = useState<string>('30');
  const [isEditingCustomGoal, setIsEditingCustomGoal] = useState<boolean>(false);
  const [showGoalFinishedModal, setShowGoalFinishedModal] = useState<boolean>(false);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [hasAlertedForCurrentSession, setHasAlertedForCurrentSession] = useState<boolean>(false);

  // Target metrics calculation
  const targetGoalSeconds = studyGoalMinutes ? studyGoalMinutes * 60 : 0;
  const currentMinutesInSession = Math.floor(flowSeconds / 60);
  const remainingSeconds = targetGoalSeconds > flowSeconds ? targetGoalSeconds - flowSeconds : 0;
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecs = remainingSeconds % 60;
  const remainingTimeFormatted = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  const goalProgressPercent = targetGoalSeconds > 0 ? Math.min(100, Math.round((flowSeconds / targetGoalSeconds) * 100)) : 0;

  // Study Goal completion checking & gentle notification trigger
  useEffect(() => {
    if (!studyGoalMinutes || studyGoalMinutes <= 0) return;
    const targetSecs = studyGoalMinutes * 60;

    if (flowSeconds >= targetSecs && !hasAlertedForCurrentSession && flowSeconds > 0) {
      setHasAlertedForCurrentSession(true);

      // 1. Gentle screen vibration effect
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 1400);

      // 2. Hardware vibration (if supported on mobile/touch devices)
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([250, 150, 250, 150, 350]);
        }
      } catch {
        // Silently catch
      }

      // 3. Play calming break alert chime
      soundEngine.playGentleBreakAlert();

      // 4. Open soothing reminder modal
      setShowGoalFinishedModal(true);

      // 5. Gentle pause flow so user isn't rushed
      if (isFlowing) {
        onToggleFlow();
      }
    }
  }, [flowSeconds, studyGoalMinutes, hasAlertedForCurrentSession, isFlowing, onToggleFlow]);

  // Reset alert state when timer is at 0
  useEffect(() => {
    if (flowSeconds === 0) {
      setHasAlertedForCurrentSession(false);
    }
  }, [flowSeconds]);

  // Calculate formatted time
  const hrs = String(Math.floor(flowSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((flowSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(flowSeconds % 60).padStart(2, '0');

  // 1 minute = ~5ml of accumulated knowledge
  const currentVolumeMl = Math.round((flowSeconds / 60) * 5);
  // Fluid visual percentage (15% base, max 92%)
  const visualHeightPercent = Math.min(15 + Math.floor(flowSeconds / 8), 92);

  const handleFinishAndSave = () => {
    if (flowSeconds < 10) {
      alert('Thời gian truyền còn dưới 10 giây, hãy nạp thêm một chút tri thức nhé!');
      return;
    }
    onSaveSession(currentVolumeMl, selectedTaskForDrip || undefined, currentTrack?.title);
    soundEngine.playSuccessChime();
  };

  const completedTodayCount = tasks.filter((t) => t.done).length;

  // Build weekly chart data (Thứ 2 -> Chủ Nhật) purely from real sessions
  const weeklyChartData = useMemo(() => {
    const todayDay = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const baseWeek = [
      { key: 'T2', name: 'Thứ 2', fullName: 'Thứ Hai', dayIndex: 1 },
      { key: 'T3', name: 'Thứ 3', fullName: 'Thứ Ba', dayIndex: 2 },
      { key: 'T4', name: 'Thứ 4', fullName: 'Thứ Tư', dayIndex: 3 },
      { key: 'T5', name: 'Thứ 5', fullName: 'Thứ Năm', dayIndex: 4 },
      { key: 'T6', name: 'Thứ 6', fullName: 'Thứ Sáu', dayIndex: 5 },
      { key: 'T7', name: 'Thứ 7', fullName: 'Thứ Bảy', dayIndex: 6 },
      { key: 'CN', name: 'Chủ Nhật', fullName: 'Chủ Nhật', dayIndex: 0 },
    ];

    return baseWeek.map((item) => {
      const isToday = item.dayIndex === todayDay;
      // Calculate real volume accumulated from saved sessions for this day
      const daySessionsVolume = sessions
        .filter((s) => s.dayKey === item.key)
        .reduce((sum, s) => sum + (s.volumeMl || 0), 0);

      // Add live volume if currently dripping today
      const liveVolume = isToday ? currentVolumeMl : 0;
      const volumeMl = daySessionsVolume + liveVolume;
      const minutes = Math.round(volumeMl / 5);

      const status = volumeMl > 0 
        ? `Đã nạp ${volumeMl}ml (~${minutes} phút)` 
        : 'Chưa có dữ liệu nạp tri thức';

      return {
        ...item,
        volumeMl,
        minutes,
        isToday,
        status,
      };
    });
  }, [sessions, currentVolumeMl]);

  const totalWeeklyVolume = useMemo(() => {
    return weeklyChartData.reduce((acc, curr) => acc + curr.volumeMl, 0);
  }, [weeklyChartData]);

  const totalWeeklyMinutes = useMemo(() => {
    return Math.round(totalWeeklyVolume / 5);
  }, [totalWeeklyVolume]);

  const peakDay = useMemo(() => {
    const sorted = [...weeklyChartData].sort((a, b) => b.volumeMl - a.volumeMl);
    return sorted[0]?.volumeMl > 0 ? sorted[0] : null;
  }, [weeklyChartData]);

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-teal-500/30 text-xs space-y-1.5 min-w-[170px] animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-teal-300 text-sm">{data.fullName}</span>
            {data.isToday && (
              <span className="text-[10px] bg-teal-500/30 text-teal-300 px-1.5 py-0.5 rounded-md font-semibold">
                Hôm nay
              </span>
            )}
          </div>
          <div className="space-y-1 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="text-slate-400">Dung tích tri thức:</span>
              <strong className="text-teal-400 text-sm">{data.volumeMl} ml</strong>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-slate-400">Thời gian học:</span>
              <strong className="text-slate-200">{data.minutes} phút</strong>
            </p>
          </div>
          <p className="text-[11px] text-emerald-300 italic pt-1.5 border-t border-slate-800">
            🩺 Dr. Ling: {data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className={`space-y-6 transition-all duration-300 ${isScreenShaking ? 'animate-gentle-shake' : ''}`}>
      {/* Banner Greeting */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 rounded-3xl p-6 text-white shadow-lg shadow-teal-100/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Triết lý Flow-time: Không chuông báo - Không gò bó</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Chào bạn, bệnh nhân chăm chỉ! 🩺</h2>
          <p className="text-teal-50 text-sm max-w-xl leading-relaxed">
            Hôm nay hãy học theo nhịp độ tự nhiên của não bộ. Học bao lâu tùy thích, mệt lúc nào thì bấm dừng lúc đó để ghi nhận dung tích tri thức.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 z-10">
          <div className="text-center">
            <p className="text-2xl font-black">{completedTodayCount}/{tasks.length}</p>
            <p className="text-[11px] text-teal-100 uppercase tracking-wider font-semibold">Liều thuốc đã uống</p>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-3xl">🍵</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BÌNH TRUYỀN DỊCH TỰ DO (Flow-time Tracker) - 5 Cols */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-teal-100/80 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2 text-base">
              <Syringe className="w-5 h-5 text-teal-500" />
              <span>Bình Truyền Dịch Tri Thức</span>
            </h3>
            <span className="text-[11px] font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-teal-500" />
              {currentVolumeMl} ml
            </span>
          </div>

          {/* IV Drip Unit Visual */}
          <div className="relative flex flex-col items-center my-2">
            {/* Hanging stand ring */}
            <div className="w-8 h-3 border-2 border-slate-300 rounded-t-full mb-0.5"></div>
            
            {/* The Calibrated Infusion Bottle */}
            <div className="relative w-36 h-48 bg-gradient-to-b from-teal-50/50 to-emerald-50/30 border-2 border-teal-200/90 rounded-b-3xl rounded-t-xl flex flex-col justify-end p-1.5 shadow-inner overflow-hidden">
              {/* Calibration Markings (Labels 250, 500, 750, 1000ml) */}
              <div className="absolute left-2 inset-y-4 flex flex-col justify-between text-[9px] font-mono font-bold text-teal-700/60 pointer-events-none z-20">
                <span>- 1000ml</span>
                <span>- 750ml</span>
                <span>- 500ml</span>
                <span>- 250ml</span>
                <span>- 50ml</span>
              </div>

              {/* Rising Liquid with Gradient and Bubbles */}
              <div
                className="w-full bg-gradient-to-t from-teal-400 via-emerald-400 to-teal-300 rounded-b-2xl transition-all duration-700 relative overflow-hidden"
                style={{ height: `${visualHeightPercent}%` }}
              >
                {/* Surface Wave Highlight */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 blur-[1px]"></div>
                {/* Rising gentle bubbles when flowing */}
                {isFlowing && (
                  <>
                    <div className="absolute bottom-2 left-6 w-1.5 h-1.5 bg-white/70 rounded-full bubble-rise"></div>
                    <div className="absolute bottom-1 right-8 w-2 h-2 bg-white/60 rounded-full bubble-rise" style={{ animationDelay: '1.2s' }}></div>
                    <div className="absolute bottom-4 left-16 w-1 h-1 bg-white/80 rounded-full bubble-rise" style={{ animationDelay: '0.6s' }}></div>
                  </>
                )}
              </div>
            </div>

            {/* Drip Chamber (Bầu đếm giọt) */}
            <div className="relative w-7 h-12 bg-white/90 border border-teal-200 rounded-b-lg rounded-t-sm flex flex-col items-center justify-between p-1 shadow-xs my-0.5 z-10">
              <div className="w-1.5 h-2 bg-teal-400 rounded-b-sm"></div>

              {/* Falling Drip Drop */}
              {isFlowing ? (
                <div 
                  className="w-2 h-2 bg-teal-500 rounded-full drip-drop shadow-xs"
                  style={{
                    animationDuration: dripSpeed === 'slow' ? '2.4s' : dripSpeed === 'fast' ? '0.8s' : '1.4s'
                  }}
                ></div>
              ) : (
                <div className="w-1.5 h-1.5 bg-teal-300 rounded-full opacity-40"></div>
              )}

              <div className="w-full h-2.5 bg-teal-400/80 rounded-b-md"></div>
            </div>

            {/* Flexible IV Tubing line */}
            <div className="w-1 h-6 bg-teal-200/60 rounded-full"></div>
          </div>

          {/* Time & Volume Readout */}
          <div className="mt-2 space-y-1">
            <div className="text-4xl font-black text-slate-800 tracking-wider font-mono">
              {hrs}:{mins}:{secs}
            </div>
            <p className="text-xs font-medium text-teal-600 flex items-center justify-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-teal-500" />
              <span>Đã nạp: <strong>{currentVolumeMl} ml</strong> tri thức tự do</span>
            </p>
            <p className="text-[11px] text-slate-400">
              {isFlowing
                ? 'Đang tiếp nhận tri thức êm dịu, không áp lực...'
                : flowSeconds > 0
                ? 'Đang tạm dừng dưỡng sức'
                : 'Chưa bắt đầu nạp năng lượng'}
            </p>
          </div>

          {/* Linked Task Selector */}
          <div className="w-full my-2.5 px-1">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 text-left">
              Đang truyền liều thuốc nào? (Tùy chọn)
            </label>
            <select
              value={selectedTaskForDrip}
              onChange={(e) => setSelectedTaskForDrip(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-400"
            >
              <option value="">-- Tự do hấp thu tri thức tổng quát --</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.title}>
                  {task.done ? '✓ ' : '💊 '} {task.priority === 'Bắt buộc uống (Khẩn cấp)' ? '[Bắt buộc] ' : ''} {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* ================= GIAI ĐIỆU TRUYỀN DỊCH (MUSIC SELECTION BAR) ================= */}
          <div className="w-full bg-teal-50/70 border border-teal-200/80 p-3 rounded-2xl mb-3 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-teal-600" />
                <span>Giai điệu khi truyền dịch:</span>
              </span>
              <button
                type="button"
                onClick={onOpenMusicModal}
                className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tủ nhạc (+ Thêm MP3)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentTrack?.id || ''}
                onChange={(e) => {
                  const found = tracks.find((t) => t.id === e.target.value);
                  if (found) onSelectTrack(found);
                }}
                className="flex-1 bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    🎵 {t.title} ({t.category})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onTogglePlayMusic}
                title={isPlayingMusic ? 'Tạm dừng nhạc' : 'Phát bài nhạc này'}
                className={`p-2 rounded-xl text-white shadow-xs transition cursor-pointer shrink-0 ${
                  isPlayingMusic ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-500 hover:bg-teal-600'
                }`}
              >
                {isPlayingMusic ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
            </div>

            {currentTrack && (
              <p className="text-[10px] text-teal-700/80 truncate">
                Đang sẵn sàng: <strong>{currentTrack.title}</strong> • {isPlayingMusic ? 'Đang phát du dương 🎶' : 'Sẵn sàng phát khi bắt đầu truyền'}
              </p>
            )}
          </div>

          {/* Speed Regulator (Roller Clamp Control) */}
          <div className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-2xl mb-4 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Tốc độ dòng:
            </span>
            <div className="flex items-center gap-1">
              {(['slow', 'normal', 'fast'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeDripSpeed(spd)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                    dripSpeed === spd
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {spd === 'slow' ? 'Chậm' : spd === 'normal' ? 'Êm' : 'Nhanh'}
                </button>
              ))}
            </div>
          </div>

          {/* ================= MỤC TIÊU THỜI GIAN HỌC (STUDY TIME GOAL & REST REMINDER) ================= */}
          <div className="w-full bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cyan-50/60 border border-teal-200/90 p-3 rounded-2xl mb-4 text-left space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-600" />
                <span>Mục tiêu thời gian học:</span>
              </span>
              {studyGoalMinutes ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-emerald-600" />
                  {studyGoalMinutes} phút
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                  Tự do (Không hẹn giờ)
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1">
              {[
                { label: 'Tự do', val: null },
                { label: '15p', val: 15 },
                { label: '25p', val: 25 },
                { label: '45p', val: 45 },
                { label: '60p', val: 60 },
              ].map((preset) => {
                const isSelected = studyGoalMinutes === preset.val;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setStudyGoalMinutes(preset.val);
                      try {
                        localStorage.setItem('mind_clinic_study_goal_minutes', JSON.stringify(preset.val));
                      } catch {}
                      setHasAlertedForCurrentSession(false);
                    }}
                    className={`py-1 px-1 rounded-xl text-[11px] font-semibold transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'bg-white/90 text-slate-600 hover:bg-white hover:text-teal-700 border border-teal-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Input or Status */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              {!isEditingCustomGoal ? (
                <button
                  type="button"
                  onClick={() => setIsEditingCustomGoal(true)}
                  className="text-[10px] text-teal-700 hover:text-teal-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Tùy chỉnh số phút...</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full bg-white p-1 rounded-xl border border-teal-200 shadow-2xs">
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    placeholder="Phút"
                    className="w-16 px-2 py-0.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-400"
                  />
                  <span className="text-[10px] text-slate-500">phút</span>
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseInt(customGoalInput, 10);
                      if (!isNaN(parsed) && parsed > 0) {
                        setStudyGoalMinutes(parsed);
                        try {
                          localStorage.setItem('mind_clinic_study_goal_minutes', JSON.stringify(parsed));
                        } catch {}
                        setHasAlertedForCurrentSession(false);
                      }
                      setIsEditingCustomGoal(false);
                    }}
                    className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold hover:bg-teal-600 cursor-pointer ml-auto"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCustomGoal(false)}
                    className="text-slate-400 hover:text-slate-600 text-[10px] px-1 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {studyGoalMinutes && !isEditingCustomGoal && (
                <span className="text-[10px] text-teal-800 font-medium ml-auto">
                  {goalProgressPercent >= 100 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Đã hoàn thành!
                    </span>
                  ) : (
                    <span>Còn <strong>{remainingTimeFormatted}</strong></span>
                  )}
                </span>
              )}
            </div>

            {/* Goal Progress Bar */}
            {studyGoalMinutes && (
              <div className="space-y-1 pt-0.5">
                <div className="w-full bg-teal-100/70 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      goalProgressPercent >= 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, goalProgressPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-teal-800/80 font-medium px-0.5">
                  <span>Tiến độ: {currentMinutesInSession}/{studyGoalMinutes} phút ({goalProgressPercent}%)</span>
                  {goalProgressPercent >= 100 && (
                    <button
                      type="button"
                      onClick={() => setShowGoalFinishedModal(true)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Xem lời khuyên nghỉ ngơi 🍵</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={onToggleFlow}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98 ${
                isFlowing
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-200'
              }`}
            >
              {isFlowing ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Tạm ngừng nạp</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{flowSeconds > 0 ? 'Tiếp tục nạp' : 'Bắt đầu truyền'}</span>
                </>
              )}
            </button>

            {flowSeconds > 0 && (
              <button
                onClick={handleFinishAndSave}
                title="Ghi nhận & Lưu hồ sơ ca truyền"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-3 rounded-2xl shadow-md shadow-emerald-200 transition text-sm flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                setHasAlertedForCurrentSession(false);
                setShowGoalFinishedModal(false);
                onResetFlow();
              }}
              title="Đặt lại đồng hồ"
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-3 rounded-2xl transition text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PHÁC ĐỒ HÔM NAY (QUICK TASKS) & LỊCH SỬ - 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Prescriptions Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <Tablets className="w-5 h-5 text-teal-500" />
                  <span>Các Liều Thuốc Cần Uống Hôm Nay</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Uống theo giờ hẹn trong ngày & có thể hoàn thành sớm</p>
              </div>
              <button
                onClick={() => onSwitchTab('prescriptions')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Chi tiết đơn thuốc <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p>Hôm nay phác đồ trống. Hãy kê thêm các viên thuốc học tập mới!</p>
                  <button
                    onClick={() => onSwitchTab('prescriptions')}
                    className="mt-2 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl hover:bg-teal-100 transition cursor-pointer"
                  >
                    + Kê đơn thuốc ngay
                  </button>
                </div>
              ) : (
                tasks.slice(0, 4).map((task) => {
                  const isUrgent = task.priority === 'Bắt buộc uống (Khẩn cấp)';
                  const isImportant = task.priority === 'Quan trọng (Uống trước)';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        task.done
                          ? 'bg-slate-50/80 border-slate-200 opacity-60'
                          : isUrgent
                          ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                          : isImportant
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-teal-50/30 hover:bg-teal-50/60 border-teal-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {task.done ? (
                          <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                        ) : (
                          <Circle className={`w-5 h-5 ${isUrgent ? 'text-rose-500' : 'text-teal-400'} shrink-0`} />
                        )}
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </p>
                            {isUrgent && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.2 rounded-md">
                                Bắt buộc
                              </span>
                            )}
                            {isImportant && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                                Quan trọng
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {task.isLongTerm ? (
                              <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                                <CalendarRange className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                                <span>
                                  {task.startDate ? task.startDate.split('-').slice(1).reverse().join('/') : 'Dài hạn'}
                                  {task.endDate ? ` → ${task.endDate.split('-').slice(1).reverse().join('/')}` : ''}
                                </span>
                              </span>
                            ) : task.startDate ? (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                <span>{task.startDate.split('-').slice(1).reverse().join('/')}</span>
                              </span>
                            ) : null}

                            {task.scheduledTime && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-slate-500" />
                                {task.scheduledTime}
                              </span>
                            )}
                            <span className="text-[10px] bg-white border border-teal-200 text-teal-700 px-1.5 py-0.5 rounded-md font-medium">
                              {task.category}
                            </span>
                            {task.documentUrl && (
                              <span className="text-[10px] text-teal-600 flex items-center gap-0.5 font-medium">
                                <FileText className="w-2.5 h-2.5" />
                                Tài liệu
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                        {task.done ? (task.completedEarly ? '✨ Uống sớm' : 'Đã uống') : 'Chưa uống'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Lịch Sử Các Ca Truyền Dịch Gần Đây */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-teal-500" />
                <span>Hồ Sơ Các Ca Truyền Dịch Gần Nhất</span>
              </h3>
              <span className="text-xs text-slate-400">{sessions.length} ca truyền</span>
            </div>

            {sessions.length === 0 ? (
              <div className="p-5 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Chưa có ca truyền dịch nào được lưu. Sau khi hoàn thành một lượt học, bấm nút Lưu để ghi vào hồ sơ nhé!
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scroll pr-1">
                {sessions.slice(0, 4).map((s) => {
                  const mins = Math.floor(s.durationSeconds / 60);
                  const secs = s.durationSeconds % 60;
                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                          🩺
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {s.taskTitle ? s.taskTitle : 'Ca truyền tự do'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {s.startTime} {s.musicTrackTitle ? `• 🎵 ${s.musicTrackTitle}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-teal-700 text-xs">+{s.volumeMl} ml</span>
                        <p className="text-[10px] text-slate-500">{mins}p {secs}s</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= BIỂU ĐỒ CỘT RECHARTS: DUNG TÍCH TRI THỨC THEO TUẦN ================= */}
      <div className="bg-white rounded-3xl p-6 border border-teal-100/80 shadow-sm space-y-5">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-2xl bg-teal-50 text-teal-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>Tiến Trình Điều Trị: Dung Tích Tri Thức Theo Tuần</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Flow Accumulation
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tổng dung tích tri thức (thời gian học) hấp thu theo từng ngày từ Thứ 2 đến Chủ Nhật
                </p>
              </div>
            </div>
          </div>

          {/* Metric Selector Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setChartMetric('volume')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartMetric === 'volume'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-teal-500" />
              <span>Dung tích (ml)</span>
            </button>
            <button
              onClick={() => setChartMetric('time')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartMetric === 'time'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              <span>Thời gian (phút)</span>
            </button>
          </div>
        </div>

        {/* Weekly Stat Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/70 border border-teal-100">
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-teal-600" />
              Tổng nạp trong tuần
            </p>
            <p className="text-xl font-extrabold text-teal-800 mt-1">{totalWeeklyVolume} ml</p>
            <span className="text-[10px] text-teal-600 font-medium">~{totalWeeklyMinutes} phút trị liệu</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Trung bình mỗi ngày
            </p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">
              {Math.round(totalWeeklyVolume / 7)} ml
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Hấp thu đều đặn</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Ngày đỉnh cao nhất
            </p>
            <p className="text-xl font-extrabold text-amber-900 mt-1">
              {peakDay ? peakDay.name : 'Chưa có'}
            </p>
            <span className="text-[10px] text-amber-700 font-medium">
              {peakDay ? `${peakDay.volumeMl} ml tri thức` : 'Chưa có dữ liệu'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Đánh giá phác đồ
            </p>
            <p className="text-sm font-bold text-emerald-900 mt-1">
              {totalWeeklyVolume > 0 ? 'Hồi phục rất tốt 🌿' : 'Bắt đầu từ con số 0 🌿'}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">
              {totalWeeklyVolume > 0 ? 'Không có áp lực Pomodoro' : 'Chưa ghi nhận ca truyền'}
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Viewport */}
        <div className="w-full h-64 sm:h-72 pt-2 relative">
          {totalWeeklyVolume === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[1px] rounded-2xl border border-dashed border-slate-200 p-6 text-center pointer-events-none">
              <Droplets className="w-7 h-7 text-teal-400 mb-1.5" />
              <p className="text-xs font-bold text-slate-700">Chưa có dữ liệu truyền dịch trong tuần này</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Bệnh nhân mới chưa có lịch sử nạp. Hãy bấm <strong>Bắt đầu truyền</strong> ở trên để nạp những ml tri thức đầu tiên!
              </p>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis 
                domain={[0, Math.max(50, Math.max(...weeklyChartData.map(d => chartMetric === 'volume' ? d.volumeMl : d.minutes)))]}
                tickLine={false} 
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit={chartMetric === 'volume' ? 'ml' : 'p'}
              />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.6 }} />
              <Bar 
                dataKey={chartMetric === 'volume' ? 'volumeMl' : 'minutes'} 
                radius={[8, 8, 2, 2]} 
                maxBarSize={48}
              >
                {weeklyChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? '#0d9488' : '#2dd4bf'} 
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doctor Note Footer */}
        <div className="flex items-center gap-2 p-3 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs text-slate-600">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-teal-800">Lời dặn của Dr. Ling:</strong> Cột màu xanh đậm thể hiện ngày hôm nay. Khi bạn bật <em>Bình truyền dịch tri thức</em> ở trên, dung tích ngày hôm nay sẽ tự động tăng theo thời gian thực mà không ngắt quãng dòng chảy suy nghĩ của bạn!
          </p>
        </div>
      </div>

      {/* ================= THÔNG BÁO NHẸ NHÀNG: HOÀN THÀNH MỤC TIÊU & UỐNG NƯỚC ================= */}
      {showGoalFinishedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-2 border-emerald-300 relative text-center overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Decorative top color bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowGoalFinishedModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Floating Soft Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center text-3xl mb-3.5 shadow-inner animate-float-gentle border border-emerald-200">
              🍵
            </div>

            {/* Target Reached Badge */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Đạt mục tiêu {studyGoalMinutes} phút tập trung!</span>
            </div>

            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
              Đã đến lúc nghỉ ngơi & uống nước 💧
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4 px-1">
              Não bộ của bạn đã làm việc rất chăm chỉ trong phiên vừa qua. Hãy tạm gác bài vở sang một bên, vươn vai thư giãn và nạp lại năng lượng nhé!
            </p>

            {/* Gentle Rest Tips */}
            <div className="bg-gradient-to-br from-teal-50/80 to-emerald-50/70 rounded-2xl p-3.5 border border-teal-100 text-left space-y-2.5 mb-5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-teal-500/15 flex items-center justify-center text-base shrink-0">
                  💧
                </div>
                <div>
                  <strong className="text-teal-900 block font-bold">Uống ngay một ly nước ấm / mát</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Bổ sung độ ẩm giúp tế bào não tuần hoàn máu và hồi phục độ nhạy bén.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base shrink-0">
                  👀
                </div>
                <div>
                  <strong className="text-emerald-900 block font-bold">Thả lỏng mắt (Quy tắc 20-20-20)</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Hướng tầm mắt ra xa ít nhất 6 mét trong 20-30 giây để giảm mỏi điều tiết.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-base shrink-0">
                  🧘
                </div>
                <div>
                  <strong className="text-amber-900 block font-bold">Vươn vai & Hít thở sâu</strong>
                  <span className="text-slate-500 text-[11px] leading-tight block">
                    Đứng dậy đi lại nhẹ nhàng 3-5 phút giúp giải tỏa căng thẳng khớp cổ vai gáy.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowGoalFinishedModal(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>💧 Tôi đã uống nước & Sẽ nghỉ ngơi</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudyGoalMinutes((prev) => (prev ? prev + 5 : 5));
                    setHasAlertedForCurrentSession(false);
                    setShowGoalFinishedModal(false);
                    if (!isFlowing) onToggleFlow();
                  }}
                  className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs rounded-xl border border-teal-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Học thêm 5 phút</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowGoalFinishedModal(false);
                    handleFinishAndSave();
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lưu ca học này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
