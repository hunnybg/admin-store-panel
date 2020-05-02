
var payment_gateway = require('../admin_controllers/payment_gateway'); // include payment_gateway controller ////


module.exports = function (app) {
    app.route('/admin/add_payment_gateway_data').post(payment_gateway.add_payment_gateway_data);
    app.route('/admin/payment_gateway_list').get(payment_gateway.payment_gateway_list);
    app.route('/admin/get_payment_gateway_detail').post(payment_gateway.get_payment_gateway_detail);
    app.route('/admin/update_payment_gateway').post(payment_gateway.update_payment_gateway);
};





