var item = require('../../controllers/franchise/item'); // include item controller ////

module.exports = function (app) {

    app.route('/api/franchise/add_item').post(item.add_item);
    app.route('/api/franchise/upload_item_image').post(item.upload_item_image);
    app.route('/api/franchise/update_item_image').post(item.update_item_image);
    app.route('/api/franchise/get_store_product_item_list').post(item.get_store_product_item_list);
    app.route('/api/franchise/get_for_store_product_item_list').post(item.get_for_store_product_item_list);
    app.route('/api/franchise/get_item_list').post(item.get_item_list);
    app.route('/api/franchise/update_item').post(item.update_item);
    
    app.route('/api/franchise/get_item_data').post(item.get_item_data);
    app.route('/api/franchise/is_item_in_stock').post(item.is_item_in_stock);
    
    
    app.route('/api/franchise/delete_item_image').post(item.delete_item_image);
    
};





