import type { VisualMode } from '../types/pokemon';
import { VISUAL_MODES } from '../data/constants';

interface ModeSelectorProps {
  currentMode: VisualMode['id'];
  onModeChange: (mode: VisualMode['id']) => void;
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h3>Modo Visual</h3>
      <div className="mode-buttons">
        {VISUAL_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`mode-button ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
