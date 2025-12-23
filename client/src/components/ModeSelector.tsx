import React from 'react';
import { ChatMode } from '../types';
import './ModeSelector.css';

interface ModeSelectorProps {
    onModeSelect: (mode: ChatMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelect }) => {
    return (
        <div className="mode-selector">
            <h2 className="mode-title">Como você quer se conectar hoje?</h2>
            <p className="mode-subtitle">Escolha o modo que melhor se adequa ao que você busca</p>

            <div className="mode-cards">
                <div className="mode-card casual" onClick={() => onModeSelect('casual')}>
                    <div className="mode-icon">💬</div>
                    <h3>Bate-papo Casual</h3>
                    <p className="mode-description">
                        Conversas leves e descontraídas com pessoas aleatórias.
                        Perfeito para praticar idiomas, trocar ideias ou simplesmente passar o tempo.
                    </p>
                    <ul className="mode-features">
                        <li>✓ Conexões aleatórias</li>
                        <li>✓ Sem compromisso</li>
                        <li>✓ Skip livre</li>
                    </ul>
                    <button className="mode-button">Começar a Conversar</button>
                </div>

                <div className="mode-card connections" onClick={() => onModeSelect('connections')}>
                    <div className="mode-icon">💝</div>
                    <h3>Conexões Reais</h3>
                    <p className="mode-description">
                        Conhecer pessoas de verdade, cara a cara. Conexões autênticas que vão além
                        de fotos e bios. Deixe a conversa revelar quem você realmente é.
                    </p>
                    <ul className="mode-features">
                        <li>✓ Matching por interesses</li>
                        <li>✓ Conversas mais longas</li>
                        <li>✓ Possibilidade de match</li>
                    </ul>
                    <button className="mode-button primary">Fazer Conexões</button>
                </div>
            </div>

            <div className="mode-info">
                <p className="info-text">
                    <strong>💡 Dica:</strong> No modo "Conexões Reais", você terá a chance de trocar contatos
                    com pessoas que realmente conectou durante a conversa. Sem julgar pela aparência primeiro -
                    deixe a personalidade brilhar!
                </p>
            </div>
        </div>
    );
};

export default ModeSelector;
