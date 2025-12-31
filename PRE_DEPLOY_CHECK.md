# ✅ Checklist Pré-Deploy - Connecto

Antes de colocar no ar, vamos verificar se tudo está funcionando localmente.

## 🎯 Checklist Rápido

### 1️⃣ Backend (Server)
- [ ] Servidor inicia sem erros
- [ ] Socket.io está rodando
- [ ] Rotas de autenticação funcionam
- [ ] Banco de dados (in-memory) funciona

### 2️⃣ Frontend (Client)
- [ ] Aplicação carrega sem erros
- [ ] Conecta com o backend
- [ ] Interface está responsiva

### 3️⃣ Funcionalidades Core
- [ ] Login/Cadastro funciona
- [ ] Acesso Demo funciona
- [ ] Modo visitante funciona
- [ ] Video chat conecta
- [ ] Matches funcionam
- [ ] Chat de texto funciona
- [ ] Configurações abrem e salvam

---

## 🚀 Teste Completo - Passo a Passo

### **Passo 1: Testar Backend**

```bash
# Terminal 1 - Iniciar servidor
cd server
npm install
npm run dev
```

**✅ Verificar:**
- Console mostra: `Server running on port 8000`
- Console mostra: `✓ Socket.IO initialized`
- Nenhum erro vermelho aparece
- Aviso sobre Google OAuth é OK (esperado)

**🧪 Testar API:**
```bash
# Novo terminal
# Windows (Git Bash):
curl http://localhost:8000/health

# Deve retornar algo como:
# {"status":"ok","timestamp":...}
```

Se o comando `curl` não funcionar, abra o navegador em: `http://localhost:8000`

---

### **Passo 2: Testar Frontend**

```bash
# Terminal 2 - Iniciar cliente
cd client
npm install
npm run dev
```

**✅ Verificar:**
- Console mostra: `Local: http://localhost:5173/`
- Navegador abre automaticamente
- Nenhum erro vermelho no console do navegador (F12)

---

### **Passo 3: Testar Funcionalidades**

Abra o navegador em `http://localhost:5173`

#### **3.1 Login Demo (RÁPIDO)**
1. Clique no botão verde **"🚀 Acesso Demo Rápido"**
2. ✅ Deve logar automaticamente
3. ✅ Mostra nome "Usuário Demo" no canto superior esquerdo
4. ✅ Botão de configurações (⚙️) aparece

#### **3.2 Configurações**
1. Clique no botão **⚙️** (engrenagem)
2. ✅ Modal de configurações abre
3. Teste cada aba:
   - **👤 Perfil**: Mude o nome, adicione bio, adicione interesses
   - **🔐 Conta**: Tente alterar senha (opcional)
   - **🛡️ Privacidade**: Toggle os switches
   - **🔔 Notificações**: Toggle os switches
4. Clique "Salvar Alterações"
5. ✅ Mensagem de sucesso aparece
6. Feche e reabra as configurações
7. ✅ Dados foram salvos

#### **3.3 Video Chat**
1. Volte para Home (feche configurações)
2. Clique em **"Chat Aleatório"** ou **"Connections"**
3. Escolha interesses (qualquer um)
4. ✅ Câmera solicita permissão
5. ✅ Seu vídeo aparece
6. ✅ Mostra "Procurando..." (normal não encontrar ninguém localmente)
7. Clique "Sair" para voltar

#### **3.4 Matches (Autenticado)**
1. Clique em **"💕 Matches"** (canto superior direito)
2. ✅ Lista de matches abre
3. ✅ Mostra mensagem "Nenhum match ainda" (normal)
4. Clique "Voltar"

#### **3.5 Logout e Login Manual**
1. Clique em **"Sair"**
2. ✅ Volta para tela de login
3. Crie uma conta nova:
   - Email: `teste@teste.com`
   - Senha: `teste123`
   - Nome: `Teste Usuario`
4. ✅ Login funciona
5. ✅ Mostra "Teste Usuario" no canto

#### **3.6 Modo Visitante**
1. Faça logout
2. Clique **"Continuar sem cadastro"**
3. ✅ Entra como visitante
4. ✅ Badge "Modo Visitante" aparece
5. ✅ Botão de matches NÃO aparece (correto)
6. ✅ Video chat funciona normalmente

---

## 🔍 Verificar Console do Navegador

Pressione **F12** → Aba **Console**

**✅ Bom:**
- Mensagens azuis/brancas (logs normais)
- "Socket connected" ou similar

**❌ Problemas:**
- Erros vermelhos
- "Failed to fetch"
- "CORS error"
- "WebSocket connection failed"

---

## 🗄️ Banco de Dados (In-Memory)

O Connecto usa **armazenamento em memória** (Map):
- ✅ Usuários criados ficam salvos enquanto servidor roda
- ✅ Matches funcionam
- ❌ Dados são perdidos ao reiniciar servidor (isso é OK para MVP)

**Testar persistência:**
1. Crie um usuário: `user1@test.com`
2. **NÃO** reinicie o servidor
3. Faça logout
4. Faça login novamente com `user1@test.com`
5. ✅ Deve funcionar (dados ainda na memória)
6. Reinicie o servidor (`Ctrl+C` e `npm run dev`)
7. Tente logar com `user1@test.com`
8. ❌ Não vai funcionar (dados perdidos - esperado)

**Para deploy:** Isso não é problema! Cada sessão do servidor mantém dados. Para produção real, você pode adicionar banco de dados depois.

---

## 🐛 Problemas Comuns

### ❌ "Failed to fetch" ao fazer login
**Causa:** Backend não está rodando ou URL errada

**Solução:**
```bash
# Verifique se server está rodando:
cd server
npm run dev

# Verifique o arquivo client/.env:
VITE_API_URL=http://localhost:8000
```

### ❌ "WebSocket connection failed"
**Causa:** Socket.io não conectou

**Solução:**
- Reinicie o servidor
- Limpe cache do navegador (Ctrl+Shift+Delete)
- Verifique se porta 8000 está livre

### ❌ Video chat não solicita câmera
**Causa:** HTTPS necessário ou permissões negadas

**Solução:**
- Em localhost funciona sem HTTPS
- Verifique permissões do navegador
- Tente outro navegador (Chrome recomendado)

### ❌ Configurações não salvam
**Causa:** Token inválido ou rota errada

**Solução:**
- Faça logout e login novamente
- Verifique console (F12) por erros
- Certifique-se que está usando conta criada (não visitante)

---

## 📊 Relatório de Status

Marque cada item testado:

### Backend
- [ ] Servidor inicia sem erros
- [ ] Porta 8000 acessível
- [ ] Socket.io conectando
- [ ] Rotas /auth/register funcionam
- [ ] Rotas /auth/login funcionam
- [ ] Rotas /auth/update-profile funcionam

### Frontend
- [ ] Aplicação carrega
- [ ] Sem erros no console
- [ ] Conecta com backend
- [ ] Interface responsiva (teste mobile com F12 → Toggle Device)

### Funcionalidades
- [ ] Login Demo funciona
- [ ] Cadastro manual funciona
- [ ] Login manual funciona
- [ ] Modo visitante funciona
- [ ] Video chat solicita câmera
- [ ] Configurações abrem
- [ ] Configurações salvam
- [ ] Matches abre (mesmo vazio)
- [ ] Logout funciona

---

## ✅ Pronto para Deploy?

**SIM, se:**
- ✅ Todos os itens acima funcionam
- ✅ Nenhum erro vermelho crítico no console
- ✅ Login/cadastro/configurações funcionam

**NÃO, se:**
- ❌ Erros ao iniciar servidor
- ❌ Frontend não conecta com backend
- ❌ Login não funciona
- ❌ Configurações não salvam

---

## 🚀 Próximos Passos

Se tudo funcionou, você está pronto para deploy! Siga o **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**

---

## 💡 Dicas

1. **Teste em modo anônimo** (Ctrl+Shift+N) para evitar cache
2. **Use Chrome DevTools** (F12) para debugar
3. **Mantenha os dois terminais** (server e client) abertos durante testes
4. **Não se preocupe** com avisos amarelos, só erros vermelhos importam

---

## 🆘 Se algo não funcionar

1. Verifique se ambos server e client estão rodando
2. Limpe node_modules e reinstale:
   ```bash
   cd server && rm -rf node_modules && npm install
   cd ../client && rm -rf node_modules && npm install
   ```
3. Verifique se as portas 8000 e 5173 não estão em uso
4. Reinicie tudo do zero
