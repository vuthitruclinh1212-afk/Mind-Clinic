import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, Award, Printer, Copy, HeartHandshake } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface SickLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientMood: string;
}

export const SickLeaveModal: React.FC<SickLeaveModalProps> = ({ isOpen, onClose, patientMood }) => {
  const [patientName, setPatientName] = useState('Bệnh nhân thân mến');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopyCertificate = () => {
    const text = `📋 GIẤY CHỨNG NHẬN NGHỈ DƯỠNG SỨC CHÍNH THỨC - MIND CLINIC
Bệnh nhân: ${patientName}
Tình trạng: ${patientMood}
Ngày cấp: ${todayStr}
Y Lệnh Dr. Ling: "Được phép nghỉ ngơi hoàn toàn 24 giờ không chút âu lo hay tự trách. Chuỗi ngày học được bảo lưu 100%!"
MIND CLINIC - PHÊ DUYỆT CHÍNH THỨC 🩺`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundEngine.playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-teal-200 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-100" />
            <h3 className="font-bold text-base tracking-wide">Khoa Cấp Cứu Tâm Trí & Trị Liệu Áp Lực</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-teal-100 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Paper Body */}
        <div className="p-6 bg-gradient-to-b from-amber-50/20 via-white to-teal-50/20 text-slate-800 space-y-4">
          <div className="text-center border-b border-dashed border-teal-200 pb-3">
            <span className="text-[10px] tracking-widest font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Văn Bản Y Khoa Miễn Trừ Áp Lực
            </span>
            <h2 className="text-xl font-extrabold text-slate-800 mt-1 uppercase tracking-tight">
              Giấy Nghỉ Ốm Dưỡng Sức
            </h2>
            <p className="text-xs text-slate-500 italic">Được bảo hộ bởi Quy Ước Chữa Lành Não Bộ Tự Nhiên</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">Cấp cho Bệnh nhân:</span>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="font-bold text-right text-teal-800 border-b border-teal-300 focus:outline-hidden px-1 bg-transparent"
                title="Nhập tên của bạn"
              />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">Chẩn đoán năng lượng:</span>
              <span className="font-semibold text-slate-700">{patientMood}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">Thời điểm chẩn đoán:</span>
              <span className="font-medium text-slate-600">{todayStr}</span>
            </div>
          </div>

          {/* Doctor Order Box */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-emerald-950">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Y Lệnh Chữa Lành Của Dr. Ling:</span>
            </div>
            <p className="leading-relaxed italic">
              "Bệnh nhân được quyền tạm dừng học tập trong 24 giờ. Nghiêm cấm mọi cảm giác tội lỗi, sốt ruột hay sợ tụt lùi. Các liên kết nơ-ron học tập cần thời gian nghỉ ngơi để thẩm thấu tự nhiên. Chuỗi học tập và dung tích tri thức của bạn được bảo lưu nguyên vẹn 100%!"
            </p>
          </div>

          {/* Official Seals & Signature */}
          <div className="flex items-center justify-between pt-2">
            {/* Red Hospital Seal */}
            <div className="w-24 h-24 rounded-full border-3 border-dashed border-rose-500 text-rose-500 flex flex-col items-center justify-center rotate-[-8deg] p-1 shadow-xs bg-rose-50/50">
              <Award className="w-6 h-6 mb-0.5" />
              <span className="text-[8px] font-black uppercase text-center leading-tight">MIND CLINIC</span>
              <span className="text-[7px] font-bold text-center">ĐÃ DUYỆT 100%</span>
            </div>

            {/* Doctor Signature */}
            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-400 font-medium">Bác Sĩ Trưởng Khoa Ngôn Ngữ</p>
              <div className="text-teal-700 font-serif italic text-base font-bold pr-2">
                Dr. Ling 🩺
              </div>
              <p className="text-[10px] text-slate-400">Mind Clinic Research Institute</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCertificate}
              className="text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép toa'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In giấy</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-xs bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            Đồng ý nghỉ ngơi ngay
          </button>
        </div>
      </div>
    </div>
  );
};
