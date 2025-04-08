import {Maplib, Zoomer, Elem} from "../libraries/maplib.js"


const MAP_OPTIONS = {
  backgroundColor: 'cornflowerblue',
  defaultFillColor: 'tomato',
  defaultBorderColor: 'white',
  zoomerButtons: 'enabled',
  mouseWheelEventListeners: 'enabled',
  mouseSlideEventListeners: 'enabled',
  header: 'Map Header',
  footer: 'Map Footer',
  
  colorMappings: { //todo changed "mapping"
    "istanbul": 'red', 
    "konya":'gold' 
  },
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

MAP_OPTIONS.colorMappings = {
  "istanbul": "red", 
  "konya": "gold",
  samsun: "black",
  trabzon: "teal",
  ankara: "slategray",
  ağrı: "green"
}

let myMap1 = new Maplib( document.getElementById("container") , 'AZ.svg', MAP_OPTIONS )
myMap1.initialize()
await new Promise(resolve => setTimeout(resolve, 50));

myMap1.colorRandom()
//myMap1.fillFeatures(["samsun", "ordu", "giresun", "rize", "trabzon"], "teal")
window["mymap"] = myMap1