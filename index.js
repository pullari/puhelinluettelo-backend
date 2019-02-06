const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
let { persons } = require('./db.json')

const app = express()

app.use(bodyParser.json())
app.use(cors())

morgan.token('body', function (req, res) { if(req.method === 'POST') return "body " + JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/info', (req, res) => {
  res.send(
    `
      <p>Puhelinluettelossa on ${persons.length} henkilön tiedot<p/>
      <p>${new Date()}</p>
    `
  );
})

app.get('/api/persons', (req, res) => {
  res.send(persons);
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)

  person ?
    res.json(person) : 
    res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);

  res.status(204).end();
})

const validatePost = (req, res, next) => {
  const { name, number } = req.body;
  if(!name || !number) return res.status(400).json({ error: 'Name or number missing' })
  if(persons.find(p => p.name === name)) return res.status(403).json({ error: 'Name must be unique' })
  next()
}

app.post('/api/persons/', validatePost, (req, res) => {
  const { name, number } = req.body;
  const newId = Math.floor((Math.random() * 10000) + 1);

  const newPerson = {
    name,
    number,
    newId
  }
  persons = [...persons, newPerson]
  res.status(200).json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})