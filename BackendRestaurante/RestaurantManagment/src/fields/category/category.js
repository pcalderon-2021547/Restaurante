'use strict';
import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name:{type:String,required:true,unique:true},
    description:String,
    isActive:{type:Boolean,default:true}
},{timestamps:true});

export default mongoose.model('Category',categorySchema);
