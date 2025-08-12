import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { generatePartnerCodes } from '../utils/generatePromoCode.js';
import visitLog from '../models/visitLog.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


export const register = async (req, res) => {
  const { name, email, password, wantsToBePartner, referralCodeOrLink } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "user";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    if (referralCodeOrLink) {

      let code = referralCodeOrLink;

      if (referralCodeOrLink.includes('/')) {
        const parts = referralCodeOrLink.split('/');
        code = parts[parts.length - 1];
      }

      const partner = await User.findOne({ promoCode: code, role: 'partner' });
      if (partner) {
        newUser.referredBy = partner._id;
      } else {
        return res.status(400).json({ message: 'Invalid referral code or link' });
      }
    }

    const visitId = req.cookies?.refVisitId;
    if (visitId) {
      const visit = await visitLog.findById(visitId);
      if (visit && !visit.converted) {
        visit.converted = true;
        visit.convertedUser = newUser._id;
        await visit.save();
      }
    }

    if (wantsToBePartner) {
      const partnerData = await generatePartnerCodes(User);
      role = "partner";
      newUser.role = role;
      newUser.promoCode = partnerData.promoCode;
      newUser.promoLink = partnerData.promoLink;
    }

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        promoCode: newUser.promoCode,
        promoLink: newUser.promoLink,
        referredBy: newUser.referredBy 
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        promoLink: user.promoLink
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const becomePartner = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'partner') {
      return res.status(400).json({ message: 'Already a partner' });
    }

    const partnerData = await generatePartnerCodes(User);

    user.role = 'partner';
    user.promoCode = partnerData.promoCode;
    user.promoLink = partnerData.promoLink;

    await user.save();

    res.json({
      message: 'You are now a partner!',
      promoCode: partnerData.promoCode,
      promoLink: partnerData.promoLink
    });
  } catch (err) {
    console.error('Become partner error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const userDetails= async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/partner/referrals
export const getPartnerReferrals = async (req, res) => {
  try {
    const partnerId = req.user.id;

    // Confirm user is partner or admin
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find users referred by this partner
    const referrals = await User.find({ referredBy: partnerId })
      .select('name email createdAt')  // select fields you want to show
      .sort({ createdAt: -1 }); // newest first

    const count = referrals.length;

    res.json({ count, referrals });
  } catch (err) {
    console.error('Error fetching referrals:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
