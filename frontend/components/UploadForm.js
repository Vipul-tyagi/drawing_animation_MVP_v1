import { useState, useRef } from 'react';

export default function UploadForm({ onUploadComplete, setLoading, setError, uploadedFileData, setUploadedFileData }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [story, setStory] = useState('');

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

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setLoading(true);
    setError(null);
    // setUploadedFileData(null); // Clear previous data - this is now handled by parent

    const formData = new FormData();
    formData.append('file', file);
    formData.append('story', story);

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
          url: `${process.env.NEXT_PUBLIC_BACKEND_PUBLIC_URL}${data.url}`,
          story: story,
        };
        setUploadedFileData(newUploadedFileData); // Update state in parent
        console.log('UploadForm: File uploaded and data stored.');
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
    // uploadedFileData is now a prop from parent
    if (uploadedFileData) {
      onUploadComplete(uploadedFileData);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
      <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Drawing</h2>
          <p className="text-gray-600">Upload a drawing to enhance it and generate a bedtime story!</p>
        </div>

        {/* Image Preview (Conditional) */}
        {preview && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Drawing:</h3>
            <img src={preview} alt="Preview" className="max-w-full h-auto mx-auto mb-4 rounded-lg shadow-md" />
            <button
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                console.log('UploadForm: Cleared preview.');
              }}
              className="text-blue-500 hover:text-blue-700 font-medium transition duration-150 ease-in-out"
            >
              Choose Different Image
            </button>
          </div>
        )}

        {/* Upload Zone (Always Visible) */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 ease-in-out
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
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
            <svg className="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="text-lg text-gray-600 mb-2">Drag and drop your drawing here</p>
            <p className="text-gray-500 mb-4">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out shadow-md"
            >
              Browse Files
            </button>
            <p className="text-sm text-gray-400 mt-3">Supports JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Story Input (Always Visible, below upload) */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <label htmlFor="story" className="block text-lg font-semibold text-gray-700 mb-2">What's the story behind your drawing?</label>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            <p>Your description helps our AI craft a more relevant and unique bedtime story.</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">For example:</p>
          <ul className="text-sm text-gray-600 mb-3 list-disc list-inside">
            <li>"A brave knight fighting a dragon to save a princess."</li>
            <li>"A friendly monster having a picnic with a cat."</li>
            <li>"A magical tree that grows candy in a colorful forest."</li>
          </ul>
          <textarea
            id="story"
            name="story"
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Tell us about your drawing for the story... (e.g., 'This is a happy sun flying over a house with a dog playing in the garden.')"
            value={story}
            onChange={(e) => setStory(e.target.value)}
          ></textarea>
        </div>
        <div className="text-center mt-6">
          <div className="text-center mt-6">
          <button
            onClick={handleGenerateStoryClick}
            disabled={!uploadedFileData}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${!uploadedFileData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Bring My Drawing to Life!
          </button>
        </div>
        </div>
      </div>

      {/* Photo Tips Sidebar */}
      <div className="md:col-span-1 bg-gray-100 p-6 rounded-lg shadow-md">
        <h4 className="text-xl font-bold text-gray-800 mb-4">📸 Photo Tips</h4>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>🌟 Good lighting (natural light is best!)</li>
          <li>📐 Flat surface (no wrinkles or curves)</li>
          <li>🎯 Full drawing visible</li>
          <li>🚫 Minimal shadows</li>
          <li>📱 Hold phone steady</li>
        </ul>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-6" role="alert">
          <p className="font-bold">💡 Pro Tip:</p>
          <p>Take the photo from directly above the drawing for the best results!</p>
        </div>
      </div>
    </div>
  );
}