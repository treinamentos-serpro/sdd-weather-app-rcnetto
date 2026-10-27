# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web responsiva, em português do Brasil, para o
público geral consultar o clima de cidades do mundo todo. A pessoa usuária
pesquisa e seleciona uma cidade para visualizar as condições atuais e a
previsão de hoje e dos quatro dias seguintes. A experiência também permite
alternar entre Celsius e Fahrenheit e consultar detalhes horários da previsão.

O produto utiliza o Open-Meteo como fonte de dados meteorológicos. Não exige
autenticação e não mantém persistência de dados de usuário no servidor. A
localidade selecionada é exibida no fuso horário local da cidade.

### Objetivos

- Permitir que a pessoa encontre a localidade correta mesmo quando há cidades
  com nomes iguais ou grafias diferentes.
- Apresentar condições atuais e previsão de forma compreensível, em especial
  em dispositivos móveis.
- Comunicar a atualidade dos dados e tratar indisponibilidade sem apresentar
  informações antigas como atuais.

As métricas de sucesso de negócio ainda não foram definidas e constam em Open
Questions.

## Functional Requirements

- **RF-01 — Pesquisar e selecionar cidades:** a pessoa usuária deve poder
  pesquisar cidades em qualquer país por nome completo ou parcial. A busca
  deve ignorar diferenças entre maiúsculas/minúsculas e acentos. Cada resultado
  deve identificar a cidade, a região/estado quando disponível e o país, para
  ajudar a distinguir localidades homônimas. A pessoa deve poder selecionar um
  resultado para consultar seu clima.
- **RF-02 — Consultar condições atuais:** para a cidade selecionada, o produto
  deve apresentar a condição do tempo, temperatura atual, sensação térmica,
  máxima e mínima, umidade e vento.
- **RF-03 — Consultar previsão diária e horária:** para a cidade selecionada,
  o produto deve apresentar o resumo diário de hoje e dos quatro dias seguintes.
  Deve ser possível consultar detalhes por hora sob demanda. Datas e horários
  devem corresponder ao fuso horário local da cidade.
- **RF-04 — Alternar unidade de temperatura:** a pessoa usuária deve poder
  alternar entre Celsius e Fahrenheit. Celsius é a unidade inicial. A seleção
  vale até o recarregamento da página ou o início de uma nova visita, não sendo
  persistida. A alternância deve atualizar todas as temperaturas do clima
  atual, da previsão diária e dos detalhes horários, com arredondamento para o
  grau inteiro mais próximo.
- **RF-05 — Informar atualização dos dados:** o produto deve informar o horário
  da última atualização dos dados meteorológicos e sinalizar os dados com mais
  de uma hora como desatualizados.
- **RF-06 — Tratar indisponibilidade e permitir nova tentativa:** diante de
  falha de conexão ou indisponibilidade do Open-Meteo, o produto deve informar
  que não foi possível obter os dados e oferecer uma nova tentativa manual.
  Não deve apresentar dados antigos como se fossem atuais.
- **RF-07 — Comunicar estados de consulta:** enquanto uma busca de cidade ou
  consulta meteorológica estiver em andamento, o produto deve indicar que está
  carregando. Quando a busca terminar sem resultados, deve informar que nenhuma
  cidade foi encontrada e permitir que a pessoa ajuste a consulta.

## User Stories

- **US-01 (RF-01) — Encontrar uma cidade:** Como pessoa que consulta antes de
  sair, quero pesquisar cidades por nome completo ou parcial para selecionar
  rapidamente a localidade cujo clima preciso consultar.
- **US-02 (RF-01) — Distinguir cidades homônimas:** Como pessoa consultando uma
  cidade desconhecida, quero ver cidade, região/estado e país nos resultados
  para escolher o destino correto.
- **US-03 (RF-02) — Consultar condições atuais:** Como pessoa que consulta
  antes de sair, quero ver a condição do tempo, a temperatura e os principais
  indicadores atuais para decidir como me preparar.
- **US-04 (RF-03) — Planejar os próximos dias:** Como pessoa que planeja
  atividades, quero consultar o resumo de hoje e dos quatro dias seguintes e
  seus detalhes por hora para escolher quando realizar uma atividade.
- **US-05 (RF-04) — Usar minha unidade de temperatura:** Como pessoa
  consultando uma cidade desconhecida, quero alternar entre Celsius e
  Fahrenheit para compreender todas as temperaturas na unidade que prefiro.
- **US-06 (RF-05) — Avaliar a atualidade dos dados:** Como pessoa que consulta
  antes de sair, quero ver quando os dados meteorológicos foram atualizados e
  se estão desatualizados para avaliar se ainda posso usá-los para me preparar.
- **US-07 (RF-06) — Recuperar uma consulta com falha:** Como pessoa que planeja
  atividades, quero receber um aviso quando os dados não puderem ser obtidos e
  tentar novamente para concluir meu planejamento com informações disponíveis.
- **US-08 (RF-07) — Entender o estado da consulta:** Como pessoa que consulta
  antes de sair, quero saber quando a busca ou a consulta está carregando e
  quando não há cidades encontradas para entender o resultado e decidir o que
  fazer em seguida.

## Acceptance Criteria

Os critérios abaixo tornam verificáveis os requisitos funcionais. Dados
meteorológicos usados nos testes devem incluir valores e horários controlados,
inclusive casos nas duas unidades de temperatura.

### AC-RF-01 — Pesquisar e selecionar cidades

- Ao pesquisar um nome completo ou parcial de cidade, resultados compatíveis
  com a consulta são apresentados, incluindo resultados de diferentes países.
- Consultas que diferem apenas por maiúsculas/minúsculas ou acentos retornam
  resultados equivalentes.
- Cada resultado identifica a cidade e o país; quando disponível, também
  identifica a região/estado.
- Para duas cidades homônimas, a lista apresenta informação de região/estado
  quando disponível e país, de forma que os resultados possam ser distinguidos.
- Ao selecionar um resultado, o produto apresenta o clima correspondente à
  localidade selecionada.

### AC-RF-02 — Consultar condições atuais

- Após selecionar uma cidade com dados disponíveis, são exibidos condição do
  tempo, temperatura atual, sensação térmica, máxima, mínima, umidade e vento.
- Os valores e a condição exibidos correspondem à localidade selecionada e à
  resposta meteorológica disponível para ela.

### AC-RF-03 — Consultar previsão diária e horária

- Após selecionar uma cidade com dados disponíveis, são exibidos cinco
  resumos diários: hoje e cada um dos quatro dias seguintes.
- A pessoa usuária pode solicitar detalhes por hora para a previsão.
- As datas e horas apresentadas correspondem ao fuso local da cidade, inclusive
  quando ele difere do fuso do dispositivo da pessoa usuária.
- O produto não rotula como hoje uma data que, no fuso local da cidade, seja
  outro dia.

### AC-RF-04 — Alternar unidade de temperatura

- Em uma nova visita, a unidade inicialmente apresentada é Celsius.
- Ao alternar para Fahrenheit, todos os valores de temperatura visíveis no
  clima atual, no resumo diário e nos detalhes horários passam a usar
  Fahrenheit; nenhum componente permanece em Celsius.
- Ao alternar para Celsius, os mesmos valores passam a usar Celsius.
- Para um conjunto de valores de referência conhecido, as temperaturas
  exibidas correspondem à conversão da unidade escolhida e são arredondadas
  para o grau inteiro mais próximo.
- Após recarregar a página ou iniciar uma nova visita, a unidade volta a
  Celsius.

### AC-RF-05 — Informar atualização dos dados

- Quando os dados meteorológicos forem apresentados, a interface informa o
  horário da última atualização disponibilizado para esses dados.
- Quando a idade dos dados exceder uma hora, a interface exibe uma indicação
  visível de que estão desatualizados.
- Dados com idade de uma hora ou menos não recebem a indicação de
  desatualizados por esse limite.

### AC-RF-06 — Tratar indisponibilidade e permitir nova tentativa

- Quando a conexão falhar ou a fonte de dados não responder com sucesso, a
  interface informa que não foi possível obter ou atualizar os dados e oferece
  uma ação de nova tentativa.
- Acionar a nova tentativa inicia uma nova consulta e, se houver sucesso,
  apresenta os dados recebidos.
- Se a tentativa falhar novamente, a interface mantém uma mensagem de erro e
  continua oferecendo a possibilidade de tentar novamente.
- Dados antigos não são identificados nem apresentados como condições atuais.

### AC-RF-07 — Comunicar estados de consulta

- Durante uma busca de cidade, a interface apresenta um estado de carregamento
  até a busca terminar.
- Durante a obtenção dos dados meteorológicos, a interface apresenta um estado
  de carregamento até a consulta terminar.
- Quando uma busca válida terminar sem resultados, a interface informa que
  nenhuma cidade foi encontrada e permite iniciar uma busca ajustada.
- Um resultado vazio não é apresentado como erro de conexão nem como resultado
  meteorológico.

## Non-Functional Requirements

As metas quantitativas abaixo são propostas iniciais do discovery e dependem de
validação das partes interessadas. Não devem ser tratadas como compromissos
aprovados até que as questões correspondentes sejam respondidas.

- **RNF-01 — Responsividade:** as funcionalidades principais devem ser
  utilizáveis em larguras de tela de 320 px a 1440 px, sem rolagem horizontal.
  A matriz de dispositivos e navegadores suportados ainda precisa ser definida.
- **RNF-02 — Usabilidade:** em testes com usuários representativos, pelo menos
  90% devem conseguir pesquisar uma cidade, consultar o clima atual e visualizar
  a previsão sem ajuda. Público de teste e protocolo precisam ser acordados.
- **RNF-03 — Desempenho:** em condições de rede e disponibilidade do provedor
  que ainda serão definidas, 95% das buscas e consultas meteorológicas devem
  apresentar os resultados em até três segundos.
- **RNF-04 — Disponibilidade e resiliência:** a meta inicial é disponibilidade
  mensal de 99,5%. Falhas de rede ou do provedor devem ser comunicadas, oferecer
  nova tentativa manual e não fazer dados desatualizados parecerem atuais.
- **RNF-05 — Acessibilidade:** a interface deve atender ao nível AA da WCAG
  2.2, incluindo operação por teclado e compatibilidade com leitores de tela.
  As tecnologias assistivas a cobrir nos testes precisam ser confirmadas.
- **RNF-06 — Atualidade dos dados:** a interface deve informar o horário da
  última atualização e sinalizar dados com mais de uma hora, conforme RF-05.
- **RNF-07 — Idioma:** a interface deve ser apresentada em português do Brasil.

## Edge Cases

- A busca não encontra nenhuma cidade para o texto informado.
- A cidade pesquisada possui o mesmo nome de outras localidades; região/estado
  pode estar ausente em alguns resultados.
- O texto de busca tem diferenças de acentuação ou capitalização em relação ao
  nome cadastrado.
- A pessoa seleciona uma localidade para a qual a fonte não oferece dados
  meteorológicos atuais ou previsão completa.
- A busca retorna resultados, mas a consulta do clima falha ou retorna dados
  incompletos.
- A conexão ou o Open-Meteo está indisponível durante a busca, a consulta atual,
  a previsão ou uma nova tentativa.
- A resposta disponível tem mais de uma hora; ela deve ser sinalizada como
  desatualizada e não deve ser apresentada como atual sem essa indicação.
- Uma consulta ocorre perto da mudança de data local da cidade ou em cidade
  cujo fuso difere do dispositivo; datas e horários devem continuar coerentes
  com o fuso local da cidade.
- A pessoa alterna a unidade enquanto o clima atual, a previsão diária e os
  detalhes horários estão visíveis; todos os valores devem continuar
  consistentes.
- Algumas informações meteorológicas esperadas estão ausentes na resposta; o
  produto não deve inventar valores. A apresentação de campos individuais
  ausentes precisa ser definida no desenho de experiência.
- A previsão de hoje ou de algum dos quatro dias seguintes não está disponível;
  o produto não deve rotular dados de outro período como se correspondessem ao
  dia ausente.

## Assumptions

- A experiência é uma aplicação web responsiva voltada ao público geral e
  disponível em português do Brasil.
- A busca tem cobertura mundial e a pessoa usuária escolhe uma cidade; não foi
  solicitada localização automática.
- A fonte de dados meteorológicos é o Open-Meteo, sem API key.
- A previsão de cinco dias inclui hoje e os quatro dias seguintes.
- A previsão diária pode ser expandida para detalhes por hora sob demanda.
- Datas e horários usam o fuso local da cidade consultada.
- Celsius é a unidade inicial. A unidade escolhida vale somente durante a
  visita e não é persistida; recarregar a página ou iniciar outra visita
  restaura Celsius.
- A conversão de temperaturas é arredondada para o grau inteiro mais próximo.
- Dados com mais de uma hora são sinalizados como desatualizados.
- Diante de falha de conexão ou da fonte, há mensagem de erro e nova tentativa
  manual; dados antigos não substituem dados atuais.
- Não há autenticação nem persistência de dados de usuário no servidor.
- Ausência de cadastro e persistência de servidor não define se haverá
  armazenamento local no navegador, telemetria ou retenção de registros pelo
  provedor; esses pontos precisam de validação de privacidade.
- Personas, limites de tempo de uso, estimativas de risco e metas numéricas do
  discovery são hipóteses, não resultados de pesquisa ou compromissos aprovados.

## Risks

| Risco | Impacto potencial | Mitigação |
|---|---|---|
| Indisponibilidade, lentidão, limites de consulta ou mudança nas condições do Open-Meteo. | Consultas atuais e previsões podem ficar indisponíveis ou incompletas. | Validar cobertura, limites, licença e condições de uso; acordar comportamento de falha, monitoramento e estratégia de contingência compatível com os termos do serviço. |
| Dados atrasados, incompletos ou com cobertura desigual. | A pessoa pode tomar decisões com informações incorretas ou antigas. | Informar a última atualização, sinalizar dados com mais de uma hora e não apresentar informações antigas como atuais. |
| Cidades homônimas ou variações de grafia podem levar à localidade errada. | A previsão pode não corresponder ao destino pesquisado. | Identificar resultados com cidade, região/estado quando disponível e país; validar buscas ambíguas e variações de acento. |
| Diferenças no tratamento do fuso horário podem deslocar datas e horários. | A previsão pode divergir da expectativa local e gerar retrabalho em critérios e experiência. | Usar o fuso local da cidade como referência e validar localidades em fusos diferentes, inclusive perto da mudança de dia. |
| Conversão ou arredondamento inconsistente entre componentes. | Valores podem divergir e reduzir a confiança da pessoa usuária. | Testar valores conhecidos em ambas as unidades e verificar todos os campos atuais, diários e horários. |
| Falta de métricas de sucesso de negócio aprovadas. | O time pode não conseguir avaliar se o produto atende à necessidade ou priorizar melhorias. | Definir métrica de sucesso e validar cenários prioritários com stakeholders e usuários. |
| Metas operacionais, cobertura de plataformas e acessibilidade indefinidas. | A qualidade e a compatibilidade podem ser avaliadas com critérios inconsistentes. | Confirmar metas, matriz de suporte e tecnologias assistivas antes de fechar os critérios de qualidade. |
| Consultas de cidade ou eventual telemetria podem ser registradas sem regras claras. | Coleta desnecessária, perda de confiança e obrigações de conformidade. | Mapear os dados enviados ao provedor e qualquer telemetria, retenção e consentimento; validar requisitos de privacidade antes do lançamento. |

## Out of Scope

- Aplicativos nativos para iOS ou Android.
- Autenticação, contas de usuário ou persistência de dados de usuário no servidor.
- Favoritos, histórico de cidades, notificações ou alertas meteorológicos.
- Mapas, radares, qualidade do ar, índices especializados ou métricas além das
  condições atuais definidas em RF-02 e da previsão em RF-03.
- Geolocalização automática ou detecção da localização da pessoa usuária.
- Idiomas diferentes de português do Brasil nesta etapa.
- Tolerância a erros de digitação na busca; estão incluídas diferenças de
  acentuação e capitalização, mas não correção de grafia.
- Fontes meteorológicas alternativas ou fallback com dados antigos.
- Preferências de unidade persistidas após recarregar a página ou iniciar nova
  visita.

## Open Questions

1. **Métrica de sucesso de negócio — prioridade alta:** qual métrica indicará
   que o aplicativo atende ao público geral (por exemplo, consultas concluídas,
   retorno de usuários ou satisfação)?
2. **Integração e dados — prioridade alta:** quais endpoints e campos do
   Open-Meteo serão necessários e quais são as condições de cobertura, limites,
   licença e atribuição aplicáveis?
3. **Desempenho e disponibilidade — prioridade alta:** as metas propostas de
   95% das buscas e consultas em até três segundos e disponibilidade mensal de
   99,5% são aceitáveis? Sob quais condições de rede e limites do provedor serão
   medidas?
4. **Plataforma — prioridade média:** quais navegadores, dispositivos e
   larguras de tela, além do intervalo inicial de 320 px a 1440 px, serão
   oficialmente suportados?
5. **Acessibilidade — prioridade média:** WCAG 2.2 nível AA é o padrão
   esperado? Quais tecnologias assistivas devem ser cobertas nos testes?
6. **Dados incompletos — prioridade média:** como a interface deve apresentar
   campos meteorológicos individuais ausentes ou uma previsão que não cubra
   todos os cinco dias?
7. **Privacidade — prioridade média:** haverá telemetria ou armazenamento local
   no navegador? Quais dados o provedor registra, por quanto tempo e sob quais
   condições de consentimento e transparência?
8. **Usabilidade — prioridade média:** qual público será considerado
   representativo e qual protocolo validará a meta proposta de 90% de sucesso
   sem ajuda?
