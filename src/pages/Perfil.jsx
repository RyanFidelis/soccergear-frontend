import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({});

  const [fotoPreview, setFotoPreview] = useState("");

  const [mostrarCamera, setMostrarCamera] = useState(false);

  const [stream, setStream] = useState(null);

  const fileInputRef = useRef(null);

  const videoRef = useRef(null);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://soccergear-backend.onrender.com";

  useEffect(() => {
    const userData =
      localStorage.getItem("usuarioLogado");

    if (userData) {
      const usuarioData = JSON.parse(userData);

      setUsuario(usuarioData);

      setFormData({
        name: usuarioData.name || "",
        email: usuarioData.email || "",
        telefone:
          usuarioData.telefone || "",
        dataNascimento:
          usuarioData.dataNascimento || "",
        time: usuarioData.time || "",
      });

      setFotoPreview(
        usuarioData.foto || ""
      );
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (
      mostrarCamera &&
      stream &&
      videoRef.current
    ) {
      videoRef.current.srcObject = stream;
    }
  }, [mostrarCamera, stream]);

  const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("data:image"))
      return path;

    if (path.startsWith("http"))
      return path;

    return path;
  };

  const iniciarCamera = async () => {
    try {
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
          }
        );

      setStream(mediaStream);

      setMostrarCamera(true);
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao acessar câmera."
      );
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      setStream(null);
    }

    setMostrarCamera(false);
  };

  const tirarFoto = () => {
    if (videoRef.current) {
      const canvas =
        document.createElement("canvas");

      canvas.width =
        videoRef.current.videoWidth;

      canvas.height =
        videoRef.current.videoHeight;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        videoRef.current,
        0,
        0
      );

      const fotoDataUrl =
        canvas.toDataURL("image/jpeg");

      setFotoPreview(fotoDataUrl);

      pararCamera();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setFotoPreview(
          e.target.result
        );
      };

      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const salvarEdicao = async () => {
    if (!usuario || !usuario.id)
      return;

    try {
      const dadosParaEnviar = {
        ...formData,
        foto: fotoPreview,
      };

      const response = await fetch(
        `${API_URL}/api/auth/update/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            dadosParaEnviar
          ),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setUsuario(data.user);

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(data.user)
        );

        window.dispatchEvent(
          new Event("user-updated")
        );

        setEditando(false);

        alert(
          "Perfil atualizado com sucesso!"
        );
      } else {
        alert(
          `Erro: ${data.message}`
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao salvar perfil."
      );
    }
  };

  const cancelarEdicao = () => {
    setFormData({
      name: usuario.name || "",
      email: usuario.email || "",
      telefone:
        usuario.telefone || "",
      dataNascimento:
        usuario.dataNascimento || "",
      time: usuario.time || "",
    });

    setFotoPreview(
      usuario.foto || ""
    );

    setEditando(false);

    pararCamera();
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "usuarioLogado"
    );

    window.dispatchEvent(
      new Event("user-updated")
    );

    navigate("/login");
  };

  const formatarDataBR = (
    dataISO
  ) => {
    if (!dataISO) return "-";

    const [ano, mes, dia] =
      dataISO.split("-");

    return `${dia}/${mes}/${ano}`;
  };

  if (!usuario) return null;

  return (
    <main className="container-perfil">
      <h1 className="titulo-principal-perfil">
        Meu Perfil
      </h1>

      <div className="card-perfil">
        <div className="topo-perfil">
          <div className="avatar-container">
            <div className="avatar-perfil">
              {fotoPreview ? (
                <img
                  src={getImageUrl(
                    fotoPreview
                  )}
                  alt="Perfil"
                  style={{
                    objectFit:
                      "cover",
                  }}
                />
              ) : (
                <span>
                  {usuario.name
                    ? usuario.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </span>
              )}
            </div>

            {editando && (
              <div className="avatar-acoes">
                <button
                  className="btn-avatar"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  Upload
                </button>

                <button
                  className="btn-avatar"
                  onClick={
                    mostrarCamera
                      ? pararCamera
                      : iniciarCamera
                  }
                >
                  {mostrarCamera
                    ? "Cancelar"
                    : "Câmera"}
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={
                    handleFileSelect
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </div>
            )}
          </div>

          {mostrarCamera && (
            <div className="camera-modal">
              <div className="camera-container">
                <button
                  className="btn-fechar-camera"
                  onClick={
                    pararCamera
                  }
                >
                  ✕
                </button>

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />

                <button
                  className="btn-tirar-foto"
                  onClick={
                    tirarFoto
                  }
                >
                  📸
                </button>
              </div>
            </div>
          )}

          <div className="info-usuario">
            <h2 className="nome-perfil">
              {usuario.name}
            </h2>

            <p className="email-perfil">
              {usuario.email}
            </p>
          </div>
        </div>

        <hr className="linha-perfil" />

        <div className="info-perfil">
          {editando ? (
            <div className="form-edicao">
              <input
                type="text"
                name="name"
                placeholder="Nome"
                value={
                  formData.name || ""
                }
                onChange={
                  handleInputChange
                }
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={
                  formData.email ||
                  ""
                }
                onChange={
                  handleInputChange
                }
              />

              <input
                type="tel"
                name="telefone"
                placeholder="Telefone"
                value={
                  formData.telefone ||
                  ""
                }
                onChange={
                  handleInputChange
                }
              />

              <input
                type="date"
                name="dataNascimento"
                value={
                  formData.dataNascimento ||
                  ""
                }
                onChange={
                  handleInputChange
                }
              />

              <select
                name="time"
                value={
                  formData.time || ""
                }
                onChange={
                  handleInputChange
                }
              >
                <option value="">
                  Selecione
                </option>

                <option value="Corinthians">
                  Corinthians
                </option>

                <option value="Palmeiras">
                  Palmeiras
                </option>

                <option value="São Paulo">
                  São Paulo
                </option>

                <option value="Santos">
                  Santos
                </option>

                <option value="Flamengo">
                  Flamengo
                </option>
              </select>
            </div>
          ) : (
            <>
              <div className="info-item">
                <span className="info-label">
                  Nome:
                </span>

                <span className="info-value">
                  {usuario.name ||
                    "-"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">
                  Email:
                </span>

                <span className="info-value">
                  {usuario.email ||
                    "-"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">
                  Telefone:
                </span>

                <span className="info-value">
                  {usuario.telefone ||
                    "-"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">
                  Nascimento:
                </span>

                <span className="info-value">
                  {formatarDataBR(
                    usuario.dataNascimento
                  )}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">
                  Time:
                </span>

                <span className="info-value">
                  {usuario.time ||
                    "-"}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="acoes-perfil">
          {editando ? (
            <>
              <button
                className="btn-salvar"
                onClick={
                  salvarEdicao
                }
              >
                Salvar
              </button>

              <button
                className="btn-cancelar"
                onClick={
                  cancelarEdicao
                }
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-editar"
                onClick={() =>
                  setEditando(true)
                }
              >
                Editar Perfil
              </button>

              <button
                className="btn-pedidos"
                onClick={() =>
                  navigate(
                    "/minhas-compras"
                  )
                }
              >
                Meus Pedidos
              </button>

              <button
                className="btn-sair"
                onClick={
                  handleLogout
                }
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
