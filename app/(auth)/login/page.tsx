"use client";

import React from "react";
import Link from "next/link";
import { Shield, UserCheck, Users } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/30">

            {/* MAIN CONTENT CONTAINER */}
            <main className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-[440px] border-border bg-card shadow-xl">

                    {/* Form Header */}
                    <CardHeader className="space-y-1.5 p-6 pb-0">
                        <CardTitle className="text-2xl font-semibold tracking-tight text-card-foreground">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Enter your credentials to access your workspace.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Login Form */}
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    className="bg-muted/50 border-input placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Password
                                    </Label>
                                    <Link
                                        href="#"
                                        className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    defaultValue="••••••••"
                                    className="bg-muted/50 border-input focus-visible:ring-primary"
                                    required
                                />
                            </div>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                className="mt-2 w-full font-semibold transition-all active:scale-[0.99]"
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6 flex items-center justify-center">
                            <Separator className="bg-border" />
                            <span className="absolute bg-card px-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                                OR
                            </span>
                        </div>

                        {/* Google Button */}
                        <Button
                            variant="outline"
                            onClick={() => signIn("google")}
                            className="flex w-full items-center justify-center gap-2.5 font-medium transition-all active:scale-[0.99]"
                        >

                            Sign in with Google
                        </Button>

                        <div className="mt-6 border-t border-border/50 pt-4 text-center">
                            <p className="text-xs text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="#" className="font-semibold text-foreground underline decoration-muted-foreground underline-offset-4 hover:text-primary hover:decoration-primary">
                                    Register now
                                </Link>
                            </p>
                        </div>

                        {/* QUICK DEMO ACCESS SECTION */}
                        <div className="mt-6 border-t border-border/50 pt-4">
                            <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span className="text-amber-500">⚡</span> Quick Demo Access
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    className="flex h-auto flex-col items-center justify-center gap-1.5 bg-muted/30 border-border py-3 text-center transition-all hover:bg-muted active:scale-[0.96]"
                                >
                                    <Shield className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-mono text-[10px] font-semibold text-foreground">Admin</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex h-auto flex-col items-center justify-center gap-1.5 bg-muted/30 border-border py-3 text-center transition-all hover:bg-muted active:scale-[0.96]"
                                >
                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-mono text-[10px] font-semibold text-foreground">Manager</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex h-auto flex-col items-center justify-center gap-1.5 bg-muted/30 border-border py-3 text-center transition-all hover:bg-muted active:scale-[0.96]"
                                >
                                    <Users className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-mono text-[10px] font-semibold text-foreground">Member</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* FOOTER */}
            <footer className="flex flex-col gap-4 border-t border-border/40 bg-background px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-12">
                <div className="font-semibold text-foreground/80">ProjectFlow</div>
                <div className="flex gap-6">
                    <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                    <Link href="#" className="hover:text-foreground">Terms of Service</Link>
                    <Link href="#" className="hover:text-foreground">Help Center</Link>
                </div>
                <div>
                    © {new Date().getFullYear()} ProjectFlow. All rights reserved.
                </div>
            </footer>
        </div>
    );
}