import { FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../utils/supabaseClient';
import { registerUser, getUserAccountsAndTransactions } from '../service/userService';

export async function registerUserController(request: FastifyRequest, reply: FastifyReply) {
    const { username, password, email } = request.body as { username: string; password: string; email: string };

    try {
        // Panggil service untuk mendaftarkan pengguna
        const user = await registerUser(username, password, email);

        // Logging informasi registrasi pengguna
        request.server.log.info(`User registered successfully: ${user.username}`);

        return reply.status(201).send(user);
    } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
    }
}

export async function loginUserController(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    try {
        // Melakukan autentikasi pengguna dengan Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            request.server.log.error(`Login failed for user ${email}: ${error.message}`);
            return reply.status(401).send({ message: 'Invalid email or password' });
        }

        // Logging informasi login berhasil
        request.server.log.info(`User logged in successfully: ${email}`);

        // Mengembalikan data pengguna dan token autentikasi
        return reply.status(200).send({
            user: data.user,
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
        });
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function getUserAccountsAndTransactionsController(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await getUserAccountsAndTransactions();
      return reply.status(200).send(data);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
}