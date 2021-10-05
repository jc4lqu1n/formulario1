const express = require('express')
const app = express()
const port = 3000
const path = require("path")
const hbs = require("hbs")
const { clientes, User, Ayuda } = require('./Models')
const hbsUtils = require("hbs-utils")(hbs)
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

// section settings 
__dirname = path.resolve(path.join(__dirname, "../"))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.set("view engine", "html")
app.engine("html", hbs.__express)
app.set("views", "views")
hbsUtils.registerWatchedPartials(__dirname + "/views")

app.use(express.static("Public"));

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(cookieParser());
// end section settings 

app.get('/', (req, res) => {
    res.render("Login")
})

app.post("/login", async (req, res) => {
    console.log(req.body)
    const { usuario,
        contrasena } = req.body;

    const findedUser = await User.findOne({
        where: {
            usuario: usuario
        }
    }).catch(err => null)

    if (!findedUser) return res.status(400).send("Usuario no existe")

    if (findedUser.contrasena !== contrasena) return res.status(400).send("clave incorrecta")

    // caso positivo
    req.session.userdata = { ...findedUser };

    res.redirect("/formulario")

})

app.post("/logout", async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.post("/ayuda", async (req, res) => {
    const { problema } = req.body
    const newAyuda = Ayuda.build({ descripcionProblema: problema })
    try {
        await newAyuda.save()
    } catch (err) {
        console.error("Error al ingresar Ayuda")
    }
    return res.render("Ayuda")
})

app.get('/formulario', async (req, res) => {
    const { userdata } = req.session
    if (!userdata) return res.render("Login")

    const auxclientes = await clientes.findAll().catch(err => null)

    if (!auxclientes) return res.send("Error al obtener clientes");

    const l_clientes = JSON.stringify(auxclientes, null, 2);
    console.log(l_clientes);
    return res.render("formulario", { l_clientes })
})

app.post('/formulario', async (req, res) => {
    console.log("request body:", req.body)
    const nuevousuario = clientes.build(req.body)
    await nuevousuario.save()
    res.render("formularioPOST")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
