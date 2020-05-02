var product = require('../../controllers/store/product'); // include product controller ////

module.exports = function (app) {

    app.route('/api/store/add_product').post(product.add_product);
    app.route('/api/store/get_product_list').post(product.get_product_list);
    app.route('/api/store/update_product').post(product.update_product);

    app.route('/api/store/get_product_data').post(product.get_product_data);
    
    app.route('/api/get_product_item_detail').post(product.get_product_item_detail);

};





