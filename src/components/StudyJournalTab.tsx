import React, { useState, useMemo } from 'react';
import { 
  BookHeart, 
  Calendar, 
  Clock, 
  Sparkles, 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  Flame, 
  Save, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Quote, 
  Tag, 
  CalendarDays,
  ShieldCheck,
  Star
} from 'lucide-react';
import { StudyJournalEntry, ComfortRating } from '../types';
import { soundEngine } from '../utils/audio';

interface StudyJournalTabProps {
  entries: StudyJournalEntry[];
  onAddEntry: (entry: Omit<StudyJournalEntry, 'id' | 'createdAt'>) => void;
  onUpdateEntry: (id: string, entry: Partial<StudyJournalEntry>) => void;
  onDeleteEntry: (id: string) => void;
}

const COMFORT_OPTIONS: { rating: ComfortRating; score: number; emoji: string; desc: string; colorClass: string; bgClass: string; borderClass: string }[] = [
  {
    rating: 'Trạng thái Dòng chảy (Flow) cực độ',
    score: 5,
    emoji: '✨',
    desc: 'Đắm chìm tự nhiên, không thấy thời gian trôi, an yên tuyệt đối',
    colorClass: 'text-purple-700',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200'
  },
  {
    rating: 'Thư thái / Dễ chịu',
    score: 4,
    emoji: '🌿',
    desc: 'Học nhẹ nhàng, không bị gánh nặng, đầu óc thông thoáng',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200'
  },
  {
    rating: 'Bình thường / Ổn định',
    score: 3,
    emoji: '🍵',
    desc: 'Tâm trạng ổn định, hoàn thành đều đặn theo nhịp độ',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200'
  },
  {
    rating: 'Hơi gò bó / Mệt mỏi',
    score: 2,
    emoji: '☁️',
    desc: 'Hơi mỏi mắt hoặc gò bó, cần thêm thời gian thả lỏng',
    colorClass: 'text-orange-700',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200'
  },
  {
    rating: 'Rất căng thẳng / Áp lực cao',
    score: 1,
    emoji: '🌧️',
    desc: 'Não bộ quá tải, cảm giác bị dồn ép, cần nghỉ ngơi ngay',
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200'
  },
];

const PRESET_HOURS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

export const StudyJournalTab: React.FC<StudyJournalTabProps> = ({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr);
  const [studyHours, setStudyHours] = useState<number>(2);
  const [comfortRating, setComfortRating] = useState<ComfortRating>('Thư thái / Dễ chịu');
  const [feelingsText, setFeelingsText] = useState('');
  const [highlights, setHighlights] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [showForm, setShowForm] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');

  const selectedComfortObj = useMemo(() => {
    return COMFORT_OPTIONS.find((c) => c.rating === comfortRating) || COMFORT_OPTIONS[1];
  }, [comfortRating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feelingsText.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const score = selectedComfortObj.score;

    if (editingId) {
      onUpdateEntry(editingId, {
        date,
        studyHours: Number(studyHours) || 0,
        comfortRating,
        comfortScore: score,
        feelingsText: feelingsText.trim(),
        highlights: highlights.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
      });
      setEditingId(null);
    } else {
      onAddEntry({
        date,
        studyHours: Number(studyHours) || 0,
        comfortRating,
        comfortScore: score,
        feelingsText: feelingsText.trim(),
        highlights: highlights.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
    }

    // Reset Form
    setDate(todayStr);
    setStudyHours(2);
    setComfortRating('Thư thái / Dễ chịu');
    setFeelingsText('');
    setHighlights('');
    setTagsInput('');
    soundEngine.playSuccessChime();
  };

  const handleStartEdit = (entry: StudyJournalEntry) => {
    setEditingId(entry.id);
    setDate(entry.date);
    setStudyHours(entry.studyHours);
    setComfortRating(entry.comfortRating);
    setFeelingsText(entry.feelingsText);
    setHighlights(entry.highlights || '');
    setTagsInput((entry.tags || []).join(', '));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDate(todayStr);
    setStudyHours(2);
    setComfortRating('Thư thái / Dễ chịu');
    setFeelingsText('');
    setHighlights('');
    setTagsInput('');
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      if (filterRating !== 'all' && item.comfortRating !== filterRating) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = item.feelingsText.toLowerCase().includes(q);
        const matchHighlight = item.highlights?.toLowerCase().includes(q);
        const matchDate = item.date.includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchText && !matchHighlight && !matchDate && !matchTags) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, filterRating, searchQuery]);

  // Private journal stats
  const totalEntries = entries.length;
  const totalRecordedHours = entries.reduce((sum, e) => sum + (e.studyHours || 0), 0);
  const avgComfortScore = totalEntries > 0
    ? (entries.reduce((sum, e) => sum + (e.comfortScore || 3), 0) / totalEntries).toFixed(1)
    : '0';

  const formatDateVN = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-emerald-500/10 border border-purple-200/60 rounded-3xl p-6 backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-200 shrink-0">
              <BookHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">Nhật Ký Học Tập & Trị Liệu Tâm Hồn</h2>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200">
                  Mục Độc Lập
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Nơi bạn tự do ghi nhận tổng số giờ học trong ngày và cảm nhận sự thoải mái của tâm trí • Không ảnh hưởng đến các báo cáo dòng chảy trên màn hình chính
              </p>
            </div>
          </div>

          {/* Quick Stats Banner (Independent) */}
          <div className="flex items-center gap-3 bg-white/80 p-3 rounded-2xl border border-purple-100 shadow-2xs self-start md:self-auto">
            <div className="text-center px-2 border-r border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Trang nhật ký</p>
              <p className="text-sm font-black text-purple-700">{totalEntries}</p>
            </div>
            <div className="text-center px-2 border-r border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Giờ tự ghi nhận</p>
              <p className="text-sm font-black text-teal-700">{totalRecordedHours.toFixed(1)}h</p>
            </div>
            <div className="text-center px-2">
              <p className="text-[10px] text-slate-400 font-medium">Độ thoải mái TB</p>
              <p className="text-sm font-black text-emerald-600 flex items-center justify-center gap-0.5">
                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                {avgComfortScore} / 5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diary Writing Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Edit3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-800 text-lg">
              {editingId ? 'Chỉnh Sửa Trang Nhật Ký' : 'Viết Nhật Ký Hôm Nay'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            {showForm ? 'Thu gọn khung viết' : '+ Mở khung viết nhật ký'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
            {/* Top Row: Date & Self-Recorded Study Hours */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Date Input */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Ngày ghi nhận:</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-purple-400 cursor-pointer"
                />
              </div>

              {/* Study Hours Self-Recorded */}
              <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tổng số giờ học hôm nay (Bạn tự ghi nhận):</span>
                  </label>
                  <span className="text-xs font-black text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-lg">
                    {studyHours} giờ
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-teal-400"
                  />
                  <span className="text-xs text-slate-400 font-medium mr-1">hoặc chọn nhanh:</span>
                  {PRESET_HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setStudyHours(h)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        studyHours === h
                          ? 'bg-teal-500 text-white shadow-2xs'
                          : 'bg-white hover:bg-teal-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comfort Rating Selector */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Đánh giá sự thoải mái của tâm trí & cơ thể hôm nay:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {COMFORT_OPTIONS.map((opt) => {
                  const isSelected = comfortRating === opt.rating;
                  return (
                    <button
                      key={opt.rating}
                      type="button"
                      onClick={() => setComfortRating(opt.rating)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? `${opt.bgClass} ${opt.borderClass} ring-2 ring-purple-400/50 shadow-xs`
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{opt.emoji}</span>
                        <div className="flex items-center">
                          {Array.from({ length: opt.score }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? opt.colorClass : 'text-slate-800'}`}>
                          {opt.rating}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feelings & Reflection Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-purple-600" />
                <span>Trang nhật ký & Cảm nhận hôm nay *</span>
              </label>
              <textarea
                required
                rows={5}
                value={feelingsText}
                onChange={(e) => setFeelingsText(e.target.value)}
                placeholder="Hôm nay bạn cảm thấy thế nào khi học? Có điều gì làm bạn vui, một từ ngữ bạn ấn tượng, hay khoảnh khắc não bộ được thư thái? Cứ thả lỏng và viết ra chân thực nhất nhé..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed focus:outline-hidden focus:border-purple-400 focus:bg-white transition"
              />
            </div>

            {/* Optional Highlights and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-7">
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Điểm sáng tâm đắc nhất (Tùy chọn):</span>
                </label>
                <input
                  type="text"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Ví dụ: Nhớ được mẹo chiết tự chữ 安; Nghe hiểu trọn vẹn 1 đoạn hội thoại..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-400 focus:bg-white"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-purple-500" />
                  <span>Thẻ ghi chú (Phân tách bằng dấu phẩy):</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ví dụ: #HánTự, #NgheNhạc, #ÊmDịu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Hủy chỉnh sửa
                </button>
              )}
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-7 py-3 rounded-2xl text-xs shadow-md shadow-purple-200 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Cập nhật trang nhật ký' : 'Lưu vào sổ nhật ký học tập'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Diary Entries List Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {/* Controls: Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              <span>Dòng Thời Gian Nhật Ký ({filteredEntries.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Xem lại những ngày bạn đã tự thưởng cho mình sự thoải mái và kiên trì
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nội dung, ngày, tag..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-400"
              />
            </div>

            {/* Filter Rating */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-purple-400"
            >
              <option value="all">Tất cả mức độ thoải mái</option>
              {COMFORT_OPTIONS.map((c) => (
                <option key={c.rating} value={c.rating}>
                  {c.emoji} {c.rating}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4 pt-1">
          {filteredEntries.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm bg-purple-50/20 rounded-3xl border border-dashed border-purple-200 space-y-2">
              <BookHeart className="w-8 h-8 text-purple-300 mx-auto" />
              <p className="font-medium text-slate-600">Chưa có trang nhật ký nào phù hợp.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hãy viết trang nhật ký đầu tiên để tự ghi nhận số giờ học và cảm xúc của bạn hôm nay nhé!
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const comfortObj = COMFORT_OPTIONS.find((c) => c.rating === entry.comfortRating) || COMFORT_OPTIONS[1];

              return (
                <article
                  key={entry.id}
                  className="p-5 rounded-3xl border border-purple-100/70 bg-gradient-to-br from-white via-white to-purple-50/30 hover:border-purple-200 transition space-y-3 shadow-2xs"
                >
                  {/* Card Header: Date, Hours, Comfort Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Date Badge */}
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>{formatDateVN(entry.date)}</span>
                      </span>

                      {/* Study Hours Self-Recorded */}
                      <span className="text-xs font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>Tự ghi nhận: {entry.studyHours} giờ học</span>
                      </span>

                      {/* Comfort Badge */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${comfortObj.bgClass} ${comfortObj.colorClass} ${comfortObj.borderClass}`}>
                        <span>{comfortObj.emoji}</span>
                        <span>{entry.comfortRating}</span>
                        <span className="text-[10px] opacity-75">({entry.comfortScore}★)</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition cursor-pointer"
                        title="Chỉnh sửa nhật ký"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Xóa trang này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Highlights (if present) */}
                  {entry.highlights && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Điểm sáng hôm nay: </span>
                        <span>{entry.highlights}</span>
                      </div>
                    </div>
                  )}

                  {/* Main Feelings Text */}
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {entry.feelingsText}
                  </p>

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {entry.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"
                        >
                          #{t.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.updatedAt && (
                    <p className="text-[10px] text-slate-400 italic">
                      Đã cập nhật ngày {entry.updatedAt}
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
