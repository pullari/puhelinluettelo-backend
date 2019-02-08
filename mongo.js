const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb://testikayttaja:${password}@ds237848.mlab.com:37848/puhelinluettelo`

mongoose.connect(url, { useNewUrlParser: true })

function validateArgs() {
  for(let i = 0; i < arguments.length; i++) {
    if(typeof arguments[i] !== 'string') return false;
  }
  return true;
}

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const savePerson = (name, number) => {
  const person = new Person({
    name,
    number,
  })
  
  person.save().then(response => {
    console.log('lisätään', name, 'numero', number, 'luetteloon');
    mongoose.connection.close();
  })
}

const findAllPeople = () => 
  Person.find({}).then(result => {
    console.log('puhelinluettelo:')
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })


if(validateArgs(name, number)) savePerson(name, number);
else findAllPeople();
