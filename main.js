/*eslint-env node, es6*/
/* eslint no-console:1 */

/* libraries here */
const d3 = require('d3-dsv'),
   fs = require('fs'),
   asyncLib = require('async'),
   path = require('path'),
   chalk = require('chalk');

/* a global var. Eww */
var fileNames = ['Optiva List.csv', 'Adage.csv', 'Purchase Journal.csv'];


function writeResults(results, fileName) {
   results = results.csvFormat(masterList);
   fs.writeFile(`./reports/${fileName}`, results, (err) => {
      if (err) {
         console.error(chalk.red('Err writing results'), err);
         return
      }
      console.log(chalk.green(`Results written to reports/${fileName}`));
   });
}


function compareLists(list1, list2) {
   var duplicates = [];

   list1.forEach(item1 => {
      list2.forEach(item2 => {
         if (item1.id == item2.id)
            duplicates.push(item1);
      });
   });

   return [...duplicates];
}


function filterList(list, readCb) {
   list = list.map(item => {
      return {
         id: item['Item Code'],
         description: item['Description']
      };
   });

   list = [...list];
   readCb(null, list);
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

      // readCb(null, data);
      filterList(data, readCb);
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
      // console.log('files:', files.length);

      function dulpicateItems() {
         var masterList = compareLists(files[0], files[1]);
         for (var i = 2; i < files.length; i++) {
            masterList = compareLists(masterList, files[i]);
         }
      }

      console.log(`Duplicate items found: ${masterList.length}`);

      writeResults(masterList, 'Duplicates.csv');
   });
}

init();
