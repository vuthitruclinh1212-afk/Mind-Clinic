import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar, MOODS } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { PrescriptionsTab } from './components/PrescriptionsTab';
import { MedicalNotesTab } from './components/MedicalNotesTab';
import { PharmacyTab } from './components/PharmacyTab';
import { AiDoctorTab } from './components/AiDoctorTab';
import { AchievementsTab } from './components/AchievementsTab';
import { StudyJournalTab } from './components/StudyJournalTab';
import { SickLeaveModal } from './components/SickLeaveModal';
import { MusicPlayerModal } from './components/MusicPlayerModal';
import { AuthModal } from './components/AuthModal';
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
  MusicTrack,
  UserProfile,
  Jar,
  Recurring,
  Transaction,
  Achievement,
  UserCustomization,
  PrescriptionFrequency,
  StudyJournalEntry
} from './types';
import { soundEngine } from './utils/audio';
import { 
  INITIAL_CUSTOMIZATION, 
  computeAchievements, 
  THEME_PALETTES, 
  WALLPAPER_CONFIGS 
} from './utils/achievements';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  getEmailDocId, 
  testConnection,
  sanitizeForFirestore
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';

// Initial Defaults: Brand new patient starts with a clean slate from zero
const DEFAULT_TASKS: Task[] = [];

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
    subItems: [],
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
    subItems: [],
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
    subItems: [],
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

const DEFAULT_MEDICAL_RECORDS: MedicalRecord[] = [];

const INITIAL_NOTE = '';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentMood, setCurrentMood] = useState<MoodType>(MOODS[1]);
  const [isSickLeaveOpen, setIsSickLeaveOpen] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);

  // User Authentication & Firestore Data Separation States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);
  const isDataLoadedRef = useRef<boolean>(false);

  // Subcollections for Budget Jars, Recurring Transactions, and Bills
  const [jars, setJars] = useState<Jar[]>([]);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  // Persistent States - Clean slate for brand new patient
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If only old mock data existed, reset to clean 0
          const hasOldMock = parsed.some((t: any) => t.title?.includes('Nhai 5 chữ Hán'));
          if (hasOldMock) {
            localStorage.removeItem('mind_clinic_tasks');
            return [];
          }
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
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
      if (saved && (saved.includes('休息 (xiūxi)') || saved.includes('Chào mừng bạn đến với không gian tự do ghi chép'))) {
        localStorage.removeItem('mind_clinic_notes');
        return '';
      }
      return saved !== null ? saved : '';
    } catch {
      return '';
    }
  });

  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_pharmacy');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep base reference websites, clean any demo sub-items
          return parsed.map((item: PharmacyItem) => ({
            ...item,
            subItems: (item.subItems || []).filter(
              (s) => !s.id.startsWith('sub-bili-') && !s.id.startsWith('sub-hanzii-') && !s.id.startsWith('sub-gw-')
            ),
          }));
        }
      }
      return DEFAULT_PHARMACY;
    } catch {
      return DEFAULT_PHARMACY;
    }
  });

  // Medical Records State (Clean slate for new patient)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_medical_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMock = parsed.some((r: any) => r.id === 'rec-1' || r.title?.includes('Phân biệt cụm 3 trợ từ'));
          if (hasOldMock) {
            localStorage.removeItem('mind_clinic_medical_records');
            return [];
          }
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Study Journal State (Nhật Ký Học Tập Độc Lập - Tự Ghi Nhận)
  const [studyJournalEntries, setStudyJournalEntries] = useState<StudyJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_study_journal');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Doctor API Linking States (Luôn sẵn sàng trực tuyến)
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('mind_clinic_user_api_key') || '';
  });

  const [isApiLinked, setIsApiLinked] = useState<boolean>(true);

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

  // User Customization & Achievements System State
  const [customization, setCustomization] = useState<UserCustomization>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_customization');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMIZATION;
    } catch {
      return INITIAL_CUSTOMIZATION;
    }
  });

  const [savedUnlockedMap, setSavedUnlockedMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('mind_clinic_unlocked_achievements');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Calculate achievements based on user activities and time horizons
  const achievements: Achievement[] = useMemo(() => {
    return computeAchievements(
      tasks,
      sessions,
      medicalRecords,
      pharmacyItems,
      customization.customAccumulatedDays,
      savedUnlockedMap
    );
  }, [tasks, sessions, medicalRecords, pharmacyItems, customization.customAccumulatedDays, savedUnlockedMap]);

  // Track new achievements unlocked and store timestamp
  useEffect(() => {
    let hasNewUnlock = false;
    const updatedMap = { ...savedUnlockedMap };
    achievements.forEach((ach) => {
      if (ach.unlocked && !updatedMap[ach.id]) {
        updatedMap[ach.id] = new Date().toLocaleDateString('vi-VN');
        hasNewUnlock = true;
      }
    });
    if (hasNewUnlock) {
      setSavedUnlockedMap(updatedMap);
      localStorage.setItem('mind_clinic_unlocked_achievements', JSON.stringify(updatedMap));
      soundEngine.playSuccessChime();
    }
  }, [achievements]);

  /**
   * Safe Loader: Fetch all subcollections and document fields from Firestore
   * TUYỆT ĐỐI KHÔNG GHI ĐÈ (OVERWRITE) DỮ LIỆU RỖNG LÊN DOCUMENT CŨ!
   */
  const loadUserDataIntoState = async (docId: string, docData: any) => {
    setIsLoadingUserData(true);
    try {
      // Fetch all subcollections in parallel
      const [jarsSnap, recSnap, txSnap, tasksSnap, sessSnap, medSnap, pharmSnap] = await Promise.all([
        getDocs(collection(db, 'users', docId, 'jars')).catch(() => null),
        getDocs(collection(db, 'users', docId, 'recurring')).catch(() => null),
        getDocs(collection(db, 'users', docId, 'transactions')).catch(() => null),
        getDocs(collection(db, 'users', docId, 'tasks')).catch(() => null),
        getDocs(collection(db, 'users', docId, 'sessions')).catch(() => null),
        getDocs(collection(db, 'users', docId, 'medicalRecords')).catch(() => null),
        getDocs(collection(db, 'users', docId, 'pharmacy')).catch(() => null),
      ]);

      // Jars (Hũ ngân sách / mục tiêu)
      if (jarsSnap && !jarsSnap.empty) {
        setJars(jarsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Jar)));
      } else if (Array.isArray(docData.jars)) {
        setJars(docData.jars);
      } else {
        setJars([]);
      }

      // Recurring (Lặp định kỳ)
      if (recSnap && !recSnap.empty) {
        setRecurring(recSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Recurring)));
      } else if (Array.isArray(docData.recurring)) {
        setRecurring(docData.recurring);
      } else {
        setRecurring([]);
      }

      // Transactions (Giao dịch / Hóa đơn)
      if (txSnap && !txSnap.empty) {
        setTransactions(txSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
      } else if (Array.isArray(docData.transactions)) {
        setTransactions(docData.transactions);
      } else {
        setTransactions([]);
      }

      // Tasks / Prescriptions (Đơn thuốc)
      if (tasksSnap && !tasksSnap.empty) {
        const loaded = tasksSnap.docs.map((d) => ({ id: Number(d.id) || Date.now(), ...d.data() } as Task));
        setTasks(loaded.filter((t) => !t.title?.includes('Nhai 5 chữ Hán')));
      } else if (Array.isArray(docData.tasks)) {
        setTasks(docData.tasks.filter((t: any) => !t.title?.includes('Nhai 5 chữ Hán')));
      } else {
        setTasks([]);
      }

      // Sessions (Dung tích tri thức đã nạp)
      if (sessSnap && !sessSnap.empty) {
        setSessions(sessSnap.docs.map((d) => ({ id: Number(d.id) || Date.now(), ...d.data() } as DripSession)));
      } else if (Array.isArray(docData.sessions)) {
        setSessions(docData.sessions);
      } else {
        setSessions([]);
      }

      // Medical Records (Hồ sơ & Bệnh án)
      if (medSnap && !medSnap.empty) {
        const loaded = medSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MedicalRecord));
        setMedicalRecords(loaded.filter((r) => r.id !== 'rec-1' && !r.title?.includes('Phân biệt cụm 3 trợ từ')));
      } else if (Array.isArray(docData.medicalRecords)) {
        setMedicalRecords(docData.medicalRecords.filter((r: any) => r.id !== 'rec-1' && !r.title?.includes('Phân biệt cụm 3 trợ từ')));
      } else {
        setMedicalRecords([]);
      }

      // Pharmacy (Kho Dược - Giữ các link website có sẵn trong tủ thuốc)
      if (pharmSnap && !pharmSnap.empty) {
        setPharmacyItems(pharmSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PharmacyItem)));
      } else if (Array.isArray(docData.pharmacyItems) && docData.pharmacyItems.length > 0) {
        setPharmacyItems(docData.pharmacyItems.map((item: PharmacyItem) => ({
          ...item,
          subItems: (item.subItems || []).filter(
            (s) => !s.id.startsWith('sub-bili-') && !s.id.startsWith('sub-hanzii-') && !s.id.startsWith('sub-gw-')
          ),
        })));
      } else {
        setPharmacyItems(DEFAULT_PHARMACY);
      }

      // Notes (Sổ bệnh án)
      if (typeof docData.notes === 'string') {
        if (docData.notes.includes('休息 (xiūxi)') || docData.notes.includes('Chào mừng bạn đến với không gian tự do ghi chép')) {
          setNotes('');
        } else {
          setNotes(docData.notes);
        }
      } else {
        setNotes('');
      }

      // Customization & Achievements
      if (docData.customization) {
        setCustomization(docData.customization);
      }
      if (docData.unlockedAchievements) {
        setSavedUnlockedMap(docData.unlockedAchievements);
      }

      // Study Journal Entries
      if (Array.isArray(docData.studyJournalEntries)) {
        setStudyJournalEntries(docData.studyJournalEntries);
      }

      // Set flag so future changes can sync safely
      isDataLoadedRef.current = true;
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu cũ của user từ Firestore:', err);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Test Firestore connection on app mount
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to onAuthStateChanged: Fetch exact user document without overwrite
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email || firebaseUser.uid;
        const docId = getEmailDocId(userEmail);
        const userDocRef = doc(db, 'users', docId);

        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Document ALREADY EXISTS: Fetch existing subcollections and data
            // TUYỆT ĐỐI KHÔNG GHI ĐÈ DỮ LIỆU RỖNG BAN ĐẦU!
            const data = userDocSnap.data();
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: userEmail,
              docId,
              displayName: firebaseUser.displayName || data.displayName || userEmail.split('@')[0],
              photoURL: firebaseUser.photoURL || data.photoURL || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
            setCurrentUser(profile);
            localStorage.setItem('mind_clinic_active_user', JSON.stringify(profile));
            await loadUserDataIntoState(docId, data);
          } else {
            // First time login for this user: initialize brand new document
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: userEmail,
              docId,
              displayName: firebaseUser.displayName || userEmail.split('@')[0],
              photoURL: firebaseUser.photoURL || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, {
              ...newProfile,
              notes: INITIAL_NOTE,
              tasks: DEFAULT_TASKS,
              medicalRecords: DEFAULT_MEDICAL_RECORDS,
              pharmacyItems: DEFAULT_PHARMACY,
              customization: INITIAL_CUSTOMIZATION,
              unlockedAchievements: {},
              jars: [],
              recurring: [],
              transactions: [],
            });
            setCurrentUser(newProfile);
            localStorage.setItem('mind_clinic_active_user', JSON.stringify(newProfile));
            setTasks(DEFAULT_TASKS);
            setMedicalRecords(DEFAULT_MEDICAL_RECORDS);
            setPharmacyItems(DEFAULT_PHARMACY);
            setNotes(INITIAL_NOTE);
            setCustomization(INITIAL_CUSTOMIZATION);
            setSavedUnlockedMap({});
            setSessions([]);
            setJars([]);
            setRecurring([]);
            setTransactions([]);
            isDataLoadedRef.current = true;
          }
        } catch (error) {
          console.error('Error in onAuthStateChanged user fetching:', error);
        }
      } else {
        // Not signed in via Firebase Auth
        const savedUser = localStorage.getItem('mind_clinic_active_user');
        if (!savedUser) {
          setCurrentUser(null);
          isDataLoadedRef.current = false;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Safe Firestore Auto-Sync (Only updates when currentUser exists and data has finished loading)
  useEffect(() => {
    if (!currentUser || !isDataLoadedRef.current) return;
    try {
      const userRef = doc(db, 'users', currentUser.docId);
      const safePayload = sanitizeForFirestore({
        tasks,
        sessions,
        notes,
        medicalRecords,
        pharmacyItems,
        customization,
        unlockedAchievements: savedUnlockedMap,
        studyJournalEntries,
        jars,
        recurring,
        transactions,
        updatedAt: new Date().toISOString(),
      });
      updateDoc(userRef, safePayload).catch((err) => {
        console.warn('Auto-sync to Firestore user document:', err);
      });
    } catch (err) {
      console.warn('Auto-sync preparation error:', err);
    }
  }, [tasks, sessions, notes, medicalRecords, pharmacyItems, customization, savedUnlockedMap, studyJournalEntries, jars, recurring, transactions, currentUser]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mind_clinic_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('mind_clinic_study_journal', JSON.stringify(studyJournalEntries));
  }, [studyJournalEntries]);

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

          const updated: Task = { 
            ...t, 
            done: nextDone,
            completedEarly: nextDone ? isEarly : false,
          };
          if (nextDone) {
            updated.completedAt = nowStr;
          } else {
            delete updated.completedAt;
          }
          return updated;
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
    startDate?: string;
    endDate?: string;
    isLongTerm?: boolean;
    frequency?: PrescriptionFrequency;
    durationLabel?: string;
    documentUrl?: string;
    documentName?: string;
    notes?: string;
  }) => {
    const newTask: Task = {
      id: Date.now(),
      title: taskPayload.title,
      dosage: taskPayload.dosage || 'Liều nhẹ (5 - 10 phút)',
      category: taskPayload.category || 'Hán tự (Hanzi)',
      priority: taskPayload.priority || 'Bình thường',
      done: false,
      createdAt: 'Hôm nay',
    };
    if (taskPayload.scheduledTime) newTask.scheduledTime = taskPayload.scheduledTime;
    if (taskPayload.startDate) newTask.startDate = taskPayload.startDate;
    if (taskPayload.endDate) newTask.endDate = taskPayload.endDate;
    if (taskPayload.isLongTerm !== undefined) newTask.isLongTerm = taskPayload.isLongTerm;
    if (taskPayload.frequency) newTask.frequency = taskPayload.frequency;
    if (taskPayload.durationLabel) newTask.durationLabel = taskPayload.durationLabel;
    if (taskPayload.documentUrl) newTask.documentUrl = taskPayload.documentUrl;
    if (taskPayload.documentName) newTask.documentName = taskPayload.documentName;
    if (taskPayload.notes) newTask.notes = taskPayload.notes;

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAddMultipleTasks = (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => {
    const mapped: Task[] = newTasks.map((t, idx) => {
      const taskObj: Task = {
        id: Date.now() + idx,
        title: t.title,
        dosage: t.dosage,
        category: t.category,
        priority: t.priority || 'Bình thường',
        done: Boolean(t.done),
        createdAt: 'Hôm nay',
      };
      if (t.scheduledTime) taskObj.scheduledTime = t.scheduledTime;
      if (t.startDate) taskObj.startDate = t.startDate;
      if (t.endDate) taskObj.endDate = t.endDate;
      if (t.isLongTerm !== undefined) taskObj.isLongTerm = t.isLongTerm;
      if (t.frequency) taskObj.frequency = t.frequency;
      if (t.durationLabel) taskObj.durationLabel = t.durationLabel;
      if (t.documentUrl) taskObj.documentUrl = t.documentUrl;
      if (t.documentName) taskObj.documentName = t.documentName;
      if (t.notes) taskObj.notes = t.notes;
      return taskObj;
    });
    setTasks((prev) => [...mapped, ...prev]);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    soundEngine.playSuccessChime();
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

  const handleNextMusicTrack = () => {
    if (musicTracks.length === 0) return;
    const currentIndex = musicTracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % musicTracks.length;
    const nextTrack = musicTracks[nextIndex];
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      setIsPlayingMusic(true);
    }
  };

  const handlePrevMusicTrack = () => {
    if (musicTracks.length === 0) return;
    const currentIndex = musicTracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + musicTracks.length) % musicTracks.length;
    const prevTrack = musicTracks[prevIndex];
    if (prevTrack) {
      setCurrentTrack(prevTrack);
      setIsPlayingMusic(true);
    }
  };

  // Study Journal Handlers (Nhật Ký Học Tập - Tự Ghi Nhận)
  const handleAddJournalEntry = (entry: Omit<StudyJournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: StudyJournalEntry = {
      ...entry,
      id: 'journal-' + Date.now(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    setStudyJournalEntries((prev) => [newEntry, ...prev]);
  };

  const handleUpdateJournalEntry = (id: string, updates: Partial<StudyJournalEntry>) => {
    setStudyJournalEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const handleDeleteJournalEntry = (id: string) => {
    setStudyJournalEntries((prev) => prev.filter((e) => e.id !== id));
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

  // User Authentication Handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      throw err;
    }
  };

  const handleEmailSignIn = async (email: string, displayName?: string) => {
    const docId = getEmailDocId(email);
    const userDocRef = doc(db, 'users', docId);

    try {
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const profile: UserProfile = {
          uid: data.uid || ('email_' + docId),
          email,
          docId,
          displayName: displayName || data.displayName || email.split('@')[0],
          photoURL: data.photoURL || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        setCurrentUser(profile);
        localStorage.setItem('mind_clinic_active_user', JSON.stringify(profile));
        await loadUserDataIntoState(docId, data);
      } else {
        const newProfile: UserProfile = {
          uid: 'email_' + docId,
          email,
          docId,
          displayName: displayName || email.split('@')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, {
          ...newProfile,
          notes: INITIAL_NOTE,
          tasks: DEFAULT_TASKS,
          medicalRecords: DEFAULT_MEDICAL_RECORDS,
          pharmacyItems: DEFAULT_PHARMACY,
          customization: INITIAL_CUSTOMIZATION,
          unlockedAchievements: {},
          jars: [],
          recurring: [],
          transactions: [],
        });
        setCurrentUser(newProfile);
        localStorage.setItem('mind_clinic_active_user', JSON.stringify(newProfile));
        setTasks(DEFAULT_TASKS);
        setMedicalRecords(DEFAULT_MEDICAL_RECORDS);
        setPharmacyItems(DEFAULT_PHARMACY);
        setNotes(INITIAL_NOTE);
        setCustomization(INITIAL_CUSTOMIZATION);
        setSavedUnlockedMap({});
        setSessions([]);
        setJars([]);
        setRecurring([]);
        setTransactions([]);
        isDataLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error signing in with email:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth).catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem('mind_clinic_active_user');
    isDataLoadedRef.current = false;
    // Reset state to initial clean defaults for the next user
    setTasks(DEFAULT_TASKS);
    setMedicalRecords(DEFAULT_MEDICAL_RECORDS);
    setPharmacyItems(DEFAULT_PHARMACY);
    setNotes(INITIAL_NOTE);
    setCustomization(INITIAL_CUSTOMIZATION);
    setSavedUnlockedMap({});
    setSessions([]);
    setJars([]);
    setRecurring([]);
    setTransactions([]);
  };

  // Customization & Achievement handlers
  const handleUpdateCustomization = (updates: Partial<UserCustomization>) => {
    setCustomization((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('mind_clinic_customization', JSON.stringify(next));
      if (currentUser && isDataLoadedRef.current) {
        updateDoc(doc(db, 'users', currentUser.docId), {
          customization: next,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }
      return next;
    });
  };

  const handleManualAdjustDays = (days: number) => {
    handleUpdateCustomization({ customAccumulatedDays: days });
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
      const lower = messageText.toLowerCase();
      let replyText = '';
      let autoRec: MedicalRecord | null = null;

      if (lower.includes('bổ ngữ xu hướng') || lower.includes('xu hướng đơn') || lower.includes('huong don') || lower.includes('xu huong')) {
        replyText = `🩺 **Chẩn Đoán Ngữ Pháp Của Dr. Ling: Bổ Ngữ Xu Hướng Đơn (单向趋向补语)**

Trong tiếng Trung, **Bổ ngữ xu hướng đơn** dùng để biểu thị hướng di chuyển của hành động hướng về phía người nói hoặc rời xa người nói.

📌 **1. Cấu Trúc:**
> **Động từ di chuyển + 来 (lái) / 去 (qù)**
• **来 (Lái):** Hướng lại gần người nói (Ví dụ: **进来！** - Vào đây!).
• **去 (Qù):** Rời xa phía người nói (Ví dụ: **出去！** - Đi ra ngoài kia!).

⚠️ **2. Vị Trí Của Tân Ngữ (Quy tắc vàng):**
• **Tân ngữ chỉ NƠI CHỐN / ĐỊA ĐIỂM:** Bắt buộc đứng **TRƯỚC** 来/去.
  - Đúng: **回家去 (Huí jiā qù)** | **进教室来 (Jìn jiàoshì lái)**
  - ❌ Sai: *回去家*
• **Tân ngữ chỉ ĐỒ VẬT:** Có thể đứng trước hoặc sau 来/去.
  - Đúng: **买了一本书来** hoặc **买来了一本书**

🌿 **Lời Dặn Trị Liệu:** Đặt chính bạn làm trung tâm mốc tọa độ: Tiến về mình dùng **来**, đi xa mình dùng **去**!`;

        autoRec = {
          id: 'rec-' + Date.now(),
          title: 'Bổ ngữ xu hướng đơn (Động từ + 来/去)',
          severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
          category: 'Ngữ pháp',
          content: '• Động từ + 来 (tiến lại) / 去 (đi xa)\n• Tân ngữ chỉ địa điểm: BẮT BUỘC đứng trước 来/去 (VD: 回家去).\n• Tân ngữ chỉ vật: Đứng trước hoặc sau đều được (VD: 带来一本书).',
          createdAt: new Date().toLocaleDateString('vi-VN'),
          doctorAssigned: true,
        };
      } else {
        replyText = `🩺 **Bác Sĩ Ghi Nhận Triệu Chứng:** "${messageText}"

💊 **Kê Toa Tri Thức & Giải Phẫu Ngôn Ngữ:**
Trong tiếng Trung, mỗi rào cản ngữ pháp hay từ vựng bạn gặp đều cần tiếp cận bằng hình tượng và ngữ cảnh thực tế, thay vì dịch từng chữ máy móc.

• **Phác đồ đề xuất:** Hãy chia nhỏ câu hỏi thành các thành phần cốt lõi (Chủ ngữ - Động từ - Tân ngữ - Bổ ngữ), sau đó đặt 2-3 câu ví dụ thực tế liên quan đến cuộc sống hàng ngày của bạn.
• **Lời dặn của Dr. Ling:** Đừng ngại hỏi thêm chi tiết, tôi luôn đồng hành hỗ trợ bạn tra cứu và phân tích bệnh án!`;
      }

      const fallbackMsg: ChatMessage = {
        id: 'doc-' + Date.now(),
        sender: 'doctor',
        text: replyText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      if (autoRec) {
        setMedicalRecords((prev) => [autoRec!, ...prev]);
        fallbackMsg.newRecordCreated = autoRec;
        soundEngine.playSuccessChime();
      }

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

  const currentTheme = THEME_PALETTES[customization.equippedTheme] || THEME_PALETTES.teal;
  const currentWallpaper = WALLPAPER_CONFIGS[customization.equippedWallpaper] || WALLPAPER_CONFIGS.default;

  return (
    <div className={`text-slate-700 min-h-screen flex flex-col md:flex-row ${currentTheme.bgGradClass} transition-colors duration-500`}>
      {/* Background HTML5 Audio Element for Music Tracks */}
      {currentTrack && (
        <audio
          ref={audioPlayerRef}
          src={currentTrack.url}
          onEnded={handleNextMusicTrack}
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
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        customization={customization}
      />

      {/* MAIN VIEWPORT */}
      <main 
        className={`flex-1 flex flex-col overflow-hidden min-h-screen ${currentWallpaper.bgClass} transition-all duration-500`}
        style={currentWallpaper.patternOverlay ? { backgroundImage: currentWallpaper.patternOverlay } : undefined}
      >
        {/* Top Header */}
        <Header
          onOpenSickLeave={() => setIsSickLeaveOpen(true)}
          isFlowing={isFlowing}
          flowSeconds={flowSeconds}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
          customization={customization}
          onNavigateToAchievements={() => setCurrentTab('achievements')}
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
              onUpdateTask={handleUpdateTask}
              onAddMultipleTasks={handleAddMultipleTasks}
            />
          )}

          {currentTab === 'study-journal' && (
            <StudyJournalTab
              entries={studyJournalEntries}
              onAddEntry={handleAddJournalEntry}
              onUpdateEntry={handleUpdateJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
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

          {currentTab === 'achievements' && (
            <AchievementsTab
              achievements={achievements}
              customization={customization}
              onUpdateCustomization={handleUpdateCustomization}
              currentUser={currentUser}
              onManualAdjustDays={handleManualAdjustDays}
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
        onNextTrack={handleNextMusicTrack}
        onPrevTrack={handlePrevMusicTrack}
      />

      {/* User Authentication & Account Separation Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
