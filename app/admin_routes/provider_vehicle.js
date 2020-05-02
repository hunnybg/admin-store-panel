var provider_vehicle = require('../admin_controllers/provider_vehicle'); // include provider_vehicle controller ////


module.exports = function (app) {
    app.route('/admin/provider_vehicle_list').post(provider_vehicle.provider_vehicle_list);
    app.route('/admin/provider_vehicle_approve_decline').post(provider_vehicle.provider_vehicle_approve_decline);
    app.route('/admin/provider_vehicle_update').post(provider_vehicle.provider_vehicle_update);
    app.route('/admin/get_provider_vehicle_detail').post(provider_vehicle.get_provider_vehicle_detail);
    app.route('/admin/add_vehicle').post(provider_vehicle.add_vehicle);
};





