

// let chroma = require("./node_modules/chroma-js/dist/chroma.cjs")

import MatrixHelpers from './matrixhelpers.js'
import { mapFrequencySorted } from './mischelpers.js';

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



// cell values must be between [0, 100]
const choropleth1Schemer = function(sheet, options){
  let colorMappings = {};
  let cellMappings = []
  let {refColumn, palette, intervalNumber, intervalMode} = options
  console.log({refColumn})

  let choroplethBar = {
    title: "Default",
    list: [
      {color: "white", label: "none", range: [0,10]},
      {color: "white", label: "none", range: [10,20]},
      {color: "white", label: "none", range: [20,30]},
      {color: "white", label: "none", range: [30,40]},
      {color: "white", label: "none", range: [40,50]},
      {color: "white", label: "none", range: [50,60]},
      {color: "white", label: "none", range: [60,70]},
      {color: "white", label: "none", range: [70,80]},
      {color: "white", label: "none", range: [80,90]},
      {color: "white", label: "none", range: [90,100]},
    ]
  }

  let colName = sheet[0][refColumn];
  let mainColor = palette[colName] ? palette[colName] : chroma.random().hex();
  let colorRanges = palette ? palette : ["white", mainColor, "black"];

  // Generate colorMappings
  for(let i=1; i < sheet.length; i++){
    let value = sheet[i][refColumn];
    let rowName = sheet[i][0];
    if(typeof value == 'number'){
      let hexColor = chroma.scale(colorRanges).domain([0,100])(value).hex()      
      colorMappings[rowName] = hexColor
      cellMappings.push({row: i, col: refColumn, rowName: rowName, colName: colName, color: hexColor, value: sheet[i][refColumn]})
    }
  }

  choroplethBar.list.forEach( (elem,i) => {
    elem.color = chroma.scale(colorRanges).domain([0,100]).colors(10)[i]
  } )

  return {
    type: "choropleth1",
    colorMappings: colorMappings,
    cellMappings: cellMappings,
    legend: choroplethBar
  };
}

// cell values must be between [0, 100]
const choropleth2Schemer = function(sheet, options){
  let colorMappings = {};
  let cellMappings = []
  let {refColumn, palette, colorGroups, intervalNumber, intervalMode} = options

  let choroplethBar = {
    title: "Default",
    list: []
  }

  let colName = sheet[0][refColumn];
  let userDefinedColor = colorGroups[refColumn]
  let colorRanges = palette !== "none" ? palette : ["white", userDefinedColor, "black"];

  const data = MatrixHelpers.getColumn(sheet, refColumn)
  data.splice(0,1)
  let boundaries = chroma.limits(data, intervalMode, intervalNumber);
  console.log({boundaries})
  const colorGenerator = chroma.scale(colorRanges).classes(boundaries)

  // Generate colorMappings
  for(let i=1; i < sheet.length; i++){
    let value = sheet[i][refColumn];
    let rowName = sheet[i][0];
    if(typeof value == 'number'){
      let hexColor = colorGenerator(value).hex()
      colorMappings[rowName] = hexColor
      cellMappings.push({row: i, col: refColumn, rowName: rowName, colName: colName, color: hexColor, value: value})
    }
  }

  // Generate chropleth bar obj
  choroplethBar.list = []
  for(let i=0; i<intervalNumber; i++){
    let color = colorGenerator.colors(intervalNumber)[i]
    let [from, to] = [boundaries[i], boundaries[i+1]]
    from = parseFloat(from.toFixed(1))
    to = parseFloat(to.toFixed(1))
    choroplethBar.list.push({color: color, range: [from,to]})
  }
  if(!boundaries.every(elem => isFinite(elem))) {
    choroplethBar.list = [] 
  }
  console.warn("choroplethBar", {choroplethBar})

  return {
    type: "choropleth2",
    colorMappings: colorMappings,
    cellMappings: cellMappings,
    legend: choroplethBar
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
    let cellValue = sheet[i][refColumn]
    if( rowId && cellValue ){
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


export default { maxSchemer, secondHighestSchemer, choropleth1Schemer, choropleth2Schemer, stringSimilaritySchemer }