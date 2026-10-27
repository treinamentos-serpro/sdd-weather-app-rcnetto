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

As estimativas são iniciais e devem ser revistas após decisões sobre público-alvo, provedor e critérios de qualidade. **Impacto** representa o efeito potencial no produto caso o risco ocorra.

| Categoria | Risco | Probabilidade | Impacto | Estratégia de mitigação |
|---|---|---|---|---|
| Técnico — Dados externos | Indisponibilidade, lentidão, limites de consulta ou mudança de contrato do provedor podem interromper ou degradar as consultas. | Média | Alto: clima atual e previsão podem ficar inacessíveis ou incompletos. | Avaliar cobertura, SLA, limites, licença e histórico do provedor antes da escolha; definir timeout, tratamento de erro, monitoramento e estratégia de contingência compatível com o contrato. |
| Técnico — Atualidade e qualidade dos dados | Dados podem estar atrasados, incompletos ou ter cobertura desigual entre localidades. | Média | Alto: usuários podem tomar decisões com informações incorretas ou antigas. | Definir requisitos de atualização e cobertura; exibir horário da última atualização e sinalizar dados expirados; validar respostas e monitorar falhas de qualidade. |
| Produto — Busca de cidades | Cidades homônimas ou variações de grafia podem levar à seleção de uma localidade incorreta. | Média | Alto: a previsão apresentada pode não corresponder à cidade procurada. | Definir cobertura e comportamento de busca; mostrar contexto suficiente para distinguir resultados, como região e país; testar nomes ambíguos e variantes com acentos. |
| Produto — Interpretação da previsão | “Cinco dias” pode significar períodos diferentes, e o fuso horário pode deslocar datas e horários. | Média | Médio: conteúdo e expectativa do usuário podem divergir, gerando retrabalho em UI, API e testes. | Confirmar se o dia atual está incluído, a granularidade e o fuso; documentar a regra e validá-la com usuários antes da implementação. |
| Produto — Escopo e aderência | Sem público-alvo, objetivo ou métrica de sucesso, o time pode priorizar funcionalidades que não resolvem a necessidade principal. | Alta | Alto: baixo uso ou insatisfação mesmo com as funções implementadas. | Validar personas e cenários prioritários com stakeholders e usuários; definir métricas de sucesso e critérios de aceite antes de fechar a spec. |
| Técnico — Desempenho e disponibilidade | Dependência de rede e de API externa pode fazer as respostas excederem as expectativas de velocidade ou disponibilidade. | Média | Alto: abandono, repetição de consultas e perda de confiança. | Acordar metas mensuráveis e condições de medição; instrumentar tempos e erros; definir limites de espera, retentativas controladas e estados de carregamento/erro. |
| Técnico — Conversão de unidades | Arredondamento incorreto ou atualização parcial dos valores ao alternar entre Celsius e Fahrenheit pode produzir dados inconsistentes. | Baixa | Médio: confusão e perda de confiança nos valores exibidos. | Centralizar conversão e formatação; definir regra de arredondamento; testar todos os valores e componentes que exibem temperatura em ambas as unidades. |
| Técnico — Compatibilidade móvel e acessibilidade | Suporte indefinido de dispositivos, navegadores e tecnologias assistivas pode deixar grupos de usuários sem acesso às funções principais. | Média | Alto: experiência quebrada, barreiras de acesso e possíveis falhas de conformidade. | Definir matriz de suporte e padrão de acessibilidade; validar fluxos principais em viewports móveis, teclado e leitor de tela como parte dos critérios de aceite. |
| Produto/Técnico — Privacidade | Consultas de cidade ou eventual uso de localização podem ser enviados ou armazenados sem regras claras. | Baixa | Alto: risco de coleta desnecessária, perda de confiança e obrigações de conformidade. | Evitar coletar localização automática sem necessidade e consentimento; mapear dados enviados ao provedor, retenção e analytics; validar requisitos de privacidade antes do lançamento. |

## Ambiguidades, Perguntas em Aberto e Impactos

As prioridades abaixo são preliminares: **Crítica** indica potencial de alterar escopo ou arquitetura; **Alta**, de comprometer uma função central ou seus critérios de aceite; **Média**, de afetar qualidade, conformidade ou cobertura.

| Classificação | Pergunta em aberto | Impacto caso fique sem resposta |
|---|---|---|
| Produto — Crítica | Quem é o público-alvo, qual necessidade principal o app deve resolver e como o sucesso será medido? | O produto pode entregar funcionalidades sem atender à necessidade prioritária; decisões de experiência e escopo ficam sem critério de valor. |
| Plataforma — Crítica | “Usar em dispositivos móveis” significa web responsiva, aplicativo nativo ou ambos? Quais navegadores, sistemas e larguras de tela serão suportados? | Escopo, arquitetura e esforço podem mudar; a responsividade não terá uma matriz objetiva de validação. |
| Dados e integração — Crítica | Qual provedor meteorológico será usado e quais são suas condições de custo, licença, cobertura, limites e atribuição? | A integração pode precisar ser refeita ou ficar limitada por custo, cobertura ou restrições contratuais. |
| Busca e localização — Alta | Quais países e localidades a busca deve cobrir, quais formatos deve aceitar e como diferenciar cidades homônimas? | Usuários podem não encontrar uma cidade ou consultar dados de uma localidade incorreta. |
| Clima atual — Alta | Quais campos definem o clima atual e qual idade máxima dos dados ainda será considerada atual? | A tela pode omitir informações esperadas ou apresentar dados antigos como atuais. |
| Previsão — Alta | Os cinco dias incluem hoje? A previsão será diária, horária ou ambas, e em qual fuso horário serão apresentados dias e horários? | O período e a interpretação da previsão podem divergir do esperado, afetando dados, interface e testes de aceite. |
| Unidades — Alta | Celsius ou Fahrenheit será a unidade inicial? A troca afeta todas as temperaturas, como será feito o arredondamento e a preferência será preservada? | A interface pode misturar unidades ou perder a escolha do usuário entre telas e sessões. |
| Falhas e conectividade — Alta | Como o app deve agir sem resultados, em timeout, indisponibilidade do provedor ou perda de conexão? Pode exibir dados em cache e como sinaliza sua idade? | Falhas podem deixar a experiência sem orientação ou levar o usuário a confiar em uma previsão desatualizada. |
| Qualidade operacional — Alta | As metas propostas de desempenho (95% em até 3 s) e disponibilidade (99,5% ao mês) são aceitáveis? Sob quais condições e limites do provedor serão medidas? | Não haverá critério objetivo para avaliar rapidez e confiabilidade, nem para alinhar compromissos com a dependência externa. |
| Acessibilidade — Média | WCAG 2.2 nível AA é o padrão esperado? Quais tecnologias assistivas e idiomas/localidades devem ser cobertos? | Barreiras de uso e problemas de conformidade podem ser descobertos tarde, exigindo retrabalho na interface e nos testes. |

As metas numéricas e prioridades registradas neste discovery são hipóteses para discussão; devem ser validadas com as partes interessadas antes de se tornarem critérios de aceite.

## Suposições

- A pesquisa e a consulta meteorológica partem de uma cidade escolhida pelo usuário; localização automática não foi solicitada.
- Celsius e Fahrenheit são unidades de apresentação para a mesma informação de temperatura, sem alterar a cidade ou o período consultado.
- “Previsão de 5 dias” significa uma previsão associada à cidade selecionada para um período de cinco dias, mas a inclusão do dia atual permanece pendente de confirmação.
- A aplicação deve oferecer as funcionalidades principais em telas móveis; a faixa de largura proposta é um ponto inicial sujeito à confirmação.
- O briefing não solicita cadastro, favoritos, notificações, mapas ou outros recursos; eles não fazem parte do escopo confirmado nesta análise.