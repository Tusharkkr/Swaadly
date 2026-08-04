import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {
    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Sign Up");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState({ name: "", email: "", password: "" });

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((currentData) => ({ ...currentData, [name]: value }));
    };

    const switchMode = () => {
        setCurrState((currentState) => currentState === "Login" ? "Sign Up" : "Login");
        setData((currentData) => ({ ...currentData, name: "" }));
    };

    const onLogin = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        if (currState === "Sign Up" && data.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setIsSubmitting(true);
        const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";
        try {
            const response = await axios.post(url + endpoint, {
                name: data.name.trim(),
                email: data.email.trim(),
                password: data.password
            });
            if (!response.data.success || !response.data.token) {
                toast.error(response.data.message || "Authentication failed");
                return;
            }

            const authToken = response.data.token;
            setToken(authToken);
            localStorage.setItem("token", authToken);
            toast.success(currState === "Login" ? "Logged in successfully!" : "Account created successfully!");
            try {
                await loadCartData(authToken);
            } catch (cartError) {
                console.error("Unable to load cart after authentication", cartError);
            }
            setShowLogin(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to connect to the server. Please check backend server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='login-popup' role='dialog' aria-modal='true' aria-labelledby='login-title'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2 id='login-title'>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" && <input name='name' onChange={onChangeHandler} value={data.name} type='text' placeholder='Your name' autoComplete='name' required />}
                    <input name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Email address' autoComplete='email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type='password' placeholder='Password (minimum 8 characters)' autoComplete={currState === "Login" ? "current-password" : "new-password"} minLength={8} required />
                </div>
                <button type='submit' disabled={isSubmitting}>{isSubmitting ? "Please wait..." : currState === "Login" ? "Login" : "Create account"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" name="terms" id="terms" required />
                    <label htmlFor="terms">By continuing, I agree to the terms of use &amp; privacy policy.</label>
                </div>
                {currState === "Login"
                    ? <p>Don't have an account? <span onClick={switchMode}>Sign up</span></p>
                    : <p>Already have an account? <span onClick={switchMode}>Log in</span></p>}
            </form>
        </div>
    );
};

export default LoginPopup;