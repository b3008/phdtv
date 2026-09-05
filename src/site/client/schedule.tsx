// Browser entry for the upcoming and archive views.
import { DefenseSchedule } from '../../components/DefenseSchedule.tsx';
import { hydrateIslands } from './hydrate.tsx';

hydrateIslands('DefenseSchedule', DefenseSchedule);
