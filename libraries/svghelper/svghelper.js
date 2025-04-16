export default class SVGHelper{
  static NAMESPACE = "http://www.w3.org/2000/svg";
  //const fragment = document.createDocumentFragment();
  //$(this.container).find("svg")[0].insertAdjacentHTML("beforeend", `<g id="datas"></g>`);
  //let textElem = document.createElementNS(NAMESPACE, "text");
  //dataContainer.appendChild(fragment);
  //textPathElem.setAttribute("startOffset", "50%");
  //textPathElem.textContent = feature.getData();
  constructor(){
  }

  static getViewBoxArr(svg){
    return svg.getAttribute('viewBox').trim().split(/\s{1,}/).map((str) => parseFloat(str))
  }

  static getBBox(svg, elem){
    let container = svg.querySelector("g#temporaryElement")
    if(!container){
      container = SVGHelper.createElement('g', {id: 'temporaryElement'})
      SVGHelper.appendElement(svg, container)
    }else{
      container.replaceChildren()
    }
    container.appendChild(elem)
    let bbox = elem.getBBox()
    container.replaceChildren() // empty temporaryElement
    return bbox
  }

  static getBBoxArr(svg, elem){
    let bbox = SVGHelper.getBBox(svg,elem)
    return [bbox.x, bbox.y, bbox.width, bbox.height]
  }

  static getBBoxArrOfElement(elem){
    let bbox = elem.getBBox()
    return [bbox.x, bbox.y,bbox.width,bbox.height]
  }

  static setViewBox(svg, viewbox){
    if(typeof viewbox == 'string')
    svg.setAttribute('viewBox', viewbox)
    else if(Array.isArray(viewbox)){
      svg.setAttribute('viewBox', viewbox.join(' '))
    }else console.warn('wrong viewbox format:', viewbox)
  }

  static expandSvgViewBox(svg, sides){
    sides = {...{top:0, bottom:0, left:0, right:0}, ...sides};
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg);
    SVGHelper.setViewBox(svg, [x-sides.left, y-sides.top, width+sides.left+sides.right, height+sides.top+sides.bottom])
  }

  static createElement(type, attributes = {}){
    let elem = document.createElementNS( SVGHelper.NAMESPACE, type);
    Object.entries(attributes).forEach(entry => {
      elem.setAttribute(entry[0],entry[1])
    })
    return elem;
  }

  static createHTMLElement(type, attributes = {}){
    let elem = document.createElement( type);
    Object.entries(attributes).forEach(entry => {
      elem.setAttribute(entry[0],entry[1])
    })
    return elem;
  }

  static appendElement(svg, elem){
    return svg.appendChild(elem)
  }

  //insert an element, if any element with the same id replace with the new one
  static upsertElement(svg, elem){
    let elemId = elem.getAttribute("id");
    if(!elemId){
      console.warn("Because of the element you tried to upsert does not have an id, upsert operation aborted!")
      return
    }

    let foundElemContainer = svg.querySelector(`g#${elemId}`)
    if(!foundElemContainer){
      SVGHelper.appendElement(svg, elem)
    }else{
      foundElemContainer.replaceWith(elem)
    }
  }
/* 
  const sampleLegendObj = {
    title: "LegendTitle",
    list: [
      {color: "red", label: "Label1 | %10", range: [0,10]},
      {color: "blue", label: "Label2 | %20", range: [10,20]},
      {color: "yellow", label: "Label3 | %30", range: [20,30]},
      {color: "pink", label: "Label4 | %40", range: [30,40]},
      {color: "green", label: "Label5 | %50", range: [40,50]}
    ]
  } */

  
  //  Legend Title
  //  ||  Label1
  //  ||  Label2
  //  ||  Label3
  //  ||  Label4

  static generateLegendType1( legendObj ){
    let legendContainer = SVGHelper.createElement('g', {id: 'legendContainer'})
    if(!legendObj || !legendObj.list) return legendContainer
    // add legend title
    let legendTitle = SVGHelper.createElement('text', {x: 0, y: -2, "dominant-baseline": 'hanging', style: "font-size: 14px;"})
    legendTitle.textContent = legendObj.title;
    legendContainer.appendChild(legendTitle)

    // add list 
    legendObj?.list?.forEach((item,i,arr) => {
      let rect =  SVGHelper.createElement('rect', {x: 0, y: (i+1)*15, width: '10', height: '10', fill: item.color, stroke: 'black', "stroke-width": .5, rx: 2})
      let text =  SVGHelper.createElement('text', {x: 12, y: (i+1)*15+1, fill: item.color, "dominant-baseline": 'hanging', style: "font-size: 10px;"} )
      text.textContent = item.label
      legendContainer.appendChild(rect)
      legendContainer.appendChild(text)
    })

    // add border
    // let bbox = SVGHelper.getBBox(svg, legendContainer)
    // let legendBorder = SVGHelper.createElement('rect', {x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height, fill: 'none', opacity: '1', stroke: 'black', "stroke-width": .2})
    // legendContainer.appendChild(legendBorder)

    //SVGHelper.calculateElementCoor(svg, legendContainer, options)

    return legendContainer
  }


  //  ||||  Label1
  //  ||||  Label2
  //  ||||  Label3
  //  ||||  Label4
  static generateLegendType2( legendObj ){
    let legendContainer = SVGHelper.createElement('g', {id: 'legendContainer'})
    if(!legendObj || !legendObj.list) return legendContainer

    // add legend labels
    legendObj.list.forEach((item,i,arr) => {
      let rect =  SVGHelper.createElement('rect', {x: 0, y: i*10+2*i, width: '20', height: '10', fill: item.color, stroke: 'black', "stroke-width": .4, rx: .5})
      let text =  SVGHelper.createElement('text', {x: 22, y: i*10+2*i+6, fill: 'black', "dominant-baseline": 'middle', "text-anchor": "start", style: "font-size: 7px; font-weight:bold;"} )
      text.textContent = item.label
      legendContainer.appendChild(rect)
      legendContainer.appendChild(text)
    })
    return legendContainer
  }



  //    Label1           Label2           Label3
  //    ||||||||||||     ||||||||||||     ||||||||||||
  static generateLegendType3( legendObj ){
    let legendContainer = SVGHelper.createElement('g', {id: 'legendContainer'})
    if(!legendObj || !legendObj.list) return legendContainer

    // add rectangles and labels
    legendObj.list.forEach((item,i,arr) => {
      let rect =  SVGHelper.createElement('rect', {x: i*60, y: 0, width: '50', height: '5', fill: item.color, stroke: 'black', "stroke-width": .5, rx: 0})
      let text =  SVGHelper.createElement('text', {x: i*60 + 25, y: -4, fill: 'black', "dominant-baseline": 'auto', "text-anchor": "middle", style: "font-size: 7px;"} )
      text.textContent = item.label
      legendContainer.appendChild(rect)
      legendContainer.appendChild(text)
    })  
    return legendContainer
  }

  //  |||===|||===|||===|||===|||===|||===
  //  0     1     2     3     4     5     6
  
  static generateChoroplethBar( legendObj ){
    let legendContainer = SVGHelper.createElement('g', {id: 'legendContainer'})
    if(!legendObj || !legendObj.list) return legendContainer
      
    // add legend cells
    legendObj.list.forEach( (item, i, arr) => {
      let rect =  SVGHelper.createElement('rect', {x: i*20, y: 0, width: '20', height: '10', fill: item.color, stroke: 'black', "stroke-width": .5, rx: 0})
      let text =  SVGHelper.createElement('text', {x: i*20, y: 12, fill: 'black', "dominant-baseline": 'hanging', "text-anchor": "middle", style: "font-size: 5px;"} )
      text.textContent = item.range[0]
      legendContainer.appendChild(rect)
      legendContainer.appendChild(text)
      if(arr.length-1 == i){
        let last_text = SVGHelper.createElement('text', {x: (i+1)*20, y: 12, fill: 'black', "dominant-baseline": 'hanging', "text-anchor": "middle", style: "font-size: 5px;"} )
        last_text.textContent = item.range[1]
        legendContainer.appendChild(last_text)
      }
    })

    return legendContainer
  }

  static generateHistogram( numbers ){
    let histogram = SVGHelper.createElement('g', {id: 'histogram'})
    let [minNum,maxNum] = [0,100]
    let histogramArr = SVGHelper.histogram(numbers, minNum, maxNum)
    let dx = 3;
    let dy = 2;
    let blockHeight = 2;

    // horizontal axis line   <line x1="0" y1="80" x2="100" y2="20" stroke="black" />
    let axis = SVGHelper.createElement('line', {name:"horizontalaxis", x1:0, y1:0, x2:maxNum*dx, y2:0, stroke: 'black', "stroke-width":1})
    let axis2 = SVGHelper.createElement('line', {name:"", x1:0, y1:-10, x2:maxNum*dx, y2:-10, stroke: 'black', "stroke-width":.1})
    let txt2 = SVGHelper.createElement('text', {x: -2, y: -10, fill: "black", "dominant-baseline": 'middle', "text-anchor":"end", style: "font-size: .3rem;"} )
    txt2.textContent = "5"; 
    histogram.appendChild(txt2)
    let axis3 = SVGHelper.createElement('line', {name:"", x1:0, y1:-20, x2:maxNum*dx, y2:-20, stroke: 'black', "stroke-width":.1})
    let txt3 = SVGHelper.createElement('text', {x: -2, y: -20, fill: "black", "dominant-baseline": 'middle', "text-anchor":"end", style: "font-size: .3rem;"} )
    txt3.textContent = "10"; 
    histogram.appendChild(txt3)
    let axis4 = SVGHelper.createElement('line', {name:"", x1:0, y1:-30, x2:maxNum*dx, y2:-30, stroke: 'black', "stroke-width":.1})
    let txt4 = SVGHelper.createElement('text', {x: -2, y: -30, fill: "black", "dominant-baseline": 'middle', "text-anchor":"end", style: "font-size: .3rem;"} )
    txt4.textContent = "15"; 
    histogram.appendChild(txt4)
    histogram.appendChild(axis)
    histogram.appendChild(axis2)
    histogram.appendChild(axis3)
    histogram.appendChild(axis4)
    
    // increments , milim çizgileri
    histogramArr.forEach((freq,i,arr) =>{
      if(i%10 == 0){
        histogram.appendChild(SVGHelper.createElement('line', {x1:i*dx, y1:-dy, x2:i*dx, y2:dy, stroke:"black", "stroke-width":.3}))
        let txt = SVGHelper.createElement('text', {x: i*dx, y: 4, fill: "black", "dominant-baseline": 'hanging', "text-anchor":"middle", style: "font-size: .5rem;"} )
        txt.textContent = i;
        histogram.appendChild(txt);
      }
    })

    //Bricks
    histogramArr.forEach((freq,i,arr) => {
      if(freq > 0){
        histogram.appendChild(SVGHelper.createElement('line', {x1:i*dx, y1:0, x2:i*dx, y2:-blockHeight*freq, stroke:"crimson", "stroke-width":2}))
      }
    })
    return histogram
  }


  static generateHeader(svg, headerText, options = {}){
    options = {...{scaleFactor: 1, align: 'top-center', gap: 20, expandSVG: false}, ...options}
    let header = SVGHelper.createElement('g', {id: 'headerSection'})

      let switchObject =  SVGHelper.createElement('switch', {})
      let foreignObject =  SVGHelper.createElement('foreignObject', {x:"0", y:"0", width:"600", height:"100", style:"position:relative;"})
      let pElem = SVGHelper.createHTMLElement('p', { xmlns:"http://www.w3.org/1999/xhtml", style: "margin-top:0; margin-bottom:0; font-size:2em; font-weight: 900; position:absolute; bottom:0; text-align:center; width:100%;"})
      pElem.textContent = headerText;

      //TExt alignment
      let [vAlign, hAlign] = options.align.split("-");
      if(hAlign == 'right') pElem.style.textAlign = 'right'
      else if(hAlign == 'left') pElem.style.textAlign = 'left'
      else if(hAlign == 'center') pElem.style.textAlign = 'center'
      else pElem.style.textAlign = 'center'

      foreignObject.appendChild(pElem)
      switchObject.appendChild(foreignObject)
      header.appendChild(switchObject)
    SVGHelper.calculateElementCoor(svg, header, options)

    return header;
  }

  static generateSingleLineFooter(svg, footerText, options = {}){
    options = {...{scaleFactor: 1, align: 'bottom-right', gap: 5, expandSVG: false}, ...options}
    let footer = SVGHelper.createElement('g', {id: 'footerSection'})

    let textElem =  SVGHelper.createElement('text', {x:0, y:0, fill: 'gray', "dominant-baseline": 'auto', "text-anchor": "middle", style: "font-size: 7px;"} )
    textElem.textContent = footerText;
    footer.appendChild(textElem)

    SVGHelper.calculateElementCoor(svg, footer, options)

    return footer;
  }


  ///_____________________________________________________________________________
  // options = {gap, ratio, widthRatio, heightRatio, position}
  static transformElementInside(refElem, floatingElem, options = {} ){
    // set default options
    options = {...{position: "top-center", gap: 0, scale: 1, /* widthRatio: 100, heightRatio: 100, */ }, ...options}

    let [rX1, rY1, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    if( options.position.indexOf("top")    != -1 )    rY1+=options.gap
    if( options.position.indexOf("bottom") != -1 )    rY1-=options.gap
    if( options.position.indexOf("left")   != -1 )    rX1+=options.gap
    if( options.position.indexOf("right")  != -1 )    rX1-=options.gap
    let [rX2, rY2] = [rX1 + rW, rY1 + rH]

    let [fX1, fY1, fW, fH] = SVGHelper.getBBoxArrOfElement(floatingElem)  //floating element
    let [fX2, fY2] = [fX1 + fW, fY1 + fH]

    //const f1 = () => [fX1+rX1-fX2, fY1+rY1-fY2, fW, fH];
    //const f1 = () => [rX1-fX2, rY1-fY2, rX1, rY1]; //outside
    const magic = {
      "top-left" : () => [rX1-fX1, rY1-fY1, rX1, rY1],
      "top-center" : () => [rX1+rW/2-fX1-fW/2, rY1-fY1, rX1+rW/2, rY1],
      "top-right" : () => [rX2-fX2, rY1-fY1, rX2, rY1],
      "bottom-left" : () => [rX1-fX1, rY2-fY2 ,rX1, rY2],
      "bottom-center" : () => [rX1+rW/2-fX1-fW/2, rY2-fY2, rX1+rW/2, rY2],
      "bottom-right" : () => [rX2-fX2, rY2-fY2, rX2, rY2],
      "center-left" : () => [rX1-fX1, rY1+rH/2-fY1-fH/2 ,rX1, rY1+rH/2],
      "center-right" : () => [rX2-fX2, rY1+rH/2-fY1-fH/2 ,rX2, rY1+rH/2],
      "center-center" : () => [rX1+rW/2-fX1-fW/2, rY1+rH/2-fY1-fH/2 ,rX1+rW/2, rY1+rH/2],
      undefined : () => [rX1-fX1, rY2-fY2 ,rX1, rY2],
    }

    // [tox, toy] => transform-origin [x,y]
    const [dx,dy,tox,toy] = magic[options.position] ? magic[options.position]() : magic[undefined]() 

    //update scale ratio
    if(options.widthRatio) options.scale = rW * options.widthRatio / fW / 100
    else if(options.heightRatio) options.scale = rH * options.heightRatio / fH / 100
    else if(options.scale) options.scale = options.scale
    else options.scale = 1

    if( !isFinite(options.scale) ) options.scale = 1;

    // finalize
    floatingElem.setAttribute("transform-origin", `${tox} ${toy}`)
    floatingElem.setAttribute("transform", `scale(${options.scale}) translate(${dx} ${dy})`)
  }

  static transformElementOutside(refElem, floatingElem, options = {gap: 5, scale: 1, position: "center-center"}){
    let [rX1, rY1, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    if( options.position.indexOf("top")    != -1 )    rY1-=options.gap
    if( options.position.indexOf("bottom") != -1 )    rY1+=options.gap
    if( options.position.indexOf("left")   != -1 )    rX1-=options.gap
    if( options.position.indexOf("right")  != -1 )    rX1+=options.gap


    let [rX2, rY2] = [rX1 + rW, rY1 + rH]
    let [fX1, fY1, fW, fH] = SVGHelper.getBBoxArrOfElement(floatingElem)  //floating element
    let [fX2, fY2] = [fX1 + fW, fY1 + fH]

    //const f1 = () => [fX1+rX1-fX2, fY1+rY1-fY2, fW, fH];
    //const f1 = () => [rX1-fX2, rY1-fY2, rX1, rY1]; //outside
    const magic = {
      "top-left" : () => [rX1-fX2, rY1-fY2, rX1, rY1],
      "top-center" : () => [rX1+rW/2-fX1-fW/2, rY1-fY2, rX1+rW/2, rY1],
      "top-right" : () => [rX2-fX1, rY1-fY2, rX2, rY1],
      "bottom-left" : () => [rX1-fX2, rY2-fY1 ,rX1, rY2],
      "bottom-center" : () => [rX1+rW/2-fX1-fW/2, rY2-fY1, rX1+rW/2, rY2],
      "bottom-right" : () => [rX2-fX1, rY2-fY1, rX2, rY2],
      "center-left" : () => [rX1-fX2, rY1+rH/2-fY1-fH/2 ,rX1, rY1+rH/2],
      "center-right" : () => [rX2-fX1, rY1+rH/2-fY1-fH/2 ,rX2, rY1+rH/2],
      "center-center" : () => [rX1+rW/2-fX1-fW/2, rY1+rH/2-fY1-fH/2 ,rX1+rW/2, rY1+rH/2],
      undefined : () => [rX1+rW/2-fX1-fW/2, rY1+rH/2-fY1-fH/2 ,rX1+rW/2, rY1+rH/2],
    }

    // [tox, toy] => transform-origin [x,y]
    const [dx,dy,tox,toy] = magic[options.position] ? magic[options.position]() : magic[undefined]() 

    //update scale ratio
    if(options.widthRatio) options.scale = rW * options.widthRatio / fW / 100
    else if(options.heightRatio) options.scale = rH * options.heightRatio / fH / 100
    else if(options.scale) options.scale = options.scale
    else options.scale = 1

    if( !isFinite(options.scale) ) options.scale = 1;

    // finalize
    floatingElem.setAttribute("transform-origin", `${tox} ${toy}`)
    floatingElem.setAttribute("transform", `scale(${options.scale}) translate(${dx} ${dy})`)
  }


  static histogram(numbers,start,end){
    let frequencyArray = Array(end+1).fill(0);
    //calc frequencies
    numbers.forEach(num => {
      let index = parseInt(num)
      if(isFinite(index) && index >= 0 && index >= start && index <= end) 
        frequencyArray[index]++;
    })
    return frequencyArray;
  }

  static calcSurroundingViewBox(viewboxes){
    let [topleftX, topleftY, bottomrightX, bottomrightY] = [+Infinity, +Infinity, -Infinity, -Infinity]

    viewboxes.forEach(viewbox => {
      let [x1, y1, x2, y2] = [viewbox[0], viewbox[1], viewbox[0] + viewbox[2], viewbox[1] + viewbox[3]]
      if(viewbox[2] == 0 || viewbox[3] == 0 ){
        //do nothing
      }else{
        if(x1 < topleftX) topleftX = x1;
        if(y1 < topleftY) topleftY = y1;
        if(x2 > bottomrightX) bottomrightX = x2;
        if(y2 > bottomrightY) bottomrightY = y2; 
      }
    });
    return [topleftX, topleftY, bottomrightX-topleftX, bottomrightY-topleftY]
  }

  static calculateBoundingViewBox(viewBoxes) {
    // If no viewBoxes provided, return null or default values
    if (viewBoxes.length === 0) {
        return [0, 0, 0, 0];
    }

    // Initialize min/max values from the first viewBox
    let [minX, minY, maxX, maxY] = [
        viewBoxes[0][0],                    // x
        viewBoxes[0][1],                    // y
        viewBoxes[0][0] + viewBoxes[0][2], // x + width
        viewBoxes[0][1] + viewBoxes[0][3]  // y + height
    ];

    // Iterate through all viewBoxes to find the extremes
    for (let i = 1; i < viewBoxes.length; i++) {
        const [x, y, width, height] = viewBoxes[i];
        const right = x + width;
        const bottom = y + height;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
    }

    // Calculate final width and height
    const width = maxX - minX;
    const height = maxY - minY;

    return [minX, minY, width, height];
  }

  static calcFittingViewBox(svg){
    
    let vbs = Array.from(svg.children).map(elem => {
      return SVGHelper.getBBoxArrOfElement(elem)
    })
    return SVGHelper.calcSurroundingViewBox(vbs)
  }

  static downloadSvgAsImage(svgElem, dimensions, minDimensions) {
    const canvas = document.createElement("canvas");
    const svg = svgElem
    const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
    const viewBoxArr = SVGHelper.getViewBoxArr(svg)
    let [_minw, _minh] = [0,0]

    if(minDimensions && minDimensions.width && minDimensions.height){
      // determine minWith, minHeight
      [_minw, _minh] = [viewBoxArr[2], viewBoxArr[3]]
      while(_minw < minDimensions.width || _minh < minDimensions.height ){
        _minw+=viewBoxArr[2]
        _minh+=viewBoxArr[3]
      }
    }

  
    let w = dimensions?.width || _minw || viewBoxArr[2] || 1920;
    let h = dimensions?.height || _minh || viewBoxArr[3] || 1080;


    const img_to_download = document.createElement("img");
    img_to_download.src = "data:image/svg+xml;base64," + base64doc;
    img_to_download.onload = function () {
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);
      const context = canvas.getContext("2d");
      //context.clearRect(0, 0, w, h);
      context.drawImage(img_to_download, 0, 0, w, h);
      const dataURL = canvas.toDataURL("image/png");
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(canvas.msToBlob(), "download.png");
        //e.preventDefault();
      } else {
        const a = document.createElement("a");
        const my_evt = new MouseEvent("click");
        a.download = "image.png";
        a.href = dataURL;
        a.dispatchEvent(my_evt);
      }
      //canvas.parentNode.removeChild(canvas);
    };
  };
}