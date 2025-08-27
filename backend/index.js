// --------------------------- ↓ SETTING UP DEPENDENCIES ↓ --------------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// ---------------------------- ↓ INITIAL APP CONFIGURATION ↓ -----------------------------

const port = process.env.PORT || 3000;
const app = express();

// -------------------------------- ↓ MIDDLEWARE SETUP ↓ -----------------------------------

// app.use(cors("*"));

app.use(express.json());

const corsOptions = {
    origin: ["https://to-do-app-25-zeta.vercel.app", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}

app.use(cors(corsOptions));



// -------------------------------------- Database connection --------------------------------------


(async () => {
    try {
        mongoose.set("autoIndex", false );

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ mongoDB connected");

        await Task.syncIndexes();
        console.log("✅ Indexes created!")

        app.listen(3000, () => {
            console.log(`✅ to do App is live on port ${port}`);
        });
    } catch (error) {
        console.error("❌ Startup error:", error);
        process.exit(1);
    }
})();


const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description:{type: String, required: true}, 
    dueDate:{type: Date, required: true}, 
    createdOn:{type: Date, default: Date.now, required: true},
    completed:{type: Boolean, required: true, default: false} 
});

taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdOn: 1 });



const Task = mongoose.model("Task", taskSchema);




// -------------------------------------- TASK ROUTES --------------------------------------



app.get("/tasks", async (req, res) => {
    try {
        const { sortBy } = req.query;
        console.log(sortBy)
        let sortOption = {};

        if (sortBy === "dueDate") {
            sortOption = { dueDate: 1}
        } else if (sortBy === "dateCreated") {
            sortOption = { dateCreated: 1 };
        }
        
        const tasks = await Task.find({}).sort(sortOption); 
        console.log(tasks,sortOption)
       res.json(tasks)
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({message: "Error grabbing tasks!"});  
    }
});



app.post("/tasks/todo", async (req, res) => {
try {
    const { title,description, dueDate } = req.body;

    const taskData = { title, description, dueDate };
    const createTask = new Task(taskData);
    const newTask = await createTask.save();

    res.json({ task: newTask, message: "New task created successfully" });

} catch (error) {
    console.error("Error:", error);
    res.status(500).json({message: "Error creating the tasks!"});    
}
});



// to completed task

app.patch("/tasks/complete/:id", async (req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const completeTask = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });

        if (!completeTask) {
            return res.status(400).json({message: "Task not found!"});
        }

        res.json({ task: completeTask })

    } catch (error) {
    console.error("Error:", error);
    res.status(500).json({message: "Error completing the task!" });   
    }
});





app.patch("/tasks/notComplete/:id", async (req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const taskNotcompleted = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });

        if (!taskNotcompleted) {
            return res.status(400).json({message: "Task not found!"});
        }

        res.json({ task: taskNotcompleted, message: "Task set to `not complete`" });

    } catch (error) {
    console.error("Error:", error);
    res.status(500).json({message: "Error setting the task to `not complete`!" });   
    }
});



app.delete("/tasks/delete/:id", async(req, res) => {
    try {
        const taskId = req.params.id;

        const deleteTask = await Task.findByIdAndDelete(taskId);

        if(!deleteTask) {
            return res.status(400).json({ message: "Task not found!" });
        }

        res.json({ task: deleteTask, message: "Task deleted successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error deleting the task!" });   
    }
});



app.put("/tasks/update/:id", async (req, res) => {
    const taskId = req.params.id;
    const { title, description, dueDate } = req.body;

    const taskData = { title, description, dueDate };
    const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true }); 

    if (!updatedTask) {
        return res.status(400).json({ message: "Task not found!" });
    }
    res.json({ task: updatedTask, message: "Task updated successfully!" });
})



