import React, { useState } from 'react';
import { useWebRTC } from '../contexts/WebRTCContext';
import './MatchModal.css';

interface MatchModalProps {
    connectionDuration: number;
    onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ connectionDuration, onClose }) => {
    const [showContactExchange, setShowContactExchange] = useState(false);
    const [contact, setContact] = useState('');
    const [contactType, setContactType] = useState<'instagram' | 'whatsapp' | 'email'>('instagram');
    const { sendMatchRequest } = useWebRTC();

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendMatch = () => {
        if (!contact.trim()) return;
        sendMatchRequest(contactType, contact);
        onClose();
    };

    return (
        <div className="match-modal-overlay">
            <div className="match-modal">
                {!showContactExchange ? (
                    <>
                        <div className="match-header">
                            <div className="match-icon">💝</div>
                            <h2>Gostou da conversa?</h2>
                            <p className="match-subtitle">
                                Vocês conversaram por {formatDuration(connectionDuration)}
                            </p>
                        </div>

                        <div className="match-content">
                            <p className="match-message">
                                Se você curtiu essa pessoa, que tal fazer um <strong>match</strong>?
                                Vocês poderão trocar contatos e continuar conversando!
                            </p>

                            <div className="match-info-box">
                                <p className="info-title">Como funciona?</p>
                                <ul className="info-list">
                                    <li>✓ Você envia um pedido de match</li>
                                    <li>✓ A outra pessoa recebe a notificação</li>
                                    <li>✓ Se aceitar, vocês trocam contatos</li>
                                    <li>✓ Ninguém vê rejeição - sem constrangimento!</li>
                                </ul>
                            </div>
                        </div>

                        <div className="match-actions">
                            <button className="match-button secondary" onClick={onClose}>
                                Não, obrigado
                            </button>
                            <button className="match-button primary" onClick={() => setShowContactExchange(true)}>
                                Sim, fazer match! 💘
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="match-header">
                            <div className="match-icon">📱</div>
                            <h2>Compartilhe seu contato</h2>
                            <p className="match-subtitle">
                                A outra pessoa receberá apenas se aceitar o match
                            </p>
                        </div>

                        <div className="contact-exchange">
                            <div className="contact-type-selector">
                                <button
                                    className={`type-button ${contactType === 'instagram' ? 'active' : ''}`}
                                    onClick={() => setContactType('instagram')}
                                >
                                    📸 Instagram
                                </button>
                                <button
                                    className={`type-button ${contactType === 'whatsapp' ? 'active' : ''}`}
                                    onClick={() => setContactType('whatsapp')}
                                >
                                    💬 WhatsApp
                                </button>
                                <button
                                    className={`type-button ${contactType === 'email' ? 'active' : ''}`}
                                    onClick={() => setContactType('email')}
                                >
                                    📧 Email
                                </button>
                            </div>

                            <div className="contact-input-group">
                                <label>
                                    {contactType === 'instagram' && 'Seu @ do Instagram'}
                                    {contactType === 'whatsapp' && 'Seu número (com DDD)'}
                                    {contactType === 'email' && 'Seu e-mail'}
                                </label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder={
                                        contactType === 'instagram' ? '@seuusuario' :
                                            contactType === 'whatsapp' ? '11999999999' :
                                                'seu@email.com'
                                    }
                                    className="contact-input"
                                />
                            </div>

                            <p className="privacy-note">
                                🔒 Seu contato só será compartilhado se houver match mútuo
                            </p>
                        </div>

                        <div className="match-actions">
                            <button className="match-button secondary" onClick={() => setShowContactExchange(false)}>
                                Voltar
                            </button>
                            <button
                                className="match-button primary"
                                onClick={handleSendMatch}
                                disabled={!contact.trim()}
                            >
                                Enviar Match 💘
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MatchModal;
