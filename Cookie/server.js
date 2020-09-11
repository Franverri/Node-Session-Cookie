const express = require('express');
const cookieparser = require('cookie-parser');
const bodyparser = require('body-parser');
const morgan = require('morgan');

const app = express();

const users = [
  {id: 1, name: 'Franco', email: 'Franco@mail.com', password: '1234'},
  {id: 2, name: 'Toni', email: 'Toni@mail.com', password: '1234'}
]

app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));

// El orden es importante, el cookieparser debe estar antes de la utilización del session
app.use(cookieparser());

app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});

const redirectLogin = (req, res, next) => {
  if(!req.cookies.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

const redirectHome = (req, res, next) => {
  if(req.cookies.user) {
    res.redirect('/home');
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  res.send(`
    <h1>Bienvenidos a Henry!</h1>
    ${req.cookies.user && req.cookies.user.id ? `
      <a href='/home'>Perfil</a>
      <form method='post' action='/logout'>
        <button>Salir</button>
      </form>
      ` : `
      <a href='/login'>Ingresar</a>
      <a href='/register'>Registrarse</a>
      `}
  `)
});

app.get('/home', redirectLogin, (req, res) => {
  const user = users.find(user => user.id === req.cookies.user.id);

  res.send(`
    <h1>Bienvenido ${user.name}</h1>
    <h4>${user.email}</h4>
    <a href='/'>Inicio</a>
  `)
});

app.get('/login', redirectHome,  (req, res) => {
  res.send(`
    <h1>Iniciar sesión</h1>
    <form method='post' action='/login'>
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Contraseña' required />
      <input type='submit' />
    </form>
    <a href='/register'>Registrarse</a>
  `)
});

app.get('/register', redirectHome, (req, res) => {
  res.send(`
    <h1>Registrarse</h1>
    <form method='post' action='/register'>
      <input name='name' placeholder='Nombre' required />
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Contraseña' required />
      <input type='submit' />
    </form>
    <a href='/login'>Iniciar sesión</a>
  `)
});

app.post('/login', redirectHome, (req, res) => {
  const { email, password } = req.body;

  if(email && password) {
    const user = users.find(user => user.email === email && user.password === password);
    if(user) {
      res.cookie('user', user);
      return res.redirect('/home')
    }
  }

  res.redirect('/login')
});

app.post('/register', redirectHome, (req, res) => {
  const { name, email, password } = req.body;

  if(name && email && password) {
    const exists = users.some(user => user.email === email);
    if(!exists) {
      const user = {
        id: users.length + 1,
        name,
        email,
        password
      }
      users.push(user);
      return res.redirect('/');
    }
  }

  res.redirect('/register')
});

app.post('/logout', redirectLogin, (req, res) => {
  res.clearCookie('user');
  res.redirect('/');
});

app.listen(3000, (err) => {
  if(err) {
   console.log(err);
 } else {
   console.log('Listening on localhost:3000');
 }
});
