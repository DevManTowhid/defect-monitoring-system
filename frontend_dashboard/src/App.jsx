import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the Node.js Gateway
const socket = io('http://localhost:3000');

function App() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Listen for the WebSocket event triggered by Node.js
    socket.on('defect-alert', (data) => {
      console.log("New defect received:", data);
      // Add the new alert to the top of the list
      setAlerts((prevAlerts) => [data, ...prevAlerts]);
    });

    return () => {
      socket.off('defect-alert');
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Real-Time Defect Monitor</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {alerts.map((alert, index) => (
          <div key={index} style={{ border: '1px solid red', padding: '10px', borderRadius: '8px' }}>
            <h3>⚠️ Defect Detected</h3>
            <p><strong>File:</strong> {alert.filename}</p>
            <p><strong>Confidence:</strong> {(alert.confidence * 100).toFixed(1)}%</p>
            
            {/* Render the Base64 mask sent from Python -> Node -> React */}
            <img 
              src={`data:image/png;base64,${alert.mask_base64}`} 
              alt="Defect Mask" 
              style={{ width: '100%', backgroundColor: '#f0f0f0' }} 
            />
          </div>
        ))}
      </div>
      
      {alerts.length === 0 && <p>System monitoring... No defects detected yet.</p>}
    </div>
  );
}

export default App;