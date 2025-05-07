import React from 'react';
import { motion } from 'framer-motion';

export default function Graph({
  width,
  height,
  nodes,
  edges,
  nodePositions,
  isEdgeHighlighted,
  isNodeActive,
  isNodeInFinalSolution
}) {
  return (
    <svg width={width} height={height} className="bg-gray-50 border border-gray-200 rounded-lg">
      {edges.map((edge, i) => {
        const from = nodePositions[edge.from];
        const to   = nodePositions[edge.to];
        if (!from || !to) return null;
        const highlighted = isEdgeHighlighted(edge.from, edge.to);
        return (
          <g key={i}>
            <line
              x1={from.x} y1={from.y}
              x2={to.x}   y2={to.y}
              stroke={highlighted ? '#10b981' : '#d1d5db'}
              strokeWidth={highlighted ? 3 : 2}
              strokeLinecap="round"
            />
            <text
              x={(from.x + to.x)/2}
              y={(from.y + to.y)/2 - 10}
              textAnchor="middle"
              fill={highlighted ? '#059669' : '#6b7280'}
              fontSize="14"
              fontWeight={highlighted ? 'bold' : 'normal'}
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {nodes.map(node => {
        const pos = nodePositions[node];
        if (!pos) return null;
        const active = isNodeActive(node);
        const solved = isNodeInFinalSolution(node);
        const fill = active ? '#fef08a' : solved ? '#bbf7d0' : '#fff';
        const stroke = solved ? '#16a34a' : '#000';

        return (
          <g key={node}>
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={25}
              fill={fill}
              stroke={stroke}
              strokeWidth={solved ? 3 : 2}
              animate={ active ? { scale: [1,1.1,1] } : {} }
              transition={{ duration: 0.5 }}
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fill="#000"
              fontSize="16"
              fontWeight="bold"
            >
              {node}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
