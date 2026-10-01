import type { Pokedex, PokemonIdentifier } from '../types/pokemon';

// Formas conhecidas (mudam imagem)
const KNOWN_FORMS: Record<string, string> = {
  'mega': 'mega',
  'megax': 'megax',
  'megay': 'megay',
  'x': 'megax',
  'y': 'megay',
  'giga': 'giga',
  'gmax': 'giga',
  'gigantamax': 'giga',
  'alola': 'alola',
  'alolan': 'alola',
  'galar': 'galar',
  'galarian': 'galar',
  'hisui': 'hisui',
  'hisuian': 'hisui',
  'paldea': 'paldea',
  'paldean': 'paldea',
  'paldea-combat': 'paldea-combat',
  'paldea-blaze': 'paldea-blaze',
  'paldea-aqua': 'paldea-aqua',
  'primal': 'primal',
  'therian': 'therian',
  'origin': 'origin',
  'sky': 'sky',
  'blade': 'blade',
  'crowned': 'crowned',
  'eternal': 'eternal',
  'unbound': 'unbound',
  'resolute': 'resolute',
  'pirouette': 'pirouette',
  'zen': 'zen',
  'galar-zen': 'galar-zen',
  'sunny': 'sunny',
  'rainy': 'rainy',
  'snowy': 'snowy',
  'autumn': 'autumn',
  'summer': 'summer',
  'winter': 'winter',
  'sunshine': 'sunshine',
  'east': 'east',
  'sandy': 'sandy',
  'trash': 'trash',
  'blue': 'blue',
  'white': 'white',
  'black': 'black',
  'dusk': 'dusk',
  'mid': 'mid',
  'noice': 'noice',
  'lowkey': 'lowkey',
  'attack': 'attack',
  'deffense': 'deffense',
  'speed': 'speed',
  'fan': 'fan',
  'frost': 'frost',
  'heat': 'heat',
  'mow': 'mow',
  'wash': 'wash',
  'busted': 'busted',
  'red': 'red',
  'dawn': 'dawn',
  'ultra': 'ultra',
  'max': 'max',
  'rapid': 'rapid',
  'single': 'single',
  'giga-rapid': 'giga-rapid',
  'giga-single': 'giga-single',
  'shadow': 'shadow',
  'ice': 'ice',
  'blood': 'blood',
  'tera': 'tera',
  'stellar': 'stellar',
};

export const KNOWN_FORMS_MAP = KNOWN_FORMS;

// Sufixos conhecidos (só texto no nome)
const KNOWN_SUFFIXES: Record<string, string> = {
  'ex': 'EX',
  'gx': 'GX',
  'v': 'V',
  'vmax': 'VMAX',
  'vstar': 'VSTAR',
  'break': 'BREAK',
  'level': 'Level',
};


export interface ParsedIdentifier {
  num: number;
  form?: string;
  suffix?: string;
}

export function parseIdentifier(id: PokemonIdentifier): ParsedIdentifier {
  // "3" → { num: 3 }
  // "3-mega" → { num: 3, form: "mega" }
  // "3-megax" → { num: 3, form: "megax" }
  // "25-ex" → { num: 25, suffix: "EX" }
  // "3-mega-ex" → { num: 3, form: "mega", suffix: "EX" }
  // "3-giga-ex" → { num: 3, form: "giga", suffix: "EX" }
  // "201-a" → { num: 201, form: "a" }
  const parts = id.split('-');
  const num = parseInt(parts[0]);
  if (isNaN(num) || parts.length === 1) {
    return { num };
  }

  const restParts = parts.slice(1);
  const fullRest = restParts.join('-').toLowerCase();

  // 1. Full rest is a known compound form (e.g., "megax", "galar-zen", "paldea-combat")
  if (KNOWN_FORMS[fullRest]) {
    return { num, form: KNOWN_FORMS[fullRest] };
  }

  // 2. Full rest is a known suffix (e.g., "ex", "gx", "vmax")
  if (KNOWN_SUFFIXES[fullRest]) {
    return { num, suffix: KNOWN_SUFFIXES[fullRest] };
  }

  // 3. Try compound: form + suffix (e.g., "mega-ex" → form=mega, suffix=EX)
  //    Try splitting at each position: first part = form, rest = suffix
  for (let i = 1; i < restParts.length; i++) {
    const formCandidate = restParts.slice(0, i).join('-').toLowerCase();
    const suffixCandidate = restParts.slice(i).join('-').toLowerCase();
    if (KNOWN_FORMS[formCandidate] && KNOWN_SUFFIXES[suffixCandidate]) {
      return { num, form: KNOWN_FORMS[formCandidate], suffix: KNOWN_SUFFIXES[suffixCandidate] };
    }
  }

  // 4. Single part, unknown - treat as form (e.g., "a", "b" for Unown)
  if (restParts.length === 1) {
    return { num, form: restParts[0].toLowerCase() };
  }

  // 5. Compound but unrecognized - use first known form part, rest as-is
  const firstForm = KNOWN_FORMS[restParts[0].toLowerCase()];
  if (firstForm) {
    return { num, form: firstForm };
  }

  return { num, form: fullRest };
}

export function identifierToNum(id: PokemonIdentifier): number {
  return parseIdentifier(id).num;
}

export function getImagePath(id: PokemonIdentifier, visualMode: 'colorido' | 'sombra', paraPDF = false): string {
  const { num, form } = parseIdentifier(id);
  const base = paraPDF ? 'pngs' : 'webps';
  const ext = paraPDF ? 'png' : 'webp';

  if (form) {
    const folder = visualMode === 'colorido' ? 'forms' : 'silhuetas_forms';
    return `/pokedex/${base}/${folder}/${String(num).padStart(4, '0')}-${form}.${ext}`;
  }

  const folder = visualMode === 'colorido' ? 'pokemon' : 'silhuetas';
  return `/pokedex/${base}/${folder}/${String(num).padStart(4, '0')}.${ext}`;
}

export function getPokemonDisplayName(id: PokemonIdentifier, pokedex: Pokedex): string {
  const { num, form, suffix } = parseIdentifier(id);
  const entry = pokedex[String(num)];
  if (!entry) return `#${num}`;

  let name = entry.nome;

  // Check if there's a form with a custom name
  if (form && entry.formas) {
    const formEntry = entry.formas.find(f => f.id === form);
    if (formEntry) {
      name = formEntry.nome;
    } else {
      name = `${entry.nome} (${form})`;
    }
  }

  // Append suffix
  if (suffix) {
    name = `${name} ${suffix}`;
  }

  return name;
}

export function getPokemonTypes(id: PokemonIdentifier, pokedex: Pokedex): string[] {
  const { num, form } = parseIdentifier(id);
  const entry = pokedex[String(num)];
  if (!entry) return [];

  // Check if form has custom types
  if (form && entry.formas) {
    const formEntry = entry.formas.find(f => f.id === form);
    if (formEntry?.tipos) {
      return formEntry.tipos;
    }
  }

  return entry.tipos ?? [];
}

export function isForm(id: PokemonIdentifier): boolean {
  const { form } = parseIdentifier(id);
  return !!form;
}

export function getBaseNum(id: PokemonIdentifier): number {
  return identifierToNum(id);
}

export interface SpecialCard {
  kind: 'trainer' | 'energy';
  subtype: string;
  name: string;
}

const TRAINER_SUBTYPE_LABELS: Record<string, string> = {
  i: 'Item',
  a: 'Apoiador',
  s: 'Estádio',
  f: 'Ferramenta',
}

const ENERGY_SUBTYPE_LABELS: Record<string, string> = {
  b: 'Básica',
  e: 'Especial',
}

const BASIC_ENERGY_SLUGS: Record<string, string> = {
  'grama': 'grass', 'grass': 'grass',
  'fogo': 'fire', 'fire': 'fire',
  'agua': 'water', 'água': 'water', 'water': 'water',
  'eletrico': 'lightning', 'elétrico': 'lightning', 'lightning': 'lightning',
  'psiquico': 'psychic', 'psíquico': 'psychic', 'psychic': 'psychic',
  'lutador': 'fightning', 'fighting': 'fightning',
  'sombrio': 'darkness', 'darkness': 'darkness',
  'metal': 'metal',
  'fada': 'fairy', 'fairy': 'fairy',
  'dupla incolor': 'ecolorless', 'double colorless': 'ecolorless',
  'tripla incolor': 'ecolorless', 'triple colorless': 'ecolorless',
};

export function isSpecialCard(id: PokemonIdentifier): boolean {
  return id.startsWith('t:') || id.startsWith('e:');
}

export function parseSpecialCard(id: PokemonIdentifier): SpecialCard | null {
  if (!isSpecialCard(id)) return null;
  const [prefix, subtype, ...rest] = id.split(':');
  return { kind: prefix === 't' ? 'trainer' : 'energy', subtype, name: rest.join(':') };
}

export function getSpecialCardLabel(card: SpecialCard): { category: string; subcategory: string } {
  if (card.kind === 'trainer') {
    return { category: 'TREINADOR', subcategory: TRAINER_SUBTYPE_LABELS[card.subtype] ?? card.subtype };
  }
  return { category: 'ENERGIA ', subcategory: ENERGY_SUBTYPE_LABELS[card.subtype] ?? card.subtype };
}

export function getEnergyImageSlug(card: SpecialCard): string | null {
  if (card.kind !== 'energy') return null;

  const normalizedName = card.name.trim().toLowerCase();

  if (card.subtype === 'b') {
    // Energias básicas: usa mapeamento
    return BASIC_ENERGY_SLUGS[normalizedName] ?? null;
  } else {
    // Energias especiais: adiciona prefixo "e" e usa o nome direto
    const typeMapping: Record<string, string> = {
      'fogo': 'fire', 'fire': 'fire',
      'grama': 'grass', 'grass': 'grass',
      'agua': 'water', 'água': 'water', 'water': 'water',
      'voltaica': 'lightning', 'voltaico':'lightning',
      'eletrico': 'lightning', 'elétrico': 'lightning', 'lightning': 'lightning',
      'psiquico': 'psychic', 'psíquico': 'psychic', 'psychic': 'psychic',
      'lutador': 'fightning', 'fighting': 'fightning',
      'sombria': 'darkness', 'sombrio': 'darkness', 'darkness': 'darkness',
      'metal': 'metal',
      'fada': 'fairy', 'fairy': 'fairy',
    };

    const englishType = typeMapping[normalizedName] || normalizedName;
    return `e${englishType.replace(/\s+/g, '')}`;
  }
}

export function getEnergyImagePath(slug: string, visualMode: 'colorido' | 'sombra', paraPDF = false): string {
  const base = paraPDF ? 'pngs' : 'webps';
  const ext = paraPDF ? 'png' : 'webp';
  const folder = visualMode === 'colorido' ? 'energies' : 'silhuetas_energies';
  return `/pokedex/${base}/${folder}/${slug}.${ext}`;
}