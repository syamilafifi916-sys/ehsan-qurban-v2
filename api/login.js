import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabase.js';
import { signAdmin, send } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) return send(res, 400, { error: 'Email and password required' });

    const supabase = supabaseAdmin();
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'active')
      .single();

    if (error || !admin) return send(res, 401, { error: 'Invalid login' });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return send(res, 401, { error: 'Invalid login' });

    await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', admin.id);

    return send(res, 200, {
      token: signAdmin(admin),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
}
