// Load Application Resources
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require("body-parser");
const _ = require('lodash')
const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

async function main() {
    try {
        await mongoose.connect("mongodb+srv://admin-charles:5462353213@cluster0.gppslft.mongodb.net/listApplication?retryWrites=true&w=majority");
        console.log("Successfully logged into server");
    } catch (error) {
        throw error;
    }
}

main();

const itemSchema = new mongoose.Schema({
    name: {
        type: String
    }
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
    title: String,
    description: String,
    creator: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

// Express open port for listening
app.listen(port, () => {
    console.log('List-Application listening to port ' + port);
});



// Express Get Routings
app.get('/', (req, res) => {

    List.find()
        .then(function (items) {
            res.render('home', { listOfLists: items });
        })
        .catch(function (err) {
            console.log(err);
        });


});

app.get('/createList', (req, res) => {
    res.render('createList');
});

app.get('/lists/:listID', (req, res) => {
    const currentListID = req.params.listID;
    List.findOne({ _id: currentListID })
        .then(function (foundList) {
            if (!foundList) {
                res.render('error404');
            }
            else {
                res.render('list', { currentList: foundList });
            }
        })
        .catch(function (err) { console.log(err); });
});

app.post('/deleteList', (req, res) => {
    const currentListID = req.body.listID;
    List.deleteOne({ _id: currentListID })
        .then(function () {
            console.log("List deleted"); // Success
            res.redirect('/');
        }).catch(function (error) {
            console.log(error); // Failure
        });
});

app.post('/addItem', (req, res) => {
    const currentListName = req.body.listName;
    const currentItemName = req.body.itemName;

    let newItem = new Item({
        name: currentItemName
    });
    List.findOne({ title: currentListName })
        .then(function (foundList) {
            if (!foundList) {
                res.render('error404');
            }
            else {
                foundList.items.push(newItem);
                console.log(foundList);
                foundList.save()
                    .then(function () {
                        res.redirect('/lists/' + foundList.id);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        })
        .catch(function (err) { console.log(err); });
});

app.post('/deleteItem', (req, res) => {
    const currentListID = req.body.listID;
    const currentItemID = req.body.itemID;

    List.findOne({ _id: currentListID })
        .then(function (foundList) {
            if (!foundList) { res.render('error404'); }
            let indexToBeRemoved = -1;
            for (let i = 0; i < foundList.items.length; i++) {
                if (foundList.items[i]._id.toString() === currentItemID) {
                    indexToBeRemoved = i;
                    break;
                }
            }
            if (indexToBeRemoved !== -1) {
                foundList.items = foundList.items.slice(0, indexToBeRemoved).concat(foundList.items.slice(indexToBeRemoved + 1));
            }
            foundList.save();
            res.redirect('/lists/' + foundList._id.toString());
        })
        .catch(function (err) { console.log(err); });
});

app.post('/createList', (req, res) => {
    const listCreator = req.body.listCreator;
    const listTitle = req.body.listTitle;
    const listDescription = req.body.listDescription;

    const newList = new List({
        title: listTitle,
        creator: listCreator,
        description: listDescription,
        items: []
    });

    newList.save()
        .then(function () {
            res.redirect('/');
        })
        .catch(function (err) {
            console.log(err);
        });

});

