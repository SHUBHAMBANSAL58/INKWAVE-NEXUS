import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import { RotateCcw, Eye, Sparkles, Navigation } from 'lucide-react';

export interface ConstellationNodeData {
  id: string;
  name: string;
  type: 'article' | 'topic' | 'creator' | 'community' | 'idea';
  category?: string;
  position: THREE.Vector3;
  connections: number[];
  color: string;
  details: string;
  targetId?: string;
}

interface CosmicCanvasProps {
  interactive?: boolean;
  onNodeSelect?: (node: ConstellationNodeData | null) => void;
  heightClass?: string;
  filterType?: 'all' | 'article' | 'community' | 'idea';
  searchTerm?: string;
}

export function CosmicCanvas({
  interactive = true,
  onNodeSelect,
  heightClass = 'h-[500px]',
  filterType = 'all',
  searchTerm = '',
}: CosmicCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<ConstellationNodeData | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const { posts, communities, setSelectedArticle, setActiveView } = useApp();

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;
  const particleSpeedRef = useRef(particleSpeed);
  particleSpeedRef.current = particleSpeed;

  const handleSelectNode = useCallback(
    (node: ConstellationNodeData | null) => {
      setSelectedNode(node);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Probe software GL on a scratch canvas to avoid context conflict on the main canvas
    let isSoftware = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl =
        probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl') ||
        probeCanvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rendererName = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          isSoftware = /swiftshader|llvmpipe|software/i.test(rendererName);
        }
      }
    } catch {
      isSoftware = true;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 18, 115);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isSoftware,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSoftware ? 1 : 1.5));
    } catch (err) {
      console.warn('WebGL init fallback:', err);
      return;
    }

    // Procedural Glowing Star Sprite Texture (Zero 404 remote assets)
    const createStarTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.25, 'rgba(56, 189, 248, 0.9)');
        gradient.addColorStop(0.65, 'rgba(168, 85, 247, 0.3)');
        gradient.addColorStop(1, 'rgba(5, 8, 17, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    };

    const starTexture = createStarTexture();

    // 2. Cosmic Background Particle Field
    const particleCount = isSoftware ? 500 : 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x38bdf8), // Electric blue
      new THREE.Color(0xa855f7), // Plasma violet
      new THREE.Color(0x22d3ee), // Aurora cyan
      new THREE.Color(0xe2e8f0), // Soft silver
      new THREE.Color(0x7c3aed), // Cosmic purple
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 55 + Math.random() * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.45;
      positions[i3 + 2] = radius * Math.cos(phi);

      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: isSoftware ? 2.5 : 3.2,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 3. Constellation Nodes from App Data
    const constellationData: ConstellationNodeData[] = [];

    posts.slice(0, 5).forEach((p, idx) => {
      const angle = (idx / 5) * Math.PI * 2;
      const radius = 36 + (idx % 2) * 8;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(idx * 2) * 10,
        Math.sin(angle) * radius
      );
      const connections = [(idx + 1) % 5, (idx + 3) % 5];

      constellationData.push({
        id: `node-post-${p.id}`,
        name: p.title,
        type: 'article',
        category: p.category,
        position: pos,
        connections,
        color: '#38bdf8',
        details: p.excerpt,
        targetId: p.id,
      });
    });

    communities.slice(0, 3).forEach((c, idx) => {
      const angle = ((idx + 0.5) / 3) * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * 22,
        6 - idx * 6,
        Math.sin(angle) * 22
      );
      constellationData.push({
        id: `node-comm-${c.id}`,
        name: c.name,
        type: 'community',
        category: 'Community World',
        position: pos,
        connections: [0, 2],
        color: '#a855f7',
        details: c.description,
        targetId: c.id,
      });
    });

    // Central NEXUS Core node
    constellationData.push({
      id: 'node-nexus-core',
      name: 'NEXUS MESH CORE',
      type: 'idea',
      category: '4-Agent AI Collective',
      position: new THREE.Vector3(0, 0, 0),
      connections: [0, 1, 2, 3, 4],
      color: '#22d3ee',
      details: 'Autonomous multi-agent intelligence orchestrating design, planning, code, and verification.',
    });

    // 4. Create Node Meshes & Rings (Filtered by filterType & searchTerm)
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleEntries = constellationData
      .map((nodeItem, idx) => ({ nodeItem, idx }))
      .filter(({ nodeItem }) => {
        const matchesType = filterType === 'all' || nodeItem.type === filterType;
        const matchesSearch =
          !normalizedSearch ||
          nodeItem.name.toLowerCase().includes(normalizedSearch) ||
          nodeItem.details.toLowerCase().includes(normalizedSearch) ||
          (nodeItem.category || '').toLowerCase().includes(normalizedSearch);
        return matchesType && matchesSearch;
      });
    const visibleIdxSet = new Set(visibleEntries.map((e) => e.idx));

    const nodeSpheres: THREE.Mesh[] = [];
    const sphereMaterials: THREE.Material[] = [];
    const ringGeometries: THREE.BufferGeometry[] = [];
    const ringMaterials: THREE.Material[] = [];
    const sphereGeometry = new THREE.SphereGeometry(2.4, 16, 16);
    const coreSphereGeometry = new THREE.SphereGeometry(4.2, 24, 24);

    visibleEntries.forEach(({ nodeItem, idx }) => {
      const isCore = nodeItem.id === 'node-nexus-core';
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(nodeItem.color),
      });
      sphereMaterials.push(mat);

      const sphere = new THREE.Mesh(isCore ? coreSphereGeometry : sphereGeometry, mat);
      sphere.position.copy(nodeItem.position);
      sphere.userData = { nodeIndex: idx, nodeData: nodeItem };
      nodeSpheres.push(sphere);
      nodeGroup.add(sphere);

      // Outer luminous ring
      const ringGeo = new THREE.RingGeometry(isCore ? 5.2 : 3.2, isCore ? 6.2 : 3.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(nodeItem.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      ringGeometries.push(ringGeo);
      ringMaterials.push(ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(nodeItem.position);
      ring.rotation.x = Math.PI / 2;
      nodeGroup.add(ring);
    });

    // 5. Connecting Lines (only between visible nodes)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const linePoints: THREE.Vector3[] = [];
    visibleEntries.forEach(({ nodeItem }) => {
      nodeItem.connections.forEach((connIdx) => {
        if (visibleIdxSet.has(connIdx) && constellationData[connIdx]) {
          linePoints.push(nodeItem.position);
          linePoints.push(constellationData[connIdx].position);
        }
      });
    });

    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lines = new THREE.LineSegments(lineGeo, lineMaterial);
    nodeGroup.add(lines);

    // 6. Raycaster & Orbit Drag Controls (ignore click after drag > 6px)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let downX = 0;
    let downY = 0;

    const onPointerDown = (event: MouseEvent) => {
      if (!interactive) return;
      const dragDistance = Math.hypot(event.clientX - downX, event.clientY - downY);
      if (dragDistance > 6) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeSpheres);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const nodeInfo = hit.userData.nodeData as ConstellationNodeData;
        handleSelectNode(nodeInfo);
      }
    };

    canvas.addEventListener('click', onPointerDown);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      nodeGroup.rotation.y += deltaX * 0.005;
      nodeGroup.rotation.x += deltaY * 0.005;
      particles.rotation.y += deltaX * 0.002;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop with Paced Framerate
    let animationFrameId: number;
    let lastDraw = 0;
    const targetFps = isSoftware ? 24 : 60;
    const frameInterval = 1000 / targetFps;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (time - lastDraw < frameInterval) return;
      lastDraw = time;

      const speed = particleSpeedRef.current;
      if (isRotatingRef.current) {
        particles.rotation.y += 0.0006 * speed;
        nodeGroup.rotation.y += 0.0012 * speed;
      }

      nodeSpheres.forEach((sphere, i) => {
        sphere.position.y += Math.sin(time * 0.002 + i) * 0.025;
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', onPointerDown);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      starTexture.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      sphereGeometry.dispose();
      coreSphereGeometry.dispose();
      sphereMaterials.forEach((m) => m.dispose());
      ringGeometries.forEach((g) => g.dispose());
      ringMaterials.forEach((m) => m.dispose());
      lineGeo.dispose();
      lineMaterial.dispose();
    };
  }, [posts, communities, interactive, handleSelectNode, filterType, searchTerm]);

  const handleNavigateFromNode = (node: ConstellationNodeData) => {
    if (node.type === 'article' && node.targetId) {
      const targetPost = posts.find((p) => p.id === node.targetId);
      if (targetPost) {
        setSelectedArticle(targetPost);
      }
    } else if (node.type === 'community') {
      setActiveView('communities');
    } else if (node.id === 'node-nexus-core') {
      setActiveView('nexus-core');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} overflow-hidden rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)]`}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Selected Node Card */}
      {selectedNode && (
        <div className="absolute top-4 left-4 z-20 max-w-sm w-full p-4 rounded-2xl glass-panel border border-sky-500/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider mb-1"
                style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
              >
                {selectedNode.type} • {selectedNode.category || 'Cosmic'}
              </span>
              <h4 className="font-bold text-sm text-[var(--text-primary)] leading-tight">
                {selectedNode.name}
              </h4>
            </div>
            <button
              onClick={() => handleSelectNode(null)}
              className="text-[var(--text-muted)] hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-3">
            {selectedNode.details}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigateFromNode(selectedNode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-500/20"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Explore Node</span>
            </button>
            <button
              onClick={() => handleSelectNode(null)}
              className="py-1.5 px-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Bottom Collapsible Control Dock */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-[var(--bg-primary)]/85 backdrop-blur-md border border-[var(--border-color)] p-1.5 rounded-2xl shadow-xl">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-xl text-xs transition-colors ${
            isRotating ? 'text-sky-400 bg-sky-500/15' : 'text-[var(--text-muted)] hover:text-white'
          }`}
          title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
        >
          <RotateCcw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '12s' }} />
        </button>

        <button
          onClick={() => setParticleSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
          className="px-2 py-1 rounded-xl text-[10px] font-mono text-[var(--text-muted)] hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
          title="Toggle Drift Speed"
        >
          {particleSpeed}x
        </button>

        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className="p-1.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
          title="Toggle Universe Info"
        >
          <Eye className="w-4 h-4" />
        </button>

        {isControlsOpen && (
          <div className="absolute bottom-12 right-0 w-64 p-3 rounded-2xl glass-panel border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-2 shadow-2xl">
            <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)]">
              <span className="font-bold text-[var(--text-primary)] font-mono text-[11px]">COSMIC GRAPH</span>
              <span className="text-[10px] text-emerald-400 font-mono">LIVE SYNC</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Drag to rotate universe. Click any celestial node to inspect connections and jump directly into the discussion or publication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
