import React, { useState } from 'react';
import { 
  Award, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  Palette, 
  Image as ImageIcon, 
  Check, 
  Scroll, 
  Printer, 
  X, 
  Sliders, 
  HelpCircle,
  Gem,
  Medal,
  ChevronRight
} from 'lucide-react';
import { 
  Achievement, 
  AchievementTier, 
  UserCustomization, 
  UserProfile 
} from '../types';
import { 
  THEME_PALETTES, 
  WALLPAPER_CONFIGS, 
  AVATAR_FRAMES 
} from '../utils/achievements';
import { soundEngine } from '../utils/audio';

interface AchievementsTabProps {
  achievements: Achievement[];
  customization: UserCustomization;
  onUpdateCustomization: (updates: Partial<UserCustomization>) => void;
  currentUser: UserProfile | null;
  onManualAdjustDays?: (days: number) => void;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  customization,
  onUpdateCustomization,
  currentUser,
  onManualAdjustDays,
}) => {
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'hall-of-fame' | 'customization' | 'days-sync'>('hall-of-fame');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showDaysModal, setShowDaysModal] = useState(false);
  const [inputDays, setInputDays] = useState(customization.customAccumulatedDays || 0);

  // Statistics
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedTier === 'all') return true;
    return ach.tier === selectedTier;
  });

  const handleEquipTitle = (title: string) => {
    onUpdateCustomization({ equippedTitle: title });
    soundEngine.playSuccessChime();
  };

  const handleEquipBadge = (badge: string) => {
    onUpdateCustomization({ equippedBadge: badge });
    soundEngine.playSuccessChime();
  };

  const handleEquipTheme = (themeId: any) => {
    onUpdateCustomization({ equippedTheme: themeId });
    soundEngine.playSuccessChime();
  };

  const handleEquipWallpaper = (wallpaperId: any) => {
    onUpdateCustomization({ equippedWallpaper: wallpaperId });
    soundEngine.playSuccessChime();
  };

  const handleEquipFrame = (frameId: any) => {
    onUpdateCustomization({ equippedFrame: frameId });
    soundEngine.playSuccessChime();
  };

  const handleSaveDays = () => {
    if (onManualAdjustDays) {
      onManualAdjustDays(Math.max(0, inputDays));
    }
    onUpdateCustomization({ customAccumulatedDays: Math.max(0, inputDays) });
    setShowDaysModal(false);
    soundEngine.playSuccessChime();
  };

  // Get list of all unlocked titles, badges, themes, wallpapers, frames
  const unlockedTitles = Array.from(
    new Set(
      achievements
        .filter((a) => a.unlocked && a.rewards.title)
        .map((a) => a.rewards.title as string)
    )
  );
  if (!unlockedTitles.includes('Bệnh Nhân Tập Sự')) {
    unlockedTitles.unshift('Bệnh Nhân Tập Sự');
  }

  const unlockedBadges = Array.from(
    new Set(
      achievements
        .filter((a) => a.unlocked && a.rewards.badge)
        .map((a) => a.rewards.badge as string)
    )
  );
  if (!unlockedBadges.includes('🌿 Mầm Non Tri Thức')) {
    unlockedBadges.unshift('🌿 Mầm Non Tri Thức');
  }

  const unlockedThemes = Array.from(
    new Set(
      achievements
        .filter((a) => a.unlocked && a.rewards.themeId)
        .map((a) => a.rewards.themeId as string)
    )
  );
  if (!unlockedThemes.includes('teal')) {
    unlockedThemes.unshift('teal');
  }

  const unlockedWallpapers = Array.from(
    new Set(
      achievements
        .filter((a) => a.unlocked && a.rewards.wallpaperId)
        .map((a) => a.rewards.wallpaperId as string)
    )
  );
  if (!unlockedWallpapers.includes('default')) {
    unlockedWallpapers.unshift('default');
  }

  const unlockedFrames = Array.from(
    new Set(
      achievements
        .filter((a) => a.unlocked && a.rewards.frameId)
        .map((a) => a.rewards.frameId as string)
    )
  );
  if (!unlockedFrames.includes('default')) {
    unlockedFrames.unshift('default');
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-teal-700/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                Hệ Thống Huân Chương Danh Dự
              </span>
              <span className="text-xs text-teal-200/80 font-medium">
                Khổ Luyện Dài Hạn (Tuần • Tháng • Năm)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Viện Bảo Tàng Thành Tựu & Chức Danh
            </h1>
            <p className="text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              Những nấc thang danh dự không dành cho sự hời hợt. Từng huy hiệu là minh chứng cho hàng trăm ngày thẩm thấu ngôn ngữ, kiên cường vượt qua áp lực tâm lý và tôi luyện thành thục Hán ngữ.
            </p>
          </div>

          {/* User Status Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[260px] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs text-teal-200">Tiến độ mở khóa</span>
              <span className="text-xs font-bold text-amber-300">
                {unlockedCount} / {totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5 my-3 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Chức danh:</span>
                <span className="font-bold text-amber-300">{customization.equippedTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Huy hiệu ghim:</span>
                <span className="font-bold text-white truncate max-w-[140px]">{customization.equippedBadge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar on Hero */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubTab('hall-of-fame')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'hall-of-fame'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Medal className="w-4 h-4" />
              Bảng Phong Thần & Huy Hiệu
            </button>
            <button
              onClick={() => setActiveSubTab('customization')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'customization'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              Tủ Đồ Danh Dự (Theme & Nền)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500/30 hover:bg-teal-500/50 text-teal-200 border border-teal-400/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Scroll className="w-4 h-4 text-amber-300" />
              Xem Bằng Khen Danh Dự
            </button>
            <button
              onClick={() => setShowDaysModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              title="Đồng bộ chuỗi ngày khổ luyện đã tích lũy trước đây"
            >
              <Sliders className="w-4 h-4 text-teal-300" />
              Bảo Lưu Ngày Rèn Luyện
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: HALL OF FAME (Danh sách các nhiệm vụ tuần, tháng, năm) */}
      {activeSubTab === 'hall-of-fame' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 px-2">Cấp độ kỳ hạn:</span>
              <button
                onClick={() => setSelectedTier('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedTier === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({totalCount})
              </button>
              <button
                onClick={() => setSelectedTier('week')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedTier === 'week'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                🥉 Cấp Độ Tuần (Tôi Luyện)
              </button>
              <button
                onClick={() => setSelectedTier('month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedTier === 'month'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                🥈 Cấp Độ Tháng (Chuyển Hóa)
              </button>
              <button
                onClick={() => setSelectedTier('year')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedTier === 'year'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                👑 Cấp Độ Năm (Huyền Thoại)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium px-2">
              Hiển thị {filteredAchievements.length} huân chương
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredAchievements.map((ach) => {
              const currentVal = ach.currentValue;
              const targetVal = ach.targetValue;
              const percent = Math.min(100, Math.round((currentVal / targetVal) * 100));
              const isTitleEquipped = customization.equippedTitle === ach.rewards.title;
              const isBadgeEquipped = customization.equippedBadge === ach.rewards.badge;

              return (
                <div
                  key={ach.id}
                  className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 relative border flex flex-col justify-between ${
                    ach.unlocked
                      ? 'bg-gradient-to-br from-white via-amber-50/20 to-teal-50/30 border-amber-300/60 shadow-md shadow-amber-100/50 hover:shadow-lg'
                      : 'bg-white/80 border-slate-200/80 shadow-xs opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Top Badge Tier Tag & Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* 3D / Embellished Icon badge */}
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md border ${
                            ach.unlocked
                              ? 'bg-gradient-to-tr from-amber-200 via-amber-100 to-white border-amber-300 shadow-amber-200/70 scale-105'
                              : 'bg-slate-100 border-slate-200 text-slate-400 grayscale'
                          }`}
                        >
                          {ach.badgeIcon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                ach.tier === 'week'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : ach.tier === 'month'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold'
                              }`}
                            >
                              {ach.tier === 'week'
                                ? 'Cấp Tuần'
                                : ach.tier === 'month'
                                ? 'Cấp Tháng'
                                : 'Huyền Thoại Năm'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {ach.timeHorizonLabel}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                            {ach.title}
                            {ach.unlocked && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* Unlock Status Stamp */}
                      {ach.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full shadow-xs">
                          <Unlock className="w-3 h-3" />
                          Đã mở khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
                          <Lock className="w-3 h-3" />
                          Đang tu luyện
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {ach.description}
                    </p>

                    {/* Progress Bar Section */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">
                          {ach.requirementText}
                        </span>
                        <span className="font-bold text-slate-700 font-mono">
                          {currentVal.toLocaleString()} / {targetVal.toLocaleString()}{' '}
                          <span className="text-teal-600">({percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${
                            ach.unlocked
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : 'bg-gradient-to-r from-teal-400 to-indigo-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Rewards Summary Pills */}
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Phần thưởng huân chương:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ach.rewards.title && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg font-semibold">
                            🏷️ Chức danh: [{ach.rewards.title}]
                          </span>
                        )}
                        {ach.rewards.badge && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg font-semibold">
                            🏅 Huy hiệu: {ach.rewards.badge}
                          </span>
                        )}
                        {ach.rewards.themeName && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-lg font-semibold">
                            🎨 Theme: {ach.rewards.themeName}
                          </span>
                        )}
                        {ach.rewards.wallpaperName && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-lg font-semibold">
                            🖼️ Nền: {ach.rewards.wallpaperName}
                          </span>
                        )}
                        {ach.rewards.frameName && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-lg font-semibold">
                            ✨ Khung Aura: {ach.rewards.frameName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    {ach.unlocked ? (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        {ach.rewards.title && (
                          <button
                            onClick={() => handleEquipTitle(ach.rewards.title!)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isTitleEquipped
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {isTitleEquipped ? <Check className="w-3.5 h-3.5" /> : null}
                            {isTitleEquipped ? 'Đang dùng chức danh' : 'Đeo chức danh'}
                          </button>
                        )}
                        {ach.rewards.badge && (
                          <button
                            onClick={() => handleEquipBadge(ach.rewards.badge!)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isBadgeEquipped
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {isBadgeEquipped ? <Check className="w-3.5 h-3.5" /> : null}
                            {isBadgeEquipped ? 'Đang ghim huy hiệu' : 'Ghim huy hiệu'}
                          </button>
                        )}
                        {ach.rewards.themeId && (
                          <button
                            onClick={() => handleEquipTheme(ach.rewards.themeId!)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                          >
                            Đổi Theme
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Còn thiếu{' '}
                          <strong className="text-slate-600">
                            {(targetVal - currentVal).toLocaleString()}
                          </strong>{' '}
                          mục tiêu
                        </span>
                        <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                          Cần kiên trì theo thời gian
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CUSTOMIZATION STUDIO (Tủ đồ danh dự) */}
      {activeSubTab === 'customization' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-teal-600" />
                Tủ Đồ Danh Dự & Tùy Chỉnh Giao Diện
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Trang bị những phần thưởng bạn đã vất vả đạt được qua hàng tuần, hàng tháng và hàng năm khổ học.
              </p>
            </div>

            {/* 1. CHỨC DANH HIỂN THỊ */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🏷️ Chức Danh Vinh Dự
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hiển thị trang trọng dưới tên bệnh nhân ở Header và Sổ Bệnh Án.
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Đang dùng: [{customization.equippedTitle}]
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {unlockedTitles.map((title) => {
                  const isCurrent = customization.equippedTitle === title;
                  return (
                    <button
                      key={title}
                      onClick={() => handleEquipTitle(title)}
                      className={`p-3 rounded-2xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/60 font-bold text-amber-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="truncate">[{title}]</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {isCurrent ? '✓ Đang kích hoạt' : 'Nhấn để chọn'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. HUY HIỆU GHIM HỒ SƠ */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🏅 Huy Hiệu Ghim Header & Sidebar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ghim cạnh ảnh đại diện để chứng thực đẳng cấp tu luyện.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Đang ghim: {customization.equippedBadge}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {unlockedBadges.map((badge) => {
                  const isCurrent = customization.equippedBadge === badge;
                  return (
                    <button
                      key={badge}
                      onClick={() => handleEquipBadge(badge)}
                      className={`p-3 rounded-2xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-300/60 font-bold text-teal-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="truncate font-medium">{badge}</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {isCurrent ? '✓ Đang ghim' : 'Nhấn để ghim'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. MÀU SẮC THEME KHÍ SẮC PHÒNG KHÁM */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🎨 Tông Màu Khí Sắc Ứng Dụng (Themes)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thay đổi ánh màu chủ đạo của toàn bộ hệ thống Mind Clinic.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  {THEME_PALETTES[customization.equippedTheme]?.name || 'Ngọc Bích Y Khoa'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(THEME_PALETTES).map((t) => {
                  const isUnlocked = unlockedThemes.includes(t.id);
                  const isCurrent = customization.equippedTheme === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => isUnlocked && handleEquipTheme(t.id)}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isUnlocked ? 'cursor-pointer hover:shadow-md' : 'opacity-60 cursor-not-allowed bg-slate-50'
                      } ${
                        isCurrent
                          ? 'ring-2 ring-teal-500 bg-white border-teal-300 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${t.accentClass} shadow-xs`}></div>
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đang dùng
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[10px] text-teal-600 font-semibold">Khả dụng</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Chưa mở khóa
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. HÌNH NỀN KHÔNG GIAN PHÒNG KHÁM */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🖼️ Không Gian & Nền Phòng Khám (Wallpapers)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chuyển đổi bối cảnh tu luyện từ phòng khám thanh lịch sang hiên trà, rừng trúc hay thư viện hoàng gia.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  {WALLPAPER_CONFIGS[customization.equippedWallpaper]?.name || 'Mặc định'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(WALLPAPER_CONFIGS).map((w) => {
                  const isUnlocked = unlockedWallpapers.includes(w.id);
                  const isCurrent = customization.equippedWallpaper === w.id;

                  return (
                    <div
                      key={w.id}
                      onClick={() => isUnlocked && handleEquipWallpaper(w.id)}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isUnlocked ? 'cursor-pointer hover:shadow-md' : 'opacity-60 cursor-not-allowed bg-slate-50'
                      } ${
                        isCurrent
                          ? 'ring-2 ring-indigo-500 bg-white border-indigo-300 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <ImageIcon className="w-5 h-5 text-indigo-500" />
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đang dùng
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[10px] text-teal-600 font-semibold">Khả dụng</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Chưa mở khóa
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">{w.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{w.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. KHUNG HÀO QUANG AVATAR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    ✨ Khung Hào Quang Avatar (Aura Frames)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vòng sáng bao quanh ảnh đại diện tại Header và thẻ Bệnh nhân.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {AVATAR_FRAMES[customization.equippedFrame]?.name || 'Mặc định'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(AVATAR_FRAMES).map((f) => {
                  const isUnlocked = unlockedFrames.includes(f.id);
                  const isCurrent = customization.equippedFrame === f.id;

                  return (
                    <div
                      key={f.id}
                      onClick={() => isUnlocked && handleEquipFrame(f.id)}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isUnlocked ? 'cursor-pointer hover:shadow-md' : 'opacity-60 cursor-not-allowed bg-slate-50'
                      } ${
                        isCurrent
                          ? 'ring-2 ring-rose-400 bg-white border-rose-300 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center shrink-0 ${f.ringClass}`}>
                          MC
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{f.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {isCurrent ? '✓ Đang kích hoạt' : isUnlocked ? 'Nhấn để trang bị' : 'Chưa mở khóa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: BẰNG KHEN DANH DỰ (Honorary Medical Certificate) */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#faf6ee] to-[#f4ebe0] rounded-3xl max-w-2xl w-full p-8 border-4 border-amber-600/30 shadow-2xl relative text-slate-800 space-y-6">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-amber-800/20">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center shadow-lg">
                  <Crown className="w-7 h-7 text-amber-950" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 tracking-wider uppercase font-serif">
                Bằng Khen Danh Dự Y Học Tri Thức
              </h2>
              <p className="text-xs text-amber-800 font-serif italic">
                Học Viện Lâm Sàng & Phục Hồi Ngôn Ngữ Mind Clinic
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 py-2 font-serif">
              <p className="text-xs text-slate-600 uppercase tracking-widest">
                Chứng nhận thành quả tu luyện thuộc về
              </p>
              <h3 className="text-2xl font-black text-teal-900">
                {currentUser?.displayName || currentUser?.email || 'Bệnh Nhân Tinh Anh Mind Clinic'}
              </h3>
              <div className="inline-block px-4 py-1.5 bg-amber-200/60 rounded-full border border-amber-400/50 text-amber-900 font-bold text-sm">
                Chức Danh Khắc Ghi: [{customization.equippedTitle}]
              </div>
              <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
                Đã kiên cường vượt qua các giai đoạn khó khăn trong tiến trình hấp thu Hán ngữ, không nản lòng trước áp lực thời gian, thẩm thấu thành công tri thức và đạt được huân chương cao quý: <strong>{customization.equippedBadge}</strong>.
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 border-t border-amber-800/20 flex items-center justify-between px-6 font-serif">
              <div className="text-left text-xs">
                <span className="block text-slate-500">Ngày cấp chứng nhận:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
                <span className="block text-[10px] text-teal-700 mt-1">Mã hồ sơ: MC-{Date.now().toString().slice(-6)}</span>
              </div>

              {/* Red Seal */}
              <div className="w-20 h-20 rounded-full border-4 border-rose-600/80 flex flex-col items-center justify-center text-rose-700 font-bold text-[10px] rotate-[-12deg] shadow-inner bg-rose-50/40">
                <span>MIND CLINIC</span>
                <span className="text-[12px] font-black">CHỨNG NHẬN</span>
                <span>DR. LING</span>
              </div>

              <div className="text-right text-xs">
                <span className="block text-slate-500">Bác Sĩ Trưởng Khoa:</span>
                <span className="font-bold text-amber-950 text-sm italic block mt-1">
                  Dr. Ling (林医生)
                </span>
                <span className="text-[10px] text-slate-500">Chữ ký điện tử y tế</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                In / Xuất Chứng Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BẢO LƯU / ĐỒNG BỘ NGÀY RÈN LUYỆN (Accumulated Days Tool) */}
      {showDaysModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-teal-600" />
                Bảo Lưu Ngày Rèn Luyện Tích Lũy
              </h3>
              <button
                onClick={() => setShowDaysModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Các nhiệm vụ thành tựu tính bằng <strong>tuần (70 ngày), tháng (100 - 180 ngày) và năm (365 - 1,095 ngày)</strong>. Nếu bạn đã có thời gian tự học tiếng Trung trước đây hoặc muốn đồng bộ chuỗi ngày tu luyện, hãy nhập tổng số ngày đã tích lũy vào đây để không bị mất thành quả!
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Tổng số ngày đã tích lũy:
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                value={inputDays}
                onChange={(e) => setInputDays(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold text-lg text-slate-800"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Gợi ý: 70 ngày (~10 tuần)</span>
                <span>100 ngày (~3.3 tháng)</span>
                <span>365 ngày (1 năm)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDaysModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveDays}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Lưu & Cập Nhật Thành Tựu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
