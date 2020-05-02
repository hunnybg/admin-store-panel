var store_earning = require('../../controllers/store/store_earning'); // include store_earning controller ////


module.exports = function (app) {
    app.route('/api/store/get_store_earning').post(store_earning.get_store_earning);
    app.route('/api/store/daily_earning').post(store_earning.store_daily_earning);
    app.route('/api/store/weekly_earning').post(store_earning.store_weekly_earning);

    app.route('/api/store/waiter_tip_earning').post(store_earning.waiter_tip_earning);


};





