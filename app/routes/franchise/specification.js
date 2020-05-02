var specification = require('../../controllers/franchise/specification'); // include specification controller ////

module.exports = function (app) {

    app.route('/api/franchise/add_specification').post(specification.add_specification);

    app.route('/api/franchise/get_specification_list').post(specification.get_specification_list);

    app.route('/api/franchise/delete_specification').post(specification.delete_specification);
};





