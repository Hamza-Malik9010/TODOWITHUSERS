import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
let port = process.env.PORT;
const API_URL = "http://localhost:3000";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://hamza9010:hamza123@cluster0.xr1pzq2.mongodb.net/TODO-LIST", {useNewUrlParser:true});
const entrySchema = new mongoose.Schema({
  content : String
});
const listSchema = new mongoose.Schema({
  name : String,
  todo: [entrySchema]
});
const Entry = mongoose.model("Entry", entrySchema);
const List = mongoose.model("List", listSchema);

//step 1
app.get("/", async (req, res) => {
    try {
      const founditems = await List.find({}).exec();
      res.render("index.ejs", { lists: founditems });
      console.log(founditems);
    } catch (err) {
      console.error(err);
      // Handle the error appropriately, e.g., send an error response
    }  
});
//step 2
app.post("/create-a-list", async (req,res) =>{
  const listname = req.body.inputText;
  const list = new List ({
    name : listname
  });
  try {
    await list.save();
    const founditems = await List.find({}).exec();
    //res.render("index.ejs", { lists: founditems });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    // Handle the error appropriately, e.g., send an error response
  }
});


//step 3
app.post("/goto", async (req, res) => {
  try {
    const founditems = await List.findOne({name:req.body.listName}).exec();
    console.log(founditems); // Add this line to check the data
    res.render("modify.ejs", { list: founditems});
  } catch (err) {
    console.error(err);
    // Handle the error appropriately, e.g., send an error response
  }  
});

app.post("/entry", async (req, res) => {
  const task = req.body.task;
  const ln = req.body.listN;
  //console.log("Request body:", req.body); // Add this line to log the request body
  //console.log("List name received:", ln); // Add this line to check the list name
  try {
    const foundList = await List.findOne({ name: ln }).exec();
    console.log("Found list:", foundList); // Add this line to check if a list was found
    if (!foundList) {
      // Handle the case where the list doesn't exist
      return res.status(404).send("List not found");
    }
    const taskToBeEntered = new Entry({ content: task });
    foundList.todo.push(taskToBeEntered);
    await foundList.save(); // Save the changes to the list
    //console.log("Updated list:", foundList); // Add this line to check the updated list
    res.render("modify.ejs", { list: foundList });
  } catch (err) {
    console.error(err);
    // Handle other errors appropriately, e.g., send an error response
  }
});


app.post("/delete", async (req, res) => {
  try {
    const id = req.body.taskid;
    const ln = req.body.listn;

    // Remove the task from the todo array using $pull
    await List.findOneAndUpdate({ name: ln }, { $pull: { todo: { _id: id } } });

    // Find the updated list
    const foundlist = await List.findOne({ name: ln }).exec();

    // Render the modified list
    res.render("modify.ejs", { list: foundlist });
  } catch (err) {
    console.error(err);
    // Handle any errors appropriately, e.g., send an error response
  }
});

app.post("/back", async (req, res) => {
  try {
    const founditems = await List.find({}).exec();
    res.render("index.ejs", { lists: founditems });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately, e.g., send an error response
  }  
});

app.post("/del-list/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Delete the list by its ID
    await List.findByIdAndRemove(id);

    // Optionally, you can also delete associated tasks (clear the todo array)
    // await List.findByIdAndUpdate(id, { todo: [] });

    const founditems = await List.find({}).exec();
    res.render("index.ejs", { lists: founditems });
  } catch (err) {
    console.error(err);
    // Handle any errors appropriately, e.g., send an error response
  }
});

if (port==null || port =="")
{
  port = 3000;
}


app.listen(port, function () {
  console.log(`Backend server is running on ${port}`);
});
