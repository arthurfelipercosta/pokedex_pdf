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
import { generateCompletePokedex, loadCompletePokedexWithForms } from '../utils/parser';
import type { PDFConfig, SelectionMode, VisualMode, MastersetInfo, PokemonIdentifier } from '../types/pokemon';
import { DEFAULT_CONFIG, FORM_CATEGORIES } from '../data/constants';

export function PokemonGenerator() {
  const [config, setConfig] = useState<PDFConfig>(DEFAULT_CONFIG);
  const [selectionMode, setSelectionMode] = useState<SelectionMode['id']>('manual');
  const [pokemonList, setPokemonList] = useState<PokemonIdentifier[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [mastersetInfo, setMastersetInfo] = useState<MastersetInfo | null>(null);
  const [formCategories, setFormCategories] = useState({
    mega: false,
    giga: false,
    regional: false,
    other: false,
  });
  const [showHelp, setShowHelp] = useState(false);
  const [mastersetInput, setMastersetInput] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
  };

  const handlePokemonListChange = (newPokemon: PokemonIdentifier[], info?: MastersetInfo) => {
    setPokemonList(newPokemon);
    setMastersetInfo(info ?? null);
    setGenerateError(null);
  };

  const handleCompletePokedex = async () => {
    const hasAnyCategory = Object.values(formCategories).some(v => v);
    if (hasAnyCategory) {
      const complete = await loadCompletePokedexWithForms(formCategories);
      setPokemonList(complete);
    } else {
      const complete = generateCompletePokedex();
      setPokemonList(complete);
    }
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

              <div className="form-categories">
                <p className="form-categories-label">Incluir formas alternativas:</p>
                <label className="form-category-checkbox form-category-all">
                  <input
                    type="checkbox"
                    checked={Object.values(formCategories).every(v => v)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormCategories({
                        mega: checked,
                        giga: checked,
                        regional: checked,
                        other: checked,
                      });
                    }}
                  />
                  <span className="form-category-label">Todos</span>
                </label>
                {Object.entries(FORM_CATEGORIES).map(([key, cat]) => (
                  <label key={key} className="form-category-checkbox">
                    <input
                      type="checkbox"
                      checked={formCategories[key as keyof typeof formCategories]}
                      onChange={(e) => setFormCategories({
                        ...formCategories,
                        [key]: e.target.checked,
                      })}
                    />
                    <span className="form-category-label">{cat.label}</span>
                  </label>
                ))}
              </div>

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
            onMastersetSelected={(input) => setMastersetInput(input)}
          />
        );
      case 'manual':
        return (
          <ManualInput
            onPokemonListChange={handlePokemonListChange}
            externalInput={mastersetInput}
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
        <button 
          className="help-button"
          onClick={() => setShowHelp(true)}
          title="Ajuda"
        >
          ?
        </button>
      </div>

      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="help-modal-close" onClick={() => setShowHelp(false)}>×</button>
            <h2>📖 Como Usar</h2>
            
            <div className="help-section">
              <h3>Modos de Seleção</h3>
              <ul>
                <li><strong>Pokédex Completa:</strong> Carrega todos os 1025 Pokémon. Use os checkboxes para incluir formas alternativas (Megas, Regionais, etc.)</li>
                <li><strong>Por Geração:</strong> Seleciona Pokémon de uma geração específica</li>
                <li><strong>Masterset:</strong> Coleções pré-definidas organizadas por categoria</li>
                <li><strong>Manual:</strong> Digite números ou nomes separados por ponto e vírgula (;)</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>Sintaxe do Input Manual</h3>
              <ul>
                <li><strong>Números:</strong> <code>3;6;25</code> (Venusaur, Charizard, Pikachu)</li>
                <li><strong>Nomes:</strong> <code>charizard;pikachu</code></li>
                <li><strong>Formas:</strong> <code>3-mega;6-megax;25-alola</code></li>
                <li><strong>Nomes com formas:</strong> <code>mega charizard x;charizard giga</code></li>
                <li><strong>Sufixos TCG:</strong> <code>3-mega-ex;charizard ex</code></li>
                <li><strong>Compostos:</strong> <code>6-megax-ex</code> (Mega Charizard X EX)</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>Categorias de Formas</h3>
              <ul>
                <li><strong>Megas & Primal:</strong> mega, megax, megay, primal</li>
                <li><strong>Gigantamax:</strong> giga</li>
                <li><strong>Regionais:</strong> alola, galar, hisui, paldea</li>
                <li><strong>Outras:</strong> therian, origin, zen, rotom, etc.</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>Raridades</h3>
              <p>Selecione um Masterset para usar o sistema de raridades. As raridades são exibidas como ícones no PDF.</p>
            </div>
          </div>
        </div>
      )}

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
            currentPage={currentPage}
            onPageChange={setCurrentPage}
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
