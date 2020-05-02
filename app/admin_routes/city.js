var city = require('../admin_controllers/city'); // include city controller ////


module.exports = function (app) {

    app.route('/admin/get_server_country_list').get(city.get_server_country_list);
    app.route('/admin/add_city_data').post(city.add_city_data);
    app.route('/admin/get_city_detail').post(city.get_city_detail);
    app.route('/admin/city_list').get(city.city_list);

    app.route('/admin/city_list_search_sort').post(city.city_list_search_sort);
    app.route('/admin/city_list').post(city.city_list);
    app.route('/admin/update_city').post(city.update_city);

    app.route('/admin/update_city_zone').post(city.update_city_zone);
    app.route('/admin/add_city_zone').post(city.add_city_zone);

    app.route('/admin/check_city').post(city.check_city);
    app.route('/admin/toggle_change').post(city.toggle_change);


};





