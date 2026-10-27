# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve permitir localizar uma cidade, visualizar as condições atuais e a previsão para os próximos cinco dias, escolher entre Celsius e Fahrenheit e utilizar a aplicação em dispositivos móveis.

O briefing define as capacidades principais, mas ainda não especifica público-alvo, fontes de dados, regras de busca, detalhes das informações meteorológicas nem critérios de qualidade mensuráveis. Esses pontos devem ser esclarecidos antes de consolidar a especificação do produto.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o resultado desejado.
- **RF-02 — Consultar clima atual:** apresentar as condições meteorológicas atuais para a cidade selecionada.
- **RF-03 — Consultar previsão:** apresentar a previsão do tempo para cinco dias para a cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e exibir as temperaturas na unidade escolhida.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade e uso móvel:** as funcionalidades principais devem ser utilizáveis em larguras de tela de 320 px a 1440 px, sem rolagem horizontal. Dispositivos e navegadores suportados precisam ser confirmados.
- **RNF-02 — Usabilidade:** em testes com usuários representativos, pelo menos 90% devem conseguir buscar uma cidade, consultar o clima atual e visualizar a previsão sem ajuda. O público e o protocolo de teste precisam ser definidos.
- **RNF-03 — Desempenho:** em condições de rede e disponibilidade da fonte de dados a definir, 95% das buscas e consultas meteorológicas devem apresentar os resultados em até 3 segundos.
- **RNF-04 — Disponibilidade e resiliência:** a meta inicial é disponibilidade mensal de 99,5%. Se a fonte de dados estiver indisponível, a aplicação deve informar a falha e não apresentar dados desatualizados como atuais.
- **RNF-05 — Acessibilidade:** a interface deve atender ao nível AA da WCAG 2.2, incluindo operação por teclado e compatibilidade com leitores de tela.
- **RNF-06 — Atualização dos dados:** a interface deve informar o horário da última atualização e sinalizar dados considerados desatualizados; o limite de desatualização precisa ser definido.

> As metas numéricas acima são propostas iniciais para discussão e devem ser validadas antes de se tornarem critérios de aceite.

## Riscos

- **Dados externos indisponíveis ou atrasados:** a consulta ao clima e à previsão pode falhar ou apresentar informações desatualizadas se a fonte de dados estiver indisponível.
- **Resultados ambíguos na busca:** cidades com nomes iguais ou semelhantes podem levar à seleção de uma localidade incorreta.
- **Interpretações diferentes de “cinco dias”:** o período pode ser contado a partir do dia atual ou corresponder aos cinco dias seguintes, gerando expectativas divergentes.
- **Conversão ou apresentação inconsistente de temperatura:** trocar a unidade sem atualizar todas as temperaturas exibidas pode confundir o usuário.
- **Experiência móvel insuficiente:** sem confirmação da matriz de dispositivos e navegadores, a cobertura da responsividade pode ficar incompleta.
- **Escopo meteorológico indefinido:** o briefing não esclarece quais dados além da temperatura devem compor o clima atual e a previsão.

## Perguntas em Aberto

- Qual fonte de dados meteorológicos deve ser utilizada e há restrições de licença, custo ou volume de consultas?
- A busca deve aceitar nomes parciais, acentos e localidades em diferentes países? Como o usuário distingue cidades homônimas?
- Quais informações compõem o clima atual e a previsão, além da temperatura (por exemplo, condição, máxima e mínima)?
- A previsão de cinco dias inclui o dia atual? Deve ser apresentada por dia, por hora ou em ambos os formatos?
- A unidade escolhida deve permanecer após recarregar a aplicação ou iniciar uma nova sessão?
- Qual deve ser o comportamento quando a busca não encontra resultados, a fonte de dados falha ou a conexão é perdida?
- Quais idiomas, navegadores e dispositivos devem ser suportados? A faixa inicial de 320 px a 1440 px é adequada?
- As metas propostas de usabilidade (90%), desempenho (95% em até 3 segundos) e disponibilidade (99,5% ao mês) são aceitáveis? Em quais condições devem ser medidas?
- Qual limite de idade dos dados deve provocar um aviso de desatualização?
- A WCAG 2.2 nível AA é o padrão de acessibilidade esperado?
- Há requisitos de privacidade, retenção de dados ou analytics associados ao uso da aplicação?

## Suposições

- A pesquisa e a consulta meteorológica partem de uma cidade escolhida pelo usuário; localização automática não foi solicitada.
- Celsius e Fahrenheit são unidades de apresentação para a mesma informação de temperatura, sem alterar a cidade ou o período consultado.
- “Previsão de 5 dias” significa uma previsão associada à cidade selecionada para um período de cinco dias, mas a inclusão do dia atual permanece pendente de confirmação.
- A aplicação deve oferecer as funcionalidades principais em telas móveis; a faixa de largura proposta é um ponto inicial sujeito à confirmação.
- O briefing não solicita cadastro, favoritos, notificações, mapas ou outros recursos; eles não fazem parte do escopo confirmado nesta análise.