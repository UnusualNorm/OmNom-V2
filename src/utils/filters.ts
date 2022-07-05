import { MySQL2Extended } from 'mysql2-extended';
import filterMapP from '../filters';

export async function getActiveFilters(
  sql: MySQL2Extended,
  memberId: string,
  channelId: string,
  roleIds: string[],
  guildId: string
) {
  const filterMap = await filterMapP;
  const filters: {
    filter: string;
    id: string;
    idType: 'member' | 'channel' | 'role';
  }[] = await sql.select(`guild_${guildId}_filters`);

  const filterEntries = filters.filter((filter) => {
    switch (filter.idType) {
      case 'member':
        return memberId === filter.id;
      case 'channel':
        return channelId === filter.id;
      case 'role':
        return roleIds.includes(filter.id);
      default:
        return false;
    }
  });

  return filterEntries
    .map((filter) => {
      const filterId = filter.filter;
      const filterEntry = filterMap.get(filterId);
      if (!filterEntry) return;
      return filterEntry;
    })
    .filter((filter) => !!filter);
}
