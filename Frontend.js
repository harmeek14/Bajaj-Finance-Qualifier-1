import { useState } from 'react';

const App = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    alphabets: false,
    numbers: false,
    highest_alphabet: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const filterOptions = [
    { value: 'alphabets', label: 'Alphabets' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'highest_alphabet', label: 'Highest alphabet' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setApiResponse(null);
    
    try {
      // Validate JSON input
      const parsedInput = JSON.parse(jsonInput);
      if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
        throw new Error('Invalid input format. Expected {"data": [...]}');
      }

      setIsLoading(true);
      const response = await fetch('http://localhost:3000/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonInput
      });

      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterValue) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterValue]: !prev[filterValue]
    }));
  };

  const renderFilteredResponse = () => {
    if (!apiResponse || !apiResponse.is_success) return null;

    const filteredData = {};
    Object.entries(selectedFilters).forEach(([key, isSelected]) => {
      if (isSelected && apiResponse[key]) {
        filteredData[key] = apiResponse[key];
      }
    });

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        {Object.entries(filteredData).map(([key, value]) => (
          <div key={key} className="mb-2">
            <span className="font-semibold capitalize">{key.replace('_', ' ')}: </span>
            <span>{Array.isArray(value) ? value.join(', ') : value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter JSON Input:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[100px]"
            placeholder='{"data": ["M","1","334","4","B"]}'
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {apiResponse?.is_success && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Filters:
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 bg-white border rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters[option.value]}
                  onChange={() => handleFilterChange(option.value)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {renderFilteredResponse()}
        </div>
      )}
    </div>
  );
};

export default App;
