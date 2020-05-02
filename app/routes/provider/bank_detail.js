var bank_details = require('../../controllers/provider/bank_detail'); // include bank_detail controller ////


module.exports = function (app) {
    app.route('/api/admin/add_bank_detail').post(bank_details.add_bank_detail);
    app.route('/api/admin/get_bank_detail').post(bank_details.get_bank_detail);
    //app.route('/api/admin/update_bank_detail').post(bank_details.update_bank_detail);
    app.route('/api/admin/delete_bank_detail').post(bank_details.delete_bank_detail);
    app.route('/api/admin/select_bank_detail').post(bank_details.select_bank_detail);

};





