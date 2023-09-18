import React, { useState } from 'react';
import { useEffect } from 'react';

const Validate = () => {
  const [otp, setOtp] = useState('')
  //handleRegister

//HERE ARE THE STATUS CODES
//   
// 200: Good
// 401: Invalid OTP
// 402: Expired OTP
// 403: Email not inside DB
// 500: Other untold errors 
//    
  // useEffect(() => {
  //   console.log(!localStorage.getItem("access_token") && !localStorage.getItem("id_token"));
  //   if(!localStorage.getItem("access_token") && !localStorage.getItem("id_token") ) {
  //       window.location.href="/invalidaccess";
  //   }
  // }, []);

//this is for resendOTP
  const handleResubmitOTP = async () => {
    try {
      console.log("HELLO")
      const email = localStorage.getItem("email");
      
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
      const data = await response.json();
      //console.log(data);
      // handle success or error
    } catch (error) {
      //console.error(error);
      // handle error
    }
    window.location.href = "#resendOTPMOdal"; 
  };

  //THis is for first submission
  const handleSubmitOTP = async () => {
    try {
      const email = localStorage.getItem("email");    //This returns the email as an email variable!
      const password = localStorage.getItem("password");
      // console.log("THIS IS PASSWROD")
      // console.log(password)
      const response = await fetch('https://mbpzjhq32b.execute-api.ap-southeast-1.amazonaws.com/val_OTP/otp_validator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          password: password
        })   //PUT THE OTP HERE 
      })
      .then(response => {
        //console.log(response)
        console.log(password)
        return response.json();
        //console.log("BEfore u enter data")
      }).then(data => {
        //console.log("Trying Dxta")
        //console.log(data)
        //console.log("Entered Data Read")

        //console.log("Printing status")
  
        //added if responses here
        if (data.status === 200) {
          //console.log("GOOD WORK");
          window.location.href = "#my-modal-2";
        }
        //ExpiredOTP (No Time Liao)
        else if (data.status === 402) {
          window.location.href = '#my-modal-4';
        }
        //Email is not found
        else if (data.status === 403) {
          window.location.href = '#my-modal-3';
        }
        //Entered Wrong OTP BUT still have time 
        else if (data.status === 401) {
          //console.log("BAD NEVER WORK");
          window.location.href = "#my-modal-1";
        }
        else {
          //console.log("BAD NEVER WORK");
  
          window.location.href = "#my-modal-1";     //TODO: This is error 500: Maybe something diff?
        }
      }) .catch(err => console.log(err));
      
      console.log(otp);
      // const data = await response.json();
      // console.log(data);
    } catch (error) {
      console.error(error);
      // handle error
    }
  }
  return (
    <div>
      <div className="h-screen flex items-center justify-center ">
        <div>
          <div>
            <span className='text-2xl font-medium'>Validate Account</span>
          </div>
          <div>
            <input onChange={e => setOtp(e.target.value)} value={otp} type="text" placeholder="Enter OTP" className="input input-bordered w-64 my-5 bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" />
          </div>

          <div className='text-center'>
           <button onClick={handleSubmitOTP} className="btn w-64 bg-indigo-600">Validate</button>
            <div className="modal" id="my-modal-1">
              <div className="modal-box text-center">
                <h3 className="font-bold text-2xl">OTP Validation Unsuccessful, WRONG OTP!</h3>
                <p className="py-4 font-medium">Please try again.</p>
                <div className="modal-action flex justify-center items-center space-x-10">
                  <a href="/validate" className="btn w-48 bg-indigo-600">Close</a>
                </div>
              </div>
            </div>

            <div className="modal" id="my-modal-2">
              <div className="modal-box text-center">
                <h3 className="font-bold text-2xl">OTP Validation Successful!</h3>
                <p className="py-4 font-medium">You will be redirected to the login page.</p>
                <div className="modal-action flex justify-center items-center space-x-10">
                  <a href="/login" className="btn w-48 bg-indigo-600">Close</a>
                </div>
              </div>
            </div>

            <div className="modal" id="my-modal-3">
              <div className="modal-box text-center">
                <h3 className="font-bold text-2xl">OTP Validation Unsuccessful!</h3>
                <p className="py-4 font-medium">Your Email seems wrong. Did you enter it wrongly, or are you even a partner?</p>
                <div className="modal-action flex justify-center items-center space-x-10">
                  <a href="/validate" className="btn w-48 bg-indigo-600">Close</a>
                </div>
              </div>
            </div>

            <div className="modal" id="my-modal-4">
              <div className="modal-box text-center">
                <h3 className="font-bold text-2xl">OTP Validation Unsuccessful!</h3>
                <p className="py-4 font-medium">Your OTP has EXPIRED. Please RESEND Your OTP</p>
                <div className="modal-action flex justify-center items-center space-x-10">
                  <a href="/validate" className="btn w-48 bg-indigo-600">Close</a>
                </div>
              </div>
            </div>

            <div className="modal" id="resendOTPMOdal">
              <div className="modal-box text-center">
                <h3 className="font-bold text-2xl">You have been resent an OTP!</h3>
                <p className="py-4 font-medium">Check Your Email!</p>
                <div className="modal-action flex justify-center items-center space-x-10">
                  <a href="/validate" className="btn w-48 bg-indigo-600">Close</a>
                </div>
              </div>
            </div>
            <br />


            <button onClick={handleResubmitOTP} className='text-sm my-2 font-medium'>Resend OTP</button>
                <a href="/validate" ></a> 
                {/* This recalls the page */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Validate