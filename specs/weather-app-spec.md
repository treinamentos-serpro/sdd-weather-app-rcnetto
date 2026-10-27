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
  pesquisar cidades disponíveis no catálogo mundial do provedor por nome
  completo ou prefixo parcial, de acordo com as regras do Geocoding da
  Open-Meteo. Antes da busca, espaços no início e no fim são removidos; a
  correspondência ignora maiúsculas/minúsculas e acentos, mas não corrige erros
  de digitação nem procura trechos no meio/fim do nome. Cada resultado
  identifica cidade, país e região/estado quando disponível. A aplicação exibe
  até 10 resultados na ordem de relevância retornada pelo serviço; não oferece
  paginação nesta versão. A busca é enviada somente quando a pessoa confirma a
  consulta, não a cada tecla. A seleção mantém a identidade exata da localidade
  retornada, inclusive quando há cidades homônimas.
- **RF-02 — Consultar condições atuais:** para a cidade selecionada, o produto
  deve apresentar em português a condição do tempo, temperatura atual, sensação
  térmica, máxima e mínima do dia local, umidade em porcentagem e velocidade do
  vento em km/h. Todas as temperaturas devem indicar a unidade apresentada.
- **RF-03 — Consultar previsão diária e horária:** para a cidade selecionada,
  o produto deve apresentar para hoje e os quatro dias seguintes um resumo com
  condição do tempo e temperaturas máxima e mínima. Deve ser possível consultar
  sob demanda os detalhes por hora de cada dia exibido, incluindo horário
  local, condição do tempo e temperatura. As descrições devem ser apresentadas
  em português; datas e horários devem corresponder ao fuso horário local da
  cidade, inclusive nas mudanças de horário sazonal.
- **RF-04 — Alternar unidade de temperatura:** a pessoa usuária deve poder
  alternar entre Celsius e Fahrenheit. Celsius é a unidade inicial. A seleção
  vale até o recarregamento da página ou o início de uma nova visita, não sendo
  persistida. A alternância deve atualizar todas as temperaturas do clima
  atual, da previsão diária e dos detalhes horários, com arredondamento para o
  grau inteiro mais próximo.
- **RF-05 — Informar atualização dos dados:** o produto deve informar o horário
  da observação atual fornecido pela fonte, em fuso local da cidade, e sinalizar
  observações cuja idade exceda 60 minutos. A idade é calculada em relação ao
  relógio atual em UTC. Para previsão, se a fonte não fornecer horário de
  atualização, o produto deve dizer que o horário de atualização não foi
  informado, sem confundir horários de validade previstos com horário de
  atualização. Uma observação antiga recebida com sucesso pode ser exibida
  somente com indicação explícita de desatualização. Timestamp ausente ou
  inválido não pode ser apresentado como recente.
- **RF-06 — Tratar indisponibilidade e permitir nova tentativa:** diante de
  falha de conexão, erro da API ou timeout na busca de cidades ou consulta
  meteorológica, o produto deve informar que não foi possível concluir a
  operação e oferecer nova tentativa manual da mesma operação, preservando a
  consulta ou cidade selecionada. O timeout ocorre após 10 segundos sem
  resposta. Após uma falha, o produto não deve usar dados em cache como se
  fossem atuais.
- **RF-07 — Comunicar estados de consulta:** enquanto uma busca de cidade ou
  consulta meteorológica estiver em andamento, o produto deve indicar que está
  carregando e remover o indicador ao terminar com sucesso, resultado vazio ou
  falha. Quando a busca terminar sem resultados, deve informar que nenhuma
  cidade foi encontrada e permitir que a pessoa ajuste a consulta. Uma busca
  vazia ou composta apenas por espaços não deve ser enviada ao serviço.
- **RF-08 — Apresentar respostas meteorológicas parciais:** o produto deve
  apresentar cada campo meteorológico recebido e indicar individualmente os
  campos ausentes como indisponíveis, sem inventar valores. Sem temperatura
  atual, deve informar que as condições atuais estão indisponíveis; dados de
  previsão disponíveis podem continuar sendo apresentados. Dias sem previsão
  devem ser identificados como indisponíveis, sem deslocar datas.

### Contrato da fonte de dados

- Usar o serviço oficial de Geocoding do Open-Meteo para localizar cidades e o
  serviço oficial de Forecast para consultar dados atuais e previsão.
- Solicitar somente os dados necessários aos requisitos: condição meteorológica,
  temperatura atual, sensação térmica, máxima/mínima diária, umidade,
  velocidade do vento e, na previsão, condição e temperaturas diárias/horárias.
- Solicitar ou converter valores para as unidades exibidas neste documento e
  usar o fuso local da cidade para as séries diárias e horárias.
- Não exigir API key para esta versão. Respeitar os limites e termos vigentes
  aplicáveis ao uso do serviço; não realizar atualização automática em segundo
  plano. Exibir atribuição visível com link para Open-Meteo.
- Se a política vigente do provedor não permitir o uso pretendido sem API key,
  a publicação fica bloqueada até que o acesso permitido seja configurado; não
  substituir o provedor nem remover a atribuição sem revisão da especificação.

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
- **US-09 (RF-08) — Interpretar dados incompletos:** Como pessoa que planeja
  atividades, quero identificar quais informações meteorológicas estão
  disponíveis ou ausentes para planejar sem confundir lacunas com valores reais.

## Acceptance Criteria

Os cenários abaixo usam respostas meteorológicas e horários controlados para
permitir resultados determinísticos nos testes automatizados. Cada cenário
identifica o requisito funcional que valida.

### AC-RF-01 — Pesquisar e selecionar cidades

#### Cenário: buscar por nome completo ou prefixo parcial

- **Given:** o catálogo controlado contém dois resultados de fixture chamados
  "São Paulo" em países distintos e um resultado "Paulo Afonso"
- **When:** a pessoa pesquisa "São Paulo" e depois "São"
- **Then:** a busca exata inclui as duas localidades chamadas "São Paulo"; a
  busca parcial inclui localidades cujo nome começa com "São", sem incluir
  "Paulo Afonso"; no máximo 10 resultados são exibidos na ordem recebida do
  serviço e cada resultado identifica cidade, país e região/estado quando
  disponível

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
  meteorológicas controladas com valores diferentes para ambas
- **When:** a pessoa seleciona uma das localidades
- **Then:** o produto consulta e exibe somente os dados associados ao
  identificador da localidade selecionada

#### Cenário: manter somente os resultados da busca mais recente

- **Given:** a pessoa envia a busca A e, antes de sua resposta, envia a busca B
- **When:** a resposta de B chega antes da resposta de A
- **Then:** a lista exibe os resultados de B e a resposta tardia de A não
  substitui nem mistura os resultados de B

#### Cenário: impedir busca vazia

- **Given:** o campo de busca está vazio ou contém apenas espaços
- **When:** a pessoa tenta pesquisar
- **Then:** nenhuma solicitação de geocoding é enviada e a interface solicita
  um nome de cidade, mantendo o campo disponível para edição

#### Cenário: enviar busca somente após confirmação

- **Given:** a pessoa está digitando um nome de cidade no campo de busca
- **When:** ainda não confirmou a consulta por envio do formulário ou ação
  explícita de busca
- **Then:** nenhuma solicitação de geocoding é enviada

#### Cenário: remover espaços externos do termo

- **Given:** o catálogo controlado contém a cidade "Lisboa"
- **When:** a pessoa pesquisa "  Lisboa  "
- **Then:** a busca retorna o mesmo conjunto de resultados de "Lisboa"

#### Cenário: pesquisar nomes com pontuação legítima

- **Given:** o catálogo controlado contém uma localidade cujo nome inclui
  apóstrofo ou hífen
- **When:** a pessoa pesquisa esse nome com a pontuação
- **Then:** a consulta é tratada como texto literal e retorna a localidade
  correspondente

#### Cenário: rejeitar caracteres de controle

- **Given:** o texto de busca contém um caractere de controle
- **When:** a pessoa tenta pesquisar
- **Then:** a busca não é enviada e a interface informa que o texto não é válido

#### Cenário: informar que a cidade não existe

- **Given:** o serviço de geocoding responde com sucesso e zero resultados para
  uma consulta não vazia
- **When:** a busca termina
- **Then:** a interface informa que nenhuma cidade foi encontrada, não inicia
  uma consulta meteorológica e permite editar e reenviar a busca

### AC-RF-02 — Consultar condições atuais

#### Cenário: exibir todos os indicadores atuais disponíveis

- **Given:** a pessoa selecionou uma cidade e a resposta controlada contém
  condição, temperatura atual, sensação térmica, máxima e mínima do dia local,
  umidade e velocidade do vento
- **When:** a consulta meteorológica termina com sucesso
- **Then:** a interface exibe os sete indicadores com os valores da resposta,
  máximas e mínimas referentes ao dia local, descrição da condição em
  português, umidade em porcentagem e velocidade do vento em km/h

### AC-RF-03 — Consultar previsão diária e horária

#### Cenário: exibir os cinco dias da previsão

- **Given:** a pessoa selecionou uma cidade e a resposta controlada contém a
  previsão diária de hoje e dos quatro dias seguintes, com condição, máxima e
  mínima para cada dia no fuso local da cidade
- **When:** a consulta meteorológica termina com sucesso
- **Then:** a interface exibe exatamente cinco resumos diários, identificados
  pelas datas locais de hoje até o quarto dia seguinte, cada um com a condição
  em português e temperaturas máxima e mínima

#### Cenário: consultar detalhes por hora

- **Given:** os cinco resumos diários estão visíveis e a resposta controlada
  contém pontos horários para um dos dias
- **When:** a pessoa solicita os detalhes por hora daquele dia
- **Then:** a interface apresenta para cada registro horário o horário local,
  a condição em português e a temperatura da previsão daquela cidade, somente
  para a data local selecionada; os outros dias permanecem inalterados

#### Cenário: apresentar datas e horários no fuso da cidade

- **Given:** o fuso local da cidade difere do fuso do dispositivo e os dados
  controlados incluem um instante próximo à meia-noite e datas de transição
  sazonal de fuso
- **When:** a pessoa consulta a previsão
- **Then:** as datas e horas exibidas correspondem ao fuso local da cidade e
  "hoje" corresponde à data local da cidade; horas inexistentes não são
  inventadas e horários locais repetidos são distinguidos pelo instante
  correspondente

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
  incluindo valores cuja conversão resulta em fração e empates de 0,5
- **When:** a pessoa alterna entre Celsius e Fahrenheit
- **Then:** cada temperatura corresponde à conversão da resposta original
  para a unidade selecionada, arredondada para o grau inteiro mais próximo, com
  empates de 0,5 arredondados para longe de zero, sem conversão cumulativa a
  partir do valor já arredondado

#### Cenário: restaurar Celsius ao recarregar ou iniciar nova visita

- **Given:** a pessoa selecionou Fahrenheit durante uma visita
- **When:** recarrega a página ou inicia uma nova visita
- **Then:** a unidade apresentada volta a ser Celsius

#### Cenário: manter unidade ao trocar de cidade durante a visita

- **Given:** a pessoa selecionou Fahrenheit e consultou uma cidade
- **When:** seleciona uma segunda cidade durante a mesma visita
- **Then:** as temperaturas da segunda cidade são exibidas em Fahrenheit

### AC-RF-05 — Informar atualização dos dados

#### Cenário: exibir horário da última atualização

- **Given:** a resposta controlada inclui um timestamp conhecido da observação
  atual
- **When:** os dados meteorológicos são apresentados para uma cidade cujo fuso
  difere do UTC
- **Then:** a interface exibe o mesmo instante da observação convertido para o
  fuso local da cidade

#### Cenário: sinalizar dados com mais de uma hora

- **Given:** o relógio de teste está fixado e os dados têm idade superior a
  60 minutos, calculada a partir do horário fornecido pela fonte
- **When:** os dados meteorológicos são apresentados
- **Then:** a interface exibe a indicação de dados desatualizados

#### Cenário: não sinalizar dados com até uma hora

- **Given:** o relógio de teste está fixado e os dados têm idade igual ou
  inferior a 60 minutos, inclusive exatamente 60 minutos, calculada a partir
  do horário fornecido pela fonte
- **When:** os dados meteorológicos são apresentados
- **Then:** a interface não exibe a indicação de dados desatualizados com base
  no limite de uma hora

#### Cenário: exibir dados antigos recebidos com sucesso com aviso

- **Given:** a fonte responde com sucesso e o timestamp dos dados indica idade
  superior a uma hora
- **When:** a interface apresenta esses dados
- **Then:** os dados são exibidos com o horário da última atualização e a
  indicação explícita de que estão desatualizados

#### Cenário: não declarar dados recentes sem timestamp válido

- **Given:** a observação atual não contém timestamp válido ou o timestamp está
  no futuro em relação ao relógio de referência
- **When:** a interface apresenta dados meteorológicos
- **Then:** a interface identifica a atualização como indisponível e não
  declara os dados recentes

#### Cenário: não confundir horário da previsão com atualização

- **Given:** a fonte fornece horários de validade previstos, mas não fornece
  timestamp de atualização da previsão
- **When:** a interface apresenta os dados previstos
- **Then:** a interface informa que o horário de atualização não foi informado
  e não usa o horário de validade como timestamp de atualização

### AC-RF-06 — Tratar indisponibilidade e permitir nova tentativa

#### Cenário: informar falha de geocoding ou consulta meteorológica

- **Given:** a pessoa iniciou uma busca ou consulta meteorológica e a conexão
  falha ou o serviço responde com erro
- **When:** a operação termina sem resposta bem-sucedida
- **Then:** a interface apresenta mensagem de erro em pt-BR e ação "Tentar
  novamente"; a busca não é apresentada como vazia e, após falha meteorológica,
  dados em cache não são apresentados como atuais

#### Cenário: encerrar a busca após timeout

- **Given:** uma busca de cidades permanece sem resposta
- **When:** decorrem 10 segundos desde o envio da solicitação
- **Then:** a busca é encerrada, a interface informa que a consulta demorou
  demais e oferece a ação "Tentar novamente"

#### Cenário: encerrar a consulta meteorológica após timeout

- **Given:** uma consulta meteorológica permanece sem resposta
- **When:** decorrem 10 segundos desde o envio da solicitação
- **Then:** a consulta é encerrada, a interface informa que a consulta demorou
  demais, oferece a ação "Tentar novamente" e não apresenta dados em cache como
  atuais

#### Cenário: nova tentativa concluída com sucesso

- **Given:** a interface apresenta uma falha e a fonte está configurada para
  responder com sucesso à próxima consulta
- **When:** a pessoa aciona a nova tentativa
- **Then:** uma nova consulta é realizada e os dados recebidos com sucesso são
  apresentados para a cidade selecionada

#### Cenário: repetir busca de cidades após falha

- **Given:** uma busca de cidades falhou e a fonte está configurada para
  responder com sucesso à próxima solicitação
- **When:** a pessoa aciona a nova tentativa
- **Then:** a mesma consulta de busca é enviada novamente e os resultados
  recebidos são apresentados

#### Cenário: ignorar resposta tardia após timeout

- **Given:** uma solicitação atingiu o timeout e uma nova tentativa foi iniciada
- **When:** a resposta da solicitação expirada chega depois da resposta da nova
  tentativa
- **Then:** a resposta expirada não substitui nem altera os resultados mais
  recentes

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

#### Cenário: remover o carregamento após cada resultado

- **Given:** uma busca ou consulta meteorológica apresenta estado de
  carregamento
- **When:** a operação termina com sucesso, resultado vazio, erro ou timeout
- **Then:** o estado de carregamento deixa de ser apresentado e a interface
  apresenta o resultado ou estado correspondente ao desfecho

### AC-RF-08 — Apresentar respostas meteorológicas parciais

#### Cenário: apresentar campos atuais disponíveis e marcar os ausentes

- **Given:** a resposta meteorológica contém temperatura atual e alguns, mas
  não todos, os demais campos atuais
- **When:** a consulta termina com sucesso
- **Then:** os campos recebidos são apresentados e cada campo ausente é
  identificado como indisponível, sem valor inventado

#### Cenário: indicar indisponibilidade das condições atuais sem temperatura

- **Given:** a resposta meteorológica não contém temperatura atual, mas pode
  conter previsão diária ou horária
- **When:** a consulta termina com sucesso
- **Then:** as condições atuais são identificadas como indisponíveis e qualquer
  previsão recebida continua sendo apresentada

#### Cenário: preservar as datas quando faltam dias da previsão

- **Given:** a resposta meteorológica não contém dados para um ou mais dos cinco
  dias previstos
- **When:** a previsão é apresentada
- **Then:** os dias disponíveis aparecem em suas datas locais corretas e cada dia
  ausente é identificado como indisponível, sem deslocar ou substituir datas

#### Cenário: informar ausência total de dados utilizáveis

- **Given:** a resposta meteorológica não contém temperatura atual nem dados de
  previsão utilizáveis
- **When:** a consulta termina
- **Then:** a interface informa que não há dados meteorológicos disponíveis e
  oferece nova tentativa

#### Cenário: tratar valor ausente ou inválido como indisponível

- **Given:** a resposta contém temperatura nula, umidade fora do intervalo
  inclusivo de 0 a 100% ou velocidade do vento negativa
- **When:** a resposta é apresentada
- **Then:** somente esse campo é identificado como indisponível, sem exibir ou
  inferir um valor substituto

#### Cenário: tratar resposta meteorológica ilegível

- **Given:** o serviço responde com sucesso HTTP, mas o corpo não pode ser
  interpretado como uma resposta meteorológica válida
- **When:** a aplicação processa a resposta
- **Then:** a consulta é tratada como falha, os dados inválidos não são exibidos
  e a pessoa recebe uma mensagem de erro com opção de nova tentativa

### Critérios de aceite de qualidade e lançamento

#### Cenário: limitar resultados da busca

- **Given:** o provedor retorna mais de 10 cidades correspondentes
- **When:** a busca termina
- **Then:** são exibidos no máximo 10 resultados na ordem recebida e não há
  controle de paginação ou carregamento adicional

#### Cenário: exibir atribuição do provedor

- **Given:** dados meteorológicos atuais ou previstos estão visíveis
- **When:** a interface é renderizada
- **Then:** existe uma atribuição visível ao Open-Meteo com link navegável para
  o provedor

#### Cenário: concluir fluxos nos viewports suportados

- **Given:** a aplicação é aberta em cada viewport de 320, 375, 768, 1024 e
  1440 px, nos navegadores e versões definidos em RNF-01
- **When:** a pessoa conclui busca, seleção, consulta, troca de unidade e
  abertura dos detalhes horários
- **Then:** cada fluxo pode ser concluído sem rolagem horizontal

#### Cenário: cumprir orçamento de desempenho

- **Given:** há 100 medições bem-sucedidas de geocoding e 100 de consulta
  meteorológica em rede controlada conforme RNF-03
- **When:** é calculado o percentil 95 do tempo entre ação e resultado visível
- **Then:** o p95 de cada tipo de operação é menor ou igual a 3 segundos

#### Cenário: medir disponibilidade da aplicação

- **Given:** um mês completo de verificações externas executadas uma vez por
  minuto
- **When:** a disponibilidade mensal da interface é calculada como verificações
  bem-sucedidas dividido pelo total de verificações
- **Then:** o resultado é igual ou superior a 99,5%; falhas do provedor de
  meteorologia são contabilizadas separadamente

#### Cenário: verificar fluxo principal com usuários

- **Given:** 10 participantes do público geral recebem as mesmas instruções de
  tarefa, sem treinamento de uso
- **When:** cada pessoa tenta pesquisar uma cidade, consultar as condições
  atuais e identificar as cinco datas da previsão
- **Then:** pelo menos 9 participantes concluem as três tarefas sem ajuda

#### Cenário: verificar privacidade sem telemetria

- **Given:** a aplicação é carregada e a pessoa realiza buscas e consultas
- **When:** as requisições de rede, cookies e armazenamento local são
  inspecionados
- **Then:** as chamadas funcionais são limitadas ao provedor meteorológico e aos
  recursos necessários da aplicação, sem chamadas de analytics, identificadores
  persistentes, cookies não essenciais ou persistência local da cidade/unidade

#### Cenário: bloquear lançamento se os termos do provedor não forem atendidos

- **Given:** o uso sem chave ou a atribuição configurada não atende aos termos
  vigentes do Open-Meteo para a implantação pretendida
- **When:** a verificação de prontidão para lançamento é executada
- **Then:** a implantação é bloqueada até que o acesso e a atribuição estejam
  em conformidade

## Non-Functional Requirements

As metas e matrizes abaixo são compromissos desta versão da especificação.

- **RNF-01 — Responsividade:** as funcionalidades principais devem ser
  utilizáveis em larguras CSS de 320, 375, 768, 1024 e 1440 px, sem rolagem
  horizontal. Em cada largura, deve ser possível concluir busca, seleção,
  consulta, alternância de unidade e abertura dos detalhes horários. São
  suportadas a versão estável atual e a versão principal anterior de Chrome,
  Edge, Firefox e Safari em desktop, além da versão estável atual de Safari em
  iOS e Chrome em Android.
- **RNF-02 — Usabilidade:** em teste moderado com 10 participantes do público
  geral, pelo menos 9 devem, sem ajuda, buscar uma cidade, consultar condições
  atuais e identificar corretamente as cinco datas da previsão. Este é o
  indicador inicial de sucesso do produto; não será coletado por telemetria.
  O teste usa cenários e cidades definidos antes da sessão, sem treinamento.
- **RNF-03 — Desempenho:** quando o provedor responde e a conexão do cliente está
  disponível, pelo menos 95% de cada tipo de operação bem-sucedida (geocoding e
  meteorologia) devem apresentar resultado em até 3 segundos, medidos da ação
  da pessoa até o conteúdo correspondente ficar visível, em rede controlada de
  10 Mbps de download, 2 Mbps de upload e 100 ms de latência de ida e volta
  para o provedor. O timeout de 10 segundos é o limite máximo para encerrar
  cada operação, não a meta de desempenho. Resultados de falha/timeout são
  reportados separadamente.
- **RNF-04 — Disponibilidade e resiliência:** a aplicação deve alcançar
  disponibilidade mensal de 99,5%, medida por verificações externas a cada
  minuto da capacidade de carregar a interface. A disponibilidade do provedor
  meteorológico é reportada separadamente e não é contabilizada como
  indisponibilidade da interface. Falhas devem ser identificadas como falhas,
  permitir nova tentativa manual e não apresentar cache como dado atual.
- **RNF-05 — Acessibilidade:** a interface deve atender WCAG 2.2 nível AA.
  Os fluxos de busca, seleção, consulta, alternância de unidade e nova tentativa
  devem ser concluíveis somente por teclado, sem armadilha de foco e com foco
  visível; controles devem ter nomes acessíveis e estados de carregamento, vazio
  e erro devem ser anunciados por tecnologia assistiva. Contraste e demais
  critérios AA devem ser verificados por avaliação automatizada e revisão
  manual. A validação manual cobre NVDA com Firefox em Windows e VoiceOver com
  Safari em iOS.
- **RNF-06 — Atualidade dos dados:** a indicação e o limite de 60 minutos
  seguem RF-05. Timestamp ausente, inválido ou no futuro não deve resultar em
  indicação de dado recente; deve ser comunicado como horário indisponível.
- **RNF-07 — Idioma e formatação:** textos, descrições de condição, datas,
  horários e números devem ser apresentados em português do Brasil. Datas
  seguem o formato DD/MM/AAAA e horas o formato de 24 horas, ambos no fuso local
  da cidade. Valores de temperatura mostram °C ou °F, umidade mostra %, e vento
  mostra km/h.
- **RNF-08 — Privacidade:** nenhuma conta ou dado de usuário deve ser persistido
  no servidor. A localização consultada é enviada ao Open-Meteo para busca ou
  previsão. Não são usados analytics, identificadores de usuário, cookies não
  essenciais ou armazenamento local nesta versão. A política de privacidade
  deve informar o compartilhamento da consulta com o provedor e a retenção
  conforme os termos publicados por ele. A aplicação não coleta nem armazena
  endereço IP para fins próprios; metadados de rede necessários à conexão
  podem ser processados pelo provedor conforme seus termos.
- **RNF-09 — Atribuição da fonte:** quando dados meteorológicos forem exibidos,
  a interface deve exibir uma atribuição visível ao Open-Meteo com link para o
  provedor. A atribuição deve estar presente tanto na visão atual quanto na
  previsão.

## Edge Cases

- **Entrada de busca:** texto vazio ou só espaços não gera solicitação; pontuação
  legítima é pesquisada literalmente; caracteres de controle são rejeitados.
- **Busca sem resultado ou falha:** zero resultados é estado vazio; erro de API,
  conexão ou timeout é estado de falha. Não iniciar previsão sem localidade
  selecionada; permitir nova tentativa em falhas.
- **Resultados concorrentes:** uma resposta tardia de uma consulta anterior não
  pode substituir resultados de uma busca mais recente.
- **Localidade ambígua:** distinguir homônimos com país e, quando disponível,
  região/estado; selecionar uma localidade não pode carregar dados de outra.
- **Dados incompletos ou inválidos:** marcar individualmente campos e dias
  ausentes ou inválidos; não inventar dados, deslocar datas ou tratar falha de
  parsing como resposta válida.
- **Dados desatualizados:** resposta bem-sucedida com idade superior a 60
  minutos pode ser exibida com aviso; após falha não usar cache como dado atual.
- **Fuso e calendário:** usar a data e hora locais da cidade, inclusive em
  mudança de dia e de horário sazonal; não inventar horas inexistentes e
  distinguir horários locais repetidos.
- **Alternância de unidade:** atualizar todas as temperaturas disponíveis sem
  recalcular a partir de valores já arredondados.

## Assumptions

- A experiência é uma aplicação web responsiva voltada ao público geral e
  disponível em português do Brasil.
- A busca tem cobertura mundial e a pessoa usuária escolhe uma cidade; não foi
  solicitada localização automática.
- A fonte de dados meteorológicos é o Open-Meteo, sem API key.
- São usados somente os serviços oficiais de Geocoding e Forecast do
  Open-Meteo, nos limites e termos vigentes para uso sem chave; a publicação
  depende de confirmação de conformidade e atribuição visível.
- A previsão de cinco dias inclui hoje e os quatro dias seguintes.
- Cada dia da previsão pode ser expandido para ver seus pontos horários locais.
- Datas e horários usam o fuso local da cidade consultada.
- Celsius é a unidade inicial. A unidade escolhida vale somente durante a
  visita e não é persistida; recarregar a página ou iniciar outra visita
  restaura Celsius.
- A conversão de temperaturas é arredondada para o grau inteiro mais próximo;
  empates de 0,5 grau são arredondados para longe de zero.
- Dados com mais de uma hora são sinalizados como desatualizados.
- Diante de falha de conexão ou da fonte, há mensagem de erro e nova tentativa
  manual; dados em cache não são apresentados como atuais após falha.
- Uma resposta meteorológica bem-sucedida com mais de uma hora pode ser
  apresentada com indicação explícita de desatualização.
- Máxima e mínima do clima atual se referem ao dia local; umidade é apresentada
  em porcentagem e velocidade do vento em km/h.
- Consultas de busca e meteorológicas sem resposta expiram após 10 segundos.
- Não há autenticação nem persistência de dados de usuário no servidor.
- A aplicação não usa analytics, identificadores, cookies não essenciais ou
  persistência local; os pedidos de cidade e os metadados de rede necessários
  são enviados ao provedor.
- As metas de usabilidade, latência e disponibilidade e as matrizes de
  navegadores/acessibilidade estão definidas como critérios de lançamento nesta
  especificação.

## Risks

| Risco | Impacto potencial | Mitigação |
|---|---|---|
| Indisponibilidade, lentidão, limites de consulta ou mudança nas condições do Open-Meteo. | Consultas atuais e previsões podem ficar indisponíveis ou incompletas. | Validar cobertura, limites, licença e condições de uso; acordar comportamento de falha, monitoramento e estratégia de contingência compatível com os termos do serviço. |
| Dados atrasados, incompletos ou com cobertura desigual. | A pessoa pode tomar decisões com informações incorretas ou antigas. | Informar a última atualização, sinalizar dados com mais de uma hora e não apresentar informações antigas como atuais. |
| Cidades homônimas ou variações de grafia podem levar à localidade errada. | A previsão pode não corresponder ao destino pesquisado. | Identificar resultados com cidade, região/estado quando disponível e país; validar buscas ambíguas e variações de acento. |
| Diferenças no tratamento do fuso horário podem deslocar datas e horários. | A previsão pode divergir da expectativa local e gerar retrabalho em critérios e experiência. | Usar o fuso local da cidade como referência e validar localidades em fusos diferentes, inclusive perto da mudança de dia. |
| Conversão ou arredondamento inconsistente entre componentes. | Valores podem divergir e reduzir a confiança da pessoa usuária. | Testar valores conhecidos em ambas as unidades e verificar todos os campos atuais, diários e horários. |
| A amostra de usabilidade pode não representar todas as pessoas do público geral. | A métrica inicial pode não revelar barreiras para grupos menos representados. | Tratar o resultado 9/10 como linha de base; recrutar participantes diversos e repetir o teste após mudanças relevantes. |
| O contrato ou as condições do Open-Meteo podem mudar. | Chamadas podem exceder limites ou deixar de cumprir condições de uso e atribuição. | Revisar limites, termos e atribuição antes do lançamento e periodicamente; bloquear publicação se o uso sem chave deixar de ser autorizado. |
| Consultas de cidade são compartilhadas com o provedor. | A pessoa pode não esperar que o destino pesquisado seja enviado a um terceiro. | Informar esse compartilhamento na política de privacidade e limitar as chamadas aos serviços funcionais do provedor. |

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
- Paginação, carregamento adicional ou busca por resultados além dos 10
  primeiros retornados pelo provedor.
- Atualização automática periódica, atualização em segundo plano ou cache de
  dados meteorológicos para exibição após falhas.
- Previsões para além de hoje e dos quatro dias seguintes, histórico
  meteorológico ou projeções sazonais.
- Detalhes horários fora da data local escolhida, incluindo navegação por horas
  em dias diferentes.
- Conversão de unidades de vento, pressão ou distância; velocidade do vento é
  apresentada somente em km/h.
- Compartilhamento, exportação, impressão ou uso offline de consultas e
  previsões.
- Escolha manual de país/região como filtro independente de busca.
- Métricas pós-lançamento coletadas por analytics ou telemetria.

## Open Questions

Não há questões de produto abertas para iniciar o desenvolvimento do escopo
descrito. As decisões de integração e qualidade abaixo são critérios de
lançamento, não escolhas pendentes:

| Tema | Decisão |
|---|---|
| Fonte e integração | Usar os serviços oficiais Geocoding e Forecast do Open-Meteo sem API key nesta versão, solicitando somente os campos funcionais definidos. Fazer buscas somente após confirmação da pessoa e sem atualização automática. Respeitar limites e termos vigentes; verificar conformidade antes da publicação. Se o uso sem chave não for permitido, bloquear a publicação até configurar acesso permitido. |
| Cobertura e atribuição | A busca cobre o catálogo mundial disponibilizado pelo provedor, sem prometer localidades ausentes do catálogo. Exibir atribuição visível com link ao Open-Meteo em condições atuais e previsão. |
| Limite de resultados | Exibir no máximo 10 resultados na ordem do provedor, sem paginação. |
| Detalhes horários | Disponibilizar os pontos horários do dia local selecionado em qualquer um dos cinco dias exibidos. |
| Desempenho | Aplicar p95 ≤ 3 s por tipo de operação bem-sucedida sob rede de 10/2 Mbps e 100 ms RTT; encerrar após 10 s. Validar com 100 medições de cada operação. |
| Disponibilidade | Aplicação: meta de 99,5% mensal medida por verificação externa por minuto; disponibilidade do provedor reportada separadamente. |
| Plataformas | Duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari em desktop; versões estáveis atuais de Safari em iOS e Chrome em Android; viewports 320, 375, 768, 1024 e 1440 px. |
| Acessibilidade | WCAG 2.2 AA, com avaliação automatizada/manual e matriz NVDA/Firefox/Windows e VoiceOver/Safari/iOS. |
| Privacidade | Sem contas, analytics, identificadores, cookies não essenciais ou persistência local. Informar que a consulta é enviada ao Open-Meteo e divulgar retenção conforme os termos do provedor. |
| Métrica de sucesso e validação | Em teste moderado com 10 pessoas do público geral, ao menos 9 completam sem ajuda busca, consulta atual e identificação das cinco datas. Não coletar essa métrica por telemetria. |
