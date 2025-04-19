/* let sampleSheet = [
  ["", "1col", "col2", "col3"],
  ["ankara", "1", '2', `3`, "", "", ""],
  ["adana", 1, 2, 3, null, undefined],
  ["samsun", 1, 2, 3],
  ["izmit", 1, 2, 3],
  ["izmir", 1, 2, 3],
  ["123", 1, 2, 3],
] */

import Mock from "./mock.js";

export default class MatrixHelpers {

  //static isConvertibleToNumber = (value) => value !== "" && value !== null && !Array.isArray(value) && isFinite(value);

  static isConvertibleToNumber = (value) => !isNaN(parseFloat(value)) && isFinite(value);

  // convert array cell values to "float" if possible, otherwise same.
  static matrixNormalize(sheet) {
    sheet.forEach((array) => {
      array.forEach((el, i, arr) => {
        if (MatrixHelpers.isConvertibleToNumber(el)) arr[i] = parseFloat(el);
      });
    });
    return sheet;
  }

  // same as above except don't touch first column and first row
  static matrixParseFloatExceptLabels(sheet) {
    for (let i = 0; i < sheet.length; i++) {
      for (let j = 0; j < sheet[i].length; j++) {
        let cellValue = sheet[i][j];
        if (i == 0 || j == 0) continue;
        if (MatrixHelpers.isConvertibleToNumber(cellValue)) {
          sheet[i][j] = parseFloat(cellValue);
        }
      }
    }
    return sheet;
  }

  static genMatrix(rowNum, colNum, cellValueGeneratorFn) {
    let matrix = new Array(rowNum);
    matrix.fill(0);
    matrix.forEach((row, i, arr) => {
      arr[i] = new Array(colNum);
    });

    for (let i = 0; i < rowNum; i++) {
      for (let j = 0; j < colNum; j++) {
        matrix[i][j] = cellValueGeneratorFn();
      }
    }

    return matrix;
  }

  static genSheet(rowHeaders, colHeaders, generator) {
    generator = generator || Mock.integer;
    let matrix = MatrixHelpers.genMatrix(rowHeaders.length, colHeaders.length, generator);

    MatrixHelpers.insertRow(matrix, colHeaders, 0);
    rowHeaders.unshift("");
    MatrixHelpers.insertCol(matrix, rowHeaders, 0);

    return matrix;
  }

  static fillEmptyMatrixCells(sheet, generator) {
    generator = generator || Mock.integer;
    let isEmpty = (x) => x === null || x === "" || x === undefined;

    for (let i = 0; i < sheet.length; i++) {
      for (let j = 0; j < sheet[i].length; j++) {
        if (j == 0 || i == 0) continue;
        let cellvalue = sheet[i][j];
        if (isEmpty(cellvalue) && !isEmpty(sheet[i][0]) && !isEmpty(sheet[0][j])) {
          sheet[i][j] = generator();
        }
      }
    }
    return sheet;
  }

  static getCell(sheet, row, col) {
    return sheet[row][col];
  }

  static setCell(sheet, row, col, value) {
    sheet[row][col] = value;
  }

  static clearEmptyColumns(sheet) {
    let row0 = sheet[0];
    for (let i = row0.length - 1; i >= 1; i--) {
      if (!row0[i]) {
        for (let j = 0; j < sheet.length; j++) {
          let currRow = sheet[j];
          currRow.splice(i, 1);
        }
      }
    }
  }

  static clearEmptyRows(sheet) {
    for (let i = sheet.length - 1; i >= 1; i--) {
      if (!sheet[i][0]) sheet.splice(i, 1);
    }
  }

  static clearRightMostEmptyColumns(sheet) {
    sheet.forEach((rowArr) => {
      for (let j = rowArr.length - 1; j >= 0; j--) {
        if (rowArr[j]) break;
        rowArr.splice(j, 1);
      }
    });
  }

  static clearBottomMostEmptyRows(sheet) {
    let isEmpty = (arr) => arr.every((elem) => !elem && elem !== 0);
    for (let i = sheet.length - 1; i >= 0; i--) {
      if (!isEmpty(sheet[i])) break;
      sheet.splice(i, 1);
    }
  }

  static deleteColumn(sheet, col) {
    sheet.forEach((row) => {
      row.splice(col, 1);
    });
  }

  static deleteRow(sheet, row) {
    sheet.splice(row, 1);
  }

  static getColumn(sheet, col) {
    let column = [];
    sheet.forEach((row) => {
      column.push(row[col]);
    });
    return column;
  }

  static getRow(sheet, col) {
    return sheet[col];
  }

  static getCells(sheet, r1, c1, r2, c2) {
    // cell1 [r1,c1]
    // cell2 [r2,c2]
    // r1 - topleftcell row number,     c1 topleftcell column number
    // r2 - bottomrightcell row number, c2 bottomrightcell column number
    let bottomRightCellColNum = sheet.at(-1).length - 1;
    let bottomRightCellRowNum = sheet.length - 1;
    // Check for ranges
    if (r1 >= sheet.length || c1 >= sheet.at(-1).length || r1 > r2 || c1 > c2) return [[]];

    //check if r2,c2 out of sheet range
    if (r2 > bottomRightCellRowNum) r2 = bottomRightCellRowNum;
    if (c2 > bottomRightCellColNum) c2 = bottomRightCellColNum;

    // Generate empty sheet
    let resultSheet = [];
    let colnum = c2 - c1 + 1;
    let rownum = r2 - r1 + 1;
    for (let i = 0; i < rownum; i++) {
      resultSheet.push(new Array(colnum));
    }

    // Fill empty sheet
    for (let i = 0; i < resultSheet.length; i++) {
      for (let j = 0; j < resultSheet[i].length; j++) {
        resultSheet[i][j] = sheet[i + r1][j + c1];
      }
    }
    return resultSheet;
  }

  static insertRow(sheet, rowArr, rowIndex) {
    sheet.splice(rowIndex, 0, rowArr);
  }

  static insertCol(sheet, colArr, colIndex) {
    for (let i = 0; i < sheet.length; i++) {
      let currRow = sheet[i];
      let currValue = colArr[i];
      currRow.splice(colIndex, 0, currValue);
    }
  }
}
/* let s = [
  ["cities", "color", "km", "region", "", ".", ""],
  ["ankara", "red", 2324, "içanadolu", "", "", ""],
  ["adana", "yellow", 18987, "akdeniz", null, undefined],
  ["istanbul", "green", 19876, "marmara", null, undefined],
]

// 5 x 5 sheet
let sht = [
  ["A1","B1","C1","D1","E1","F1"],
  ["A2","B2","C2","D2","E2","F2"],
  ["A3","B3","C3","D3","E3","F3"],
  ["A4","B4","C4","D4","E4","F4"],
  ["A5","B5","C5","D5","E5","F5"],
  ["A6","B6","C6","D6","E6","F6"]
]
let sht2 = [
  ["A1","B1"],
  ["A2","B2"],
] */

//console.log(matrixNormalize(sampleSheet))
//clearEmptyColumns(s)
//console.table(s)
//console.log(getRow(s, 1))

//let result = getCells(sht, 5,5,4,4)
//console.table(result)

//insertRow(sht2, ["xxx", "yyy"],5)
//insertRow(sht2, ["xxx", "yyy"],0)
//console.table(sht2)
//console.table(getRow(sht2,1))
//console.log(getRow(sht2,1))
