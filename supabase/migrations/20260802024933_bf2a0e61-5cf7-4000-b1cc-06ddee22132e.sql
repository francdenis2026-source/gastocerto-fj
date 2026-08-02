-- Adiciona as novas categorias ao catálogo global para futuros usuários
UPDATE public.app_settings 
SET value = value || '[
  {"name": "Açougue", "type": "expense", "icon": "meat", "color": "#ef4444"},
  {"name": "Sorveteria", "type": "expense", "icon": "ice-cream", "color": "#f472b6"},
  {"name": "Bebidas", "type": "expense", "icon": "beer", "color": "#3b82f6"},
  {"name": "Lanche", "type": "expense", "icon": "sandwich", "color": "#f59e0b"},
  {"name": "Sopas", "type": "expense", "icon": "bowl-soup", "color": "#84cc16"},
  {"name": "Churrasco", "type": "expense", "icon": "flame", "color": "#dc2626"},
  {"name": "Alimentos regionais", "type": "expense", "icon": "map-pin", "color": "#22c55e"}
]'::jsonb
WHERE key = 'category_catalog';

-- Atualiza a função que cria as categorias padrão para incluir as novas opções
CREATE OR REPLACE FUNCTION public.create_default_categories(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  item record;
  catalog jsonb;
BEGIN
  SELECT value INTO catalog FROM public.app_settings WHERE key = 'category_catalog';

  IF catalog IS NOT NULL AND jsonb_typeof(catalog) = 'array' THEN
    FOR item IN
      SELECT
        (e ->> 'name') AS name,
        COALESCE(e ->> 'type', 'expense') AS type,
        COALESCE(e ->> 'icon', 'circle-ellipsis') AS icon,
        COALESCE(e ->> 'color', '#94a3b8') AS color
      FROM jsonb_array_elements(catalog) AS e
    LOOP
      IF item.name IS NULL OR length(btrim(item.name)) = 0 THEN
        CONTINUE;
      END IF;
      INSERT INTO public.categories (user_id, name, type, icon, color, is_default)
      SELECT _user_id, item.name, item.type::category_type, item.icon, item.color, true
      WHERE NOT EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.user_id = _user_id AND lower(c.name) = lower(item.name) AND c.type = item.type::category_type
      );
    END LOOP;
    RETURN;
  END IF;

  -- Fallback se o catálogo não existir
  FOR item IN
    SELECT * FROM (VALUES
      ('Alimentação','utensils','#f97316'),
      ('Feira','carrot','#22c55e'),
      ('Supermercado','shopping-cart','#16a34a'),
      ('Açougue','meat','#ef4444'),
      ('Sorveteria','ice-cream','#f472b6'),
      ('Bebidas','beer','#3b82f6'),
      ('Lanche','sandwich','#f59e0b'),
      ('Sopas','bowl-soup','#84cc16'),
      ('Churrasco','flame','#dc2626'),
      ('Alimentos regionais','map-pin','#22c55e'),
      ('Restaurantes','chef-hat','#fb7185'),
      ('Delivery','bike','#f43f5e'),
      ('Combustível','fuel','#ef4444'),
      ('Gás','flame','#f59e0b'),
      ('Moradia','home','#3b82f6'),
      ('Internet','wifi','#6366f1'),
      ('Saúde','heart-pulse','#ec4899'),
      ('Mesada','piggy-bank','#f59e0b'),
      ('Lazer','party-popper','#a855f7'),
      ('Outros','circle-ellipsis','#94a3b8')
    ) AS t(name, icon, color)
  LOOP
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default)
    SELECT _user_id, item.name, 'expense', item.icon, item.color, true
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.user_id = _user_id AND lower(c.name) = lower(item.name) AND c.type = 'expense'
    );
  END LOOP;
END;
$function$;
