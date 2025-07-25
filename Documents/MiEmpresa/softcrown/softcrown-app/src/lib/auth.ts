// Authentication service and utilities
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  AuthState,
  SessionData,
  CSRFToken 
} from '@/types/auth';

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  confirmPassword: z.string(),
  company: z.string().optional(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Token requerido'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Token generation and verification
export const generateTokens = (user: User): AuthTokens => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'softcrown',
    audience: 'softcrown-app',
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'softcrown',
      audience: 'softcrown-app',
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
    tokenType: 'Bearer',
  };
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'softcrown',
      audience: 'softcrown-app',
    });
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'softcrown',
      audience: 'softcrown-app',
    });
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
};

// CSRF Token utilities
export const generateCSRFToken = (): CSRFToken => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, expiresAt };
};

export const verifyCSRFToken = (token: string, storedToken: string, expiresAt: Date): boolean => {
  if (new Date() > expiresAt) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
};

// Session utilities
export const createSession = (user: User, ipAddress: string, userAgent: string): SessionData => {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    lastActivity: new Date(),
    ipAddress,
    userAgent,
  };
};

export const isSessionValid = (session: SessionData, maxAge: number = 24 * 60 * 60 * 1000): boolean => {
  const now = new Date();
  const sessionAge = now.getTime() - session.lastActivity.getTime();
  return sessionAge < maxAge;
};

// Email verification utilities
export const generateEmailVerificationToken = (email: string): string => {
  const payload = { email, type: 'email-verification' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyEmailVerificationToken = (token: string): { email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'email-verification') {
      throw new Error('Token inválido');
    }
    return { email: decoded.email };
  } catch (error) {
    throw new Error('Token de verificación inválido o expirado');
  }
};

// Password reset utilities
export const generatePasswordResetToken = (email: string): string => {
  const payload = { email, type: 'password-reset' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyPasswordResetToken = (token: string): { email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'password-reset') {
      throw new Error('Token inválido');
    }
    return { email: decoded.email };
  } catch (error) {
    throw new Error('Token de recuperación inválido o expirado');
  }
};

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Authentication service class
export class AuthService {
  private static instance: AuthService;
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Mock user database (in production, this would be a real database)
  private users: User[] = [
    {
      id: '1',
      email: 'admin@softcrown.com',
      name: 'Admin SoftCrown',
      role: 'admin',
      company: 'SoftCrown',
      phone: '+34 123 456 789',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      emailVerified: true,
      isActive: true,
      lastLogin: new Date(),
      projects: [],
    },
    {
      id: '2',
      email: 'cliente@ejemplo.com',
      name: 'Cliente Ejemplo',
      role: 'client',
      company: 'Empresa Ejemplo',
      phone: '+34 987 654 321',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      emailVerified: true,
      isActive: true,
      lastLogin: new Date(),
      projects: [],
    },
  ];

  async login(credentials: LoginCredentials, ipAddress: string): Promise<{ user: User; tokens: AuthTokens }> {
    const identifier = `${credentials.email}:${ipAddress}`;
    
    if (!this.rateLimiter.isAllowed(identifier)) {
      throw new Error('Demasiados intentos de login. Intenta de nuevo más tarde.');
    }

    // Validate input
    const validatedData = loginSchema.parse(credentials);

    // Find user
    const user = this.users.find(u => u.email === validatedData.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new Error('Cuenta desactivada. Contacta con soporte.');
    }

    if (!user.emailVerified) {
      throw new Error('Email no verificado. Revisa tu bandeja de entrada.');
    }

    // In production, verify password hash
    // const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);
    // For demo purposes, we'll accept any password
    const isValidPassword = true;

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Reset rate limiter on successful login
    this.rateLimiter.reset(identifier);

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const tokens = generateTokens(user);

    return { user, tokens };
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === validatedData.email);
    if (existingUser) {
      throw new Error('Ya existe una cuenta con este email');
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email: validatedData.email,
      name: validatedData.name,
      role: 'client',
      company: validatedData.company,
      phone: validatedData.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      isActive: true,
      projects: [],
    };

    // Add to users array (in production, save to database)
    this.users.push(newUser);

    // Generate tokens
    const tokens = generateTokens(newUser);

    return { user: newUser, tokens };
  }

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    // Validate input
    const validatedData = forgotPasswordSchema.parse({ email });

    // Find user
    const user = this.users.find(u => u.email === validatedData.email);
    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.' };
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken(validatedData.email);

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { 
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
      token: resetToken // Only for demo purposes
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Verify token
    const { email } = verifyPasswordResetToken(token);

    // Find user
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password (in production, update in database)
    user.updatedAt = new Date();

    return { message: 'Contraseña actualizada correctamente' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // Verify token
    const { email } = verifyEmailVerificationToken(token);

    // Find user
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Update email verification status
    user.emailVerified = true;
    user.updatedAt = new Date();

    return { message: 'Email verificado correctamente' };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = this.users.find(u => u.id === decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    // Generate new tokens
    return generateTokens(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  async deactivateUser(id: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.isActive = false;
    user.updatedAt = new Date();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
