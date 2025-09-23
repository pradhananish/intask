import React, { useState, useEffect, useRef } from 'react';


const App = () => {
  const [metrics, setMetrics] = useState({
    cpu: '--',
    memory: '--',
    network: '--',
    disk: '--',
  });
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const dataHistoryRef = useRef({
    labels: [],
    cpu: [],
    memory: [],
    network: [],
    disk: [],
  });

  const generateData = () => ({
    cpu: Math.floor(Math.random() * 100) + 1,
    memory: Math.floor(Math.random() * 100) + 1,
    network: Math.floor(Math.random() * 50) + 1,
    disk: Math.floor(Math.random() * 20) + 1,
  });

  useEffect(() => {
    // Dynamically load Chart.js and then initialize the chart
    const loadChartJs = async () => {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        const ctx = chartRef.current.getContext('2d');
        const initialData = {
          labels: [],
          datasets: [
            { label: 'CPU Usage', data: [], borderColor: '#2563eb', tension: 0.3, fill: false },
            { label: 'Memory Usage', data: [], borderColor: '#9333ea', tension: 0.3, fill: false },
            { label: 'Network Traffic', data: [], borderColor: '#16a34a', tension: 0.3, fill: false },
            { label: 'Disk I/O', data: [], borderColor: '#dc2626', tension: 0.3, fill: false },
          ],
        };

        chartInstanceRef.current = new window.Chart(ctx, {
          type: 'line',
          data: initialData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'category',
                title: { display: true, text: 'Time' },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Value' },
                grid: { color: '#e5e7eb' },
              },
            },
          },
        });

      } catch (error) {
        console.error("Failed to load Chart.js:", error);
      }
    };

    if (typeof window !== 'undefined' && chartRef.current && !chartInstanceRef.current) {
        loadChartJs();
    }

    const interval = setInterval(() => {
      const newData = generateData();
      setMetrics(newData);

      const now = new Date();
      const timeLabel = now.toLocaleTimeString();

      dataHistoryRef.current.labels.push(timeLabel);
      dataHistoryRef.current.cpu.push(newData.cpu);
      dataHistoryRef.current.memory.push(newData.memory);
      dataHistoryRef.current.network.push(newData.network);
      dataHistoryRef.current.disk.push(newData.disk);

      const maxDataPoints = 15;
      if (dataHistoryRef.current.labels.length > maxDataPoints) {
        dataHistoryRef.current.labels.shift();
        dataHistoryRef.current.cpu.shift();
        dataHistoryRef.current.memory.shift();
        dataHistoryRef.current.network.shift();
        dataHistoryRef.current.disk.shift();
      }

      if (chartInstanceRef.current) {
        chartInstanceRef.current.data.labels = dataHistoryRef.current.labels;
        chartInstanceRef.current.data.datasets[0].data = dataHistoryRef.current.cpu;
        chartInstanceRef.current.data.datasets[1].data = dataHistoryRef.current.memory;
        chartInstanceRef.current.data.datasets[2].data = dataHistoryRef.current.network;
        chartInstanceRef.current.data.datasets[3].data = dataHistoryRef.current.disk;
        chartInstanceRef.current.update();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 font-sans bg-white">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            System Monitoring Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Real-time metrics over time.           </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-700">CPU Usage</h3>
            <p className="text-4xl font-bold mt-2 text-blue-600">{metrics.cpu}%</p>
          </div>
          <div className="p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Memory Usage</h3>
            <p className="text-4xl font-bold mt-2 text-purple-600">{metrics.memory}%</p>
          </div>
          <div className="p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Network Traffic</h3>
            <p className="text-4xl font-bold mt-2 text-green-600">{metrics.network} KB/s</p>
          </div>
          <div className="p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Disk I/O</h3>
            <p className="text-4xl font-bold mt-2 text-red-600">{metrics.disk} MB/s</p>
          </div>
        </div>

        <div className="p-6">
          <canvas ref={chartRef} className="w-full h-96"></canvas>
        </div>
      </div>
    </div>
  );
};

export default App;

