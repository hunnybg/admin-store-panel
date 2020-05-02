var delivery = require('../../controllers/store/delivery'); // include delivery controller ////

module.exports = function (app) {

    app.route('/api/store/provider_location_track').post(delivery.provider_location_track);
    app.route('/api/store/order_list_for_delivery').post(delivery.order_list_for_delivery);
    app.route('/api/store/history').post(delivery.history);
    app.route('/api/store/delivery_list_search_sort').post(delivery.delivery_list_search_sort);
    app.route('/api/store/store_notify_new_order').post(delivery.store_notify_new_order);
    app.route('/api/store/get_order_data').post(delivery.get_order_data);
    app.route('/api/store/order_list_search_sort').post(delivery.order_list_search_sort);
    app.route('/api/store/export_excel_history').post(delivery.export_excel_history);
    app.route('/api/store/get_order_list').post(delivery.get_order_list);
};





