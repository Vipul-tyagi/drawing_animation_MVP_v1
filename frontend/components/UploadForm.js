import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle, Sparkles } from 'lucide-react';

export default function UploadForm({ onGenerateClick, setError }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [story, setStory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleGenerateStoryClick = async () => {
    if (selectedFile) {
      setIsProcessing(true);
      try {
        await onGenerateClick(selectedFile, story);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-2">
          <div
            className="glass-card"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-headline text-neutral-800 dark:text-neutral-100 mb-4">
                Upload Your Drawing 🎨
              </h2>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Upload a drawing to create a magical bedtime story!
              </p>
            </div>

            {/* Image Preview */}
              {preview && (
                <div
                  className="mb-6 p-4 glass-surface rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-title text-neutral-800 dark:text-neutral-200">
                      Your Drawing
                    </h3>
                  </div>
                  
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-auto max-h-64 object-contain mx-auto rounded-lg shadow-md mb-4"
                  />
                  
                  <button
                    onClick={clearSelection}
                    className="btn-ghost text-sm"
                  >
                    Choose Different Image
                  </button>
                </div>
              )}

            {/* Upload Zone */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/50'
                }
                ${preview ? 'opacity-60' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept="image/*"
                disabled={isProcessing}
              />
              
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  {dragActive ? 'Drop your drawing here!' : 'Drag and drop your drawing here'}
                </h3>
                
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  or
                </p>
                
                {/* Upload Icon and Choose File Button - Aligned */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`
                    p-3 rounded-xl transition-colors duration-300
                    ${dragActive 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }
                  `}>
                    <Upload className="w-6 h-6" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="btn-primary text-lg px-6 py-3 flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Choose File
                  </button>
                </div>
                
                <p className="text-caption mt-3">
                  Supports JPG, PNG up to 5MB
                </p>
              </div>
            </div>

            {/* Story Input */}
            <div className="mt-6 p-4 glass-surface rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <label htmlFor="story" className="text-title text-neutral-800 dark:text-neutral-200">
                  What's the story behind your drawing?
                </label>
              </div>
              
              <p className="text-caption mb-3">
                💡 Your description helps create a more personalized story.
              </p>
              
              <textarea
                id="story"
                name="story"
                rows="4"
                className="input-field resize-none"
                placeholder="Tell us about your drawing... (e.g., 'A happy sun flying over a house with a dog playing in the garden.')"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Generate Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleGenerateStoryClick}
                disabled={!selectedFile || isProcessing}
                className={`
                  btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto
                  ${(!selectedFile || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Sparkles className="w-5 h-5" />
                {isProcessing ? 'Creating Magic...' : 'Bring My Drawing to Life! ✨'}
              </button>
            </div>
          </div>
        </div>

        {/* Tips Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card sticky top-8">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <h4 className="text-title text-neutral-800 dark:text-neutral-200">
                Photo Tips 📸
              </h4>
            </div>
            
            <ul className="space-y-3 text-caption">
              <li className="flex items-start gap-2">
                <span className="text-lg">🌟</span>
                <span>Good lighting (natural light is best!)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">📐</span>
                <span>Flat surface (no wrinkles or curves)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <span>Full drawing visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🚫</span>
                <span>Minimal shadows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">📱</span>
                <span>Hold phone steady</span>
              </li>
            </ul>
            
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-semibold text-primary mb-1">Pro Tip:</p>
                  <p className="text-caption">
                    Take the photo from directly above the drawing for the best results!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}