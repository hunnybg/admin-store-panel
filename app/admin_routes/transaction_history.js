var transaction_history = require('../admin_controllers/transaction_history'); // include wallet controller ////


module.exports = function (app) {
    app.route('/admin/get_transaction_history').post(transaction_history.get_transaction_history);
   
};





