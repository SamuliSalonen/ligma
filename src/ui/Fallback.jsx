import { Component } from 'react'

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Keeps a crashing 3D scene from taking the game down with it — the DOM layer
 * carries the whole experience on its own if this trips.
 */
export class SceneBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('scene failed, falling back to the DOM layer:', error)
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
