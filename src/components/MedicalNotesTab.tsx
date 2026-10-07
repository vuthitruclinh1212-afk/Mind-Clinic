import React, { useState, useRef, useEffect } from 'react';
import { 
  ClipboardPen, 
  Download, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Check, 
  Copy, 
  Mic, 
  MicOff, 
  Volume2, 
  Languages, 
  PlusCircle, 
  ArrowDownToLine, 
  Radio, 
  FileCheck2, 
  Flame, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpDown, 
  FileText, 
  Edit3, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Tag
} from 'lucide-react';
import { MedicalRecord, RecordSeverity } from '../types';
import { soundEngine } from '../utils/audio';

interface MedicalNotesTabProps {
  notes: string;
  onSaveNotes: (newNotes: string) => void;
  medicalRecords: MedicalRecord[];
  onAddRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => void;
  onUpdateRecordSeverity: (id: string, severity: RecordSeverity) => void;
  onDeleteRecord: (id: string) => void;
}

const COMMON_RADICALS = [
  { radical: '亻 (Nhân đứng)', meaning: 'Con người, hành vi con người', example: '你, 他, 休' },
  { radical: '氵 (Ba chấm thủy)', meaning: 'Nước, chất lỏng, sông hồ', example: '海, 河, 洗' },
  { radical: '木 (Mộc)', meaning: 'Cây cối, gỗ, thực vật', example: '森, 林, 板' },
  { radical: '忄 / 心 (Tâm)', meaning: 'Tâm lý, cảm xúc, suy nghĩ', example: '想, 念, 忙' },
  { radical: '口 (Khẩu)', meaning: 'Miệng, âm thanh, ăn uống, lời nói', example: '吃, 喝, 叫' },
  { radical: '扌 (Thủ)', meaning: 'Bàn tay, động tác cầm nắm đánh', example: '打, 找, 拿' },
  { radical: '宀 (Miên)', meaning: 'Mái nhà, nơi trú ẩn an toàn', example: '家, 安, 定' },
  { radical: '言 / 讠 (Ngôn)', meaning: 'Lời nói, ngôn ngữ, thảo luận', example: '话, 说, 语' },
];

const PRACTICE_WORDS = [
  { hanzi: '你好', pinyin: 'Nǐ hǎo', meaning: 'Xin chào' },
  { hanzi: '休息', pinyin: 'Xiūxi', meaning: 'Nghỉ ngơi' },
  { hanzi: '学习', pinyin: 'Xuéxí', meaning: 'Học tập' },
  { hanzi: '慢慢来', pinyin: 'Mànmàn lái', meaning: 'Cứ từ từ' },
  { hanzi: '水滴石穿', pinyin: 'Shuǐ dī shí chuān', meaning: 'Nước chảy đá mòn' },
];

export const MedicalNotesTab: React.FC<MedicalNotesTabProps> = ({ 
  notes, 
  onSaveNotes,
  medicalRecords,
  onAddRecord,
  onUpdateRecordSeverity,
  onDeleteRecord,
}) => {
  const [activeView, setActiveView] = useState<'records' | 'markdown'>('records');
  const [copied, setCopied] = useState(false);
  const [showRadicalsHelp, setShowRadicalsHelp] = useState(false);

  // Filter & Sort States for Medical Records
  const [severityFilter, setSeverityFilter] = useState<'all' | 'urgent' | 'medium' | 'easy'>('all');
  const [sortRecordsBy, setSortRecordsBy] = useState<'severity' | 'newest' | 'title'>('severity');
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  // New Record Form States
  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecSeverity, setNewRecSeverity] = useState<RecordSeverity>('Nghiêm trọng (Rất khó - Cần xử lý trước)');
  const [newRecCategory, setNewRecCategory] = useState<MedicalRecord['category']>('Ngữ pháp');
  const [newRecContent, setNewRecContent] = useState('');

  // Voice recording and speech-to-text states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'zh-CN' | 'zh-TW' | 'vi-VN'>('zh-CN');
  const [transcribedText, setTranscribedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<string>('Sẵn sàng ghi âm giọng đọc');
  const [dictateDirectly, setDictateDirectly] = useState(true);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<string>(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLanguage;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingStatus('Đang lắng nghe... Hãy đọc to từ vựng tiếng Trung!');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          const trimmedFinal = final.trim();
          setTranscribedText((prev) => (prev ? prev + ' ' + trimmedFinal : trimmedFinal));

          if (dictateDirectly) {
            if (activeView === 'markdown') {
              const current = notesRef.current;
              const separator = current.endsWith('\n') || current.length === 0 ? '' : ' ';
              onSaveNotes(current + separator + trimmedFinal);
            } else if (isAddingRecord) {
              setNewRecContent((prev) => (prev ? prev + ' ' + trimmedFinal : trimmedFinal));
            }
          }
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setRecordingStatus('Quyền truy cập micro bị từ chối. Vui lòng cho phép truy cập micro.');
        } else if (event.error !== 'no-speech') {
          setRecordingStatus(`Thông báo: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [voiceLanguage, dictateDirectly, activeView, isAddingRecord]);

  // Handle Voice Recording Toggle
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecordingSession();
    } else {
      startRecordingSession();
    }
  };

  const startRecordingSession = async () => {
    setTranscribedText('');
    setInterimText('');
    setRecordingSeconds(0);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = voiceLanguage;
        recognitionRef.current.start();
        return;
      } catch (err) {
        console.warn('Web Speech API error:', err);
      }
    }
  };

  const stopRecordingSession = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    setIsRecording(false);
    setRecordingStatus('Đã hoàn tất ghi âm.');
  };

  // Text-To-Speech Pronunciation Helper
  const handleSpeakPractice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle.trim() || !newRecContent.trim()) return;

    onAddRecord({
      title: newRecTitle.trim(),
      severity: newRecSeverity,
      category: newRecCategory,
      content: newRecContent.trim(),
    });

    soundEngine.playSuccessChime();
    setNewRecTitle('');
    setNewRecContent('');
    setIsAddingRecord(false);
  };

  // Filter & Sort Medical Records
  const filteredRecords = medicalRecords.filter((r) => {
    if (severityFilter === 'urgent') return r.severity === 'Nghiêm trọng (Rất khó - Cần xử lý trước)';
    if (severityFilter === 'medium') return r.severity === 'Trung bình (Cần theo dõi)';
    if (severityFilter === 'easy') return r.severity === 'Nhẹ (Dễ - Đã ổn định)';
    return true;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortRecordsBy === 'severity') {
      const weights: Record<RecordSeverity, number> = {
        'Nghiêm trọng (Rất khó - Cần xử lý trước)': 3,
        'Trung bình (Cần theo dõi)': 2,
        'Nhẹ (Dễ - Đã ổn định)': 1,
      };
      return (weights[b.severity] || 0) - (weights[a.severity] || 0);
    }
    if (sortRecordsBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Newest
    return b.id.localeCompare(a.id);
  });

  const urgentCount = medicalRecords.filter(r => r.severity === 'Nghiêm trọng (Rất khó - Cần xử lý trước)').length;
  const mediumCount = medicalRecords.filter(r => r.severity === 'Trung bình (Cần theo dõi)').length;
  const easyCount = medicalRecords.filter(r => r.severity === 'Nhẹ (Dễ - Đã ổn định)').length;

  return (
    <section className="space-y-6">
      {/* Top Banner: View Switcher & Speech Dictation Control */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl shadow-xs">
            <ClipboardPen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>Hồ Sơ & Sổ Bệnh Án Tri Thức</span>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                {medicalRecords.length} hồ sơ theo dõi
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Phân cấp theo mức độ khó (nghiêm trọng / dễ) để bệnh nhân biết cần xử lý hồ sơ nào trước
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setActiveView('records')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'records'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Phân Cấp Mức Độ Khó ({medicalRecords.length})</span>
            </button>
            <button
              onClick={() => setActiveView('markdown')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'markdown'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Sổ Ghi Chép Toàn Cảnh</span>
            </button>
          </div>

          <button
            onClick={toggleRecording}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-200'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isRecording ? `Đang nghe (${voiceLanguage})...` : 'Đọc giọng nói'}</span>
          </button>
        </div>
      </div>

      {/* Live Voice Dictation Status Banner */}
      {isRecording && (
        <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center space-x-2 text-teal-800">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
            <span className="font-bold">Web Speech API đang chép giọng đọc ({voiceLanguage}):</span>
            <span className="italic text-teal-900 font-mono">
              {interimText ? `"${interimText}"` : 'Đang lắng nghe âm thanh...'}
            </span>
          </div>
          <span className="text-[10px] text-teal-600 bg-white px-2 py-0.5 rounded-md font-semibold border border-teal-100 shrink-0">
            {recordingSeconds}s
          </span>
        </div>
      )}

      {/* ================= VIEW 1: STRUCTURED MEDICAL RECORDS WITH SEVERITY ================= */}
      {activeView === 'records' && (
        <div className="space-y-6">
          {/* Controls: Add Record & Severity Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <span>Đánh Giá Mức Độ Khó & Phân Cấp Xử Lý Hồ Sơ</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {urgentCount} hồ sơ nghiêm trọng cần giải quyết trước • {mediumCount} hồ sơ theo dõi • {easyCount} hồ sơ đã ổn định
                </p>
              </div>

              <button
                onClick={() => setIsAddingRecord(!isAddingRecord)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingRecord ? 'Đóng form' : '+ Lập hồ sơ bệnh án mới'}</span>
              </button>
            </div>

            {/* Add Record Form */}
            {isAddingRecord && (
              <form onSubmit={handleCreateRecordSubmit} className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3 text-xs animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <label className="block text-slate-700 font-bold mb-1">Tiêu đề bệnh án *</label>
                    <input
                      type="text"
                      required
                      value={newRecTitle}
                      onChange={(e) => setNewRecTitle(e.target.value)}
                      placeholder="Ví dụ: Phân biệt 了解 vs 理解, Cấu trúc câu chữ Ba (把)..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-slate-700 font-bold mb-1">Mức độ nghiêm trọng / Độ khó *</label>
                    <select
                      value={newRecSeverity}
                      onChange={(e) => setNewRecSeverity(e.target.value as RecordSeverity)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-teal-400"
                    >
                      <option value="Nghiêm trọng (Rất khó - Cần xử lý trước)">🔴 Nghiêm trọng (Rất khó - Cần xử lý trước)</option>
                      <option value="Trung bình (Cần theo dõi)">🟡 Trung bình (Cần theo dõi)</option>
                      <option value="Nhẹ (Dễ - Đã ổn định)">🟢 Nhẹ (Dễ - Đã ổn định)</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-slate-700 font-bold mb-1">Chuyên mục</label>
                    <select
                      value={newRecCategory}
                      onChange={(e) => setNewRecCategory(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
                    >
                      <option value="Hán tự">Hán tự</option>
                      <option value="Ngữ pháp">Ngữ pháp</option>
                      <option value="Phát âm">Phát âm</option>
                      <option value="Từ vựng">Từ vựng</option>
                      <option value="Tâm lý học tập">Tâm lý học tập</option>
                    </select>
                  </div>
                  <div className="md:col-span-12">
                    <label className="block text-slate-700 font-bold mb-1">Nội dung bệnh án & Ghi chép chi tiết *</label>
                    <textarea
                      rows={3}
                      required
                      value={newRecContent}
                      onChange={(e) => setNewRecContent(e.target.value)}
                      placeholder="Ghi chép lý do khó hiểu, phân tích chiết tự, câu ví dụ hoặc dặn dò..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400 leading-relaxed font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingRecord(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Lưu vào Hồ Sơ Bệnh Án
                  </button>
                </div>
              </form>
            )}

            {/* Severity Filter and Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setSeverityFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                    severityFilter === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả ({medicalRecords.length})
                </button>
                <button
                  onClick={() => setSeverityFilter('urgent')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
                    severityFilter === 'urgent' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🔴 Nghiêm trọng ({urgentCount})</span>
                </button>
                <button
                  onClick={() => setSeverityFilter('medium')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
                    severityFilter === 'medium' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🟡 Trung bình ({mediumCount})</span>
                </button>
                <button
                  onClick={() => setSeverityFilter('easy')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
                    severityFilter === 'easy' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🟢 Đã ổn định ({easyCount})</span>
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-500">Ưu tiên xử lý:</span>
                <select
                  value={sortRecordsBy}
                  onChange={(e) => setSortRecordsBy(e.target.value as any)}
                  className="bg-transparent font-bold text-teal-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="severity">🚨 Nghiêm trọng (Rất khó) xử lý trước</option>
                  <option value="newest">📅 Mới cập nhật gần nhất</option>
                  <option value="title">🔤 Theo thứ tự tiêu đề A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedRecords.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 text-sm bg-white rounded-3xl border border-dashed border-slate-200">
                Không có hồ sơ nào trong danh mục này. Hãy lập hồ sơ mới hoặc yêu cầu Dr. Ling tự động ghi chép thay bạn!
              </div>
            ) : (
              sortedRecords.map((rec) => {
                const isUrgent = rec.severity === 'Nghiêm trọng (Rất khó - Cần xử lý trước)';
                const isMedium = rec.severity === 'Trung bình (Cần theo dõi)';

                return (
                  <div
                    key={rec.id}
                    className={`bg-white p-5 rounded-3xl border transition flex flex-col justify-between shadow-xs ${
                      isUrgent
                        ? 'border-rose-200 ring-1 ring-rose-100 hover:border-rose-300'
                        : isMedium
                        ? 'border-amber-200 hover:border-amber-300'
                        : 'border-slate-200 hover:border-teal-200'
                    }`}
                  >
                    <div>
                      {/* Card Header: Severity Badge and Title */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                                  : isMedium
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isUrgent && <Flame className="w-3 h-3 text-rose-600" />}
                              {isMedium && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                              {!isUrgent && !isMedium && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{rec.severity}</span>
                            </span>

                            <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md font-semibold">
                              {rec.category}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-base leading-snug">
                            {rec.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => onDeleteRecord(rec.id)}
                          title="Xóa hồ sơ bệnh án này"
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content Preview */}
                      <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-line my-2">
                        {rec.content}
                      </div>
                    </div>

                    {/* Card Footer: Change Severity Dropdown & Doctor note badge */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span>Ngày ghi: {rec.createdAt}</span>
                        {rec.doctorAssigned && (
                          <span className="text-teal-600 font-semibold">• 🩺 Dr. Ling tự động kê</span>
                        )}
                      </div>

                      {/* Quick severity update */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Đổi mức:</span>
                        <select
                          value={rec.severity}
                          onChange={(e) => onUpdateRecordSeverity(rec.id, e.target.value as RecordSeverity)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Nghiêm trọng (Rất khó - Cần xử lý trước)">🔴 Nghiêm trọng</option>
                          <option value="Trung bình (Cần theo dõi)">🟡 Trung bình</option>
                          <option value="Nhẹ (Dễ - Đã ổn định)">🟢 Đã ổn định</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: MARKDOWN GENERAL NOTEBOOK ================= */}
      {activeView === 'markdown' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[calc(100vh-280px)]">
          {/* Header Tools */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-800">Sổ Ghi Chép Toàn Cảnh (Markdown)</h3>
              <p className="text-xs text-slate-400">Tự động sao lưu an toàn • Hỗ trợ mẫu chữ Hán</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRadicalsHelp(!showRadicalsHelp)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  showRadicalsHelp ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tra 8 Bộ Thủ Gốc</span>
              </button>
            </div>
          </div>

          {/* Radicals Reference Drawer */}
          {showRadicalsHelp && (
            <div className="my-3 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  8 Bộ Thủ Sinh Tồn Phổ Biến Nhất
                </span>
                <button
                  onClick={() => setShowRadicalsHelp(false)}
                  className="text-xs text-amber-700 hover:underline cursor-pointer"
                >
                  Đóng lại
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {COMMON_RADICALS.map((r, i) => (
                  <div key={i} className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                    <p className="font-bold text-teal-800 text-sm">{r.radical}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">{r.meaning}</p>
                    <p className="text-slate-400 text-[10px] mt-1 italic">Ví dụ: {r.example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="flex-1 mt-3 flex flex-col">
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => onSaveNotes(e.target.value)}
              placeholder="Ghi chép tự do các từ vựng, ngữ pháp tiếng Trung..."
              className="flex-1 w-full p-4 text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-teal-400 focus:bg-white leading-relaxed font-mono resize-none transition min-h-[360px]"
            />
          </div>
        </div>
      )}
    </section>
  );
};
