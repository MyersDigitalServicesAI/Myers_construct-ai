import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Ensure @types/jspdf-autotable is installed or use any if issues arise
import { FileText, Download, PenTool } from 'lucide-react';
import { Lead, ProjectType } from '../types';

interface ContractGeneratorProps {
    lead: Lead;
    onClose: () => void;
}

export const ContractGenerator = ({ lead, onClose }: ContractGeneratorProps) => {

    const generatePDF = () => {
        const doc = new jsPDF();
        const primaryColor = [234, 88, 12]; // Orange-600

        // --- Header ---
        doc.setFillColor(20, 20, 20); // Dark background
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text("MYERS CONSTRUCT AI", 15, 25);

        doc.setFontSize(10);
        doc.setTextColor(234, 88, 12);
        doc.text("OFFICIAL PROPOSAL & CONTRACT", 130, 25);

        // --- Client Details ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("CLIENT DETAILS", 15, 55);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name/Phone: ${lead.phone}`, 15, 65);
        doc.text(`Project ID: ${lead.id.substring(0, 8).toUpperCase()}`, 15, 70);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 75);

        // --- Scope of Work (From Transcript/Summary) ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("SCOPE OF WORK", 15, 90);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitDescription = doc.splitTextToSize(lead.transcript || "No details provided.", 180);
        doc.text(splitDescription, 15, 100);

        // --- Pricing Table (Mocked for now based on Lead summary) ---
        // In a real app, we'd pass the EstimateResult here. 
        // For MVP, we'll generate a placeholder estimate based on the summary.

        const nextY = 100 + (splitDescription.length * 5) + 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("ESTIMATED COSTS", 15, nextY);

        (doc as any).autoTable({
            startY: nextY + 5,
            head: [['Item', 'Category', 'Cost']],
            body: [
                ['Initial Consultation & Site Visit', 'Labor', '$250.00'],
                [lead.summary || 'General Contracting Services', 'Material & Labor', '$15,000.00'],
                ['Permitting & Fees', 'Admin', '$500.00'],
            ],
            foot: [['', 'Total Estimated', '$15,750.00']],
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: 255 },
            footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
        });

        // --- Terms & Conditions ---
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("TERMS AND CONDITIONS: This is a preliminary estimate. Final costs may vary based on material availability and unforeseen structural issues. A deposit of 50% is required to schedule work.", 15, finalY, { maxWidth: 180 });

        // --- Signature Block ---
        doc.setDrawColor(0, 0, 0);
        doc.line(15, finalY + 40, 100, finalY + 40);
        doc.text("Client Signature", 15, finalY + 45);

        doc.line(120, finalY + 40, 205, finalY + 40);
        doc.text("Contractor Signature", 120, finalY + 45);

        doc.save(`Myers_Proposal_${lead.id}.pdf`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Contract Generator</h2>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-2">{lead.summary}</p>
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white uppercase text-xs font-bold tracking-widest">
                    Cancel / Back
                </button>
            </div>

            <div className="bg-white text-black p-8 rounded-xl shadow-2xl min-h-[600px] relative">
                {/* Visual Preview (HTML Representation) */}
                <div className="border-b-2 border-orange-600 pb-6 mb-6">
                    <h1 className="text-4xl font-black italic tracking-tighter">MYERS CONSTRUCT AI</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mt-2">Official Proposal & Contract</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold uppercase text-xs text-neutral-500 mb-1">Client</h3>
                        <p className="font-bold text-lg">{lead.phone}</p>
                        <p className="text-sm text-neutral-600">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold uppercase text-xs text-neutral-500 mb-1">Project ID</h3>
                        <p className="font-mono text-sm">{lead.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold uppercase text-xs text-neutral-500 mb-2 border-b pb-1">Scope of Work</h3>
                    <p className="text-sm leading-relaxed">{lead.transcript || "No details provided."}</p>
                </div>

                <div className="mb-8 p-4 bg-neutral-100 rounded-lg">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-bold uppercase text-neutral-500">Estimated Total</p>
                            <p className="text-3xl font-black tracking-tight">$15,750.00</p>
                        </div>
                        <p className="text-[10px] text-neutral-500 italic">*Preliminary estimate based on AI analysis</p>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 left-8">
                    <button
                        onClick={generatePDF}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-black py-4 rounded-lg text-sm font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
                    >
                        <Download size={20} />
                        Download PDF Contract
                    </button>
                    <p className="text-center text-[10px] text-neutral-400 mt-4 uppercase tracking-widest font-medium flex items-center justify-center gap-2">
                        <PenTool size={10} /> Digital Signature Ready
                    </p>
                </div>
            </div>
        </div>
    );
};
