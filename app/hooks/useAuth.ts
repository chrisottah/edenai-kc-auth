'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    userId: string;
    username: string;
    phone?: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    name: string;
}

export function useAuth() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const router = useRouter();

    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    };

    const loadAuthState = () => {
        try {
            const token = getCookie('accessToken');
            const userProfileCookie = getCookie('userProfile');
            
            setAccessToken(token);
            
            if (token && userProfileCookie) {
                const userData = JSON.parse(userProfileCookie) as UserProfile;
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            setUser(null);
            setAccessToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        document.cookie = 'accessToken=; Max-Age=0; path=/';
        document.cookie = 'refreshToken=; Max-Age=0; path=/';
        document.cookie = 'userProfile=; Max-Age=0; path=/';
        
        setUser(null);
        setAccessToken(null);
        router.push('/auth');
    };

    const login = (redirectUrl?: string) => {
        const authUrl = redirectUrl 
            ? `/auth?redirectUrl=${encodeURIComponent(redirectUrl)}`
            : '/auth';
        router.push(authUrl);
    };

    useEffect(() => {
        loadAuthState();
        const interval = setInterval(loadAuthState, 5000);
        return () => clearInterval(interval);
    }, []);

    return {
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
        reload: loadAuthState
    };
}