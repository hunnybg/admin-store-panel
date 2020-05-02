var ads = require('../admin_controllers/ads'); // include ads controller ////


module.exports = function (app) {

    app.route('/admin/add_advertise').post(ads.add_advertise);
    app.route('/admin/delete_advertise').post(ads.delete_advertise);
    app.route('/admin/change_advertise_visibility').post(ads.change_advertise_visibility);
    app.route('/admin/update_advertise').post(ads.update_advertise);
    app.route('/admin/advertise_list').post(ads.advertise_list);
    app.route('/admin/advertise_list').get(ads.advertise_list);
    app.route('/admin/get_advertise_detail').post(ads.get_advertise_detail);
    
    app.route('/admin/get_visible_advertise').post(ads.get_visible_advertise);
};





