import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export interface LoginDTO {
  username: string;
  password: string;
}

export const authService = {
  async login(data: LoginDTO): Promise<{ success: boolean; user?: Omit<User, 'password'>; message?: string }> {
    try {
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username: data.username }
      });

      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  },

  async createUser(username: string, password: string, name: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name
      }
    });
  },

  async changePassword(username: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { username },
        data: { password: hashedPassword }
      });
      
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }
};
