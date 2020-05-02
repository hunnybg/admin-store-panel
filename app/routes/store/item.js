var item = require('../../controllers/store/item'); // include item controller ////

module.exports = function (app) {

    app.route('/api/store/add_item').post(item.add_item);
    app.route('/api/store/upload_item_image').post(item.upload_item_image);
    app.route('/api/store/update_item_image').post(item.update_item_image);
    app.route('/api/store/get_store_product_item_list').post(item.get_store_product_item_list);
    app.route('/api/store/get_item_list').post(item.get_item_list);
    app.route('/api/store/update_item').post(item.update_item);
    app.route('/api/store/delete_item').post(item.delete_item);
    
    app.route('/api/store/get_item_data').post(item.get_item_data);
    app.route('/api/store/is_item_in_stock').post(item.is_item_in_stock);
    app.route('/api/store/delete_item_image').post(item.delete_item_image);
    app.route('/api/get_item_detail').post(item.get_item_detail);
    app.route('/api/store/update_sequence_number').post(item.update_sequence_number);
};





