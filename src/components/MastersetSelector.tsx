import { useState } from 'react';
import type { Masterset, MastersetInfo, PokemonIdentifier } from '../types/pokemon';
import { MASTERSET_CATEGORIES } from '../data/constants';

interface MastersetSelectorProps {
  onPokemonListChange: (pokemon: PokemonIdentifier[], mastersetInfo?: MastersetInfo) => void;
  onMastersetSelected?: (inputString: string) => void;
  disabled?: boolean;
}

export function MastersetSelector({ onPokemonListChange, onMastersetSelected, disabled = false }: MastersetSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<Masterset | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleMastersetClick = (masterset: Masterset) => {
    setSelectedSet(masterset);
    onPokemonListChange(masterset.pokemon, {
      total: masterset.total,
      rarities: masterset.rarities,
      setNumbers: masterset.setNumbers,
      logo: masterset.logo,
    });
    if (onMastersetSelected) {
      onMastersetSelected(masterset.pokemon.join(';'));
    }
  };

  return (
    <div className="masterset-selector">
      <h3>Coleções Pré-definidas</h3>
      
      <div className="masterset-accordion">
        {MASTERSET_CATEGORIES.map((category) => (
          <div key={category.id} className="masterset-category">
            <button
              className={`masterset-category-header ${expandedCategory === category.id ? 'expanded' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              disabled={disabled || category.sets.length === 0}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.sets.length}</span>
              <span className="category-arrow">{expandedCategory === category.id ? '▾' : '▸'}</span>
            </button>
            
            {expandedCategory === category.id && category.sets.length > 0 && (
              <div className="masterset-category-content">
                {category.sets.map((set) => (
                  <button
                    key={set.id}
                    className={`masterset-button ${selectedSet?.id === set.id ? 'selected' : ''}`}
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
            )}
          </div>
        ))}
      </div>

      {selectedSet && (
        <div className="masterset-cheat-sheet">
          {selectedSet.logo && (
            <div className="cheat-sheet-logo">
              <img 
                key={selectedSet.logo}
                src={selectedSet.logo} 
                alt={selectedSet.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="cheat-sheet-header">
            📋 {selectedSet.name}
          </div>
          <div className="cheat-sheet-info">
            <span>{selectedSet.pokemon.length} Pokémon</span>
            {selectedSet.rarities.length > 0 && (
              <span>• {selectedSet.rarities.length} raridades</span>
            )}
          </div>
          <div className="cheat-sheet-examples">
            Exemplos: {selectedSet.pokemon.slice(0, 5).join('; ')}...
          </div>
          <div className="cheat-sheet-hint">
            Edite no Input Manual abaixo para personalizar
          </div>
        </div>
      )}
    </div>
  );
}
