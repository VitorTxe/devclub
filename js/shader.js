(function () {
  const canvas = document.getElementById("shader-canvas-ANIMATION_1");
  if (!canvas) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = reduceMotionQuery.matches;
  let gl;

  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false }) || canvas.getContext("experimental-webgl");
  } catch (error) {
    console.error("Erro ao obter contexto WebGL para o hero:", error);
  }

  if (!gl) {
    canvas.style.display = "none";
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;

    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 point) {
      return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      local = local * local * (3.0 - 2.0 * local);

      return mix(
        mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x),
        mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x),
        local.y
      );
    }

    void main() {
      vec2 uv = v_texCoord;
      float aspect = u_resolution.x / max(u_resolution.y, 1.0);
      vec2 point = uv - 0.5;
      point.x *= aspect;

      float time = u_time;
      float softNoise = noise(uv * 5.5 + vec2(time * 0.055, -time * 0.04));
      float fineNoise = noise(uv * 13.0 - vec2(time * 0.08, time * 0.045));

      vec3 deep = vec3(0.018, 0.024, 0.022);
      vec3 surface = vec3(0.035, 0.057, 0.047);
      vec3 color = mix(deep, surface, uv.y * 0.72 + softNoise * 0.18);

      float waveA = 0.12 * sin(point.x * 2.8 + time * 0.62 + softNoise * 1.6);
      float waveB = -0.18 + 0.09 * sin(point.x * 4.1 - time * 0.48 + fineNoise * 1.2);
      float auroraA = exp(-abs(point.y - waveA) * 6.2);
      float auroraB = exp(-abs(point.y - waveB) * 8.0);

      color += vec3(0.055, 0.82, 0.30) * auroraA * (0.10 + softNoise * 0.08);
      color += vec3(0.12, 0.55, 0.32) * auroraB * (0.07 + fineNoise * 0.06);

      vec2 glowPosition = u_mouse / max(u_resolution, vec2(1.0));
      if (length(u_mouse) < 0.001) {
        glowPosition = vec2(
          0.5 + 0.28 * sin(time * 0.19),
          0.5 + 0.22 * cos(time * 0.23)
        );
      }

      vec2 glowDistance = (uv - glowPosition) * vec2(aspect, 1.0);
      float glow = 1.0 - smoothstep(0.0, 0.68, length(glowDistance));
      float pulse = 0.86 + 0.14 * sin(time * 0.9);
      color += vec3(0.12, 0.96, 0.38) * glow * 0.20 * pulse;

      vec2 gridCell = fract(uv * vec2(30.0, 18.0));
      vec2 gridDistance = min(gridCell, 1.0 - gridCell);
      float grid = 1.0 - smoothstep(0.0, 0.035, min(gridDistance.x, gridDistance.y));
      float gridMask = 1.0 - smoothstep(0.16, 0.8, length(point));
      color += vec3(0.18, 0.8, 0.36) * grid * gridMask * 0.027;

      color += (fineNoise - 0.5) * 0.012;
      float vignette = 1.0 - smoothstep(0.45, 1.05, length(point));
      color *= 0.74 + vignette * 0.26;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Erro ao compilar shader do hero:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    canvas.style.display = "none";
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Erro ao linkar shader do hero:", gl.getProgramInfoLog(program));
    canvas.style.display = "none";
    return;
  }

  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const timeLocation = gl.getUniformLocation(program, "u_time");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const mouseLocation = gl.getUniformLocation(program, "u_mouse");

  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  let hasMoved = false;
  let isInView = true;
  let frameId = null;

  function syncSize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round((canvas.clientWidth || 1280) * ratio));
    const height = Math.max(1, Math.round((canvas.clientHeight || 720) * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function shouldAnimate() {
    return isInView && !document.hidden && !reduceMotion;
  }

  function requestRender() {
    if (frameId === null) frameId = requestAnimationFrame(render);
  }

  function stopRender() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  }

  function updatePlayback() {
    if (shouldAnimate()) requestRender();
    else if (reduceMotion && isInView && !document.hidden) requestRender();
    else stopRender();
  }

  function render(timestamp) {
    frameId = null;
    syncSize();

    mouse.x += (targetMouse.x - mouse.x) * 0.065;
    mouse.y += (targetMouse.y - mouse.y) * 0.065;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, reduceMotion ? 0 : timestamp * 0.001);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(mouseLocation, hasMoved ? mouse.x : 0, hasMoved ? mouse.y : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (shouldAnimate()) requestRender();
  }

  canvas.closest("#inicio")?.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const ratioX = canvas.width / rect.width;
    const ratioY = canvas.height / rect.height;
    targetMouse.x = (event.clientX - rect.left) * ratioX;
    targetMouse.y = (rect.bottom - event.clientY) * ratioY;
    hasMoved = true;
  }, { passive: true });

  const resizeObserver = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => {
        syncSize();
        requestRender();
      })
    : null;

  resizeObserver?.observe(canvas);

  const visibilityObserver = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;
        updatePlayback();
      }, { rootMargin: "120px" })
    : null;

  visibilityObserver?.observe(canvas);
  document.addEventListener("visibilitychange", updatePlayback);

  const handleMotionChange = (event) => {
    reduceMotion = event.matches;
    if (reduceMotion) hasMoved = false;
    updatePlayback();
  };

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", handleMotionChange);
  }

  syncSize();
  requestRender();
})();