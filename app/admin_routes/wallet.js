var wallet = require('../admin_controllers/wallet'); // include wallet controller ////


module.exports = function (app) {
    app.route('/admin/get_wallet_detail').post(wallet.get_wallet_detail);
    app.route('/admin/get_wallet_detail').get(wallet.get_wallet_detail);
    
    
    

};





