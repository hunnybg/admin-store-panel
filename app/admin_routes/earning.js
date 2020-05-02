
var earning = require('../admin_controllers/earning'); // include earning controller ////


module.exports = function (app) {


    app.route('/admin/get_earning').post(earning.get_admin_earning);
    //app.route('/admin/export_excel_earning').get(earning.export_excel_earning);

};





