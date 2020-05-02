var provider = require('../admin_controllers/provider_map'); // include provider_map controller ////


module.exports = function (app) {

    app.route('/admin/provider_list_for_map').post(provider.provider_list_for_map);
};





