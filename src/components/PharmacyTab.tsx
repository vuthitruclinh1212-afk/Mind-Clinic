import React, { useState } from 'react';
import { 
  Library, 
  ExternalLink, 
  Plus, 
  Search, 
  Sparkles, 
  Filter, 
  Trash2, 
  BookMarked, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  StickyNote, 
  Link2, 
  FolderPlus,
  ArrowRight
} from 'lucide-react';
import { PharmacyItem, SubPharmacyItem } from '../types';
import { soundEngine } from '../utils/audio';

interface PharmacyTabProps {
  items: PharmacyItem[];
  onAddItem: (item: Omit<PharmacyItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onAddSubItem: (pharmacyId: string, subItem: Omit<SubPharmacyItem, 'id'>) => void;
  onDeleteSubItem: (pharmacyId: string, subItemId: string) => void;
  onToggleSubItemDone: (pharmacyId: string, subItemId: string) => void;
  onExportToMedicalNotes: (pharmacyTitle: string, subItem: SubPharmacyItem) => void;
  onNavigateToMedicalNotes: () => void;
}

export const PharmacyTab: React.FC<PharmacyTabProps> = ({ 
  items, 
  onAddItem, 
  onDeleteItem,
  onAddSubItem,
  onDeleteSubItem,
  onToggleSubItemDone,
  onExportToMedicalNotes,
  onNavigateToMedicalNotes,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [isAdding, setIsAdding] = useState(false);
  const [expandedPharmacyId, setExpandedPharmacyId] = useState<string | null>('bilibili');

  // New Primary Pharmacy Item form states
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<PharmacyItem['category']>('Từ điển');
  const [newIcon, setNewIcon] = useState('💊');

  // Sub-item form states (keyed by pharmacyId)
  const [activeAddSubId, setActiveAddSubId] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [subNote, setSubNote] = useState('');
  const [subProgress, setSubProgress] = useState('');

  const categories = ['Tất cả', 'Từ điển', 'Video & Nghe', 'Tập viết Hán tự', 'Ngữ pháp', 'Công cụ khác'];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()) ||
      item.subItems?.some(s => 
        s.title.toLowerCase().includes(search.toLowerCase()) || 
        (s.note && s.note.toLowerCase().includes(search.toLowerCase()))
      );
    return matchesCat && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let urlFormatted = newUrl.trim();
    if (!urlFormatted.startsWith('http://') && !urlFormatted.startsWith('https://')) {
      urlFormatted = 'https://' + urlFormatted;
    }

    onAddItem({
      title: newTitle.trim(),
      category: newCategory,
      desc: newDesc.trim() || 'Nguồn dược liệu học tiếng Trung do người dùng bổ sung.',
      url: urlFormatted,
      iconText: newIcon || '💊',
      badge: newCategory,
      badgeColor: 'bg-teal-50 text-teal-700',
      isCustom: true,
      subItems: [],
    });

    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleAddSubSubmit = (pharmacyId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !subUrl.trim()) {
      alert('Vui lòng nhập tiêu đề và link URL của trang con / video.');
      return;
    }

    let urlFormatted = subUrl.trim();
    if (!urlFormatted.startsWith('http://') && !urlFormatted.startsWith('https://')) {
      urlFormatted = 'https://' + urlFormatted;
    }

    onAddSubItem(pharmacyId, {
      title: subTitle.trim(),
      url: urlFormatted,
      note: subNote.trim() || undefined,
      timestampProgress: subProgress.trim() || undefined,
      isCompleted: false,
    });

    soundEngine.playSuccessChime();
    setSubTitle('');
    setSubUrl('');
    setSubNote('');
    setSubProgress('');
    setActiveAddSubId(null);
  };

  return (
    <section className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Library className="w-6 h-6 text-teal-500" />
            <span>Tủ Thuốc Ngoại Trú (Kho Web Học Tiếng Trung)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Lưu trữ trang web mẹ, chia nhỏ thành các video/trang con có ghi chú tiến độ & liên kết trực tiếp với Sổ Bệnh Án.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-teal-100 transition flex items-center space-x-1.5 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Kê thêm nguồn web mới</span>
        </button>
      </div>

      {/* Add New Medical Link Form Modal / Drawer */}
      {isAdding && (
        <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/70 border border-teal-200 rounded-3xl p-6 shadow-sm animate-in fade-in duration-150">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-teal-600" />
            <span>Thêm nguồn website học tiếng Trung vào tủ thuốc</span>
          </h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Tên website / Công cụ *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Du Chinese, Baidu Baike..."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Địa chỉ URL gốc *</label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phân loại</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as PharmacyItem['category'])}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
              >
                <option value="Từ điển">Từ điển</option>
                <option value="Video & Nghe">Video & Nghe</option>
                <option value="Tập viết Hán tự">Tập viết Hán tự</option>
                <option value="Ngữ pháp">Ngữ pháp</option>
                <option value="Công cụ khác">Công cụ khác</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Icon đại diện (Emoji hoặc chữ Hán)</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="Ví dụ: 📚 hoặc 词"
                maxLength={4}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Công dụng điều trị (Mô tả ngắn)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ví dụ: Đọc truyện phân cấp HSK 1 - 6 có audio chuẩn giọng Bắc Kinh..."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-teal-400"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
              >
                Lưu vào tủ thuốc
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên web, video, ghi chú..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-teal-400"
          />
        </div>
      </div>

      {/* Pharmacy Resource Grid with Sub-Items System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const isExpanded = expandedPharmacyId === item.id;
          const subCount = item.subItems?.length || 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-200 transition flex flex-col justify-between overflow-hidden"
            >
              {/* Primary Website Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl shadow-xs">
                      {item.iconText}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        <span>{item.title}</span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold">
                          {item.category}
                        </span>
                        {subCount > 0 && (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                            {subCount} video/trang con đã lưu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.isCustom && (
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        title="Xóa khỏi tủ thuốc"
                        className="text-slate-300 hover:text-rose-500 transition p-1.5 rounded-xl hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {item.desc}
                </p>

                {/* Main Action Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-bold py-2 bg-slate-50 hover:bg-teal-500 hover:text-white text-slate-700 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Mở trang web gốc</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setExpandedPharmacyId(isExpanded ? null : item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isExpanded
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
                    }`}
                  >
                    <span>Trang con & Note ({subCount})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* ================= SUB-ITEMS / VIDEO BOOKMARKS SECTION ================= */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-100 p-5 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BookmarkCheckIcon className="w-4 h-4 text-teal-600" />
                      <span>Các trang con, video chi tiết & ghi chú ({subCount}):</span>
                    </span>

                    <button
                      onClick={() => setActiveAddSubId(activeAddSubId === item.id ? null : item.id)}
                      className="text-xs text-teal-700 font-bold bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{activeAddSubId === item.id ? 'Đóng form' : '+ Lưu link con & Note'}</span>
                    </button>
                  </div>

                  {/* Add Sub-Item Form Drawer */}
                  {activeAddSubId === item.id && (
                    <form
                      onSubmit={(e) => handleAddSubSubmit(item.id, e)}
                      className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs space-y-2.5 text-xs animate-in fade-in"
                    >
                      <div className="font-bold text-teal-800 text-xs flex items-center gap-1">
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Thêm link video / trang chi tiết trong {item.title}:</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-0.5">Tiêu đề video / trang nhỏ *</label>
                          <input
                            type="text"
                            required
                            value={subTitle}
                            onChange={(e) => setSubTitle(e.target.value)}
                            placeholder="Ví dụ: Bài 1 - Luyện 21 thanh mẫu chuẩn..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-hidden focus:border-teal-400"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-0.5">Link URL cụ thể *</label>
                          <input
                            type="text"
                            required
                            value={subUrl}
                            onChange={(e) => setSubUrl(e.target.value)}
                            placeholder="https://www.bilibili.com/video/BV..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-hidden focus:border-teal-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="md:col-span-1">
                          <label className="block text-slate-600 font-semibold mb-0.5">Tiến độ / Phút đã xem</label>
                          <input
                            type="text"
                            value={subProgress}
                            onChange={(e) => setSubProgress(e.target.value)}
                            placeholder="Ví dụ: 08:35 hoặc Bài 1/3..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-hidden focus:border-teal-400"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-slate-600 font-semibold mb-0.5">Ghi chú kiến thức / Dặn dò</label>
                          <input
                            type="text"
                            value={subNote}
                            onChange={(e) => setSubNote(e.target.value)}
                            placeholder="Ví dụ: Chú ý âm bật hơi p, t, k; xem lại lúc 10:20..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-hidden focus:border-teal-400"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveAddSubId(null)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                        >
                          Lưu trang con
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Sub-Items List */}
                  {subCount === 0 ? (
                    <div className="p-4 bg-white/70 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Chưa có trang con hay video nào được lưu trong {item.title}. Hãy bấm <strong>"+ Lưu link con & Note"</strong> để note lại video bạn đang xem!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {item.subItems?.map((sub) => (
                        <div
                          key={sub.id}
                          className={`p-3.5 bg-white rounded-2xl border transition flex flex-col gap-2 ${
                            sub.isCompleted ? 'border-slate-200 bg-slate-50/70 opacity-75' : 'border-teal-100 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2.5 flex-1">
                              <button
                                onClick={() => onToggleSubItemDone(item.id, sub.id)}
                                title={sub.isCompleted ? 'Đánh dấu chưa xem' : 'Đánh dấu đã xem xong'}
                                className="cursor-pointer focus:outline-hidden mt-0.5"
                              >
                                {sub.isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 hover:text-teal-500" />
                                )}
                              </button>

                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={sub.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs font-bold hover:text-teal-600 transition flex items-center gap-1 ${
                                      sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                                    }`}
                                  >
                                    <span>{sub.title}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                </div>

                                {/* Progress & Timestamp Badge */}
                                {sub.timestampProgress && (
                                  <div className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                    <Clock className="w-3 h-3 text-teal-600" />
                                    <span>Đã xem đến: {sub.timestampProgress}</span>
                                  </div>
                                )}

                                {/* Note Box */}
                                {sub.note && (
                                  <div className="bg-teal-50/50 p-2 rounded-xl border border-teal-100/70 text-xs text-slate-700 flex items-start gap-1.5">
                                    <StickyNote className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                    <span className="italic leading-relaxed">{sub.note}</span>
                                  </div>
                                )}

                                {/* Link to Medical Notes Bar */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {sub.linkedMedicalNoteTitle ? (
                                    <button
                                      onClick={onNavigateToMedicalNotes}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                                      title="Bấm để mở Sổ Bệnh Án"
                                    >
                                      <FileText className="w-3 h-3 text-emerald-600" />
                                      <span>📋 Đã liên kết: {sub.linkedMedicalNoteTitle}</span>
                                      <ArrowRight className="w-3 h-3 ml-0.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onExportToMedicalNotes(item.title, sub)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition cursor-pointer"
                                    >
                                      <Link2 className="w-3 h-3 text-teal-600" />
                                      <span>Trích xuất ghi chép sang Sổ Bệnh Án</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={() => onDeleteSubItem(item.id, sub.id)}
                              title="Xóa link con này"
                              className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

function BookmarkCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>
      <path d="m9 10 2 2 4-4"/>
    </svg>
  );
}
