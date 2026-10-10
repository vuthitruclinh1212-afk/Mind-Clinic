import React, { useState } from 'react';
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
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { Task, DosageType, TaskCategory, PriorityLevel } from '../types';
import { soundEngine } from '../utils/audio';

interface AddTaskPayload {
  title: string;
  dosage: DosageType;
  category: TaskCategory;
  priority: PriorityLevel;
  scheduledTime?: string;
  documentUrl?: string;
  documentName?: string;
  notes?: string;
}

interface PrescriptionsTabProps {
  tasks: Task[];
  onAddTask: (task: AddTaskPayload) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onAddMultipleTasks: (newTasks: Omit<Task, 'id' | 'createdAt'>[]) => void;
  onUpdatePriority?: (id: number, priority: PriorityLevel) => void;
}

export const PrescriptionsTab: React.FC<PrescriptionsTabProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddMultipleTasks,
  onUpdatePriority,
}) => {
  // Form States
  const [title, setTitle] = useState('');
  const [dosage, setDosage] = useState<DosageType>('Liều nhẹ (5 - 10 phút)');
  const [category, setCategory] = useState<TaskCategory>('Hán tự (Hanzi)');
  const [priority, setPriority] = useState<PriorityLevel>('Bình thường');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);

  // Filter & Sort States
  const [filter, setFilter] = useState<'all' | 'active' | 'done' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'dosage' | 'created'>('priority');

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
    };

    if (scheduledTime.trim()) {
      payload.scheduledTime = scheduledTime.trim();
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
    if (presetName === 'hanzi-starter') {
      onAddMultipleTasks([
        { 
          title: 'Nhai 3 chữ Hán bộ Thủy (氵): 江 (jiāng), 河 (hé), 海 (hǎi)', 
          dosage: 'Liều nhẹ (5 - 10 phút)', 
          category: 'Hán tự (Hanzi)', 
          priority: 'Bắt buộc uống (Khẩn cấp)', 
          scheduledTime: '08:30', 
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
          notes: 'Chiết tự: Nhân đứng + Mộc = Nghỉ ngơi.', 
          done: false 
        },
      ]);
    } else if (presetName === 'listening-bath') {
      onAddMultipleTasks([
        { 
          title: 'Nghe 1 bài nhạc Hoa nhẹ nhàng (thả lỏng không cố dịch nghĩa)', 
          dosage: 'Liều nhẹ (5 - 10 phút)', 
          category: 'Luyện nghe', 
          priority: 'Quan trọng (Uống trước)', 
          scheduledTime: '12:30', 
          notes: 'Uống liều này vào giờ nghỉ trưa để tâm trí hấp thu thụ động.', 
          done: false 
        },
        { 
          title: 'Xem 1 video ngắn trên Bilibili tắm ngôn ngữ thực tế', 
          dosage: 'Liều vừa (20 - 30 phút)', 
          category: 'Luyện nghe', 
          priority: 'Bình thường', 
          scheduledTime: '20:00', 
          documentUrl: 'https://www.bilibili.com', 
          documentName: 'Kênh Bilibili cuộc sống', 
          done: false 
        },
      ]);
    } else if (presetName === 'grammar-essentials') {
      onAddMultipleTasks([
        { 
          title: 'Phân biệt bộ ba trợ từ kết cấu 的, 得, 地', 
          dosage: 'Liều vừa (20 - 30 phút)', 
          category: 'Ngữ pháp', 
          priority: 'Bắt buộc uống (Khẩn cấp)', 
          scheduledTime: '14:00', 
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
      // If same priority, compare scheduled time
      return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
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
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="space-y-6">
      {/* Form Kê Thêm Liều Lượng Học Mới */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Kê Đơn Thuốc & Phác Đồ Học Tập</h2>
              <p className="text-xs text-slate-500">
                Lên giờ uống thuốc trong ngày, gắn tài liệu liên quan & đánh dấu các liều bắt buộc uống
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedForm(!showAdvancedForm)}
            className="text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 cursor-pointer"
          >
            {showAdvancedForm ? (
              <><span>Rút gọn chi tiết</span> <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <><span>+ Thêm tài liệu & ghi chú dặn dò</span> <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Primary Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tên liều thuốc (ví dụ: Nhai 5 chữ Hán bộ Mộc, Đọc 1 bài hội thoại...)"
              className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:outline-hidden focus:border-teal-400 focus:bg-white transition"
            />

            <select
              value={dosage}
              onChange={(e) => setDosage(e.target.value as DosageType)}
              className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs focus:outline-hidden focus:border-teal-400 text-slate-800 font-semibold"
            >
              <option value="Liều nhẹ (5 - 10 phút)">Liều nhẹ (5 - 10p)</option>
              <option value="Liều vừa (20 - 30 phút)">Liều vừa (20 - 30p)</option>
              <option value="Liều cao (Chuyên sâu)">Liều cao (Chuyên sâu)</option>
              <option value="Vitamin Bổ Não (Ôn tập hàng ngày)">Vitamin Bổ Não (Ôn tập)</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs focus:outline-hidden focus:border-teal-400 text-slate-800 font-semibold"
            >
              <option value="Bắt buộc uống (Khẩn cấp)">🔴 Bắt buộc uống (Khẩn cấp)</option>
              <option value="Quan trọng (Uống trước)">🟡 Quan trọng (Uống trước)</option>
              <option value="Bình thường">🟢 Bình thường</option>
              <option value="Tùy chọn / Thư giãn">⚪ Tùy chọn / Thư giãn</option>
            </select>

            <div className="md:col-span-2 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                title="Thời gian uống thuốc trong ngày"
                className="bg-transparent text-slate-800 font-bold focus:outline-hidden w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Advanced Row: Document Link & Notes (Collapsible or visible) */}
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
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-md shadow-teal-100 transition shrink-0 cursor-pointer"
            >
              Kê đơn thuốc ngay
            </button>
          </div>
        </form>

        {/* Quick Presets Packs */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Phác đồ điều trị mẫu có sẵn tài liệu & giờ uống thuốc:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleApplyPreset('hanzi-starter')}
              className="text-xs bg-rose-50/70 hover:bg-rose-100 text-rose-800 border border-rose-200/60 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <span>🔴 + Phác đồ cấp bách: Mất gốc Hán tự (Có tài liệu Hanzii & Bishun)</span>
            </button>
            <button
              onClick={() => handleApplyPreset('grammar-essentials')}
              className="text-xs bg-amber-50/70 hover:bg-amber-100 text-amber-800 border border-amber-200/60 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <span>🟡 + Phác đồ quan trọng: Phân biệt 的, 得, 地 (Grammar Wiki)</span>
            </button>
            <button
              onClick={() => handleApplyPreset('listening-bath')}
              className="text-xs bg-teal-50/70 hover:bg-teal-100 text-teal-800 border border-teal-200/60 px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <span>+ Phác đồ thư giãn: Tắm ngôn ngữ Bilibili & Nhạc Hoa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danh Sách Đơn Thuốc Đang Điều Trị */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {/* Controls: Filter & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              Đã uống {completed} trên tổng số {total} liều ({percent}%) • Có thể uống sớm trước giờ hẹn
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-teal-700 focus:outline-hidden cursor-pointer"
              >
                <option value="priority">🚨 Mức độ quan trọng (Bắt buộc uống trước)</option>
                <option value="time">⏰ Giờ uống trong ngày (Sáng &rarr; Tối)</option>
                <option value="dosage">⏳ Theo liều lượng thời gian</option>
                <option value="created">📅 Mới kê gần nhất</option>
              </select>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filter === 'all' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả ({total})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filter === 'urgent' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cần uống trước ({urgentCount})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filter === 'active' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chưa uống ({total - completed})
              </button>
              <button
                onClick={() => setFilter('done')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  filter === 'done' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đã uống ({completed})
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3 pt-2">
          {sortedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              Không có đơn thuốc nào phù hợp bộ lọc. Hãy an tâm nghỉ ngơi hoặc kê thêm liều mới!
            </div>
          ) : (
            sortedTasks.map((task) => {
              const isUrgent = task.priority === 'Bắt buộc uống (Khẩn cấp)';
              const isImportant = task.priority === 'Quan trọng (Uống trước)';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-3xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    task.done
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : isUrgent
                      ? 'bg-gradient-to-r from-rose-50/40 via-white to-white border-rose-200 shadow-xs ring-1 ring-rose-200/50'
                      : isImportant
                      ? 'bg-gradient-to-r from-amber-50/40 via-white to-white border-amber-200 shadow-xs'
                      : 'bg-white border-teal-100 shadow-xs hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 flex-1">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="cursor-pointer focus:outline-hidden mt-0.5"
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 hover:scale-110 transition" />
                      ) : (
                        <Circle className={`w-6 h-6 ${isUrgent ? 'text-rose-400' : 'text-teal-400'} hover:scale-110 transition`} />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      {/* Title and Priority Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm font-bold ${
                            task.done ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </p>

                        {/* Priority Badge */}
                        {isUrgent && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-600" />
                            Bắt buộc uống
                          </span>
                        )}
                        {isImportant && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-600 fill-amber-400" />
                            Quan trọng (Uống trước)
                          </span>
                        )}

                        {/* Early Completion Badge */}
                        {task.done && task.completedEarly && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            Uống sớm trước giờ hẹn! ✨
                          </span>
                        )}
                      </div>

                      {/* Dosage, Category and Scheduled Time Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {task.scheduledTime && (
                          <span className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-teal-600" />
                            Giờ uống: {task.scheduledTime}
                          </span>
                        )}

                        <span className="text-[11px] text-teal-700 bg-teal-50/70 border border-teal-100 px-2 py-0.5 rounded-md font-medium">
                          {task.category}
                        </span>

                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {task.dosage}
                        </span>

                        {task.completedAt && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Đã uống lúc: {task.completedAt}
                          </span>
                        )}
                      </div>

                      {/* Doctor Notes (Ghi chú điều trị) */}
                      {task.notes && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start gap-1.5 mt-1">
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
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>Tài liệu: {task.documentName || 'Mở tài liệu đính kèm'}</span>
                            <ExternalLink className="w-3 h-3 text-teal-500 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      title="Xóa liều thuốc này"
                      className="text-slate-300 hover:text-rose-500 transition p-2 rounded-xl hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
