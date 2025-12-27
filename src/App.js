import Chatbot from './components/Chatbot';
import '../src/App.css';

function App() {
  return (

    <div className="app-container">
      <iframe
        src="https://www.gniindia.org/"
        className="embedded-site"
        title="Bot"
      />
      <Chatbot className="chatbot" />
    </div>
  );
}

export default App;
