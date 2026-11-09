import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getSegmentAnalytics, getRiskDistribution, getHighRiskAccounts } from '../api/client';
import { Link } from 'react-router-dom';

export const PortfolioAnalytics: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [highRisk, setHighRisk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [segData, distData, hrData] = await Promise.all([
          getSegmentAnalytics(),
          getRiskDistribution(),
          getHighRiskAccounts(10)
        ]);
        setSegments(segData);
        setDistribution(distData);
        setHighRisk(hrData);
      } catch (err) {
        console.error('Failed to load portfolio analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const segmentChartData = segments.map(s => ({
    name: s.segment.replace(' Prime', '').replace(' Delinquent', ''),
    defaultRate: Number((s.default_rate * 100).toFixed(1)),
    totalCount: s.total_count
  }));

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="Portfolio Risk Analytics & High-Risk Segments"
        subtitle="Segment-level default rates, probability histograms, and priority attention clusters"
      />

      <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Segment Default Rate Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Default Rate by Customer Segment
                </h2>
                <span className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md font-semibold">
                  Delinquent: 39.8%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Observed historical default proportion across customer categories
              </p>
            </div>

            <div className="h-64 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Default Rate`, 'Empirical Default']}
                  />
                  <Bar dataKey="defaultRate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
              <span>Revolving Delinquent segment is 2.6x riskier than Established Prime.</span>
            </div>
          </div>

          {/* Probability Bucket Histogram */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Calibrated Default Probability Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Number of borrowers across calibrated default probability intervals
              </p>
            </div>

            <div className="h-64 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} accounts`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
              <span>Over 50% of the benchmark portfolio clusters in the safe &lt;20% PD band.</span>
            </div>
          </div>
        </div>

        {/* High-Risk Accounts Priority Attention Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                Priority High-Risk Accounts Requiring Analyst Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked by repayment arrears recency and outstanding exposure
              </p>
            </div>
            <Link
              to="/customers"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View Full Directory &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Segment</th>
                  <th className="px-6 py-3">Exposure ($)</th>
                  <th className="px-6 py-3">Age</th>
                  <th className="px-6 py-3">Repayment Status</th>
                  <th className="px-6 py-3">Estimated PD</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highRisk.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{c.customer_code}</td>
                    <td className="px-6 py-3.5 text-slate-600">{c.segment}</td>
                    <td className="px-6 py-3.5 font-mono">${c.limit_bal.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{c.age}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-rose-600">{c.pay_0} months delay</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {(c.estimated_default_probability * 100).toFixed(0)}% PD
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to="/risk-assessment"
                        state={{ prefillCustomer: c }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Assess &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
