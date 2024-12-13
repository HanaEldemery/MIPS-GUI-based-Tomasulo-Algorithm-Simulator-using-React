import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FormComponent = () => {
  const [formData, setFormData] = useState({
    memMiss: 0,
    memHit: 0,
    addHit: 0,
    subHit: 0,
    integerAddHit: 0,
    integerSubHit: 0,
    integerBranchHit: 0,
    mulHit: 0,
    divHit: 0,
    addBufferSize: 0,
    mulBufferSize: 0,
    loadBufferSize: 0,
    storeBufferSize: 0,
    cacheSize: 0,
    memSize: 0,
    blockSize: 0,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(formData).toString();
    navigate(`/project?${queryParams}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white space-y-6 border border-gray-300 shadow-sm rounded-md">
      <h2 className="text-2xl font-bold text-gray-700 text-center">
        Initialize Buffers, Memory and Latencies
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Cache Size:
          </label>
          <input
            type="number"
            name="cacheSize"
            placeholder="Enter cache size"
            value={formData.cacheSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Memory Size:
          </label>
          <input
            type="number"
            name="memSize"
            placeholder="Enter memory size"
            value={formData.memSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Block Size:
          </label>
          <input
            type="number"
            name="blockSize"
            placeholder="Enter block size"
            value={formData.blockSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Store Buffer Size:
          </label>
          <input
            type="number"
            name="storeBufferSize"
            placeholder="Enter store buffer size"
            value={formData.storeBufferSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Load Buffer Size:
          </label>
          <input
            type="number"
            name="loadBufferSize"
            placeholder="Enter load buffer size"
            value={formData.loadBufferSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Mul Buffer Size:
          </label>
          <input
            type="number"
            name="mulBufferSize"
            placeholder="Enter mul buffer size"
            value={formData.mulBufferSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Add Buffer Size:
          </label>
          <input
            type="number"
            name="addBufferSize"
            placeholder="Enter mul buffer size"
            value={formData.addBufferSize}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Div Latency:
          </label>
          <input
            type="number"
            name="divHit"
            placeholder="Enter div latency"
            value={formData.divHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Mul Latency:
          </label>
          <input
            type="number"
            name="mulHit"
            placeholder="Enter mul latency"
            value={formData.mulHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Branch Latency:
          </label>
          <input
            type="number"
            name="integerBranchHit"
            placeholder="Enter branch latency"
            value={formData.integerBranchHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Integer Sub Latency:
          </label>
          <input
            type="number"
            name="integerSubHit"
            placeholder="Enter integer sub latency"
            value={formData.integerSubHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Integer Add Latency:
          </label>
          <input
            type="number"
            name="integerAddHit"
            placeholder="Enter integer add latency"
            value={formData.integerAddHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Sub Latency:
          </label>
          <input
            type="number"
            name="subHit"
            placeholder="Enter fp sub latency"
            value={formData.subHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Add Latency:
          </label>
          <input
            type="number"
            name="addHit"
            placeholder="Enter fp add latency"
            value={formData.addHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Mem Hit Latency:
          </label>
          <input
            type="number"
            name="memHit"
            placeholder="Enter mem hit latency"
            value={formData.memHit}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Mem Miss Latency:
          </label>
          <input
            type="number"
            name="memMiss"
            placeholder="Enter mem miss latency"
            value={formData.memMiss}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300 focus:outline-none"
            onChange={handleInputChange}
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
          >
            Initialize
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormComponent;
