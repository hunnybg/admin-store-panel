var product = require('../../controllers/franchise/product'); // include product controller ////

module.exports = function (app) {

    app.route('/api/franchise/add_product').post(product.add_product);
    app.route('/api/franchise/get_product_list').post(product.get_product_list);
    app.route('/api/franchise/update_product').post(product.update_product);

    app.route('/api/franchise/get_product_data').post(product.get_product_data);
    app.route('/api/franchise/get_product_store_data').post(product.get_product_store_data);

};





