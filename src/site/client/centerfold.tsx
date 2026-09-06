// Browser entry for a centerfold page. The stylesheet import makes Vite emit it as this island's own CSS chunk,
// listed under the entry in the manifest, so only centerfold pages load it.
import '../../styles/centerfold.css';
import { CenterfoldPage } from '../../components/CenterfoldPage.tsx';
import { hydrateIslands } from './hydrate.tsx';

hydrateIslands('CenterfoldPage', CenterfoldPage);
