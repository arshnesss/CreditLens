import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { getCustomers, seedBenchmarkCustomers, CustomerProfile, predictRisk } from '../api/client';
import { Link } from 'react-router-dom';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers({
        page,
        limit: 15,
        search: search || undefined,
        risk_category: riskFilter || undefined,
        segment: segmentFilter || undefined
      });
      setCustomers(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, riskFilter, segmentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedBenchmarkCustomers(100);
      setPage(1);
      await fetchCustomers();
    } catch (err) {
      console.error('Seeding failed', err);
    } finally {
      setSeeding(false);
    }
  };

  const getRiskBadge = (category?: string, prob?: number) => {
    if (!category) {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          Unassessed
        </span>
      );
    }
    if (category.toLowerCase() === 'low') {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Low Risk {prob !== undefined ? `(${(prob * 100).toFixed(0)}%)` : ''}
        </span>
      );
    }
    if (category.toLowerCase() === 'medium') {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Medium Risk {prob !== undefined ? `(${(prob * 100).toFixed(0)}%)` : ''}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
        High Risk {prob !== undefined ? `(${(prob * 100).toFixed(0)}%)` : ''}
      </span>
    );
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="Customer Directory"
        subtitle="Search, filter, and inspect credit portfolio records and assessment history"
      />

      <div className="p-8 space-y-6 flex-1">
        {/* Controls Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer code (e.g. C1001)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Risk Category Filters */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {['', 'Low', 'Medium', 'High'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setRiskFilter(cat); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    riskFilter === cat
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat || 'All Risk'}
                </button>
              ))}
            </div>

            {/* Seed Benchmark Records Button */}
            {total < 50 && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Database className="h-3.5 w-3.5" />
                {seeding ? 'Seeding Records...' : 'Seed 100 Accounts'}
              </button>
            )}
          </div>
        </div>

        {/* Customer Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Customer Code</th>
                  <th className="px-6 py-3.5">Segment</th>
                  <th className="px-6 py-3.5">Credit Line</th>
                  <th className="px-6 py-3.5">Age</th>
                  <th className="px-6 py-3.5">Recent Repayment (Pay 0)</th>
                  <th className="px-6 py-3.5">Assessed Risk</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Loading customer directory...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <p className="text-sm font-semibold text-slate-700">No customers found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or click 'Seed 100 Accounts'.</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        {c.customer_code}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.segment}</td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-800">
                        ${c.limit_bal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.age} yrs</td>
                      <td className="px-6 py-4">
                        {c.pay_0 > 0 ? (
                          <span className="font-semibold text-rose-600">
                            {c.pay_0} mo delay
                          </span>
                        ) : c.pay_0 === 0 ? (
                          <span className="text-emerald-700 font-medium">Revolving paid</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Paid in full</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getRiskBadge(c.latest_prediction?.risk_category, c.latest_prediction?.probability)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing {customers.length > 0 ? (page - 1) * 15 + 1 : 0} to{' '}
              {Math.min(page * 15, total)} of {total} accounts
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 border border-slate-200 rounded hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 border border-slate-200 rounded hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Customer Detail Drawer Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Customer Profile: {selectedCustomer.customer_code}
                  </h3>
                  <p className="text-xs text-slate-500">Segment: {selectedCustomer.segment}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Approved Credit Limit</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${selectedCustomer.limit_bal.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Age & Marital Status</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedCustomer.age} yrs • {selectedCustomer.marriage === 1 ? 'Married' : 'Single'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Recent Bill Statement</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${selectedCustomer.bill_amt1.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Recent Payment Amount</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${selectedCustomer.pay_amt1.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Repayment History Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Historical Repayment Status
                </h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
                  <span>Sep: {selectedCustomer.pay_0}</span>
                  <span>Aug: {selectedCustomer.pay_0}</span>
                  <span>Jul: {selectedCustomer.pay_0}</span>
                  <span>Jun: 0</span>
                  <span>May: 0</span>
                  <span>Apr: 0</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Link
                  to="/risk-assessment"
                  state={{ prefillCustomer: selectedCustomer }}
                  className="flex-1 text-center py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Score in Risk Assessment
                </Link>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
