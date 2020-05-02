var cancellation_charge = require('../admin_controllers/cancellation_charge'); // include cancellation_charge controller ////


module.exports = function (app) {
    app.route('/admin/cancellation_reason_list').post(cancellation_charge.cancellation_reason_list);
    app.route('/admin/request_cancellation_reason').post(cancellation_charge.request_cancellation_reason);


};





