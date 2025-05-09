import Mock from "./libraries/mock.js";
import MatrixHelpers from "./libraries/matrixhelpers.js";
import SVGHelper from "./libraries/svghelper/svghelper.js";
import { Maplib } from "./libraries/maplib.js";
import Schemers from "./libraries/schemers.js";
import Stats from "./libraries/stats.js";

let popperInstance = null;
const COLORPICKER = document.getElementById("color-picker");
let lastSelected = null;

//----------------------
var mapLibObj = null;
var handsOnTableObj = null;
let cellMappings = null;

let SETTINGS = {
  map: "US",
  strategy: "choropleth", // max, secondHighestValue, choropleth1, choropleth1, stringSimilarity
  refColumn: 2, // 0 || 'col1' ||
  featureTitle: "rowHeader", // rowHeader || value || default
  intervalMode: "e",
  userDefinedIntervals: "0,50,100",
  bins: [],
  intervalNumber: 10,
  palette: "Oranges",
  allowSheetColoring: true, //todo
  includeCityLabel: "none", //none, cityname, cellvalue
  includeLegend: true,
  /* show_citynames: false, */
  colorGroups: {
    col1: "orange",
    col2: "crimson",
    col3: "teal",
  },
};

function syncSettings(obj = {}) {
  SETTINGS = { ...SETTINGS, ...obj };
  localStorage.setItem("settings", JSON.stringify(SETTINGS));
}

Handsontable.renderers.registerRenderer("cellColorsRenderer", (instance, td, row, col, prop, value, cellProperties) => {
  // Render sheets own data
  Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cellProperties);

  // Render Column Header Colors
  if (["max", "secondHighestValue"].includes(SETTINGS.strategy) && row === 0 && SETTINGS.colorGroups[value]) {
    td.style.background = SETTINGS.colorGroups[value];
  }

  if (!SETTINGS.allowSheetColoring) return;

  let item = cellMappings?.find((el) => !!el.color && el.row == row && el.col == col);

  if (item && ["max", "secondHighestValue"].includes(SETTINGS.strategy)) {
    //td.style.background = chroma(item.color).hex() // .alpha(.8)
    td.style.color = chroma(item.color).hex();
    td.style.fontWeight = "bold";
    td.style.textDecoration = "underline";
    //td.style["text-shadow"] =  "1px 1px 4px rgba(255, 255, 255, 1)"
  }

  if (item && ["choropleth", "stringSimilarity"].includes(SETTINGS.strategy)) {
    td.style.background = chroma(item.color).hex(); // .alpha(.8)
    td.style.fontWeight = "bold";
    td.style["text-shadow"] = "1px 1px 4px rgba(255, 255, 255, 1)";
    //td.style.color = chroma(item.color).hex()
    //td.style.textDecoration = 'underline';
  }

  if (["choropleth", "stringSimilarity"].includes(SETTINGS.strategy) && row === 0 && col === SETTINGS.refColumn) {
    //td.style.background = chroma(item.color).hex(); // .alpha(.8)
    td.style.fontWeight = "bold";
    //td.style["text-shadow"] = "1px 1px 4px rgba(255, 255, 255, 1)";
    //td.style.color = chroma(item.color).hex()
    td.style.textDecoration = 'underline';
  }

  /* TD.style.fontWeight = 'bold';
     TD.style.color = 'green';
     TD.style.background = '#d7f1e1'; 
  */
});

// handsontable object
handsOnTableObj = new Handsontable(document.querySelector("#jtable"), {
  rowHeaders: true,
  colHeaders: true,
  columnSorting: true,
  /* colWidths: 60, */
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
  width: "500px",
  height: "100%",
  rowHeaderWidth: "200px",
  colHeaderHeight: "20px",
  outsideClickDeselects: true,
  className: "htCenter",
  manualColumnResize: true,
  licenseKey: "non-commercial-and-evaluation", // for non-commercial use only
/*   colWidths: [100, 100], // initial width of the first 3 columns
  colWidths: function (index) {
    if (index == 0) return 60;
    if (index == 1) return 120;
    return 50;
  }, */
  cells(row, col, prop) {
    const cellProperties = { readOnly: false /* , type: 'numeric' */ };
    const visualRowIndex = this.instance.toVisualRow(row);
    const visualColIndex = this.instance.toVisualColumn(col);

    cellProperties.renderer = "cellColorsRenderer";
    cellProperties.className = "htCenter";

    if (row === 0) {
      cellProperties.readOnly = false;
      cellProperties.type = "text";
    }

    if (col === 0) {
      cellProperties.readOnly = false;
      cellProperties.type = "text";
      cellProperties.className = "htLeft";
    }

    /*    if (visualRowIndex % 2 == 0) cellProperties.className = 'htCenter hot-even-odd'
    if (visualRowIndex % 2 == 1) cellProperties.className = 'htCenter' */

    return cellProperties;
  },
});

// after user clicks Sheet Column, change strategy to chropleth1
handsOnTableObj.addHook("afterSelectColumns", function (start, end, ch) {
  console.warn("afterSelectColumns", { start, end, ch });
  if (ch.col != 0) {
    let refColumn = this.getData()[0][ch.col];
    SETTINGS.refColumn = refColumn;
    if (["choropleth", "stringSimilarity"].includes(SETTINGS.strategy)) SETTINGS.strategy = "choropleth"; //TODO

    // update strategy select-box
    let select2Strategy = document.getElementById("select-strategy");
    $(select2Strategy).val(SETTINGS.strategy).trigger("chosen:updated");
  }
  //updateWholeSystem()

  setTimeout(() => updateWholeSystem(), 10); // !!! since this hook does not take effect immediately, add a little delay
});



handsOnTableObj.addHook("afterDeselect", function (row, col, row2, col2) {
  console.log("afterDeselect fired", row, col, row2, col2);
  //updateWholeSystem()
});




handsOnTableObj.addHook("afterSelection", function (row, col, row2, col2) {
  console.log("afterSelection fired", row, col, row2, col2);

  let cellValue = handsOnTableObj.getDataAtCell(row, col);
  if(typeof cellValue !== 'string') return;

  cellValue = cellValue.toLowerCase();

  if(["choropleth", "stringSimilarity"].includes(SETTINGS.strategy) && row === 0 && col !== 0){
    SETTINGS.refColumn = col;
    syncSettings();
    updateWholeSystem();
  }

  else if(["max", "secondHighestValue"].includes(SETTINGS.strategy) && (row === 0 && row === row2 && col === col2) && col !== 0 ){
    let selectedCell = handsOnTableObj.getCell(row, col);
    ColorPicker.fire(selectedCell, {}, (colorcode) => {
      //console.log(`%c${colorcode}`, `background-color: ${colorcode}`)
      console.log([cellValue, colorcode]);
      SETTINGS.colorGroups[cellValue] = colorcode;
      syncSettings();
      updateWholeSystem();
    });
  }

  else if(["stringSimilarity"].includes(SETTINGS.strategy) && col === SETTINGS.refColumn && row !== 0){
    let selectedCell = handsOnTableObj.getCell(row, col);
    ColorPicker.fire(selectedCell, {}, (colorcode) => {
      //console.log(`%c${colorcode}`, `background-color: ${colorcode}`)
      console.log([cellValue, colorcode]);
      SETTINGS.colorGroups[cellValue] = colorcode;
      syncSettings();
      updateWholeSystem();
    });
  }

});

// don't update empty cell inputs
handsOnTableObj.addHook("beforeChange", (changes, src) => {
  console.log("beforeChange", JSON.stringify(changes), src);

  changes.forEach((change, i, arr) => {
    let [row, prop, oldVal, newVal] = change;
    if (newVal === "") arr[i] = null;
  });
});

// update map and legend after data change
handsOnTableObj.addHook("afterChange", (changes, src) => {
  console.log("afterChange", changes, src);
  updateWholeSystem();
});

// keep first row at top
handsOnTableObj.addHook("afterColumnSort", function () {
  this.rowIndexMapper.moveIndexes(this.toVisualRow(0), 0);
});

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function downloadObjectAsCsv(twoDArray, exportName) {
  let str = twoDArray.map((row) => row.join(",")).join("\n");
  var dataStr = "data:text/csv;charset=utf-8," + str;
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
function downloadLinkAsCsv(link, filename = "worksheet") {
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", link);
  downloadAnchorNode.setAttribute("download", filename + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function setTooltipListeners() {
  const tooltipItems = document.querySelectorAll("#map g#features > g");
  const tooltip = document.querySelector("#tooltip");
  const tooltipContent = document.querySelector("#tooltipcontent");

  tooltipItems.forEach((item) => {
    item.addEventListener("mouseenter", function (event) {
      let itemId = event.target.getAttribute("id");
      let data = BUNDLE._getRow(itemId);
      tooltipContent.replaceChildren();
      tooltipContent.insertAdjacentHTML(
        "afterbegin",
        `<ul> ${data.map((elem) => `<li> <span>${elem.name}</span>  <span>%${elem.value}</span> </li>`).join("\n")}</ul>`
      );
      popperInstance = Popper.createPopper(event.target, tooltip, {
        modifiers: [
          {
            name: "offset",
            options: { offset: [0, 5] },
          },
        ],
      });
      tooltip.setAttribute("data-show", "");
    });
    //item.addEventListener('focus', show(item))
    item.addEventListener("mouseleave", function () {
      tooltip.removeAttribute("data-show");
      popperInstance.destroy();
    });
    //item.addEventListener('blur', hide)
  });
}

// ***********************
// INITIALIZATION
// ***********************
window.addEventListener("load", async (event) => {
  //settings
  let locale = navigator.language || navigator.userLanguage;
  if(locale){
    //SETTINGS.map = locale.split("-")[0].toUpperCase();
  }

  SETTINGS = JSON.parse(localStorage.getItem("settings")) || SETTINGS;
  SETTINGS.userDefinedIntervals = "";
  syncSettings();

  console.log("%cSettings", "color: red; font-size: 14px");
  console.log(SETTINGS);

  updateUserInputElements();

  // load default map, legend, csv Template
  await loadMapTemplateDataUpdate(SETTINGS.map);
});


// ***********************
// FUNCTIONS
// ***********************

async function loadMapTemplateDataUpdate(mapId) {
  let svgMapContainer = document.querySelector("#svg-container");
  let maplibOptions = { /* backgroundColor: 'whitesmoke',  */ defaultFillColor: "silver", defaultBorderColor: "white" };
  mapLibObj = new Maplib(svgMapContainer, `svgmaps/${mapId}.svg`, maplibOptions);
  await mapLibObj.initialize();

  //load template table
  const resp = await fetch(`sheets/${mapId}.csv`, { "Cache-Control": "no-cache" });
  if (!resp.ok) {
    const message = `When downloading "${mapId}.csv", an Error has occured: ${resp.status}`;
    throw new Error(message);
  }
  const csvText = await resp.text();
  const data = Papa.parse(csvText).data;
  let svgElement = document.querySelector("#svg-container svg");
  let legendContainer = document.querySelector("#legend-container");

  handsOnTableObj.updateData(data);
  updateWholeSystem();
}

function updateHistogram(dataset) {
  if (!dataset || dataset.length <= 1) return;
  //const dataset1 = Stats.generateExponentialSamples(.001,10_000);
  const intervals = Stats.generateEqualIntervals(dataset, 40);
  const frequencyObjList = Stats.generateFrequencyArray(dataset, intervals);

  // Prepare data for Plotly
  const rangeIdentifiers = [];
  const frequencyNumbers = [];
  frequencyObjList.forEach((elem) => {
    let {range: [start, end], frequency } = elem;
    [start, end] = [Stats.trimDecimal(start, 1), Stats.trimDecimal(end, 1)];
    rangeIdentifiers.push(`${start}`); // gens something like that [0,1,2,3,]
    frequencyNumbers.push(frequency);
  });

  const trace = {
    x: rangeIdentifiers,
    y: frequencyNumbers,
    type: "bar", // Vertical bar chart
    marker: {
      color: "silver",//chroma.scale(SETTINGS.palette).classes(intervals).colors(frequencyNumbers.length), //"rgba(182, 54, 139, 0.6)", // Optional: customize bar color
      /*       line: {
        color: "rgba(75, 192, 192, 1)",
        width: 0,
      }, */
    },
  };

  const layout = {
    margin: { l: 20, r: 10, t: 10, b: 15 },
    title: {
      text: "", //Title
      x: 0.5, // Center the title
      xanchor: "center",
    },
    xaxis: {
      title: "Values",
      tickmode: "auto", //possible values => "linear", "auto", "array"
      nticks: 6,
      visible: true,
      zeroline: true,
      //tickvals: Object.keys(frequency),
      //ticktext: Object.keys(frequency), // Ensure clean labels
    },
    yaxis: {
      title: "Frequency",
      tickmode: "auto",
      nticks: 3,
      visible: true, // Hide y-axis labels and ticks
      zeroline: true, // Remove y-axis line
      //dtick: findClosestInSeries(Stats.findMax(frequencyNumbers1) / 10), // Ensure integer ticks for frequency
    },
    showlegend: false,
    showTitle: false,
    bargap: ".1px",
    plot_bgcolor: "rgba(0,0,0,0)", // Transparent plot background
    paper_bgcolor: "rgba(0,0,0,0)", // Transparent paper background
    autosize: true, // Fit to container
    template: "none", // Remove default styling
  };
  Plotly.newPlot("histogramContainer", [trace], layout, { staticPlot: true, displayModeBar: false });
}


function updateHistogramBins(dataset, bins) {
  if (!dataset || dataset.length <= 2) return;

  const frequencyObjList = Stats.generateFrequencyArray(dataset, bins);

  // Prepare data for Plotly
  const rangeIdentifiers = [];
  const frequencyNumbers = [];
  frequencyObjList.forEach((elem) => {
    let {range: [start, end], frequency } = elem;
    [start, end] = [Stats.trimDecimal(start, 1), Stats.trimDecimal(end, 1)];
    rangeIdentifiers.push(start); // gens something like that [0,1,2,3,]
    frequencyNumbers.push(frequency);
  });

  const trace = {
    x: rangeIdentifiers,
    y: frequencyNumbers,
    type: "bar", // Vertical bar chart
    marker: {
      color: "rgb(141, 150, 150)",
    },
  };

  const layout = {
    margin: { l: 20, r: 10, t: 10, b: 15 },
    title: {
      text: "", //Title
      x: 0.5, // Center the title
      xanchor: "center",
    },
    xaxis: {
      title: "Values",
      tickmode: "auto", //possible values => "linear", "auto", "array"
      nticks: 6,
      visible: true,
      zeroline: true,
      //tickvals: Object.keys(frequency),
      //ticktext: Object.keys(frequency), // Ensure clean labels
    },
    yaxis: {
      title: "Frequency",
      tickmode: "auto",
      nticks: 4,
      visible: true, // Hide y-axis labels and ticks
      zeroline: true, // Remove y-axis line
      //dtick: findClosestInSeries(Stats.findMax(frequencyNumbers1) / 10), // Ensure integer ticks for frequency
    },
    showlegend: false,
    showTitle: false,
    bargap: ".1px",
    plot_bgcolor: "rgba(0,0,0,0)", // Transparent plot background
    paper_bgcolor: "rgba(0,0,0,0)", // Transparent paper background
    autosize: true, // Fit to container
    template: "none", // Remove default styling
  };
  Plotly.newPlot("histogramContainer", [trace], layout, { staticPlot: true, displayModeBar: false });
}

function updateWholeSystem() {
  console.log("%c--------------------------updateWholeSystem()", `background-color: ${chroma.random().hex()};`);
  let sheet = handsOnTableObj.getData();
  let schema = generateScheme(sheet, SETTINGS);
  console.log(schema.dataAnalysis);
  mapLibObj.resetAllFeatureColors();
  mapLibObj.colorMap(schema.colorMappings);
  cellMappings = schema.cellMappings;
  //console.log(cellMappings);
  mapLibObj.emptyLegendContainer();
  if (SETTINGS.includeLegend) mapLibObj.updateLegend(schema.legend, SETTINGS);

  // update city labels
  let showLabel = {
    cityname: () => mapLibObj.labelsCityNames(),
    cellvalue: () => mapLibObj.labelsMap(cellMappings),
    none: () => mapLibObj.labelsRemove(),
    undefined: () => console.warn("not defined"),
  };
  let labelIdentifier = SETTINGS.includeCityLabel;
  showLabel[labelIdentifier]();

  SETTINGS.bins = schema.bins;
  syncSettings()

  let analysis = {}

  // update histogram
  if ("choropleth" === SETTINGS.strategy) {
    let fulldataset = MatrixHelpers.getColumn(sheet, SETTINGS.refColumn);
    let cleandataset = fulldataset.filter((num) => MatrixHelpers.isConvertibleToNumber(num)).map(Number);
    //SETTINGS.bins = SETTINGS.bins.map(num => Stats.trimDecimal(num, 1))
    updateHistogram(cleandataset);
    analysis = cleandataset.length >= 2 ? Stats.dataAnalysis(cleandataset) : {};
  }

  document.querySelector("#output-mean").textContent = analysis.mean
  document.querySelector("#output-sum").textContent = analysis.sum
  document.querySelector("#output-max").textContent = analysis.max
  document.querySelector("#output-min").textContent = analysis.min
  document.querySelector("#output-variance").textContent = analysis.variance
  document.querySelector("#output-skewness").textContent = analysis.skewness

  handsOnTableObj.render();
  updateUserInputElements();
}


function updateUserInputElements() {

  //update SelectBoxes
  updateLocalStorageSelectBox();
  $("#select-map").val(SETTINGS.map).trigger("chosen:updated");
  $("#select-strategy").val(SETTINGS.strategy).trigger("chosen:updated");
  $("#select-intervalMode").val(SETTINGS.intervalMode).trigger("chosen:updated");
  $("#select-custom-palette").val(SETTINGS.palette || "").trigger("chosen:updated");

  //update Checkbox "allowSheetColoring" to saved (or default)
  let checkbox1 = document.querySelector("#sheet_coloring_option");
  SETTINGS.allowSheetColoring ? (checkbox1.checked = true) : (checkbox1.checked = false);

  //update Checkbox "includeLegend" to saved (or default)
  let checkbox2 = document.querySelector("#legend_option");
  SETTINGS.includeLegend ? (checkbox2.checked = true) : (checkbox2.checked = false);

  //update RADIO BUTTONS  "includeCityLabel" to saved (or default)
  let radio1 = document.querySelector("#radio1");
  let radio2 = document.querySelector("#radio2");
  let radio3 = document.querySelector("#radio3");
  //let radios = document.querySelectorAll("input[name=preferred_city_labels]")
  if (SETTINGS.includeCityLabel === "none") radio1.checked = true;
  else if (SETTINGS.includeCityLabel === "cityname") radio2.checked = true;
  else if (SETTINGS.includeCityLabel === "cellvalue") radio3.checked = true;

  //-----------------------------------
  // Disable Some of SelectBoxes
  //----------------------------------

  // disable some input elements
  if ( ["max", "secondHighestValue", "stringSimilarity"].includes(SETTINGS.strategy) ) {
    $("#select-intervalMode").prop("disabled", true).trigger("chosen:updated");
    document.querySelector("#user-defined-interval-string").disabled = true;
    document.querySelector("#slider-bin-number").disabled = true;
    document.querySelector("#palette-container").style.opacity = .5;
    $("#select-custom-palette").prop("disabled", true).trigger("chosen:updated");
  }
  else if(SETTINGS.strategy === "choropleth" && SETTINGS.intervalMode === "u"){ // bins are user defined
    $("#select-intervalMode").prop("disabled", false).trigger("chosen:updated");
    document.querySelector("#user-defined-interval-string").disabled = false;
    document.querySelector("#slider-bin-number").disabled = true;
    document.querySelector("#palette-container").style.opacity = 1;
    $("#select-custom-palette").prop("disabled", false).trigger("chosen:updated");

    document.querySelector("#output-bin-number").textContent = SETTINGS.bins.length-1; // xxx
    updatePaletteSample(chroma.scale(SETTINGS.palette).colors(SETTINGS.bins.length-1), SETTINGS.bins);
  }
  else if(SETTINGS.strategy === "choropleth" && SETTINGS.intervalMode !== "u"){ // bins will automatic generated
    $("#select-intervalMode").prop("disabled", false).trigger("chosen:updated");
    document.querySelector("#user-defined-interval-string").disabled = true;
    document.querySelector("#slider-bin-number").disabled = false;
    document.querySelector("#palette-container").style.opacity = 1;
    $("#select-custom-palette").prop("disabled", false).trigger("chosen:updated");


    document.querySelector("#slider-bin-number").value = SETTINGS.intervalNumber
    document.querySelector("#output-bin-number").textContent = SETTINGS.bins.length - 1;
    updatePaletteSample(chroma.scale(SETTINGS.palette).colors(SETTINGS.bins.length-1), SETTINGS.bins);
  }

  
}

function generateScheme(sheet, options) {
  MatrixHelpers.clearEmptyColumns(sheet);
  MatrixHelpers.clearEmptyRows(sheet);
  //make sheet row and column identifiers lowercase
  //sheet.forEach(elem => elem[0] = elem[0]?.toLowerCase() || elem[0])
  sheet[0].forEach(cell => cell = cell?.toLowerCase() || cell)


  if (options.strategy !== "stringSimilarity") MatrixHelpers.matrixParseFloatExceptLabels(sheet);

  // get valid column headers(col1, col2, ... etc.)
  let columnHeaders = MatrixHelpers.getRow(sheet, 0).filter((cellvalue, i, arr) => {
    return i !== 0 && cellvalue !== "_id" && cellvalue !== "_title" && typeof cellvalue === "string" && cellvalue.length > 0 && cellvalue.charAt(0) !== "_" && cellvalue.charAt(1) !== "_";
  });

  // make random color assignments for any header have no color assignment
  // this colors will be used with max, secondHighestValue or stringSimilarity schemers
  if (options.strategy === "max" || options.strategy === "secondHighestValue") {
    columnHeaders.forEach((header) => {
      header = header.toLowerCase();
      if (!SETTINGS.colorGroups[header]) {
        SETTINGS.colorGroups[header] = chroma.random().hex();
      }
    });
    syncSettings();
    options = SETTINGS;
  }
  if (options.strategy === "stringSimilarity") {
    // TODO
  }

  //convert refColumn to integer in case it is String(column title)
  if (typeof options.refColumn === "string") {
    options.refColumn = sheet[0].indexOf(options.refColumn);
  }

  // Scenerios
  if (options.strategy === "choropleth") {
    return Schemers.choroplethSchemer(sheet, options);
  }else if (options.strategy === "max") {
    return Schemers.maxSchemer(sheet, options);
  } else if (options.strategy === "secondHighestValue") {
    return Schemers.secondHighestSchemer(sheet, options);
  } else if (options.strategy === "stringSimilarity") {
    return Schemers.stringSimilaritySchemer(sheet, options);
  } else return [];
}

COLORPICKER.addEventListener(
  "input",
  (event) => {
    if (window.lastSelected) {
      window.lastSelected.style.backgroundColor = event.target.value;
    }
  },
  false
);

COLORPICKER.addEventListener("change", (event) => {
  if (window.lastSelected) {
    let selectedColor = event.target.value;
    let dataLegend = window.lastSelected.parentElement.getAttribute("data-legend");
    window.lastSelected.parentElement.setAttribute("data-color", selectedColor);
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

function updateLocalStorageSelectBox() {
  let select2 = document.getElementById("select-local-storage");
  select2.replaceChildren();
  let maps = JSON.parse(localStorage.getItem("localsaves")) || [];
  let optionsHTML =
    `<option value=""></option>\n` +
    maps
      .sort((a, b) => b.date - a.date)
      .map((elem) => `<option value="${elem.id}">${elem.title + " - " + new Intl.DateTimeFormat("tr-TR").format(new Date(elem.date))}</option>`)
      .join("\n");
  select2.insertAdjacentHTML("afterbegin", optionsHTML);
  $(select2).trigger("chosen:updated");
}

function updatePaletteSample(colorArray, bins = []) {
  let container = document.querySelector("#palette-container");
  container.replaceChildren();
  colorArray.forEach((colorCode, i, arr) => {
    let span = document.createElement("span");
    span.setAttribute("style", `background-color:${colorCode};`);
    span.setAttribute("data-bin", Stats.shortenNumber(bins[i]));
    if(i == arr.length-1) span.setAttribute("data-last-bin", Stats.shortenNumber(bins[i+1]));
    container.appendChild(span);
  });
}

// ***********************
// SELECT BOXES (chosen)
// ***********************

$("#select-local-storage")
  .chosen()
  .change(async (event) => {
    let id = event.target.value;
    let localsaves = JSON.parse(localStorage.getItem("localsaves"));
    let save = localsaves.find((el) => el.id == id);
    if (save) {
      SETTINGS = save.settings;
      await loadMapTemplateDataUpdate(SETTINGS.map);
    }
  });

$("#select-map")
  .chosen()
  .change((event) => {
    let mapId = event.target.value;
    syncSettings({ map: mapId });
    loadMapTemplateDataUpdate(mapId);
  });

$("#select-strategy")
  .chosen()
  .change((event) => {
    SETTINGS.strategy = event.target.value;
    syncSettings(); //todo
    updateWholeSystem();
  });

$("#select-intervalMode")
  .chosen()
  .change((event) => {
    SETTINGS.intervalMode = event.target.value;
    syncSettings();
    //document.querySelector("#user-defined-interval-string").value = SETTINGS.userDefinedIntervals
    updateWholeSystem();
  });

$("#select-custom-palette")
  .chosen()
  .change((event) => {
    SETTINGS.palette = event.target.value;
    syncSettings();
    updateWholeSystem();
  });

document.querySelector("#slider-bin-number").addEventListener("input", (event) => {
  SETTINGS.intervalNumber = parseInt(event.target.value);
  syncSettings();
  updateWholeSystem();
});

document.querySelector("#user-defined-interval-string").addEventListener("input", (event) => {
  SETTINGS.userDefinedIntervals = event.target.value
  syncSettings();
  updateWholeSystem();
});

document.querySelector("#sheet_coloring_option").addEventListener("click", (event) => {
  SETTINGS.allowSheetColoring = event.target.checked;
  syncSettings();
  updateWholeSystem();
});

document.querySelector("#legend_option").addEventListener("click", (event) => {
  SETTINGS.includeLegend = event.target.checked;
  syncSettings();
  updateWholeSystem();
});

let radios = document.querySelectorAll("input[name=preferred_city_labels]");
Array.from(radios).forEach((radio) => {
  radio.addEventListener("click", (event) => {
    SETTINGS.includeCityLabel = event.target.value;
    event.target.checked = true;
    syncSettings();
    updateWholeSystem();
  });
});

// ***********************
// LOAD DATA
// ***********************

// Fill random data to "Hands on Table"
/* document.getElementById('fill-random-data').addEventListener('click', () => {
  let sheetData =  handsOnTableObj.getData()
  let columnLabels =  MatrixHelpers.getRow(sheetData, 0).filter(elem => elem)
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter(elem => elem)
  let svgElement = document.querySelector('#svg-container svg')
  let legendContainer = document.querySelector('#legend-container')
  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => { return Mock.integer(0,100)})
  handsOnTableObj.updateData(data)
  updateWholeSystem()
}) */
// Fill random data to "Hands on Table"
document.getElementById("fill-random-data").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getSourceData();
  const data = MatrixHelpers.fillEmptyMatrixCells(sheetData, () => {
    return Mock.integer(-10, 110);
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});

document.getElementById("fill-random-data2").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getSourceData();
  const data = MatrixHelpers.fillEmptyMatrixCells(sheetData, () => {
    return Math.random()
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});

// Fill random strings to "Hands on Table"
document.getElementById("fill-random-strings").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getData();
  let columnLabels = MatrixHelpers.getRow(sheetData, 0).filter((elem) => elem);
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter((elem) => elem);
  let svgElement = document.querySelector("#svg-container svg");
  let legendContainer = document.querySelector("#legend-container");
  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => {
    return Mock.oneof(["group1", "group2", "group3", "group4", "group5", "group6", "group7",]); /* "group8", "group9", "group10", "group11", "group12", "group13", "xxxxx", "yyyyy", "aaaaa", "eeeee", "zzzzz"]); */
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});

// Fill with "Normal Distribution" data to "Hands on Table"
document.getElementById("fill-normal-distrubution").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getData();
  let columnLabels = MatrixHelpers.getRow(sheetData, 0).filter((elem) => elem);
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter((elem) => elem);

  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => {
    return Stats.trimDecimal(Stats.generateSingleNormalDistributionValue(50, 30), 2);
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});

// Fill with "Exponential Distribution" data to "Hands on Table"
document.getElementById("fill-exponential-distrubution").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getData();
  let columnLabels = MatrixHelpers.getRow(sheetData, 0).filter((elem) => elem);
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter((elem) => elem);

  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => {
    return Stats.trimDecimal(Stats.generateSingleExponentialDistributionValue(0.001), 2);
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});
// Fill with "Gama Distribution" data to "Hands on Table"
document.getElementById("fill-gama-distrubution").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getData();
  let columnLabels = MatrixHelpers.getRow(sheetData, 0).filter((elem) => elem);
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter((elem) => elem);

  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => {
    return Stats.trimDecimal(Stats.gammaRandom(3, 7), 2);
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});
// Fill with "Beta Distribution" data to "Hands on Table"
document.getElementById("fill-beta-distrubution").addEventListener("click", () => {
  let sheetData = handsOnTableObj.getData();
  let columnLabels = MatrixHelpers.getRow(sheetData, 0).filter((elem) => elem);
  let rowLabels = MatrixHelpers.getColumn(sheetData, 0).filter((elem) => elem);

  const data = MatrixHelpers.genSheet(rowLabels, columnLabels, () => {
    return Stats.trimDecimal(Stats.betaRandom(3, 7) * 201, 2);
  });
  handsOnTableObj.updateData(data);
  updateWholeSystem();
});

// Manualy Update System
document.getElementById("update-system").addEventListener("click", () => {
  updateWholeSystem();
});

// load .csv etc. from computer
document.querySelector("#inputfile")?.addEventListener("change", (event) => {
  const file = event.target.files[0];
  let svgElement = document.querySelector("#svg-container svg");
  let legendContainer = document.querySelector("#legend-container");

  file
    .text()
    .then((text) => {
      if (file.type == "application/json") {
        let data = JSON.parse(text);
        if (BUNDLE) {
          BUNDLE.updateData(data);
        } else {
          BUNDLE = new Bundle(hot, svgElement, legendContainer);
          window.BUNDLE = BUNDLE;
          BUNDLE.updateData(data);
          BUNDLE.updateSystem(SETTINGS);
        }
      } else if (file.type == "text/csv") {
        let data = Papa.parse(text).data;
        MatrixHelpers.matrixNormalize(data);
        if (BUNDLE) {
          BUNDLE.updateData(data);
        } else {
          BUNDLE = new Bundle(hot, svgElement, legendContainer);
          window.BUNDLE = BUNDLE;
          BUNDLE.updateData(data);
          BUNDLE.updateSystem(SETTINGS);
        }
      } else {
        console.error("Unknown format: ", file.name);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

// load data from remote URL
document.getElementById("fetch-data")?.addEventListener("click", (event) => {
  let url = document.getElementById("data-url").value;
  fetch(url, { "Cache-Control": "no-cache" })
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      let matrix = Papa.parse(text).data;
      BUNDLE.updateData(matrix);
    })
    .catch((err) => {
      console.error(err);
    });
});

// ***********************
// SAVE DATA
// ***********************

document.getElementById("saveToLocalStorage").addEventListener("click", (event) => {
  if (!BUNDLE) {
    console.log("There is no data to save!");
    return;
  }
  let name = window.prompt("Give a name to your save ...");
  let localsaves = localStorage.getItem("localsaves");
  try {
    localsaves = JSON.parse(localsaves);
    if (!localsaves) localsaves = [];
  } catch (error) {
    console.log("There is no save. Creating...");
    localsaves = [];
  }
  let mapdata = {
    id: Math.random().toString(36).substring(2, 8), //random-id
    settings: SETTINGS,
    title: name,
    date: new Date().getTime(), //new Intl.DateTimeFormat('tr-TR').format(new Date()),
    data: BUNDLE.getData(),
  };
  localsaves.push(mapdata);
  localStorage.setItem("localsaves", JSON.stringify(localsaves));
  updateLocalStorageSelectBox();
});

// ***********************
// DOWNLOAD DATA LISTENERS
// ***********************

document.getElementById("downloadAsCSV").addEventListener("click", (event) => {
  let data = handsOnTableObj.getData();
  console.log(data);
  MatrixHelpers.clearBottomMostEmptyRows(data);
  MatrixHelpers.clearRightMostEmptyColumns(data);
  downloadObjectAsCsv(data, "worksheet");
});

document.getElementById("downloadTemplate").addEventListener("click", (event) => {
  downloadLinkAsCsv(`sheets/${SETTINGS.map}.csv`, `sheet-${SETTINGS.map}`);
});

document.getElementById("download-image-btn").addEventListener("click", (event) => {
  let svg = document.querySelector("#svg-container svg");
  SVGHelper.downloadSvgAsImage(svg, undefined, { width: 1000, height: 1000 });
});

// ***********************
// TEST LISTENERS
// ***********************

document.getElementById("log").addEventListener("click", (event) => {
  console.log("visual", handsOnTableObj.getData());
  console.log("source", handsOnTableObj.getSourceData());
});
