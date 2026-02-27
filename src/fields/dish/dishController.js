'use strict';
import Dish from './dish.js';

export const createDish=async(req,res)=>{
    const dish=new Dish(req.body);
    await dish.save();
    res.status(201).send(dish);
};

export const getDishes=async(req,res)=>{
    res.send(await Dish.find().populate('category').populate('products.product'));
};

export const updateDish=async(req,res)=>{
    const dish=await Dish.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.send(dish);
};

export const deleteDish=async(req,res)=>{
    await Dish.findByIdAndDelete(req.params.id);
    res.send({message:'Eliminado'});
};
