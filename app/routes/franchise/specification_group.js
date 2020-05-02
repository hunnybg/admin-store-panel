var specification_group = require('../../controllers/franchise/specification_group'); // include specification_group controller ////

module.exports = function (app) {

    app.route('/api/franchise/add_specification_group').post(specification_group.add_specification_group);
    app.route('/api/franchise/get_specification_group').post(specification_group.get_specification_group);
    app.route('/api/franchise/delete_specification_group').post(specification_group.delete_specification_group);
    
     app.route('/api/franchise/get_specification_lists').post(specification_group.get_specification_lists);

};





