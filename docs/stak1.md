# Solicitação de Implementação: Fluxo de Termo de Abertura de Notas/Faltas

Preciso implementar uma nova funcionalidade de **Termo de Abertura**. Ela serve para que os professores solicitem a reabertura de uma turma fechada ou a alteração individual de notas/faltas de um aluno. A alteração só entra em vigor após a aprovação do Administrador.

Siga os padrões visuais, de componentes e de arquitetura já existentes no projeto.

---

## 1. Perfil do Professor: Menu e Tela de Solicitação

### 1.1 Sidebar do Professor

- Adicionar um novo menu abaixo de `"Minhas turmas"` chamado `"Termo de Abertura"`.

### 1.2 Tela: "Solicitação de Termo de Abertura de Notas/Faltas"

Crie uma nova tela com este título, dividida em duas seções principais:

#### Seção A: Solicitação por Turma Completa

- **Filtro de Período Letivo:** Um select/dropdown (ex: `2026.2`).
- **Listagem Dinâmica:** Ao selecionar o período, buscar e listar as turmas do professor logado exibindo: **Código da Turma**, **Curso** e **Disciplina**.
- **Seleção:** Adicionar um `checkbox` ao lado de cada turma listada.
- **Ação:** Um botão `"Solicitar abertura"` que envia as turmas selecionadas para a fila de aprovação do admin com o status `Pendente`.

#### Seção B: Solicitação de Alteração Individual (Notas/Faltas)

- **Regra — só turma encerrada:** o professor só pode solicitar alteração individual de notas/faltas se a turma daquele aluno **já estiver encerrada** (`semestreFechado`). O termo existe exatamente para esse caso: o diário regular já não aceita lançamento.
- **Turma ainda em aberto:** se o professor buscar/selecionar um aluno cuja turma não foi encerrada, **não** mostrar o formulário de alteração. Exibir um aviso informando que a mudança deve ser feita no **diário regular** da turma (não pelo termo).
- **Busca de Aluno:** Um campo de input para buscar por **RA** ou **Nome do Aluno** (diários abertos e encerrados do professor).
- **Visualização do Diário:** Ao selecionar o aluno com turma encerrada, carregar os dados atuais do diário de classe dele em modo **apenas leitura** (Read-Only).
- **Interface de Alteração:** Permitir que o professor indique qual nota (`AV`, `AVS`, `AV3`) ou `Faltas` ele deseja alterar.
  - _Exemplo de UX:_ Mostrar o valor atual (ex: `AV3: 3.0`) e ao lado um campo de input para o novo valor (ex: `7.0`).
- **Ação:** Um botão `"Solicitar alteração"` que grava essa requisição com o status `Pendente` (somente se a turma estiver encerrada).

---

## 2. Perfil do Admin: Fluxo de Aprovação e Relatório

### 2.1 Sidebar do Admin

- No menu `"Acadêmico & Regulação"`, abaixo de `"Turmas Semestrais"`, adicionar o submenu `"Aprovação de Termo"`.

### 2.2 Tela: "Controle e Aprovação de Termos"

- Criar uma tela centralizadora que mostre a lista de solicitações pendentes dos professores.
- Deve ser possível diferenciar visualmente os dois tipos de solicitação:
  1. **Abertura de Período/Turma**
  2. **Alteração Individual de Nota/Falta**
- Cada item deve ter os botões de ação: **Aprovar** e **Recusar**.

#### Regra de Negócio na Aprovação:

- **Se aprovar Abertura de Turma:** O sistema deve reabrir o diário de classe daquela turma específica para o professor poder editar livremente.
- **Se aprovar Alteração Individual:** O sistema deve persistir automaticamente a nova nota/falta diretamente no histórico do aluno, atualizando a média se necessário, sem que o professor precise digitar de novo.

---

## 3. Relatório de Solicitações

- Criar uma tela ou aba de relatório dentro do painel do Admin.
- O relatório deve mostrar de forma analítica e sintética:
  - **Quantidade** de solicitações abertas.
  - **Quem** abriu (Nome do professor).
  - **Data** da solicitação.
  - **Status** (Aprovado, Recusado, Pendente).
- Adicionar filtros por **Período de Data** e **Professor**.

---

### Orientações de Implementação

- Crie as migrações de banco de dados necessárias para armazenar essas solicitações (tabela `solicitacoes_termo_abertura` ou similar).
- Certifique-se de validar as permissões de rota (Apenas Admin aprova, apenas Professor solicita).
- Reaproveite os componentes de UI de tabelas, inputs e modais padrão do projeto.
