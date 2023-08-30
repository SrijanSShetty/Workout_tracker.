import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
  const { logout } = useLogout()
  const { user } = useAuthContext()

  const handleClick = () => {
    logout()
  }

  return (
    <header>
      <div className="container">
        <Link to="/">
          <h1 style={{color:"white"}}>Workout Tracker</h1>
        </Link>
        <nav>
          {user && (
            <div>
              <span>{user.email}</span>
              <Link to="/" style={{color:"white"}} className="button1">Add Data</Link>   <Link to="/viewp" className="button1" style={{color:"white"}}>Track Data</Link> <button style={{backgroundColor:"red",color:"white"}} onClick={handleClick}>Log out</button>
            </div>
          )}
          {!user && (
            <div>
              <Link to="/login" style={{color:"white"}}>Login</Link>
              <Link to="/signup" style={{color:"white"}}>Signup</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar