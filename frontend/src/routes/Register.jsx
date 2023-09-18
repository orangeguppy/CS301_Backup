import React from 'react'
import man from '../man.png';
import Nav from './Nav';
import { useState } from 'react';
const Register = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const setFocus = (e) => {
    console.log(e.target.type)
    e.target.type = 'date';
  }
  const setBlur = (e) => {
    e.target.type = 'text';
  }

  //handleRegister
  const handleRegister = async () => {
    try {
      //console.log("HELLO")
      localStorage.setItem("email", email)
      localStorage.setItem("password", password) //set password so can access in validate 
      console.log("THIS IS PASSWORD")
      console.log(password)
      const response = await fetch('https://ppzp0z6kh1.execute-api.ap-southeast-1.amazonaws.com/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
    
        })
      }).then(response => {
       // console.log(response);
        response.json()
      }).then(data => console.log(data))
        .catch(err => console.log(err));
     // console.log("EMAIL HERE");
      //console.log(e)
      const data = await response.json();
     // console.log(data);
      // handle success or error
    } catch (error) {
        console.error(error);
      // handle error
    }
  };

  const checkInputs = () => {
    console.log("-----checking inputs------");
    let errors = false;
    document.getElementById("emailSpan").style.display = "none";
    document.getElementById("firstNameSpan").style.display = "none";
    document.getElementById("lastNameSpan").style.display = "none";
    document.getElementById("passwordSpan").style.display = "none";
    document.getElementById("retypePasswordSpan").style.display = "none";
    document.getElementById("passwordMismatch").style.display = "none";
    document.getElementById("birthdateSpan").style.display = "none";
    if (email.trim().length === 0) {
      // errors.email = "email cannot be empty";
      document.getElementById("emailSpan").style.display = "block";
      errors = true;
      console.log("errors: " + errors);
    }
    if (firstName.trim().length === 0) {
      // errors.firstName = "first name cannot be empty";
      document.getElementById("firstNameSpan").style.display = "block";
      errors = true;
    }
    if (lastName.trim().length === 0) {
      // errors.lastName = "last name cannot be empty";
      document.getElementById("lastNameSpan").style.display = "block";
      errors = true;
    }
    if (password.trim().length === 0) {
      // errors.password = "password cannot be empty";
      document.getElementById("passwordSpan").style.display = "block";
      errors = true;
    }
    if (retypePassword.trim().length === 0) {
      // errors.retypePassword = "retype password cannot be empty";
      document.getElementById("retypePasswordSpan").style.display = "block";
      errors = true;
    } else if (retypePassword !== password) {
      document.getElementById("passwordMismatch").style.display = "block";
      errors = true;
    }
    if (birthdate === "") {
      document.getElementById("birthdateSpan").style.display = "block";
      errors = true;
    }
    console.log("-----finish checking inputs------");
    console.log(errors);
    if (errors === false) {
      console.log("no errors");
      handleRegister();
      window.location.href = "#my-modal-2";
    } else {
      console.log("has errors");
    }
  }
  return (
    <div className="min-h-screen">
      <Nav />
      <div className='container mx-auto'>
        <div className='flex'>
          {/* <div className='absolute top-10 left-48'>
              <img src={logo} alt='ascenda' className='w-28'/>
            </div> */}
          <div className='w-3/5 h-screen flex items-center justify-center relative'>
            <div className='text-2xl absolute z-10'>
              <span className='text-5xl font-bold'>Create an account to</span>
              <br />
              <span className='font-medium'>manage your resources today.</span>
              <br />
              <br />
              <br />
              <span className='text-xl'>Already have an account?</span>
              <br />
              <a className='text-indigo-600 text-xl font-medium' href='/login'>Login here!</a>
            </div>
            <div className='absolute bottom-24 left-1/2 z-0'>
              <img src={man} alt="man" className='w-64' />
            </div>
          </div>
          <div className='w-2/5 h-screen flex items-center'>
            {/* <div className='absolute top-10 flex'>
                <a className='ml-48' href='#'>
                  Login
                </a>
                <a className='ml-5 text-black' href='#'>
                  Sign up
                </a>
            </div> */}
            <div className="mr-20 ">
              <div className="mb-10">
                <span className='text-2xl font-medium'>Register New Account</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input type="text" placeholder="Enter email" className="input input-bordered w-full bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="emailSpan">Email Cannot be empty</span>
                </div>
                <div className="">
                  <input type="text" placeholder="First Name" className="input input-bordered w-full bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={firstName} onChange={(e) => { setFirstName(e.target.value) }} />
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="firstNameSpan">First Name cannot be empty</span>
                </div>
                <div className="">
                  <input type="text" placeholder="Last Name" className="input input-bordered w-full bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={lastName} onChange={(e) => { setLastName(e.target.value) }} />
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="lastNameSpan">Last Name cannot be empty</span>
                </div>
                <div className="col-span-2">
                  <input type="text" placeholder="Birthdate" onFocus={(e) => setFocus(e)} onBlur={(e) => setBlur(e)} className="input input-bordered w-full bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={birthdate} onChange={(e) => { setBirthdate(e.target.value) }} />
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="birthdateSpan">Birthdate cannot be empty</span>
                </div>
                <div className="col-span-2">
                  <input type="password" placeholder="Password" className="input input-bordered w-full bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="passwordSpan">Password cannot be empty</span>
                </div>
                <div className="col-span-2">
                  <input type="password" placeholder="Re-enter Password" className="input input-bordered w-full bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={retypePassword} onChange={(e) => { setRetypePassword(e.target.value) }} />
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="retypePasswordSpan">Retype password cannot be empty</span>
                  <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id="passwordMismatch">Passwords do not match</span>
                </div>
                <div className="col-span-2">
                  <button className="btn w-full bg-indigo-600 mt-6" onClick={checkInputs}>Register</button>
                  <div className="modal" id="my-modal-2">
                    <div className="modal-box text-center">
                      <h3 className="font-bold text-2xl">Checking validity of account details..</h3>
                      <p className="py-4">An OTP has been sent to your email account.</p>
                      <p>Please enter the OTP within 1 min(s) to validate your account</p>
                      <div class="modal-action flex justify-center items-center space-x-10">
                        {/* <a href="#" class="btn bg-indigo-400">Dismiss</a> */}
                        <a type="submit" href="/validate" className="btn bg-indigo-600">Enter OTP</a>
                      </div>
                    </div>
                  </div>
                  <br />
                  {/* <button className='text-sm my-2 ml-20'>or continue with Bank SSO</button> */}
                </div>
              </div>
              {/* <div className="my-2">
                    <input type="text" placeholder="First Name" className="input input-bordered w-full max-w-xs bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={firstName} onChange={(e) => {setFirstName(e.target.value)}}/>
                    <span className="text-red-700 font-light text-xs" style={{display: "none"}} id="firstNameSpan">First Name cannot be empty</span>
                </div>
                <div className="my-2">
                    <input type="text" placeholder="Last Name" className="input input-bordered w-full max-w-xs bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={lastName} onChange={(e) => {setLastName(e.target.value)}}/>
                    <span className="text-red-700 font-light text-xs" style={{display: "none"}} id="lastNameSpan">Last Name cannot be empty</span>
                </div>
                <div className="my-2">
                    <input type="text" placeholder="Birthdate" onFocus={(e) => setFocus(e)} onBlur={(e) => setBlur(e)} className="input input-bordered w-full max-w-xs bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={birthdate} onChange={(e) => {setBirthdate(e.target.value)}}/>
                    <span className="text-red-700 font-light text-xs" style={{display: "none"}} id="birthdateSpan">Birthdate cannot be empty</span>
                </div>
                <div className="my-2">
                    <input type="password" placeholder="Password" className="input input-bordered w-full max-w-xs bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
                    <span className="text-red-700 font-light text-xs" style={{display: "none"}} id="passwordSpan">Password cannot be empty</span>
                </div>
                <div className="my-2">
                    <input type="password" placeholder="Re-enter Password" className="input input-bordered w-full max-w-xs bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" value={retypePassword} onChange={(e) => {setRetypePassword(e.target.value)}}/>
                    <span className="text-red-700 font-light text-xs" style={{display: "none"}} id="retypePasswordSpan">Retype password cannot be empty</span>
                    <span className="text-red-700 font-light text-xs" style={{display: "none"}} id="passwordMismatch">Passwords do not match</span>
                </div>
                 */}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register