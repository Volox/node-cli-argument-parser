'use strict';
// Load system modules

// Load modules
var _ = require( 'lodash' );
// Load my modules

// Constant declaration

// Module variables declaration
var validKeyNameSingle = '\\w{1}';
var validKeyNameMulti = '\\w[\\w\\-]+';
var validValue = '[\\w\\d\\.][\\w\\d\\.\\-,|_]*';
var validPropertyName = '[\\w\\d\\-_]+';
var rx = '';
rx += '(?:'; // Matches the pattern multiple times
rx +=   '(?:-'; // Match the dashed parameters
rx +=     '(?:'; // Match the key name
rx +=       '('+validKeyNameSingle+')|-('+validKeyNameMulti+')'; // Both single or multiple character [1] and [2]
rx +=     ')?';
rx +=     '(?:'; // Match the index after the ":" if present
rx +=       ':(\\d+)'; // One or more digit [3]
rx +=     ')?';
rx +=     '(?:'; // Match the property name if present
rx +=       ':('+validPropertyName+')'; // One or more character [4]
rx +=     ')?';
rx +=     '(?:'; // Match the separator from the key to the value if preset
rx +=       '[=\\s]'; // Can be ' ' or '='
rx +=     ')?';
rx +=     '('+validValue+')?'; // Match the value if present [5]
rx +=   ')\\b'; // Word boundary
rx +=   '|'; // OR
rx +=   '(\\-\\-|'+validValue+')'; // Match the non dashed parameters [6]
rx += ')+';

// Module functions declaration
function castValue( value ) {
  try {
    var n = Number( value );
    if( !isNaN( n ) )
      return n;

    /*
    // TOO MANY PROBLEMS with dates... "test,5" -> is a vaild Date????
    var d = new Date( value );
    if( !isNaN( d.valueOf() ) )
      return d; // Date
    */

    if( value.toLowerCase()==='true' ) {
      return true;
    } else if( value.toLowerCase()==='false' ) {
      return false;
    } else { // String
      return value;
    }
  } catch( err ) {
    return value; // Just in case
  }
}
function createAliasMap( mappings ) {
  var aliasMap = {};

  function setAlias( alias, key ) {
    aliasMap[ alias ] = key;
  }
  _.each( mappings, function( alias, key ) {
    if( _.isArray( alias ) ) {
      _.each( alias, _.partial( setAlias, _, key ) );
    } else {
      setAlias( alias, key );
    }
  } );

  return aliasMap;
}
function setValue( current, value ) {
  if( _.isArray( current ) ) { // Concat to present array
    return current.concat( value );
  } else if( !_.isUndefined( current ) && !_.isPlainObject( current ) ) { // Create an array for multiple ouputs
    // return value;
    return [ current, value ];
  } else { // Other
    return value;
  }
}

// Module initialization (at first load)

// Module exports
module.exports = function( args, options ) {
  options = options || {};
  var mappings = options.mappings || {};
  var defaults = options.defaults || {};
  var SEPARATOR = options.SEPARATOR || ',';
  var PARAM_RX = options.PARAM_RX || new RegExp( rx, 'gi' );
  // var PARAM_RX = options.PARAM_RX || /(?:(?:-(?:(\w{1})|-(\w[\w\-]+))?(?::(\d+))?(?::(\w+))?(?:[\=\s])?([\w\d\.][\.\w\d-,|_]*)?)\b|([\w\d\-]+))+/ig;

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
    var unaliasedKey = aliasMap[ key ] || key;
    var name = _.camelCase( unaliasedKey );
    var index = Number( matches[ 3 ] );
    var property = matches[ 4 ];
    var value = castValue( matches[ 5 ] );
    if( value===null || value===undefined )
      value = true;

    if( typeof(value)==='string' && value.indexOf( SEPARATOR )!==-1 ) {
      value = value.split( SEPARATOR ).map( castValue );
    }

    // Create if missing
    var current;
    if( index>=-1 ) {
      // Create array if missing
      if( _.isUndefined( argv[ name ] ) )
        argv[ name ] = [];

      if( property ) {
        // Create object if missing
        if( _.isUndefined( argv[ name ][ index ] ) ) {
          argv[ name ][ index ] = {};
        }
        // Set value
        current = argv[ name ][ index ][ property ];
        argv[ name ][ index ][ property ] = setValue( current, value );
      } else {
        // Set value
        current = argv[ name ][ index ];
        argv[ name ][ index ] = setValue( current, value );
      }

    } else {
      if( property ) {
        // Create object if missing
        if( _.isUndefined( argv[ name ] ) ) {
          argv[ name ] = {};
        }

        // Set value
        current = argv[ name ][ property ];
        argv[ name ][ property ] = setValue( current, value );
      } else {
        // Set value
        current = argv[ name ];
        argv[ name ] = setValue( current, value );
      }
    }
  }

  // Default values
  _.each( defaults, function( key, defaultValue ) {
    argv[ key ] = argv[ key ] || defaultValue;
  } );

  // Mappings/Aliases
  _.each( aliasMap, function( key, name ) {
    if( argv[ key ] )
      argv[ name ] = argv[ key ];
  } );

  return argv;
};


//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78