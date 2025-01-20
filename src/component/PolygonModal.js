// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Draw, defaults as defaultInteractions } from 'ol/interaction';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Modal, Button, Dropdown, DropdownButton } from 'react-bootstrap';

const PolygonModal = () => {
  const mapRef = useRef();
  const drawRef = useRef();
  const vectorSourceRef = useRef(new VectorSource());
  const [waypoints, setWaypoints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [drawMode, setDrawMode] = useState('');

  const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = toLonLat(coord1);
    const [lon2, lat2] = toLonLat(coord2);
    const R = 6371000; // Radius of the Earth in meters
    const rad = (deg) => (deg * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleDrawEnd = (event) => {
    const coordinates = event.feature.getGeometry().getCoordinates()[0];
    let distance = 0;
    const updatedWaypoints = coordinates.map((coord, index) => {
      if (index > 0) {
        distance += calculateDistance(coordinates[index - 1], coord);
      }
      return {
        wp: `WP(${index.toString().padStart(2, '0')})`,
        coord: toLonLat(coord),
        distance: distance.toFixed(2),
      };
    });
    setWaypoints(updatedWaypoints);
    setShowModal(true);
  };

  const startDrawing = (mode) => {
    setDrawMode(mode);
    setWaypoints([]);
    const drawInteraction = new Draw({
      source: vectorSourceRef.current,
      type: 'Polygon',
    });

    drawRef.current = drawInteraction;
    mapRef.current.addInteraction(drawRef.current);

    drawInteraction.on('drawend', handleDrawEnd);

    // Handle the Enter key to stop drawing
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && drawRef.current) {
        drawRef.current.finishDrawing();
        setShowModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  };

  const handleInsertPolygon = (position) => {
    setDrawMode(position);
    setShowModal(false);
    startDrawing();
  };

  useEffect(() => {
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([77.1025, 28.7041]), // Example coordinates for New Delhi, India
        zoom: 10,
      }),
      interactions: defaultInteractions().extend([]),
    });

    mapRef.current = map;

    return () => {
      if (drawRef.current) {
        map.removeInteraction(drawRef.current);
      }
      map.setTarget(null);
    };
  }, []);

  const renderWaypoints = () => {
    return waypoints.map((wp, index) => (
      <li key={index}  style={{listStyle: 'none'}}>  <input type='checkbox' />  
        {wp.coord[1].toFixed(8)}, {wp.coord[0].toFixed(8)} <span style={{padding: '4rem'}}>{wp.distance} </span>
        <DropdownButton id={`dropdown-${index}`} title="..." variant="secondary" style={{paddingLeft: '22rem', paddingTop: '-3rem'}}>
          <Dropdown.Item onClick={() => handleInsertPolygon('before')}>Insert Polygon Before</Dropdown.Item>
          <Dropdown.Item onClick={() => handleInsertPolygon('after')}>Insert Polygon After</Dropdown.Item>
        </DropdownButton>
      </li>
    ));
  };

  return (
    <div  style={{padding: '1.5rem', background: '#000', color: '#fff', marginTop: '5rem'}}> 
      <Button onClick={() => startDrawing('Polygon')} variant="primary" className='my-3'>Draw Polygon</Button> <span>Start drawing Polygon here</span>
      <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mission Creation</Modal.Title>
        </Modal.Header>
         <Modal.Header><div style={{ display: 'flex',flexDirection: 'row', 
                            alignItems: 'center', justifyContent: 'center', 
                            alignContent: 'space-between', color: '#000', fontWeight: '600'}}>
                            
                            <div style={{paddingRight: '14rem'}}><input type='checkbox' /> {" "} WP <span>Coordinates</span></div>
                            <div> <span>Distance(m) </span></div>
                           
                           
                        </div></Modal.Header>
        <Modal.Body>
          {waypoints.length > 0 ? <ul style={{paddingRight: '0'}}>{renderWaypoints()}</ul> : <p>No waypoints yet. Start drawing to see waypoints.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PolygonModal;
