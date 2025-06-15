import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { UserAuth } from './Authprovider'

export default function SignUp() {
   const location = useLocation();
  const role = location.state?.role as "patient" | "caretaker" | undefined;
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error,setError ] = useState('')
   const navigate = useNavigate()
  const {session,signUpNewUser,isLoading} = UserAuth();
  

 
 const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!role) {
      setError('Role is missing');
      return;
    }
    console.log('Attempting signup with role:', role);
      const result = await signUpNewUser(email, password, role)
      if (result.success) {
        console.log('Signup successful, navigating to dashboard');
       
      }else {
         console.error('Signup failed:', result.error);
      setError(result.error || 'Sign up failed. Please try again.')
    }
     // Redirect if session exists (role will be checked by ProtectedRoute)
 
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Sign up as {role}
        </h2>
        <p className="mb-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-green-600 hover:underline">
            Sign in
          </Link>
        </p>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSignUp} className="space-y-4">
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
            minLength={6}
          />
          <Button
            type="submit"
            className="w-full rounded-lg bg-green-600 p-3 text-white hover:bg-green-700 disabled:opacity-50"
           
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  )
}
    