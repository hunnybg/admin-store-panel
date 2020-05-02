var carts = require('../../controllers/user/cart'); // include carts controller ////




module.exports = function (app) {

    app.route('/api/user/add_item_in_cart').post(carts.add_item_in_cart);
    app.route('/api/user/get_cart').post(carts.get_cart);
    app.route('/api/user/clear_cart').post(carts.clear_cart);
    app.route('/api/user/get_payment_gateway').post(carts.get_payment_gateway);
    app.route('/api/user/change_delivery_address').post(carts.change_delivery_address);
    app.route('/api/user/check_delivery_available').post(carts.check_delivery_available);
    app.route('/api/user/country_city_list').post(carts.country_city_list);

};





