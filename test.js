function matrixToObjectArray(matrix){
  return matrix.map((row,i,arr) => {
    let rowId = row[0]
    let cols = row.map((el,i,arr) => {
      return {
        column: matrix[0][i],
        value: el
      }
    }).filter(el => el.column)

    if(rowId)
      return {
        id: rowId,
        cols: cols
      }
    else return null;
  }).filter(el => el)
}

let matrix = [
  [null, 'col1', null, 'col3'],
  ['ankara', 1, 2, 3 ],
  ['istanbul', 4, null, null ],
  [null, 7, null, 9 ],
]

console.log(JSON.stringify(matrixToObjectArray(matrix)))
console.log( matrixToObjectArray(matrix) )