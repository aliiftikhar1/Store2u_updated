'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaShippingFast,
  FaBoxOpen,
  FaClipboardList,
  FaTruck,
  FaTimesCircle,
} from 'react-icons/fa';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  // Initialize with current date
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // State to hold the stats data
  const [statsData, setStatsData] = useState(null);

  // State to hold the sales data for the graph
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Revenue',
        data: [],
        borderColor: '#34D399', // Tailwind Green
        backgroundColor: 'rgba(52, 211, 153, 0.2)', // Lighter green
      },
    ],
  });

  // Function to fetch data from the API
  const fetchData = async (startDate, endDate) => {
    try {
      // Format dates as YYYY-MM-DD
      const date1 = startDate.toISOString().split('T')[0];
      const date2 = endDate.toISOString().split('T')[0];

      const response = await fetch('/api/dashboard/allorders', {
        method: 'POST',
        body: JSON.stringify({ date1, date2 }),
      });

      console.log("The response is : ",response);
      const result = await response.json();

      if (response.ok) {
        // Update stats data
        setStatsData(result.data);

        // Prepare sales data for the graph
        // Here, we'll assume that the API provides daily revenue data in the result.
        // If not, you may need to adjust this part based on your actual API response.

        // For demonstration, let's create dummy sales data
        const salesLabels = [];
        const salesValues = [];

        // Generate dates between startDate and endDate
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          salesLabels.push(
            currentDate.toLocaleDateString('default', {
              month: 'short',
              day: 'numeric',
            })
          );
          // For demonstration, sum up amounts from all statuses for each day
          const totalAmountForDay = 0; // Replace with actual data if available
          salesValues.push(totalAmountForDay);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Update the sales data state
        setSalesData({
          labels: salesLabels,
          datasets: [
            {
              label: 'Revenue',
              data: salesValues,
              borderColor: '#34D399',
              backgroundColor: 'rgba(52, 211, 153, 0.2)',
            },
          ],
        });
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch data on component mount with initial dates
  useEffect(() => {
    fetchData(startDate, endDate);
  }, []);

  // Handler for the Filter button
  const handleFilter = () => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  };

  // Prepare stats for display
  const stats = useMemo(() => {
    if (!statsData) return [];

    return [
      {
        label: 'Pending Orders',
        value: statsData.pending.count,
        amount: statsData.pending.amount,
        icon: <FaClipboardList size={28} />,
        color: 'bg-yellow-500',
      },
      {
        label: 'Paid Orders',
        value: statsData.paid.count,
        amount: statsData.paid.amount,
        icon: <FaBoxOpen size={28} />,
        color: 'bg-blue-500',
      },
      {
        label: 'Shipped Orders',
        value: statsData.shipped.count,
        amount: statsData.shipped.amount,
        icon: <FaTruck size={28} />,
        color: 'bg-indigo-500',
      },
      {
        label: 'Completed Orders',
        value: statsData.completed.count,
        amount: statsData.completed.amount,
        icon: <FaShippingFast size={28} />,
        color: 'bg-green-500',
      },
      {
        label: 'Cancelled Orders',
        value: statsData.cancelled.count,
        amount: statsData.cancelled.amount,
        icon: <FaTimesCircle size={28} />,
        color: 'bg-red-500',
      },
    ];
  }, [statsData]);

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: 'Sales Over Time',
        font: {
          family: 'Inter, sans-serif',
          size: 18,
        },
      },
    },
  };

  return (
    <>
      {/* Main Content */}
      <div className="pt-6 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Date Pickers */}
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-8">
            <div className="flex space-x-4 justify-center items-center">
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholderText="Start date"
                />
              </div>
              <div className="flex justify-center items-center">-</div>
              <div>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholderText="End date"
                />
              </div>
              <div>
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition duration-300"
                  onClick={handleFilter}
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition duration-300"
                >
                  <div className="flex items-center">
                    <div
                      className={`p-4 rounded-full text-white ${stat.color} mr-4`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        {stat.label}
                      </h3>
                      <p className="text-2xl font-extrabold text-gray-900">
                        <span className="text-3xl">{stat.value}</span> Orders
                      </p>
                      <p className="text-md text-gray-500 mt-1">
                        Amount: ${stat.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading stats...</p>
          )}

          {/* Sales Graph */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Sales Overview
            </h2>
            <Line data={salesData} options={options} />
          </div>
        </div>
      </div>
    </>
  );
}
