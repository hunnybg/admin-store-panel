var delivery = require('../../controllers/franchise/delivery'); // include delivery controller ////

module.exports = function (app) {

    app.route('/api/franchise/provider_location_track').post(delivery.provider_location_track);
    app.route('/api/franchise/order_list_for_delivery').post(delivery.order_list_for_delivery);
    app.route('/api/franchise/history').post(delivery.history);
    app.route('/api/franchise/delivery_list_search_sort').post(delivery.delivery_list_search_sort);
    app.route('/api/franchise/franchise_notify_new_order').post(delivery.franchise_notify_new_order);
    app.route('/api/franchise/get_order_data').post(delivery.get_order_data);
    app.route('/api/franchise/order_list_search_sort').post(delivery.order_list_search_sort);
};





