var provider_earning = require('../../controllers/provider/provider_earning'); // include provider controller ////


module.exports = function (app) {
    app.route('/api/provider/daily_earning').post(provider_earning.provider_daily_earning);
    app.route('/api/provider/weekly_earning').post(provider_earning.provider_weekly_earning);

};





