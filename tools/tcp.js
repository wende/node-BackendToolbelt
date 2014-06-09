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
        startAskingQuestions(client);
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
function handleMessage(msg) {
    var now = new Date();
    var date = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

    var displayable = false;
    for (var i = 0; i < msg.length; i++)
    {
        if(msg[i] < 33)
        {
            displayable = true;
            break;
        }
    }

    if( displayable) console.log(date + " => " + msg.toString());
    else console.log(date + " => " + msg.toJSON());
}
function startAskingQuestions(client)
{
    rl.question("> ", function (answer) {
        client.write(processReq(answer, !!delimitByLength, delimiter));
        startAskingQuestions(client);
    })
}
function processReq(req, byLength, delimiter) {
    var phrases = req.split(/[\(\)]+/);

    var counter = 1;
    phrases.forEach(function (x) {
        if (x.indexOf("#") == -1) counter += x.length;
        else counter += parseInt(x.split('#')[0]);
    });
    var buffer = new Buffer(counter);
    if(byLength)
    {
        buffer.writeInt8(counter-1, 0);
        counter = 1;
    }
    else
    {
        buffer.write(delimiter, counter-1);
        counter = 0;
    }

    phrases.forEach(function (x) {
        if (x == "") return;
        if (x.indexOf("#") != 1) {
            buffer.write(x, counter);
            counter += x.length;
        }
        else {
            var unsigned = false;
            var cake = x.split("#");
            if (cake[1][0] == "u") {
                unsigned = true;
                cake[1] = cake[1].split("u")[0];
            }
            var arity = parseInt(cake[0]);
            var num = parseInt(cake[1]);

            if (unsigned)switch (arity) {
                case 1:
                    buffer.writeUInt8(num, counter);
                    break;
                case 2:
                    buffer.writeUInt16BE(num, counter);
                    break;
                case 4:
                    buffer.writeUInt32BE(num, counter);
                    break;
                default:
                    throw new Error("Wrong arity");
            }
            else switch (arity) {
                case 1:
                    buffer.writeInt8(num, counter);
                    break;
                case 2:
                    buffer.writeInt16BE(num, counter);
                    break;
                case 4:
                    buffer.writeInt32BE(num, counter);
                    break;
                default:
                    throw new Error("Wrong arity");
            }
            counter += arity;
        }
    });
    return buffer;
}


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
function quit(msg) {
    console.log(msg);
    process.exit(1);
}
