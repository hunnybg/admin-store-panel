var add_details = require('../admin_controllers/add_details'); // include add_details controller ////


module.exports = function (app) {
    
    app.route('/admin/add_new_user').post(add_details.add_new_user);
    app.route('/admin/add_new_provider').post(add_details.add_new_provider);
    app.route('/admin/add_new_store').post(add_details.add_new_store);
    app.route('/admin/get_providers').get(add_details.get_providers);
    app.route('/admin/add_provider_vehicle_data').post(add_details.add_provider_vehicle_data);
    
};





