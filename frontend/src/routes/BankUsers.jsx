import React, { Fragment } from 'react'
import {useState, useEffect} from 'react';
const BankUsers = ({ user, setUsers, users, role, loginFlow }) => {
    // const [currentUser, setCurrentUser] = useState(user);
    const [currentUser, setCurrentUser] = useState();
    const [originalEmail, setOriginalEmail] = useState(user.email);
    const [originalGivenName, setOriginalGivenName] = useState(user.given_name);
    const [originalFamilyName, setOriginalFamilyName] = useState(user.family_name);
    const [email, setEmail] = useState(user.email);
    const [given_name, setGivenName] = useState(user.given_name);
    const [family_name, setFamilyName] = useState(user.family_name);
    const [validEmail, setValidEmail] = useState(true);
    const [validFamilyName, setValidFamilyName] = useState(true);
    const [validGivenName, setValidGivenName] = useState(true);
    // useEffect (() => {
    // }, [])
    // const upperCase = (name) => {
    //     name = name.trim();
    //     const words = name.split(" ");

    //     for (let i = 0; i < words.length; i++) {
    //         words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    //     }

    //     return words.join(" ");
    // }
    const deleteUser = () => {
        const uid = user.id;
        console.log("deleting user..");
        const newUsers = users.filter(x => x.id !== uid);
        setUsers(newUsers);
        let url = "https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/hosted_login/oauth/deleteuser";
        fetch(url, {
            method: "DELETE",
            headers: {authorizationToken:localStorage.getItem("access_token")},
            body: JSON.stringify({
                "id" : user.id
            })
        })
    }
    const revertChanges = () => {
        setEmail(originalEmail);
        setGivenName(originalGivenName);
        setFamilyName(originalFamilyName);
        setValidEmail(true);
        setValidFamilyName(true);
        setValidGivenName(true);
        document.getElementById("emailSpan" + user.id).style.display = "none";
        document.getElementById("confirmChange" + user.id).removeAttribute("disabled");
    }
    const editUser = () => {
        // console.log(id);
        console.log(email);
        console.log(given_name);
        console.log(family_name);
        setOriginalEmail(email);
        setOriginalGivenName(given_name);
        setOriginalFamilyName(family_name);
        if(localStorage.getItem("currentUser_id") === user.id) {
            localStorage.setItem("currentUser_email", email);
            localStorage.setItem("currentUser_given_name", given_name);
            localStorage.setItem("currentUser_last_name", family_name);
        }
        let editedUser = 
            {
                'email' : email,
                'given_name' : given_name,
                'family_name' : family_name,
                'id' : user.id,
                'status' : user.status
            }
        let usersArr = [editedUser];
        console.log(usersArr);
        console.log(users.map(obj => usersArr.find(o => o.id === obj.id) || obj));
        let newUsers = users.map(obj => usersArr.find(o => o.id === obj.id) || obj);
        setUsers(newUsers);
        const url = "https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/hosted_login/oauth/updateuser";
        fetch(url, {
            method: "PUT",
            headers: {authorizationToken:localStorage.getItem("access_token")},
            body: JSON.stringify({
                "id": user.id,
                "email": email,
                "first_name": given_name, 
                "last_name" : family_name
            })
        })
    }
    const checkGivenName = (given_name) => {
        var re = /^[a-zA-Z ]*$/
        console.log("len:" + given_name.length);
        console.log("trim: " + given_name.trim().length);
        if(re.test(given_name) === false || given_name.trim().length === 0) {
            console.log("invalid given name");
            setValidGivenName(false);
            document.getElementById("givenNameSpan" + user.id).style.display = "block";
            document.getElementById("confirmChange" + user.id).setAttribute("disabled", "disabled");
        } else {
            setValidGivenName(true);
            console.log("valid given name");
            document.getElementById("givenNameSpan" + user.id).style.display = "none";
            if(validEmail === true && validFamilyName === true) {
                document.getElementById("confirmChange" + user.id).removeAttribute("disabled");
            }
        }

    }
    const checkFamilyName = (family_name) => {
        var re = /^[a-zA-Z ]*$/
        if(re.test(family_name) === false || family_name.trim().length === 0) {
            console.log("invalid family name");
            setValidFamilyName(false);
            document.getElementById("familyNameSpan" + user.id).style.display = "block";
            document.getElementById("confirmChange" + user.id).setAttribute("disabled", "disabled");
        } else {
            setValidFamilyName(true);
            console.log("valid family name");
            document.getElementById("familyNameSpan" + user.id).style.display = "none";
            if(validGivenName === true && validEmail == true) {
                document.getElementById("confirmChange" + user.id).removeAttribute("disabled");
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
            document.getElementById("emailSpan" + user.id).style.display = "block";
            document.getElementById("confirmChange" + user.id).setAttribute("disabled", "disabled");
        } else {
            setValidEmail(true);
            console.log("valid email");
            document.getElementById("emailSpan" + user.id).style.display = "none";
            if(validFamilyName === true && validGivenName === true) {
                document.getElementById("confirmChange" + user.id).removeAttribute("disabled");
            }
        }
    }
    // const confirmChange = () => {
    //     console.log("given name in confirm change: " + given_name);
    //     setCurrentUser(
    //         {
    //             'email' : email,
    //             'given_name' : given_name,
    //             'family_name' : family_name,
    //             'id' : user.id,
    //             'status' : user.status
    //         }
    //     )
    //     let usersArr = [currentUser];
    //     console.log(usersArr);
    //     console.log(users.map(obj => usersArr.find(o => o.id === obj.id) || obj));
    //     //TODO: POST new users arr to backend 
        
    // }
    return (
        <tr>
            <td>{user.email}</td> 
            <td>{user.given_name}</td> 
            <td>{user.family_name}</td> 
            <td>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">{ user.id }</span>
            </td>
            {user.status === 'active' ?
                <td className='status-active'>{ user.status }</td> 
                :
                <td className='status-inactive'>{ user.status }</td> 
            }
            {role === 'superadmin' && loginFlow === "hosted_login" ?
                <td className='flex'>
                    <label for={'modal-edit-user' + user.id}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="cursor-pointer w-6 h-6 mr-3 stroke-green-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                    </label>
                    <input type="checkbox" id={'modal-edit-user' + user.id} class="modal-toggle" />
                    <div class="modal">
                        <div class="modal-box bg-indigo-100 absolute pb-5">
                            <label for={'modal-edit-user' + user.id} class="btn btn-sm btn-circle absolute right-2 top-2 bg-black-500" onClick={revertChanges}>✕</label>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <div class="form-control mb-3 col-span-2">
                                        <label class="label">
                                            <span class="label-text">Email:</span>
                                        </label>
                                        <input type="text" value={email} class="input input-bordered w-full" onChange={(e)=> {
                                            setEmail(e.target.value);
                                            checkEmail(e.target.value);
                                            }}/>
                                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"emailSpan" + user.id}>Invalid Email</span>
                                    </div>
                                    <div class="form-control w-full mb-5 col-span-1">
                                        <label class="label">
                                            <span class="label-text">Given Name:</span>
                                        </label>
                                        <input type="text" value={given_name} class="input input-bordered w-full max-w-xs" onChange={(e) => {
                                            setGivenName(e.target.value);
                                            checkGivenName(e.target.value);}} />
                                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"givenNameSpan" + user.id}>Invalid Name</span>
                                    </div>
                                    <div class="form-control w-full mb-5 col-span-1">
                                        <label class="label">
                                            <span class="label-text">Family Name:</span>
                                        </label>
                                        <input type="text" value={family_name} class="input input-bordered w-full max-w-xs" onChange={(e) => {
                                            setFamilyName(e.target.value);
                                            checkFamilyName(e.target.value);}} />
                                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"familyNameSpan" + user.id}>Invalid Name</span>
                                    </div>
                                </div>
                                <label for={'modal-edit-user' + user.id} id={"confirmChange" + user.id} className="btn bg-indigo-600 mx-auto flex" onClick={editUser}>Confirm Changes</label>
                        </div>
                    </div>
                    <label for={"modal-delete-user" + user.id} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cursor-pointer w-6 h-6 stroke-red-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </label>

                    <input type="checkbox" id={"modal-delete-user" + user.id} class="modal-toggle" />
                    <div class="modal">
                        <div class="modal-box w-auto h-auto overflow-x-hidden">
                            <h3 class="font-bold text-lg">Are you sure you want to delete user {given_name} {family_name}?</h3>
                            {/* <p class="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p> */}
                            <div class="modal-action flex justify-center items-center text-center">
                                <label for={"modal-delete-user" + user.id} className="btn btn-ghost btn-sm bg-zinc-400 mr-5">Cancel</label>
                                <label for={"modal-delete-user" + user.id} className="btn btn-ghost btn-sm bg-red-600 ml-5" onClick={deleteUser}>Confirm</label>
                            </div>
                        </div>
                    </div>
                </td> 
            :   role === "superadmin" && loginFlow === "bank" && user.id !== localStorage.getItem("currentUser_id") ?
                <td className='flex'>
                    <label for={'modal-edit-user' + user.id}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="cursor-pointer w-6 h-6 mr-3 stroke-green-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                    </label>
                    <input type="checkbox" id={'modal-edit-user' + user.id} class="modal-toggle" />
                    <div class="modal">
                        <div class="modal-box bg-indigo-100 absolute pb-5">
                            <label for={'modal-edit-user' + user.id} class="btn btn-sm btn-circle absolute right-2 top-2 bg-black-500" onClick={revertChanges}>✕</label>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <div class="form-control mb-3 col-span-2">
                                        <label class="label">
                                            <span class="label-text">Email:</span>
                                        </label>
                                        <input type="text" value={email} class="input input-bordered w-full" onChange={(e)=> {
                                            setEmail(e.target.value);
                                            checkEmail(e.target.value);}}/>
                                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"emailSpan" + user.id}>Invalid Email</span>
                                    </div>
                                    <div class="form-control w-full mb-5 col-span-1">
                                        <label class="label">
                                            <span class="label-text">Given Name:</span>
                                        </label>
                                        <input type="text" value={given_name} class="input input-bordered w-full max-w-xs" onChange={(e) => {
                                            setGivenName(e.target.value);
                                            checkGivenName(e.target.value);}} />
                                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"givenNameSpan" + user.id}>Invalid Name</span>
                                    </div>
                                    <div class="form-control w-full mb-5 col-span-1">
                                        <label class="label">
                                            <span class="label-text">Family Name:</span>
                                        </label>
                                        <input type="text" value={family_name} class="input input-bordered w-full max-w-xs" onChange={(e) => {
                                            setFamilyName(e.target.value);
                                            checkFamilyName(e.target.value);}} />
                                        <span className="text-red-700 font-light text-xs" style={{ display: "none" }} id={"familyNameSpan" + user.id}>Invalid Name</span>
                                    </div>
                                </div>
                                <label for={'modal-edit-user' + user.id} id={"confirmChange" + user.id} className="btn bg-indigo-600 mx-auto flex" onClick={editUser}>Confirm Changes</label>
                        </div>
                    </div>
                    <label for={"modal-delete-user" + user.id} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cursor-pointer w-6 h-6 stroke-red-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </label>

                    <input type="checkbox" id={"modal-delete-user" + user.id} class="modal-toggle" />
                    <div class="modal">
                        <div class="modal-box w-auto h-auto overflow-x-hidden">
                            <h3 class="font-bold text-lg">Are you sure you want to delete user {given_name} {family_name}?</h3>
                            {/* <p class="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p> */}
                            <div class="modal-action flex justify-center items-center text-center">
                                <label for={"modal-delete-user" + user.id} className="btn btn-ghost btn-sm bg-zinc-400 mr-5">Cancel</label>
                                <label for={"modal-delete-user" + user.id} className="btn btn-ghost btn-sm bg-red-600 ml-5" onClick={deleteUser}>Confirm</label>
                            </div>
                        </div>
                    </div>
                </td> 
            : loginFlow === "bank" ?
                <Fragment>
                    <td>{user.gender}</td>
                    <td>{user.birthdate} </td>
                    <td>{user.phone_number} </td>
                </Fragment>
            :   <td></td>
            }
        </tr>
    )
}

export default BankUsers
