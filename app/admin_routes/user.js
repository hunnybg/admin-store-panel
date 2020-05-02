var user = require('../admin_controllers/user'); // include user controller ////


module.exports = function (app) {
    //app.route('/admin/user_list').get(user.user_list);
    app.route('/admin/user_list_search_sort').post(user.user_list_search_sort);
    
    app.route('/admin/get_user_detail').post(user.get_user_detail);
    app.route('/admin/update_user').post(user.update_user);
    app.route('/admin/approve_decline_user').post(user.approve_decline_user);

    app.route('/admin/add_wallet').post(user.add_wallet);
    //app.route('/admin/send_email').post(user.send_email);
    app.route('/admin/send_sms').post(user.send_sms);
    app.route('/admin/send_notification').post(user.send_notification);
    app.route('/admin/get_user_referral_history').post(user.get_user_referral_history);
    app.route('/admin/get_user_review_history').post(user.get_user_review_history);
    app.route('/admin/export_excel_user').get(user.export_excel_user);

    app.route('/admin/get_ticket_list').post(user.get_ticket_list);
    app.route('/admin/resolve_ticket').post(user.resolve_ticket);

    
};





