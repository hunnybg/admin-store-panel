var orders = require('../../controllers/user/order'); // include order controller ////




module.exports = function (app) {

    app.route('/api/user/user_cancel_order').post(orders.user_cancel_order);
    app.route('/api/user/create_order').post(orders.create_order);
    app.route('/api/store/set_order_status').post(orders.set_order_status);
    app.route('/api/store/store_cancel_or_reject_order').post(orders.store_cancel_or_reject_order);
    
    
    app.route('/api/user/show_invoice').post(orders.show_invoice);
    app.route('/api/get_order_detail').post(orders.get_order_detail);
    app.route('/api/user/user_refund_order').post(orders.user_refund_order);

    app.route('/api/user/user_vaiter_cancel_order').post(orders.user_vaiter_cancel_order);
};





