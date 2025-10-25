"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MicroCertificate {
  id: string;
  skill: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  verificationUrl: string;
  blockchainHash?: string;
  qrCodeData: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

interface User {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  userType: 'artisan' | 'employer';
  avatarUrl: string;
  skills?: string[];
  endorsements?: string[];
  microCertificates?: MicroCertificate[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    } else {
      // Add sample micro-certificates for demo purposes
      const sampleCertificates: MicroCertificate[] = [
        {
          id: 'cert-1',
          skill: 'Handloom Weaving',
          issuer: 'Ministry of Textiles, India',
          issuedDate: '2024-01-15',
          expiryDate: '2027-01-15',
          verificationUrl: 'https://verify.artisanplatform.com/cert-1',
          blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
          qrCodeData: 'https://verify.artisanplatform.com/cert-1',
          description: 'Certified in traditional handloom weaving techniques including warp preparation, weft insertion, and pattern creation using traditional looms.',
          level: 'advanced'
        },
        {
          id: 'cert-2',
          skill: 'Pottery',
          issuer: 'National Institute of Design',
          issuedDate: '2024-02-20',
          expiryDate: '2027-02-20',
          verificationUrl: 'https://verify.artisanplatform.com/cert-2',
          blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          qrCodeData: 'https://verify.artisanplatform.com/cert-2',
          description: 'Advanced certification in pottery techniques including wheel throwing, glazing, and kiln firing for both functional and decorative ceramics.',
          level: 'expert'
        },
        {
          id: 'cert-3',
          skill: 'Block Printing',
          issuer: 'Craft Council of India',
          issuedDate: '2024-03-10',
          expiryDate: '2027-03-10',
          verificationUrl: 'https://verify.artisanplatform.com/cert-3',
          blockchainHash: '0x567890abcdef1234567890abcdef1234567890ab',
          qrCodeData: 'https://verify.artisanplatform.com/cert-3',
          description: 'Foundation certification in traditional block printing methods including design creation, block carving, and fabric printing techniques.',
          level: 'intermediate'
        },
        {
          id: 'cert-4',
          skill: 'Jewelry Making',
          issuer: 'Gemological Institute of India',
          issuedDate: '2024-04-05',
          expiryDate: '2027-04-05',
          verificationUrl: 'https://verify.artisanplatform.com/cert-4',
          blockchainHash: '0x90abcdef1234567890abcdef1234567890abcdef',
          qrCodeData: 'https://verify.artisanplatform.com/cert-4',
          description: 'Specialized certification in traditional jewelry crafting techniques including metalwork, stone setting, and traditional Indian jewelry designs.',
          level: 'advanced'
        },
        {
          id: 'cert-5',
          skill: 'Wood Carving',
          issuer: 'Indian Institute of Crafts & Design',
          issuedDate: '2024-05-12',
          expiryDate: '2027-05-12',
          verificationUrl: 'https://verify.artisanplatform.com/cert-5',
          blockchainHash: '0xcdef1234567890abcdef1234567890abcdef1234',
          qrCodeData: 'https://verify.artisanplatform.com/cert-5',
          description: 'Beginner certification in wood carving covering tool usage, basic carving techniques, and safety practices for traditional woodwork.',
          level: 'beginner'
        }
      ];

      // Set default user with sample certificates
      const defaultUser: User = {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        location: 'Jaipur, Rajasthan',
        bio: 'Master artisan specializing in traditional Indian crafts with over 15 years of experience in handloom weaving, pottery, and jewelry making.',
        userType: 'artisan',
        avatarUrl: '/placeholder-avatar.jpg',
        skills: ['Handloom Weaving', 'Pottery', 'Block Printing', 'Jewelry Making', 'Wood Carving'],
        endorsements: [
          'Priya is an exceptional artisan with incredible attention to detail and traditional techniques.',
          'Her work showcases the perfect blend of traditional craftsmanship and modern design sensibilities.',
          'Priya has been instrumental in preserving and promoting our cultural heritage through her craft.'
        ],
        microCertificates: sampleCertificates
      };

      setUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Redirect to landing page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
