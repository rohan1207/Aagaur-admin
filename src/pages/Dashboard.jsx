import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const products = await apiFetch('/products');
        const offers = await apiFetch('/offers');
        const orders = await apiFetch('/orders');
        setStats({ products: products.length, offers: offers.length, orders: orders.length });
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard label="Products" value={stats.products} />
      <StatCard label="Offers" value={stats.offers} />
      <StatCard label="Orders" value={stats.orders} />
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <div className="text-3xl font-bold mb-2">{value}</div>
    <div className="text-gray-600 dark:text-gray-400">{label}</div>
  </div>
);

export default Dashboard;
