import { map as race } from './race.mapper';
import { map as season } from './season.mapper';
import { map as nationality } from './nationality.mapper';
import { driver, drivers } from './driver.mapper';
import { driverStanding, driverStandings } from './driver-standing.mapper';
import { driverResult, driverResults } from './driver-result.mapper';

export const mapper = {
  race,
  driver,
  drivers,
  driverStanding,
  driverStandings,
  driverResult,
  driverResults,
  season,
  nationality,
};
