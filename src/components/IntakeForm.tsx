import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ArrowLeft, ImageIcon, X, Camera, Zap, Mic, MicOff } from 'lucide-react';
import { ProjectData } from '../types';

// Speech Recognition Type Definition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface IntakeFormProps {
  project: ProjectData;
  setProject: Dispatch<SetStateAction<ProjectData>>;
  blueprint: string | null;
  setBlueprint: (b: string | null) => void;
  runEstimate: (e: React.FormEvent) => void;
  setView: (view: 'dash' | 'intake' | 'result' | 'proc') => void;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ project, setProject, blueprint, setBlueprint, runEstimate, setView }) => {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setProject((prev: ProjectData) => ({
             ...prev,
             description: (prev.description + ' ' + finalTranscript).trim()
           }));
        }
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 4 * 1024 * 1024) { // 4MB limit
        setFileError("File size exceeds 4MB limit.");
        return;
      }
      setFileError(null);
      const r = new FileReader();
      r.onloadend = () => setBlueprint(r.result as string);
      r.readAsDataURL(f);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500 pb-20">
      <div className="bg-[#0d0d0d] p-8 md:p-16 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <header className="flex justify-between items-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Intake Node</h2>
          <button onClick={() => setView('dash')} className="p-4 bg-white/5 rounded-2xl hover:bg-orange-600 transition-all group shadow-xl"><ArrowLeft size={24} className="group-hover:text-black"/></button>
        </header>
        <form onSubmit={runEstimate} className="space-y-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic">Project Locale (Zip/City)</label>
              <input required value={project.location} onChange={e => setProject({...project, location: e.target.value})} placeholder="E.G. CHICAGO, IL 60601" className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] font-black text-xs text-white uppercase outline-none focus:border-orange-600 shadow-inner" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic">Internal Reference</label>
              <input required value={project.scope} onChange={e => setProject({...project, scope: e.target.value})} placeholder="E.G. HARBOR RENO v2" className="w-full px-8 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] font-black text-xs text-white uppercase outline-none focus:border-orange-600 shadow-inner" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 italic flex items-center gap-3"><ImageIcon size={14}/> Blueprint Takeoff (Optional)</label>
            {blueprint ? (
              <div className="relative group aspect-video rounded-[3rem] overflow-hidden border-2 border-orange-600 shadow-2xl">
                <img src={blueprint} className="w-full h-full object-cover" alt="Blueprint" />
                <button type="button" onClick={()=>setBlueprint(null)} className="absolute top-6 right-6 p-4 bg-black/80 rounded-full hover:bg-red-500 transition-all shadow-2xl"><X size={20}/></button>
              </div>
            ) : (
              <label className={`w-full aspect-video border-2 border-dashed ${fileError ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-orange-600 hover:bg-orange-600/5'} rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all shadow-inner group`}>
                <div className="p-8 bg-white/5 rounded-full group-hover:scale-110 transition-transform shadow-lg"><Camera size={40} className="text-white/20"/></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/10 italic">Upload Plan (Max 4MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
            {fileError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-2">{fileError}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">Detailed Scope Narrative</label>
                <button 
                  type="button" 
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white/50 hover:bg-orange-600 hover:text-black'}`}
                >
                    {isListening ? <><Mic size={12}/> Recording...</> : <><MicOff size={12}/> Tap to Speak</>}
                </button>
            </div>
            <textarea required value={project.description} onChange={e => setProject({...project, description: e.target.value})} placeholder="Tap the mic to speak your scope..." className="w-full px-10 py-10 bg-white/5 border border-white/5 rounded-[3rem] outline-none min-h-[250px] text-lg font-medium text-white/80 shadow-inner focus:border-orange-600 transition-all resize-none" />
          </div>

          <button type="submit" className="w-full py-10 bg-orange-600 text-black font-black uppercase tracking-[0.5em] rounded-[3rem] hover:bg-orange-700 transition-all shadow-2xl text-xl italic flex items-center justify-center gap-6 group">
            Deploy Foreman Thinking <Zap size={28} className="group-hover:scale-125 transition-transform"/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default IntakeForm;
