import { auth, db } from './firebase-config.js'; // Keep db/auth if needed for other things, but checkAuth handles user retrieval.
// Actually main.js uses db in onAuthStateChanged ONLY to get user doc. checkAuth does that.
// It uses auth in signOut, but common.js handles signOut setup.
// So maybe we don't need auth/db imports here if checkAuth provides userData?
// Wait, main.js DOES NOT use db elsewhere. It uses auth elsewhere?
// It uses signOut(auth) on click. common.js handles that.
// So we can remove firebase imports if we trust common.js.

import { loadPartials, checkAuth } from './common.js';

// تحميل النافبار والفوتر
loadPartials();

$(document).ready(function () {
    const GEMINI_API_KEY = "AIzaSyDgKXWtoZ6m0bo-eoYuS3_v4wUYYL9Sp9Y";
    let currentUserData = null;

    checkAuth((user, userData) => {
        currentUserData = userData;
    });

    // 2. التواصل مع Gemini API عند الضغط على إرسال
    $('#btnSend').on('click', async function () {
        const userText = $('#userInput').val().trim();
        const selectedMoodValue = $('input[name="userMood"]:checked').val();

        // التحقق من المدخلات
        if (!selectedMoodValue) {
            alert("يرجى اختيار حالتك المزاجية من الأيقونات أولاً");
            return;
        }
        if (!userText) {
            alert("يرجى كتابة وصف بسيط لما تشعر به");
            return;
        }
        if (!currentUserData) {
            alert("جاري تحميل بياناتك، يرجى المحاولة بعد لحظات");
            return;
        }

        // إظهار اللودر وتجهيز الواجهة
        $('#loader').fadeIn();
        $('#responseArea').fadeOut();
        $(this).prop('disabled', true);

        // بناء الـ Prompt الاحترافي
        const finalPrompt = `
أنت مساعد تغذية ذكي.

سيتم تزويدك ببيانات مستخدم تشمل:
- الاسم
- العمر
- الوزن
- الجنس
- الحالة المزاجية الحالية (كما يصفها المستخدم بنفسه)

مهمتك:
اقتراح أطعمة ووجبات مناسبة لهذا المستخدم بناءً على:
1. بياناته الشخصية (العمر، الوزن، الجنس)
2. حالته المزاجية الحالية
3. تعزيز صحته العامة وتحسين مزاجه
4. مراعاة التوازن الغذائي وعدم اقتراح أطعمة ضارة أو غير صحية

⚠️ تعليمات صارمة للإجابة:
- يجب أن تكون الإجابة **مختصرة جدًا**
- **اذكر الأكلات أو الأطباق فقط**
- مع **سطر قصير لكل طبق** يوضح:
  - مكوناته الرئيسية أو
  - فائدته المرتبطة بالمزاج أو الطاقة
- ❌ لا تكتب مقدمات أو خاتمة
- ❌ لا تذكر نصائح طبية أو كلام عام
- ❌ لا تشرح بأسلوب مطوّل

يفضل تنسيق الإجابة كقائمة.

بيانات المستخدم:
الاسم: ${currentUserData.fullName || 'غير معروف'}
العمر: ${currentUserData.age || '25'}
الوزن: ${currentUserData.weight || '65 KG'}
الجنس: ${currentUserData.gender || 'غير محدد'}
المزاج الحالي: الخيار المختار هو (${selectedMoodValue}) ووصف المستخدم هو: "${userText}"

قم الآن باقتراح الأطعمة فقط حسب التعليمات.
`;

        console.log(finalPrompt);

        const MODEL_NAME = "gemini-2.5-flash";

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "contents": [{
                        "parts": [{ "text": finalPrompt }]
                    }]
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            if (data.candidates && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;

                // عرض النتيجة
                $('#aiContent').text(aiResponse);
                $('#responseArea').fadeIn();

                // سكرول تلقائي للنتيجة
                $('html, body').animate({
                    scrollTop: $("#responseArea").offset().top - 100
                }, 500);
            }

        } catch (error) {
            console.error("Gemini Error:", error);
            alert("حدث خطأ أثناء التواصل مع الذكاء الاصطناعي: " + error.message);
        } finally {
            $('#loader').hide();
            $(this).prop('disabled', false);
        }
    });
});