# 🚀 Guia de Deploy - Connecto

Este guia explica como colocar o Connecto no ar para uso público.

## 📋 Pré-requisitos

- Conta no [Render](https://render.com) ou [Railway](https://railway.app) (Backend)
- Conta no [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (Frontend)
- Git repository no GitHub

---

## 🎯 Opção 1: Deploy Rápido (Recomendado)

### Backend - Render.com (Grátis)

1. **Criar conta no Render**: https://render.com

2. **Criar novo Web Service**:
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - **Name**: `connecto-server`
     - **Region**: Escolha mais próxima
     - **Branch**: `master` ou `main`
     - **Root Directory**: `server`
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `node dist/index.js`

3. **Adicionar Variáveis de Ambiente**:
   ```env
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://seu-app.vercel.app
   JWT_SECRET=sua-chave-secreta-super-forte-aqui-123456789
   SERVER_URL=https://connecto-server.onrender.com
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   ```

4. **Deploy**: Clique em "Create Web Service"

---

### Frontend - Vercel (Grátis)

1. **Criar conta no Vercel**: https://vercel.com

2. **Importar Projeto**:
   - Clique em "New Project"
   - Import seu repositório GitHub
   - Configure:
     - **Framework Preset**: `Vite`
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Adicionar Variáveis de Ambiente**:
   ```env
   VITE_API_URL=https://connecto-server.onrender.com
   ```

4. **Deploy**: Clique em "Deploy"

---

## 🎯 Opção 2: Deploy com Railway (Mais Rápido)

### Backend + Frontend Juntos

1. **Criar conta no Railway**: https://railway.app

2. **Criar Novo Projeto**:
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório

3. **Configurar Backend**:
   - Adicione as variáveis de ambiente (mesmo do Render acima)
   - Railway detecta automaticamente Node.js

4. **Configurar Frontend**:
   - Crie outro serviço no mesmo projeto
   - Configure root directory para `client`

---

## 📦 Build Local (Teste antes do Deploy)

### Backend

```bash
cd server
npm install
npm run build
npm start
```

### Frontend

```bash
cd client
npm install
npm run build
npm run preview
```

---

## ⚙️ Configurações Importantes

### 1. CORS

Já está configurado no backend para aceitar requisições do frontend.

### 2. WebSocket

Certifique-se que o servidor suporta WebSocket:
- ✅ Render.com: Suporta
- ✅ Railway: Suporta
- ✅ Fly.io: Suporta
- ❌ Vercel: NÃO suporta WebSocket (use apenas para frontend)

### 3. Segurança

**IMPORTANTE**: Antes do deploy, altere:

```env
# server/.env
JWT_SECRET=gere-uma-chave-forte-aleatoria-aqui
```

Gere uma chave segura:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔧 Configurações de Produção

### Backend (server/package.json)

Já está configurado:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  }
}
```

### Frontend (client/package.json)

Já está configurado:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 🌐 Configurar Domínio Customizado (Opcional)

### Vercel
1. Vá em "Settings" → "Domains"
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Render
1. Vá em "Settings" → "Custom Domain"
2. Adicione seu domínio
3. Configure DNS com CNAME

---

## 🐛 Troubleshooting

### Erro de CORS
```env
# No backend, certifique-se que CLIENT_URL está correto
CLIENT_URL=https://seu-dominio-frontend.vercel.app
```

### WebSocket não conecta
- Verifique se o servidor suporta WebSocket
- Use `wss://` (não `ws://`) em produção
- Já configurado automaticamente no código

### Build falha
```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoramento

### Logs do Backend
- **Render**: Dashboard → "Logs"
- **Railway**: Dashboard → "Deployments" → Ver logs

### Analytics do Frontend
- **Vercel**: Dashboard → "Analytics"
- Considere adicionar Google Analytics

---

## 💰 Custos

### Free Tier (Suficiente para início)

| Serviço | Backend | Frontend | Limites |
|---------|---------|----------|---------|
| Render | ✅ Grátis | ❌ | 750h/mês, hiberna após inatividade |
| Railway | ✅ Grátis | ✅ Grátis | $5 crédito/mês |
| Vercel | ❌ | ✅ Grátis | Ilimitado |
| Netlify | ❌ | ✅ Grátis | 100GB banda/mês |

**Recomendação**: Backend no Render + Frontend no Vercel = 100% Grátis

---

## 🚀 Deploy Rápido em 5 Minutos

1. **Push para GitHub**:
```bash
git add .
git commit -m "Preparar para deploy"
git push origin master
```

2. **Deploy Backend** (Render):
   - Acesse render.com
   - New Web Service
   - Conecte repo
   - Adicione env vars
   - Deploy!

3. **Deploy Frontend** (Vercel):
   - Acesse vercel.com
   - New Project
   - Import repo
   - Configure root: `client`
   - Adicione `VITE_API_URL`
   - Deploy!

4. **Teste**:
   - Acesse a URL do Vercel
   - Faça login demo
   - Teste video chat

---

## 📝 Checklist Final

Antes de compartilhar com usuários:

- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET alterado para valor seguro
- [ ] Testado login/cadastro
- [ ] Testado video chat
- [ ] Testado matches
- [ ] WebSocket conectando
- [ ] HTTPS ativo (automático no Render/Vercel)
- [ ] Domínio customizado (opcional)

---

## 🎉 Pronto!

Seu app está no ar! Compartilhe a URL do Vercel com seus usuários.

**URLs de exemplo**:
- Frontend: `https://connecto.vercel.app`
- Backend: `https://connecto-server.onrender.com`

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do servidor
2. Teste localmente primeiro
3. Verifique configurações de CORS
4. Confirme que variáveis de ambiente estão corretas
