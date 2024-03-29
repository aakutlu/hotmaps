const CITY_LIST = {
  1: "adana",
  2: "adıyaman",
  3: "afyonkarahisar",
  4: "ağrı",
  5: "amasya",
  6: "ankara",
  7: "antalya",
  8: "artvin",
  9: "aydın",
  10: "balıkesir",
  11: "bilecik",
  12: "bingöl",
  13: "bitlis",
  14: "bolu",
  15: "burdur",
  16: "bursa",
  17: "çanakkale",
  18: "çankırı",
  19: "çorum",
  20: "denizli",
  21: "diyarbakır",
  22: "edirne",
  23: "elazığ",
  24: "erzincan",
  25: "erzurum",
  26: "eskişehir",
  27: "gaziantep",
  28: "giresun",
  29: "gümüşhane",
  30: "hakkari",
  31: "hatay",
  32: "ısparta",
  33: "mersin",
  34: "istanbul",
  35: "izmir",
  36: "kars",
  37: "kastamonu",
  38: "kayseri",
  39: "kırklareli",
  40: "kırşehir",
  41: "kocaeli",
  42: "konya",
  43: "kütahya",
  44: "malatya",
  45: "manisa",
  46: "kahramanmaraş",
  47: "mardin",
  48: "muğla",
  49: "muş",
  50: "nevşehir",
  51: "niğde",
  52: "ordu",
  53: "rize",
  54: "sakarya",
  55: "samsun",
  56: "siirt",
  57: "sinop",
  58: "sivas",
  59: "tekirdağ",
  60: "tokat",
  61: "trabzon",
  62: "tunceli",
  63: "şanlıurfa",
  64: "uşak",
  65: "van",
  66: "yozgat",
  67: "zonguldak",
  68: "aksaray",
  69: "bayburt",
  70: "karaman",
  71: "kırıkkale",
  72: "batman",
  73: "şırnak",
  74: "bartın",
  75: "ardahan",
  76: "ığdır",
  77: "yalova",
  78: "karabük",
  79: "kilis",
  80: "osmaniye",
  81: "düzce",
  adana: 1,
  adıyaman: 2,
  afyon: 3,
  afyonkarahisar: 3,
  ağrı: 4,
  amasya: 5,
  ankara: 6,
  antalya: 7,
  artvin: 8,
  aydın: 9,
  balıkesir: 10,
  bilecik: 11,
  bingöl: 12,
  bitlis: 13,
  bolu: 14,
  burdur: 15,
  bursa: 16,
  çanakkale: 17,
  çankırı: 18,
  çorum: 19,
  denizli: 20,
  diyarbakır: 21,
  edirne: 22,
  elazığ: 23,
  erzincan: 24,
  erzurum: 25,
  eskişehir: 26,
  gaziantep: 27,
  antep: 27,
  giresun: 28,
  gümüşhane: 29,
  hakkari: 30,
  hatay: 31,
  ısparta: 32,
  içel: 33,
  mersin: 33,
  istanbul: 34,
  izmir: 35,
  kars: 36,
  kastamonu: 37,
  kayseri: 38,
  kırklareli: 39,
  kırşehir: 40,
  kocaeli: 41,
  konya: 42,
  kütahya: 43,
  malatya: 44,
  manisa: 45,
  kahramanmaraş: 46,
  maraş: 46,
  mardin: 47,
  muğla: 48,
  muş: 49,
  nevşehir: 50,
  niğde: 51,
  ordu: 52,
  rize: 53,
  sakarya: 54,
  samsun: 55,
  siirt: 56,
  sinop: 57,
  sivas: 58,
  tekirdağ: 59,
  tokat: 60,
  trabzon: 61,
  tunceli: 62,
  şanlıurfa: 63,
  urfa: 63,
  uşak: 64,
  van: 65,
  yozgat: 66,
  zonguldak: 67,
  aksaray: 68,
  bayburt: 69,
  karaman: 70,
  kırıkkale: 71,
  batman: 72,
  şırnak: 73,
  bartın: 74,
  ardahan: 75,
  ığdır: 76,
  yalova: 77,
  karabük: 78,
  kilis: 79,
  osmaniye: 80,
  düzce: 81,
};

const Plaka = (key) => {
  if (typeof key === "number") {
    return CITY_LIST[key];
  } else if (parseInt(key)) {
    return CITY_LIST[parseInt(key)];
  } else {
    return CITY_LIST[String(key).toLocaleLowerCase("TR-tr")];
  }
};

export { Plaka }
