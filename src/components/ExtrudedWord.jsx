import './extruded-word.css'

const LAYERS = 18

/**
 * Real 3D extrusion: the same word stacked on the Z axis inside a preserve-3d
 * parent, so it keeps its depth when the parent rotates. The front face is the
 * last layer; everything behind it is the "side" of the letterform.
 */
export default function ExtrudedWord({ word, className = '', depth = LAYERS }) {
  return (
    <span className={`extruded ${className}`} data-word={word}>
      {Array.from({ length: depth }, (_, i) => (
        <span
          className="extruded-layer"
          key={i}
          style={{ '--d': i, '--t': (i / (depth - 1)).toFixed(3) }}
          aria-hidden={i < depth - 1 ? 'true' : undefined}
        >
          {word}
        </span>
      ))}
    </span>
  )
}
