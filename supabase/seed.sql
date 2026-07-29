-- Seed inicial L.A. Controle (cadastros + veículos)
-- Rode após schema.sql

insert into public.fleet (id, nome, foto, ativo) values
    ('UNO', 'UNO VIVACE', 'https://i.ibb.co/4Lq2XH7/UNO.jpg', true),
    ('MONTANA', 'MONTANA', 'https://i.ibb.co/Lht7bLY1/montanta.jpg', true)
on conflict (id) do update set nome = excluded.nome, foto = excluded.foto, ativo = excluded.ativo;

insert into public.motoristas (id, nome, ativo) values
    ('marco', 'Marco', true),
    ('fabio', 'Fabio', true)
on conflict (id) do update set nome = excluded.nome, ativo = excluded.ativo;

insert into public.vehicles (id, status, odometer) values
    ('UNO', 'DISPONÍVEL', 0),
    ('MONTANA', 'DISPONÍVEL', 0)
on conflict (id) do nothing;

insert into public.unidades (id, nome, nome_curto, endereco, lat, lng, matriz, parada_rota) values
    ('moema', 'L.A. Moema', 'Moema', 'Av. dos Imarés, 398 — Moema, SP', -23.612783, -46.665663, true, false),
    ('vila-olimpia', 'Stuttgart — Vila Olímpia', 'Stuttgart', 'Av. Dr. Cardoso de Melo, 1507 — Vila Olímpia, SP', -23.5970601, -46.6878637, false, true),
    ('mclaren', 'McLaren', 'McLaren', 'R. Clodomiro Amazonas, 1000 — Vila Nova Conceição, SP', -23.5930138, -46.6773446, false, true),
    ('hub', 'HUB', 'HUB', 'Av. das Nações Unidas, 16.427 — Várzea de Baixo, SP', -23.6352384, -46.7182594, false, true)
on conflict (id) do nothing;

-- Perfis: após criar usuários em Authentication, rode (substitua UUID e e-mail):
-- insert into public.profiles (id, email, role) values
--   ('uuid-do-motorista', 'motorista@la.com', 'motorista'),
--   ('uuid-do-gestor', 'gestor@la.com', 'gestor');
