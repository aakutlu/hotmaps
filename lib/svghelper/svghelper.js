
export class SVGHelper{
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
    return [bbox.x, bbox.y,bbox.width,bbox.height]
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
    svg.appendChild(elem)
  }

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


  static generateLegendType1(svg, legendObj, options = {}){
    options =  {...{scaleFactor: 1, align: 'bottom-left', gap: 20, expandSVG:false }, ...options}
    let legendContainer = SVGHelper.createElement('g', {id: 'legendType1'})

    // add legend title
    let legendTitle = SVGHelper.createElement('text', {x: 0, y: 2.5, "dominant-baseline": 'hanging', style: "font-size: 14px;"})
    legendTitle.textContent = legendObj.title;
    legendContainer.appendChild(legendTitle)

    // add list 
    legendObj.list.forEach((item,i,arr) => {
      let rect =  SVGHelper.createElement('rect', {x: 0, y: (i+1)*15, width: '10', height: '10', fill: item.color, stroke: 'black', "stroke-width": .5, rx: 2})
      let text =  SVGHelper.createElement('text', {x: 12, y: (i+1)*15+1, fill: item.color, "dominant-baseline": 'hanging', style: "font-size: 10px;"} )
      text.textContent = item.label
      legendContainer.appendChild(rect)
      legendContainer.appendChild(text)
    })

    // add border
    let bbox = SVGHelper.getBBox(svg, legendContainer)
    let legendBorder = SVGHelper.createElement('rect', {x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height, fill: 'none', opacity: '1', stroke: 'black', "stroke-width": .2})
    legendContainer.appendChild(legendBorder)

    SVGHelper.calculateElementCoor(svg, legendContainer, options)

    return legendContainer
  }

  static generateLegendType2(svg, cells, options = {}){
    options = {...{scaleFactor: 1, align: 'bottom-left', gap: 20, expandSVG: false}, ...options}
    let bar = SVGHelper.createElement('g', {id: 'legendType2'})
      /*cells = [
          {color: 'red', label: "0-9"},
          {color: 'orange', label: "10-19"},
          {color: 'yellow', label: "20-29"}
        ] */
    // add bar cells
    cells.forEach((item,i,arr) => {
      let rect =  SVGHelper.createElement('rect', {x: 0, y: i*10+2*i, width: '20', height: '10', fill: item.color, stroke: 'black', "stroke-width": .4, rx: .5})
      let text =  SVGHelper.createElement('text', {x: 22, y: i*10+2*i+5, fill: 'black', "dominant-baseline": 'middle', "text-anchor": "start", style: "font-size: 7px; font-weight:bold;"} )
      text.textContent = item.label
      bar.appendChild(rect)
      bar.appendChild(text)
    })
    SVGHelper.calculateElementCoor(svg, bar, options)

    return bar
  }

  static generateLegendType3(svg, cells, options = {}){
    options = {...{scaleFactor: 1, align: 'bottom-center', gap: 20, expandSVG: false}, ...options}
    let bar = SVGHelper.createElement('g', {id: 'textBars'})
          /*cells = [
              {color: 'red', header: "A. ve Kalkınma Partisi"},
              {color: 'black', header: "C. Halk Partisi"}
            ] */

    // add rectangles and Text cells
    cells.forEach((item,i,arr) => {
      let rect =  SVGHelper.createElement('rect', {x: i*60, y: 0, width: '50', height: '5', fill: item.color, stroke: 'black', "stroke-width": .5, rx: 0})
      let text =  SVGHelper.createElement('text', {x: i*60 + 25, y: -4, fill: 'black', "dominant-baseline": 'auto', "text-anchor": "middle", style: "font-size: 7px;"} )
      text.textContent = item.header
      bar.appendChild(rect)
      bar.appendChild(text)
    })
    SVGHelper.calculateElementCoor(svg, bar, options)

    return bar
  }

  static generateChoroplethBar(svg, cells, options = {}){
    options = {...{scaleFactor: 1, align: 'bottom-center', gap: 20, expandSVG: false, widthRatio: .5}, ...options}
    let bar = SVGHelper.createElement('g', {id: 'choroplethBars'})
      /*cells = [
          {color: 'red', range: [0,9]},
          {color: 'orange', range: [10,19]},
          {color: 'yellow', range: [20,29]}
        ] */
      
    // add bar cells
    cells.forEach( (item, i, arr) => {
      let rect =  SVGHelper.createElement('rect', {x: i*20, y: 0, width: '20', height: '10', fill: item.color, stroke: 'black', "stroke-width": .5, rx: 0})
      let text =  SVGHelper.createElement('text', {x: i*20, y: 11, fill: 'black', "dominant-baseline": 'hanging', "text-anchor": "middle", style: "font-size: 6px;"} )
      text.textContent = item.range[0]
      bar.appendChild(rect)
      bar.appendChild(text)
    })
    SVGHelper.calculateElementCoor(svg, bar, options)

    return bar
  }

  static generateHistogram(svg, numbers, options = {}){
    options = {...{scaleFactor: 1, align: 'bottom-center', gap: 20, expandSVG: true, widthRatio: .5}, ...options}
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
    SVGHelper.calculateElementCoor(svg, histogram, options)
    return histogram
  }

/*   static generateForeignObject(svg, xxx, options = {}){
    options = {...{scaleFactor: 1, align: 'bottom-center', gap: 20, expandSVG: true}, ...options}
    let group = SVGHelper.createElement('g', {id: 'headerSection'})

    // add bar cells
      let switchObject =  SVGHelper.createElement('switch', {})
      let foreignObject =  SVGHelper.createElement('foreignObject', {x:"0", y:"0", width:"600", height:"70"})
      //<p xmlns="http://www.w3.org/1999/xhtml">Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
      let pElem = SVGHelper.createHTMLElement('p', { xmlns:"http://www.w3.org/1999/xhtml", style: "margin-top:0; margin-bottom:0; font-size:2em; font-weight: 900; text-align: center;"})
      pElem.textContent = "Loremalia  ";

      foreignObject.appendChild(pElem)
      switchObject.appendChild(foreignObject)
      group.appendChild(switchObject)
    SVGHelper.calculateElementCoor(svg, group, options)

    return group;
  } */

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





/*   static alignVerticalCenter(svg, elem, options = {gap: 0}){
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg)
    let bbox = SVGHelper.getBBox(svg, elem)
    elem.style.transform += `translateY(${ y + ((height-y)/2) - (bbox.height/2) + (y/2)}px)`
  }

  static alignHorizontalCenter(svg, elem, options = {gap: 0}){
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg)
    let bbox = SVGHelper.getBBox(svg, elem)
    elem.style.transform += `translateX(${x + (width - x)/2  - (bbox.width/2) + (x/2)}px)`
  }

  static alignTop(svg, elem, options = {gap: 0}){
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg)
    let bbox = SVGHelper.getBBox(svg, elem)
    let svgTop = y;
    let elemTopCoor = bbox.y
    elem.style.transform += `translateY(${svgTop - elemTopCoor + options.gap}px)`
  }

  static alignBottom(svg, elem, options = {gap: 0}){
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg)
    let bbox = SVGHelper.getBBox(svg, elem)
    let svgBottom = y + height;
    let elemTopCoor = bbox.y + bbox.height
    elem.style.transform += `translateY(${svgBottom - elemTopCoor - options.gap}px)`
  }

  static alignLeft(svg, elem, options = {gap: 0}){
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg)
    let bbox = SVGHelper.getBBox(svg, elem)
    let svgLeft = x;
    let elemLeftCoor = bbox.x
    elem.style.transform += `translateX(${svgLeft - elemLeftCoor + options.gap}px)`
  }

  static alignRight(svg, elem, options = {gap: 0}){
    let [x, y, width, height] = SVGHelper.getViewBoxArr(svg)
    let bbox = SVGHelper.getBBox(svg, elem)
    let svgRight = x + width;
    let elemRightCoor = bbox.x + bbox.width
    elem.style.transform += `translateX(${svgRight - elemRightCoor - options.gap}px)`
  } */


  static alignBottomOfReference(svg, refElem, elem, options = {gap: 0}){
    let [rX, rY, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    let [tX, tY, tW, tH] = SVGHelper.getBBoxArr(svg, elem)
    elem.style.transform += `translateY(${ (rY - tY) + rY + rH + options.gap}px)`
  }
  static alignTopOfReference(svg, refElem, elem, options = {gap: 0}){
    let [rX, rY, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    let [tX, tY, tW, tH] = SVGHelper.getBBoxArr(svg, elem)
    elem.style.transform += `translateY(${ (rY - tY) - tH - options.gap}px)`;
  }

  static alignRightOfReference(svg, refElem, elem, options = {gap: 0}){
    let [rX, rY, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    let [tX, tY, tW, tH] = SVGHelper.getBBoxArr(svg, elem)
    elem.style.transform += `translateX(${ (rX - tX) + rX + rW + options.gap}px)`;
  }
  static alignLeftOfReference(svg, refElem, elem, options = {gap: 0}){
    let [rX, rY, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    let [tX, tY, tW, tH] = SVGHelper.getBBoxArr(svg, elem)
    elem.style.transform += `translateX(${ (rX - tX) - tW - options.gap}px)`;
  }

  static alignHorizontalCenterOfReference(svg, refElem, elem, options = {gap: 0}){
    let [rX, rY, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    let [tX, tY, tW, tH] = SVGHelper.getBBoxArr(svg, elem)
    elem.style.transform += `translateX(${(rX-tX) + rX + rW/2 - tW/2}px)`
  }
  static alignVerticalCenterOfReference(svg, refElem, elem, options = {gap: 0}){
    let [rX, rY, rW, rH] = SVGHelper.getBBoxArrOfElement(refElem) //ref elem
    let [tX, tY, tW, tH] = SVGHelper.getBBoxArr(svg, elem)
    elem.style.transform += `translateY(${(rY-tY) + rY + rH/2 - tH/2}px)`
  }




  static scale(svg, elem, options){
    //let {x, y, width, height} = SVGHelper.getBBox(svg, elem)
    let [refX,refY,refWidth,refHeight] = SVGHelper.getBBoxArrOfElement(svg.querySelector('g#features'));
    let alignment = {
      'top-left': [refX, refY],
      'top-right': [refX+refWidth, refY],
      'top-center': [refX+(refWidth/2), refY],
      'bottom-left': [refX, refY+refHeight],
      'bottom-right': [refX+refWidth, refY+refHeight],
      'bottom-center': [refX+refWidth/2, refY + refHeight],
      'center-left': [refX, refY+refHeight/2],
      'center-right': [refX+refWidth, refY+refHeight/2],
      'center-center': [refX+refWidth/2, refY+refHeight/2],
      undefined: [refX,refY],
    }

    let [ _x, _y ] =  alignment[options.align] || alignment[undefined]
    elem.style.transformOrigin = `${_x}px ${_y}px`
    elem.style.transform += `scale(${options.scaleFactor})`
  }

  static calculateElementCoor(svg, elem, options){
    let [X,Y,W,H] = SVGHelper.getViewBoxArr(svg)

    let [x,y,width,height] = SVGHelper.getBBoxArr(svg,elem)

    let mainFeature = svg.querySelector(`g#features`)
    let [fx, fy, fw, fh] = SVGHelper.getBBoxArrOfElement(mainFeature); //[mainFeature.x, mainFeature.y, mainFeature.width, mainFeature.height]

    if(options.expandSVG){
      SVGHelper.setViewBox(svg, [X, Y-height, W, H+height])
    }

    //recalculate scaleFactor
    if(options.widthRatio){
      options.scaleFactor = fw / width * options.widthRatio;
    }

    let refFeature = svg.querySelector(`g#features`);
    let alignment = {
      'top-left': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignTopOfReference(svg, refFeature, elem)
        SVGHelper.alignLeftOfReference(svg, refFeature, elem)
      },
      'top-right': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignTopOfReference(svg, refFeature, elem)
        SVGHelper.alignRightOfReference(svg, refFeature, elem)
      },
      'top-center': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignTopOfReference(svg, refFeature, elem)
        SVGHelper.alignHorizontalCenterOfReference(svg, refFeature, elem)
      },
      'bottom-left': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignBottomOfReference(svg, refFeature, elem)
        SVGHelper.alignLeftOfReference(svg, refFeature, elem)
      },
      'bottom-right': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignBottomOfReference(svg, refFeature, elem)
        SVGHelper.alignRightOfReference(svg, refFeature, elem)
      },
      'bottom-center': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignBottomOfReference(svg, refFeature, elem, options)
        SVGHelper.alignHorizontalCenterOfReference(svg, refFeature, elem, options)
      },
      'center-left': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignVerticalCenterOfReference(svg, refFeature, elem)
        SVGHelper.alignLeftOfReference(svg, refFeature, elem)
      },
      'center-right': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignVerticalCenterOfReference(svg, refFeature, elem)
        SVGHelper.alignRightOfReference(svg, refFeature, elem)
      },
      'center-center': (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignVerticalCenterOfReference(svg, refFeature, elem)
        SVGHelper.alignHorizontalCenterOfReference(svg, refFeature, elem)
      },
      undefined: (svg,elem,options) => {
        SVGHelper.scale(svg, elem, options)
        SVGHelper.alignTopOfReference(svg, refFeature, elem)
        SVGHelper.alignLeftOfReference(svg, refFeature, elem)
      }
    }

    alignment[options.align](svg,elem,options);
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

  static calcFittingViewBox(svg){
    
    let vbs = Array.from(svg.children).map(elem => {
      return SVGHelper.getBBoxArrOfElement(elem)
    })
    console.log(vbs)
    return SVGHelper.calcSurroundingViewBox(vbs)
  }
}
