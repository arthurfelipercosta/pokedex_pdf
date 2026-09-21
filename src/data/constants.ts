import type { VisualMode, GenerationRange, SelectionMode, Masterset, MastersetCategory, PDFConfig, FormCategories } from '../types/pokemon';

export const VISUAL_MODES: VisualMode[] = [
  {
    id: 'colorido',
    label: 'Colorido',
    folder: 'pokemon',
    icon: '🎨'
  },
  {
    id: 'sombra',
    label: 'Sombra',
    folder: 'silhuetas',
    icon: '🌑'
  }
];

export const GENERATIONS: GenerationRange[] = [
  { name: 'Geração 1', start: 1, end: 151 },
  { name: 'Geração 2', start: 152, end: 251 },
  { name: 'Geração 3', start: 252, end: 386 },
  { name: 'Geração 4', start: 387, end: 493 },
  { name: 'Geração 5', start: 494, end: 649 },
  { name: 'Geração 6', start: 650, end: 721 },
  { name: 'Geração 7', start: 722, end: 809 },
  { name: 'Geração 8', start: 810, end: 905 },
  { name: 'Geração 9', start: 906, end: 1025 }
];

export const SELECTION_MODES: SelectionMode[] = [
  {
    id: 'completa',
    label: 'Pokédex Completa',
    description: 'Todos os 1025 Pokémon'
  },
  {
    id: 'geracao',
    label: 'Por Geração',
    description: 'Selecione uma geração específica'
  },
  {
    id: 'masterset',
    label: 'Masterset',
    description: 'Coleções pré-definidas'
  },
  {
    id: 'manual',
    label: 'Manual',
    description: 'Digite números ou nomes personalizados'
  }
];

export const MASTERSETS: Masterset[] = [
  {
    id: 'escuridao_absoluta',
    name: 'Escuridão Absoluta',
    description: 'Coleção TCG Megaevolução - Escuridão Absoluta',
    logo: '/pokedex/logos/pitch-black.png',
    pokemon: ["357","736","753","754-ex", "1012", "1013", "485","655-mega-ex",
      "850","851","935","936","118","119","320","321-ex","369","728","729","730",
      "963","964","309","310","737","738","807-mega-ex","1008","79","80","80-mega-ex",
      "124","353","354","442","607","608","609-mega-ex","781","802","979","56","57",
      "408","409-ex","529","1007","491-mega-ex","629","630","686","687","827","828",
      "877-ex","893","942","943","1004","227","410","411","436","437","530-mega-ex",
      "731","732","733","772","773","962","753","936","118","730","310","80","781",
      "828","411","733","773","754-ex","321-ex","807-ex","609-ex","409-ex","491-mega-ex",
      "877-ex","530-mega-ex","807-mega-ex","609-mega-ex","491-mega-ex","877-ex","491-mega-ex"],
      
    setNumbers: [
      "001", "002", "003", "004", "005", "006", "007", "008", "009", "010",
      "011", "012", "013", "014", "015", "016", "017", "018", "019", "020",
      "021", "022", "023", "024", "025", "026", "027", "028", "029", "030",
      "031", "032", "033", "034", "035", "036", "037", "038", "039", "040",
      "041", "042", "043", "044", "045", "046", "047", "048", "049", "050",
      "051", "052", "053", "054", "055", "056", "057", "058", "059", "060",
      "061", "062", "063", "064", "065", "066", "067", "068", "069", "070",
      "071", "085", "086", "087", "088", "089", "090", "091", "092", "093",
      "094", "095", "096", "097", "098", "099", "100", "101", "102", "103",
      "114", "115", "116", "117", "120"
    ],
    total: '084',
    rarities: [
      "c",   "c",   "c",   "dr",  "c",   "in",  "in",  "dr",  "c",   "c", 
      "c",   "r",   "c",   "in",  "c",   "dr",  "in",  "c",   "c",   "r",
      "c",   "in",  "c",   "in",  "c",   "in",  "dr",  "r",   "c",   "in",
      "dr",  "c",   "c",   "in",  "r",   "c",   "in",  "dr",  "in",  "in",
      "in",  "c",   "c",   "c",   "dr",  "c",   "r",   "dr",  "c",   "c",
      "c",   "in",  "c",   "in",  "dr",  "r",   "c",   "c",   "r",   "c",
      "c",   "r",   "c",   "in",  "dr",  "c",   "c",   "in",  "c",   "r",
      "c",   "ir",  "ir",  "ir",  "ir",  "ir",  "ir",  "ir",  "ir",  "ir",
      "ir",  "ir",  "ur",  "ur",  "ur",  "ur",  "ur",  "ur",  "ur",  "ur",
      "sir", "sir", "sir", "sir", "mhr"
    ]
  },
  {
    id: 'teste_raridade',
    name: 'Teste de Raridade',
    description: 'Pokémon para testar todas as raridades',
    pokemon: ["25", "25", "6", "150", "448", "384", "130", "143", "149", "249", "382"],
    total: '011',
    rarities: ['c', 'in', 'in', 'r', 'dr', 'r', 'ur', 'sir', 'ir', 'hr', 'r']
  }
];

export const MASTERSET_CATEGORIES: MastersetCategory[] = [
  {
    id: 'megaevolucao',
    name: 'Megaevolução',
    icon: '⚡',
    sets: MASTERSETS.filter(s => ['escuridao_absoluta'].includes(s.id)),
  },
  {
    id: 'escarlate_violeta',
    name: 'Escarlate & Violeta',
    icon: '💎',
    sets: [],
  },
  {
    id: 'tipos',
    name: 'Por Tipo',
    icon: '🔥',
    sets: MASTERSETS.filter(s => s.id === 'fogo_sagrado'),
  },
  {
    id: 'teste',
    name: 'Testes',
    icon: '🧪',
    sets: MASTERSETS.filter(s => s.id === 'teste_raridade'),
  },
];

export const DEFAULT_CONFIG: PDFConfig = {
  visualMode: 'colorido',
  pageSize: 'A4',
  margin: 20,
  gridRows: 3,
  gridCols: 3,
  showTypeIcons: true,
  showNumbers: true,
  showNames: true,
  showRarity: true,
  numberingMode: 'sequential',
};

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 }
};

export const FORM_CATEGORIES: FormCategories = {
  mega: {
    id: 'mega',
    label: 'Megas & Primal',
    forms: ['mega', 'megax', 'megay', 'primal'],
  },
  giga: {
    id: 'giga',
    label: 'Gigantamax',
    forms: ['giga'],
  },
  regional: {
    id: 'regional',
    label: 'Regionais',
    forms: ['alola', 'galar', 'hisui', 'paldea', 'paldea-combat', 'paldea-blaze', 'paldea-aqua'],
  },
  other: {
    id: 'other',
    label: 'Outras Formas',
    forms: [
      'therian', 'origin', 'sky', 'blade', 'crowned', 'eternal', 'unbound',
      'resolute', 'pirouette', 'zen', 'galar-zen',
      'sunny', 'rainy', 'snowy', 'autumn', 'summer', 'winter', 'sunshine',
      'east', 'sandy', 'trash', 'blue', 'white', 'black',
      'dusk', 'mid', 'noice', 'lowkey', 'attack', 'deffense', 'speed',
      'fan', 'frost', 'heat', 'mow', 'wash', 'busted', 'red', 'dawn', 'ultra',
      'max', 'rapid', 'single', 'shadow', 'ice', 'blood', 'tera', 'stellar',
    ],
  },
};
