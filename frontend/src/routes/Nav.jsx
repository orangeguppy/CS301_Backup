import React from 'react'
import logo from '../ascenda.png';
const Nav = () => {
  return (
    <div className="navbar bg-base-100 absolute">
        <div className="flex-1 ml-48">
            <img src={logo} alt='ascenda' className='w-28'/>
        </div>
        <div className="flex-none mr-72">
            <ul className="menu menu-horizontal px-1">
            <li><a href='/login'>Login</a></li>
            <li><a href='/register'>Sign up</a></li>
            </ul>
        </div>
    </div>
  );
}

export default Nav