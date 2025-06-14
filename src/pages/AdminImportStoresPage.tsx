// src/pages/AdminImportStoresPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { cityServices } from '../lib/services';
import { supabase } from '../lib/supabase'; // Import Supabase client
import type { City } from '../lib/types';
import { UploadCloud, FileText, XCircle, CheckCircle } from 'lucide-react'; // Icons

const AdminImportStoresPage: React.FC = () => {
    const [targetCityId, setTargetCityId] = useState<string>('');
    const [cities, setCities] = useState<City[]>([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    
    const [selectedStoreFile, setSelectedStoreFile] = useState<File | null>(null);
    const [selectedReviewFile, setSelectedReviewFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Unified validation result state
    const [validationResult, setValidationResult] = useState<{
        type: 'store' | 'review';
        totalRowsProcessed: number;
        validForImportCount: number;
        duplicateCount: number;
        errorCount: number;
        validForImport: any[]; // Storing the valid data for the final import step
        errors: { row: Record<string, any>; error: string }[];
        duplicates: { row: Record<string, any>; existingStore: { id: string, name: string } }[];
    } | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Effect to auto-select all valid rows when validation completes
    useEffect(() => {
        if (validationResult?.validForImport) {
            const allIndices = new Set(validationResult.validForImport.map((_, index) => index));
            setSelectedRows(allIndices);
        }
    }, [validationResult]);
    // Fetch cities for the dropdown
    useEffect(() => {
        const fetchCities = async () => {
            setIsCitiesLoading(true);
            try {
                const cityData = await cityServices.getActiveCities();
                setCities(cityData);
                if (cityData.length > 0) {
                    setTargetCityId(cityData[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch cities", err);
                setError("Could not load cities for selection.");
            } finally {
                setIsCitiesLoading(false);
            }
        };
        fetchCities();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'store' | 'review') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && !file.name.endsWith('.xlsx')) {
                setError('Invalid file type. Please upload a .xlsx file.');
                fileType === 'store' ? setSelectedStoreFile(null) : setSelectedReviewFile(null);
                return;
            }
            if (fileType === 'store') {
                setSelectedStoreFile(file);
            } else {
                setSelectedReviewFile(file);
            }
            setError(null);
            setValidationResult(null);
        }
    };
    
    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            // This is a simplified drop handler. In a real app, you might want to know which drop zone was used.
            // For now, we'll assume if a store file isn't present, it's for stores, otherwise for reviews.
            const targetType = !selectedStoreFile ? 'store' : 'review';

            if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && !file.name.endsWith('.xlsx')) {
                setError('Invalid file type. Please upload a .xlsx file.');
                return;
            }
            
            if(targetType === 'store') setSelectedStoreFile(file);
            else setSelectedReviewFile(file);
            
            setError(null);
            setValidationResult(null);
            event.dataTransfer.clearData();
        }
    }, [selectedStoreFile]);

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleUploadAndValidate = async (fileType: 'store' | 'review') => {
        const fileToUpload = fileType === 'store' ? selectedStoreFile : selectedReviewFile;
        const functionName = fileType === 'store' ? 'process-store-excel' : 'process-review-excel';

        if (!fileToUpload) {
            setError(`Please select a ${fileType} file to upload.`);
            return;
        }
        if (!targetCityId) {
            setError('Please select a target city.');
            return;
        }

        setError(null);
        setIsUploading(true);
        setValidationResult(null);

        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (fileType === 'store') {
            formData.append('targetCityId', targetCityId);
        }

        try {
            const { data, error: functionError } = await supabase.functions.invoke(functionName, {
                body: formData,
            });

            if (functionError) {
                console.error(`Supabase function error (${functionName}):`, functionError);
                throw new Error(`Function execution failed: ${functionError.message}`);
            }
            
            if (data.error) {
                 throw new Error(data.error);
            }

            console.log(`${fileType} validation successful:`, data);
            setValidationResult({ ...data, type: fileType });

        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e))
            console.error('Upload and validation failed:', error);
            setError(`Upload failed: ${error.message}`);
            setValidationResult(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleRow = (index: number) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedRows(newSelection);
    };

    const handleToggleSelectAll = () => {
        if (!validationResult) return;
        if (selectedRows.size === validationResult.validForImport.length) {
            setSelectedRows(new Set()); // Deselect all
        } else {
            const allIndices = new Set(validationResult.validForImport.map((_, index) => index));
            setSelectedRows(allIndices); // Select all
        }
    };

    const handleFinalImport = async () => {
        if (!validationResult || validationResult.validForImportCount === 0 || selectedRows.size === 0) {
            setError("No selected rows to import.");
            return;
        }

        const itemsToImport = validationResult.validForImport.filter((_, index) => selectedRows.has(index));

        setIsImporting(true);
        setError(null);
        
        const functionName = validationResult.type === 'store' ? 'import-validated-stores' : 'import-validated-reviews';
        const payload = validationResult.type === 'store'
            ? { storesToImport: itemsToImport, targetCityId: targetCityId }
            : { reviewsToImport: itemsToImport };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("User not authenticated. Please log in again.");

            const { data, error: functionError } = await supabase.functions.invoke(functionName, {
                body: payload,
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            
            if (functionError) throw functionError;
            if (data.error) throw new Error(data.error);

            alert(`Successfully imported ${data.importedCount} ${validationResult.type}s!`);
            // Reset state after successful import
            setSelectedStoreFile(null);
            setSelectedReviewFile(null);
            setValidationResult(null);
            setSelectedRows(new Set());

        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.error("Final import failed:", error);
            setError(`Import failed: ${error.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Admin - Import Stores from Excel</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 1: Upload Store Data File</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label htmlFor="targetCity" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Target City
                        </label>
                        <select
                            id="targetCity"
                            value={targetCityId}
                            onChange={(e) => setTargetCityId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={isCitiesLoading || cities.length === 0}
                        >
                            {isCitiesLoading ? (
                                <option>Loading cities...</option>
                            ) : cities.length === 0 ? (
                                <option>No active cities. Please add one first.</option>
                            ) : (
                                <>
                                    <option value="">-- Please select a city --</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}, {city.state}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">New stores will be linked to this city.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload .xlsx File
                        </label>
                        <div 
                            onDrop={onDrop} 
                            onDragOver={onDragOver}
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500"
                            onClick={() => document.getElementById('store-file-upload')?.click()}
                        >
                            <div className="space-y-1 text-center">
                            {selectedStoreFile ? (
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            ) : (
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600">
                                <p className="pl-1">
                                    {selectedStoreFile ? `File: ${selectedStoreFile.name}` : "Drag 'n' drop or click to upload"}
                                </p>
                                <input id="store-file-upload" name="store-file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'store')} accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                            </div>
                            <p className="text-xs text-gray-500">.xlsx file up to 10MB</p>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
                    <button
                        type="button"
                        onClick={() => handleUploadAndValidate('store')}
                        disabled={isUploading || !selectedStoreFile || !targetCityId}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Validating...' : 'Upload & Validate Stores'}
                    </button>
                </div>
            </div>

            {/* Step 2: Upload Review Data File */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 2: Upload Review Data File (Optional)</h2>
                 <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500"
                    onClick={() => document.getElementById('review-file-upload')?.click()}
                >
                    <div className="space-y-1 text-center">
                        {selectedReviewFile ? (
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        ) : (
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                            <p className="pl-1">
                                {selectedReviewFile ? `File: ${selectedReviewFile.name}` : "Drag 'n' drop or click to upload reviews"}
                            </p>
                            <input id="review-file-upload" name="review-file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'review')} accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                        </div>
                        <p className="text-xs text-gray-500">.xlsx review file</p>
                    </div>
                </div>
                 <div className="flex items-center justify-end mt-4">
                    <button
                        type="button"
                        onClick={() => handleUploadAndValidate('review')}
                        disabled={isUploading || !selectedReviewFile}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Validating...' : 'Upload & Validate Reviews'}
                    </button>
                </div>
            </div>


            {/* Validation Results Display Area */}
            {validationResult && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 3: Review Validation Results for {validationResult.type}s</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                        <div className="p-3 bg-gray-100 rounded">
                            <p className="text-2xl font-bold">{validationResult.totalRowsProcessed}</p>
                            <p className="text-sm text-gray-600">Total Rows</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded">
                            <p className="text-2xl font-bold text-green-700">{validationResult.validForImportCount}</p>
                            <p className="text-sm text-green-600">Ready to Import</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded">
                            <p className="text-2xl font-bold text-yellow-700">{validationResult.duplicateCount}</p>
                            <p className="text-sm text-yellow-600">Duplicates</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded">
                            <p className="text-2xl font-bold text-red-700">{validationResult.errorCount}</p>
                            <p className="text-sm text-red-600">Errors</p>
                        </div>
                    </div>

                    {validationResult.errors.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Error Details</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {validationResult.errors.map((err, index) => (
                                    <li key={index} className="text-red-700">
                                        <span className="font-semibold">Row (Name: {err.row?.name || 'N/A'}):</span> {err.error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                   )}

                   {/* Review Table */}
                   {validationResult.validForImportCount > 0 && (
                       <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Review and Select {validationResult.type}s to Import</h3>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                               <table className="min-w-full divide-y divide-gray-200 text-sm">
                                   <thead className="bg-gray-50">
                                       <tr>
                                           <th className="px-4 py-2 text-left">
                                               <input
                                                   type="checkbox"
                                                   className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                   checked={selectedRows.size === validationResult.validForImport.length}
                                                   onChange={handleToggleSelectAll}
                                               />
                                           </th>
                                           <th className="px-4 py-2 text-left font-semibold text-gray-900">Name</th>
                                           <th className="px-4 py-2 text-left font-semibold text-gray-900">Address / Details</th>
                                           <th className="px-4 py-2 text-left font-semibold text-gray-900">Google Place ID</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-200 bg-white">
                                       {validationResult.validForImport.map((item, index) => (
                                           <tr key={index} className={`${selectedRows.has(index) ? 'bg-blue-50' : ''}`}>
                                               <td className="px-4 py-2">
                                                   <input
                                                       type="checkbox"
                                                       className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                       checked={selectedRows.has(index)}
                                                       onChange={() => handleToggleRow(index)}
                                                   />
                                               </td>
                                               <td className="px-4 py-2 font-medium text-gray-900">{item.name || item.author_name}</td>
                                               <td className="px-4 py-2 text-gray-700">{item.address || item.review_text?.substring(0, 50) + '...'}</td>
                                               <td className="px-4 py-2 text-gray-700">{item.google_place_id || item.place_id}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                            </div>
                       </div>
                   )}


                   <div className="mt-6 flex justify-end">
                       <button
                           type="button"
                           onClick={handleFinalImport}
                           disabled={isUploading || isImporting || selectedRows.size === 0}
                           className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                       >
                           {isImporting ? 'Importing...' : `Import ${selectedRows.size} Selected ${validationResult.type}s`}
                       </button>
                   </div>
               </div>
           )}
        </div>
    );
};

export default AdminImportStoresPage;