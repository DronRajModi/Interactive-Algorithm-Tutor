export default function PseudocodePanel({ pseudocodeLines, currentLine }) {
  return (
    <div className="min-w-[250px] max-w-[300px] border border-gray-200 rounded-lg p-4 shadow bg-gray-50 h-fit">
      <h3 className="text-xl font-bold mb-3 text-gray-800">Pseudocode</h3>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {pseudocodeLines.map((line, index) => (
          <pre
            key={index}
            className={`whitespace-pre-wrap text-sm font-mono px-3 py-1 rounded transition-colors duration-200 ${
              currentLine === index
                ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            {line}
          </pre>
        ))}
      </div>
    </div>
  );
}