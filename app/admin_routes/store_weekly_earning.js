
var store_weekly_earning = require('../admin_controllers/store_weekly_earning'); // include store_weekly_earning controller ////


module.exports = function (app) {

    app.route('/admin/store_weekly_earning').post(store_weekly_earning.store_weekly_earning);
    app.route('/admin/weekly_statement_for_store').post(store_weekly_earning.weekly_statement_for_store);
    app.route('/admin/admin_paid_to_store').post(store_weekly_earning.admin_paid_to_store);
    //app.route('/admin/export_excel_store_weekly_earning').get(store_weekly_earning.export_excel_store_weekly_earning);
};





