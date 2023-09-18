import React from 'react'
import NavBar from './NavBar'
import BankUsers from './BankUsers'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const MyBank = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [role, setRole] = useState('');
    const [error, setError] = useState(true);
    const [loginFlow, setLoginFlow] = useState('');
    const [users, setUsers] = useState([
        // {
        //     'email' : "kangchinshen@gmail.com",
        //     'firstName' : 'kang',
        //     'lastName' : 'chin shen',
        //     'uid' : "123456789zxc",
        //     'status' : "inactive",
        //     'actions' : "read/write"
        // },
        // {
        //     'email' : "chinshenkang@gmail.com",
        //     'firstName' : 'chin',
        //     'lastName' : 'shen kang',
        //     'uid' : "987654321abc",
        //     'status' : "active",
        //     'actions' : "read/write"
        // },
        // {
        //     'email' : "shenchinkang@gmail.com",
        //     'firstName' : 'shen',
        //     'lastName' : 'chin kang',
        //     'uid' : "0101010101jkl",
        //     'status' : "active",
        //     'actions' : "read/write"
        // },
    ]);
    const callKang = () => {
        let url = "https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/refresh_access_token_1";
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                'refresh_token': localStorage.getItem("refresh_token"),
                'email' : localStorage.getItem("email"),
                "id" : localStorage.getItem("id")
            }),
        }).then(response => response.json())
        .then(data => {
            console.log(data);
            localStorage.setItem("access_token", data.access_token);
        })
    }

    const getOneUser = (role, loginFlow) => {
        const userInfoUrl = `https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/${loginFlow}/oauth/userinfo`
        fetch(userInfoUrl, {
            method: 'GET',
            headers: {
                authorizationToken: localStorage.getItem("access_token"),
            },
        }).then(response => response.json())
        .then(data => {
            // example data
            // {
            //     "email": "nicolas.kihn@dietrich.net",
            //     "given_name": "Nicolas",
            //     "family_name": "Kihn",
            //     "name": "Nicolas Kihn",
            //     "birthdate": "1975-04-12T00:00:00.000Z",
            //     "id": "0042e904-0473-48d3-8175-f1fd06db0b64",
            //     "status": "pending"
            // }
            console.log("get 1 user:");
            console.log(data);
            // let user = {
            //     "email": data.email,
            //     "given_name": data.given_name,
            //     "family_name": data.family_name,
            //     "id": data.id,
            //     "status": data.status
            // }
            localStorage.setItem("currentUser_given_name", data.given_name);
            localStorage.setItem("currentUser_family_name", data.family_name);
            localStorage.setItem("currentUser_email", data.email);
            // console.log("user info from local storage: " + localStorage.getItem("currentUser"));
            if(loginFlow === "hosted_login") {
                localStorage.setItem("currentUser_id", data.id);
            } else {
                localStorage.setItem("currentUser_id", data.sub);
            }
            if(role === "user" && loginFlow === "hosted_login") {
                setUsers([{
                    "email": data.email,
                    "given_name": data.given_name,
                    "family_name": data.family_name,
                    "id": data.id,
                    "status": data.status,
                }]);
            } else if(role === "user" && loginFlow === "bank") {
                setUsers([{
                    "email": data.email,
                    "given_name": data.given_name,
                    "family_name": data.family_name,
                    "id": data.sub,
                    "status": "pending",
                    "phone_number" : data.phone_number,
                    "gender" : data.gender,
                    "birthdate" : data.birthdate
                }]);
            }
        })
    }

    const getAllUsers = () => {
        const allUsersInfoUrl = `https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/usersinfo`
        fetch(allUsersInfoUrl, {
            method: 'GET',
            headers: {
                authorizationToken: localStorage.getItem("access_token"),
            },
        }).then(response => response.json())
        .then(data => {
            // example data
            // [
            //     {
            //         "email": "nicolas.kihn@dietrich.net",
            //         "given_name": "Nicolas",
            //         "family_name": "Kihn",
            //         "name": "Nicolas Kihn",
            //         "birthdate": "1975-04-12T00:00:00.000Z",
            //         "id": "0042e904-0473-48d3-8175-f1fd06db0b64",
            //         "status": "pending"
            //     },
            //     {
            //         "email": "nicolas.kihn@dietrich.net",
            //         "given_name": "Nicolas",
            //         "family_name": "Kihn",
            //         "name": "Nicolas Kihn",
            //         "birthdate": "1975-04-12T00:00:00.000Z",
            //         "id": "0042e904-0473-48d3-8175-f1fd06db0b64",
            //         "status": "pending"
            //     },
            // ]
            console.log("get all users: ");
            console.log(data);
            const newUsers = data.map(user => {
                return {
                    "email": user.email,
                    "given_name": user.given_name,
                    "family_name": user.family_name,
                    "id": user.id,
                    "status": user.status,
                }
            })
            setUsers(newUsers);
        })
    }

    const fetchUserInfoBasedOnRoleAndLoginFlow = (role, loginFlow) => {
        getOneUser(role, loginFlow);
        if(role !== "user") {
            getAllUsers(loginFlow);
        }
            // if (role === 'user') {
            //     //GET own user details and setUsers() -> will be array of len 1
            //     getOneUser(loginFlow);
            // } else {
            //     //GET all user details and setUsers()
            //     getAllUsers(loginFlow);
            // }
    }

    const checkExpiry = () => {
        console.log("--------checking expiry------")
        let token = "eyJhbGciOiJSUzI1NiJ9.eyJyb2xlIjoidGVzdF9yb2xlIiwiZW1haWwiOiJ0ZXN0X2VtYWlsIiwiaWF0IjoxNjgwNDUxOTA4LCJleHAiOjE2ODA0NTkxMDgsImlzcyI6IkJhbmsgQXBwIiwiYXVkIjoiaHR0cDovL3Byb2plY3QtMjAyMi0yM3QyLWcxLXQ0LXMzLnMzLXdlYnNpdGUtdXMtZWFzdC0xLmFtYXpvbmF3cy5jb20ifQ.Y78lQ4LVxO5-54PX3S5loDVvtKchKX_RVEZmVMq53YSp4BcECIm1TTfhC0bLI7CKkWtWKR2stvVtzAWH3UAp5lN3g4y3ihdNR203vTkD9FsyLqUmBR97AY-e4D7szqvSGsQlfUTIlhsvHdLq6wdToEFyiNae4qBmoLDz_FXRYh7__EaSxsq3MIAgZj2-odiFut3it59PM16qQuKnryhIa4nJQ-hCzQp4QN1rTf8wWQXec8kGpbqZiC0WlJiBIueFLJCcbZnpJI7ZPB7V2MmVNFKSwxFqFyAxv7QRFpqMGWyZ6bygDhTJilJR9h76pdItv6Fz38ozqU0M9UUobJGTpw";
        let parts = token.split('.');
        let payload = JSON.parse(atob(parts[1]));
        console.log(payload);
        let exp = payload["exp"];
        console.log(Date.now());
        if(Date.now() < exp * 1000) {
            console.log("token expired");
        }
        console.log(JSON.parse(atob(parts[0])));
        console.log(JSON.parse(atob(parts[1]))["exp"]);
        console.log("----finish checking expiry-----");
    }

  // TODO: save the access token to local storage/cookie/memory
    useEffect(() => {
        try {
            if(!searchParams.get('bankAccessToken') && !searchParams.get('code') && !localStorage.getItem("id_token")) {
                console.log("unauthorized");
                window.location.href="/invalidaccess";
            }
            checkExpiry();
            // console.log(localStorage.getItem('code_verifier: ' + code_verifier));
            if (searchParams.get('bankAccessToken')) {
                const bankAccessToken = searchParams.get('bankAccessToken');
                const bankIdToken = searchParams.get('bankIdToken');
                localStorage.setItem("access_token", bankAccessToken);
                localStorage.setItem("id_token", bankIdToken);
                
                let parts = bankIdToken.split(".");
                let payload = JSON.parse(atob(parts[1]));
                setLoginFlow('bank');
                setRole(payload.role);
                fetchUserInfoBasedOnRoleAndLoginFlow(payload.role, 'bank');
                // localStorage.setItem("username", payload.username);
            } else if (searchParams.get('code')) {
                const postUrl = "https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/hosted_login/oauth/token";
                console.log("code verifier: " + localStorage.getItem('code_verifier'));
                console.log("auth_code: " + searchParams.get('code'));
                const postToAuthApp = () => {
                    fetch(postUrl, {
                        method: 'POST',
                        body: JSON.stringify({
                            'auth_code' : searchParams.get('code'),
                            'code_verifier' : localStorage.getItem('code_verifier'),
                            'client_id' : 'cMZ8riSFzCrLUwDCkd3awhx5pFLURjW5th2aWfm13ws',
                            'client_secret' : 'PLT2bDFO0zU-8j1pADf-VqzZNMJqaQKyy0K-O5XMGPk'
                        }),
                        headers: {
                            'credentials': 'include',
                            'Content-type': 'application/json',
                        },
                    }).then(response => response.json())
                    .then(data => {
                        //access token + refresh token
                        console.log(data)
                        console.log(data["access_token"]);
                        console.log(data["id_token"]);
                        console.log(data["refresh_token"]);
                        localStorage.setItem("access_token", data["access_token"]);
                        localStorage.setItem("id_token", data["id_token"]);
                        localStorage.setItem("refresh_token", data["refresh_token"]);
                        console.log("TEST 1: " + data["id_token"]);
                        // replace with data.token or something idk whats the variable name
                        // let token = JSON.parse(data);
                        // console.log("TEST 2: " + token);
                        let id_token = data["id_token"];
                        // let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
                        // console.log(parseJwt(token["id_token"]));
                        let parts = id_token.split(".");
                        let header = JSON.parse(atob(parts[0]));
                        let payload = JSON.parse(atob(parts[1]));
                        // console.log(parts[2]);
                        // // let signature = atob(parts[2]); //this token signature doesnt work idky
                        console.log(header);
                        console.log(payload.role);
                        setRole(payload.role);
                        setLoginFlow('hosted_login');
                        fetchUserInfoBasedOnRoleAndLoginFlow(payload.role, 'hosted_login');
                    })
                    .catch((err) => {
                        console.log(err.message);
                    });
                }

                postToAuthApp();
            } else {
                let id_token = localStorage.getItem("id_token");
                console.log("id_token from local storage: " + id_token);
                let parts = id_token.split('.');
                let payload = JSON.parse(atob(parts[1]));
                let role = payload.role;
                console.log("role: " + role);
                setRole(role);
                const loginFlow = localStorage.getItem("refresh_token") ? 'hosted_login' : 'bank';
                setLoginFlow(loginFlow);
                fetchUserInfoBasedOnRoleAndLoginFlow(role, loginFlow);
            }
        } catch (err) {
            setError(true);
            console.log(err.message);
        }
    }, [searchParams])

  return (
    <div>
        <NavBar loginFlow={loginFlow}/>
        <div className="flex">
            <h1 className='text-3xl mb-10 ml-56 font-bold'>
                My Bank 
            </h1>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 ml-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
        </div>
        {users.length > 0 && loginFlow === "bank" && role === "user"?
            <div className="overflow-x-auto h-screen relative">
                <table className="table table-compact w-3/4 mx-auto">
                    <thead className="sticky top-0">
                    <tr>
                        <th classname="sticky">Email</th> 
                        <th classname="sticky">First Name</th> 
                        <th classname="sticky">Last Name</th> 
                        <th classname="sticky">User ID</th> 
                        <th classname="sticky">Status</th> 
                        <th classname="sticky">Gender</th> 
                        <th classname="sticky">Birthdate</th> 
                        <th classname="sticky">Phone Number</th> 
                    </tr>
                    </thead> 
                    <tbody>
                        {users.map(function(user, i){
                            return <BankUsers user={user} setUsers={setUsers} users={users} key={user.id} role={role} loginFlow={loginFlow}/>;
                        })}
                    </tbody>
                </table>
            </div>
        : users.length > 0 ?
            <div className="overflow-x-auto h-screen">
                <table className="table table-compact w-3/4 mx-auto relative">
                    <thead classname="sticky top-0 absolute">
                    <tr>
                        <th classname="sticky top-0 absolute">Email</th> 
                        <th classname="sticky top-0 absolute">First Name</th> 
                        <th classname="sticky top-0 absolute">Last Name</th> 
                        <th classname="sticky top-0 absolute">User ID</th> 
                        <th classname="sticky top-0 absolute">Status</th> 
                        {
                            role === "superadmin" 
                            ?<th classname="sticky top-0 absolute">Actions</th>
                            :<th></th>
                        } 
                    </tr>
                    </thead> 
                    <tbody>
                        {users.map(function(user, i){
                            return <BankUsers user={user} setUsers={setUsers} users={users} key={user.uid} role={role} loginFlow={loginFlow}/>;
                        })}
                    </tbody>
                </table>
            </div>
        :    <div className="flex items-center justify-center text-center text-2xl font-medium">
                <button className="btn btn-ghost btn-xl loading text-xl">Loading bank users..</button>
            </div>
        }
    </div>
  )
}

export default MyBank