// Takes a 2D array and converts every cell values in to __Float Numbers__ if possible, 
// Other values (string,object,array etc.) stays the same.
export function matrixNormalize(matrix){
  matrix.forEach(array => {
    array.forEach((el,i,arr) => {
      if(el !== '' && isFinite(el))
        arr[i] = parseFloat(el)
    })
  })
}

export function downloadSvg(svgElem, dimensions) {
  const canvas = document.createElement("canvas");
  const svg = svgElem
  const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  let viewBoxStr = svg.getAttribute("viewBox");
  const viewBoxArr = viewBoxStr
    .trim()
    .split(/\s{1,}/)
    .map((str) => parseInt(str));

  let w = dimensions?.width || viewBoxArr[2] || 1920;
  let h = dimensions?.height || viewBoxArr[3] || 1080;
/*   while(w < 1920 || h < 1080){
    w += w;
    h += h;
  } */
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