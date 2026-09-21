REVOKE EXECUTE ON FUNCTION public.create_public_order(jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_order(jsonb) TO service_role;

ALTER TABLE public.customers DROP CONSTRAINT customers_user_id_fkey;

CREATE POLICY "Dados privados: clientes sem acesso direto"
  ON public.customers FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Dados privados: pedidos sem acesso direto"
  ON public.orders FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Dados privados: itens sem acesso direto"
  ON public.order_items FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Dados privados: opcoes dos itens sem acesso direto"
  ON public.order_item_options FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Dados privados: historico sem acesso direto"
  ON public.order_status_history FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Dados privados: pagamentos sem acesso direto"
  ON public.payments FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Dados privados: consentimentos sem acesso direto"
  ON public.marketing_consents FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);