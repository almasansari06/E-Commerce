import React, { useState } from 'react'
import './CSS/LoginSignup.css'

export default function LoginSignup() {

const [state, setState] = useState('Login');
const [formData, setFormData] = useState({
  name: '',
  password: '',
  email: '',
});
const [error, setError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

const changeHandler = (event) => {
  setFormData({ ...formData, [event.target.name]: event.target.value });
  setError('');
}

const submitHandler = async (event) => {
  event.preventDefault();
  setIsSubmitting(true);
  setError('');

  try {
    const endpoint = state === 'Login' ? '/login' : '/signup';
    const response = await fetch(`http://localhost:4000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      throw new Error(responseData.message || 'Something went wrong.');
    }

    localStorage.setItem('auth-token', responseData.token);
    window.location.replace('/');
  } catch (requestError) {
    setError(requestError.message || 'Unable to connect to the server.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <form onSubmit={submitHandler}>
          <div className="loginsignup-fields">
            {state === 'Sign Up' && <input required name='name' value={formData.name} onChange={changeHandler} type="text" placeholder='Full name' />}
            <input required name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email address' />
            <input required minLength="6" name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
          </div>
          {error && <p className="loginsignup-error">{error}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : 'Continue'}</button>
        </form>
        {state==="Sign Up"
        ?<p className="loginsignup-login">Already have an account? <span onClick ={()=>{setState("Login")}}>Login here</span></p>
      :<p className="loginsignup-login">Create an account? <span onClick ={()=>{setState("Sign Up")}}>Click here</span></p>}
        
        <div className="loginsignup-agree">
          <input type="checkbox"name= '' id= '' />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>
      </div>
      
    </div>
  )
}
