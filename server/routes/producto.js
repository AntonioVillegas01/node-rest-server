const express = require( 'express' );

const { verificaToken } = require( '../middlewares/autenticacion' );

let app = express();
let Producto = require( '../models/producto' );

//============================
//Obtener Productos
//============================
app.get( '/productos', verificaToken, ( req, res ) => {
    //trae todos los productos
    //populate: usuario categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number( desde );

    Producto.find( { disponible: true } )
        .skip( desde )
        .limit( 5 )
        .populate( 'usuario', 'nombre email' )
        .populate( 'categoria', 'descripcion' )
        .exec( ( err, productos ) => {
            if( err ) {
                return res.status( 500 ).json( {
                    ok: false,
                    err
                } );
            }

            res.json( {
                ok: true,
                productos
            } )
        } )


} );
//============================
//Obtener un Producto por Id
//============================
app.get( '/productos/:id', ( req, res ) => {
    //populate: usuario categoria
    //paginado
    let id = req.params.id;

    Producto.findById( id )
        .populate( 'usuario', 'nombre email' )
        .populate( 'categoria', 'descripcion' )
        .exec( ( err, productoDB ) => {
            if( err ) {
                return res.status( 500 ).json( {
                    ok: false,
                    err
                } );
            }
            if( !productoDB ) {
                return res.status( 400 ).json( {
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                } );
            }
            res.json( {
                ok: true,
                producto: productoDB
            } )
        } )


} );


//============================
//Buscar Productos
//============================
app.get( '/productos/buscar/:termino', verificaToken, ( req, res ) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find( { nombre: regex } )
        .populate( 'categoria', 'nombre' )
        .exec( ( err, productos ) => {

            if( err ) {
                return res.status( 500 ).json( {
                    ok: false,
                    err
                } );
            }

            res.json( {
                ok: true,
                productos
            } )
        } )

} );


//============================
//Crear un Producto
//============================
app.post( '/productos', verificaToken, ( req, res ) => {
    //grabar el usuario
    //grabar una categoria del listado
    let body = req.body;

    let producto = new Producto( {
        usuario: req.usuario._id,
        categoria: body.categoria,
        descripcion: body.descripcion,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
    } );

    producto.save( ( err, productoDB ) => {
        if( err ) {
            return res.status( 500 ).json( {
                ok: false,
                err
            } );
        }
        if( !productoDB ) {
            return res.status( 400 ).json( {
                ok: false,
                err
            } );
        }

        res.status( 201 ).json( {
            ok: true,
            producto: productoDB
        } )
    } )

} );
//============================
//Actualizar un Producto
//============================
app.put( '/productos/:id', verificaToken, ( req, res ) => {
    //populate: usuario categoria
    //grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    Producto.findById( id, ( err, productoDB ) => {
        if( err ) {
            return res.status( 500 ).json( {
                ok: false,
                err
            } );
        }
        if( !productoDB ) {
            return res.status( 400 ).json( {
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            } );
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save( ( err, productoGuardado ) => {

            if( err ) {
                return res.status( 500 ).json( {
                    ok: false,
                    err
                } );
            }

            res.json( {
                ok: true,
                producto: productoGuardado
            } )

        } )

    } )

} );

//============================
//Eliminar  un Producto
//============================
app.delete( '/productos/:id', verificaToken, ( req, res ) => {
    //Cambiar el estado disponible a false
    let id = req.params.id;

    Producto.findById( id, ( err, productoDB ) => {
        if( err ) {
            return res.status( 500 ).json( {
                ok: false,
                err
            } );
        }
        if( !productoDB ) {
            return res.status( 400 ).json( {
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            } );
        }

        productoDB.disponible = false;

        productoDB.save( ( err, productoBorrado ) => {
            if( err ) {
                return res.status( 500 ).json( {
                    ok: false,
                    err
                } );
            }

            res.json( {
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto Borrado'
            } )
        } )
    } );


} );

module.exports = app;