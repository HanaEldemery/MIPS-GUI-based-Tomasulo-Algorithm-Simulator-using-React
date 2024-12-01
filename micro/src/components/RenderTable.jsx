const RenderTable = (title, buffer = [], headers = []) => {
  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 px-4 py-2 font-medium text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buffer.length > 0 ? (
              buffer.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100`}
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="border border-gray-300 px-4 py-2 text-gray-600"
                    >
                      {item?.[header] === "" ? "-" : item?.[header] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="border border-gray-300 px-4 py-2 text-gray-600 text-center"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenderTable;
