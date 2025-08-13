export async function loadFishData() {
  try {
    console.log('Loading fish data...')
    const response = await fetch('public/fish.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load fish data:', error);
    return [];
  }
}

export function populateFishList(data) {
  const datalist = document.getElementById('fish-list');
  datalist.innerHTML = '';
  data.forEach(fish => {
    const option = document.createElement('option');
    option.value = fish.commonName;
    datalist.appendChild(option);
  });
}
