/**
 * Created by root on 02/06/14.
 */

var net = require("net");
var framecut = require("framecut");
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var ip = getFirstOpt();
var port = findNextOpt('-p');
var delimitByLength = findOpt('-l');
var delimitByDelimiter = findOpt('-d');
var delimiter = findNextOpt('-d');

if(delimitByDelimiter)framecut.initByDelimiter(handleMessage, delimiter);
if(delimitByLength)framecut.initByLength(handleMessage, 1);

start();
function start() {

    if(!ip) quit("No ip provided");
    if(!port) quit("No port provided (-p)");
    if(!delimitByDelimiter && ! delimitByLength) quit("No delimitation provided ( [-d | -l] )");

    var client = net.createConnection(parseInt(port), ip, function()
    {
        console.log("Success");
        startAskingQuestions();
    });
    console.log("Connecting... ");
    client.on("data", function(data)
    {
        framecut.handleFrame(data, client);
    });
    client.on('end', function() {
        console.log('client disconnected');
        process.exit(0);
    });
    client.on('error', function(err)
    {
        console.log(ip);
        console.log(port);
        console.log(err);
        quit("No connection");
    })
}
function handleMessage(msg){
    var now = new Date();
    var date = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    console.log(date + " => " + msg);
}
function startAskingQuestions()
{
    rl.question("> ", function (answer) {
        console.log(answer.toString());
        startAskingQuestions();
    })
}

//HELPER FUNCTIONS

function getFirstOpt()
{
    if(process.argv.length < 4) console.log("No main opt specified");
    return process.argv[3];
}
function findOpt(opt)
{
    return (process.argv.indexOf(opt) != -1);
}
function findNextOpt(opt)
{
    if(process.argv.indexOf(opt) == -1)
    {
        return null
    }
    if(process.argv.length <= process.argv.indexOf(opt) + 1)
    {
        return null
    }
    return process.argv[process.argv.indexOf(opt) + 1]
}
function quit(msg)
{
    console.log(msg);
    process.exit(1);
}