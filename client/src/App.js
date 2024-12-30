import './App.css';
import GoogleAuth from "./Components/GoogleAuth";
import AzureAuth from './Components/AzureAuth';

function App() {
  return (
    <div className="App">
      <h1>OAuth Integration</h1>
      <GoogleAuth />
      <AzureAuth />
    </div>
  );
}

export default App;
