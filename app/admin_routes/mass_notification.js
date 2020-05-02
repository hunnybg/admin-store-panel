var mass_notification = require('../admin_controllers/mass_notification'); // include mass_notification controller ////


module.exports = function (app) {
   // app.route('/admin/get_mass_notification_list').get(mass_notification.get_mass_notification_list);
    app.route('/admin/get_mass_notification_list').post(mass_notification.get_mass_notification_list);
    app.route('/admin/create_mass_notifications').post(mass_notification.create_mass_notification);
   
};