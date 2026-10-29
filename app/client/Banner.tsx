import { useEffect, useRef } from 'react';
import logo from './brand/logo.png';
import background from './brand/banner-bg.jpg';

// Bannière d'accueil : le fond en dégradé et, posé dessus, le verrou de marque
// — glyphe, nom, filet, et ce que cette page est.
//
// Le filet vertical sépare deux marques de même rang, comme un cartouche de
// partenariat : à gauche le produit, à droite ce qu'on en montre ici. C'est
// pour cela que « Design System World » n'est pas en gras : ce n'est pas un
// second logo.
//
// Deux mouvements se composent. La bannière est accrochée sous l'en-tête et le
// catalogue la recouvre : c'est la feuille de style qui s'en charge. Et le
// dessin lui-même glisse dans son cadre pendant qu'elle est ainsi retenue.
//
// Le cadre étant immobile, le décalage se lit sur le défilement de la page et
// non sur la position du cadre. L'image dépasse de 80 %, elle garde donc une
// marge de 40 % de la hauteur du cadre de chaque côté ; la vitesse vaut
// exactement cette fraction et le défilement pris en compte est plafonné à la
// hauteur du cadre. Le glissement maximal atteint la marge sans jamais la
// dépasser, quelle que soit la hauteur de la bannière.
const SPEED = 0.4;

export default function Banner() {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const node = image.current;
      const box = node?.parentElement?.getBoundingClientRect();
      if (!node || !box) return;
      // Au-delà d'un cadre de défilement, l'image est entièrement recouverte :
      // inutile de continuer à la déplacer.
      const travelled = Math.min(scrollY, box.height);
      // Le centrage vertical reste dans la feuille de style : on ne pousse ici
      // que le décalage, composé avec lui.
      node.style.setProperty('--shift', `${(travelled * SPEED).toFixed(1)}px`);
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
      <img
        ref={image}
        className="banner-bg"
        src={background}
        alt=""
        aria-hidden="true"
      />
      <p className="banner-lockup">
        <img src={logo} alt="" aria-hidden="true" />
        <strong>
          Inbox
          <br />
          Zapper
        </strong>
        <i aria-hidden="true" />
        <span>Design System World</span>
      </p>
    </div>
  );
}
