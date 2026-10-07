import React, { useState } from 'react';
import { 
  Music, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  X, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { MusicTrack } from '../types';

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  onSelectTrack: (track: MusicTrack) => void;
  onAddTrack: (track: Omit<MusicTrack, 'id'>) => void;
  onDeleteTrack: (id: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrack,
  onSelectTrack,
  onAddTrack,
  onDeleteTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<MusicTrack['category']>('Lofi học tập');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      alert('Vui lòng nhập tên bài hát và đường dẫn / tải lên file mp3.');
      return;
    }

    onAddTrack({
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Người dùng tải lên',
      url: newUrl.trim(),
      category: newCategory,
      isCustom: true,
    });

    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setFileName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-teal-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Tủ Nhạc Truyền Dịch Tri Thức</h3>
              <p className="text-xs text-teal-100">
                Giai điệu chữa lành, đồng hành cùng nhịp chảy hấp thu kiến thức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently playing banner */}
        <div className="bg-teal-50/70 p-4 border-b border-teal-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onTogglePlay}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs transition cursor-pointer ${
                isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-500 hover:bg-teal-600'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-100 px-2 py-0.5 rounded-md">
                  Đang phát
                </span>
                <span className="font-bold text-sm text-slate-800">
                  {currentTrack ? currentTrack.title : 'Chưa chọn bài hát'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentTrack?.artist ? currentTrack.artist : 'Mind Clinic Healing Melodies'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-2 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài nhạc mới</span>
          </button>
        </div>

        {/* Add Track Form Accordion */}
        {isAdding && (
          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 animate-in fade-in duration-150 shrink-0">
            <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Thêm nhạc qua Link MP3 hoặc Tải lên từ máy tính:</span>
            </h4>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tên bài hát *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Dạ Khúc Cổ Tranh, Lo-fi Thư Giãn..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-hidden focus:border-teal-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Thể loại</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-hidden focus:border-teal-400"
                >
                  <option value="Lofi học tập">Lofi học tập</option>
                  <option value="Cổ phong tĩnh tâm">Cổ phong tĩnh tâm</option>
                  <option value="Sóng não Alpha">Sóng não Alpha</option>
                  <option value="Thiên nhiên chữa lành">Thiên nhiên chữa lành</option>
                  <option value="Tự thêm">Tự thêm</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Nguồn âm thanh (Link MP3 hoặc Tải file lên)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newUrl.startsWith('data:') ? '(Đã đính kèm file âm thanh tải lên)' : newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="Dán đường link file mp3 (https://...mp3)..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-hidden focus:border-teal-400"
                    />
                  </div>
                  <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    <span>{fileName ? 'Đổi file' : 'Tải file MP3'}</span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                >
                  Lưu bài hát
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tracks List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scroll">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Danh sách bài nhạc ({tracks.length} bài)
          </p>
          {tracks.map((track) => {
            const isSelected = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition ${
                      isSelected
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isSelected && isPlaying ? (
                      <Radio className="w-4 h-4 animate-spin" />
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                        {track.title}
                      </p>
                      {isSelected && (
                        <span className="text-[10px] bg-teal-200 text-teal-800 font-bold px-1.5 py-0.2 rounded-md">
                          Đã chọn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-medium">
                        {track.category}
                      </span>
                      {track.artist && (
                        <span className="text-[11px] text-slate-400">{track.artist}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {track.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrack(track.id);
                      }}
                      title="Xóa bài hát này"
                      className="text-slate-300 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Nhạc sẽ phát kèm khi bạn bật Bình Truyền Dịch Tri Thức.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Đóng bảng nhạc
          </button>
        </div>
      </div>
    </div>
  );
};
