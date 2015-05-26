'use strict';
// Load system modules

// Load modules
var _ = require( 'lodash' );
// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration
function castValue( value ) {
  try {
    return JSON.parse( value ); // Boolean|Number
  } catch( err ) {
    var d = new Date( value );
    if( !isNaN( d.valueOf() ) )
      return d; // Date

    return value; // String|Undefined|Null
  }
}
function createAliasMap( mappings ) {
  var aliasMap = {};

  function setAlias( alias, key ) {
    aliasMap[ alias ] = key;
  }
  _.each( mappings, function( key, alias ) {
    if( _.isArray( alias ) ) {
      _.each( alias, _.partial( setAlias, _, key ) );
    } else {
      setAlias( alias, key );
    }
  } );

  return aliasMap;
}

// Module initialization (at first load)

// Module exports
module.exports = function( args, options ) {
  options = options || {};
  var mappings = options.mappings || {};
  var defaults = options.defaults || {};
  var SEPARATOR = options.SEPARATOR || ',';
  // var PARAM_RX = options.PARAM_RX || /^-(?:(\w)|-(\w[\w\-]+)\-*)(?::(\d+))?(?::([\w-]+))?$/i;
  var PARAM_RX = options.PARAM_RX || /(?:(?:-(?:(\w{1})|-(\w[\w\-]+)\-*)(?::(\d+))?(?::([\w-]+))?(?:[ =])?([\w\d\.]+)?)|([\w\d\-\?]+))+?/ig;

  // Create ouput object
  var argv = {
    _: [],
  };

  // Convert to array
  if( !(Array.isArray( args ) || typeof( args )==='string') ) {
    throw new Error( 'Arguments must be a string or array' );
  }
  // Convert to string if needed
  args = Array.isArray( args )? args.join( ' ' ) : args;

  var aliasMap = createAliasMap( mappings );


  var matches;
  var stopParse = false;
  while( (matches = PARAM_RX.exec( args ))!==null ) {
    var other = matches[ 6 ];
    if( other==='--' ) {
      stopParse = true;
      continue;
    }
    if( other || stopParse ) {
      var data = _.trim( other || matches[ 0 ] );
      argv._ = argv._.concat( data.split( ' ' ) );
      continue;
    }
    var key = matches[ 1 ] || matches[ 2 ];
    var name = _.camelCase( aliasMap[ key ] || key );
    var index = Number( matches[ 3 ] );
    var property = matches[ 4 ];
    var value = castValue( matches[ 5 ] );
    if( value===null || value===undefined )
      value = true;

    // Create if missing
    if( index>=-1 ) {
      // Create array if missing
      if( !argv[ name ] )
        argv[ name ] = [];

      if( property ) {
        // Create if missing
        if( !argv[ name ][ index ] ) {
          argv[ name ][ index ] = {};
        }
        // Set value
        argv[ name ][ index ][ property ] = value;
      } else {
        argv[ name ][ index ] = value;
      }

    } else {
      // Create object if missing
      if( !argv[ name ] )
        argv[ name ] = {};

      if( property ) {
        argv[ name ][ property ] = value;
      } else {
        argv[ name ] = value;
      }
    }
  }

  // Default values
  _.each( defaults, function( key, defaultValue ) {
    argv[ key ] = argv[ key ] || defaultValue;
  } );

  // Mappings/Aliases
  _.each( mappings, function( key, name ) {
    argv[ name ] = argv[ key ];
  } );
  /*
  while( argumentList.length ) {
    var arg = argumentList.shift();
    if( arg==='--' ) break;

    // Check if the current argument is a key or a value
    var matches = arg.match( PARAM_RX );


    if( matches ) {
      var nextValue = argumentList.shift();
      if( !value ) {
        value = nextValue;
      }

      var scope = argv[ key ] || {};
      argv[ key ] = scope;
    }
  }
  */
  // argv._ = argv._.concat( argumentList );
  // console.log( args, argv );
  /*
  for (var i=0, len=args.length; i<len; i++ ) {
    var arg = args[i];
    if( matches ) {
      var key = matches[ 1 ];
      var index = Number( matches[ 2 ] );
      var property = matches[ 3 ];

      var values = args[ i+1 ].split( SEPARATOR );
      var baseConfig = index>=0? argv[ index ] : argv;
      baseConfig = baseConfig || {};
      var source = baseConfig[ key ];
      source = source || ( property? {} : [] );

      if( property ) {
        source[ property ]= values[ 0 ];
      } else {
        source = source.concat( values );
      }
      // console.log( 'source now is: ', source );
      baseConfig[ key ] = source;
      // console.log( 'baseConfig now is: ', baseConfig );

      if( index>=0 ) {
        argv.social[ index ] = baseConfig;
      } else {
        argv[ key ] = baseConfig[ key ];
      }

      // console.log( 'ARGV now is: ', argv );
      i++;
    } else {
      // console.log( '"%s" is NOT a parameter', arg );
      argv._.push( arg );
    }
  }

  // Check errors
  if( !argv.i )
    throw new Error( 'Must provide an identificator(-i parameter)' );
  if( !argv.s )
    throw new Error( 'Must provide a source(-s parameter)' );
  if( argv.s && argv.s.length===0 )
    throw new Error( 'Must provide at least one source(-s parameter)' );

  // Check vebosity
  argv.level = argv.level || argv.lvl || argv.l || [ 'info' ];
  argv.level = argv.level[ 0 ];
  */
  return argv;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78