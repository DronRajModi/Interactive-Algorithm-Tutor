export default function PseudocodePanel({ pseudocodeLines, currentLine }) {
    return (
      <div className="min-w-[250px] max-w-[300px] border rounded p-4 shadow bg-white h-fit">
        <h3 className="text-lg font-semibold mb-4">Pseudocode</h3>
        <div className="space-y-2">
          {pseudocodeLines.map((line, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded ${
                currentLine === index
                  ? 'bg-yellow-200 border-l-4 border-yellow-500 font-semibold'
                  : ''
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }
  