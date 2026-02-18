import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Order } from '@/types/database';

interface SalesChartsProps {
  orders: Order[];
}

const COLORS = ['hsl(15, 85%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)', 'hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)'];

export function SalesCharts({ orders }: SalesChartsProps) {
  const dailyRevenue = useMemo(() => {
    const last7Days: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
      last7Days[key] = 0;
    }

    orders
      .filter(o => o.status === 'paid' || o.status === 'completed')
      .forEach(order => {
        const date = new Date(order.created_at);
        const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 6) {
          const key = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
          if (last7Days[key] !== undefined) {
            last7Days[key] += order.total_amount;
          }
        }
      });

    return Object.entries(last7Days).map(([name, revenue]) => ({ name, revenue }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0, paid: 0, processing: 0, completed: 0, cancelled: 0
    };
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    return Object.entries(statusCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  const hourlyOrders = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;
    
    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours();
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count,
    }));
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(15, 85%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status Pie */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                  {ordersByStatus.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Orders */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Hour</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyOrders}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
