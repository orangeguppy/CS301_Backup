import React from 'react'
import logo from '../ascenda.png';
const NavBar = ({ loginFlow }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  }
  return (
    <div className="navbar bg-base-100 mb-10">
        <div className="flex-1 ml-48">
            <img src={logo} alt='ascenda' className='w-28'/>
        </div>
        <div className="flex-none mr-56">
            <ul className="menu menu-horizontal px-1">
            {loginFlow === "hosted_login" ?
            <li><a href="/editprofile" className='btn btn-ghost'>{localStorage.getItem("currentUser_given_name")} {localStorage.getItem("currentUser_family_name")}</a></li>
            :
            <li></li>
            }
            <li><a href='/mybank' className='btn btn-ghost'>My Bank</a></li>
            <li><a href='/login' className='btn btn-ghost' onClick={handleLogout}>Logout</a></li>
            </ul>
        </div>
    </div>
  )
}

export default NavBar