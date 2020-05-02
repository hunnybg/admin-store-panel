
var view_document = require('../admin_controllers/view_document'); // include view_document controller ////


module.exports = function (app) {
    app.route('/admin/view_document_list').post(view_document.view_document_list);
};





