-- Only admin-scoped storage policies remain (no end-user uploads exist).
drop policy if exists storage_objects_owner_select on storage.objects;
drop policy if exists storage_objects_owner_insert on storage.objects;
drop policy if exists storage_objects_owner_update on storage.objects;
drop policy if exists storage_objects_owner_delete on storage.objects;
