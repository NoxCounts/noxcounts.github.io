
let canalAtualId = "UC-lHJZR3Gqxm24_Vd_AJ5Yw";
let intervaloId = null;
let inscritosAtuais = 0;
let viewsAtuais = 0;

const API_BASE = "https://api.superplaycounts.pp.ua";

// Trava para evitar sobreposição de animações simultâneas
let jogandoRoletaInscritos = false;
let jogandoRoletaViews = false;

// Inicializa a estrutura de janelas fixas apenas uma vez
function criarEstruturaRoleta(elementoId, strValor) {
    const elemento = document.getElementById(elementoId);
    elemento.innerHTML = '';

    for (let i = 0; i < strValor.length; i++) {
        const caractere = strValor[i];

        if (caractere === '.' || caractere === ',') {
            const ponto = document.createElement('span');
            ponto.innerText = caractere;
            elemento.appendChild(ponto);
        } else {
            const janela = document.createElement('div');
            janela.className = 'digito-janela';

            const faixa = document.createElement('div');
            faixa.className = 'digito-faixa';
            faixa.id = `${elementoId}-faixa-${i}`;

            for (let n = 0; n <= 9; n++) {
                const num = document.createElement('span');
                num.innerText = n;
                faixa.appendChild(num);
            }

            janela.appendChild(faixa);
            elemento.appendChild(janela);
        }
    }
}

// Roleta Grande para os Inscritos (65px de altura)
function animarInscritos(valorFinal) {
    if (jogandoRoletaInscritos) return;
    jogandoRoletaInscritos = true;

    const strValor = Number(valorFinal).toLocaleString('pt-BR');
    const elemento = document.getElementById("inscritos");

    const totalDigitosAtuais =
        elemento.querySelectorAll('.digito-janela').length;
    const totalDigitosNovos =
        strValor.replace(/[\D]/g, '').length;

    if (totalDigitosAtuais !== totalDigitosNovos) {
        criarEstruturaRoleta("inscritos", strValor);
    }

    setTimeout(() => {
        for (let i = 0; i < strValor.length; i++) {
            const caractere = strValor[i];

            if (caractere !== '.' && caractere !== ',') {
                const faixa =
                    document.getElementById(`inscritos-faixa-${i}`);

                if (faixa) {
                    const digito = parseInt(caractere, 10);
                    faixa.style.transform =
                        `translateY(-${digito * 65}px)`;
                }
            }
        }

        setTimeout(() => {
            jogandoRoletaInscritos = false;
        }, 600);
    }, 50);
}

// Roleta Menor para as Views (24px de altura)
function animarViews(valorFinal) {
    if (jogandoRoletaViews) return;
    jogandoRoletaViews = true;

    const strValor = Number(valorFinal).toLocaleString('pt-BR');
    const elemento = document.getElementById("views");

    const totalDigitosAtuais =
        elemento.querySelectorAll('.digito-janela').length;
    const totalDigitosNovos =
        strValor.replace(/[\D]/g, '').length;

    if (totalDigitosAtuais !== totalDigitosNovos) {
        criarEstruturaRoleta("views", strValor);
    }

    setTimeout(() => {
        for (let i = 0; i < strValor.length; i++) {
            const caractere = strValor[i];

            if (caractere !== '.' && caractere !== ',') {
                const faixa =
                    document.getElementById(`views-faixa-${i}`);

                if (faixa) {
                    const digito = parseInt(caractere, 10);
                    faixa.style.transform =
                        `translateY(-${digito * 24}px)`;
                }
            }
        }

        setTimeout(() => {
            jogandoRoletaViews = false;
        }, 600);
    }, 50);
}

function calcularMeta(inscritos, valorGoalMixerno) {
    let metaAlvo = 0;

    if (valorGoalMixerno && Number(valorGoalMixerno) > inscritos) {
        metaAlvo = Number(valorGoalMixerno);
    } else {
        if (inscritos < 1000) {
            metaAlvo = Math.ceil((inscritos + 1) / 50) * 50;
        } else if (inscritos < 100000) {
            metaAlvo = Math.ceil((inscritos + 1) / 1000) * 1000;
        } else if (inscritos < 1000000) {
            metaAlvo = Math.ceil((inscritos + 1) / 10000) * 10000;
        } else {
            metaAlvo = Math.ceil((inscritos + 1) / 100000) * 100000;
        }
    }

    const faltando = metaAlvo - inscritos;

    const baseAnterior = metaAlvo - (
        inscritos < 1000 ? 50 :
        inscritos < 100000 ? 1000 :
        inscritos < 1000000 ? 10000 : 100000
    );

    const totalDoSegmento = metaAlvo - baseAnterior;
    const progressoFeito = inscritos - baseAnterior;

    const porcentagem = Math.max(
        0,
        Math.min((progressoFeito / totalDoSegmento) * 100, 100)
    );

    document.getElementById("meta-texto").innerText =
        `Faltam ${faltando.toLocaleString('pt-BR')} para ${metaAlvo.toLocaleString('pt-BR')}`;

    document.getElementById("meta-barra").style.width =
        `${porcentagem}%`;
}

// =====================================================
// NOVA API: SUPERPLAYCOUNTS
// Os dados agora ficam dentro de statistics[0].
// =====================================================

async function obterDadosMixerno() {
    if (!canalAtualId) return;

    const urlApi =
        `${API_BASE}/api/youtube-channel-counter/user/${encodeURIComponent(canalAtualId)}`;

    try {
        const resposta = await fetch(urlApi);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        // Nova estrutura da SuperPlayCounts
        const estatisticas = dados.statistics?.[0];

        if (!estatisticas) {
            throw new Error("Estrutura de estatísticas não encontrada");
        }

        const usuario = estatisticas.user || [];
        const counts = estatisticas.counts || [];

        // Busca os mesmos campos utilizados no contador original
        const objetoNome =
            usuario.find(item => item.value === "name");

        const objetoPfp =
            usuario.find(item => item.value === "pfp");

        const objetoSubs =
            counts.find(item => item.value === "subscribers");

        const objetoViews =
            counts.find(item => item.value === "views");

        const objetoApiSubs =
            counts.find(item => item.value === "apisubscribers");

        const objetoApiViews =
            counts.find(item => item.value === "apiviews");

        const objetoGoal =
            counts.find(item => item.value === "goal");

        // Nome do canal
        if (objetoNome) {
            document.getElementById("nome-canal").innerText =
                objetoNome.count;
        }

        // Foto do canal
        if (objetoPfp) {
            const imgElement =
                document.getElementById("canal-pfp");

            imgElement.src = objetoPfp.count;
            imgElement.style.display = "inline-block";
        }

        // Inscritos e meta
        if (objetoSubs && objetoSubs.count != null) {
            const novoValorSubs = Number(objetoSubs.count);

            animarInscritos(novoValorSubs);
            inscritosAtuais = novoValorSubs;

            const valorGoalRaw =
                objetoGoal ? objetoGoal.count : 0;

            calcularMeta(novoValorSubs, valorGoalRaw);
        }

        // Visualizações
        if (objetoViews && objetoViews.count != null) {
            const novoValorViews = Number(objetoViews.count);

            animarViews(novoValorViews);
            viewsAtuais = novoValorViews;
        }

        // Inscritos informados pela API
        if (objetoApiSubs && objetoApiSubs.count != null) {
            document.getElementById("api-subs").innerText =
                Number(objetoApiSubs.count).toLocaleString('pt-BR');
        }

        // Visualizações informadas pela API
        if (objetoApiViews && objetoApiViews.count != null) {
            document.getElementById("api-views").innerText =
                Number(objetoApiViews.count).toLocaleString('pt-BR');
        }

    } catch (erro) {
        console.error(
            "Erro ao acessar a API da SuperPlayCounts:",
            erro
        );

        document.getElementById("nome-canal").innerText =
            "Erro / Canal não encontrado";
    }
}

async function mudarCanal() {
    const termo =
        document.getElementById("input-id").value.trim();

    if (termo === "") return;

    document.getElementById("nome-canal").innerText = "Buscando...";
    document.getElementById("canal-pfp").style.display = "none";
    document.getElementById("meta-texto").innerText = "Calculando meta...";
    document.getElementById("meta-barra").style.width = "0%";

    document.getElementById("inscritos").innerHTML = "0";
    document.getElementById("views").innerHTML = "0";

    inscritosAtuais = 0;
    viewsAtuais = 0;

    jogandoRoletaInscritos = false;
    jogandoRoletaViews = false;

    let idResolvido = termo;

    // Se não for um ID direto do YouTube, pesquisa o canal
    if (!(termo.startsWith('UC') && termo.length === 24)) {
        try {
            const urlBusca =
                `${API_BASE}/api/youtube-channel-counter/search/${encodeURIComponent(termo)}`;

            const resp = await fetch(urlBusca);

            if (!resp.ok) {
                throw new Error(`Erro HTTP ${resp.status}`);
            }

            const dadosBusca = await resp.json();

            if (dadosBusca && dadosBusca.list &&
                dadosBusca.list.length > 0) {

                idResolvido = dadosBusca.list[0][2];

            } else {
                document.getElementById("nome-canal").innerText =
                    "Canal não encontrado";
                return;
            }

        } catch (err) {
            console.error("Erro na busca por nome:", err);

            document.getElementById("nome-canal").innerText =
                "Erro na busca";

            return;
        }
    }

    canalAtualId = idResolvido;

    if (intervaloId) {
        clearInterval(intervaloId);
    }

    obterDadosMixerno();
    intervaloId = setInterval(obterDadosMixerno, 2000);
}

// Permite buscar pressionando Enter no campo
document.getElementById("input-id").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        mudarCanal();
    }
});

// Execução inicial
obterDadosMixerno();
intervaloId = setInterval(obterDadosMixerno, 2000);
