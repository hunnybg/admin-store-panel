var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var franchise_product = new schema({
    unique_id: Number,
    name:{type: String, default: ""},
    details:{type: String, default: ""},
    is_visible_in_store: {type: Boolean, default: false},
    store_id: [{type: schema.Types.ObjectId}],
    franchise_id: {type: schema.Types.ObjectId},
    image_url: {type: String, default: ""},
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

 
franchise_product.plugin(autoIncrement.plugin, {model: 'franchise_product', field: 'unique_id' , startAt: 1,incrementBy: 1});
module.exports = mongoose.model('franchise_product', franchise_product);