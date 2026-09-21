import type { Masterset, MastersetInfo, PokemonIdentifier } from '../types/pokemon';
import { MASTERSETS } from '../data/constants';

interface MastersetSelectorProps {
  onPokemonListChange: (pokemon: PokemonIdentifier[], mastersetInfo?: MastersetInfo) => void;
  disabled?: boolean;
}

export function MastersetSelector({ onPokemonListChange, disabled = false }: MastersetSelectorProps) {
  const handleMastersetClick = (masterset: Masterset) => {
    onPokemonListChange(masterset.pokemon, {
      total: masterset.total,
      rarities: masterset.rarities
    });
  };

  return (
    <div className="masterset-selector">
      <h3>Coleções Pré-definidas</h3>
      <div className="masterset-grid">
        {MASTERSETS.map((set) => (
          <button
            key={set.id}
            className="masterset-button"
            onClick={() => handleMastersetClick(set)}
            disabled={disabled}
          >
            <div className="masterset-name">{set.name}</div>
            <div className="masterset-description">{set.description}</div>
            <div className="masterset-count">
              {set.pokemon.length} Pokémon
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
