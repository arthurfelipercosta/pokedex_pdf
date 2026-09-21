import { useState } from 'react';
import { CardGrid } from './CardGrid';
import type { PDFConfig, MastersetInfo, PokemonIdentifier } from '../types/pokemon';

interface PDFPreviewProps {
  pokemonList: PokemonIdentifier[];
  config: PDFConfig;
  mastersetInfo?: MastersetInfo | null;
  uniquePositionMap?: Map<string, number>;
}

export function PDFPreview({ pokemonList, config, mastersetInfo = null, uniquePositionMap }: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = config.gridRows * config.gridCols;
  const totalPages = Math.ceil(pokemonList.length / itemsPerPage) || 1;

  const getCurrentPagePokemon = () => {
    const start = currentPage * itemsPerPage;
    return pokemonList.slice(start, start + itemsPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="pdf-preview">
      <div className="preview-header">
        <h3>Preview do PDF</h3>
        <div className="preview-stats">
          <span>Total: {pokemonList.length} Pokémon</span>
          <span>Páginas: {totalPages}</span>
        </div>
      </div>

      <div className="preview-content">
        <div className="mobile-grid-notice">
          Preview: 2 colunas · PDF será gerado em {config.gridRows}x{config.gridCols}
        </div>
        <CardGrid
          pokemonList={getCurrentPagePokemon()}
          config={config}
          startIndex={currentPage * itemsPerPage}
          mastersetInfo={mastersetInfo}
          uniquePositionMap={uniquePositionMap}
        />
      </div>

      <div className="preview-controls">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="preview-nav-button"
        >
          ← Anterior
        </button>
        <span className="page-indicator">
          Página {currentPage + 1} de {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="preview-nav-button"
        >
          Próxima →
        </button>
      </div>

      <div className="preview-footer">
        <div className="preview-info">
          <span>Modo: {config.visualMode === 'colorido' ? '🎨 Colorido' : '🌑 Sombra'}</span>
          <span>Grid: {config.gridRows}x{config.gridCols}</span>
        </div>
      </div>
    </div>
  );
}
