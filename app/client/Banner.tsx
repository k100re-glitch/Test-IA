import { useEffect, useRef } from 'react';
import banner from './brand/banner.jpg';

// Bannière en parallaxe : elle défile plus lentement que la page, qui passe
// par-dessus. Une bannière simplement collée en haut se fige et se fait
// grignoter par le contenu, ce qui la fait lire comme une barre posée dessus.
//
// L'image est centrée sur son cadre et plus haute que lui, pour pouvoir
// glisser sans découvrir de vide. Le déplacement passe par une transformation,
// lue dans une frame d'animation : rien n'est recalculé pendant l'événement
// de défilement.

// L'image dépasse son cadre de 30 % : elle garde donc une marge de 15 % de
// la hauteur du cadre de chaque côté. La vitesse vaut exactement cette
// fraction, et le défilement pris en compte est plafonné à la hauteur du
// cadre : le glissement maximal atteint la marge sans jamais la dépasser,
// quelle que soit la hauteur de la bannière. Un débord plus large donnerait
// un mouvement plus marqué, mais rognerait d'autant le dessin.
const SPEED = 0.15;

export default function Banner() {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const node = image.current;
      if (!node) return;
      const box = node.parentElement?.getBoundingClientRect();
      if (!box) return;
      // Au-delà du cadre, inutile de continuer à déplacer l'image.
      const travelled = Math.max(-box.height, Math.min(0, box.top));
      const offset = travelled * -SPEED;
      // Le centrage vertical reste dans la feuille de style : on ne pousse
      // ici que le décalage, composé avec lui.
      node.style.setProperty('--shift', `${offset.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="banner">
      <img ref={image} src={banner} alt="" aria-hidden="true" />
    </div>
  );
}
