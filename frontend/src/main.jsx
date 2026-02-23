//Importa la librería React (necesaria para JSX y componentes).
import React from "react";

//Importa la API de React 18 para crear la raíz y renderizar en el navegador (createRoot).
import ReactDOM from "react-dom/client";

//Importa el AppRouter, que es quien define las rutas de la aplicación (qué pantalla se muestra según la URL).
import AppRouter from "./router/AppRouter";

//Importa el AuthProvider, que es quien gestiona el estado de autenticación y permisos.
import { AuthProvider } from "./context/AuthContext";

/*Crea la raíz de la aplicación y renderiza el AppRouter dentro del AuthProvider.

document.getElementById("root") obtiene el elemento <div id="root"> del HTML (normalmente en index.html).

createRoot(document.getElementById("root")) crea el "root" de React (el punto de entrada de la aplicación).

.render() dibuja el árbol de componentes dentro de ese nodo.

<AuthProvider>: envuelve la app para que cualquier componente pueda usar el contexto de autenticación (usuario, login, logout, etc.).
<AppRouter />: define qué componente se muestra según la ruta (por ejemplo /login, /dashboard).

*/

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <AppRouter />
    </AuthProvider>
);