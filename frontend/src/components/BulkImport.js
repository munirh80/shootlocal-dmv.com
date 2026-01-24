import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { adminSession } from '../pages/AdminLogin';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BulkImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.csv') && 
        !selectedFile.name.endsWith('.xlsx') &&
        !selectedFile.name.endsWith('.xls')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/bulk-import`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${adminSession.getToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setResult(response.data);
      
      if (response.data.imported > 0) {
        toast.success(`Successfully imported ${response.data.imported} ranges!`);
        onImportComplete && onImportComplete();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.detail || 'Import failed');
      setResult({
        success: false,
        error: error.response?.data?.detail || 'Import failed'
      });
    } finally {
      setImporting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2 text-orange-500" />
          Bulk Import Ranges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Upload a CSV or Excel file to import multiple ranges at once. 
          Required columns: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">name</code>, 
          <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">address</code>, 
          <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">city</code>, 
          <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">state</code>
        </p>
        
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
              : 'border-slate-300 dark:border-slate-600'
            }
            ${file ? 'bg-slate-50 dark:bg-slate-800' : ''}
          `}
        >
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <FileSpreadsheet className="w-10 h-10 text-green-500" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="ml-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Drag and drop your file here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-orange-500 hover:text-orange-600 font-medium">
                  browse to upload
                </span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
        
        {/* Import Button */}
        {file && !result && (
          <Button
            onClick={handleImport}
            disabled={importing}
            className="mt-4 bg-orange-500 hover:bg-orange-600"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Ranges
              </>
            )}
          </Button>
        )}
        
        {/* Results */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {result.success ? (
              <>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Import Complete</span>
                </div>
                <p className="text-sm">
                  Successfully imported <strong>{result.imported}</strong> out of <strong>{result.total_rows}</strong> ranges.
                </p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      {result.errors.length} row(s) skipped:
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {result.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>...and {result.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{result.error}</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFile}
              className="mt-3"
            >
              Import Another File
            </Button>
          </div>
        )}
        
        {/* Template Download */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 mb-2">
            Need a template? Download our sample CSV:
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csvContent = "name,address,city,state,zip_code,phone,website,indoor,outdoor\nExample Range,123 Main St,Arlington,VA,22201,+1 555-1234,https://example.com,true,false";
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'range_import_template.csv';
              a.click();
            }}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkImport;
