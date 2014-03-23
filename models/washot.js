var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WasHot = new Schema({
	tshirt_id 	: { type: String, require: true },
  	created 	: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WasHot', WasHot);