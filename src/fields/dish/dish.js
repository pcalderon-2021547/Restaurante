'use strict';
import mongoose from "mongoose";

const dishSchema=mongoose.Schema({
    name:{type:String,required:true},
    description:String,
    price:{type:Number,required:true},
    category:{type:mongoose.Schema.Types.ObjectId,ref:'Category'},
    products:[{
        product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
        quantity:Number
    }],
    isAvailable:{type:Boolean,default:true}
},{timestamps:true});

export default mongoose.model('Dish',dishSchema);
