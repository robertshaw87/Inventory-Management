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
    console.log(centerText("Greetings"));
    console.log(centerText("Bob's Emporium of Wonders*"));
    console.log(centerText("Team Member!"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    userMenu();
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

function rightAlignText (str, width){
    while (str.length < width){
        str = " " + str;
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
        choices: ["View the inventory", "View low inventory", "Add to inventory", "Add new product", "Nothing for now"],
        message: "What would you like to do?"
    }).then(function (answer) {
        switch(answer.userChoice) {
            case "View the inventory":
                connection.query("Select * from products ORDER BY department_name, product_name", displayInventory);
                break;
            case "View low inventory":
                connection.query("Select * from products WHERE stock_quantity < 200 ORDER BY department_name, product_name", displayInventory);
                break;
            case "Add to inventory":
                createMenu(restockMenu);
                break;
            case "Add new product":
                addItemMenu();
                break;
            default:
                end();
        }
    })
}

function displayInventory (error, response) {
    if (error) throw error;
    var inventory = new Table({
        head: ["ID", "Product", "Department", "Price", "Stock"],
        colWidths: [10, 40, 20, 15, 15]
    });
    response.forEach(element => {
        inventory.push([element.item_id, element.product_name, element.department_name, "$" + parseFloat(element.price).toFixed(2), element.stock_quantity]);
    });
    console.log(inventory.toString());
    pause(userMenu);
}

function createMenu(callback) {
    connection.query("Select item_id, product_name, department_name, price, stock_quantity FROM products ORDER BY department_name, product_name", function (error, response){
        if (error) throw error;
        var choicesArray = [];
        response.forEach(element => {
            choicesArray.push(leftAlignText(element.item_id + ")", 7) + leftAlignText(element.department_name, 15) + " | " + leftAlignText(element.product_name, 35) + " | " + rightAlignText("$" + parseFloat(element.price).toFixed(2), 11) + " | Stock: " + rightAlignText("" + element.stock_quantity, 10));
        })
        callback(choicesArray);
    });
}

function restockMenu(choices) {
    inquirer.prompt([{
        type: "list",
        name: "restockSelection",
        message: "Which product are you restocking?",
        choices: choices
    },{
        type: "input",
        name: "restockAmount",
        message: "How many units are you adding?",
        validate: validateUnits
    }]).then(function (answer) {
        var selectionID = answer.restockSelection.slice(0, 7);
        selectionID = selectionID.split(")")[0];
        executeRestock(parseInt(selectionID), parseInt(answer.restockAmount));
    })
}

function executeRestock(itemID, amount) {
    connection.query("SELECT item_id, stock_quantity, product_name, price FROM products WHERE ?", {item_id: itemID}, function (error, response){
        if (error) throw error;
        console.log(seperator);
        console.log(centerText("Added " + amount + " " + response[0].product_name + "to the inventory."));
        console.log(centerText("There are now " + (response[0].stock_quantity + amount) + " units."))
        console.log(seperator);
        connection.query("UPDATE products SET ? WHERE ?", [
            {stock_quantity: response[0].stock_quantity + amount},
            {item_id: itemID}
        ], function (error, response){
            if (error) throw error;
            pause(userMenu);
        });
    });
}

function addItemMenu() {
    inquirer.prompt([{
        type: "input",
        message: "Which department is this product in?",
        name: "prodDept",
        validate: validateNotEmpty
    },{
        type: "input",
        message: "What is the name of the product?",
        name: "prodName",
        validate: validateNotEmpty
    }, {
        type: "input",
        message: "What is the price of the product?",
        name: "prodPrice",
        validate: validatePrice
    },{
        type: "input",
        message: "How many initial units do we have?",
        name: "prodStock",
        validate: validateUnits
    }]).then(function (answer){
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.prodName,
            department_name: answer.prodDept,
            price: parseFloat(answer.prodPrice).toFixed(2),
            stock_quantity: parseInt(answer.prodStock)
        }, function (error, response){   
            console.log(seperator);
            console.log(centerText("Added a new " + answer.prodName + " item in the " + answer.prodDept + " department"));
            console.log(centerText("with a price of $" + parseFloat(answer.prodPrice).toFixed(2) + " and an initial inventory of " + answer.prodStock + " units."))
            console.log(seperator);
            userMenu();
        });
    })
}

function validateNotEmpty (input) {
    if (input)
        return true;
    else {
        console.log("This field can not be empty")
        return false;
    }
}

function validateUnits (input) {
    if (parseInt(input) >= 0)
        return true;
    else {
        console.log("\nPlease input a valid quantity.");
        return false;
    }
}

function validatePrice (input) {
    if (parseFloat(input) >= 0)
        return true;
    else {
        console.log("\nPlease input a valid price.");
        return false;
    }
}

function end() {
    console.log(seperator);
    console.log(centerText("Thank you valued team member!"));
    console.log(centerText("Bob's Emporium of Wonders*"));
    console.log(centerText("appreciates your contribution"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    connection.end();
}
