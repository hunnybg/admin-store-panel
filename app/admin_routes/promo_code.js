
var promo_code = require('../admin_controllers/promo_code'); // include promo_code controller ////


module.exports = function (app) {

    app.route('/admin/add_promo_code_data').post(promo_code.add_promo_code_data);
    app.route('/admin/promo_code_list').get(promo_code.promo_code_list);
    app.route('/admin/promo_code_list').post(promo_code.promo_code_list);
    app.route('/admin/promocode_active_deactive').post(promo_code.promocode_active_deactive);

    app.route('/admin/update_promo_code').post(promo_code.update_promo_code);
    app.route('/admin/get_promo_detail').post(promo_code.get_promo_detail);
    app.route('/admin/get_promo_uses_detail').post(promo_code.get_promo_uses_detail);
    app.route('/admin/check_promo_code').post(promo_code.check_promo_code);
    
    

};





