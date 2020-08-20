const express = require( 'express' );
const fileUpload = require( 'express-fileupload' );
const app = express();

const Usuario = require( '../models/usuario' );
const Producto = require( '../models/producto' );

const fs = require( 'fs' );
const path = require( 'path' );

// default options
app.use( fileUpload( { useTempFiles: true } ) );

app.put( '/upload/:tipo/:id', function( req, res ) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if( !req.files || Object.keys( req.files ).length === 0 ) {
        return res.status( 400 ).json( {
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        } );
    }

    //validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status( 400 ).json( {
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join( ', ' ),
            }
        } )
    }

    let archivo = req.files.archivo;

    //validar extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreCortado = archivo.name.split( '.' );
    let extension = nombreCortado[nombreCortado.length - 1];

    //valida la extension en el arreglo
    if( extensionesValidas.indexOf( extension ) < 0 ) {
        return res.status( 400 ).json( {
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join( ', ' ),
                ext: 'Estas tratando de subir un archivo de tipo: ' + extension
            }
        } )
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv( `uploads/${tipo}/${nombreArchivo}`, ( err ) => {
        if( err )
            return res.status( 500 ).json( {
                ok: false,
                err
            } );

        //Aqui, imagen esta cargada
        if( tipo === 'usuarios' ) {
            imagenUsuario( id, res, nombreArchivo );
        } else {
            imagenProducto( id, res, nombreArchivo );
        }


    } );

} );

function imagenUsuario( id, res, nombreArchivo ) {

    Usuario.findById( id, ( err, usuarioDB ) => {
        if( err ) {
            borraArchivo( nombreArchivo, 'usuarios' );
            return res.status( 500 ).json( {
                ok: false,
                err:{
                    message:'oli  usuario'
                }
            } );
        }
        if( !usuarioDB ) {
            if( err )
                borraArchivo( nombreArchivo, 'usuarios' );
            return res.status( 400 ).json( {
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            } );
        }

        borraArchivo( usuarioDB.img, 'usuarios' );

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( ( err, usuarioGuardado ) => {

            res.json( {
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            } )
        } )


    } )
}

function imagenProducto( id, res, nombreArchivo ) {


    Producto.findById( id, ( err, productoDB ) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }
        if( !productoDB ) {
            if( err )
                borraArchivo( nombreArchivo, 'productos' );
            return res.status( 400 ).json( {
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            } );
        }

        borraArchivo( productoDB.img, 'productos' );

        productoDB.img = nombreArchivo;

        productoDB.save( ( err, productoGuardado ) => {

            res.json( {
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            } )
        } )


    } )
}

function borraArchivo( nombreImagen, tipo ) {
    let pathImagen = path.resolve( __dirname, `../../uploads/${tipo}/${nombreImagen}` );
    if( fs.existsSync( pathImagen ) ) {
        fs.unlinkSync( pathImagen );
    }
}

module.exports = app;