"use strict";

var assert = require('assert');
var Game = require('../../src/node_modules/models/Game');
var Player = require('../../src/node_modules/models/Player');
var Index = require('../../src/web/index.js');
var TestUtils = require('TestUtils.js');

suite('Player tests', function ()
{
	test('inserting a player', function* ()
	{
		var p = new Player();
		p.name = 'Jarrod';
		yield p.save();
		assert(p.id >= 0, 'player was not inserted');
		
		// can also insert a player by just email
		p = new Player();
		p.email = 'JARROD@gmail.com';
		yield p.save();
		assert(p.id >= 0, 'player was not inserted');
		
		p = yield Player.getById(p.id);
		assert(p.email === 'jarrod@gmail.com', 'email should have been normalized');
		assert(p.name === 'jarrod@gmail.com', 'name should be email');
	});
	
	test('updating a player', function*()
	{
		var p = yield TestUtils.getPlayer();
		p.name = 'Billy Breathes';
		yield p.save();
		
		p = yield Player.getById(p.id);
		assert.equal(p.name, 'Billy Breathes');
	});
	
	test('getting a player by id', function* () 
	{
		var p = new Player();
		p.name = 'Billy Mays';
		p.rating = 100;
		yield p.save();
		assert(p.id, 'should have saved');
		
		var p2 = yield Player.getById(0);
		assert(p2 == null, 'there should be no player with id == 0');

		p2 = yield Player.getById(p.id);
		assert.deepEqual(p2, p, 'players should be equal');
	});

	test('getting a player by email', function* ()
	{
		// we normalized emails to lower case
		var p = new Player();
		p.email = 'TEST@TEST.COM';
		yield p.save();
		
		var p2 = yield Player.getByEmail('test@test.com'); 
		assert.deepEqual(p2, p, 'should have fetched a player');
	});
	
	test('getting players with their stats', function*()
	{
		var p1 = yield TestUtils.getPlayer(),
			p2 = yield TestUtils.getPlayer();
		
		// singles stats first
		yield TestUtils.getGame({ team1: [p1], team2: [p2] });
		
		// p1 should have played one game with one win
		yield p1.loadStats();
		assert(p1.stats != null, 'should have loaded some stats');
		assert(p1.stats.singlesGamesPlayed === 1, 'should have played a singles game');
		assert(p1.stats.singlesGamesWon === 1, 'should have won the first singles game');
	});

	test('saving player with specific role', function*()
	{
		var p1 = yield TestUtils.getPlayer({role_id: Player.roles.active});
		var pDb = yield Player.getById(p1.id);

		assert.equal(p1.role_id, pDb.role_id);
	});

	//test to see if player is invited the automatically change to active
	test('changing player from invited to active', function*()
	{
		var p1 = yield TestUtils.getPlayer({role_id: Player.roles.invited});
		if (p1.role_id === Player.roles.invited){
			p1.role_id = Player.roles.active;
			yield p1.save();
		}
		assert.equal(p1.role_id, 3);
	});

	//test to see if player is pending they still cannot access game record
	test('changing player from pending to active', function*()
	{
		var p1 = yield TestUtils.getPlayer({role_id: Player.roles.pending});
		if (p1.role_id === Player.roles.invited){
			p1.role_id = Player.roles.active;
			yield p1.save();
		}
		assert.equal(p1.role_id, 1);
	});
});