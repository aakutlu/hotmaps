class Zoomer {
  constructor(svgElement, options, sensitivity = 0.2) {
    this.svg = svgElement;
    this.defaultViewBox = svgElement.getAttribute("viewBox");
    this.sensitivity = sensitivity;
    this.mouseStart = null;
    this.pivot = null;
    this.zoominBtn = options.zoominBtn;
    this.zoomoutBtn = options.zoomoutBtn;
    this.zoomdefaultBtn = options.zoomDefaultBtn;
    this.setListeners()
  }

  setListeners(){
    this.zoominBtn.addEventListener("click", (event) => {
      this.zoomin();
    });
    this.zoomoutBtn.addEventListener("click", (event) => {
      this.zoomout();
    });
    this.zoomdefaultBtn.addEventListener("click", (event) => {
      this.reset();
    });
    this.svg.addEventListener("wheel", (event) => {
      this.wheelzoom(event);
    });
    this.svg.addEventListener("mousemove", (event) => {
      if (event.buttons === 1 && event.type === "mousemove") {
        this.shift(event);
      }
    });
    this.svg.addEventListener("mousedown", (event) => {
      this.setStart(event);
    });
    this.svg.addEventListener("mouseup", (event) => {
      event.target.style.cursor = "auto";
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
