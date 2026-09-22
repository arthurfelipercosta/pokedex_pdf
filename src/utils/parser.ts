import type { ParsedInput, Pokedex, PokemonIdentifier } from '../types/pokemon';
import { KNOWN_FORMS_MAP, parseIdentifier } from './pokemonId';

let pokedexCache: Pokedex | null = null;

// Carregar dados da Pokédex
async function loadPokedex(): Promise<Pokedex> {
  if (pokedexCache) return pokedexCache as Pokedex;
  
  try {
    const response = await fetch('/pokedex/pokedex.json');
    if (!response.ok) {
      throw new Error(`Falha ao carregar pokedex.json: ${response.status}`);
    }
    const data = await response.json();
    pokedexCache = data;
    return data;
  } catch (error) {
    console.error('Erro ao carregar Pokédex:', error);
    throw error;
  }
}

// Resolver nome de Pokémon para número
export async function resolveNameToNumber(name: string): Promise<number> {
  const pokedex = await loadPokedex();
  const normalizedName = name.toLowerCase().trim();
  
  for (const [num, data] of Object.entries(pokedex)) {
    if (data.nome.toLowerCase() === normalizedName) {
      return parseInt(num);
    }
  }
  
  return 0; // Retorna 0 se não encontrar
}

// Resolver nome de Pokémon para identifier (com formas)
export async function resolveNameToIdentifier(name: string): Promise<PokemonIdentifier | null> {
  const pokedex = await loadPokedex();
  const normalized = name.toLowerCase().trim();

  // Procurar no nome base
  for (const [num, data] of Object.entries(pokedex)) {
    if (data.nome.toLowerCase() === normalized) {
      return num;
    }
  }

  // Procurar nas formas
  for (const [num, data] of Object.entries(pokedex)) {
    if (data.formas) {
      for (const form of data.formas) {
        if (form.nome.toLowerCase() === normalized) {
          return `${num}-${form.id}`;
        }
      }
    }
  }

  return null;
}

// Parsear um item do input em PokemonIdentifier
async function parseItem(item: string): Promise<PokemonIdentifier | null> {
  const trimmed = item.trim();
  if (!trimmed) return null;

  // 1. Se é número puro: "25" → "25"
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const suffixMap: Record<string, string> = {
    'ex': 'EX', 'gx': 'GX', 'v': 'V', 'vmax': 'VMAX', 'vstar': 'VSTAR',
    'break': 'BREAK', 'level': 'Level',
  };

  // Classificar uma parte como forma, sufixo ou desconhecido
  function classifyPart(part: string): { type: 'form' | 'suffix' | 'unknown'; value: string } {
    const lower = part.toLowerCase();
    if (KNOWN_FORMS_MAP[lower]) return { type: 'form', value: KNOWN_FORMS_MAP[lower] };
    if (suffixMap[lower]) return { type: 'suffix', value: suffixMap[lower] };
    return { type: 'unknown', value: lower };
  }

  // Construir identifier a partir de número + partes classificadas
  function buildId(num: number, parts: string[]): string {
    const formParts: string[] = [];
    const suffixParts: string[] = [];

    for (const part of parts) {
      const c = classifyPart(part);
      if (c.type === 'form') {
        // Combinar "mega" + "x"/"y" → "megax"/"megay"
        if ((c.value === 'megax' || c.value === 'megay') && formParts.length > 0 && formParts[formParts.length - 1] === 'mega') {
          formParts[formParts.length - 1] = c.value;
        } else {
          formParts.push(c.value);
        }
      } else if (c.type === 'suffix') {
        suffixParts.push(c.value);
      } else {
        // Desconhecido: se já temos forma, tratar como sufixo livre
        // Se não, tratar como forma (ex: letras do Unown)
        if (formParts.length > 0) {
          suffixParts.push(c.value);
        } else {
          formParts.push(c.value);
        }
      }
    }

    let id = String(num);
    if (formParts.length > 0) id += '-' + formParts.join('-');
    if (suffixParts.length > 0) id += '-' + suffixParts.join('-');
    return id;
  }

  // 2. Se começa com número + hífen: "3-mega", "3-mega-ex", "25-ex", "201-a"
  const numDashMatch = trimmed.match(/^(\d+)-(.+)$/);
  if (numDashMatch) {
    const num = parseInt(numDashMatch[1]);
    const parts = numDashMatch[2].split('-');
    return buildId(num, parts);
  }

  // 3. Se começa com número + espaço: "3 mega", "3 mega ex", "25 ex"
  const numSpaceMatch = trimmed.match(/^(\d+)\s+(.+)$/);
  if (numSpaceMatch) {
    const num = parseInt(numSpaceMatch[1]);
    const parts = numSpaceMatch[2].trim().split(/\s+/);
    return buildId(num, parts);
  }

  // 4. Se é nome: "charizard mega", "mega venusaur ex", "pikachu ex", "bulbasaur"
  const pokedex = await loadPokedex();
  const normalized = trimmed.toLowerCase();
  const words = normalized.split(/\s+/);

  // Tentar do final para o início: encontrar onde o nome do Pokémon termina
  for (let splitIdx = words.length; splitIdx >= 1; splitIdx--) {
    const namePart = words.slice(0, splitIdx).join(' ');
    const restWords = words.slice(splitIdx);

    // Procurar nome base na pokédex
    let baseNum: number | null = null;
    for (const [num, data] of Object.entries(pokedex)) {
      if (data.nome.toLowerCase() === namePart) {
        baseNum = parseInt(num);
        break;
      }
    }

    if (baseNum !== null) {
      // Se não sobrou nada, é nome puro
      if (restWords.length === 0) {
        return String(baseNum);
      }
      // Classificar palavras restantes como formas/sufixos
      return buildId(baseNum, restWords);
    }
  }

  // 4b. Tentar com forma(s) no início: "mega venusaur ex" → forma="mega", nome="venusaur", sufixo="ex"
  for (let skipIdx = 1; skipIdx < words.length; skipIdx++) {
    const prefixWords = words.slice(0, skipIdx);
    const remainingWords = words.slice(skipIdx);

    // Todas as palavras do prefixo devem ser formas conhecidas
    const allForms = prefixWords.every(w => KNOWN_FORMS_MAP[w.toLowerCase()]);
    if (!allForms || remainingWords.length === 0) continue;

    // Tentar encontrar nome no restante (do final pra frente)
    for (let nameEnd = remainingWords.length; nameEnd >= 1; nameEnd--) {
      const namePart = remainingWords.slice(0, nameEnd).join(' ');
      const suffixWords = remainingWords.slice(nameEnd);

      let baseNum: number | null = null;
      for (const [num, data] of Object.entries(pokedex)) {
        if (data.nome.toLowerCase() === namePart) {
          baseNum = parseInt(num);
          break;
        }
      }

      if (baseNum !== null) {
        const modifierWords = [...prefixWords, ...suffixWords];
        if (modifierWords.length === 0) {
          return String(baseNum);
        }
        return buildId(baseNum, modifierWords);
      }
    }
  }

  // 5. Tentar nome puro: "bulbasaur", "charizard"
  const result = await resolveNameToIdentifier(trimmed);
  if (result) return result;

  return null;
}

// Parser de input manual
export async function parseInput(input: string, allowDuplicates: boolean = false): Promise<ParsedInput> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const pokemon: PokemonIdentifier[] = [];
  
  if (!input.trim()) {
    return { pokemon: [], errors: ['Input vazio'], warnings: [] };
  }
  
  const items = input.split(/[;,]/).map(item => item.trim()).filter(item => item.length > 0);
  
  for (const item of items) {
    try {
      const identifier = await parseItem(item);
      if (identifier) {
        const { num } = parseIdentifier(identifier);
        if (num >= 1 && num <= 1025) {
          pokemon.push(identifier);
          if (identifier !== String(num)) {
            warnings.push(`"${item}" resolvido para ${identifier}`);
          }
        } else {
          errors.push(`Número ${num} inválido (deve ser entre 1 e 1025)`);
        }
      } else {
        errors.push(`"${item}" não encontrado na Pokédex`);
      }
    } catch (error) {
      errors.push(`Erro ao processar "${item}": ${error}`);
    }
  }
  
  // Remover duplicatas mantendo a ordem (se não permitir repetidos)
  let uniquePokemon = pokemon;
  if (!allowDuplicates) {
    uniquePokemon = [...new Set(pokemon)];
    if (uniquePokemon.length !== pokemon.length) {
      warnings.push(`${pokemon.length - uniquePokemon.length} duplicatas removidas`);
    }
  }
  
  return {
    pokemon: uniquePokemon,
    errors,
    warnings
  };
}

// Gerar range de números para Pokédex completa
export function generateCompletePokedex(): PokemonIdentifier[] {
  return Array.from({ length: 1025 }, (_, i) => String(i + 1));
}

// Carregar Pokédex completa com formas baseado nas categorias selecionadas
export async function loadCompletePokedexWithForms(
  categories: { mega: boolean; giga: boolean; regional: boolean; other: boolean }
): Promise<PokemonIdentifier[]> {
  const pokedex = await loadPokedex();
  const result: PokemonIdentifier[] = [];

  for (let i = 1; i <= 1025; i++) {
    const numStr = String(i);
    result.push(numStr);

    const entry = pokedex[numStr];
    if (!entry?.formas) continue;

    for (const form of entry.formas) {
      const formId = form.id;

      // Megas & Primal
      if (categories.mega && ['mega', 'megax', 'megay', 'primal'].includes(formId)) {
        result.push(`${i}-${formId}`);
        continue;
      }

      // Gigantamax
      if (categories.giga && formId === 'giga') {
        result.push(`${i}-${formId}`);
        continue;
      }

      // Regionais
      if (categories.regional && ['alola', 'galar', 'hisui', 'paldea', 'paldea-combat', 'paldea-blaze', 'paldea-aqua'].includes(formId)) {
        result.push(`${i}-${formId}`);
        continue;
      }

      // Outras formas
      if (categories.other) {
        const megaForms = ['mega', 'megax', 'megay', 'primal'];
        const gigaForms = ['giga'];
        const regionalForms = ['alola', 'galar', 'hisui', 'paldea', 'paldea-combat', 'paldea-blaze', 'paldea-aqua'];
        if (!megaForms.includes(formId) && !gigaForms.includes(formId) && !regionalForms.includes(formId)) {
          result.push(`${i}-${formId}`);
        }
      }
    }
  }

  return result;
}

// Gerar range para geração específica
// Renumerar lista de Pokémon (para exibição no PDF)
export function renumberPokemon(pokemonList: PokemonIdentifier[]): Map<string, number> {
  const renumbering = new Map<string, number>();
  pokemonList.forEach((id, index) => {
    renumbering.set(id, index + 1);
  });
  return renumbering;
}

// Dividir Pokémon em páginas
export function splitIntoPages(pokemonList: PokemonIdentifier[], itemsPerPage: number = 9): PokemonIdentifier[][] {
  const pages: PokemonIdentifier[][] = [];
  for (let i = 0; i < pokemonList.length; i += itemsPerPage) {
    pages.push(pokemonList.slice(i, i + itemsPerPage));
  }
  return pages;
}
