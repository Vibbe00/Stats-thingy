const VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
const BASE = (v) => `https://ddragon.leagueoflegends.com/cdn/${v}`;

export async function getLatestVersion() {
  const res = await fetch(VERSION_URL);
  const versions = await res.json();
  return versions[0];
}

export async function getAllChampions() {
  const version = await getLatestVersion();
  const res = await fetch(`${BASE(version)}/data/en_US/champion.json`);
  const json = await res.json();
  return { version, champions: Object.values(json.data) };
}

export async function getChampionDetail(id) {
  const version = await getLatestVersion();
  const res = await fetch(`${BASE(version)}/data/en_US/champion/${id}.json`);
  const json = await res.json();
  return { version, champion: json.data[id] };
}

export const splashUrl   = (id)       => `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`;
export const portraitUrl = (v, id)    => `${BASE(v)}/img/champion/${id}.png`;
export const spellUrl    = (v, spell) => `${BASE(v)}/img/spell/${spell}`;
export const passiveUrl  = (v, img)   => `${BASE(v)}/img/passive/${img}`;