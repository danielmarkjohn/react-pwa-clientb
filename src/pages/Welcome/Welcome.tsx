import React, { useRef, useState } from 'react';

// Import CSS file
import axios from 'axios';

import './Welcome.css';
import fileContent from './tower.png';

// Import file using JavaScript module syntax

const Welcome: React.FC = () => {
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const runSpeedTest = async () => {
    handleGenerateDataStructure();
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor(time % 1000);

    return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
  };

  const formatElapsedTime = (elapsedTime: number) => {
    const milliseconds = Math.floor(elapsedTime % 1000);
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

    return (
      padZero(hours) +
      ':' +
      padZero(minutes) +
      ':' +
      padZero(seconds) +
      '.' +
      padZero(milliseconds, 3)
    );
  };

  function padZero(value: number, length = 2) {
    return value.toString().padStart(length, '0');
  }

  function formatBytes(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${value} ${sizes[i]}`;
  }

  function calculateLatency(apiResponseTime: any, uploadTime: any) {
    const responseMs = Math.floor(apiResponseTime % 1000);
    const responseSeconds = Math.floor((apiResponseTime / 1000) % 60);
    const responseMinutes = Math.floor((apiResponseTime / (1000 * 60)) % 60);
    const responseHours = Math.floor(apiResponseTime / (1000 * 60 * 60));

    const uploadDate = new Date(uploadTime);
    const currentDateTime = new Date();
    const latency = currentDateTime.getTime() - uploadDate.getTime();

    const latencyMs = Math.floor(latency % 1000);
    const latencySeconds = Math.floor((latency / 1000) % 60);
    const latencyMinutes = Math.floor((latency / (1000 * 60)) % 60);
    const latencyHours = Math.floor(latency / (1000 * 60 * 60));

    return {
      apiResponseLatency: `${responseHours}h ${responseMinutes}m ${responseSeconds}s ${responseMs}ms`,
      uploadLatency: `${latencyHours}h ${latencyMinutes}m ${latencySeconds}s ${latencyMs}ms`,
    };
  }

  const handleGenerateDataStructure = async () => {
    let paragraph = 'ping';

    try {
      const apiStartTime = performance.now(); // Capture API start time

      const formData = new FormData();
      formData.append('file', new Blob([fileContent]), 'example.txt');

      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const apiEndTime = performance.now(); // Capture API response receive time
      const apiResponseTime = apiEndTime - apiStartTime; // Calculate the time delta

      console.log(response.data);

      // Additional metadata insights
      const addedDelay = response.data?.addedDelay;
      const fileSize = response.data?.fileSize;
      const throughput = response.data?.throughput;
      const uploadTime = response.data?.uploadTime;
      const networkLatency = calculateLatency(apiResponseTime, uploadTime);
      const networkThroughput = fileSize / (apiResponseTime / 1000);
      const networkRoundTripTime = apiResponseTime * 2;
      const totalProcessingTime = apiResponseTime + addedDelay;
      const totalRoundTripTime = totalProcessingTime + networkRoundTripTime;

      // Print log
      if (logRef.current) {
        logRef.current.innerHTML = `
          API Start Time: ${formatTime(apiStartTime)}
          <br />API End Time: ${formatTime(apiEndTime)}
          <br />API Response Time: ${formatTime(apiResponseTime)}
          <br />Added Delay Simulation: ${formatTime(addedDelay)}
          <br />Upload File Size: ${fileSize}
          <br />Upload File Throughput: ${throughput}
          <br />Upload Time: ${uploadTime}
          <br />API Response Latency: ${networkLatency?.apiResponseLatency}
          <br />Upload Latency: ${networkLatency?.uploadLatency}
          <br />Network Throughput: ${formatBytes(networkThroughput)}
          <br />Network Round Trip Time: ${formatTime(networkRoundTripTime)}
          <br />Total Processing Time: ${formatTime(totalProcessingTime)}
          <br />Total Round Trip Time: ${formatTime(totalRoundTripTime)}
        `;
      }
    } catch (error) {
      console.error('Error generating data structure:', error);
    }
  };

  return (
    <div className="speed-test-container">
      <button className="speed-test-button" onClick={runSpeedTest} disabled={isTesting}>
        SERVER
      </button>
      {downloadSpeed !== null && (
        <div className="speed-test-result">
          <h2>Download Speed: {downloadSpeed.toFixed(2)} Mbps</h2>
        </div>
      )}
      {uploadSpeed !== null && (
        <div className="speed-test-result">
          <h2>Upload Speed: {uploadSpeed.toFixed(2)} Mbps</h2>
        </div>
      )}
      <div className="speed-test-log" ref={logRef}></div>
    </div>
  );
};

export default Welcome;
