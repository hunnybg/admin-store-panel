
var provider_weekly_earning = require('../admin_controllers/provider_weekly_earning'); // include provider_weekly_earning controller ////


module.exports = function (app) {

   
    app.route('/admin/provider_weekly_earning').post(provider_weekly_earning.provider_weekly_earning);
    app.route('/admin/admin_paid_to_provider').post(provider_weekly_earning.admin_paid_to_provider);
    app.route('/admin/weekly_statement_for_provider').post(provider_weekly_earning.weekly_statement_for_provider);

   
};





