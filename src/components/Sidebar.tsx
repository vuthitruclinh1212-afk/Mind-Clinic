import React from 'react';
import { 
  HeartPulse, 
  LayoutDashboard, 
  Pill, 
  ClipboardPen, 
  Library, 
  Stethoscope, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Droplets,
  Sparkles,
  User,
  LogIn,
  Award,
  Crown,
  BookHeart
} from 'lucide-react';
import { MoodType, UserProfile, UserCustomization } from '../types';
import { AVATAR_FRAMES } from '../utils/achievements';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  currentMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  totalVolumeMl: number;
  isRainPlaying: boolean;
  onToggleRain: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeTasksCount: number;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  customization?: UserCustomization;
}

export const MOODS: MoodType[] = [
  {
    id: 'kiet-suc',
    emoji: '😴',
    label: 'Đang kiệt sức',
    prescription: 'Kê toa: Nghỉ ngơi 15p, chỉ nghe audio thụ động hoặc ngủ một giấc sâu.',
  },
  {
    id: 'binh-yen',
    emoji: '🌿',
    label: 'Bình yên / Thong thả',
    prescription: 'Kê toa: Trạng thái lý tưởng để hấp thu kiến thức tự nhiên, không vội vã.',
  },
  {
    id: 'hung-phan',
    emoji: '⚡',
    label: 'Tràn đầy hưng phấn',
    prescription: 'Kê toa: Thích hợp nạp các chữ Hán khó hoặc thử thách đọc đoạn văn dài.',
  },
  {
    id: 'qua-tai',
    emoji: '🤕',
    label: 'Rối bời / Quá tải',
    prescription: 'Kê toa: Dừng ngay việc học vẹt. Đổi sang phác đồ chiết tự hài hước với Dr. Ling.',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentMood,
  onSelectMood,
  totalVolumeMl,
  isRainPlaying,
  onToggleRain,
  isMuted,
  onToggleMute,
  activeTasksCount,
  currentUser,
  onOpenAuthModal,
  customization,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Phòng Tổng Quát', icon: LayoutDashboard, badge: null },
    { id: 'prescriptions', label: 'Đơn Thuốc (Việc cần làm)', icon: Pill, badge: activeTasksCount > 0 ? activeTasksCount : null },
    { id: 'study-journal', label: 'Nhật Ký Học Tập', icon: BookHeart, badge: 'Cảm nhận' },
    { id: 'medical-notes', label: 'Hồ Sơ & Bệnh Án', icon: ClipboardPen, badge: null },
    { id: 'pharmacy', label: 'Kho Dược (Web Tiếng Trung)', icon: Library, badge: null },
    { id: 'ai-doctor', label: 'Bác Sĩ Trưởng Khoa AI', icon: Stethoscope, badge: 'Dr. Ling' },
    { id: 'achievements', label: 'Bảo Tàng Thành Tựu', icon: Award, badge: 'Huân chương' },
  ];

  const frameConfig = customization?.equippedFrame ? AVATAR_FRAMES[customization.equippedFrame] : AVATAR_FRAMES.default;

  return (
    <aside className="w-full md:w-72 bg-white border-r border-teal-100 flex flex-col justify-between p-5 shadow-sm shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 pb-2 border-b border-teal-50">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-teal-200">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg text-slate-800 leading-tight">Mind Clinic</h1>
              <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">v2.0</span>
            </div>
            <p className="text-xs text-teal-600 font-medium">Bệnh Viện Chữa Lành Tri Thức</p>
          </div>
        </div>

        {/* User Account Capsule with Equipped Title & Badge */}
        {currentUser ? (
          <div 
            onClick={onOpenAuthModal}
            className="p-3 bg-gradient-to-br from-teal-50/80 via-white to-amber-50/40 border border-teal-100 hover:border-amber-300 rounded-2xl flex flex-col gap-2 cursor-pointer transition group shadow-xs"
            title="Nhấp để xem thông tin hồ sơ Firestore & tài khoản"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="relative shrink-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className={`w-9 h-9 rounded-full ${frameConfig?.ringClass || 'border border-teal-200'}`}
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold ${frameConfig?.ringClass || ''}`}>
                    {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-teal-700">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </p>
                {customization?.equippedTitle && (
                  <p className="text-[10px] font-bold text-amber-700 truncate flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                    <span>[{customization.equippedTitle}]</span>
                  </p>
                )}
                <p className="text-[9px] text-teal-600/80 font-mono truncate">
                  {currentUser.docId}
                </p>
              </div>
            </div>

            {customization?.equippedBadge && (
              <div className="pt-1.5 border-t border-teal-50/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Huy hiệu:</span>
                <span className="font-semibold text-teal-800 truncate max-w-[140px] bg-white px-2 py-0.5 rounded-md border border-teal-100">
                  {customization.equippedBadge}
                </span>
              </div>
            )}
          </div>
        ) : onOpenAuthModal ? (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl text-xs font-bold text-teal-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <LogIn className="w-4 h-4 text-teal-600" />
            <span>Đăng Nhập / Tách Tài Khoản</span>
          </button>
        ) : null}

        {/* Navigation Tabs */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-teal-200 text-teal-800'
                        : typeof item.badge === 'number'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Accumulated Knowledge Capsule */}
        <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/70 border border-teal-100 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1 text-teal-700">
              <Droplets className="w-3.5 h-3.5 text-teal-500" />
              Tổng tri thức đã nạp
            </span>
            <span className="font-bold text-teal-700">{totalVolumeMl} ml</span>
          </div>
          <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalVolumeMl / 500) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Mỗi phút học = 5ml dung tích hấp thu tự do</span>
          </p>
        </div>
      </div>

      {/* Bottom Health & Sound Area */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Soundscape Ambient Controls */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="font-semibold text-[11px]">Âm thanh chữa lành:</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onToggleRain}
              title={isRainPlaying ? 'Tắt tiếng mưa rơi' : 'Bật tiếng mưa rơi dịu êm'}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isRainPlaying
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt toàn bộ âm thanh'}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isMuted
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Health Check-in */}
        <div className="bg-teal-50/50 p-3.5 rounded-2xl border border-teal-100/60">
          <p className="text-xs font-semibold text-slate-500 mb-2">Chẩn đoán năng lượng hôm nay:</p>
          <div className="flex justify-between items-center text-xl px-1">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMood(m)}
                title={m.label}
                className={`p-1 rounded-xl transition cursor-pointer hover:scale-125 ${
                  currentMood.id === m.id ? 'bg-white shadow-sm ring-2 ring-teal-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
          <p className="text-xs text-teal-800 mt-2 font-semibold text-center truncate">
            {currentMood.emoji} {currentMood.label}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 italic text-center line-clamp-2">
            {currentMood.prescription}
          </p>
        </div>
      </div>
    </aside>
  );
};
