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
    userMenu();
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

function end() {
    console.log(seperator);
    console.log(centerText("Thank you for shopping at"));
    console.log(centerText("Bob's Emporium"));
    console.log(centerText("of Wonders*!"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    connection.end();
}

function employeeEnd() {
    console.log(seperator);
    console.log(centerText("Thank you valued team member!"));
    console.log(centerText("Bob's Emporium of Wonders*"));
    console.log(centerText("appreciates your contribution"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    connection.end();
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

function validateNotEmpty (input) {
    if (input)
        return true;
    else {
        console.log("\nhis field can not be empty")
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
        console.log("\nPlease input a valid dollar amount.");
        return false;
    }
}

function userMenu () {
    inquirer.prompt({
        type: "list",
        name: "userChoice",
        choices: ["See the inventory", "Make a purchase", "Employees Only", "Nothing for now"],
        message: "What would you like to do?"
    }).then(function (answer) {
        switch(answer.userChoice) {
            case "See the inventory":
                displayInventory(userMenu);
                break;
            case "Make a purchase":
                createMenu(purchaseMenu);
                break;
            case "Employees Only":
                chooseEmployee();
                break;
            default:
                end();
        }
    })
}

function displayInventory(callback){
    connection.query("Select * from products ORDER BY department_name, product_name", function (error, response) {
        if (error) throw error;
        displayTable(response, callback)
    });
}

function displayTable(response, callback){
    var inventory = new Table({
        head: ["ID", "Product", "Department", "Price", "Stock"],
        colWidths: [10, 40, 20, 15, 15]
    });
    response.forEach(element => {
        inventory.push([element.item_id, element.product_name, element.department_name, element.price, element.stock_quantity]);
    });
    console.log(inventory.toString());
    pause(callback);
}

function createMenu(callback) {
    connection.query("Select item_id, product_name, department_name, price, stock_quantity FROM products ORDER BY department_name, product_name", function (error, response){
        if (error) throw error;
        var choicesArray = [];
        response.forEach(element => {
            choicesArray.push(leftAlignText(element.item_id + ")", 7) + leftAlignText(element.department_name, 15) + " | " + leftAlignText(element.product_name, 35) + " | " + rightAlignText("$" + element.price, 11) + " | Stock: " + rightAlignText("" + element.stock_quantity, 10));
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
        validate: validateUnits
    }]).then(function (answer) {
        var selectionID = answer.buySelection.slice(0, 7);
        selectionID = selectionID.split(")")[0];
        executePurchase(parseInt(selectionID), parseInt(answer.buyAmount));
    })
}

function executePurchase(itemID, amount) {
    connection.query("SELECT item_id, stock_quantity, product_name, price, product_sales FROM products WHERE ?", {item_id: itemID}, function (error, response){
        var userCost = (parseFloat(response[0].price) * amount).toFixed(2);
        if (error) throw error;
        if (parseInt(response[0].stock_quantity) < amount) {
            console.log(seperator);
            console.log(centerText("We're sorry,"));
            console.log(centerText("we do not have " + amount + " " + response[0].product_name + " in stock."));
            console.log(centerText("Please try again later."));
            console.log(seperator);
            pause(userMenu);
        } else {
            console.log(seperator);
            console.log(centerText("Purchased " + amount + " " + response[0].product_name));
            console.log(centerText("for a total of $" + userCost + "."));
            console.log(seperator);
            connection.query("UPDATE products SET ? WHERE ?", [
                {
                    stock_quantity: response[0].stock_quantity - amount,
                    product_sales: response[0].product_sales + userCost
                },
                {item_id: itemID}
            ], function (error, response){
                if (error) throw error;
                pause(userMenu);
            })
        }
    })
}

function chooseEmployee() {
    console.log(seperator);
    console.log(centerText("Greetings"));
    console.log(centerText("Bob's Emporium of Wonders*"));
    console.log(centerText("Team Member!"));
    console.log("");
    console.log(centerText("*Wonder not guaranteed"));
    console.log(seperator);
    inquirer.prompt({
        type: "list",
        message: "What level are you?",
        name: "employeeLevel",
        choices: ["Manager", "Supervisor", "Oops! I'm not a team member. Let me buy something instead."]
    }).then(function (answer){
        switch (answer.employeeLevel) {
            case "Manager":
                managerMenu();
                break;
            case "Supervisor":
                superviserMenu();
                break;
            default:
                userMenu();
        }
    })
}

function managerMenu () {
    inquirer.prompt({
        type: "list",
        name: "managerChoice",
        choices: ["View the inventory", "View low inventory", "Add to inventory", "Add new product", "Nothing for now"],
        message: "Welcome, Manager. What would you like to do?"
    }).then(function (answer) {
        switch(answer.managerChoice) {
            case "View the inventory":
                displayInventory(managerMenu);
                break;
            case "View low inventory":
                displayLowInventory(managerMenu);
                break;
            case "Add to inventory":
                createMenu(restockMenu);
                break;
            case "Add new product":
                deptArray(addItemMenu);
                break;
            default:
                employeeEnd();
        }
    })
}

function displayLowInventory(callback) {
    connection.query("Select * from products WHERE stock_quantity < 200 ORDER BY department_name, product_name", function (error, response){
        if (error) throw error;
        displayTable(response, callback);
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
        console.log(centerText("Added " + amount + " " + response[0].product_name + " to the inventory."));
        console.log(centerText("There are now " + (response[0].stock_quantity + amount) + " units."))
        console.log(seperator);
        connection.query("UPDATE products SET ? WHERE ?", [
            {stock_quantity: response[0].stock_quantity + amount},
            {item_id: itemID}
        ], function (error, response){
            if (error) throw error;
            pause(managerMenu);
        });
    });
}

function deptArray (callback){
    connection.query("SELECT department_name FROM departments", function (error, response){
        if (error) throw error;
        var deptArray = [];
        response.forEach(element => {
            deptArray.push(element.department_name);
        });
        callback(deptArray);
    })
}

function addItemMenu(deptArray) {
    inquirer.prompt([{
        type: "rawlist",
        message: "Which department is this product in?",
        name: "prodDept",
        choices: deptArray
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
            managerMenu();
        });
    })
}

function superviserMenu() {
    inquirer.prompt({
        type: "list",
        message: "Welcome, Supervisor. What would you like to do?",
        choices: ["View product sales by department", "Create new department", "Nothing for now"],
        name: "superviserChoice"
    }).then(function (answer){
        switch (answer.superviserChoice){
            case "View product sales by department":
                prodSales();
                break;
            case "Create new department":
                deptArray(addDeptMenu)
                break;
            default:
                employeeEnd();
        }
    })
}

function addDeptMenu(deptArray) {
    inquirer.prompt([{
        type: "input",
        message: "What is the name of the department you wish to add?",
        name: "deptName",
        validate: function (input) {
            if (!input){
                console.log("\nThis field cannot be blank.");
                return false;
            } else if (deptArray.indexOf(input) != -1) {
                console.log("\nThat department already exists.");
                return false;
            } else
                return true;
        }
    },{
        type: "input",
        message: "What is the overhead for that department?",
        name: "deptOverhead",
        validate: validatePrice
    }]).then(function (answer){
        console.log(answer)
    })
}