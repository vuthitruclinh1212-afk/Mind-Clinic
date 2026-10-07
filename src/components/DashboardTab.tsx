import React, { useState, useMemo } from 'react';
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
  Zap,
  Info,
  Music,
  Plus,
  Flame,
  Star,
  FileText,
  ExternalLink
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
    <section className="space-y-6">
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
              onClick={onResetFlow}
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
                          <div className="flex items-center gap-2 mt-1">
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
    </section>
  );
};
