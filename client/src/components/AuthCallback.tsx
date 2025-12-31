import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            alert('Erro na autenticação com Google. Tente novamente.');
            navigate('/');
            return;
        }

        if (token) {
            // Save token and redirect
            localStorage.setItem('token', token);

            // Decode token to get user info (basic decode, not validation)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                localStorage.setItem('user', JSON.stringify({
                    id: payload.id,
                    email: payload.email,
                    name: payload.name
                }));

                window.location.href = '/';
            } catch (e) {
                console.error('Error parsing token:', e);
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #8b5cf6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p>Autenticando...</p>
        </div>
    );
};

export default AuthCallback;
