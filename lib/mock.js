import { Plaka } from "./plaka.js";

const cityList = [
  "adana",
  "adıyaman",
  "afyonkarahisar",
  "ağrı",
  "amasya",
  "ankara",
  "antalya",
  "artvin",
  "aydın",
  "balıkesir",
  "bilecik",
  "bingöl",
  "bitlis",
  "bolu",
  "burdur",
  "bursa",
  "çanakkale",
  "çankırı",
  "çorum",
  "denizli",
  "diyarbakır",
  "edirne",
  "elazığ",
  "erzincan",
  "erzurum",
  "eskişehir",
  "gaziantep",
  "giresun",
  "gümüşhane",
  "hakkari",
  "hatay",
  "ısparta",
  "mersin",
  "istanbul",
  "izmir",
  "kars",
  "kastamonu",
  "kayseri",
  "kırklareli",
  "kırşehir",
  "kocaeli",
  "konya",
  "kütahya",
  "malatya",
  "manisa",
  "kahramanmaraş",
  "mardin",
  "muğla",
  "muş",
  "nevşehir",
  "niğde",
  "ordu",
  "rize",
  "sakarya",
  "samsun",
  "siirt",
  "sinop",
  "sivas",
  "tekirdağ",
  "tokat",
  "trabzon",
  "tunceli",
  "şanlıurfa",
  "uşak",
  "van",
  "yozgat",
  "zonguldak",
  "aksaray",
  "bayburt",
  "karaman",
  "kırıkkale",
  "batman",
  "şırnak",
  "bartın",
  "ardahan",
  "ığdır",
  "yalova",
  "karabük",
  "kilis",
  "osmaniye",
  "düzce",
];
const partyList = ["akp", "chp", "dem", "mhp", "iyi", "saadet", "deva", "yrp", "hudapar", "dp", "tip", "dbp", "emep", "dsp", "memleket", "zafer"];

const Mock = {
  oneof: function (list) {
    if (!Array.isArray(list)) return null;
    return list.at(this.integer(0, list.length));
  },
  integer: function (min = 0, max = 1000) {
    let rand = Math.random() * (max - min) + min;
    return parseInt(rand);
  },
  floating: function (min = 0, max = 1000, decimal = 2) {
    let rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(decimal));
  },
  genMockDataPercentage: function () {
    let data = new Array(81);
    data.fill(0);
    return data.map((elem, i, arr) => {
      return {
        name: Plaka(i + 1),
        value: Mock.integer(0, 100),
      };
    });
  },
  genMockDataFourColumnPercentage: function () {
    let data = new Array(81);
    data.fill(0);
    return data.map((elem, i, arr) => {
      return {
        name: Plaka(i + 1),
        value1: Mock.integer(0, 100),
        value2: Mock.integer(0, 100),
        value3: Mock.integer(0, 100),
        value4: Mock.integer(0, 100),
      };
    });
  },
  genMockDataParty: function () {
    let data = new Array(81);
    data.fill(0);
    return data.map((elem, i, arr) => {
      return {
        name: Plaka(i + 1),
        value: Mock.oneof(["chp", "akp", "memleket", "mhp", "zafer", "deva", "hdp", "refah", "saadet", "gelecek", "tkp"]),
      };
    });
  },

  genMatrix: function(rows, cols, min=0, max=100){
    let height = rows.length + 1;
    let width = cols.length + 1;
    let matrix = new Array(height)
    matrix.fill(0)
    matrix.forEach((row,i,arr) => {
      arr[i] = new Array(width)
    })
  
    for(let i = 0; i<height; i++){
      for(let j = 0; j<width; j++){
        matrix[i][j] = min + Math.floor(Math.random() * (max-min))
        if(i == 0) matrix[0][j] = cols[j-1];
        if(i > 0) matrix[i][0] = rows[i-1];
      }
    }
  return matrix
  },
  genMockData: function(){
    return this.genMatrix(cityList, partyList)
  },
  
  //console.log(genMatrix(['foo', 'bar', 'zar', 'har', 'kar'], ['chp', 'akp', 'mhp', 'hdp', 'mem'], 20,30) )
};

export { Mock };
