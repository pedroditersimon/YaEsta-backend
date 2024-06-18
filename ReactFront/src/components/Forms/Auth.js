import apiClient from "../../Services/ApiClient/apiClient.mjs";
import { useState } from "react";

import {useFormInput} from "../../hooks/useFormInput";

import './Auth.css';

export function Login() {
    const [isLoading, setLoading] = useState(false);
    const [loggedUser, setLoggedUser] = useState("");
    const usernameInput = useFormInput('', isLoading);
    const passwordInput = useFormInput('', isLoading);

    async function handleLoginClick() {
        setLoading(true);
        const isLogged = await apiClient.login(usernameInput.value, passwordInput.value);

        if (isLogged) {
            setLoggedUser(usernameInput.value);
            usernameInput.clear();
            passwordInput.clear();
        }
        else {
            setLoggedUser("");
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <p className="auth-title">Inicia sesión</p>
            <input className="auth-input" placeholder="Username" {...usernameInput} />
            <input className="auth-input" placeholder="Password" type="password" {...passwordInput} />
            <button className="auth-button" disabled={isLoading} onClick={handleLoginClick}>Iniciar sesión</button>
            {loggedUser && <p>Bienvenido ({loggedUser})</p>}
            {isLoading && <p className="loading-text">Loading...</p>}
        </div>
    );
}

export function Register() {
    const [isLoading, setLoading] = useState(false);
    const usernameInput = useFormInput('', isLoading);
    const passwordInput = useFormInput('', isLoading);
    const confirmPasswordInput = useFormInput('', isLoading);

    async function handleClick() {
        setLoading(true);
        const isLogged = await apiClient.register(usernameInput.value, passwordInput.value, confirmPasswordInput.value);
        
        if (isLogged) {
            usernameInput.clear();
            passwordInput.clear();
            confirmPasswordInput.clear();
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <p className="auth-title">Registrarse</p>
            <input id="r_username" className="auth-input" placeholder="Username" {...usernameInput} />
            <input id="r_password" className="auth-input" placeholder="Password" type="password" {...passwordInput} />
            <input id="r_password2" className="auth-input" placeholder="Confirm Password" type="password" {...confirmPasswordInput} />
            <button className="auth-button" disabled={isLoading} onClick={handleClick}>Registrarse</button>
            {isLoading && <p className="loading-text">Loading...</p>}
        </div>
    );
}
