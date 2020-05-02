var store = require('../admin_controllers/store_map'); // include store_map controller ////


module.exports = function (app) {
     app.route('/admin/store_list_for_map').post(store.store_list_for_map);
};





