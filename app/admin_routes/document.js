
var document = require('../admin_controllers/document'); // include document controller ////


module.exports = function (app) {

    app.route('/admin/add_document_data').post(document.add_document_data);
    app.route('/admin/document_list').post(document.document_list);
    app.route('/admin/document_list').get(document.document_list);
    app.route('/admin/update_document').post(document.update_document);
    app.route('/admin/get_document_detail').post(document.get_document_detail);
    app.route('/admin/upload_document').post(document.upload_document);
    
    
    
};





