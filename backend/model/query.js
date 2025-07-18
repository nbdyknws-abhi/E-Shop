const  mongoose = require("mongoose");
const{ Schema , model} = mongoose;

const querySchema = new Schema({
    Name:{type: String,required: true,},
    Email:{type: String,required: true,},
    Query:{type: String,required: true},
    QueryStatus:{type: String,default: "Pending"},
}, 
{ timestamps: true }
);
module.exports = model("Query", querySchema);