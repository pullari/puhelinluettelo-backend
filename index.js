require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(bodyParser.json())
app.use(cors())

morgan.token('body', function (req, res) { if(req.method === 'POST') return "body " + JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('./build'))

app.get('/info', (req, res, next) => {
  Person.count({})
    .then((count) => {
      res.send(
        `
          <p>Puhelinluettelossa on ${count} henkilön tiedot<p/>
          <p>${new Date()}</p>
        `
      );
    })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => 
Person.find({})
  .then(people => {
    res.json(people)
  })
  .catch(error => next(error))
)

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error))
})

const validatePost = (req, res, next) => {
  const { name, number } = req.body;
  if(!name || !number) return res.status(400).json({ error: 'Name or number missing' })
  if(persons.find(p => p.name === name)) return res.status(403).json({ error: 'Name must be unique' })
  next()
}

app.post('/api/persons/', (req, res, next) => {
  const { name, number } = req.body;

  new Person({ name, number })
    .save()
    .then((savedPerson) => res.status(200).json(savedPerson))
    .catch(err => next(err))
})

const errorHandler = (error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {    
    return response.status(400).json({ error: error.message })  
  }
  
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})