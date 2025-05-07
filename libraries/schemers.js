

// let chroma = require("./node_modules/chroma-js/dist/chroma.cjs")

import MatrixHelpers from './matrixhelpers.js'
import Stats from './stats.js';

const SAMPLESHEET = [
  ["id", "col1", "col2", "col3"],
  ["samsun" ,11, 0, 3],
  ["sinop"  ,11, 0, 2],
  ["ordu"   ,33, 0, 5],
  ["giresun",33, 7, 9],
  ["trabzon",55, 5, 4],
  ["artvin" ,100, 5, 0],
];

function findMaxIndex(array){
  let index = -1;
  let maxValue = -Infinity;
  for(let i=0; i<array.length; i++){
    if(typeof array[i] == 'number' && array[i] > maxValue){
      index = i;
      maxValue = array[i];
    }
  }
  return index;
}


function findSecondHighestValueIndex(array){
  if(!Array.isArray(array)) return -1;

  let lookupTable = array.map((value,index,arr) => {
    return {value, index}
  }).filter(obj => typeof obj.value == "number")

  lookupTable.sort((a,b) => b.value-a.value)

  if(lookupTable.length >= 2) return lookupTable[1].index
  else return -1
}

//maxSchemer and secondHighestValueSchemer both uses this fn
const conditionalSchemer = function(sheet, options, compareFunction){
  let colorMappings = {};
  let cellMappings = []
  let legendObj = {
    title: "LegendTODO",
    labels: [{color: "xxx", label: "string" ,range: [1,2]}, {}]
  }
  
  // Generate colorMappings
  for(let i=1; i < sheet.length; i++){
    let maxIndex = compareFunction(sheet[i])
    let rowName = sheet[i][0];
    let colName = sheet[0][maxIndex];
    if(maxIndex != -1 && rowName && colName && options.colorGroups[colName]){
      colorMappings[rowName] = options.colorGroups[colName]
      cellMappings.push({row: i, col: maxIndex, rowName: rowName, colName: colName, color: options.colorGroups[colName], value: sheet[i][maxIndex]})
    }
  }

  //Generate legendObj
  let colorFrequency =  Object.entries(colorMappings).reduce((accu, curr) => {
    let color = curr[1]
    if( accu[color] ) accu[color]++
    else accu[color] = 1
    return accu;
  }, {})

  let frequencySorted = Object.entries(colorFrequency).sort((a,b) => b[1] - a[1])
  let lbls = frequencySorted.map(elem => {
    let colname = Object.entries(options.colorGroups).find(entry => entry[1] == elem[0])[0]
    return {color: elem[0], label: colname || "UNKNOWN"}
  })

  legendObj.list = lbls

  return {
    type: options.strategy,
    colorMappings: colorMappings,
    cellMappings: cellMappings,
    legend: legendObj
  };

}

const maxSchemer = function(sheet, options){
  return conditionalSchemer(sheet, options, findMaxIndex)
}

const secondHighestSchemer = function(sheet, options){
  return conditionalSchemer(sheet, options, findSecondHighestValueIndex)
}


const choroplethSchemer = function(sheet, options){
  let isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);
  let parseCommaSeperatedValues = (string) => {
    if(typeof string !== 'string') return undefined;
    return [...new Set(string.trim().split(",").filter(elem => isNumeric(elem)).map(elem => parseFloat(elem)).sort((a,b) => a-b))]
  }

  let colorMappings = {};
  let cellMappings = []
  let bins = []
  let {refColumn, palette, colorGroups, intervalNumber, intervalMode} = options
  let choroplethBar = { title: "Default", list: [] };
  let refColName = sheet[0][refColumn];
  let userDefinedColor = colorGroups[refColumn]
  let colorRanges = palette || palette !== "none" ? palette : ["white", "black"];

  //Extract data from sheet
  let data = MatrixHelpers.getColumn(sheet, refColumn);
  data.splice(0,1); // delete first cell. It is column name
  let cleanDataSet = data.filter(elem => isNumeric(elem)).map(elem => parseFloat(elem));

  if(cleanDataSet.length < 2) { // no need to go further
    return {
      type: "choropleth",
      colorMappings: colorMappings,
      cellMappings: cellMappings,
      legend: choroplethBar,
      bins: ["-", "-", "-", "-", "-", "-"]
    }; 
  }

  let minValue = Math.floor(Stats.min(cleanDataSet))
  let maxValue = Math.ceil(Stats.max(cleanDataSet))

  // Generate Bins 
  if(options.intervalMode === "u"){
    let userBins = parseCommaSeperatedValues(options.userDefinedIntervals)
    bins = userBins.length >= 2 ? userBins : [minValue,maxValue];
  }else{
    // in quantile mode, if desired bin number has more items than actual data set, the returned bins maybe less numbers than the desired one.
    let rawBins = Stats.generateBins(cleanDataSet, intervalMode, intervalNumber) 
    //bins = cleanDataSet.length >= 2 ? rawBins.map(num => parseFloat((num).toFixed(1))) : new Array(intervalNumber+1).fill(0);
    bins = rawBins.map(num => parseFloat((num).toFixed(1))); // TODO format number 1M, 2.3K etc.
  }

  // construct color generator
  const colorGenerator = chroma.scale(colorRanges).classes(bins)

  // Generate colorMappings and cellMappings
  for(let i=1; i < sheet.length; i++){
    let value = sheet[i][refColumn];
    let rowName = sheet[i][0];
    if(typeof value == 'number'){
      let hexColor = colorGenerator(value).hex()
      colorMappings[rowName] = hexColor
      cellMappings.push({row: i, col: refColumn, rowName: rowName, colName: refColName, color: hexColor, value: value})
    }
  }

  // Generate chropleth bar obj
  choroplethBar.list = []
  for(let i=0; i<bins.length-1; i++){
    let [from, to] = [bins[i], bins[i+1]]
    //let color = colorGenerator.colors(intervalNumber)[i]
    let color = colorGenerator(from+(to-from)/2).hex()
    from = parseFloat(from.toFixed(1))
    to = parseFloat(to.toFixed(1))
    choroplethBar.list.push({color: color, range: [from,to]})
  }

  // if bins has any non numeric value erase it
  if(!bins.every(num => isNumeric(num))) {
    console.warn("bins have non numeric value", bins)
  }

  return {
    type: "choropleth",
    colorMappings: colorMappings,
    cellMappings: cellMappings,
    legend: choroplethBar,
    bins: bins
  };
}

const stringSimilaritySchemer = function(sheet, options){
  let colorMappings = {};
  let cellMappings = []
  let {refColumn, colorGroups} = options
  let uniqueColors = new Map()
  let frequency = new Map()

  for(let i=1; i < sheet.length; i++){
    let rowId = sheet[i][0]
    let cellValue = `${sheet[i][refColumn] || ""}`
    cellValue = cellValue?.toLowerCase()
    if( rowId && cellValue && typeof cellValue === 'string'){
      if(!uniqueColors.has(cellValue)){
        uniqueColors.set(cellValue, colorGroups[cellValue] || chroma.random().hex()) // random color not safe but enough for this job
      }
      colorMappings[rowId] = uniqueColors.get(cellValue)

      // generate cell mappings
      cellMappings.push({row: i, col: refColumn, rowName: rowId, colName: sheet[0][refColumn], color: uniqueColors.get(cellValue), value: cellValue})

      //calculate frequency
      if(frequency.has(cellValue)){
        frequency.set(cellValue, frequency.get(cellValue) + 1)
      }else {
        frequency.set(cellValue, 1)
      }
    }
  }

  //sort
  let sorted = Array.from(frequency).sort((a,b) => b[1] - a[1])

  //legend
  let legend = {
    title: "title",
    list: []
  }
  sorted.forEach(elem => {
    let cellValue = elem[0]
    legend.list.push({color: uniqueColors.get(cellValue), label: cellValue})
  })

  //update options.colorGroup in "localStorage"
  let newColorGroup = Array.from(uniqueColors).reduce((accumulator, current) => {
      accumulator[current[0]] = current[1];
      return accumulator;
    }, {});
  colorGroups = Object.assign(colorGroups, newColorGroup)
  options.colorGroups = colorGroups
  localStorage.setItem('settings', JSON.stringify(options))

  return {
    type: "stringSimilarity",
    colorMappings: colorMappings,
    cellMappings: cellMappings,
    legend: legend
  };
}


export default { choroplethSchemer, maxSchemer, secondHighestSchemer, stringSimilaritySchemer }