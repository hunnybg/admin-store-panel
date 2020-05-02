var provider_vehicle = require('../../controllers/provider/provider_vehicle'); // include provider_vehicle controller ////


module.exports = function (app) {
    app.route('/api/provider/add_vehicle').post(provider_vehicle.add_vehicle);
    app.route('/api/provider/update_vehicle_detail').post(provider_vehicle.update_vehicle_detail);
    app.route('/api/provider/get_vehicle_list').post(provider_vehicle.get_vehicle_list);
    app.route('/api/provider/select_vehicle').post(provider_vehicle.select_vehicle);
    
    
    
    
};





