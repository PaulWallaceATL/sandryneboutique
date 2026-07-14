-- Allow admins to remove newsletter subscribers from the admin UI.
create policy "Admins can delete subscribers"
  on public.newsletter_subscribers for delete
  using (private.is_admin());
