import { loadPartials, checkAuth } from './common.js';
import { PageLoader } from './shemmer.js';

loadPartials();
PageLoader.show();

$(document).ready(function () {
    checkAuth((user, userData) => {
        if (userData) {
            console.log(userData.fullName);
            $('#profileFullName').text(userData.fullName);
            $('#profileEmail').text(userData.email);

            $('#valName').val(userData.fullName);
            $('#valEmail').val(userData.email);
            $('#valGender').val(userData.gender);

            PageLoader.hide();
        }
    });
});