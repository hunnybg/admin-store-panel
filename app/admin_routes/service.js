
var service = require('../admin_controllers/service'); // include service controller ////


module.exports = function (app) {

    app.route('/admin/add_service_data').post(service.add_service_data);
    app.route('/admin/service_list').get(service.service_list);
    app.route('/admin/service_list').post(service.service_list);
    app.route('/admin/get_service_detail').post(service.get_service_detail);
    app.route('/admin/update_service').post(service.update_service);

    app.route('/admin/add_zone_price').post(service.add_zone_price);
    app.route('/admin/update_zone_price').post(service.update_zone_price);
    
    app.route('/admin/get_zone_detail').post(service.get_zone_detail);
    app.route('/admin/select_default_service').post(service.select_default_service);
};





