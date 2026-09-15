import express from 'express'
import { Todo} from '../models/todo.models.js'

const router=express.Router()

router.get('/', async (req,res)=>{
    try {
        const todos=await Todo.find()
        res.json(todos)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

router.post('/', async (req,res)=>{
    const newTodo=new Todo({
        text:req.body.text
    })
    try {
       const savedTodo=await newTodo.save()
       res.status(201).json(savedTodo) 
    } catch (error) {
        res.status(400).json({
            message:error.message
        })
    }
})

router.patch('/:id',async (req,res)=>{
   try {
    const todo=await Todo.findById(req.params.id)
    if(!todo) return res.status(404).json({message:"todo not found"})
    if(req.body.text!==undefined){
        todo.text=req.body.text
    } 
    if(req.body.completed!==undefined){
        todo.completed=req.body.completed
    } 
    const updatedtodo=await todo.save()
    res.json(updatedtodo)       
   } catch (error) {
    res.status(400).json({message:error.message})
   } 
})

router.delete('/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export {router}