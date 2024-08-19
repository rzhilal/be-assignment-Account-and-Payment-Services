import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { supabase } from '../utils/supabaseClient';

const prisma = new PrismaClient();

export const registerUser = async (username: string, password: string, email: string) => {
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Register user with Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (supabaseError) {
        throw new Error(`Failed to register user with Supabase: ${supabaseError.message}`);
    }

    // Save user to Prisma
    const user = await prisma.user.create({
        data: {
            user_id: supabaseUser?.user?.id || '', // Use Supabase user ID
            username,
            password_hash,
            email,
        },
    });

    // Return user data including Supabase ID
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        supabaseUserId: supabaseUser?.user?.id, // Supabase user ID
    };
};
