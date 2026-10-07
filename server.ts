import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Audio Transcription Endpoint using Gemini
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm', language = 'zh-CN', userApiKey } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 is required' });
    }

    const activeAi = userApiKey 
      ? new GoogleGenAI({ apiKey: userApiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } }) 
      : ai;

    if (activeAi) {
      const response = await activeAi.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioData,
              },
            },
            {
              text: `Bạn là trợ lý y khoa nhận diện giọng nói tiếng Trung cho phòng khám Mind Clinic. Hãy nghe audio của người học và chuyển đổi chính xác thành văn bản (chữ Hán kèm Pinyin nếu là tiếng Trung). Chỉ trả về kết quả nhận diện ngắn gọn và chuẩn xác nhất.`,
            },
          ],
        },
      });

      const text = response.text || '';
      return res.json({ text });
    }

    return res.json({
      text: '你好 (Nǐ hǎo) - Ghi âm đã được tiếp nhận.',
    });
  } catch (error: any) {
    console.error('Error in /api/transcribe-audio:', error);
    return res.status(500).json({ error: error?.message || 'Lỗi xử lý âm thanh' });
  }
});

// Test / Verify User Linked API Key
app.post('/api/test-api-key', async (req, res) => {
  try {
    const { apiKey: keyToTest } = req.body;
    const testKey = keyToTest || process.env.GEMINI_API_KEY;

    if (!testKey) {
      return res.status(400).json({ valid: false, error: 'Chưa có API key để kiểm tra' });
    }

    const client = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const resp = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping test. Trả lời "OK".',
    });

    if (resp && resp.text) {
      return res.json({ valid: true, message: 'Liên kết API thành công!' });
    }
    return res.json({ valid: false, message: 'Không nhận được phản hồi' });
  } catch (error: any) {
    console.error('Error in /api/test-api-key:', error);
    return res.status(400).json({ valid: false, error: error?.message || 'API Key không hợp lệ' });
  }
});

// Doctor Ling AI Endpoint
app.post('/api/ai-doctor', async (req, res) => {
  try {
    const { message, mood = 'Bình yên / Thong thả', medicalRecords = [], userApiKey } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format existing records summary for doctor reference
    const recordsSummary = Array.isArray(medicalRecords) && medicalRecords.length > 0
      ? medicalRecords.map((r: any, idx: number) => `[Hồ sơ ${idx + 1}] Tiêu đề: "${r.title}", Mức độ khó/nghiêm trọng: ${r.severity}, Chuyên mục: ${r.category}, Nội dung: ${r.content}`).join('\n')
      : 'Bệnh nhân hiện chưa có hồ sơ bệnh án nào trước đó.';

    // Choose client: user provided key takes priority, else system key
    const activeAi = userApiKey 
      ? new GoogleGenAI({ apiKey: userApiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } }) 
      : ai;

    // If Gemini client is available, call Gemini 3.8 Flash
    if (activeAi) {
      const systemInstruction = `Bạn là "Dr. Ling - Bác Sĩ Trưởng Khoa Ngôn Ngữ & Trị Liệu Học Tập" tại Bệnh Viện Tâm Trí "Mind Clinic".
Phong cách:
- Ấm áp, thấu hiểu, ân cần, phong thái danh y ngôn ngữ học, trị liệu áp lực học tập.
- Triết lý: Loại bỏ gò bó của Pomodoro, học theo nhịp độ tự nhiên (Flow-time).
- Danh sách Hồ Sơ Bệnh Án hiện tại của bệnh nhân (bạn có quyền trực tiếp tra cứu, đối chiếu và tổng hợp):
${recordsSummary}

Nhiệm vụ đặc biệt:
1. Khi bệnh nhân hỏi hoặc yêu cầu tra cứu kiến thức đã học trước đó (ví dụ: "tôi đã học những gì", "tìm hồ sơ về...", "tôi đã lưu kiến thức nào"), hãy trực tiếp tra cứu trong danh sách Hồ Sơ Bệnh Án ở trên, liệt kê và giải đáp cặn kẽ cho bệnh nhân.
2. Khi bệnh nhân yêu cầu bạn ghi chép / lưu lại / thêm vào bệnh án (hoặc hỏi về kiến thức mới và cần lưu), bạn hãy giải thích đồng thời TỰ ĐỘNG GHI CHÉP THAY BỆNH NHÂN vào hồ sơ bệnh án, đánh giá chính xác mức độ khó/nghiêm trọng (1 trong 3 mức: 'Nghiêm trọng (Rất khó - Cần xử lý trước)', 'Trung bình (Cần theo dõi)', 'Nhẹ (Dễ - Đã ổn định)').
Khi cần ghi chép tạo bệnh án mới, bạn BẮT BUỘC đính kèm khối JSON sau ở CUỐI câu trả lời:
<<<RECORD>>>
{
  "title": "Tiêu đề bệnh án súc tích (ví dụ: Phân biệt 了解 và 理解)",
  "severity": "Nghiêm trọng (Rất khó - Cần xử lý trước)" hoặc "Trung bình (Cần theo dõi)" hoặc "Nhẹ (Dễ - Đã ổn định)",
  "category": "Hán tự" hoặc "Ngữ pháp" hoặc "Phát âm" hoặc "Từ vựng" hoặc "Tâm lý học tập",
  "content": "Nội dung ghi chép tri thức hoàn chỉnh, gồm chữ Hán, Pinyin, giải nghĩa, ví dụ câu và mẹo nhớ"
}
<<<END_RECORD>>>

Tâm trạng hiện tại của người học: "${mood}".`;

      const response = await activeAi.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const rawReply = response.text || 'Bác sĩ đã ghi nhận hồ sơ của bạn. Hãy thả lỏng và duy trì nhịp độ tự nhiên nhé!';

      // Check if Dr. Ling generated a record to save
      let cleanReply = rawReply;
      let newRecord: any = null;
      const recordMatch = rawReply.match(/<<<RECORD>>>([\s\S]*?)<<<END_RECORD>>>/);
      if (recordMatch) {
        try {
          newRecord = JSON.parse(recordMatch[1].trim());
          cleanReply = rawReply.replace(/<<<RECORD>>>[\s\S]*?<<<END_RECORD>>>/, '').trim();
        } catch {
          // Ignore JSON parse error
        }
      }

      return res.json({ reply: cleanReply, newRecord, source: userApiKey ? 'user-gemini' : 'system-gemini' });
    }

    // Intelligent Clinical Fallback if API key is not configured in environment
    const lower = message.toLowerCase();
    let reply = '';
    let fallbackRecord: any = null;
    const wantsRecord = lower.includes('ghi') || lower.includes('lưu') || lower.includes('bệnh án') || lower.includes('hồ sơ');

    if (lower.includes('tìm') || lower.includes('tra cứu') || lower.includes('xem lại')) {
      reply = `🩺 **Bác Sĩ Dr. Ling Đã Trực Tiếp Tra Cứu Hồ Sơ Bệnh Án:**\nTôi đã xem qua các bệnh án của bạn. ${recordsSummary}\n👉 Bạn muốn tôi hướng dẫn sâu hơn về mục nào trong số các hồ sơ này?`;
    } else if (lower.includes('了解') || lower.includes('理解')) {
      reply = `🩺 **Chẩn Đoán Triệu Chứng:** Nhầm lẫn cặp từ nhận thức "了解 (liǎojiě)" và "理解 (lǐjiě)".

💊 **Kê Toa Phân Biệt:**
• **了解 (Liǎojiě):** Biết rõ tình hình bên ngoài, thông tin sự việc, hoàn cảnh (Ví dụ: 我了解他的家庭情况).
• **理解 (Lǐjiě):** Thấu hiểu sâu sắc bản chất bên trong, thông cảm và đồng điệu tâm lý/lý lẽ (Ví dụ: 请理解我的难处).

🌿 **Mẹo Chữa Bệnh:** Muốn nắm thông tin thì dùng 了解; muốn thấu hiểu lòng người thì dùng 理解 nhé!`;

      if (wantsRecord) {
        fallbackRecord = {
          title: 'Phân biệt 了解 (Liǎojiě) và 理解 (Lǐjiě)',
          severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
          category: 'Ngữ pháp',
          content: '• 了解: Biết thông tin bên ngoài.\n• 理解: Thấu hiểu tâm lý, đồng cảm lý lẽ bên trong.',
        };
        reply += '\n\n✅ *Bác Sĩ Đã Tự Động Lưu Vào Sổ Bệnh Án với mức độ: 🔴 Nghiêm trọng (Rất khó - Cần xử lý trước)*';
      }
    } else if (lower.includes('mệt') || lower.includes('nản') || lower.includes('nghỉ') || lower.includes('áp lực') || lower.includes('lười')) {
      reply = `🩺 **Chẩn Đoán:** Quá tải tâm lý học tập và mỏi cơ não.

🌿 **Kê Toa Thần Dược:**
1. Hãy đóng sách lại ngay lập tức trong 15 phút.
2. Uống một cốc nước ấm hoặc trà thảo mộc.
3. Không tự trách bản thân! Học ngoại ngữ cần thời gian để não bộ củng cố nơ-ron thần kinh.

Bác sĩ đã phê duyệt quyền nghỉ ngơi của bạn!`;

      if (wantsRecord) {
        fallbackRecord = {
          title: 'Liệu pháp phục hồi quá tải tâm lý',
          severity: 'Nhẹ (Dễ - Đã ổn định)',
          category: 'Tâm lý học tập',
          content: 'Nghỉ ngơi 15 phút, uống nước ấm, không ép não bộ Pomodoro khi kiệt sức.',
        };
        reply += '\n\n✅ *Bác Sĩ Đã Tự Động Lưu Vào Sổ Bệnh Án với mức độ: 🟢 Nhẹ (Dễ - Đã ổn định)*';
      }
    } else {
      reply = `🩺 **Bác Sĩ Ghi Nhận:** "${message}"

💊 **Kê Toa Tri Thức:**
Tiếng Trung là ngôn ngữ của hình tượng và ngữ điệu. Khi tiếp thu một từ hay ngữ pháp mới, hãy liên tưởng trực tiếp đến hình ảnh thực tế thay vì dịch máy móc qua lại.

🌿 **Liệu Pháp Tự Do:**
Bác sĩ luôn đồng hành hỗ trợ bạn ghi chép bệnh án và giải đáp bất kỳ thắc mắc nào!`;

      if (wantsRecord) {
        fallbackRecord = {
          title: `Ghi chép: ${message.slice(0, 30)}`,
          severity: 'Trung bình (Cần theo dõi)',
          category: 'Từ vựng',
          content: `Kiến thức ghi nhận từ phiên khám với Dr. Ling: ${message}`,
        };
        reply += '\n\n✅ *Bác Sĩ Đã Tự Động Lưu Vào Sổ Bệnh Án với mức độ: 🟡 Trung bình (Cần theo dõi)*';
      }
    }

    return res.json({ reply, newRecord: fallbackRecord, source: 'clinical-fallback' });
  } catch (error: any) {
    console.error('Error in /api/ai-doctor:', error);
    return res.status(500).json({
      error: 'Không thể kết nối với Bác Sĩ AI lúc này',
      details: error?.message || 'Unknown error',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mind Clinic server running at http://localhost:${PORT}`);
  });
}

startServer();
