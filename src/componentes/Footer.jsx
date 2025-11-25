import React from "react";
import "../css/HeaderFooter.css";

export default function Footer() {
  return (
    <footer>
      <div className="ajuda">
        <h4>• Ajuda</h4>
        <p>Dúvidas</p>
        <p>Encontre seu Tamanho</p>
        <p>Entregas em geral</p>
        <p>Trocas e Devoluções</p>
        <p>Fale Conosco</p>
      </div>

      <div className="redes">
        <h4>Redes Sociais</h4>
        <div className="icones">
          <img
            src="https://imagepng.org/wp-content/uploads/2017/09/facebook-icone-icon-1.png"
            alt="Facebook"
          />
          <img
            src="https://zoobe.pk/assets/img/social/instagram.png"
            alt="Instagram"
          />
          <img
            src="https://indify.co/custom-emojis/youtube.png"
            alt="YouTube"
          />
        </div>
      </div>
    </footer>
  );
}
