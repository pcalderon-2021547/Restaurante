'use strict';
import Product from './product.js';

export const createProduct=async(req,res)=>{
    const product=new Product(req.body);
    await product.save();
    res.status(201).send(product);
};

export const getProducts=async(req,res)=>{
    res.send(await Product.find());
};

export const updateProduct=async(req,res)=>{
    const product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.send(product);
};

export const deleteProduct=async(req,res)=>{
    await Product.findByIdAndDelete(req.params.id);
    res.send({message:'Eliminado'});
};
