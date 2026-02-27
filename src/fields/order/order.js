'use strict';
import mongoose from "mongoose";

const orderSchema=mongoose.Schema({
    table:{type:mongoose.Schema.Types.ObjectId,ref:'Table',required:true},
    total:{type:Number,default:0},
    status:{type:String,enum:['pending','paid','cancelled'],default:'pending'}
},{timestamps:true});

export default mongoose.model('Order',orderSchema);
