import React from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const AuthToken = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // TODO: shift this code to mybank 
  // TODO: save the access token to local storage/cookie/memory
  useEffect(() => {
    // window.location.href='http://localhost:3000/'
    console.log(localStorage.getItem('code_verifier'));
    const postToAuthApp = () => {
      fetch('https:localhost:4000/oauth/token', {
          method: 'POST',
          body: JSON.stringify({
              'auth_code' : searchParams.get('code'),
              'code_verifier' : localStorage.getItem('code_verifier'),
              'client_id' : 'cMZ8riSFzCrLUwDCkd3awhx5pFLURjW5th2aWfm13ws',
              'client_secret' : 'PLT2bDFO0zU-8j1pADf-VqzZNMJqaQKyy0K-O5XMGPk'
          }),
          headers: {
              'Content-type': 'application/json',
          },
      }).then(
          (response) => console.log(response.data)
      ).catch((err) => {
          console.log(err.message);
      });
    }
    postToAuthApp();
  }, [])
  return (
    <div>{searchParams.get('code')}</div>
  )
}

export default AuthToken

