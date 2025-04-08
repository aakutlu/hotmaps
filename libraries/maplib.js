import * as ExtendedColorsx11 from "./x11.js"
import SVGHelper from "./svghelper/svghelper.js"
export class Zoomer {
  static base64_dot = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZmlsbDogcmdiYSgwLCAwLCAwLCAxKTt0cmFuc2Zvcm06IDttc0ZpbHRlcjo7Ij4NCiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgLz4NCjwvc3ZnPg==";
  static base64_plus = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZmlsbDogcmdiYSgwLCAwLCAwLCAxKTt0cmFuc2Zvcm06IDttc0ZpbHRlcjo7Ij48cGF0aCBkPSJNMTkgMTFoLTZWNWgtMnY2SDV2Mmg2djZoMnYtNmg2eiI+PC9wYXRoPjwvc3ZnPg==";
  static base64_minus = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZmlsbDogcmdiYSgwLCAwLCAwLCAxKTt0cmFuc2Zvcm06IDttc0ZpbHRlcjo7Ij48cGF0aCBkPSJNNSAxMWgxNHYySDV6Ij48L3BhdGg+PC9zdmc+";
  static base64_lock_open = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZmlsbDogcmdiYSgwLCAwLCAwLCAxKTt0cmFuc2Zvcm06IDttc0ZpbHRlcjo7Ij48cGF0aCBkPSJNMTggMTBIOVY3YzAtMS42NTQgMS4zNDYtMyAzLTNzMyAxLjM0NiAzIDNoMmMwLTIuNzU3LTIuMjQzLTUtNS01UzcgNC4yNDMgNyA3djNINmEyIDIgMCAwIDAtMiAydjhhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0ydi04YTIgMiAwIDAgMC0yLTJ6bS03LjkzOSA1LjQ5OUEyLjAwMiAyLjAwMiAwIDAgMSAxNCAxNmExLjk5IDEuOTkgMCAwIDEtMSAxLjcyM1YyMGgtMnYtMi4yNzdhMS45OTIgMS45OTIgMCAwIDEtLjkzOS0yLjIyNHoiPjwvcGF0aD48L3N2Zz4=";
  static base64_lock_closed = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZmlsbDogcmdiYSgwLCAwLCAwLCAxKTt0cmFuc2Zvcm06IDttc0ZpbHRlcjo7Ij48cGF0aCBkPSJNMTIgMkM5LjI0MyAyIDcgNC4yNDMgNyA3djNINmEyIDIgMCAwIDAtMiAydjhhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0ydi04YTIgMiAwIDAgMC0yLTJoLTFWN2MwLTIuNzU3LTIuMjQzLTUtNS01ek05IDdjMC0xLjY1NCAxLjM0Ni0zIDMtM3MzIDEuMzQ2IDMgM3YzSDlWN3ptNCAxMC43MjNWMjBoLTJ2LTIuMjc3YTEuOTkzIDEuOTkzIDAgMCAxIC41NjctMy42NzdBMi4wMDEgMi4wMDEgMCAwIDEgMTQgMTZhMS45OSAxLjk5IDAgMCAxLTEgMS43MjN6Ij48L3BhdGg+PC9zdmc+"

  constructor(svgElement, options, sensitivity = 0.2) {
    this.svg = svgElement;
    this.defaultViewBox = svgElement.getAttribute("viewBox");
    this.sensitivity = sensitivity;
    this.mouseStart = null;
    this.pivot = null;
    this.disabled = true;
    this.hidden = false; //todo
    this.zoominBtn = options.zoominBtn;
    this.zoomoutBtn = options.zoomoutBtn;
    this.zoomdefaultBtn = options.zoomDefaultBtn;
    this.lockBtn = options.lockBtn;
    this.setListeners()
  }
  // calculate the zooming process,  if touches vertical borders or horizontal borders
  static calcFittingViewBox(bbox1, bbox2){
    // bbox1 => initial svg viewbox
    // bbox2 => refrence element's bbox
    let [x,y,w,h] = [0,0,0,0]
    let ratio = bbox1[2]/bbox1[3]; // (width / height) ratio
    if(bbox1[2]/bbox1[3] > bbox2[2]/bbox2[3]){
      h = bbox2[3];
      w = h * ratio;
      x = bbox2[0] - (w - bbox2[2])/2
      y = bbox2[1]
    }
    else{
      w = bbox2[2];
      h = w / ratio;
      y = bbox2[1] - (h - bbox2[3])/2
      x = bbox2[0]
    }
    return [x,y,w,h]
  }

  setListeners(){
    this.zoominBtn.addEventListener("click", (event) => {
      if(!this.disabled) this.zoomin();
    });
    this.zoomoutBtn.addEventListener("click", (event) => {
      if(!this.disabled) this.zoomout();
    });
    this.zoomdefaultBtn.addEventListener("click", (event) => {
      if(!this.disabled) this.reset();
    });
    this.lockBtn.addEventListener("click", (event) => {
      this.disabled = !this.disabled;
      if(this.disabled)
        this.lockBtn.setAttribute('src', Zoomer.base64_lock_closed)
      else this.lockBtn.setAttribute('src', Zoomer.base64_lock_open)
    });
    this.svg.addEventListener("wheel", (event) => {
      if(!this.disabled) this.wheelzoom(event);
    });
    this.svg.addEventListener("mousemove", (event) => {
      if (!this.disabled && event.buttons === 1 && event.type === "mousemove") {
        this.shift(event);
      }
    });
    this.svg.addEventListener("mousedown", (event) => {
      if(!this.disabled) this.setStart(event);
    });
    this.svg.addEventListener("mouseup", (event) => {
      if(!this.disabled) event.target.style.cursor = "auto";
    });
  }

  getViewBox = function () {
    return this.svg.getAttribute("viewBox");
  };

  getViewBoxArr = function () {
    return this.getViewBox()
      .trim()
      .split(/\s{1,}/)
      .map((elem) => parseFloat(elem));
  };

  setViewBox = function (viewBox) {
    if (typeof viewBox === "string") this.svg.setAttribute("viewBox", viewBox);
    else if (Array.isArray(viewBox)) {
      this.svg.setAttribute("viewBox", viewBox.join(" "));
    } else console.warn("Wrong viewBox Format", { viewBox });
  };

  reset = function () {
    this.svg.setAttribute("viewBox", this.defaultViewBox);
  };

  zoomin = function (px, py) {
    /**
     * zoomPercentage: range [0,1]    zoom sensitivity
     * px            : range [0,1]    zoom pivot point percentage on horizontal axis
     * py            : range [0,1]    zoom pivot point percentage on vertical axis
     */
    px = parseFloat(px) || 0.5;
    py = parseFloat(py) || 0.5;
    let se = this.sensitivity;
    let viewBoxArr = this.getViewBox()
      .trim()
      .split(/\s{1,}/)
      .map((elem) => parseFloat(elem));
    let [x, y, w, h] = [...viewBoxArr];
    let _w = w - Math.round(se * w);
    let _h = h - Math.round(se * h);
    let _x = x + Math.abs(w - _w) * px;
    let _y = y + Math.abs(h - _h) * py;
    let _viewBox = [_x, _y, _w, _h].join(" ");
    this.setViewBox(_viewBox);
  };

  zoomout = function (px, py) {
    /**
     * zoomPercentage: range [0,1]    zoom sensitivity
     * px            : range [0,1]    zoom pivot point percentage on horizontal axis
     * py            : range [0,1]    zoom pivot point percentage on vertical axis
     */
    px = parseFloat(px) || 0.5;
    py = parseFloat(py) || 0.5;
    let se = this.sensitivity;
    let viewBoxArr = this.getViewBox()
      .trim()
      .split(/\s{1,}/)
      .map((elem) => parseFloat(elem));
    let [x, y, w, h] = [...viewBoxArr];
    let _w = w + Math.round(se * w);
    let _h = h + Math.round(se * h);
    let _x = x - Math.abs(w - _w) * px;
    let _y = y - Math.abs(h - _h) * py;
    let _viewBox = [_x, _y, _w, _h].join(" ");
    this.setViewBox(_viewBox);
  };
  
  zoomAnimation = function(viewBoxArr){
    let frames = 60;
    let duration = 1000; //milliseconds
    let [initialX, initialY, initialW, initialH] = this.getViewBoxArr()
    let [finalX, finalY, finalW, finalH] = Zoomer.calcFittingViewBox([initialX, initialY, initialW, initialH], viewBoxArr)
    let finalViewBox = [finalX, finalY, finalW, finalH]
    let [stepX, stepY, stepW, stepH] = [
      (finalX-initialX)/(frames*duration*.001), 
      (finalY-initialY)/(frames*duration*.001), 
      (finalW-initialW)/(frames*duration*.001),
      (finalH-initialH)/(frames*duration*.001),
    ]
    let interval = setInterval(function(){
      this.viewBoxStepper([stepX, stepY, stepW, stepH], finalViewBox)
    }.bind(this), 1000/frames, [stepX, stepY, stepW, stepH], finalViewBox )

    setTimeout(function(){
      clearInterval(interval)
      this.setViewBox(finalViewBox)
    }.bind(this),duration,interval,finalViewBox)
  }

  zoomViewBox = function(viewBoxArr){
    let currViewBox = this.getViewBoxArr()
    let finalViewBox = Zoomer.calcFittingViewBox(currViewBox, viewBoxArr)
    this.setViewBox(finalViewBox)
  }

  viewBoxStepper = function(steps, finalViewBox){
    let [fx, fy, fw, fh] = finalViewBox
    let [x, y, w, h] = this.getViewBoxArr()
    let [_x, _y, _w, _h] = [x+steps[0], y+steps[1], w+steps[2], h+steps[3]]
    let diff1 = Math.abs(x-fx) + Math.abs(y-fy) + Math.abs(w-fw) + Math.abs(h-fh)  
    let diff2 = Math.abs(_x-fx) + Math.abs(_y-fy) + Math.abs(_w-fw) + Math.abs(_h-fh)  
    if(diff1 > diff2){
      this.setViewBox([x+steps[0], y+steps[1], w+steps[2], h+steps[3]]);
    }
  }

  wheelzoom = function (event) {
    event.preventDefault();
    let DOMRECT = this.svg.getBoundingClientRect();
    if (event.deltaY < 0) {
      this.zoomin((event.offsetX / DOMRECT.width).toFixed(1), (event.offsetY / DOMRECT.height).toFixed(1));
    } else {
      this.zoomout((event.offsetX / DOMRECT.width).toFixed(1), (event.offsetY / DOMRECT.height).toFixed(1));
    }
  };

  shift = function (event) {
    if (event.buttons === 1 && event.type === "mousemove") {
      let DOMRECT = this.svg.getBoundingClientRect();
      event.target.style.cursor = "move";
      let [_x, _y, _w, _h] = this.getViewBoxArr();
      let dx = this.mouseStart.x - (event.offsetX / DOMRECT.width) * _w;
      let dy = this.mouseStart.y - (event.offsetY / DOMRECT.height) * _h;
      let _viewBox = [this.pivot.x + dx, this.pivot.y + dy, _w, _h].join(" ");
      this.setViewBox(_viewBox);
    }
  };

  setStart = function (event) {
    let DOMRECT = this.svg.getBoundingClientRect();
    let [_x, _y, _w, _h] = this.getViewBoxArr();
    this.pivot = { x: _x, y: _y };
    this.mouseStart = { x: (event.offsetX / DOMRECT.width) * _w, y: (event.offsetY / DOMRECT.height) * _h };
  };


}


export class Maplib{

  static DEFAULT_OPTIONS = {
    backgroundColor: 'whitesmoke',
    defaultFillColor: 'silver',
    defaultBorderColor: 'white',
    zoomerButtons: 'enabled',
    mouseWheelEventListeners: 'enabled',
    mouseSlideEventListeners: 'enabled',
    header: 'Map Header',
    footer: 'Map Footer',
    colorMappings: {},
    legend: {
      type: "chropleth",
      title: 'Lejant', 
      list: [
        {color: 'red', label: 'Red | %50'},
        {color: 'blue', label: 'Blue | %50'},
        {color: 'green', label: 'Green | %50'},
      ]
    },
  
  }
  
  constructor(container, mapsrc, options = {}){
    this.options = Object.assign(Maplib.DEFAULT_OPTIONS, options) //{...Maplib.DEFAULT_OPTIONS, ...options}
    this.container = container;
    this.mapsrc = mapsrc;
    this.svgText = options.svgText
    this.zoomer = null;
    this.hooks = {
      beforeColorSchema: [],
      afterColorSchema: [],
      beforeSetData: [],
      afterSetData: [],
      mapReady: [],
    };

    //initialize map
    //this.initialize()
  }

  static async  loadMap(url){
    const response = await fetch(url, /* {cache: "force-cache"} */);
    if (!response.ok) {
      const message = `An Error has occured: ${response.status}`;
      throw new Error(message);
    }
    const svg = await response.text();
    return svg
  }



  initialize = async function (){
    let svgText = this.svgText || await Maplib.loadMap(this.mapsrc)
    this.container.style.position = 'relative';
    this.container.replaceChildren();

    const createHTMLElement  = (type, attributes = {}) => {
      let elem = document.createElement( type);
      Object.entries(attributes).forEach(entry => {
        elem.setAttribute(entry[0],entry[1])
      })
      return elem;
    }

    const zoomerBtnsContainer = createHTMLElement("div", {class: "zoomer-btns"})
    let zoomerInBtn = createHTMLElement("img", {id: "zoomer-in", src:Zoomer.base64_plus, alt: "+"})
    let zoomerOutBtn = createHTMLElement("img", {id: "zoomer-out", src:Zoomer.base64_minus, alt: "-"})
    let zoomerDefaultBtn = createHTMLElement("img", {id: "zoomer-default", src:Zoomer.base64_dot, alt: "."})
    let zoomerLockBtn = createHTMLElement("img", {id: "zoomer-lock", src:Zoomer.base64_lock_closed, alt: "."})
    zoomerBtnsContainer.append(zoomerInBtn, zoomerOutBtn, zoomerDefaultBtn, zoomerLockBtn)
    this.container.append(zoomerBtnsContainer)



    //insert SVG
    this.container.insertAdjacentHTML("beforeend", svgText);
    //await new Promise(resolve => setTimeout(resolve, 20));
    let svgElem = this.container.querySelector('svg')
    let featureGElem = this.container.querySelector('svg g#features')

    // Create Zoomer Object
    this.zoomer = new Zoomer(svgElem, { zoominBtn: zoomerInBtn, zoomoutBtn: zoomerOutBtn, zoomDefaultBtn: zoomerDefaultBtn , lockBtn: zoomerLockBtn});

    // apply predefined options
    if(this.options.backgroundColor) svgElem.setAttribute("style", `background-color: ${this.options.backgroundColor};`) //style["background-color"] = this.options.backgroundColor;
    if(this.options.defaultFillColor) featureGElem.setAttribute("fill", this.options.defaultFillColor)
    if(this.options.defaultBorderColor) featureGElem.setAttribute("stroke", this.options.defaultBorderColor)

    this.container.addEventListener('onSVGMapReady', (event) => {
      if(this.options?.onSVGMapReady){
        let callback = this.options.onSVGMapReady.bind(this)
        callback();
        //this.options.onSVGMapReady.apply(this)
      }
    })

    console.log('Map loaded!')
    this.container.dispatchEvent(new Event("onSVGMapReady"))

    //color map with "colorMapppings"
    if(this.options?.colorMappings) this.colorMap(this.options.colorMappings)
    //this.colorRandom(['teal', 'cornflowerblue', 'gold', 'crimson'])
    this.runHook('mapReady')
  }

  register = function(hookname, callback){
    if(this.hooks[hookname]){
      this.hooks[hookname].push(callback);
      return;
    }
    console.warn( 'No such hook ', hookname )
  }

  runHook = function(hookname){
    this.hooks[hookname]?.forEach(hook => {
      hook.apply(this);
    })
  }

  colorMap = function(mappings){
    this.runHook('beforeColorMap')
    Object.entries(mappings).forEach(entry => {
      this.get(entry[0])?.fill(entry[1])
      //this.get(entry[0])?.fillAnimated(entry[1], .5)
    })
    this.runHook('afterColorMap')
  }

  colorRandom = function(colors){
    colors ??= ["red", "yellow", "blue", "green"] 
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    this.extractFeatureIds().forEach(id =>{
      console.log(id)
      this.get(id).fill(getRandomElement(x11.getGroupColors("Red"))).opacity(1)
    })
/*     this.extractFeatureIds().forEach(id =>{
      this.get(id).fill(x11.randomColor()).opacity(1)
    }) */ 

  }

  resetAllFeatureColors = function(){
    this.extractFeatureIds().forEach(id =>{
      this.get(id).removeAttribute("fill")
    })
  }

  updateLegend = function(legendObj, settings){
    let svg = this.container.querySelector("svg")
    let legendElem = undefined
    let refElem = undefined

    if(settings.strategy == "choropleth1" || settings.strategy == "choropleth2"){
      legendElem = SVGHelper.generateChoroplethBar(legendObj)
      console.log(legendElem)
      refElem = this.container.querySelector("g#legendRulerH")
    }
    else if(["max", "secondHighestValue", "stringSimilarity"].indexOf(settings.strategy) != -1){
      legendElem = SVGHelper.generateLegendType2(legendObj)
      refElem = this.container.querySelector("g#legendRulerV")
    }
    SVGHelper.upsertElement(svg, legendElem)
    SVGHelper.transformElementInside(refElem, legendElem, { gap: 0, widthRatio: 100, position: "top-left"} )
  }

  setAttributeAll = function(attributes){ //todo
    this.extractFeatureIds().forEach(id => {
      let feature = this.get(id);
      if(feature){
        if(attributes.fill) feature.fill(attributes.fill)
        if(attributes.opacity) feature.opacity(attributes.opacity)
        if(attributes.stroke) feature.stroke(attributes.stroke)
        if(attributes.strokeWidth) feature.strokeWidth(attributes.strokeWidth)
      }
    })
  }

  get = function(id){
    //id = id.toLocaleLowerCase('TR-tr');
    let elem = this.container.querySelector(`g#features g[id="${id}"]`)
    if(!elem) {
      console.warn(id, ' not found');
      return undefined;
    }
    
    return new Elem(elem, this.zoomer)
  }

  extractFeatureIds = function(){
    return Array.from(this.container.querySelectorAll("svg g#features g")).map(elem => elem.getAttribute('id'))
  }

  setViewBox = function(viewBox){
    this.zoomer.setViewBox(viewBox)
  }

  fillFeatures = function(citylist, color){
    citylist.forEach(cityId => {
      this.get(cityId)?.fill(color)
    })
  }
  zoomCity = function(cityname){
/*     let elems = this.container.querySelectorAll(`path:not([data-ilname="${cityname}"])`)
    elems.forEach(elem => {
      elem.setAttribute('opacity', .1);
    }) */
    this.get(cityname).zoom()
  }
}

export class Elem{
  constructor(elem,zoomer){
    this.elem = elem;
    this.zoomer = zoomer
  }
  fill = function(color){
    this.elem.setAttribute('fill', color)
    return this
  }
  fillAnimated = function(color, dur=1){
    let animElem = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animElem.setAttribute("attributeType", "XML");
    animElem.setAttribute("attributeName", "fill");
    animElem.setAttribute("to", color);
    animElem.setAttribute("fill", "freeze");
    animElem.setAttribute("dur", dur + "s");
    animElem.setAttribute("repeatCount", "1");
    this.elem.appendChild(animElem); // add <animate> element
    animElem.beginElement(); // begin animation
  
    setTimeout(() => {
      this.elem.setAttribute("fill", color);
      this.elem.removeChild(animElem);
    }, dur * 1_000);
  }

  stroke = function(color){
    this.elem.setAttribute('stroke', color)
    return this
  }
  strokeWidth = function(width){
    this.elem.setAttribute('stroke-width', width)
    return this
  }
  opacity = function(opacity){
    this.elem.setAttribute('opacity', opacity)
    return this
  }
  removeAttribute = function(attrName){
    this.elem.removeAttribute(attrName)
    return this
  }
  zoom = function(){
    let svgrect = this.elem.getBBox()
    let bbox = [svgrect.x, svgrect.y, svgrect.width, svgrect.height]
    this.zoomer.zoomViewBox(bbox)
  }
  zoomAnimation = function(){
    let bbox = this.elem.getBBox()
    this.zoomer.zoomAnimation([bbox.x, bbox.y, bbox.width, bbox.height])
  }
  display = function(display){
    this.elem.style.display = display;
    return this
  }
}


/* async function loadMap(url){
  const response = await fetch(url);
  //const response = await fetch(url, {cache: "force-cache"});
  if (!response.ok) {
    const message = `An Error has occured: ${response.status}`;
    throw new Error(message);
  }
  const svg = await response.text();
  return svg
} */

/* function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} */


//hardcoded inside Elem class
/* function fadeElementAndClean(elem, color, dur) {
  let animElem = document.createElementNS("http://www.w3.org/2000/svg", "animate");
  animElem.setAttribute("attributeType", "XML");
  animElem.setAttribute("attributeName", "fill");
  animElem.setAttribute("to", color);
  animElem.setAttribute("fill", "freeze");
  animElem.setAttribute("dur", dur + "s");
  animElem.setAttribute("repeatCount", "1");
  elem.appendChild(animElem); // add <animate> element
  animElem.beginElement(); // begin animation

  setTimeout(() => {
    elem.setAttribute("fill", color);
    elem.removeChild(animElem);
  }, dur * 1000);
} */
