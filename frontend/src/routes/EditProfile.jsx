import React from 'react'
import NavBar from './NavBar';
import { useState, useEffect } from 'react';
const EditProfile = () => {
    // const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUser"));
    const [email, setEmail] = useState(localStorage.getItem("currentUser_email"));
    const [given_name, setGivenName] = useState(localStorage.getItem("currentUser_given_name"));
    const [family_name, setFamilyName] = useState(localStorage.getItem("currentUser_family_name"));
    const [id, setId] = useState(localStorage.getItem("currentUser_id"));
    // const [originalEmail, setOriginalEmail] = useState(localStorage.getItem("currentUser_email"));
    // const [originalGivenName, setOriginalGivenName] = useState(localStorage.getItem("currentUser_given_name"));
    // const [originalFamilyName, setOriginalFamilyName] = useState(localStorage.getItem("currentUser_family_name"));
    const [validEmail, setValidEmail] = useState(true);
    const [validFamilyName, setValidFamilyName] = useState(true);
    const [validGivenName, setValidGivenName] = useState(true);
    // useEffect (() => {

    // const revertChanges = () => {
    //     setEmail(originalEmail);
    //     setGivenName(originalGivenName);
    //     setFamilyName(originalFamilyName);
    //     setValidEmail(true);
    //     setValidFamilyName(true);
    //     setValidGivenName(true);
    //     document.getElementById("emailSpan" + id).style.display = "none";
    //     document.getElementById("confirmChange" + id).removeAttribute("disabled");
    // }

    const checkGivenName = (given_name) => {
        var re = /^[a-zA-Z ]*$/
        console.log("len:" + given_name.length);
        console.log("trim: " + given_name.trim().length);
        if(re.test(given_name) === false || given_name.trim().length === 0) {
            console.log("invalid given name");
            setValidGivenName(false);
            document.getElementById("givenNameSpan" + id).style.display = "block";
            document.getElementById("confirmChange" + id).setAttribute("disabled", "disabled");
        } else {
            setValidGivenName(true);
            console.log("valid given name");
            document.getElementById("givenNameSpan" + id).style.display = "none";
            if(validEmail === true && validFamilyName === true) {
                document.getElementById("confirmChange" + id).removeAttribute("disabled");
            }
        }

    }
    const checkFamilyName = (family_name) => {
        var re = /^[a-zA-Z ]*$/
        if(re.test(family_name) === false || family_name.trim().length === 0) {
            console.log("invalid family name");
            setValidFamilyName(false);
            document.getElementById("familyNameSpan" + id).style.display = "block";
            document.getElementById("confirmChange" + id).setAttribute("disabled", "disabled");
        } else {
            setValidFamilyName(true);
            console.log("valid family name");
            document.getElementById("familyNameSpan" + id).style.display = "none";
            if(validGivenName === true && validEmail == true) {
                document.getElementById("confirmChange" + id).removeAttribute("disabled");
            }
        }
    }
    const checkEmail = (email) => {
        // setEmail(email);
        var re = /\S+@\S+\.\S+/;
        console.log("checking email");
        if(re.test(email) === false || email.trim().length === 0) {
            console.log("invalid email");
            setValidEmail(false);
            document.getElementById("emailSpan" + id).style.display = "block";
            document.getElementById("confirmChange" + id).setAttribute("disabled", "disabled");
        } else {
            setValidEmail(true);
            console.log("valid email");
            document.getElementById("emailSpan" + id).style.display = "none";
            if(validFamilyName === true && validGivenName === true) {
                document.getElementById("confirmChange" + id).removeAttribute("disabled");
            }
        }
    }

    const editUser = () => {
        // console.log(id);
        console.log("setting ")
        localStorage.setItem("currentUser_email", email);
        localStorage.setItem("currentUser_given_name", given_name);
        localStorage.setItem("currentUser_family_name", family_name);

        console.log(email);
        console.log(given_name);
        console.log(family_name);
        const url = "https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/updateself";
        fetch(url, {
            method: "PUT",
            headers: {authorizationToken:localStorage.getItem("access_token")},
            body: JSON.stringify({
                "id": localStorage.getItem("currentUser_id"),
                "email": email,
                "first_name": given_name, 
                "last_name" : family_name
            })
        })
    }
    const deleteUser = () => {
        console.log("deleting user..");
        let url = "https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/deleteself";
        fetch(url, {
            method: "DELETE",
            headers: {authorizationToken:localStorage.getItem("access_token")},
            body: JSON.stringify({
                "id" : localStorage.getItem("currentUser_id")
            })
        })
        localStorage.clear();
        window.location.href="/login";
    }
    
    const reloadPage = () => {
        window.location.reload(false);
    }

    useEffect(() => {
        console.log(!localStorage.getItem("access_token") && !localStorage.getItem("id_token"));
        if(!localStorage.getItem("access_token") && !localStorage.getItem("id_token") ) {
            window.location.href="/invalidaccess";
        }
    }, []);
    return (
        <div>
        <NavBar loginFlow="hosted_login"/>
        <div className='flex relative w-1/2 mx-auto'>
            {/* <div className=''>
                <h1 className='text-3xl mt-36 ml-64 font-bold'>
                    Edit Profile
                </h1>
            </div> */}
            <div className='container'>
                <div className='flex-auto grid grid-cols-2'>
                    <div className='col-span-2'>
                        <h1 className='text-4xl mb-10 font-bold'>
                            Edit Profile
                        </h1>
                    </div>
                    <div>
                        <h1 className='text-2xl font-medium'>Given Name</h1>
                        <input type="text" value={given_name} className="input input-bordered w-full max-w-md my-2 bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" 
                        onChange={(e)=>{
                            setGivenName(e.target.value);
                            checkGivenName(e.target.value);
                        }} />
                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"givenNameSpan" + id}>Invalid Name</span>
                    </div>
                    <div className='ml-10'>
                        <h1 className='text-2xl font-medium'>Family Name</h1>
                        <input type="text" value={family_name} className="input input-bordered w-full max-w-md my-2 bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" 
                        onChange={(e)=> {
                            setFamilyName(e.target.value);
                            checkFamilyName(e.target.value)}}/>
                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"familyNameSpan" + id}>Invalid Name</span>
                    </div>
                    <div className='col-span-2'>
                        <h1 className='text-2xl font-medium'>Email</h1>
                        <input type="text" value={email} className="input input-bordered w-full my-2 bg-indigo-100 text-indigo-600 placeholder-indigo-400 text-sm" 
                        onChange={(e)=> {
                            setEmail(e.target.value);
                            checkEmail(e.target.value)}}/>
                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"emailSpan" + id}>Invalid Email</span>
                    </div>
                    <div className='col-span-2 text-center mt-5'>
                        {/* <button className="btn w-40 bg-indigo-600 mt-6 ml-5 mr-8" >Delete Account</button> */}
                        {/* <a href="#my-modal-2" className="btn w-40 bg-indigo-600 mt-6 ml-5 mr-8">Delete Account</a>
                            <div className="modal" id="my-modal-2">
                                <div className="modal-box text-center">
                                    <h3 className="font-bold text-xl">Are you sure you want to delete account?</h3>
                                    <div className="modal-action flex justify-center items-center space-x-10">
                                        <a href="/login" className="btn bg-indigo-400">Yes</a>
                                        <button className="btn bg-indigo-600">No</button>
                                    </div>
                                </div>
                            </div> */}
                        <label for="delete-account-modal" class="btn w-40 bg-red-600 mt-6 ml-5 mr-8" >Delete Account</label>
                        <input type="checkbox" id="delete-account-modal" class="modal-toggle" />
                        <div class="modal">
                            <div class="modal-box">
                                <h3 class="font-bold text-lg">Are you sure you want to delete account?</h3>
                                <div class="modal-action text-center items-center justify-center">
                                    <label for="delete-account-modal" className="btn btn-ghost btn-sm bg-zinc-400 mr-5">Cancel</label>
                                    <label for="delete-account-modal" className="btn btn-ghost btn-sm bg-red-600 ml-5" onClick={deleteUser}>Confirm</label>
                                </div>
                            </div>
                        </div>
                        {/* <label for="my-modal-3" className="btn w-40 bg-indigo-600 mt-6 ml-8 mr-5" onClick={editUser}>Save Changes</label>
                        <input type="checkbox" id="my-modal-3" class="modal-toggle" />
                            <div className="modal" id="my-modal-3">
                                <div className="modal-box text-center">
                                    <h3 className="font-bold text-2xl">Changes saved successfully!</h3>
                                    <div className="modal-action flex justify-center items-center space-x-10">
                                        <label for="my-modal-3" className="btn bg-indigo-600">Close</label>
                                    </div>
                                </div>
                            </div> */}
                        <label for="save-changes-modal" class="btn w-40 bg-indigo-600 mt-6 ml-8 mr-5" id={"confirmChange" + id} onClick={editUser}>Save Changes</label>
                        <input type="checkbox" id="save-changes-modal" class="modal-toggle" />
                        <div class="modal">
                            <div class="modal-box">
                                <h3 class="font-bold text-lg">Changes saved successfully!</h3>
                                <div class="modal-action justify-center text-center items-center">
                                    <label for="save-changes-modal" class="btn" onClick={reloadPage}>Close!</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default EditProfile