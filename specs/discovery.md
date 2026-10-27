# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve permitir localizar uma cidade, visualizar as condições atuais e a previsão para os próximos cinco dias, escolher entre Celsius e Fahrenheit e utilizar a aplicação em dispositivos móveis.

Além das capacidades principais, já foram definidas algumas decisões de produto: fonte Open-Meteo, previsão de hoje mais quatro dias, Celsius como unidade inicial, ausência de autenticação e persistência de servidor, e interface em pt-BR. Público-alvo, detalhes das informações meteorológicas, regras de busca e critérios de qualidade ainda precisam ser esclarecidos.

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

As estimativas são iniciais e devem ser revistas após decisões sobre público-alvo, provedor e critérios de qualidade. **Impacto** representa o efeito potencial no produto caso o risco ocorra.

| Categoria | Risco | Probabilidade | Impacto | Estratégia de mitigação |
|---|---|---|---|---|
| Técnico — Dados externos | Indisponibilidade, lentidão, limites de consulta ou mudança nas condições do Open-Meteo podem interromper ou degradar as consultas. | Média | Alto: clima atual e previsão podem ficar inacessíveis ou incompletos. | Validar cobertura, limites, licença e condições de uso do Open-Meteo; definir timeout, tratamento de erro, monitoramento e estratégia de contingência compatível com os termos do serviço. |
| Técnico — Atualidade e qualidade dos dados | Dados podem estar atrasados, incompletos ou ter cobertura desigual entre localidades. | Média | Alto: usuários podem tomar decisões com informações incorretas ou antigas. | Definir requisitos de atualização e cobertura; exibir horário da última atualização e sinalizar dados expirados; validar respostas e monitorar falhas de qualidade. |
| Produto — Busca de cidades | Cidades homônimas ou variações de grafia podem levar à seleção de uma localidade incorreta. | Média | Alto: a previsão apresentada pode não corresponder à cidade procurada. | Definir cobertura e comportamento de busca; mostrar contexto suficiente para distinguir resultados, como região e país; testar nomes ambíguos e variantes com acentos. |
| Produto — Interpretação da previsão | Embora o período definido seja hoje mais quatro dias, a granularidade e o fuso horário ainda podem levar a interpretações diferentes. | Média | Médio: conteúdo e expectativa do usuário podem divergir, gerando retrabalho em UI, API e testes. | Manter a regra de hoje mais quatro dias e definir a granularidade e o fuso; documentar a apresentação das datas e validá-la com usuários. |
| Produto — Escopo e aderência | Sem público-alvo, objetivo ou métrica de sucesso, o time pode priorizar funcionalidades que não resolvem a necessidade principal. | Alta | Alto: baixo uso ou insatisfação mesmo com as funções implementadas. | Validar personas e cenários prioritários com stakeholders e usuários; definir métricas de sucesso e critérios de aceite antes de fechar a spec. |
| Técnico — Desempenho e disponibilidade | Dependência de rede e de API externa pode fazer as respostas excederem as expectativas de velocidade ou disponibilidade. | Média | Alto: abandono, repetição de consultas e perda de confiança. | Acordar metas mensuráveis e condições de medição; instrumentar tempos e erros; definir limites de espera, retentativas controladas e estados de carregamento/erro. |
| Técnico — Conversão de unidades | Arredondamento incorreto ou atualização parcial dos valores ao alternar entre Celsius e Fahrenheit pode produzir dados inconsistentes. | Baixa | Médio: confusão e perda de confiança nos valores exibidos. | Centralizar conversão e formatação; definir regra de arredondamento; testar todos os valores e componentes que exibem temperatura em ambas as unidades. |
| Técnico — Compatibilidade móvel e acessibilidade | Suporte indefinido de dispositivos, navegadores e tecnologias assistivas pode deixar grupos de usuários sem acesso às funções principais. | Média | Alto: experiência quebrada, barreiras de acesso e possíveis falhas de conformidade. | Definir matriz de suporte e padrão de acessibilidade; validar fluxos principais em viewports móveis, teclado e leitor de tela como parte dos critérios de aceite. |
| Produto/Técnico — Privacidade | Consultas de cidade enviadas ao provedor ou eventual telemetria podem ser registradas sem regras claras. | Baixa | Alto: risco de coleta desnecessária, perda de confiança e obrigações de conformidade. | Não persistir dados de usuário no servidor; mapear dados enviados ao Open-Meteo e eventual telemetria, além de retenção e consentimento; validar requisitos de privacidade antes do lançamento. |

## Decisões

| Decisão | Justificativa | Pergunta em aberto que resolve |
|---|---|---|
| **Fonte de dados: Open-Meteo, sem API key.** | Evita exigir uma chave de API na integração inicial e define o provedor meteorológico do produto. | Resolve qual provedor será usado. Permanecem pendentes a confirmação de cobertura, limites, condições de uso e dos endpoints/campos necessários. |
| **Período da previsão: hoje mais os quatro dias seguintes.** | Torna explícito como contar os cinco dias solicitados. | Resolve se o dia atual está incluído. Granularidade e fuso horário ainda precisam ser definidos. |
| **Unidade padrão: Celsius.** | Define a unidade exibida na primeira consulta. | Resolve qual unidade será usada inicialmente. A persistência da preferência escolhida pelo usuário continua em aberto. |
| **Sem autenticação e sem persistência de servidor.** | Mantém o escopo sem contas e evita armazenar dados de usuário no servidor. | Resolve se haverá login/contas e armazenamento de dados de usuário no servidor. Não decide armazenamento local no navegador nem registros mantidos pelo provedor externo. |
| **Idioma da interface: pt-BR.** | Define o idioma padrão da experiência para o público inicial. | Resolve qual idioma a interface deve apresentar. Não define a cobertura geográfica da busca nem outros idiomas futuros. |

## Ambiguidades, Perguntas em Aberto e Impactos

As prioridades abaixo são preliminares: **Crítica** indica potencial de alterar escopo ou arquitetura; **Alta**, de comprometer uma função central ou seus critérios de aceite; **Média**, de afetar qualidade, conformidade ou cobertura.

| Classificação | Pergunta em aberto | Impacto caso fique sem resposta |
|---|---|---|
| Produto — Crítica | Quem é o público-alvo, qual necessidade principal o app deve resolver e como o sucesso será medido? | O produto pode entregar funcionalidades sem atender à necessidade prioritária; decisões de experiência e escopo ficam sem critério de valor. |
| Plataforma — Crítica | “Usar em dispositivos móveis” significa web responsiva, aplicativo nativo ou ambos? Quais navegadores, sistemas e larguras de tela serão suportados? | Escopo, arquitetura e esforço podem mudar; a responsividade não terá uma matriz objetiva de validação. |
| Dados e integração — Alta | Quais endpoints e campos do Open-Meteo serão necessários e quais são as condições de cobertura, limites, licença e atribuição aplicáveis? | A integração pode ficar incompleta ou limitada por cobertura, volume de consultas ou condições de uso. |
| Busca e localização — Alta | Quais países e localidades a busca deve cobrir, quais formatos deve aceitar e como diferenciar cidades homônimas? | Usuários podem não encontrar uma cidade ou consultar dados de uma localidade incorreta. |
| Clima atual — Alta | Quais campos definem o clima atual e qual idade máxima dos dados ainda será considerada atual? | A tela pode omitir informações esperadas ou apresentar dados antigos como atuais. |
| Previsão — Alta | Definido hoje mais quatro dias, a previsão será diária, horária ou ambas, e em qual fuso serão apresentados dias e horários? | A granularidade ou as datas podem divergir da expectativa, afetando dados, interface e testes de aceite. |
| Unidades — Alta | A troca entre Celsius e Fahrenheit afeta todos os campos? Qual regra de arredondamento será usada e a preferência será salva localmente no navegador ou reiniciada em cada sessão? | Valores podem aparecer inconsistentes ou a preferência pode se comportar de modo inesperado após recarregar ou reabrir a aplicação. |
| Falhas e conectividade — Alta | Como o app deve agir sem resultados, em timeout, indisponibilidade do provedor ou perda de conexão? Pode exibir dados em cache e como sinaliza sua idade? | Falhas podem deixar a experiência sem orientação ou levar o usuário a confiar em uma previsão desatualizada. |
| Qualidade operacional — Alta | As metas propostas de desempenho (95% em até 3 s) e disponibilidade (99,5% ao mês) são aceitáveis? Sob quais condições e limites do provedor serão medidas? | Não haverá critério objetivo para avaliar rapidez e confiabilidade, nem para alinhar compromissos com a dependência externa. |
| Acessibilidade — Média | WCAG 2.2 nível AA é o padrão esperado e quais tecnologias assistivas devem ser cobertas nos testes? | Barreiras de uso e problemas de conformidade podem ser descobertos tarde, exigindo retrabalho na interface e nos testes. |

As metas numéricas e prioridades registradas neste discovery são hipóteses para discussão; devem ser validadas com as partes interessadas antes de se tornarem critérios de aceite.

## Suposições

- A pesquisa e a consulta meteorológica partem de uma cidade escolhida pelo usuário; localização automática não foi solicitada.
- Celsius e Fahrenheit são unidades de apresentação para a mesma informação de temperatura, sem alterar a cidade ou o período consultado.
- A previsão de cinco dias cobre hoje e os quatro dias seguintes, conforme decisão registrada acima.
- A aplicação deve oferecer as funcionalidades principais em telas móveis; a faixa de largura proposta é um ponto inicial sujeito à confirmação.
- O briefing não solicita cadastro, favoritos, notificações, mapas ou outros recursos; eles não fazem parte do escopo confirmado nesta análise.