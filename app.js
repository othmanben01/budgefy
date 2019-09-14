//BUDGET CONTROLLER: DATA CONTROLLER
var budgetController = (function() {

    //creating a data structure for expenses and incomes
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0, 
        percentage: -1
    };

    var calculateTotal = function(type) {
        
        var sum = data.allItems[type].reduce(function(acc, curr) {

            return curr.value + acc;
        }, 0);

        data.totals[type] = sum;

    }

    return {
        
        addItem: function(type, des, val) {
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new item
            return newItem;
        },
    
        calculateBudget: function () {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }    
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
            return allPerc;
        },


        getBudget: function() {
            return {
                budget: data.budget, 
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function(type, id) {

            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);

            console.log(index);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        testing: function () {
            console.log(data)
        }
    
    
    }


})();


var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };

    return {
        getInput: function() {
        return {
                type: document.querySelector('.add__type').value, //will be either inc or exp, which are the option values
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.getElementsByClassName('add__value')[0].value)
            };
        },

        getDOMStrings: function () {
            return DOMstrings;
        },

        addListItem: function(obj, type){
             
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = ('<div class="item clearfix" id="inc-%id%"><div class="item__description" > %description%</div>' + 
                '<div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete">' + 
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >');
            } 
            else if (type === 'exp') { 
                element = DOMstrings.expensesContainer;
                html = ('<div class="item clearfix" id="exp-%id%"><div class="item__description" > %description%</div >' + 
                '<div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage"> 21%</div>' + 
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' + 
                '</div></div></div >');
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorId) {
            
            // element to remove
            var el = document.getElementById(selectorId);
            
            // Parent of the element to delete
            var elParent = el.parentNode;

            // Remove Element
            elParent.removeChild(el);
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
  

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        clearField: function() {
            var fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);
            var fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.map(function(element) {
                element.value = "";
            })
            document.querySelector(DOMstrings.inputDesc).focus();
        },

    }

})();

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function () {

        var DOMstrings = UICtrl.getDOMStrings();

        document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);
    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI  
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        console.log(percentages);
    };

    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the field input data from the user
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item into the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear inputs value
            UICtrl.clearField();

            // 5. Calculate and update the new budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }

    }

    var ctrlDeleteItem = function(event) {
        
        var itemID, splitID, type, ID;

        if (event.target.matches('i')) {

            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

            //inc-2
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // console.log(type + ' ' + ID); testing!

            // 2. delete the item from the user interface
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    }

    return {
        init: function() {

            console.log('Application is running');

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })

            setupEventListeners();
        },

    }

})(budgetController, UIController);




controller.init();