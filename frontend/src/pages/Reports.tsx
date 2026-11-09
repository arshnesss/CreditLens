import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import {
  FileText,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  ExternalLink
} from 'lucide-react';
import { getReports, generateReport, ReportItem } from '../api/client';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form state for generating a report
  const [reportType, setReportType] = useState<'customer' | 'portfolio'>('customer');
  const [targetId, setTargetId] = useState('C1000');
  const [notes, setNotes] = useState('Quarterly risk compliance review.');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReportsList = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsList();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSuccessMsg('');
    try {
      await generateReport({
        report_type: reportType,
        target_id: reportType === 'customer' ? targetId : 'PORTFOLIO_BENCHMARK',
        notes
      });
      setSuccessMsg(`Successfully generated ${reportType} report.`);
      await fetchReportsList();
    } catch (err: any) {
      alert(`Report generation failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header
        title="Credit Risk Audit Reports & Official PDF Export"
        subtitle="Customer-level and portfolio-level risk audits generated from actual backend intelligence"
      />

      <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Generator Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Generate New Audit Risk Documentation
              </h2>
              <p className="text-xs text-slate-500">
                Produces structured compliance findings with model calibration scores and downloadable PDF.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Report Scope</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 font-medium"
              >
                <option value="customer">Individual Customer Audit</option>
                <option value="portfolio">Overall Portfolio Summary</option>
              </select>
            </div>

            {reportType === 'customer' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Identifier</label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="e.g. C1000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:border-blue-500"
                />
              </div>
            )}

            <div className={reportType === 'customer' ? 'md:col-span-2' : 'md:col-span-3'}>
              <label className="font-semibold text-slate-700 block mb-1">Analyst Audit Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Audit notes or rationale..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-600 font-medium">{successMsg}</span>
              <button
                type="submit"
                disabled={generating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
              >
                {generating ? 'Compiling PDF Report...' : 'Generate Official Report & PDF'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Reports List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Generated Risk Audit Reports
            </h3>
            <span className="text-xs text-slate-400">{reports.length} reports logged</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading audit records...</div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No reports generated yet. Click 'Generate Official Report & PDF' above to create your first report.
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        r.report_type === 'customer' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {r.report_type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{r.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{r.summary}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {r.pdf_available && (
                      <a
                        href={`/api/reports/${r.id}/download-pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
