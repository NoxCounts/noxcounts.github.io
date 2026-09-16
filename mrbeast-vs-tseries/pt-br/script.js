const canais = {
    mrbeast: "UCX6OQ3DkcsbYNE6H8uQQuVA",
    tseries: "UCq-Fj5jknLsUf-MWSy4_brA"
};

const API = "https://mixerno.space/api/youtube-channel-counter/user/";

const estado = {
    mrbeast: { inscritos: 0, views: 0, animando: false },
    tseries: { inscritos: 0, views: 0, animando: false }
};

function el(id) {
    return document.getElementById(id);
}

function numero(valor) {
    const n = Number(valor);
    return Number.isFinite(n) ? n.toLocaleString("pt-BR") : "0";
}

function dado(dados, grupo, nome) {
    if (!dados || !Array.isArray(dados[grupo])) return null;
    return dados[grupo].find(item => item && item.value === nome) || null;
}

function criarRoleta(id, valor) {
    const alvo = el(id);
    if (!alvo) return;

    alvo.innerHTML = "";

    const texto = numero(valor);

    for (let i = 0; i < texto.length; i++) {
        const c = texto[i];

        if (c === "." || c === ",") {
            const separador = document.createElement("span");
            separador.textContent = c;
            alvo.appendChild(separador);
            continue;
        }

        const janela = document.createElement("div");
        janela.className = "digito-janela";

        const faixa = document.createElement("div");
        faixa.className = "digito-faixa";
        faixa.id = id + "-faixa-" + i;

        for (let n = 0; n <= 9; n++) {
            const digito = document.createElement("span");
            digito.textContent = n;
            faixa.appendChild(digito);
        }

        janela.appendChild(faixa);
        alvo.appendChild(janela);
    }
}

function animar(id, valor, canal) {
    const alvo = el(id);
    if (!alvo || estado[canal].animando) return;

    estado[canal].animando = true;

    const texto = numero(valor);
    const atuais = alvo.querySelectorAll(".digito-janela").length;
    const novos = texto.replace(/\D/g, "").length;

    if (atuais !== novos) {
        criarRoleta(id, valor);
    }

    setTimeout(() => {
        for (let i = 0; i < texto.length; i++) {
            const c = texto[i];

            if (c === "." || c === ",") continue;

            const faixa = document.getElementById(id + "-faixa-" + i);

            if (faixa) {
                faixa.style.transform =
                    "translateY(-" + parseInt(c, 10) + "em)";
            }
        }

        setTimeout(() => {
            estado[canal].animando = false;
        }, 600);
    }, 50);
}

function colocarTexto(id, texto) {
    const alvo = el(id);
    if (alvo) alvo.textContent = texto;
}

function colocarImagem(id, url) {
    const imagem = el(id);
    if (!imagem || !url) return;

    imagem.src = url;
    imagem.style.display = "block";
}

async function buscarCanal(canal) {
    try {
        const resposta = await fetch(API + canais[canal], {
            cache: "no-store"
        });

        if (!resposta.ok) {
            throw new Error("HTTP " + resposta.status);
        }

        const dados = await resposta.json();

        const nome = dado(dados, "user", "name");
        const foto = dado(dados, "user", "pfp");
        const inscritos = dado(dados, "counts", "subscribers");
        const views = dado(dados, "counts", "views");
        const apiSubs = dado(dados, "counts", "apisubscribers");

        if (nome) {
            colocarTexto(canal + "-name", nome.count);
        }

        if (foto) {
            colocarImagem(canal + "-pfp", foto.count);
        }

        if (inscritos) {
            const valor = Number(inscritos.count);

            if (Number.isFinite(valor)) {
                estado[canal].inscritos = valor;
                animar(canal + "-subs", valor, canal);
            }
        }

        if (views) {
            const valor = Number(views.count);

            if (Number.isFinite(valor)) {
                estado[canal].views = valor;
                colocarTexto(canal + "-views", numero(valor));
            }
        }

        if (apiSubs) {
            colocarTexto(
                canal + "-api-subs",
                numero(apiSubs.count)
            );
        }

    } catch (erro) {
        console.error("Erro ao buscar " + canal + ":", erro);
        colocarTexto(canal + "-name", "Erro na API");
    }
}

function atualizarBatalha() {
    const mrbeast = estado.mrbeast.inscritos;
    const tseries = estado.tseries.inscritos;

    if (mrbeast <= 0 || tseries <= 0) {
        colocarTexto("difference", "Calculando...");
        colocarTexto("leader-label", "Calculando...");
        colocarTexto("winner-status", "Calculando...");
        colocarTexto("ratio-text", "—");

        if (el("mrbeast-bar")) el("mrbeast-bar").style.width = "0%";
        if (el("tseries-bar")) el("tseries-bar").style.width = "0%";

        return;
    }

    const diferenca = Math.abs(mrbeast - tseries);

    colocarTexto(
        "difference",
        numero(diferenca) + " inscritos"
    );

    let lider = "Empate";

    if (mrbeast > tseries) {
        lider = "MrBeast";
    } else if (tseries > mrbeast) {
        lider = "T-Series";
    }

    colocarTexto(
        "leader-label",
        lider === "Empate"
            ? "Empate"
            : lider + " está na frente"
    );

    colocarTexto(
        "winner-status",
        lider === "Empate"
            ? "Empate"
            : lider + " lidera"
    );

    const total = mrbeast + tseries;

    const pMrBeast = (mrbeast / total) * 100;
    const pTSeries = (tseries / total) * 100;

    colocarTexto(
        "ratio-text",
        pMrBeast.toFixed(2) +
        "% × " +
        pTSeries.toFixed(2) +
        "%"
    );

    if (el("mrbeast-bar")) {
        el("mrbeast-bar").style.width = pMrBeast + "%";
    }

    if (el("tseries-bar")) {
        el("tseries-bar").style.width = pTSeries + "%";
    }

    colocarTexto(
        "mrbeast-percent",
        pMrBeast.toFixed(2) + "%"
    );

    colocarTexto(
        "tseries-percent",
        pTSeries.toFixed(2) + "%"
    );

    colocarTexto(
        "last-update",
        "Última atualização: " +
        new Date().toLocaleTimeString("pt-BR")
    );
}

async function atualizarTudo() {
    await Promise.all([
        buscarCanal("mrbeast"),
        buscarCanal("tseries")
    ]);

    atualizarBatalha();
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarTudo();
    setInterval(atualizarTudo, 2000);
});
