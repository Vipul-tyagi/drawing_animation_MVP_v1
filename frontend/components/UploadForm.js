import { useState, useRef } from 'react';

export default function UploadForm({ onUploadComplete, setLoading, setError, uploadedFileData, setUploadedFileData }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [story, setStory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

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

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('story', story);
    console.log('UploadForm: FormData before sending:', Object.fromEntries(formData.entries()));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload API response status:', response.status);

      const data = await response.json();
      console.log('Upload API response data:', data);
      
      if (data.success) {
        const newUploadedFileData = {
          ...data,
          url: data.url,
          story: story,
        };
        setUploadedFileData(newUploadedFileData); // Update state in parent
        console.log('UploadForm: File uploaded and data stored.');
        onUploadComplete(newUploadedFileData);
      } else {
        setError(data.error || 'Upload failed');
        console.error('UploadForm: Upload failed with error:', data.error);
      }
    } catch (error) {
      setError('UploadForm: Upload fetch error:' + error.message);
      console.error('UploadForm: Upload fetch error:', error);
    } finally {
      setLoading(false);
      console.log('UploadForm: Upload process finished.');
    }
  };

  const handleGenerateStoryClick = () => {
    if (selectedFile) {
      uploadFile();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl mx-auto">
      <div className="flex-1 bg-neutral-50 p-6 sm:p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-700 mb-2 font-sans">Upload Your Drawing</h2>
          <p className="text-neutral-700 font-sans">Upload a drawing to enhance it and generate a bedtime story!</p>
        </div>

        {/* Image Preview (Conditional) */}
        {preview && (
          <div className="mb-6 p-4 sm:p-6 border border-neutral-200 rounded-lg text-center bg-white shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-700 mb-3 font-sans">Your Drawing:</h3>
            <img src={preview} alt="Preview" className="max-w-full h-auto mx-auto mb-4 rounded-lg shadow-md border border-neutral-200" />
            <button
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                console.log('UploadForm: Cleared preview.');
              }}
              className="text-primary hover:text-primary-dark font-medium transition duration-150 ease-in-out font-sans"
            >
              Choose Different Image
            </button>
          </div>
        )}

        {/* Upload Zone (Always Visible) */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 sm:p-10 text-center transition-colors duration-200 ease-in-out
            ${dragActive ? 'border-primary bg-primary/5' : 'border-neutral-300 bg-neutral-50'}
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
          />
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="text-lg text-neutral-700 mb-2 font-sans">Drag and drop your drawing here</p>
            <p className="text-neutral-500 mb-4 font-sans">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out shadow-md font-sans"
            >
              Browse Files
            </button>
            <p className="text-sm text-neutral-400 mt-3 font-sans">Supports JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Story Input (Always Visible, below upload) */}
        <div className="mt-6 p-4 sm:p-6 border border-neutral-200 rounded-lg bg-white shadow-sm">
          <label htmlFor="story" className="block text-lg sm:text-xl font-semibold text-neutral-700 mb-2 font-sans">What's the story behind your drawing?</label>
          <div className="flex items-center text-sm text-neutral-600 mb-3 font-sans">
            <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            <p>Your description helps our AI craft a more relevant and unique bedtime story.</p>
          </div>
          <p className="text-sm text-neutral-600 mb-3 font-sans">For example:</p>
          <ul className="text-sm text-neutral-600 mb-3 list-disc list-inside font-sans">
            <li>"A brave knight fighting a dragon to save a princess."</li>
            <li>"A friendly monster having a picnic with a cat."</li>
            <li>"A magical tree that grows candy in a colorful forest."</li>
          </ul>
          <textarea
            id="story"
            name="story"
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-sans"
            placeholder="Tell us about your drawing for the story... (e.g., 'This is a happy sun flying over a house with a dog playing in the garden.')"
            value={story}
            onChange={(e) => setStory(e.target.value)}
          ></textarea>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={handleGenerateStoryClick}
            disabled={!selectedFile}
            className={`bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 font-sans ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Bring My Drawing to Life!
          </button>
        </div>
      </div>

      {/* Photo Tips Sidebar */}
      <div className="flex-none w-full lg:w-1/3 bg-neutral-50 p-6 rounded-lg shadow-lg mt-8 lg:mt-0">
        <h4 className="text-xl sm:text-2xl font-bold text-neutral-700 mb-4 font-sans">📸 Photo Tips</h4>
        <ul className="list-disc list-inside text-neutral-700 space-y-2 font-sans">
          <li>🌟 Good lighting (natural light is best!)</li>
          <li>📐 Flat surface (no wrinkles or curves)</li>
          <li>🎯 Full drawing visible</li>
          <li>🚫 Minimal shadows</li>
          <li>📱 Hold phone steady</li>
        </ul>
        <div className="bg-secondary/10 border-l-4 border-secondary text-neutral-700 p-4 mt-6 rounded-md font-sans" role="alert">
          <p className="font-bold">💡 Pro Tip:</p>
          <p>Take the photo from directly above the drawing for the best results!</p>
        </div>
      </div>
    </div>
  );
}