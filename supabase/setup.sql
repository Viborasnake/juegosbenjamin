-- Contenido educativo público y sin datos personales.
create table if not exists public.learning_items (
  id bigint primary key generated always as identity,
  game text not null check (game in ('vowels', 'alphabet', 'numbers', 'animals', 'vehicles', 'food', 'emotions')),
  symbol text not null,
  spoken_text text not null,
  position smallint not null check (position > 0),
  unique (game, symbol),
  unique (game, position)
);

alter table public.learning_items drop constraint if exists learning_items_game_check;
alter table public.learning_items add constraint learning_items_game_check
  check (game in ('vowels', 'alphabet', 'numbers', 'animals', 'vehicles', 'food', 'emotions'));

alter table public.learning_items enable row level security;
revoke all on table public.learning_items from anon, authenticated;
grant select on table public.learning_items to anon, authenticated;

drop policy if exists "Learning items are publicly readable" on public.learning_items;
create policy "Learning items are publicly readable"
  on public.learning_items for select to anon, authenticated using (true);

insert into public.learning_items (game, symbol, spoken_text, position)
values
  ('vowels', 'A', 'a', 1), ('vowels', 'E', 'e', 2), ('vowels', 'I', 'i', 3),
  ('vowels', 'O', 'o', 4), ('vowels', 'U', 'u', 5),
  ('alphabet', 'A', 'a', 1), ('alphabet', 'B', 'be', 2), ('alphabet', 'C', 'ce', 3),
  ('alphabet', 'D', 'de', 4), ('alphabet', 'E', 'e', 5), ('alphabet', 'F', 'efe', 6),
  ('alphabet', 'G', 'ge', 7), ('alphabet', 'H', 'hache', 8), ('alphabet', 'I', 'i', 9),
  ('alphabet', 'J', 'jota', 10), ('alphabet', 'K', 'ka', 11), ('alphabet', 'L', 'ele', 12),
  ('alphabet', 'M', 'eme', 13), ('alphabet', 'N', 'ene', 14), ('alphabet', 'Ñ', 'eñe', 15),
  ('alphabet', 'O', 'o', 16), ('alphabet', 'P', 'pe', 17), ('alphabet', 'Q', 'cu', 18),
  ('alphabet', 'R', 'erre', 19), ('alphabet', 'S', 'ese', 20), ('alphabet', 'T', 'te', 21),
  ('alphabet', 'U', 'u', 22), ('alphabet', 'V', 'uve', 23), ('alphabet', 'W', 'doble uve', 24),
  ('alphabet', 'X', 'equis', 25), ('alphabet', 'Y', 'y griega', 26), ('alphabet', 'Z', 'zeta', 27),
  ('numbers', '1', 'uno', 1), ('numbers', '2', 'dos', 2), ('numbers', '3', 'tres', 3),
  ('numbers', '4', 'cuatro', 4), ('numbers', '5', 'cinco', 5), ('numbers', '6', 'seis', 6),
  ('numbers', '7', 'siete', 7), ('numbers', '8', 'ocho', 8), ('numbers', '9', 'nueve', 9),
  ('numbers', '10', 'diez', 10), ('numbers', '11', 'once', 11), ('numbers', '12', 'doce', 12),
  ('animals', '🐶', 'perro', 1), ('animals', '🐱', 'gato', 2), ('animals', '🐮', 'vaca', 3),
  ('animals', '🐷', 'chancho', 4), ('animals', '🐴', 'caballo', 5), ('animals', '🐑', 'oveja', 6),
  ('animals', '🐘', 'elefante', 7), ('animals', '🦁', 'león', 8), ('animals', '🐵', 'mono', 9), ('animals', '🐸', 'rana', 10),
  ('vehicles', '🚗', 'auto', 1), ('vehicles', '🚌', 'autobús', 2), ('vehicles', '🚂', 'tren', 3),
  ('vehicles', '🚲', 'bicicleta', 4), ('vehicles', '✈️', 'avión', 5), ('vehicles', '🚁', 'helicóptero', 6),
  ('vehicles', '🚢', 'barco', 7), ('vehicles', '🚜', 'tractor', 8), ('vehicles', '🚒', 'camión de bomberos', 9), ('vehicles', '🏍️', 'moto', 10),
  ('food', '🍎', 'manzana', 1), ('food', '🍌', 'plátano', 2), ('food', '🍓', 'frutilla', 3),
  ('food', '🍊', 'naranja', 4), ('food', '🍇', 'uva', 5), ('food', '🍉', 'sandía', 6),
  ('food', '🥕', 'zanahoria', 7), ('food', '🍅', 'tomate', 8), ('food', '🌽', 'choclo', 9), ('food', '🥔', 'papa', 10),
  ('emotions', '😄', 'feliz', 1), ('emotions', '😢', 'triste', 2), ('emotions', '😠', 'enojado', 3),
  ('emotions', '😨', 'asustado', 4), ('emotions', '😲', 'sorprendido', 5), ('emotions', '😴', 'cansado', 6),
  ('emotions', '🥰', 'cariño', 7), ('emotions', '😳', 'tímido', 8), ('emotions', '😂', 'risa', 9), ('emotions', '😌', 'tranquilo', 10)
on conflict (game, symbol) do update
set spoken_text = excluded.spoken_text, position = excluded.position;
