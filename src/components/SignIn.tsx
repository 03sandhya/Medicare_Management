import { useEffect, useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { UserAuth } from './Authprovider'


export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const { session,signInUser,isLoading, userRole } = UserAuth();
  const navigate = useNavigate();

 
  useEffect(() => {
    if (session && userRole) {
         console.log('User authenticated,Redirecting to dashboard with role:', userRole);
      navigate(userRole === 'patient' ? '/patient-dashboard' : '/caretaker-dashboard')
    }
  }, [session, userRole, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
 console.log('Attempting sign in');
    const result = await signInUser(email, password)
    if (!result.success) {
      console.error('Sign in failed:', result.error)
      setError(result.error || "Invalid credentials. Please try again.")
    } else {
      console.log('Sign in successful');
    }
  }

// Redirect if session exists (role will be checked by ProtectedRoute)
  if (session && !isLoading) {
 
    return null;
  }
  return (
   <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Log in to your account
        </h2>
        <p className="mb-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:underline">
            Sign up
          </Link>
        </p>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full rounded-lg bg-green-600 p-3 text-white hover:bg-green-700 disabled:opacity-50"
          
          >
           Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
