# Etapa 5 — Checkout

## Objetivo
Criar o checkout completo antes da gravação do pedido, com regras diferentes para entrega e retirada.

## Entrega
- Ligar “Continuar” do carrinho à nova tela `/checkout`.
- Solicitar nome e telefone obrigatórios.
- Oferecer Entrega e Retirada; retirada não pede endereço e sempre tem taxa zero.
- Para entrega, solicitar CEP, rua, número, complemento, bairro, cidade, estado e referência.
- Incluir uma simulação controlada de distância para testar as faixas informadas: 0–2 km por R$ 5,00; 2–4 km por R$ 7,00; 4–6 km por R$ 10,00; 6–8 km por R$ 13,00; acima de 8 km bloqueado.
- Oferecer pagamento online por Pix ou Cartão, e pagamento na entrega por Dinheiro ou Cartão.
- Ao escolher Dinheiro, perguntar “Troco para quanto?” e validar o valor contra o total.
- Exibir subtotal, taxa e total, além do consentimento opcional de ofertas separado do pedido.
- Validar os campos e mostrar um resumo pronto para a criação do pedido na Etapa 6, sem gravá-lo ainda.

## Dados
- Criar as configurações e faixas de entrega no banco com leitura pública e valores em centavos.
- Inserir exatamente as faixas aprovadas, sem faixa acima de 8 km.

## Validação
- Testar retirada, entrega dentro da área, endereço fora da área e pagamento em dinheiro.
- Verificar persistência do carrinho, cálculos, tela móvel e erros do navegador.
