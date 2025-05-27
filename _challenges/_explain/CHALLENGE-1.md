### Solução do CHALLENGE-1: Associação de Vizinhança entre Áreas e Equipamentos

**Resumo da abordagem**

Implementei uma solução que melhora o sistema de gestão de ativos da Opwell, permitindo criar relações de vizinhança entre áreas e associar equipamentos a várias áreas vizinhas. Vou explicar aqui como pensei a solução, o que foi mudado no sistema e algumas decisões importantes que tomei.

**Entendendo o problema**

Antes, o sistema era bem simples:

- Cada área pertencia a uma planta
- Cada equipamento pertencia a uma área só

O desafio era justamente deixar esse modelo mais próximo da realidade, onde equipamentos podem ficar em mais de uma área ou até mudar de lugar entre áreas vizinhas.

**Como foi feita a solução**

#### 1. Mudanças no backend

**Banco de dados**

- Criei uma tabela de ligação (`area_neighbors`) para registrar quais áreas são vizinhas (relação muitos-para-muitos)
- Ajustei a tabela de equipamentos para permitir que um mesmo equipamento fique ligado a várias áreas
- Adicionei restrições para garantir as regras de negócio

**APIs**

- Criei endpoints para gerenciar as relações de vizinhança entre áreas
- Ajustei os endpoints de equipamentos para aceitar associação com várias áreas
- Implementei validações para garantir que o equipamento só possa ser associado a áreas vizinhas

**Principais mudanças no código**

- Entidade Area: agora tem relação de vizinhança
- Entidade Equipment: pode ter várias áreas associadas
- Criei serviços para lidar com as regras de vizinhança

#### 2. Melhorias no frontend

**Gestão de Áreas**

- Agora dá pra visualizar facilmente quais áreas são vizinhas de cada área
- O usuário consegue adicionar e remover vizinhos de forma intuitiva

**Gestão de Equipamentos**

- Formulário de equipamento agora permite selecionar várias áreas
- Tem validação pra garantir que só áreas vizinhas podem ser escolhidas
- A tela de detalhes do equipamento mostra todas as áreas associadas

**Detalhes técnicos**

- Relação de vizinhança: usei relação muitos-para-muitos na própria tabela de áreas
- Validação: a relação de vizinhança é sempre bidirecional (se A é vizinha de B, B também é de A)
- Cuidei para que todas as transações mantenham os dados consistentes
- No frontend continuei usando componentes do Ant Design para não fugir do que já estava sendo feito

**Decisões principais**

- Relação bidirecional: garanti que ao adicionar uma vizinhança ela vale pros dois lados automaticamente
- Design do banco: usei tabelas de ligação para deixar o sistema flexível pra futuras mudanças
- Validação: tem tanto no backend quanto no frontend, então o usuário já recebe o feedback na hora
- UX: priorizei deixar fácil e visual de mexer nas vizinhanças
- Migração: deixei compatível com o que já existia pra não quebrar nada

**Como testar**

- Vá na página de áreas e adicione vizinhos a uma área (a relação deve ser nos dois sentidos)
- Vá na página de equipamentos, crie ou edite um equipamento e selecione várias áreas vizinhas (o sistema deve aceitar)
- Tente associar um equipamento a áreas que não são vizinhas (o sistema deve bloquear)

**Conclusão**

A solução atende tudo o que foi pedido no Challenge #1, sem quebrar o que já funcionava. Agora, ficou muito mais prático e flexível gerenciar vizinhança entre áreas e equipamentos, refletindo melhor a realidade de ambientes industriais.

**Observações**

Como não tive muito tempo para o desafio e também porque era apenas um desafio tecnico, deixei de fazer muitas melhorias que gostaria de ter feito por exemplo:

- Configurar Testes para as novas features.
- Modularizar melhor o projeto.
- Testar todas as regras de negócio para certificar que esta tudo ocorrendo perfeitamente bem.
- Trocar de SQLite para MySQL ou PostgreSQL para melhor desempenho.
- Criação de tela individual para gerenciamento da vizinhação via React-Diagrams
- Refactor do frontend pois estáva bem bagunçado e de forma bem amadora quando pensamos em uma plataforma escalável
- Tratamento de Erros mais claros no frontend
