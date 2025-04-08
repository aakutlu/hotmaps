import { SVGHelper } from './svghelper/svghelper.js'

function blinkElement(elementId){
  let element = document.getElementById(elementId + "_chosen")
  element.classList.add("blink")
  setTimeout(()=>{
    let element = document.getElementById(elementId + "_chosen")
    element.classList.remove("blink")
  },2_000)
/*   element.addEventListener('animationEnd', function() {
    //this.style.animationPlayState = "paused";
    console.log("animation ended")
    this.classList.remove("blink")
  }); */
  void element.offsetWidth;
}

function colorMapping_Max(flatArray, options){
  let onlyDataCells = flatArray.filter(elem => elem.col !== 0 && elem.row !== 0)
  let result = Object.groupBy(onlyDataCells, ({rowHeader}) => rowHeader)

  Object.values(result).forEach((elem,i,arr) => {
    elem.sort((a,b) => b.value - a.value) // sort desc
    let max = elem[0]
    if(max.value)
      max.color = options.colorgroups[max.colHeader] || 'black'
  })
  return Object.values(result).flatMap(el => el)
}

// if cell values between 0-100 use this 
function colorMapping_Choropleth(flatArray, options){
  let onlyDataCells = flatArray.filter(elem => elem.col !== 0 && elem.row !== 0)
  let refColumn = typeof options.refColumn == 'string' ? options.refColumn : flatArray.find(el => el.col == 1).colHeader
  let refColor = options.colorgroups[refColumn]
  let [c1,c2] = [ chroma(refColor).brighten(2), chroma(refColor).darken(2) ]

  onlyDataCells.filter(el => el.colHeader == refColumn && el.value !==null && el.val !== '' ).forEach(el => {
    el.color = chroma.scale([c1, c2]).domain([0, 100])(el.value)
  })
  return onlyDataCells
}

function colorMapping_ChoroplethMinMax(flatArray, options){
  let onlyDataCells = flatArray.filter(elem => elem.col !== 0 && elem.row !== 0)
  let refColumn = typeof options.refColumn == 'string' ? options.refColumn : flatArray.find(el => el.col == 1).colHeader
  let refColor = options.colorgroups[refColumn]
  let [c1,c2] = [ chroma(refColor).brighten(2), chroma(refColor).darken(2) ]

  let min =  Math.min( ...onlyDataCells.filter(el => el.colHeader == refColumn && isFinite(el.value) && !!el.value ).map(el => parseInt(el.value)) ) 
  let max =  Math.max( ...onlyDataCells.filter(el => el.colHeader == refColumn && isFinite(el.value) && !!el.value ).map(el => parseInt(el.value)) ) 

  onlyDataCells.filter(el => el.colHeader == refColumn && el.value !==null && el.val !== '' ).forEach(el => {
    el.color = chroma.scale([c1, c2]).domain([min, max])(el.value)
  })
  return onlyDataCells
}


function matrixToFlatArray(matrix) {
  let flatArray = []
  for(let r = 0; r < matrix.length; r++ ){
    for(let c = 0; c < matrix[r].length; c++ ){
      flatArray.push({
        rowHeader: matrix[r][0],
        colHeader: matrix[0][c],
        row: r,
        col: c,
        value: matrix[r][c]
      })
    }
  }
  return flatArray;
}


function genColorMapping(matrix, options) {
  let flatArray = matrixToFlatArray(matrix)

  if (options.strategy === "max") {
    return colorMapping_Max(flatArray, options)
  }
  else if( options.strategy === 'secondHighestValue' ){
    return colorMapping_ChoroplethMinMax(flatArray, options)
  }
  else if( options.strategy === 'choropleth' ){
    return colorMapping_Choropleth(flatArray, options)
  }
  else if( options.strategy === 'choropleth2' ){
    return colorMapping_ChoroplethMinMax(flatArray, options)
  }

  else return []
}


class MapFeature {
  constructor(element) {
    this.element = element;
    this.defaultViewBox = element.getAttribute("viewBox");
    this.features = this.getFeatureIds().map(elemId => {
      let gElem = this.getElem(elemId)
      return {
        id: elemId,
        label: gElem.querySelector('text')?.textContent,
        title: gElem.querySelector('title')?.textContent,
      }
    })
  }
  getFeatureIds = function () {
    return Array.from(this.element.querySelectorAll("g#features > g")).map((elem) => elem.getAttribute("id"));
  };
  getElem = function (id) {
    return this.element.getElementById(id);
  };
  fillColor = function (id, color) {
    this.getElem(id)?.setAttribute("fill", color);
  };
  fillText = function (id, color) {
    this.getElem(id)?.querySelector("text")?.setAttribute("fill", color);
  };
  resetLabels = function(){
    this.features.forEach(el => {
      this.setText(el.id, el.label)
    })
  }
  setText = function (id, label) {
    let elem = this.getElem(id)?.querySelector("text")
    if(elem)
      elem.textContent = label
  };
  textMap = function (colorMappings, label='rowHeader') {
    colorMappings.filter(elem => elem.color).forEach((elem) => {
      this.setText(elem.rowHeader, elem.value);
    });
  };
  colorMap = function (colorMappings) {
    colorMappings.filter(elem => elem.color).forEach((elem) => {
      this.fillColor(elem.rowHeader, elem.color);
      //change text color in case of color contrast issue
      let intColor = chroma(`${elem.color}`).num();
      this.fillText(elem.rowHeader, intColor < 8_000_000 ? "white" : "black");
    });
  };
  updateLegend = function(colorMappings, dataArray){
    let [x,y,width,height] = this.element.getAttribute('viewBox').trim().split(/\s{1,}/).map((elem) => parseFloat(elem))
    let legendObj = {
      title: 'Parties',
      type: 'type1',
      list: []
    }

    //check if the container <g id="legend"/>  exist
    let legendContainer = this.element.querySelector("#legend")
    if (!legendContainer) {
      //this.element.insertAdjacentHTML("beforeend", `<g id="legend"></g>`);
      legendContainer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      legendContainer.setAttribute('id', 'legend')
      this.element.appendChild(legendContainer)
      //legendContainer = this.element.querySelector("#legend");
    }else{
      //Empty Legend Container
      legendContainer.replaceChildren();
    }

    let coloredItems = colorMappings.filter(el => el.color)
    let groupedItems = Object.groupBy(coloredItems, ({ colHeader }) => colHeader) 
    legendObj.list = Object.keys(groupedItems).map(key => {
      return {
        color: groupedItems[key][0].color,
        label: groupedItems[key][0].colHeader
      }
    })

    // add rect
    let bbox = this.element.querySelector("g#features").getBBox()
    let bbbox = {x:bbox.x, y:bbox.y, width:bbox.width, height:bbox.height}
    let id = "legend"
    let fill = 'none'
    let stroke = "red"
    let rect = SVGHelper.createElement("rect", {...{id,fill,stroke}, ...bbbox} );
    legendContainer.appendChild(rect)

    //add header
    let header = SVGHelper.generateHeader(this.element, "2024 Türkiye Genel Seçimleri", {scaleFactor: 1, align: 'top-center', gap: 0, widthRatio: .8 });
    //legendContainer.appendChild(header)

    //add bar
    let barArr = [
      {color: 'red', range: [0,9]}, 
      {color: 'orange', range: [10,19]}, 
      {color: 'yellow', range: [20,29]},
      {color: 'teal', range: [30,29]},
      {color: 'green', range: [40,29]},
      {color: 'purple', range: [50,29]},
      {color: 'crimson', range: [60,29]},
      {color: 'purple', range: [70,29]},
      {color: 'green', range: [80,29]},
      {color: 'teal', range: [90,99]},
    ];
    let cbar = SVGHelper.generateChoroplethBar(this.element,  barArr, {scaleFactor: 1, align: 'bottom-center', gap: 0, widthRatio: .5 });
    legendContainer.appendChild(cbar)

    //add type2
    let type2 = [
      {color: 'red', label: "0-9"},
      {color: 'orange', label: "10-19"},
      {color: 'yellow', label: "20-29"}
    ];
    let legendType2 = SVGHelper.generateLegendType2(this.element,  legendObj.list, {scaleFactor: 20, align: 'bottom-left', gap: 0});
    legendContainer.appendChild(legendType2)

    //add histogram
    let histogram = SVGHelper.generateHistogram(this.element, dataArray, {scaleFactor: 1, align: 'bottom-center', gap: 0, widthRatio: .5, expandSVG: false })
    //legendContainer.appendChild(histogram)

    let borderElem = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    borderElem.setAttribute('x', x)
    borderElem.setAttribute('y', y)
    borderElem.setAttribute('width', width)
    borderElem.setAttribute('height', height)
    borderElem.setAttribute('fill', 'none')
    borderElem.setAttribute('stroke', 'black')
    borderElem.setAttribute('stroke-width', 1)
    legendContainer.appendChild(borderElem)
    
  }
  
  resetColors = function () {
    this.getFeatureIds().forEach((id) => {
      this.fillColor(id, "silver");
      this.fillText(id, "black");
    });
  };
}

class TableFeature {
  constructor(hot) {
    this.hot = hot; //handsontable object
    this.element = document.querySelector("#jtable"); //container element
  }
  getCellValue = function (row, col) {};
  setCellData = function (row, col, value) {};
  findRowById(id) {
    let data = this.getData();
    return data
      .map((elem) => elem[0])
      .flat()
      .indexOf(id);
  }
  updateData = function (data) {
    this.hot.updateData(data);
    this.hot.render();
  };
  getData = function () {
    return this.hot.getData();
  };
  setCellClass = function (row, col, className) {
    this.hot.setCellMeta(row, col, "className", className);
  };
  _selectCell(row, col) {
    this.hot.selectCell(row, col, row, col, true);
    this.hot.updateSettings({
      cells: function (r, c, prop) {
        if (r == row || c == col) {
          return { className: "hot-focus" };
        }
      },
    });
  }
  focusRow = function (index) {
    this.hot.scrollViewportTo({ row: index, col: 1 });
  };
  focusCell = function (row, col) {
    //let selected = this.hot.getSelected() || [];
    this.hot.scrollViewportTo({ row, col });
  };
}


class LegendFeature{
  constructor(legendContainer){
    this.container = legendContainer
  }

  updateLegend = function(headers, settings){
    this.container.replaceChildren()
    //let colHeaders = BUNDLE.getColumnHeaders()
    headers.forEach(elem => {
      if(!settings.colorgroups[elem]){
        settings.colorgroups[elem] = chroma.random().hex();
      }
      this.container.insertAdjacentHTML('beforeend', `<span data-legend="${elem}" data-color="${settings.colorgroups[elem]}"> <span style="background-color: ${settings.colorgroups[elem]}"></span><span>${elem}</span> </span>`)
    })
    let COLORPICKER = document.getElementById("color-picker");
    // add listeners to  every legend for color picker 
    Array.from(this.container.children).forEach(elem => {
  
      // add event listener to change color of legend
      elem.firstElementChild.addEventListener('click', (event) => {
        window.lastSelected = event.target
        let rect = event.target.getBoundingClientRect();
        COLORPICKER.style.top = rect.bottom - 28 + "px";
        COLORPICKER.style.left = rect.left + "px";
        setTimeout(() => {
          COLORPICKER.value = window.lastSelected.parentElement.getAttribute('data-color')
          COLORPICKER.click();
        }, 50);
      })
  
      // add event listener to color map choropleth type
      elem.lastElementChild.addEventListener('click', (event) => {
        event.stopPropagation();
        let refColumn = event.target.parentElement.getAttribute('data-legend')
        if(  ['choropleth', 'choropleth2'].indexOf(settings.strategy) == -1){
          settings.strategy = 'choropleth'
        }
        settings.refColumn = refColumn
        

        // update select2 to choropleth
        let select2Strategy = document.getElementById('select-strategy')
        blinkElement("select_strategy")
        $(select2Strategy).val(settings.strategy).trigger('chosen:updated');
        
        //set border of selected legend
        Array.from(event.target.parentElement.parentElement.childNodes).forEach(elem => {
          elem.classList.remove('selected')
        })
        event.target.parentElement.classList.add('selected')
        window.BUNDLE.updateSystem(settings)
      })
    })
  }

}


class Bundle {
  constructor(hot, mapContainer, legendContainer, strategy) {
    this.tableFeature = new TableFeature(hot)
    this.mapFeature = new MapFeature(mapContainer)
    this.legendFeature = new LegendFeature(legendContainer, )
    this.legendContainer = legendContainer
    this.strategy = strategy;
    //this.setEventListeners();
    this.colorMappings = [
      { rowHeader: 'adana', color: '#FF0000', colHeader: 'col1', row: 2, col: 1},
      { rowHeader: 'istanbul', color: '#00FF00', colHeader: 'col2', row: 3, col: 2},
      { rowHeader: 'manisa', color: '#0000FF', colHeader: 'col3', row: 4, col: 3},
    ]
  }
  getData = function () {
    return this.tableFeature.getData();
  };
  getColumnHeaders = function () {
    return this.getRowByIndex(0).filter((elem) => elem);
  };
  getRowByIndex(rownum) {
    return this.tableFeature.getData()[rownum];
  }
  getColumnByIndex(colnum) {
    return this.tableFeature.getData().map((row) => row[colnum]);
  }
  updateData = function (data) {
    this.tableFeature.updateData(data);
  };

  updateSystem = function(options){
    let data = this.tableFeature.getData();
    this.colorMappings = genColorMapping(data, options);
    this.mapFeature.resetColors();
    this.mapFeature.colorMap(this.colorMappings);
    this.mapFeature.updateLegend(this.colorMappings, data.map(elem => elem[1]).slice(1) ||  []);

    let headers = data[0].filter((el,i,arr) => { return el && i != 0})
    setTimeout(() => {
      this.legendFeature.updateLegend(headers, options)
    },100)

    if(options.featureTitle == 'value') this.mapFeature.textMap(this.colorMappings);
    this.tableFeature.hot.render()
  }

/*  colorTable = function(options){
    let data = this.tableFeature.getData();
    let colorMappings = genColorMapping(data, options);
    this.tableFeature.colorTable(colorMappings)
  } */
 
/*   setEventListeners = function () {
    this.map.element.querySelectorAll("g#features g").forEach((group) => {
      group.addEventListener("click", (event) => {
        let id = event.target.parentNode.getAttribute("id");
        let row = this.table.findRowById(id);
        this.table._selectCell(row, 7);
        //this.table._selectRaw(id)
        //this.table.focusRow(row)
        //this.table.focusCell(row, 5)
        this.table.table.render();
      });
    });
  }; */
}


export { Bundle };
