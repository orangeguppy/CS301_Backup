import React from 'react'
import unauthorized from '../unauthorized.png';
const InvalidLogin = () => {
    return (
        <div className="min-h-screen">
            <div className="flex">
                <img src={unauthorized} alt="man" className='h-48 mx-auto mt-20'/>
            </div>
            <div>
                <h1 className="text-6xl font-bold text-center">OOPS!</h1>
            </div>
            <div className="flex text-center">
                <div className="w-auto px-16 h-36 rounded-xl justify-center text-center items-center mx-auto mt-10">
                    <h1 className="text-3xl font-bold">Invalid Username or Password.</h1>
                    {/* <p>Click <a href="/login" className="underline">here</a> to return to Login Page to sign in again</p> */}
                    <p className="mt-1 font-medium text-xl">Please attempt to sign in again.</p>
                    <a className="btn btn-xl w-64 mt-10 text-lg font-bold" href="/login">Return to Login</a>
                </div>
            </div>
        </div>
    )
}

export default InvalidLogin
