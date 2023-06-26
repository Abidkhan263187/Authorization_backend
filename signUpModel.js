const mongoose=require("mongoose")


const signUpSchema=new mongoose.Schema({
name:{type :String, required:true},
email:{type :String, required:true},
password:{type :String, required:true},
role:{type:String, default:"customer" ,enum:["customer", "seller"]}

})
const signupModel=mongoose.model("user",signUpSchema)

module.exports={signupModel}