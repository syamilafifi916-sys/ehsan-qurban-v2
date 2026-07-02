import { supabaseAdmin } from '../lib/supabase.js';
import { send } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const { slug = 'sdikb', cow_id, name, phone, email, payment_plan = 'full', installment_months } = req.body || {};
    if (!cow_id || !name || !phone) return send(res, 400, { error: 'Cow, name and phone required' });

    const supabase = supabaseAdmin();
    const { data: org } = await supabase.from('organisations').select('*').eq('slug', slug).single();
    if (!org) return send(res, 404, { error: 'Organisation not found' });

    const { data: cow } = await supabase
      .from('cows')
      .select('id,max_slots,status,participants(id,status)')
      .eq('id', cow_id)
      .eq('organisation_id', org.id)
      .single();

    if (!cow || cow.status !== 'open') return send(res, 400, { error: 'Kumpulan tidak tersedia' });

    const approvedCount = (cow.participants || []).filter(p => p.status === 'approved').length;
    const pendingCount = (cow.participants || []).filter(p => p.status === 'pending').length;
    if (approvedCount + pendingCount >= cow.max_slots) {
      return send(res, 409, { error: 'Maaf, kumpulan ini baru sahaja penuh. Sila pilih kumpulan lain.' });
    }

    const { data, error } = await supabase.from('participants').insert({
      organisation_id: org.id,
      cow_id,
      name: name.trim(),
      phone: phone.trim(),
      email: email || null,
      payment_plan,
      installment_months: installment_months || null,
      status: 'pending'
    }).select('*').single();

    if (error) throw error;
    return send(res, 201, { participant: data });
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
}
