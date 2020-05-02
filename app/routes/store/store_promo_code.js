var store_promo_code = require('../../controllers/store/store_promo_code'); // include store_promo_code controller ////


module.exports = function (app) {
    app.route('/api/store/add_promo').post(store_promo_code.store_add_promo);
    app.route('/api/store/promo_code_list').post(store_promo_code.store_promo_code_list);
    app.route('/api/store/update_promo_code').post(store_promo_code.store_update_promo_code);


    app.route('/api/store/check_promo_code').post(store_promo_code.store_check_promo_code);
    app.route('/api/store/search_sort_promo_code_list').post(store_promo_code.search_sort_promo_code_list);

};





