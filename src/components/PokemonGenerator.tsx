import { useState } from 'react';
import { ModeSelector } from './ModeSelector';
import { SelectionModeSelector } from './SelectionModeSelector';
import { ManualInput } from './ManualInput';
import { GenerationSelector } from './GenerationSelector';
import { MastersetSelector } from './MastersetSelector';
import { ConfigPanel } from './ConfigPanel';
import { PDFPreview } from './PDFPreview';
import { AdBanner } from './AdBanner';
import { generatePDF } from '../utils/pdfGenerator';
import { generateCompletePokedex } from '../utils/parser';
import type { PDFConfig, SelectionMode, VisualMode, MastersetInfo, PokemonIdentifier } from '../types/pokemon';
import { DEFAULT_CONFIG } from '../data/constants';

export function PokemonGenerator() {
  const [config, setConfig] = useState<PDFConfig>(DEFAULT_CONFIG);
  const [selectionMode, setSelectionMode] = useState<SelectionMode['id']>('manual');
  const [pokemonList, setPokemonList] = useState<PokemonIdentifier[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [mastersetInfo, setMastersetInfo] = useState<MastersetInfo | null>(null);

  const uniquePositionMap = (() => {
    const map = new Map<string, number>();
    for (let i = 0; i < pokemonList.length; i++) {
      const id = pokemonList[i];
      const key = `${id}-${i}`;
      map.set(key, i + 1);
    }
    return map;
  })();

  const handleSelectionModeChange = (mode: SelectionMode['id']) => {
    setSelectionMode(mode);
    setPokemonList([]);
    setMastersetInfo(null);
  };

  const handlePokemonListChange = (newPokemon: PokemonIdentifier[], info?: MastersetInfo) => {
    setPokemonList(newPokemon);
    setMastersetInfo(info ?? null);
    setGenerateError(null);
  };

  const handleCompletePokedex = () => {
    const complete = generateCompletePokedex();
    setPokemonList(complete);
  };

  const handleGeneratePDF = async () => {
    if (pokemonList.length === 0) {
      setGenerateError('Selecione pelo menos um Pokémon');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const pdfBytes = await generatePDF(pokemonList, config, mastersetInfo, uniquePositionMap);
      
      // Criar blob e download
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(pdfBytes);
      
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pokedex-${config.visualMode}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setGenerateError(`Erro ao gerar PDF: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSelectionModeContent = () => {
    switch (selectionMode) {
      case 'completa':
        return (
          <div className="selection-content">
            <div className="complete-pokedex-info">
              <h3>Pokédex Completa</h3>
              <p>Isso gerará um PDF com todos os 1025 Pokémon.</p>
              <button
                onClick={handleCompletePokedex}
                className="action-button primary"
              >
                Carregar Pokédex Completa
              </button>
            </div>
          </div>
        );
      case 'geracao':
        return (
          <GenerationSelector
            onPokemonListChange={handlePokemonListChange}
          />
        );
      case 'masterset':
        return (
          <MastersetSelector
            onPokemonListChange={handlePokemonListChange}
          />
        );
      case 'manual':
        return (
          <ManualInput
            onPokemonListChange={handlePokemonListChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="pokemon-generator">
      <div className="generator-header">
        <h1>🎮 Gerador de PDF Personalizado</h1>
        <p>Crie sua Pokédex personalizada com os Pokémon que você escolher</p>
      </div>

      <div className="generator-layout">
        <div className="generator-sidebar">
          <ModeSelector
            currentMode={config.visualMode}
            onModeChange={(mode) => setConfig({ ...config, visualMode: mode as VisualMode['id'] })}
          />

          <SelectionModeSelector
            currentMode={selectionMode}
            onModeChange={handleSelectionModeChange}
          />

          <div className="selection-section">
            {renderSelectionModeContent()}
          </div>

          <ConfigPanel
            config={config}
            onConfigChange={setConfig}
          />
        </div>

        <div className="generator-main">
          <div className="generator-actions">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || pokemonList.length === 0}
              className={`generate-button ${isGenerating ? 'generating' : ''}`}
            >
              {isGenerating ? 'Gerando PDF...' : '📥 Gerar PDF'}
            </button>
          </div>

          {generateError && (
            <div className="error-message">
              {generateError}
            </div>
          )}

          <PDFPreview
            pokemonList={pokemonList}
            config={config}
            mastersetInfo={mastersetInfo}
            uniquePositionMap={uniquePositionMap}
          />
        </div>
      </div>

      <div className="ad-section">
        <AdBanner slot="3049763729" />
        <AdBanner slot="4100402773" />
        <AdBanner slot="2787321100" />
        <AdBanner slot="4521048480" />
      </div>
    </div>
  );
}
