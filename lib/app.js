import { Mock } from "./mock.js"
import { Bundle } from "./feature.js"
import { matrixNormalize } from "./helpers.js"
import Zoomer from "./zoomer.js"

let BUNDLE = null
window.BUNDLE = null;
let popperInstance = null
const COLORPICKER = document.getElementById("color-picker");
let lastSelected = null;

let SETTINGS = {
  map: 'KKTC',
  strategy: 'max',             // 
  refColumn: 1,               // 0 || 'col1' || 
  featureTitle: 'rowHeader', // rowHeader || value || default
  colorgroups: {
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
  let item = BUNDLE?.colorMappings?.find(el => !!el.color && el.row == row && el.col == col)
  if (item){
    td.style.background = chroma(item.color).alpha(.8).hex()
  }
  /* TD.style.fontWeight = 'bold';
     TD.style.color = 'green';
     TD.style.background = '#d7f1e1'; 
  */
});

// handsontable object
const hot = new Handsontable(document.querySelector("#jtable"),
{
  rowHeaders: true,
  colHeaders: true,
  columnSorting: true,
  colWidths: 60,
  startCols: 20,
  startRows: 100,
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
    const cellProperties = { readOnly: false , type: 'numeric'};
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

// color map to choropleth style
hot.addHook('afterSelectColumns', function(start,end,ch) {
  if(ch.col != 0){
    let refColumn = this.getData()[0][ch.col]
    SETTINGS.refColumn = refColumn
    if(  ['choropleth', 'choropleth2'].indexOf(SETTINGS.strategy) == -1)
      SETTINGS.strategy = 'choropleth'
    BUNDLE.updateSystem(SETTINGS)
    // update select2 to choropleth
    let select2Strategy = document.getElementById('select-strategy')
    $(select2Strategy).val(SETTINGS.strategy).trigger('chosen:updated');
  }
})
hot.addHook('afterDeselect', function() {
  //SETTINGS.strategy = 'max'
  BUNDLE.updateSystem(SETTINGS)
})

hot.addHook('afterSelection', function(row, col, row2, col2) {
  console.log('afterSelection fired', row, col, row2, col2)
})

// dont update empty cell inputs
hot.addHook('beforeChange', (changes, src) => {
  console.log('beforeChange', JSON.stringify(changes), src)
  
  changes.forEach((change,i,arr) => {
    let [row, prop, oldVal, newVal] = change
    if(newVal === '') arr[i] = null;
  })
})

// update map and legend after data change
hot.addHook('afterChange', (changes, src) => {
  console.log('afterChange', changes, src)
  BUNDLE.updateSystem(SETTINGS)
})

// keep first row at top
hot.addHook('afterColumnSort', function() {
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

function setTooltipListeners(){
  console.log('setTooltipListeners')
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

  // load default map, legend, csv Template
  await loadMap(SETTINGS.map)
});

// ***********************
// FUNCTIONS
// ***********************

async function loadMap(mapId){
    //first load map
  const response = await fetch(`svgmaps/${mapId}.svg`);
  if (!response.ok) {
    const message = `An Error has occured: ${response.status}`;
    throw new Error(message);
  }
  const svg = await response.text();
  document.querySelector("#map").replaceChildren()
  document.querySelector("#map").insertAdjacentHTML("beforeend", svg);
  console.log("turkiye.svg loaded");

  //load template table
  const resp = await fetch(`sheets/${mapId}.csv`);
  if (!resp.ok) {
    const message = `An Error has occured: ${resp.status}`;
    throw new Error(message);
  }
  const csvText = await resp.text();
  const data = Papa.parse(csvText).data
  let svgElement = document.querySelector('#map svg')
  let legendContainer = document.querySelector('#legend-container')

  // vector-effect="non-scaling-stroke"
  let pathElems = svgElement.querySelectorAll('path')
  Array.from(pathElems).forEach(elem => {
    elem.setAttribute('vector-effect', 'non-scaling-stroke')
  })

  // ZOOMER
  let btn1 = document.getElementById("zoomer-in");
  let btn2 = document.getElementById("zoomer-out");
  let btn3 = document.getElementById("zoomer-default");
  let myZoomer = new Zoomer(svgElement, { zoominBtn: btn1, zoomoutBtn: btn2, zoomDefaultBtn: btn3 });

  BUNDLE = new Bundle(hot, svgElement, legendContainer)
  window.BUNDLE = BUNDLE
  BUNDLE.updateData(data)
  syncSettings({ map: mapId})
  BUNDLE.updateSystem(SETTINGS)
  //updateLegend();
  console.log("turkiye.csv loaded");
}



COLORPICKER.addEventListener("input",(event) => {
  if (window.lastSelected) {
    window.lastSelected.style.backgroundColor = event.target.value;
  }
},false);

COLORPICKER.addEventListener("change", (event) => {
  console.log(lastSelected)
  if (window.lastSelected) {
    let dataLegend = window.lastSelected.parentElement.getAttribute('data-legend')
    let selectedColor = event.target.value
    console.log('asdsa')
    console.log(`%c${selectedColor}`, `background: ${selectedColor}`);
    window.lastSelected.parentElement.setAttribute('data-color', selectedColor)
    SETTINGS.colorgroups[dataLegend] = selectedColor;
    //save color schema to LocalStorage
    //localStorage.setItem('settings', JSON.stringify(SETTINGS))
    syncSettings();
    //update map
    BUNDLE.updateSystem(SETTINGS)
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



// ************  SELECT BOXES ( select2 )***********

$("#select-map").chosen().change((event) => {
  loadMap(event.target.value)
});


$("#select-strategy").chosen().change((event) => {
  SETTINGS.strategy = event.target.value
  //SETTINGS.refColumn = 1;
  //localStorage.setItem('settings', JSON.stringify(SETTINGS))
  syncSettings({refColumn: 1})
  BUNDLE.updateSystem(SETTINGS)
});

$("#select-local-storage").chosen().change((event) => {
  console.log("selected Value:", event.target.value);
});

document.querySelectorAll("input[name=featuretitle]").forEach(elem => {
  elem.addEventListener('click', (event) => {
    //SETTINGS.featureTitle = event.target.value
    //localStorage.setItem('settings', JSON.stringify(SETTINGS))
    syncSettings({featureTitle: event.target.value})
    BUNDLE.updateSystem(SETTINGS)
  })
})


// *************  LOAD DATA  **********

// load random party data
document.getElementById('load-random-data').addEventListener('click', () => {
  const data = Mock.genMockData();
  let svgElement = document.querySelector('#map svg')
  let legendContainer = document.querySelector('#legend-container')
  BUNDLE = new Bundle(hot, svgElement, legendContainer);
  window.BUNDLE = BUNDLE
  BUNDLE.updateData(data)
  BUNDLE.updateSystem(SETTINGS)
})

// fill in the blanks
document.getElementById('fill-random-data').addEventListener('click', () => {
  let rows = BUNDLE.getRowByIndex(0).filter(elem => elem)
  let cols = BUNDLE.getColumnByIndex(0).filter(elem => elem)
  let svgElement = document.querySelector('#map svg')
  let legendContainer = document.querySelector('#legend-container')
  const data = Mock.genMatrix(cols, rows)
  BUNDLE = new Bundle(hot, svgElement, legendContainer);
  window.BUNDLE = BUNDLE
  BUNDLE.updateData(data)
  BUNDLE.updateSystem(SETTINGS)
})

//manualy color map
document.getElementById('color-map').addEventListener('click', () => {
  BUNDLE.updateSystem(SETTINGS)
  hot.render();
  //BUNDLE.colorTable(SETTINGS)
})

// load .csv etc. from computer 
document.querySelector('#inputfile').addEventListener('change',  (event) => {
  const file = event.target.files[0]
  console.log(file, file.name )
  let svgElement = document.querySelector('#map svg')
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
        matrixNormalize(data)
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
  document.getElementById('fetch-data').addEventListener('click', (event) => {
    let url = document.getElementById('data-url').value
    fetch(url)
      .then(response => {
        return response.text()
      })
      .then(text => {
        console.log(text)
        let matrix = Papa.parse(text).data
        console.log(matrix)
        console.log(BUNDLE)
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
// DOWNLOAD DATA 
// ***********************

document.getElementById('downloadAsCSV').addEventListener('click', (event) => {
  let data = BUNDLE.getData()
  data.unshift(BUNDLE.columns)
  downloadObjectAsCsv(data, 'file')
})
document.getElementById('downloadTemplate').addEventListener('click', (event) => {
  let data = BUNDLE.getData()
  data = data.map(elem => [elem[0]])
  downloadObjectAsCsv(data, 'file')
})
document.getElementById('downloadAsJSON').addEventListener('click', (event) => {
  let data = BUNDLE.getData()
  console.log(data)
  downloadObjectAsJson(data, 'file')
})


// ========================
// TEST
// ========================

document.getElementById('log').addEventListener('click', (event) => {
  console.log( hot.getData() )
})

