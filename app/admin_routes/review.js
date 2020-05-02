var review = require('../admin_controllers/review'); // include review controller ////


module.exports = function (app) {
    app.route('/admin/get_review_list').post(review.get_review_list);
    app.route('/admin/get_review_detail').post(review.get_review_detail);
    

};





