let canalAtualId = "UC-lHJZR3Gqxm24_Vd_AJ5Yw";
let intervaloId = null;
let inscritosAtuais = 0;
let viewsAtuais = 0;

// Lock to prevent overlapping animations
let jogandoRoletaInscritos = false;
let jogandoRoletaViews = false;

// Initializes the fixed digit structure only once
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

// Large roller for subscribers (65px height)
function animarInscritos(valorFinal) {
    if (jogandoRoletaInscritos) return;
    jogandoRoletaInscritos = true;

    const strValor = Number(valorFinal).toLocaleString('en-US');
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

// Smaller roller for views (24px height)
function animarViews(valorFinal) {
    if (jogandoRoletaViews) return;
    jogandoRoletaViews = true;

    const strValor = Number(valorFinal).toLocaleString('en-US');
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

    const baseAnterior =
        metaAlvo -
        (
            inscritos < 1000
                ? 50
                : (
                    inscritos < 100000
                        ? 1000
                        : (
                            inscritos < 1000000
                                ? 10000
                                : 100000
                        )
                )
        );

    const totalDoSegmento = metaAlvo - baseAnterior;
    const progressoFeito = inscritos - baseAnterior;

    const porcentagem =
        Math.max(
            0,
            Math.min(
                (progressoFeito / totalDoSegmento) * 100,
                100
            )
        );

    document.getElementById("meta-texto").innerText =
        `${faltando.toLocaleString('en-US')} remaining to reach ${metaAlvo.toLocaleString('en-US')}`;

    document.getElementById("meta-barra").style.width =
        `${porcentagem}%`;
}

async function obterDadosMixerno() {
    const urlApi =
        "https://mixerno.space/api/youtube-channel-counter/user/" +
        canalAtualId;

    try {
        const resposta = await fetch(urlApi);
        const dados = await resposta.json();

        const objetoNome =
            dados.user.find(item => item.value === "name");

        const objetoPfp =
            dados.user.find(item => item.value === "pfp");

        const objetoSubs =
            dados.counts.find(item => item.value === "subscribers");

        const objetoViews =
            dados.counts.find(item => item.value === "views");

        const objetoApiSubs =
            dados.counts.find(item => item.value === "apisubscribers");

        const objetoApiViews =
            dados.counts.find(item => item.value === "apiviews");

        const objetoGoal =
            dados.counts.find(item => item.value === "goal");

        if (objetoNome) {
            document.getElementById("nome-canal").innerText =
                objetoNome.count;
        }

        if (objetoPfp) {
            const imgElement =
                document.getElementById("canal-pfp");

            imgElement.src = objetoPfp.count;
            imgElement.style.display = "inline-block";
        }

        if (objetoSubs) {
            const novoValorSubs =
                Number(objetoSubs.count);

            animarInscritos(novoValorSubs);

            inscritosAtuais = novoValorSubs;

            const valorGoalRaw =
                objetoGoal ? objetoGoal.count : 0;

            calcularMeta(
                novoValorSubs,
                valorGoalRaw
            );
        }

        if (objetoViews) {
            const novoValorViews =
                Number(objetoViews.count);

            animarViews(novoValorViews);

            viewsAtuais = novoValorViews;
        }

        if (objetoApiSubs) {
            document.getElementById("api-subs").innerText =
                Number(objetoApiSubs.count)
                    .toLocaleString('en-US');
        }

        if (objetoApiViews) {
            document.getElementById("api-views").innerText =
                Number(objetoApiViews.count)
                    .toLocaleString('en-US');
        }

    } catch (erro) {
        console.error(
            "Error accessing the Mixerno API:",
            erro
        );

        document.getElementById("nome-canal").innerText =
            "Error / Channel not found";
    }
}

function mudarCanal() {
    const novoId =
        document.getElementById("input-id").value.trim();

    if (novoId !== "") {
        canalAtualId = novoId;

        document.getElementById("nome-canal").innerText =
            "Searching...";

        document.getElementById("canal-pfp").style.display =
            "none";

        document.getElementById("meta-texto").innerText =
            "Calculating goal...";

        document.getElementById("meta-barra").style.width =
            "0%";

        document.getElementById("inscritos").innerHTML =
            "0";

        document.getElementById("views").innerHTML =
            "0";

        inscritosAtuais = 0;
        viewsAtuais = 0;

        jogandoRoletaInscritos = false;
        jogandoRoletaViews = false;

        clearInterval(intervaloId);

        obterDadosMixerno();

        intervaloId =
            setInterval(obterDadosMixerno, 2000);
    }
}

obterDadosMixerno();

intervaloId =
    setInterval(obterDadosMixerno, 2000);
