var provider = require('../admin_controllers/provider'); // include provider controller ////


module.exports = function (app) {
    app.route('/admin/provider_list').get(provider.provider_list);
    app.route('/api/provider/provider_list_search_sort').post(provider.provider_list_search_sort);
    app.route('/admin/get_provider_detail').post(provider.get_provider_detail);
    app.route('/admin/update_provider').post(provider.update_provider);
    app.route('/admin/provider_approve_decline').post(provider.provider_approve_decline);
    
    app.route('/admin/get_bank_detail').post(provider.get_bank_detail);
    app.route('/admin/new_get_bank_detail').post(provider.new_get_bank_detail);

    app.route('/admin/get_provider_list_for_city').post(provider.get_provider_list_for_city);
    
    app.route('/admin/export_csv_provider').get(provider.export_csv_provider);
    app.route('/admin/get_provider_review_history').post(provider.get_provider_review_history);

    app.route('/store/add_new_provider').post(provider.add_new_provider);
   
};





