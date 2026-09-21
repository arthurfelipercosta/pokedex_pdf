import type { PDFConfig } from '../types/pokemon';
import { DEFAULT_CONFIG } from '../data/constants';

interface ConfigPanelProps {
  config: PDFConfig;
  onConfigChange: (config: PDFConfig) => void;
}

export function ConfigPanel({ config, onConfigChange }: ConfigPanelProps) {
  const handleConfigChange = (key: keyof PDFConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="config-panel">
      <h3>Configurações do PDF</h3>
      
      <div className="config-group">
        <label>Tamanho da Página:</label>
        <select
          value={config.pageSize}
          onChange={(e) => handleConfigChange('pageSize', e.target.value)}
          className="config-select"
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>
      </div>

      <div className="config-group">
        <label>Grid:</label>
        <div className="grid-config">
          <div className="grid-input">
            <label>Linhas:</label>
            <input
              type="number"
              min="1"
              max="5"
              value={config.gridRows}
              onChange={(e) => handleConfigChange('gridRows', parseInt(e.target.value))}
              className="config-number"
            />
          </div>
          <div className="grid-input">
            <label>Colunas:</label>
            <input
              type="number"
              min="1"
              max="5"
              value={config.gridCols}
              onChange={(e) => handleConfigChange('gridCols', parseInt(e.target.value))}
              className="config-number"
            />
          </div>
        </div>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.showNumbers}
            onChange={(e) => handleConfigChange('showNumbers', e.target.checked)}
          />
          <span>Mostrar Números</span>
        </label>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.showNames}
            onChange={(e) => handleConfigChange('showNames', e.target.checked)}
          />
          <span>Mostrar Nomes</span>
        </label>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.showTypeIcons}
            onChange={(e) => handleConfigChange('showTypeIcons', e.target.checked)}
          />
          <span>Mostrar Ícones de Tipos</span>
        </label>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.showRarity}
            onChange={(e) => handleConfigChange('showRarity', e.target.checked)}
          />
          <span>Mostrar Ícones de Raridade</span>
        </label>
      </div>

      <div className="config-group">
        <label>Margem (px):</label>
        <input
          type="number"
          min="0"
          max="100"
          value={config.margin}
          onChange={(e) => handleConfigChange('margin', parseInt(e.target.value))}
          className="config-number"
        />
      </div>

      <button
        onClick={() => onConfigChange(DEFAULT_CONFIG)}
        className="reset-config-button"
      >
        Restaurar Padrões
      </button>
    </div>
  );
}
