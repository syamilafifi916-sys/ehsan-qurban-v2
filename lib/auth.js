import jwt from 'jsonwebtoken';

export function signAdmin(admin) {
  return jwt.sign({
    id: admin.id,
    organisation_id: admin.organisation_id,
    role: admin.role,
    email: admin.email
  }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

export function requireAdmin(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function send(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
