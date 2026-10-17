---
title: "dowse: uma alternativa local ao Sourcegraph e ao GitHub Code Search"
description: "dowse é um app desktop e CLI gratuito e open source para buscar código em todos os seus repositórios Git locais, com a sintaxe do GitHub e sem servidor."
translatedAt: 2026-10-17
---

O [dowse](https://github.com/HenryZhang-ZHY/dowse) pesquisa código em vários repositórios Git de uma só vez, seja por meio de um aplicativo desktop ou direto pela linha de comando. Ele entrega para os clones no seu próprio disco o que o [GitHub code search](https://github.com/features/code-search) e o [grep.app](https://grep.app) oferecem no GitHub: uma única caixa de busca, todos os seus repositórios e resultados em milissegundos. Ele utiliza a mesma sintaxe de consulta do GitHub code search, roda sobre o [tgrep](https://github.com/microsoft/tgrep) (o motor grep baseado em trigramas aberto pela Microsoft), mantém um índice por repositório aos moldes do [Zoekt](https://github.com/sourcegraph/zoekt) e não precisa de nenhum servidor.

![dowse pesquisando em 12 repositórios públicos enquanto a consulta é digitada: resultados em milissegundos, refinados para Rust via faceta e exibidos em tabela](./dowse-search.webp)

O dowse funciona no Windows, macOS e Linux. É gratuito e tem código aberto sob a licença MIT.

**[Baixar a versão mais recente](https://github.com/HenryZhang-ZHY/dowse/releases)**

## O código de que você precisa raramente fica em um único repositório

Quando você quer descobrir como uma função é chamada, onde uma chave de configuração é lida ou quais serviços ainda estão presos a uma versão desatualizada de uma biblioteca, a resposta costuma estar espalhada por dezenas de repositórios: suas cópias de trabalho diárias, espelhos dos serviços da sua equipe e as bibliotecas das quais seu projeto depende. As ferramentas existentes cobrem apenas partes desse cenário:

- O **GitHub code search** é rápido e tem uma sintaxe excelente, mas pesquisa apenas o que está hospedado no GitHub, fica restrito à [branch padrão](https://docs.github.com/en/search-github/github-code-search/about-github-code-search#limitations) de cada repositório e devolve no máximo 100 resultados por consulta. A branch de funcionalidade em que você está trabalhando agora, os ajustes locais ainda não enviados e repositórios hospedados em outros lugares ficam de fora.
- O **grep.app** pesquisa apenas repositórios públicos do GitHub. O código proprietário da sua empresa não está lá, nem deveria estar.
- O **Sourcegraph** é a plataforma mais completa de busca de código, com navegação de símbolos e alterações em lote (batch changes). No entanto, é um sistema baseado em servidor: alguém precisa implantar, conectar aos provedores de Git e manter tudo no ar. Para uma organização de engenharia inteira, é um ótimo investimento; para um único desenvolvedor no laptop do trabalho, é infraestrutura pesada demais apenas para vasculhar algumas pastas locais.
- O **Zoekt**, motor de trigramas que alimenta a busca do Sourcegraph, é de código aberto e extremamente veloz. Mas também se trata de um conjunto de indexadores e servidores que você precisa configurar, executar e alimentar.
- O **Entrian Source Search** adiciona um índice de texto completo ao Visual Studio, mas vive isolado dentro da IDE e cobra licença por desenvolvedor.
- O **ripgrep** e o `git grep` não dependem de nada, mas leem todos os arquivos do zero a cada busca, operando em uma árvore de diretórios por vez. Ao lidar com cinquenta repositórios, a velocidade instantânea desaparece.

Eu queria no meu próprio disco a mesma experiência prática que o GitHub code search me dá no github.com: varrer tanto os mirrors que mantenho na `main` quanto as cópias de trabalho em que estou codificando, incluindo alterações que ainda nem foram commitadas. O dowse é exatamente isso.

## O que o dowse faz

### A sintaxe do GitHub code search nos seus próprios clones

As consultas são interpretadas à medida que você digita, seguindo a sintaxis do GitHub code search. Os termos são combinados por arquivo e não por linha: por exemplo, buscar `parse config` localiza arquivos que contenham ambas as palavras em qualquer parte do texto e exibe as linhas onde qualquer uma delas aparece.

```text
parse config                      arquivos que contêm as duas palavras
parse OR config                   arquivos que contêm qualquer uma delas
parse NOT test                    contêm parse, mas excluem test
"fn main()"                       correspondência exata da frase
/fn \w+_test/                     linha que casa com a expressão regular
path:src/*.rs  language:rust      filtro por glob de caminho e linguagem
repo:api  branch:main             repositórios e branches específicos
-path:tests  -lang:md             critérios de exclusão
```

Uma consulta formada apenas por qualificadores (como `path:*.proto`) lista os arquivos correspondentes sem precisar ler o conteúdo de nenhum deles. Diferenciação de maiúsculas, palavras inteiras e expressões regulares podem ser alternadas instantaneamente por atalhos de teclado (`Alt+C`, `Alt+W`, `Alt+R`).

![Resultados do dowse para a consulta trigram index -path:test em tgrep, Zoekt, Google codesearch, Hound, Django e Go, com facetas de repositório, branch, proprietário e linguagem](./search-across-repositories.webp)

Os resultados aparecem em trechos destacados por gramáticas do tree-sitter. Clicar em qualquer linha abre a pré-visualização completa do arquivo ao lado dos resultados; você pode navegar pelos matches com `F4` e abrir o arquivo nessa linha exata no VS Code, Cursor, Zed ou Sublime Text pressionando `Ctrl+Clique`.

![Painel de pré-visualização do dowse exibindo o arquivo cindex.go do Google codesearch ao lado dos resultados, com cada ocorrência destacada](./file-preview.webp)

### Tags definem o escopo, facetas refinam os resultados

Um workspace agrupa um conjunto de repositórios, semelhante aos workspaces do VS Code, salvo em um arquivo `.dowse-workspace`. Os repositórios podem receber tags variadas: etiquetas simples como `mirror` ou `dev`, ou no formato chave-valor como `owner:alice` ou `project:billing`. Além disso, cada repositório recebe automaticamente a tag `branch:<nome>` indicando a branch atualmente ativa, atualizada sempre que você troca de branch.

A barra de escopo permite selecionar as tags que devem participar da busca. Tags dentro de um mesmo grupo funcionam como alternativas OU (`owner:alice` ou `owner:bob`); grupos diferentes filtram-se mutuamente como E (`dev` e `owner:alice`). Com os resultados na tela, as facetas contabilizam as ocorrências por repositório, branch, tag, linguagem e diretório raiz, recalculando cada contagem sob os filtros ativos, exatamente como no grep.app.

### Visualização em tabela: grupos de captura de regex transformados em colunas

A exibição em tabela (`Alt+T`) lista cada linha encontrada como um registro estruturado: repositório, branch, caminho, linha, coluna, linguagem, termo casado e a linha inteira. Quando a expressão regular da consulta contém grupos de captura nomeados (named capture groups), cada grupo vira uma coluna identificada pelo próprio nome. Esta consulta, por exemplo, transforma uma busca em uma tabela completa com as versões de todas as crates dos seus repositórios:

```text
/^version = "(?<version>[^"]+)"/ path:Cargo.toml
```

![Visualização em tabela do dowse: uma linha por versão em Cargo.toml no ripgrep, regex, tokio, serde e tgrep, com coluna version extraída do grupo de captura nomeado](./table-view-capture-groups.webp)

Enquanto o GitHub code search limita a exibição aos primeiros 100 resultados, a tabela do dowse comporta até cerca de 20.000 linhas. Você pode ordenar por qualquer coluna, exportar os dados como CSV, TSV, Markdown ou JSON, ou colar diretamente em uma planilha. Responder a perguntas como "quais serviços ainda chamam essa API legada?" ou "quais níveis de log estão configurados em cada aplicação?" vira uma tabela ordenada em vez de uma rolagem interminável por resultados de busca.

### Clone organizações inteiras do GitHub e mantenha tudo atualizado

A tela de repositórios lista os projetos de uma conta ou organização por meio do [GitHub CLI](https://cli.github.com), de modo que o dowse nunca lida com as suas credenciais: basta executar `gh auth login` uma vez no terminal. A paginação é buscada em paralelo; uma organização com 2.000 repositórios é carregada em poucos segundos. Selecione alguns ou todos os repositórios listados, e o dowse os clonará em segundo plano no caminho `<pasta>/<owner>/<name>`, atribuindo a tag `owner:<owner>` e gerando o índice.

Por padrão, os clones são feitos no modo sem blobs (blobless clones): todo o histórico de commits é baixado, mas apenas o conteúdo dos arquivos da revisão atual é recuperado. Com isso, até mesmo repositórios gigantes são clonados rapidamente, e o histórico do Git continua totalmente acessível.

![Página de repositórios do dowse: 12 repositórios clonados do GitHub com suas tags de branch, proprietário e mirror, e a quantidade de arquivos em cada índice](./repositories-page.webp)

Defina um intervalo de sincronização para um repositório (`15m`, `1h`, `3d`), e o dowse executará um pull periódico. Esse pull faz um fetch de `origin` e só aplica fast-forward se a branch padrão estiver ativa, os arquivos monitorados estiverem limpos e não houver commits locais pendentes. Caso contrário, ele realiza apenas o fetch e informa claramente o motivo (`on feature/x, not main`, `uncommitted changes`). Ele nunca executa merge, rebase ou stash de forma arbitrária — por isso é perfeitamente seguro apontá-lo para as suas pastas diárias de desenvolvimento, e não apenas para mirrors.

## Construído sobre o tgrep, o grep por trigramas da Microsoft

O núcleo de processamento do dowse é o [tgrep](https://github.com/microsoft/tgrep), o grep indexado por trigramas de altíssimo desempenho que a Microsoft lançou como código aberto este ano e que sustenta as buscas na [GitHub Copilot CLI](https://github.com/github/copilot-cli). Um índice de trigramas mapeia em quais arquivos cada sequência de três caracteres ocorre. Ao receber uma consulta, o tgrep a quebra em trigramas, calcula a interseção das suas listas invertidas e lê do disco apenas os arquivos que têm chance matemática de casar, entregando-os ao motor de regex de verdade. O Zoekt e, antes dele, o [Google Code Search](https://swtch.com/~rsc/regexp/regexp4.html), operam sob o mesmo princípio. Nos próprios testes oficiais da Microsoft, o tgrep superou o ripgrep em 17 de 18 combinações de repositórios e plataformas, sendo até 51,9 vezes mais rápido.

Para as capturas exibidas neste artigo, o dowse indexou doze repositórios públicos clonados do GitHub: tgrep, ripgrep, Zoekt, Google codesearch, Hound, tokio, serde, regex, VS Code, Django, FastAPI e Go — totalizando 45.629 arquivos. A busca `trigram index -path:test` casa com 72 arquivos em seis deles; para encontrá-los, o dowse precisou ler apenas 73 arquivos do disco, levando 10 ms. Gerar a tabela de versões do Cargo.toml levou míseros 3,2 ms. Em uma base de código ainda maior, com 42.000 arquivos (1,3 GB de código-fonte Rust), o índice leva cerca de 6 segundos para ser gerado, e buscas comuns terminam em 20–60 ms.

O tgrep foi desenhado para indexar uma única árvore de diretórios e consultá-la via CLI ou por um servidor local dedicado. O dowse reúne diversas árvores sob uma única caixa de busca e adiciona a infraestrutura necessária: interpretação da sintaxe do GitHub, tags e facetas entre múltiplos repositórios, visualização em tabela, pré-visualização no app, além de clonagem e atualização a partir do GitHub. Os índices são nativos do tgrep e ficam na pasta `.tgrep` de cada repositório — o mesmo local usado por `tgrep index` e `tgrep serve`, permitindo que o dowse e a CLI do tgrep compartilhem o mesmo índice.

## Um índice sempre atualizado sem rebuilds demorados

Um índice só tem utilidade se refletir a realidade dos arquivos. O dowse não precisa esperar uma reconstrução completa para reconhecer mudanças:

- Um observador de arquivos (file watcher) em cada repositório rastreia as alterações feitas desde a última compilação do índice, e as buscas leem esses arquivos diretamente. Um `git pull` em um mirror ou uma alteração salva há um segundo no editor aparece na busca imediatamente seguinte.
- Ao abrir um repositório, o dowse identifica os arquivos adicionados, apagados ou renomeados enquanto o aplicativo esteve fechado.
- A atualização do índice lê apenas os arquivos modificados e faz o streaming para uma cópia do índice. Em um repositório de 245.000 arquivos com um índice de 1,7 GB, essa atualização leva cerca de 10 segundos, enquanto um rebuild do zero demoraria 9 minutos. E as pesquisas continuam funcionando sem interrupção enquanto o processo ocorre.

A interface do aplicativo desktop é nativa, construída com o [GPUI](https://github.com/zed-industries/zed), o framework acelerado por GPU que move o editor Zed. Não há navegadores embutidos nem Electron consumindo recursos em segundo plano.

## Uma linha de comando para pessoas e agentes de programação

Comandos como `dowse search` e `dowse repos` comunicam-se diretamente com o aplicativo desktop em execução, aproveitando seus índices já aquecidos na memória e seus monitores de arquivos. Se o aplicativo ainda não estiver aberto, o primeiro comando o inicializa silenciosamente em segundo plano, sem janelas.

```bash
dowse search 'parse_config lang:rust'          # pesquisa em todos os repositórios gerenciados
dowse search --here 'parse_config'             # pesquisa apenas no repositório atual
dowse search -t owner:my-org -l 'LegacyClient' # apenas caminhos de arquivos, em uma organização
dowse repos clone --from my-org --pull-every 1h
```

A saída do terminal foi projetada tanto para desenvolvedores quanto para agentes de IA como Claude Code, Codex e Cursor. Quando um agente usa o `grep` tradicional em um projeto grande, ele passa a maior parte do tempo em I/O de disco e satura sua janela de contexto com montanhas de texto irrelevante. O tgrep soluciona a primeira parte dentro da GitHub Copilot CLI; o dowse dá a qualquer agente o mesmo índice de alta velocidade em todos os seus repositórios locais, com controle rigoroso de volume de saída:

- Os resultados vão para o stdout; contagens, tempos e notas informativas vão para o stderr. O código de saída é 0 quando há correspondências e 1 quando nada é encontrado.
- Por padrão, a saída é limitada a 100 linhas de resultados e 20 por arquivo, com um resumo no rodapé. Quando os resultados são truncados, o rodapé sugere qualificadores precisos para refinar a pesquisa, indicando quantos arquivos cada filtro preservaria:

  ```text
  narrow with: repo:api (120)  language:Rust (80)  path:src/** (64)
  ```

- A opção `--json` exibe um objeto por arquivo casado e um sumário; `--table csv` imprime as linhas da visualização em tabela diretamente no formato CSV.
- O comando `dowse guide` exibe [um guia rápido pensado para agentes](https://github.com/HenryZhang-ZHY/dowse/blob/master/docs/agent-guide.md). Adicione-o ao seu `AGENTS.md` ou `CLAUDE.md`, e seu agente poderá pesquisar em todos os seus repositórios locais, em vez de ficar preso apenas ao diretório onde foi acionado.

## Comparativo do dowse com tgrep, Sourcegraph, Zoekt, GitHub code search e Entrian Source Search

| Critério        | dowse                                                             | tgrep                | GitHub code search                           | Sourcegraph               | Zoekt                  | Entrian Source Search          |
| --------------- | ----------------------------------------------------------------- | -------------------- | -------------------------------------------- | ------------------------- | ---------------------- | ------------------------------ |
| Execução        | Na sua máquina                                                    | Na sua máquina       | No github.com                                | Servidor próprio          | Servidor próprio       | Dentro do Visual Studio        |
| Escopo          | Múltiplos clones locais, qualquer branch, arquivos não commitados | Uma única pasta      | Repositórios do GitHub, apenas branch padrão | Provedores Git conectados | Repositórios indexados | Arquivos da solution atual     |
| Sintaxe         | GitHub code search                                                | Regex, estilo grep   | GitHub code search                           | Sintaxe do Sourcegraph    | Sintaxe do Zoekt       | Sintaxe do Entrian             |
| Índice          | Trigramas (tgrep), mantido atualizado por watcher                 | Trigramas            | Proprietário do GitHub                       | Zoekt                     | Trigramas              | Texto completo                 |
| Interface       | App desktop e CLI                                                 | CLI e servidor local | Web                                          | Web                       | Web e API              | Painel na IDE                  |
| Preço e licença | Gratuito, MIT                                                     | Gratuito, MIT        | Incluso no GitHub                            | Comercial                 | Gratuito, Apache-2.0   | Licença paga por desenvolvedor |

Em resumo: se você quer o grep mais rápido possível em um único repositório direto no terminal, use o tgrep. Se a sua empresa precisa de busca de código compartilhada via navegador para todo o time, use o Sourcegraph ou configure o Zoekt. Se todo o seu código está no GitHub e olhar apenas a branch padrão é suficiente, o GitHub code search já resolve. Mas se você deseja pesquisar em todos os repositórios da sua máquina, em qualquer branch, incluindo alterações que ainda não foram commitadas, direto do desktop ou do terminal do seu agente de IA e sem precisar rodar servidor nenhum: é para isso que o dowse foi criado.

## Baixar o dowse

Na [página de lançamentos](https://github.com/HenryZhang-ZHY/dowse/releases), você encontra os binários compilados mais recentes, acompanhados das somas de verificação em `SHA256SUMS`. O nome de cada arquivo segue o padrão `dowse`, a versão e o seu sistema operacional:

| Plataforma                                      | Arquivo                  |
| ----------------------------------------------- | ------------------------ |
| Windows (x64)                                   | `…-windows-x86_64.zip`   |
| macOS 11+ (Apple silicon e processadores Intel) | `…-macos-universal.zip`  |
| Linux (x64)                                     | `…-linux-x86_64.tar.gz`  |
| Linux (arm64)                                   | `…-linux-aarch64.tar.gz` |

Após descompactar, registre as pastas onde você guarda seus repositórios:

```bash
dowse ~/src ~/mirrors
```

Se a pasta contiver vários repositórios Git, o dowse adicionará todos automaticamente. No Windows, a tela de repositórios permite ainda incluir a opção "Add to dowse" no menu de contexto do Explorador de Arquivos.

Como os executáveis não utilizam um certificado comercial pago, o Windows SmartScreen ou o macOS Gatekeeper podem exibir um alerta de segurança na primeira inicialização; o arquivo [README](https://github.com/HenryZhang-ZHY/dowse#download) explica passo a passo como autorizar a execução. Caso queira compilar a partir do código-fonte, basta executar `cargo run --release` com uma versão estável e recente do Rust.

## Perguntas frequentes (FAQ)

### O dowse é uma alternativa ao Sourcegraph?

Para um desenvolvedor individual buscando nos seus próprios clones locais, sim. O dowse cobre o caso de uso principal do Sourcegraph: buscas ultrarrápidas por expressões regulares e literais em múltiplos repositórios, dispensando servidores. Ele não se propõe a substituir os recursos de navegação semântica profunda (code intelligence), alterações em lote (batch changes) ou a interface web compartilhada para grandes times.

### O dowse é apenas uma interface gráfica para o tgrep?

Em parte. O dowse aproveita a estrutura de índice do tgrep e lê e grava nos mesmos diretórios `.tgrep`, funcionando perfeitamente como frontend desktop para o tgrep. Além disso, ele agrega busca em dezenas de repositórios em uma única chamada, suporte à sintaxe do GitHub code search, tags, facetas, visualização em tabela, pré-visualização de arquivos, além de clonagem e sincronização direta com o GitHub — utilidades que o tgrep sozinho não oferece.

### Qual a diferença entre o dowse e o Zoekt?

Ambos utilizam índices invertidos de trigramas. O Zoekt é um motor de busca projetado como serviço de segundo plano, que depende de rotinas externas para manter e fornecer os índices. Já o dowse é uma aplicação autocontida que indexa seus repositórios no disco por conta própria, mantém o índice atualizado via monitoramento de arquivos e updates incrementais, e entrega uma interface visual moderna e uma CLI focada em fluxos com agentes de IA.

### Posso pesquisar código localmente com a sintaxe do GitHub code search?

Sim. O dowse interpreta a sintaxe do GitHub code search: operadores `AND`, `OR`, `NOT`, termos exatos entre aspas, expressões regulares com `/regex/`, bem como os qualificadores `path:`, `language:`, `repo:` e `branch:`, além do prefixo `-` para negações.

### O dowse busca alterações não commitadas e outras branches?

Sim. Como ele lê diretamente os arquivos presentes no disco, qualquer que seja a branch ativa e mesmo modificações locais ainda não commitadas entram na busca. Cada repositório recebe a tag com a sua branch atual, logo `branch:main` restringe a consulta exclusivamente às branches principais.

### Existe alguma alternativa ao Entrian Source Search que funcione fora do Visual Studio?

O dowse não é um complemento amarrado a uma IDE específica, mas sim um aplicativo desktop e CLI independente que abre os resultados diretamente no editor da sua preferência, como VS Code, Cursor, Zed ou Sublime Text. Ele pesquisa livremente por múltiplos repositórios e é 100% gratuito e de código aberto.

### O dowse envia meu código para algum servidor externo?

Não. Os índices ficam armazenados localmente na pasta `.tgrep` de cada repositório e todas as buscas rodam inteiramente na sua máquina. As únicas operações de rede efetuadas são aquelas que você solicita explicitamente através do Git e da GitHub CLI, como listar repositórios de uma organização, cloná-los ou fazer pull programado.

---

O dowse está disponível no [GitHub](https://github.com/HenryZhang-ZHY/dowse). Se ele poupar seu tempo no dia a dia, uma estrela no projeto ajuda outros desenvolvedores a descobri-lo; se encontrar algum problema ou tiver sugestões, fique à vontade para [abrir uma issue](https://github.com/HenryZhang-ZHY/dowse/issues).
