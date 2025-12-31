# 🚀 Deploy Rápido - 5 Minutos

## Passo 1: Preparar Código

```bash
# Certifique-se que está tudo commitado
git add .
git commit -m "Preparar para deploy"
git push origin master
```

## Passo 2: Deploy Backend (Render)

1. Acesse: https://render.com
2. Clique em "Get Started" → Login com GitHub
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório GitHub `Connecto`
5. Configure:
   - **Name**: `connecto-server`
   - **Region**: Oregon (US West)
   - **Branch**: `master`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: Free

6. Adicione Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://SEU-APP.vercel.app
   JWT_SECRET=cole-uma-chave-aleatoria-aqui
   SERVER_URL=https://connecto-server.onrender.com
   ```

7. Clique "Create Web Service"
8. **COPIE A URL** que será algo como: `https://connecto-server.onrender.com`

## Passo 3: Deploy Frontend (Vercel)

1. Acesse: https://vercel.com
2. Login com GitHub
3. Clique "Add New..." → "Project"
4. Import seu repositório `Connecto`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Clique "Environment Variables" e adicione:
   ```
   VITE_API_URL=https://connecto-server.onrender.com
   ```
   (Cole a URL do backend que você copiou)

7. Clique "Deploy"
8. Aguarde 2-3 minutos
9. **COPIE A URL** do seu app: `https://SEU-APP.vercel.app`

## Passo 4: Atualizar Backend com URL do Frontend

1. Volte ao Render
2. Vá em seu Web Service
3. Clique "Environment"
4. Edite `CLIENT_URL` e cole a URL do Vercel
5. Salve (o servidor reiniciará automaticamente)

## ✅ Pronto!

Acesse seu app em: `https://SEU-APP.vercel.app`

### Testar:
- [x] Página carrega
- [x] Botão "Acesso Demo Rápido" funciona
- [x] Login cria conta
- [x] Video chat conecta
- [x] Matches funcionam

---

## 🐛 Problemas?

### "Failed to fetch" ou erro de CORS
- Verifique se `CLIENT_URL` no backend está correto
- Deve ser a URL exata do Vercel (com https://)

### Backend não inicia
- Verifique os logs no Render (aba "Logs")
- Confirme que `npm run build` funcionou

### Frontend não carrega
- Verifique se `VITE_API_URL` está correto
- Deve apontar para o Render (com https://)

---

## 💡 Dica

O primeiro acesso pode demorar ~30 segundos pois o Render hiberna apps grátis após inatividade. Isso é normal!

Para evitar hibernação, considere:
- Upgrade para plano pago ($7/mês)
- Usar serviço de "keep alive" grátis
- Usar Railway ao invés de Render
