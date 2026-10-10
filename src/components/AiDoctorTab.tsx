import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Stethoscope, 
  RefreshCw, 
  Copy, 
  Check, 
  FileCheck, 
  FileText, 
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, MedicalRecord, RecordSeverity } from '../types';
import { soundEngine } from '../utils/audio';

interface AiDoctorTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  currentMoodLabel: string;
  isApiLinked?: boolean;
  onLinkApi?: (key?: string) => Promise<boolean> | void;
  onUnlinkApi?: () => void;
  medicalRecords: MedicalRecord[];
  onSaveDoctorDiagnosisToRecord: (title: string, severity: RecordSeverity, category: any, content: string) => void;
  onNavigateToMedicalNotes: () => void;
}

const QUICK_PROMPTS = [
  '🔍 Tra cứu xem tôi đã có những bệnh án nào?',
  '💊 Phân biệt 了解 và 理解, sau đó ghi vào bệnh án giúp tôi',
  '🧩 Chiết tự chữ 休 và 安 và lưu vào hồ sơ độ khó dễ',
  '🎯 Mẹo phân biệt 的, 得, 地 và ghi lại bệnh án mức nghiêm trọng',
  '🩹 Tôi đang thấy quá tải và nản lòng, hãy cấp cứu tôi!',
];

export const AiDoctorTab: React.FC<AiDoctorTabProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  currentMoodLabel,
  isApiLinked,
  onLinkApi,
  onUnlinkApi,
  medicalRecords,
  onSaveDoctorDiagnosisToRecord,
  onNavigateToMedicalNotes,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleQuickPromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualSaveToRecord = (msgId: string, text: string) => {
    // Generate a structured record from the doctor's message
    const firstLine = text.split('\n')[0].replace(/[🩺💊🌿*#]/g, '').trim() || 'Chẩn đoán ngữ pháp từ Dr. Ling';
    const severity: RecordSeverity = text.toLowerCase().includes('khó') || text.toLowerCase().includes('phân biệt')
      ? 'Nghiêm trọng (Rất khó - Cần xử lý trước)'
      : 'Trung bình (Cần theo dõi)';
    
    onSaveDoctorDiagnosisToRecord(firstLine, severity, 'Ngữ pháp', text);
    setSavedMessageId(msgId);
    soundEngine.playSuccessChime();
    setTimeout(() => setSavedMessageId(null), 3000);
  };

  return (
    <section className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
      {/* AI Doctor Header with API Status */}
      <div className="p-4 bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-white border-b border-teal-100 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-200">
            <Stethoscope className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">Dr. Ling (Trưởng Khoa Ngôn Ngữ & Trị Liệu AI)</h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Trực tuyến • Tùy biến mọi câu hỏi
              </span>
            </div>
            <p className="text-xs text-teal-700">
              Giải thích ngữ pháp, chữ Hán, phát âm & tra cứu {medicalRecords.length} hồ sơ bệnh án • Năng lượng: {currentMoodLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onClearChat}
            title="Làm mới cuộc trò chuyện"
            className="text-xs text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto custom-scroll shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Hỏi & Yêu cầu:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPromptClick(prompt)}
            disabled={isLoading}
            className="text-xs bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scroll bg-slate-50/30">
        {messages.map((msg) => {
          const isDoc = msg.sender === 'doctor';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isDoc ? '' : 'justify-end space-x-reverse'}`}
            >
              {isDoc && (
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0 shadow-xs border border-teal-200">
                  🩺
                </div>
              )}

              <div
                className={`max-w-xl p-4.5 rounded-3xl text-sm leading-relaxed shadow-xs relative group ${
                  isDoc
                    ? 'bg-white rounded-tl-none border border-slate-100 text-slate-800'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 rounded-tr-none text-white shadow-teal-100'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">
                  {msg.text}
                </div>

                {/* If Dr. Ling auto-created a record, show it in a special clinical badge */}
                {msg.newRecordCreated && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Đã tự động lưu vào Sổ Bệnh Án!
                      </span>
                      <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700">
                        {msg.newRecordCreated.severity.split(' ')[0]} {msg.newRecordCreated.severity.split(' ')[1]}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{msg.newRecordCreated.title}</p>
                    <button
                      onClick={onNavigateToMedicalNotes}
                      className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <span>Mở xem trong Sổ Bệnh Án</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Card footer actions */}
                <div
                  className={`flex items-center justify-between mt-2 pt-2 text-[10px] ${
                    isDoc ? 'border-t border-slate-100 text-slate-400' : 'text-teal-100'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isDoc && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManualSaveToRecord(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                        title="Lưu nội dung này vào Sổ Bệnh Án"
                      >
                        {savedMessageId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Đã lưu bệnh án!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-3 h-3" />
                            <span>Lưu vào Bệnh Án</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:text-teal-600 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!isDoc && (
                <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  Bạn
                </div>
              )}
            </div>
          );
        })}

        {/* Doctor Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0 animate-bounce">
              🩺
            </div>
            <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 text-xs text-slate-500 flex items-center space-x-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>Dr. Ling đang đối chiếu {medicalRecords.length} bệnh án & soạn câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Hỏi ngữ pháp, yêu cầu Dr. Ling tra cứu hoặc ghi chép vào bệnh án giúp bạn..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:border-teal-400 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-5 rounded-2xl transition flex items-center justify-center shadow-md shadow-teal-100 shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};
