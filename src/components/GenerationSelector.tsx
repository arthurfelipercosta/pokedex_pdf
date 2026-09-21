import type { GenerationRange, PokemonIdentifier } from '../types/pokemon';
import { GENERATIONS } from '../data/constants';

interface GenerationSelectorProps {
  onPokemonListChange: (pokemon: PokemonIdentifier[]) => void;
  disabled?: boolean;
}

export function GenerationSelector({ onPokemonListChange, disabled = false }: GenerationSelectorProps) {
  const handleGenerationClick = (generation: GenerationRange) => {
    const pokemon: PokemonIdentifier[] = [];
    for (let i = generation.start; i <= generation.end; i++) {
      pokemon.push(String(i));
    }
    onPokemonListChange(pokemon);
  };

  return (
    <div className="generation-selector">
      <h3>Selecione uma Geração</h3>
      <div className="generation-grid">
        {GENERATIONS.map((gen) => (
          <button
            key={gen.name}
            className="generation-button"
            onClick={() => handleGenerationClick(gen)}
            disabled={disabled}
          >
            <div className="generation-name">{gen.name}</div>
            <div className="generation-range">
              #{gen.start} - #{gen.end}
            </div>
            <div className="generation-count">
              {gen.end - gen.start + 1} Pokémon
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
