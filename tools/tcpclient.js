/**
 * Created by root on 02/06/14.
 */

var net = require("net");


var ip = findNextOpt("-i");
var delimitByLength = findNextOpt('-l');
var delimitByDelimiter = findNextOpt('-d');






//HELPER FUNCTIONS

function getFirstOpt()
{
    if(process.argv.length < 3) console.log("No main opt specidied")
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
    return process.argv[process.argv.indexOf(opt) + 1]
}