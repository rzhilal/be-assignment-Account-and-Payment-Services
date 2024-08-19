import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const registerUser = async (username: string, password: string, email: string) => {
    const password_hash = await bcrypt.hash(password, 10);
    return await prisma.user.create({
      data: { username, password_hash, email },
    });
};