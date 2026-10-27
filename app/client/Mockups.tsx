import choice from './screens/choice.png';
import home from './screens/home.png';
import sender from './screens/sender.png';
import welcome from './screens/welcome.png';

// Rendus exportés de Figma, posés dans un cadre de téléphone.
//
// Ce sont des images : contrairement aux composants du catalogue, elles ne
// réagissent pas aux tokens. Changer de design system ne les changera pas.
// C'est le compromis assumé pour montrer les écrans tels qu'ils sont dessinés,
// plutôt qu'une reconstruction approximative.

export interface Mockup {
  id: string;
  label: string;
  src: string;
  width: number;
  height: number;
  /** Une planche de plusieurs écrans n'entre pas dans un cadre de téléphone. */
  board?: boolean;
}

export const mockups: Record<string, Mockup> = {
  home: {
    id: 'home',
    label: 'Mailing lists',
    src: home,
    width: 393,
    height: 844,
  },
  sender: {
    id: 'sender',
    label: 'Fiche expéditeur',
    src: sender,
    width: 393,
    height: 844,
  },
  welcome: {
    id: 'welcome',
    label: 'Accueil',
    src: welcome,
    width: 393,
    height: 852,
  },
  choice: {
    id: 'choice',
    label: 'Anciens e-mails · 2 états',
    src: choice,
    width: 1008,
    height: 1075,
    board: true,
  },
};

export default function MockupFrame({ mockup }: { mockup: Mockup }) {
  if (mockup.board)
    return (
      <img
        className="mockup-board"
        src={mockup.src}
        width={mockup.width}
        height={mockup.height}
        alt={`Maquette Figma : ${mockup.label}`}
      />
    );
  return (
    <div className="mockup-phone" style={{ width: mockup.width }}>
      <img
        src={mockup.src}
        width={mockup.width}
        height={mockup.height}
        alt={`Maquette Figma : ${mockup.label}`}
      />
    </div>
  );
}
