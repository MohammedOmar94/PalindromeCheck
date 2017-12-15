/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var express = require('express');
var session = require('cookie-session'); // Loads the piece of middleware for sessions
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser'); // Loads the piece of middleware for managing the settings
var urlencodedParser = bodyParser.urlencoded({extended: false});
var app = express();
var palindromes = [];
var timeAdded = [];//contains the times each palindrome was added.
var minutesAdded = [];//contains the times each palindrome was added in minutes.


app.set('view engine', 'ejs')
        .use(cookieParser())
        .use(express.static(__dirname + '/public'))

        /* The to do list and the form are displayed */
        .get('/index', function (req, res) {
            res.render('index.ejs', {word: "", palindrome: false});
        })

        .get('/index/check', function (req, res) {
            checklastWordsAdded();//Ensures only words in the last 10 minutes are shown.
            res.render('create.ejs', {palindromesList: palindromes, minutesAdded: minutesAdded});
        })

        /* Adding an item to the to do list */
        .post('/index/add/', urlencodedParser, function (req, res) {
            var wordAttempt = req.body.palindrome;
            var palindrome = palindromeCheck(wordAttempt);//boolean value.
            if (palindrome) {
                palindromes.unshift(wordAttempt);//Add new word
                timeAdded.unshift(new Date());//record the time it was added once only.
            }
            res.render('index.ejs', {word: wordAttempt, palindrome: palindrome});
            console.log("Word entered = " + wordAttempt + ", Palindrome? " + palindrome);
        })



        /* Redirects to the palindrome check if the page requested is not found */
        .use(function (req, res, next) {
            res.redirect('/index');
        });

app.listen(8080);

//Ensures that only values from the last 10 minutes are stored within the array.
function checklastWordsAdded() {
    minutesAdded.length = 0;//clear array to make way for updated minutes.
    for (var i = 0; i < palindromes.length; i++) {
        var lastAdded = getMinutes(timeAdded[i]);//Get the minutes since word was added.
        if (lastAdded > 10) {
            //If it was added longer than 10 minutes, remove the value.
            console.log("Removed  " + palindromes[i] + ". Time since added was " + lastAdded);
            palindromes.splice(i, 1);//Removes palindrome if past the 10 minute limit.
            minutesAdded.splice(i, 1);//And the time since it was added.
            timeAdded.splice(i, 1);//Removes the time it was added.
        } else if (lastAdded >= 0 && lastAdded < 11) {
            //If only was added within 10 minutes, store the minutes.
            minutesAdded.unshift(lastAdded + " minutes ago");//refresh the minutes since last added.
        }
        console.log("Word " + palindromes[i] + " was added " + lastAdded + " minutes ago");
    }
}

//Returns the minutes from when the last palindrome was added.
function getMinutes(last_time) {
    var current_time = new Date();
    var elapsed_ms = (current_time - last_time); // milliseconds 
    var seconds = Math.round(elapsed_ms / 1000);
    var minutes = Math.round(seconds / 60);
    return minutes;
}


function palindromeCheck(str) {
    //Lowercase the string and use the RegExp to remove unwanted characters from it
    var re = /[\W_]/g; // or var re = /[^A-Za-z0-9]/g;

    var lowRegStr = str.toLowerCase().replace(re, '');//Removes puncuation and changes it to lower case.
    // str.toLowerCase() = "A man, a plan, a canal. Panama".toLowerCase() = "a man, a plan, a canal. panama"
    // str.replace(/[\W_]/g, '') = "a man, a plan, a canal. panama".replace(/[\W_]/g, '') = "amanaplanacanalpanama"
    // var lowRegStr = "amanaplanacanalpanama";

    var reverseStr = lowRegStr.split('').reverse().join('');//Splits each character, reverses them and joins them together again.

    //Check if reverseStr is strictly equals to lowRegStr and return a Boolean
    return reverseStr === lowRegStr; // "amanaplanacanalpanama" === "amanaplanacanalpanama"? => true
}

