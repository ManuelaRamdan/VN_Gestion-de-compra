import { useState, useContext, useEffect } from "react";
import { loginRequest } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";
import "../styles/loging.css";
import Loading from "../components/Loading";
import { FaUser, FaLock } from "react-icons/fa";


function Login() {
  const { login, logout, sessionExpired } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const expired = localStorage.getItem("SESSION_EXPIRED");
    if (expired) logout(true);
    localStorage.removeItem("MANUAL_LOGOUT");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (sessionExpired) logout(false);

    try {
      const response = await loginRequest(username, password);
      const { token, rol, username: usernameResponse } = response.data;

      login(token, { username: usernameResponse, rol });
      if (rol === 'GERENCIA') {
        navigate('/aprobSolicitud'); // Gerencia aterriza aquí primero
      } else {
        navigate('/solicitudes'); // Calidad y Admin aterrizan aquí
      }
    } catch (error) {
      setErrorMessage("Credenciales incorrectas");
      localStorage.removeItem("SESSION_EXPIRED");

      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f9]">
      <div className="w-full max-w-[380px] bg-white rounded-xl px-7 py-8 shadow-lg border border-gray-200">
        <h2 className="mb-6 text-xl font-semibold text-center text-[var(--color1)]">
          Iniciar sesión
        </h2>

        {sessionExpired && (
          <p className="bg-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-3 text-center">
            Tu sesión expiró. Volvé a iniciar sesión.
          </p>
        )}

        {errorMessage && (
          <p className="bg-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-3 text-center">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* usuario */}
          <div className="relative flex items-center">
            <FaUser className="absolute left-3 text-[var(--color3)] text-sm" />
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[var(--color2)] focus:ring-4 focus:ring-[rgba(25,94,99,0.12)]"
            />
          </div>

          {/* password */}
          <div className="relative flex items-center">
            <FaLock className="absolute left-3 text-[var(--color3)] text-sm" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 pl-10 pr-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[var(--color2)] focus:ring-4 focus:ring-[rgba(25,94,99,0.12)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-lg font-semibold text-white bg-[var(--color1)] hover:bg-[var(--color2)] transition flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loading size={18} color="#fff" /> : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}


export default Login;