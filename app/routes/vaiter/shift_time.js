var shift_time = require('../../controllers/vaiter/shift_time'); // include calendar controller ////

//All APIs by Burhan Makda

module.exports = function (app) {
    app.route('/shift_time/create_shift').post(shift_time.create_shift);
    app.route('/shift_time/get_monthly_shift_count').post(shift_time.get_monthly_shift_count);
    app.route('/shift_time/get_shift_on_specific_day').post(shift_time.get_shift_on_specific_day);
    app.route('/shift_time/update_shift').post(shift_time.update_shift);
    app.route('/shift_time/delete_shift').post(shift_time.delete_shift);
    app.route('/shift_time/get_monthly_total_work_hour').post(shift_time.get_monthly_total_work_hour);
    app.route('/shift_time/email_preview_monthly_schedule').post(shift_time.email_preview_monthly_schedule);
    app.route('/shift_time/email_monthly_schedule').post(shift_time.email_monthly_schedule);
}
