import { 
  Achievement, 
  UserCustomization, 
  Task, 
  DripSession, 
  MedicalRecord, 
  PharmacyItem 
} from '../types';

export const INITIAL_CUSTOMIZATION: UserCustomization = {
  equippedTitle: 'Bệnh Nhân Tập Sự',
  equippedBadge: '🌿 Mầm Non Tri Thức',
  equippedTheme: 'teal',
  equippedWallpaper: 'default',
  equippedFrame: 'default',
  customAccumulatedDays: 0,
};

export const RAW_ACHIEVEMENTS: Omit<Achievement, 'currentValue' | 'unlocked' | 'unlockedAt'>[] = [
  // --- CẤP ĐỘ TUẦN (WEEKS) ---
  {
    id: 'ach-w1',
    title: 'Kiên Định Thập Chu',
    subtitle: '10 Tuần Điều Trị Liên Tục (70 Ngày)',
    tier: 'week',
    timeHorizonLabel: 'Cần tối thiểu 10 tuần (~70 ngày)',
    badgeIcon: '🥉',
    badgeName: 'Thạch Lam Tinh Phách',
    description: 'Duy trì điều trị tâm trí và rèn luyện tiếng Trung qua 10 tuần liên tục (70 ngày hoạt động tích lũy).',
    requirementText: 'Đạt mốc 70 ngày học tập hoặc truyền dịch tích lũy.',
    metricType: 'days',
    targetValue: 70,
    rewards: {
      title: 'Dược Sư Kiên Trì',
      badge: '🥉 Thạch Lam Tinh Phách',
      badgeIcon: '🥉',
      themeId: 'teal',
      themeName: 'Ngọc Bích Trầm Hương (Teal Pro)',
    },
  },
  {
    id: 'ach-w2',
    title: 'Bách Toa Khắc Cốt',
    subtitle: '100 Đơn Thuốc Học Tập Hoàn Thành',
    tier: 'week',
    timeHorizonLabel: 'Cần từ 8 - 14 tuần rèn luyện chuyên sâu',
    badgeIcon: '💊',
    badgeName: 'Kim Dược Huân Chương',
    description: 'Uống đủ và hoàn tất 100 đơn thuốc bài tập được bác sĩ kê toa, không trì hoãn hay bỏ cuộc giữa chừng.',
    requirementText: 'Hoàn thành 100 đơn thuốc (tasks done) trong danh sách việc cần làm.',
    metricType: 'tasks',
    targetValue: 100,
    rewards: {
      title: 'Dược Đồng Bách Thắng',
      badge: '💊 Kim Dược Huân Chương',
      badgeIcon: '💊',
      wallpaperId: 'tea-pavilion',
      wallpaperName: 'Hiên Trà Cổ Phong Ánh Trăng (Zen Tea Pavilion)',
    },
  },
  {
    id: 'ach-w3',
    title: 'Hải Lượng Tri Thức',
    subtitle: '50,000 ml Dung Tích Dịch Truyền',
    tier: 'week',
    timeHorizonLabel: 'Tương đương hơn 160 giờ truyền dịch tĩnh tâm',
    badgeIcon: '💧',
    badgeName: 'Hải Lam Tinh Tú',
    description: 'Nạp liên tục 50,000ml dung dịch tri thức vào não bộ, hình thành phản xạ ngoại ngữ tự nhiên không cần dịch thầm.',
    requirementText: 'Tích lũy tối thiểu 50,000 ml dịch truyền tại Bình Truyền Tri Thức.',
    metricType: 'volume',
    targetValue: 50000,
    rewards: {
      title: 'Bình Truyền Bất Tận',
      badge: '💧 Hải Lam Tinh Tú',
      badgeIcon: '💧',
      frameId: 'aura-cyan',
      frameName: 'Hào Quang Lam Ngọc (Aura Cyan Glow)',
    },
  },

  // --- CẤP ĐỘ THÁNG (MONTHS) ---
  {
    id: 'ach-m1',
    title: 'Bách Nhật Khổ Luyện',
    subtitle: '100 Ngày Khổ Học Hán Ngữ',
    tier: 'month',
    timeHorizonLabel: 'Cần hơn 3 tháng (100 ngày thực tế)',
    badgeIcon: '📜',
    badgeName: 'Bách Nhật Kim Bài',
    description: 'Vượt qua ngưỡng tâm lý dễ nản của 3 tháng đầu tiên. Đạt mốc 100 ngày kỷ luật và thẩm thấu Hán tự.',
    requirementText: 'Tích lũy đủ 100 ngày rèn luyện tại viện.',
    metricType: 'days',
    targetValue: 100,
    rewards: {
      title: 'Bách Nhật Học Sĩ',
      badge: '📜 Bách Nhật Kim Bài',
      badgeIcon: '📜',
      themeId: 'imperial-purple',
      themeName: 'Hoàng Gia Tử Đằng (Imperial Violet)',
    },
  },
  {
    id: 'ach-m2',
    title: 'Đại Dược Sư Bách Khoa',
    subtitle: '50 Dược Liệu Web & Video Chuyên Sâu',
    tier: 'month',
    timeHorizonLabel: 'Cần từ 4 - 6 tháng sưu tầm & phân tích',
    badgeIcon: '📚',
    badgeName: 'Vạn Quyển Thư Các',
    description: 'Xây dựng kho tài nguyên tự thân với 50 trang web, video hoặc bài giảng đã note mốc thời gian và kiến thức cốt lõi.',
    requirementText: 'Có ít nhất 50 ghi chép sub-items trong Tủ Thuốc Ngoại Trú.',
    metricType: 'pharmacy',
    targetValue: 50,
    rewards: {
      title: 'Đại Dược Sư Hán Điển',
      badge: '📚 Vạn Quyển Thư Các',
      badgeIcon: '📚',
      wallpaperId: 'imperial-library',
      wallpaperName: 'Thư Viện Hoàng Gia Cổ Điển (Imperial Parchment)',
    },
  },
  {
    id: 'ach-m3',
    title: 'Thần Y Trọng Bệnh',
    subtitle: '50 Bệnh Án Nghiêm Trọng Được Xử Lý',
    tier: 'month',
    timeHorizonLabel: 'Cần 5 - 6 tháng mổ xẻ ngữ pháp & chữ khó',
    badgeIcon: '🩺',
    badgeName: 'Thập Tự Huyền Vũ',
    description: 'Ghi chép và phân tích triệt để 50 ca bệnh hóc búa nhất (mức độ Nghiêm Trọng / Rất Khó) trong Hồ Sơ Bệnh Án.',
    requirementText: 'Lập 50 bệnh án phân loại mức độ Nghiêm Trọng.',
    metricType: 'records',
    targetValue: 50,
    rewards: {
      title: 'Thần Y Chiết Tự',
      badge: '🩺 Thập Tự Huyền Vũ',
      badgeIcon: '🩺',
      frameId: 'aura-fire',
      frameName: 'Vòng Lửa Cẩm Thạch (Jade Phoenix Fire)',
    },
  },
  {
    id: 'ach-m4',
    title: 'Bán Niên Tinh Tấn',
    subtitle: 'Nửa Năm (180 Ngày) Trị Liệu Bền Bỉ',
    tier: 'month',
    timeHorizonLabel: 'Cần trọn vẹn 6 tháng (180 ngày)',
    badgeIcon: '🛡️',
    badgeName: 'Bán Niên Kim Luân',
    description: 'Chữa lành hoàn toàn tâm lý sợ hãi tiếng Trung sau nửa năm kiên định, hình thành thói quen tự nhiên như hơi thở.',
    requirementText: 'Đạt mốc 180 ngày điều trị tại Mind Clinic.',
    metricType: 'days',
    targetValue: 180,
    rewards: {
      title: 'Bán Niên Y Viện Tinh Anh',
      badge: '🛡️ Bán Niên Kim Luân',
      badgeIcon: '🛡️',
      themeId: 'amber-gold',
      themeName: 'Hổ Phách Dược Điển (Amber Sunset)',
    },
  },

  // --- CẤP ĐỘ NĂM (YEARS) ---
  {
    id: 'ach-y1',
    title: 'Đại Tông Sư Hán Học',
    subtitle: '1 Năm Tinh Hoa (365 Ngày Khổ Luyện)',
    tier: 'year',
    timeHorizonLabel: 'Cần 1 Năm trọn vẹn (365 ngày)',
    badgeIcon: '👑',
    badgeName: 'Hoàng Kim Phượng Hoàng',
    description: '365 ngày tôi luyện không từ bỏ. Bệnh nhân lột xác thành bậc thầy ngôn ngữ với nền tảng ngữ pháp và phản xạ thâm sâu.',
    requirementText: 'Đạt mốc 365 ngày rèn luyện kiên định.',
    metricType: 'days',
    targetValue: 365,
    rewards: {
      title: 'Đại Tông Sư Hán Học',
      badge: '👑 Hoàng Kim Phượng Hoàng',
      badgeIcon: '👑',
      themeId: 'dark-ink',
      themeName: 'Trúc Lâm Thủy Mặc (Dark Ink Scholar)',
      wallpaperId: 'bamboo-waterfall',
      wallpaperName: 'Trúc Lâm Thác Nước Tĩnh Tâm (Zen Waterfall)',
      frameId: 'aura-gold',
      frameName: 'Hào Quang Vàng Hoàng Kim (Golden Radiant Glow)',
    },
  },
  {
    id: 'ach-y2',
    title: 'Bất Tử Dược Vương',
    subtitle: '2 Năm Bền Bỉ (730 Ngày Học Tập)',
    tier: 'year',
    timeHorizonLabel: 'Cần 2 Năm kiên cường (730 ngày)',
    badgeIcon: '💎',
    badgeName: 'Kim Cương Cửu Thiên',
    description: 'Hai năm gắn bó cùng Mind Clinic, hấp thu trọn vẹn tinh hoa Hán ngữ. Tri thức hòa quyện vào tâm trí như suối nguồn vô tận.',
    requirementText: 'Đạt mốc 730 ngày điều trị trí não.',
    metricType: 'days',
    targetValue: 730,
    rewards: {
      title: 'Bất Tử Dược Vương',
      badge: '💎 Kim Cương Cửu Thiên',
      badgeIcon: '💎',
      themeId: 'sakura-rose',
      themeName: 'Hoa Anh Đào Dưỡng Tâm (Calming Sakura)',
      wallpaperId: 'cyber-chamber',
      wallpaperName: 'Buồng Truyền Sóng Não Cyber Zenith',
      frameId: 'aura-dragon',
      frameName: 'Khung Thần Long Thái Cực (Celestial Dragon)',
    },
  },
  {
    id: 'ach-y3',
    title: 'Viện Trưởng Tối Cao Danh Dự',
    subtitle: '3 Năm Đỉnh Cao (1,095 Ngày Huyền Thoại)',
    tier: 'year',
    timeHorizonLabel: 'Cần 3 Năm huyền thoại (1,095 ngày)',
    badgeIcon: '🐉',
    badgeName: 'Thần Long Thái Cực',
    description: 'Cảnh giới tối cao của viện: Tự mình chữa khỏi hoàn toàn mọi rào cản ngôn ngữ, sẵn sàng chỉ dạy và truyền thụ cho thế hệ sau.',
    requirementText: 'Đạt mốc 1,095 ngày rèn luyện và nghiên cứu.',
    metricType: 'days',
    targetValue: 1095,
    rewards: {
      title: 'Viện Trưởng Tối Cao Danh Dự',
      badge: '🐉 Thần Long Thái Cực',
      badgeIcon: '🐉',
      themeId: 'celestial-blue',
      themeName: 'Biển Sâu Alpha Vô Cực (Midnight Indigo)',
      frameId: 'aura-dragon',
      frameName: 'Thần Long Hộ Mệnh Cửu Trùng Thiên',
    },
  },
];

export function computeAchievements(
  tasks: Task[],
  sessions: DripSession[],
  medicalRecords: MedicalRecord[],
  pharmacyItems: PharmacyItem[],
  customDays = 0,
  savedUnlockedMap: Record<string, string> = {}
): Achievement[] {
  // 1. Calculate active distinct days
  const sessionDays = new Set(
    sessions
      .map((s) => s.startTime?.split('T')[0] || s.date || '')
      .filter(Boolean)
  );
  const calculatedDays = Math.max(sessionDays.size, 1);
  const totalDays = Math.max(calculatedDays, customDays);

  // 2. Calculate done tasks
  const completedTasks = tasks.filter((t) => t.done).length;

  // 3. Calculate total volume
  const totalVolume = sessions.reduce((acc, s) => acc + (s.volumeMl || 0), 0);

  // 4. Calculate severe medical records
  const severeRecords = medicalRecords.filter(
    (r) => r.severity && r.severity.includes('Nghiêm trọng')
  ).length;

  // 5. Calculate pharmacy sub-items with notes or study progress
  let pharmacySubItemsCount = 0;
  for (const item of pharmacyItems) {
    if (item.subItems) {
      pharmacySubItemsCount += item.subItems.length;
    }
  }

  return RAW_ACHIEVEMENTS.map((raw) => {
    let current = 0;
    switch (raw.metricType) {
      case 'days':
        current = totalDays;
        break;
      case 'tasks':
        current = completedTasks;
        break;
      case 'volume':
        current = totalVolume;
        break;
      case 'records':
        current = severeRecords;
        break;
      case 'pharmacy':
        current = pharmacySubItemsCount;
        break;
    }

    const isUnlocked = current >= raw.targetValue || Boolean(savedUnlockedMap[raw.id]);
    const unlockedAt = savedUnlockedMap[raw.id] || (current >= raw.targetValue ? new Date().toLocaleDateString('vi-VN') : undefined);

    return {
      ...raw,
      currentValue: current,
      unlocked: isUnlocked,
      unlockedAt,
    };
  });
}

export interface ThemeConfig {
  id: string;
  name: string;
  desc: string;
  accentClass: string;
  bgGradClass: string;
  borderClass: string;
  pillClass: string;
  sidebarBorder: string;
}

export const THEME_PALETTES: Record<string, ThemeConfig> = {
  teal: {
    id: 'teal',
    name: 'Ngọc Bích Y Khoa (Mặc định)',
    desc: 'Tươi mát, dịu mắt, chữa lành êm dịu theo chuẩn lâm sàng Mind Clinic.',
    accentClass: 'from-teal-500 to-emerald-400',
    bgGradClass: 'bg-[#f6fbf9]',
    borderClass: 'border-teal-100',
    pillClass: 'bg-teal-50 text-teal-700 border-teal-200',
    sidebarBorder: 'border-teal-100',
  },
  'imperial-purple': {
    id: 'imperial-purple',
    name: 'Hoàng Gia Tử Đằng (Imperial Violet)',
    desc: 'Sắc tím quý phái của các học sĩ Hán ngữ triều đình, thanh thoát và uyên bác.',
    accentClass: 'from-purple-600 to-indigo-500',
    bgGradClass: 'bg-[#faf7fd]',
    borderClass: 'border-purple-100',
    pillClass: 'bg-purple-50 text-purple-700 border-purple-200',
    sidebarBorder: 'border-purple-100',
  },
  'amber-gold': {
    id: 'amber-gold',
    name: 'Hổ Phách Dược Điển (Amber Sunset)',
    desc: 'Ánh vàng ấm của tủ thuốc đông y cổ truyền, kích thích tư duy chiết tự.',
    accentClass: 'from-amber-500 to-orange-400',
    bgGradClass: 'bg-[#fdfaf3]',
    borderClass: 'border-amber-100',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200',
    sidebarBorder: 'border-amber-100',
  },
  'dark-ink': {
    id: 'dark-ink',
    name: 'Trúc Lâm Thủy Mặc (Dark Scholar Ink)',
    desc: 'Nét bút lông mực tàu ngàn năm, phong thái trầm tĩnh của bậc đại sư.',
    accentClass: 'from-slate-800 to-teal-800',
    bgGradClass: 'bg-[#f3f4f6]',
    borderClass: 'border-slate-300',
    pillClass: 'bg-slate-800 text-teal-300 border-slate-700',
    sidebarBorder: 'border-slate-300',
  },
  'sakura-rose': {
    id: 'sakura-rose',
    name: 'Hoa Anh Đào Dưỡng Tâm (Calming Sakura)',
    desc: 'Hồng phấn dịu ngọt xua tan hoàn toàn cảm giác căng thẳng khi nạp từ vựng.',
    accentClass: 'from-rose-400 to-pink-500',
    bgGradClass: 'bg-[#fdf7f9]',
    borderClass: 'border-rose-100',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200',
    sidebarBorder: 'border-rose-100',
  },
  'celestial-blue': {
    id: 'celestial-blue',
    name: 'Biển Sâu Alpha Vô Cực (Midnight Indigo)',
    desc: 'Tông màu xanh thẳm vô cực đưa não bộ vào trạng thái sóng Alpha sâu nhất.',
    accentClass: 'from-blue-600 to-cyan-500',
    bgGradClass: 'bg-[#f2f7fd]',
    borderClass: 'border-blue-100',
    pillClass: 'bg-blue-50 text-blue-700 border-blue-200',
    sidebarBorder: 'border-blue-100',
  },
};

export interface WallpaperConfig {
  id: string;
  name: string;
  desc: string;
  bgClass: string;
  patternOverlay?: string;
}

export const WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  default: {
    id: 'default',
    name: 'Phòng Khám Hiện Đại Tối Giản',
    desc: 'Không gian màu ngọc lam sạch sẽ, không gây xao nhãng.',
    bgClass: 'bg-gradient-to-br from-[#f6fbf9] via-[#edf7f4] to-[#f6fbf9]',
  },
  'tea-pavilion': {
    id: 'tea-pavilion',
    name: 'Hiên Trà Cổ Phong Ánh Trăng (Zen Tea Pavilion)',
    desc: 'Mặt bàn trà gỗ ấm, ánh trăng vằng vặc và làn khói hương trầm hư ảo.',
    bgClass: 'bg-gradient-to-br from-[#faf4ec] via-[#f4ebe1] to-[#f8f1e7]',
    patternOverlay: 'radial-gradient(ellipse at top right, rgba(217, 119, 6, 0.06), transparent 70%)',
  },
  'imperial-library': {
    id: 'imperial-library',
    name: 'Thư Viện Hoàng Gia Cổ Điển (Imperial Parchment)',
    desc: 'Sách cổ thơm mùi giấy da, kệ gỗ đàn hương vĩ đại của triều đại thịnh vượng.',
    bgClass: 'bg-gradient-to-br from-[#f8f6f0] via-[#f1eee4] to-[#f5f2e8]',
    patternOverlay: 'radial-gradient(circle at 50% 10%, rgba(180, 83, 9, 0.05), transparent 60%)',
  },
  'bamboo-waterfall': {
    id: 'bamboo-waterfall',
    name: 'Trúc Lâm Thác Nước Tĩnh Tâm (Zen Bamboo)',
    desc: 'Rừng trúc xanh mướt reo trong gió ngàn, tiếng suối chảy gột rửa mọi muộn phiền.',
    bgClass: 'bg-gradient-to-br from-[#edf6f0] via-[#e2f0e7] to-[#eaf5ee]',
    patternOverlay: 'radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.07), transparent 70%)',
  },
  'cyber-chamber': {
    id: 'cyber-chamber',
    name: 'Buồng Sóng Não Cyber Zenith (Alpha Lab)',
    desc: 'Phòng truyền dịch công nghệ sóng não Alpha vị lai, ánh neon dịu êm.',
    bgClass: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-slate-100',
    patternOverlay: 'radial-gradient(circle at top center, rgba(6, 182, 212, 0.15), transparent 80%)',
  },
};

export const AVATAR_FRAMES: Record<string, { id: string; name: string; ringClass: string; glowClass: string }> = {
  default: {
    id: 'default',
    name: 'Viền Ngọc Bích Mảnh (Mặc định)',
    ringClass: 'ring-2 ring-teal-300 ring-offset-2',
    glowClass: '',
  },
  'aura-cyan': {
    id: 'aura-cyan',
    name: 'Hào Quang Lam Ngọc (Neon Cyan Pulse)',
    ringClass: 'ring-3 ring-cyan-400 ring-offset-2 ring-offset-white shadow-lg shadow-cyan-300/60 animate-pulse',
    glowClass: 'border-2 border-cyan-400',
  },
  'aura-gold': {
    id: 'aura-gold',
    name: 'Hào Quang Vàng Hoàng Kim (Golden Radiant)',
    ringClass: 'ring-4 ring-amber-400 ring-offset-2 ring-offset-amber-50 shadow-xl shadow-amber-300/70',
    glowClass: 'border-2 border-amber-400',
  },
  'aura-fire': {
    id: 'aura-fire',
    name: 'Vòng Lửa Cẩm Thạch (Jade Phoenix Fire)',
    ringClass: 'ring-3 ring-emerald-500 ring-offset-2 ring-offset-emerald-100 shadow-xl shadow-emerald-400/60',
    glowClass: 'border-2 border-emerald-500',
  },
  'aura-dragon': {
    id: 'aura-dragon',
    name: 'Khung Thần Long Thái Cực (Celestial Dragon)',
    ringClass: 'ring-4 ring-indigo-500 ring-offset-3 ring-offset-purple-100 shadow-2xl shadow-indigo-500/70 animate-bounce-slow',
    glowClass: 'border-2 border-indigo-400',
  },
};
