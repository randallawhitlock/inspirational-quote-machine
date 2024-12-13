import QuotesDisplay from './components/QuotesDisplay';
import './styles/App.css';

const App = () => {
  return (
    <div className="app-container">
      {/* Animated background elements */}
      <div className="background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      {/* Content */}
      <div className="content-container">
        <div className="max-w-3xl mx-auto px-4">
          <QuotesDisplay />
        </div>
      </div>
    </div>
  );
};

export default App;