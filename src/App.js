import './App.css';
import LineStringModal from './component/LineStringModal';
import PolygonModal from './component/PolygonModal';
function App() {
  return (
    <div className="App">
    <h5 style={{color: '#000'}}>An application using react and openlayers.</h5>
      <LineStringModal />
      <PolygonModal />
    </div>
  );
}

export default App;
