import React, { useState } from 'react';
import './Settings.css';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

interface SettingsProps {
    user: any;
    onClose: () => void;
    onLogout: () => void;
    onUpdateUser: (user: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onClose, onLogout, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy' | 'notifications'>('profile');
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bio, setBio] = useState(user?.bio || '');
    const [interests, setInterests] = useState<string[]>(user?.interests || []);
    const [newInterest, setNewInterest] = useState('');

    // Privacy settings
    const [showOnline, setShowOnline] = useState(true);
    const [allowMessages, setAllowMessages] = useState(true);
    const [showMatches, setShowMatches] = useState(true);

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [matchNotifications, setMatchNotifications] = useState(true);
    const [messageNotifications, setMessageNotifications] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, bio, interests }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar perfil');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            onUpdateUser(data.user);
            setSuccess('Perfil atualizado com sucesso!');
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao alterar senha');
            }

            setSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível!')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao deletar conta');
            }

            onLogout();
        } catch (err: any) {
            setError(err.message || 'Erro ao deletar conta');
        } finally {
            setLoading(false);
        }
    };

    const handleAddInterest = () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest));
    };

    return (
        <div className="settings-overlay">
            <div className="settings-container">
                <div className="settings-header">
                    <h2>Configurações</h2>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <div className="settings-content">
                    <div className="settings-sidebar">
                        <button
                            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <span className="sidebar-icon">👤</span>
                            Perfil
                        </button>
                        <button
                            className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <span className="sidebar-icon">🔐</span>
                            Conta
                        </button>
                        <button
                            className={`sidebar-item ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy')}
                        >
                            <span className="sidebar-icon">🛡️</span>
                            Privacidade
                        </button>
                        <button
                            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <span className="sidebar-icon">🔔</span>
                            Notificações
                        </button>
                    </div>

                    <div className="settings-main">
                        {error && <div className="settings-message error">{error}</div>}
                        {success && <div className="settings-message success">{success}</div>}

                        {activeTab === 'profile' && (
                            <div className="settings-section">
                                <h3>Editar Perfil</h3>
                                <form onSubmit={handleUpdateProfile} className="settings-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Nome</label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            disabled
                                            title="O email não pode ser alterado"
                                        />
                                        <small>O email não pode ser alterado</small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="bio">Biografia</label>
                                        <textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Conte um pouco sobre você..."
                                            rows={4}
                                            maxLength={500}
                                        />
                                        <small>{bio.length}/500 caracteres</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Interesses</label>
                                        <div className="interests-input">
                                            <input
                                                type="text"
                                                value={newInterest}
                                                onChange={(e) => setNewInterest(e.target.value)}
                                                placeholder="Adicione um interesse"
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                                            />
                                            <button type="button" onClick={handleAddInterest} className="add-button">
                                                Adicionar
                                            </button>
                                        </div>
                                        <div className="interests-list">
                                            {interests.map((interest) => (
                                                <span key={interest} className="interest-tag">
                                                    {interest}
                                                    <button type="button" onClick={() => handleRemoveInterest(interest)}>✕</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" className="save-button" disabled={loading}>
                                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="settings-section">
                                <h3>Segurança da Conta</h3>
                                <form onSubmit={handleChangePassword} className="settings-form">
                                    <div className="form-group">
                                        <label htmlFor="currentPassword">Senha Atual</label>
                                        <input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="newPassword">Nova Senha</label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <button type="submit" className="save-button" disabled={loading}>
                                        {loading ? 'Alterando...' : 'Alterar Senha'}
                                    </button>
                                </form>

                                <div className="danger-zone">
                                    <h3>Zona de Perigo</h3>
                                    <p>Uma vez que você deletar sua conta, não há como voltar atrás. Por favor, tenha certeza.</p>
                                    <button
                                        className="delete-button"
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                    >
                                        Deletar Conta
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="settings-section">
                                <h3>Configurações de Privacidade</h3>
                                <div className="settings-form">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Mostrar Status Online</label>
                                            <small>Outros usuários podem ver quando você está online</small>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={showOnline}
                                                onChange={(e) => setShowOnline(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Permitir Mensagens</label>
                                            <small>Receber mensagens de seus matches</small>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={allowMessages}
                                                onChange={(e) => setAllowMessages(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Mostrar Lista de Matches</label>
                                            <small>Permitir que outros vejam seus matches mútuos</small>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={showMatches}
                                                onChange={(e) => setShowMatches(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="settings-section">
                                <h3>Preferências de Notificações</h3>
                                <div className="settings-form">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Notificações por Email</label>
                                            <small>Receber atualizações importantes por email</small>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={emailNotifications}
                                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Notificações de Matches</label>
                                            <small>Ser notificado quando fizer um novo match</small>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={matchNotifications}
                                                onChange={(e) => setMatchNotifications(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Notificações de Mensagens</label>
                                            <small>Ser notificado quando receber novas mensagens</small>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={messageNotifications}
                                                onChange={(e) => setMessageNotifications(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="logout-button-footer" onClick={onLogout}>
                        Sair da Conta
                    </button>
                    <small>Versão 1.0.0 • © 2024 Connecto</small>
                </div>
            </div>
        </div>
    );
};

export default Settings;
