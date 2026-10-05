/**
 * CosmicScene — the 3D layer of the Cosmic Navigator.
 *
 * Abstract geometric core (solid polyhedron + edge cage + fresnel glass
 * shell + soft halo), two tilted depth rings and a restrained particle field.
 * Everything animates by reading the shared SceneState each frame; no React
 * state updates happen in the render loop.
 */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { camera as cam, core, glow, orbit, particles as particleTokens } from '@/config/tokens';
import type { SceneState } from '@/lib/sceneState';

interface SceneProps {
  state: SceneState;
  /** Render loop runs only while the hero is on screen. */
  visible: boolean;
  onReady?: () => void;
}

const ACCENT = new THREE.Color('#e3b36b');
const WARM_WHITE = new THREE.Color('#f3f0ea');

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------------------------------------------------------- */
/* Camera rig: pointer parallax + dolly toward the selected node.    */
/* ---------------------------------------------------------------- */
function Rig({ state }: { state: SceneState }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, cam.distance), []);

  useFrame(() => {
    const still = state.reducedMotion || state.mobile;
    const px = still ? 0 : state.pointer.x;
    const py = still ? 0 : state.pointer.y;
    const sel = state.selectDir;

    target.set(
      -px * cam.parallax + (sel && !still ? sel.x * cam.selectShift.x * 0.35 : 0),
      py * cam.parallax + (sel && !still ? -sel.y * cam.selectShift.y * 0.35 : 0),
      cam.distance * (sel && !state.reducedMotion ? cam.selectDolly : 1),
    );
    camera.position.lerp(target, cam.lerp);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ---------------------------------------------------------------- */
/* Core                                                              */
/* ---------------------------------------------------------------- */
const shellShader = {
  vertex: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: /* glsl */ `
    uniform float uRim;
    uniform float uAccent;
    uniform vec3 uColor;
    uniform vec3 uAccentColor;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float f = 1.0 - max(dot(vNormal, vView), 0.0);
      float rim = pow(f, 2.8);
      vec3 col = mix(uColor, uAccentColor, uAccent);
      float alpha = rim * uRim + 0.03;
      gl_FragColor = vec4(col, alpha);
    }
  `,
};

const haloShader = {
  vertex: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: /* glsl */ `
    uniform float uOpacity;
    uniform float uAccent;
    uniform vec3 uColor;
    uniform vec3 uAccentColor;
    varying vec2 vUv;
    void main() {
      float d = distance(vUv, vec2(0.5));
      float a = smoothstep(0.5, 0.08, d);
      a = pow(a, 2.4) * uOpacity;
      vec3 col = mix(uColor, uAccentColor, uAccent);
      gl_FragColor = vec4(col, a);
    }
  `,
};

function Core({ state }: { state: SceneState }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const shellMat = useRef<THREE.ShaderMaterial>(null);
  const haloMat = useRef<THREE.ShaderMaterial>(null);

  const shellUniforms = useMemo(
    () => ({
      uRim: { value: core.rimBase },
      uAccent: { value: 0 },
      uColor: { value: WARM_WHITE.clone() },
      uAccentColor: { value: ACCENT.clone() },
    }),
    [],
  );
  const haloUniforms = useMemo(
    () => ({
      uOpacity: { value: glow.core },
      uAccent: { value: 0 },
      uColor: { value: new THREE.Color('#9aa0ab') },
      uAccentColor: { value: ACCENT.clone() },
    }),
    [],
  );

  const inner = useMemo(() => new THREE.IcosahedronGeometry(core.radius * 0.58, 1), []);
  const cage = useMemo(
    () => new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(core.radius * 0.86, 0)),
    [],
  );

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const active = state.selectDir ?? state.focusDir;
    const selected = Boolean(state.selectDir);
    const reduced = state.reducedMotion;

    // Resting motion: very slow rotation and a quiet breath.
    if (spin.current && !reduced) {
      spin.current.rotation.y += core.rotationSpeed * d;
      spin.current.rotation.x = Math.sin(performance.now() * 0.00012) * 0.08;
      const s = 1 + Math.sin(performance.now() * 0.0006) * core.breathe;
      spin.current.scale.setScalar(s);
    }

    // Tilt toward the active node.
    if (tilt.current) {
      const amount = selected ? core.tiltSelect : core.tiltHover;
      const tx = active && !reduced ? active.y * amount : 0;
      const ty = active && !reduced ? active.x * amount : 0;
      tilt.current.rotation.x = lerp(tilt.current.rotation.x, tx, cam.lerp);
      tilt.current.rotation.y = lerp(tilt.current.rotation.y, ty, cam.lerp);
    }

    // Light response.
    const rimTarget = active ? core.rimActive : core.rimBase;
    const accentTarget = selected ? 0.38 : active ? 0.12 : 0;
    if (shellMat.current) {
      const u = shellMat.current.uniforms;
      u.uRim.value = lerp(u.uRim.value, rimTarget, 0.06);
      u.uAccent.value = lerp(u.uAccent.value, accentTarget, 0.06);
    }
    if (haloMat.current) {
      const u = haloMat.current.uniforms;
      u.uOpacity.value = lerp(u.uOpacity.value, active ? glow.coreActive : glow.core, 0.06);
      u.uAccent.value = lerp(u.uAccent.value, accentTarget, 0.06);
    }
  });

  return (
    <group ref={tilt}>
      {/* Halo behind the core. */}
      <mesh position={[0, 0, -core.radius * 0.6]} renderOrder={-1}>
        <planeGeometry args={[core.radius * 4.2, core.radius * 4.2]} />
        <shaderMaterial
          ref={haloMat}
          uniforms={haloUniforms}
          vertexShader={haloShader.vertex}
          fragmentShader={haloShader.fragment}
          transparent
          depthWrite={false}
        />
      </mesh>

      <group ref={spin}>
        {/* Solid inner form. */}
        <mesh geometry={inner}>
          <meshStandardMaterial color="#1a1d23" metalness={0.55} roughness={0.38} flatShading />
        </mesh>
        {/* Architectural edge cage. */}
        <lineSegments geometry={cage}>
          <lineBasicMaterial color="#d8dbe0" transparent opacity={0.18} />
        </lineSegments>
      </group>

      {/* Glass shell with fresnel rim. */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[core.radius, 56, 56]} />
        <shaderMaterial
          ref={shellMat}
          uniforms={shellUniforms}
          vertexShader={shellShader.vertex}
          fragmentShader={shellShader.fragment}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */
/* Depth rings                                                       */
/* ---------------------------------------------------------------- */
function Rings({ state }: { state: SceneState }) {
  const g = useRef<THREE.Group>(null);
  const r = orbit.ring3d.radius * core.radius;
  useFrame((_, dt) => {
    if (!g.current || state.reducedMotion) return;
    g.current.rotation.z += dt * 0.012;
  });
  return (
    <group ref={g} rotation={[orbit.ring3d.tilt * Math.PI, 0.18, 0]}>
      <mesh>
        <torusGeometry args={[r, orbit.ring3d.thickness, 6, 160]} />
        <meshBasicMaterial color="#cfd3da" transparent opacity={orbit.ring3d.opacity} depthWrite={false} />
      </mesh>
      <mesh rotation={[0.5, 0.9, 0]}>
        <torusGeometry args={[r * 0.78, orbit.ring3d.thickness, 6, 160]} />
        <meshBasicMaterial color="#cfd3da" transparent opacity={orbit.ring3d.opacity * 0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */
/* Particle field                                                    */
/* ---------------------------------------------------------------- */
function Particles({ state }: { state: SceneState }) {
  const ref = useRef<THREE.Points>(null);
  const count = state.mobile ? particleTokens.mobile : particleTokens.desktop;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const s = particleTokens.spread;
    for (let i = 0; i < count; i++) {
      // Keep a clear zone around the core so it never looks noisy.
      let x = 0;
      let y = 0;
      let z = 0;
      do {
        x = (Math.random() - 0.5) * s * 2;
        y = (Math.random() - 0.5) * s * 1.4;
        z = (Math.random() - 0.5) * s - 1.5;
      } while (Math.hypot(x, y) < core.radius * 1.6);
      arr.set([x, y, z], i * 3);
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current || state.reducedMotion) return;
    ref.current.rotation.y += dt * particleTokens.drift;
    ref.current.rotation.x += dt * particleTokens.drift * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8e4dc"
        size={particleTokens.size}
        sizeAttenuation
        transparent
        opacity={particleTokens.opacity}
        depthWrite={false}
      />
    </points>
  );
}

/* ---------------------------------------------------------------- */
export default function CosmicScene({ state, visible, onReady }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: cam.fov, near: 0.1, far: 40, position: [0, 0, cam.distance] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      frameloop={visible ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} color="#dcdfe6" />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#fff7ea" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#b9c2d0" />
      <Rig state={state} />
      <Core state={state} />
      <Rings state={state} />
      <Particles state={state} />
    </Canvas>
  );
}
