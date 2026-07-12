import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, FileSpreadsheet, FileDown, Printer, AlertCircle } from 'lucide-react';
import { exportToCSV, exportToExcel, triggerPrint } from '../utils/exportHelpers';

const Table = ({ 
  columns, 
  data = [], 
  loading = false, 
  searchPlaceholder = "Search...", 
  searchKeys = [], 
  filterElement, // Optional custom filters element
  exportFilename = "data-export",
  printTitle = "Attendance System Report",
  actions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply Search
    if (searchQuery.trim() && searchKeys.length > 0) {
      result = result.filter(item => {
        return searchKeys.some(key => {
          const val = item[key];
          return val ? String(val).toLowerCase().includes(searchQuery.toLowerCase()) : false;
        });
      });
    }

    // Apply Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchKeys, sortConfig]);

  // Pagination calculations
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Adjust page number if it exceeds total pages after filtering
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Export handlers
  const handleExportCSV = () => {
    const exportData = processedData.map(item => {
      const cleanItem = {};
      columns.forEach(col => {
        if (col.key) cleanItem[col.label] = item[col.key];
      });
      return cleanItem;
    });
    exportToCSV(exportData, `${exportFilename}.csv`);
  };

  const handleExportExcel = () => {
    const exportData = processedData.map(item => {
      const cleanItem = {};
      columns.forEach(col => {
        if (col.key) cleanItem[col.label] = item[col.key];
      });
      return cleanItem;
    });
    exportToExcel(exportData, `${exportFilename}.xls`);
  };

  const handlePrint = () => {
    const headers = columns.map(col => col.label);
    const rows = processedData.map(item => {
      return columns.map(col => {
        if (col.render) {
          // Strips HTML or returns plain text if possible
          const renderedVal = col.render(item);
          return typeof renderedVal === 'object' ? (item[col.key] || '') : renderedVal;
        }
        return item[col.key] || '';
      });
    });
    triggerPrint(printTitle, headers, rows);
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="h-3 w-3 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-indigo-500" />
      : <ChevronDown className="h-3 w-3 text-indigo-500" />;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search, Filter & Exports Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {searchKeys.length > 0 && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white/70 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-550/30 focus:border-indigo-550 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200 transition-all"
              />
            </div>
          )}
          {filterElement}
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={handleExportCSV}
            disabled={totalItems === 0 || loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="hidden md:inline">CSV</span>
          </button>
          <button 
            onClick={handleExportExcel}
            disabled={totalItems === 0 || loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Excel</span>
          </button>
          <button 
            onClick={handlePrint}
            disabled={totalItems === 0 || loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Table Shell (Glassmorphic) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/60 shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-left text-xs">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/30">
              {columns.map((col, index) => (
                <th 
                  key={index}
                  onClick={() => col.sortable && col.key && handleSort(col.key)}
                  className={`px-5 py-3.5 font-bold uppercase tracking-wider text-slate-400 select-none ${col.sortable && col.key ? 'cursor-pointer group' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && col.key && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-600 dark:text-slate-300">
            {loading ? (
              // Skeleton Loader
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <tr key={rIdx} className="shimmer-effect">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-24"></div>
                    </td>
                  ))}
                  {actions && <td className="px-5 py-4"><div className="ml-auto h-3 rounded bg-slate-200 dark:bg-slate-800 w-12"></div></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                    <span className="font-semibold text-slate-400 dark:text-slate-600">No records found</span>
                    <span className="text-[10px] text-slate-400">Try adjusting your filters or search keywords</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((item, rIdx) => (
                <tr 
                  key={item.id || rIdx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-5 py-3.5 whitespace-nowrap align-middle">
                      {col.render ? col.render(item) : (item[col.key] !== undefined ? item[col.key] : '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-3.5 whitespace-nowrap text-right align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && !loading && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row text-xs text-slate-500 font-medium px-1">
          <div>
            Showing <span className="text-slate-700 dark:text-slate-300">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-slate-700 dark:text-slate-300">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-slate-700 dark:text-slate-300">{totalItems}</span> records
          </div>
          
          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span>Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:border-indigo-500 text-[11px]"
              >
                {[5, 10, 20, 50].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pg = idx + 1;
                  // Show current page, and a few near ones
                  if (pg === 1 || pg === totalPages || Math.abs(pg - currentPage) <= 1) {
                    return (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                          currentPage === pg 
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10' 
                            : 'border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  }
                  // Show ellipses
                  if (pg === 2 || pg === totalPages - 1) {
                    return <span key={pg} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
