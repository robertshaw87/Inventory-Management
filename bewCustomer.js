var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
const seperator = "\n==========\n";
const width = 80;

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
    while (str.length < 80){
        str = " " + str + " ";
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
                purchaseMenu();
                break;
            default:
                end();
        }
    })
}

function displayInventory(){
    connection.query("Select * from products", function(error, response){
        var inventory = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 35, 15, 10, 10]
        });
        response.forEach(element => {
            inventory.push([element.item_id, element.product_name, element.department_name, element.price, element.stock])
        });
        console.log(inventory);
        pause(userMenu);
    })
}

function end() {
    console.log(seperator);
    console.log(centerText("Thank you for shopping at"));
    console.log(centerText("Bob's Emporium"));
    console.log(centerText("of Wonders*!"));
    console.log("");
    console.log(centerText("Please come again!"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    connection.end();
}