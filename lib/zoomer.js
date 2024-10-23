class Zoomer {
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
    this.disabled = false;
    this.hidden = false; //todo
    this.zoominBtn = options.zoominBtn;
    this.zoomoutBtn = options.zoomoutBtn;
    this.zoomdefaultBtn = options.zoomDefaultBtn;
    this.lockBtn = options.lockBtn;
    this.setListeners()
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
    let [finalX, finalY, finalW, finalH] = calcFittingViewBox([initialX, initialY, initialW, initialH], viewBoxArr)
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
    let finalViewBox = calcFittingViewBox(currViewBox, viewBoxArr)
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

export default Zoomer;