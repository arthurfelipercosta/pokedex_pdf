import type { SelectionMode } from '../types/pokemon';
import { SELECTION_MODES } from '../data/constants';

interface SelectionModeSelectorProps {
  currentMode: SelectionMode['id'];
  onModeChange: (mode: SelectionMode['id']) => void;
}

export function SelectionModeSelector({ currentMode, onModeChange }: SelectionModeSelectorProps) {
  return (
    <div className="selection-mode-selector">
      <h3>Modo de Seleção</h3>
      <div className="selection-mode-buttons">
        {SELECTION_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`selection-mode-button ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            <div className="selection-mode-label">{mode.label}</div>
            <div className="selection-mode-description">{mode.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
