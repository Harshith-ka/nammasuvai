import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

// Helper to generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const cleanAndValidatePhone = (phone?: string): string | null => {
  if (!phone) return null;
  const digits = phone.toString().replace(/\D/g, '');
  let cleaned = digits;
  if (digits.length === 11 && digits.startsWith('0')) cleaned = digits.slice(-10);
  if (digits.length === 12 && digits.startsWith('91')) cleaned = digits.slice(-10);
  
  if (!/^\d{10}$/.test(cleaned)) {
    return null;
  }
  return cleaned;
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const validPhone = cleanAndValidatePhone(req.body.phone);
  if (!validPhone) {
    res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    return;
  }
  const phone = validPhone;
  
  // Mock OTP for MVP
  const otp = '123456';
  console.log(`[Mock] OTP for ${phone} is ${otp}`);

  res.status(200).json({ message: 'OTP sent successfully (Check server logs)' });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { otp } = req.body;
  const validPhone = cleanAndValidatePhone(req.body.phone);
  if (!validPhone) {
    res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    return;
  }
  const phone = validPhone;
  
  if (otp !== '123456') {
    res.status(400).json({ message: 'Invalid OTP' });
    return;
  }

  let user = await User.findOne({ phone });
  
  if (!user) {
    res.status(200).json({ message: 'OTP verified, please complete signup', isNewUser: true });
    return;
  }

  res.status(200).json({
    message: 'Login successful',
    isNewUser: false,
    token: generateToken(user._id as unknown as string),
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role
    }
  });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const validPhone = cleanAndValidatePhone(req.body.phone);
  if (!validPhone) {
    res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    return;
  }
  const phone = validPhone;

  try {
    const userExists = await User.findOne({ phone });
    if (userExists) {
      res.status(400).json({ message: 'User with this phone already exists' });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Signup successful',
      token: generateToken(user._id as unknown as string),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body;
  const rawInput = (phone || "").toString().trim();

  let query: any;
  const validPhone = cleanAndValidatePhone(rawInput);

  if (validPhone) {
    query = { phone: validPhone };
  } else if (rawInput.toLowerCase() === 'admin' || rawInput.toLowerCase() === 'admin@organichub.com') {
    query = { $or: [{ role: 'admin' }, { email: 'admin@organichub.com' }] };
  } else {
    res.status(400).json({ message: 'Please enter a valid 10-digit phone number or admin credentials' });
    return;
  }

  try {
    const user = await User.findOne(query);
    
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        message: 'Login successful',
        token: generateToken(user._id as unknown as string),
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid phone/identifier or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
