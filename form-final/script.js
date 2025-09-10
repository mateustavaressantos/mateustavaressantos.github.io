const btn = document.getElementById("fullscreen-btn");

btn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    btn.textContent = "❌ Sair da Tela Cheia";
    } else {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        btn.textContent = "🖥️ Tela Cheia";
        }
    }
});

const modal = document.getElementById("modal");
const btnAbrir = document.getElementById("iniciar-form");
const btnFechar = document.getElementById("fechar-modal");
const btnEnviar = document.getElementById("botao-enviar");
const btnVoltarMenu = document.getElementById("voltar-menu");
const btnVoltar = document.getElementById("voltar-form");
const form = document.querySelector("form");

if (btnAbrir) {
    btnAbrir.onclick = function() {
        modal.style.display = "flex";
    }
}

if (btnFechar) {
    btnFechar.onclick = function() {
        modal.style.display = "none";
    }
}

if (modal) {
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

if (btnVoltarMenu) {
    btnVoltarMenu.onclick = function(event) {
        event.preventDefault();
        window.location.href = "/index.html";
    }
}

if (btnVoltar) {
    btnVoltar.onclick = function(event) {
        event.preventDefault();
        window.location.href = "/index.html";
    }
}

function sanitizeInput(input) {
    return input.replace(/<[^>]*>?/gm, "")
                .replace(/javascript:/gi, "")
                .replace(/<script.*?>.*?<\/script>/gi, "")
                .trim();
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const perfil   = sanitizeInput(document.getElementById("perfil").value);
  const nota     = parseInt(document.getElementById("nota").value);
  const melhorar = sanitizeInput(document.getElementById("melhorar").value);

  // coleta os checkboxes marcados
  const ouviuMarcados = Array.from(document.querySelectorAll('input[name="ouviu"]:checked'))
                             .map(cb => cb.value);

  // validações básicas
  if (isNaN(nota) || nota < 0 || nota > 10) {
    alert("A nota deve ser entre 0 e 10.");
    return;
  }
  if (melhorar.length > 500) {
    alert("Sua resposta é muito longa (máx. 500 caracteres).");
    return;
  }

  btnEnviar.classList.add("loading");
  btnEnviar.textContent = "Enviando...";

  const formData = new FormData();
  formData.append("perfil", perfil);
  formData.append("nota", nota);
  formData.append("melhorar", melhorar);
  // envia cada item com o MESMO nome 'ouviu' (e.parameters["ouviu"] vira array)
  ouviuMarcados.forEach(v => formData.append("ouviu", v));

  fetch("https://script.google.com/macros/s/AKfycbwCX83lBPVPTO2YicVnKSkhwUAkbj64aTPoVIR5XYIr-xKDqylx_N92CTS36CbvHX40BA/exec", {
      method: "POST",
      body: formData
  })
  .then(r => r.text())
  .then(txt => {
    console.log("Servidor respondeu:", txt);
    if (txt.includes("OK")) {
      window.location.href = "enviado.html";
    } else {
      alert("Erro ao salvar os dados!");
      btnEnviar.classList.remove("loading");
      btnEnviar.textContent = "Enviar";
    }
  })
  .catch(err => {
    console.error("Erro:", err);
    alert("Erro ao enviar. Verifique a conexão.");
    btnEnviar.classList.remove("loading");
    btnEnviar.textContent = "Enviar";
  });
});