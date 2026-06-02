import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./provador.css";

/* ===========================================================
   COMPONENTE MANEQUIM - Centralizado e sem troca de pele
   =========================================================== */
function Manequim({ glb }) {
  const { scene } = useGLTF(glb);
  return <primitive object={scene} position={[0, -0.2, 0]} scale={1.1} />;
}

/* ===========================================================
   CONTROLES DE CÂMERA COM ZOOM PRECISO
   =========================================================== */
function CameraControls({ cameraPosition, setZoomPercent }) {
  const controls = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!controls.current) return;
    controls.current.target.set(0, 1, 0);
    camera.position.set(...cameraPosition);
    controls.current.update();
  }, [cameraPosition, camera]);

  // Atualiza a porcentagem do zoom corretamente
  useEffect(() => {
    const updateZoom = () => {
      const distance = Math.sqrt(
        camera.position.x ** 2 +
          (camera.position.y - 1) ** 2 +
          camera.position.z ** 2
      );
      const minDist = 0.8;
      const maxDist = 4.0;
      const zoom = Math.round(((maxDist - distance) / (maxDist - minDist)) * 100);
      setZoomPercent(Math.max(0, Math.min(100, zoom)));
    };
    const id = setInterval(updateZoom, 100);
    return () => clearInterval(id);
  }, [camera, setZoomPercent]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={0.8}
      maxDistance={4.0}
      target={[0, 1, 0]}
    />
  );
}

/* ===========================================================
   COMPONENTE PRINCIPAL
   =========================================================== */
export default function Provador() {
  const [camisaSelecionada, setCamisaSelecionada] = useState(null);
  const [parteInferior, setParteInferior] = useState(null);
  const [cameraPosition, setCameraPosition] = useState([0, 1.6, 2.5]);
  const [zoomPercent, setZoomPercent] = useState(50);

  const camisas = [
    { id: 1, nome: "Camisa 1", thumb: "/models/roupas/camisa1.webp" },
    { id: 2, nome: "Camisa 2", thumb: "/models/roupas/camisa2.webp" },
    { id: 3, nome: "Camisa 3", thumb: "/models/roupas/camisa3.png" },
  ];

  const partesInferiores = [
    { id: "calca", nome: "Calça", thumb: "/models/roupas/calca.webp" },
    { id: "shorts", nome: "Shorts", thumb: "/models/roupas/shorts.png" },
  ];

  const getModeloGLB = () => {
    if (camisaSelecionada && parteInferior) {
      const tipo = parteInferior.id === "calca" ? "calca" : "shorts";
      return `/models/manequim/manequim_camisa_${tipo}${camisaSelecionada.id}.glb`;
    }
    if (camisaSelecionada && !parteInferior)
      return `/models/manequim/manequim_camisa${camisaSelecionada.id}.glb`;
    if (!camisaSelecionada && parteInferior)
      return `/models/manequim/manequim_${parteInferior.id}.glb`;
    return "/models/manequim/manequim.glb";
  };

  const modeloFinal = getModeloGLB();

  /* ===========================================================
     FUNÇÕES DE ZOOM PRECISAS (incrementos suaves)
     =========================================================== */
  const ajustarZoom = (fator) => {
    setCameraPosition(([x, y, z]) => {
      const dir = { x: -x, y: 1 - y, z: -z };
      const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
      const norm = { x: dir.x / len, y: dir.y / len, z: dir.z / len };
      const distAtual = Math.sqrt(x ** 2 + (y - 1) ** 2 + z ** 2);
      const novaDist = Math.min(4.0, Math.max(0.8, distAtual * fator));
      return [-norm.x * novaDist, 1 - norm.y * novaDist, -norm.z * novaDist];
    });
  };

  return (
    <div className="provador-root">
      <div className="provador-container">
        <section className="provador-canvas">
          <Canvas camera={{ position: cameraPosition, fov: 45 }} shadows>
            <Suspense fallback={null}>
              <Luzes />
              <Manequim glb={modeloFinal} />
              <CameraControls
                cameraPosition={cameraPosition}
                setZoomPercent={setZoomPercent}
              />
            </Suspense>
          </Canvas>

          <div className="camera-hud">
            <h3>Câmera</h3>
            <div className="camera-controls">
              <button onClick={() => setCameraPosition([0, 1.6, 2.5])}>Centro</button>
              <button onClick={() => setCameraPosition([2.5, 1.6, 0])}>Direita</button>
              <button onClick={() => setCameraPosition([-2.5, 1.6, 0])}>Esquerda</button>
              <button onClick={() => setCameraPosition([0, 1.6, -2.5])}>Atrás</button>
            </div>
          </div>

          <div className="zoom-sidebar">
            <button onClick={() => ajustarZoom(0.95)}>+</button>
            <span className="zoom-value">{zoomPercent}%</span>
            <button onClick={() => ajustarZoom(1.05)}>-</button>
            <span className="zoom-label">Zoom</span>
          </div>
        </section>

        <aside className="provador-sidebar">
          <h2>Provador</h2>
          <p>Escolha a roupa</p>

          <div className="section">
            <label className="label">Camisas</label>
            <div className="camisas-grid">
              {camisas.map((c) => (
                <button
                  key={c.id}
                  className={`camisa-item ${
                    camisaSelecionada?.id === c.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    setCamisaSelecionada(
                      camisaSelecionada?.id === c.id ? null : c
                    )
                  }
                >
                  <img src={c.thumb} alt={c.nome} />
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <label className="label">Parte Inferior</label>
            <div className="camisas-grid">
              {partesInferiores.map((p) => (
                <button
                  key={p.id}
                  className={`camisa-item ${
                    parteInferior?.id === p.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    setParteInferior(parteInferior?.id === p.id ? null : p)
                  }
                >
                  <img src={p.thumb} alt={p.nome} />
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-remover"
            onClick={() => {
              setCamisaSelecionada(null);
              setParteInferior(null);
            }}
          >
            Remover roupa
          </button>
        </aside>
      </div>
    </div>
  );
}

/* ===========================================================
   LUZES
   =========================================================== */
function Luzes() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} castShadow intensity={1.2} />
      <pointLight position={[-5, 5, -5]} intensity={0.3} />
    </>
  );
}
