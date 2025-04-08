import Mock from "./libraries/mock.js"
import MatrixHelpers from "./libraries/matrixhelpers.js"
import SVGHelper from "./libraries/svghelper/svghelper.js"
import {Maplib} from "./libraries/maplib.js"
import Schemers from './libraries/schemers.js'

let popperInstance = null
const COLORPICKER = document.getElementById("color-picker");
let lastSelected = null;


//----------------------
var mapLibObj = null
var handsOnTableObj = null
let cellMappings = null

let SETTINGS = {
  map: 'KKTC',
  strategy: 'max',             // max, secondHighestValue, choropleth1, choropleth1, stringSimilarity
  refColumn: 1,               // 0 || 'col1' || 
  featureTitle: 'rowHeader', // rowHeader || value || default
  intervalMode: "e", 
  intervalNumber: 10,
  palette: "Oranges",
  colorGroups: {
    col1: '#ffAA26',
    col2: '#ff0026',
    col3: '#f00726',
    akp: '#ffa726',
    chp: '#ff0000',
    dem: '#734d96',
    mem: '#185fa7',
    yrp: '#009599',
    mhp: '#610816'
  }
}

function syncSettings (obj = {}){
  SETTINGS = { ...SETTINGS, ...obj}
  localStorage.setItem('settings', JSON.stringify(SETTINGS))
}


Handsontable.renderers.registerRenderer('cellColorsRenderer', (instance, td, row, col, prop, value, cellProperties) => {
  Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cellProperties);
  let item = cellMappings?.find(el => !!el.color && el.row == row && el.col == col)
  if (item){
    td.style.background = chroma(item.color).hex() // .alpha(.8)
    td.style.fontWeight = 'bold';
    //td.style["-webkit-text-stroke"] =  ".01em whitesmoke"
    td.style["text-shadow"] =  "1px 1px 4px rgba(255, 255, 255, 1)"
  }
  /* TD.style.fontWeight = 'bold';
     TD.style.color = 'green';
     TD.style.background = '#d7f1e1'; 
  */
});

// handsontable object
handsOnTableObj = new Handsontable(document.querySelector("#jtable"),
{
  rowHeaders: true,
  colHeaders: true,
  columnSorting: true,
  colWidths: 60,
  startCols: 10,
  startRows: 30,
  minCols: 10,
  minRows: 30,
  minSpareCols: 6,
  minSpareRows: 20,
  autoWrapRow: true,
  fixedColumnsStart: 1,
  fixedRowsTop: 1,
  autoWrapCol: true,
  width: '500px',
  height: '100%',
  rowHeaderWidth: '200px',
  colHeaderHeight: '20px',
  outsideClickDeselects: true,
  className: 'htCenter',
  manualColumnResize: true,
  licenseKey: "non-commercial-and-evaluation", // for non-commercial use only
  colWidths: [200, 100, 100], // initial width of the first 3 columns
  colWidths: function(index){
    if(index == 0) return 110;
    return 50;
  },
  cells(row, col, prop) {
    const cellProperties = { readOnly: false /* , type: 'numeric' */};
    const visualRowIndex = this.instance.toVisualRow(row);
    const visualColIndex = this.instance.toVisualColumn(col);

    cellProperties.renderer = 'cellColorsRenderer'
    cellProperties.className = 'htCenter'

    if (row === 0){
      cellProperties.readOnly = false;
      cellProperties.type = 'text';
    } 

    if (col === 0){
      cellProperties.readOnly = true;
      cellProperties.type = 'text';
      cellProperties.className = 'htLeft'
    } 

 /*    if (visualRowIndex % 2 == 0) cellProperties.className = 'htCenter hot-even-odd'
    if (visualRowIndex % 2 == 1) cellProperties.className = 'htCenter' */

    return cellProperties;
  },
});

// after user clicks Sheet Column, change strategy to chropleth1
handsOnTableObj.addHook('afterSelectColumns', function(start,end,ch) {
  console.warn("afterSelectColumns", {start,end,ch})
  if(ch.col != 0){
    let refColumn = this.getData()[0][ch.col]
    SETTINGS.refColumn = refColumn
    if(  ['choropleth1', 'choropleth2', "stringSimilarity"].indexOf(SETTINGS.strategy) == -1)
      SETTINGS.strategy = 'choropleth1'  //TODO

    // update strategy select-box
    let select2Strategy = document.getElementById('select-strategy')
    $(select2Strategy).val(SETTINGS.strategy).trigger('chosen:updated');
  }
  //updateWholeSystem()

  setTimeout(()=> updateWholeSystem(),10) // !!! since this hook does not take effect immediately, add a little delay 
})

handsOnTableObj.addHook('afterDeselect', function(row, col, row2, col2) {
  console.log('afterSelection fired', row, col, row2, col2)
  //updateWholeSystem()
})

handsOnTableObj.addHook('afterSelection', function(row, col, row2, col2) {
  console.log('afterSelection fired', row, col, row2, col2)
})

// don't update empty cell inputs
handsOnTableObj.addHook('beforeChange', (changes, src) => {
  console.log('beforeChange', JSON.stringify(changes), src)
  
  changes.forEach((change,i,arr) => {
    let [row, prop, oldVal, newVal] = change
    if(newVal === '') arr[i] = null;
  })
})

// update map and legend after data change
handsOnTableObj.addHook('afterChange', (changes, src) => {
  console.log('afterChange', changes, src)
  updateWholeSystem()
})

// keep first row at top
handsOnTableObj.addHook('afterColumnSort', function() {
  this.rowIndexMapper.moveIndexes(this.toVisualRow(0), 0);
})
 



function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function downloadObjectAsCsv(twoDArray, exportName){
  let str = twoDArray.map(row => row.join(',')).join('\n')
  var dataStr = "data:text/csv;charset=utf-8," + str;
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
function downloadLinkAsCsv(link, filename="worksheet"){
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     link);
  downloadAnchorNode.setAttribute("download", filename + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function setTooltipListeners(){
  const tooltipItems = document.querySelectorAll("#map g#features > g")
  const tooltip = document.querySelector('#tooltip');
  const tooltipContent = document.querySelector('#tooltipcontent');
  
  tooltipItems.forEach(item => {
    item.addEventListener('mouseenter', function(event){
      let itemId = event.target.getAttribute('id');
      let data = BUNDLE._getRow(itemId)
      tooltipContent.replaceChildren();
      tooltipContent.insertAdjacentHTML('afterbegin', `<ul> ${data.map(elem => `<li> <span>${elem.name}</span>  <span>%${elem.value}</span> </li>`).join('\n')}</ul>`)
      popperInstance = Popper.createPopper(event.target, tooltip, {
        modifiers:[
          {
            name: 'offset',
            options: {offset: [0,5]}
          }
        ]
      });
      tooltip.setAttribute('data-show', '')
    })
    //item.addEventListener('focus', show(item))
    item.addEventListener('mouseleave', function(){
      tooltip.removeAttribute('data-show')
      popperInstance.destroy()
    })
    //item.addEventListener('blur', hide)
  })
}

// ***********************
// INITIALIZATION
// ***********************
window.addEventListener("load", async (event) => {
/*   setTimeout(()=>{
    setTooltipListeners();
  },500) */

  //settings
  SETTINGS = JSON.parse(localStorage.getItem('settings')) || SETTINGS

  // load selectBox Local Saves
  updateLocalStorageSelectBox()

  //update select2 Map default value
  let select2Map = document.getElementById('select-map')
  $(select2Map).val(SETTINGS.map).trigger('chosen:updated');

  // update select2 to choropleth
  let select2Strategy = document.getElementById('select-strategy')
  $(select2Strategy).val(SETTINGS.strategy).trigger('chosen:updated');

  // update select2 to IntervalNumber
  let select2IntervalNum = document.getElementById('select-intervals')
  $(select2IntervalNum).val(SETTINGS.intervalNumber).trigger('chosen:updated');

  // update select2 to IntervalMode
  let select2IntervalMode = document.getElementById('select-intervalMode')
  $(select2IntervalMode).val(SETTINGS.intervalMode).trigger('chosen:updated');


  // update select2 to palette
  let select2Palette = document.getElementById('select-custom-palette')
  select2Palette.replaceChildren()
  select2Palette.insertAdjacentHTML("beforeend",`<option value=""></option>`)
  select2Palette.insertAdjacentHTML("beforeend",`<option value="none">None(user defined)</option>`)
  Object.keys(chroma.brewer).forEach((colorCode,i) => {
    select2Palette.insertAdjacentHTML("beforeend",`<option value="${colorCode}">Brewer-${colorCode}</option>`)
  })
  $(select2Palette).val(SETTINGS.palette || "").trigger('chosen:updated');

  // load default map, legend, csv Template
  await loadMapTemplateDataUpdate(SETTINGS.map)
});

// ***********************
// FUNCTIONS
// ***********************

async function loadMapTemplateDataUpdate(mapId){

  let svgMapContainer = document.querySelector("#svg-container")
  let maplibOptions = {backgroundColor: 'whitesmoke', defaultFillColor: 'silver', defaultBorderColor: 'white', }
  mapLibObj = new Maplib(svgMapContainer, `svgmaps/${mapId}.svg`, maplibOptions)
  await mapLibObj.initialize();

  //load template table
  const resp = await fetch(`sheets/${mapId}.csv`);
  if (!resp.ok) {
    const message = `When downloading "${mapId}.csv", an Error has occured: ${resp.status}`;
    throw new Error(message);
  }
  const csvText = await resp.text();
  const data = Papa.parse(csvText).data
  let svgElement = document.querySelector('#svg-container svg')
  let legendContainer = document.querySelector('#legend-container')


  handsOnTableObj.updateData(data);
  updateWholeSystem()

}

function updateWholeSystem(){
  let schema = generateScheme(handsOnTableObj.getData(), SETTINGS)
  console.log(schema)
  mapLibObj.resetAllFeatureColors()
  mapLibObj.colorMap(schema.colorMappings)
  cellMappings = schema.cellMappings
  mapLibObj.updateLegend(schema.legend, SETTINGS)
  handsOnTableObj.render()
}

function generateScheme(sheet, options) {

  MatrixHelpers.clearEmptyColumns(sheet)
  MatrixHelpers.clearEmptyRows(sheet)
  MatrixHelpers.matrixNormalizeExceptLabels(sheet)

  //convert refColumn to integer in case it is String
  if(typeof options.refColumn === "string"){
    options.refColumn = sheet[0].indexOf(options.refColumn)
  }

  // Scenerios
  if (options.strategy === "max") {
    return Schemers.maxSchemer(sheet, options)
  }
  else if( options.strategy === 'secondHighestValue' ){
    return Schemers.secondHighestSchemer(sheet, options)
  }
  else if( options.strategy === 'choropleth1' ){
    return Schemers.choropleth1Schemer(sheet, options)
  }
  else if( options.strategy === 'choropleth2' ){
    return Schemers.choropleth2Schemer(sheet, options)
  }
  else if( options.strategy === 'stringSimilarity' ){
    return Schemers.stringSimilaritySchemer(sheet, options)
  }

  else return []
}



COLORPICKER.addEventListener("input", (event) => {
  if (window.lastSelected) {
    window.lastSelected.style.backgroundColor = event.target.value;
  }
},false);

COLORPICKER.addEventListener("change", (event) => {
  if (window.lastSelected) {
    let selectedColor = event.target.value
    let dataLegend = window.lastSelected.parentElement.getAttribute('data-legend')
    window.lastSelected.parentElement.setAttribute('data-color', selectedColor)
    SETTINGS.colorGroups[dataLegend] = selectedColor;

    syncSettings();
    updateWholeSystem();
  }
});

/* document.querySelectorAll("#column-legend-container > span").forEach((elem) => {
  elem.addEventListener("click", (event) => {
    lastSelected = event.target;
    let rect = event.target.getBoundingClientRect();
    COLORPICKER.style.top = rect.bottom - 28 + "px";
    COLORPICKER.style.left = rect.left + "px";
    setTimeout(() => {
      COLORPICKER.click();
    }, 50);
  });
}); */

function updateLocalStorageSelectBox(){
  let select2 = document.getElementById('select-local-storage')
  select2.replaceChildren();
  let maps = JSON.parse(localStorage.getItem('localsaves')) || [];
  let optionsHTML = `<option value=""></option>\n` + 
  maps
  .sort((a,b) => b.date - a.date)
  .map(elem => `<option value="${elem.id}">${elem.title + ' - ' + new Intl.DateTimeFormat('tr-TR').format(new Date(elem.date))}</option>`).join('\n')
  select2.insertAdjacentHTML('afterbegin', optionsHTML)
  $(select2).trigger("chosen:updated")
}




// ***********************
// SELECT BOXES (chosen)
// ***********************

$("#select-local-storage").chosen().change(async (event) => {
  let id = event.target.value;
  let localsaves = JSON.parse(localStorage.getItem("localsaves"));
  let save = localsaves.find(el => el.id == id)
  if(save){
    SETTINGS = save.settings
    await loadMapTemplateDataUpdate(SETTINGS.map)
  }
});

$("#select-map").chosen().change((event) => {
  let mapId = event.target.value
  syncSettings({map: mapId})
  loadMapTemplateDataUpdate(mapId)
});


$("#select-strategy").chosen().change((event) => {
  SETTINGS.strategy = event.target.value
  syncSettings({refColumn: 1})
  updateWholeSystem();
});

$("#select-intervals").chosen().change((event) => {
  SETTINGS.intervalNumber = parseInt(event.target.value)
  syncSettings()
  updateWholeSystem();
});


$("#select-intervalMode").chosen().change((event) => {
  SETTINGS.intervalMode = event.target.value
  syncSettings()
  updateWholeSystem();
});

$("#select-custom-palette").chosen().change((event) => {
  SETTINGS.palette = event.target.value
  syncSettings()
  updateWholeSystem();
});


/* document.querySelectorAll("input[name=featuretitle]").forEach(elem => {
  elem.addEventListener('click', (event) => {
    //SETTINGS.featureTitle = event.target.value
    //localStorage.setItem('settings', JSON.stringify(SETTINGS))
    syncSettings({featureTitle: event.target.value})
    BUNDLE.updateSystem(SETTINGS)
  })
}) */



// ***********************
// LOAD DATA
// ***********************

// Fill random data to "Hands on Table"
document.getElementById('fill-random-data').addEventListener('click', () => {
  let sheetData =  handsOnTableObj.getData()
  let columnLabels =  MatrixHelpers.getRow(sheetData, 0).filter(elem => elem)
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter(elem => elem)
  let svgElement = document.querySelector('#svg-container svg')
  let legendContainer = document.querySelector('#legend-container')
  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => { return Mock.integer(0,100)})
  handsOnTableObj.updateData(data)
  updateWholeSystem()
})

// Fill random data to "Hands on Table"
document.getElementById('fill-random-strings').addEventListener('click', () => {
  let sheetData =  handsOnTableObj.getData()
  let columnLabels =  MatrixHelpers.getRow(sheetData, 0).filter(elem => elem)
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter(elem => elem)
  let svgElement = document.querySelector('#svg-container svg')
  let legendContainer = document.querySelector('#legend-container')
  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => { return Mock.oneof(["abc", "def", "ghi", "jkl", "mno"])})
  handsOnTableObj.updateData(data)
  updateWholeSystem()
})

// Manualy Update System
document.getElementById('update-system').addEventListener('click', () => {
  updateWholeSystem()
})

// load .csv etc. from computer 
document.querySelector('#inputfile')?.addEventListener('change',  (event) => {
  const file = event.target.files[0]
  let svgElement = document.querySelector('#svg-container svg')
  let legendContainer = document.querySelector('#legend-container')

  file.text()
    .then((text) => {
      if(file.type == 'application/json'){
        let data = JSON.parse(text);
        if(BUNDLE){
          BUNDLE.updateData(data)
        }else{
          BUNDLE = new Bundle(hot, svgElement, legendContainer)
          window.BUNDLE = BUNDLE
          BUNDLE.updateData(data)
          BUNDLE.updateSystem(SETTINGS)
        }
      }else if(file.type == 'text/csv'){
        let data = Papa.parse(text).data
        MatrixHelpers.matrixNormalize(data)
        if(BUNDLE){
          BUNDLE.updateData(data)
        }else{
          BUNDLE = new Bundle(hot, svgElement, legendContainer)
          window.BUNDLE = BUNDLE
          BUNDLE.updateData(data)
          BUNDLE.updateSystem(SETTINGS)
        }
      }else{
        console.error('Unknown format: ', file.name)
      }
      
    })
    .catch((err) => {
      console.error(err)
    });
  });

  // load data from remote URL
  document.getElementById('fetch-data')?.addEventListener('click', (event) => {
    let url = document.getElementById('data-url').value
    fetch(url)
      .then(response => {
        return response.text()
      })
      .then(text => {
        let matrix = Papa.parse(text).data
        BUNDLE.updateData(matrix)
      })
      .catch(err => {
        console.error(err);
      });
  })






// ***********************
// SAVE DATA 
// ***********************

document.getElementById('saveToLocalStorage').addEventListener('click', (event) => {
  if(!BUNDLE){
    console.log('There is no data to save!')
    return
  }
  let name = window.prompt('Give a name to your save ...')
  let localsaves = localStorage.getItem('localsaves')
  try {
    localsaves = JSON.parse(localsaves)
    if (!localsaves) localsaves = []
  } catch (error) {
    console.log('There is no save. Creating...')
    localsaves = []
  }
  let mapdata = {
    id: Math.random().toString(36).substring(2, 8), //random-id
    settings: SETTINGS, 
    title: name,
    date: new Date().getTime(), //new Intl.DateTimeFormat('tr-TR').format(new Date()),
    data: BUNDLE.getData()
  }
  localsaves.push(mapdata)
  localStorage.setItem("localsaves", JSON.stringify(localsaves));
  updateLocalStorageSelectBox()
})






// ***********************
// DOWNLOAD DATA LISTENERS
// ***********************

document.getElementById('downloadAsCSV').addEventListener('click', (event) => {
  let data = handsOnTableObj.getData()
  console.log(data)
  MatrixHelpers.clearBottomMostEmptyRows(data)
  MatrixHelpers.clearRightMostEmptyColumns(data)
  downloadObjectAsCsv(data, 'worksheet')
})

document.getElementById('downloadTemplate').addEventListener('click', (event) => {
  downloadLinkAsCsv(`sheets/${SETTINGS.map}.csv`, `sheet-${SETTINGS.map}`)
})

document.getElementById('download-image-btn').addEventListener('click', (event) => {
  let svg = document.querySelector("#svg-container svg")
  SVGHelper.downloadSvgAsImage(svg, undefined, {width: 1000, height:1000})
})






// ***********************
// TEST LISTENERS
// ***********************

document.getElementById('log').addEventListener('click', (event) => {
  console.log( handsOnTableObj.getData() )
})

