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

export default function Home() {
  const { data: session, status } = useSession();
  const recipe = {
    title: 'Sample Recipe',
    ingredients: ['1 cup flour', '2 eggs', '1/2 cup milk'],
    instructions: ['Mix ingredients', 'Bake at 350°F for 20 minutes'],
  };

  if(!session){
    return <Hero />
  }

  return (
    <div className="text-center">
      <h1>Dashboard here</h1>
      <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

