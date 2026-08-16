import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { session, loading } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  }

  if (loading) return <p>loading</p>;
  if (session) return <Navigate to="/" replace />;

  return (
    <div className="login-page">
      <Card className="login-card [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="h-11 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="login-field">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="h-11 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <Button type="submit" className="h-11 text-base">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
