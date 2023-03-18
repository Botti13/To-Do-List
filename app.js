const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));





mongoose.connect("mongodb+srv://Rex1:test@cluster0.f94zzno.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find()
  .then((foundItems) => {
    if(foundItems.length === 0) {
      
Item.insertMany(defaultItems)
.then(()=>{
    console.log("Succesfully saved default items to DB");
  })
.catch((err) => {
  console.log(err);
});
res.redirect("/");
    } else {
res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
  .catch((err) => {
    console.log(err);
  });

});

app.get("/:listName", (req,res)=>{
  const listName = _.capitalize(req.params.listName);

List.findOne({name: listName})
  .then((foundList) => {
    if(!foundList) {
      //Create a new list
      const list = new List({
        name: listName,
        items: defaultItems
      });
    
    list.save();
    res.redirect("/" + listName);
    } else {
      //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
})
.catch((err) => {
  console.log(err);
});







});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const addedItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    addedItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then((foundList) => {
      foundList.items.push(addedItem);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.log(err);
    });
  }

});

app.post("/delete", (req, res) => {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkItemId)
    .then(console.log("Succesfully deleted"))
    .catch((err) =>{
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}})
    .then((foundList) => {
     res.redirect("/" + listName); 
    })
    .catch((err) => {
      console.log(err);
    });
  }

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});

