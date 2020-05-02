
var vehicle = require('../admin_controllers/vehicle'); // include vehicle controller ////


module.exports = function (app) {

    app.route('/admin/add_vehicle_data').post(vehicle.add_vehicle_data);
    app.route('/admin/vehicle_list').get(vehicle.vehicle_list);
    app.route('/admin/update_vehicle').post(vehicle.update_vehicle);
    app.route('/admin/vehicle_toggle_change').post(vehicle.vehicle_toggle_change);
    app.route('/admin/get_vehicle_detail').post(vehicle.get_vehicle_detail);
    app.route('/admin/vehicle_list_for_provider').get(vehicle.vehicle_list_for_provider);




};





