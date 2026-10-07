import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Stethoscope, 
  RefreshCw, 
  Copy, 
  Check, 
  KeyRound, 
  ShieldCheck, 
  FileCheck, 
  FileText, 
  Search, 
  AlertCircle, 
  Flame, 
  Lock, 
  Unlock,
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';
import { ChatMessage, MedicalRecord, RecordSeverity } from '../types';
import { soundEngine } from '../utils/audio';

interface AiDoctorTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  currentMoodLabel: string;
  isApiLinked: boolean;
  onLinkApi: (key?: string) => Promise<boolean> | void;
  onUnlinkApi: () => void;
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
  const [customApiKey, setCustomApiKey] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ valid?: boolean; message?: string } | null>(null);
  const [showKeyGuide, setShowKeyGuide] = useState(false);
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

  const handleTestAndLink = async (keyToUse: string) => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToUse || undefined }),
      });
      const data = await res.json();
      if (data.valid) {
        setTestResult({ valid: true, message: 'Khóa API hợp lệ! Đang mở cổng khám bệnh...' });
        soundEngine.playSuccessChime();
        setTimeout(() => {
          onLinkApi(keyToUse);
        }, 600);
      } else {
        setTestResult({ valid: false, message: data.error || 'Khóa API không hợp lệ. Vui lòng kiểm tra lại.' });
      }
    } catch {
      // If network check fails, allow direct linking
      onLinkApi(keyToUse);
    } finally {
      setIsTestingKey(false);
    }
  };

  // If user hasn't linked API yet, show the Clinic Authorization / Linking Gateway
  if (!isApiLinked) {
    return (
      <section className="h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-xl w-full border-2 border-teal-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200 custom-scroll overflow-y-auto max-h-[90vh]">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-200">
            <KeyRound className="w-8 h-8 animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Quy Trình Bắt Buộc Trước Khi Sử Dụng
            </span>
            <h2 className="text-2xl font-black text-slate-800">
              Liên Kết API Y Khoa Của Bệnh Nhân
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Theo quy định của Mind Clinic, mỗi bệnh nhân cần chủ động liên kết API của mình trước để Bác Sĩ Trưởng Khoa có thể trực tiếp tra cứu và ghi chép vào bệnh án khi có yêu cầu.
            </p>
          </div>

          {/* User Custom API Key Input Form */}
          <div className="space-y-3 bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700">
              Nhập Gemini API Key cá nhân của bạn:
            </label>
            <div className="relative">
              <input
                type={showKeyText ? 'text' : 'password'}
                value={customApiKey}
                onChange={(e) => {
                  setCustomApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy... (Khóa API từ Google AI Studio)"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono pr-10 focus:outline-hidden focus:border-teal-400"
              />
              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                {showKeyText ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>

            {testResult && (
              <div
                className={`text-xs p-2.5 rounded-xl flex items-center gap-2 ${
                  testResult.valid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {testResult.valid ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <button
              onClick={() => handleTestAndLink(customApiKey)}
              disabled={isTestingKey}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm shadow-teal-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isTestingKey ? 'Đang kiểm tra kết nối API...' : 'Xác Nhận & Kết Nối API Của Tôi'}</span>
            </button>

            {/* Quick Clinic Gateway Option */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Chưa có API key riêng?</span>
              <button
                onClick={() => handleTestAndLink('')}
                disabled={isTestingKey}
                className="text-teal-700 hover:underline font-bold cursor-pointer"
              >
                Kết nối Cổng AI Cấp Cứu Mặc Định →
              </button>
            </div>
          </div>

          {/* Guide Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowKeyGuide(!showKeyGuide)}
              className="w-full p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 text-left transition"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hướng dẫn nhận Gemini API Key miễn phí (30 giây)
              </span>
              <span className="text-[10px] text-teal-600">{showKeyGuide ? 'Thu gọn' : 'Xem chi tiết'}</span>
            </button>
            {showKeyGuide && (
              <div className="p-3.5 bg-slate-50 text-xs text-slate-600 space-y-2 border-t border-slate-200">
                <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                  <li>Truy cập <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-teal-600 underline font-semibold">aistudio.google.com</a> và đăng nhập Google.</li>
                  <li>Nhấp nút <strong>"Get API key"</strong> ở thanh menu bên trái.</li>
                  <li>Chọn <strong>"Create API key"</strong> và sao chép mã khóa (bắt đầu bằng <code>AIzaSy...</code>).</li>
                  <li>Dán vào ô ở trên và bấm <strong>"Xác Nhận & Kết Nối"</strong>.</li>
                </ol>
              </div>
            )}
          </div>

          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 text-left text-xs space-y-2 text-slate-700">
            <div className="flex items-center space-x-2 text-teal-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Đặc Quyền Của Bác Sĩ Sau Khi Liên Kết API:</span>
            </div>
            <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
              <li>Trực tiếp tra cứu {medicalRecords.length} hồ sơ bệnh án hiện có của bạn.</li>
              <li>Tự động ghi chép và đánh giá mức độ nghiêm trọng (khó/dễ) thay bạn.</li>
              <li>Chẩn đoán phân biệt từ vựng, mẹo nhớ chữ Hán không gò bó.</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

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
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Đã liên kết API y tế
              </span>
            </div>
            <p className="text-xs text-teal-700">
              Có quyền tra cứu & ghi chép bệnh án tự động • {medicalRecords.length} hồ sơ bệnh án kết nối • Năng lượng: {currentMoodLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onUnlinkApi}
            title="Ngắt liên kết phiên khám API"
            className="text-[11px] text-slate-400 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Ngắt liên kết
          </button>
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
