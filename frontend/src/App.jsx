import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, AlertCircle, CheckCircle, Loader2, Eye, RefreshCw, FileImage, Sparkles, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HowItWorks from './HowItWorks';

// Background decorative components
const BackgroundElements = () => (
  <>
    <div className="mesh-gradient" />
    <div className="scan-line" />
    <div className="noise-overlay" />
    <div className="particles">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="particle" />
      ))}
    </div>
    <div className="retina-rings">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="retina-ring" />
      ))}
    </div>
  </>
);

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setPrediction(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  const getConfidenceColor = (conf) => {
    if (conf > 0.9) return 'text-teal-400';
    if (conf > 0.7) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getConfidenceGradient = (conf) => {
    if (conf > 0.9) return 'from-teal-500 to-cyan-500';
    if (conf > 0.7) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  // Animation variants for staggered reveals
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundElements />
      
      <div className="relative z-10 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="w-full max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.header 
            className="text-center mb-20"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Animated Logo */}
              <motion.div 
                className="relative mb-8"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1
                }}
              >
                <div className="relative">
                  {/* Outer glow rings */}
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-xl animate-pulse" />
                  <div className="absolute inset-2 w-20 h-20 rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-lg" />
                  
                  {/* Main icon container */}
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#151d26] to-[#111920] flex items-center justify-center border border-teal-500/20 shadow-2xl shadow-teal-500/10">
                    <Eye className="w-12 h-12 text-teal-400" strokeWidth={1.5} />
                    
                    {/* Scanning animation */}
                    <motion.div 
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div 
                        className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                        animate={{ 
                          top: ["0%", "100%", "0%"],
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Title with mixed fonts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">
                  <span className="font-display italic gradient-text">Retina</span>
                  <span className="text-white font-light">AI</span>
                </h1>
                <div className="flex items-center justify-center gap-2 text-teal-400/60 text-sm font-medium tracking-widest uppercase mt-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Intelligent Fundus Analysis</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>

              <motion.p 
                className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Professional-grade retinal image analysis powered by deep learning.
                <span className="block mt-2 text-slate-500">
                  Detect cataracts, glaucoma, and diabetic retinopathy with clinical precision.
                </span>
              </motion.p>
            </div>
          </motion.header>

          <main className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
            {/* Upload Section */}
            <motion.div
              variants={itemVariants}
              className="glass-card rounded-3xl overflow-hidden"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                      <FileImage className="w-5 h-5 text-teal-400" />
                    </div>
                    <span>Image Upload</span>
                  </h2>
                  {file && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={reset}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-teal-500/10 border border-transparent hover:border-teal-500/20"
                    >
                      <RefreshCw className="w-4 h-4" /> Reset
                    </motion.button>
                  )}
                </div>

                <div
                  className={`upload-zone flex-1 min-h-[400px] border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group ${file
                    ? 'border-teal-500/40 bg-teal-500/5'
                    : 'border-slate-700 hover:border-teal-500/50 cursor-pointer'
                    }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !file && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />

                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        <div className="relative">
                          {/* Image frame with gradient border */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-teal-500/50 rounded-xl blur-sm opacity-60" />
                          <img
                            src={preview}
                            alt="Preview"
                            className="relative max-h-[350px] w-auto object-contain rounded-lg shadow-2xl"
                          />
                        </div>
                        <div 
                          className="absolute inset-0 bg-[#0a0f14]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <p className="text-white font-medium flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
                            <Upload className="w-5 h-5" /> Click to change
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <motion.div 
                          className="w-24 h-24 mx-auto bg-gradient-to-br from-[#151d26] to-[#111920] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-teal-500/50 shadow-xl relative overflow-hidden"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Upload className="w-10 h-10 text-slate-400 group-hover:text-teal-400 transition-colors relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                        <div>
                          <p className="text-xl font-semibold text-white mb-2">Drag & drop your image</p>
                          <p className="text-slate-500">Supported formats: JPG, PNG</p>
                        </div>
                        <button className="px-6 py-3 bg-[#151d26] hover:bg-[#1a242f] text-teal-400 rounded-xl font-medium transition-all border border-slate-700 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10">
                          Browse Files
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${!file
                    ? 'bg-[#151d26] text-slate-600 cursor-not-allowed border border-slate-800'
                    : loading
                      ? 'bg-teal-600/80 cursor-wait'
                      : 'glow-button text-white'
                    }`}
                  whileTap={file && !loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      Run Diagnosis
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div variants={itemVariants} className="h-full">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-start gap-4 text-rose-400 mb-6 backdrop-blur-sm"
                  >
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Analysis Failed</h3>
                      <p className="text-rose-300/80">{error}</p>
                    </div>
                  </motion.div>
                )}

                {prediction ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="glass-card rounded-3xl h-full"
                  >
                    <div className="p-8 h-full">
                      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-700/50">
                        <motion.div 
                          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-teal-500/30"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                          <CheckCircle className="w-8 h-8 text-teal-400" />
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                          <p className="text-slate-400">AI-powered diagnostic report</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Primary Diagnosis */}
                        <motion.div 
                          className="bg-[#0d1419] rounded-2xl p-6 border border-slate-800 relative overflow-hidden"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {/* Decorative gradient */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full" />
                          
                          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-3">Primary Diagnosis</p>
                          <p className="text-4xl md:text-5xl font-bold capitalize font-display mb-2 gradient-text">
                            {prediction.prediction.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-3 mt-4 flex-wrap">
                            <div className={`px-4 py-2 rounded-full text-sm font-bold bg-[#151d26] border border-slate-700 ${getConfidenceColor(prediction.confidence)}`}>
                              {(prediction.confidence * 100).toFixed(1)}% Confidence
                            </div>
                            <span className="text-slate-500 text-sm">Based on visual pattern analysis</span>
                          </div>
                        </motion.div>

                        {/* Probability Distribution */}
                        <div>
                          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-gradient-to-r from-teal-500 to-transparent" />
                            Probability Distribution
                          </p>
                          <div className="space-y-5">
                            {Object.entries(prediction.probabilities)
                              .sort(([, a], [, b]) => b - a)
                              .map(([className, prob], index) => (
                                <motion.div 
                                  key={className} 
                                  className="group"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                  <div className="flex justify-between text-sm mb-2">
                                    <span className={`capitalize font-medium transition-colors ${className === prediction.prediction ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                                      }`}>
                                      {className.replace('_', ' ')}
                                    </span>
                                    <span className={className === prediction.prediction ? 'text-teal-400 font-bold' : 'text-slate-500'}>
                                      {(prob * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-[#151d26] rounded-full overflow-hidden border border-slate-800">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${prob * 100}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                                      className={`h-full rounded-full progress-shimmer ${className === prediction.prediction
                                        ? `bg-gradient-to-r ${getConfidenceGradient(prob)}`
                                        : 'bg-slate-700'
                                        }`}
                                    />
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    className="h-full flex flex-col items-center justify-center text-slate-500 p-12 border border-slate-800 rounded-3xl bg-[#111920]/50 backdrop-blur-sm relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Decorative rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                      <div className="w-64 h-64 rounded-full border border-teal-500" />
                      <div className="absolute w-48 h-48 rounded-full border border-cyan-500" />
                      <div className="absolute w-32 h-32 rounded-full border border-teal-500" />
                    </div>
                    
                    <motion.div 
                      className="w-20 h-20 rounded-2xl bg-[#151d26] flex items-center justify-center mb-6 border border-slate-800 relative z-10"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(20, 184, 166, 0)",
                          "0 0 0 20px rgba(20, 184, 166, 0.1)",
                          "0 0 0 0 rgba(20, 184, 166, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Eye className="w-10 h-10 text-slate-600" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2 relative z-10">Ready for Analysis</h3>
                    <p className="text-center max-w-xs text-slate-500 relative z-10">
                      Upload a fundus image to receive an instant AI-powered diagnosis and detailed probability breakdown.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </main>

          <HowItWorks />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
