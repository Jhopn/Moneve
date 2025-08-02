# 📆 Moneve

**Moneve** é uma plataforma de gerenciamento de aluguéis voltada para donos de espaços comerciais. O sistema permite a visualização de agendamentos em um dashboard com calendário, controle de horários para evitar conflitos e gestão separada por usuários e administradores.

---

## ✨ Funcionalidades

- 📅 **Dashboard com Calendar View** para visualização dos agendamentos
- 🧑‍💼 **Controle de acesso por roles**: usuário e administrador
- 🔒 **Regras de segurança (RLS)** no Supabase para evitar acesso indevido
- ⏱️ **Prevenção de conflitos de horários**
- 🌐 **Visualização pública de espaços**
- 📱 Frontend mobile desenvolvido com React Native (Expo)

---

## 🧱 Stack utilizada

- **Frontend**: React Native (Expo)
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Outros**: Supabase Storage (para arquivos, se necessário), Supabase Functions (se aplicável)

  
## 🧑‍💻 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Jhopn/Moneve.git
cd moneve
```
### 2. Instale as dependências

```bash
npm install
```
### 3. Configure as variáveis de ambiente
Copie o arquivo .env.example e renomeie como .env:
```bash
cp .env.example .env
```
### 4. Rode o Projeto
```bash
npm run start
```

---

## 📊 Estrutura do banco de dados (Supabase)

### Tabelas principais

#### `users`
- `id`: UUID (auth.uid)
- `role`: `"admin"` | `"user"`

#### `spaces`
- `id`
- `name`
- `description`
- `owner_id` → FK para `users.id` (apenas `admin`)

#### `rentals`
- `id`
- `client_name`
- `start_time`
- `end_time`
- `space_id` → FK para `spaces.id`
- `price`



## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
