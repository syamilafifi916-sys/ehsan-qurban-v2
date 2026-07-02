import { supabaseAdmin } from '../lib/supabase.js';
import { send } from '../lib/auth.js';

export default async function handler(req, res) {
  try {
    const supabase = supabaseAdmin();
    const slug = req.query.slug || 'sdikb';

    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .select('*')
      .eq('slug', slug)
      .single();
    if (orgError || !org) return send(res, 404, { error: 'Organisation not found' });

    const { data: cows, error } = await supabase
      .from('cows')
      .select('id,cow_no,group_name,max_slots,status,participants(id,name,status)')
      .eq('organisation_id', org.id)
      .order('cow_no', { ascending: true });
    if (error) throw error;

    const rows = cows.map(c => {
      const approved = (c.participants || []).filter(p => p.status === 'approved');
      return {
        id: c.id,
        cow_no: c.cow_no,
        group_name: c.group_name,
        max_slots: c.max_slots,
        filled_slots: approved.length,
        available_slots: Math.max(0, c.max_slots - approved.length),
        is_available: c.status === 'open' && approved.length < c.max_slots,
        participants: approved.map(p => ({ name: p.name }))
      };
    });

    return send(res, 200, { organisation: org, cows: rows });
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
}
