import './App.css';
import LineStringModal from './component/LineStringModal';
import PolygonModal from './component/PolygonModal';
function App() {
  return (
    <div className="App">
    <h4 style={{color: '#000'}}>An application using react and openlayers</h4>
      <LineStringModal />
      <PolygonModal />
    </div>
  );
}

export default App;
