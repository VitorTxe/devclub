(function() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_1');
  if (!canvas) {
    console.warn('Canvas do shader não encontrado.');
    return;
  }

  // Ajusta o buffer de desenho WebGL para corresponder ao tamanho de layout CSS.
  function syncSize() {
    const w = canvas.clientWidth  || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  // Inicialização robusta do contexto WebGL com tratamento de erro
  let gl;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {
    console.error('Erro ao obter contexto WebGL para o shader:', e);
  }

  if (!gl) {
    console.warn('WebGL não suportado pelo navegador. Utilizando fallback visual via CSS.');
    canvas.style.display = 'none';
    const parent = canvas.parentElement;
    if (parent) {
      parent.classList.add('bg-gradient-to-b', 'from-[#08090B]', 'to-[#0E1013]');
    }
    return;
  }

  // Shaders Sources
  const vs = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fs = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
        vec2 uv = v_texCoord;
        
        // Ruído sutil em movimento para atmosfera tech
        float noise = sin(uv.x * 10.0 + u_time * 0.5) * cos(uv.y * 10.0 + u_time * 0.5) * 0.02;
        
        vec3 color1 = vec3(0.031, 0.035, 0.043); // #08090B
        vec3 color2 = vec3(0.055, 0.063, 0.075); // Um pouco mais claro
        
        vec3 finalColor = mix(color1, color2, uv.y + noise);
        
        // Efeito de brilho verde sutil que segue o mouse ou move lentamente
        vec2 glowPos = u_mouse / u_resolution;
        
        // Se o mouse não tiver sido movido ainda, cria uma animação lenta automática
        if (length(u_mouse) == 0.0) {
            glowPos = vec2(0.5 + 0.3 * sin(u_time * 0.2), 0.5 + 0.3 * cos(u_time * 0.3));
        }

        float dist = length(uv - glowPos);
        float glow = smoothstep(0.8, 0.0, dist) * 0.04;
        finalColor += vec3(0.13, 0.90, 0.42) * glow; 

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

  if (!vertexShader || !fragmentShader) {
    console.error('Falha ao compilar shaders. Descontinuando WebGL.');
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Erro ao linkar programa WebGL:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Buffer de geometria
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ]), gl.STATIC_DRAW);

  const posLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLocation);
  gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

  // Locators de Uniforms
  const uTimeLocation = gl.getUniformLocation(program, 'u_time');
  const uResLocation = gl.getUniformLocation(program, 'u_resolution');
  const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');

  let mouse = { x: 0, y: 0 };
  let hasMoved = false;

  window.addEventListener('mousemove', (event) => {
    hasMoved = true;
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(time) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    if (uTimeLocation) {
      gl.uniform1f(uTimeLocation, time * 0.001);
    }
    if (uResLocation) {
      gl.uniform2f(uResLocation, canvas.width, canvas.height);
    }
    if (uMouseLocation) {
      // Passa a posição real do mouse ou zero para ativar animação automática
      if (hasMoved) {
        gl.uniform2f(uMouseLocation, mouse.x, mouse.y);
      } else {
        gl.uniform2f(uMouseLocation, 0.0, 0.0);
      }
    }
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
