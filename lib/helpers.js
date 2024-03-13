export function matrixNormalize(matrix){
  matrix.forEach(array => {
    array.forEach((el,i,arr) => {
      if(el !== '' && isFinite(el))
        arr[i] = parseFloat(el)
    })
  })
}
