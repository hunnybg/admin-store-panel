var country = require('../admin_controllers/country'); // include country controller ////


module.exports = function (app) {

    app.route('/admin/get_country_data_list').get(country.get_country_data_list);
    app.route('/admin/get_country_list').get(country.get_country_list);
    app.route('/admin/get_timezone_list').get(country.get_timezone_list);
    
    app.route('/admin/get_country_data').post(country.get_country_data);
    app.route('/admin/country_detail_for_admin').post(country.country_detail_for_admin);

    app.route('/admin/add_country_data').post(country.add_country_data);

    app.route('/admin/get_country_detail').post(country.get_country_detail);

    app.route('/admin/get_country_timezone').post(country.get_country_timezone);

    app.route('/admin/country_list').get(country.country_list);

    app.route('/admin/update_country').post(country.update_country);

    app.route('/admin/country_toggle_change').post(country.country_toggle_change);

};





