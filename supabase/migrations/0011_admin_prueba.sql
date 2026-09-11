-- 0011 · Rol de administrador para pruebas
--
-- Le da el rol 'admin' a una cuenta existente para poder probar el panel
-- de administración con ella. Si la cuenta no existe todavía (ej. en el
-- Postgres vacío del CI), el UPDATE simplemente no afecta filas: idempotente
-- y seguro en cualquier entorno.

update public.users
set roles = array['admin', 'client']
where email = 'jespinalmontenegro@gmail.com'
  and not ('admin' = any(roles));
