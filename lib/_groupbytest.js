const inventory = [
  { name: "asparagus", type: "vegetables", quantity: 5 },
  { name: "bananas", type: "fruit", quantity: 0 },
  { name: "goat", type: "meat", quantity: 23 },
  { name: "cherries", type: "fruit", quantity: 5 },
  { name: "fish", type: "meat", quantity: 22 },
];
const cities = [
  { rowHeader: null, colHeader: null, row: 0, col: 0, value: null },
  { rowHeader: null, colHeader: "col1", row: 0, col: 1, value: "col1" },
  { rowHeader: null, colHeader: "col2", row: 0, col: 2, value: "col2" },
  { rowHeader: "ankara", colHeader: null, row: 1, col: 0, value: "ankara" },
  { rowHeader: "ankara", colHeader: "col1", row: 1, col: 1, value: 1 },
  { rowHeader: "ankara", colHeader: "col2", row: 1, col: 2, value: 2 },
  { rowHeader: "adana", colHeader: null, row: 2, col: 0, value: "adana" },
  { rowHeader: "adana", colHeader: "col1", row: 2, col: 1, value: 3 },
  { rowHeader: "adana", colHeader: "col2", row: 2, col: 2, value: 4 },
  { rowHeader: "samsun", colHeader: null, row: 3, col: 0, value: "samsun" },
  { rowHeader: "samsun", colHeader: "col1", row: 3, col: 1, value: 5 },
  { rowHeader: "samsun", colHeader: "col2", row: 3, col: 2, value: 6 },
];

const result = Object.groupBy(inventory, ({type}) => type);


console.log(Object.keys(result));
console.log(result);
