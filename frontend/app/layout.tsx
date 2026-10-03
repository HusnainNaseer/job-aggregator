import type { Metadata } from "next";

import Navbar from "./components/navbar";
import { AuthProvider } from "./context/AuthContext";
import { SavedJobsProvider } from "./context/SavedJobsContext";

import "./globals.css";

export const metadata: Metadata = {
    title: "Job Aggregator | Find your next opportunity",
    description: "Explore job opportunities from across the web in one place.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <SavedJobsProvider>
                        <Navbar />
                        {children}
                        <footer className="page-footer">
                            Job listings provided by{" "}
                            <a
                                className="inline-link"
                                href="https://devglobaljobs.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Dev Global Jobs
                            </a>
                        </footer>
                    </SavedJobsProvider>
                </AuthProvider>
            </body>
        </html>
    );
}