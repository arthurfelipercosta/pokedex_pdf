import type { VisualMode, GenerationRange, SelectionMode, Masterset, PDFConfig } from '../types/pokemon';

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
    pokemon: ["92", "94", "100", "123", "198", "200", "215", "228", "229", "248", "262", "302", "354", "355", "359", "422", "442", "454", "479", "491", "558", "571", "609", "621", "630", "635", "645", "707", "713", "752", "754", "770", "773", "774", "792", "853", "858", "878", "889", "902", "921", "933", "945", "954", "960", "967", "971", "993", "1001", "1002", "1003", "1004", "1005", "1014", "1015", "1016", "1012", "1013", "1020", "1025"],
    total: '060',
    rarities: []
  },
  {
    id: 'fogo_sagrado',
    name: 'Fogo Sagrado',
    description: 'Pokémon do tipo fire',
    pokemon: ["37", "38", "58", "59", "126", "127", "136", "142", "146", "156", "157", "158", "160", "217", "218", "219", "227", "229", "240", "244", "250", "255", "256", "257", "321", "322", "323", "324", "384", "385", "391", "392", "435", "436", "437", "443", "467", "493", "508", "509", "510", "514", "554", "555", "556", "631", "636", "637", "643", "653", "654", "655", "668", "669", "670", "719", "720", "721", "727", "728", "729", "730", "731", "746", "747", "748", "749", "785", "786", "787", "807", "808", "809", "818", "819", "820", "833", "834", "851", "852", "853", "864", "865", "866", "907", "908", "909", "934", "945", "946", "959", "960", "961", "1018", "1020"],
    total: '095',
    rarities: []
  },
  {
    id: 'teste_raridade',
    name: 'Teste de Raridade',
    description: 'Pokémon para testar todas as raridades',
    pokemon: ["25", "25", "6", "150", "448", "384", "130", "143", "149", "249", "382"],
    total: '011',
    rarities: ['comum', 'incomum', 'incomum', 'raro', 'dr', 'raro', 'ur', 'sir', 'ir', 'hr', 'raro']
  }
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
  showRarity: true
};

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 }
};
