var shift_time = require('../admin_controllers/shift_time'); // include calendar controller ////

//All APIs by Burhan Makda

module.exports = function (app) {
    app.route('/admin/shift_time/get_monthly_shift_count').post(shift_time.get_monthly_shift_count);
    app.route('/admin/shift_time/get_shift_on_specific_day').post(shift_time.get_shift_on_specific_day);
    app.route('/admin/shift_time/get_monthly_total_work_hour').post(shift_time.get_monthly_total_work_hour);
    
}
