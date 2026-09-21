// Tipos para Pokémon e configurações do sistema

export interface PokemonForm {
  id: string;
  nome: string;
  imagem: string;
  tipos?: string[];
}

export interface PokemonEntry {
  nome: string;
  tipos: string[];
  formas?: PokemonForm[];
}

export type Pokedex = Record<string, PokemonEntry>;

// Identificador de Pokémon: "3" (base), "3-mega" (forma), "25-ex" (sufixo)
export type PokemonIdentifier = string;

export interface VisualMode {
  id: 'colorido' | 'sombra';
  label: string;
  folder: string;
  icon: string;
}

export interface GenerationRange {
  name: string;
  start: number;
  end: number;
}

export interface PDFConfig {
  visualMode: 'colorido' | 'sombra';
  pageSize: 'A4' | 'Letter';
  margin: number;
  gridRows: number;
  gridCols: number;
  showTypeIcons: boolean;
  showNumbers: boolean;
  showNames: boolean;
  showRarity: boolean;
}

export interface SelectionMode {
  id: 'completa' | 'geracao' | 'masterset' | 'manual';
  label: string;
  description: string;
}

export interface Masterset {
  id: string;
  name: string;
  description: string;
  pokemon: PokemonIdentifier[];
  total: string;
  rarities: string[];
}

export interface MastersetInfo {
  total: string;
  rarities: string[];
}

export interface ParsedInput {
  pokemon: PokemonIdentifier[];
  errors: string[];
  warnings: string[];
}
