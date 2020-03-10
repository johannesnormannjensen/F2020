import { map as race, basisMap as basisRace } from './race.mapper';
import { map as season } from './season.mapper';
import { map as nationality } from './nationality.mapper';
import { driver, drivers } from './driver.mapper';
import { driverStanding, driverStandings } from './driver-standing.mapper';
import { driverResult, driverResults } from './driver-result.mapper';
import {driverQualifying, driverQualifyings} from './driver-qualifying.mapper';

export const mapper = {
  basisRace,
  race,
  driver,
  drivers,
  driverStanding,
  driverStandings,
  driverResult,
  driverResults,
  driverQualifying,
  driverQualifyings,
  season,
  nationality,
};
