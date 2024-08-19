import { FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../utils/supabaseClient';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    // Get the session from Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    return reply.status(500).send({ message: 'Internal server error' });
  }
}
