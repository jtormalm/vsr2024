
export const load = async ({ parent }) => {
  const { supabase, session } = await parent()

  const { data: players } = await supabase.from('player').select('*')
  const { data: matches } = await supabase.from('match').select('*')

  return {
    players:players ?? [],
    matches:matches ?? [],
    session,
  }
}
