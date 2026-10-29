// Défilement inertiel de la page.
//
// La molette ne déplace plus la page directement : elle pousse une cible, que
// la position réelle rattrape d'un dixième à chaque frame. Le mouvement
// continue donc un instant après le geste, et un geste rapide glisse au lieu
// de sauter.
//
// Trois refus, tous délibérés :
//
// - Pas sur les zones qui défilent elles-mêmes (le corps de la popup, le
//   sommaire, les tableaux). Y détourner la molette les rendrait inertes.
// - Pas sur un écran tactile : le système y fournit déjà sa propre inertie,
//   et la doubler donne un rendu flottant.
// - Pas sous `prefers-reduced-motion`.
//
// Le clavier, les ancres et les barres de défilement ne passent pas par ici :
// ils déplacent la page nativement, et la cible se réaccorde sur la position
// réelle dès que l'animation est au repos.

// Fraction du chemin restant parcourue à chaque frame. Le reste du trajet
// décroît en (1 - EASE) par frame : à 60 images par seconde, 0,16 pose la page
// en un peu moins d'une demi-seconde, contre trois quarts de seconde à 0,10.
// Le glissement reste lisible, il cesse simplement de traîner derrière le
// geste.
const EASE = 0.16;
// En deçà, le reste du trajet ne se voit plus : on se pose sur la cible.
const SETTLE = 0.5;

function scrollableAncestor(node: EventTarget | null, delta: number) {
  let el = node instanceof Element ? node : null;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = getComputedStyle(el);
    const scrolls = /auto|scroll|overlay/.test(style.overflowY);
    if (scrolls && el.scrollHeight > el.clientHeight) {
      const room =
        delta > 0
          ? el.scrollHeight - el.clientHeight - el.scrollTop > 1
          : el.scrollTop > 1;
      if (room) return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function installSmoothScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(hover: none)').matches) return;

  let target = scrollY;
  let frame = 0;

  const limit = () =>
    Math.max(0, document.documentElement.scrollHeight - innerHeight);

  const step = () => {
    const gap = target - scrollY;
    if (Math.abs(gap) < SETTLE) {
      frame = 0;
      scrollTo(0, target);
      return;
    }
    scrollTo(0, scrollY + gap * EASE);
    frame = requestAnimationFrame(step);
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.defaultPrevented) return;
    if (scrollableAncestor(event.target, event.deltaY)) return;
    // Les navigateurs expriment la molette en lignes ou en pages selon le
    // matériel ; tout est ramené en pixels avant d'être cumulé.
    const pixels =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * innerHeight
          : event.deltaY;
    event.preventDefault();
    target = Math.min(limit(), Math.max(0, target + pixels));
    if (!frame) frame = requestAnimationFrame(step);
  };

  // Clavier, ancres, barre de défilement : la page a bougé sans nous, la cible
  // doit suivre, sinon la molette suivante la ramènerait en arrière.
  const onScroll = () => {
    if (!frame) target = scrollY;
  };

  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('scroll', onScroll, { passive: true });
}
