import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Typography, Alert } from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';

const BulkData = () => {
    const [excelFile, setExcelFile] = useState(null);
    const [zipFile, setZipFile] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [secondShowAlert, setSecondShowAlert] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e, url, setAlert) => {
        e.preventDefault();
        if (!excelFile || !zipFile) {
            alert("Please upload both Excel and Zip files.");
            return;
        }

        const confirmUpload = window.confirm("Are you sure you want to upload these files?");
        if (!confirmUpload) return;

        const formData = new FormData();
        formData.append('excel_file', excelFile);
        formData.append('zip_file', zipFile);

        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'multipart/form-data'

                }
            });
            localStorage.setItem('bulkUploadResponse', JSON.stringify(response.data));
            setAlert(true);
            if (url.includes('/catalogue/upload-catalogue')) {
                navigate('/bulk-data-show');
            } else {
                navigate('/my-cata');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

    return (
        <div className="lux-shell">
            <div className="lux-container py-12">
            <div className="lux-panel p-8">
            <Typography variant="h4" className="text-white">Bulk Data Upload</Typography>
            <Typography variant="paragraph" className="mt-3 max-w-3xl text-slate-300">
                Use the Excel template below. Put your images in a single <span className="text-white font-medium">.zip</span> and reference image filenames in the Excel columns.
            </Typography>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Excel schema (columns)</p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-200">
                        {[
                            "name",
                            "description",
                            "brand",
                            "color",
                            "size",
                            "price",
                            "gst_percentage",
                            "ean",
                            "standardized",
                            "category",
                            "product_image_1",
                            "product_image_2",
                            "product_image_3",
                            "product_image_4",
                            "product_image_5",
                        ].map((col) => (
                            <li key={col} className="font-mono text-[13px] text-slate-200">{col}</li>
                        ))}
                    </ul>
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/catalogue/bulk-template?type=preview`}
                        className="mt-4 inline-block text-[#ff5a1f] underline"
                        download
                    >
                        Download preview template (.xlsx)
                    </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">How images map</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        If your ZIP is named <span className="font-mono text-slate-100">my-images.zip</span> and your Excel has
                        <span className="font-mono text-slate-100"> product_image_1 = image1.jpg</span>, the API will map it under that ZIP folder.
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        Supported: <span className="text-slate-100">.jpg .jpeg .png .webp</span>. Keep filenames simple.
                    </p>
                </div>
            </div>

            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={(e) => handleSubmit(e, `${import.meta.env.VITE_BACKEND_URL}/catalogue/upload-catalogue`, setShowAlert)}>
                <Input
                    type="file"
                    label="Excel File (.xlsx)"
                    onChange={(e) => handleFileChange(e, setExcelFile)}
                    required
                    accept=".xlsx"
                />
                <Input
                    type="file"
                    label="Zip File (.zip)"
                    onChange={(e) => handleFileChange(e, setZipFile)}
                    required
                    accept=".zip"
                />
                <div className="md:col-span-2">
                    <Button type="submit" className="rounded-full bg-[#b91c1c] shadow-[0_12px_40px_rgba(127,29,29,0.35)]">
                        Upload (preview)
                    </Button>
                </div>
            </form>
            {showAlert && (
                <Alert color="green" className="mt-4">
                    Files uploaded successfully!
                </Alert>
            )}

            <hr className="my-8" />

            <Typography variant="h4" className="mb-4">Instant Catalog Creation</Typography>
            <Typography variant="body1" className="mb-2">
                Please adhere to the given template for instant catalog creation:
            </Typography>
            <a href={`${import.meta.env.VITE_BACKEND_URL}/catalogue/bulk-template?type=save`} download className="text-[#ff5a1f] underline mb-4 block">Download save template (.xlsx)</a>
            <form onSubmit={(e) => handleSubmit(e, `${import.meta.env.VITE_BACKEND_URL}/catalogue/upload-save-catalogue`, setSecondShowAlert)}>
                <div className="mb-4">
                    <Input
                        type="file"
                        label="Excel File"
                        onChange={(e) => handleFileChange(e, setExcelFile)}
                        required
                        accept=".xlsx"
                    />
                </div>
                <div className="mb-4">
                    <Input
                        type="file"
                        label="Zip File"
                        onChange={(e) => handleFileChange(e, setZipFile)}
                        required
                        accept=".zip"
                    />
                </div>
                <Button type="submit" className="rounded-full bg-[#b91c1c] shadow-[0_12px_40px_rgba(127,29,29,0.35)]">
                    Upload (save)
                </Button>
            </form>
            {secondShowAlert && (
                <Alert color="green" className="mt-4">
                    Congrats! The file upload and catalog creation was successful!
                </Alert>
            )}
            </div>
            </div>
        </div>
    );
};

export default BulkData;
