import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import {
  Rocket,
  Shield,
  Zap,
  Award,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GameStats {
  score: number;
  distance: number;
  orbs: number;
  shield: number;
  speed: number;
  multiplier: number;
}

export function CosmicGameView() {
  const { setActiveView } = useApp();
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Game UI State
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    orbs: 0,
    shield: 100,
    speed: 60,
    multiplier: 1,
  });
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('inkwave_cosmic_highscore')) || 1420;
    } catch {
      return 1420;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // Mutable game refs for 60fps loop
  const gameLoopRef = useRef<{
    shipGroup: THREE.Group | null;
    asteroids: THREE.Mesh[];
    orbs: THREE.Mesh[];
    particles: THREE.Points | null;
    thrusterLight: THREE.PointLight | null;
    keys: { [key: string]: boolean };
    speed: number;
    targetSpeed: number;
    shipPos: { x: number; y: number; vx: number; vy: number; roll: number };
    score: number;
    distance: number;
    orbsCount: number;
    shield: number;
    active: boolean;
  }>({
    shipGroup: null,
    asteroids: [],
    orbs: [],
    particles: null,
    thrusterLight: null,
    keys: {},
    speed: 60,
    targetSpeed: 60,
    shipPos: { x: 0, y: 0, vx: 0, vy: 0, roll: 0 },
    score: 0,
    distance: 0,
    orbsCount: 0,
    shield: 100,
    active: false,
  });

  // Audio Context Ref (Procedural sound effects - 0 remote dependencies)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthSound = (type: 'laser' | 'pickup' | 'hit' | 'boost') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'pickup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'boost') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Audio fallback silent
    }
  };

  // Start / Restart game
  const startGame = () => {
    const loop = gameLoopRef.current;
    loop.score = 0;
    loop.distance = 0;
    loop.orbsCount = 0;
    loop.shield = 100;
    loop.speed = 60;
    loop.targetSpeed = 60;
    loop.shipPos = { x: 0, y: 0, vx: 0, vy: 0, roll: 0 };
    loop.active = true;
    setGameState('playing');
    playSynthSound('boost');
  };

  // Three.js Mount & Animation Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.007);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 800);
    camera.position.set(0, 3.2, 8.5);
    camera.lookAt(0, 0.8, -12);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x04060d);
    container.appendChild(renderer.domElement);

    // 3. PBR Studio Lighting
    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.8);
    keyLight.position.set(6, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.2);
    rimLight.position.set(-8, -4, -15);
    scene.add(rimLight);

    // 4. Starfield Cosmic Particle Cloud (1500 procedural stars)
    const starCount = isSoftwareGl ? 600 : 1600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x818cf8),
      new THREE.Color(0xc084fc),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 160;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPos[i * 3 + 2] = -Math.random() * 320;

      const c = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starCloud = new THREE.Points(starGeo, starMat);
    scene.add(starCloud);
    gameLoopRef.current.particles = starCloud;

    // 5. Composite 5-Part Procedural Starship (THREE.Group)
    // Part 1: Fuselage / Hull
    const shipGroup = new THREE.Group();
    shipGroup.position.set(0, 0, 0);

    const hullGeo = new THREE.ConeGeometry(0.75, 3.4, 7);
    hullGeo.rotateX(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.22,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    shipGroup.add(hull);

    // Part 2: Translucent Cockpit Canopy
    const cockpitGeo = new THREE.SphereGeometry(0.42, 16, 12);
    cockpitGeo.scale(1, 0.7, 1.8);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.32, -0.2);
    shipGroup.add(cockpit);

    // Part 3: Dual Swept Plasma Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.2, -1.2);
    wingShape.lineTo(2.4, -1.8);
    wingShape.lineTo(0, -1.1);
    wingShape.closePath();

    const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });

    const rightWing = new THREE.Mesh(wingExtrude, wingMat);
    rightWing.position.set(0.4, 0, 0.6);
    rightWing.rotation.x = Math.PI / 2;
    shipGroup.add(rightWing);

    const leftWing = new THREE.Mesh(wingExtrude, wingMat);
    leftWing.position.set(-0.4, 0, 0.6);
    leftWing.rotation.x = Math.PI / 2;
    leftWing.scale.set(-1, 1, 1);
    shipGroup.add(leftWing);

    // Part 4: Ionized Thruster Rings
    const thrusterGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.6, 12);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.15,
    });

    const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    leftThruster.position.set(-0.42, -0.05, 1.5);
    shipGroup.add(leftThruster);

    const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    rightThruster.position.set(0.42, -0.05, 1.5);
    shipGroup.add(rightThruster);

    // Part 5: Glowing Quantum Plasma Flame
    const thrusterLight = new THREE.PointLight(0x06b6d4, 4, 8);
    thrusterLight.position.set(0, 0, 2.1);
    shipGroup.add(thrusterLight);
    gameLoopRef.current.thrusterLight = thrusterLight;

    scene.add(shipGroup);
    gameLoopRef.current.shipGroup = shipGroup;

    // 6. Asteroid Hazards (Procedural Deformed Icosahedrons)
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });

    const asteroids: THREE.Mesh[] = [];
    const asteroidCount = 12;

    for (let i = 0; i < asteroidCount; i++) {
      const radius = 0.9 + Math.random() * 1.1;
      const aGeo = new THREE.IcosahedronGeometry(radius, 1);

      // Procedural surface jittering
      const posAttr = aGeo.attributes.position;
      for (let j = 0; j < posAttr.count; j++) {
        const vx = posAttr.getX(j);
        const vy = posAttr.getY(j);
        const vz = posAttr.getZ(j);
        const noise = 1 + (Math.random() - 0.5) * 0.28;
        posAttr.setXYZ(j, vx * noise, vy * noise, vz * noise);
      }
      aGeo.computeVertexNormals();

      const mesh = new THREE.Mesh(aGeo, asteroidMat);
      mesh.position.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 12, -40 - i * 22);
      (mesh as any).rotSpeed = {
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      };
      scene.add(mesh);
      asteroids.push(mesh);
    }
    gameLoopRef.current.asteroids = asteroids;

    // 7. Collectible Quantum Knowledge Orbs
    const orbs: THREE.Mesh[] = [];
    const orbCount = 7;
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.3,
      wireframe: false,
    });

    for (let i = 0; i < orbCount; i++) {
      const oGeo = new THREE.OctahedronGeometry(0.7, 2);
      const orbMesh = new THREE.Mesh(oGeo, orbMat);
      orbMesh.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 9, -30 - i * 32);
      scene.add(orbMesh);
      orbs.push(orbMesh);
    }
    gameLoopRef.current.orbs = orbs;

    // Keyboard controls listeners
    const onKeyDown = (e: KeyboardEvent) => {
      gameLoopRef.current.keys[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      gameLoopRef.current.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Responsive resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 8. Main 60fps Game Loop with Software GL Pacing
    let animFrameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : null;
        if (state === gl.UNSIGNALED) {
          animFrameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          animFrameId = window.setTimeout(cb, 60);
        }
      };
      animFrameId = window.setTimeout(poll, 6);
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);
      const loop = gameLoopRef.current;

      if (loop.active) {
        // Player Controls (WASD / Arrows)
        const keys = loop.keys;
        const accel = 35;
        let targetVx = 0;
        let targetVy = 0;

        if (keys['a'] || keys['arrowleft']) targetVx -= accel;
        if (keys['d'] || keys['arrowright']) targetVx += accel;
        if (keys['w'] || keys['arrowup']) targetVy += accel;
        if (keys['s'] || keys['arrowdown']) targetVy -= accel;

        // Hyper-boost on Spacebar
        if (keys[' ']) {
          loop.targetSpeed = 110;
        } else {
          loop.targetSpeed = 60;
        }

        // Exponential Damping Physics
        loop.speed = THREE.MathUtils.damp(loop.speed, loop.targetSpeed, 4, dt);
        loop.shipPos.vx = THREE.MathUtils.damp(loop.shipPos.vx, targetVx, 6, dt);
        loop.shipPos.vy = THREE.MathUtils.damp(loop.shipPos.vy, targetVy, 6, dt);

        loop.shipPos.x += loop.shipPos.vx * dt;
        loop.shipPos.y += loop.shipPos.vy * dt;

        // Boundaries clamp
        loop.shipPos.x = THREE.MathUtils.clamp(loop.shipPos.x, -11, 11);
        loop.shipPos.y = THREE.MathUtils.clamp(loop.shipPos.y, -5.5, 6.5);

        // Ship bank roll
        const targetRoll = -loop.shipPos.vx * 0.022;
        loop.shipPos.roll = THREE.MathUtils.damp(loop.shipPos.roll, targetRoll, 8, dt);

        if (shipGroup) {
          shipGroup.position.x = loop.shipPos.x;
          shipGroup.position.y = loop.shipPos.y;
          shipGroup.rotation.z = loop.shipPos.roll;
          shipGroup.rotation.y = -loop.shipPos.vx * 0.008;
          shipGroup.rotation.x = -loop.shipPos.vy * 0.008;
        }

        // Thruster light flicker
        if (loop.thrusterLight) {
          loop.thrusterLight.intensity = (loop.speed > 80 ? 7 : 3.5) + Math.sin(clock.elapsedTime * 30) * 0.8;
        }

        // Update score & distance
        loop.distance += (loop.speed * dt * 0.1);
        loop.score += Math.floor(loop.speed * dt * 0.8);

        // Move Starfield
        const pAttr = starGeo.attributes.position;
        for (let i = 0; i < starCount; i++) {
          let z = pAttr.getZ(i);
          z += loop.speed * dt * 1.8;
          if (z > 20) z = -300;
          pAttr.setZ(i, z);
        }
        pAttr.needsUpdate = true;

        // Update Asteroids & Collision Detection
        for (const ast of loop.asteroids) {
          ast.position.z += loop.speed * dt;
          const rot = (ast as any).rotSpeed;
          ast.rotation.x += rot.x;
          ast.rotation.y += rot.y;

          // Recycle asteroid
          if (ast.position.z > 12) {
            ast.position.z = -220 - Math.random() * 40;
            ast.position.x = (Math.random() - 0.5) * 22;
            ast.position.y = (Math.random() - 0.5) * 11;
          }

          // Collision Check with ship
          const dist = ast.position.distanceTo(shipGroup.position);
          if (dist < 1.7) {
            playSynthSound('hit');
            loop.shield -= 25;
            ast.position.z = -220; // reset asteroid
            if (loop.shield <= 0) {
              loop.shield = 0;
              loop.active = false;
              setGameState('gameover');
              if (loop.score > highScore) {
                setHighScore(loop.score);
                try {
                  localStorage.setItem('inkwave_cosmic_highscore', String(loop.score));
                } catch {}
              }
            }
          }
        }

        // Update Knowledge Orbs & Pickup
        for (const orb of loop.orbs) {
          orb.position.z += loop.speed * dt;
          orb.rotation.x += dt * 1.5;
          orb.rotation.y += dt * 2.0;

          // Recycle orb
          if (orb.position.z > 12) {
            orb.position.z = -240 - Math.random() * 50;
            orb.position.x = (Math.random() - 0.5) * 18;
            orb.position.y = (Math.random() - 0.5) * 9;
          }

          // Pickup collision
          const orbDist = orb.position.distanceTo(shipGroup.position);
          if (orbDist < 1.8) {
            playSynthSound('pickup');
            loop.orbsCount += 1;
            loop.score += 250;
            orb.position.z = -240;
          }
        }

        // Sync React HUD state at throttled pace
        if (Math.random() < 0.25) {
          setStats({
            score: Math.floor(loop.score),
            distance: Math.floor(loop.distance),
            orbs: loop.orbsCount,
            shield: loop.shield,
            speed: Math.floor(loop.speed),
            multiplier: loop.speed > 80 ? 2 : 1,
          });
        }
      } else {
        // Idle title state animation
        if (shipGroup) {
          shipGroup.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.15;
          shipGroup.position.y = Math.sin(clock.elapsedTime * 1.5) * 0.25;
        }
        for (const ast of loop.asteroids) {
          ast.position.z += 8 * dt;
          if (ast.position.z > 12) ast.position.z = -220;
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animFrameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      if (isSoftwareGl) {
        clearTimeout(animFrameId);
      } else {
        cancelAnimationFrame(animFrameId);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      starGeo.dispose();
      starMat.dispose();
      hullGeo.dispose();
      hullMat.dispose();
      cockpitGeo.dispose();
      cockpitMat.dispose();
      wingExtrude.dispose();
      wingMat.dispose();
      thrusterGeo.dispose();
      thrusterMat.dispose();
      asteroidMat.dispose();
      orbMat.dispose();
      asteroids.forEach((m) => m.geometry.dispose());
      orbs.forEach((m) => m.geometry.dispose());

      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close?.().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] min-h-[580px] rounded-3xl overflow-hidden border border-cyan-500/20 bg-slate-950 flex flex-col shadow-2xl shadow-cyan-950/40">
      {/* 3D Canvas Mounting Surface */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-crosshair" />

      {/* Top HUD: Unobstructed Viewport */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-400 backdrop-blur-md">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold font-mono tracking-wider text-slate-100">
                INKWAVE: STELLAR DRIFT
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                3D SIMULATION
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Quantum knowledge runner powered by Three.js
            </p>
          </div>
        </div>

        {/* Live Gameplay Telemetry Badges */}
        {gameState === 'playing' && (
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs pointer-events-auto">
            {/* Score */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              <div className="text-[10px] text-slate-400">SCORE</div>
              <div className="text-cyan-400 font-bold text-sm sm:text-base">{stats.score}</div>
            </div>

            {/* Knowledge Orbs */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] text-slate-400">ORBS</div>
                <div className="text-purple-300 font-bold">{stats.orbs}</div>
              </div>
            </div>

            {/* Shield Bar */}
            <div className="hidden sm:block px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                SHIELD ({stats.shield}%)
              </div>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-200 ${
                    stats.shield > 40 ? 'bg-cyan-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.shield}%` }}
                />
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400"
              title="Toggle Synth Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>
        )}
      </header>

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="relative z-20 m-auto max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl text-center shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-white mb-2">
            ENTER THE STELLAR VOID
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Navigate your procedural starship through asteroid clusters, recover lost quantum knowledge orbs, and maintain maximum hyperlane velocity.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 mb-6">
            <div>
              <span className="text-slate-500 block text-[10px]">PILOT CONTROLS</span>
              <span className="text-cyan-400 font-bold">W, A, S, D / Arrows</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">HYPER-BOOST</span>
              <span className="text-purple-400 font-bold">Hold SPACEBAR</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6 px-1">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              HIGH SCORE:
            </span>
            <span className="text-amber-400 font-bold">{highScore} PTS</span>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono font-bold text-sm tracking-wider shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 group transition-all"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>INITIALIZE RUNNER</span>
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="relative z-20 m-auto max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-red-500/30 backdrop-blur-xl text-center shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-white mb-1">HULL COMPROMISED</h2>
          <p className="text-xs text-slate-400 font-mono mb-6">Simulation halted by shield exhaustion</p>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6">
            <div>
              <div className="text-[10px] text-slate-500">FINAL SCORE</div>
              <div className="text-cyan-400 text-base font-bold">{stats.score}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">DISTANCE</div>
              <div className="text-slate-200 text-base font-bold">{stats.distance}ly</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">ORBS</div>
              <div className="text-purple-400 text-base font-bold">{stats.orbs}</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-sm tracking-wider shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 group transition-all"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform" />
            <span>RE-ENGAGE HYPERLANE</span>
          </button>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <footer className="mt-auto relative z-10 p-3 sm:p-4 flex flex-col items-center">
        <button
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="mb-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md pointer-events-auto"
        >
          {isControlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Flight Telemetry Dock</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Dock (Zen Mode)</span>
            </>
          )}
        </button>

        {!isControlsCollapsed && (
          <div className="w-full max-w-2xl px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md flex items-center justify-between text-xs font-mono text-slate-300 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-[11px]">HYPERLANE VELOCITY:</span>
              <span className="text-cyan-400 font-bold">{stats.speed} km/s</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('ai-studio')}
                className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-[11px]"
              >
                Launch AI Studio
              </button>
              <button
                onClick={() => setActiveView('feed')}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px]"
              >
                Back to Feed
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
