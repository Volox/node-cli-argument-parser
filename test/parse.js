/* global describe, it */
/* jshint expr:true */
'use strict';
// Load system modules

// Load modules
var expect = require( 'chai' ).expect;
var parse = require( '../' );

// Load my modules

// Constant declaration

// Module variables declaration

// Module functions declaration

// Module initialization (at first load)

describe( 'The parser', function() {

  describe( 'should error in case', function() {
    it( 'of arguments', function() {
      expect( parse.bind( null, arguments ) ).to.throw();
    } );
    it( 'of object', function() {
      expect( parse.bind( null, {} ) ).to.throw();
    } );
  } );

  describe( 'should NOT error in case', function() {
    it( 'of array', function() {
      expect( parse.bind( null, [] ) ).to.not.throw();
    } );
    it( 'of string', function() {
      expect( parse.bind( null, '' ) ).to.not.throw();
    } );
  } );

  describe( 'should return', function() {
    it( 'an object containing at least "_"', function() {
      var result = parse( [] );
      expect( result ).to.have.key( '_' );
      expect( result._ ).to.be.instanceof( Array )
      .and.to.have.length( 0 );
    } );

    it( 'an object containing all the dashed arguments', function() {
      var result = parse( [ '-s', '--long', '--john-holmes' ] );
      expect( result ).to.contain.all.keys( 's', 'long', 'johnHolmes' );
    } );

    it( 'all dashed arguments before the "--"', function() {
      var result = parse( [ '-s', '--', '--long', '--john-holmes' ] );
      expect( result ).to.have.all.keys( '_', 's' );
      expect( result._ ).to.be.instanceof( Array );
      expect( result._ ).to.have.length( 2 );
      expect( result._[ 0 ] ).to.be.equal( '--long' );
      expect( result._[ 1 ] ).to.be.equal( '--john-holmes' );
    } );
  } );

  describe( 'should create an array', function() {
    describe( 'for short arguments like', function() {
      it( '"-s:0"', function() {
        var result = parse( '-s:0' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.s[ 0 ] ).to.be.true;
      } );

      it( '"-s:0 value"', function() {
        var result = parse( '-s:0 value' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.s[ 0 ] ).to.be.equal( 'value' );
      } );

      it( '"-s:0:test"', function() {
        var result = parse( '-s:0:test' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.s[ 0 ] ).to.have.key( 'test' );
        expect( result.s[ 0 ].test ).to.be.true;
      } );

      it( '"-s:0:test value"', function() {
        var result = parse( '-s:0:test value' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.s[ 0 ] ).to.have.key( 'test' );
        expect( result.s[ 0 ].test ).to.be.equal( 'value' );
      } );
    } );

    describe( 'for long arguments like', function() {
      it( '"--long-argument:0"', function() {
        var result = parse( '--long-argument:0' );
        expect( result ).to.have.keys( 'longArgument', '_' );
        expect( result.longArgument ).to.be.instanceOf( Array );
        expect( result.longArgument[ 0 ] ).to.be.true;
      } );

      it( '"--long-argument:0 value"', function() {
        var result = parse( '--long-argument:0 value' );
        expect( result ).to.have.keys( 'longArgument', '_' );
        expect( result.longArgument ).to.be.instanceOf( Array );
        expect( result.longArgument[ 0 ] ).to.be.equal( 'value' );
      } );

      it( '"--long-argument:0:test"', function() {
        var result = parse( '--long-argument:0:test' );
        expect( result ).to.have.keys( 'longArgument', '_' );
        expect( result.longArgument ).to.be.instanceOf( Array );
        expect( result.longArgument[ 0 ] ).to.have.key( 'test' );
        expect( result.longArgument[ 0 ].test ).to.be.true;
      } );

      it( '"--long-argument:0:test value"', function() {
        var result = parse( '--long-argument:0:test value' );
        expect( result ).to.have.keys( 'longArgument', '_' );
        expect( result.longArgument ).to.be.instanceOf( Array );
        expect( result.longArgument[ 0 ] ).to.have.key( 'test' );
      } );
    } );

    describe( 'for multiple', function() {
      it( 'different keys', function() {
        var result = parse( '-s:0 --long-argument:0:test value' );
        expect( result ).to.have.keys( 's', 'longArgument', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.longArgument ).to.be.instanceOf( Array );
        expect( result.s ).to.have.length( 1 );
        expect( result.longArgument ).to.have.length( 1 );
        expect( result.s[ 0 ] ).to.be.true;
        expect( result.longArgument[ 0 ] ).to.have.key( 'test' );
      } );
      it( 'repeated keys', function() {
        var result = parse( '-s:0 -s:1 5 -s:3 hello' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.s ).to.have.length( 4 );
        expect( result.s[ 0 ] ).to.be.true;
        expect( result.s[ 1 ] ).to.be.equal( 5 );
        expect( result.s[ 3 ] ).to.be.equal( 'hello' );
      } );
    } );
  } );

  describe( 'should create an object', function() {
    describe( 'for short arguments', function() {
      it( '"-s:test"', function() {
        var result = parse( '-s:test' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Object );
        expect( result.s ).to.have.key( 'test' );
        expect( result.s.test ).to.be.true;
      } );
      it( '"-s:0:test"', function() {
        var result = parse( '-s:0:test' );
        expect( result ).to.have.keys( 's', '_' );
        expect( result.s ).to.be.instanceOf( Array );
        expect( result.s ).to.have.length( 1 );
        expect( result.s[0] ).to.be.instanceOf( Object );
        expect( result.s[0] ).to.have.key( 'test' );
        expect( result.s[0].test ).to.be.true;
      } );
    } );
    describe( 'for long arguments', function() {
      it( '"--long-argument:test"', function() {
        var result = parse( '--long-argument:test' );
        expect( result ).to.have.keys( 'longArgument', '_' );
        expect( result.longArgument ).to.be.instanceOf( Object );
        expect( result.longArgument ).to.have.key( 'test' );
        expect( result.longArgument.test ).to.be.true;
      } );
      it( '"--long-argument:0:test"', function() {
        var result = parse( '--long-argument:0:test' );
        expect( result ).to.have.keys( 'longArgument', '_' );
        expect( result.longArgument ).to.be.instanceOf( Array );
        expect( result.longArgument ).to.have.length( 1 );
        expect( result.longArgument[0] ).to.be.instanceOf( Object );
        expect( result.longArgument[0] ).to.have.key( 'test' );
        expect( result.longArgument[0].test ).to.be.true;
      } );
    } );
    describe( 'for multiple', function() {
      it( 'different keys', function() {
        var result = parse( '-s:test -b:test value --long-argument:test 5' );
        expect( result ).to.have.keys( 's', 'b', 'longArgument', '_' );
        expect( result.s ).to.have.property( 'test', true );
        expect( result.b ).to.have.property( 'test', 'value' );
        expect( result.longArgument ).to.have.property( 'test', 5 );
      } );
      it( 'repeated keys', function() {
        var result = parse( '-s:hello -s:volox 5 -s:test false --long-argument:test 5.7' );
        expect( result ).to.have.keys( 's', 'longArgument', '_' );
        expect( result.s ).to.have.property( 'test', false );
        expect( result.s ).to.have.property( 'hello', true );
        expect( result.s ).to.have.property( 'volox', 5 );
        expect( result.longArgument ).to.have.property( 'test', 5.7 );
      } );
    } );
  } );

  describe( 'should work for', function() {
    it( 'complex input', function() {
        var result = parse( [
          '-k:19:test', // Will be ovverrided
          '-k:19', 'hellp',
          '-k:1', 'true',
          'concat',
          'me',
          '-k:test', '5',
          '--',
          'give', 'me', 'more',
          '-a:test', '5',
        ] );

        expect( result ).to.have.keys( 'k', '_' );
        expect( result.k ).to.be.instanceof( Array );
        expect( result.k ).to.have.property( 'test', 5 );
        expect( result.k ).to.have.length( 20 );
        expect( result.k[19] ).to.be.equal( 'hellp' );
        expect( result.k[1] ).to.be.true;
        expect( result._ ).to.be.instanceof( Array );
        expect( result._ ).to.have.length( 7 );

    } );
  } );
} );

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78