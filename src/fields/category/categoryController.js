'use strict';
import Category from './category.js';

export const createCategory=async(req,res)=>{
    const category=new Category(req.body);
    await category.save();
    res.status(201).send(category);
};

export const getCategories=async(req,res)=>{
    res.send(await Category.find());
};

export const updateCategory=async(req,res)=>{
    const category=await Category.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.send(category);
};

export const deleteCategory=async(req,res)=>{
    await Category.findByIdAndDelete(req.params.id);
    res.send({message:'Eliminado'});
};
