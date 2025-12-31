# Configuração do Google OAuth

Para habilitar o login com Google, siga estes passos:

## 1. Criar Credenciais no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure a tela de consentimento OAuth se ainda não tiver feito
6. Selecione **Web application** como tipo de aplicação
7. Configure os URIs autorizados:
   - **Authorized JavaScript origins**: `http://localhost:5173` (desenvolvimento)
   - **Authorized redirect URIs**: `http://localhost:8000/auth/google/callback`

## 2. Configurar Variáveis de Ambiente

### Servidor (`server/.env`)
```env
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
JWT_SECRET=seu-jwt-secret-forte
SERVER_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### Cliente (`client/.env`)
```env
VITE_API_URL=http://localhost:8000
```

## 3. Para Produção

Quando for para produção, adicione:
- **Authorized JavaScript origins**: `https://seu-dominio.com`
- **Authorized redirect URIs**: `https://seu-dominio.com/auth/google/callback`

E atualize as variáveis de ambiente de acordo.

## Observações

- O Google OAuth só funciona com HTTPS em produção
- Em desenvolvimento, localhost é permitido sem HTTPS
- Mantenha suas credenciais seguras e nunca as commit no Git
