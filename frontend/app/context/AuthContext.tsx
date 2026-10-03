"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type User = {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        async function getUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user);
            setLoading(false);
        }

        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
