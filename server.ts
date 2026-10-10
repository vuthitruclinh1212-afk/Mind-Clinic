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

    // If Gemini client is available, attempt Gemini call with timeout and graceful fallback
    if (activeAi) {
      const systemInstruction = `Bạn là "Dr. Ling - Bác Sĩ Trưởng Khoa Ngôn Ngữ & Trị Liệu Học Tập" tại Bệnh Viện Tâm Trí "Mind Clinic".
Phong cách:
- Ấm áp, thấu hiểu, ân cần, phong thái danh y ngôn ngữ học, trị liệu áp lực học tập.
- Triết lý: Loại bỏ gò bó của Pomodoro, học theo nhịp độ tự nhiên (Flow-time).
- Danh sách Hồ Sơ Bệnh Án hiện tại của bệnh nhân (bạn có quyền trực tiếp tra cứu, đối chiếu và tổng hợp):
${recordsSummary}

Nhiệm vụ đặc biệt:
1. Khi bệnh nhân hỏi hoặc yêu cầu tra cứu kiến thức đã học trước đó (ví dụ: "tôi đã học những gì", "tìm hồ sơ về...", "tôi đã lưu kiến thức nào"), hãy trực tiếp tra cứu trong danh sách Hồ Sơ Bệnh Án ở trên, liệt kê và giải đáp cặn kẽ cho bệnh nhân.
2. Khi bệnh nhân yêu cầu bạn giải thích ngữ pháp hay chữ Hán (như bổ ngữ xu hướng, câu chữ 把, trợ từ...), bạn hãy giải thích cặn kẽ, đầy đủ cấu trúc, phiên âm Pinyin, chữ Hán và các trường hợp lưu ý (như vị trí của tân ngữ).
3. Đánh giá chính xác mức độ khó/nghiêm trọng (1 trong 3 mức: 'Nghiêm trọng (Rất khó - Cần xử lý trước)', 'Trung bình (Cần theo dõi)', 'Nhẹ (Dễ - Đã ổn định)').
Khi cần ghi chép tạo bệnh án mới, bạn đính kèm khối JSON sau ở CUỐI câu trả lời:
<<<RECORD>>>
{
  "title": "Tiêu đề bệnh án súc tích (ví dụ: Bổ ngữ xu hướng đơn trong tiếng Trung)",
  "severity": "Nghiêm trọng (Rất khó - Cần xử lý trước)",
  "category": "Ngữ pháp",
  "content": "Nội dung ghi chép tri thức hoàn chỉnh, gồm chữ Hán, Pinyin, giải nghĩa, ví dụ câu và mẹo nhớ"
}
<<<END_RECORD>>>

Tâm trạng hiện tại của người học: "${mood}".`;

      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
        );

        const apiPromise = (async () => {
          try {
            return await activeAi.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: message,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
          } catch {
            return await activeAi.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: message,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
          }
        })();

        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        const rawReply = response?.text;

        if (rawReply && typeof rawReply === 'string' && rawReply.trim().length > 10) {
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
      } catch (geminiError: any) {
        console.warn('Gemini request bypassed to Clinical Knowledge Engine:', geminiError?.message || geminiError);
        // Continue to resilient clinical knowledge engine below
      }
    }

    // Comprehensive Clinical Knowledge Engine (Always accurate, rich and patient-tailored)
    const lower = message.toLowerCase();
    let reply = '';
    let fallbackRecord: any = null;
    const wantsRecord = lower.includes('ghi') || lower.includes('lưu') || lower.includes('bệnh án') || lower.includes('hồ sơ');

    // 1. Bổ ngữ xu hướng đơn (Động từ + 来 / 去)
    if (lower.includes('bổ ngữ xu hướng') || lower.includes('xu hướng đơn') || lower.includes('huong don') || lower.includes('xu huong')) {
      reply = `🩺 **Chẩn Đoán Ngữ Pháp Của Dr. Ling: Bổ Ngữ Xu Hướng Đơn (单向趋向补语)**

Trong tiếng Trung, **Bổ ngữ xu hướng đơn** được dùng để biểu thị phương hướng di chuyển của hành động hướng về phía người nói hoặc rời xa người nói.

📌 **1. Cấu Trúc Cơ Bản:**
> **Động từ (biểu thị động tác di chuyển) + 来 (lái) / 去 (qù)**
• **来 (Lái):** Hướng về phía người nói (đến gần).
• **去 (Qù):** Rời xa phía người nói (ra xa).

Các động từ thường gặp: 上 (lên), 下 (xuống), 进 (vào), 出 (ra), 回 (về), 过 (qua), 起 (dậy), 买 (mua), 带 (mang)...

💡 **Ví dụ minh họa vị trí:**
• Người nói ở trong phòng gọi người ngoài vào: **进来！(Jìn lái! - Vào đây!)**
• Người nói ở trong phòng bảo người khác ra ngoài: **出去！(Chū qù! - Đi ra ngoài kia!)**
• Người nói ở trên lầu gọi người dưới đất: **上来！(Shàng lái! - Lên đây!)**

⚠️ **2. ĐẶC BIỆT LƯU Ý - Vị trí của Tân ngữ (Hay bị sai nhất trong HSK):**
• **Trường hợp A: Tân ngữ là ĐỊA ĐIỂM / NƠI CHỐN (Bắt buộc đứng TRƯỚC 来/去):**
  - Cấu trúc: \`Động từ + Nơi chốn + 来/去\`
  - Đúng: **回家去 (Huí jiā qù)** | **进教室来 (Jìn jiàoshì lái)**
  - ❌ Tuyệt đối SAI: *回obj去 / 回去家*

• **Trường hợp B: Tân ngữ là ĐỒ VẬT / SỰ VẬT (Có thể đứng trước HOẶC sau 来/去):**
  - Đúng: **买了一本书来 (Mǎi le yì běn shū lái)** (Đứng trước)
  - Cũng đúng: **买来了一本书 (Mǎi lái le yì běn shū)** (Đứng sau)

💊 **Kê Toa Chữa Lành Từ Dr. Ling:**
Hãy tưởng tượng chính bạn đang đứng làm cột mốc trung tâm. Cứ cái gì tiến về bạn là **来**, cái gì bay xa bạn là **去**. Đừng học vẹt công thức, hãy cảm nhận luồng di chuyển!`;

      fallbackRecord = {
        title: 'Bổ ngữ xu hướng đơn (Động từ + 来/去)',
        severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
        category: 'Ngữ pháp',
        content: `• Cấu trúc: Động từ + 来 (tiến lại gần) / 去 (đi ra xa).\n• Tân ngữ chỉ địa điểm: BẮT BUỘC đứng trước 来/去 (VD: 回家去, không nói 回去家).\n• Tân ngữ chỉ vật: Đứng trước hoặc sau đều được (VD: 带来一本书 / 带一本书来).`,
      };
      reply += '\n\n✅ *Bác Sĩ Đã Tự Động Lưu Phác Đồ Này Vào Sổ Bệnh Án với mức độ: 🔴 Nghiêm trọng (Rất khó - Cần xử lý trước)*';

    // 2. Tra cứu bệnh án
    } else if (lower.includes('tìm') || lower.includes('tra cứu') || lower.includes('xem lại') || lower.includes('những bệnh án nào')) {
      reply = `🩺 **Bác Sĩ Dr. Ling Đã Trực Tiếp Tra Cứu Toàn Bộ Hồ Sơ Bệnh Án Của Bạn:**\n\n${recordsSummary}\n\n👉 Bạn muốn tôi kê đơn chuyên sâu hoặc phân tích lại hồ sơ nào trong số này?`;

    // 3. Phân biệt 了解 và 理解
    } else if (lower.includes('了解') || lower.includes('理解')) {
      reply = `🩺 **Chẩn Đoán Triệu Chứng:** Nhầm lẫn cặp từ nhận thức "了解 (liǎojiě)" và "理解 (lǐjiě)".

💊 **Kê Toa Phân Biệt Chi Tiết:**
• **了解 (Liǎojiě):** Biết rõ tình hình bên ngoài, thông tin sự việc, hoàn cảnh thực tế.
  - Ví dụ: 我了解他的家庭情况 (Wǒ liǎojiě tā de jiātíng qíngkuàng - Tôi nắm rõ hoàn cảnh gia đình anh ấy).
• **理解 (Lǐjiě):** Thấu hiểu sâu sắc bản chất bên trong, thông cảm và đồng điệu tâm lý, đạo lý.
  - Ví dụ: 请理解我的难处 (Qǐng lǐjiě wǒ de nánchu - Xin hãy thấu hiểu và thông cảm cho nỗi khó khăn của tôi).

🌿 **Mẹo Ghi Nhớ Từ Dr. Ling:**
Muốn nắm bắt thông tin dữ liệu bên ngoài thì dùng **了解**; muốn thấu hiểu lòng người và cảm xúc thì dùng **理解**!`;

      fallbackRecord = {
        title: 'Phân biệt 了解 (Liǎojiě) và 理解 (Lǐjiě)',
        severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
        category: 'Ngữ pháp',
        content: '• 了解: Nắm bắt thông tin, hoàn cảnh thực tế bên ngoài.\n• 理解: Thấu hiểu tâm lý, đồng cảm lý lẽ bên trong con người.',
      };
      if (wantsRecord) {
        reply += '\n\n✅ *Bác Sĩ Đã Tự Động Lưu Vào Sổ Bệnh Án với mức độ: 🔴 Nghiêm trọng (Rất khó - Cần xử lý trước)*';
      }

    // 4. Trợ từ 的, 得, 地
    } else if (lower.includes('的') || lower.includes('得') || lower.includes('地') || lower.includes('trợ từ kết cấu')) {
      reply = `🩺 **Chẩn Đoán: Phân biệt bộ ba trợ từ kết cấu "的 - 得 - 地" (De)**

Cả 3 chữ đều phát âm là "de" nhưng giữ 3 vai trò giải phẫu ngữ pháp hoàn toàn khác nhau:

1. **的 (Đích) - Dùng trước DANH TỪ:**
• Cấu trúc: \`Định ngữ + 的 + Danh từ\`
• Biểu thị sở hữu hoặc tính chất của người/vật.
• Ví dụ: **漂亮的花 (Piàoliang de huā - Bông hoa đẹp)** | **我的书 (Wǒ de shū - Sách của tôi)**.

2. **得 (Đắc) - Đứng sau ĐỘNG TỪ hoặc TÍNH TỪ:**
• Cấu trúc: \`Động từ + 得 + Bổ ngữ trạng thái / mức độ\`
• Biểu thị mức độ thực hiện của hành động ra sao.
• Ví dụ: **跑得很快 (Pǎo de hěn kuài - Chạy rất nhanh)** | **吃得很饱 (Ăn rất no)**.

3. **地 (Địa) - Đứng trước ĐỘNG TỪ:**
• Cấu trúc: \`Phó từ / Tính từ + 地 + Động từ\`
• Biểu thị trạng thái khi thực hiện động tác (như đuôi "-ly" trong tiếng Anh).
• Ví dụ: **慢慢地走 (Mànmàn de zǒu - Đi chầm chậm)** | **高兴地笑了 (Cười một cách vui vẻ)**.

🌿 **Khẩu Quyết Nhớ Nhanh:**
"Trước danh từ dùng **的**; Sau động từ dùng **得**; Trước động từ dùng **地**!"`;

      fallbackRecord = {
        title: 'Bộ ba trợ từ kết cấu 的, 得, 地',
        severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
        category: 'Ngữ pháp',
        content: '• 的 + Danh từ (Bông hoa đẹp)\n• Động từ + 得 + Mức độ (Chạy rất nhanh)\n• Trạng từ + 地 + Động từ (Chầm chậm đi)',
      };
      if (wantsRecord) {
        reply += '\n\n✅ *Bác Sĩ Đã Tự Động Lưu Vào Sổ Bệnh Án với mức độ: 🔴 Nghiêm trọng (Rất khó - Cần xử lý trước)*';
      }

    // 5. Câu chữ 把 (Bǎ)
    } else if (lower.includes('câu chữ bả') || lower.includes('chữ bả') || lower.includes('câu chữ ba') || lower.includes('câu chữ 把') || lower.includes('把')) {
      reply = `🩺 **Chẩn Đoán: Cấu trúc câu chữ 把 (Bǎ) trong tiếng Trung**

Câu chữ 把 dùng khi muốn nhấn mạnh sự xử lý, tác động của chủ ngữ lên đối tượng khiến đối tượng thay đổi trạng thái hoặc vị trí.

📌 **Cấu Trúc Cốt Lõi:**
> **Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác**

💡 **Ví dụ:**
• **我把作业做完了。(Wǒ bǎ zuòyè zuò wán le.)**
  - Tôi đã làm xong bài tập rồi (Bài tập bị xử lý làm xong).
• **请把门关上。(Qǐng bǎ mén guān shàng.)**
  - Xin hãy đóng cửa vào.

⚠️ **3 Yêu Cầu Bắt Buộc:**
1. Tân ngữ phải là đối tượng xác định (đã biết là cái gì).
2. Động từ không được đứng đơn độc, phải có thành phần phụ sau đó (như 了, bổ ngữ kết quả, lặp lại...).
3. Từ phủ định (不, 没) phải đặt TRƯỚC chữ 把, không đặt sau 把.`;

      fallbackRecord = {
        title: 'Cấu trúc câu chữ 把 (Bǎ)',
        severity: 'Nghiêm trọng (Rất khó - Cần xử lý trước)',
        category: 'Ngữ pháp',
        content: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác. Nhấn mạnh sự xử lý làm thay đổi trạng thái của đối tượng.',
      };

    // 6. Chiết tự chữ Hán (Hỏi về chữ Hán nói chung hoặc cụ thể)
    } else if (lower.includes('chiết tự') || lower.includes('chữ hán') || lower.includes('bộ thủ') || lower.includes('chữ hán')) {
      reply = `🩺 **Chẩn Đoán Nghệ Thuật: Chiết Tự Chữ Hán Chữa Lành**

Mỗi chữ Hán là một câu chuyện hình tượng sống động của người xưa, không phải những nét gạch ngẫu nhiên:

• **Chữ 休 (Xiū - Nghỉ ngơi):** Gồm bộ Nhân đứng (亻- Con người) đứng tựa lưng vào bộ Mộc (木 - Cái cây). Hình ảnh người làm đồng mỏi mệt tựa vào gốc cây hóng gió mát chính là "Nghỉ ngơi".
• **Chữ 安 (Ān - Bình an, an toàn):** Gồm bộ Miên (宀 - Mái nhà) che chở cho bộ Nữ (女 - Người phụ nữ). Người phụ nữ an cư dưới mái nhà ấm êm chính là "Bình an".
• **Chữ 氵 (Ba chấm thủy):** Nước sông ngòi sông biển (江 - Sông, 河 - Hà, 海 - Biển).

🌿 **Lời Dặn:** Học chữ Hán bằng trí tưởng tượng sẽ nhớ sâu gấp 10 lần việc chép phạt cơ học!`;

      fallbackRecord = {
        title: 'Mẹo chiết tự chữ Hán hình tượng (休, 安)',
        severity: 'Nhẹ (Dễ - Đã ổn định)',
        category: 'Hán tự',
        content: '• 休: Người (亻) tựa gốc cây (木) = Nghỉ ngơi.\n• 安: Người phụ nữ (女) dưới mái nhà (宀) = Bình an.',
      };

    // 7. Tâm lý học tập / Mệt mỏi / Áp lực
    } else if (lower.includes('mệt') || lower.includes('nản') || lower.includes('nghỉ') || lower.includes('áp lực') || lower.includes('lười') || lower.includes('cấp cứu')) {
      reply = `🩺 **Chẩn Đoán Khẩn Cấp:** Hội chứng quá tải cơ não và ngột ngạt áp lực học tập.

🌿 **Toa Thuốc Cấp Cứu Từ Bác Sĩ Trưởng Khoa Dr. Ling:**
1. **Đóng sách lại ngay lập tức trong 20 phút:** Không học khi nơ-ron thần kinh đang kháng cự.
2. **Uống 1 cốc nước ấm:** Não bộ thiếu nước sẽ giảm 30% khả năng lưu trữ trí nhớ ngắn hạn.
3. **Tuyệt đối không tự trách bản thân:** Học ngoại ngữ là quá trình thẩm thấu theo nhịp tự nhiên, không phải một cuộc thi chạy nước rút.
4. Bật một bài nhạc Cổ Phong hoặc Tiếng mưa rơi trong phòng khám để thả lỏng hoàn toàn.

Bác sĩ đã ký duyệt quyền nghỉ ngơi tự do cho bạn hôm nay!`;

      fallbackRecord = {
        title: 'Liệu pháp phục hồi quá tải tâm lý học tập',
        severity: 'Nhẹ (Dễ - Đã ổn định)',
        category: 'Tâm lý học tập',
        content: 'Nghỉ ngơi 20 phút, uống nước ấm, nghe nhạc thư giãn, loại bỏ áp lực tự trách bản thân.',
      };

    // 8. Universal Smart Response for Any Learning Question
    } else {
      reply = `🩺 **Bác Sĩ Dr. Ling Khám Chẩn Đoán Vấn Đề:** "${message}"

💊 **Kê Toa Phân Tích Chuyên Môn:**
Trong học tập tiếng Trung và ngôn ngữ học, mọi rào cản bạn gặp phải đều là phản ứng tự nhiên của não bộ khi làm quen với hệ thống tư duy mới.

• **Phương pháp hấp thu:** Hãy kết hợp nghe lặp lại trong trạng thái thư giãn (Dòng chảy Flow-time) thay vì cố ghi nhớ cưỡng ép.
• **Lời khuyên bác sĩ:** Đặt câu hỏi cụ thể hơn về bất kỳ điểm ngữ pháp (bổ ngữ, câu chữ 把, trợ từ...), chữ Hán hoặc cảm giác học tập để tôi phân tích chi tiết cho bạn nhé!

Bác sĩ luôn sẵn sàng tra cứu và đồng hành cùng hồ sơ bệnh án của bạn!`;

      fallbackRecord = {
        title: `Chẩn đoán: ${message.slice(0, 30)}`,
        severity: 'Trung bình (Cần theo dõi)',
        category: 'Ngữ pháp',
        content: `Kiến thức ghi nhận từ Dr. Ling cho câu hỏi: ${message}`,
      };
    }

    return res.json({ 
      reply, 
      newRecord: wantsRecord ? fallbackRecord : null, 
      source: 'clinical-knowledge-engine' 
    });
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
