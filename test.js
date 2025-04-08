function clearRightMostEmptyColumns(sheet){
  sheet.forEach((rowArr) => {
    for(let j = rowArr.length-1; j>=0; j--){
      if(rowArr[j]) break; 
      rowArr.splice(j,1)
    }
  })
}

function clearBottomMostEmptyRows(sheet){
  let isEmpty = (arr) => arr.every(elem => !elem && elem!==0 )
  for(let i = sheet.length-1; i>=0; i--){
    if(!isEmpty(sheet[i])) break;
    sheet.splice(i,1)
  }
}
let sheet = [
  [1,1,1,null,null,null],
  [2,2,2,null,null,null],
  [3,3,3,null,null,""],
  [4,4,4,null,4,undefined],
  [null,undefined,"",0,1,2],
  [null],
  [null,undefined],
  [null,undefined,""],
  [],
  [null]
]

clearBottomMostEmptyRows(sheet)
//clearRightMostEmptyColumns(sheet)
console.log(sheet)