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

Os cenários abaixo usam respostas meteorológicas e horários controlados para
permitir resultados determinísticos nos testes automatizados. Cada cenário
identifica o requisito funcional que valida.

### AC-RF-01 — Pesquisar e selecionar cidades

#### Cenário: buscar por nome completo ou parcial

- **Given:** o catálogo de teste contém cidades em mais de um país e uma delas
  tem o nome "São Paulo"
- **When:** a pessoa pesquisa "São Paulo" e, em outra consulta, "São"
- **Then:** ambas as consultas retornam as cidades correspondentes existentes
  no catálogo, identificando cidade, país e região/estado quando disponível

#### Cenário: ignorar diferenças de acentuação e capitalização

- **Given:** o catálogo de teste contém a cidade "São Paulo"
- **When:** a pessoa pesquisa "sao paulo", "SÃO PAULO" e "São Paulo"
- **Then:** as três consultas retornam o mesmo conjunto de localidades

#### Cenário: distinguir cidades homônimas

- **Given:** o catálogo de teste contém duas cidades com o nome "San José",
  em países diferentes, com suas regiões disponíveis
- **When:** a pessoa pesquisa "San José"
- **Then:** os resultados exibem para cada cidade o nome, a região/estado e o
  país, de modo que as duas localidades possam ser distinguidas

#### Cenário: consultar o clima da cidade selecionada

- **Given:** os resultados incluem duas localidades distintas e há respostas
  meteorológicas controladas para ambas
- **When:** a pessoa seleciona uma das localidades
- **Then:** o produto exibe os dados associados à localidade selecionada, não
  os dados da outra localidade

### AC-RF-02 — Consultar condições atuais

#### Cenário: exibir todos os indicadores atuais disponíveis

- **Given:** a pessoa selecionou uma cidade e a resposta controlada contém
  condição, temperatura atual, sensação térmica, máxima, mínima, umidade e vento
- **When:** a consulta meteorológica termina com sucesso
- **Then:** a interface exibe cada um desses sete indicadores com os valores
  correspondentes à resposta da cidade selecionada

### AC-RF-03 — Consultar previsão diária e horária

#### Cenário: exibir os cinco dias da previsão

- **Given:** a pessoa selecionou uma cidade e a resposta controlada contém a
  previsão diária de hoje e dos quatro dias seguintes no fuso local da cidade
- **When:** a consulta meteorológica termina com sucesso
- **Then:** a interface exibe exatamente cinco resumos diários, identificados
  pelas datas locais de hoje até o quarto dia seguinte

#### Cenário: consultar detalhes por hora

- **Given:** a previsão diária da cidade está visível e a resposta controlada
  contém detalhes horários
- **When:** a pessoa solicita os detalhes por hora
- **Then:** a interface apresenta os horários e os dados horários da previsão
  daquela cidade

#### Cenário: apresentar datas e horários no fuso da cidade

- **Given:** o fuso local da cidade difere do fuso do dispositivo e os dados
  controlados incluem datas e horas nos dois fusos
- **When:** a pessoa consulta a previsão
- **Then:** as datas e horas exibidas correspondem ao fuso local da cidade e
  "hoje" corresponde à data local da cidade

### AC-RF-04 — Alternar unidade de temperatura

#### Cenário: iniciar uma visita em Celsius

- **Given:** a pessoa inicia uma nova visita ao produto
- **When:** dados meteorológicos com temperaturas estão disponíveis
- **Then:** todas as temperaturas são exibidas em Celsius

#### Cenário: alternar todas as temperaturas para Fahrenheit

- **Given:** o clima atual, os resumos diários e os detalhes horários estão
  visíveis em Celsius
- **When:** a pessoa seleciona Fahrenheit
- **Then:** todas as temperaturas visíveis passam a ser exibidas em Fahrenheit
  e nenhuma temperatura permanece identificada em Celsius

#### Cenário: alternar todas as temperaturas para Celsius

- **Given:** o clima atual, os resumos diários e os detalhes horários estão
  visíveis em Fahrenheit
- **When:** a pessoa seleciona Celsius
- **Then:** todas as temperaturas visíveis passam a ser exibidas em Celsius e
  nenhuma temperatura permanece identificada em Fahrenheit

#### Cenário: converter e arredondar temperaturas

- **Given:** a resposta controlada contém temperaturas em Celsius conhecidas,
  incluindo valores cuja conversão resulta em fração
- **When:** a pessoa alterna entre Celsius e Fahrenheit
- **Then:** cada temperatura corresponde à conversão da resposta original
  para a unidade selecionada, arredondada para o grau inteiro mais próximo

#### Cenário: restaurar Celsius ao recarregar ou iniciar nova visita

- **Given:** a pessoa selecionou Fahrenheit durante uma visita
- **When:** recarrega a página ou inicia uma nova visita
- **Then:** a unidade apresentada volta a ser Celsius

### AC-RF-05 — Informar atualização dos dados

#### Cenário: exibir horário da última atualização

- **Given:** a resposta controlada inclui um horário conhecido de atualização
- **When:** os dados meteorológicos são apresentados
- **Then:** a interface exibe esse horário de atualização

#### Cenário: sinalizar dados com mais de uma hora

- **Given:** o relógio de teste está fixado e os dados têm idade superior a
  uma hora
- **When:** os dados meteorológicos são apresentados
- **Then:** a interface exibe a indicação de dados desatualizados

#### Cenário: não sinalizar dados com até uma hora

- **Given:** o relógio de teste está fixado e os dados têm idade igual ou
  inferior a uma hora
- **When:** os dados meteorológicos são apresentados
- **Then:** a interface não exibe a indicação de dados desatualizados com base
  no limite de uma hora

### AC-RF-06 — Tratar indisponibilidade e permitir nova tentativa

#### Cenário: informar falha inicial de conexão ou provedor

- **Given:** a pessoa solicitou dados meteorológicos e a conexão falha ou a
  fonte responde com falha
- **When:** a consulta termina sem dados atuais
- **Then:** a interface informa que não foi possível obter os dados, oferece
  uma ação de nova tentativa e não apresenta dados antigos como atuais

#### Cenário: nova tentativa concluída com sucesso

- **Given:** a interface apresenta uma falha e a fonte está configurada para
  responder com sucesso à próxima consulta
- **When:** a pessoa aciona a nova tentativa
- **Then:** uma nova consulta é realizada e os dados recebidos com sucesso são
  apresentados para a cidade selecionada

#### Cenário: nova tentativa também falha

- **Given:** a interface apresenta uma falha e a fonte está configurada para
  falhar novamente
- **When:** a pessoa aciona a nova tentativa
- **Then:** a interface continua informando a falha e mantém disponível a ação
  de nova tentativa

### AC-RF-07 — Comunicar estados de consulta

#### Cenário: indicar carregamento durante a busca de cidades

- **Given:** a busca de cidades foi iniciada e a resposta controlada ainda não
  foi concluída
- **When:** a busca está em andamento
- **Then:** a interface apresenta um estado de carregamento da busca

#### Cenário: indicar carregamento durante a consulta meteorológica

- **Given:** a consulta meteorológica foi iniciada e a resposta controlada
  ainda não foi concluída
- **When:** a consulta está em andamento
- **Then:** a interface apresenta um estado de carregamento dos dados

#### Cenário: informar busca sem resultados e permitir ajuste

- **Given:** a pessoa pesquisou um termo válido e a resposta da busca contém
  zero cidades
- **When:** a busca termina
- **Then:** a interface informa que nenhuma cidade foi encontrada e permite
  que a pessoa altere a consulta e pesquise novamente

#### Cenário: distinguir resultado vazio de falha

- **Given:** uma busca termina com sucesso e retorna zero cidades
- **When:** a interface apresenta o resultado
- **Then:** a interface informa que não foram encontradas cidades e não
  apresenta o estado de erro de conexão nem resultados meteorológicos

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

- **Cidade inexistente:** quando a pessoa informa o nome de uma cidade que não
  existe ou não pode ser identificada, a aplicação informa que não encontrou a
  cidade, não inicia uma consulta meteorológica para uma localidade não
  selecionada e permite corrigir a busca.
- **Input vazio:** quando a pessoa tenta pesquisar sem informar texto ou
  informa apenas espaços, a aplicação não envia uma consulta de geocoding,
  solicita um nome de cidade e mantém o campo disponível para edição.
- **Caracteres especiais:** a aplicação aceita pontuação válida em nomes de
  localidades (por exemplo, hífen ou apóstrofo) e pesquisa o texto como dado
  literal, sem executar ou interpretar caracteres como comandos. Caracteres de
  controle são removidos ou rejeitados antes da consulta; a aplicação informa
  quando não resta texto pesquisável.
- **Geocoding sem resultados:** quando o serviço de busca responde com sucesso,
  mas retorna zero localidades, a aplicação informa que nenhuma cidade foi
  encontrada, não apresenta isso como falha de conexão e permite ajustar a
  busca.
- **Falha de API:** quando a consulta de geocoding ou meteorológica falha, a
  aplicação informa que não foi possível concluir a consulta, oferece nova
  tentativa manual e não apresenta a falha como uma busca sem resultados. Para
  falha meteorológica, não apresenta dados antigos como atuais.
- **Timeout:** quando o serviço não responde dentro do limite de espera
  configurado, a aplicação encerra a espera, informa que a consulta demorou
  demais e oferece nova tentativa manual. Não apresenta dados antigos como
  atuais. O limite de espera precisa ser definido antes de se tornar critério
  quantitativo de aceite.
- **Resposta meteorológica parcial:** quando uma resposta válida contém alguns
  campos ou dias ausentes, a aplicação apresenta os campos e dias disponíveis,
  indica como indisponíveis os campos ou dias sem dados e não inventa valores
  nem substitui datas ausentes por dados de outro período. Se não houver dados
  utilizáveis, informa que não foi possível obter os dados e oferece nova
  tentativa.
- A cidade pesquisada possui o mesmo nome de outras localidades; região/estado
  pode estar ausente em alguns resultados.
- O texto de busca tem diferenças de acentuação ou capitalização em relação ao
  nome cadastrado.
- A pessoa seleciona uma localidade para a qual a fonte não oferece dados
  meteorológicos atuais ou previsão completa.
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
6. **Dados incompletos — prioridade média:** quais campos meteorológicos são
   mínimos para considerar uma resposta parcialmente preenchida utilizável, em
   vez de exibir indisponíveis todos os dados da consulta?
7. **Privacidade — prioridade média:** haverá telemetria ou armazenamento local
   no navegador? Quais dados o provedor registra, por quanto tempo e sob quais
   condições de consentimento e transparência?
8. **Usabilidade — prioridade média:** qual público será considerado
   representativo e qual protocolo validará a meta proposta de 90% de sucesso
   sem ajuda?
9. **Timeout — prioridade média:** qual limite de espera deve ser aplicado às
   consultas de busca e meteorológicas antes de exibir o estado de timeout?
