import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAdmin, send } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const current = requireAdmin(req);
    if (current.role !== 'super_admin') return send(res, 403, { error: 'Only Super Admin can add admin users' });

    const { name, email, password, role = 'admin' } = req.body || {};
    if (!name || !email || !password) return send(res, 400, { error: 'Name, email and password required' });

    const password_hash = await bcrypt.hash(password, 12);
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from('admins').insert({
      organisation_id: current.organisation_id,
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role
    }).select('id,name,email,role,status,created_at').single();

    if (error) throw error;
    return send(res, 201, { admin: data });
  } catch (err) {
    return send(res, err.message === 'Unauthorized' ? 401 : 500, { error: err.message });
  }
}
