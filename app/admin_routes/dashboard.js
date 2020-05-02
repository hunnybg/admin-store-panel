var dashboard = require('../admin_controllers/dashboard'); // include admin controller ////


module.exports = function (app) {
    app.route('/admin/dashboard/last_six_month_payment_detail').post(dashboard.last_six_month_payment_detail);
    app.route('/admin/dashboard/last_six_month_earning_detail').post(dashboard.last_six_month_earning_detail);
    app.route('/admin/dashboard/last_fifteen_day_order_detail').post(dashboard.last_fifteen_day_order_detail);
    app.route('/admin/dashboard/order_detail').post(dashboard.order_detail);
    app.route('/admin/dashboard/monthly_payment_detail').post(dashboard.monthly_payment_detail);
    app.route('/admin/dashboard/country_chart').post(dashboard.country_chart);


};





