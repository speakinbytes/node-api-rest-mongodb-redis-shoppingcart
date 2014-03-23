var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Kart = new Schema({
	kart : [
  		{ 	
  			id:    	{ type: String, require: true },
  			amount:   { type: Number, require: true } 
  		}
  	],
  	user_id: { type: String, require:true},
  	created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Kart', Kart);