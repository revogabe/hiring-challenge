# 🛠️ Desafio Técnico Opwell – #02

## Título do Desafio

**Agendamento e Acompanhamento de Manutenções Preventivas**

## Objetivo

Implementar um sistema para calcular e exibir as próximas tarefas de manutenção de equipamentos, além de criar uma estrutura que permita o agendamento de manutenções programadas para peças.

---

## Contexto

Equipamentos em ambientes industriais devem passar por manutenções preventivas em intervalos regulares (por exemplo, a cada 3 meses ou uma vez por ano). O início do ciclo de manutenção pode ser baseado em:

- A **data de instalação** da Peça, ou
- A **data de início de operação** do Equipamento ao qual a Peça está associada.

Esse controle é essencial para garantir confiabilidade, segurança e desempenho ao longo do tempo. Além disso, certas peças exigem rastreamento próprio de manutenção, independente da rotina do equipamento.

---

## Requisitos

- Usuários devem poder definir intervalos de manutenção para os equipamentos (por exemplo, a cada 3 meses ou uma vez por ano) ou uma data específica no futuro.
- Os prazos das manutenções devem ser calculados com base na data de instalação da peça ou na data de início de operação do equipamento.
- Usuários devem poder gerenciar (criar, visualizar, atualizar, excluir) os agendamentos de manutenção.
- Usuários devem poder visualizar um calendário com as próximas manutenções previstas a partir do dia atual.
- A visualização deve apresentar, para cada manutenção:
  - A data limite para execução
  - O título da manutenção
  - A peça que requer manutenção
  - O equipamento, a área e a planta onde essa peça está localizada

---

## Entregáveis

- Uma página com a lista de todas as manutenções futuras, ordenadas pela data limite a partir de hoje.
- Cada item na lista deve incluir:

  - A data limite
  - O título da manutenção
  - A peça envolvida
  - O equipamento, área e planta relacionados à peça

- Uma visualização em calendário com as manutenções programadas.

- Uma interface CRUD para gerenciar os agendamentos de manutenção.

- Instruções claras sobre como executar e testar a solução.

---

## Antes de Começar

Antes de implementar sua solução, escreva um breve resumo descrevendo:

- Como você pretende abordar o desafio
- Quais partes do sistema você espera alterar ou estender
- Quais suposições ou decisões você está tomando

Vamos revisar esse plano com você antes do início do desenvolvimento para garantir alinhamento e oferecer feedback.

---

## Critérios de Avaliação

- Precisão na lógica de cálculo das manutenções
- Completude e clareza da interface de usuário
- Qualidade e consistência do código
- Aderência aos requisitos de negócio
- Estrutura e manutenibilidade das novas funcionalidades
- Clareza na comunicação das decisões de design
