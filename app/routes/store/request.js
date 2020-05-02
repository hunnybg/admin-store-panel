var requests = require('../../controllers/store/request'); // include request controller ////


module.exports = function (app) {
    app.route('/api/store/create_request').post(requests.create_request);
    app.route('/api/provider/change_request_status').post(requests.change_request_status);
    
    app.route('/api/provider/complete_request').post(requests.complete_request);
    app.route('/api/provider/show_request_invoice').post(requests.show_request_invoice);
    app.route('/api/provider/provider_cancel_or_reject_request').post(requests.provider_cancel_or_reject_request);
    
    app.route('/api/provider/get_invoice').post(requests.provider_get_invoice);
    app.route('/api/store/get_vehicle_list').post(requests.get_vehicle_list);
    app.route('/api/store/get_vehicles_list').post(requests.get_vehicles_list);
    
};





