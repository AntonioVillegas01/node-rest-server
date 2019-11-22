require( './config/config' );
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const app = express();
const bodyParser = require( 'body-parser' );
const path = require( 'path' );


// parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: false } ) );

// parse application/json
app.use( bodyParser.json() );

//habilitar carpeta public
app.use( express.static( path.resolve( __dirname, '../public' ) ) );
//console.log(path.resolve(__dirname, '../public'));

//configuracion global de rutas
app.use( require( './routes/index' ) );


//Conexion a MongoDB
mongoose.Promise = Promise;

mongoose.connection.on( 'connected', () => {
    console.log( 'Base de Datos ONLINE!!' )
} );

mongoose.connection.on( 'reconnected', () => {
    console.log( 'Connection Reestablished' )
} );

mongoose.connection.on( 'disconnected', () => {
    console.log( 'Connection Disconnected' )
} );

mongoose.connection.on( 'close', () => {
    console.log( 'Connection Closed' )
} );

mongoose.connection.on( 'error', ( error ) => {
    console.log( 'ERROR: ' + error )
} );
const run = async() => {
    await mongoose.connect( process.env.URLDB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        autoReconnect: true,
        reconnectTries: 1000000,
        reconnectInterval: 3000
    } )
};

run().catch( error => console.error( error ) );


app.listen( process.env.PORT, () => {
    console.log( `Escuchando en el puerto ${process.env.PORT}` )
} );