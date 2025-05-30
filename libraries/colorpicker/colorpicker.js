
class ColorPicker{
  static colors = [
    ["#FFFFFF", "#F5F5F5", "#EEEEEE", "#E0E0E0", "#BDBDBD", "#9E9E9E", "#757575", "#616161", "#424242", "#000000"], // blacks
    ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"], // reds
    ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#EC407A", "#E91E63", "#D81B60", "#C2185B", "#AD1457", "#880E4F"], // red-pinks
    ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "#AB47BC", "#9C27B0", "#8E24AA", "#7B1FA2", "#6A1B9A", "#4A148C"], // purples
    ["#EDE7F6", "#D1C4E9", "#B39DDB", "#9575CD", "#7E57C2", "#673AB7", "#5E35B1", "#512DA8", "#4527A0", "#311B92"], // purple-blues
    ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E"], // navyblues
    ["#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2", "#1565C0", "#0D47A1"], // blues1
    ["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6", "#03A9F4", "#039BE5", "#0288D1", "#0277BD", "#01579B"], // blues2
    ["#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA", "#00BCD4", "#00ACC1", "#0097A7", "#00838F", "#006064"], // teal
    ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#26A69A", "#009688", "#00897B", "#00796B", "#00695C", "#004D40"], // darkgreen
    ["#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50", "#43A047", "#388E3C", "#2E7D32", "#1B5E20"], // green
    ["#F1F8E9", "#DCEDC8", "#C5E1A5", "#AED581", "#9CCC65", "#8BC34A", "#7CB342", "#689F38", "#558B2F", "#33691E"], // yellow-green
    ["#F9FBE7", "#F0F4C3", "#E6EE9C", "#DCE775", "#D4E157", "#CDDC39", "#C0CA33", "#AFB42B", "#9E9D24", "#827717"], // olive
    ["#FFFDE7", "#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58", "#FFEB3B", "#FDD835", "#FBC02D", "#F9A825", "#F57F17"], // orange-yellow
    ["#FFF8E1", "#FFECB3", "#FFE082", "#FFD54F", "#FFCA28", "#FFC107", "#FFB300", "#FFA000", "#FF8F00", "#FF6F00"], // Oranges1
    ["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#F57C00", "#EF6C00", "#E65100"], // Oranges2
    ["#FBE9E7", "#FFCCBC", "#FFAB91", "#FF8A65", "#FF7043", "#FF5722", "#F4511E", "#E64A19", "#D84315", "#BF360C"], // Oranges3
    ["#EFEBE9", "#D7CCC8", "#BCAAA4", "#A1887F", "#8D6E63", "#795548", "#6D4C41", "#5D4037", "#4E342E", "#3E2723"], // Browns
    ["#ECEFF1", "#CFD8DC", "#B0BEC5", "#90A4AE", "#78909C", "#607D8B", "#546E7A", "#455A64", "#37474F", "#263238"], // Grays
  ];

  constructor(){

  }

  static init(){

    let cppContainer = document.querySelector("#colorPickerPaletteContainer")
    // if Color Picker Palette does not exist, create it
    if(!cppContainer){
      window.COLORPICKER = {
        colorPickerContainer: null,
        lastClickedElem: null,
        lastSelectedColor: null,
        callback: null,
        timeoutId: null
      };
      cppContainer = document.createElement("div")
      cppContainer.setAttribute("id", "colorPickerPaletteContainer")
      // Generate palette
      this.colors.flat().forEach(colorcode => {
        let colorBox = document.createElement("span");
        colorBox.setAttribute("data-colorcode", colorcode);
        colorBox.style.backgroundColor = colorcode;
        cppContainer.appendChild(colorBox);
      })
      // place cppContainer to document
      document.body.appendChild(cppContainer)
      window.COLORPICKER.colorPickerContainer = cppContainer


      // Attach event listeners
      cppContainer.addEventListener("click", (event) => {
        event.stopPropagation();
        if (event.target.tagName.toLowerCase() === "span") {  //mark clicked box
          Array.from(cppContainer.querySelectorAll("span")).forEach((span) => {  //reset selected box border
            span.style.border = "";
          });
          event.target.style.border = "solid 2px black";
        }
        let colorcode = event.target.getAttribute("data-colorcode");
        console.log(`%c${colorcode}`, `background-color: ${colorcode}`)
        window.COLORPICKER.callback(colorcode)
      });

      // debounce helper function
      const debounce = (callback) => {
        clearTimeout(window.COLORPICKER.timeoutId)
        window.COLORPICKER.timeoutId = setTimeout(() => callback(), 200)
      }

      // Mouseover Event Listeners
      cppContainer.addEventListener("mouseleave", (event) => {
        console.log(".")
        debounce(() => {
          window.COLORPICKER.colorPickerContainer.style.display = "none";
        })

      });

/*       let timeoutId

      const debounce = (callback) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => callback(), 1200)
      }
  
      input.addEventListener('input', () => {
        debounce(() => {
          console.log(`Searching data from database...`)
        })
      }) */



    }

/*     window.addEventListener("click", (event) => {
      console.log("window clicked")
      console.log("event.target => ", event.target)
      console.log("last clicked => ", window.COLORPICKER.lastClickedElem)
      console.log(event.target == window.COLORPICKER.lastClickedElem)
      if(event.target != window.COLORPICKER.lastClickedElem){
        cppContainer.style.display = "none";
      }
    }) */
  }

  static fire(target, options, callback){

    if(!target){
      console.warn("Clicked target element is null")
      return;
    } 

    let cppContainer = document.querySelector("#colorPickerPaletteContainer")
    if (window.COLORPICKER.lastClickedElem === target && cppContainer.style.display !== "none"){
      // make palette invisible
      window.COLORPICKER.lastClickedElem = null;
      cppContainer.style.display = "none";
    } else{
      // make palette visible
      window.COLORPICKER.lastClickedElem = target;
      const rect = target.getBoundingClientRect();
      cppContainer.style.left = `${rect.left}px`;
      cppContainer.style.top = `${rect.bottom + 2}px`; // 5px below button
      cppContainer.style.display = "grid";
    }

    window.COLORPICKER.callback = callback
  }
}

window.addEventListener("load", (event) => {
  ColorPicker.init()
})
