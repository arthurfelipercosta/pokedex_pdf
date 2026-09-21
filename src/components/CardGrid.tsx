import { useState, useEffect } from 'react';
import type { PDFConfig, MastersetInfo, PokemonIdentifier, Pokedex } from '../types/pokemon';
import { getImagePath, getPokemonDisplayName, getPokemonTypes } from '../utils/pokemonId';

interface CardGridProps {
  pokemonList: PokemonIdentifier[];
  config: PDFConfig;
  startIndex?: number;
  mastersetInfo?: MastersetInfo | null;
  uniquePositionMap?: Map<string, number>;
}

export function CardGrid({ pokemonList, config, startIndex = 0, mastersetInfo = null, uniquePositionMap }: CardGridProps) {
  const [pokedex, setPokedex] = useState<Pokedex | null>(null);

  useEffect(() => {
    fetch('/pokedex/pokedex.json')
      .then(res => res.json())
      .then(data => setPokedex(data))
      .catch(err => console.error('Erro ao carregar Pokédex:', err));
  }, []);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.gridCols}, 1fr)`,
    gap: '10px'
  };

  if (pokemonList.length === 0) {
    return (
      <div className="card-grid empty">
        <div className="empty-message">
          Nenhum Pokémon selecionado
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid" style={gridStyle}>
      {pokemonList.map((id, index) => {
        const globalIndex = startIndex + index;
        const displayNum = mastersetInfo && uniquePositionMap
          ? uniquePositionMap.get(`${id}-${globalIndex}`) ?? (globalIndex + 1)
          : globalIndex + 1;
        const pokemonName = pokedex ? getPokemonDisplayName(id, pokedex) : id;
        const pokemonTypes = pokedex ? getPokemonTypes(id, pokedex) : [];
        const imgPath = getImagePath(id, config.visualMode);
        return (
          <div key={`${id}-${globalIndex}`} className="pokemon-card">
            <div className="card-top-row">
              {config.showRarity && mastersetInfo && mastersetInfo.rarities[globalIndex] && (
                <img
                  src={`/pokedex/symbols/${mastersetInfo.rarities[globalIndex]}.png`}
                  alt={mastersetInfo.rarities[globalIndex]}
                  className="rarity-icon"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              {config.showNumbers && (
                <div className="card-number pokemon-font">
                  {mastersetInfo
                    ? `${displayNum.toString().padStart(3, '0')}/${mastersetInfo.total}`
                    : `#${displayNum.toString().padStart(3, '0')}`
                  }
                </div>
              )}
            </div>
            <img
              src={imgPath}
              alt={pokemonName}
              className="card-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/pokedex/pokemon/0001.png';
              }}
            />
            {config.showNames && (
              <div className="card-name pokemon-font">
                {pokemonName} - {id.split('-')[0].padStart(3, '0')}
              </div>
            )}
            {config.showTypeIcons && pokemonTypes.length > 0 && (
              <div className="card-types">
                {pokemonTypes.map((type) => (
                  <img
                    key={type}
                    src={`/pokedex/tipos_icones/${type}.png`}
                    alt={type}
                    className="type-icon"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
