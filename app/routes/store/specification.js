var specification = require('../../controllers/store/specification'); // include specification controller ////

module.exports = function (app) {

    app.route('/api/store/add_specification').post(specification.add_specification);

    app.route('/api/store/get_specification_list').post(specification.get_specification_list);

    app.route('/api/store/delete_specification').post(specification.delete_specification);
};





