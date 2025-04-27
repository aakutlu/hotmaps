# Hotmaps
Hotmaps aims to create heatmap and choropleth type maps easily from spreadsheets. You can load .csv files and manipulate it with the help of handsontable.js library. Manipulation on spreadsheet triggers remapping of the SVG map colorings with respect to coloring method. While you manipulate the spreadsheet,  in parallel the map colorings updates. Hotmaps has 5 coloring methods;
1. Max Value
2. Second Max Value
3. Choropleth Type ( Percentage Range[0,100] )
4. Choropleth Type ( Open Range[-Infinity, +Infinity] ) 
5. String Matching

| _ids                 | donkeys | elephants | raccons | turtles |
|----------------------|---------|-----------|---------|---------|
| rectangle            |   42%   |    32%    |    13%  |   13%   |
| square               |   12%   |    12%    |    12%  |   12%   |
| perfectcircleislands |   12%   |    12%    |    12%  |   12%   |
| hexagon              |   12%   |    12%    |    12%  |   12%   |
| ellipse              |   12%   |    12%    |    12%  |   12%   |
| path                 |   12%   |    12%    |    12%  |   12%   |

Every coloring method works in their way. Max value colors the column which has the highest numeric value in a row. 

Why hotmaps?
Basic usage
how to add new maps


For testing hotmaps please [go](https://aakutlu.github.io/hotmaps/)

# CREATE YOUR OWN MAP
For Hotmaps to work properly, svg files must be in the following template format. ( [Here](svgmaps/shapeislands.svg) is a full svg template of my imaginary country `Shape Islands`. [This](svgmaps/XK.svg) is also the real svg example of `Kosovo` that you can examine.)
- First place your styling rules inside `<defs/>` tag. just don't touch the fill attribute (this is optional)
- `<g id="features"> ... </g>`
- `<g id="labels">`
- `<g id="legendRulerV">`
- `<g id="legendRulerH">`
- `<g id="other">`


### Features Group
Each city or district or state(which i call it "feature") should be placed inside a svg group element which has an `id=features` `<g id="features" fill="silver"> ... </g>`. Inside this group element,  you can place any number of features. Every `feature` is also eccapsulated with group element. Every feature group must have a unique id. You can place any number of valid svg elements inside this feature group ; `rect`, `path`, `polygon`, `circle` etc. Also you may want to place a `<title>Feature Name</title>` element to be able to show the user the feature name which hovered.

```xml
  <g id="features" fill="silver">
     <g id="uniqueFeatureID">
        <rect x="200" y="130" width="120" height="120"/>
        <title>featureName</title>
     </g>
     ...OTHER FATURES...
  </g>
```

### Labels Group
Lorem Ipsum
```xml
  <g id="labels" text-anchor="middle" dominant-baseline="middle">
    <text id="uniqueFeatureID" x="140" y="86" title="featureName">featureName</text>
    ...OTHER LABELS...
  </g>
```

### Legend Areas
Lorem Ipsum
```xml
  <g id="legendRulerV">
    <rect x="100" y="100" width="20" height="40" fill="none"/>
  </g>

  <g id="legendRulerH">
    <rect x="100" y="100" width="100" height="10" fill="none"/>
  </g>
```

### Other Paintings
Lorem Ipsum
```xml
  <g id="other">
    ...other paintings, text etc. For example seas, lakes, rivers, geolines, etc.
  </g>
```

Here is the full template of [Shape Islands](svgmaps/shapeislands.svg) you can work with

```svg
<svg
   version="1.1" id="shapeislands"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   width="500"
   height="500"
   viewBox="0 0 500 500"
   xml:space="preserve"
   style="background-color:whitesmoke;">

   <defs>
      <style>
         g#features *{
            cursor: pointer;
            stroke: white;
            stroke-width: 2px;
            vector-effect:non-scaling-stroke;
         }
         g#labels *{
            font-family: Poppins, monospace;
            font-size: .8em;
            pointer-events: none;
            user-select: none;
            stroke: white;
            stroke-width:0.3em;
            fill:black;
            paint-order:stroke;
            stroke-linejoin: round;
         }
         g#legendContainer *{
         pointer-events: none;
         user-select: none;
         }
         g#features g:hover{
            opacity: .5;
         }
      </style>
   </defs>
 
  <g id="features" fill="silver">
    <g id="path" fill="gold">
        <path d="M192,29 183,29 176,30 170,35 164,37 160,39 150,41 138,42 124,48 120,53 112,59 105,65 102,66 97,73 92,80 84,85 81,91 77,97 76,107 80,112 86,118 95,128 90,130 82,130 75,128 68,125 60,129 55,134 37,142 28,144 20,142 17,146 21,150 26,152 33,152 42,149 51,146 60,141 69,141 70,146 68,153 65,157 66,162 73,163 83,155 88,148 97,142 101,142 109,141 120,140 126,140 126,129 127,121 130,113 140,113 149,115 159,110 165,108 172,102 176,106 185,110 199,105 202,100 211,93 219,90 222,83 224,75 223,70 219,63 218,58 214,53 208,50 201,50 200,50 194,42 192,37z" title="Path"/>
        <title>Path</title>
     </g>
     <g id="square" fill="lime">
        <rect x="200" y="130" width="120" height="120"/>
        <title>Square</title>
     </g>
     <g id="rectangle" fill="crimson">
        <rect x="90" y="390" width="100" height="50"/>
        <title>Rectangle</title>
     </g>
     <g id="hexagon" fill="cornflowerblue">
         <polygon points="350,40 380,40 395,65.98 380,91.96 350,91.96 335,65.98"/>
        <polygon points="350,91.96 380,91.96 395,117.94 380,143.92 350,143.92 335,117.94"/>
        <polygon points="395,65.98 425,65.98 440,91.96 425,117.94 395,117.94 380,91.96"/>
        <title>Hexagon</title>
     </g>
     <g id="ellipse" fill="cyan">
        <ellipse rx="60" ry="40" cx="340" cy="380"/>
        <title>Ellipse</title>
     </g>
     <g id="circles" fill="teal">
        <circle cx="100" cy="220" r="10"/>
        <circle cx="130" cy="240" r="14"/>
        <circle cx="160" cy="264" r="18"/>
        <circle cx="180" cy="310" r="26"/>
        <title>Circles</title>
     </g>
  </g>

  <g id="labels" text-anchor="middle" dominant-baseline="middle">
   <text id="path" x="140" y="86" title="Path">Path</text>
   <text id="square" x="260" y="190" title="Square">Square</text>
   <text id="rectangle" x="140" y="415" title="Rectangle">Rectangle</text>
   <text id="hexagon" x="390" y="104" title="Hexagon">Hexagon</text>
   <text id="ellipse" x="340" y="380" title="Ellipse">Ellipse</text>
   <text id="circles" x="140" y="280" title="Circles">Circles</text>
  </g>

   <g id="legendRulerV">
    <rect x="500" y="520" width="88" height="132" fill="red" stroke="black" stroke-width="0" opacity="0" />
  </g>

  <g id="legendRulerH">
    <rect x="300" y="600" width="350" height="23" fill="blue" stroke="black" stroke-width="0" opacity="0" />
  </g>
</svg>
```
