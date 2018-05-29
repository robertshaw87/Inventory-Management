var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
const seperator = "\n==========================================================================================================\n";
const windowWidth = 106;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "qwerty",
    database: "bew_db"
});

connection.connect(function (error) {
    if (error) throw error;
    start();
});

function start() {
    console.log(seperator);
    console.log(centerText("Welcome to"));
    console.log(centerText("Bob's Emporium"));
    console.log(centerText("of Wonders*!"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    pause(userMenu);
}

function centerText (str) {
    while (str.length < windowWidth){
        str = " " + str + " ";
    }
    return str;
}

function leftAlignText (str, width){
    while (str.length < width){
        str += " ";
    }
    return str;
}

function pause (callback) {
    inquirer.prompt({
        type: "input",
        name: "pause",
        message: "Please press ENTER to continue."
    }).then(function (answer) {
        callback();
    })
}

function userMenu () {
    inquirer.prompt({
        type: "list",
        name: "userChoice",
        choices: ["See the inventory", "Make a purchase", "Nothing for now"],
        message: "What would you like to do?"
    }).then(function (answer) {
        switch(answer.userChoice) {
            case "See the inventory":
                displayInventory();
                break;
            case "Make a purchase":
                createMenu(purchaseMenu);
                break;
            default:
                end();
        }
    })
}

function displayInventory(){
    connection.query("Select * from products ORDER BY department_name, product_name", function(error, response){
        var inventory = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [10, 40, 20, 15, 15]
        });
        response.forEach(element => {
            inventory.push([element.item_id, element.product_name, element.department_name, element.price, element.stock_quantity]);
        });
        console.log(inventory.toString());
        pause(userMenu);
    })
}

function createMenu(callback) {
    connection.query("Select item_id, product_name, price, stock_quantity from products ORDER BY department_name, product_name", function (error, response){
        var choicesArray = [];
        response.forEach(element => {
            choicesArray.push(leftAlignText(element.item_id + ")", 7) + leftAlignText(element.product_name, 35) + " | $" + leftAlignText("" + element.price, 10) + " | Stock: " + leftAlignText("" + element.stock_quantity, 10));
        })
        callback(choicesArray);
    });
}

function purchaseMenu(choices) {
    inquirer.prompt([{
        type: "list",
        name: "buySelection",
        message: "What would you like to buy?",
        choices: choices
    },{
        type: "input",
        name: "buyAmount",
        message: "How many would you like to buy?",
        validate: function(input) {
            if (parseInt(input) >= 0)
                return true;
            else {
                console.log("\nPlease input a valid quantity.");
                return false;
            }
        }
    }]).then(function (answer) {
        var selectionID = answer.buySelection.slice(0, 7);
        selectionID = selectionID.split(")")[0];
        console.log(selectionID)
        executePurchase(selectionID, parseInt(answer.buyAmount));
    })
}

function executePurchase(itemID, amount) {
    console.log(itemID, " ", amount);
    pause(userMenu);
}

function end() {
    console.log(seperator);
    console.log(centerText("Thank you for shopping at"));
    console.log(centerText("Bob's Emporium"));
    console.log(centerText("of Wonders*!"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log("\n");
    console.log(centerText("Please come again!"));

    console.log(seperator);
    connection.end();
}