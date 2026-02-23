
import React from 'react'
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full flex items-center justify-around py-5 px-24 border-b border-gray-700 bg-black">
      <ul className='flex gap-10 text-lg'>
        <Link href="/" className='hover:text-gray-400 transition-colors duration-300 text-white'>Home
        </Link>
        <Link href="/games" className='hover:text-gray-400 transition-colors duration-300 text-white'>Games
        </Link>
        <Link href="/reviews" className='hover:text-gray-400 transition-colors duration-300 text-white'>Reviews
        </Link>
        <Link href="/profile" className='hover:text-gray-400 transition-colors duration-300 text-white'>Profile
        </Link>
        <Link href="/login" className='hover:text-gray-400 transition-colors duration-300 text-white'>Login
        </Link>
      </ul>
    </nav>
  )
}

export default Navbar