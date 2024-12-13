import React from "react";

function UserInput({
  setLoadBufferSize,
  setStoreBufferSize,
  setBlockSize,
  setCacheSize,
  setMemorySize,
  setMulBufferSize,
  setAddBufferSize,
  setIsUserFormSubmitted,
}) {
  const handleInputChange = (e, setFunction) => {
    const value = parseInt(e.target.value, 10);
    setFunction(value > 0 ? value : 0);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center">
        Initialize Buffers and Memory
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Cache Size:
          </label>
          <input
            type="number"
            placeholder="Enter cache size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setCacheSize)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Block Size:
          </label>
          <input
            type="number"
            placeholder="Enter block size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setBlockSize)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Memory Size:
          </label>
          <input
            type="number"
            placeholder="Enter memory size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setMemorySize)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Multiply Buffer Size:
          </label>
          <input
            type="number"
            placeholder="Enter multiply buffer size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setMulBufferSize)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Add Buffer Size:
          </label>
          <input
            type="number"
            placeholder="Enter add buffer size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setAddBufferSize)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Load Buffer Size:
          </label>
          <input
            type="number"
            placeholder="Enter load buffer size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setLoadBufferSize)}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Store Buffer Size:
          </label>
          <input
            type="number"
            placeholder="Enter store buffer size"
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={(e) => handleInputChange(e, setStoreBufferSize)}
          />
        </div>

        <div className="text-center">
          <button
            type="button"
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
          >
            Initialize
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserInput;
