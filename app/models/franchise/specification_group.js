var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var franchise_specification_group = new schema({
    unique_id: Number,
    product_id: {type: schema.Types.ObjectId},
    store_id: [{type: schema.Types.ObjectId}],
    franchise_id: {type: schema.Types.ObjectId},
    name: {type: String, default: ""},
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }

}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});


 
franchise_specification_group.plugin(autoIncrement.plugin, {model: 'franchise_specification_group', field: 'unique_id' , startAt: 1,incrementBy: 1});

module.exports = mongoose.model('franchise_specification_group', franchise_specification_group);