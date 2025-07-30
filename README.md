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

---

## 🔐 Regras RLS (Row Level Security)

### Tabela `spaces`
- **SELECT**: Pública (para clientes verem espaços)
- **INSERT/UPDATE/DELETE**: Apenas `admin` que seja `owner_id`

```sql
CREATE POLICY "Public view of spaces"
  ON spaces FOR SELECT
  USING (true);

CREATE POLICY "Admins manage their spaces"
  ON spaces FOR ALL
  USING (auth.uid() = owner_id);


## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
