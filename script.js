document.documentElement.classList.add('js');

// Menu no celular
const toggle = document.querySelector('.topo__toggle');
const menu = document.getElementById('menu');
function fecharMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  menu.classList.remove('is-aberto');
}
toggle.addEventListener('click', () => {
  const aberto = toggle.getAttribute('aria-expanded') === 'true';
  if (aberto) return fecharMenu();
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Fechar menu');
  menu.classList.add('is-aberto');
});
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', fecharMenu));

// Comparador de antes e depois
const comparador = document.getElementById('comparador');
const range = document.getElementById('comparador-range');
const imgAntes = document.getElementById('img-antes');
const imgDepois = document.getElementById('img-depois');
const nomes = { sorriso: 'sorriso', clareamento: 'clareamento dental', facetas: 'facetas dentárias', resina: 'facetas em resina composta' };

range.addEventListener('input', () => comparador.style.setProperty('--pos', `${range.value}%`));

document.querySelectorAll('.caso').forEach((botao) => botao.addEventListener('click', () => {
  const caso = botao.dataset.caso;
  document.querySelectorAll('.caso').forEach((b) => {
    const ativo = b === botao;
    b.classList.toggle('is-ativo', ativo);
    b.setAttribute('aria-pressed', String(ativo));
  });
  imgAntes.src = `assets/casos/${caso}-antes.jpg`;
  imgDepois.src = `assets/casos/${caso}-depois.jpg`;
  imgAntes.alt = `Antes do tratamento de ${nomes[caso]}`;
  imgDepois.alt = `Depois do tratamento de ${nomes[caso]}`;
  range.value = 50;
  comparador.style.setProperty('--pos', '50%');
  comparador.classList.remove('troca');
  void comparador.offsetWidth;
  comparador.classList.add('troca');
}));

// Aberto agora? (horário da Bahia)
function statusClinica() {
  const partes = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Bahia', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const valor = (t) => partes.find((p) => p.type === t)?.value || '';
  const dia = valor('weekday').replace('.', '').toLowerCase();
  const minutos = Number(valor('hour')) * 60 + Number(valor('minute'));
  const util = !['sáb', 'dom'].includes(dia);
  const manha = minutos >= 480 && minutos < 720;
  const tarde = minutos >= 840 && minutos < 1080;
  if (util && (manha || tarde)) return { aberto: true, texto: `Aberto agora · até ${manha ? '12h' : '18h'}` };
  if (util && minutos >= 720 && minutos < 840) return { aberto: false, texto: 'Fechado para o almoço · volta às 14h' };
  if (util && minutos < 480) return { aberto: false, texto: 'Fechado agora · abre hoje às 8h' };
  return { aberto: false, texto: 'Fechado agora · segunda a sexta, 8h às 18h' };
}
try {
  const s = statusClinica();
  document.querySelectorAll('.status').forEach((el) => {
    el.classList.add(s.aberto ? 'is-aberto' : 'is-fechado');
    el.querySelector('.status-texto').textContent = s.texto;
  });
} catch (e) { /* mantém o texto padrão */ }

// Checklist "Seu sorriso está em dia?"
const itens = [...document.querySelectorAll('.item')];
const placar = document.getElementById('placar-num');
const barra = document.getElementById('placar-barra');
const resposta = document.getElementById('resposta');
const botaoChecklist = document.getElementById('checklist-btn');
const circunferencia = 2 * Math.PI * 52;

function atualizar() {
  const feitos = itens.filter((b) => b.getAttribute('aria-pressed') === 'true');
  const vaiAoDentista = feitos.some((b) => b.dataset.chave === 'dentista');
  placar.textContent = feitos.length;
  barra.style.strokeDashoffset = circunferencia * (1 - feitos.length / itens.length);

  let texto;
  if (feitos.length === 0) texto = 'Toque nos cuidados que você já faz para ver como está o seu sorriso.';
  else if (feitos.length === itens.length) texto = 'Parabéns, seu sorriso está muito bem cuidado. Continue com as visitas a cada seis meses.';
  else if (!vaiAoDentista) texto = 'Bons hábitos em casa! Só falta a visita ao dentista a cada seis meses. Que tal marcar a sua?';
  else texto = `Faltam ${itens.length - feitos.length} cuidado(s) para completar a lista. Na consulta a gente te ajuda com o resto.`;
  resposta.textContent = texto;

  const msg = `Olá, fiz o checklist do site (${feitos.length} de ${itens.length} cuidados) e quero marcar uma avaliação.`;
  botaoChecklist.href = 'https://wa.me/5575999395488?text=' + encodeURIComponent(msg);
}
itens.forEach((b) => b.addEventListener('click', () => {
  b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  atualizar();
}));

// Entradas ao fazer scroll, em cascata dentro de cada bloco
const reveals = document.querySelectorAll('.reveal');
document.querySelectorAll('section').forEach((s) => {
  s.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`));
});
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}
