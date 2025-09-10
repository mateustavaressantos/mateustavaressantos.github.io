document.addEventListener('DOMContentLoaded', function () {
    // Lógica para as abas principais
    const mainTabButtons = document.querySelectorAll('.tab-button');
    const mainTabContents = document.querySelectorAll('.tab-content');

    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' de todos os botões e conteúdos principais
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            mainTabContents.forEach(content => content.classList.remove('active'));

            // Adiciona 'active' ao botão principal clicado
            button.classList.add('active');

            // Encontra e mostra o conteúdo principal correspondente
            const tabId = button.getAttribute('data-tab');
            const activeMainContent = document.getElementById(tabId);
            if (activeMainContent) {
                activeMainContent.classList.add('active');
            }
        });
    });

    // Lógica para as abas internas (sub-abas)
    const innerTabButtons = document.querySelectorAll('.inner-tab-button');
    const innerTabContents = document.querySelectorAll('.inner-tab-content');

    innerTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Encontra o contêiner pai da sub-aba
            const parentContainer = button.closest('.tab-content');
            if (!parentContainer) return;

            // Remove a classe 'active' de todos os botões e conteúdos DENTRO DO MESMO PAI
            const siblingButtons = parentContainer.querySelectorAll('.inner-tab-button');
            const siblingContents = parentContainer.querySelectorAll('.inner-tab-content');

            siblingButtons.forEach(btn => btn.classList.remove('active'));
            siblingContents.forEach(content => content.classList.remove('active'));

            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');

            // Pega o ID da sub-aba a partir do atributo 'data-tab-content'
            const tabId = button.getAttribute('data-tab-content');

            // Adiciona a classe 'active' ao conteúdo da sub-aba correspondente
            const activeInnerContent = document.getElementById(tabId);
            if (activeInnerContent) {
                activeInnerContent.classList.add('active');
            }
        });
    });
});

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