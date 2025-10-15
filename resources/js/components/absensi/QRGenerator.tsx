import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import QRCode from 'qrcode.react';
import api from '../services/api';

const QRGenerator = ({ studentId }) => {
  const [qrToken, setQrToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const generateQR = async () => {
    try {
      const response = await api.post(`/students/${studentId}/generate-qr`);
      setQrToken(response.data.qr_token);
      setExpiresAt(new Date(response.data.expires_at));
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((expiresAt - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);

      if (diff <= 0) {
        clearInterval(timer);
        setQrToken(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h5" gutterBottom>QR Code Absensi</Typography>
      
      {qrToken ? (
        <>
          <Box sx={{ p: 2, border: '1px dashed grey', display: 'inline-block', mb: 2 }}>
            <QRCode value={qrToken} size={200} />
          </Box>
          <Typography>
            QR code akan kadaluarsa dalam: {timeLeft} detik
          </Typography>
        </>
      ) : (
        <Button variant="contained" onClick={generateQR}>
          Generate QR Code
        </Button>
      )}
    </Box>
  );
};

export default QRGenerator;