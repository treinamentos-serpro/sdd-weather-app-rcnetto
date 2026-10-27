# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve permitir localizar uma cidade, visualizar as condições atuais e a previsão para os próximos cinco dias, escolher entre Celsius e Fahrenheit e utilizar a aplicação em dispositivos móveis.

O briefing define as capacidades principais, mas ainda não especifica público-alvo, fontes de dados, regras de busca, detalhes das informações meteorológicas nem critérios de qualidade mensuráveis. Esses pontos devem ser esclarecidos antes de consolidar a especificação do produto.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o resultado desejado.
- **RF-02 — Consultar clima atual:** apresentar as condições meteorológicas atuais para a cidade selecionada.
- **RF-03 — Consultar previsão:** apresentar a previsão do tempo para cinco dias para a cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e exibir as temperaturas na unidade escolhida.
- **RF-05 — Usar em dispositivos móveis:** disponibilizar as funcionalidades principais em dispositivos móveis.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve se adaptar a dispositivos móveis; tamanhos de tela e navegadores suportados precisam ser definidos.
- **RNF-02 — Usabilidade:** busca, seleção de cidade, consulta da previsão e troca de unidade devem ser compreensíveis e utilizáveis nos dispositivos suportados.
- **RNF-03 — Desempenho:** o tempo aceitável para buscar uma cidade e carregar as informações meteorológicas ainda precisa ser definido.
- **RNF-04 — Disponibilidade e resiliência:** o comportamento esperado em falhas ou indisponibilidade da fonte de dados precisa ser definido.
- **RNF-05 — Acessibilidade:** os requisitos de acessibilidade, incluindo navegação por teclado e suporte a tecnologias assistivas, precisam ser acordados.

## Riscos

- **Dados externos indisponíveis ou atrasados:** a consulta ao clima e à previsão pode falhar ou apresentar informações desatualizadas se a fonte de dados estiver indisponível.
- **Resultados ambíguos na busca:** cidades com nomes iguais ou semelhantes podem levar à seleção de uma localidade incorreta.
- **Interpretações diferentes de “cinco dias”:** o período pode ser contado a partir do dia atual ou corresponder aos cinco dias seguintes, gerando expectativas divergentes.
- **Conversão ou apresentação inconsistente de temperatura:** trocar a unidade sem atualizar todas as temperaturas exibidas pode confundir o usuário.
- **Experiência móvel insuficiente:** sem critérios de dispositivos e tamanhos de tela, a cobertura da experiência móvel pode ficar incompleta.
- **Escopo meteorológico indefinido:** o briefing não esclarece quais dados além da temperatura devem compor o clima atual e a previsão.

## Perguntas em Aberto

- Qual fonte de dados meteorológicos deve ser utilizada e há restrições de licença, custo ou volume de consultas?
- A busca deve aceitar nomes parciais, acentos e localidades em diferentes países? Como o usuário distingue cidades homônimas?
- Quais informações compõem o clima atual e a previsão, além da temperatura (por exemplo, condição, máxima e mínima)?
- A previsão de cinco dias inclui o dia atual? Deve ser apresentada por dia, por hora ou em ambos os formatos?
- A unidade escolhida deve permanecer após recarregar a aplicação ou iniciar uma nova sessão?
- Qual deve ser o comportamento quando a busca não encontra resultados, a fonte de dados falha ou a conexão é perdida?
- Quais idiomas, navegadores, dispositivos e tamanhos de tela devem ser suportados?
- Quais metas de desempenho, disponibilidade, acessibilidade e atualização dos dados são esperadas?
- Há requisitos de privacidade, retenção de dados ou analytics associados ao uso da aplicação?

## Suposições

- A pesquisa e a consulta meteorológica partem de uma cidade escolhida pelo usuário; localização automática não foi solicitada.
- Celsius e Fahrenheit são unidades de apresentação para a mesma informação de temperatura, sem alterar a cidade ou o período consultado.
- “Previsão de 5 dias” significa uma previsão associada à cidade selecionada para um período de cinco dias, mas a inclusão do dia atual permanece pendente de confirmação.
- A aplicação deve ser utilizável em telas móveis, embora a matriz de dispositivos e os critérios de responsividade ainda precisem ser definidos.
- O briefing não solicita cadastro, favoritos, notificações, mapas ou outros recursos; eles não fazem parte do escopo confirmado nesta análise.