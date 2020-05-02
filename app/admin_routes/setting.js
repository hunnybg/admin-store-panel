var setting = require('../admin_controllers/setting'); // include setting controller ////


module.exports = function (app) {


    //app.route('/admin/get_country_list').get(country.get_country_list);


    app.route('/admin/upload_logo_images').post(setting.upload_logo_images);
    app.route('/admin/update_google_key_setting').post(setting.update_google_key_setting);
    //app.route('/admin/update_app_setting').post(setting.update_app_setting);
    app.route('/admin/update_app_version_setting').post(setting.update_app_version_setting);
    app.route('/admin/update_switch_setting').post(setting.update_switch_setting);

    app.route('/admin/update_admin_setting').post(setting.update_admin_setting);
    
    app.route('/admin/update_ios_push_notification_setting').post(setting.update_ios_push_notification_setting);
    
    
    app.route('/admin/update_image_setting').post(setting.update_image_setting);
    app.route('/admin/get_image_setting_detail').post(setting.get_image_setting_detail);


};





