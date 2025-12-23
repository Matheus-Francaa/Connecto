import React, { useState } from 'react';
import { UserPreferences, ChatMode } from '../types';
import './InterestsSelector.css';

interface InterestsSelectorProps {
    mode: ChatMode;
    onComplete: (preferences: UserPreferences) => void;
    onBack: () => void;
}

const INTEREST_OPTIONS = [
    { id: 'music', label: '🎵 Música', category: 'hobbies' },
    { id: 'movies', label: '🎬 Filmes & Séries', category: 'hobbies' },
    { id: 'sports', label: '⚽ Esportes', category: 'hobbies' },
    { id: 'travel', label: '✈️ Viagens', category: 'hobbies' },
    { id: 'reading', label: '📚 Leitura', category: 'hobbies' },
    { id: 'gaming', label: '🎮 Games', category: 'hobbies' },
    { id: 'cooking', label: '🍳 Culinária', category: 'hobbies' },
    { id: 'art', label: '🎨 Arte', category: 'hobbies' },
    { id: 'technology', label: '💻 Tecnologia', category: 'interests' },
    { id: 'fitness', label: '💪 Fitness', category: 'interests' },
    { id: 'nature', label: '🌿 Natureza', category: 'interests' },
    { id: 'photography', label: '📸 Fotografia', category: 'interests' },
    { id: 'fashion', label: '👗 Moda', category: 'interests' },
    { id: 'pets', label: '🐾 Pets', category: 'interests' },
    { id: 'yoga', label: '🧘 Yoga & Meditação', category: 'interests' },
    { id: 'business', label: '💼 Negócios', category: 'interests' },
];

const InterestsSelector: React.FC<InterestsSelectorProps> = ({ mode, onComplete, onBack }) => {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [age, setAge] = useState<number>(25);
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [lookingFor, setLookingFor] = useState<'male' | 'female' | 'any'>('any');

    const toggleInterest = (interestId: string) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    };

    const handleContinue = () => {
        const preferences: UserPreferences = {
            mode,
            interests: selectedInterests,
        };

        if (mode === 'connections') {
            preferences.ageRange = { min: age - 5, max: age + 5 };
            preferences.gender = gender;
            preferences.lookingFor = lookingFor;
        }

        onComplete(preferences);
    };

    return (
        <div className="interests-selector">
            <button className="back-button" onClick={onBack}>
                ← Voltar
            </button>

            <div className="selector-header">
                <h2>
                    {mode === 'casual'
                        ? 'Sobre o que você gosta de conversar?'
                        : 'Vamos encontrar alguém compatível com você'}
                </h2>
                <p>
                    {mode === 'casual'
                        ? 'Selecione seus interesses para encontrar pessoas com gostos em comum'
                        : 'Quanto mais informações, melhor será o match!'}
                </p>
            </div>

            {mode === 'connections' && (
                <div className="profile-section">
                    <h3>Informações Básicas</h3>
                    <div className="profile-inputs">
                        <div className="input-group">
                            <label>Sua idade:</label>
                            <input
                                type="number"
                                min="18"
                                max="99"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="age-input"
                            />
                        </div>

                        <div className="input-group">
                            <label>Você é:</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="select-input">
                                <option value="male">Homem</option>
                                <option value="female">Mulher</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Buscando:</label>
                            <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value as any)} className="select-input">
                                <option value="any">Tanto faz</option>
                                <option value="male">Homens</option>
                                <option value="female">Mulheres</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="interests-section">
                <h3>Selecione seus interesses ({selectedInterests.length} selecionados)</h3>
                <div className="interests-grid">
                    {INTEREST_OPTIONS.map((interest) => (
                        <button
                            key={interest.id}
                            className={`interest-tag ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
                            onClick={() => toggleInterest(interest.id)}
                        >
                            {interest.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="selector-footer">
                <p className="hint-text">
                    {mode === 'casual'
                        ? `💡 Selecione pelo menos 3 interesses para melhores conexões`
                        : `💡 No modo Conexões, você terá mais tempo para conversar e conhecer a pessoa de verdade`}
                </p>
                <button
                    className="continue-button"
                    onClick={handleContinue}
                    disabled={selectedInterests.length === 0}
                >
                    {mode === 'casual' ? 'Começar a Conversar' : 'Encontrar Alguém Especial'}
                </button>
            </div>
        </div>
    );
};

export default InterestsSelector;
