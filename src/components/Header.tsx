import React from 'react';
import { ShieldCheck, Activity, Droplets } from 'lucide-react';

interface HeaderProps {
  onOpenSickLeave: () => void;
  isFlowing: boolean;
  flowSeconds: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSickLeave,
  isFlowing,
  flowSeconds,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}p ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <header className="h-16 bg-white border-b border-teal-50 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isFlowing ? 'bg-teal-500 animate-ping' : 'bg-emerald-400'}`}></span>
          <span className={`absolute inline-block w-2.5 h-2.5 rounded-full ${isFlowing ? 'bg-teal-500' : 'bg-emerald-400'}`}></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">
            Trạng thái:{' '}
            <span className="font-normal text-slate-500">
              {isFlowing ? 'Đang trong dòng chảy truyền dịch tự do' : 'Sẵn sàng nạp năng lượng tự nhiên'}
            </span>
          </span>
          {isFlowing && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
              <Droplets className="w-3 h-3 text-teal-600 animate-bounce" />
              Đã nạp: {formatTime(flowSeconds)} (~{Math.round((flowSeconds / 60) * 5)} ml)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSickLeave}
          className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-200 px-3.5 py-2 rounded-2xl font-semibold border border-rose-100 transition flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
        >
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>Xin Giấy Nghỉ Ốm (Nghỉ ngơi không lo âu)</span>
        </button>
      </div>
    </header>
  );
};
