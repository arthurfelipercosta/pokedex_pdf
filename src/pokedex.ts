// src/pokedex.ts

export interface PokemonEntry {
    nome: string;
    tipo_xrefs: number[];
}

export type Pokedex = Record<string, PokemonEntry>;

export async function carregarPokedex(): Promise<Pokedex> {
    const resposta = await fetch("/pokedex/pokedex.json");
    if (!resposta.ok) {
        throw new Error(`Falha ao carregar pokedex.json: ${resposta.status}`);
    }
    return resposta.json();
}