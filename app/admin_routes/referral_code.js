
var referral_code = require('../admin_controllers/referral_code'); // include referral_code controller ////


module.exports = function (app) {
    app.route('/admin/get_referral_detail').post(referral_code.get_referral_detail);

};





