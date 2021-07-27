if(innerWidth<=425){
    var tela ={width: innerWidth, height: innerHeight - 8}
}else{
    var tela = {width: innerWidth - 500, height: innerHeight - 8}
}
const canvas = document.querySelector("canvas");
canvas.width = tela.width;
canvas.height = tela.height;

const c = canvas.getContext('2d');

var mudarGrafico = false;
var x;
var y;
var raio;
var raio_min;
var vel_max; // Altere esse valor para ver o comportamento do bicho!
var forca_max; // Altere esse valor para ver o comportamento do bicho!
var cor = geraCor();
var raio_deteccao_min;
var raio_deteccao;
var eficiencia_energetica;
var energia;
var energia_max;
var taxa_gasto_energia;
var cansaco_max;
var taxa_aum_cansaco;
var tempo_vida_min;
var tempo_vida_max;
var fome_c = 0.8; // porcentagem da energia máxima acima da qual eles não comerão
var fome_h = 0.8; // porcentagem da energia máxima acima da qual eles não comerão


// Variáveis para o gráfico (herbívoro)
var velMedH = 0;
var forcaMedH = 0;
var raioMedH = 0;
var raioDetMedH = 0;
var energMedH = 0;
var taxaEnergMedH = 0;

// Variáveis para o gráfico (carnívoro)
var velMedC = 0;
var forcaMedC = 0;
var raioMedC = 0;
var raioDetMedC = 0;
var energMedC = 0;
var taxaEnergMedC = 0;

// Variáveis para alterações nas mutações
// var probabilidade_mutacao = labelProb; // chances de cada gene (atributo) sofrer mutação
var magnitude_mutacao = 0.1; // magnitude da mutação (o quanto vai variar)

var lado_direito_vazio = true;
var lado_esquerdo_vazio = true;

// Variável para calcular frame rate (usada no animate())
// var lastLoop = new Date();

// QuadTree
let retanguloCanvas = new Retangulo(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);

var popover_id = 1;

// Configuracoes dos organismos editados
var conf_c;
var conf_h;


// ---------------------------------------------------------------------------------------
//                                  FUNÇÕES
// ---------------------------------------------------------------------------------------


function criaObjetos(n_carnivoros, n_herbivoros, n_alimentos){
    for(var i = 0; i < n_carnivoros; i++){
        var x =(Math.random() * (canvas.width - 50) + 25);
        var y = (Math.random() * (canvas.height - 50) + 25);
        geraCarnivoro(x,y);
    }
    for(var i = 0; i < n_herbivoros; i++){
        var x =(Math.random() * (canvas.width - 50) + 25);
        var y = (Math.random() * (canvas.height - 50) + 25);
        geraHerbivoro(x,y);    
    }
    for(var i = 0; i < n_alimentos; i++){
        var x =(Math.random() * (canvas.width - 50) + 25);
        var y = (Math.random() * (canvas.height - 50) + 25);
        geraAlimento(x,y);
    }
}

function destroiObjetos(){
    Carnivoro.carnivoros.length = 0;
    Herbivoro.herbivoros.length = 0;
    Alimento.alimentos.length = 0;
    // mudaIntervaloAlimentos(1001);
}

function resetaCronometro(){
    hora = minuto = segundo = milisegundo = segundos = 0;

    //limpar o cronometro se ele existe.
    try {
        clearInterval(cronometro);
    } catch(e){}
}

// cria mais alimentos ao longo do tempo
// a função setInterval() permite que ele chame o loop a cada x milisegundos
var intervaloTaxaAlimentos;

// variáveis de auxílio para a implementação da divisão de tela
var checkbox_divisao = document.getElementById('divisao');
var telaDividida;
var limitador_de_loop = 0;

function geraAlimento(x,y){
    var raio = Math.random() + 1;
    new Alimento(x, y, raio);
}


function geraCarnivoro(x,y){ // função para poder adicionar mais carnívoros manualmente 
    raio_min = Math.random() * 3 + 4;
    vel_max = Math.random() * 1.2 + 1; 
    forca_max = Math.random()/20 + 0.001; 
    cor = geraCor();
    raio_deteccao_min = Math.random() * 50 + 10;
    eficiencia_energetica = geraNumeroPorIntervalo(0.8, 1.2);
    energia_max = Math.random() * 100 + 80
    cansaco_max = Math.random() * 50 + 20;
    taxa_aum_cansaco = Math.random() + 0.05;
    tempo_vida_min = 120; // em segundos
    tempo_vida_max = 300; // em segundos

    if(conf_c) {
        raio_min = parseFloat(conf_c.raio);
        vel_max = parseFloat(conf_c.vel_max);
        forca_max = parseFloat(conf_c.forca_max);
        cor = conf_c.cor;
        energia_max = parseFloat(conf_c.energia_max);
        tempo_vida_min = parseFloat(conf_c.tempo_vida_min);
        tempo_vida_max = parseFloat(conf_c.tempo_vida_max);
    }

    new Carnivoro(
        x, y, raio_min, vel_max, forca_max, cor, raio_deteccao_min, eficiencia_energetica, 
        energia_max, cansaco_max, taxa_aum_cansaco, tempo_vida_min, tempo_vida_max
    );
}


function geraHerbivoro(x,y){ // função para poder adicionar mais herbivoros manualmente    
    raio_min = Math.random() * 3 + 4;
    vel_max = Math.random() * 1.2 + 1; // Altere esse valor para ver o comportamento dos bichos!
    forca_max = Math.random()/20 + 0.001; // Altere esse valor para ver o comportamento do bicho!
    cor = geraCor();
    raio_deteccao_min = Math.random() * 50 + 10;
    eficiencia_energetica = geraNumeroPorIntervalo(0.8, 1.2);
    energia_max = Math.random() * 100 + 80;
    cansaco_max = Math.random() * 50 + 20;
    taxa_aum_cansaco = Math.random() + 0.05;
    tempo_vida_min = 120; // em segundos
    tempo_vida_max = 300; // em segundos

    if(conf_h) {
        raio_min = parseFloat(conf_h.raio);
        vel_max = parseFloat(conf_h.vel_max);
        forca_max = parseFloat(conf_h.forca_max);
        cor = conf_h.cor;
        energia_max = parseFloat(conf_h.energia_max);
        tempo_vida_min = parseFloat(conf_h.tempo_vida_min);
        tempo_vida_max = parseFloat(conf_h.tempo_vida_max);
    }

    new Herbivoro(
        x, y, raio_min, vel_max, forca_max, cor, raio_deteccao_min, eficiencia_energetica, 
        energia_max, cansaco_max, taxa_aum_cansaco, tempo_vida_min, tempo_vida_max
    );
}


function geraCor(){
    // variáveis para a geração de cores
    var r = Math.floor(Math.random() * 256); 
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var cor = "rgb(" + r + "," + g + "," + b + ")";

    return cor;
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        "rgb("
        + parseInt(result[1], 16) + ","
        + parseInt(result[2], 16) + ","
        + parseInt(result[3], 16)
        + ")"
    : null;
}

function rgbToHex(rgb) {
    let result = /^rgb\(([\d]{1,3}),([\d]{1,3}),([\d]{1,3})\)$/i.exec(rgb)
    if(!result) return null;

    let r = parseInt(result[1]).toString(16)
    let g = parseInt(result[2]).toString(16)
    let b = parseInt(result[3]).toString(16)
    
    return `#${r.length<2? "0"+r:r}${g.length<2? "0"+g:g}${b.length<2? "0"+b:b}`
}

function corMutacao(estilo) {
    if(Math.random() < probabilidade_mutacao){ // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
        let cores = estilo.substring(4, estilo.length - 1) // remover os caracteres de texto. ex: "rgb(256,20,40)"
            .split(',') // retornar um array com os elementos separados por virgula. ex: 256,20,40
            .map(function(cor) { //pegar cada elemento do array e fazer os cálculos a seguir
                cor = parseInt(cor);
                let operacao = "";
                let p = Math.random();

                if(cor <= 10) { //para não gerar números negativos
                    operacao = "adicao"
                } else if(cor >= 246) { //para não gerar valores maiores que 256
                    operacao = "subtracao"

                } else { //randomiza se vai ser add ou subtraido valores caso a cor estiver entre 10 e 246
                    if(Math.random() < 0.5) {
                        operacao = "adicao"
                    } else {
                        operacao = "subtracao"
                    }
                }

                if(operacao == "adicao") {
                    if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao * 10));
                    } else if(p < 0.008){ // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao * 4));
                    } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao * 2));
                    } else{
                        // return cor + Math.ceil(Math.random() * 10)
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao));
                    }
                    
                } else { //subtração
                    if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao * 10));
                    } else if(p < 0.008){ // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao * 4));
                    } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao * 2));
                    } else{
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao));
                    }
                }
            });
        
        // console.log("MUTAÇÃO DE COR");
        return `rgb(${cores[0]}, ${cores[1]}, ${cores[2]})`
    } else{
        return estilo;
    }
}

function newMutacao(valor) {// exemplo: valor = 20;  magnitude_mutacao = 0.05 || 5%
    if(Math.random() < probabilidade_mutacao){ // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
        let p = Math.random();
        let variacao = valor * magnitude_mutacao; //  variacao = 20 * 0.05 = 1, ou seja, poderá variar de +1 a -1 no resultado
        if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
            variacao *= 6;
        } else if(p < 0.008){ /// Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
            variacao *= 3.5;
        } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
            variacao *= 2;
        }
        
        let minimo = valor - variacao;  //  minimo = 20 - 1 = 19. Para que não precise sub-dividir o return em adição ou subtração
        variacao *= 2                   //  puxo o ponto de referência para o menor valor possível. Logo, o resultado variará de
                                        //  0 a +2, afinal a distância de 1 até -1 é 2.
        if(minimo <= 0) {
            minimo = valor * 0.01; // Se a mutação diminuir o valor para menos que 0, ela será simplesmente muito pequena
        }
        // console.log("MUTAÇÃO");
        return minimo + Math.random() * variacao; // 19 + Math.randon() * 2. O resultado estará entre o intervalo [19, 21]
    } else{ // Caso não ocorra mutação, retorna o valor original
        return valor;
    }
}

function geraNumeroPorIntervalo(min, max) {
    let delta = max - min; // exemplo: 4000 e 6000. 6000 - 4000 = 2000
    return (Math.random() * delta + min).toFixed(4); // Math.random() * 2000 + 4000
}

function criaAlimentosGradativo(){
    if(!pausado){ // Para de criar alimentos enquanto a simulação estiver pausada
        if(telaDividida){
            if(lado_esquerdo_vazio){ // Se não houver população no lado esquerdo, não gerará alimentos lá
                var x = geraNumeroPorIntervalo(canvas.width/2 + 31, canvas.width - 31);
                var y = Math.random() * (canvas.height - 62) + 31;
                var raio = Math.random() * 1.5 + 1;
    
                if(Alimento.alimentos.length < 2000){ // Limitador para não sobrecarregar a simulação
                    new Alimento(x, y, raio);
                }
            }
            if(lado_direito_vazio){ // Se não houver população no lado direito, não gerará alimentos lá
                var x = geraNumeroPorIntervalo(31, canvas.width/2 - 31);
                var y = Math.random() * (canvas.height - 62) + 31;
                var raio = Math.random() * 1.5 + 1;
    
                if(Alimento.alimentos.length < 2000){ // Limitador para não sobrecarregar a simulação
                    new Alimento(x, y, raio);
                }
            }
            if(!lado_direito_vazio && !lado_esquerdo_vazio){
                var x = Math.random() * (canvas.width - 62) + 31;
                var y = Math.random() * (canvas.height - 62) + 31;
                var raio = Math.random() * 1.5 + 1;

                if(Alimento.alimentos.length < 2000){ // Limitador para não sobrecarregar a simulação
                    new Alimento(x, y, raio);
                }
            }
        } else{
            var x = Math.random() * (canvas.width - 62) + 31;
            var y = Math.random() * (canvas.height - 62) + 31;
            var raio = Math.random() * 1.5 + 1;

            if(Alimento.alimentos.length < 2000){ // Limitador para não sobrecarregar a simulação
                new Alimento(x, y, raio);
            }
        }
    }
}

function mudaIntervaloAlimentos(novoTempo, criar=false) {
    if(!criar) {
        clearInterval(intervaloTaxaAlimentos);
    }
    if(novoTempo > 1000) return;
    if(antesDoPlay) return;
    intervaloTaxaAlimentos = setInterval(criaAlimentosGradativo, novoTempo)
}

function mudaProbMutacao(novoValor){
    probabilidade_mutacao = novoValor / 100;
}

function mudaMagMutacao(novoValor){
    magnitude_mutacao = novoValor / 100;
}

function desenhaDivisao(){
    c.beginPath();
    c.moveTo(canvas.width / 2, 0);
    c.lineTo(canvas.width / 2, canvas.height);
    c.strokeStyle = "white";
    c.stroke();
}

function desenhaQuadTree(qtree){
    qtree.desenha();

    // document.addEventListener('mousemove', (event) => {
    //     console.log(`Mouse X: ${event.clientX}, Mouse Y: ${event.clientY}`);
    // });

    let alcance = new Retangulo(Math.random() * canvas.width, Math.random() * canvas.height, 170, 123);
    c.rect(alcance.x - alcance.w, alcance.y - alcance.h, alcance.w*2, alcance.h*2);
    c.strokeStyle = "green";
    c.lineWidth = 3;
    c.stroke();

    let pontos = qtree.procura(alcance);
    for(let p of pontos){
        c.beginPath();
        c.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        c.strokeStyle = "red";
        c.stroke();
    }
}

function criaPontos(){
    let congregacao = new Ponto(Math.random() * canvas.width, Math.random() * canvas.height);
    
    for(var i = 0; i < 500; i++){
        let p = new Ponto(Math.random() * canvas.width, Math.random() * canvas.height);
        qtree.inserirPonto(p);
    }
    for(var i = 0; i < 300; i++){
        let p = new Ponto(congregacao.x + (Math.random() - 0.5) * 300, congregacao.y + (Math.random() - 0.5) * 300);
        qtree.inserirPonto(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Ponto(congregacao.x + (Math.random() - 0.5) * 600, congregacao.y + (Math.random() - 0.5) * 600);
        qtree.inserirPonto(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Ponto(congregacao.x + (Math.random() - 0.5) * 800, congregacao.y + (Math.random() - 0.5) * 800);
        qtree.inserirPonto(p);
    }
}

function calculaDadosGrafico(){
    // Resetando as variáveis para os herbívoros
    velMedH = 0;
    forcaMedH = 0;
    raioMedH = 0;
    raioDetMedH = 0;
    energMedH = 0;
    taxaEnergMedH = 0;

    // Resetando as variáveis para os carnívoros
    velMedC = 0;
    forcaMedC = 0;
    raioMedC = 0;
    raioDetMedC = 0;
    energMedC = 0;
    taxaEnergMedC = 0;


    Herbivoro.herbivoros.forEach(herbivoro => {
         // Soma o valor das variáveis pra todos os herbívoros
         velMedH += herbivoro.vel_max;
         forcaMedH += herbivoro.forca_max;
         raioMedH += herbivoro.raio_min * 1.5; // o raio máximo é 1.5 * o mínimo
         raioDetMedH += herbivoro.raio_deteccao_min; // não há ainda uma fórmula que relaciona o mín e o máx
         energMedH += herbivoro.energia_max;
         taxaEnergMedH += herbivoro.taxa_gasto_energia_max;
    });

    Carnivoro.carnivoros.forEach(carnivoro => {
        // Soma o valor das variáveis pra todos os carnívoros
        velMedC += carnivoro.vel_max;
        forcaMedC += carnivoro.forca_max;
        raioMedC += carnivoro.raio_min * 1.5; // o raio máximo é 1.5 * o mínimo
        raioDetMedC += carnivoro.raio_deteccao_min; // não há ainda uma fórmula que relaciona o mín e o máx
        energMedC += carnivoro.energia_max;
        taxaEnergMedC += carnivoro.taxa_gasto_energia_max;
    });


    // Divide o valor (a soma total) pelo número de herbívoros para obter a média
    velMedH /= Herbivoro.herbivoros.length;
    forcaMedH /= Herbivoro.herbivoros.length;
    raioMedH /= Herbivoro.herbivoros.length;
    raioDetMedH /= Herbivoro.herbivoros.length;
    energMedH /= Herbivoro.herbivoros.length;
    taxaEnergMedH /= Herbivoro.herbivoros.length;

    // Divide o valor (a soma total) pelo número de carnívoros para obter a média
    velMedC /= Carnivoro.carnivoros.length;
    forcaMedC /= Carnivoro.carnivoros.length;
    raioMedC /= Carnivoro.carnivoros.length;
    raioDetMedC /= Carnivoro.carnivoros.length;
    energMedC /= Carnivoro.carnivoros.length;
    taxaEnergMedC /= Carnivoro.carnivoros.length;
}

function checaPopulacoesDivididas(){
    if(telaDividida){
        lado_direito_vazio = true;
        lado_esquerdo_vazio = true;
            
        Herbivoro.herbivoros.forEach(herbivoro => {
            // Checa lado esquerdo
            if(herbivoro.posicao.x < canvas.width / 2 - 31){
                lado_esquerdo_vazio = false;
            }

            // Checa lado direito
            if(herbivoro.posicao.x > canvas.width / 2 + 31){
                lado_direito_vazio = false;
            }
        })
    }
}

var idAnimate;

function pausa(){
    pausado = true;

    btnPausa.classList.add("d-none");
    btnDespausa.classList.remove("d-none");

}

function despausa(){
    pausado = false;

    btnDespausa.classList.add("d-none");
    btnPausa.classList.remove("d-none");

    animate();
}

function acelera(){
    animate();

    // btnDesacelera.classList.remove("d-none");
}

function desacelera(){
    pausa();
    setTimeout(despausa, 10);
}

function animate(){

    if(pausado == false){
        idAnimate = requestAnimationFrame(animate);
    }
    
    
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    // // Calcula frame rate
    // var thisFrameTime = (thisLoop=new Date) - lastLoop;
    // frameTime+= (thisFrameTime - frameTime) / filterStrength;
    // lastLoop = thisLoop;

    // Criando a Quadtree
    let qtree = new QuadTree(retanguloCanvas, 10);

    // Divisão de tela
    if(checkbox_divisao.checked){
        telaDividida = true;
    } else{
        telaDividida = false;
    }

    if(telaDividida){
        desenhaDivisao();

        Alimento.alimentos.forEach((alimento, i) => {
            alimento.display();
            // remove alimentos próximos da divisão para evitar que organismos se atraiam para perto dela
            if(alimento.posicao.x - canvas.width / 2 < 30 && alimento.posicao.x - canvas.width / 2 > -30){ 
                Alimento.alimentos.splice(i, 1);
            }

            qtree.inserirAlimento(alimento); // Insere o alimento na QuadTree

        })

        if(limitador_de_loop < 10){
            limitador_de_loop++;
        }
        
        Organismo.organismos.forEach((organismo) => {
            if(organismo.posicao.x <= canvas.width/2){ // se o organismo estiver na parte esquerda
                if(limitador_de_loop == 1 && canvas.width/2 - organismo.posicao.x < 10){ // empurra os organismos pertos da borda para o lado
                    organismo.posicao.x -= 10;
                }
                organismo.criaBordas(true); // telaDividida: true
            } else{ // se o organismo estiver na parte direita
                if(limitador_de_loop == 1 && organismo.posicao.x - canvas.width/2 < 10){ // empurra os organismos pertos da borda para o lado
                    organismo.posicao.x += 10;
                }
                organismo.criaBordas(true); // telaDividida: true
            }
        })

        // Inserindo os organismos na QuadTree antes de chamar os métodos de cada um
        Herbivoro.herbivoros.forEach(herbivoro => {
            qtree.inserirHerbivoro(herbivoro); // Insere o herbivoro na QuadTree
        });
        Carnivoro.carnivoros.forEach(carnivoro => {
            qtree.inserirCarnivoro(carnivoro); // Insere o carnivoro na QuadTree
        });

        // lado_direito_vazio = true;
        // lado_esquerdo_vazio = true;
        Herbivoro.herbivoros.forEach(herbivoro => {
            herbivoro.update();
            herbivoro.vagueia();

            // Transforma o raio de detecção em um objeto círculo para podermos manipulá-lo
            let visaoH = new Circulo(herbivoro.posicao.x, herbivoro.posicao.y, herbivoro.raio_deteccao);
                        
            if(herbivoro.energia <= herbivoro.energia_max * fome_h){ // FOME
                herbivoro.buscarAlimento(qtree, visaoH);
            }
            herbivoro.detectaPredador(qtree, visaoH);
        })

        Carnivoro.carnivoros.forEach(carnivoro => {
            carnivoro.update();
            carnivoro.vagueia();

            // Transforma o raio de detecção em um objeto círculo para podermos manipulá-lo
            let visaoC = new Circulo(carnivoro.posicao.x, carnivoro.posicao.y, carnivoro.raio_deteccao);

            if(carnivoro.energia <= carnivoro.energia_max * fome_c){ // FOME
                carnivoro.buscarHerbivoro(qtree, visaoC);
            }

            // carnivoro.buscarHerbivoro(qtree, visaoC, false);
        })
    } else{ // se a tela NÃO estiver dividida
        limitador_de_loop = 0;

        Alimento.alimentos.forEach(alimento => {
            alimento.display();
            qtree.inserirAlimento(alimento); // Insere o alimento na QuadTree

        })

        Organismo.organismos.forEach((organismo) => {
            organismo.criaBordas(false); // telaDividida: false
        })

        // Inserindo os organismos na QuadTree antes de chamar os métodos de cada um
        Herbivoro.herbivoros.forEach(herbivoro => {
            qtree.inserirHerbivoro(herbivoro); // Insere o herbivoro na QuadTree
        });
        Carnivoro.carnivoros.forEach(carnivoro => {
            qtree.inserirCarnivoro(carnivoro); // Insere o carnivoro na QuadTree
        });
        
        
        Herbivoro.herbivoros.forEach(herbivoro => {
            herbivoro.update();
            herbivoro.vagueia();
            
            // Transforma o raio de detecção em um objeto círculo para podermos manipulá-lo
            let visaoH = new Circulo(herbivoro.posicao.x, herbivoro.posicao.y, herbivoro.raio_deteccao);

            if(herbivoro.energia <= herbivoro.energia_max * fome_h){ // FOME
                herbivoro.buscarAlimento(qtree, visaoH);
            }
            
            herbivoro.detectaPredador(qtree, visaoH);
        })

        Carnivoro.carnivoros.forEach(carnivoro => {
            carnivoro.update();
            carnivoro.vagueia();

            // Transforma o raio de detecção em um objeto círculo para podermos manipulá-lo
            let visaoC = new Circulo(carnivoro.posicao.x, carnivoro.posicao.y, carnivoro.raio_deteccao);

            if(carnivoro.energia <= carnivoro.energia_max * fome_c){ // FOME
                carnivoro.buscarHerbivoro(qtree, visaoC);
            }

            // carnivoro.buscarHerbivoro(qtree, visaoC);
        })
    }
}
// ----------------------------------------------------------------------------------------------
//                                   Paineis dinamicos e Popovers
// ----------------------------------------------------------------------------------------------
// Função atrelada ao evento click para encontrar o organismo na lista e retornar suas propriedades
function getOrganismo(x, y) {
    let organismo = Organismo.organismos.find(o => Math.abs(o.posicao.x - x) <= 5 && Math.abs(o.posicao.y - y) <= 5)
    
    if(organismo == undefined) {
        return; //console.log("não encontrou")
    }

    let popover = `
        <div id="popover-${popover_id}" class="popover-info" style="top:${parseInt(organismo.posicao.y - 20)}px; left:${parseInt(organismo.posicao.x + 15)}px">
            <div class="popover-title">
                ${(organismo instanceof Carnivoro) ? "Carnivoro":"Herbivoro"}
            </div>
            <div class="popover-content">
                Raio: ${organismo.raio.toFixed(2)}<br/>
                Velocidade máxima: ${organismo.vel_max.toFixed(2)}<br/>
                Raio de detecção: ${organismo.raio_deteccao.toFixed(2)}<br/>
                Energia: ${organismo.energia.toFixed(2)}/${organismo.energia_max.toFixed(2)}<br/>
                Gasto energético: ${organismo.taxa_gasto_energia_max.toFixed(2)}<br/>
                Cor: <svg width="20" height="20">
                <rect width="18" height="18" style="fill:${organismo.cor}"/>
                </svg> ${organismo.cor}
            </div>
            <button type="button" class="btn close" aria-label="Close"
                onclick="deletePopover(${popover_id}, ${organismo.id})">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `
    $("body").append($(popover));

    let pop_id = popover_id
    // CRIAR MONITORADOR PARA A VARIÁVEL POSICAO
    organismo.proxy = new Proxy(organismo["posicao"], {
        set: function(target, key, value) {
            target[key] = value;
            //console.log("vetor mudou: "+key+" = "+value)

            let cssProperty = key == "x" ? 
                {left: parseInt(value + 15)} : {top: parseInt(value - 20)}
            // Popover acompanhar a posicao do organismo
            $(`#popover-${pop_id}`).css(cssProperty);
            return true;
        }
    })

    // SALVAR O ID DO POPOVER NO ORGANISMO
    organismo.popover_id = pop_id

    popover_id++
}

function deletePopover(popoverId, organismoId) {
    // Capturar organismo
    const organismo = Organismo.organismos.find(o => o.id == organismoId) || 0;
    if(organismo) {
        delete organismo.proxy
        delete organismo.popover_id
    }
    $(`#popover-${popoverId}`).remove()
}

// GERAR PAINEL DE ESCOLHA DAS PROPRIEDADES DOS ORGANISMOS ADICIONADOS NA TELA
function showEditPanel(type) {
    // Restaurar configuracoes salvas
    let config;
    if(type == 1) {
        config = conf_c;
    } else {
        config = conf_h;
    }

    let panel = `
    
        <div class="row mb-3">
            <div id="edit-title" class="col-8">${type == 1? "Carnívoro":"Herbívoro"}</div>
            <!-- Se o aleatorio estiver ligado, desabilitar todos os inputs -->
            <button id="edit-random" class="btn col-2 btn-gray" onclick="randomConfig(${type})"><i class="fas fa-dice"></i></button>
            <button class="btn close col-2" onclick="$(this).closest('.edit-organism').addClass('d-none').html('')">
                <span class="text-white" aria-hidden="true">&times;</span>
            </button>
        </div>
    

        <form id="formConfig" class="container-fluid">
            <div class="row mb-3">
                <div class="col-6 p-0">
                    <!-- desenho do organismo com atualizacao em tempo real -->
                    <label for="input-cor">Cor</label>
                    <input id="input-cor" name="cor" type="color" value="${config? rgbToHex(config.cor):"#ff0000"}">
                </div>
            </div>
            <div class="row p-0">
                <div class="col p-0">
                    <label for="input-raio">Raio</label>
                    <input id="input-raio" name="raio" type="number" value="${config? config.raio:(raio||6.12)}" class="form-control p-0">
                </div>  
                <div class="col offset-1 p-0">                 
                    <label for="input-velocidade">Vel max</label>
                    <input id="input-velocidade" name="vel_max" type="number" value="${config? config.vel_max:vel_max}" class="form-control p-0">
                </div>
                <div class="col offset-1 p-0">
                    <label for="input-forca">Forca max</label>
                    <input id="input-forca" name="forca_max" type="number" value="${config? config.forca_max:forca_max}" class="form-control p-0">
                </div>
            </div>
            <div class="row p-0">
                <div class="col p-0">
                    <label for="input-energia">Energia max</label>
                    <input id="input-energia" name="energia_max" type="number" value="${config? config.energia_max:energia_max}" class="form-control p-0">
                </div>  
                <div class="col offset-1 p-0">  
                    <label for="input-vida-min">Vida min</label>
                    <input id="input-vida-min" name="tempo_vida_min" type="number" min="1" value="${config? config.tempo_vida_min:tempo_vida_min}" class="form-control p-0">
                </div>
                <div class="col offset-1 p-0">    
                    <label for="input-vida-max">Vida max</label>
                    <input id="input-vida-max" name="tempo_vida_max" type="number" min="1" value="${config? config.tempo_vida_max:tempo_vida_max}" class="form-control p-0">
                </div>
            </div>
        </form>
        <div class="row mt-2">
            <button type="button" onclick="serializarFormConfig(${type})" class="btn btn-sm btn-outline-secondary btn-block">Salvar</button>
        </div>
    
    
    `
    $("#painelEditar").html(panel).removeClass("d-none")
    // Iniciar como aleatorio se não existe configuracao previa salva
    if(!config) {
        randomConfig(type);
    }
}

function serializarFormConfig(type) {
    let obj = $("#formConfig").serializeArray().reduce(function(obj, value, i) {
        obj[value.name] = value.value;
        return obj;
    }, {});
    // Converter cor
    obj.cor = hexToRgb(obj["cor"])
    
    if(type == 1) {
        conf_c = obj;
    } else {
        conf_h = obj;
    }
}

function randomConfig(type) {
    if($("#edit-random").hasClass("active")) {
        $("#edit-random").removeClass("active");

        // Retirar disable dos inputs
        $("#formConfig input").prop("disabled", false)
    } else {
        // apagar configuracao
        if(type==1 && conf_c) {
            // TODO: aviso para confirmar se quer aleatorizar mesmo.
            let resultado = confirm("Ao aleatorizar os valores, você perderá as configurações salvas para os Carnívoros. Deseja continuar?")
            if(resultado == true)
                conf_c = undefined;
            else
                return;
        } else if(type==2 && conf_h) {
            // TODO: aviso para confirmar se quer aleatorizar mesmo.
            let resultado = confirm("Ao aleatorizar os valores, você perderá as configurações salvas para os Herbívoros. Deseja continuar?")
            if(resultado == true)
                conf_h = undefined;
            else
                return;
        }
        $("#edit-random").addClass("active");
        // dar disable nos inputs de configuracao
        $("#formConfig input").prop("disabled", true)
    }
}

// ----------------------------------------------------------------------------------------------
//                                         Cronômetro
// ----------------------------------------------------------------------------------------------
function criaCronometro(){
    var cronometro = setInterval(() => { timer(); }, 10);
}

function timer() {
    if(!pausado){ // Só atualiza se a simulação não estiver pausada
        if ((milisegundo += 10) == 1000) {
        milisegundo = 0;
        segundo++;
        segundos++;
        }
        if (segundo == 60) {
        segundo = 0;
        minuto++;
        }
        if (minuto == 60) {
        minuto = 0;
        hora++;
        }
        document.getElementById('hora').innerText = returnData(hora);
        document.getElementById('minuto').innerText = returnData(minuto);
        document.getElementById('segundo').innerText = returnData(segundo);
        document.getElementById('milisegundo').innerText = returnData(milisegundo);
    }
}
  
function returnData(input) {
    return input > 10 ? input : `0${input}`
}

// ----------------------------------------------------------------------------------------------
//                                         Frame rate
// ----------------------------------------------------------------------------------------------

// // The higher this value, the less the fps will reflect temporary variations
// // A value of 1 will only keep the last value
// var filterStrength = 20;
// var frameTime = 0, lastLoop = new Date, thisLoop;

// function gameLoop(){
//   // ...
//   var thisFrameTime = (thisLoop=new Date) - lastLoop;
//   frameTime+= (thisFrameTime - frameTime) / filterStrength;
//   lastLoop = thisLoop;
// }

// // Report the fps only every second, to only lightly affect measurements
// var fpsOut = document.getElementById('framerate');
// setInterval(function(){
//   fpsOut.innerHTML = parseFloat((1000/frameTime).toFixed(1)) + " fps";
// },500);

// // function calculaFrameRate(){
// //     var fps;
// //     var thisLoop = new Date();
// //     fps = 1000/(thisLoop - lastLoop);
// //     lastLoop = thisLoop;

// //     return fps;
// //     document.getElementById("framerate").innerHTML = fps;
// // }

// setInterval(() => {
//     var thisLoop = new Date();
//     var fps = 1000/(thisLoop - lastLoop);
//     lastLoop = thisLoop;

//     document.getElementById("framerate").innerHTML = fps;
// }, 1000);





/////////////////////////////////////////////////
// Função para verificar igualdade entre objetos


// var isEqual = function (value, other) {

// 	// Get the value type
// 	var type = Object.prototype.toString.call(value);

// 	// If the two objects are not the same type, return false
// 	if (type !== Object.prototype.toString.call(other)) return false;

// 	// If items are not an object or array, return false
// 	if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

// 	// Compare the length of the length of the two items
// 	var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
// 	var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
// 	if (valueLen !== otherLen) return false;

// 	// Compare two items
// 	var compare = function (item1, item2) {

// 		// Get the object type
// 		var itemType = Object.prototype.toString.call(item1);

// 		// If an object or array, compare recursively
// 		if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
// 			if (!isEqual(item1, item2)) return false;
// 		}

// 		// Otherwise, do a simple comparison
// 		else {

// 			// If the two items are not the same type, return false
// 			if (itemType !== Object.prototype.toString.call(item2)) return false;

// 			// Else if it's a function, convert to a string and compare
// 			// Otherwise, just compare
// 			if (itemType === '[object Function]') {
// 				if (item1.toString() !== item2.toString()) return false;
// 			} else {
// 				if (item1 !== item2) return false;
// 			}

// 		}
// 	};

// 	// Compare properties
// 	if (type === '[object Array]') {
// 		for (var i = 0; i < valueLen; i++) {
// 			if (compare(value[i], other[i]) === false) return false;
// 		}
// 	} else {
// 		for (var key in value) {
// 			if (value.hasOwnProperty(key)) {
// 				if (compare(value[key], other[key]) === false) return false;
// 			}
// 		}
// 	}

// 	// If nothing failed, return true
// 	return true;

// };