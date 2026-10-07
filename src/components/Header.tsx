import React from 'react';
import { ShieldCheck, Droplets, User, LogIn, LogOut, Crown, Award } from 'lucide-react';
import { UserProfile, UserCustomization } from '../types';
import { AVATAR_FRAMES } from '../utils/achievements';

interface HeaderProps {
  onOpenSickLeave: () => void;
  isFlowing: boolean;
  flowSeconds: number;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  customization?: UserCustomization;
  onNavigateToAchievements?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSickLeave,
  isFlowing,
  flowSeconds,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  customization,
  onNavigateToAchievements,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}p ${s < 10 ? '0' : ''}${s}s`;
  };

  const frameConfig = customization?.equippedFrame ? AVATAR_FRAMES[customization.equippedFrame] : AVATAR_FRAMES.default;

  return (
    <header className="h-16 bg-white border-b border-teal-50 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isFlowing ? 'bg-teal-500 animate-ping' : 'bg-emerald-400'}`}></span>
          <span className={`absolute inline-block w-2.5 h-2.5 rounded-full ${isFlowing ? 'bg-teal-500' : 'bg-emerald-400'}`}></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700 hidden sm:inline">
            Trạng thái:{' '}
            <span className="font-normal text-slate-500">
              {isFlowing ? 'Đang trong dòng chảy truyền dịch tự do' : 'Sẵn sàng nạp năng lượng tự nhiên'}
            </span>
          </span>
          {isFlowing && (
            <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
              <Droplets className="w-3 h-3 text-teal-600 animate-bounce" />
              Đã nạp: {formatTime(flowSeconds)} (~{Math.round((flowSeconds / 60) * 5)} ml)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Equipped Badge Pill at Header */}
        {customization?.equippedBadge && (
          <button
            onClick={onNavigateToAchievements}
            className="hidden lg:flex items-center space-x-1.5 bg-gradient-to-r from-amber-50 to-teal-50 border border-amber-200/80 hover:border-amber-300 px-2.5 py-1 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
            title="Nhấp để vào Viện Bảo Tàng Thành Tựu"
          >
            <span className="text-xs">{customization.equippedBadge}</span>
          </button>
        )}

        {/* User Account Pill */}
        {currentUser ? (
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 hover:border-teal-300 pl-2 pr-1.5 py-1 rounded-2xl transition shadow-xs">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 text-left cursor-pointer group"
              title={`Hồ sơ Firestore: ${currentUser.docId}`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Avatar'}
                  className={`w-7 h-7 rounded-full ${frameConfig?.ringClass || 'border border-teal-200'}`}
                />
              ) : (
                <div className={`w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold ${frameConfig?.ringClass || ''}`}>
                  {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
                </div>
              )}
              <div className="hidden md:block leading-tight max-w-[130px] truncate">
                <span className="block text-xs font-bold text-slate-700 truncate group-hover:text-teal-700">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
                {customization?.equippedTitle ? (
                  <span className="block text-[9px] text-amber-700 font-bold truncate">
                    [{customization.equippedTitle}]
                  </span>
                ) : (
                  <span className="block text-[9px] text-teal-600 font-mono truncate">
                    {currentUser.docId}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={onSignOut}
              title="Đăng xuất tài khoản này"
              className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-white transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 px-3 py-1.5 rounded-2xl font-semibold border border-teal-200 transition flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-teal-600" />
            <span>Đăng Nhập / Đổi Tài Khoản</span>
          </button>
        )}

        <button
          onClick={onOpenSickLeave}
          className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-200 px-3 py-1.5 rounded-2xl font-semibold border border-rose-100 transition flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Xin Giấy Nghỉ Ốm</span>
        </button>
      </div>
    </header>
  );
};

