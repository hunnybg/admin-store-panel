var promo_code = require('../../controllers/user/promo_code'); // include promo_code controller ////

module.exports = function (app) {
    app.route('/api/user/apply_promo_code').post(promo_code.apply_promo_code);
};





