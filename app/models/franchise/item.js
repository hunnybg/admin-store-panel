var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var franchise_item = new schema({
    unique_id: Number,
    franchise_id: {type: schema.Types.ObjectId},
    store_id: [{type: schema.Types.ObjectId}],
    product_id: {type: schema.Types.ObjectId},
    details: {type: String, default: ""},
    name: {type: String, default: ""},
    price: {type: Number, default: 0},

    offer_message_or_percentage: {type: String, default: ""},
    item_price_without_offer: {type: Number, default: 0},
    total_quantity: {type: Number, default: 0},
    in_cart_quantity: {type: Boolean, default: false},
    total_added_quantity: {type: Number, default: 0},
    total_used_quantity: {type: Number, default: 0},
        
    note_for_item:{type: String, default: ""},

    is_item_in_stock: {type: Boolean, default: false},
    is_most_popular: {type: Boolean, default: false},
    is_visible_in_store: {type: Boolean, default: false},
    
    total_item_price: {type: Number, default: 0},
    total_specification_price: {type: Number, default: 0},
    total_price: {type: Number, default: 0},
    specifications_unique_id_count: {type: Number, default: 0},
    specifications: {type: Array, default: []},
    
    image_url: {type: Array, default: []},
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


franchise_item.plugin(autoIncrement.plugin, {model: 'franchise_item', field: 'unique_id', startAt: 1, incrementBy: 1});
module.exports = mongoose.model('franchise_item', franchise_item);