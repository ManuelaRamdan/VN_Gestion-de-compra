//AppRouter, que es quien define las rutas de la aplicación (qué pantalla se muestra según la URL).
import AppRouter from "./router/AppRouter";

//App, que es el componente principal de la aplicación.
//Solo hace una cosa: renderizar <AppRouter />.
//Toda la lógica de rutas (Login, Dashboard, etc.) está dentro de AppRouter.
function App() {
  return <AppRouter />;
}

export default App;

