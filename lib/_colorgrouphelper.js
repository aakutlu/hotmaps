
function matrixToFlatArray(matrix) {
  let flatArray = []
  for(let r = 0; r < matrix.length; r++ ){
    for(let c = 0; c < matrix[r].length; c++ ){
      flatArray.push({
        rowHeader: matrix[r][0],
        colHeader: matrix[0][c],
        row: r,
        col: c,
        value: matrix[r][c]
      })
    }
  }
  return flatArray;
}

function genColorMapping(matrix, options) {
  let flatArray = matrixToFlatArray(matrix)

  if (options.strategy === "max") {
    return colorMapping_Max(flatArray, options)
  }
/*   else if( options.strategy === 'choropleth' ){
    return colorMapping_Choropleth(flatArray, options)
  } */
  else return []
}

function colorMapping_Max(flatArray, options){
  let onlyDataCells = flatArray.filter(elem => elem.col !== 0 && elem.row !== 0)
  let result = Object.groupBy(onlyDataCells, ({rowHeader}) => rowHeader)

  Object.values(result).forEach((elem,i,arr) => {
    elem.sort((a,b) => b.value - a.value) // sort desc
    let max = elem[0]
    max.color = options.colorgroups[max.colHeader] || '#random'
  })
  return Object.values(result).flatMap(el => el)
}

const matrix = [
  [null, 'akp', 'chp'],
  ['ankara', 10,2],
  ['adana', 30,4],
  ['samsun', 50,6],
]
const options = {
  strategy: 'max',
  colorgroups: {
    akp: 'orange',
    chp: 'red',
    dem: 'purple'
  }
}
//console.log('  FLAT ARRAY ========================================\n', matrixToFlatArray(matrix) )
console.log('  COLOR MAP  ========================================\n', genColorMapping(matrix, options))