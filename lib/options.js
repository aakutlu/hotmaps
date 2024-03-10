
const default_Options = {
  rowHeaders: true,
  colHeaders: true,
  columnSorting: true,
  colWidths: 60,
  startCols: 20,
  startRows: 100,
  autoWrapRow: true,
  fixedColumnsStart: 1,
  fixedRowsTop: 1,
  autoWrapCol: true,
  width: '500px',
  height: '100%',
  rowHeaderWidth: '200px',
  colHeaderHeight: '20px',
  //maxCols: 3,
  //maxRows: 30,
  //minSpareCols: 3,
  //minSpareRows: 3,
  outsideClickDeselects: true,
  className: 'htCenter',
  manualColumnResize: true,
  licenseKey: "non-commercial-and-evaluation", // for non-commercial use only
}
/* const columnOptions = [
  {
    title: 'Şehir',
    type: 'text',
    data: 'city',
    // disable sorting for the 'city' column
    columnSorting: {
      headerAction: false,
    },
  },
]; */

const columns_Option = {
  columns: [
    {data: 'city', type: 'text', width: '180', className: 'htCenter', readOnly: true},
    {data: 'akp', type: 'numeric', width: '80', className: 'htCenter',},
  ]
}

const colHeaders_Option = {
  colHeaders: ['City', 'Name1', 'Name2', '...']
}


const trigger_Options = {
/*   afterChange: function(changes, src){
    if(changes){
      let container = document.querySelector('#column-headers-container')
      container.replaceChildren()
      let colHeaders = this.getData()[0].filter(elem => elem)
      let SETTINGS = JSON.parse(localStorage.getItem('settings')) || {
        map: 'KKTC',
        strategy: 'max',
        colorgroups: {
          akp: 'yellow',
          chp: 'red',
          mhp: 'crimson',
          mem: 'blue',
          dem: 'purple',
          col1: 'cyan',
          column1: 'cyan'
        }
      }
      console.log(colHeaders)
      colHeaders.forEach(elem => {
        if(!SETTINGS.colorgroups[elem]){
          SETTINGS.colorgroups[elem] = chroma.random().hex();
        }
        console.log(SETTINGS)
        container.insertAdjacentHTML('beforeend', `<span><span style="background-color: ${SETTINGS.colorgroups[elem]}"></span><span>${elem}</span></span>`)
      })
      Array.from(container.children).forEach(elem => {
        elem.addEventListener('click', (event) => {
          console.log(event.target)
        })
      })
    }
  }, */
  cells: function (row, col) {
    let classList = ['htCenter']
    let ro = false;
    if (row % 2 == 0)  classList.push('hot-even-odd')
    if( col == 0){
      classList.push('hot-bold')
      ro = true
    } 
    return {className: classList.join(' '), readOnly: ro}
  },
  afterSelectRows: function(a,b,c){
    console.log(a,b,c)
  },
  afterColumnSort() {
    this.rowIndexMapper.moveIndexes(this.toVisualRow(0), 0);
  },
/*   afterSelectColumns: function(a,b,c){
    console.log(a,b,c)

  } */
}

export { default_Options, columns_Option, colHeaders_Option, trigger_Options}
