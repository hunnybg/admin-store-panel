
var order_earning = require('../admin_controllers/order_earning'); // include order_earning controller ////


module.exports = function (app) {


    app.route('/admin/get_order_earning').post(order_earning.get_order_earning);
    app.route('/admin/get_order_earning_detail').post(order_earning.get_order_earning_detail);

};





