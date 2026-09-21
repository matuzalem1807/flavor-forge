# Flavor Forge

PROJETO: PLATAFORMA DE DELIVERY — PROTÓTIPO V1

1. OBJETIVO

Crie um protótipo funcional, moderno e responsivo de uma plataforma própria de delivery para UM único restaurante.

O objetivo é validar a experiência completa de compra e operação antes de transformar futuramente o sistema em uma plataforma SaaS multiempresa.

IMPORTANTE:

Esta primeira versão é para apenas um restaurante.

Não implementar múltiplos restaurantes, multi-tenant ou filiais nesta versão.

O nome, identidade visual, cardápio, produtos e configurações do restaurante devem ser editáveis pelo painel administrativo.

Não criar dados fixos diretamente no código quando eles puderem ser gerenciados pelo painel.

A aplicação deve ser estruturada de forma organizada para permitir evolução futura.

Não implementar funcionalidades futuras desnecessárias neste momento.

Priorizar um protótipo funcional, bonito, responsivo e navegável.

2. STACK

Utilize uma stack moderna e adequada para uma aplicação web profissional.

Preferencialmente:

Next.js

TypeScript

React

Tailwind CSS

PostgreSQL

Supabase para banco de dados, autenticação e armazenamento de imagens

Caso o ambiente não permita alguma dessas tecnologias, escolha alternativas equivalentes, mas mantenha a arquitetura organizada.

A interface deve ser:

Mobile-first

Responsiva

Rápida

Moderna

Intuitiva

Preparada para uso real em celulares

3. IDENTIDADE DO RESTAURANTE

O restaurante não deve possuir nome fixo no código.

Criar configurações editáveis:

Nome do restaurante

Logo

Imagem de capa

Descrição

Cor principal

Cor secundária

WhatsApp

Instagram

Endereço

Horário de funcionamento

Tempo médio de preparo

Status da loja

Criar inicialmente dados demonstrativos para um restaurante fictício.

Exemplo:

Nome: "João Burguer"

Porém o administrador deve conseguir alterar esse nome pelo painel.

As cores e identidade visual configuradas também devem refletir automaticamente na página pública.

4. ÁREA PÚBLICA DO CLIENTE

Criar uma página pública do restaurante.

Fluxo:

LINK DO RESTAURANTE ↓ PÁGINA DO RESTAURANTE ↓ CARDÁPIO ↓ PRODUTO ↓ OPÇÕES/ADICIONAIS ↓ CARRINHO ↓ CHECKOUT ↓ CONFIRMAÇÃO ↓ ACOMPANHAMENTO DO PEDIDO

O cliente deve conseguir navegar e montar o pedido sem criar uma conta.

5. PÁGINA INICIAL DO RESTAURANTE

Criar uma página moderna contendo:

Imagem de capa

Logo

Nome do restaurante

Descrição

Status aberto/fechado

Horário

WhatsApp

Instagram

Categorias do cardápio

Produtos em destaque

Lista de produtos

Exemplo de categorias:

Hambúrgueres

Combos

Porções

Bebidas

Sobremesas

A navegação entre categorias deve ser simples, especialmente no celular.

Criar carrinho fixo/visível no mobile quando houver produtos adicionados.

6. CATEGORIAS

O administrador deve conseguir:

Criar categoria

Editar categoria

Excluir categoria

Ativar/desativar categoria

Alterar ordem

Campos:

Nome

Imagem opcional

Ordem

Status

7. PRODUTOS

Cada produto deve possuir:

Nome

Foto

Descrição

Preço

Categoria

Código interno opcional

Disponível/indisponível

Destaque

Disponível para entrega

Disponível para retirada

Horário de disponibilidade opcional

Promoção opcional

Grupos de opções

Observação do cliente

O administrador deve conseguir:

Criar

Editar

Duplicar

Excluir

Ativar/desativar

Marcar como destaque

8. PROMOÇÕES

Permitir configurar:

Preço normal

Preço promocional

Data inicial

Data final

Quando a data final passar, a promoção deve deixar de ser aplicada automaticamente.

Exemplo:

Preço normal: R$ 29,90 Promoção: R$ 24,90

Exibir visualmente o preço promocional no cardápio.

9. GRUPOS DE OPÇÕES E ADICIONAIS

Criar um sistema genérico de opções.

Um produto pode possuir vários grupos.

Cada grupo deve permitir:

Nome

Obrigatório ou opcional

Mínimo de escolhas

Máximo de escolhas

Opções

Preço adicional por opção

Exemplo:

Produto:

"Macarrão ao molho branco"

Grupo:

"Escolha seus acompanhamentos"

Mínimo: 7 Máximo: 7 Obrigatório: SIM

Opções:

Bacon + R$ 5

Queijo + R$ 3

Frango + R$ 6

Milho + R$ 0

Ervilha + R$ 0

Batata + R$ 0

O cliente não pode adicionar o produto ao carrinho enquanto não cumprir as regras.

Também permitir grupos como:

"Adicionais"

Mínimo: 0 Máximo: 3 Obrigatório: NÃO

10. COMBOS

Permitir criar combos de forma controlada.

Um combo pode possuir:

Nome

Foto

Descrição

Preço

Produtos relacionados

Grupos de opções

Evitar estruturas infinitas ou circulares de combos.

11. CARRINHO

Criar carrinho completo.

Cada item deve guardar:

Produto

Quantidade

Preço no momento da adição

Opções escolhidas

Valores adicionais

Observação

Subtotal

Funcionalidades:

Aumentar quantidade

Diminuir quantidade

Remover item

Editar configuração do produto

Continuar comprando

Adicionar observação geral

Visualizar subtotal

Visualizar taxa de entrega

Visualizar total

Se o mesmo produto for adicionado com configurações diferentes, manter como linhas separadas.

12. CHECKOUT

O cliente não precisa criar conta para realizar um pedido.

Campos obrigatórios:

Nome

Telefone

Se escolher ENTREGA:

CEP

Rua

Número

Complemento

Bairro

Cidade

Estado

Referência

Se escolher RETIRADA:

Não exigir endereço de entrega.

13. ENTREGA OU RETIRADA

No checkout permitir:

ENTREGA

ou

RETIRADA NO RESTAURANTE

Se retirada:

Taxa de entrega = R$ 0

Não exigir endereço de entrega

14. TAXA DE ENTREGA

A loja deve conseguir configurar suas próprias faixas.

Exemplo:

0–2 km → R$ 5 2–4 km → R$ 7 4–6 km → R$ 10 6–8 km → R$ 13

Permitir configurar:

Entrega ativada/desativada

Distância máxima

Pedido mínimo

Valor mínimo para frete grátis

Faixas de distância

Valor de cada faixa

O sistema deve calcular a distância da entrega e encontrar a faixa correspondente.

IMPORTANTE:

Nunca inventar uma taxa.

Se a distância não estiver coberta por uma faixa configurada, impedir a finalização e informar que o endereço está fora da área de entrega.

Para o protótipo, caso uma API de mapas ainda não esteja configurada, criar uma camada de serviço preparada para integração futura e utilizar uma simulação controlada para desenvolvimento.

15. PAGAMENTOS

Criar as opções:

ONLINE:

Pix

Cartão

NA ENTREGA:

Dinheiro

Cartão

Para dinheiro:

Perguntar:

"Troco para quanto?"

Separar completamente:

STATUS DO PEDIDO

de

STATUS DO PAGAMENTO.

Status de pagamento:

PENDING

PAID

FAILED

REFUND_REQUESTED

REFUND_PENDING

REFUNDED

Não marcar pagamento como reembolsado sem confirmação.

Nesta primeira versão, se a integração real de gateway não estiver disponível, criar uma camada de pagamento simulada claramente separada da aplicação principal.

16. PEDIDOS

Fluxo para entrega:

NOVO → ACEITO → EM PREPARAÇÃO → PRONTO → SAIU PARA ENTREGA → ENTREGUE

Fluxo para retirada:

NOVO → ACEITO → EM PREPARAÇÃO → PRONTO PARA RETIRADA → RETIRADO

Também:

CANCELADO

Cada mudança de status deve registrar:

Status

Data/hora

Usuário responsável

17. ACEITAÇÃO DE PEDIDOS

Criar configuração:

ACEITAÇÃO MANUAL

ou

ACEITAÇÃO AUTOMÁTICA

Manual:

Novo pedido → administrador aceita ou rejeita.

Se rejeitar, exigir motivo:

Loja fechando

Produto indisponível

Fora da área de entrega

Problema operacional

Outro

Automática:

Novo pedido → automaticamente entra em preparação.

18. ACOMPANHAMENTO DO PEDIDO

Depois da compra mostrar:

"Pedido #1048"

Linha do tempo:

🟢 Pedido recebido ⚪ Aceito ⚪ Em preparação ⚪ Pronto ⚪ Saiu para entrega ⚪ Entregue

Para retirada:

🟢 Pedido recebido ⚪ Em preparação ⚪ Pronto para retirada ⚪ Retirado

Criar um código/link de acompanhamento para permitir que um cliente sem conta acompanhe seu pedido.

19. CONTAS DOS CLIENTES

O cliente pode comprar como convidado.

Também poderá criar uma conta.

Cadastro:

Nome

Telefone

E-mail

Senha

A conta deve permitir:

Histórico de pedidos

Endereços salvos

Repetir pedido

Editar perfil

Não exigir e-mail para checkout de convidado.

20. ENDEREÇOS

O cliente pode possuir vários endereços.

Campos:

Apelido

CEP

Rua

Número

Complemento

Bairro

Cidade

Estado

Referência

Exemplo:

"Casa"

"Trabalho"

21. CONSENTIMENTO DE MARKETING

No cadastro/checkout, quando aplicável, permitir:

"☐ Aceito receber ofertas e novidades desta loja."

Salvar essa escolha separadamente.

Não considerar consentimento simplesmente por o cliente ter feito um pedido.

22. PAINEL ADMINISTRATIVO

Criar painel administrativo moderno.

Menu:

Dashboard

Pedidos

Cardápio

Clientes

Entrega

Configurações

23. DASHBOARD

Mostrar:

Pedidos hoje

Faturamento hoje

Ticket médio

Pedidos ativos

Produtos indisponíveis

Status da loja

Também mostrar pedidos recentes.

24. PEDIDOS NO ADMINISTRATIVO

Criar uma visualização clara dos pedidos.

Filtros:

Todos

Novos

Aceitos

Em preparação

Prontos

Em entrega

Entregues

Cancelados

Cada pedido deve mostrar:

Número

Cliente

Valor

Entrega/retirada

Forma de pagamento

Horário

Status

25. DETALHES DO PEDIDO

Mostrar:

Cliente:

Nome

Telefone

Produtos:

Produtos

Quantidades

Opções

Adicionais

Observações

Entrega:

Endereço

Distância

Taxa

Pagamento:

Método

Status

Também mostrar:

Histórico de status

Horários

Total

26. CLIENTES

Criar tela com:

Nome

Telefone

E-mail quando existir

Número de pedidos

Total gasto

Ticket médio

Último pedido

Perfil do cliente:

Dados

Endereços

Histórico

Produtos comprados

Total gasto

Criar segmentos automáticos:

Novo: 1 pedido

Recorrente: 2+ pedidos

VIP: limite configurável

Inativo: período configurável sem comprar

Filtros:

Frequência

Gasto

Recência

Produtos comprados

Nesta versão não criar automação de marketing.

27. CONFIGURAÇÃO DA LOJA

Permitir alterar:

Nome

Logo

Capa

Descrição

WhatsApp

Instagram

Endereço

Horários

Tempo médio de preparo

Status

Forma de aceitação dos pedidos

28. APARÊNCIA

Permitir:

Cor principal

Cor secundária

Logo

Capa

A página pública deve refletir essas configurações automaticamente.

Não criar um construtor de páginas.

O layout permanece padronizado.

29. HORÁRIOS

Permitir configurar:

Segunda

Terça

Quarta

Quinta

Sexta

Sábado

Domingo

Com horários individuais.

Permitir:

Aberto

Fechado

Pausar pedidos

Quando pausado, o cliente deve visualizar claramente:

"Estamos temporariamente sem aceitar pedidos."

30. USUÁRIOS ADMINISTRATIVOS

Criar inicialmente:

ADMINISTRADOR

e

FUNCIONÁRIO.

Administrador:

Acesso completo ao restaurante.

Funcionário:

Pode visualizar e processar pedidos.

Não pode alterar configurações críticas.

Preparar a estrutura para permissões mais granulares futuramente.

31. SEGURANÇA

Implementar desde o início:

Autenticação segura

Senhas armazenadas com hash seguro

Proteção de rotas

Validação no backend

Controle de autorização

Validação de dados

Proteção contra manipulação de preços pelo cliente

Não confiar em valores enviados pelo frontend

Não expor chaves secretas

Separar credenciais de ambiente

Registrar alterações administrativas importantes

IMPORTANTE:

O preço final deve ser recalculado/validado pelo servidor usando os dados oficiais do banco.

Nunca confiar simplesmente no preço enviado pelo navegador.

32. RESPONSIVIDADE

A aplicação deve funcionar muito bem em:

Celular

Tablet

Desktop

A experiência do cliente deve ser prioritariamente mobile-first.

O painel administrativo pode ter layout otimizado para desktop, mas também deve funcionar em celular.

33. EXPERIÊNCIA VISUAL

Criar um design:

Profissional

Moderno

Limpo

Comercial

Fácil de usar

Sem excesso de elementos

Priorizar:

Boa hierarquia visual

Cards de produtos

Botões claros

Tipografia legível

Espaçamento adequado

Feedback visual das ações

Estados de carregamento

Estados vazios

Mensagens de erro amigáveis

Não utilizar uma aparência genérica de sistema administrativo.

A página pública deve parecer um produto comercial real.

34. DADOS DEMONSTRATIVOS

Criar dados fictícios para permitir testar o sistema.

Exemplo:

Restaurante: "João Burguer"

Categorias:

Hambúrgueres

Combos

Porções

Bebidas

Sobremesas

Criar produtos suficientes para testar:

Produto simples

Produto com adicional opcional

Produto com escolha obrigatória

Produto com múltiplas escolhas

Combo

Produto promocional

Produto indisponível

35. ARQUITETURA

Organizar o projeto de maneira modular.

Separar claramente:

Componentes

Páginas

Serviços

Banco de dados

Autenticação

Pedidos

Cardápio

Clientes

Entrega

Pagamentos

Configurações

Não colocar toda a lógica em um único arquivo.

Criar componentes reutilizáveis.

36. BANCO DE DADOS

Criar estrutura para entidades como:

users

restaurant

categories

products

option_groups

options

combos

promotions

customers

customer_addresses

carts

orders

order_items

order_item_options

order_status_history

payments

delivery_settings

delivery_ranges

restaurant_hours

marketing_consents

Utilizar relacionamentos adequados.

Preços monetários devem ser armazenados de maneira segura para evitar problemas de precisão.

37. REGRAS IMPORTANTES

Cliente não precisa estar logado para comprar.

Produtos indisponíveis não podem ser adicionados ao pedido.

Produtos fora do horário de disponibilidade não podem ser pedidos.

Opções obrigatórias devem ser validadas.

Quantidades mínima/máxima devem ser respeitadas.

Taxa de entrega deve ser calculada de acordo com a configuração da loja.

O servidor deve recalcular os valores do pedido.

O cliente não pode alterar o preço através do navegador.

O pedido deve preservar o preço praticado no momento da compra.

Pedido e pagamento possuem estados independentes.

Alterações de status devem gerar histórico.

Cancelamentos devem registrar motivo.

O restaurante pode pausar pedidos.

A retirada não deve cobrar taxa de entrega.

A interface deve funcionar sem necessidade de aplicativo instalado.

38. O QUE NÃO IMPLEMENTAR AGORA

Não criar nesta versão:

Multiempresa

Multi-loja

Filiais

Marketplace

Aplicativo Android/iOS

Sistema de entregadores

Rastreamento GPS em tempo real

WhatsApp automático

E-mail automático

Programa de fidelidade

Cupons avançados

Estoque quantitativo

IA

BI avançado

Assinaturas SaaS

Planos pagos

Comissão da plataforma

Split de pagamento

Domínio personalizado

Sistema complexo de permissões

Esses recursos poderão ser adicionados posteriormente.

39. ORDEM DE DESENVOLVIMENTO

Não tente implementar tudo de uma vez.

Desenvolva em etapas:

ETAPA 1: Layout e página pública.

ETAPA 2: Categorias e produtos.

ETAPA 3: Produto + opções/adicionais.

ETAPA 4: Carrinho.

ETAPA 5: Checkout.

ETAPA 6: Criação do pedido.

ETAPA 7: Acompanhamento do pedido.

ETAPA 8: Login/cadastro.

ETAPA 9: Painel administrativo.

ETAPA 10: Gestão de pedidos.

ETAPA 11: Gestão de cardápio.

ETAPA 12: Clientes.

ETAPA 13: Entrega.

ETAPA 14: Configurações.

ETAPA 15: Testes e correções.

40. REGRA PRINCIPAL DE DESENVOLVIMENTO

Antes de avançar para uma nova etapa, garantir que a etapa anterior esteja funcional.

Não criar apenas telas estáticas.

Sempre que possível, conectar:

INTERFACE → LÓGICA → BANCO DE DADOS → VALIDAÇÃO → RESULTADO

O objetivo é terminar com um protótipo que realmente permita realizar um pedido completo.

Não adicionar funcionalidades que não foram solicitadas.

Quando houver uma decisão técnica necessária que não esteja definida neste documento, escolha a alternativa mais simples, segura, escalável e profissional, sem alterar as regras de negócio estabelecidas.

Comece agora pela ETAPA 1 e construa a página pública do restaurante com dados demonstrativos.

Depois de concluir, mostre o resultado e aguarde antes de avançar para a próxima etapa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/91d9d3e7-8012-55f4-824d-32d0504344a4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
