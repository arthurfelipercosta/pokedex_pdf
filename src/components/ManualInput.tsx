import { useState, useEffect } from 'react';
import { parseInput } from '../utils/parser';
import type { ParsedInput, MastersetInfo, PokemonIdentifier } from '../types/pokemon';

interface ManualInputProps {
  onPokemonListChange: (pokemon: PokemonIdentifier[], mastersetInfo?: MastersetInfo) => void;
  disabled?: boolean;
  externalInput?: string;
  mastersetInfo?: MastersetInfo | null;
}

export function ManualInput({ onPokemonListChange, disabled = false, externalInput, mastersetInfo }: ManualInputProps) {
  const [input, setInput] = useState('');
  const [total, setTotal] = useState('');
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [parsedResult, setParsedResult] = useState<ParsedInput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExternal, setIsExternal] = useState(false);

  useEffect(() => {
    if (externalInput !== undefined) {
      setInput(externalInput);
      setIsExternal(true);
    }
  }, [externalInput]);

  useEffect(() => {
    if (isExternal) {
      setIsExternal(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      if (input.trim()) {
        setIsProcessing(true);
        try {
          const result = await parseInput(input, allowDuplicates);
          setParsedResult(result);
          if (result.errors.length === 0) {
            const info = total.trim() 
              ? { total: total.trim(), rarities: [] } 
              : mastersetInfo ?? undefined;
            onPokemonListChange(result.pokemon, info);
          }
        } catch (error) {
          console.error('Erro ao processar input:', error);
        } finally {
          setIsProcessing(false);
        }
      } else {
        setParsedResult(null);
        onPokemonListChange([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [input, total, allowDuplicates, onPokemonListChange, mastersetInfo, isExternal]);

  const handleExampleClick = (example: string) => {
    setInput(prev => prev ? `${prev}; ${example}` : example);
  };

  return (
    <div className="manual-input">
      <h3>Input Manual</h3>
      <div className="input-description">
        Digite números ou nomes de Pokémon separados por ponto e vírgula (;)
      </div>
      
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ex: 357; 736; 753; lurantis; 1012"
        disabled={disabled}
        className="manual-textarea"
        rows={6}
      />

      <div className="total-input-row">
        <div className="total-input">
          <label>Total (opcional):</label>
          <input
            type="number"
            min="1"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="062"
            disabled={disabled}
            className="config-number total-field"
          />
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(e) => setAllowDuplicates(e.target.checked)}
          />
          <span>Repetidos</span>
        </label>
      </div>
      
      {isProcessing && (
        <div className="processing-indicator">
          Processando...
        </div>
      )}
      
      {parsedResult && (
        <div className="parse-result">
          {parsedResult.errors.length > 0 && (
            <div className="parse-errors">
              <h4>Erros:</h4>
              <ul>
                {parsedResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {parsedResult.errors.length === 0 && (
            <div className="parse-success">
              ✅ {parsedResult.pokemon.length} Pokémon encontrados
            </div>
          )}
        </div>
      )}
      
      <div className="input-examples">
        <h4>Exemplos:</h4>
        <div className="example-buttons">
          <button onClick={() => handleExampleClick('357')} className="example-button">
            357 (Tropius)
          </button>
          <button onClick={() => handleExampleClick('lurantis')} className="example-button">
            lurantis
          </button>
          <button onClick={() => handleExampleClick('3-mega')} className="example-button">
            3-mega
          </button>
          <button onClick={() => handleExampleClick('charizard ex')} className="example-button">
            charizard ex
          </button>
          <button onClick={() => handleExampleClick('1; 4; 7; 25')} className="example-button">
            1; 4; 7; 25
          </button>
        </div>
      </div>
    </div>
  );
}
