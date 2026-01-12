import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


import { PageLoader } from './shemmer.js';


PageLoader.show();

$(document).ready(function () {

    let currentUser = null;



    // 1. التحقق من حالة المستخدم
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // جلب بيانات المستخدم من Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                console.log(userDoc.data().fullName);
                $('#profileFullName').text(userDoc.data().fullName);
                $('#profileEmail').text(userDoc.data().fullName);


                $('#valName').val(userDoc.data().fullName);

                $('#valEmail').val(userDoc.data().email);
                $('#valGender').val(userDoc.data().gender);
                PageLoader.hide();
            }
        } else {
            PageLoader.hide();
            window.location.href = '../auth/login.html';

        }
    });






});