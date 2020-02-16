import { getClient } from './axios';
/**
 * Given a season id an array of drivers will be returned.
 * Drivers must be sorted by last year constructor result.
 * If it is a constructor, the constructors will be sorted by name
 */
import { ErgastConstructor, ErgastDriver, ErgastDriverStanding } from '../model';

type LookupByConstructor = (lookup: ErgastConstructor) => number;

const sortByName = (a: ErgastConstructor, b: ErgastConstructor) => a.name.localeCompare(b.name);
const indexOfConstructor = (constructors: ErgastConstructor[]): LookupByConstructor => {
  return (lookup => {
    const index = constructors.findIndex(c => c.constructorId === lookup.constructorId);
    return index !== -1 ? index : 100;
  });
};

const sortByIndexAndName = (lookup: LookupByConstructor): (a: ErgastConstructor, b: ErgastConstructor) => number => {
  return (a, b) => {
    const aIndex = lookup(a);
    const bIndex = lookup(b);
    return aIndex - bIndex || sortByName(a, b);
  };
};

/**
 * Returns the latest know drivers for given season.
 * @param seasonId
 * @param round Drivers from a specific round
 */
export const getDrivers = async (seasonId: string, round: string): Promise<ErgastDriver[]> => {

  const http = getClient();

  const currentConstructors: ErgastConstructor[] = await http.get<any>(`/${seasonId}/constructors.json`)
    .then(result => result.data.MRData.ConstructorTable.Constructors)
    .catch(error => console.error(error));

  const previousSeasonId = parseInt(seasonId, 10) - 1;
  const previousDriverStanding: ErgastDriverStanding[] = await getDriverStandings(previousSeasonId);
  const previousConstructors: ErgastConstructor[] = await http.get<any>(`/${previousSeasonId}/constructorStandings.json`)
    .then(result => result.data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map((standing: any) => standing.Constructor))
    .catch(error => console.error(error));
  const sort = sortByIndexAndName(indexOfConstructor(previousConstructors));
  currentConstructors.sort(sort);
  const drivers: ErgastDriver[][] = await Promise.all(currentConstructors.map(c => getConstructorDrivers(c.constructorId, seasonId, previousDriverStanding, round)));
  return drivers.flat();
};

const getConstructorDrivers = async (constructorId: string, seasonId: string, previousYearDriverStanding: ErgastDriverStanding[], round: string): Promise<ErgastDriver[]> => {
  const http = getClient();
  const sort = (a: ErgastDriver, b: ErgastDriver): number => {
    const aStanding = previousYearDriverStanding.find(ds => ds.Driver.code === a.code);
    const bStanding = previousYearDriverStanding.find(ds => ds.Driver.code === b.code);
    return (bStanding?.points ?? 0) - (aStanding?.points ?? 0);
  };
  return http.get(`/${seasonId}/${round}/constructors/${constructorId}/drivers.json`)
    .then<ErgastDriver[]>(result => result.data.MRData.DriverTable.Drivers)
    .then(drivers => drivers.sort(sort));
};

const getDriverStandings = async (seasonId: number, round?: number): Promise<ErgastDriverStanding[]> => {
  const roundUrl = round === undefined ? '' : `${round}/`;
  return getClient().get(`/${seasonId}/${roundUrl}driverStandings.json`)
    .then(result => result.data)
    .then(mrData => mrData.MRData.StandingsTable.StandingsLists[0].DriverStandings)
    .then((standings: any[]) => standings.map(s => <ErgastDriverStanding>{
        wins: parseInt(s.wins, 10),
        points: parseInt(s.points, 10),
        Driver: s.Driver
      })
    );
};

const getRoundDrivers = async (seasonId: number, round: number): Promise<ErgastDriver[]> => {
  return getClient().get(`/${seasonId}/${round}/drivers.json`)
    .then(result => result.data.MRData.DriverTable.Drivers);
};
