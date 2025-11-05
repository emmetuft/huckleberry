import React from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

const ForceGraph3DExample: React.FC = () => {
  // Example data
  const data = {
    nodes: [
      { id: 'A', group: 1 },
      { id: 'B', group: 1 },
      { id: 'C', group: 2 },
      { id: 'D', group: 2 },
    ],
    links: [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' },
    ],
  };

  return (
    <ForceGraph3D
      graphData={data}
      backgroundColor="rgba(0,0,0,0)"
      nodeAutoColorBy="group"
      nodeThreeObjectExtend={true}
      nodeThreeObject={(node) => {
        const sprite = new SpriteText(node.id);
        sprite.color = node.color || 'lightgray';
        sprite.textHeight = 8;
        return sprite;
      }}
    />
  );
};

export default ForceGraph3DExample;
