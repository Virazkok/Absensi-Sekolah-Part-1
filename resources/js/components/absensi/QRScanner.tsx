import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useEffect, useState } from 'react';


interface Props {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScannerComponent: React.FC<Props> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        } else {
          setError('No camera devices found');
        }
      } catch (err) {
        setError('Failed to access cameras');
        console.error('Camera enumeration error:', err);
      }
    };

    getCameras();
  }, []);

  const handleScan = (codes: IDetectedBarcode[]) => {
    if (codes.length > 0) {
      onScan(codes[0].rawValue);
    }
  };

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown scanner error';
    console.error('Scanner error:', error);
    setError(errorMessage);
  };

  return (
    <div className="scanner-container">
      {error && (
        <div className="error-message p-4 bg-red-100 text-red-700 rounded mb-4">
          {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
      )}

      {cameraDevices.length > 0 ? (
        <Scanner
          key={selectedDevice}
          onScan={handleScan}
          onError={handleError}
          constraints={{
            deviceId: selectedDevice,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 60 },
          }}
          styles={{
            container: { 
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              position: 'relative'
            },
            video: {
              width: '100%',
              borderRadius: '8px',
              
            }
          }}
        />
      ) : (
        <div className="no-camera p-4 bg-yellow-100 text-yellow-800 rounded">
          Camera not available. Please check your device permissions.
        </div>
      )}

      {cameraDevices.length > 1 && (
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="mt-4 block w-full p-2 border rounded"
        >
          {cameraDevices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${index + 1}`}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={onClose}
        className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded w-full"
      >
        Close Scanner
      </button>
    </div>
  );
};

export default QrScannerComponent;