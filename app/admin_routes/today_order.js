var order = require('../admin_controllers/order'); // include order controller ////


module.exports = function (app) {
    app.route('/admin/orders_list').post(order.admin_orders);
    app.route('/api/admin/order_lists_search_sort').post(order.order_lists_search_sort);
    app.route('/admin/deliveryman_track').post(order.deliveryman_track);
    app.route('/admin/order_list_location_track').get(order.order_list_location_track);
    
    app.route('/admin/orders_list_export_excel').get(order.orders_list_export_excel);
};





