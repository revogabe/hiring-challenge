# 🛠️ Desafio Técnico Opwell – #01

## Título do Desafio

**Associação de Áreas Vizinhas e Equipamentos**

## Objetivo

Aprimorar o sistema de gestão de ativos para suportar relacionamentos de vizinhança entre áreas e atualizar a forma como os equipamentos são associados a essas áreas com base nesse novo contexto.

---

## Contexto

No modelo atual:

- Áreas pertencem a Plantas.
- Equipamentos pertencem a uma única Área.

Esse modelo funciona bem em cenários simples, mas em ambientes industriais reais, é comum que equipamentos estejam distribuídos entre **áreas vizinhas** ou se movimentem entre elas. Precisamos refletir essa realidade no sistema.

---

## Requisitos

- Deve ser possível definir que uma Área é vizinha de outra Área.
- Se a Área A for vizinha da Área B, então a Área B também deve ser vizinha da Área A.
- Uma Área não pode ser vizinha de si mesma.
- Equipamentos podem pertencer a uma ou mais Áreas, desde que essas Áreas sejam vizinhas entre si.
- Usuários devem poder gerenciar as vizinhanças entre Áreas.
- Usuários devem poder associar Equipamentos a múltiplas Áreas.
- O sistema deve impedir a associação de Equipamentos com Áreas que não sejam vizinhas.
- Todas as funcionalidades existentes relacionadas a Áreas e Equipamentos devem continuar funcionando normalmente.

---

## Antes de Começar

Antes de implementar a sua solução, escreva um breve resumo descrevendo:

- Como você pretende abordar o desafio
- Quais partes do sistema você espera alterar ou estender
- Quais suposições ou decisões você está tomando

Revisaremos esse plano com você antes do início do desenvolvimento, para garantir alinhamento e fornecer feedback.

---

## Entregáveis

- Código atualizado do backend e da API
- Interface do frontend atualizada com o novo comportamento
- Scripts de migração, dados de exemplo ou alterações de configuração necessárias
- Explicação clara da sua abordagem (ver seção acima)
- Instruções de como executar e testar a solução

---

## Critérios de Avaliação

- Aderência aos requisitos de negócio descritos
- Clareza e qualidade do código
- Consistência e manutenibilidade da solução em relação ao sistema existente
- Usabilidade e experiência da interface atualizada
- Tratamento adequado de restrições e casos de borda
- Clareza na comunicação do raciocínio e das decisões tomadas
