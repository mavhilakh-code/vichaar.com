import axios from 'axios';
async function test() {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=state+legislative+assembly+elections+India+upcoming&format=json';
  const res = await axios.get(url, { headers: { 'User-Agent': 'VichaarApp/1.0' } });
  console.log(JSON.stringify(res.data, null, 2));
}
test();
