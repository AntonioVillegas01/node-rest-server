const jwt = require( 'jsonwebtoken' );
//=================
//Verificar TOKEN
//=================
let verificaToken = ( req, res, next ) => {

    let token = req.get( 'token' ); //Authorization

    jwt.verify( token, process.env.SEED, ( err, decoded ) => {

        if( err ) {
            return res.status( 401 ).json( {
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            } )
        }
        req.usuario = decoded.usuario;
        next();
    } );
};
//=================
//Verificar ADMIN rol
//=================
let verificaAdmin_Role = ( req, res, next ) => {

    let usuario = req.usuario;

    if( usuario.role === 'ADMIN_ROLE' ) {
        next();
    } else {
        return res.json( {
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        } )
    }

};

//=================
//Verificar TOKEN para imagen por URL
//=================
let verificaTokenImg = (req,res,next) => {

    let token = req.query.token;

    jwt.verify( token, process.env.SEED, ( err, decoded ) => {

        if( err ) {
            return res.status( 401 ).json( {
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            } )
        }
        req.usuario = decoded.usuario;
        next();
    } );


};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
};