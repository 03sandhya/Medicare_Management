import { useEffect, useState, createContext, useContext } from "react"
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

type UserRole = "patient" | "caretaker" | null;

interface ProfileData {
  id: string;
  role: UserRole;
  updated_at: string;
}

type AuthContextType = {
  session: Session | null;
  userRole: UserRole;
   isLoading: boolean;
   signUpNewUser: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
   setUserRole: (role: UserRole) => void;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
 
  const [session, setSession] = useState(undefined);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  //sign up
  // const signUpNewUser = async (email: string, password: string, role: "patient" | "caretaker") =>{
  //   const {data,error} = await supabase.auth.signUp({ email:email, password:password }) ;
  //   if(error)
  //     {
  //       console.error("There is a problem in signUp",error)
  //       return{success:false,error}
  //     } 
  //     // Store role in user metadata
  // const { error: updateError } = await supabase
  //   .from('profiles')
  //   .upsert({
  //     id: data.user?.id,
  //     role,
  //     updated_at: new Date().toISOString()
  //   });

  // if (updateError) {
  //   console.error("Role update error", updateError);
  //   return { success: false, error: updateError };
  // }

  // setUserRole(role);
  // return { success: true, data };
  // }

  //sign in
  //  const signInUser = async (email,password) =>{
  //   try{
  //      const {data,error} = await supabase.auth.signInWithPassword({
  //       email:email, password:password
  //      });
  //      if( error){
  //        console.error("There is a problem in signin",error)
  //        return { success:false, error};
  //      }
  //      console.log('sign in successful',data);
  //      return{success:true,data};
  //   } catch(error) {
  //     console.error('An error occured',error)

  //   }
  //  }

  //  useEffect(() => {
  //   supabase.auth.getSession().then(({ data: {session}}) => {
  //     setSession(session)
  //   });

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   });

  // }, []);

  //SignOut
  // const signOut = async() =>{
  //    const { error } =await supabase.auth.signOut();
  //    if ( error){
  //     console.error('there was an error',error)
  //    }
  // }



  //new code
  
  const signUpNewUser = async (email: string, password: string, role: UserRole) => {
    try {
     if (!role) {
      throw new Error("Role is required");
    }  
      setIsLoading(true);
      // 1. Create auth user
      const {  data: authData, error: authError } = await supabase.auth.signUp({
         email, password,options: {
        data: {
          role // Store role in auth user metadata as well
        }
      } });
      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: "User creation failed" };
      }
      
       
 // 2. Create profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          role,
          updated_at: new Date().toISOString()
        })  

      if (profileError) {
          console.error('Profile update error:', profileError);
        return { success: false, error: profileError.message };
      }

      // 3. Wait for session to be established and role to be set
      const { data: { session: newSession } } = await supabase.auth.getSession();
      setSession(newSession);
      setUserRole(role);
      console.log('Profile updated with role:', role);
      return { success: true };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const signInUser = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }
  // Immediately fetch the user role after successful sign in
      if (data.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profileData?.role) {
          setUserRole(profileData.role);
        }
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };
 const fetchUserRole = async (userId: string) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (!error && profileData?.role) {
          setUserRole(profileData.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };


   useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user?.id) {
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialSession();
   

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user?.id) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return(
    <AuthContext.Provider value ={{session,userRole,isLoading,signUpNewUser,signInUser,signOut,setUserRole}}>
       {children} 
       </AuthContext.Provider>  );
} ;

export const UserAuth = () => {
 const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('UserAuth must be used within an AuthProvider');
  }
  return context;
};


