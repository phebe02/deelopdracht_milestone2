import express from 'express';
import fetch from 'node-fetch';
import path from 'path';

const app = express();
const port = 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

const jsonURL = 'https://raw.githubusercontent.com/phebe02/webontwikkeling-project/main/porsche-project/json/porsche.json';

interface Manufacturer {
  id: number;
  name: string;
  country: string;
  founded: string;
  logoUrl: string;
}

interface PorscheModel {
  id: number;
  name: string;
  description: string;
  horsepower: number;
  isElectric: boolean;
  releaseDate: string;
  imageUrl: string;
  category: string;
  features: string[];
  manufacturer: Manufacturer;
}

function sortData(data: PorscheModel[], field: string, order: string): PorscheModel[] {
  return data.sort((a: any, b: any) => {
    const keys = field.split('.');
    const valA = keys.reduce((obj, key) => obj?.[key], a);
    const valB = keys.reduce((obj, key) => obj?.[key], b);
    if (typeof valA === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return order === 'asc' ? valA - valB : valB - valA;
    }
  });
}

app.get('/', async (req, res) => {
  const response = await fetch(jsonURL);
  const data = await response.json();
  let porsches: PorscheModel[] = data.porsches;

  const filter = req.query.filter as string || '';
  const sort = req.query.sort as string || 'name';
  const order = req.query.order as string || 'asc';

  if (filter) {
    porsches = porsches.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  }

  porsches = sortData(porsches, sort, order);
  res.render('index', { porsches, filter, sort, order });
});

app.get('/porsches/:id', async (req, res) => {
  const response = await fetch(jsonURL);
  const data = await response.json();
  const porsches: PorscheModel[] = data.porsches;
  const porsche = porsches.find(p => p.id.toString() === req.params.id);
  if (porsche) {
    res.render('detail', { porsche });
  } else {
    res.status(404).send('Niet gevonden');
  }
});

app.get('/manufacturer/:id', async (req, res) => {
  const response = await fetch(jsonURL);
  const data = await response.json();
  const porsches: PorscheModel[] = data.porsches;
  const models = porsches.filter(p => p.manufacturer.id.toString() === req.params.id);
  res.render('index', { porsches: models, filter: '', sort: 'name', order: 'asc' });
});

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
