"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../index");
describe('condition', () => {
    it('name = ? and id = ?', done => {
        const conds = [
            index_1.Condition.make('name = ?', ['leon']),
            index_1.Condition.make('id = ?', [27]),
        ];
        const where = index_1.Condition.whereClause(conds);
        chai_1.expect(where).eql("name = 'leon' and id = 27");
        done();
    });
    it('name is null', () => {
        const conds = [
            index_1.Condition.make('name is ?', [null]),
        ];
        chai_1.expect(index_1.Condition.whereClause(conds)).eql('name is NULL');
    });
    it('"name in ()" should be "1 = 0"', () => {
        const conds = [
            index_1.Condition.make('name in (?)', [[]]),
            index_1.Condition.make('id = ?', [5]),
        ];
        chai_1.expect(index_1.Condition.whereClause(conds)).eql('1 = 0');
    });
    it('name = ? or name = ?', done => {
        const cond = index_1.Condition.make('name = ? or name = ?', ['leon', 'Leon']);
        const where = index_1.Condition.whereClause([cond]);
        chai_1.expect(where).eql("name = 'leon' or name = 'Leon'");
        done();
    });
    it('name in (?) or name in (?) and id in (?)', done => {
        const conds = [
            index_1.Condition.make('name in (?) or name in (?)', [['a', 'a'], ['b', 'b']]),
            index_1.Condition.make('id in (?)', [[1, 2]]),
        ];
        chai_1.expect(index_1.Condition.whereClause(conds))
            .eql("name in ('a', 'a') or name in ('b', 'b') and id in (1, 2)");
        done();
    });
});
