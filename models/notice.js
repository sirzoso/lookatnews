var bcrypt=require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10;

var noticeSchema = mongoose.Schema({
    id:{type:String,required:true},
    notice:{type:String,required:true},
    description:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    categorie:{type:String,required:true}
});


var Notice = mongoose.model("notices", noticeSchema);
module.exports = Notice;