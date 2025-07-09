/**
 * ================================================================
 * SOFTCRONW THREE.JS EFFECTS SYSTEM
 * Sistema avanzado de efectos 3D con Three.js y WebGL
 * ================================================================
 */

class ThreeJSEffects {
  constructor() {
    this.scenes = new Map();
    this.renderers = new Map();
    this.cameras = new Map();
    this.meshes = new Map();
    this.animationFrames = new Map();
    this.isInitialized = false;
    this.mouse = { x: 0, y: 0 };
    this.raycaster = null;
    this.clock = null;
  }

  // ================================
  // INICIALIZACIÓN
  // ================================

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('THREE.js no está disponible');
      return;
    }

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    
    this.initHeroScene();
    this.initBackgroundParticles();
    this.initFloatingGeometry();
    this.initInteractiveElements();
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('🎮 Sistema Three.js inicializado');
  }

  // ================================
  // ESCENA HERO PRINCIPAL
  // ================================

  initHeroScene() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas) return;

    // Configurar escena
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 100, 1000);

    // Configurar cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 100);

    // Configurar renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Guardar referencias
    this.scenes.set('hero', scene);
    this.cameras.set('hero', camera);
    this.renderers.set('hero', renderer);

    // Crear geometrías
    this.createHeroGeometries(scene);
    
    // Iluminación
    this.setupHeroLighting(scene);
    
    // Iniciar animación
    this.startHeroAnimation();
  }

  createHeroGeometries(scene) {
    const geometries = [];

    // Icosaedro principal con material holográfico
    const icosahedronGeometry = new THREE.IcosahedronGeometry(30, 1);
    const icosahedronMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
      emissive: 0x001122,
      shininess: 100
    });
    
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(50, 0, -50);
    icosahedron.name = 'icosahedron';
    scene.add(icosahedron);
    geometries.push(icosahedron);

    // Torus con efecto de rotación
    const torusGeometry = new THREE.TorusGeometry(25, 8, 16, 32);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.8,
      emissive: 0x221100,
      shininess: 100
    });
    
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-40, 30, -30);
    torus.name = 'torus';
    scene.add(torus);
    geometries.push(torus);

    // Dodecaedro flotante
    const dodecahedronGeometry = new THREE.DodecahedronGeometry(20);
    const dodecahedronMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7,
      emissive: 0x002211,
      wireframe: true,
      shininess: 100
    });
    
    const dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecahedronMaterial);
    dodecahedron.position.set(-20, -40, -60);
    dodecahedron.name = 'dodecahedron';
    scene.add(dodecahedron);
    geometries.push(dodecahedron);

    // Esferas orbitantes
    this.createOrbitingSpheres(scene);

    // Guardar geometrías
    this.meshes.set('hero', geometries);
  }

  createOrbitingSpheres(scene) {
    const sphereGroup = new THREE.Group();
    
    for (let i = 0; i < 8; i++) {
      const sphereGeometry = new THREE.SphereGeometry(3, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 8, 0.8, 0.6),
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color().setHSL(i / 8, 0.5, 0.2)
      });
      
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      // Posición orbital
      const angle = (i / 8) * Math.PI * 2;
      const radius = 80;
      sphere.position.x = Math.cos(angle) * radius;
      sphere.position.z = Math.sin(angle) * radius;
      sphere.position.y = (Math.random() - 0.5) * 40;
      
      sphere.userData = { 
        originalPosition: sphere.position.clone(),
        orbitAngle: angle,
        orbitRadius: radius,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      sphereGroup.add(sphere);
    }
    
    sphereGroup.name = 'orbitingSpheres';
    scene.add(sphereGroup);
  }

  setupHeroLighting(scene) {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Luces de colores para efectos
    const colorLights = [
      { color: 0x00d4ff, position: [50, 0, 50] },
      { color: 0xff6b00, position: [-50, 50, 0] },
      { color: 0x00ff88, position: [0, -50, 50] }
    ];

    colorLights.forEach(lightData => {
      const light = new THREE.PointLight(lightData.color, 0.8, 200);
      light.position.set(...lightData.position);
      scene.add(light);
    });
  }

  startHeroAnimation() {
    const scene = this.scenes.get('hero');
    const camera = this.cameras.get('hero');
    const renderer = this.renderers.get('hero');
    const geometries = this.meshes.get('hero');

    if (!scene || !camera || !renderer) return;

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      this.animationFrames.set('hero', animationId);

      const elapsedTime = this.clock.getElapsedTime();

      // Animar geometrías principales
      if (geometries) {
        geometries.forEach(mesh => {
          switch (mesh.name) {
            case 'icosahedron':
              mesh.rotation.x = elapsedTime * 0.3;
              mesh.rotation.y = elapsedTime * 0.2;
              mesh.position.y = Math.sin(elapsedTime) * 10;
              break;
              
            case 'torus':
              mesh.rotation.x = elapsedTime * 0.4;
              mesh.rotation.z = elapsedTime * 0.3;
              mesh.position.y += Math.sin(elapsedTime * 2) * 0.2;
              break;
              
            case 'dodecahedron':
              mesh.rotation.y = elapsedTime * 0.5;
              mesh.rotation.z = elapsedTime * 0.1;
              mesh.position.x = -20 + Math.cos(elapsedTime * 0.5) * 15;
              break;
          }
        });
      }

      // Animar esferas orbitantes
      const sphereGroup = scene.getObjectByName('orbitingSpheres');
      if (sphereGroup) {
        sphereGroup.children.forEach(sphere => {
          const userData = sphere.userData;
          
          // Órbita
          userData.orbitAngle += 0.01;
          sphere.position.x = Math.cos(userData.orbitAngle) * userData.orbitRadius;
          sphere.position.z = Math.sin(userData.orbitAngle) * userData.orbitRadius;
          
          // Flotación vertical
          sphere.position.y = userData.originalPosition.y + Math.sin(elapsedTime * 2 + userData.floatOffset) * 5;
          
          // Rotación propia
          sphere.rotation.x += 0.02;
          sphere.rotation.y += 0.01;
        });
      }

      // Efecto de mouse parallax en cámara
      camera.position.x += (this.mouse.x * 0.05 - camera.position.x) * 0.05;
      camera.position.y += (-this.mouse.y * 0.05 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();
  }

  // ================================
  // PARTÍCULAS DE FONDO
  // ================================

  initBackgroundParticles() {
    const container = document.getElementById('particles-hero');
    if (!container) return;

    // Crear scene para partículas
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    container.appendChild(renderer.domElement);

    // Crear sistema de partículas
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Posiciones aleatorias
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 1000;
      
      // Colores aleatorios
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Tamaños aleatorios
      sizes[i] = Math.random() * 4 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Guardar referencias
    this.scenes.set('particles', scene);
    this.cameras.set('particles', camera);
    this.renderers.set('particles', renderer);
    this.meshes.set('particles', particles);

    // Iniciar animación
    this.startParticleAnimation();
  }

  startParticleAnimation() {
    const scene = this.scenes.get('particles');
    const camera = this.cameras.get('particles');
    const renderer = this.renderers.get('particles');
    const particles = this.meshes.get('particles');

    if (!scene || !camera || !renderer || !particles) return;

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      this.animationFrames.set('particles', animationId);

      const elapsedTime = this.clock.getElapsedTime();

      // Animar partículas
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Movimiento ondulante
        positions[i + 1] = positions[i + 1] + Math.sin(elapsedTime * 0.5 + positions[i] * 0.01) * 0.5;
        
        // Rotación suave
        const x = positions[i];
        const z = positions[i + 2];
        positions[i] = x * Math.cos(0.001) - z * Math.sin(0.001);
        positions[i + 2] = x * Math.sin(0.001) + z * Math.cos(0.001);
      }
      
      particles.geometry.attributes.position.needsUpdate = true;

      // Rotación de la cámara
      camera.position.x = Math.cos(elapsedTime * 0.1) * 100;
      camera.position.z = Math.sin(elapsedTime * 0.1) * 100;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();
  }

  // ================================
  // GEOMETRÍAS FLOTANTES
  // ================================

  initFloatingGeometry() {
    const containers = document.querySelectorAll('.floating-geometry');
    
    containers.forEach((container, index) => {
      this.createFloatingElement(container, index);
    });
  }

  createFloatingElement(container, index) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(100, 100);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    container.appendChild(renderer.domElement);

    // Diferentes geometrías según el índice
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.7, 16, 16),
      new THREE.ConeGeometry(0.7, 1.5, 8),
      new THREE.CylinderGeometry(0.5, 0.8, 1.2, 8),
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(0.9),
      new THREE.RingGeometry(0.5, 1, 16),
      new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8)
    ];

    const geometry = geometries[index % geometries.length];
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((index / 8) * 360, 0.8, 0.6),
      transparent: true,
      opacity: 0.8,
      wireframe: index % 2 === 0
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Iluminación simple
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    camera.position.z = 3;

    // Guardar referencias
    const sceneKey = `floating-${index}`;
    this.scenes.set(sceneKey, scene);
    this.cameras.set(sceneKey, camera);
    this.renderers.set(sceneKey, renderer);
    this.meshes.set(sceneKey, mesh);

    // Iniciar animación
    this.startFloatingAnimation(sceneKey);
  }

  startFloatingAnimation(sceneKey) {
    const scene = this.scenes.get(sceneKey);
    const camera = this.cameras.get(sceneKey);
    const renderer = this.renderers.get(sceneKey);
    const mesh = this.meshes.get(sceneKey);

    if (!scene || !camera || !renderer || !mesh) return;

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      this.animationFrames.set(sceneKey, animationId);

      const elapsedTime = this.clock.getElapsedTime();

      // Rotación suave
      mesh.rotation.x = elapsedTime * 0.5;
      mesh.rotation.y = elapsedTime * 0.3;
      mesh.rotation.z = elapsedTime * 0.1;

      // Flotación
      mesh.position.y = Math.sin(elapsedTime * 2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();
  }

  // ================================
  // ELEMENTOS INTERACTIVOS
  // ================================

  initInteractiveElements() {
    this.createInteractiveCards();
    this.createHoverEffects();
  }

  createInteractiveCards() {
    const cards = document.querySelectorAll('.service-card-3d');
    
    cards.forEach((card, index) => {
      // Agregar canvas para efectos 3D
      const canvas = document.createElement('canvas');
      canvas.className = 'card-3d-canvas';
      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      `;
      
      card.style.position = 'relative';
      card.appendChild(canvas);

      // Crear escena para la tarjeta
      this.createCardScene(canvas, index);
    });
  }

  createCardScene(canvas, index) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Crear efecto de partículas para la tarjeta
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 4;
      positions[i3 + 1] = (Math.random() - 0.5) * 4;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      const color = new THREE.Color().setHSL(0.6, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // Guardar referencias
    const cardKey = `card-${index}`;
    this.scenes.set(cardKey, scene);
    this.cameras.set(cardKey, camera);
    this.renderers.set(cardKey, renderer);
    this.meshes.set(cardKey, particles);

    // Eventos de hover
    const parentCard = canvas.parentElement;
    let isHovered = false;

    parentCard.addEventListener('mouseenter', () => {
      isHovered = true;
      this.startCardAnimation(cardKey, true);
    });

    parentCard.addEventListener('mouseleave', () => {
      isHovered = false;
      this.startCardAnimation(cardKey, false);
    });

    // Iniciar animación base
    this.startCardAnimation(cardKey, false);
  }

  startCardAnimation(cardKey, isHovered) {
    const scene = this.scenes.get(cardKey);
    const camera = this.cameras.get(cardKey);
    const renderer = this.renderers.get(cardKey);
    const particles = this.meshes.get(cardKey);

    if (!scene || !camera || !renderer || !particles) return;

    // Cancelar animación anterior
    if (this.animationFrames.has(cardKey)) {
      cancelAnimationFrame(this.animationFrames.get(cardKey));
    }

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      this.animationFrames.set(cardKey, animationId);

      const elapsedTime = this.clock.getElapsedTime();

      // Animar partículas
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        if (isHovered) {
          // Efecto de explosión en hover
          positions[i] += (Math.random() - 0.5) * 0.02;
          positions[i + 1] += (Math.random() - 0.5) * 0.02;
          positions[i + 2] += (Math.random() - 0.5) * 0.02;
        } else {
          // Movimiento suave normal
          positions[i + 1] += Math.sin(elapsedTime * 2 + positions[i]) * 0.001;
        }
      }
      
      particles.geometry.attributes.position.needsUpdate = true;

      // Rotación suave
      particles.rotation.y = elapsedTime * 0.1;

      renderer.render(scene, camera);
    };

    animate();
  }

  // ================================
  // EVENTOS Y INTERACCIONES
  // ================================

  setupEventListeners() {
    // Mouse movement
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Actualizar cámaras y renderers
    this.cameras.forEach((camera, key) => {
      if (key === 'hero' || key === 'particles') {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });

    this.renderers.forEach((renderer, key) => {
      if (key === 'hero' || key === 'particles') {
        renderer.setSize(width, height);
      }
    });
  }

  createHoverEffects() {
    // Efectos 3D en hover para elementos específicos
    const hoverElements = document.querySelectorAll('[data-3d-hover]');
    
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.create3DHoverEffect(element);
      });

      element.addEventListener('mouseleave', () => {
        this.remove3DHoverEffect(element);
      });
    });
  }

  create3DHoverEffect(element) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hover-3d-effect';
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    `;

    element.appendChild(canvas);

    // Crear efecto simple de partículas
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, element.offsetWidth / element.offsetHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(element.offsetWidth, element.offsetHeight);

    // Efecto de explosión de partículas
    const particleCount = 30;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 2;

    // Animar por 1 segundo
    let startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        requestAnimationFrame(animate);

        // Actualizar posiciones
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.z += 0.02;

        // Fade out
        material.opacity = 0.8 * (1 - progress);

        renderer.render(scene, camera);
      } else {
        element.removeChild(canvas);
      }
    };

    animate();
  }

  remove3DHoverEffect(element) {
    const canvas = element.querySelector('.hover-3d-effect');
    if (canvas) {
      element.removeChild(canvas);
    }
  }

  // ================================
  // CONTROL DE RENDIMIENTO
  // ================================

  pause() {
    this.animationFrames.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
  }

  resume() {
    if (this.isInitialized) {
      this.startHeroAnimation();
      this.startParticleAnimation();
      
      // Reanudar animaciones de elementos flotantes
      this.scenes.forEach((scene, key) => {
        if (key.startsWith('floating-')) {
          this.startFloatingAnimation(key);
        }
      });
    }
  }

  destroy() {
    // Cancelar todas las animaciones
    this.animationFrames.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });

    // Limpiar geometrías y materiales
    this.scenes.forEach((scene) => {
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    });

    // Limpiar renderers
    this.renderers.forEach((renderer) => {
      renderer.dispose();
    });

    // Limpiar mapas
    this.scenes.clear();
    this.cameras.clear();
    this.renderers.clear();
    this.meshes.clear();
    this.animationFrames.clear();
  }
}

// Export para uso en app.js
if (typeof window !== 'undefined') {
  window.ThreeJSEffects = ThreeJSEffects;
} 