import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

$(document).ready(function () {

    const GEMINI_API_KEY = "AIzaSyAUuK3xc98sSuT_BNPoJlAEHZB9zUnu-g0"; // مفتاحك الخاص
    let currentUser = null;

    // 1. التحقق من حالة المستخدم
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // جلب بيانات المستخدم من Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                $('#userName').text(userDoc.data().fullName);
            }
        } else {
            // إذا لم يكن مسجل دخول، حوله لصفحة الدخول
            window.location.href = 'login.html';
        }
    });

 // 2. التواصل مع Gemini API
$('#btnSend').on('click', async function() {
    const prompt = $('#userInput').val().trim();
    
    if (!prompt) {
        alert("يرجى كتابة سؤال أولاً");
        return;
    }

    // إظهار اللودر وإخفاء الاستجابة السابقة
    $('#loader').fadeIn();
    $('#responseArea').fadeOut();
    $(this).prop('disabled', true);

    // سنستخدم gemini-pro كبديل أكثر استقراراً
    // أو يمكنك تجربة gemini-1.5-flash-latest إذا أردت النسخة الأحدث
    const MODEL_NAME = "gemini-pro"; 

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": prompt }]
                }]
            })
        });

        const data = await response.json();
        
        // التحقق من وجود خطأ في الرد
        if (data.error) {
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // تحويل النص البسيط إلى نص يدعم الأسطر الجديدة بشكل أفضل
            $('#aiContent').text(aiResponse);
            $('#responseArea').fadeIn();
        } else {
            throw new Error("لم أتمكن من الحصول على رد من الذكاء الاصطناعي");
        }

    } catch (error) {
        console.error("Gemini Error:", error);
        alert("خطأ: " + error.message);
    } finally {
        $('#loader').hide();
        $(this).prop('disabled', false);
    }
});

    // 3. تسجيل الخروج
    $('#btnLogout').on('click', function () {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
    

});