import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, MOODS } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { PrescriptionsTab } from './components/PrescriptionsTab';
import { MedicalNotesTab } from './components/MedicalNotesTab';
import { PharmacyTab } from './components/PharmacyTab';
import { AiDoctorTab } from './components/AiDoctorTab';
import { SickLeaveModal } from './components/SickLeaveModal';
import { MusicPlayerModal } from './components/MusicPlayerModal';
import { 
  Task, 
  DripSession, 
  PharmacyItem, 
  SubPharmacyItem,
  MedicalRecord,
  RecordSeverity,
  ChatMessage, 
  MoodType, 
  DosageType, 
  TaskCategory, 
  PriorityLevel, 
  MusicTrack 
} from './types';
import { soundEngine } from './utils/audio';

// Initial Defaults with rich priorities, documents, scheduled times and notes
const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: 'Nhai 5 chữ Hán chỉ cảm xúc (喜, 怒, 哀, 乐, 怕)',
    dosage: 'Liều nhẹ (5 - 10 phút)',
    category: 'Hán tự (Hanzi)',
    priority: 'Bắt buộc uống (Khẩn cấp)',
    scheduledTime: '08:30',
    documentUrl: 'https://hanzii.net',
    documentName: 'Từ điển Hanzii tra bộ Tâm & Hán tự',
    notes: 'Chú ý bộ Tâm (忄) ở chữ 怕 (pà - sợ) và 怒 (nù - giận). Uống liều này vào đầu buổi sáng.',
    done: false,
    createdAt: 'Hôm nay',
  },
  {
    id: 2,
    title: 'Phân biệt bộ ba trợ từ kết cấu 的, 得, 地',
    dosage: 'Liều vừa (20 - 30 phút)',
    category: 'Ngữ pháp',
    priority: 'Quan trọng (Uống trước)',
    scheduledTime: '11:00',
    documentUrl: 'https://resources.allsetlearning.com/chinese/grammar/',
    documentName: 'Chinese Grammar Wiki (AllSet Learning)',
    notes: 'Quy tắc vàng: 的 nối danh từ, 得 đứng sau động từ chỉ mức độ, 地 đứng trước động từ.',
    done: false,
    createdAt: 'Hôm nay',
  },
  {
    id: 3,
    title: 'Đọc diễn cảm 1 đoạn hội thoại ngắn tiếng Trung',
    dosage: 'Liều vừa (20 - 30 phút)',
    category: 'Khẩu ngữ',
    priority: 'Bình thường',
    scheduledTime: '15:00',
    notes: 'Đọc to thành tiếng, không chú trọng ngữ pháp, thả lỏng cơ mặt.',
    done: false,
    createdAt: 'Hôm nay',
  },
  {
    id: 4,
    title: 'Tắm ngôn ngữ: Xem 1 clip ẩm thực trên Bilibili',
    dosage: 'Liều vừa (20 - 30 phút)',
    category: 'Luyện nghe',
    priority: 'Tùy chọn / Thư giãn',
    scheduledTime: '20:30',
    documentUrl: 'https://www.bilibili.com',
    documentName: 'Kênh Bilibili cuộc sống',
    notes: 'Chỉ nghe ngữ điệu tự nhiên, không cần tra từ vựng.',
    done: false,
    createdAt: 'Hôm nay',
  },
];

const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Cổ Phong Thanh Thản (Guzheng & Zen Flute)',
    artist: 'Mind Clinic Zen Ensemble',
    url: 'https://cdn.freesound.org/previews/568/568581_11861866-lq.mp3',
    category: 'Cổ phong tĩnh tâm',
  },
  {
    id: 'track-2',
    title: 'Lo-Fi Trà Chiều Dưỡng Não (Study Chill Beats)',
    artist: 'Lofi Healing Lab',
    url: 'https://cdn.freesound.org/previews/612/612604_11861866-lq.mp3',
    category: 'Lofi học tập',
  },
  {
    id: 'track-3',
    title: 'Sóng Não Alpha 10Hz (Tập Trung Sâu Không Mỏi)',
    artist: 'Neuro Focus Wave',
    url: 'https://cdn.freesound.org/previews/467/467882_6142149-lq.mp3',
    category: 'Sóng não Alpha',
  },
  {
    id: 'track-4',
    title: 'Mưa Rơi Mái Hiên Bệnh Viện (Peaceful Rain)',
    artist: 'Nature Sounds Therapy',
    url: 'https://cdn.freesound.org/previews/530/530415_1156514-lq.mp3',
    category: 'Thiên nhiên chữa lành',
  },
  {
    id: 'track-5',
    title: 'Suối Reo Rừng Trúc (Zen Temple Brook)',
    artist: 'Bamboo Stream Ambient',
    url: 'https://cdn.freesound.org/previews/512/512471_11861866-lq.mp3',
    category: 'Thiên nhiên chữa lành',
  },
];

const DEFAULT_PHARMACY: PharmacyItem[] = [
  {
    id: 'bilibili',
    title: 'Bilibili (哔哩哔哩)',
    category: 'Video & Nghe',
    desc: 'Nền tảng video nội địa Trung, học tiếng lóng và phản xạ ngữ cảnh đời sống tự nhiên nhất.',
    url: 'https://www.bilibili.com',
    iconText: '📺',
    badge: 'Tắm ngôn ngữ thực tế',
    badgeColor: 'bg-cyan-50 text-cyan-600',
    subItems: [
      {
        id: 'sub-bili-1',
        title: 'Tập 1: 21 Thanh mẫu & Vận mẫu tiếng Trung (Phát âm chuẩn Bắc Kinh)',
        url: 'https://www.bilibili.com/video/BV1xx411c7mD',
        note: 'Đã xem đến 08:35 - Chú ý cách đặt đầu lưỡi của âm zh, ch, sh và các âm bật hơi p, t, k.',
        timestampProgress: '08:35 / 18:20',
        isCompleted: false,
        linkedMedicalNoteTitle: 'Bệnh Án #Pinyin-ThanhMẫu',
      },
      {
        id: 'sub-bili-2',
        title: 'Vlog Đời Sống: Một Ngày Đi Chợ Bắc Kinh & Trả Giá Tiếng Trung',
        url: 'https://www.bilibili.com/video/BV1yy411c8kE',
        note: 'Lưu ý từ lóng: 多少钱 (bao nhiêu tiền), 便宜一点 (rẻ chút đi), 太贵了 (đắt quá).',
        timestampProgress: '12:10 / 15:00',
        isCompleted: true,
        linkedMedicalNoteTitle: 'Bệnh Án #KhauNgu-DiCho',
      },
    ],
  },
  {
    id: 'hanzii',
    title: 'Hanzii Dictionary',
    category: 'Từ điển',
    desc: 'Từ điển tra chữ Hán, ngữ pháp, nhận diện giọng nói và luyện đề HSK chuẩn xác.',
    url: 'https://hanzii.net',
    iconText: '汉',
    badge: 'Từ điển & Bộ thủ',
    badgeColor: 'bg-rose-50 text-rose-500',
    subItems: [
      {
        id: 'sub-hanzii-1',
        title: 'Bảng tra 214 Bộ Thủ Hán Tự & Quy Tắc Chiết Tự',
        url: 'https://hanzii.net/radicals',
        note: 'Đã học xong 8 bộ thủ gốc: Nhân, Thủy, Mộc, Tâm, Khẩu, Thủ, Miên, Ngôn.',
        timestampProgress: '8/8 Bộ Gốc',
        isCompleted: true,
        linkedMedicalNoteTitle: 'Bệnh Án #8-Bo-Thu-Goc',
      },
      {
        id: 'sub-hanzii-2',
        title: 'Ngữ pháp HSK 3: So sánh 了解 (Liǎojiě) và 理解 (Lǐjiě)',
        url: 'https://hanzii.net/grammar/hsk3',
        note: 'Ghi chú quan trọng: 了解 là biết thông tin bên ngoài; 理解 là thấu hiểu tâm can.',
        timestampProgress: 'Đang ôn',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'grammar-wiki',
    title: 'Chinese Grammar Wiki',
    category: 'Ngữ pháp',
    desc: 'Bách khoa toàn thư ngữ pháp tiếng Trung phân cấp từ A1 đến C1 chuẩn quốc tế.',
    url: 'https://resources.allsetlearning.com/chinese/grammar/',
    iconText: '法',
    badge: 'Ngữ pháp toàn diện',
    badgeColor: 'bg-indigo-50 text-indigo-600',
    subItems: [
      {
        id: 'sub-gw-1',
        title: 'Cấu trúc câu chữ Ba (把) trong tiếng Trung A2',
        url: 'https://resources.allsetlearning.com/chinese/grammar/The_%22ba%22_sentence',
        note: 'Công thức: S + 把 + O + V + Thành phần khác. Nhớ là vị ngữ phải xử lý tân ngữ.',
        timestampProgress: 'Quy tắc 1/4',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'bishun',
    title: 'Bishun Stroke Order',
    category: 'Tập viết Hán tự',
    desc: 'Mô phỏng động tác viết từng nét bút thuận chuẩn xác của mọi chữ Hán.',
    url: 'https://bishun.strokeorder.info',
    iconText: '笔',
    badge: 'Thứ tự nét viết',
    badgeColor: 'bg-amber-50 text-amber-600',
    subItems: [],
  },
  {
    id: 'pleco',
    title: 'Pleco Chinese Dictionary',
    category: 'Từ điển',
    desc: 'Công cụ tra từ vựng chuyên sâu dành cho người học tiếng Trung toàn cầu.',
    url: 'https://www.pleco.com',
    iconText: '鱼',
    badge: 'Từ điển sâu sắc',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    subItems: [],
  },
  {
    id: 'dong-chinese',
    title: 'Dong Chinese',
    category: 'Tập viết Hán tự',
    desc: 'Khám phá lịch sử tiến hóa chữ Hán từ Giáp Cốt Văn cổ đại đến chữ giản thể hiện đại.',
    url: 'https://www.dong-chinese.com',
    iconText: '字',
    badge: 'Tiến hóa chữ Hán',
    badgeColor: 'bg-purple-50 text-purple-600',
    subItems: [],
  },
];

const DEFAULT_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    title: 'Phân biệt cụm 3 trợ từ kết cấu 的 (de), 得 (de), 地 (de)',
    severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
    category: 'Ngữ pháp',
    content: `• 的 (Đích): Nối định ngữ với trung tâm ngữ (Định ngữ + 的 + Danh từ). Ví dụ: 我的书 (Sách của tôi), 漂亮的女孩 (Cô gái xinh đẹp).\n• 得 (Đắc): Đứng sau động từ hoặc tính từ để bổ nghĩa mức độ/khả năng (Động từ/Tính từ + 得 + Bổ ngữ). Ví dụ: 跑得快 (Chạy nhanh), 学得好 (Học giỏi).\n• 地 (Địa): Đứng trước động từ bổ nghĩa cách thức hành động (Phó từ/Tính từ + 地 + Động từ). Ví dụ: 慢慢地走 (Đi từ từ), 认真地听 (Chăm chú lắng nghe).`,
    createdAt: 'Hôm nay',
    doctorAssigned: true,
  },
  {
    id: 'rec-2',
    title: 'Cặp từ nhận thức dễ nhầm lẫn: 了解 (Liǎojiě) và 理解 (Lǐjiě)',
    severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
    category: 'Từ vựng',
    content: `• 了解 (Liǎojiě): Biết rõ về tình hình bên ngoài, hoàn cảnh, sự kiện thực tế. Ví dụ: 我很了解他的情况 (Tôi nắm rất rõ tình hình của anh ấy).\n• 理解 (Lǐjiě): Thấu hiểu sâu sắc nội tâm, tâm tư, lý lẽ bên trong, đồng cảm với người khác. Ví dụ: 请理解我的苦衷 (Xin hãy thấu hiểu và thông cảm cho nỗi khổ tâm của tôi).\n🌿 Mẹo ghi nhớ: Nắm tình hình bên ngoài dùng 了解; thấu suốt tâm can bên trong dùng 理解!`,
    createdAt: 'Hôm nay',
    doctorAssigned: true,
  },
  {
    id: 'rec-3',
    title: 'Chiết tự chữa lành chữ Hán: 休 (xiū) và 安 (ān)',
    severity: 'Trung bình (Cần theo dõi)',
    category: 'Hán tự',
    content: `• Chữ 休 (xiū - nghỉ ngơi): Bộ Nhân đứng (亻) tựa vào bộ Mộc (木 - cái cây). Con người tựa vào gốc cây mát rượi để nghỉ ngơi hồi phục sinh lực.\n• Chữ 安 (ān - an yên, bình an): Bộ Miên (宀 - mái nhà) che chở cho bộ Nữ (女 - người phụ nữ). Người phụ nữ bình yên và hạnh phúc dưới mái nhà ấm áp chính là chữ An!`,
    createdAt: 'Hôm nay',
    doctorAssigned: true,
  },
  {
    id: 'rec-4',
    title: 'Quy tắc biến điệu chữ 不 (bù) và chữ 一 (yī)',
    severity: 'Nhẹ (Dễ - Đã ổn định)',
    category: 'Phát âm',
    content: `• Chữ 不 (bù - thanh 4): Khi đi trước từ mang thanh 4 thì biến điệu thành thanh 2 (bú). Ví dụ: 不是 (bú shì), 不要 (bú yào). Đi trước các thanh 1, 2, 3 giữ nguyên thanh 4.\n• Chữ 一 (yī - thanh 1): Đọc yī khi đếm số thứ tự. Trước từ mang thanh 4 biến thành thanh 2 (yí), ví dụ: 一样 (yí yàng). Trước từ thanh 1, 2, 3 biến thành thanh 4 (yì), ví dụ: 一起 (yì qǐ).`,
    createdAt: 'Hôm nay',
  },
];

const INITIAL_NOTE = `# 📋 SỔ BỆNH ÁN & GHI CHÉP TRI THỨC - MIND CLINIC
---
Chào mừng bạn đến với không gian tự do ghi chép! Không giới hạn, không chấm điểm.

【Từ mới hôm nay】: 休息 (xiūxi)
【Ý nghĩa】: Nghỉ ngơi, dưỡng sức
【Chiết tự chữa lành】:
• Chữ 休 (xiū): Gồm bộ Nhân đứng (亻- người) tựa vào bộ Mộc (木 - cái cây). Con người tựa vào gốc cây râm mát để nghỉ ngơi!
• Chữ 息 (xī): Gồm chữ Tự (自 - cái mũi/bản thân) ở trên chữ Tâm (心 - trái tim). Hơi thở và trái tim điều hòa êm dịu = Nghỉ ngơi trọn vẹn.

👉 *Ghi chú của bệnh nhân*: Hôm nay mình đã nạp tri thức rất nhẹ nhàng!`;

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentMood, setCurrentMood] = useState<MoodType>(MOODS[1]);
  const [isSickLeaveOpen, setIsSickLeaveOpen] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);

  // Flow-time Accumulator States
  const [flowSeconds, setFlowSeconds] = useState<number>(0);
  const [isFlowing, setIsFlowing] = useState<boolean>(false);
  const [dripSpeed, setDripSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  // Music Player States
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_music_tracks');
      return saved ? JSON.parse(saved) : DEFAULT_MUSIC_TRACKS;
    } catch {
      return DEFAULT_MUSIC_TRACKS;
    }
  });

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(() => {
    return musicTracks[0] || null;
  });
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sound States
  const [isRainPlaying, setIsRainPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Persistent States
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [sessions, setSessions] = useState<DripSession[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notes, setNotes] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_notes');
      return saved !== null ? saved : INITIAL_NOTE;
    } catch {
      return INITIAL_NOTE;
    }
  });

  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_pharmacy');
      return saved ? JSON.parse(saved) : DEFAULT_PHARMACY;
    } catch {
      return DEFAULT_PHARMACY;
    }
  });

  // Medical Records State (Hồ sơ & Bệnh án có phân loại độ khó / nghiêm trọng)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_medical_records');
      return saved ? JSON.parse(saved) : DEFAULT_MEDICAL_RECORDS;
    } catch {
      return DEFAULT_MEDICAL_RECORDS;
    }
  });

  // AI Doctor API Linking States (Mỗi bệnh nhân tự liên kết API trước khi dùng)
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('mind_clinic_user_api_key') || '';
  });

  const [isApiLinked, setIsApiLinked] = useState<boolean>(() => {
    return localStorage.getItem('mind_clinic_api_linked') === 'true';
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: '1',
        sender: 'doctor',
        text: `🩺 **Chào bạn! Tôi là Dr. Ling - Bác Sĩ Trưởng Khoa Ngôn Ngữ & Trị Liệu.**\n\nTôi ở đây để giúp bạn giải mã các "triệu chứng" ngữ pháp khó hiểu, phân tích chiết tự chữ Hán, tra cứu đối chiếu các bệnh án bạn đã lưu, và đặc biệt là tự động ghi chép bệnh án thay bạn khi có yêu cầu.\n\nHãy gửi câu hỏi hoặc tâm sự về việc học của bạn nhé!`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [isDoctorLoading, setIsDoctorLoading] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mind_clinic_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_notes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_pharmacy', JSON.stringify(pharmacyItems));
  }, [pharmacyItems]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_music_tracks', JSON.stringify(musicTracks));
  }, [musicTracks]);

  // Handle Music Player Audio
  useEffect(() => {
    if (audioPlayerRef.current) {
      if (isPlayingMusic && !isMuted) {
        audioPlayerRef.current.play().catch(() => {
          setIsPlayingMusic(false);
        });
      } else {
        audioPlayerRef.current.pause();
      }
    }
  }, [isPlayingMusic, currentTrack, isMuted]);

  // Flow-time Accumulator Timer & Sound Effect
  const dripCounterRef = useRef<number>(0);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFlowing) {
      // Auto-start music if not playing yet and not muted
      if (!isPlayingMusic && !isMuted) {
        setIsPlayingMusic(true);
      }

      interval = setInterval(() => {
        setFlowSeconds((prev) => prev + 1);
        dripCounterRef.current += 1;

        // Periodic drip sound according to speed
        const dripIntervalSecs = dripSpeed === 'slow' ? 3 : dripSpeed === 'fast' ? 1 : 2;
        if (dripCounterRef.current % dripIntervalSecs === 0) {
          soundEngine.playDripSound();
        }
      }, 1000);
    } else {
      // If user pauses flow, don't necessarily stop music unless desired
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFlowing, dripSpeed, isPlayingMusic, isMuted]);

  // Total accumulated volume across all sessions + current in-progress
  const totalVolumeMl =
    sessions.reduce((acc, curr) => acc + curr.volumeMl, 0) +
    Math.round((flowSeconds / 60) * 5);

  const handleToggleFlow = () => {
    const nextState = !isFlowing;
    setIsFlowing(nextState);
    soundEngine.playDripSound();

    if (nextState && !isPlayingMusic && !isMuted) {
      setIsPlayingMusic(true);
    }
  };

  const handleResetFlow = () => {
    setIsFlowing(false);
    setFlowSeconds(0);
  };

  const handleSaveSession = (volumeMl: number, taskTitle?: string, musicTrackTitle?: string) => {
    const todayIndex = new Date().getDay();
    const dayKeys = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const newSession: DripSession = {
      id: Date.now(),
      startTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('vi-VN'),
      dayKey: dayKeys[todayIndex],
      durationSeconds: flowSeconds,
      volumeMl,
      mood: currentMood.label,
      taskTitle,
      musicTrackTitle: musicTrackTitle || currentTrack?.title,
    };
    setSessions([newSession, ...sessions]);
    setFlowSeconds(0);
    setIsFlowing(false);
  };

  // Toggle Task Completion with Early Completion Detection
  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

          // Check if early completion
          let isEarly = false;
          if (nextDone && t.scheduledTime) {
            const [schedH, schedM] = t.scheduledTime.split(':').map(Number);
            const now = new Date();
            const currentH = now.getHours();
            const currentM = now.getMinutes();

            if (currentH < schedH || (currentH === schedH && currentM < schedM)) {
              isEarly = true;
            }
          }

          if (nextDone) {
            soundEngine.playSuccessChime();
          }

          return { 
            ...t, 
            done: nextDone,
            completedAt: nextDone ? nowStr : undefined,
            completedEarly: nextDone ? isEarly : false,
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (taskPayload: {
    title: string;
    dosage: DosageType;
    category: TaskCategory;
    priority: PriorityLevel;
    scheduledTime?: string;
    documentUrl?: string;
    documentName?: string;
    notes?: string;
  }) => {
    const newTask: Task = {
      id: Date.now(),
      ...taskPayload,
      done: false,
      createdAt: 'Hôm nay',
    };
    setTasks([newTask, ...tasks]);
  };

  const handleAddMultipleTasks = (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => {
    const mapped = newTasks.map((t, idx) => ({
      ...t,
      priority: t.priority || 'Bình thường',
      id: Date.now() + idx,
      createdAt: 'Hôm nay',
    }));
    setTasks([...mapped, ...tasks]);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddMusicTrack = (track: Omit<MusicTrack, 'id'>) => {
    const newTrack: MusicTrack = {
      ...track,
      id: 'music-' + Date.now(),
    };
    const updated = [newTrack, ...musicTracks];
    setMusicTracks(updated);
    setCurrentTrack(newTrack);
    setIsPlayingMusic(true);
  };

  const handleDeleteMusicTrack = (id: string) => {
    const filtered = musicTracks.filter((t) => t.id !== id);
    setMusicTracks(filtered);
    if (currentTrack?.id === id) {
      setCurrentTrack(filtered[0] || null);
    }
  };

  const handleSelectMusicTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    setIsPlayingMusic(true);
  };

  const handleTogglePlayMusic = () => {
    setIsPlayingMusic(!isPlayingMusic);
  };

  const handleAddPharmacyItem = (item: Omit<PharmacyItem, 'id'>) => {
    const newItem: PharmacyItem = {
      ...item,
      id: 'custom-' + Date.now(),
    };
    setPharmacyItems([newItem, ...pharmacyItems]);
  };

  const handleDeletePharmacyItem = (id: string) => {
    setPharmacyItems(pharmacyItems.filter((i) => i.id !== id));
  };

  const handleAddSubPharmacyItem = (pharmacyId: string, subItem: Omit<SubPharmacyItem, 'id'>) => {
    const newSub: SubPharmacyItem = {
      ...subItem,
      id: 'sub-' + Date.now(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setPharmacyItems((prev) =>
      prev.map((item) => {
        if (item.id === pharmacyId) {
          const currentSubs = item.subItems || [];
          return { ...item, subItems: [newSub, ...currentSubs] };
        }
        return item;
      })
    );
  };

  const handleDeleteSubPharmacyItem = (pharmacyId: string, subItemId: string) => {
    setPharmacyItems((prev) =>
      prev.map((item) => {
        if (item.id === pharmacyId) {
          return {
            ...item,
            subItems: (item.subItems || []).filter((s) => s.id !== subItemId),
          };
        }
        return item;
      })
    );
  };

  const handleToggleSubItemDone = (pharmacyId: string, subItemId: string) => {
    setPharmacyItems((prev) =>
      prev.map((item) => {
        if (item.id === pharmacyId) {
          return {
            ...item,
            subItems: (item.subItems || []).map((s) => {
              if (s.id === subItemId) {
                const nextDone = !s.isCompleted;
                if (nextDone) soundEngine.playSuccessChime();
                return { ...s, isCompleted: nextDone };
              }
              return s;
            }),
          };
        }
        return item;
      })
    );
  };

  const handleExportSubItemToMedicalNotes = (pharmacyTitle: string, subItem: SubPharmacyItem) => {
    const linkBadge = `Bệnh Án #${subItem.title.slice(0, 16)}`;
    const formattedBlock = `\n\n### 📖 [Ghi Chép Dược Liệu: ${subItem.title}]
• Nguồn website: ${pharmacyTitle}
• Đường dẫn: ${subItem.url}
• Tiến độ / Phút đã xem: ${subItem.timestampProgress || 'Đã lưu'}
• Ghi chú kiến thức: ${subItem.note || 'Không có ghi chú thêm'}
• Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')}
👉 *Lời dặn của Dr. Ling*: Khi xem lại video/tài liệu này, hãy mở sổ bệnh án này ra để đối chiếu và đọc to theo nhé!
---`;

    // 1. Update notes
    const updatedNotes = notes + formattedBlock;
    setNotes(updatedNotes);
    localStorage.setItem('mind_clinic_notes', updatedNotes);

    // 2. Mark linked in subItems
    setPharmacyItems((prev) =>
      prev.map((item) => ({
        ...item,
        subItems: (item.subItems || []).map((s) =>
          s.id === subItem.id ? { ...s, linkedMedicalNoteTitle: linkBadge } : s
        ),
      }))
    );

    soundEngine.playSuccessChime();
    // 3. Navigate to medical notes tab
    setCurrentTab('medical-notes');
  };

  const handleToggleRain = () => {
    const playing = soundEngine.toggleRainAmbient();
    setIsRainPlaying(playing);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (muted) {
      setIsRainPlaying(false);
      setIsPlayingMusic(false);
    }
  };

  // Medical Record Handlers (Hồ Sơ & Bệnh Án)
  const handleAddMedicalRecord = (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: 'rec-' + Date.now(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setMedicalRecords((prev) => [newRecord, ...prev]);
    soundEngine.playSuccessChime();
  };

  const handleUpdateRecordSeverity = (id: string, severity: RecordSeverity) => {
    setMedicalRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, severity, updatedAt: new Date().toLocaleDateString('vi-VN') } : r))
    );
  };

  const handleDeleteMedicalRecord = (id: string) => {
    setMedicalRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveDoctorDiagnosisToRecord = (
    title: string,
    severity: RecordSeverity,
    category: any,
    content: string
  ) => {
    handleAddMedicalRecord({
      title,
      severity,
      category,
      content,
      doctorAssigned: true,
    });
  };

  // API Key Linking Handlers (Mỗi bệnh nhân tự liên kết API trước khi dùng)
  const handleLinkApi = async (keyInput?: string) => {
    const keyToUse = keyInput ? keyInput.trim() : userApiKey.trim();
    if (keyToUse) {
      setUserApiKey(keyToUse);
      localStorage.setItem('mind_clinic_user_api_key', keyToUse);
    }
    setIsApiLinked(true);
    localStorage.setItem('mind_clinic_api_linked', 'true');
    soundEngine.playSuccessChime();
    return true;
  };

  const handleUnlinkApi = () => {
    setIsApiLinked(false);
    localStorage.removeItem('mind_clinic_api_linked');
  };

  // AI Doctor Message Sender
  const handleSendDoctorMessage = async (messageText: string) => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'patient-' + Date.now(),
      sender: 'patient',
      text: messageText,
      time: timeStr,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsDoctorLoading(true);

    try {
      const response = await fetch('/api/ai-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          mood: currentMood.label,
          medicalRecords,
          userApiKey: userApiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Mạng y tế phản hồi chậm');
      }

      const data = await response.json();
      const docMsg: ChatMessage = {
        id: 'doc-' + Date.now(),
        sender: 'doctor',
        text: data.reply || 'Bác sĩ đã ghi nhận hồ sơ.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      // If doctor auto-created a new medical record
      if (data.newRecord) {
        const autoRec: MedicalRecord = {
          id: 'rec-' + Date.now(),
          title: data.newRecord.title || `Bệnh án từ Dr. Ling #${medicalRecords.length + 1}`,
          severity: data.newRecord.severity || 'Trung bình (Cần theo dõi)',
          category: data.newRecord.category || 'Ngữ pháp',
          content: data.newRecord.content || data.reply,
          createdAt: new Date().toLocaleDateString('vi-VN'),
          doctorAssigned: true,
        };
        setMedicalRecords((prev) => [autoRec, ...prev]);
        docMsg.newRecordCreated = autoRec;
        soundEngine.playSuccessChime();
      }

      setChatMessages((prev) => [...prev, docMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'doc-' + Date.now(),
        sender: 'doctor',
        text: `🩺 **Bác Sĩ Ghi Nhận Triệu Chứng:** "${messageText}"\n\n💊 **Kê Toa Chữa Lành:**\nHọc ngoại ngữ là quá trình thẩm thấu tự nhiên. Đừng để bất kỳ đồng hồ áp lực hay mục tiêu cứng nhắc nào làm bạn ngột ngạt. Hãy cứ học êm dịu theo nhịp độ tự nhiên của não bộ nhé!`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có muốn làm mới cuộc trò chuyện với Dr. Ling không?')) {
      setChatMessages([
        {
          id: '1',
          sender: 'doctor',
          text: `🩺 **Chào bạn! Tôi là Dr. Ling.** Bạn đang muốn chẩn đoán câu hỏi nào, hay cần kê đơn giải tỏa mệt mỏi hôm nay?`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const activeTasksCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="text-slate-700 min-h-screen flex flex-col md:flex-row bg-[#f6fbf9]">
      {/* Background HTML5 Audio Element for Music Tracks */}
      {currentTrack && (
        <audio
          ref={audioPlayerRef}
          src={currentTrack.url}
          loop
          preload="auto"
        />
      )}

      {/* SIDEBAR BỆNH VIỆN */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentMood={currentMood}
        onSelectMood={setCurrentMood}
        totalVolumeMl={totalVolumeMl}
        isRainPlaying={isRainPlaying}
        onToggleRain={handleToggleRain}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeTasksCount={activeTasksCount}
      />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-screen">
        {/* Top Header */}
        <Header
          onOpenSickLeave={() => setIsSickLeaveOpen(true)}
          isFlowing={isFlowing}
          flowSeconds={flowSeconds}
        />

        {/* Content Tabs Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll">
          {currentTab === 'dashboard' && (
            <DashboardTab
              flowSeconds={flowSeconds}
              isFlowing={isFlowing}
              onToggleFlow={handleToggleFlow}
              onResetFlow={handleResetFlow}
              onSaveSession={handleSaveSession}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onSwitchTab={setCurrentTab}
              sessions={sessions}
              currentMood={currentMood}
              dripSpeed={dripSpeed}
              onChangeDripSpeed={setDripSpeed}
              tracks={musicTracks}
              currentTrack={currentTrack}
              onSelectTrack={handleSelectMusicTrack}
              isPlayingMusic={isPlayingMusic}
              onTogglePlayMusic={handleTogglePlayMusic}
              onOpenMusicModal={() => setIsMusicModalOpen(true)}
            />
          )}

          {currentTab === 'prescriptions' && (
            <PrescriptionsTab
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddMultipleTasks={handleAddMultipleTasks}
            />
          )}

          {currentTab === 'medical-notes' && (
            <MedicalNotesTab
              notes={notes}
              onSaveNotes={setNotes}
              medicalRecords={medicalRecords}
              onAddRecord={handleAddMedicalRecord}
              onUpdateRecordSeverity={handleUpdateRecordSeverity}
              onDeleteRecord={handleDeleteMedicalRecord}
            />
          )}

          {currentTab === 'pharmacy' && (
            <PharmacyTab
              items={pharmacyItems}
              onAddItem={handleAddPharmacyItem}
              onDeleteItem={handleDeletePharmacyItem}
              onAddSubItem={handleAddSubPharmacyItem}
              onDeleteSubItem={handleDeleteSubPharmacyItem}
              onToggleSubItemDone={handleToggleSubItemDone}
              onExportToMedicalNotes={handleExportSubItemToMedicalNotes}
              onNavigateToMedicalNotes={() => setCurrentTab('medical-notes')}
            />
          )}

          {currentTab === 'ai-doctor' && (
            <AiDoctorTab
              messages={chatMessages}
              onSendMessage={handleSendDoctorMessage}
              isLoading={isDoctorLoading}
              onClearChat={handleClearChat}
              currentMoodLabel={currentMood.label}
              isApiLinked={isApiLinked}
              onLinkApi={handleLinkApi}
              onUnlinkApi={handleUnlinkApi}
              medicalRecords={medicalRecords}
              onSaveDoctorDiagnosisToRecord={handleSaveDoctorDiagnosisToRecord}
              onNavigateToMedicalNotes={() => setCurrentTab('medical-notes')}
            />
          )}
        </div>
      </main>

      {/* Official Sick Leave Modal */}
      <SickLeaveModal
        isOpen={isSickLeaveOpen}
        onClose={() => setIsSickLeaveOpen(false)}
        patientMood={currentMood.label}
      />

      {/* Music Player & Management Modal */}
      <MusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        tracks={musicTracks}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectMusicTrack}
        onAddTrack={handleAddMusicTrack}
        onDeleteTrack={handleDeleteMusicTrack}
        isPlaying={isPlayingMusic}
        onTogglePlay={handleTogglePlayMusic}
      />
    </div>
  );
}
