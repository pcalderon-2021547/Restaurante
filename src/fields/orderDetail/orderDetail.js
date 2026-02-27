'use strict';
import mongoose from "mongoose";

const orderDetailSchema=mongoose.Schema({
    order:{type:mongoose.Schema.Types.ObjectId,ref:'Order',required:true},
    dish:{type:mongoose.Schema.Types.ObjectId,ref:'Dish',required:true},
    quantity:{type:Number,required:true},
    price:Number,
    subtotal:Number
},{timestamps:true});

export default mongoose.model('OrderDetail',orderDetailSchema);
