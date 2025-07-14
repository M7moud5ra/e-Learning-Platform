import './Header.css'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from '../../Images/logo.svg'
import { useState, useEffect } from 'react'

function Header() {
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <>
    <header className="flex items-center justify-evenly bg-[#042439] w-full fixed z-10 gap-[20rem]">
      <NavLink to='/'>
      <div className="logo">
        <img src={Logo} alt="logo" />
        <h1 className='text-2xl text-[#4E84C1] font-bold'>Shiksharthee</h1>
      </div>
      </NavLink>
      <div className="link-nav">
        <ul>
          <li><NavLink to='/' className={({isActive}) => isActive ? "active" : "deactive" }> Home </NavLink></li>
          <li><NavLink to='/courses' className={({isActive}) => isActive ? "active" : "deactive"}> Courses </NavLink></li>
          <li><NavLink to='/about' className={({isActive}) => isActive ? "active" : "deactive"}> About </NavLink></li>
          <li><NavLink to='/contact' className={({isActive}) => isActive ? "active" : "deactive"}> Contact us </NavLink></li>
        </ul>
      </div>
      <div className='flex gap-6 items-center'>
        {user ? (
           <div className='relative dropdown-container'>
             <div 
               className='flex items-center gap-2 cursor-pointer bg-blue-600 px-3 py-2 rounded-full hover:bg-blue-700 transition-colors'
               onClick={() => setShowDropdown(!showDropdown)}
             >
              <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold'>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className='text-white text-sm'>{user.name.split(' ')[0]}</span>
            </div>
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20'>
                <div className='p-4 border-b'>
                  <p className='font-semibold text-gray-800'>{user.name}</p>
                  <p className='text-sm text-gray-600'>{user.email}</p>
                  <p className='text-xs text-blue-600 capitalize'>{user.type}</p>
                </div>
                <div className='p-2'>
                  <button 
                    onClick={handleLogout}
                    className='w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors'
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to='/login' className={({isActive}) => isActive ? "deactive" : "deactive"}><button>Login</button></NavLink>
            <NavLink to='/signup' className={({isActive}) => isActive ? "deactive" : "deactive"}><button>Signup</button></NavLink>
          </>
        )}
      </div>
    </header>
    <div className="gapError"></div>
    </>
  )
}

export default Header
