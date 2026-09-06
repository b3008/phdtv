// Browser entry for the home page calendar.
import { DefenseCalendar } from '../../components/DefenseCalendar.tsx';
import { hydrateIslands } from './hydrate.tsx';

hydrateIslands('DefenseCalendar', DefenseCalendar);
