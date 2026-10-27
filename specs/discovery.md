# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve permitir localizar uma cidade, visualizar as condições atuais e a previsão para os próximos cinco dias, escolher entre Celsius e Fahrenheit e utilizar a aplicação em dispositivos móveis.

Além das capacidades principais, já foram definidas algumas decisões de produto: aplicação web responsiva, consulta voltada ao público geral, fonte Open-Meteo, previsão de hoje mais quatro dias, Celsius como unidade inicial, ausência de autenticação e persistência de servidor, e interface em pt-BR. Ainda precisam ser detalhados o objetivo mensurável do produto, aspectos da integração meteorológica e critérios de qualidade.

## Personas Hipotéticas

As personas abaixo são hipóteses de trabalho derivadas das funções do briefing, não segmentos confirmados por pesquisa. Os limites de tempo são critérios candidatos para validar com usuários.

### Persona 1 — Pessoa que consulta antes de sair

- **Objetivo principal:** verificar rapidamente as condições atuais e decidir como se preparar para sair.
- **Contexto de uso:** principalmente mobile, em uma consulta breve antes ou durante o deslocamento; pode consultar uma cidade habitual.
- **Métrica de sucesso do ponto de vista da pessoa:** consegue encontrar ou selecionar a cidade e consultar o clima atual em até 30 segundos, sem precisar repetir a busca.

### Persona 2 — Pessoa que planeja atividades

- **Objetivo principal:** consultar os próximos cinco dias para escolher quando realizar uma atividade ou organizar a semana.
- **Contexto de uso:** principalmente desktop durante o planejamento; pode voltar ao mobile para conferir a previsão.
- **Métrica de sucesso do ponto de vista da pessoa:** consegue localizar a cidade e entender a previsão dos cinco dias em até dois minutos, sem dúvida sobre quais datas estão sendo exibidas.

### Persona 3 — Pessoa consultando uma cidade desconhecida

- **Objetivo principal:** encontrar o clima de um destino e visualizar a temperatura na unidade que prefere.
- **Contexto de uso:** principalmente mobile durante a preparação ou o deslocamento; pode não conhecer detalhes administrativos da cidade.
- **Métrica de sucesso do ponto de vista da pessoa:** identifica e seleciona a localidade correta e vê a temperatura em sua unidade preferida em até um minuto.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise cidades em qualquer país por nome completo ou parcial, ignorando diferenças de maiúsculas e acentos; os resultados devem identificar cidade, região/estado e país.
- **RF-02 — Consultar clima atual:** apresentar para a cidade selecionada a condição do tempo, temperatura atual, sensação térmica, máxima e mínima, umidade e vento.
- **RF-03 — Consultar previsão:** apresentar um resumo diário para hoje e os quatro dias seguintes, com opção de consultar detalhes por hora, para a cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e converter todas as temperaturas exibidas no clima atual e na previsão, inclusive detalhes horários.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade e uso móvel:** as funcionalidades principais devem ser utilizáveis em larguras de tela de 320 px a 1440 px, sem rolagem horizontal. Dispositivos e navegadores suportados precisam ser confirmados.
- **RNF-02 — Usabilidade:** em testes com usuários representativos, pelo menos 90% devem conseguir buscar uma cidade, consultar o clima atual e visualizar a previsão sem ajuda. O público e o protocolo de teste precisam ser definidos.
- **RNF-03 — Desempenho:** em condições de rede e disponibilidade da fonte de dados a definir, 95% das buscas e consultas meteorológicas devem apresentar os resultados em até 3 segundos.
- **RNF-04 — Disponibilidade e resiliência:** a meta inicial é disponibilidade mensal de 99,5%. Se a fonte de dados estiver indisponível ou houver falha de conexão, a aplicação deve informar o erro, permitir nova tentativa manual e não apresentar dados desatualizados como atuais.
- **RNF-05 — Acessibilidade:** a interface deve atender ao nível AA da WCAG 2.2, incluindo operação por teclado e compatibilidade com leitores de tela.
- **RNF-06 — Atualização dos dados:** a interface deve informar o horário da última atualização dos dados meteorológicos e sinalizar como desatualizados os dados com mais de uma hora.

> As metas numéricas acima são propostas iniciais para discussão e devem ser validadas antes de se tornarem critérios de aceite.

## Riscos

As estimativas são iniciais e devem ser revistas após decisões sobre público-alvo, provedor e critérios de qualidade. **Impacto** representa o efeito potencial no produto caso o risco ocorra.

| Categoria | Risco | Probabilidade | Impacto | Estratégia de mitigação |
|---|---|---|---|---|
| Técnico — Dados externos | Indisponibilidade, lentidão, limites de consulta ou mudança nas condições do Open-Meteo podem interromper ou degradar as consultas. | Média | Alto: clima atual e previsão podem ficar inacessíveis ou incompletos. | Validar cobertura, limites, licença e condições de uso do Open-Meteo; definir timeout, tratamento de erro, monitoramento e estratégia de contingência compatível com os termos do serviço. |
| Técnico — Atualidade e qualidade dos dados | Dados podem estar atrasados, incompletos ou ter cobertura desigual entre localidades. | Média | Alto: usuários podem tomar decisões com informações incorretas ou antigas. | Exibir o horário da última atualização e sinalizar dados com mais de uma hora; validar respostas e monitorar falhas de qualidade e cobertura. |
| Produto — Busca de cidades | Cidades homônimas ou variações de grafia podem levar à seleção de uma localidade incorreta. | Média | Alto: a previsão apresentada pode não corresponder à cidade procurada. | Definir comportamento de busca; mostrar contexto suficiente para distinguir resultados, como região e país; testar nomes ambíguos e variantes com acentos. |
| Produto — Interpretação da previsão | Diferenças no cálculo ou na formatação do fuso local da cidade podem deslocar datas e horários. | Baixa | Médio: conteúdo e expectativa do usuário podem divergir, gerando retrabalho em UI, API e testes. | Usar o fuso local fornecido para a cidade consultada e testar a apresentação das datas e horas em diferentes fusos. |
| Produto — Escopo e aderência | Sem uma métrica de sucesso de negócio aprovada, o time pode otimizar a experiência sem saber se ela gera o resultado esperado. | Média | Alto: baixo uso ou insatisfação mesmo com as funções implementadas. | Validar cenários prioritários com stakeholders e usuários; definir uma métrica de sucesso e critérios de aceite antes de fechar a spec. |
| Técnico — Desempenho e disponibilidade | Dependência de rede e de API externa pode fazer as respostas excederem as expectativas de velocidade ou disponibilidade. | Média | Alto: abandono, repetição de consultas e perda de confiança. | Acordar metas mensuráveis e condições de medição; instrumentar tempos e erros; definir limites de espera, retentativas controladas e estados de carregamento/erro. |
| Técnico — Conversão de unidades | Arredondamento incorreto ou atualização parcial dos valores ao alternar entre Celsius e Fahrenheit pode produzir dados inconsistentes. | Baixa | Médio: confusão e perda de confiança nos valores exibidos. | Centralizar conversão e formatação; definir regra de arredondamento; testar todos os valores e componentes que exibem temperatura em ambas as unidades. |
| Técnico — Compatibilidade móvel e acessibilidade | Suporte indefinido de dispositivos, navegadores e tecnologias assistivas pode deixar grupos de usuários sem acesso às funções principais. | Média | Alto: experiência quebrada, barreiras de acesso e possíveis falhas de conformidade. | Definir matriz de suporte e padrão de acessibilidade; validar fluxos principais em viewports móveis, teclado e leitor de tela como parte dos critérios de aceite. |
| Produto/Técnico — Privacidade | Consultas de cidade enviadas ao provedor ou eventual telemetria podem ser registradas sem regras claras. | Baixa | Alto: risco de coleta desnecessária, perda de confiança e obrigações de conformidade. | Não persistir dados de usuário no servidor; mapear dados enviados ao Open-Meteo e eventual telemetria, além de retenção e consentimento; validar requisitos de privacidade antes do lançamento. |

## Decisões

| Decisão | Justificativa | Pergunta em aberto que resolve |
|---|---|---|
| **Plataforma: aplicação web responsiva.** | Define uma única experiência web adaptável a dispositivos móveis e desktop, sem escopo de aplicativo nativo nesta etapa. | Resolve web responsiva versus app nativo. A matriz de navegadores e larguras de tela ainda precisa ser definida. |
| **Público prioritário: público geral que deseja consultar o clima de uma cidade.** | Mantém o produto abrangente, em linha com o briefing, sem restringi-lo a um segmento de uso específico. | Resolve o público inicial em nível amplo. A métrica de sucesso de negócio ainda não foi definida. |
| **Busca de cidades: cobertura mundial.** | Permite consultar cidades independentemente do país do usuário ou do destino. | Resolve a cobertura geográfica da busca. |
| **Resultados de busca identificados por cidade, região/estado e país.** | Ajuda a distinguir cidades homônimas sem exigir que o usuário refine a busca antes de ver resultados. | Resolve quais informações de localidade serão exibidas para desambiguação. |
| **Busca aceita nomes completos ou parciais e ignora maiúsculas e acentos.** | Facilita encontrar localidades sem exigir que o usuário reproduza exatamente a grafia ou capitalização do catálogo. | Resolve o comportamento de busca para nomes parciais, diferenças de caixa e acentuação. Tolerância a erros de digitação não está incluída. |
| **Clima atual: condição, temperatura atual, sensação térmica, máxima e mínima, umidade e vento.** | Oferece um resumo útil sem incluir métricas meteorológicas mais especializadas nesta etapa. | Resolve quais campos compõem o clima atual. O limite de uma hora para sinalizar dados desatualizados está registrado em decisão separada. |
| **Previsão: resumo diário para hoje mais quatro dias, com detalhes horários sob demanda.** | Oferece uma visão rápida dos cinco dias e permite consultar mais detalhe sem sobrecarregar a tela inicial. | Resolve o período e a granularidade principal da previsão. |
| **Fuso horário: local da cidade consultada.** | Mantém datas e horários coerentes com a previsão do local, mesmo quando o usuário está em outro fuso. | Resolve qual fuso usar para as datas e os detalhes horários. |
| **Fonte de dados: Open-Meteo, sem API key.** | Evita exigir uma chave de API na integração inicial e define o provedor meteorológico do produto. | Resolve qual provedor será usado. Permanecem pendentes a confirmação de cobertura, limites, condições de uso e dos endpoints/campos necessários. |
| **Período da previsão: hoje mais os quatro dias seguintes.** | Torna explícito como contar os cinco dias solicitados. | Resolve se o dia atual está incluído. A granularidade diária com detalhes horários e o fuso local da cidade estão registrados em decisões separadas. |
| **Unidade padrão: Celsius; a escolha não é persistida.** | Mantém um padrão previsível sem armazenar preferências no servidor ou navegador. | Resolve a unidade inicial e o comportamento após recarga ou nova visita: a aplicação volta para Celsius. |
| **Alternar a unidade converte todas as temperaturas do clima atual e da previsão.** | Evita valores simultâneos em escalas diferentes e mantém uma interpretação consistente. | Resolve quais temperaturas são afetadas pela alternância. A precisão de arredondamento está registrada em decisão separada. |
| **Temperaturas são arredondadas para o grau inteiro mais próximo.** | Simplifica a leitura e mantém apresentação consistente em todos os componentes. | Resolve a precisão exibida após a conversão de unidade. |
| **Dados com mais de uma hora são sinalizados como desatualizados.** | Define uma regra simples e verificável para alertar sobre a idade dos dados meteorológicos. | Resolve o limite para identificar dados desatualizados. |
| **Falhas de conexão ou do Open-Meteo exibem erro e nova tentativa manual, sem fallback para dados antigos.** | Evita apresentar como atuais informações que podem não refletir o clima mais recente. | Resolve a resposta principal a falhas de conectividade e indisponibilidade do provedor. |
| **Sem autenticação e sem persistência de servidor.** | Mantém o escopo sem contas e evita armazenar dados de usuário no servidor. | Resolve se haverá login/contas e armazenamento de dados de usuário no servidor. Não decide armazenamento local no navegador nem registros mantidos pelo provedor externo. |
| **Idioma da interface: pt-BR.** | Define o idioma padrão da experiência para o público inicial. | Resolve qual idioma a interface deve apresentar. Não define a cobertura geográfica da busca nem outros idiomas futuros. |

## Ambiguidades, Perguntas em Aberto e Impactos

As prioridades abaixo são preliminares: **Crítica** indica potencial de alterar escopo ou arquitetura; **Alta**, de comprometer uma função central ou seus critérios de aceite; **Média**, de afetar qualidade, conformidade ou cobertura.

| Classificação | Pergunta em aberto | Impacto caso fique sem resposta |
|---|---|---|
| Produto — Alta | Qual métrica de negócio indicará que o app atende ao público geral (por exemplo, consultas concluídas, retorno de usuários ou satisfação)? | Sem um resultado mensurável, não será possível avaliar se o produto atende à necessidade nem priorizar melhorias com base em evidências. |
| Plataforma — Média | Quais navegadores e larguras de tela serão suportados pela aplicação web responsiva? | Sem uma matriz de suporte, a cobertura de testes e os critérios de compatibilidade ficam indefinidos. |
| Dados e integração — Alta | Quais endpoints e campos do Open-Meteo serão necessários e quais são as condições de cobertura, limites, licença e atribuição aplicáveis? | A integração pode ficar incompleta ou limitada por cobertura, volume de consultas ou condições de uso. |
| Qualidade operacional — Alta | As metas propostas de desempenho (95% em até 3 s) e disponibilidade (99,5% ao mês) são aceitáveis? Sob quais condições e limites do provedor serão medidas? | Não haverá critério objetivo para avaliar rapidez e confiabilidade, nem para alinhar compromissos com a dependência externa. |
| Acessibilidade — Média | WCAG 2.2 nível AA é o padrão esperado e quais tecnologias assistivas devem ser cobertas nos testes? | Barreiras de uso e problemas de conformidade podem ser descobertos tarde, exigindo retrabalho na interface e nos testes. |

As metas numéricas e prioridades registradas neste discovery são hipóteses para discussão; devem ser validadas com as partes interessadas antes de se tornarem critérios de aceite.

## Suposições

- A busca tem cobertura mundial e a consulta meteorológica parte de uma cidade escolhida pelo usuário; localização automática não foi solicitada.
- Celsius e Fahrenheit são unidades de apresentação para a mesma informação de temperatura, sem alterar a cidade ou o período consultado.
- Celsius é a unidade inicial; a unidade escolhida pelo usuário vale apenas até recarregar ou iniciar uma nova visita e não é persistida.
- A previsão de cinco dias cobre hoje e os quatro dias seguintes, conforme decisão registrada acima.
- A aplicação será web responsiva e oferecerá as funcionalidades principais em telas móveis e desktop; navegadores e larguras de tela suportados ainda serão confirmados.
- O briefing não solicita cadastro, favoritos, notificações, mapas ou outros recursos; eles não fazem parte do escopo confirmado nesta análise.