
var delivery = require('../admin_controllers/delivery'); // include delivery controller ////


module.exports = function (app) {

    app.route('/admin/add_delivery_data').post(delivery.add_delivery_data);
    app.route('/admin/get_delivery_type').get(delivery.get_delivery_type);

    app.route('/admin/delivery_list').get(delivery.delivery_list);
    app.route('/admin/update_delivery').post(delivery.update_delivery);
    app.route('/admin/delivery_toggle_change').post(delivery.delivery_toggle_change);
    app.route('/admin/get_delivery_detail').post(delivery.get_delivery_detail);

};





