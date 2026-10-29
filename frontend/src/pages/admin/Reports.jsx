import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import RevenueChart from '../../components/charts/RevenueChart';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  DollarSign,
  Store,
  ArrowUpRight,
  Calendar,
  Filter,
  RotateCcw,
  Download,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

// Injects the market's type system once, without touching index.html
const useMarketFonts = () => {
  useEffect(() => {
    if (document.getElementById("rentmart-fonts")) return;
    const link = document.createElement("link");
    link.id = "rentmart-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
  }, []);
};

const displayStyle = { fontFamily: "'Archivo Black', sans-serif" };
const monoStyle = { fontFamily: "'IBM Plex Mono', monospace" };

const AdminReports = () => {
  useMarketFonts();
  const currentYearNum = new Date().getFullYear();

  const [data, setData] = useState({
    kpis: { totalCollections: 0, occupancyRate: '0%' },
    revenueChart: [],
    revenuePerformance: {
      year: [],
      month: [],
      days: []
    },
    filteredTotal: 0,
    filteredCount: 0,
    filteredTransactions: []
  });

  const [loading, setLoading] = useState(false);

  // Filter States: Year, Month, Range Date (From & To)
  const [selectedYear, setSelectedYear] = useState(String(currentYearNum));
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenuePeriod, setRevenuePeriod] = useState('days'); // Keep the day as requested

  const monthsList = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const yearsList = [
    { value: '', label: 'All Years' },
    { value: String(currentYearNum), label: String(currentYearNum) },
    { value: String(currentYearNum - 1), label: String(currentYearNum - 1) },
    { value: String(currentYearNum - 2), label: String(currentYearNum - 2) },
    { value: String(currentYearNum - 3), label: String(currentYearNum - 3) }
  ];

  const revenuePeriods = [
    { key: 'days', label: 'Day', subtitle: 'Daily market space collections overview' },
    { key: 'month', label: 'Month', subtitle: 'Monthly market space collections overview' },
    { key: 'year', label: 'Year', subtitle: 'Yearly market space collections overview' }
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth) params.append('month', selectedMonth);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('period', revenuePeriod);

      const res = await api.get(`/dashboard/admin?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedMonth, startDate, endDate, revenuePeriod]);

  // Synchronize date boundary when Year changes
  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    if (newYear && selectedMonth) {
      const y = parseInt(newYear, 10);
      const m = parseInt(selectedMonth, 10);
      const daysInMonth = new Date(y, m, 0).getDate();
      setStartDate(`${y}-${String(m).padStart(2, '0')}-01`);
      setEndDate(`${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
    } else if (newYear && !selectedMonth) {
      setStartDate(`${newYear}-01-01`);
      setEndDate(`${newYear}-12-31`);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Synchronize date boundary when Month changes
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    const yr = selectedYear || String(currentYearNum);
    if (!selectedYear) setSelectedYear(yr);

    if (newMonth) {
      const y = parseInt(yr, 10);
      const m = parseInt(newMonth, 10);
      const daysInMonth = new Date(y, m, 0).getDate();
      setStartDate(`${y}-${String(m).padStart(2, '0')}-01`);
      setEndDate(`${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
      setRevenuePeriod('days'); // Show day-by-day for the selected month!
    } else {
      setStartDate(`${yr}-01-01`);
      setEndDate(`${yr}-12-31`);
    }
  };

  // Reset all filters back to all-year default
  const handleResetFilters = () => {
    setSelectedYear(String(currentYearNum));
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setRevenuePeriod('days');
  };

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    const list = data.filteredTransactions || [];
    if (list.length === 0) return;

    const headers = [
      'Reference No.',
      'Payment Date',
      'Renter Name',
      'Email',
      'Market Stall',
      'Payment Type',
      'Payment Method',
      'Amount Paid (PHP)'
    ];

    const rows = list.map((t) => [
      `"${t.reference_number || 'N/A'}"`,
      `"${formatDate(t.payment_date)}"`,
      `"${t.first_name || ''} ${t.last_name || ''}"`,
      `"${t.email || ''}"`,
      `"${t.space_number || ''}"`,
      `"${t.payment_type || ''}"`,
      `"${t.payment_method || ''}"`,
      `"${parseFloat(t.amount_paid || 0).toFixed(2)}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filenameYear = selectedYear || 'All';
    const filenameMonth = selectedMonth ? `Month${selectedMonth}` : 'All';
    link.setAttribute('download', `Duero_Market_Revenue_Report_${filenameYear}_${filenameMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeRevenueData =
    data.revenuePerformance?.[revenuePeriod] ||
    data.revenuePerformance?.[revenuePeriod + 's'] ||
    (revenuePeriod === 'month' ? data.revenueChart : []);

  const getDynamicSubtitle = () => {
    const monthObj = monthsList.find((m) => m.value === selectedMonth);
    const monthName = monthObj && monthObj.value ? monthObj.label : '';

    if (startDate && endDate) {
      if (revenuePeriod === 'days') return `Daily collections from ${startDate} to ${endDate}`;
      if (revenuePeriod === 'month') return `Monthly collections from ${startDate} to ${endDate}`;
      return `Yearly collections from ${startDate} to ${endDate}`;
    }

    if (selectedYear && monthName) {
      if (revenuePeriod === 'days') return `Daily collections for ${monthName} ${selectedYear}`;
      return `Collections overview for ${monthName} ${selectedYear}`;
    }

    if (selectedYear) {
      if (revenuePeriod === 'days') return `Daily collections across ${selectedYear}`;
      if (revenuePeriod === 'month') return `Monthly collections across ${selectedYear}`;
      return `Collections overview for Year ${selectedYear}`;
    }

    return 'Collections overview for Duero Public Market';
  };

  const hasActiveFilters = Boolean(selectedMonth || (startDate && endDate) || selectedYear !== String(currentYearNum));

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>
              Reports & Collection Analytics
            </h1>
            <p className="text-sm text-[#241C15]/50 font-medium">
              Filter by year, month, or custom date range with day-by-day revenue breakdown and exportable records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!data.filteredTransactions || data.filteredTransactions.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-sm cursor-pointer ${
              data.filteredTransactions && data.filteredTransactions.length > 0
                ? 'bg-[#0F3D37] hover:bg-[#0c332e] text-[#FBF6EA] shadow-[#0F3D37]/20'
                : 'bg-[#241C15]/10 text-[#241C15]/40 cursor-not-allowed shadow-none'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#241C15]/60">
              <Filter className="w-4 h-4 text-[#C1440E]" />
              <span>Report Filters (Year, Month & Date Range)</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#C1440E] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Year Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#241C15]/50 mb-1.5">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-xs font-bold text-[#241C15] focus:outline-none focus:border-[#0F3D37]"
              >
                {yearsList.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#241C15]/50 mb-1.5">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-xs font-bold text-[#241C15] focus:outline-none focus:border-[#0F3D37]"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range: From */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#241C15]/50 mb-1.5">
                Range Date From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-xs font-medium text-[#241C15] focus:outline-none focus:border-[#0F3D37]"
              />
            </div>

            {/* Date Range: To */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#241C15]/50 mb-1.5">
                Range Date To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-xs font-medium text-[#241C15] focus:outline-none focus:border-[#0F3D37]"
              />
            </div>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
            style={{ borderLeft: '4px solid #0F3D37' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">
                Period Collections
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0F3D37]/10 text-[#0F3D37]">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0F3D37]" style={monoStyle}>
              {formatCurrency(data.filteredTotal !== undefined ? data.filteredTotal : data.kpis.totalCollections)}
            </p>
            <p className="text-xs font-semibold text-[#0F3D37] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>For selected period/filter</span>
            </p>
          </div>

          <div
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
            style={{ borderLeft: '4px solid #C1440E' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">
                Period Payments Count
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#C1440E]/10 text-[#C1440E]">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>
              {data.filteredCount !== undefined ? data.filteredCount : (data.filteredTransactions?.length || 0)}
            </p>
            <p className="text-xs font-semibold text-[#C1440E]">
              Receipts recorded in range
            </p>
          </div>

          <div
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
            style={{ borderLeft: '4px solid #241C15' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">
                Lifetime Collections
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#241C15]/10 text-[#241C15]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>
              {formatCurrency(data.kpis.totalCollections)}
            </p>
            <p className="text-xs font-semibold text-[#241C15]/50">
              All-time verified payments
            </p>
          </div>

          <div
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
            style={{ borderLeft: '4px solid #E8A33D' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">
                Current Occupancy
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E8A33D]/10 text-[#E8A33D]">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>
              {data.kpis.occupancyRate}
            </p>
            <p className="text-xs font-semibold text-[#8a5f1f]">
              Active stall leases
            </p>
          </div>
        </div>

        {/* Revenue Performance Chart Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#241C15]">Revenue Performance</h3>
              <p className="text-xs text-[#241C15]/40">{getDynamicSubtitle()}</p>
            </div>

            {/* Timeframe Filter Tabs: Day | Weeks | Month | Year */}
            <div className="inline-flex p-1 bg-[#F6EFDE] rounded-xl border border-[#241C15]/8 self-start sm:self-auto">
              {revenuePeriods.map((p) => {
                const active = revenuePeriod === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setRevenuePeriod(p.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0F3D37] text-white shadow-xs'
                        : 'text-[#241C15]/60 hover:text-[#241C15] hover:bg-black/5'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <RevenueChart data={activeRevenueData} period={revenuePeriod} />
        </div>

        {/* Filtered Period Transactions Table */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#241C15]">Period Transaction Records</h3>
              <p className="text-xs text-[#241C15]/40">
                Detailed municipal receipts recorded within the selected period
              </p>
            </div>
            <span className="text-xs font-bold text-[#0F3D37] bg-[#0F3D37]/10 px-3 py-1 rounded-full">
              {data.filteredTransactions?.length || 0} Transactions Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Renter</th>
                  <th className="py-3 px-4">Stall Space</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241C15]/8 text-sm">
                {!data.filteredTransactions || data.filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-[#241C15]/40 font-medium">
                      No payment transactions recorded for the selected filter.
                    </td>
                  </tr>
                ) : (
                  data.filteredTransactions.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-[#F6EFDE]/50 transition">
                      <td className="py-3 px-4 text-xs font-bold text-[#241C15]/70" style={monoStyle}>
                        {t.reference_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#241C15]/60 font-medium">
                        {formatDate(t.payment_date)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#241C15] text-xs">
                          {t.first_name} {t.last_name}
                        </p>
                        <p className="text-[11px] text-[#241C15]/40">{t.email}</p>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-[#0F3D37]">
                        {t.space_number || 'Market Stall'}
                      </td>
                      <td className="py-3 px-4 text-xs capitalize text-[#241C15]/70">
                        {t.payment_type ? t.payment_type.replace('_', ' ') : 'Monthly'}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#241C15]/70">
                        {t.payment_method || 'Cash'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#0F3D37] text-xs" style={monoStyle}>
                        {formatCurrency(t.amount_paid)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
