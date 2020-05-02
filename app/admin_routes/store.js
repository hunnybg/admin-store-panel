var store = require('../admin_controllers/store'); // include store controller ////


module.exports = function (app) {
    //app.route('/admin/store_list').get(store.store_list);
    app.route('/admin/store_list_search_sort').post(store.store_list_search_sort);
    
    app.route('/admin/get_store_data').post(store.get_store_data);
    app.route('/admin/update_store').post(store.update_store);
    app.route('/admin/approve_decline_store').post(store.approve_decline_store);
    app.route('/admin/get_store_list_for_city').post(store.get_store_list_for_city);
    app.route('/admin/get_store_list').get(store.get_store_list);
    
    app.route('/admin/get_store_list_for_country').post(store.get_store_list_for_country);
    
    app.route('/admin/product_for_city_store').post(store.product_for_city_store);
    app.route('/admin/item_for_city_store').post(store.item_for_city_store);
    app.route('/admin/get_store_review_history').post(store.get_store_review_history);
    
    app.route('/admin/export_excel_store').get(store.export_excel_store);


    app.route('/admin/get_pay_to_store').post(store.get_pay_to_store);
    app.route('/admin/get_transferred_history').post(store.get_transferred_history);
    app.route('/api/store/withdraw_earning').post(store.withdraw_earning);

    
};





