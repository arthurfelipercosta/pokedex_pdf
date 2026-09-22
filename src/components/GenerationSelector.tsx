import type { Masterset, PokemonIdentifier } from '../types/pokemon';
import { GENERATIONS } from '../data/constants';

interface GenerationSelectorProps {
  onPokemonListChange: (pokemon: PokemonIdentifier[]) => void;
  disabled?: boolean;
}

export function GenerationSelector({ onPokemonListChange, disabled = false }: GenerationSelectorProps) {
  const handleGenerationClick = (generation: Masterset) => {
    onPokemonListChange(generation.pokemon);
  };

  return (
    <div className="generation-selector">
      <h3>Selecione uma Geração</h3>
      <div className="generation-grid">
        {GENERATIONS.map((gen) => (
          <button
            key={gen.id}
            className="generation-button"
            onClick={() => handleGenerationClick(gen)}
            disabled={disabled}
          >
            <div className="generation-name">{gen.name}</div>
            <div className="generation-range">
              {gen.description}
            </div>
            <div className="generation-count">
              {gen.pokemon.length} Pokémon
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
