/*eslint-env node, es6*/
/* eslint no-console:1 */

/* libraries here */
const d3 = require('d3-dsv'),
   fs = require('fs'),
   asyncLib = require('async'),
   path = require('path'),
   chalk = require('chalk');

/* a global var. Eww */
var fileNames = ['add.csv', 'journal.csv', 'activeItems.csv'];


function writeResults(resuts, fileName) {
   fs.writeFile(`./reports/${fileName}`, resuts, (err) => {
      if (err) {
         console.error(chalk.red('Err writing results'), err);
         return
      }
      console.log(chalk.green(`Results written to reports/${fileName}`));
   });
}

function findConsistentItems(lists) {
   var consistentItems = [],
      masterList = [],
      itemCodes;

   /*populate master list */
   lists.forEach((list) => {
      masterList = masterList.concat(list);
   });

   itemCodes = masterList.map((item) => {
      return item['Item Code'];
   });

   consistentItems = itemCodes.filter((code) => {
      if (itemCodes.indexOf(code) != itemCodes.lastIndexOf(code))
         return true;
      else
         return false;
   });
   
   var temp;
   consistentItems = consistentItems.map((code) => {
      temp = {};
      masterList.forEach((item) => {
         if (item['Item Code'] == code) {
            temp.itemCode = code;
            temp.Description = item.Description;
         }
      });
      return temp;
   });
   
   // console.log(consistentItems.length);
   var sConsistentItems = d3.csvFormat(consistentItems);
   // JSON.stringify(consistentItems);
   writeResults(sConsistentItems, 'nonUniqueItems.csv');
}


/***************************************************************
 *read in a single csv & return a JSON object with it's contents 
 ****************************************************************/
function readCSV(fileName, readCb) {
   fs.readFile(path.resolve('.', fileName), (err, data) => {
      if (err) {
         readCb(err, null);
         return;
      }
      data = data.toString();

      data = d3.csvParse(data);

      readCb(null, data);
   });
}

/**********************************************************************
 * Start here. Read CSV's one at a time and create an array of contents
 **********************************************************************/
function init() {
   asyncLib.mapSeries(fileNames, readCSV, (err, files) => {
      if (err) {
         console.error(chalk.red('I died, fix me!!!\n'), err);
         return;
      }

      console.log(chalk.green('done reading files'));
      console.log('files:', files.length);
      // do work
      findConsistentItems(files);
   });
}

init();
