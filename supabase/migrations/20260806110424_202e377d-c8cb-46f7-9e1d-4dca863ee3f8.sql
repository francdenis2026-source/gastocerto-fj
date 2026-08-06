INSERT INTO public.app_settings (key, value, updated_at)
VALUES ('category_catalog', '[
    {"name": "Esposa / Esposo", "type": "expense", "icon": "heart-pulse", "color": "#ec4899"},
    {"name": "Mãe / Pai / Avós", "type": "expense", "icon": "baby", "color": "#f97316"},
    {"name": "Tio / Sobrinho / Primos", "type": "expense", "icon": "hand-heart", "color": "#3b82f6"},
    {"name": "Amigos / Colegas", "type": "expense", "icon": "party-popper", "color": "#14b8a6"},
    {"name": "Aniversários", "type": "expense", "icon": "cake", "color": "#eab308"},
    {"name": "Confraternizações", "type": "expense", "icon": "utensils", "color": "#22c55e"}
]'::jsonb, now())
ON CONFLICT (key) DO UPDATE 
SET value = (
    SELECT jsonb_agg(elem)
    FROM (
        SELECT elem FROM jsonb_array_elements(public.app_settings.value) AS elem
        UNION
        SELECT elem FROM jsonb_array_elements('[
            {"name": "Esposa / Esposo", "type": "expense", "icon": "heart-pulse", "color": "#ec4899"},
            {"name": "Mãe / Pai / Avós", "type": "expense", "icon": "baby", "color": "#f97316"},
            {"name": "Tio / Sobrinho / Primos", "type": "expense", "icon": "hand-heart", "color": "#3b82f6"},
            {"name": "Amigos / Colegas", "type": "expense", "icon": "party-popper", "color": "#14b8a6"},
            {"name": "Aniversários", "type": "expense", "icon": "cake", "color": "#eab308"},
            {"name": "Confraternizações", "type": "expense", "icon": "utensils", "color": "#22c55e"}
        ]'::jsonb) AS elem
    ) AS combined
),
updated_at = now();