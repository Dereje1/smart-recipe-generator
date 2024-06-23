// // src/pages/index.tsx


// export default function Home() {
//   

//   if (status === 'loading') {
//     return <div className="text-center text-blue-500">Loading...</div>;
//   }

//   return (
//     <div>
//       <h1 className="text-3xl font-bold underline text-center">Welcome to the Home Page</h1>
//       {!session ? (
//         <div className="text-center">
//           <p className="text-red-500">You are not signed in</p>
//           <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => signIn('google')}>Sign in</button>
//         </div>
//       ) : (
//         <div className="text-center">
//           <p className="text-green-500">Welcome, {session.user?.name}</p>
//           <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => signOut()}>Sign out</button>
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/index.tsx
import { useSession, signIn, signOut } from 'next-auth/react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard'

export default function Home() {
  const { data: session, status } = useSession();

  if (session) {
    return <Dashboard user={session.user}/>
  }

  return (
    <Hero />
  );
}

