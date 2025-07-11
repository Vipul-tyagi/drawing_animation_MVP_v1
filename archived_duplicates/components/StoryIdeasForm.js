import { useState } from 'react';

export default function StoryIdeasForm({
  image,
  onGenerateStory,
  setLoading,
  setError,
  initialDescription = ''
}) {
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    await onGenerateStory(description);
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell Us Your Story Ideas</h2>
        <p className="text-gray-600">Help the AI create a perfect bedtime story for your drawing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Drawing</h3>
          {image && (
            <img
              src={image.url}
              alt="Your Drawing"
              className="max-w-full h-auto rounded-lg mx-auto shadow-lg"
            />
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Story Input</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your drawing or tell us your story ideas (e.g., 'A brave knight fighting a dragon', 'A magical forest with talking animals')..."
            className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            rows={6}
          />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Generate Story
        </button>
      </div>
    </div>
  );
}