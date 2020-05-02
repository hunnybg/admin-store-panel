var franchise = require('../admin_controllers/franchise'); // include store controller ////


module.exports = function (app) {
    //app.route('/admin/store_list').get(store.store_list);
    app.route('/admin/franchise_list_search_sort').post(franchise.franchise_list_search_sort);
    
    app.route('/admin/approve_decline_franchises').post(franchise.approve_decline_franchise);
    
    app.route('/admin/store_list_search_sort_franchises').post(franchise.store_list_search_sort);
    
};





