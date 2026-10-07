export type DosageType = 
  | 'Liều nhẹ (5 - 10 phút)' 
  | 'Liều vừa (20 - 30 phút)' 
  | 'Liều cao (Chuyên sâu)' 
  | 'Vitamin Bổ Não (Ôn tập hàng ngày)';

export type TaskCategory = 
  | 'Hán tự (Hanzi)' 
  | 'Ngữ pháp' 
  | 'Luyện nghe' 
  | 'Khẩu ngữ' 
  | 'Đọc hiểu' 
  | 'Tâm lý học tập';

export type PriorityLevel = 
  | 'Bắt buộc uống (Khẩn cấp)' 
  | 'Quan trọng (Uống trước)' 
  | 'Bình thường' 
  | 'Tùy chọn / Thư giãn';

export interface Task {
  id: number;
  title: string;
  dosage: DosageType;
  category: TaskCategory;
  priority: PriorityLevel;
  scheduledTime?: string; // e.g. "08:30", "14:00", "20:00"
  documentUrl?: string; // link to documents, books, drive
  documentName?: string; // display name for document
  notes?: string; // specific prescription notes
  done: boolean;
  completedAt?: string;
  completedEarly?: boolean;
  createdAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  url: string; // link to mp3 or data URL
  category: 'Cổ phong tĩnh tâm' | 'Lofi học tập' | 'Sóng não Alpha' | 'Thiên nhiên chữa lành' | 'Tự thêm';
  isCustom?: boolean;
}

export interface DripSession {
  id: number;
  startTime: string;
  date?: string;
  dayKey?: string;
  durationSeconds: number;
  volumeMl: number;
  mood: string;
  taskTitle?: string;
  musicTrackTitle?: string;
}

export interface SubPharmacyItem {
  id: string;
  title: string;
  url: string;
  note?: string; // Ghi chú kiến thức hoặc đã xem đến phút thứ mấy
  timestampProgress?: string; // Ví dụ: "Phút 08:35" hoặc "08:35 / 15:20"
  isCompleted?: boolean; // Trạng thái đã xem / đã học xong
  linkedMedicalNoteTitle?: string; // Tên đề mục liên kết trong Hồ Sơ Bệnh Án
  createdAt?: string;
}

export interface PharmacyItem {
  id: string;
  title: string;
  category: 'Từ điển' | 'Video & Nghe' | 'Tập viết Hán tự' | 'Ngữ pháp' | 'Công cụ khác';
  desc: string;
  url: string;
  iconText: string;
  badge: string;
  badgeColor: string;
  isCustom?: boolean;
  subItems?: SubPharmacyItem[]; // Các trang web con, video chi tiết có note
}

export type RecordSeverity = 
  | 'Nghiêm trọng (Rất khó - Cần xử lý trước)' 
  | 'Trung bình (Cần theo dõi)' 
  | 'Nhẹ (Dễ - Đã ổn định)';

export interface MedicalRecord {
  id: string;
  title: string;
  severity: RecordSeverity;
  category: 'Hán tự' | 'Ngữ pháp' | 'Phát âm' | 'Từ vựng' | 'Tâm lý học tập';
  content: string;
  createdAt: string;
  updatedAt?: string;
  doctorAssigned?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  time: string;
  source?: string;
  autoRecorded?: boolean;
  newRecordCreated?: MedicalRecord;
}

export type MoodType = {
  id: string;
  emoji: string;
  label: string;
  prescription: string;
};
