import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabase.js';
import { send } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (req.headers['x-seed-key'] !== process.env.JWT_SECRET) return send(res, 403, { error: 'Forbidden' });

  try {
    const { name, email, password, slug = 'sdikb' } = req.body || {};
    if (!name || !email || !password) return send(res, 400, { error: 'Name, email and password required' });

    const supabase = supabaseAdmin();
    const { data: org } = await supabase.from('organisations').select('*').eq('slug', slug).single();
    if (!org) return send(res, 404, { error: 'Organisation not found' });

    const password_hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from('admins').upsert({
      organisation_id: org.id,
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'super_admin',
      status: 'active'
    }, { onConflict: 'email' }).select('id,name,email,role').single();

    if (error) throw error;
    return send(res, 200, { admin: data });
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
}
