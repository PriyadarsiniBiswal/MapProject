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
import { Modal, Button } from 'react-bootstrap';
import { FaArrowUpFromBracket } from "react-icons/fa6";

const LineStringModal = () => {
    const mapRef = useRef();
    const drawRef = useRef();
    const vectorSourceRef = useRef(new VectorSource());
    const [waypoints, setWaypoints] = useState([]);
    const [showModal, setShowModal] = useState(false);

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
        const coordinates = event.feature.getGeometry().getCoordinates();
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

    const startDrawing = () => {
       
        setWaypoints([]);
        const drawInteraction = new Draw({
            source: vectorSourceRef.current,
            type: 'LineString',
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
                zoom: 8,
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



    return (
        <div style={{padding: '1.5rem', background: '#000', color: '#fff', marginTop: '2rem'}}>
             
            <Button onClick={startDrawing} variant="primary" className='my-3'>Draw</Button> <span>Start drawing LineString</span>  
           
            <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mission Creation</Modal.Title>
                </Modal.Header>
                <Modal.Header><div style={{ display: 'flex',flexDirection: 'row', 
                    alignItems: 'center', justifyContent: 'center', 
                    alignContent: 'space-between', color: '#000', fontWeight: '600'}}>
                    
                    <div style={{paddingRight: '14rem'}}><input type='checkbox' /> {" "} WP <span>Coordinates</span></div>
                    <div> <span>Distance(m) <FaArrowUpFromBracket style={{ color: 'skyblue' }} /> </span></div>
                   
                   
                </div></Modal.Header>
                <Modal.Body>

                    {waypoints.length > 0 ?

                        waypoints.map((wp, index) => (

                            <ul style={{paddingLeft: '0'}}> 
                                <li key={index}  style={{listStyle: 'none'}}>  <input type='checkbox' />   
                                  <span style={{paddingLeft: '1.2rem'}}>{wp.coord[1].toFixed(8)}, {wp.coord[0].toFixed(8)} </span>  
                                  <span style={{padding: '4rem'}}>{wp.distance}</span>  
                                </li>
                            </ul>
                        ))
                        : <p>Click on the map to mark points of the route and then press </p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowModal(false)} >
                        Generate Data
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};



export default LineStringModal;
