import React, { useState, useMemo, useRef } from 'react';
import { 
  FilePlus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Pill, 
  Clock, 
  AlertCircle, 
  Star, 
  ExternalLink, 
  FileText, 
  StickyNote, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Zap, 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  Repeat, 
  Hourglass,
  Pencil,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  LayoutGrid,
  List,
  MoveHorizontal,
  Palette,
  Timer
} from 'lucide-react';
import { Task, DosageType, TaskCategory, PriorityLevel, PrescriptionFrequency } from '../types';
import { soundEngine } from '../utils/audio';

export interface AddTaskPayload {
  title: string;
  dosage: DosageType;
  category: TaskCategory;
  priority: PriorityLevel;
  scheduledTime?: string;
  endTime?: string;
  durationMinutes?: number;
  color?: string;
  startDate?: string;
  endDate?: string;
  isLongTerm?: boolean;
  frequency?: PrescriptionFrequency;
  durationLabel?: string;
  documentUrl?: string;
  documentName?: string;
  notes?: string;
}

interface PrescriptionsTabProps {
  tasks: Task[];
  onAddTask: (task: AddTaskPayload) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onUpdateTask?: (updatedTask: Task) => void;
  onAddMultipleTasks: (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => void;
  onUpdatePriority?: (id: number, priority: PriorityLevel) => void;
}

export const formatDateVN = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const getDaysRemaining = (endDateStr?: string) => {
  if (!endDateStr) return null;
  try {
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

export const HOURLY_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', 
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export const formatIsoDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ================= COLOR OPTIONS & PRIORITY BORDER CONFIG =================
export interface TaskColorOption {
  id: string;
  name: string;
  bgHex: string;
  textHex: string;
  borderHex: string;
  badgeBg: string;
}

export const TASK_COLOR_PALETTES: TaskColorOption[] = [
  { id: 'teal', name: 'Thanh Ngọc (Xanh ngọc)', bgHex: '#f0fdfa', textHex: '#134e4a', borderHex: '#99f6e4', badgeBg: '#ccfbf1' },
  { id: 'mint', name: 'Bạc Hà (Xanh thảo mộc)', bgHex: '#ecfdf5', textHex: '#065f46', borderHex: '#a7f3d0', badgeBg: '#d1fae5' },
  { id: 'sky', name: 'Lam Hàn (Xanh biển dịu)', bgHex: '#f0f9ff', textHex: '#075985', borderHex: '#bae6fd', badgeBg: '#e0f2fe' },
  { id: 'lavender', name: 'Tử Đằng (Tím oải hương)', bgHex: '#faf5ff', textHex: '#581c87', borderHex: '#e9d5ff', badgeBg: '#f3e8ff' },
  { id: 'rose', name: 'Đào Hoa (Hồng phấn)', bgHex: '#fff1f2', textHex: '#881337', borderHex: '#fecdd3', badgeBg: '#ffe4e6' },
  { id: 'amber', name: 'Hoàng Cúc (Cam ấm áp)', bgHex: '#fffbeb', textHex: '#78350f', borderHex: '#fde68a', badgeBg: '#fef3c7' },
  { id: 'indigo', name: 'Chàm Cổ Phong (Indigo)', bgHex: '#eef2ff', textHex: '#312e81', borderHex: '#c7d2fe', badgeBg: '#e0e7ff' },
  { id: 'slate', name: 'Mặc Ngọc (Xám tĩnh lặng)', bgHex: '#f8fafc', textHex: '#1e293b', borderHex: '#cbd5e1', badgeBg: '#f1f5f9' },
];

// 4 lựa chọn trên hình đổi thành màu khung viền của đầu việc
export const PRIORITY_BORDER_CONFIG: Record<PriorityLevel, {
  borderClass: string;
  borderColor: string;
  label: string;
  shortLabel: string;
  dotColor: string;
  textColor: string;
}> = {
  'Bắt buộc uống (Khẩn cấp)': {
    borderClass: 'border-2 border-rose-500 shadow-xs shadow-rose-200',
    borderColor: '#f43f5e',
    label: '🔴 Viền Đỏ: Bắt buộc uống (Khẩn cấp)',
    shortLabel: 'Viền Đỏ Khẩn Cấp',
    dotColor: '#f43f5e',
    textColor: 'text-rose-700',
  },
  'Quan trọng (Uống trước)': {
    borderClass: 'border-2 border-amber-500 shadow-xs shadow-amber-200',
    borderColor: '#f59e0b',
    label: '🟡 Viền Vàng: Quan trọng (Uống trước)',
    shortLabel: 'Viền Vàng Quan Trọng',
    dotColor: '#f59e0b',
    textColor: 'text-amber-700',
  },
  'Bình thường': {
    borderClass: 'border-2 border-emerald-500 shadow-xs shadow-emerald-200',
    borderColor: '#10b981',
    label: '🟢 Viền Xanh lá: Bình thường',
    shortLabel: 'Viền Xanh Bình Thường',
    dotColor: '#10b981',
    textColor: 'text-emerald-700',
  },
  'Tùy chọn / Thư giãn': {
    borderClass: 'border-2 border-slate-300 shadow-xs shadow-slate-200',
    borderColor: '#cbd5e1',
    label: '⚪ Viền Xám: Tùy chọn / Thư giãn',
    shortLabel: 'Viền Xám Tùy Chọn',
    dotColor: '#94a3b8',
    textColor: 'text-slate-600',
  },
};

export const getTaskColorStyle = (colorId?: string): React.CSSProperties => {
  if (!colorId) return { backgroundColor: '#ffffff', color: '#1e293b' };
  const found = TASK_COLOR_PALETTES.find((c) => c.id === colorId);
  if (found) return { backgroundColor: found.bgHex, color: found.textHex };
  if (colorId.startsWith('#')) return { backgroundColor: colorId, color: '#0f172a' };
  return { backgroundColor: '#ffffff', color: '#1e293b' };
};

export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  if (!startTime) return '';
  const [hStr, mStr] = startTime.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const totalMinutes = h * 60 + m + (durationMinutes || 0);
  const normalizedMinutes = totalMinutes % (24 * 60);
  const endH = Math.floor(normalizedMinutes / 60);
  const endM = normalizedMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

export const calculateDurationFromTimes = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 30;
  const [sh, sm] = startTime.split(':').map((v) => parseInt(v, 10) || 0);
  const [eh, em] = endTime.split(':').map((v) => parseInt(v, 10) || 0);
  let startTotal = sh * 60 + sm;
  let endTotal = eh * 60 + em;
  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }
  return Math.max(1, endTotal - startTotal);
};

export const formatDurationText = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (remMinutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${remMinutes} phút`;
};

export const PrescriptionsTab: React.FC<PrescriptionsTabProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddMultipleTasks,
}) => {
  // DOM Refs for smooth scrolling & focus
  const formRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll horizontal state for week calendar
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a')) return;
    setIsDragging(true);
    if (scrollContainerRef.current) {
      setDragStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeftState(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scrollLeftSmooth = () => {
    scrollContainerRef.current?.scrollBy({ left: -450, behavior: 'smooth' });
  };

  const scrollRightSmooth = () => {
    scrollContainerRef.current?.scrollBy({ left: 450, behavior: 'smooth' });
  };

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Default end date 30 days from now
  const defaultEndDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Form States
  const [title, setTitle] = useState('');
  const [dosage, setDosage] = useState<DosageType>('Liều nhẹ (5 - 10 phút)');
  const [category, setCategory] = useState<TaskCategory>('Hán tự (Hanzi)');
  const [priority, setPriority] = useState<PriorityLevel>('Bình thường'); // 4 lựa chọn trên hình -> màu khung viền
  const [taskColor, setTaskColor] = useState<string>('teal'); // Chức năng chọn màu cho đầu việc theo sở thích
  
  // Time States: Giờ bắt đầu, thời lượng từng phút, giờ kết thúc dự kiến
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // Mặc định 2 tiếng, tự do sửa từng phút
  const [endTime, setEndTime] = useState('16:00'); // Tự động tính 14:00 -> 16:00
  
  // Date & Long-Term States
  const [isLongTerm, setIsLongTerm] = useState(true);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [frequency, setFrequency] = useState<PrescriptionFrequency>('Mỗi ngày (Hàng ngày)');
  const [durationLabel, setDurationLabel] = useState('Liệu trình 30 ngày (1 tháng)');

  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);

  // Google Calendar View & Interaction States
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar-week' | 'calendar-month' | 'list'>('calendar-week');
  const [showHourlySlots, setShowHourlySlots] = useState<boolean>(true); // Nút ẩn/hiện giờ để thu gọn lịch
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [slotNotice, setSlotNotice] = useState<{ date: string; time: string } | null>(null);

  // Time change helpers for Form
  const handleStartTimeChange = (newStart: string) => {
    setScheduledTime(newStart);
    if (newStart) {
      setEndTime(calculateEndTime(newStart, durationMinutes));
    }
  };

  const handleDurationMinutesChange = (newMinutes: number) => {
    const val = Math.max(1, newMinutes || 1);
    setDurationMinutes(val);
    if (scheduledTime) {
      setEndTime(calculateEndTime(scheduledTime, val));
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    if (scheduledTime && newEnd) {
      const dur = calculateDurationFromTimes(scheduledTime, newEnd);
      setDurationMinutes(dur);
    }
  };

  // Edit Task States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    dosage: DosageType;
    category: TaskCategory;
    priority: PriorityLevel;
    color: string;
    scheduledTime: string;
    endTime: string;
    durationMinutes: number;
    startDate: string;
    endDate: string;
    isLongTerm: boolean;
    frequency: PrescriptionFrequency;
    durationLabel: string;
    documentUrl: string;
    documentName: string;
    notes: string;
  }>({
    title: '',
    dosage: 'Liều nhẹ (5 - 10 phút)',
    category: 'Hán tự (Hanzi)',
    priority: 'Bình thường',
    color: 'teal',
    scheduledTime: '14:00',
    endTime: '16:00',
    durationMinutes: 120,
    startDate: todayStr,
    endDate: defaultEndDate,
    isLongTerm: true,
    frequency: 'Mỗi ngày (Hàng ngày)',
    durationLabel: 'Liệu trình 30 ngày (1 tháng)',
    documentUrl: '',
    documentName: '',
    notes: '',
  });

  const handleEditStartTimeChange = (newStart: string) => {
    setEditForm((prev) => ({
      ...prev,
      scheduledTime: newStart,
      endTime: newStart ? calculateEndTime(newStart, prev.durationMinutes) : prev.endTime,
    }));
  };

  const handleEditDurationMinutesChange = (newMinutes: number) => {
    const val = Math.max(1, newMinutes || 1);
    setEditForm((prev) => ({
      ...prev,
      durationMinutes: val,
      endTime: prev.scheduledTime ? calculateEndTime(prev.scheduledTime, val) : prev.endTime,
    }));
  };

  const handleEditEndTimeChange = (newEnd: string) => {
    setEditForm((prev) => {
      const dur = prev.scheduledTime && newEnd ? calculateDurationFromTimes(prev.scheduledTime, newEnd) : prev.durationMinutes;
      return {
        ...prev,
        endTime: newEnd,
        durationMinutes: dur,
      };
    });
  };

  // Filter & Sort States
  const [filter, setFilter] = useState<'all' | 'longterm' | 'active' | 'done' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'time' | 'dosage' | 'created'>('priority');

  // Compute 7 days for current week offset
  const weekDays = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const monday = getMonday(base);
    
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatIsoDate(d);
      const isToday = dateStr === todayStr;
      return {
        date: d,
        dateStr,
        dayName: dayNames[i],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        year: d.getFullYear(),
        isToday,
        dayOfWeek: d.getDay(),
      };
    });
  }, [weekOffset, todayStr]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.dayNum}/${first.monthNum} - ${last.dayNum}/${last.monthNum}/${last.year}`;
  }, [weekDays]);

  // Check if a task is scheduled on a given date string (YYYY-MM-DD)
  const isTaskOnDate = (task: Task, dateStr: string, dayOfWeek: number) => {
    if (task.isLongTerm) {
      const start = task.startDate || '2000-01-01';
      const end = task.endDate || '2099-12-31';
      if (dateStr < start || dateStr > end) return false;
      
      if (task.frequency === 'Các ngày trong tuần (T2 - T6)') {
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      }
      if (task.frequency === 'Cuối tuần (Thứ 7 & CN)') {
        return dayOfWeek === 0 || dayOfWeek === 6;
      }
      if (task.frequency === 'Cách 1 ngày (2 ngày / lần)') {
        try {
          const startD = new Date(start);
          const curD = new Date(dateStr);
          const diff = Math.round((curD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
          return Math.abs(diff) % 2 === 0;
        } catch {
          return true;
        }
      }
      if (task.frequency === 'Mỗi tuần 1 lần') {
        try {
          const startD = new Date(start);
          return startD.getDay() === dayOfWeek;
        } catch {
          return true;
        }
      }
      return true;
    }

    const taskDate = task.startDate || todayStr;
    return taskDate === dateStr;
  };

  // Click on empty hour slot -> Pre-fill form & scroll up to schedule immediately
  const handleSelectEmptySlot = (dateStr: string, hourStr: string) => {
    setStartDate(dateStr);
    setScheduledTime(hourStr);
    setSlotNotice({ date: dateStr, time: hourStr });
    soundEngine.playDripSound();

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 350);
  };

  // Edit Task handlers
  const handleStartEdit = (task: Task) => {
    const taskStart = task.scheduledTime || '14:00';
    const taskDur = task.durationMinutes !== undefined 
      ? task.durationMinutes 
      : (task.endTime ? calculateDurationFromTimes(taskStart, task.endTime) : 120);
    const taskEnd = task.endTime || calculateEndTime(taskStart, taskDur);

    setEditingTask(task);
    setEditForm({
      title: task.title,
      dosage: task.dosage,
      category: task.category,
      priority: task.priority,
      color: task.color || 'teal',
      scheduledTime: taskStart,
      endTime: taskEnd,
      durationMinutes: taskDur,
      startDate: task.startDate || todayStr,
      endDate: task.endDate || '',
      isLongTerm: Boolean(task.isLongTerm),
      frequency: task.frequency || 'Mỗi ngày (Hàng ngày)',
      durationLabel: task.durationLabel || '',
      documentUrl: task.documentUrl || '',
      documentName: task.documentName || '',
      notes: task.notes || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editForm.title.trim()) return;

    let formattedDocUrl = editForm.documentUrl.trim();
    if (formattedDocUrl && !formattedDocUrl.startsWith('http://') && !formattedDocUrl.startsWith('https://')) {
      formattedDocUrl = 'https://' + formattedDocUrl;
    }

    const updated: Task = {
      ...editingTask,
      title: editForm.title.trim(),
      dosage: editForm.dosage,
      category: editForm.category,
      priority: editForm.priority,
      color: editForm.color,
      scheduledTime: editForm.scheduledTime.trim() || undefined,
      endTime: editForm.endTime.trim() || undefined,
      durationMinutes: editForm.durationMinutes > 0 ? editForm.durationMinutes : undefined,
      startDate: editForm.startDate || todayStr,
      isLongTerm: editForm.isLongTerm,
      endDate: editForm.isLongTerm && editForm.endDate.trim() ? editForm.endDate.trim() : undefined,
      frequency: editForm.isLongTerm ? editForm.frequency : undefined,
      durationLabel: editForm.isLongTerm && editForm.durationLabel.trim() ? editForm.durationLabel.trim() : undefined,
      documentUrl: formattedDocUrl || undefined,
      documentName: editForm.documentName.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
    };

    if (onUpdateTask) {
      onUpdateTask(updated);
    }
    setEditingTask(null);
    soundEngine.playSuccessChime();
  };

  const setQuickDuration = (days: number, label: string) => {
    const base = startDate ? new Date(startDate) : new Date();
    const target = new Date(base);
    target.setDate(target.getDate() + days);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
    setIsLongTerm(true);
    setDurationLabel(label);
  };

  const setIndefiniteDuration = () => {
    setEndDate('');
    setIsLongTerm(true);
    setDurationLabel('Dài hạn liên tục');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let formattedDocUrl = documentUrl.trim();
    if (formattedDocUrl && !formattedDocUrl.startsWith('http://') && !formattedDocUrl.startsWith('https://')) {
      formattedDocUrl = 'https://' + formattedDocUrl;
    }

    const payload: AddTaskPayload = {
      title: title.trim(),
      dosage,
      category,
      priority,
      color: taskColor,
      isLongTerm,
      startDate: startDate || todayStr,
      frequency: isLongTerm ? frequency : undefined,
      durationLabel: isLongTerm ? durationLabel : undefined,
    };

    if (isLongTerm && endDate.trim()) {
      payload.endDate = endDate.trim();
    }
    if (scheduledTime.trim()) {
      payload.scheduledTime = scheduledTime.trim();
    }
    if (endTime.trim()) {
      payload.endTime = endTime.trim();
    }
    if (durationMinutes > 0) {
      payload.durationMinutes = durationMinutes;
    }
    if (formattedDocUrl) {
      payload.documentUrl = formattedDocUrl;
    }
    if (documentName.trim()) {
      payload.documentName = documentName.trim();
    }
    if (notes.trim()) {
      payload.notes = notes.trim();
    }

    onAddTask(payload);

    setTitle('');
    setDocumentUrl('');
    setDocumentName('');
    setNotes('');
    soundEngine.playSuccessChime();
  };

  const handleApplyPreset = (presetName: string) => {
    const targetStartDate = todayStr;

    if (presetName === 'hanzi-starter') {
      const d14 = new Date();
      d14.setDate(d14.getDate() + 14);
      const end14 = d14.toISOString().slice(0, 10);

      onAddMultipleTasks([
        { 
          title: 'Nhai 3 chữ Hán bộ Thủy (氵): 江 (jiāng), 河 (hé), 海 (hǎi)', 
          dosage: 'Liều nhẹ (5 - 10 phút)', 
          category: 'Hán tự (Hanzi)', 
          priority: 'Bắt buộc uống (Khẩn cấp)', 
          scheduledTime: '08:30', 
          startDate: targetStartDate,
          endDate: end14,
          isLongTerm: true,
          frequency: 'Mỗi ngày (Hàng ngày)',
          durationLabel: 'Phác đồ cấp bách 14 ngày',
          documentUrl: 'https://hanzii.net', 
          documentName: 'Từ điển Hanzii tra bộ Thủy', 
          notes: 'Tất cả các chữ đều liên quan đến nước, sông ngòi, biển cả.', 
          done: false 
        },
        { 
          title: 'Xem thứ tự bút thuận 1 chữ trên Bishun Stroke Order', 
          dosage: 'Liều nhẹ (5 - 10 phút)', 
          category: 'Hán tự (Hanzi)', 
          priority: 'Quan trọng (Uống trước)', 
          scheduledTime: '10:00', 
          startDate: targetStartDate,
          endDate: end14,
          isLongTerm: true,
          frequency: 'Mỗi ngày (Hàng ngày)',
          durationLabel: 'Phác đồ cấp bách 14 ngày',
          documentUrl: 'https://bishun.strokeorder.info', 
          documentName: 'Bishun Stroke Order Guide', 
          notes: 'Quy tắc bút thuận: Từ trên xuống dưới, từ trái qua phải.', 
          done: false 
        },
        { 
          title: 'Tìm mẹo chiết tự cho chữ 休 (Người tựa vào Cây)', 
          dosage: 'Liều nhẹ (5 - 10 phút)', 
          category: 'Hán tự (Hanzi)', 
          priority: 'Bình thường', 
          scheduledTime: '15:00', 
          startDate: targetStartDate,
          endDate: end14,
          isLongTerm: true,
          frequency: 'Mỗi ngày (Hàng ngày)',
          durationLabel: 'Phác đồ cấp bách 14 ngày',
          notes: 'Chiết tự: Nhân đứng + Mộc = Nghỉ ngơi.', 
          done: false 
        },
      ]);
    } else if (presetName === 'listening-bath') {
      const d30 = new Date();
      d30.setDate(d30.getDate() + 30);
      const end30 = d30.toISOString().slice(0, 10);

      onAddMultipleTasks([
        { 
          title: 'Nghe 1 bài nhạc Hoa nhẹ nhàng (thả lỏng không cố dịch nghĩa)', 
          dosage: 'Liều nhẹ (5 - 10 phút)', 
          category: 'Luyện nghe', 
          priority: 'Quan trọng (Uống trước)', 
          scheduledTime: '12:30', 
          startDate: targetStartDate,
          endDate: end30,
          isLongTerm: true,
          frequency: 'Mỗi ngày (Hàng ngày)',
          durationLabel: 'Liệu trình 30 ngày tắm ngôn ngữ',
          notes: 'Uống liều này vào giờ nghỉ trưa để tâm trí hấp thu thụ động.', 
          done: false 
        },
        { 
          title: 'Xem 1 video ngắn trên Bilibili tắm ngôn ngữ thực tế', 
          dosage: 'Liều vừa (20 - 30 phút)', 
          category: 'Luyện nghe', 
          priority: 'Bình thường', 
          scheduledTime: '20:00', 
          startDate: targetStartDate,
          endDate: end30,
          isLongTerm: true,
          frequency: 'Mỗi ngày (Hàng ngày)',
          durationLabel: 'Liệu trình 30 ngày tắm ngôn ngữ',
          documentUrl: 'https://www.bilibili.com', 
          documentName: 'Kênh Bilibili cuộc sống', 
          done: false 
        },
      ]);
    } else if (presetName === 'grammar-essentials') {
      const d90 = new Date();
      d90.setDate(d90.getDate() + 90);
      const end90 = d90.toISOString().slice(0, 10);

      onAddMultipleTasks([
        { 
          title: 'Phân biệt bộ ba trợ từ kết cấu 的, 得, 地', 
          dosage: 'Liều vừa (20 - 30 phút)', 
          category: 'Ngữ pháp', 
          priority: 'Bắt buộc uống (Khẩn cấp)', 
          scheduledTime: '14:00', 
          startDate: targetStartDate,
          endDate: end90,
          isLongTerm: true,
          frequency: 'Cách 1 ngày (2 ngày / lần)',
          durationLabel: 'Phác đồ 3 tháng củng cố cấu trúc',
          documentUrl: 'https://resources.allsetlearning.com/chinese/grammar/', 
          documentName: 'Chinese Grammar Wiki', 
          notes: '的 nối danh từ; 得 nối sau động từ chỉ mức độ; 地 đứng trước động từ.', 
          done: false 
        },
      ]);
    }
    soundEngine.playSuccessChime();
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    if (filter === 'urgent') return t.priority === 'Bắt buộc uống (Khẩn cấp)' || t.priority === 'Quan trọng (Uống trước)';
    if (filter === 'longterm') return t.isLongTerm;
    return true;
  });

  // Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityWeights: Record<PriorityLevel, number> = {
        'Bắt buộc uống (Khẩn cấp)': 4,
        'Quan trọng (Uống trước)': 3,
        'Bình thường': 2,
        'Tùy chọn / Thư giãn': 1,
      };
      const pDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
    }

    if (sortBy === 'date') {
      const dateA = a.endDate || a.startDate || '9999-99-99';
      const dateB = b.endDate || b.startDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    }

    if (sortBy === 'time') {
      const timeA = a.scheduledTime || '99:99';
      const timeB = b.scheduledTime || '99:99';
      return timeA.localeCompare(timeB);
    }

    if (sortBy === 'dosage') {
      return (a.dosage || '').localeCompare(b.dosage || '');
    }

    // Default newest
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const urgentCount = tasks.filter((t) => !t.done && (t.priority === 'Bắt buộc uống (Khẩn cấp)' || t.priority === 'Quan trọng (Uống trước)')).length;
  const longTermCount = tasks.filter((t) => t.isLongTerm).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="space-y-6">
      {/* Form Kê Thêm Liều Lượng Học Mới / Kê Đơn Dài Hạn */}
      <div ref={formRef} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Kê Đơn Thuốc & Phác Đồ Dài Hạn</h2>
              <p className="text-xs text-slate-500">
                Lên lịch trình theo ngày tháng (tuần/tháng/năm), giờ uống trong ngày, tần suất & tài liệu học tập
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedForm(!showAdvancedForm)}
            className="text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 cursor-pointer w-fit"
          >
            {showAdvancedForm ? (
              <><span>Rút gọn tài liệu & ghi chú</span> <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <><span>+ Thêm link tài liệu & ghi chú dặn dò</span> <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        {/* Slot Selection Notice (When clicking on empty hour slot in calendar) */}
        {slotNotice && (
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 rounded-2xl text-xs text-teal-900 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Đang lên lịch lấp vào giờ trống: <strong className="font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">{slotNotice.time}</strong> ngày <strong className="font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">{formatDateVN(slotNotice.date)}</strong>. Hãy nhập tên bài học bên dưới và nhấn Kê đơn!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSlotNotice(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-teal-100/50 transition cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prescription Mode Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setIsLongTerm(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                isLongTerm ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
              <span>🗓️ Kê đơn dài hạn (Theo liệu trình ngày / tuần / tháng / năm)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLongTerm(false)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                !isLongTerm ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>⚡ Liều trong ngày</span>
            </button>
          </div>

          {/* Main Primary Row: Name, Dosage, Priority Border */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên đơn thuốc / Phác đồ <span className="text-rose-500">*</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Học 5 chữ Hán bộ Mộc, Đọc 1 bài hội thoại..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:outline-hidden focus:border-teal-400 focus:bg-white transition"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Liều lượng học
              </label>
              <select
                value={dosage}
                onChange={(e) => setDosage(e.target.value as DosageType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs focus:outline-hidden focus:border-teal-400 text-slate-800 font-semibold cursor-pointer"
              >
                <option value="Liều nhẹ (5 - 10 phút)">Liều nhẹ (5 - 10p)</option>
                <option value="Liều vừa (20 - 30 phút)">Liều vừa (20 - 30p)</option>
                <option value="Liều cao (Chuyên sâu)">Liều cao (Chuyên sâu)</option>
                <option value="Vitamin Bổ Não (Ôn tập hàng ngày)">Vitamin Bổ Não (Ôn tập)</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Màu khung viền của đầu việc:</span>
                <span className="text-[10px] font-normal text-slate-400">(4 mức ưu tiên)</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs focus:outline-hidden focus:border-teal-400 text-slate-800 font-bold cursor-pointer"
              >
                <option value="Bắt buộc uống (Khẩn cấp)">🔴 Viền Đỏ: Bắt buộc uống (Khẩn cấp)</option>
                <option value="Quan trọng (Uống trước)">🟡 Viền Vàng: Quan trọng (Uống trước)</option>
                <option value="Bình thường">🟢 Viền Xanh lá: Bình thường</option>
                <option value="Tùy chọn / Thư giãn">⚪ Viền Xám: Tùy chọn / Thư giãn</option>
              </select>
            </div>
          </div>

          {/* Section: Chọn màu cho đầu việc theo sở thích */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Palette className="w-4 h-4 text-teal-600" />
                <span>Màu sắc đầu việc (Tùy chọn theo sở thích):</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Chọn màu nền phác đồ bạn yêu thích — Khung viền vẫn giữ theo mức độ ưu tiên
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {TASK_COLOR_PALETTES.map((c) => {
                const isSelected = taskColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTaskColor(c.id)}
                    style={{ backgroundColor: c.bgHex, color: c.textHex, borderColor: isSelected ? c.textHex : c.borderHex }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 ${
                      isSelected ? 'ring-2 ring-teal-400 font-extrabold shadow-sm' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.textHex }} />
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                <input
                  type="color"
                  value={taskColor.startsWith('#') ? taskColor : '#f0fdfa'}
                  onChange={(e) => setTaskColor(e.target.value)}
                  className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0"
                  title="Tự chọn mã màu bất kỳ"
                />
                <span className="text-[11px] font-semibold text-slate-600">Tự pha màu</span>
              </div>
            </div>
          </div>

          {/* Section: Hẹn Giờ Bắt Đầu & Kết Thúc Dự Kiến (Sửa Từng Phút) */}
          <div className="p-4 bg-teal-50/40 border border-teal-200/80 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-950">
                  Hẹn giờ bắt đầu & Kết thúc dự kiến (Tùy chỉnh tự do từng phút):
                </span>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-100/90 px-3 py-0.5 rounded-full border border-teal-200">
                ⏱️ {scheduledTime} ➔ {endTime} ({formatDurationText(durationMinutes)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Start Time */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>1. Giờ bắt đầu:</span>
                </label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-2xs">
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold focus:outline-hidden w-full cursor-pointer text-sm font-mono"
                  />
                </div>
              </div>

              {/* 2. Duration in Minutes (Customizable freely) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Thời gian hoàn thành (Tự do sửa từng phút):</span>
                </label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs gap-2 shadow-2xs">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={durationMinutes}
                    onChange={(e) => handleDurationMinutesChange(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-bold text-sm focus:outline-hidden text-center"
                  />
                  <span className="font-semibold text-slate-500 text-xs">phút</span>
                  <span className="text-[11px] text-teal-700 font-bold ml-auto font-mono">
                    = {formatDurationText(durationMinutes)}
                  </span>
                </div>
              </div>

              {/* 3. End Time */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>3. Giờ kết thúc dự kiến:</span>
                </label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-2xs">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold focus:outline-hidden w-full cursor-pointer text-sm font-mono text-rose-700"
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Chips for Duration */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-teal-100/80">
              <span className="text-[11px] font-bold text-teal-900 mr-1">Chọn nhanh thời lượng:</span>
              {[
                { label: '17 phút', minutes: 17, custom: true },
                { label: '30 phút', minutes: 30, custom: false },
                { label: '36 phút', minutes: 36, custom: true },
                { label: '45 phút', minutes: 45, custom: false },
                { label: '1 tiếng (60p)', minutes: 60, custom: false },
                { label: '1.5 tiếng (90p)', minutes: 90, custom: false },
                { label: '2 tiếng (120p)', minutes: 120, custom: true },
                { label: '3 tiếng (180p)', minutes: 180, custom: false },
              ].map((preset) => {
                const isSelected = durationMinutes === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handleDurationMinutesChange(preset.minutes)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : preset.custom
                        ? 'bg-white hover:bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-200'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Long-Term Dates & Schedule */}
          {isLongTerm ? (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900">Thiết lập ngày tháng & Liệu trình dài hạn:</span>
                  {durationLabel && (
                    <span className="text-[11px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      {durationLabel}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500">
                  Kê đơn có ngày bắt đầu và kết thúc để kiên trì theo dõi lâu dài
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-600" />
                    <span>Từ ngày (Bắt đầu):</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CalendarRange className="w-3 h-3 text-indigo-600" />
                    <span>Đến ngày (Kết thúc):</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDurationLabel(e.target.value ? 'Tùy chỉnh ngày' : 'Dài hạn liên tục');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-sky-600" />
                    <span>Tần suất điều trị:</span>
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as PrescriptionFrequency)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-400"
                  >
                    <option value="Mỗi ngày (Hàng ngày)">Mỗi ngày (Hàng ngày)</option>
                    <option value="Cách 1 ngày (2 ngày / lần)">Cách 1 ngày (2 ngày / lần)</option>
                    <option value="Các ngày trong tuần (T2 - T6)">Các ngày trong tuần (T2 - T6)</option>
                    <option value="Cuối tuần (Thứ 7 & CN)">Cuối tuần (Thứ 7 & CN)</option>
                    <option value="Mỗi tuần 1 lần">Mỗi tuần 1 lần</option>
                    <option value="Khi cần thiết">Khi cần thiết</option>
                  </select>
                </div>
              </div>

              {/* Quick Duration Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-indigo-950 mr-1">Chọn nhanh đợt điều trị:</span>
                <button
                  type="button"
                  onClick={() => setQuickDuration(7, 'Liệu trình 7 ngày (1 tuần)')}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  +7 Ngày (1 tuần)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(14, 'Liệu trình 14 ngày (2 tuần)')}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  +14 Ngày (2 tuần)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(30, 'Liệu trình 30 ngày (1 tháng)')}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  +30 Ngày (1 tháng)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(90, 'Liệu trình 90 ngày (3 tháng)')}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  +3 Tháng (1 Quý)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(180, 'Liệu trình 180 ngày (6 tháng)')}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  +6 Tháng (Nửa năm)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(365, 'Liệu trình 1 năm (Dài hạn)')}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  +1 Năm (365 ngày)
                </button>
                <button
                  type="button"
                  onClick={setIndefiniteDuration}
                  className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
                >
                  Vô thời hạn (Liên tục)
                </button>
              </div>
            </div>
          ) : (
            /* Single Day Preset Row */
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  <span>Ngày thực hiện bài học:</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-teal-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Advanced Row: Document Link & Notes */}
          {showAdvancedForm && (
            <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 text-xs animate-in fade-in duration-150">
              <div className="md:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Chuyên khoa / Phân loại</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-teal-400"
                >
                  <option value="Hán tự (Hanzi)">Hán tự (Hanzi)</option>
                  <option value="Ngữ pháp">Ngữ pháp</option>
                  <option value="Luyện nghe">Luyện nghe</option>
                  <option value="Khẩu ngữ">Khẩu ngữ</option>
                  <option value="Đọc hiểu">Đọc hiểu</option>
                  <option value="Tâm lý học tập">Tâm lý học tập</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-teal-600" />
                  <span>Link tài liệu liên quan (Website, Drive, PDF)</span>
                </label>
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... hoặc hanzii.net..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 font-medium focus:outline-hidden focus:border-teal-400"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-slate-700 font-semibold mb-1">Tên tài liệu đính kèm (Hiển thị)</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Ví dụ: Giáo trình Hán ngữ Tập 2 - Bài 14..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 font-medium focus:outline-hidden focus:border-teal-400"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <StickyNote className="w-3 h-3 text-teal-600" />
                  <span>Ghi chú điều trị / Y lệnh dặn dò thêm</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Nhớ chú ý viết đúng nét sổ cong móc; Đọc to 3 lần trước gương..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 font-medium focus:outline-hidden focus:border-teal-400"
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-md shadow-teal-100 transition shrink-0 cursor-pointer flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              <span>{isLongTerm ? 'Kê đơn dài hạn ngay' : 'Kê đơn thuốc ngay'}</span>
            </button>
          </div>
        </form>

        {/* Quick Presets Packs */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phác đồ điều trị mẫu dài hạn có sẵn ngày tháng & giờ uống:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleApplyPreset('hanzi-starter')}
              className="text-xs bg-rose-50/70 hover:bg-rose-100 text-rose-800 border border-rose-200/60 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <span>🔴 + Phác đồ cấp bách 14 ngày: Mất gốc Hán tự (Hanzii & Bishun)</span>
            </button>
            <button
              onClick={() => handleApplyPreset('grammar-essentials')}
              className="text-xs bg-amber-50/70 hover:bg-amber-100 text-amber-800 border border-amber-200/60 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <span>🟡 + Phác đồ 3 tháng nền tảng: Phân biệt 的, 得, 地 (Grammar Wiki)</span>
            </button>
            <button
              onClick={() => handleApplyPreset('listening-bath')}
              className="text-xs bg-teal-50/70 hover:bg-teal-100 text-teal-800 border border-teal-200/60 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <span>+ Phác đồ dưỡng não 30 ngày: Tắm ngôn ngữ Bilibili & Nhạc Hoa</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= PHÁC ĐỒ ĐANG ĐIỀU TRỊ (GOOGLE CALENDAR UPGRADE) ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {/* Controls: Title, View Switcher, Filter & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-500" />
              <span>Phác Đồ Đang Điều Trị</span>
              {urgentCount > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  {urgentCount} liều bắt buộc/quan trọng
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Đã uống {completed} trên tổng số {total} liều ({percent}%) • Lịch Google Calendar tương tác mốc giờ trống và phác đồ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
              <button
                type="button"
                onClick={() => setCalendarViewMode('calendar-week')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  calendarViewMode === 'calendar-week' 
                    ? 'bg-white text-teal-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem theo Lịch Google Calendar (Theo tuần & theo giờ)"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch Google Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('calendar-month')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  calendarViewMode === 'calendar-month' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem tổng quan theo Tháng"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Lịch Tháng</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('list')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  calendarViewMode === 'list' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem theo Danh sách thẻ truyền thống"
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh Sách Thẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Navigation, Hourly Slots Toggle & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {calendarViewMode === 'calendar-week' ? (
            /* Week Navigation & Hourly Toggle */
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="p-1.5 hover:bg-white rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Tuần trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="px-2.5 py-1 font-bold text-teal-700 hover:bg-white rounded-xl transition cursor-pointer"
                  title="Quay lại tuần hiện tại"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="p-1.5 hover:bg-white rounded-xl text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Tuần kế tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-xl">
                📅 {weekRangeLabel}
              </span>

              {/* Nút Ẩn / Hiện Giờ trên lịch để thu gọn lịch */}
              <button
                type="button"
                onClick={() => setShowHourlySlots(!showHourlySlots)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  showHourlySlots
                    ? 'bg-teal-500 text-white shadow-teal-100 hover:bg-teal-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={showHourlySlots ? 'Thu gọn: Ẩn các hàng mốc giờ' : 'Mở rộng: Hiện chi tiết từng mốc giờ trong ngày'}
              >
                {showHourlySlots ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Thu gọn mốc giờ</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hiện mốc giờ chi tiết (06:00 - 22:00)</span>
                  </>
                )}
              </button>
            </div>
          ) : calendarViewMode === 'calendar-month' ? (
            /* Month Navigation */
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                🗓️ Tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </span>
            </div>
          ) : (
            /* Sort Dropdown for List View */
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-teal-700 focus:outline-hidden cursor-pointer"
              >
                <option value="priority">🚨 Mức độ quan trọng (Bắt buộc trước)</option>
                <option value="date">📅 Hạn liệu trình & Ngày kê</option>
                <option value="time">⏰ Giờ uống trong ngày</option>
                <option value="dosage">⏳ Theo liều lượng thời gian</option>
                <option value="created">🆕 Mới kê gần nhất</option>
              </select>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-xl font-semibold transition cursor-pointer ${
                filter === 'all' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({total})
            </button>
            <button
              onClick={() => setFilter('longterm')}
              className={`px-2.5 py-1 rounded-xl font-semibold transition cursor-pointer ${
                filter === 'longterm' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🗓️ Dài hạn ({longTermCount})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 rounded-xl font-semibold transition cursor-pointer ${
                filter === 'urgent' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cần uống ({urgentCount})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-xl font-semibold transition cursor-pointer ${
                filter === 'active' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Chưa uống ({total - completed})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-2.5 py-1 rounded-xl font-semibold transition cursor-pointer ${
                filter === 'done' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã uống ({completed})
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-400 via-indigo-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        {/* ================= 1. GOOGLE CALENDAR WEEK VIEW ================= */}
        {calendarViewMode === 'calendar-week' && (
          <div className="space-y-3 pt-1">
            {/* Horizontal Scroll Navigation & Drag Guidance Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-gradient-to-r from-teal-50/70 via-indigo-50/50 to-slate-50 border border-teal-200/70 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <MoveHorizontal className="w-4 h-4 text-teal-600 shrink-0" />
                <span>💡 <strong>Kéo qua kéo lại để xem:</strong> Giữ chuột kéo ngang, vuốt con lăn hoặc bấm nút để xem Thứ 2 đến Chủ Nhật</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={scrollLeftSmooth}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs text-[11px]"
                  title="Cuộn sang các ngày đầu tuần"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Đầu tuần (T2 - T4)</span>
                </button>
                <button
                  type="button"
                  onClick={scrollRightSmooth}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs text-[11px]"
                  title="Cuộn sang các ngày cuối tuần"
                >
                  <span>Cuối tuần (T5 - CN)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showHourlySlots ? (
              /* DETAILED HOURLY CALENDAR MATRIX (GOOGLE CALENDAR MODE) */
              <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-2xs bg-white">
                <div
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="overflow-x-auto select-none cursor-grab active:cursor-grabbing pb-2"
                >
                  <div className="min-w-[1460px]">
                    {/* Day Headers (Monday to Sunday) */}
                    <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-slate-50/90 border-b border-slate-200 sticky top-0 z-10">
                      <div className="p-3 text-center border-r border-slate-200 text-xs font-bold text-slate-500 flex items-center justify-center sticky left-0 bg-slate-50/95 backdrop-blur-md z-20 shadow-xs">
                        <Clock className="w-4 h-4 text-teal-600 mr-1" />
                        <span>Mốc giờ</span>
                      </div>
                      {weekDays.map((day) => {
                        const dayTasks = sortedTasks.filter((t) => isTaskOnDate(t, day.dateStr, day.dayOfWeek));
                        return (
                          <div
                            key={day.dateStr}
                            className={`p-2.5 text-center border-r border-slate-200 last:border-r-0 transition ${
                              day.isToday ? 'bg-teal-50/80 font-bold' : ''
                            }`}
                          >
                            <span className="text-[11px] font-semibold text-slate-500 block">
                              {day.dayName}
                            </span>
                            <div className="flex items-center justify-center mt-0.5">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  day.isToday
                                    ? 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-200'
                                    : 'text-slate-800'
                                }`}
                              >
                                {day.dayNum}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                              {dayTasks.length > 0 ? `${dayTasks.length} phác đồ` : 'Trống'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* All-Day / Unscheduled row */}
                    <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/40">
                      <div className="p-2 border-r border-slate-200 text-[11px] font-semibold text-slate-500 text-center flex items-center justify-center sticky left-0 bg-slate-50/95 backdrop-blur-md z-20 shadow-xs">
                        Cả ngày
                      </div>
                      {weekDays.map((day) => {
                        const allDayTasks = sortedTasks.filter(
                          (t) => isTaskOnDate(t, day.dateStr, day.dayOfWeek) && !t.scheduledTime
                        );
                        return (
                          <div
                            key={'allday-' + day.dateStr}
                            className="p-1.5 border-r border-slate-200 last:border-r-0 min-h-[44px] space-y-1"
                          >
                            {allDayTasks.map((task) => {
                              const borderCls = PRIORITY_BORDER_CONFIG[task.priority]?.borderClass || 'border border-slate-200';
                              const colorStyle = getTaskColorStyle(task.color);
                              return (
                                <div
                                  key={task.id}
                                  style={colorStyle}
                                  className={`text-[11px] p-2 rounded-xl ${borderCls} flex items-center justify-between gap-1 shadow-2xs ${
                                    task.done ? 'opacity-60 line-through' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <button
                                      onClick={() => onToggleTask(task.id)}
                                      className="cursor-pointer shrink-0"
                                    >
                                      {task.done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-teal-400" />
                                      )}
                                    </button>
                                    <span className="truncate font-semibold">{task.title}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      onClick={() => handleStartEdit(task)}
                                      title="Sửa"
                                      className="p-1 hover:text-teal-600 transition cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteTask(task.id)}
                                      title="Xóa"
                                      className="p-1 hover:text-rose-600 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Hourly Rows (06:00 - 22:00) */}
                    <div className="divide-y divide-slate-100">
                      {HOURLY_SLOTS.map((hourSlot) => {
                        const slotH = parseInt(hourSlot.slice(0, 2), 10);
                        const slotStartMin = slotH * 60;

                        return (
                          <div key={hourSlot} className="grid grid-cols-[100px_repeat(7,1fr)] min-h-[64px] hover:bg-slate-50/20 transition">
                            {/* Hour Label - Sticky on left */}
                            <div className="p-2 border-r border-slate-100 text-right pr-3 text-xs font-mono font-bold text-slate-400 flex items-start justify-end select-none sticky left-0 bg-white/95 backdrop-blur-md z-20 shadow-xs">
                              {hourSlot}
                            </div>

                            {/* 7 Days Columns */}
                            {weekDays.map((day) => {
                              // Tasks starting in this hour slot
                              const startingTasks = sortedTasks.filter((t) => {
                                if (!isTaskOnDate(t, day.dateStr, day.dayOfWeek)) return false;
                                if (!t.scheduledTime) return false;
                                const taskStartH = parseInt(t.scheduledTime.slice(0, 2), 10);
                                return taskStartH === slotH;
                              });

                              // Tasks continuing from previous hours
                              const continuingTasks = sortedTasks.filter((t) => {
                                if (!isTaskOnDate(t, day.dateStr, day.dayOfWeek)) return false;
                                if (!t.scheduledTime) return false;
                                const startH = parseInt(t.scheduledTime.slice(0, 2), 10);
                                if (startH >= slotH) return false;
                                const startM = parseInt(t.scheduledTime.slice(3, 5), 10) || 0;
                                const endH = t.endTime ? parseInt(t.endTime.slice(0, 2), 10) : startH;
                                const endM = t.endTime ? parseInt(t.endTime.slice(3, 5), 10) : startM + (t.durationMinutes || 30);
                                let endTotalMin = endH * 60 + endM;
                                if (endTotalMin <= startH * 60 + startM) endTotalMin += 1440;
                                return endTotalMin > slotStartMin;
                              });

                              const hasAnyTask = startingTasks.length > 0 || continuingTasks.length > 0;

                              return (
                                <div
                                  key={day.dateStr + '-' + hourSlot}
                                  className={`p-2 border-r border-slate-100 last:border-r-0 flex flex-col justify-center transition min-w-0 ${
                                    day.isToday ? 'bg-teal-50/20' : ''
                                  }`}
                                >
                                  {hasAnyTask ? (
                                    /* GIỜ CÓ ĐẦU VIỆC */
                                    <div className="space-y-1.5 w-full">
                                      {/* Primary Starting Tasks */}
                                      {startingTasks.map((task) => {
                                        const borderCfg = PRIORITY_BORDER_CONFIG[task.priority] || PRIORITY_BORDER_CONFIG['Bình thường'];
                                        const colorStyle = getTaskColorStyle(task.color);
                                        const taskEnd = task.endTime || calculateEndTime(task.scheduledTime || '14:00', task.durationMinutes || 30);
                                        const durText = formatDurationText(task.durationMinutes || (task.endTime ? calculateDurationFromTimes(task.scheduledTime || '14:00', task.endTime) : 30));

                                        return (
                                          <div
                                            key={task.id}
                                            style={colorStyle}
                                            className={`p-2.5 rounded-2xl ${borderCfg.borderClass} text-xs transition shadow-2xs ${
                                              task.done ? 'opacity-60' : ''
                                            }`}
                                          >
                                            {/* Header: Priority Dot, Time Range & Actions */}
                                            <div className="flex items-start justify-between gap-1 pb-1 border-b border-black/5 mb-1.5">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <button
                                                  onClick={() => onToggleTask(task.id)}
                                                  className="cursor-pointer shrink-0 mt-0.5"
                                                  title={task.done ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                                                >
                                                  {task.done ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                  ) : (
                                                    <Circle className="w-4 h-4 text-slate-400 hover:text-teal-500" />
                                                  )}
                                                </button>
                                                <span 
                                                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                  style={{ backgroundColor: borderCfg.dotColor }}
                                                  title={`Màu khung viền: ${borderCfg.shortLabel}`}
                                                />
                                                <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 text-slate-800">
                                                  ⏰ {task.scheduledTime} - {taskEnd}
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-0.5 shrink-0">
                                                <button
                                                  onClick={() => handleStartEdit(task)}
                                                  title="Chỉnh sửa phác đồ này"
                                                  className="p-1 hover:text-teal-700 text-slate-400 hover:bg-black/5 rounded-lg transition cursor-pointer"
                                                >
                                                  <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => onDeleteTask(task.id)}
                                                  title="Xóa liều thuốc này"
                                                  className="p-1 hover:text-rose-600 text-slate-300 hover:bg-black/5 rounded-lg transition cursor-pointer"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Title - Fully readable, breaks words */}
                                            <p
                                              className={`font-bold text-xs leading-snug break-words ${
                                                task.done ? 'line-through text-slate-400' : 'text-slate-900'
                                              }`}
                                              title={task.title}
                                            >
                                              {task.title}
                                            </p>

                                            {/* Footer: Duration, Dosage & Category */}
                                            <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[10px]">
                                              {durText && (
                                                <span className="px-1.5 py-0.2 rounded-md bg-black/5 font-semibold text-slate-700">
                                                  ⏳ {durText}
                                                </span>
                                              )}
                                              <span className="px-1.5 py-0.2 rounded-md bg-black/5 font-medium text-slate-600">
                                                {task.category}
                                              </span>
                                            </div>

                                            {/* Notes / Document Link if available */}
                                            {task.documentUrl && (
                                              <div className="mt-1 pt-1 border-t border-black/5">
                                                <a
                                                  href={task.documentUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:underline"
                                                >
                                                  <FileText className="w-3 h-3" />
                                                  <span className="truncate">{task.documentName || 'Tài liệu'}</span>
                                                  <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}

                                      {/* Continuing Tasks from earlier hour */}
                                      {continuingTasks.map((cTask) => {
                                        const cBorder = PRIORITY_BORDER_CONFIG[cTask.priority] || PRIORITY_BORDER_CONFIG['Bình thường'];
                                        const colorStyle = getTaskColorStyle(cTask.color);
                                        const cEnd = cTask.endTime || calculateEndTime(cTask.scheduledTime || '14:00', cTask.durationMinutes || 30);
                                        const cDur = formatDurationText(cTask.durationMinutes);

                                        return (
                                          <div
                                            key={`cont-${cTask.id}`}
                                            style={colorStyle}
                                            className={`p-2 rounded-2xl ${cBorder.borderClass} border-dashed text-xs transition shadow-2xs opacity-90`}
                                          >
                                            <div className="flex items-center justify-between gap-1">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cBorder.dotColor }} />
                                                <span className="text-[10px] font-bold text-slate-700 truncate">
                                                  ↳ ⏳ Đang làm ({cTask.scheduledTime} - {cEnd}): <strong className="font-bold">{cTask.title}</strong>
                                                </span>
                                              </div>
                                              <button
                                                onClick={() => handleStartEdit(cTask)}
                                                title="Sửa phác đồ"
                                                className="p-1 hover:text-teal-700 text-slate-400 hover:bg-black/5 rounded-lg transition cursor-pointer shrink-0"
                                              >
                                                <Pencil className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    /* GIỜ TRỐNG: Chọn vào giờ trống để chuyển sang lên lịch lấp vào giờ đó */
                                    <button
                                      type="button"
                                      onClick={() => handleSelectEmptySlot(day.dateStr, hourSlot)}
                                      className="w-full h-12 rounded-xl border border-dashed border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/50 flex items-center justify-center transition cursor-pointer group text-slate-300 hover:text-teal-700 p-1"
                                      title={`Giờ trống ${hourSlot} (${day.dayName} ${formatDateVN(day.dateStr)}) - Nhấn để chuyển sang lên lịch lấp vào giờ này`}
                                    >
                                      <span className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-teal-600">
                                        <Plus className="w-3 h-3" />
                                        <span>Lên lịch {hourSlot}</span>
                                      </span>
                                      <span className="text-[10px] text-slate-300 group-hover:hidden select-none">
                                        + Trống
                                      </span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* COMPACT VIEW (THU GỌN LỊCH CHO DỄ NHÌN) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                  const dayTasks = sortedTasks.filter((t) => isTaskOnDate(t, day.dateStr, day.dayOfWeek));
                  return (
                    <div
                      key={day.dateStr}
                      className={`p-3.5 rounded-3xl border flex flex-col justify-between transition ${
                        day.isToday
                          ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-200 shadow-xs'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Day Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">{day.dayName}</span>
                            <span className="text-[11px] text-slate-400">{formatDateVN(day.dateStr)}</span>
                          </div>
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              day.isToday ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {day.dayNum}
                          </span>
                        </div>

                        {/* List of Tasks for this day */}
                        <div className="space-y-2">
                          {dayTasks.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic py-3 text-center">
                              Chưa có phác đồ
                            </p>
                          ) : (
                            dayTasks.map((task) => {
                              const borderCfg = PRIORITY_BORDER_CONFIG[task.priority] || PRIORITY_BORDER_CONFIG['Bình thường'];
                              const colorStyle = getTaskColorStyle(task.color);
                              const taskEnd = task.endTime || calculateEndTime(task.scheduledTime || '14:00', task.durationMinutes || 30);
                              const durText = formatDurationText(task.durationMinutes || (task.endTime ? calculateDurationFromTimes(task.scheduledTime || '14:00', task.endTime) : 30));

                              return (
                                <div
                                  key={task.id}
                                  style={colorStyle}
                                  className={`p-2.5 rounded-2xl ${borderCfg.borderClass} text-xs space-y-1 transition ${
                                    task.done ? 'opacity-60 line-through' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <button
                                        onClick={() => onToggleTask(task.id)}
                                        className="cursor-pointer shrink-0"
                                      >
                                        {task.done ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                      </button>
                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: borderCfg.dotColor }} />
                                      <p className="font-bold text-[11px] truncate" title={task.title}>
                                        {task.title}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <button
                                        onClick={() => handleStartEdit(task)}
                                        title="Sửa"
                                        className="p-1 hover:text-teal-600 text-slate-400 cursor-pointer"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteTask(task.id)}
                                        title="Xóa"
                                        className="p-1 hover:text-rose-600 text-slate-300 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  {task.scheduledTime && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-700 font-bold font-mono">
                                      <Clock className="w-3 h-3 text-teal-600" />
                                      <span>{task.scheduledTime} - {taskEnd} {durText ? `(${durText})` : ''}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Add Slot Button for this day */}
                      <button
                        type="button"
                        onClick={() => handleSelectEmptySlot(day.dateStr, '09:00')}
                        className="mt-3 w-full py-1.5 px-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-500 rounded-xl text-[11px] font-bold border border-dashed border-slate-200 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Lên lịch ngày này</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= 2. CALENDAR MONTH VIEW ================= */}
        {calendarViewMode === 'calendar-month' && (
          <div className="p-4 bg-slate-50/60 rounded-3xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
              <div>Thứ 2</div>
              <div>Thứ 3</div>
              <div>Thứ 4</div>
              <div>Thứ 5</div>
              <div>Thứ 6</div>
              <div>Thứ 7</div>
              <div>Chủ Nhật</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
                const dateObj = new Date(dateStr);
                const dayOfWeek = dateObj.getDay();
                const dayTasks = sortedTasks.filter((t) => isTaskOnDate(t, dateStr, dayOfWeek));
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleSelectEmptySlot(dateStr, '09:00')}
                    className={`min-h-[75px] p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? 'bg-teal-50/90 border-teal-300 ring-1 ring-teal-200'
                        : dayTasks.length > 0
                        ? 'bg-white border-slate-200 hover:border-teal-300 shadow-2xs'
                        : 'bg-white/60 border-slate-100 hover:bg-teal-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-teal-500 text-white' : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-full">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 mt-1">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="text-[10px] truncate px-1 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium"
                          title={t.title}
                        >
                          {t.scheduledTime ? `${t.scheduledTime} ` : ''}{t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-semibold block">
                          +{dayTasks.length - 2} phác đồ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 3. TRADITIONAL LIST VIEW ================= */}
        {calendarViewMode === 'list' && (
          <div className="space-y-3 pt-2">
            {sortedTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Không có đơn thuốc nào phù hợp bộ lọc. Hãy an tâm nghỉ ngơi hoặc kê thêm đơn thuốc dài hạn mới!
              </div>
            ) : (
              sortedTasks.map((task) => {
                const borderCfg = PRIORITY_BORDER_CONFIG[task.priority] || PRIORITY_BORDER_CONFIG['Bình thường'];
                const colorStyle = getTaskColorStyle(task.color);
                const taskEnd = task.endTime || calculateEndTime(task.scheduledTime || '14:00', task.durationMinutes || 30);
                const durText = formatDurationText(task.durationMinutes || (task.endTime ? calculateDurationFromTimes(task.scheduledTime || '14:00', task.endTime) : 30));
                const remainingDays = getDaysRemaining(task.endDate);

                return (
                  <div
                    key={task.id}
                    style={colorStyle}
                    className={`p-4 rounded-3xl ${borderCfg.borderClass} transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs ${
                      task.done ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 flex-1">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="cursor-pointer focus:outline-hidden mt-0.5"
                      >
                        {task.done ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 hover:scale-110 transition" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-400 hover:text-teal-500 hover:scale-110 transition" />
                        )}
                      </button>

                      <div className="space-y-2 flex-1">
                        {/* Title and Priority Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-sm font-bold ${
                              task.done ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </p>

                          {/* Border Priority Indicator */}
                          <span 
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 bg-white/80"
                            style={{ borderColor: borderCfg.borderColor, color: borderCfg.borderColor }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: borderCfg.dotColor }} />
                            <span>{borderCfg.shortLabel}</span>
                          </span>

                          {/* Long-term Badge */}
                          {task.isLongTerm && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                              <CalendarRange className="w-3 h-3 text-indigo-600" />
                              Đơn dài hạn
                            </span>
                          )}
                        </div>

                        {/* Date & Time Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {task.isLongTerm ? (
                            <span className="text-[11px] bg-white/80 text-indigo-900 border border-indigo-200 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1.5 shadow-2xs">
                              <CalendarDays className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>
                                {task.startDate ? formatDateVN(task.startDate) : 'Hôm nay'} 
                                {task.endDate ? ` → ${formatDateVN(task.endDate)}` : ' (Dài hạn liên tục)'}
                              </span>
                              {task.durationLabel && (
                                <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-200/70 text-indigo-900 rounded-md text-[10px] font-bold">
                                  {task.durationLabel}
                                </span>
                              )}
                            </span>
                          ) : task.startDate ? (
                            <span className="text-[11px] bg-white/80 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Ngày: {formatDateVN(task.startDate)}</span>
                            </span>
                          ) : null}

                          {task.scheduledTime && (
                            <span className="text-[11px] bg-white/80 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              <span>{task.scheduledTime} - {taskEnd} {durText ? `(${durText})` : ''}</span>
                            </span>
                          )}

                          {remainingDays !== null && (
                            <span className={`text-[11px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 bg-white/80 ${
                              remainingDays > 5
                                ? 'text-emerald-800 border border-emerald-200'
                                : remainingDays >= 0
                                ? 'text-amber-800 border border-amber-200'
                                : 'text-rose-800 border border-rose-200'
                            }`}>
                              <Hourglass className="w-3 h-3" />
                              {remainingDays > 0 
                                ? `Còn ${remainingDays} ngày liệu trình` 
                                : remainingDays === 0 
                                ? 'Hôm nay hết hạn đợt' 
                                : `Hết hạn đợt (${Math.abs(remainingDays)} ngày trước)`}
                            </span>
                          )}
                        </div>

                        {/* Dosage, Category */}
                        <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                          <span className="text-[11px] text-teal-800 bg-white/80 border border-teal-200 px-2 py-0.5 rounded-md font-semibold">
                            {task.category}
                          </span>
                          <span className="text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                            {task.dosage}
                          </span>
                        </div>

                        {/* Doctor Notes */}
                        {task.notes && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start gap-1.5 mt-1">
                            <StickyNote className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span className="italic leading-relaxed">{task.notes}</span>
                          </div>
                        )}

                        {/* Attached Document Link */}
                        {task.documentUrl && (
                          <div className="pt-0.5">
                            <a
                              href={task.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-teal-300 transition shadow-2xs"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-600" />
                              <span>Tài liệu: {task.documentName || 'Mở tài liệu đính kèm'}</span>
                              <ExternalLink className="w-3 h-3 text-teal-500 ml-0.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: Chỉnh sửa & Xóa */}
                    <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => handleStartEdit(task)}
                        title="Chỉnh sửa phác đồ này"
                        className="text-slate-400 hover:text-teal-600 transition p-2 rounded-xl hover:bg-white/80 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Xóa liều thuốc này"
                        className="text-slate-300 hover:text-rose-500 transition p-2 rounded-xl hover:bg-white/80 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ================= EDIT PRESCRIPTION MODAL ================= */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Chỉnh Sửa Phác Đồ Điều Trị</h3>
                  <p className="text-xs text-slate-400">Điều chỉnh thông tin phác đồ đã lên lịch, thời gian kết thúc & màu sắc</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề đơn thuốc / Phác đồ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-hidden focus:border-teal-400 focus:bg-white transition"
                />
              </div>

              {/* Category, Dosage, Priority Border */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên khoa</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as TaskCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Hán tự (Hanzi)">Hán tự (Hanzi)</option>
                    <option value="Ngữ pháp">Ngữ pháp</option>
                    <option value="Luyện nghe">Luyện nghe</option>
                    <option value="Khẩu ngữ">Khẩu ngữ</option>
                    <option value="Đọc hiểu">Đọc hiểu</option>
                    <option value="Tâm lý học tập">Tâm lý học tập</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Liều lượng học</label>
                  <select
                    value={editForm.dosage}
                    onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value as DosageType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Liều nhẹ (5 - 10 phút)">Liều nhẹ (5 - 10p)</option>
                    <option value="Liều vừa (20 - 30 phút)">Liều vừa (20 - 30p)</option>
                    <option value="Liều cao (Chuyên sâu)">Liều cao (Chuyên sâu)</option>
                    <option value="Vitamin Bổ Não (Ôn tập hàng ngày)">Vitamin Bổ Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Màu khung viền của đầu việc:
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as PriorityLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Bắt buộc uống (Khẩn cấp)">🔴 Viền Đỏ: Bắt buộc uống</option>
                    <option value="Quan trọng (Uống trước)">🟡 Viền Vàng: Quan trọng</option>
                    <option value="Bình thường">🟢 Viền Xanh lá: Bình thường</option>
                    <option value="Tùy chọn / Thư giãn">⚪ Viền Xám: Tùy chọn</option>
                  </select>
                </div>
              </div>

              {/* Edit Modal: Màu sắc đầu việc theo sở thích */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-teal-600" />
                  <span>Màu sắc đầu việc (Chọn theo sở thích):</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {TASK_COLOR_PALETTES.map((c) => {
                    const isSelected = editForm.color === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, color: c.id })}
                        style={{ backgroundColor: c.bgHex, color: c.textHex, borderColor: isSelected ? c.textHex : c.borderHex }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                          isSelected ? 'ring-2 ring-teal-400 font-extrabold shadow-xs' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.textHex }} />
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs">
                    <input
                      type="color"
                      value={editForm.color.startsWith('#') ? editForm.color : '#f0fdfa'}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-5 h-5 rounded-md cursor-pointer border-0 p-0"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold">Tự chọn</span>
                  </div>
                </div>
              </div>

              {/* Edit Modal: Time & Custom Minute Duration & End Time */}
              <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-teal-600" />
                    <span>Hẹn giờ bắt đầu & Giờ kết thúc dự kiến (Tự do sửa từng phút):</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200 font-mono">
                    {editForm.scheduledTime} ➔ {editForm.endTime} ({formatDurationText(editForm.durationMinutes)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Giờ bắt đầu:
                    </label>
                    <input
                      type="time"
                      value={editForm.scheduledTime}
                      onChange={(e) => handleEditStartTimeChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Thời lượng (Sửa từng phút):
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={editForm.durationMinutes}
                        onChange={(e) => handleEditDurationMinutesChange(parseInt(e.target.value) || 1)}
                        className="w-14 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-center font-bold font-mono text-slate-900"
                      />
                      <span className="text-slate-500 font-semibold text-[11px]">phút</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Giờ kết thúc dự kiến:
                    </label>
                    <input
                      type="time"
                      value={editForm.endTime}
                      onChange={(e) => handleEditEndTimeChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-rose-700 focus:outline-hidden focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Preset Chips in Edit Modal */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-teal-100">
                  <span className="text-[10px] font-bold text-teal-900 mr-1">Nhanh:</span>
                  {[
                    { label: '17p', minutes: 17 },
                    { label: '30p', minutes: 30 },
                    { label: '36p', minutes: 36 },
                    { label: '45p', minutes: 45 },
                    { label: '1 giờ', minutes: 60 },
                    { label: '1.5 giờ', minutes: 90 },
                    { label: '2 giờ', minutes: 120 },
                  ].map((p) => (
                    <button
                      key={p.minutes}
                      type="button"
                      onClick={() => handleEditDurationMinutesChange(p.minutes)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer border ${
                        editForm.durationMinutes === p.minutes
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Ngày thực hiện bài học / Bắt đầu:</span>
                </label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-400"
                />
              </div>

              {/* Long Term Options */}
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isLongTerm}
                    onChange={(e) => setEditForm({ ...editForm, isLongTerm: e.target.checked })}
                    className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-indigo-950">
                    🗓️ Đơn thuốc dài hạn (Theo đợt liệu trình)
                  </span>
                </label>

                {editForm.isLongTerm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Ngày kết thúc liệu trình:
                      </label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tần suất uống:
                      </label>
                      <select
                        value={editForm.frequency}
                        onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value as PrescriptionFrequency })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                      >
                        <option value="Mỗi ngày (Hàng ngày)">Mỗi ngày (Hàng ngày)</option>
                        <option value="Cách 1 ngày (2 ngày / lần)">Cách 1 ngày (2 ngày / lần)</option>
                        <option value="Các ngày trong tuần (T2 - T6)">Các ngày trong tuần (T2 - T6)</option>
                        <option value="Cuối tuần (Thứ 7 & CN)">Cuối tuần (Thứ 7 & CN)</option>
                        <option value="Mỗi tuần 1 lần">Mỗi tuần 1 lần</option>
                        <option value="Khi cần thiết">Khi cần thiết</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Link & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Link tài liệu (Drive, Web, PDF)
                  </label>
                  <input
                    type="text"
                    value={editForm.documentUrl}
                    onChange={(e) => setEditForm({ ...editForm, documentUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên tài liệu hiển thị
                  </label>
                  <input
                    type="text"
                    value={editForm.documentName}
                    onChange={(e) => setEditForm({ ...editForm, documentName: e.target.value })}
                    placeholder="Ví dụ: Giáo trình Hán ngữ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú điều trị / Y lệnh dặn dò
                </label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Lời dặn thêm..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-teal-400"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa phác đồ này?')) {
                      onDeleteTask(editingTask.id);
                      setEditingTask(null);
                    }
                  }}
                  className="text-rose-500 hover:text-rose-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-rose-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa phác đồ này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-100 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
