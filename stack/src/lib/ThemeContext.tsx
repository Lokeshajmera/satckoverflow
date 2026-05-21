import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggleTheme: () => { } });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        const preferred = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(preferred);
        document.documentElement.classList.toggle("dark", preferred === "dark");
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            document.documentElement.classList.toggle("dark", next === "dark");
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
